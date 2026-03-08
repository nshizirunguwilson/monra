import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import type { Request, Response, NextFunction } from "express";

export const transactionRoutes = Router();
transactionRoutes.use(authenticate);

const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("USD"),
  categoryId: z.string().uuid().optional(),
  subCategoryId: z.string().uuid().optional(),
  description: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  date: z.string().refine((s) => !isNaN(Date.parse(s)), "Invalid date").transform((s) => new Date(s)),
  tags: z.array(z.string().uuid()).optional(),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  subCategoryId: z.string().uuid().nullable().optional(),
  description: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  date: z.string().refine((s) => !isNaN(Date.parse(s)), "Invalid date").transform((s) => new Date(s)).optional(),
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: List transactions with filtering and pagination
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20 } }
 *       - { in: query, name: accountId, schema: { type: string, format: uuid } }
 *       - { in: query, name: type, schema: { type: string, enum: [INCOME, EXPENSE] } }
 *       - { in: query, name: categoryId, schema: { type: string, format: uuid } }
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated transaction list
 */
transactionRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const { accountId, type, categoryId, from, to, search } = req.query;

    const where: any = { userId: req.user!.userId };

    if (accountId && typeof accountId === "string") where.accountId = accountId;
    if (type && typeof type === "string") {
      const upper = type.toUpperCase();
      if (["INCOME", "EXPENSE"].includes(upper)) where.type = upper;
    }
    if (categoryId && typeof categoryId === "string") where.categoryId = categoryId;
    if (from || to) {
      where.date = {};
      if (from && typeof from === "string" && !isNaN(Date.parse(from))) {
        where.date.gte = new Date(from);
      }
      if (to && typeof to === "string" && !isNaN(Date.parse(to))) {
        where.date.lte = new Date(to);
      }
    }
    if (search && typeof search === "string") {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          account: { select: { name: true, color: true } },
          transactionTags: { include: { tag: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      status: "success",
      data: transactions,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new transaction
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountId, type, amount, date]
 *             properties:
 *               accountId: { type: string, format: uuid }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               amount: { type: number, minimum: 0.01 }
 *               categoryId: { type: string, format: uuid }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Transaction created
 */
transactionRoutes.post("/", validate(createTransactionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags, ...data } = req.body;

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: data.accountId, userId: req.user!.userId },
    });
    if (!account) throw new AppError("Account not found", 404);

    const transaction = await prisma.transaction.create({
      data: { ...data, userId: req.user!.userId },
      include: { category: true, account: { select: { name: true } } },
    });

    // Update account balance
    const balanceChange = data.type === "INCOME" ? Number(data.amount) : -Number(data.amount);
    await prisma.account.update({
      where: { id: data.accountId },
      data: { currentBalance: { increment: balanceChange } },
    });

    if (tags?.length) {
      await prisma.transactionTag.createMany({
        data: tags.map((tagId: string) => ({ transactionId: transaction.id, tagId })),
        skipDuplicates: true,
      });
    }

    res.status(201).json({ status: "success", data: transaction });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction by ID
 *     security: [{ bearerAuth: [] }]
 */
transactionRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id as string, userId: req.user!.userId },
      include: {
        category: true,
        subCategory: true,
        account: true,
        splits: { include: { category: true } },
        transactionTags: { include: { tag: true } },
      },
    });
    if (!transaction) throw new AppError("Transaction not found", 404);
    res.json({ status: "success", data: transaction });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update a transaction
 *     security: [{ bearerAuth: [] }]
 */
transactionRoutes.put("/:id", validate(updateTransactionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError("Transaction not found", 404);

    // If amount or type changed, reverse old balance and apply new
    const amountChanged = req.body.amount !== undefined || req.body.type !== undefined;
    if (amountChanged) {
      const oldAmount = Number(existing.amount);
      const oldChange = existing.type === "INCOME" ? oldAmount : -oldAmount;
      // Reverse old
      await prisma.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: -oldChange } },
      });

      const newAmount = req.body.amount !== undefined ? Number(req.body.amount) : oldAmount;
      const newType = req.body.type || existing.type;
      const newChange = newType === "INCOME" ? newAmount : -newAmount;
      // Apply new
      await prisma.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: newChange } },
      });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: req.body.amount,
        type: req.body.type,
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategoryId,
        description: req.body.description,
        notes: req.body.notes,
        date: req.body.date,
      },
      include: { category: true, account: { select: { name: true } } },
    });
    res.json({ status: "success", data: transaction });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete a transaction
 *     security: [{ bearerAuth: [] }]
 */
transactionRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError("Transaction not found", 404);

    // Reverse the balance change
    const amount = Number(existing.amount);
    const balanceRevert = existing.type === "INCOME" ? -amount : amount;
    await prisma.account.update({
      where: { id: existing.accountId },
      data: { currentBalance: { increment: balanceRevert } },
    });

    await prisma.transaction.delete({ where: { id } });
    res.json({ status: "success", message: "Transaction deleted" });
  } catch (err) { next(err); }
});

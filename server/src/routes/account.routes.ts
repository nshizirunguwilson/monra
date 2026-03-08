import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import type { Request, Response, NextFunction } from "express";

export const accountRoutes = Router();
accountRoutes.use(authenticate);

const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["BANK", "CASH", "CRYPTO", "SAVINGS", "CREDIT_CARD", "INVESTMENT"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  currency: z.string().length(3).default("USD"),
  initialBalance: z.number().default(0),
  notes: z.string().max(500).optional(),
});

const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  currency: z.string().length(3).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     tags: [Accounts]
 *     summary: List all accounts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of accounts
 */
accountRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ status: "success", data: accounts });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     tags: [Accounts]
 *     summary: Create a new account
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [BANK, CASH, CRYPTO, SAVINGS, CREDIT_CARD, INVESTMENT] }
 *               color: { type: string }
 *               currency: { type: string, default: USD }
 *               initialBalance: { type: number, default: 0 }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Account created
 */
accountRoutes.post("/", validate(createAccountSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await prisma.account.create({
      data: {
        name: req.body.name,
        type: req.body.type,
        color: req.body.color,
        currency: req.body.currency,
        initialBalance: req.body.initialBalance,
        currentBalance: req.body.initialBalance,
        notes: req.body.notes,
        userId: req.user!.userId,
      },
    });
    res.status(201).json({ status: "success", data: account });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     tags: [Accounts]
 *     summary: Get account by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Account details
 */
accountRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await prisma.account.findFirst({
      where: { id: req.params.id as string, userId: req.user!.userId },
    });
    if (!account) throw new AppError("Account not found", 404);
    res.json({ status: "success", data: account });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     tags: [Accounts]
 *     summary: Update an account
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Account updated
 */
accountRoutes.put("/:id", validate(updateAccountSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.account.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError("Account not found", 404);

    const updated = await prisma.account.update({
      where: { id },
      data: {
        name: req.body.name,
        color: req.body.color,
        currency: req.body.currency,
        notes: req.body.notes,
      },
    });
    res.json({ status: "success", data: updated });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     tags: [Accounts]
 *     summary: Delete an account
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Account deleted
 */
accountRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.account.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError("Account not found", 404);
    await prisma.account.delete({ where: { id } });
    res.json({ status: "success", message: "Account deleted" });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/accounts/{id}/archive:
 *   patch:
 *     tags: [Accounts]
 *     summary: Toggle account archive status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Archive status toggled
 */
accountRoutes.patch("/:id/archive", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const account = await prisma.account.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!account) throw new AppError("Account not found", 404);
    const updated = await prisma.account.update({
      where: { id },
      data: { isArchived: !account.isArchived },
    });
    res.json({ status: "success", data: updated });
  } catch (err) { next(err); }
});

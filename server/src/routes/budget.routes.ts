import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import type { Request, Response, NextFunction } from "express";

export const budgetRoutes = Router();
budgetRoutes.use(authenticate);

const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive("Budget amount must be positive"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     tags: [Budgets]
 *     summary: List budgets for a given month/year with actual spending
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: month, schema: { type: integer, minimum: 1, maximum: 12 } }
 *       - { in: query, name: year, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Budget list with spending data
 */
budgetRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = month ? parseInt(month as string) : now.getMonth() + 1;
    const y = year ? parseInt(year as string) : now.getFullYear();

    if (m < 1 || m > 12) throw new AppError("Month must be 1-12", 400);

    const budgets = await prisma.budget.findMany({
      where: { userId: req.user!.userId, month: m, year: y },
      include: { category: true },
    });

    // Correct date range: first day of month to first day of next month
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1); // first day of next month

    const spending = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: req.user!.userId,
        type: "EXPENSE",
        date: { gte: startDate, lt: endDate },
      },
      _sum: { amount: true },
    });

    const spendingMap = new Map(spending.map((s) => [s.categoryId, Number(s._sum.amount)]));

    const data = budgets.map((b) => ({
      ...b,
      spent: spendingMap.get(b.categoryId) || 0,
      remaining: Number(b.amount) - (spendingMap.get(b.categoryId) || 0),
    }));

    res.json({ status: "success", data });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     tags: [Budgets]
 *     summary: Create or update a budget for a category/month
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, amount, month, year]
 *             properties:
 *               categoryId: { type: string, format: uuid }
 *               amount: { type: number, minimum: 0.01 }
 *               month: { type: integer, minimum: 1, maximum: 12 }
 *               year: { type: integer }
 *     responses:
 *       201:
 *         description: Budget created/updated
 */
budgetRoutes.post("/", validate(createBudgetSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: req.user!.userId,
          categoryId: req.body.categoryId,
          month: req.body.month,
          year: req.body.year,
        },
      },
      update: { amount: req.body.amount },
      create: {
        userId: req.user!.userId,
        categoryId: req.body.categoryId,
        amount: req.body.amount,
        month: req.body.month,
        year: req.body.year,
      },
    });
    res.status(201).json({ status: "success", data: budget });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     tags: [Budgets]
 *     summary: Delete a budget
 *     security: [{ bearerAuth: [] }]
 */
budgetRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.budget.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError("Budget not found", 404);
    await prisma.budget.delete({ where: { id } });
    res.json({ status: "success", message: "Budget deleted" });
  } catch (err) { next(err); }
});

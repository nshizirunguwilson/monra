import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import type { Request, Response, NextFunction } from "express";

export const goalRoutes = Router();
goalRoutes.use(authenticate);

const createGoalSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  targetAmount: z.number().positive("Target must be positive"),
  deadline: z.string().refine((s) => !isNaN(Date.parse(s)), "Invalid date").transform((s) => new Date(s)).optional(),
  category: z.string().max(50).default("Custom"),
  linkedAccountId: z.string().uuid().optional(),
});

const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  targetAmount: z.number().positive().optional(),
  deadline: z.string().refine((s) => !isNaN(Date.parse(s)), "Invalid date").transform((s) => new Date(s)).nullable().optional(),
  category: z.string().max(50).optional(),
});

const contributeSchema = z.object({
  amount: z.number().positive("Contribution must be positive"),
  notes: z.string().max(200).optional(),
});

/**
 * @swagger
 * /api/goals:
 *   get:
 *     tags: [Goals]
 *     summary: List all savings goals
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of goals
 */
goalRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.user!.userId },
      include: { contributions: { orderBy: { date: "desc" }, take: 5 } },
      orderBy: { priority: "asc" },
    });
    res.json({ status: "success", data: goals });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/goals:
 *   post:
 *     tags: [Goals]
 *     summary: Create a new savings goal
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, targetAmount]
 *             properties:
 *               name: { type: string }
 *               targetAmount: { type: number, minimum: 0.01 }
 *               deadline: { type: string, format: date }
 *               category: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Goal created
 */
goalRoutes.post("/", validate(createGoalSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await prisma.savingsGoal.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        targetAmount: req.body.targetAmount,
        deadline: req.body.deadline,
        category: req.body.category,
        linkedAccountId: req.body.linkedAccountId,
        userId: req.user!.userId,
      },
    });
    res.status(201).json({ status: "success", data: goal });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/goals/{id}:
 *   get:
 *     tags: [Goals]
 *     summary: Get goal details
 *     security: [{ bearerAuth: [] }]
 */
goalRoutes.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id as string, userId: req.user!.userId },
      include: { contributions: { orderBy: { date: "desc" } }, linkedAccount: true },
    });
    if (!goal) throw new AppError("Goal not found", 404);
    res.json({ status: "success", data: goal });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/goals/{id}:
 *   put:
 *     tags: [Goals]
 *     summary: Update a goal
 *     security: [{ bearerAuth: [] }]
 */
goalRoutes.put("/:id", validate(updateGoalSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError("Goal not found", 404);
    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        name: req.body.name,
        description: req.body.description,
        targetAmount: req.body.targetAmount,
        deadline: req.body.deadline,
        category: req.body.category,
      },
    });
    res.json({ status: "success", data: goal });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     tags: [Goals]
 *     summary: Delete a goal
 *     security: [{ bearerAuth: [] }]
 */
goalRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!existing) throw new AppError("Goal not found", 404);
    await prisma.savingsGoal.delete({ where: { id } });
    res.json({ status: "success", message: "Goal deleted" });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/goals/{id}/contribute:
 *   post:
 *     tags: [Goals]
 *     summary: Add a contribution to a goal
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, minimum: 0.01 }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Contribution added
 */
goalRoutes.post("/:id/contribute", validate(contributeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.user!.userId },
    });
    if (!goal) throw new AppError("Goal not found", 404);

    const contribution = await prisma.goalContribution.create({
      data: { goalId: goal.id, amount: req.body.amount, notes: req.body.notes },
    });

    const newAmount = Number(goal.currentAmount) + Number(req.body.amount);
    await prisma.savingsGoal.update({
      where: { id: goal.id },
      data: {
        currentAmount: { increment: req.body.amount },
        isCompleted: newAmount >= Number(goal.targetAmount),
      },
    });

    res.status(201).json({ status: "success", data: contribution });
  } catch (err) { next(err); }
});

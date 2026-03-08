import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/db.js";
import { AppError } from "../middleware/errorHandler.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import type { Request, Response, NextFunction } from "express";

export const categoryRoutes = Router();
categoryRoutes.use(authenticate);

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().max(50).default("circle"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#0077B6"),
  parentId: z.string().uuid().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories (default + custom)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of categories with sub-categories
 */
categoryRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId: req.user!.userId }],
        parentId: null,
      },
      include: { subCategories: true },
      orderBy: { name: "asc" },
    });
    res.json({ status: "success", data: categories });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a custom category
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               icon: { type: string }
 *               color: { type: string }
 *               parentId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Category created
 */
categoryRoutes.post("/", validate(createCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.create({
      data: {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
        parentId: req.body.parentId,
        userId: req.user!.userId,
        isCustom: true,
      },
    });
    res.status(201).json({ status: "success", data: category });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a custom category
 *     security: [{ bearerAuth: [] }]
 */
categoryRoutes.put("/:id", validate(updateCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.category.findFirst({
      where: { id, userId: req.user!.userId, isCustom: true },
    });
    if (!existing) throw new AppError("Category not found or not editable", 404);
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
    });
    res.json({ status: "success", data: category });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a custom category
 *     security: [{ bearerAuth: [] }]
 */
categoryRoutes.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.category.findFirst({
      where: { id, userId: req.user!.userId, isCustom: true },
    });
    if (!existing) throw new AppError("Category not found or not deletable", 404);
    await prisma.category.delete({ where: { id } });
    res.json({ status: "success", message: "Category deleted" });
  } catch (err) { next(err); }
});

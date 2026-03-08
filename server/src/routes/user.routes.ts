import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../config/db.js";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import type { Request, Response, NextFunction } from "express";

export const userRoutes = Router();
userRoutes.use(authenticate);

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  phone: z.string().max(20).optional(),
  preferredCurrency: z.string().length(3).optional(),
  timezone: z.string().max(50).optional(),
});

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User profile
 */
userRoutes.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        preferredCurrency: true,
        timezone: true,
        createdAt: true,
      },
    });
    res.json({ status: "success", data: user });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               preferredCurrency: { type: string }
 *               timezone: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
userRoutes.put("/me", validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        name: req.body.name,
        phone: req.body.phone,
        preferredCurrency: req.body.preferredCurrency,
        timezone: req.body.timezone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        preferredCurrency: true,
        timezone: true,
      },
    });
    res.json({ status: "success", data: user });
  } catch (err) { next(err); }
});

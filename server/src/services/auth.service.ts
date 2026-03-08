import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/db.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { AppError } from "../middleware/errorHandler.js";
import type { RegisterInput, LoginInput } from "../validators/auth.validator.js";

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await bcryptjs.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        passwordHash,
      },
      select: { id: true, email: true, name: true, preferredCurrency: true },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    return { user, ...tokens };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const valid = await bcryptjs.compare(data.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferredCurrency: user.preferredCurrency,
      },
      ...tokens,
    };
  },

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError("Invalid refresh token", 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(payload.userId, payload.email);
  },

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  },

  async generateTokens(userId: string, email: string) {
    const accessToken = generateAccessToken({ userId, email });
    const refreshToken = generateRefreshToken({ userId, email });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken };
  },
};

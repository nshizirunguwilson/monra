import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthPayload } from "../middleware/auth.js";

export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.accessExpiry,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.jwt.refreshSecret) as AuthPayload;
};

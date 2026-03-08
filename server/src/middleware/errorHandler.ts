import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          status: "error",
          message: "A record with that value already exists",
        });
      case "P2003":
        return res.status(400).json({
          status: "error",
          message: "Referenced record does not exist",
        });
      case "P2025":
        return res.status(404).json({
          status: "error",
          message: "Record not found",
        });
      default:
        break;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Invalid data provided",
    });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
};

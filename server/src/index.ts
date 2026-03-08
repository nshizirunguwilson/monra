import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/auth.routes.js";
import { accountRoutes } from "./routes/account.routes.js";
import { transactionRoutes } from "./routes/transaction.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { goalRoutes } from "./routes/goal.routes.js";
import { budgetRoutes } from "./routes/budget.routes.js";
import { userRoutes } from "./routes/user.routes.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Swagger docs (mounted below)
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  console.log(`API docs: http://localhost:${env.port}/api/docs`);
});

export default app;

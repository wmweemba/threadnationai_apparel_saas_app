import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { getAuth } from "@clerk/express";
import { env } from "../lib/env";

interface ApiError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // getAuth throws if clerkMiddleware hasn't run yet (e.g. error in early middleware)
  const userId = (() => {
    try {
      return getAuth(req).userId ?? "anonymous";
    } catch {
      return "anonymous";
    }
  })();
  const timestamp = new Date().toISOString();

  // Log all errors with context
  console.error(
    JSON.stringify({
      timestamp,
      method: req.method,
      path: req.path,
      userId,
      error: err.message,
      stack: env.NODE_ENV !== "production" ? err.stack : undefined,
    })
  );

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const message =
    env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({ error: message });
}

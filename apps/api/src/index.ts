// env must be the very first import to validate all env vars on startup
import { env } from "./lib/env";
import { connectDB } from "./lib/db";

import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";

import { clerkAuth } from "./middleware/auth";
import { globalLimiter } from "./middleware/rate-limit";
import { errorHandler } from "./middleware/error-handler";

import generateRouter from "./routes/generate";
import creditsRouter from "./routes/credits";
import historyRouter from "./routes/history";
import webhooksRouter from "./routes/webhooks";

const app = express();

// ── Security middleware ─────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman) and localhost in dev
      if (!origin || origin === env.FRONTEND_URL) return callback(null, true);
      if (env.NODE_ENV === "development" && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ── Logging ─────────────────────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── NoSQL injection sanitization ─────────────────────────────────────────────
// Body-only: Express 5 makes req.query a read-only getter so we cannot overwrite it.
// Zod schemas validate all query params anyway.
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body) as typeof req.body;
  }
  next();
});

// ── Clerk webhook (public — must be before global Clerk auth + JSON body parser) ──
// Svix verification requires the raw request body as a string.
app.use(
  "/api/v1/webhooks",
  express.raw({ type: "application/json" }),
  (req: Request, _res: Response, next: NextFunction) => {
    // Convert raw Buffer to string for Svix
    if (Buffer.isBuffer(req.body)) {
      req.body = req.body.toString("utf8");
    }
    next();
  },
  webhooksRouter
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use("/api/v1", globalLimiter);

// ── Auth middleware (global JWT verification) ─────────────────────────────────
app.use(clerkAuth);

// ── Health check (public — no auth required) ─────────────────────────────────
app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/v1/generate", generateRouter);
app.use("/api/v1/credits", creditsRouter);
app.use("/api/v1/history", historyRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(
      `🚀 ThreadNation API running on port ${env.PORT} [${env.NODE_ENV}]`
    );
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

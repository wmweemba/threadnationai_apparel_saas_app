import rateLimit from "express-rate-limit";
import { getAuth } from "@clerk/express";
import { Request } from "express";

// Per-user key generator (falls back to IP for unauthenticated requests)
const userKeyGenerator = (req: Request): string => {
  const auth = getAuth(req);
  return auth.userId ?? req.ip ?? "anonymous";
};

// Generation endpoint — 10 per user per hour
export const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: userKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many generation requests. Please wait before generating again.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

// Rejection endpoint — 3 per user per hour
export const rejectionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: userKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Maximum rejection limit reached for this hour. Please approve or wait.",
    code: "REJECTION_LIMIT_EXCEEDED",
  },
});

// Global limiter — 100 per IP per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down.",
    code: "GLOBAL_RATE_LIMIT",
  },
});

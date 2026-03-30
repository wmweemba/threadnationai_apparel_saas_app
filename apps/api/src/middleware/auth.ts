import { clerkMiddleware } from "@clerk/express";
import { verifyToken } from "@clerk/backend";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/user.model";
import { env } from "../lib/env";

// Augment Express request with Clerk auth and db user
declare global {
  namespace Express {
    interface Request {
      dbUser?: IUser;
    }
  }
}

// Apply Clerk JWT verification globally (sets auth context for optional use)
export const clerkAuth = clerkMiddleware({ secretKey: env.CLERK_SECRET_KEY });

// Require an authenticated user with a DB record
export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  let userId: string;

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });
    userId = (payload as { sub: string }).sub;
  } catch (err) {
    console.error("[auth] Token verification failed:", (err as Error).message);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    // Clerk webhook may not have fired yet — create the user record on first API call
    try {
      user = await User.create({
        clerkId: userId,
        email: "",
        credits: 3,
        dpaConsentSigned: false,
        rejectionsThisHour: 0,
      });
    } catch (createErr: unknown) {
      console.error("[auth] User.create failed:", createErr);
      // Race condition: another request may have created it — try fetching again
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(500).json({ error: "Failed to create user account" });
        return;
      }
    }
  }

  req.dbUser = user;
  next();
}

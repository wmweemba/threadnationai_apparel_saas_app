import { clerkMiddleware, getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/user.model";

// Augment Express request with Clerk auth and db user
declare global {
  namespace Express {
    interface Request {
      dbUser?: IUser;
    }
  }
}

// Apply Clerk JWT verification globally
export const clerkAuth = clerkMiddleware();

// Require an authenticated user with a DB record
export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await User.findOne({ clerkId: auth.userId });

  if (!user) {
    // User not in DB yet — webhook may be delayed
    res.status(404).json({
      error: "User account not found. Please try again in a moment.",
      code: "USER_NOT_FOUND",
    });
    return;
  }

  req.dbUser = user;
  next();
}

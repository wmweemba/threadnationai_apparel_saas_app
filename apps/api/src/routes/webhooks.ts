import { Router, Request, Response } from "express";
import { Webhook } from "svix";
import { env } from "../lib/env";
import { User } from "../models/user.model";

const router = Router();

interface ClerkUserCreatedEvent {
  type: "user.created";
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
  };
}

/**
 * POST /api/v1/webhooks/clerk
 * Public endpoint (no Clerk JWT auth) — verified via Svix signature.
 * Creates a User record with 3 starter credits when a new Clerk user signs up.
 */
router.post("/clerk", async (req: Request, res: Response) => {
  const svixId = req.headers["svix-id"] as string | undefined;
  const svixTimestamp = req.headers["svix-timestamp"] as string | undefined;
  const svixSignature = req.headers["svix-signature"] as string | undefined;

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: "Missing Svix headers" });
    return;
  }

  let payload: ClerkUserCreatedEvent;
  try {
    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
    // wh.verify() needs the raw body as a string
    const rawBody =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);

    payload = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch (err) {
    console.warn("[webhook] Svix verification failed:", (err as Error).message);
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  if (payload.type === "user.created") {
    const { id: clerkId, email_addresses } = payload.data;
    const email = email_addresses[0]?.email_address ?? "";

    await User.findOneAndUpdate(
      { clerkId },
      {
        $setOnInsert: {
          clerkId,
          email,
          credits: 3,
          dpaConsentSigned: false,
          rejectionsThisHour: 0,
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[webhook] user.created → ${clerkId} (${email}) — 3 credits granted`);
  }

  res.json({ received: true });
});

export default router;

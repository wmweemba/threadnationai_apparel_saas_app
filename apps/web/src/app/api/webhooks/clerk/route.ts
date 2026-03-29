/**
 * NOTE: This Next.js webhook route is NOT used in production.
 *
 * Clerk webhooks are handled directly by the Express backend at:
 *   POST /api/v1/webhooks/clerk   (apps/api/src/routes/webhooks.ts)
 *
 * In the Clerk Dashboard → Webhooks, configure the endpoint as:
 *   https://api.yourdomain.com/api/v1/webhooks/clerk
 *
 * This file is kept as a stub to avoid a 404 if any tooling hits this path.
 */
export async function POST() {
  return new Response(
    JSON.stringify({ message: "Webhook handled by backend" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

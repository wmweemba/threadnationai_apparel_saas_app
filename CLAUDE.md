# CLAUDE.md — ThreadNation AI: Hackathon MVP

> This is the single source of truth for this build. Read every section before writing any code.
> When in doubt, return here. Do not deviate from the stack, structure, or conventions defined below.

---

## 0. What We Are Building

**ThreadNation AI** transforms amateur product photos of clothing into professional social media
posts — in under 60 seconds. The target user is a Zambian fashion boutique owner who shoots
stock on their phone and needs studio-quality marketing assets without a photographer.

**The core loop (the only thing that matters for this MVP):**
Upload photo → Quality check → Choose style preset → AI generates studio image → AI writes
3 captions → User approves → Downloads/shares to WhatsApp.

**Hackathon MVP scope — build ONLY these features:**
- DPA consent gate (Zambia Data Protection Act 2021 compliance modal)
- Clerk authentication (email/password + Google OAuth)
- Photo upload with client-side preview
- Quality Critic agent (Gemini 2.0 Flash vision — scores image, rejects if < 70/100)
- Style preset selector (3 presets: Studio Clean, Lusaka Lifestyle, Garden Shoot)
- Async image generation via Fal.ai (Flux 1.1 Pro Ultra)
- Animated progress feed ("Analyzing fabric details..." etc.)
- Caption agent (Llama 3.3 70B — generates 3 caption variants)
- Watermarked low-res preview (512px with canvas overlay)
- Credit system (mock — no real payments, demo "Top Up" gives 5 credits instantly)
- Approve → reveal high-res + copy-paste captions + WhatsApp share button
- Generation history (last 5 per user, stored in MongoDB)

**Explicitly OUT OF SCOPE for this build:**
- Flutterwave / MoMo payment integration
- LangGraph orchestration
- Virtual Closet / full history pagination
- Admin dashboard
- Email notifications

---

## 1. Monorepo Structure

```
threadnation-ai/
├── CLAUDE.md                  ← this file
├── .gitignore
├── README.md
├── package.json               ← root (workspaces)
├── apps/
│   ├── web/                   ← Next.js 14 frontend (App Router)
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── .env.local         ← frontend env vars (never commit)
│   │   ├── public/
│   │   │   └── watermark.png  ← ThreadNation watermark asset
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx                  ← landing / redirect
│   │       │   ├── (auth)/
│   │       │   │   ├── sign-in/page.tsx
│   │       │   │   └── sign-up/page.tsx
│   │       │   ├── (app)/
│   │       │   │   ├── layout.tsx            ← protected layout (Clerk)
│   │       │   │   ├── dashboard/page.tsx    ← main workspace
│   │       │   │   └── history/page.tsx      ← last 5 generations
│   │       │   └── api/
│   │       │       └── webhooks/
│   │       │           └── clerk/route.ts    ← Clerk webhook handler
│   │       ├── components/
│   │       │   ├── ui/                       ← shadcn/ui primitives
│   │       │   ├── consent-gate.tsx          ← DPA modal
│   │       │   ├── upload-zone.tsx           ← drag/drop upload
│   │       │   ├── quality-feedback.tsx      ← retry card with tips
│   │       │   ├── style-selector.tsx        ← 3 preset cards
│   │       │   ├── progress-feed.tsx         ← animated status steps
│   │       │   ├── preview-card.tsx          ← watermarked result
│   │       │   ├── caption-panel.tsx         ← 3 caption options
│   │       │   ├── result-hub.tsx            ← post-approve export screen
│   │       │   ├── credit-badge.tsx          ← credit count in nav
│   │       │   └── mock-topup-modal.tsx      ← demo credit top-up
│   │       ├── hooks/
│   │       │   ├── use-generation.ts         ← generation state machine
│   │       │   └── use-credits.ts            ← credit balance + mock topup
│   │       ├── lib/
│   │       │   ├── api-client.ts             ← typed fetch wrapper for backend
│   │       │   └── utils.ts
│   │       └── types/
│   │           └── index.ts                  ← shared frontend types
│   │
│   └── api/                   ← Node.js / Express backend
│       ├── package.json
│       ├── tsconfig.json
│       ├── .env               ← backend env vars (never commit)
│       ├── Dockerfile
│       └── src/
│           ├── index.ts                      ← Express app entry
│           ├── routes/
│           │   ├── generate.ts               ← POST /generate
│           │   ├── credits.ts                ← GET/POST /credits
│           │   └── history.ts                ← GET /history
│           ├── middleware/
│           │   ├── auth.ts                   ← Clerk JWT verification
│           │   ├── rate-limit.ts             ← express-rate-limit config
│           │   └── error-handler.ts
│           ├── agents/
│           │   ├── quality-critic.ts         ← Gemini 2.0 Flash vision
│           │   └── caption-agent.ts          ← Llama 3.3 70B
│           ├── services/
│           │   ├── fal-service.ts            ← Fal.ai Flux integration
│           │   ├── watermark-service.ts      ← Sharp watermark overlay
│           │   └── storage-service.ts        ← Cloudinary or local temp storage
│           ├── models/
│           │   ├── user.model.ts             ← Mongoose schema
│           │   └── generation.model.ts       ← Mongoose schema
│           ├── schemas/
│           │   └── generation.schema.ts      ← Zod validation schemas
│           └── lib/
│               ├── db.ts                     ← MongoDB Atlas connection
│               └── openrouter.ts             ← OpenRouter client wrapper
├── packages/
│   └── shared/
│       └── types.ts                          ← types shared between apps
└── docker-compose.yml                        ← local dev (optional)
```

---

## 2. Technology Stack

### Frontend — `apps/web`
| Concern | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use server components where possible |
| Styling | Tailwind CSS v3 | No inline styles — Tailwind only |
| UI Components | shadcn/ui | Install via CLI, do not manually copy |
| Auth | Clerk (Next.js SDK) | `@clerk/nextjs` |
| HTTP client | Native fetch + typed wrapper | No axios on frontend |
| State | React hooks + Context | No Redux, no Zustand for MVP |
| Image processing | Browser Canvas API | Watermark overlay on preview |
| Animations | Tailwind animate + CSS transitions | No Framer Motion for MVP |
| Font | Google Fonts: Syne (headings) + DM Sans (body) | Import in layout.tsx |

### Backend — `apps/api`
| Concern | Technology | Notes |
|---|---|---|
| Runtime | Node.js 20 + TypeScript | Strict mode enabled |
| Framework | Express 5 | |
| Auth verification | `@clerk/express` | Verify JWT on every protected route |
| Database | MongoDB Atlas + Mongoose | |
| Validation | Zod | All request bodies validated |
| Rate limiting | `express-rate-limit` | See limits below |
| Image generation | `@fal-ai/client` | Flux 1.1 Pro Ultra |
| Image processing | `sharp` | Watermark overlay, resize to 512px preview |
| AI (vision) | OpenRouter — `google/gemini-2.0-flash-exp:free` | Quality Critic |
| AI (text) | OpenRouter — `meta-llama/llama-3.3-70b-instruct:free` | Caption Agent |
| File upload | `multer` + `multer-storage-memory` | Never write uploads to disk |
| CORS | `cors` | Whitelist frontend domain only |
| Logging | `morgan` | Dev: combined, Prod: combined to stdout |
| Container | Docker | Single Dockerfile for Coolify deployment |

### Infrastructure
| Concern | Technology |
|---|---|
| Hosting | Coolify (self-hosted, single server) |
| Frontend deploy | Coolify static/Next.js service |
| Backend deploy | Coolify Docker service |
| Database | MongoDB Atlas free M0 (cloud) |
| Image storage | Cloudinary free tier (temp URL for generated images) |
| Domain | User's domain — configure in Coolify |

---

## 3. Environment Variables

### Frontend — `apps/web/.env.local`
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Backend — `apps/api/.env`
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
OPENROUTER_API_KEY=sk-or-...
FAL_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=https://yourdomain.com
REJECTION_HOURLY_LIMIT=3
CREDITS_PER_TOPUP=5
```

---

## 4. API Contract

All API routes are prefixed `/api/v1`. All requests to protected routes must include the Clerk
session token as `Authorization: Bearer <token>`.

### POST `/api/v1/generate`
Starts the full generation pipeline. This is the main endpoint.

**Request:** `multipart/form-data`
```
image: File        (required, max 10MB, jpg/png/webp only)
stylePreset: string (required, enum: "studio_clean" | "lusaka_lifestyle" | "garden_shoot")
```

**Response:** `application/json`
```typescript
// Uses the Zod schema from Backend_Structured_Output document
{
  id: string (uuid)
  status: "success" | "failed" | "quality_rejected"
  input_quality_score: number (0-100)
  critic_feedback?: string
  generated_assets?: {
    preview_url: string      // watermarked 512px — always returned on success
    high_res_url?: string    // only returned AFTER credit deduction (see POST /approve)
    model_used: string
  }
  social_content?: {
    sales_caption: string
    lifestyle_caption: string
    local_vibe_caption: string
    hashtags: string[]
  }
  computational_cost_usd: number
  credit_refund_eligible: boolean
}
```

### POST `/api/v1/generate/:id/approve`
Deducts 1 credit and releases the high-res URL.

**Response:**
```typescript
{
  high_res_url: string
  credits_remaining: number
}
```

### POST `/api/v1/generate/:id/reject`
Refunds 0.5 credits (enforces max 3 rejections/hour).

**Response:**
```typescript
{
  credits_remaining: number
  rejections_this_hour: number
}
```

### GET `/api/v1/credits`
Returns current credit balance.

### POST `/api/v1/credits/topup`
Mock top-up (hackathon only — adds 5 credits, no payment).

### GET `/api/v1/history`
Returns last 5 generations for the authenticated user.

### GET `/api/v1/health`
Public health check — returns `{ status: "ok", timestamp: string }`.

---

## 5. Rate Limiting Rules

Apply via `express-rate-limit` in `middleware/rate-limit.ts`.

```typescript
// Generation endpoint — most expensive, most protected
generateLimiter: {
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 10,                      // 10 generations per user per hour
  keyGenerator: (req) => req.auth.userId   // per-user, not per-IP
}

// Rejection limiter — prevents GPU abuse
rejectionLimiter: {
  windowMs: 60 * 60 * 1000,
  max: 3,                       // max 3 rejects per hour (per PRD spec)
  keyGenerator: (req) => req.auth.userId
}

// General API limiter
globalLimiter: {
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 100                      // 100 requests per IP
}
```

---

## 6. Data Models

### User Model — `models/user.model.ts`
```typescript
{
  clerkId: string           // Clerk user ID — primary link to auth
  email: string
  credits: number           // default: 3 (free starter credits on signup)
  dpaConsentSigned: boolean // default: false — gate before any generation
  dpaConsentDate?: Date
  rejectionsThisHour: number
  rejectionsWindowStart?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Generation Model — `models/generation.model.ts`
```typescript
{
  id: string               // UUID
  userId: string           // Clerk user ID
  status: "success" | "failed" | "quality_rejected"
  stylePreset: string
  inputQualityScore: number
  criticFeedback?: string
  previewUrl?: string      // Cloudinary watermarked URL
  highResUrl?: string      // Cloudinary full URL — null until approved
  modelUsed: string
  salesCaption?: string
  lifestyleCaption?: string
  localVibeCaption?: string
  hashtags?: string[]
  creditDeducted: boolean
  approved: boolean
  createdAt: Date
}
```

---

## 7. Agent Implementations

### Quality Critic — `agents/quality-critic.ts`

Uses OpenRouter with `google/gemini-2.0-flash-exp:free`. Send the image as base64.

```typescript
// System prompt
const QUALITY_CRITIC_PROMPT = `You are a professional product photography quality assessor
for a fashion e-commerce platform targeting Zambian boutiques.

Analyze the uploaded garment photo and score it from 0-100 based on:
- Focus and sharpness (30 points): Is the garment in clear focus?
- Lighting quality (30 points): Is the garment well-lit with visible detail?
- Garment visibility (25 points): Is the full garment or key features visible?
- Background suitability (15 points): Is the background clean enough for AI processing?

Return ONLY valid JSON matching this exact structure — no markdown, no explanation:
{
  "score": <number 0-100>,
  "passed": <boolean, true if score >= 70>,
  "feedback": "<one sentence of actionable advice if score < 70, empty string if passed>"
}`;
```

**Implementation notes:**
- Convert uploaded image buffer to base64 before sending
- Set `max_tokens: 200` — response is tiny
- If OpenRouter returns an error, default to `{ score: 75, passed: true }` with a logged warning
  (never block a user due to AI service downtime)
- Timeout: 10 seconds

### Caption Agent — `agents/caption-agent.ts`

Uses OpenRouter with `meta-llama/llama-3.3-70b-instruct:free`. Text only.

```typescript
// Build the user prompt dynamically from image analysis
const buildCaptionPrompt = (garmentDescription: string, stylePreset: string) => `
You are the "Head of Social Growth" for ThreadNation AI. Write high-converting social media
captions for a Zambian fashion boutique. The style preset used was: ${stylePreset}.

Garment details from visual analysis: ${garmentDescription}

STYLE RULES:
- Blend standard English with Zambian business etiquette
- Use phrases like "DM for price", "Serious buyers only", "Nationwide delivery"
- Use emojis strategically (👗 ✨ 📍 📲) but sparingly
- The local vibe option should use subtle Nyanja/Bemba warmth (e.g. "muoneke bwino", "fasho", "pache")

Return ONLY valid JSON — no markdown, no preamble:
{
  "sales_caption": "<THE HUSTLER: short, punchy, price-focused, strong CTA>",
  "lifestyle_caption": "<THE STORYTELLER: quality and occasion focused>",
  "local_vibe_caption": "<THE LUSAKA VIBE: warm, local slang infused>",
  "hashtags": ["<array of 6-8 relevant hashtags, mix English and Zambian>"]
}`;
```

**Implementation notes:**
- Before calling the caption agent, run a brief garment description pass: ask Gemini (or parse
  from the quality critic call) what the garment is. Use this as `garmentDescription`.
- Set `max_tokens: 600`
- Parse JSON response safely — wrap in try/catch, return fallback captions if parse fails
- Timeout: 15 seconds

---

## 8. Fal.ai Integration — `services/fal-service.ts`

```typescript
import * as fal from "@fal-ai/client";

const STYLE_PRESET_PROMPTS = {
  studio_clean: "professional fashion model wearing {garment}, clean white studio background, 
    professional lighting, high-end fashion photography, sharp focus",
  lusaka_lifestyle: "professional fashion model wearing {garment}, modern urban Lusaka cafe 
    background, natural lifestyle lighting, authentic African fashion photography",
  garden_shoot: "professional fashion model wearing {garment}, lush tropical garden background, 
    soft natural light, high-end outdoor fashion photography, Zambia"
};

// Model: fal-ai/flux-pro/v1.1-ultra
// Key params:
{
  image_size: "portrait_4_3",
  num_inference_steps: 28,
  guidance_scale: 3.5,
  num_images: 1,
  enable_safety_checker: true,
  output_format: "jpeg"
}
```

**Implementation notes:**
- Use `fal.subscribe()` for async polling — do NOT use `fal.run()` which blocks the process
- Stream status updates back to the frontend via Server-Sent Events (SSE) on the generate endpoint
- Timeout: 60 seconds (Flux can take up to 30s under load)
- On failure: return `status: "failed"` — do not deduct credits

---

## 9. Watermark Service — `services/watermark-service.ts`

Use `sharp` to:
1. Resize image to 512px wide
2. Composite a semi-transparent "ThreadNation AI — Preview" text overlay
3. Add a subtle diagonal watermark pattern
4. Return as buffer — upload to Cloudinary, return the URL as `preview_url`

The high-res image URL from Fal.ai is stored in the generation record but NEVER sent to the
frontend until after `POST /generate/:id/approve` is called.

---

## 10. Server-Sent Events (SSE) for Progress Feed

The frontend connects to `GET /api/v1/generate/:id/progress` via EventSource.
The backend emits these events in order during generation:

```
event: progress
data: { step: 1, message: "Analyzing fabric details...", percent: 10 }

event: progress
data: { step: 2, message: "Checking image quality...", percent: 25 }

event: progress
data: { step: 3, message: "Placing model in selected setting...", percent: 40 }

event: progress
data: { step: 4, message: "Generating studio-quality image...", percent: 65 }

event: progress
data: { step: 5, message: "Crafting high-converting captions...", percent: 85 }

event: complete
data: { generationId: "uuid", status: "success" | "quality_rejected" | "failed" }
```

Frontend `progress-feed.tsx` component subscribes to this SSE stream and animates each step.

---

## 11. UI/UX Specification

### Design Language
- **Aesthetic:** Luxury African fashion tech. Dark-first. Think high-end editorial meets Lusaka.
- **Primary colour:** Deep charcoal `#0D0D0D` background
- **Accent:** Warm gold `#C9A84C` — used for CTAs, active states, brand moments
- **Surface:** `#1A1A1A` cards, `#242424` elevated surfaces
- **Text:** `#F5F0E8` primary, `#8A8480` secondary
- **Success:** `#2D6A4F` (muted green), **Error:** `#8B2635` (muted red)
- **Fonts:** Syne (700 for headings) + DM Sans (400/500 for body) — import from Google Fonts
- **Border radius:** 12px cards, 8px inputs, 6px buttons
- **Motion:** Subtle. Fade-ins (200ms), slide-ups (300ms ease-out). No bouncy animations.

### Key Screen States

**Dashboard screen has 4 states managed by `use-generation.ts` hook:**

```
STATE 1 — IDLE
  Shows: Upload zone (drag/drop or click), credit badge, past generation thumbnail if exists
  
STATE 2 — QUALITY_CHECK
  Shows: Progress feed at step 1-2, uploaded image thumbnail, loading skeleton

STATE 3 — STYLE_SELECT (quality passed)
  Shows: Quality score badge ("Great shot! 84/100"), 3 style preset cards to choose from,
         "Generate Now" CTA button

STATE 3B — QUALITY_REJECTED
  Shows: Score badge (red), specific feedback tip, "Retake Photo" button, tips card

STATE 4 — GENERATING
  Shows: Progress feed steps 3-5 animating, estimated time "~15 seconds"

STATE 5 — PREVIEW
  Shows: Watermarked 512px image, 3 caption cards (sales/lifestyle/local vibe),
         "Unlock Full Resolution" button (deducts 1 credit),
         "Not quite right" reject button (refunds 0.5 credits)

STATE 6 — RESULT
  Shows: High-res image with "Save to Gallery" button,
         Selected caption with "Copy" button,
         Large "Share to WhatsApp Business" button (primary CTA — this is the magic moment),
         "Generate Another" button
```

### DPA Consent Gate
- Full-screen modal on first login (check `user.dpaConsentSigned === false`)
- Brand header, plain-language explanation of data processing
- Key points: images processed internationally, deleted within 24h, not used for AI training
- Single CTA: "Accept & Start Creating"
- On accept: PATCH `/api/v1/user/consent` then dismiss modal

### Mock Credit System (Hackathon)
- New users get 3 free credits on signup (create user record on Clerk webhook)
- Credit badge in navbar shows count with gold coin icon
- When credits = 0: show `mock-topup-modal.tsx` with "Demo: Add 5 Credits" button
- Add a small "(Demo Mode)" label on the modal so judges understand it's a placeholder

---

## 12. Security Checklist

Every item here must be implemented — no skipping for the hackathon:

- [ ] All protected routes verify Clerk JWT via `@clerk/express` middleware
- [ ] File upload: validate MIME type server-side (not just extension), max 10MB
- [ ] File upload: use `multer` memory storage — NEVER write to disk
- [ ] All request bodies validated with Zod schemas before processing
- [ ] Rate limiting applied to `/generate`, `/approve`, `/reject` endpoints
- [ ] CORS configured to whitelist `FRONTEND_URL` only — no wildcard in production
- [ ] No API keys in frontend code — all AI calls go through backend
- [ ] MongoDB connection uses `?retryWrites=true&w=majority` connection string
- [ ] `helmet()` middleware applied to Express app
- [ ] `express-mongo-sanitize` to prevent NoSQL injection
- [ ] High-res image URLs are never returned until `POST /approve` is called
- [ ] Environment variables validated on startup (use `zod` to parse `process.env`)
- [ ] `NODE_ENV=production` disables stack traces in error responses
- [ ] Uploaded image buffer cleared from memory after processing

---

## 13. Dockerfile — `apps/api/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --workspace=apps/api
COPY apps/api ./apps/api
COPY packages ./packages
RUN npm run build --workspace=apps/api

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache vips-dev
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
RUN npm ci --only=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

---

## 14. Build Order for Claude Code Sessions

Execute in this exact order. Do not jump ahead.

### Session 1 — Scaffold & Config (~30 min)
1. Initialise monorepo with npm workspaces
2. Create `apps/web` with `create-next-app` (TypeScript, Tailwind, App Router, src/ dir)
3. Create `apps/api` with TypeScript, Express 5, and all dependencies installed
4. Set up `packages/shared/types.ts` with the shared Zod schemas
5. Configure Tailwind with the design tokens from Section 11
6. Install and configure shadcn/ui in `apps/web`
7. Add Google Fonts (Syne + DM Sans) to `apps/web/src/app/layout.tsx`
8. Set up Clerk in `apps/web` — middleware, layout wrapper, sign-in/sign-up pages
9. Set up MongoDB Atlas connection in `apps/api/src/lib/db.ts`
10. Create both Mongoose models
11. Add `helmet`, `cors`, `morgan`, `express-rate-limit` to Express app
12. **Verify:** `npm run dev` works for both apps. Clerk auth flow works end-to-end.

### Session 2 — Backend Core (~45 min)
1. Build `lib/openrouter.ts` — typed OpenRouter client wrapper
2. Build `agents/quality-critic.ts` — test with a sample image base64
3. Build `agents/caption-agent.ts` — test with a sample garment description
4. Build `services/fal-service.ts` — test Flux generation with a real prompt
5. Build `services/watermark-service.ts` using Sharp
6. Build `services/storage-service.ts` using Cloudinary SDK
7. Build `routes/generate.ts` with SSE progress stream
8. Build `routes/credits.ts` (GET balance + mock topup)
9. Build `routes/history.ts`
10. Add Clerk webhook handler for user creation (auto-create User record + 3 credits)
11. **Verify:** POST to `/api/v1/generate` with Postman/Thunder Client returns a full result.

### Session 3 — Frontend Core (~45 min)
1. Build `components/consent-gate.tsx` — DPA modal
2. Build `components/upload-zone.tsx` — drag/drop with preview
3. Build `components/style-selector.tsx` — 3 preset cards
4. Build `components/progress-feed.tsx` — SSE consumer, animated steps
5. Build `components/preview-card.tsx` — watermarked image + canvas overlay
6. Build `components/caption-panel.tsx` — 3 caption tabs with copy button
7. Build `components/result-hub.tsx` — final export screen
8. Build `components/credit-badge.tsx` + `components/mock-topup-modal.tsx`
9. Build `hooks/use-generation.ts` — state machine managing all 6 dashboard states
10. Build `hooks/use-credits.ts`
11. Wire `app/(app)/dashboard/page.tsx` to render the correct component per state
12. **Verify:** Full user journey works end-to-end in browser.

### Session 4 — Polish & Deploy (~30 min)
1. Build `app/(app)/history/page.tsx`
2. Add loading skeletons for all async states
3. Add error boundaries and toast notifications for failures
4. Mobile responsiveness pass — test at 375px width (Zambian users are mobile-first)
5. Write `Dockerfile` for backend
6. Push to Git repo
7. Configure Coolify: two services (Next.js + Docker), set all env vars, point domain
8. **Verify:** Full flow works on production URL.

---

## 15. WhatsApp Share Implementation

The "Share to WhatsApp Business" button is the product's magic moment. Implement it correctly.

```typescript
// In result-hub.tsx
const shareToWhatsApp = (imageUrl: string, caption: string) => {
  // WhatsApp Web share with pre-filled caption
  const text = encodeURIComponent(caption);
  const waUrl = `https://wa.me/?text=${text}`;
  
  // On mobile: opens WhatsApp app directly
  // On desktop: opens WhatsApp Web
  window.open(waUrl, '_blank');
  
  // Note: WhatsApp doesn't support direct image attachment via URL scheme.
  // The image must be saved first, then attached manually.
  // Show a helper toast: "Image saved to gallery — attach it in WhatsApp"
};

// "Save to Gallery" uses the Web Share API if available, fallback to download link
const saveToGallery = async (imageUrl: string) => {
  if (navigator.share) {
    await navigator.share({ files: [/* fetch + convert to File */], title: 'ThreadNation AI' });
  } else {
    // Fallback: trigger download
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `threadnation-${Date.now()}.jpg`;
    a.click();
  }
};
```

---

## 16. Context7 Usage in Claude Code

When Claude Code needs library documentation, use Context7 MCP for:
- `@fal-ai/client` — fal.ai SDK docs
- `@clerk/nextjs` and `@clerk/express` — auth integration
- `mongoose` — schema and query patterns
- `sharp` — image processing API
- `express-rate-limit` — configuration options
- `cloudinary` — upload SDK

Trigger Context7 by asking: "use context7 to look up [library name] documentation"

---

## 17. Known Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Flux generation > 30s | Medium | SSE keeps UI alive; set 60s timeout; show "still working..." at 20s |
| OpenRouter free tier rate limit | Medium | Implement exponential backoff (3 retries); fallback to mock response in dev |
| Gemini vision quality score inconsistent | Low | Hard-code a pass if score between 60-70 (soft gate for demo) |
| Fal.ai fabric pattern quality poor | Low | Pre-test with 3 Zambian garment photos before demo |
| MoMo push notification delay (not applicable for MVP) | N/A | Deferred — mock credits used |
| Coolify deployment cold start | Low | Backend always-on container, no serverless |
| MongoDB Atlas connection drops | Low | Mongoose auto-reconnect enabled |

---

## 18. Demo Script for Hackathon Judges

Prepare this exact flow for the demo:

1. Open app, show DPA consent gate — explain Zambia DPA 2021 compliance
2. Sign in (pre-created demo account with 5 credits)
3. Upload a pre-prepared test photo of a colourful Zambian chitenge dress
4. Show quality score appearing ("Great shot! 87/100")
5. Select "Lusaka Lifestyle" preset
6. Show the progress feed animating through steps
7. Show the watermarked preview + 3 caption options
8. Click "The Lusaka Vibe" caption — show the local language flair
9. Click "Unlock Full Resolution" — show credit deducting
10. Show the high-res result + WhatsApp share button
11. Click share — show WhatsApp opening with pre-filled caption

**Key talking points for judges:**
- "60 seconds from photo to post-ready bundle"
- "Built for Zambian boutique owners — local payment, local language, local context"
- "85% gross margin: API cost $0.04, credit price $0.60"
- "Zambia DPA 2021 compliant from day one"

---

*Document version: 1.0 — Hackathon MVP*
*Last updated: March 2026*
*Do not modify this file during the build without noting the change.*

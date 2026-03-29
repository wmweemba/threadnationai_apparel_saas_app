# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.2.0] — 2026-03-29

### Added

#### Backend — AI Agents (`apps/api/src/agents/`)
- `quality-critic.ts` — image quality assessment agent using `google/gemini-2.0-flash-001` via OpenRouter:
  - Resizes image to 800px before encoding (keeps base64 payload under ~150KB)
  - Scores 0–100 across focus, lighting, visibility, background; rejects below 70
  - Soft gate: scores 60–69 auto-pass for demo resilience
  - Returns `garment_description` in same API call (saves a second AI round-trip)
  - Graceful fallback `{ score: 75, passed: true }` on any AI service failure
- `caption-agent.ts` — social media caption generator using `google/gemma-3-27b-it:free` via OpenRouter:
  - Generates three caption variants per the CLAUDE.md §7 spec: `sales_caption`, `lifestyle_caption`, `local_vibe_caption`
  - Outputs 6–8 hashtags mixing English and Zambian tags
  - Zambian cultural voice: Nyanja/Bemba phrases, local business etiquette
  - Hardcoded fallback captions on any parse failure — demo never shows an error

#### Backend — Services (`apps/api/src/services/`)
- `fal-service.ts` — Flux 1.1 Pro Ultra image generation via `@fal-ai/client`:
  - Three style preset prompts: `studio_clean`, `lusaka_lifestyle`, `garden_shoot`
  - Uses `fal.subscribe()` for non-blocking async polling with queue status logging
  - 60-second `Promise.race` timeout with descriptive error
- `watermark-service.ts` — preview image processor using `sharp`:
  - Resizes to 512px wide, maintains aspect ratio
  - Composites centred "ThreadNation AI — Preview" text overlay (white, 75% opacity)
  - Composites diagonal tiled "THREADNATION" watermark pattern (white, 18% opacity)
  - Returns JPEG buffer at quality 80
- `storage-service.ts` — Cloudinary asset storage:
  - `uploadBuffer()` — wraps `upload_stream` in a Promise, returns `secure_url`
  - `uploadFromUrl()` — uploads Fal.ai image URL directly, returns `secure_url`

#### Backend — Routes (full implementations replacing Session 1 stubs)
- `routes/generate.ts` — complete generation pipeline:
  - `POST /api/v1/generate` — validates multipart upload (10MB max, JPEG/PNG/WebP), magic-byte MIME verification, DPA consent + credit checks, fires background pipeline, returns `202 { id }`
  - In-memory job store (`Map<string, JobState>`) with event buffering for late SSE connections
  - `runPipeline()` — orchestrates: quality critic → Fal.ai generation → watermark → Cloudinary upload → captions → MongoDB persist → SSE complete event
  - `GET /api/v1/generate/:id/progress` — SSE stream; replays buffered events for late clients; auto-closes on job completion or client disconnect
  - `POST /api/v1/generate/:id/approve` — deducts 1 credit, sets `approved: true`, returns `high_res_url` (fetched with `select("+highResUrl")`)
  - `POST /api/v1/generate/:id/reject` — refunds 0.5 credits, enforces 3/hour rejection window, sets `creditRefundEligible: false`
- `routes/credits.ts` — fully implemented:
  - `GET /api/v1/credits` — returns balance and DPA consent status
  - `POST /api/v1/credits/topup` — adds `CREDITS_PER_TOPUP` (5) credits; mock/demo only
  - `PATCH /api/v1/credits/consent` — records DPA consent with timestamp
- `routes/history.ts` — fully implemented:
  - `GET /api/v1/history` — last 5 generations sorted by `createdAt` desc; `highResUrl` excluded
- `routes/webhooks.ts` — Clerk webhook handler (new):
  - `POST /api/v1/webhooks/clerk` — public route, Svix-signature verified
  - On `user.created`: upserts `User` document with 3 starter credits and `dpaConsentSigned: false`
  - Idempotent via `findOneAndUpdate` with `$setOnInsert`

#### Backend — Infrastructure updates
- `src/index.ts` — registers webhook router before global `clerkAuth` middleware; raw body middleware (`express.raw`) applied only to `/api/v1/webhooks` for Svix signature verification
- `src/lib/env.ts` — added `CLERK_WEBHOOK_SECRET` validation
- `.env.example` — added `CLERK_WEBHOOK_SECRET` placeholder
- `packages/shared/types.ts` — `QualityCriticResponseSchema` extended with `garment_description` field

#### Tooling
- `src/test-agents.ts` — development smoke-test script; runs quality critic + caption agent against a local image file without requiring HTTP auth

### Changed
- `apps/web/src/app/api/webhooks/clerk/route.ts` — replaced full implementation with a stub note; Clerk webhooks now handled by the Express backend at `POST /api/v1/webhooks/clerk`

### Fixed
- `apps/api/.env` — corrected Clerk keys from production (`sk_live_` / `pk_live_`) to development instance (`sk_test_` / `pk_test_`) to match the frontend dev instance; this was causing all protected routes to return 401

---

## [0.1.0] — 2026-03-29

### Added

#### Monorepo Infrastructure
- Root `package.json` with npm workspaces (`apps/web`, `apps/api`, `packages/shared`)
- `concurrently` for running both apps in parallel via `npm run dev`
- `.gitignore` covering `node_modules`, build outputs, all `.env*` files, IDE folders
- `README.md` with stack overview and local setup instructions
- `CLAUDE.md` — single source of truth for architecture, conventions, and build order
- `packages/shared/types.ts` — shared Zod schemas and TypeScript types used by both apps:
  - `StylePresetEnum`, `GenerationStatusEnum`
  - `QualityCriticResponseSchema`, `CaptionResponseSchema`
  - Full API request/response schemas (`GenerateResponse`, `ApproveResponse`, `RejectResponse`, `CreditsResponse`, `TopupResponse`, `HistoryResponse`)
  - SSE event schemas (`ProgressEventSchema`, `CompleteEventSchema`) and `PROGRESS_STEPS` constants

#### Frontend (`apps/web`) — Next.js 14 App Router
- Project scaffold via `create-next-app@14` (TypeScript, Tailwind CSS, ESLint, App Router, `src/` directory)
- Tailwind CSS v3 configured with full ThreadNation design token system:
  - Colors: `background` (`#0D0D0D`), `surface.card` (`#1A1A1A`), `surface.elevated` (`#242424`), `accent` (`#C9A84C`), `text.primary` (`#F5F0E8`), `text.secondary` (`#8A8480`), `success` (`#2D6A4F`), `error` (`#8B2635`)
  - Font families: `font-syne` (headings, 700) and `font-sans` / DM Sans (body, 400/500)
  - Border radius tokens: `rounded-card` (12px), `rounded-input` (8px), `rounded-btn` (6px)
  - Keyframe animations: `fade-in` (200ms), `slide-up` (300ms), `pulse-gold`
- `globals.css` with Google Fonts import (Syne + DM Sans) and shadcn/ui CSS variables mapped to ThreadNation dark palette
- `next.config.mjs` with Cloudinary and Fal.ai remote image patterns, and 10 MB server action body limit
- Clerk v6 authentication (`@clerk/nextjs`):
  - `middleware.ts` using `clerkMiddleware` + `createRouteMatcher` (Clerk v5+ API)
  - Public routes: `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks/clerk(.*)`, `/api/v1/health`
  - `ClerkProvider` in root layout with ThreadNation appearance tokens
  - `/sign-in` and `/sign-up` pages with matching dark theme overrides
- Route groups:
  - `(auth)` — sign-in and sign-up pages
  - `(app)` — protected layout with nav bar (brand logo, credits badge stub, `UserButton`), dashboard stub, history stub
- Root `page.tsx` — server-side redirect: authenticated → `/dashboard`, unauthenticated → `/sign-in`
- Clerk webhook handler (`/api/webhooks/clerk`) with `svix` signature verification; handles `user.created` event (backend user creation wired in Session 2)
- shadcn/ui component library initialised with ThreadNation theme; components added: `button`, `card`, `badge`, `dialog`, `input`, `label`, `progress`, `separator`, `skeleton`, `tabs`, `toast`, `toaster`
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/lib/api-client.ts` — typed fetch wrapper (`get`, `post`, `patch`, `postFormData`) with `Authorization` header injection
- `src/types/index.ts` — frontend TypeScript types: `GenerationStatus`, `StylePreset`, `GenerationState`, `ProgressStep`, `CreditState`
- `apps/web/.env.local.example` — documented environment variable template

#### Backend (`apps/api`) — Node.js 20 / Express 5
- Express 5 project scaffold (TypeScript strict mode, CJS output, `tsx watch` for dev, `tsup` for build)
- `src/lib/env.ts` — startup environment validation via Zod; `process.exit(1)` on missing or invalid vars
- `src/lib/db.ts` — Mongoose connection with `isConnected` guard to prevent hot-reload duplicates; auto-reconnect listeners
- `src/lib/openrouter.ts` — typed OpenRouter API client (fetch-based, configurable timeout via `AbortController`)
- `src/models/user.model.ts` — Mongoose `User` schema: `clerkId`, `email`, `credits` (default: 3), `dpaConsentSigned`, `rejectionsThisHour`, timestamps
- `src/models/generation.model.ts` — Mongoose `Generation` schema: full generation record; `highResUrl` has `select: false` so it is never accidentally leaked in queries
- `src/middleware/auth.ts` — `clerkAuth` (global JWT verification) + `requireUser` (loads `dbUser` onto request)
- `src/middleware/rate-limit.ts` — per-user rate limiters: `generateLimiter` (10/hr), `rejectionLimiter` (3/hr); global IP limiter (100/15 min)
- `src/middleware/error-handler.ts` — `ZodError` → 400 with field details; stack traces hidden in production
- Route stubs with auth guards applied (all return `501` until Session 2):
  - `POST /api/v1/generate`
  - `GET /api/v1/generate/:id/progress` (SSE)
  - `POST /api/v1/generate/:id/approve`
  - `POST /api/v1/generate/:id/reject`
  - `GET /api/v1/credits`
  - `POST /api/v1/credits/topup`
  - `PATCH /api/v1/credits/consent`
  - `GET /api/v1/history`
- `GET /api/v1/health` — public health check returning `{ status: "ok", timestamp }`
- `src/index.ts` — Express app with middleware in load-bearing order: `helmet` → `cors` → `mongoSanitize` → `morgan` → body parsing → global rate limiter → `clerkAuth` → routes → 404 → error handler
- `Dockerfile` — multi-stage build (builder + runner), `vips-dev` installed for `sharp`
- `apps/api/.env.example` — documented environment variable template

---

[Unreleased]: https://github.com/wmweemba/threadnationai_apparel_saas_app/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/wmweemba/threadnationai_apparel_saas_app/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/wmweemba/threadnationai_apparel_saas_app/releases/tag/v0.1.0

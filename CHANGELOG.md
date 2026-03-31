# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.5.1] — 2026-03-31

### Changed

#### Mobile-First Responsive Pass (Session 4, Item 4)
- `apps/web/src/app/(app)/layout.tsx` — tighter nav padding on mobile (`px-3 sm:px-4`), reduced main content top/bottom padding (`py-5 sm:py-8`)
- `apps/web/src/components/nav-brand.tsx` — responsive font size (`text-base sm:text-xl`, was `text-xl` always) to prevent truncation at 375px
- `apps/web/src/components/nav-actions.tsx` — reduced gap between nav items on mobile (`gap-2 sm:gap-4`); wrapped Clerk `UserButton` in `relative z-50` so popover renders above page content; added dark-themed popover styles (`userButtonPopoverCard`, `userButtonPopoverActionButton`, `userButtonPopoverActionButtonText`, `userButtonPopoverActionButtonIcon`, `userButtonPopoverFooter: hidden`) so the sign-out/manage-account dropdown is readable on dark background
- `apps/web/src/components/credit-badge.tsx` — hides "credits" label on mobile (`hidden sm:inline`), showing only the number + dot; tighter horizontal padding (`px-2 sm:px-3`) to prevent two-line wrapping
- `apps/web/src/app/layout.tsx` — added Clerk `userButtonPopover*` element overrides to global `ClerkProvider` appearance for consistent dark-themed dropdown across all pages
- `apps/web/src/app/page.tsx` — landing page responsive typography: headline scaled down for mobile (`text-3xl sm:text-5xl md:text-6xl lg:text-7xl`, was `text-5xl` base which wrapped to 4+ lines on iPhone 13); reduced hero padding (`pt-16 sm:pt-24`, `pb-12 sm:pb-20`); subtext scaled (`text-base sm:text-lg md:text-xl`); stat card values scaled (`text-2xl sm:text-3xl`); stat section padding reduced (`pb-16 sm:pb-24`)
- `apps/web/src/components/upload-zone.tsx` — camera and gallery buttons wrapped in `sm:hidden` container (mobile-only); desktop shows only drag-and-drop zone; drag-and-drop padding reduced (`p-8`, was `p-10`)
- `apps/web/src/app/(app)/dashboard/page.tsx` — page heading scaled for mobile (`text-2xl sm:text-3xl`); tighter header margin (`mb-6 sm:mb-8`)

### Fixed
- **Nav overflow on iPhone 13** — brand text, credit badge, and user avatar no longer compete for horizontal space at 390px viewport; all three fit comfortably
- **Clerk UserButton dropdown invisible** — popover was rendering with Clerk's default light theme on the dark app; now uses `#1A1209` background with `#F5F0E8` text; "Secured by Clerk" footer hidden
- **Landing page headline wrapping** — "Your fabric. Their eyes." no longer wraps to 4+ lines on mobile; fits on 2 lines at 390px

---

## [0.5.0] — 2026-03-30

### Added
- `apps/web/src/components/kente-strip.tsx` — Pan-African kente-inspired horizontal strip component with 10 colour segments (gold, chitenge, midnight, green, blue) in a culturally-referencing repeating pattern; configurable height; used at top of landing page (8px) and bottom of app nav (4px)

### Changed

#### Design System — Pan-African Luxury Rebrand
- `apps/web/tailwind.config.js` — replaced neutral grey token palette with warm Pan-African design tokens:
  - New colours: `midnight` (`#0F0A04`), `cream` (`#FAF7F2`), `kente-gold` (`#C9A84C`), `chitenge` (`#8B4513`), `kente-green` (`#2D5016`), `ankara-blue` (`#1B3A6B`), `warm-muted` (`#6B5B3E`), `warm-dim` (`#9A8A72`)
  - Updated semantic tokens: `background` → `#0F0A04`, `surface-card` → `#1A1209`, `surface-elevated` → `#241C10`, `border` → `#2A2111`, `text-secondary` → `#9A8A72`
  - Added `rounded-pill` (30px) border radius for landing page CTA
- `apps/web/src/app/globals.css` — updated all CSS custom properties to warm-tinted HSL values; added Syne weight 800 to Google Fonts import

#### Landing Page — Light Theme
- `apps/web/src/app/page.tsx` — complete redesign from redirect-only to a full marketing landing page:
  - Cream (`#FAF7F2`) background with kente strip at top
  - Hero: "Your fabric. Their eyes." headline (Syne 800, midnight text, gold accent)
  - Eyebrow label: "Studio photos in 60 seconds" (kente-gold, uppercase, tracked)
  - Pill-shaped CTA button (midnight bg, cream text) with kente-gold arrow circle
  - Two stat cards (`#F0E6C8` fill): "60s / Photo to post" and "85% / Gross margin"
  - Subtle kente grid pattern (repeating-linear-gradient at 8% gold opacity) at bottom
  - Auth redirect preserved for logged-in users

#### App Dashboard — Dark Theme Refinements
- `apps/web/src/app/(app)/layout.tsx` — midnight background; kente strip (4px) at top of nav; warm-tinted border
- `apps/web/src/components/nav-brand.tsx` — cream text with Syne 800 weight
- `apps/web/src/components/credit-badge.tsx` — gold-tinted background (`rgba(201,168,76,0.12)`), solid kente-gold dot indicator replacing text symbol
- `apps/web/src/components/upload-zone.tsx` — dashed gold border (`rgba(201,168,76,0.3)`), gold-tinted background, SVG upload icon in kente-gold
- `apps/web/src/components/style-selector.tsx` — dark surface cards (`rgba(255,255,255,0.03)`), active card: kente-gold border + gold-tinted bg + gold label; uppercase tracked section labels in warm-dim; primary CTA: kente-gold bg with midnight text
- `apps/web/src/components/progress-feed.tsx` — completed steps use kente-gold dots (replacing green), pending steps in warm-dim, warm-tinted card borders
- `apps/web/src/components/caption-panel.tsx` — active caption card gets 3px solid kente-gold left border; tabs use kente-gold active state; uppercase tracked section header
- `apps/web/src/components/preview-card.tsx` — midnight/cream badge, kente-gold approve button, warm-dim secondary text
- `apps/web/src/components/result-hub.tsx` — updated to new token system; bold font weights
- `apps/web/src/components/consent-gate.tsx` — kente-gold accents, warm-dim body text, Syne 800 headings, warm-tinted borders
- `apps/web/src/components/mock-topup-modal.tsx` — kente-gold accents, warm-dim text, Syne 800 headings
- `apps/web/src/app/(app)/dashboard/page.tsx` — all inline classes updated to new tokens (kente-gold, warm-dim, midnight, warm-tinted borders); Syne 800 page headings
- `apps/web/src/app/(app)/history/page.tsx` — updated to new tokens: kente-gold links, warm-dim secondary text, warm-tinted card borders
- `apps/web/src/app/layout.tsx` — Clerk appearance variables updated to midnight/gold palette (`colorBackground: #0F0A04`, `colorInputBackground: #1A1209`, `colorTextSecondary: #9A8A72`, `colorNeutral: #2A2111`)

#### Typography
- All headings upgraded from `font-bold` (700) to `font-extrabold` (800) across all components
- All `font-semibold` button labels upgraded to `font-bold` for consistency
- Section labels styled as uppercase + `tracking-wider` + `warm-dim` colour

---

## [0.4.0] — 2026-03-30

### Added
- `apps/web/Dockerfile` — Next.js standalone Docker build for Coolify deployment; bakes `NEXT_PUBLIC_*` vars at build time via `ARG`
- `apps/web/src/app/(app)/error.tsx` — Next.js App Router error boundary for the `(app)` route group; prevents full-page crashes, shows "Try again" button

### Changed
- `apps/web/src/app/layout.tsx` — Added `<Toaster />` to root layout; toasts from `result-hub.tsx` were silently dropped because the provider was never mounted
- `apps/web/next.config.mjs` — Added `output: "standalone"` for Docker; removed `fal.media` and `*.fal.ai` image hostname patterns (no longer used — HuggingFace returns buffers, not URLs)
- `apps/web/src/components/caption-panel.tsx` — Shortened tab labels ("The Hustler" → "Hustler", "The Storyteller" → "Storyteller") and added `overflow-hidden` to prevent overflow at 375px
- `apps/web/src/app/(app)/layout.tsx` — Added `whitespace-nowrap` to nav brand text to prevent wrapping on small screens
- `apps/api/Dockerfile` — Full rewrite fixing 4 bugs: (1) add `packages/shared/package.json` copy before `npm ci` so workspace resolution works, (2) add `python3 make g++ vips-dev` build tools to builder stage for sharp, (3) move `vips` (runtime only, not `-dev`) to runner stage, (4) fix runner to use workspace-aware `npm ci --omit=dev` with root lockfile

### Fixed
- `apps/web/src/app/(app)/dashboard/page.tsx` — `qualityScore` prop was hardcoded as `100`; now reads `result?.inputQualityScore ?? 100` from the quality critic response

---

## [0.3.0] — 2026-03-30

### Added

#### Frontend — Components (`apps/web/src/components/`)
- `consent-gate.tsx` — DPA consent modal (Zambia Data Protection Act 2021):
  - Full-screen overlay on first login when `dpaConsentSigned === false`
  - Plain-language data processing disclosure (international processing, 24h deletion, no AI training)
  - Calls `PATCH /api/v1/credits/consent` on accept; dismisses and unblocks dashboard
- `upload-zone.tsx` — mobile-first PWA image upload:
  - Two hidden `<input>` refs: camera (`capture="environment"`) and gallery (no capture)
  - Prominent "Take a Photo" and "Choose from Gallery" buttons for mobile
  - Desktop drag-and-drop zone (`hidden sm:flex`)
  - Preview state with "Tap to change" hover overlay
  - Resets `input.value` after selection so same file can be reselected
- `style-selector.tsx` — three preset cards (Studio Clean, Lusaka Lifestyle, Garden Shoot) with selection highlight
- `progress-feed.tsx` — animated SSE progress steps:
  - Live elapsed-second counter next to the active step
  - `SLOW_STEPS = {3, 4}` — after 15s shows "AI is working hard on your image..." with pulse animation
  - Time estimate updated to "~45–90 seconds · Please keep this tab open"
- `preview-card.tsx` — displays watermarked 512px preview image with "Unlock Full Resolution" and "Not quite right" (reject) buttons
- `caption-panel.tsx` — tabbed panel for three caption variants with one-click copy
- `result-hub.tsx` — post-approve export screen: high-res image, caption copy, WhatsApp share, "Generate Another" CTA
- `credit-badge.tsx` — gold coin credit counter in the navbar
- `mock-topup-modal.tsx` — demo credit top-up modal; adds 5 credits instantly with "(Demo Mode)" label for judges
- `nav-actions.tsx` — navbar right-side slot combining `CreditBadge` and Clerk `UserButton`

#### Frontend — Hooks (`apps/web/src/hooks/`)
- `use-generation.ts` — full dashboard state machine managing 6 states: `idle → quality_check → style_select / quality_rejected → generating → preview → result`; consumes SSE stream via `EventSource`
- `use-credits.ts` — credit balance fetch + mock topup action

#### Frontend — Pages
- `dashboard/page.tsx` — wired to `useGeneration` hook; renders correct component per state with DPA gate check
- `history/page.tsx` — fetches and renders last 5 generations
- `(app)/layout.tsx` — protected layout with navbar, `CreditBadge`, `UserButton`, and `ConsentGate`

### Changed
- `apps/api/src/services/fal-service.ts` — switched image generation provider from fal.ai (paid, credits exhausted) to **HuggingFace Inference API** (free tier):
  - Model: `black-forest-labs/FLUX.1-schnell`
  - Endpoint: `https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell` (migrated from deprecated `api-inference.huggingface.co`)
  - Returns binary image buffer directly (no separate fetch step needed)
  - `x-wait-for-model: "true"` header avoids cold-start 503s
  - 503 retry logic with `estimated_time` back-off; up to 3 attempts with 5s delay between failures
  - 2-minute timeout per attempt
- `apps/api/src/routes/generate.ts` — updated pipeline to accept `imageBuffer` (not URL) from HuggingFace; removed `uploadFromUrl` call; both preview and high-res now use `uploadBuffer`
- `apps/api/src/lib/env.ts` — added `HUGGINGFACE_API_KEY` required field; `FAL_KEY` made optional (kept for future provider switch)
- `apps/api/.env` — added `HUGGINGFACE_API_KEY`; corrected `CLOUDINARY_CLOUD_NAME` to actual account cloud name

### Fixed
- `apps/api/src/middleware/auth.ts` — replaced `@clerk/express` `clerkMiddleware` auth context (silently returning null `userId`) with direct `verifyToken` from `@clerk/backend`; this was causing 401 on all protected routes despite valid tokens
- `apps/api/src/models/user.model.ts` — changed `email` field from `required: true` to `default: ""` to allow auto-creation of user records from Clerk JWT (no email in token payload)
- Pipeline error logging improved: full error object logged (not just `.message`) to surface Cloudinary and upstream API failures

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

[Unreleased]: https://github.com/wmweemba/threadnationai_apparel_saas_app/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/wmweemba/threadnationai_apparel_saas_app/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/wmweemba/threadnationai_apparel_saas_app/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/wmweemba/threadnationai_apparel_saas_app/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/wmweemba/threadnationai_apparel_saas_app/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/wmweemba/threadnationai_apparel_saas_app/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/wmweemba/threadnationai_apparel_saas_app/releases/tag/v0.1.0

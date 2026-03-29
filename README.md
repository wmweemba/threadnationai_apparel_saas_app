# ThreadNation AI

AI-powered social media post generator for Zambian fashion boutiques. Transforms amateur product photos into professional marketing assets in under 60 seconds.

## Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Clerk
- **Backend:** Node.js 20, Express 5, TypeScript, MongoDB Atlas, Mongoose
- **AI:** Google Gemini 2.0 Flash (quality check), Llama 3.3 70B (captions), Fal.ai Flux 1.1 Pro Ultra (image generation)
- **Infrastructure:** Coolify, Cloudinary, MongoDB Atlas

## Setup

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB Atlas account
- Clerk account
- OpenRouter account
- Fal.ai account
- Cloudinary account

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd threadnation-ai

# Copy environment files
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Fill in the env variables (see each file for instructions)
# Then install dependencies
npm install

# Start both apps in development
npm run dev
```

### Environment Variables

- `apps/web/.env.local.example` — frontend env template
- `apps/api/.env.example` — backend env template

## Development

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Health check: `http://localhost:3001/api/v1/health`

## Project Structure

```
apps/
  web/    → Next.js 14 frontend
  api/    → Express 5 backend
packages/
  shared/ → Shared Zod schemas and TypeScript types
```

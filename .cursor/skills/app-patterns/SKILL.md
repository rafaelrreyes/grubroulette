---

name: app-patterns
description: Architecture and implementation patterns for Grub Roulette — the React/Vite/shadcn (Base UI) frontend, the Hono API, zustand game state, theming, gamification, dependency policy, and where future AI, Google, and Maps code goes. Use when adding or changing features, components, API routes, state, styles, or dependencies in this repo.
---

# Grub Roulette app patterns

## Repo map

```
apps/web/src/
  App.tsx              page layout only (header, meal tabs, grid)
  components/          feature components (one per file, named export)
  components/ui/       shadcn components (generated; only light edits)
  hooks/               use-*.ts
  lib/api.ts           the ONLY place that calls fetch("/api/...")
  lib/game.ts          pure game rules: XP, levels, achievements (no React)
  lib/store.ts         zustand store `useGame` (persisted to localStorage)
  data/meals.ts        static meal metadata, quick-adds, reel decoys
apps/api/src/
  index.ts             server bootstrap only
  app.ts               middleware, mounts routers under /api, serves SPA
  routes/<name>.ts     one Hono router per resource
  lib/env.ts           the ONLY place that reads process.env (zod-validated)
  data/                static data (idea pool, quips)
```

Local dev: web on **3337** (Vite HMR), API on **4337** (`node --watch`). Vite proxies `/api`.

## Frontend

- **Components**: function components, props typed inline or with an interface, named exports.
  Keep components presentational; game logic lives in `lib/game.ts` and the store.
- **State**: read with narrow selectors, `useGame((s) => s.xp)`, not the whole store. Add new
  persisted state to `initialProgress` in `store.ts`, and bump the persist `version` if the shape changes.
  Store actions that grant rewards return a `Reward` (`{ xp, unlocked }`); the UI shows toasts for it.
- **API calls**: add a typed function to `lib/api.ts`. Components never call `fetch` directly.
  Always have a graceful fallback; the spin must never break when the API is down.
- **shadcn/ui** (style `base-nova`, Base UI primitives, **not Radix**):
  - Add with `cd apps/web && npx shadcn@4.23.0 add <name>`, then change
    `import { cn } from "cn"` to `import { cn } from "@/lib/utils"` and run `npm run lint:fix`.
    Never install the `cn`, `clsx`, or `next-themes` packages.
  - Base UI composition uses the `render` prop, not `asChild`:
    `<TooltipTrigger render={<Button />}>label</TooltipTrigger>`.
  - `className` may be a function of state; our `cn` supports that.
- **Styling**: Tailwind v4, CSS-first in `src/index.css`.
  - Use theme tokens: `bg-primary` (tomato), `bg-accent` (mustard), `bg-secondary` (mint),
    `text-grape`, `border-ink`, `text-muted-foreground`. No raw hex/oklch in components.
  - The signature look is the "sticker": the `sticker` utility (2px ink border + hard shadow) and
    `sticker-press` for buttons, slight rotations, and `font-black` headings.
- **Motion**: `motion/react` for animation. Respect `useReducedMotion()` for decorative effects.
- **Tone**: copy is playful and a bit absurd ("The Grub-O-Matic 3000", "Chaos Mode").
  The product should feel like a game, not an AI tool. Keep AI features behind playful UI.

## Gamification rules (lib/game.ts)

- XP constants live in `XP`; levels use `xpForLevel(n) = 50·n·(n−1)`; titles come from `TITLES`.
- New achievement: append to `ACHIEVEMENTS` with `{ id, name, emoji, description, unlocked(stats) }`.
  `unlocked` must be a pure function of `GameStats`. Add any new stat to `GameStats` and the store.
- Vetoes: `VETOES_PER_DAY`, which resets on a new local day (`dayKey()`).

## Backend (Hono)

- One router per file, methods chained so types flow: `export const x = new Hono().get(...).post(...)`.
  Mount it in `app.ts` with `.route("/x", x)`.
- Validate every input with zod `safeParse`. On failure return `c.json({ error: "..." }, 400)`.
  Never throw for bad input.
- Read config only via `env` from `lib/env.ts`. Add new vars there and to `.env.example`
  (plus the README/docs env table).
- Use `pickRandom` (crypto) for randomness, not `Math.random`.
- Ship features that aren't ready behind an env-driven flag exposed via `GET /api/config`.
  Stub endpoints return **501** with `{ error, enabled: false }` (see `routes/places.ts`).
- Don't add CORS. The SPA and API are same-origin in dev (proxy) and prod (one process).

## Planned features: where code goes

- **AI suggestions/agent**: `apps/api/src/ai/` with `agent.ts` (harness), `prompts/` (versioned
  prompt files), `tools/` (zod-typed tools), and `evals/` (datasets and scorers). Expose it via
  `routes/ai.ts`. The UI surfaces AI output as contenders or a pick, not as a chat (chat is secondary).
- **Google sign-in**: `routes/auth.ts`, using `GOOGLE_CLIENT_ID/SECRET` from `env`.
- **Nearby places**: implement `routes/places.ts` (Google Places plus Yelp ratings), and swap
  `NearbyTeaser` for a real component when `/api/config` reports `nearbyPlaces: true`.

## Dependency policy

Before adding any package:
1. Run it through the security validation tool (Boost Security `validate_package`) at the exact version.
2. Use a version published **at least 7 days ago**. Pin it exactly (`.npmrc` has `save-exact=true`).
3. Avoid packages flagged as typosquats or with a low OpenSSF score. Prefer a few lines of our own code.
4. After installing, run a Trivy/`npm audit` scan and make sure there are 0 vulnerabilities.
5. Record notable choices in the README "Dependency hygiene" section.

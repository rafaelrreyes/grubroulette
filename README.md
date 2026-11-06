# 🎰 Grub Roulette

Can't decide what to eat? List a few ideas for **breakfast, lunch, or dinner**, smash the
**SPIN** button, and let the Grub-O-Matic 3000 decide. No ideas? It engages **Chaos Mode** and
picks something from its own secret stash.

It's gamified: every spin earns XP, you level up through ridiculous titles
("Snack Apprentice" → "Burrito Baron" → "Supreme Overlord of Lunch"), keep a daily streak,
get **3 vetoes per day**, and unlock trophies like _Agent of Chaos_ and _Midnight Muncher_.

---

## Tech stack

| Layer       | Choice                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| Runtime     | Node.js **26 LTS** (pinned in `.nvmrc`)                                |
| Monorepo    | npm workspaces (`apps/*`)                                              |
| Frontend    | React 19, TypeScript 6, **Vite 8** (Rolldown bundler)                  |
| Styling     | Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first config)                |
| Components  | **shadcn/ui** (`base-nova` style on **Base UI** primitives), lucide icons |
| Motion/FX   | `motion` (Framer Motion) + a custom food-emoji confetti                |
| State       | `zustand` with `persist` (localStorage) for ideas, XP, achievements    |
| Backend     | **Hono** on `@hono/node-server`, `zod` validation                      |
| TS on Node  | Node runs `.ts` directly in dev (native type stripping); `tsc` emits JS for prod |
| Lint        | ESLint 10 flat config, typescript-eslint, react-hooks, react-refresh   |
| CI/CD       | GitHub Actions → GHCR Docker image + GitHub Release on tags            |

## Repo layout

```
.
├── apps/
│   ├── api/                  # Hono API + static file server for the built SPA
│   │   └── src/
│   │       ├── index.ts      # server entry (listens on $PORT)
│   │       ├── app.ts        # routes, security headers, SPA fallback
│   │       ├── routes/       # /api/ideas, /api/places
│   │       ├── data/ideas.ts # Chaos Mode idea pool + quips
│   │       └── lib/          # env parsing (zod), crypto-random picker
│   └── web/                  # React SPA
│       ├── components.json   # shadcn config
│       └── src/
│           ├── components/   # slot machine, idea list, trophies, etc.
│           ├── components/ui # shadcn components (Base UI)
│           ├── lib/          # api client, game rules, zustand store
│           └── data/meals.ts # meal metadata, quick-adds, reel decoys
├── .github/workflows/        # ci.yml, release.yml
├── Dockerfile                # multi-stage, single container (API + SPA)
└── .nvmrc                    # Node version for nvm / CI / Docker
```

## Getting started

```bash
nvm install        # reads .nvmrc (26.13.0); other installed versions are untouched
nvm use
npm install
cp .env.example .env   # optional for now
npm run dev
```

- Web (Vite dev server, HMR): http://localhost:5173 (Vite picks the next free port if taken)
- API: http://localhost:8787 — Vite proxies `/api/*` to it, so the browser only talks to Vite.

## Scripts (run from the repo root)

| Script              | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `npm run dev`       | API (`node --watch src/index.ts`) + Vite dev server, side by side    |
| `npm run build`     | `tsc -b && vite build` for web → `apps/web/dist`; `tsc` for API → `apps/api/dist` |
| `npm start`         | Runs the production server (API + built SPA) on `$PORT`              |
| `npm run lint`      | ESLint across workspaces                                             |
| `npm run typecheck` | `tsc --noEmit` across workspaces                                     |
| `npm run check`     | lint + typecheck + build (what CI runs)                              |

## How the build works

1. **Web**: `tsc -b` type-checks the app (project references: `tsconfig.app.json` for
   browser code, `tsconfig.node.json` for `vite.config.ts`). Then **Vite 8** bundles with
   Rolldown, and the Tailwind v4 Vite plugin compiles `src/index.css`. Output: `apps/web/dist`.
2. **API**: written in erasable-syntax-only TypeScript with `.ts` import specifiers. In dev,
   Node 26 runs it directly (no `tsx`/`ts-node`). For production `tsc` emits ESM JS to
   `apps/api/dist` (`rewriteRelativeImportExtensions` turns `./x.ts` into `./x.js`).
3. **One process in production**: the Hono server serves `/api/*` and also serves
   `apps/web/dist` as static files with an `index.html` SPA fallback. Unknown `/api/*` routes
   return JSON 404s. One port, one container, no CORS.

## API

| Method | Path                    | Description                                                        |
| ------ | ----------------------- | ------------------------------------------------------------------ |
| GET    | `/api/health`           | `{ ok, version }`                                                  |
| GET    | `/api/config`           | Feature flags (`googleLogin`, `nearbyPlaces`) based on env vars    |
| POST   | `/api/ideas/pick`       | Body `{ meal, ideas[] }` → crypto-random winner + quip. Empty list → Chaos Mode |
| GET    | `/api/ideas/random`     | `?meal=lunch&exclude=a,b` → random idea from the curated pool      |
| GET    | `/api/places`           | `?cuisine=&lat=&lng=` → **501** until `GOOGLE_MAPS_API_KEY` is set |

The web app falls back to a client-side pick if the API is unreachable, so spinning never breaks.

## Environment variables

See `.env.example`. Nothing is required to run today.

| Var                    | Used for                                   |
| ---------------------- | ------------------------------------------ |
| `PORT`                 | Server port (default 8787; Docker uses 8080) |
| `APP_VERSION`          | Reported by `/api/health` (defaults to root `package.json` version) |
| `WEB_DIST_DIR`         | Where the built SPA lives (auto-detected)  |
| `GOOGLE_CLIENT_ID/SECRET` | Future Google sign-in                   |
| `GOOGLE_MAPS_API_KEY`  | Future nearby restaurant search            |
| `YELP_API_KEY`         | Future ratings/reviews                     |

Secrets never go in the repo. Locally they live in `.env` (git-ignored); in CI use GitHub
Actions secrets; on Cursor Apps use the Apps secrets UI.

## CI/CD

### `ci.yml` — every push to `main` and every pull request
`npm ci` → lint → typecheck → build → boots the production server and curls `/api/health` and
`/` → `npm audit --audit-level=high`. A second job verifies the Docker image builds.

### `release.yml` — on tags `v*.*.*`
1. Re-runs CI.
2. Verifies the tag matches the root `package.json` version.
3. Builds and pushes `ghcr.io/<owner>/<repo>:<version>` (plus `<major>.<minor>` and `latest`).
4. Creates a GitHub Release with generated notes and a build tarball attached.
5. Optionally POSTs `{version, commit, repository}` to `CURSOR_DEPLOY_WEBHOOK_URL` (repo
   secret) — e.g. a Cursor Automation webhook trigger.

The job runs in a GitHub **`production` environment**, so you can add required reviewers in
repo settings to gate releases.

### Cutting a release

```bash
git checkout main && git pull
npm version patch      # or minor / major
```

`preversion` runs `npm run check`, `npm version` bumps `package.json` and creates the
commit + `vX.Y.Z` tag, and `postversion` pushes with `--follow-tags`, which starts `release.yml`.

### First-time GitHub setup

```bash
git remote add origin git@github.com:<you>/grub-roulette.git
git push -u origin main
```

Then in GitHub settings: create the `production` environment (optional reviewers) and add
`CURSOR_DEPLOY_WEBHOOK_URL` as a secret if you use it.

## Deploying to Cursor Apps

[Cursor Apps](https://cursor.com/docs/cloud-agent/apps.md) hosting is driven by a Cursor
**cloud agent**: ask it to _"Deploy this repo as an app"_, review the preview, and click
**Publish**. Cursor runs security checks (no committed secrets/`.env`, source maps stripped —
our Vite build already disables them) and gives you a URL. Secrets are added via the
Apps dashboard, never in files.

What the agent needs to know (this repo is already shaped for it):

- **Node**: `26.13.0` (`.nvmrc`)
- **Install**: `npm ci`
- **Build**: `npm run build`
- **Start**: `npm start` (single process; listens on `$PORT`, serves API + SPA)
- **Health check**: `GET /api/health`

Cursor's docs currently describe publishing as a step you trigger from the agent, not from a git
tag. The tag → GitHub Release → (optional) webhook flow above is ready for when you want to
automate it, and the same Docker image runs on any container host (Cloud Run, Fly, Render, …)
if you ever need a fallback.

## Adding shadcn components

```bash
cd apps/web
npx shadcn@4.23.0 add dialog
```

The `base-nova` registry imports `cn` from the third-party `cn` package. We don't install that
package (a supply-chain scanner flags it), so after adding a component change its import to
`import { cn } from "@/lib/utils"`. Our `cn` supports Base UI's function-style `className`.

## Dependency hygiene

- Versions are pinned exactly (`.npmrc` → `save-exact=true`, `engine-strict=true`).
- Packages less than 7 days old are avoided, and new dependencies are run through a security check first.
- `overrides.minimatch` forces a patched version for ESLint's transitive dependency.
- Deliberately not used: `clsx`, `globals`, `canvas-confetti`, `tsup`, `next-themes`, `cn`,
  and `shadcn` as a dependency (the CLI runs through `npx` only when needed).

## Roadmap

- [ ] **Google sign-in** (OIDC), so stats sync across devices (moves the zustand store to the server)
- [ ] **Nearby restaurants**: Google Places search by the winning cuisine, plus Yelp ratings, on a map
- [ ] Persist history/achievements in Postgres (Cursor Apps can provision one)
- [ ] Group mode: friends vote, then the machine breaks ties
- [ ] Tests (Vitest + Playwright) once the features settle

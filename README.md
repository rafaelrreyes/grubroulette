# 🎰 Grub Roulette

Can't decide what to eat? List a few ideas for **breakfast, lunch, or dinner**, smash the
**SPIN** button, and let the Grub-O-Matic 3000 decide. No ideas? It engages **Chaos Mode** and
picks something from its own secret stash.

It's gamified: every spin earns XP, you level up through ridiculous titles
("Snack Apprentice" → "Burrito Baron" → "Supreme Overlord of Lunch"), keep a daily streak,
get **3 vetoes per day**, and unlock trophies like _Agent of Chaos_ and _Midnight Muncher_.

---

## Tech stack

| Layer       | Choice                                                                           |
| ----------- | -------------------------------------------------------------------------------- |
| Runtime     | Node.js **26 LTS** (pinned in `.nvmrc`)                                          |
| Monorepo    | npm workspaces (`apps/*`)                                                        |
| Frontend    | React 19, TypeScript 6, **Vite 8** (Rolldown bundler)                            |
| Styling     | Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first config)                          |
| Components  | **shadcn/ui** (`base-nova` style on **Base UI** primitives), lucide icons        |
| Motion/FX   | `motion` (Framer Motion) + a custom food-emoji confetti                          |
| State       | `zustand` with `persist` (localStorage) for ideas, XP, achievements              |
| Backend     | **Hono** on `@hono/node-server`, `zod` validation                                |
| TS on Node  | Node runs `.ts` directly in dev (native type stripping); `tsc` emits JS for prod |
| Lint/format | **Biome 2** (one tool: lint, format, import sorting, Tailwind class sorting)     |
| CI/CD       | GitHub Actions → GHCR Docker image + GitHub Release on tags                      |

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
├── .cursor/
│   ├── skills/               # project skills: code-style, app-patterns, ci-cd-deploy
│   └── rules/                # always-on rule pointing agents at the skills
├── .github/workflows/        # ci.yml (install → lint → build), deploy.yml (tags → deploy)
├── .githooks/pre-commit      # Biome check on staged files
├── docs/deployment.md        # how CI/CD and hosting work
├── AGENTS.md                 # entry point for AI agents
├── biome.json                # lint + format config
├── compose.yaml              # Docker dev environment (+ prod profile)
├── Dockerfile                # dev stage + multi-stage production image
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

Open **http://localhost:3337**.

| Process    | Port                | Reload behavior                                                              |
| ---------- | ------------------- | ---------------------------------------------------------------------------- |
| Web (Vite) | `3337` (`WEB_PORT`) | Hot module replacement: React/CSS edits update in place without losing state |
| API (Hono) | `4337` (`PORT`)     | `node --watch` restarts the server whenever any imported `.ts` file changes  |

Vite proxies `/api/*` to the API, so the browser only ever talks to port 3337. Both ports
use `strictPort`, so if one is taken you get an error instead of a surprise port. Change them in `.env`.

## Contributing with Docker (no local Node needed)

Only [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2.24+) is required.

```bash
git clone https://github.com/<owner>/grub-roulette.git
cd grub-roulette
cp .env.example .env      # optional
docker compose up         # first run installs deps inside the container (~1 min)
```

Open **http://localhost:3337**. Edit files on your machine as usual. The repo is bind-mounted
into the container, so Vite hot-reloads the UI and `node --watch` restarts the API (4337)
exactly like the native setup.

| Task                             | Command                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| Start (detached)                 | `docker compose up -d` then `docker compose logs -f app`                  |
| Stop                             | `docker compose down`                                                     |
| Run lint / typecheck / build     | `docker compose exec app npm run check`                                   |
| Add a dependency                 | `docker compose exec app npm install <pkg> -w @grub/web` (or `@grub/api`) |
| Shell inside the container       | `docker compose exec app sh`                                              |
| Reset deps from scratch          | `docker compose down -v && docker compose up`                             |
| Run the production image locally | `docker compose --profile prod up --build prod` → http://localhost:8080   |

How it works:

- The `dev` stage of the `Dockerfile` is just Node 26 plus `docker/dev-entrypoint.sh`. Source
  code is mounted, not copied, so there's nothing to rebuild when you edit code.
- `node_modules` lives in Docker volumes, so Linux-native binaries (Rolldown, Tailwind's
  oxide, lightningcss) never clash with a macOS/Windows host install. Dependencies are
  reinstalled automatically only when `package-lock.json` changes (e.g. after a `git pull`).
- If hot reload misses changes (some Windows/WSL setups), set `VITE_USE_POLLING=true` in `.env`.

## Scripts (run from the repo root)

| Script              | What it does                                                                       |
| ------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`       | API (`node --watch src/index.ts`) + Vite dev server, side by side                  |
| `npm run build`     | `tsc -b && vite build` for web → `apps/web/dist`; `tsc` for API → `apps/api/dist`  |
| `npm start`         | Runs the production server (API + built SPA) on `$PORT`                            |
| `npm run lint`      | `biome check .`: lint + format + import order + Tailwind class order (no writes)   |
| `npm run lint:fix`  | Same, but applies formatting and safe fixes                                        |
| `npm run format`    | Formatting only (`biome format --write .`)                                         |
| `npm run typecheck` | `tsc --noEmit` across workspaces                                                   |
| `npm run check`     | lint + typecheck + build (run this before pushing; also runs before `npm version`) |

## Code style & agent skills

- **Biome** (`biome.json`) is the single linter and formatter: 2 spaces, 110 columns, double
  quotes, semicolons, trailing commas, sorted imports, sorted Tailwind classes, React/a11y rules.
- **Editor**: install the recommended Biome extension (`.vscode/extensions.json`). Format-on-save
  and fix-on-save are preconfigured.
- **Pre-commit hook**: `.githooks/pre-commit` runs `biome check --staged`. `npm install` enables it
  automatically (`prepare` sets `core.hooksPath`).
- **CI**: `biome ci` fails the pipeline on any lint or format issue, with inline PR annotations.
- **Rules for humans and AI agents** live in project skills, which an always-on Cursor rule
  (`.cursor/rules/project-standards.mdc`) and `AGENTS.md` point every agent to:
  - [`code-style`](.cursor/skills/code-style/SKILL.md): lint/format rules, TS + naming conventions
  - [`app-patterns`](.cursor/skills/app-patterns/SKILL.md): architecture, component/API/state patterns, dependency policy
  - [`ci-cd-deploy`](.cursor/skills/ci-cd-deploy/SKILL.md): pipeline, releases, Docker, Cursor Apps

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

| Method | Path                | Description                                                                     |
| ------ | ------------------- | ------------------------------------------------------------------------------- |
| GET    | `/api/health`       | `{ ok, version }`                                                               |
| GET    | `/api/config`       | Feature flags (`googleLogin`, `nearbyPlaces`) based on env vars                 |
| POST   | `/api/ideas/pick`   | Body `{ meal, ideas[] }` → crypto-random winner + quip. Empty list → Chaos Mode |
| GET    | `/api/ideas/random` | `?meal=lunch&exclude=a,b` → random idea from the curated pool                   |
| GET    | `/api/places`       | `?cuisine=&lat=&lng=` → **501** until `GOOGLE_MAPS_API_KEY` is set              |

The web app falls back to a client-side pick if the API is unreachable, so spinning never breaks.

## Environment variables

See `.env.example`. Nothing is required to run today.

| Var                       | Used for                                                                     |
| ------------------------- | ---------------------------------------------------------------------------- |
| `PORT`                    | API/server port (default 4337; Docker uses 8080; hosts may inject their own) |
| `WEB_PORT`                | Vite dev server port (default 3337)                                          |
| `APP_VERSION`             | Reported by `/api/health` (defaults to root `package.json` version)          |
| `WEB_DIST_DIR`            | Where the built SPA lives (auto-detected)                                    |
| `GOOGLE_CLIENT_ID/SECRET` | Future Google sign-in                                                        |
| `GOOGLE_MAPS_API_KEY`     | Future nearby restaurant search                                              |
| `YELP_API_KEY`            | Future ratings/reviews                                                       |

Secrets never go in the repo. Locally they live in `.env` (git-ignored); in CI use GitHub
Actions secrets; on Cursor Apps use the Apps secrets UI.

## CI/CD & deployment

The pipeline is **install → lint → build → deploy**. See **[docs/deployment.md](docs/deployment.md)**
for the full guide, including a diagram, workflow details, Cursor Apps hosting, secrets, rollback
and troubleshooting.

| Workflow                                     | Runs on                     | Steps                                                                                                          |
| -------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](.github/workflows/ci.yml)         | every PR and push to `main` | `npm ci` → `biome ci` → `npm run build` → upload build artifact                                                |
| [`deploy.yml`](.github/workflows/deploy.yml) | tags `vX.Y.Z`               | CI, then publish the GHCR image, create a GitHub Release, and (optionally) trigger the Cursor Apps deploy hook |

Release with `npm version patch|minor|major`. It checks, bumps, tags and pushes, and the tag deploys.
The app is hosted on **Cursor Apps**: a Cursor cloud agent publishes it from this GitHub repo.

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
- Biome replaces ESLint + Prettier (about 130 fewer packages, no plugin vulnerabilities).
- Deliberately not used: `clsx`, `canvas-confetti`, `tsup`, `next-themes`, `cn`,
  and `shadcn` as a dependency (the CLI runs through `npx` only when needed).

## Roadmap

- [ ] **Google sign-in** (OIDC), so stats sync across devices (moves the zustand store to the server)
- [ ] **Nearby restaurants**: Google Places search by the winning cuisine, plus Yelp ratings, on a map
- [ ] Persist history/achievements in Postgres (Cursor Apps can provision one)
- [ ] Group mode: friends vote, then the machine breaks ties
- [ ] Tests (Vitest + Playwright) once the features settle

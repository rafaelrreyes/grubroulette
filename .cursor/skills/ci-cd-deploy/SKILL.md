---

name: ci-cd-deploy
description: How Grub Roulette is built, released, and deployed — the GitHub Actions CI and Deploy workflows (install, lint, build, deploy), semver tagging with npm version, GHCR images, GitHub Releases, Docker, and hosting on Cursor Apps. Use when changing workflows, Dockerfile, compose.yaml, scripts in package.json, cutting a release, deploying, or when the user mentions CI, CD, pipeline, release, tag, deploy, or Cursor Apps.
---

# CI/CD and deploy

The full human-facing guide is [docs/deployment.md](../../../docs/deployment.md). Keep it in sync
with any change you make here.

## Pipeline shape (keep it this way)

`install → lint → build → deploy`. There is **no test stage** until tests exist. When tests
are added, insert `npm test` between lint and build in `ci.yml`.

| Workflow                       | Trigger                                | Jobs                                                                                                                                                                                                    |
| ------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`     | PRs, pushes to `main`, `workflow_call` | `npm ci` → `npx biome ci --reporter=github .` → `npm run build` → upload `build` artifact                                                                                                               |
| `.github/workflows/deploy.yml` | tags `v*.*.*`                          | reuses `ci.yml`, then the `deploy` job (environment `production`): verify tag = package.json version → download artifact → push GHCR image → GitHub Release → optional `CURSOR_DEPLOY_WEBHOOK_URL` POST |

Rules for editing workflows:
- Node version always comes from `.nvmrc` (`node-version-file`). Never hardcode it.
- Use the latest major tags of official actions (`actions/*`, `docker/*`). Use the preinstalled
  `gh` CLI instead of adding third-party release actions.
- Give least-privilege `permissions` per job. Only `deploy` gets `contents: write` / `packages: write`.
- Keep the root scripts as the single source of truth. CI calls `npm run …` / `biome`, never
  duplicated shell logic.

## Releasing

```bash
npm version patch|minor|major   # preversion: npm run check · postversion: git push --follow-tags
```

Never create tags by hand. The deploy job fails if the tag ≠ `v${package.json version}`.

## Runtime contract (don't break it)

- One process: `npm start` serves `/api/*` and the SPA from `apps/web/dist`.
- Listens on `$PORT`. Health is `GET /api/health`. Version comes from `APP_VERSION` or the root `package.json`.
- Builds must not emit source maps. Secrets come from env only (Cursor Apps dashboard / GitHub secrets).

## Docker

- `Dockerfile` stages: `dev` (used by `compose.yaml`, source bind-mounted), then `build` → `deps` → `runtime` (default target, used by deploy).
- `compose.yaml`: `app` = hot-reload dev on 3337/4337; `prod` profile = production image on 8080.
- Base images use the exact Node version from `.nvmrc` (`node:<version>-alpine`). Update both together.

## Cursor Apps

Deploys go through a Cursor cloud agent. Prompt it with _"Deploy this repo as an app"_, or
_"Redeploy the app at tag vX.Y.Z"_; a person clicks **Publish**. To automate, use a Cursor
Automation webhook stored in the `CURSOR_DEPLOY_WEBHOOK_URL` secret. Install: `npm ci`,
build: `npm run build`, start: `npm start`, Node: `.nvmrc`.

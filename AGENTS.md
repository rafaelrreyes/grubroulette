# Agent instructions

This repo's conventions live in project skills. Read them before making changes:

- [Code style](.cursor/skills/code-style/SKILL.md): Biome is the only linter/formatter
- [App patterns](.cursor/skills/app-patterns/SKILL.md): architecture, components, API, state, dependencies
- [CI/CD & deploy](.cursor/skills/ci-cd-deploy/SKILL.md): workflows, releases, Docker, Cursor Apps

Before finishing any change: `npm run lint:fix && npm run check`.

## Deploying (Cursor Apps)

- Node: `.nvmrc` (26.13.0)
- Install: `npm ci`
- Build: `npm run build`
- Start: `npm start` (single process; serves `/api/*` and the SPA; listens on `$PORT`)
- Health: `GET /api/health`
- Secrets: environment variables only (see `.env.example`); never commit them

Full guide: [docs/deployment.md](docs/deployment.md)

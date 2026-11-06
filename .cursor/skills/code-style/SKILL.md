---

name: code-style
description: Lint and formatting rules for the Grub Roulette repo (Biome-only; no ESLint or Prettier), TypeScript conventions, and file/naming conventions. Use before writing or editing any TypeScript, TSX, CSS, or JSON in this repo, when fixing lint/format errors, or when the user mentions linting, formatting, Biome, code style, or CI lint failures.
---

# Code style (Biome)

Biome (`biome.json` at the repo root) is the **only** linter and formatter. Never add ESLint,
Prettier, or their configs/plugins.

## Workflow (every change)

1. Write code that already follows the rules below.
2. Run `npm run lint:fix` to apply formatting, import sorting, Tailwind class sorting, and safe fixes.
3. Run `npm run check` (lint + typecheck + build). It must pass before you're done.
4. CI runs `biome ci`; the pre-commit hook runs `biome check --staged`.

Suppress a rule only when there's a real reason, inline and with a reason:
`// biome-ignore lint/<group>/<rule>: <why>`. Never turn rules off globally in `biome.json` to get past an error.

## Formatting (enforced)

| Setting          | Value                                                                              |
| ---------------- | ---------------------------------------------------------------------------------- |
| Indent           | 2 spaces                                                                           |
| Line width       | 110                                                                                |
| Quotes           | double (JS and JSX)                                                                |
| Semicolons       | always                                                                             |
| Trailing commas  | all                                                                                |
| Arrow params     | always parenthesized                                                               |
| Line endings     | LF                                                                                 |
| Imports          | auto-sorted by Biome (`organizeImports`)                                           |
| Tailwind classes | auto-sorted (`useTailwindSortedClasses`, theme read from `apps/web/src/index.css`) |

## Lint rules that matter most

- **Unused code**: `noUnusedImports` and `noUnusedVariables` are errors. Delete dead code instead of commenting it out.
- **Type-only imports**: use `import type { X }` or `import { type X }` (`useImportType`; `verbatimModuleSyntax` is on).
- **React hooks**: complete dependency arrays (`useExhaustiveDependencies`); hooks only at top level.
  Store actions must not be named `useX` (we use `spendVeto`, not `useVeto`).
- **Component modules**: `.tsx` files in `src/components/` export **only components**
  (`useComponentExportOnlyModules`, needed for Vite fast refresh). Put hooks in `src/hooks/use-*.ts` and
  helpers/constants in `src/lib/` or `src/data/`. `src/components/ui/**` is exempt.
- **Promises**: `noFloatingPromises`. `await` them, or mark intentional fire-and-forget with `void`:
  `onClick={() => void spin()}`.
- **Console**: web code may only use `console.error/warn/info`. API code may log freely.
- **a11y** (recommended set): no `tabIndex` on non-interactive elements; use `aria-disabled` plus a
  handler rather than `disabled` when a tooltip must still work; `aria-label` on a `div` needs a role
  (e.g. `role="img"`); never use an array index as a React `key`.

## TypeScript conventions

- `strict`, `noUncheckedIndexedAccess` (API), `erasableSyntaxOnly`: **no `enum`, `namespace`, or
  constructor parameter properties**. Use `as const` objects or union types instead.
- Prefer `interface` for object shapes, `type` for unions. Infer types from zod schemas (`z.infer`).
- Non-null `!` is allowed for known-safe array lookups, e.g. `items[i]!` after a bounds check.
- **API imports** use explicit `.ts` extensions (`import { env } from "../lib/env.ts"`). Node runs
  TS natively and `tsc` rewrites them to `.js`.
- **Web imports** use the `@/` alias with no extension (`import { cn } from "@/lib/utils"`).

## Naming

| Thing        | Convention                                        | Example                                    |
| ------------ | ------------------------------------------------- | ------------------------------------------ |
| Files        | kebab-case                                        | `slot-machine.tsx`, `use-food-confetti.ts` |
| Components   | PascalCase **named** exports (no default exports) | `export function SlotMachine()`            |
| Hooks        | `useCamelCase` in `src/hooks/`                    | `useFoodConfetti`                          |
| Constants    | `SCREAMING_SNAKE` for module-level tables         | `IDEA_POOL`, `VETOES_PER_DAY`              |
| Hono routers | lowercase noun                                    | `export const ideas = new Hono()`          |

## Comments

Only explain constraints the code can't show (the "why"). No narrating comments, no TODOs without
context, no commented-out code.

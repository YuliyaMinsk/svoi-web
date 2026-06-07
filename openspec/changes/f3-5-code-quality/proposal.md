## Why

Feature **F3.5** installs the project's automated quality gate. The default ESLint setup (`next/core-web-vitals` + `next/typescript`) does not catch formatting drift, unsafe indexed access, unused code, floating promises, or FSD boundary violations (public-API breaks, cross-slice imports). As the codebase grows from F4 onward (pages, features, the client-flow state machine), these slip in silently. Closing the cheap machine-checkable minimum _now_ — before there is much code — means every later feature is written against a single `npm run check` that proves it clean, and the human-only rules (naming, purity, DRY) live as short prose where a tool cannot enforce them.

## What Changes

- **Prettier** for formatting: add `prettier` + `eslint-config-prettier`, a minimal `.prettierrc` and `.prettierignore`, and `format` / `format:check` scripts. Wire `eslint-config-prettier` **last** in `eslint.config.mjs` so it disables stylistic rules that would fight Prettier.
- **Strict TypeScript flags** in `tsconfig.json`: `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`. Fix whatever `tsc --noEmit` surfaces in existing F0–F3 code.
- **Type-checked ESLint rules**: add a type-aware block (`parserOptions.projectService`, `tsconfigRootDir`) enabling `@typescript-eslint/no-floating-promises` and `no-misused-promises` (optionally `id-length` against one-letter names).
- **Enable already-bundled best-practice rules (no new deps)**: `eslint-config-next` already ships `eslint-plugin-import` and `eslint-plugin-react-hooks` but leaves these off — turn on `import/order` configured with **FSD-aligned import groups** (react/next → external → `@/shared` → `@/entities` → `@/features` → `@/pages` → relative; autofix) and the `eslint-plugin-react-hooks@7` `recommended-latest` Rules-of-React / React Compiler rule set (React 19 guard). Only the rules are switched on; no packages added.
- **Steiger** (the official Feature-Sliced linter): add `steiger` + `@feature-sliced/steiger-plugin`, a `steiger.config.ts` with the FSD preset, and a `lint:fsd` script. Resolve every finding it reports on `src/` **structurally, with no suppressions** (see the FSD restructure below).
- **FSD restructure to pass Steiger clean** (forced by the no-suppressions decision): move the master domain types from `entities/master` to the `shared/model` segment (the `shared` layer must not import upward from `entities`); add `index.ts` public APIs to `shared/model` and `shared/config`; remove the premature empty `entities/` and `features/` placeholder layers (F5/F6 recreate them when they hold real content).
- **Aggregating script** `check`: `tsc --noEmit && eslint . && prettier --check . && steiger src`.
- **Non-lintable rules** recorded as terse theses in the `context` block of `openspec/config.yaml` (revealing names, pure functions, DRY-on-third-repeat, one error/`null` convention) — _not_ duplicating anything ESLint/TS already enforces.
- One-time `npm run format` pass over the repo as a separate `style:` normalization commit.

Out of scope / **deferred to demo → product** (dev-plan §7): `eslint-plugin-sonarjs`, `knip`, `lefthook` + `lint-staged`, and GitHub Actions CI. No product code or behavior changes here — infrastructure only.

## Capabilities

### New Capabilities

- `code-quality`: The project's automated quality gate — formatting consistency (Prettier), strict TypeScript compiler flags, type-aware lint rules (no floating/misused promises), FSD-aligned import ordering, a React 19 Rules-of-React guard, FSD boundary enforcement (Steiger), and one aggregated `check` command that runs them all. Each guarantee is verifiable: an intentional violation (unformatted file, unsafe indexed access, floating promise, mis-ordered imports, Rules-of-React break, cross-slice import) is caught by the corresponding tool.

### Modified Capabilities

- `master-config`: The **Master domain type contract** relocates from `entities/master` to the `shared/model` segment (importable from `@/shared/model`). This was forced by enabling Steiger with **no suppressions**: `shared/config/master-config.ts` consuming a type from the higher `entities` layer is a forbidden upward import; moving the contract into `shared` removes it. (The `MASTER` constant stays in `shared/config`, now also exposed via the `@/shared/config` public API.)

## Impact

- **Config files**: `package.json` (scripts + devDeps), `tsconfig.json` (strict flags), `eslint.config.mjs` (prettier-last + type-checked block + `import/order` + `react-hooks/react-compiler`), new `.prettierrc`, `.prettierignore`, `steiger.config.ts`, and `openspec/config.yaml` (`context` prose).
- **Dependencies** (devDeps, via `dependency-guard`): `prettier`, `eslint-config-prettier`, `steiger`, `@feature-sliced/steiger-plugin`, and `typescript-eslint` (explicit direct devDep — already in the tree via `eslint-config-next`). The `import/order` and `react-hooks/react-compiler` rules add **no** packages — both plugins already ship with `eslint-config-next`.
- **Existing code**: F0–F3 sources may need small fixes to satisfy the new strict flags / type-checked rules; `eslint --fix` re-orders existing imports once, and a whole-repo Prettier pass reformats everything once. **FSD restructure**: `src/entities/master/model/types.ts` → `src/shared/model/master.ts` (+ `index.ts`); new `src/shared/config/index.ts`; `src/shared/config/master-config.ts` import repointed to `@/shared/model`; the `master-config.test.ts` import repointed to `@/shared/config`; `src/entities/` and `src/features/` placeholder dirs removed.
- **No tests**: infrastructure change — verification is "the tools run clean on current code, and a deliberately planted error is caught." No Vitest/Playwright suites added.
- **Downstream**: every feature from F4 on is developed and merged against `npm run check`.

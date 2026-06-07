> **No product tests in this change.** F3.5 is infrastructure (dev-plan §F3.5): there is no TDD red→green cycle. The acceptance proof is task group 9 — the tools pass clean on current code, and a deliberately planted violation is caught by the matching tool.

## 1. Dependencies

- [x] 1.1 Install devDeps via the `dependency-guard` skill: `prettier@3.8.3`, `eslint-config-prettier@10.1.8`, `steiger@0.5.12`, `@feature-sliced/steiger-plugin@0.5.8`, and `typescript-eslint@8.60.1` (explicit direct devDep per design Decision 4; all exact-pinned, no install hooks, typosquat-checked)
- [x] 1.2 Run `npm audit`: 2 moderate — same transitive `postcss`-from-`next` issue F2 already accepted (fix = breaking Next downgrade). The 5 new packages added zero vulns. Accepted.

## 2. Prettier

- [x] 2.1 Add `.prettierrc` (`{ "semi": true, "singleQuote": true }` — semicolons + single quotes, per user preference) and `.prettierignore` (`.next`, `out`, `build`, `next-env.d.ts`, `*.tsbuildinfo`, `node_modules`, `playwright-report`, `test-results`, `coverage`, `package-lock.json`)
- [x] 2.2 Add `"format": "prettier --write ."` and `"format:check": "prettier --check ."` to `package.json` scripts
- [x] 2.3 Wire `eslint-config-prettier` **last** in the `defineConfig([...])` array in `eslint.config.mjs` (via `eslint-config-prettier/flat`, design Decision 2)
- [x] 2.4 Verify: `npx prettier --check .` runs (65 files flagged — expected until the group-8 pass) and `eslint .` loads the config cleanly with no stylistic conflict on a shadcn file

## 3. Strict TypeScript flags

- [x] 3.1 Add `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride` to `compilerOptions` in `tsconfig.json`
- [x] 3.2 Run `npx tsc --noEmit`: **no fallout** — existing F0–F3 code already satisfies all four flags, no fixes needed
- [x] 3.3 Verify: `npx tsc --noEmit` exits 0 (clean)

## 4. ESLint rules (type-checked + best-practice)

- [x] 4.1 Added a type-aware config object (`svoi/type-checked`, `files: **/*.{ts,tsx,mts,cts}`) with `parser: tseslint.parser` + `parserOptions.projectService: true` + `tsconfigRootDir`, enabling `@typescript-eslint/no-floating-promises` and `no-misused-promises`. Scoped to TS files so the `.mjs` configs (outside the TS project) don't error
- [x] 4.2 Enabled `import/order` with FSD-aligned `pathGroups` (react/next → external → `@/shared` → `@/entities` → `@/features` → `@/pages` → relative), `newlines-between: 'always'`, `alphabetize: asc` (rules-only object — `eslint-plugin-import` already registered by Next; no new dep)
- [x] 4.3 **Corrected:** `react-hooks/react-compiler` does not exist in `eslint-plugin-react-hooks@7.1.1` (v7 unbundled it). Spread `reactHooks.configs['recommended-latest'].rules` instead — the granular Rules-of-React / React Compiler set. Rules-only (no plugin re-registration). Artifacts updated to match
- [x] 4.4 Ran `eslint . --fix` (normalized imports in 6 files + eslint.config.mjs), then `eslint .` → clean. `id-length`: **deferred** (noise vs payoff, per design Open Questions)
- [x] 4.5 Verify: `eslint .` exits 0 (clean) — no type-checked, Rules-of-React, or import errors remain

## 5. Steiger (FSD boundaries)

- [x] 5.1 Added `steiger.config.ts` with the `@feature-sliced/steiger-plugin` FSD preset (recommended, untouched)
- [x] 5.2 Added `"lint:fsd": "steiger src"` to `package.json` scripts
- [x] 5.3 Ran `steiger src` → 6 findings, resolved **structurally with NO suppressions** (user directive; design Decision 5a): (a) `forbidden-imports` → moved master types `entities/master` → `shared/model`; (b) `segments-by-purpose` → segment named `model` not `types` (denylist); (c) `public-api` → added `shared/model/index.ts` + `shared/config/index.ts`; (d) `insignificant-slice` ×3 → removed premature empty `src/entities/` + `src/features/` (F5/F6 recreate). Repointed `master-config.ts` → `@/shared/model`, test → `@/shared/config`
- [x] 5.4 Verify: `npm run lint:fsd` → "No problems found!"; `tsc`/`eslint`/16 tests all green. Added `MODIFIED` delta to `master-config` spec for the type relocation

## 6. Aggregating check script

- [x] 6.1 Added `"check": "tsc --noEmit && eslint . && prettier --check . && steiger src"` to `package.json` scripts (order per design Decision 6)
- [x] 6.2 Verify: `npm run check` exits zero on the formatted tree (confirmed after the group-8 format pass — tsc + eslint + prettier + steiger all clean)

## 7. Non-lintable rules in openspec/config.yaml

- [x] 7.1 Added a `Code quality:` block to the `context` of `openspec/config.yaml`: the four non-lintable theses (revealing names, pure functions, DRY-on-third-repeat, one error/`null` convention per module) + a note that mechanical rules are owned by `npm run check` (design Decision 7). Also synced the FSD/architecture notes (shared/model, public-API via index.ts, no upward imports, no empty placeholder layers)
- [x] 7.2 Verified non-duplicative — each thesis is a human judgment (name quality, hidden side effects, abstraction timing, error philosophy) that no ESLint/TS/Prettier/Steiger rule enforces; YAML re-parses and openspec reads it

## 8. Whole-repo format normalization

- [x] 8.1 Ran `npm run format` once over the whole repo — normalized 60+ files (semicolons + single quotes per `.prettierrc`, aligned markdown tables); diff is purely cosmetic (verified on the PRD)
- [x] 8.2 Reformat is staged as its own change; proposed standalone `style:` commit message below (kept separate from the tooling commit; user makes the commit — never run `git commit`)

## 9. Verify the gate & finalize

- [x] 9.1 Confirmed `npm run check` exits 0 (tsc + eslint + prettier + steiger all clean) on the formatted tree; 16 Vitest tests pass
- [x] 9.2 Planted 6 violations, each caught by its tool, then reverted: (a) misformatted → `prettier`; (b) unused local → `tsc` (`noUnusedLocals`); (c) floating promise → `eslint no-floating-promises`; (d) mis-ordered imports → `eslint import/order`; (e) `setState` in render → `eslint react-hooks/set-state-in-render`; (f) cross-slice + deep-path import → `steiger` (`forbidden-imports` + `no-public-api-sidestep`). Tree left clean
- [x] 9.3 Tooling changes staged; proposed `chore:` commit message below (user makes the commit)
- [x] 9.4 Ticked the F3.5 checklist in `docs/svoi-demo-dev-plan.md` + added a "Готово (2026-06-07)" note (tools installed, audit result, the no-suppressions FSD restructure, MODIFIED spec delta)

## Context

After F3 the repo has a small but real codebase (F0–F3: shared/ui, entities/master, shared/config, shared/lib, their Vitest suites) and the default Next ESLint flat config (`next/core-web-vitals` + `next/typescript`). That default catches React/Next pitfalls and basic TS issues but is blind to: formatting, unsafe indexed access, unused symbols, floating/misused promises, and FSD layering violations. F3.5 is pure infrastructure — it adds the machine-checkable quality gate the rest of the demo (F4+) is built against. It introduces four external dev tools and touches several config files, but adds no product code, so it benefits from up-front decisions on tool choice, config ordering, and scope, recorded here.

Constraints: the demo is client-only, TypeScript `strict`, FSD-layered, lives ~2–3 weeks before the demo→product transition. The guiding principle is **highest-ROI minimum now, heavy tooling deferred** (dev-plan §7).

## Goals / Non-Goals

**Goals:**

- One command, `npm run check`, that proves the working tree clean across four dimensions: types (`tsc`), lint (`eslint`), format (`prettier --check`), FSD boundaries (`steiger`).
- Catch the cheap, high-value classes of defect the default config misses: formatting drift, unsafe `arr[i]` access, unused code, floating promises, cross-slice / public-API violations.
- Keep ESLint's Next rules intact; resolve only the _stylistic_ overlap with the formatter.
- Single source of truth for mechanical rules = the tools' configs, not prose. Only **non-lintable** rules live as prose, and only in `openspec/config.yaml`'s `context` block.
- Leave the current F0–F3 code passing `check` cleanly after the change.

**Non-Goals:**

- No duplicate detection / cognitive-complexity (`eslint-plugin-sonarjs`), dead-code/unused-export/dep analysis (`knip`), pre-commit hooks (`lefthook` + `lint-staged`), or CI (GitHub Actions). All deferred to demo→product (dev-plan §7).
- No switch of formatter/linter engine (no Biome).
- No product behavior, no tests — verification is "tools pass on current code; a planted violation is caught."
- No new editor config / `.vscode` settings — out of scope.

## Decisions

### 1. Prettier for formatting, not Biome

Biome would replace both formatter and linter, throwing away the curated `next/*` ESLint rules. Prettier formats; ESLint keeps linting; the only friction is stylistic rules that overlap, killed by `eslint-config-prettier`. Lower blast radius, keeps the Next ruleset we already rely on.

- _Alternative considered_: Biome. Rejected — would re-derive lint coverage from scratch and drop Next-specific rules.

### 2. `eslint-config-prettier` wired **last** in the flat config

It only _disables_ rules; placed last in the `defineConfig([...])` array it overrides any earlier stylistic rule that would conflict with Prettier. Anywhere but last and an earlier `...nextTs`/type-checked block could re-enable a conflicting rule. No Prettier _plugin_ for ESLint (`eslint-plugin-prettier`) — running Prettier through ESLint is slower and noisier; we run `prettier` as its own step in `check`.

### 3. Strict tsconfig subset: the four high-ROI flags only

Add `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride` on top of `strict`. These are pure-win for this codebase: indexed access is genuinely unsafe in TS, and unused-symbol/override checks are noise-free. Deliberately **not** adding `exactOptionalPropertyTypes` or `noPropertyAccessFromIndexSignature` — higher false-positive rate, low payoff at demo scale.

- _Alternative considered_: turn on everything strict-adjacent. Rejected — diminishing returns and churn for a 2–3 week demo.

### 4. Type-checked ESLint via `projectService`, reusing the transitive `typescript-eslint`

Add one type-aware config object using `languageOptions.parserOptions.projectService: true` + `tsconfigRootDir`, enabling `@typescript-eslint/no-floating-promises` and `no-misused-promises` (the two rules that need type info and matter for the upcoming async client-flow / messenger code). `projectService` is the current recommended way to give typed linting (replaces the old explicit `project` array).

- **Resolved (dev-plan open question)**: `typescript-eslint` is **already in the tree** — `eslint-config-next@16.2.6` depends on `typescript-eslint@^8.46.0` (resolved 8.59.4), and all `@typescript-eslint/*` packages are present. We still add `typescript-eslint` as an **explicit direct devDependency**: `eslint.config.mjs` will `import` from it, and a package you import directly should be a direct dep, not a hoisting accident. Cost is zero (same version already resolved).
- `id-length` (against one-letter names) is **optional** and likely deferred — it tends to flag conventional `i`/`x`/`e`; revisit only if it earns its noise.

### 5. Steiger for FSD boundaries, not `eslint-plugin-boundaries`

Steiger is the official Feature-Sliced linter — it understands slices/segments and public-API rules natively. `eslint-plugin-boundaries` would require hand-encoding the FSD layer graph and would drift from the methodology. Steiger ships the FSD preset; `steiger.config.ts` enables it and we run `steiger src` as its own `check` step (it is not an ESLint plugin).

### 5a. Resolve every Steiger finding structurally — **no suppressions** (decided during apply)

The plan originally allowed documented per-file suppressions for early-skeleton noise. During apply the user directed: _do it properly by FSD, no suppressions._ So the running `steiger src` (which reported 6 findings across two passes) is made green by fixing the structure, not by disabling rules. `steiger.config.ts` is just the recommended preset, untouched. The findings and their structural fixes:

- **`fsd/forbidden-imports`** — `shared/config/master-config.ts` imported `MasterConfig` (type-only) from the higher `entities` layer. The plugin has no `ignoreTypeImports` option. Fix: **move the master domain types from `entities/master` into `shared`** (the user's call: "all types belong in shared"). `shared/config` then consumes the contract from its own layer. This _supersedes_ the archived F3 `f3-master-types-config` Decision 1 (which placed the types in `entities/master` and explicitly tolerated the upward type import). Captured as a `MODIFIED` delta on the `master-config` capability.
- **`fsd/segments-by-purpose`** — a segment literally named `types` is on the plugin's `BAD_NAMES` denylist (`components, hooks, helpers, utils, modals, types, constants, consts, const`). Fix: name the segment **`shared/model`** (a purpose-based, canonical FSD segment for data structures), not `shared/types`.
- **`fsd/public-api`** — `shared/config` had no `index.ts`. Fix: add `shared/model/index.ts` and `shared/config/index.ts` public APIs; consumers import `@/shared/model` and `@/shared/config`.
- **`fsd/insignificant-slice`** (×3, `src/entities`, `entities/master`, `src/features`) — premature empty/near-empty placeholder layers. Fix: **remove `src/entities/` and `src/features/`**; F5 (`MasterCard`) and F6 (`ScreenWelcome`) recreate them when they hold real content. (`src/pages/` is not flagged — Steiger exempts the entry-point layer from "no references" — so it stays.)
  Result: `steiger src` → "No problems found", `tsc`/`eslint`/tests all green, zero suppressions.

### 6. `check` order = cheapest/most-fundamental first

`tsc --noEmit && eslint . && prettier --check . && steiger src`. `&&` short-circuits, so a type error stops the run before the slower lint/format/fsd passes — fastest feedback on the most fundamental failure. Individual scripts (`lint`, `format:check`, `lint:fsd`) remain runnable on their own.

### 7. Non-lintable rules live in `openspec/config.yaml` `context`, never in tool-shaped prose

Mechanical rules belong to the tools (they can't rot — they either pass or fail). Only what a machine can't check is written as prose: revealing names without cryptic abbreviations; pure functions without hidden side effects; DRY on the _third_ repeat (not earlier); one consistent convention for errors / `null`. These go in the `context` block so every future OpenSpec change inherits them. We explicitly avoid restating anything ESLint/TS already enforces, so prose and tools never disagree.

### 8. Whole-repo format pass is its own `style:` commit

Running `prettier --write .` once reformats every existing file. Kept as a standalone `style:` commit so the functional tooling commit stays reviewable (config + small strict-flag fixes) and isn't drowned in reformat noise.

### 9. Turn on best-practice rules already bundled by `eslint-config-next` — add no new plugins

Inspecting the resolved config, `eslint-config-next@16.2.6` already ships `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-react-hooks@7.1.1`, and `eslint-plugin-jsx-a11y`, so the Next/React/a11y baseline is covered. Two valuable rules are present-but-off, and we enable them in our own config block (zero new dependencies):

- **`import/order`** — only `import/no-anonymous-default-export` is on by default. We configure `import/order` with **FSD-aligned `pathGroups`** (react/next first → external → `@/shared` → `@/entities` → `@/features` → `@/pages` → relative), `newlines-between: 'always'`, alphabetized. It is autofixable, deterministic, and makes layer dependencies visible at the top of every file. `eslint-config-prettier` does not touch import ordering, so no conflict. (Chosen over a Prettier sort-imports plugin precisely because the plugin is already installed — no new dep.)
- **React Compiler / Rules-of-React guard** — _corrected during apply_: `eslint-plugin-react-hooks@7.1.1` does **not** expose a single `react-compiler` rule (that was the earlier-version shape my plan assumed). v7 unbundled it into ~29 granular rules surfaced via the `recommended-latest` config (`set-state-in-render`, `purity`, `immutability`, `static-components`, `refs`, …). Next enables only the classic `rules-of-hooks` + `exhaustive-deps`. We therefore spread `reactHooks.configs['recommended-latest'].rules` into a rules-only object (no plugin re-registration — Next already registers `react-hooks`; re-declaring throws "Cannot redefine plugin"). Verified clean on current F0–F3 code. Zero new deps.

**Deliberately rejected** (kept out to honor the minimal-for-demo scope — Decision/Non-Goals):

- _Full type-checked recommended_ (`typescript-eslint` `recommendedTypeChecked` / `strictTypeChecked`) → rejected in favor of cherry-picking `no-floating-promises` + `no-misused-promises` (Decision 4). The recommended-type-checked set (`no-unsafe-*`, `no-unnecessary-condition`, …) is noisy on demo code and library `any`; revisit at demo→product.
- _`eslint-plugin-tailwindcss`_ → rejected: built around the JS config / `resolveConfig`, and we are on **Tailwind v4** (CSS-first) where its support is unreliable. The looks-useful-but-doesn't-fit trap.
- _`eslint-plugin-unicorn`_ → rejected: too opinionated/noisy for a 2–3 week demo.
- _`eslint-plugin-sonarjs`_ → already deferred to demo→product (dev-plan §7); not pulled forward.

## Risks / Trade-offs

- **Strict flags surface errors in existing F0–F3 code** → fix them at apply time; scope is small (a handful of files) and the fixes are mechanical (guards for indexed access, dropping unused params). This is the point of the change, not a regression.
- **`noUncheckedIndexedAccess` is the noisiest of the four** → accepted; it catches real `undefined` bugs. If a specific access is provably safe, narrow it at the call site rather than disabling the flag globally.
- **Relying on `typescript-eslint` resolution** → mitigated by adding it as an explicit direct devDep (Decision 4); no dependence on npm hoisting.
- **Steiger flagged the early skeleton** (`forbidden-imports`, `public-api`, `segments-by-purpose`, `insignificant-slice` ×3) → resolved **structurally, no suppressions** per Decision 5a: types moved to `shared/model`, public-API barrels added, empty `entities/`/`features/` layers removed. Trade-off accepted: F3.5 (nominally tooling) now also carries a small FSD refactor and a `MODIFIED` spec delta.
- **Typed linting (`projectService`) is slower than syntactic linting** → acceptable at demo size; it's the only way to get `no-floating-promises`. Revisit if `check` becomes painfully slow.
- **Tooling churn vs. a 2–3 week demo** → bounded by the deferral list (Non-Goals); we install only the four tools whose payoff lands within the demo.

## Migration Plan

1. Install devDeps via `dependency-guard`, run `npm audit`.
2. Add Prettier config + scripts; wire `eslint-config-prettier` last.
3. Add the four strict tsconfig flags; run `tsc --noEmit`; fix fallout.
4. Add the type-checked ESLint block + `import/order` (FSD groups) + `react-hooks/react-compiler`; run `eslint . --fix` to normalize imports, then `eslint .`; fix fallout.
5. Add Steiger config + script; run `steiger src`; triage warnings.
6. Add the `check` script; confirm green on current code.
7. Add non-lintable theses to `openspec/config.yaml` `context`.
8. Separate `style:` commit: `prettier --write .` over the repo.
9. Verify the gate by planting one violation per tool and confirming each is caught.

**Rollback**: revert the config commits and `npm i` — no product code or data is touched, so rollback is clean.

## Open Questions

- `id-length`: enable now or defer? Leaning defer (noise vs. payoff). Decided during apply when we see how it reacts to the existing code.

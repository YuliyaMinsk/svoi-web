## ADDED Requirements

### Requirement: Aggregated quality gate

The project SHALL expose a single `check` npm script that runs, in order, the type check, the lint, the format check, and the FSD boundary check: `tsc --noEmit && eslint . && prettier --check . && steiger src`. The command MUST exit non-zero if any sub-check fails (short-circuiting on the first failure) and exit zero only when all pass. It MUST pass cleanly on the current F0–F3 codebase.

#### Scenario: Clean tree passes the gate

- **WHEN** `npm run check` is run against the unmodified F0–F3 codebase
- **THEN** every sub-check passes and the command exits zero

#### Scenario: Any single failure fails the gate

- **WHEN** a violation that one sub-check detects is present in the tree
- **THEN** `npm run check` exits non-zero, surfacing that tool's error

### Requirement: Consistent code formatting

The project SHALL use Prettier as the single formatter, configured by a committed `.prettierrc` and a `.prettierignore` that excludes build/output dirs (`.next`, `node_modules`, `playwright-report`, `test-results`). It MUST provide a `format` script (`prettier --write .`) and a `format:check` script (`prettier --check .`). `eslint-config-prettier` MUST be wired **last** in `eslint.config.mjs` so stylistic ESLint rules that conflict with Prettier are disabled rather than fighting it.

#### Scenario: Misformatted file is reported

- **WHEN** a tracked source file is saved with formatting that violates the Prettier config and `npm run format:check` is run
- **THEN** the command exits non-zero and names the offending file

#### Scenario: Format write normalizes the file

- **WHEN** `npm run format` is run on that misformatted file
- **THEN** the file is rewritten to the Prettier-conformant form and a subsequent `format:check` passes

#### Scenario: No formatter/linter conflict

- **WHEN** `eslint .` and `prettier --check .` are both run on a Prettier-formatted file
- **THEN** neither reports a stylistic conflict on that file (ESLint does not flag Prettier's chosen formatting)

### Requirement: Strict TypeScript compiler flags

`tsconfig.json` SHALL enable, on top of `strict`, the flags `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, and `noImplicitOverride`. `tsc --noEmit` MUST pass on the current codebase after any required fixes, and MUST report an error when one of these flags is violated.

#### Scenario: Unsafe indexed access is caught

- **WHEN** code reads an array/record element by index and uses it without handling `undefined`, and `tsc --noEmit` is run
- **THEN** the type check fails because `noUncheckedIndexedAccess` widens the element type to include `undefined`

#### Scenario: Unused local is caught

- **WHEN** a local variable or parameter is declared but never used, and `tsc --noEmit` is run
- **THEN** the type check fails under `noUnusedLocals` / `noUnusedParameters`

### Requirement: Type-checked lint rules

`eslint.config.mjs` SHALL include a type-aware configuration block (`languageOptions.parserOptions.projectService: true` with `tsconfigRootDir`) that enables `@typescript-eslint/no-floating-promises` and `@typescript-eslint/no-misused-promises`. `typescript-eslint` MUST be declared as a direct devDependency. ESLint MUST report these as errors when present.

#### Scenario: Floating promise is caught

- **WHEN** a `Promise`-returning call is invoked without `await`, `.then`, `.catch`, or `void`, and `eslint .` is run
- **THEN** ESLint reports a `@typescript-eslint/no-floating-promises` error

#### Scenario: Misused promise is caught

- **WHEN** an `async` function is passed where a `void`-returning callback is expected (e.g. an event handler that should not return a promise), and `eslint .` is run
- **THEN** ESLint reports a `@typescript-eslint/no-misused-promises` error

### Requirement: FSD-aligned import ordering

ESLint SHALL enforce `import/order` configured so import statements are grouped and ordered to mirror the FSD layer hierarchy: framework (`react`, `next`) first, then other external packages, then internal aliases in layer order (`@/shared` → `@/entities` → `@/features` → `@/pages`), then parent/sibling/index relative imports, with a blank line between groups and alphabetical order within a group. The rule MUST be autofixable (`eslint --fix` reorders imports). No new ESLint plugin is added — `eslint-plugin-import` already ships with `eslint-config-next`.

#### Scenario: Mis-ordered imports are reported and auto-fixed

- **WHEN** a file imports an internal `@/entities/...` module before an external package, or omits the blank line between groups, and `eslint .` is run
- **THEN** ESLint reports an `import/order` error, and `eslint --fix` rewrites the imports into the FSD-aligned, blank-line-separated, alphabetized order

### Requirement: React Rules-of-React guard

ESLint SHALL enable the `eslint-plugin-react-hooks` v7 `recommended-latest` rule set, which carries the React Compiler / Rules-of-React static checks (`set-state-in-render`, `purity`, `immutability`, `static-components`, `refs`, …) so code that would break React Compiler optimization under React 19 is flagged. (v7 replaced the single `react-compiler` rule of earlier versions with this granular set.) No new plugin is added — `eslint-plugin-react-hooks` already ships with `eslint-config-next`; only the rules are turned on.

#### Scenario: Rules-of-React violation is caught

- **WHEN** a component calls a `useState` setter (or otherwise mutates state) during render, and `eslint .` is run
- **THEN** ESLint reports a Rules-of-React error from the set (e.g. `react-hooks/set-state-in-render`)

### Requirement: FSD boundary enforcement

The project SHALL use Steiger with the Feature-Sliced preset, configured in a committed `steiger.config.ts`, exposed via a `lint:fsd` script (`steiger src`). It MUST report violations of FSD layering — cross-imports between slices of the same layer and access bypassing a slice's public API. Any intentionally suppressed Steiger rule MUST be documented with a reason in `steiger.config.ts`.

#### Scenario: Cross-slice import is caught

- **WHEN** one slice imports directly from another slice of the same layer (e.g. one feature importing another feature's internals) and `npm run lint:fsd` is run
- **THEN** Steiger reports the boundary violation

#### Scenario: Public-API bypass is caught

- **WHEN** code imports a slice's internal module by deep path instead of through its `index.ts` public API and `npm run lint:fsd` is run
- **THEN** Steiger reports a public-API violation

### Requirement: Non-lintable rules recorded as prose

The non-mechanical code-quality rules that no tool can enforce SHALL be recorded as terse theses in the `context` block of `openspec/config.yaml`: revealing names without cryptic abbreviations, pure functions without hidden side effects, DRY applied on the third repetition (not earlier), and one consistent convention for errors / `null`. These theses MUST NOT restate any rule already enforced by ESLint, TypeScript, Prettier, or Steiger, so that prose and tooling never disagree.

#### Scenario: Theses present and non-duplicative

- **WHEN** `openspec/config.yaml` is read
- **THEN** its `context` block contains the four non-lintable theses, and none of them re-states a rule already enforced by the toolchain

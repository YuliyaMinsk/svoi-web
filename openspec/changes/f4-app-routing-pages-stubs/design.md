## Context

F4 connects the FSD `pages` layer (introduced here) to the Next.js 16 App Router. F3 froze the data contract; F4 proves the plumbing before any real screen is built. The work is intentionally tiny — two one-line router files and two placeholder page slices — but it sets a convention that every later route follows, and it is the first time the FSD boundary linter (Steiger) sees a `pages` slice. The root layout already exists from bootstrap (F0/F2) and meets the F4 requirements, so layout work is verification only.

Source of truth: PRD §4.1–§4.3 (routing principle, file map, re-export snippets) and dev-plan F4. **The router lives in the repo-root `app/` per PRD §4.2** — not in `src/app/` as the F0.1 architecture note suggested. Reason: Next.js 16 hard-codes `src/pages/` as the Pages Router directory whenever routing is inside `src/`; with root-level `app/`, Next.js ignores `src/pages/` as a router, leaving it as a clean FSD layer. A root `pages/` placeholder (with README) occupies the Pages Router slot intentionally. `src/app/styles/` remains in place as the FSD `app`-layer home for global styles.

## Goals / Non-Goals

**Goals:**

- Exactly two static routes, `/` and `/master`, resolving through thin re-exports to the `home` and `master` page slices.
- `src/app/` stays a pure routing layer: route files are default re-exports only, all composition lives in `src/pages/`.
- The new `pages` slices satisfy FSD public-API access and pass `npm run check` (Steiger included) with zero suppressions.
- Record the existing root-layout contract (font/metadata/globals) in the spec.

**Non-Goals:**

- No real screen composition — `HomePage`/`MasterPage` stay placeholder `<div>`s; `<ClientFlow />` lands in F6/F8, `<TelegramChat />` in F14.
- No `MASTER` data, no `MasterCard`, no animations.
- No unit tests for these components (UI/presentation per the testing policy); no Playwright yet (route e2e is deferred to F19).
- No rewrite of `layout.tsx`, no new dependencies, no `next.config.ts` changes.

## Decisions

### 1. Thin re-export with `as default`, importing the slice public API

Router files use the PRD §4.3 form exactly: `export { HomePage as default } from '@/pages/home'`. Next.js requires a **default** export from `page.tsx`; the slice exposes a **named** `HomePage`, so the re-export renames it to `default` at the boundary. The import targets `@/pages/home` (the slice index), never `@/pages/home/ui/HomePage`, keeping FSD public-API access intact.

- _Alternative considered_: `import { HomePage } from '@/pages/home'; export default HomePage` — two statements, same effect; rejected for being longer than the canonical one-liner.
- _Alternative considered_: default-export the component from the slice. Rejected — FSD slices expose **named** exports through their public API; reserving `default` for the router boundary keeps the slice consistent with every other slice in the codebase.

### 2. Slice shape: `index.ts` + `ui/<Component>.tsx`, named export

Each page slice is `src/pages/<slice>/ui/<Component>.tsx` (the component) re-exported by `src/pages/<slice>/index.ts`. This mirrors the F3 entity/shared slices and the PRD file map, and gives Steiger a proper `ui` segment + public API to validate.

### 3. Placeholder bodies, English marker text

Stubs return a single element with identifiable text (a home/Welcome placeholder and a Master placeholder). The text is a developer-facing marker, not product copy, so it stays English and will be entirely replaced in F6/F8/F14. No styling beyond what proves the route renders.

### 4. Layout is verify-only

`src/app/layout.tsx` already loads Manrope (`--font-sans`, latin+cyrillic), imports `@/app/styles/globals.css`, exports `metadata`, and renders `<html lang="ru">`. F4 asserts this against the new spec rather than changing it. If a gap is found, the fix stays minimal.

### 5. No TDD for F4

All artifacts are routing/presentation. Per the project testing policy, UI gets no test-first unit coverage; correctness is checked against the spec's acceptance scenarios by running the app, and route rendering becomes a Playwright regression in F19. The TDD cycle resumes at F7 (`useClientFlow` state machine).

## Risks / Trade-offs

- **Steiger flags the new `pages` slices** (e.g. `insignificant-slice`) → Steiger only scans `src/`; the root `app/` router is outside its scope. After migration, `npm run check` passed with no suppressions — risk resolved.
- **Re-export default/named mismatch** is a classic silent break (blank route or build error) → the acceptance scenarios explicitly check both routes render, and `tsc --noEmit` + `next dev` smoke check catch it.
- **Root `pages/` placeholder** is intentionally empty — it must stay that way (no React pages inside) so it acts only as a Pages Router slot guard and doesn't produce actual routes.

## Open Questions

- None blocking. The only thing to confirm during apply is that Steiger stays green for the first `pages`-layer slices; the plan above handles either outcome.

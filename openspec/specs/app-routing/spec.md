# app-routing Specification

## Purpose

TBD - created by archiving change f4-app-routing-pages-stubs. Update Purpose after archive.

## Requirements

### Requirement: Static route map

The Next.js App Router SHALL expose exactly two static routes for the demo — `/` (home) and `/master` (the master-side mockup) — defined under the root `app/` directory (not `src/app/`). No dynamic segments, route groups, or additional routes are introduced in this change.

#### Scenario: Home route resolves

- **WHEN** a visitor navigates to `/`
- **THEN** the page produced by the `home` page slice renders, served under the root layout

#### Scenario: Master route resolves

- **WHEN** a visitor navigates to `/master`
- **THEN** the page produced by the `master` page slice renders, served under the root layout

#### Scenario: Routes are static

- **WHEN** the routes are built
- **THEN** neither route declares params or `searchParams` (no `await params` is needed), matching the demo's static, client-only model

### Requirement: Router files are thin re-exports

Every route file in `src/app/` SHALL contain only a default re-export of the matching FSD page slice's public API — no JSX, data access, or business logic. This keeps `src/app/` a pure routing layer and forces all composition into `src/pages/`.

#### Scenario: Home route re-exports the home slice

- **WHEN** `app/page.tsx` is inspected
- **THEN** its entire content is `export { HomePage as default } from '@/pages/home'` (import via the public API, not a deep `ui/` path)

#### Scenario: Master route re-exports the master slice

- **WHEN** `app/master/page.tsx` is inspected
- **THEN** its entire content is `export { MasterPage as default } from '@/pages/master'`

#### Scenario: No starter content remains

- **WHEN** `app/page.tsx` is inspected after this change
- **THEN** none of the create-next-app starter markup (Next.js/Vercel logos, "edit the page.tsx file") remains

### Requirement: FSD pages layer slices expose a public API

The `home` and `master` slices in `src/pages/` SHALL each expose their page component through a slice public API (`index.ts`) re-exporting from `ui/`. Consumers (the router files) MUST import via `@/pages/<slice>` and never reach into `ui/` directly. Each slice MUST hold real content so it is not flagged as an empty/insignificant slice by the FSD boundary linter.

#### Scenario: Home slice public API

- **WHEN** a module imports `HomePage` from `@/pages/home`
- **THEN** the import type-checks and resolves to `src/pages/home/ui/HomePage.tsx` via `src/pages/home/index.ts`

#### Scenario: Master slice public API

- **WHEN** a module imports `MasterPage` from `@/pages/master`
- **THEN** the import type-checks and resolves to `src/pages/master/ui/MasterPage.tsx` via `src/pages/master/index.ts`

#### Scenario: Stub pages render a placeholder

- **WHEN** `HomePage` or `MasterPage` is rendered in this change
- **THEN** each returns a single placeholder element with identifiable text (e.g. a Welcome/home placeholder and a Master placeholder), with no `MASTER` data or feature composition wired in yet

#### Scenario: FSD boundaries stay green

- **WHEN** `npm run check` runs (including Steiger over `src`)
- **THEN** it passes with no FSD violations and no suppressions for the new `pages` slices

### Requirement: Root layout provides font, styles, and metadata

The root layout at `app/layout.tsx` SHALL wrap every route with the document shell: it loads the Manrope font via `next/font` exposed as the `--font-sans` CSS variable (latin + cyrillic subsets), imports the global stylesheet `@/app/styles/globals.css` (FSD app-layer styles at `src/app/styles/`), sets document `metadata` (title and description), and renders `<html lang="ru">` with a `<body>` containing `children`.

#### Scenario: Font variable is applied

- **WHEN** any route renders under the layout
- **THEN** the `<html>` element carries the Manrope `--font-sans` variable class so Cyrillic and Latin copy use Manrope

#### Scenario: Global styles are loaded

- **WHEN** the layout module is evaluated
- **THEN** it imports `@/app/styles/globals.css` exactly once for the whole app

#### Scenario: Metadata is exported

- **WHEN** the route metadata is resolved
- **THEN** a non-empty `title` and `description` are present and the document language is Russian (`<html lang="ru">`)

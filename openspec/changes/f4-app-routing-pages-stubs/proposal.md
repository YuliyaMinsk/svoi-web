## Why

Feature **F4** is the first wiring of the FSD `pages` layer to the Next.js App Router. Before any survey UI (F5–F13) or the Telegram mockup (F14–F18) is built, we want to prove the routing contract works end-to-end: the two demo routes `/` and `/master` must resolve through thin re-exports to FSD page slices, with the root layout (font, metadata, global styles) in place. Catching a broken re-export or a Steiger/FSD boundary problem now — while the pages are one-line stubs — is far cheaper than discovering it after screens are written on top.

## What Changes

- Add the FSD `pages` layer with two slices, each exposing a public API:
  - `src/pages/home/` — `HomePage` stub (`ui/HomePage.tsx` + `index.ts`).
  - `src/pages/master/` — `MasterPage` stub (`ui/MasterPage.tsx` + `index.ts`).
- Wire both Next.js routes as thin re-exports (no logic in the router files):
  - `src/app/page.tsx` → `export { HomePage as default } from '@/pages/home'` (route `/`).
  - `src/app/master/page.tsx` → `export { MasterPage as default } from '@/pages/master'` (new route `/master`).
- Record the already-implemented root layout contract (`src/app/layout.tsx`: Manrope via `next/font`, `@/app/styles/globals.css`, `metadata`, the `<html lang="ru">`/`<body>` wrapper) as part of the routing capability so the spec is a faithful record. No layout rewrite is expected — F4 verifies it satisfies the contract.
- Page bodies are deliberately placeholders (a single labelled `<div>`); real composition (`HomePage` → `<ClientFlow />`, `MasterPage` → `<TelegramChat />`) arrives in F6/F8 and F14.

No business logic, no `MASTER` data wired into screens, no new dependencies.

## Capabilities

### New Capabilities

- `app-routing`: The Next.js App Router exposes exactly two static routes — `/` and `/master` — as thin, logic-free re-exports of the `home` and `master` FSD page slices, under a root layout that loads the Manrope font, global styles, and document metadata. Establishes the FSD↔Next.js wiring convention (router files default-export only; composition lives in `src/pages/`).

### Modified Capabilities

<!-- None — F4 adds routing/page composition on top of the F3 data contract without changing any existing requirement. -->

## Impact

- **New code**: `src/pages/home/{ui/HomePage.tsx,index.ts}`, `src/pages/master/{ui/MasterPage.tsx,index.ts}`, `src/app/master/page.tsx`.
- **Modified code**: `src/app/page.tsx` (replace the create-next-app starter content with the `@/pages/home` re-export).
- **Already present**: `src/app/layout.tsx` (font/metadata/globals) — verified, not rewritten.
- **Dependencies**: none added.
- **Tooling/FSD**: introduces the first `pages`-layer slices; the change must stay green under `npm run check` (notably Steiger's FSD boundary rules) with no suppressions.
- **Downstream**: unblocks F5 (`MasterCard` preview on a real page), F6/F8 (`ScreenWelcome`/`ClientFlow` mount in `HomePage`), F14 (`TelegramChat` mounts in `MasterPage`), and the F19 Playwright happy-path e2e (`/master` rendering, `/` welcome).

> No TDD phase: F4 is routing/presentation only. Per the project testing policy, UI gets no test-first unit coverage — correctness is verified against the spec's acceptance scenarios by running the app (route e2e is deferred to F19). Tasks are ordered so the slices exist before the routes that import them.

## 0. Router migration (deviation from F0.1 — PRD §4.2 restored)

- [x] 0.1 Move router files from `src/app/` to root `app/` (`git mv` for tracked files): `app/layout.tsx`, `app/page.tsx`, `app/master/page.tsx`, `app/favicon.ico`. Keep `src/app/styles/` in place (FSD app-layer).
- [x] 0.2 Create root `pages/README.md` placeholder — occupies the Pages Router slot so Next.js ignores `src/pages/` as a router (per `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/src-folder.md`).

## 1. Preconditions — verify the root layout

- [x] 1.1 Confirm `app/layout.tsx` already satisfies the `app-routing` layout requirement: Manrope via `next/font` as `--font-sans` (latin + cyrillic), imports `@/app/styles/globals.css`, exports non-empty `metadata` (title + description), renders `<html lang="ru">` with `<body>{children}</body>`. Make a minimal fix only if a gap is found.

## 2. home page slice

- [x] 2.1 Create `src/pages/home/ui/HomePage.tsx` — named export `HomePage`, returning a single placeholder element with identifiable text (home/Welcome marker). No `MASTER` data, no feature composition.
- [x] 2.2 Create `src/pages/home/index.ts` — public API: `export { HomePage } from './ui/HomePage'`.

## 3. master page slice

- [x] 3.1 Create `src/pages/master/ui/MasterPage.tsx` — named export `MasterPage`, returning a single placeholder element with identifiable text (Master marker).
- [x] 3.2 Create `src/pages/master/index.ts` — public API: `export { MasterPage } from './ui/MasterPage'`.

## 4. Wire the Next.js routes (thin re-exports)

- [x] 4.1 Replace the create-next-app starter content in `app/page.tsx` with exactly `export { HomePage as default } from '@/pages/home'` (no other markup remains).
- [x] 4.2 Create `app/master/page.tsx` with exactly `export { MasterPage as default } from '@/pages/master'` (creates the `/master` route).

## 5. Verify & gate

- [x] 5.1 `npx tsc --noEmit` — clean (re-export default/named wiring type-checks).
- [x] 5.2 `npm run check` — green with no suppressions; Steiger scans `src/` only (root `app/` is outside scope — clean by design).
- [x] 5.3 Run the app (`npm run dev`) and confirm acceptance: `/` shows the Welcome/home placeholder and `/master` shows the Master placeholder, both under the Manrope layout, with no console/runtime errors.

## 6. Wrap up

- [x] 6.1 Tick the F4 checklist items in `docs/svoi-demo-dev-plan.md` (with the ✅ date) and add a short "Готово" note recording any deviation (routing in root `app/` per PRD §4.2; root `pages/` placeholder added).
- [x] 6.2 Stage changes and propose a `feat:` commit message for F4 (user makes the commit — never run `git commit`).

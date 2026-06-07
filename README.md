# Svoi

A demand-validation tool for micro-businesses. A master tests client
interest in a new service through soft pre-booking — before investing in
training and materials.

Starting segment: beauty masters in Kazakhstan.

## Status

Demo (concierge MVP approach). The goal is to show the mechanics to 3–5
familiar masters and gather feedback before full product development.

## Stack

- Next.js 16 (App Router) + TypeScript
- shadcn/ui + Tailwind CSS v4
- framer-motion
- FSD (feature-sliced design) architecture
- Vitest + React Testing Library + Playwright
- OpenSpec for spec-driven development

## Documentation

- [PRD](./docs/svoi-demo-prd.md) — product description of the demo
- [Development plan](./docs/svoi-demo-dev-plan.md) — breakdown into features F0–F19
- [Library guides](./docs/guides/) — project-specific digests for our stack
- [OpenSpec changes](./openspec/changes/) — spec-driven change proposals & decisions

## Getting started

```bash
npm install
npm run dev
```

Opens at http://localhost:3000

- `/` — client survey
- `/master` — master-side mockup

## Testing

Unit/component tests run on Vitest (jsdom); end-to-end tests run on Playwright.

```bash
# Unit & component tests (Vitest)
npm run test:run     # run once and exit (CI-style)
npm test             # watch mode
npm run test:ui      # Vitest browser UI

# End-to-end tests (Playwright)
npm run test:e2e     # run all e2e specs
npm run test:e2e:ui  # Playwright UI mode
```

Run everything in one go:

```bash
npm run test:run && npm run test:e2e
```

Useful filters:

```bash
npm run test:run -- tests/shared/lib/deeplinks.test.ts   # a single file
npm run test:run -- -t "getWhatsAppLink"                 # by test name
```

Notes:

- Vitest config lives in [vitest.config.ts](./vitest.config.ts); specs are under
  `tests/**/*.test.{ts,tsx}`. The `tests/e2e/**` folder is excluded from Vitest.
- Playwright specs live in `tests/e2e/**/*.spec.ts`. The Playwright config starts
  the dev server automatically, so you don't need a separate `npm run dev`.
- Type-check and lint separately with `npx tsc --noEmit` and `npm run lint`.

## Context

The project is developed as part of the rsschool SaaS-development course
(an alternative idea instead of the reference project). The architecture
is chosen with an eye toward evolving the demo into a production product.

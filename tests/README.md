# Tests

Tests live in a separate `tests/` directory mirroring the `src/` structure. This is a project convention - we keep test files outside `src/` for cleaner production builds and easier test exclusion.

## Structure

​```
tests/
├── setup.ts                # Vitest setup (jest-dom matchers)
├── shared/                 # Tests for src/shared/
│   ├── ui/
│   └── lib/
├── entities/               # Tests for src/entities/
├── features/               # Tests for src/features/
├── pages/                  # Tests for src/pages/
└── e2e/                    # Playwright end-to-end tests
​```

## Conventions

- Unit/integration tests: `*.test.ts` or `*.test.tsx`, runs in Vitest with jsdom
- E2E tests: `*.spec.ts` in `tests/e2e/`, runs in Playwright with real browser
- Mirror src/ structure: test for `src/features/client-flow/ui/ScreenWelcome.tsx` lives in `tests/features/client-flow/ScreenWelcome.test.tsx`
- Test behavior, not implementation: use Testing Library queries by role/label, avoid testing internal state

## Commands

​```bash
npm run test          # Vitest watch mode
npm run test:run      # Vitest single run (for CI/quick check)
npm run test:ui       # Vitest UI for debugging
npm run test:e2e      # Playwright e2e tests
npm run test:e2e:ui   # Playwright UI mode
​```

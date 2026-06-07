## Why

Feature **F3** lays the data foundation for the whole demo: every later screen (client survey F4–F13, Telegram mockup F14–F18) reads the master's profile, service, and contacts, and the Contact screen opens real messenger deep-links. Fixing this contract early — types, the `MASTER` constant, and the pure helpers — lets all downstream features import a stable public API instead of re-inventing shapes. It is the first feature in the full TDD cycle because its logic (URL builders, data contract, env-gated logging) is pure, cheap to test, and outlives any UI churn.

## What Changes

- Add the master domain type contract in `src/entities/master/model/types.ts`: `Step`, `MasterConfig`, `ServiceConfig`, `ContactsConfig`, `BotMessage` (per PRD §5).
- Expose the entity public API via `src/entities/master/index.ts` (re-export of the types).
- Add the singleton `MASTER` configuration constant in `src/shared/config/master-config.ts` (Алина / японский маникюр / 7000 ₸ demo data per PRD §5).
- Add three pure messenger deep-link builders in `src/shared/lib/deeplinks.ts`: `getTelegramLink`, `getWhatsAppLink`, `getInstagramLink`.
- Add a `devLog` utility in `src/shared/lib/dev-log.ts` that proxies `console.log` only outside production.
- Place a placeholder master photo at `public/master-photo.png` (referenced by `MASTER.photoUrl`).
- Add Vitest unit suites (written test-first) for deep-links, the `MASTER` contract, and `devLog`.

No UI, no routing, no behavior wired into screens — pure contract + helpers only.

## Capabilities

### New Capabilities
- `master-config`: The master entity data model (TS types) and the singleton `MASTER` configuration object that downstream features consume, exposed via the entity public API.
- `messenger-deeplinks`: Pure functions that build Telegram / WhatsApp / Instagram deep-link URLs from contact handles, normalizing `@`-prefixes, phone formatting, and URL-encoding optional prefilled text.
- `dev-logging`: A `devLog` helper that forwards to `console.log` only in non-production environments, giving the demo debug output without leaking logs to a production build.

### Modified Capabilities
<!-- None — openspec/specs/ is empty; F3 is the first spec-driven feature. -->

## Impact

- **New code**: `src/entities/master/{model/types.ts,index.ts}`, `src/shared/config/master-config.ts`, `src/shared/lib/{deeplinks.ts,dev-log.ts}`, `public/master-photo.png`.
- **New tests**: `tests/shared/lib/deeplinks.test.ts`, `tests/shared/config/master-config.test.ts`, `tests/shared/lib/dev-log.test.ts`.
- **Dependencies**: none added (uses Vitest `vi.stubEnv` already installed).
- **Downstream**: unblocks F4 (routing/pages), F5 (`MasterCard`), F7 (`Step` for the state machine), F11 (deep-links on Contact), F15 (`BotMessage`).

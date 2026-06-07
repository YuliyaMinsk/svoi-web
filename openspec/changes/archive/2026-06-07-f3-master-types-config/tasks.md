## 1. RED — write failing unit tests first

- [x] 1.1 Add `tests/shared/lib/deeplinks.test.ts` covering every scenario in `specs/messenger-deeplinks` (telegram `@`-strip, whatsapp digit-strip + no-text, whatsapp `encodeURIComponent` of `'Привет! Хочу записаться 💛'`, empty-text = no query, instagram `@`-strip)
- [x] 1.2 Add `tests/shared/config/master-config.test.ts` (create `tests/shared/config/`) covering `specs/master-config` MASTER scenarios: all required strings truthy, `price > 0`, `currency ∈ {KZT,PLN,USD}`, `photoUrl === '/master-photo.png'`
- [x] 1.3 Add `tests/shared/lib/dev-log.test.ts` covering `specs/dev-logging`: spy `console.log`, use `vi.stubEnv('NODE_ENV', …)` + `vi.unstubAllEnvs()` in cleanup — logs in `development`, logs in `test`, silent in `production`, forwards all args in order
- [x] 1.4 Run `npm run test:run` and confirm all three suites fail RED (modules not yet present), with no unrelated failures

## 2. GREEN — master entity type contract

- [x] 2.1 Create `src/entities/master/model/types.ts` with `Step`, `MasterConfig`, `ServiceConfig`, `ContactsConfig`, `BotMessage` exactly per PRD §5 / `specs/master-config`
- [x] 2.2 Create `src/entities/master/index.ts` re-exporting the five types as the slice public API (`export type { … } from './model/types'`)

## 3. GREEN — config constant, helpers, asset

- [x] 3.1 Create `src/shared/config/master-config.ts` with `MASTER: MasterConfig` (Алина / Алматы / Японский маникюр / 7000 ₸ / KZT, contacts per PRD §5), importing `MasterConfig` from `@/entities/master`
- [x] 3.2 Create `src/shared/lib/deeplinks.ts` with pure `getTelegramLink`, `getWhatsAppLink`, `getInstagramLink` per `specs/messenger-deeplinks` (no `MASTER` access inside)
- [x] 3.3 Create `src/shared/lib/dev-log.ts` with `devLog(...args: unknown[])` reading `process.env.NODE_ENV` at call-time, gated on `!== 'production'` (design Decision 3)
- [x] 3.4 Add placeholder image at `public/master-photo.png` (stock or AI-generated) so `MASTER.photoUrl` resolves
- [x] 3.5 Run `npm run test:run` — all three suites GREEN; run `npx tsc --noEmit` — clean (confirms `Step`/`currency`/`BotMessage` union constraints)

## 4. REFACTOR & verify

- [x] 4.1 Refactor implementation for clarity while keeping tests green (dedupe `@`/handle normalization if it reads cleanly; keep functions pure)
- [x] 4.2 Final gate: `npm run test:run` green, `npx tsc --noEmit` clean, `npm run lint` clean; sanity-check `import { MASTER } from '@/shared/config/master-config'` type-resolves in an editor/scratch file
- [x] 4.3 Stage changes and propose a `feat:` commit message for F3 (user makes the commit — never run `git commit`)

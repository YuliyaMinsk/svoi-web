## Context

F3 is the first spec-driven, test-first feature (F0–F2 were bootstrap). It freezes the data contract that every later feature reads: client survey (F4–F13) and the Telegram mockup (F14–F18). Source of truth is PRD §5 (types + `MASTER` + deeplinks). The demo is client-only (no backend), TypeScript strict, FSD layering. No runtime behavior is wired into UI here — this is pure types, one config constant, and three small pure/utility modules, plus their Vitest suites.

The only non-trivial technical question is how `devLog` reads the environment so a Vitest `vi.stubEnv('NODE_ENV', …)` can flip its behavior at runtime.

## Goals / Non-Goals

**Goals:**
- A single, stable, strict-typed contract (`Step`, `MasterConfig`, `ServiceConfig`, `ContactsConfig`, `BotMessage`) exposed via the `entities/master` public API.
- One demo `MASTER` instance in `shared/config`, importable from anywhere without coupling features to each other.
- Three pure, side-effect-free deep-link builders that the F11 Contact screen will call.
- A `devLog` that is loud in dev/test and silent in production.
- Test-first coverage for deeplinks, the `MASTER` contract, and `devLog`.

**Non-Goals:**
- No `window.open` / clipboard / navigation side effects (those live in F11).
- No `MasterCard` or any UI (F5+).
- No multi-master support, no i18n, no data fetching — `MASTER` stays hardcoded (per PRD §11 it becomes an API later).
- No barrel/public-API for `shared/lib` modules — they are imported by direct path.

## Decisions

### 1. Types in `entities/master`, the `MASTER` instance in `shared/config`
The type contract is a domain concept → it belongs to the `master` entity (`model/types.ts`, re-exported by `index.ts`). The concrete demo instance is app-level data, not domain logic, and is read by multiple features → it lives in `shared/config/master-config.ts`, which any layer may import without violating FSD (features importing each other's config would be a cross-import; `shared` is the allowed common ground). `master-config.ts` imports `MasterConfig` from `@/entities/master` (entity → consumed by shared config; allowed, shared sits below entities for *types*).
- *Alternative considered*: put `MASTER` inside the entity. Rejected — keeps the entity a reusable pure contract for the future multi-master product, and matches the plan/PRD file map.

### 2. Deep-links are standalone pure functions, not a class or hook
`getTelegramLink`, `getWhatsAppLink`, `getInstagramLink` take primitive handle/phone args and return a string. No `MASTER` import inside them (caller passes `MASTER.contacts.*`) → trivially unit-testable and reusable. Normalization rules from PRD §5: strip a leading `@`, strip non-digits from phone, `encodeURIComponent` the optional WhatsApp prefilled text.
- *Alternative considered*: functions that read `MASTER` directly. Rejected — hidden coupling, harder to test edge cases.

### 3. `devLog` reads `process.env.NODE_ENV` at call-time, gated on `!== 'production'`
The predicate is `process.env.NODE_ENV !== 'production'` so it logs in both `development` and `test`, and is silent only in a production build. **Critically, the env is read inside the function body on each call** (not captured in a module-level constant), so `vi.stubEnv('NODE_ENV', 'production')` between tests actually changes behavior. Signature mirrors `console.log`: `devLog(...args: unknown[]): void`.
- *Alternative considered*: gate on `=== 'development'`. Rejected — would make `devLog` silent under Vitest (`NODE_ENV==='test'`), so the "logs when not production" test would need an extra stub; `!== 'production'` is the simpler, intent-matching rule and the test still stubs `'production'` to assert silence.
- *Alternative considered*: capturing `const isDev = …` at module load. Rejected — `vi.stubEnv` could not flip it; the contract test relies on runtime evaluation.

### 4. Photo placeholder served from `public/`, not `shared/assets`
PRD §4.2's file map shows `shared/assets/master-photo.png`, but `MASTER.photoUrl` is `'/master-photo.png'` — an absolute URL that Next.js serves from `public/`. We follow the F3 checklist: drop the placeholder at `public/master-photo.png`. `shared/assets` would require an import + bundler handling, unnecessary for a statically served demo image.

### 5. `currency` stays the full `'KZT' | 'PLN' | 'USD'` union
Kept verbatim from PRD §5 even though the demo only uses `KZT` — costs nothing, signals the future KZ/PL/US markets, and the `MASTER` contract test only asserts the value is one of the union.

## Risks / Trade-offs

- **`process.env.NODE_ENV` inlined by Next at build** → in a real Next bundle webpack statically replaces it, but in Vitest the code runs in node/jsdom where `process.env` is a live object, so `vi.stubEnv` works. Mitigation: the call-time read (Decision 3) is exactly what makes both environments behave correctly; no `DefinePlugin` surprises because tests never go through the Next bundler.
- **Hardcoded `MASTER` will be replaced by an API** (PRD §11) → accepted; the type contract is the durable part and is designed to survive that swap.
- **WhatsApp `wa.me` text encoding edge cases** (emoji, spaces, `&`) → covered by an explicit `encodeURIComponent` scenario in the spec so the test pins the behavior.

## Open Questions

- None. Contract, env-predicate, and photo location are all resolved above.

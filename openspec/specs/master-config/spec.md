# master-config Specification

## Purpose

TBD - created by archiving change f3-master-types-config. Update Purpose after archive.

## Requirements

### Requirement: Master domain type contract

The `shared/model` segment SHALL define the demo's data contract and expose it through its public API (`index.ts`): `Step`, `MasterConfig`, `ServiceConfig`, `ContactsConfig`, and `BotMessage`, matching PRD §5. Under TypeScript strict mode these types MUST be importable from `@/shared/model` and MUST constrain consumers as specified.

(Relocated from `entities/master` during F3.5 to satisfy FSD boundary linting with no suppressions: the lower `shared` layer must not import _from_ a higher layer, so the data contract consumed by `shared/config` lives in `shared`. The segment is named `model` — a purpose-based name — because `fsd/segments-by-purpose` forbids a `types` segment.)

#### Scenario: Types are reachable via the shared model public API

- **WHEN** a module imports `MasterConfig`, `ServiceConfig`, `ContactsConfig`, `Step`, or `BotMessage` from `@/shared/model`
- **THEN** the import type-checks (no use of deep paths into the segment) and `tsc --noEmit` passes

#### Scenario: Step enumerates the six survey steps

- **WHEN** a value is assigned to a `Step`
- **THEN** only `'welcome'`, `'notify'`, `'priority'`, `'contact'`, `'closure'`, and `'closureEarly'` are accepted, and any other string is a compile error

#### Scenario: BotMessage shape matches PRD §5

- **WHEN** a `BotMessage` is constructed
- **THEN** it requires `id: string`, `text: string`, `timestamp: string`, `delayMs: number`, and `type` constrained to `'system' | 'response' | 'recommendation'`

#### Scenario: ServiceConfig currency is a closed union

- **WHEN** a value is assigned to `ServiceConfig.currency`
- **THEN** only `'KZT'`, `'PLN'`, or `'USD'` is accepted

### Requirement: MASTER demo configuration

The system SHALL provide a `MASTER: MasterConfig` constant in `shared/config/master-config.ts` populated with the demo data from PRD §5 (Алина / Алматы / Японский маникюр). Every required field MUST be present and valid so downstream screens can render without guards.

#### Scenario: All required string fields are non-empty

- **WHEN** the test inspects `MASTER`
- **THEN** `name`, `photoUrl`, `city`, `service.name`, `service.description`, `contacts.telegram`, `contacts.whatsapp`, and `contacts.instagram` are each truthy, non-empty strings

#### Scenario: Service price is a positive number

- **WHEN** the test inspects `MASTER.service.price`
- **THEN** it is a number greater than 0

#### Scenario: Service currency is within the union

- **WHEN** the test inspects `MASTER.service.currency`
- **THEN** it is one of `'KZT'`, `'PLN'`, `'USD'`

#### Scenario: photoUrl references the served placeholder

- **WHEN** the test inspects `MASTER.photoUrl`
- **THEN** it equals `'/master-photo.png'`, resolving to the image served from `public/`

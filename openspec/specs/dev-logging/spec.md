# dev-logging Specification

## Purpose

TBD - created by archiving change f3-master-types-config. Update Purpose after archive.

## Requirements

### Requirement: Environment-gated debug logging

The system SHALL provide `devLog(...args: unknown[]): void` in `shared/lib/dev-log.ts` that forwards its arguments to `console.log` only when not running in production. It MUST read `process.env.NODE_ENV` at call-time (not capture it at module load) so the gate reflects the current environment. The predicate MUST be `process.env.NODE_ENV !== 'production'`.

#### Scenario: Logs in development

- **WHEN** `NODE_ENV` is `'development'` and `devLog('hello')` is called
- **THEN** `console.log` is called once with `'hello'`

#### Scenario: Logs in test environment

- **WHEN** `NODE_ENV` is `'test'` and `devLog('hello')` is called
- **THEN** `console.log` is called once with `'hello'`

#### Scenario: Silent in production

- **WHEN** `NODE_ENV` is `'production'` and `devLog('hello')` is called
- **THEN** `console.log` is not called

#### Scenario: Forwards all arguments unchanged

- **WHEN** `NODE_ENV` is not `'production'` and `devLog('a', 1, { b: 2 })` is called
- **THEN** `console.log` receives exactly `'a'`, `1`, `{ b: 2 }` in that order

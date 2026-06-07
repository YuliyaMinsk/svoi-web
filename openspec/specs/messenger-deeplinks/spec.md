# messenger-deeplinks Specification

## Purpose

TBD - created by archiving change f3-master-types-config. Update Purpose after archive.

## Requirements

### Requirement: Telegram deep-link builder

The system SHALL provide `getTelegramLink(username: string): string` that returns a `https://t.me/<handle>` URL, stripping a single leading `@` from the username. The function MUST be pure (no side effects, no `MASTER` access).

#### Scenario: Username with leading @

- **WHEN** `getTelegramLink('@svoi_demo_bot')` is called
- **THEN** it returns `'https://t.me/svoi_demo_bot'`

#### Scenario: Username without leading @

- **WHEN** `getTelegramLink('svoi_demo_bot')` is called
- **THEN** it returns `'https://t.me/svoi_demo_bot'`

### Requirement: WhatsApp deep-link builder

The system SHALL provide `getWhatsAppLink(phone: string, text?: string): string` that returns a `https://wa.me/<digits>` URL. It MUST strip every non-digit character from `phone`, and when `text` is provided it MUST append `?text=` with the value URL-encoded via `encodeURIComponent`. When `text` is omitted no query string is appended. The function MUST be pure.

#### Scenario: Phone normalized to digits only, no text

- **WHEN** `getWhatsAppLink('+7 (707) 123-45-67')` is called
- **THEN** it returns `'https://wa.me/77071234567'` with no query string

#### Scenario: Prefilled text is URL-encoded

- **WHEN** `getWhatsAppLink('+77071234567', 'Привет! Хочу записаться 💛')` is called
- **THEN** it returns `'https://wa.me/77071234567?text='` followed by the `encodeURIComponent` encoding of `'Привет! Хочу записаться 💛'` (spaces, Cyrillic, and emoji percent-encoded)

#### Scenario: Empty text is treated as no text

- **WHEN** `getWhatsAppLink('+77071234567', '')` is called
- **THEN** it returns `'https://wa.me/77071234567'` with no `?text=` query string

### Requirement: Instagram deep-link builder

The system SHALL provide `getInstagramLink(username: string): string` that returns a `https://instagram.com/<handle>` URL, stripping a single leading `@` from the username. The function MUST be pure.

#### Scenario: Username with leading @

- **WHEN** `getInstagramLink('@svoi_demo')` is called
- **THEN** it returns `'https://instagram.com/svoi_demo'`

#### Scenario: Username without leading @

- **WHEN** `getInstagramLink('svoi_demo')` is called
- **THEN** it returns `'https://instagram.com/svoi_demo'`

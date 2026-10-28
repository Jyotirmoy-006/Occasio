# ADR 003: Local-First Storage Architecture with Schema Versioning

## Status
Accepted

## Context
Event planning involves sensitive personal schedules, family preferences, guest demographics, and private quotes. Conventional cloud-hosted database architectures require user authentication, session cookies, database migrations, backend storage quotas, and complex data privacy disclosures (GDPR/CCPA compliance).

## Decision
Occasio implements a local-first storage architecture utilizing browser `localStorage` as the primary persistence layer. No user account creation or login is required. All persisted records carry a `schemaVersion` integer. Upon reading from storage, records pass through sequential version migration functions before final Zod validation. Complete backup and restore are supported through encrypted or plaintext JSON import/export with file size caps (512 KB max).

## Consequences
- **Positive**: 100% user privacy: zero PII or event details stored on remote servers.
- **Positive**: Instantaneous zero-latency read/write operations without network round-trips.
- **Positive**: Offline functionality: existing plans can be reviewed, edited, and printed without an internet connection.
- **Positive**: Schema versioning guarantees backwards compatibility as domain models evolve.
- **Tradeoff**: Multi-device synchronization requires manual JSON export/import. Acceptable for single-planner use cases and aligns with the hackathon threat model.

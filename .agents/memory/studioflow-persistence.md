---
name: StudioFlow persistence design
description: Durable database design choices for StudioFlow's current API contract and seeded workspace behavior.
---

StudioFlow currently persists each project as one scalar row with nested workspace collections in JSONB, keeps proposal data in a one-to-one related row, and stores job-proposal drafts separately.

**Why:** The API already exposes complete project-detail snapshots, so this avoids unnecessary joins while preserving response shapes and makes all workspace mutations atomic at the project level.

**How to apply:** Keep project writes as an insert-or-update upsert and seed demo projects only when the project table is empty; this supports both fresh databases and newly generated projects without foreign-key ordering failures.
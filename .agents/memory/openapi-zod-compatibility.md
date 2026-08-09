---
name: OpenAPI integer compatibility
description: A workspace-specific compatibility constraint between OpenAPI integer schemas and the installed Zod generator.
---

When defining numeric fields in the OpenAPI contract, prefer `type: number` over `type: integer` unless the generated Zod package is confirmed to support `z.int()`.

**Why:** The current codegen path emits `z.int()` for OpenAPI integers, while the installed Zod version exposes numeric validation without that method. This makes codegen appear successful but fails the shared library typecheck afterward.

**How to apply:** If an integer is semantically important, validate/coerce it at the application boundary or upgrade the generator/runtime as a deliberate workspace-wide change; do not leave generated `z.int()` calls in the current setup.
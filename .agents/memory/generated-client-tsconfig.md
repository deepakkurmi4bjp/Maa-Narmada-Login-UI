---
name: Generated API client typing
description: TypeScript configuration needed by the generated fetch client
---

Generated API client code may call `Headers.entries()`, so the consuming client library must include the `dom.iterable` TypeScript lib alongside `dom`.

**Why:** The generated client can compile in isolation but fail the workspace typecheck when iterable DOM declarations are not enabled.

**How to apply:** If API codegen introduces `Headers.entries()` typing errors, check the client package's `compilerOptions.lib` before changing generated files.
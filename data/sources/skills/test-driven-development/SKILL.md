---
name: test-driven-development
description: Start with a behavioral failing test, then a minimal implementation.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# Test-driven development

Adapted by AI Made Easy from [https://github.com/obra/superpowers](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/test-driven-development/SKILL.md) at commit b36e0829c6d0140e93cfef2ca599b1b07d4a7797. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Use the project test framework and requested behavior. Design the smallest regression case with input, expected result and a meaningful assertion. Run it before the change when execution is available and verify that failure reflects the missing behavior, not broken setup. Implement the smallest relevant fix, run the targeted test, then affected regressions. Refactor while keeping tests passing. For date/money boundaries state units, rounding, timezone and edge cases. Preserve existing user code; do not delete an implementation to enforce a ritual. Report commands, exit results and untested limitations. Without execution provide test code and expected failures, never fabricated results.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

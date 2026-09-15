---
name: receiving-code-review
description: Verify supplied review feedback before applying changes.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# Code review feedback

Adapted by AI Made Easy from [https://github.com/obra/superpowers](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/receiving-code-review/SKILL.md) at commit b36e0829c6d0140e93cfef2ca599b1b07d4a7797. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

When feedback is supplied, restate each requested change and locate the relevant code and behavior. Distinguish confirmed defects, preferences, unsupported assumptions and unclear requests. Evaluate compatibility and existing callers before modifying code. For each actionable item provide evidence, impact and the smallest change plus a regression case. Explain technical disagreement concretely; clarify only blocked items while continuing independent checks. Without review feedback, ask for it rather than inventing reviewer comments. Do not submit replies, merge or change repository permissions automatically. Report implemented versus proposed changes separately.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

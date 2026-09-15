---
name: verification-before-completion
description: Map acceptance criteria to checks, results and coverage gaps.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# Delivery verification

Adapted by AI Made Easy from [https://github.com/obra/superpowers](https://github.com/obra/superpowers/blob/b36e0829c6d0140e93cfef2ca599b1b07d4a7797/skills/verification-before-completion/SKILL.md) at commit b36e0829c6d0140e93cfef2ca599b1b07d4a7797. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

List concrete completion claims and the evidence each requires: reproduction, unit test, integration behavior, build or visible output. Select checks proportional to the change and run them when authorized tools exist. Read exit codes and full relevant results; an old pass or a build alone does not establish current functional correctness. For a reported bug compare the original trigger and corrected result. Map each acceptance criterion to a check and state unresolved gaps. When commands cannot run, provide reproducible steps and clearly mark not executed. Avoid repeated unrelated testing or claiming completion solely from another agent report.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

---
name: wps-data-clean
description: Clean whitespace, duplicates and types while preserving originals.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# WPS data cleaning

Adapted by AI Made Easy from [https://github.com/Bwkyd/wps-skills](https://github.com/Bwkyd/wps-skills/blob/50b04859b7768ed23477d7d2af9b8fb83b27adf3/skills/wps-data-clean/SKILL.md) at commit 50b04859b7768ed23477d7d2af9b8fb83b27adf3. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Inspect representative rows and establish column meanings, unique keys and locale before proposing changes. Produce a diagnosis with affected columns and examples. Define explicit whitespace, duplicate, missing-value, date and numeric rules; keep identifiers and leading zeros as text. Never guess a city from an ambiguous district, infer personal attributes, or silently convert unknown values. Work on a copy when file tools exist. Return a rule table, before/after examples, unresolved records, original and resulting row counts, and reconciliation checks. Without a workbook tool provide WPS steps or formulas and clearly label them unexecuted.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

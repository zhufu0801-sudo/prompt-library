---
name: wps-pivot
description: Configure rows, columns, values, filters and refresh checks.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# WPS pivot tables

Adapted by AI Made Easy from [https://github.com/Bwkyd/wps-skills](https://github.com/Bwkyd/wps-skills/blob/50b04859b7768ed23477d7d2af9b8fb83b27adf3/skills/wps-pivot/SKILL.md) at commit 50b04859b7768ed23477d7d2af9b8fb83b27adf3. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Translate the question into grouping fields and a measure. Ask for column names, sample rows, data types and aggregation meaning. Give a field placement table for rows, columns, values and filters; specify sum, count, distinct count or weighted calculation carefully. Distinguish averaging rows from calculating a ratio of totals. Describe WPS creation and refresh steps subject to the actual version. Check blanks, duplicates, text numbers, date groups, grand totals and source range growth. A calculated static summary is not a refreshable native pivot table: state which output was produced. Provide a small expected-results example from supplied data.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

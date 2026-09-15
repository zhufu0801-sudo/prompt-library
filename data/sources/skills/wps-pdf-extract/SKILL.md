---
name: wps-pdf-extract
description: Extract text and tables with page provenance and OCR uncertainty.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# PDF text and table extraction

Adapted by AI Made Easy from [https://github.com/Bwkyd/wps-skills](https://github.com/Bwkyd/wps-skills/blob/50b04859b7768ed23477d7d2af9b8fb83b27adf3/skills/wps-pdf-extract/SKILL.md) at commit 50b04859b7768ed23477d7d2af9b8fb83b27adf3. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Confirm requested pages, fields and output format. Determine whether the supplied PDF has selectable text, scanned images or mixed pages using available tools. Preserve page provenance, headings, table columns, units, footnotes and reading order. Flag merged-cell ambiguity and uncertain OCR instead of inventing missing characters or values. If OCR/file tools are unavailable, request pasted text or an accessible extract and do not claim extraction. Compare a sample of the output against original pages; check totals and row alignment. Deliver extracted content, a page/field uncertainty log and a concise verification checklist. Respect file access restrictions.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

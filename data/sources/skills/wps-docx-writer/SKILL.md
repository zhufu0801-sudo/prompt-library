---
name: wps-docx-writer
description: Draft documents with heading hierarchy, numbering and layout.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# WPS document structure

Adapted by AI Made Easy from [https://github.com/Bwkyd/wps-skills](https://github.com/Bwkyd/wps-skills/blob/50b04859b7768ed23477d7d2af9b8fb83b27adf3/skills/wps-docx-writer/SKILL.md) at commit 50b04859b7768ed23477d7d2af9b8fb83b27adf3. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Identify document type, audience, supplied facts and formatting requirements. Draft usable text while retaining names, dates and amounts; mark unknowns. Define heading levels, paragraph styles, list numbering, page breaks, table captions and cross-references. Prefer automatic fields for a table of contents and numbering; describe refresh checks. Preserve the user template rather than forcing a preset font or official format. Without editing tools return complete content and WPS steps; with tools save a separate output and inspect page layout for clipped text, broken tables and blank pages. Do not promise an editable file without producing one.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

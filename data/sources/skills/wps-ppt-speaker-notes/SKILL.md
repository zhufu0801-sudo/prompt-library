---
name: wps-ppt-speaker-notes
description: Write notes, transitions and timing from supplied slides.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# WPS speaker notes

Adapted by AI Made Easy from [https://github.com/Bwkyd/wps-skills](https://github.com/Bwkyd/wps-skills/blob/50b04859b7768ed23477d7d2af9b8fb83b27adf3/skills/wps-ppt-speaker-notes/SKILL.md) at commit 50b04859b7768ed23477d7d2af9b8fb83b27adf3. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Use actual slide text or a supplied outline; never claim to have read an absent deck. Confirm audience, voice and total duration. For every supplied slide produce an opening or transition, spoken explanation that adds meaning rather than reading bullets, evidence cues, and a transition to the next slide. Mark pauses and optional audience questions. Check the sum of times and present estimates, not measured speech duration. Keep page IDs aligned to the original. Output notes ready to paste into WPS; write a file only if a suitable tool is available, and verify it before claiming completion.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

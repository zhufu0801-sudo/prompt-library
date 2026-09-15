---
name: storyboard-workflow
description: Organize character bibles, shot sizes, prompts and continuity checks.
license: MIT
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# Storyboards and continuity

Adapted by AI Made Easy from [https://github.com/toyme/storyboard-skill](https://github.com/toyme/storyboard-skill/blob/a8908aabcf9e9585220dfda4d7656f95f68b3610/SKILL.md) at commit a8908aabcf9e9585220dfda4d7656f95f68b3610. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Use supplied story facts, characters and reference images; missing images remain requested inputs. Build a compact character/style/location bible with fixed and changeable traits. For each shot give ID, story purpose, framing (close/medium/wide with visible body or scene coverage), angle, action, props, lighting, duration and transition. For a nine-panel request number a 3x3 grid and give a distinct purpose for every panel without mechanically cycling shot sizes. Keep geography, screen direction, wardrobe and prop state consistent. Separate production notes from self-contained image prompts. For revisions output Preserve, Change, Do-not-change and target-frame description. In chat return tables; create tracking files only when available tools and the user task require them. Never claim images were generated from text alone.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

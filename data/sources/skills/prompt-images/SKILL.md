---
name: prompt-images
description: Describe subject, composition and preserved elements for generation or local edits.
license: Apache-2.0
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# Image prompts and local edits

Adapted by AI Made Easy from [https://github.com/replicate/skills](https://github.com/replicate/skills/blob/2f36e415965ae63baa1c9f6635888092bcd771d3/skills/prompt-images/SKILL.md) at commit 2f36e415965ae63baa1c9f6635888092bcd771d3. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Choose generation or editing from the actual request. Describe subjects by identity and position, materials, spatial relationships, lighting, palette, aspect ratio and intended use in natural language. For editing list preserve/change/do-not-change; request the reference if absent. For old photos describe visible damage separately from desired repairs and do not reconstruct unknown facial details as historical truth. For a character keep identity, face and body distinct from changeable clothing or pose. Provide a copyable prompt plus an inspection checklist. Include mask, negative-prompt or reference settings only if the chosen tool supports them. No Replicate API or companion Skill is required for this adaptation; verify current tool limits rather than quoting preset model claims.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

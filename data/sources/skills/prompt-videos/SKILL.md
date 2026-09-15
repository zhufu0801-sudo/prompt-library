---
name: prompt-videos
description: Specify single-shot action, start/end state and camera movement.
license: Apache-2.0
compatibility: Self-contained instruction-only adaptation; no scripts, API keys or companion Skills required.
---

# Video action and camera prompts

Adapted by AI Made Easy from [https://github.com/replicate/skills](https://github.com/replicate/skills/blob/2f36e415965ae63baa1c9f6635888092bcd771d3/skills/prompt-videos/SKILL.md) at commit 2f36e415965ae63baa1c9f6635888092bcd771d3. Changes: narrowed task scope, removed executable examples and external dependencies, added capability checks and factual-preservation rules. Original license retained.

## Workflow

Establish the shot purpose, available reference image, desired duration and output format. Describe subject, context, one main action, style, camera, framing and atmosphere without conflicting movements. Separate fixed appearance/background from changes over time. Specify start, intermediate motion and final state; for loops reconcile pose, camera and lighting at the seam. For defect repair preserve approved elements and change only the visible defect. Produce a ready-to-copy prompt and continuity checks; propose settings only after checking the target tool. Do not infer that a duration, resolution, negative prompt or audio feature is supported. This adaptation does not call Replicate or bundle media generation.

## Output and tool boundary

Use the requested Chinese, English or Japanese response language. Preserve the user's literal facts and constraints. Ask only for missing details that change the deliverable. This package supplies instructions, not a model or runtime. Do not install tools, send private files, publish, or incur costs merely because this document mentions a workflow. If tools are absent, deliver the prompt, text or test plan and identify remaining steps. Distinguish observed results from expectations.

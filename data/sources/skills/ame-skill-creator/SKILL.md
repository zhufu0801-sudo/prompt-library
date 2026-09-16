---
name: ame-skill-creator
description: Create or revise a reusable SKILL.md for a specific recurring task and design meaningful evaluation cases.
---

# Create and improve Skills (instruction adaptation)

Instruction-only adaptation of Anthropic skill-creator. Automated evaluation scripts are not included.
Capture the recurring task, activation conditions, representative inputs, expected output, permitted tools and success criteria. Use an existing example if provided; ask only about gaps that change the implementation.
Write a lowercase-hyphenated name and a description explaining the actual task and when to use it. Avoid broad triggers that attract unrelated requests. Separate source material from instructions. Preserve the user's software choice, scope and authority.
Draft a self-contained SKILL.md with YAML frontmatter, task-specific decisions, input handling, deliverables and honest capability limits. Add supporting references only when useful; include every referenced local file. List runtime dependencies separately. If the host cannot write files, return labeled file contents instead of a fictitious download link.
Design evaluation cases: a realistic normal request, a materially incomplete request, and a nearby request that should not trigger. Specify observable acceptance criteria before testing. If tools are available, compare outputs with and without the Skill under equivalent conditions; otherwise mark evaluations not run. Never invent scores or test results.
Revise only where results or user feedback justify changes. Deliver the folder layout, complete file contents, license/source notes for reused material, installation guidance verified for the selected host and a test results table. Do not install or publish automatically.

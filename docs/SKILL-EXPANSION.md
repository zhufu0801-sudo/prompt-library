# 2026-09-15 Skill expansion: 8 → 20

Twelve self-contained instruction adaptations were added, with Chinese, English and Japanese names, scope notes and usage. SKILL.md remains English and instructs the target AI to use the user's requested language. These are not model installations or certified external runtime integrations.

## Sources and coverage

- [BWKYD WPS Skills](https://github.com/Bwkyd/wps-skills), MIT, revision `50b04859b7768ed23477d7d2af9b8fb83b27adf3`: presentation outline, speaker notes, data cleaning, pivot tables, PDF extraction, document structure.
- [Superpowers](https://github.com/obra/superpowers), MIT, revision `b36e0829c6d0140e93cfef2ca599b1b07d4a7797`: test-driven development, evaluating review feedback, completion verification.
- [Replicate Skills](https://github.com/replicate/skills), Apache-2.0, revision `2f36e415965ae63baa1c9f6635888092bcd771d3`: image and video prompting. Adaptations remove API and companion-skill requirements; no Replicate account is needed to use these instruction documents.
- [Toyme storyboard-skill](https://github.com/toyme/storyboard-skill), MIT, revision `a8908aabcf9e9585220dfda4d7656f95f68b3610`: storyboards, character and visual bibles, shot tracking, targeted repairs and continuity. The adaptation works in plain chat without missing project files or reference dependencies.

Original source documents, licenses and fixed source links are kept under `data/sources/skill-expansion-upstream`. Download packages include adapted entrypoints, original licenses, localized usage and manifests with file hashes. Each entrypoint identifies adaptation changes. No scripts from upstream are executed or advertised as bundled.

## Adaptation decisions

- WPS data cleaning must not guess missing cities, personal attributes or identifier values. Preserve originals, report ambiguous values and reconcile row counts.
- A static grouped table is not represented as a native refreshable pivot table.
- Presentation outlines and notes do not claim to create a PPTX without file tools.
- TDD preserves the user's existing code; it does not require deleting work to follow a ritual.
- Image/video generation settings are conditional on actual target-tool support. Text-only tools return prompts and checks, not imaginary media files.
- Storyboard tasks include close/medium/wide framing, numbered panels, fixed traits and spatial/action continuity.
- Specialized Skills do not replace unrelated tasks. Formula requests exclude document structure and data-cleaning recommendations. Old marketing-image exclusions remain in place; dedicated image-prompt Skills cover suitable additional visual tasks.

## Validation and maintenance

Run `scripts/build-expanded-skills.py` to reproduce the 12 packages without network access. `vendor-skills.py` calls this after upstream packaging and existing repairs, so refreshes preserve the expansion. Skill mappings are tested in every language, including exclusions in subject, constraints, materials, criteria and keywords. Download verification checks actual response bytes, SHA-256, ZIP integrity and document hashes for both site and GitHub URLs.

No paid AI generation or third-party runtime certification was performed. Actual files, code execution, OCR and media generation require suitable tools in the destination AI. Ambiguous workflow scope still requires user confirmation.

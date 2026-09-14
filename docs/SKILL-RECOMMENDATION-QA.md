# Skill recommendations and fit review — 2026-09-14

Recommendations are visible in ordinary mode, with a primary ZIP link and a GitHub-hosted backup. Applying a recommendation never changes user-written source material. A different task is named before the user chooses to switch; task locks prevent that change. Unknown or unsupported briefs are not forced into a Skill.

| Skill | Suitable content | Limits checked |
| --- | --- | --- |
| systematic-debugging | Reproducing failures, tracing causes, verifying fixes | Not new development or a general review workflow |
| wps-formula | Lookup, totals, text/date formulas and formula errors | Not pivot tables, cleaning, charts or macros; version support must be checked |
| copywriting | Product/landing pages, headlines, benefits and CTAs | Not dedicated social posts, email campaigns or video scripts; example statistics are not product facts |
| image | Product/brand/hero/social graphics, lighting and composition | No dedicated character turnaround or camera-grid workflow |
| video | Production workflow, shot prompts, editing plans | No dedicated spatial/character continuity workflow; external media tools are still needed |
| scientific-writing | Evidence-based papers, sections, citations and revisions | No fabricated evidence; optional Python audits are not bundled or executed |

Editable fit rules and three-language scope descriptions: `data/studio/skill-fit.json`. They are stored alongside Skill metadata in both reference databases and the versioned D1 seed. This is conservative keyword/task routing, not a semantic model or a compatibility certification for every AI product. Original upstream documents remain attributed and unchanged, except the explicitly labeled WPS adaptation.

Verification completed locally: type checking, unit tests for all three locales and mismatched briefs, six-module save/restore API tests, browser application of each recommendation with user input preserved, ordinary mode, removal after changing to an unsupported brief, and a real browser download event. `scripts/test-skill-downloads.py --rounds 2` completed 24 primary/backup transfers, checking file size, SHA-256, ZIP CRC, safe archive paths, SKILL.md, licenses, three-language usage files and every indexed source document hash. A post-publication run uses `--origin` with the public website.

# Skill audit — 2026-09-15

## Findings and fixes

1. Scientific-writing entrypoint advertised bundled Python helpers that were absent from the documentation ZIP. Replaced the entrypoint with a clearly attributed instruction-only adaptation: outline, draft, revision, limitations, captions and reviewer response workflows use explicit manual evidence checks. Original entrypoint remains in `data/sources/scientific-writing-upstream/`. The supporting upstream reference documents may describe optional CLIs; the adapted entry explicitly excludes those commands.
2. Frontend-design referred to `LICENSE.txt` but the package only included `LICENSE`. Both names now contain the original license text.
3. Revised scientific-writing usage and scope in all three languages to match the actual package. New versioned ZIP URLs avoid stale cached bytes; existing download URLs remain available.

## Per-Skill scope review

| Skill | Supported use | Important boundary |
| --- | --- | --- |
| systematic-debugging | Reproduce, gather evidence, identify root cause, verify a fix | Needs the user's code/environment for actual execution |
| wps-formula | Formulas and formula errors | No macros/pivot automation; WPS version still needs checking |
| scientific-writing | Evidence-based manuscript preparation | Instruction-only; no automated source or scientific validation |
| copywriting | Product and landing-page copy | No invented product facts; not a specialist social-post workflow |
| image | Marketing image briefs and production workflow | Actual generation requires an image-capable tool |
| video | Video planning and production workflow | External media tools and their dependencies are not bundled |
| frontend-design | Frontend implementation and visual design | Requires a code-capable environment to build/test |
| content-strategy | Editorial strategy and content planning | No automatic publishing or external account access |

## Verification

- 30 application regression tests passed, including all eight Skill matching/exclusion cases and three-language prompt generation.
- Local API suite passed: 57-module save/restore, search, favorites, plan updates, visitor isolation, CSRF, validation limits and disabled AI endpoint.
- New `scripts/test-skill-packages.py` checks every ZIP's entrypoint metadata, linked local resources, referenced Python executables, license filename, localized usage, manifest and file hashes. All eight pass.
- Browser inspection confirmed eight download entries, search filtering and the new scientific-writing edition URL. API tests verify actual served ZIP hashes.
- Type checking passed. No third-party AI account, paid model, external Skill installer or generation runtime was invoked. These checks establish package integrity and documented applicability, not universal runtime compatibility or guaranteed output quality.

Maintenance: after an upstream refresh, `vendor-skills.py` automatically invokes `repair-skill-packages.py` to preserve the reviewed adaptations. Run the offline package test and application tests before publishing, then test both production and GitHub download links.

# Expanded library and interface — 2026-09-14

The homepage now provides 13 guided templates across 10 categories. Seven added modules cover articles/documents, teaching/learning, language/translation, life/travel, stories/creative work, business/content strategy and thinking/expression. Fifteen new task guides bring the total to 33 task types. Every guided template, task instruction, example and follow-up question has Chinese, English and Japanese editions.

The complete catalog exposes 322 records: 43 original templates and 279 AI Short imports. Original source records retain their source language and attribution; the complete catalog explicitly distinguishes them from the localized guided forms. Previously saved plans remain usable. Validation now uses each template's real required fields, and legacy composition no longer injects unrelated visual or programming instructions.

Two additional pinned GitHub documentation Skills bring the download catalog to eight:

- [Anthropic frontend-design](https://github.com/anthropics/skills/tree/34040c9c568585f6929bedeaad110ad08f079624/skills/frontend-design), Apache-2.0. Recommended for Frontend and UI design. Its design approach informed this interface; see ui-direction.md.
- [Content strategy](https://github.com/coreyhaines31/marketingskills/tree/5b2c0007766c6a1cf1d53fd8fc73e979e0821022/skills/content-strategy), MIT. Recommended for content planning, not as a substitute for individual copy drafts. Upstream examples/statistics must be verified before use as factual claims.

Packages include licenses, pinned provenance, original instruction documents, per-file hashes and three-language usage notes. They contain no models or executable scripts. Download tests verify transport, byte hashes and ZIP integrity; these do not certify execution in external AI products. Related upstream Skills and integrations are not automatically installed.

## Maintenance

- `scripts/build-expanded-modules.py` generates `data/studio/additional-tasks.json`, seven additional templates per language, and the frontend task option.
- `scripts/build-content.mjs` publishes the additional templates and task resources to the content seed. User plans/favorites are not part of the export.
- `scripts/vendor-skills.py` packages pinned documentation; `skill-fit.json` defines suitability boundaries.
- `scripts/export-sqlite.py` and `scripts/export-scenario-library.py` refresh editable reference databases.
- `pnpm typecheck`, `pnpm test`, `pnpm test:api`, production build and `scripts/test-skill-downloads.py` provide checks. API mutation tests belong on localhost only.

Source-library records are not all newly reviewed. The 2,169 Prompts.chat source records and eight research drafts remain separately stored with review status; publishing the catalog does not claim every research draft is production-ready.

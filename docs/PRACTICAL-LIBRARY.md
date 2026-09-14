# Practical task library — 2026-09-14

This release adds 20 modules and 60 task templates in Chinese, English and Japanese. There are now 33 homepage modules and 93 individually selectable task templates. These are configurations of guided forms, not 93 unrelated database records: the complete source catalog contains 342 records (63 original forms, 279 AI Short imports).

## Added modules

Backend/databases, software testing, deployment/operations, data analysis, product planning, project management, career applications, business communication, support/FAQ, social content, e-commerce, search content/SEO, presentations, reading/synthesis, learning assessment, localization, audio/podcasts, brand visuals, animation preproduction and personal organization. Each adds three distinct tasks with their own deliverable rules, examples and information requirements.

The homepage defaults to task browsing. Module browsing remains available with direct task shortcuts. Search matches task names, parent modules and curated terms; selecting a task opens its proper form and selection immediately. Saved plans retain the selected task through language changes and restore. Original source-language catalog records remain clearly labeled.

## Sources and editorial decisions

- AI Short / `rockbenben/ChatGPT-Shortcut`, MIT, checked revision `1db7679dc07c2633188990442c48d1e9c3bcfd52`. Its public curated dataset still contains the same 279 records; we did not claim to import the separate online community.
- Prompts.chat / `f/prompts.chat`, existing pinned CC0 source snapshot `f78a1c5136fa080155d928e0d7e2b4a41ddef03e` with 2,169 records. Selected examples include data analysis, customer support, resumes, search services, podcasts and deployment.
- `data/research-library/practical-source-review.json` preserves 47 selected records and attribution. `sourceReferences` on each new task links back to this review. The full source library is not represented as fully reviewed.

These are original task adaptations, not automatic role-name copies. We removed instructions to exaggerate product value, fabricate simulated execution, claim unsupported results, require irrelevant integrations or invent interview answers. Outputs specify actual artifacts, evidence boundaries and validation. Audio/image/video prompts do not imply that the site generates media.

## Maintenance and checks

`scripts/build-practical-library.py` produces module metadata, 60 task guides and three localized form sets. `content:build` adds them to the editable database and now stores all 93 published task definitions. Tag and resource seed batches are bounded while each form update remains atomic. The two SQLite export scripts refresh content-only reference databases without user plans.

Tests verify all 60 tasks in three languages, distinct deliverables, source references, preservation of user prose and selected tasks, 33-module API save/restore, catalogue counts and bounded seed batches. Existing Skill package hash tests remain part of the API suite. The previous full-repository scaffold lint findings are unchanged; this release does not claim a clean full lint run.

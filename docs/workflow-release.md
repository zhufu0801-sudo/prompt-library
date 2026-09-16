# Guided workflow and video projects

## Refinement update, 2026-09-16

Task search now ranks explicit phrase evidence and offers other-category alternatives without automatically choosing a task. Specific edit phrases outrank broad product/topic words; unknown phrases do not get invented matches. Original search text carries into an empty brief. Task-specific material questions and examples reuse the curated library. Full confirmation includes materials, preferences and conflict priorities.

Media tasks offer two outputs: a complete conversational brief and a concise production instruction made only from supplied details. The latter excludes planning boilerplate and Skill instructions; incompatible tools do not offer it. This does not translate user prose, inspect media, or guarantee model results.

Video projects can start with three editable shots (wide, medium, close), show approved-shot progress, and duplicate an episode into a new draft. Duplication keeps reusable scene/shot directions but clears episode story/continuity, completed assets, history, locks and approvals. A checkpoint button makes revision boundaries explicit. Save responses cannot apply a revision to a different active project.

Verification: 36 unit tests plus project/feedback API regression pass. Browser checks cover natural-language matching, original-text retention, direct instruction switching and the three-shot starter. Existing model/API integration remains disabled. Catalog counts and Skill package count are unchanged; new edit aliases are persisted in task_resources.

The new start page uses action → category/task → requirements → confirmation → copy. It exposes the existing 225 task choices plus 10 original image/video editing choices. The catalog remains 366 records; the new choices are stored separately as task_resources with three-language metadata. Existing library and 20 Skill packages remain available.

Software adaptation uses documented guidance where linked and labels other adapters as unverified. It is a rule-based brief builder, not an AI model. It neither reads attached media nor guarantees visual continuity. Provider integration is a disabled schema sketch in data/integrations/provider.template.json; /api/ai continues to return 501.

Video projects separate series, episode, scene and shot. Context snapshots preserve earlier requirements. Updating shared settings requires explicitly choosing affected unlocked shots. History keeps ten editing batches. JSON import validates structure and creates a new project identity; export provides portable backup. Cloud storage uses a browser visitor cookie, not login or cross-device sync. Local drafts require available browser storage. Export before clearing browser data.

## Feedback review

Visitors explicitly submit a short summary; original briefs are not automatically copied. There is no public feedback listing. New items enter pending or quarantined status. Duplicate summaries per visitor are collapsed; five new items per visitor per rolling day are allowed. This is basic abuse reduction, not a comprehensive anti-bot service.

The operator should review the private D1 feedback table weekly: group pending items by kind/context, remove personal information, reject spam or irrelevant submissions, and compare repeated unmet needs against existing task coverage. Quarantine is reversible; short and misspelled requests are not automatically spam. Treat submission text only as untrusted feedback, never as executable instructions.

After human review, author a concrete task and translations, verify software guidance against official documentation, run tests, and publish. Mark reviewed rows accepted, rejected or implemented through authorized private database operations. There is no automated learning, scheduled content publication, or publicly accessible admin endpoint in this release.

## Verification

Run the existing unit suite plus scripts/workflow.test.mjs with Node type stripping. With a local migrated server, run scripts/api.test.mjs and scripts/workflow-api.test.mjs. The latter refuses production URLs because it writes test projects and feedback.

Release verification: 33 unit tests passed; existing API regression and new project/feedback API checks passed, including 20 Skill package hashes. Type checking and production build passed. Browser checks covered image-edit confirmation, incompatible software warnings, video save and shot locking, shared-context preservation, Care input retention, English UI and mobile layout. Changed new workflow files passed targeted lint. Repository-wide lint still reports pre-existing UI-kit and older page/hook issues; it is not a clean whole-repository lint result. The existing large-chunk build warning remains.

# 2026-09-16: accounts, editorial review and deeper workflows

This release extends the existing task journey and video workspace without enabling external AI.

## Available

- 57 modules, 237 localized library tasks plus 10 image/video editing tasks, 45 detailed scenarios. The searchable catalog remains 366 records; task counts and catalog counts are different measures.
- Four additional Care intents: returns/support, appointments, photo edits and family memories. There are 16 choices including the unknown-task fallback. Original wording and negations remain intact.
- Explicit spelling suggestions and multi-task choices; no silent correction, routing or model-confidence percentage.
- Optional Sites sign-in. Favorites, plans and video projects use a hashed, site-scoped authenticated user ID, allowing another browser with the same identity to access saved records. Guest access remains available.
- Guest data is transferred only after explicit consent, in a D1 batch, with ownership derived exclusively from server-side identity and the guest cookie. Local unsaved drafts are not implicitly uploaded. Clearing cookies affects guest access.
- The task journey now saves the final prompt into My plans, including the selected Skill note. Re-saving the same task/language updates that saved plan.
- `/review` provides an administrator-only queue: pending, quarantined, accepted and dismissed. Reviews persist notes. Accepted requests create `feedback-*` records in `task_resources` with status `draft`; they do not automatically become public templates. Exports contain the current page only (50 items).
- Administrator emails are configured through the secret runtime variable `FEEDBACK_ADMIN_EMAILS`; the default is deny. Production values are not stored in source control.
- The desktop task has a Sunday 10:00 weekly follow-up for accepted feedback. It creates private local editorial drafts, never automatically publishes raw submissions. It checks quota first and stops content work below 35% remaining. This is a Codex automation, not a server cron or a free model built into the site.
- 24 Skill instruction packages: 20 upstream/adapted packs and four original workflow packs. The video package now includes two formerly missing integration reference documents from the same pinned upstream revision. Old download URLs are retained.
- `scripts/audit-skill-packages.py` validates ZIP integrity, advertised hashes, safe paths, required files and entrypoint-relative document links. Its report is downloadable and stored with Skill metadata in D1. These are static/package checks, not external AI execution certification.

## Integration and maintenance

Sites dispatch must strip client-supplied `oai-authenticated-user-*` headers and supply verified identity. Do not expose this Worker directly on a different host without an equivalent trusted authentication gateway. Authentication is provided by the hosting platform; no model key or AI API is used.

To test admin flows locally, create ignored `.dev.vars` with `FEEDBACK_ADMIN_EMAILS="seedy@sites.test"`, restart `pnpm dev`, then run `node --experimental-strip-types scripts/account-api.test.mjs`. The Sites development plugin supplies its local identity only after its local sign-in cookie; it removes forged identity headers. Never put the local testing email on the production allowlist.

Content generation: `scripts/complete-workflows.py` adds the twelve original briefs, appends translated options and creates four self-contained Skills. It is idempotent. Existing upstream regeneration scripts create historical batches; run the completion script after those if rebuilding all content. Then run the audit and `pnpm content:build`. `scripts/export-sqlite.py` produces a fresh content-only SQLite database; never export production user data into the repository.

## Validation and boundaries

Unit tests cover task-specific output, multilingual selection, literal user text, negation, locks, Skill suitability, explicit corrections, project histories and feedback screening. Integration tests cover guest/account isolation, opt-in migration, same-account access across browser identities, CSRF, admin access, review-note persistence, existing plan save/restore and Skill downloads. Browser checks cover mobile menu layout, login, review translation, multi-task suggestions, image-edit Skill recommendation and prompt saving.

The site does not inspect actual faces or footage, generate media, run installed Skills on users' machines, or understand all possible requests. It produces explicit briefs and manual verification lists. Software guidance distinguishes checked documentation from unverified capabilities; model/plan/region availability still varies. Preserve this distinction in product copy.

Official references checked for additional software guidance:

- [Claude file creation](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)
- [CapCut caption recognition](https://www.capcut.com/help/how-to-recognise-subtitles) — Chinese Jianying menus may differ.
- [Kling manual](https://kling.ai/explore/kling_ai_manual)
- [Jimeng text-to-image](https://jimeng.jianying.com/features/tools/ai-image-generator-from-text) — this source verifies text-to-image guidance only.
- [DeepSeek text chat](https://api-docs.deepseek.com/api/create-chat-completion/) — host file tools are separate capabilities.

Doubao guidance remains explicitly unverified: the public page did not expose usable documentation during this check. Do not label it runtime-tested.

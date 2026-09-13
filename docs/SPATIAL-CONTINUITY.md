# Spatial continuity templates — 2026-09-13

Two original, manually edited scenarios in Chinese, English and Japanese were added to the existing image/storyboard tasks. No extra homepage module or model API was added.

User reference: https://v.douyin.com/_x24vZeclKA/ redirects to https://www.douyin.com/video/7684827015262505290 . Visible video frames show a scene grid and overview, camera height/shot size, composition, color, lighting and character blocking. The exact Skill repository was not identified; these templates are an original adaptation of the visible method, not a verified import or installation of that Skill.

Related research: https://github.com/foxpaw2020/master-storyboard-pipeline describes an overview, camera-view reference grid and per-clip prompts. This is not confirmed as the video's project. Its code or Skill text was not copied. The website text intentionally remains tool-independent.

Editorial additions: explicit world coordinates versus screen directions; uncertainty about unseen geometry; reference versions; static layout versus changing action; camera/shot IDs; handoff state; screen-axis transitions; individual high-resolution video input frames; targeted repair; no false claims of inspecting or generating images.

Editable source: data/studio/spatial-scenarios.json. Run scripts/sync-spatial-scenarios.mjs after adding labels, and scripts/export-scenario-library.py to update the offline SQLite catalog. The catalog now has 24 published scenarios and 8 drafts, with 96 localized records. No actual generated media has been evaluated; content checks are prompt-generation checks only.

The follow-up learning batch reviewed pinned Prompts.chat records 5 (Excel Sheet) and 30 (UX/UI Developer). Two original trilingual drafts add formulas with explicit execution limits and evidence-based usability reviews. They are stored in data/research-library/learning-2026-09-13.json and remain off the homepage. Regenerate them with scripts/extend-learning-drafts.py. Next batches should evaluate these drafts against realistic inputs before promoting them, and continue topic-by-topic instead of importing unreviewed records as finished templates.

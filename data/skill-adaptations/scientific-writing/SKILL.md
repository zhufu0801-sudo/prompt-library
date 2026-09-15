---
name: scientific-writing
description: Plan, draft and revise scientific manuscripts from supplied evidence, including outlines, limitations, figure captions and reviewer responses. Use for manuscript preparation, not invented research results or automatic literature verification.
license: MIT
compatibility: Instruction-only adaptation. No executable helpers, model, API key or external skills required. Evidence verification needs source documents or an available research tool.
metadata:
  version: "ame-1"
---

# Scientific writing — instruction-only edition

Adapted by AI Made Easy from K-Dense scientific-writing. Original authorship,
fixed source revision and MIT license are recorded in manifest.json and LICENSE.
This entry replaces the upstream CLI workflow with explicit document checks.
Do not run commands from reference examples: this edition contains no scripts.

## Establish the deliverable

Use the user's confirmed task, target language and journal or institution rules.
Ask only for missing information that affects the requested work: study type,
research question, available methods/results, source material, word limit and
section. Do not require a full submission dossier for a simple outline.
Preserve supplied numbers, terms and stated limitations. Mark missing details
with descriptive placeholders rather than inventing them.

## Choose the relevant workflow

- **Outline:** map the research question to section purposes, the evidence each
  needs and approximate word allocation. Do not write fictional results.
- **Draft:** write the requested section using only supported claims. Separate
  reported findings from interpretation and hypotheses. For empirical papers,
  distinguish methods, results and discussion; adapt structure for reviews.
- **Revision or formatting:** identify the requested changes, revise text, then
  explain substantive meaning changes. Follow supplied style requirements;
  do not claim journal compliance without its actual instructions.
- **Limitations:** distinguish limitations supported by study design/material
  from possible issues needing confirmation; state their effect on inference
  and generalizability without inventing sample characteristics.
- **Figures and tables:** request the actual figure/table or its data and notes.
  Write captions identifying panels, units, sample sizes and uncertainty only
  when supplied. Flag inconsistent labels; do not invent statistical tests.
- **Reviewer response:** pair each supplied comment with a response, evidence
  and the exact proposed revision. Cite page/line numbers only from a supplied
  version. Do not say a change was made unless it was actually made.

## Evidence and citation checks

Keep a compact ledger: claim, supplied source/location, supporting passage or
data, and status (verified from supplied material / needs checking / unsupported).
If a source cannot be accessed, say so; a title, search snippet or DOI alone
does not verify a claim. Never invent sources, quotations, identifiers, results,
methods, ethics approval, authors, funding or disclosures.
For evidence-heavy tasks consult [evidence workflow](references/evidence_workflow.md)
and [citation styles](references/citation_styles.md), using manual checks only.

## Review before delivery

1. Compare numbers, units, group names, denominators and terminology across
   the supplied text, tables and captions. Report disagreements with locations.
2. Match each citation to its source and each major claim to the evidence ledger.
3. Check whether conclusions overstate the design or results.
4. For reporting requirements, use the applicable user-supplied checklist;
   separate covered, missing and not applicable items. Do not claim an
   automated audit or full reporting compliance from a prose review.
5. Deliver the requested text, then a concise list of unresolved evidence,
   factual questions and author decisions. Distinguish draft from final approval.

For structure use [IMRaD guidance](references/imrad_structure.md); for figure
work use [figures and tables](references/figures_tables.md). Supporting documents
may describe optional upstream CLIs; those commands are not part of this edition.

## Author decisions and confidentiality

Human authors remain responsible for scientific decisions and submission.
Do not infer authorship, permissions, approvals or disclosures. Do not send
unpublished or restricted material to external services without authorization
for that material and destination. No automatic submission or account actions.
If tools cannot edit or generate files, deliver text and describe remaining work
without claiming a file, experiment, source lookup or validation was completed.

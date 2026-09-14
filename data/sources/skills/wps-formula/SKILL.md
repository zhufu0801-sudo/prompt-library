---
name: wps-formula
description: Write or troubleshoot formulas for WPS Office spreadsheets from a calculation brief, cell layout and sample data. Use for lookup, aggregation, text, date and formula-error tasks; not macros or general document automation.
license: MIT
---

# WPS spreadsheet formulas

Adapted by AI Made Easy from BWKYD's MIT-licensed `wps-formula`, commit `50b04859b7768ed23477d7d2af9b8fb83b27adf3`. This edition replaces broad version claims with feature checks and removes unrelated automation and financial amount-conversion examples. No runtime or scripts are included.

## Understand the calculation

Use the requested answer language (Chinese, English or Japanese). Keep cell addresses and formula identifiers intact. Establish column meanings, destination cell, expected result, criteria, and a few representative input rows. Ask only for missing details that change the formula. State a provisional layout when no real workbook is supplied; do not claim to have read one.

Check the user's WPS edition, platform, version/build and formula separator. Do not infer function support solely from a release year. Verify unfamiliar/newer functions in the user's function list or current WPS documentation. If uncertain, give a widely supported alternative and identify the feature that needs checking. Distinguish legacy array entry from dynamic arrays according to the actual environment.

## Produce a usable answer

Give a copyable formula, destination cell, fill direction, absolute/relative reference explanation and expected output for the supplied examples. Use bounded ranges when practical. A conditional total might be `=SUMIF(A2:A100,E2,B2:B100)` when A is department, B is numeric amount and E2 is the requested department; adjust separator and ranges to the workbook.

For lookups, clarify exact versus approximate matching and duplicate-key behavior. For aggregates, clarify whether blank, zero, numeric text and missing entries should be included. For dates, distinguish real dates from text, and explain locale-sensitive parsing. Preserve leading-zero identifiers as text.

When debugging, identify the exact error and failing subexpression before wrapping it in `IFERROR`. Distinguish an expected missing match from a broken reference or invalid data. Explain denominator-zero handling according to the intended meaning rather than silently replacing every error with zero.

Check normal, empty/missing and boundary cases relevant to the task. If a spreadsheet tool is available, test in a copy only within the user's authorized scope and report what was actually tested. Otherwise show a small expected-results table and say the formula has not been run in WPS. Do not claim universal version compatibility or create macros, install plugins or change workbook permissions for a formula-only request.

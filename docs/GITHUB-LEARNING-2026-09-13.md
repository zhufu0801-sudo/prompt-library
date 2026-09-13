# GitHub code study — batch 2

Read-only study of concrete source files, followed by original trilingual editorial templates. No upstream code was executed, installed or copied into the application.

## Sources read

- Playwright, commit d1ead3ecca23182f2d06d761c28e3d4edafb6595:
  - https://github.com/microsoft/playwright/blob/d1ead3ecca23182f2d06d761c28e3d4edafb6595/examples/todomvc/tests/adding-todos/should-trim-whitespace-from-new-todo.spec.ts
  - https://github.com/microsoft/playwright/blob/d1ead3ecca23182f2d06d761c28e3d4edafb6595/examples/todomvc/tests/editing-todos/should-cancel-edit-on-escape.spec.ts
  - Observed: fixtures, accessible locators, actions followed by assertions, trimming and edit cancellation. Editorial additions: negative assertions, unchanged counts, product-specific persistence, isolated data and explicit execution evidence.
- FastAPI, commit 50113da16fec53b66b80d75e80a89296de4fa5a5:
  - https://github.com/fastapi/fastapi/blob/50113da16fec53b66b80d75e80a89296de4fa5a5/docs_src/handling_errors/tutorial004_py310.py
  - https://github.com/fastapi/fastapi/blob/50113da16fec53b66b80d75e80a89296de4fa5a5/tests/test_tutorial/test_handling_errors/test_tutorial004.py
  - Observed: distinct HTTP/validation handlers, plain-text errors, valid and invalid input tests, schema snapshots. The tutorial's custom 400 and illustrative 418 are not universal recommendations. Editorial additions: client compatibility, redaction, response-validation distinction, actual media type and OpenAPI alignment.

## Saved result and next step

data/studio/engineering-scenarios.json contains two original scenarios, each with Chinese, English and Japanese instructions and examples. They appear under programming build/debug respectively. Homepage scope is unchanged. Offline catalog: 26 published scenarios, 8 drafts, 102 localized records. Raw Prompts.chat inventory still contains 2169 records; unreviewed records have not been promoted automatically.

The site assembles prompts without invoking AI. Tests validate task selection, locale mapping, custom-text preservation and composition; they do not prove that third-party models will produce correct code. Next focused batch: inspect a real request-cancellation implementation and its regression tests, then add a narrowly scoped debugging scenario after checking existing coverage. Stop research before consuming the reserve needed to validate and publish.

# Code situations and video shot sizes

Added 6 original trilingual scenarios: pagination/filtering, background tasks, upload validation review, close shots, medium shots and wide shots. Programming scenes are scoped to build/review. Three framing choices appear under single-shot video in the scene selector, labeled “Shot size and scenario”. Storyboard guidance separately addresses all three sizes and continuity between edited shots. No actual video generation API has been added.

Source code inspected, FastAPI commit `50113da16fec53b66b80d75e80a89296de4fa5a5`:

- https://github.com/fastapi/fastapi/blob/50113da16fec53b66b80d75e80a89296de4fa5a5/docs_src/query_params/tutorial001_py310.py
- https://github.com/fastapi/fastapi/blob/50113da16fec53b66b80d75e80a89296de4fa5a5/tests/test_tutorial/test_query_params/test_tutorial001.py
- https://github.com/fastapi/fastapi/blob/50113da16fec53b66b80d75e80a89296de4fa5a5/docs_src/request_files/tutorial001_py310.py
- https://github.com/fastapi/fastapi/blob/50113da16fec53b66b80d75e80a89296de4fa5a5/docs_src/background_tasks/tutorial001_py310.py

Observed: skip/limit defaults and sliced results, parameterized response tests, bytes versus UploadFile input, BackgroundTasks registration. Production constraints in our prompts (stable sorting, validation, durability, idempotency and access controls) are editorial additions, not claims that the tutorial implements them. No upstream code was copied or executed. Shot-size content is original editorial guidance extending prior spatial continuity work; it was not found in the FastAPI repository.

Regenerate with scripts/curate-code-and-shots.py, then scripts/sync-spatial-scenarios.mjs and scripts/export-scenario-library.py. Catalog: 33 published scenarios, 8 drafts, 123 localizations. Validate model-specific output quality with actual generated media before claiming visual results. Next batch can review database transaction and cache invalidation examples after checking existing scenario coverage.

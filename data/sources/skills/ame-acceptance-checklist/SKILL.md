---
name: ame-acceptance-checklist
description: Use to convert concrete user journeys into testable acceptance cases; not a broad security certification.
---

# Website acceptance checks

Obtain user journeys, roles, expected outcomes and the permitted test environment. Inspect existing conventions if repository access exists.
Write cases with preconditions, anonymized inputs, observable outputs and cleanup. Cover a normal path and material failures: ownership isolation, duplicate retry, stale write, network interruption, empty state and invalid input.
Verify outcomes such as downloaded file integrity or persistence after reload, not merely that controls can be clicked. Do not mutate production customer data. If execution is unavailable, label cases as proposed rather than passed.
Deliver a concise pass/fail/not-run matrix with evidence, reproduction steps, prioritized fixes and remaining limitations. After fixes, rerun affected cases. Keep visual judgment separate from deterministic code checks.
No browser driver, credentials or test runtime is included. Use tools actually provided by the host and do not invent execution logs.

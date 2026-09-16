---
name: ame-editable-slides
description: Plan or revise editable slide decks with explicit element, source and compatibility requirements.
---

# Editable slides (PPT Master workflow adaptation)

Lightweight instruction-only adaptation informed by PPT Master. This package does not implement the upstream renderer or its full workflows.
Determine whether the task is a new deck, an edit to an existing PPTX, or reconstruction from references. Capture audience, purpose, duration/page target, target WPS or PowerPoint version, brand constraints and supplied evidence. Do not infer hidden facts from a screenshot or claim to have opened a missing file.
Produce an argument outline before laying out pages. For each slide specify its main message, supported content, layout, native text/shapes/charts, data source, visual assets and speaker notes. Keep citations tied to the supplied claims; label missing figures and images as unresolved.
Prefer editable native text, shapes and charts for content that must remain editable. Clearly identify photographs and flattened graphics. Do not describe a full-slide screenshot as an editable slide. Preserve editable elements when modifying an existing deck and report elements that cannot be reconstructed faithfully.
Use a consistent grid, typography hierarchy and spacing. Check reading order, contrast, text fit, chart labels, units and factual consistency. If the host has file-generation and rendering tools, generate, render and inspect the actual file; otherwise deliver the complete slide blueprint and state that no PPTX has been generated.
Validate the saved PPTX in the requested app when possible. Check font substitutions, chart editability, image quality and requested animations; unsupported features need an explicit fallback. Report passed, failed and untested checks separately. Do not add narration services, API integrations or models without a request.

# CLAUDE.md

## Project Overview

Automation BA Toolkit — a suite of five linked browser-based tools for the complete Business Analysis workflow (process mining → assessment → scoping → business case). Built as a portfolio piece. MIT licensed. Deployed via GitHub Pages at `joshdeadbody.github.io/PDD-planner/`.

**No build step, no framework, no package manager.** Each tool is a single self-contained HTML file with embedded CSS and vanilla JavaScript. They are designed to be used in sequence, passing data between each other via URL parameters.

## File Map

| File | Tool | Lines | Distinct Dependencies |
|------|------|-------|----------------------|
| `index.html` | Landing Page (entry point) | ~350 | None (pure HTML/CSS) |
| `process-mining.html` | Process Mining Visualizer | ~1,875 | Papaparse 5.4, D3.js 7.9, marked, DOMPurify |
| `assessment.html` | Process Assessment Tool | ~1,740 | marked, DOMPurify |
| `PDD planner.html` | Classic RPA PDD Planner | ~2,497 | marked, DOMPurify, Mermaid |
| `Agentic Automation Planner.html` | Agentic Automation Planner | ~2,478 | marked, DOMPurify, Mermaid |
| `Business_Case_Builder.html` | Business Case Builder | ~1,804 | marked, DOMPurify, Chart.js |
| `*.json` | Sample save files for testing | ~20-43 | N/A |
| `*.pdf` | Example filled outputs | N/A | N/A |

**Workflow order (designed):** Process Mining Visualizer → Process Assessment Tool → PDD Planner **or** Agentic Planner → Business Case Builder

## Technology Stack

- **Everything is vanilla.** No React, Vue, jQuery, or any framework. All DOM manipulation is direct `document.getElementById()` / `querySelector()`.
- **All state is in the DOM and module-scoped variables.** There is no centralized state management.
- **CSS:** Custom properties (`:root { --bg, --surface, --border, --accent, ... }`) with distinct themes per tool. No CSS preprocessor.
- **Fonts:** Google Fonts loaded via CDN `<link>` tags. Each tool uses a different combination (Inter, IBM Plex Sans, DM Serif Display, DM Mono, Epilogue).
- **No tests.** No CI/CD. No `.gitignore`.

## CDN Dependencies

Loaded via `<script>` tags from CDN in `<head>`. These are the only external dependencies:

| Library | Used By | Purpose |
|---------|---------|---------|
| `marked` (marked.min.js) | All 5 tools | Markdown → HTML for AI review output |
| `DOMPurify` 3.0.6 | All 5 tools | Sanitize AI-generated HTML before rendering |
| `Papaparse` 5.4 | process-mining.html only | CSV parsing |
| `D3.js` 7.9 | process-mining.html only | Flow graph visualization |
| `Mermaid` | PDD Planner + Agentic Planner | AI-generated flowcharts |
| `Chart.js` | Business Case Builder | Cumulative cash flow chart |

## AI Integration Architecture

All five tools share the same AI calling pattern:

1. **Proxy by default** — a Cloudflare Worker at `https://nameless-sky-595c.joshuatutuianu128.workers.dev/` forwards requests to the AI provider. No API key needed by default.
2. **Toggle to "Custom Key"** — user provides endpoint URL, API key, and model name. Direct `fetch()` with `Authorization: Bearer` header.
3. **Endpoint format:** OpenAI-compatible `/v1/chat/completions` (works with OpenAI, OpenRouter, Ollama, etc.)
4. **API key localStorage keys** (shared names across all tools): `gemini_api_key`, `custom_endpoint`, `custom_model` (the `gemini_` prefix is legacy — it works with any provider).
5. **`PROXY_URL`** is hardcoded as a `const` near the top of each tool's `<script>` block.
6. **Error handling:** Displayed in a `<div id="proxy-fallback-msg">` for proxy failures. Falls back to showing raw error text.

### AI Calling Pattern (pseudocode)

```
if (!useProxy && !apiKey) → warn user
endpoint = useProxy ? PROXY_URL : customUrl
fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(useProxy ? {} : authHeader) },
    body: JSON.stringify({ model, messages, temperature, max_tokens, stream: false })
})
```

### AI Personas per Tool

- **Process Mining Visualizer:** "Process Mining Analyst" — structured sections: Process Summary, Bottlenecks, RPA Suitability, Red Flags
- **Assessment Tool:** "RPA Assessment Reviewer" — viability analysis with PROCEED / INVESTIGATE FURTHER / DO NOT AUTOMATE recommendation
- **PDD Planner:** "Senior RPA Business Analyst Lead" — ROI calculation, challenge exceptions, Mermaid `graph LR` flowchart, Stakeholder Value Score 1–10
- **Agentic Planner:** "Senior AI Agent Architect / Risk Assessor" — challenge weak guardrails, verify blast radius, Mermaid `graph LR` capability map (state diagrams/sequence diagrams explicitly forbidden — `cleanMermaidCode()` sanitizer)
- **Business Case Builder:** "Strict CFO / Financial Approver" — multi-turn conversational chat (not one-shot review), quick-prompt pills ("Challenge Costs", "Pitch to CEO", "Pre-Mortem Rejection")

## URL-Based Inter-Tool Handoff

Tools pass data to each other via URL query parameters, not localStorage. This keeps them stateless and shareable.

- **Encoding:** `encodeA(obj)` = `btoa(encodeURIComponent(JSON.stringify(obj)))` → passed as `?_a=<base64>`
- **Decoding:** `decodeA(str)` = `JSON.parse(decodeURIComponent(atob(str)))`
- **Chain tracking:** `_chain` field (comma-separated tool list, e.g. `"process-mining,assessment"`) and `_has_pmv` boolean flag
- **Transparent bridge:** When Assessment receives PMV data, it merges PMV fields into its outgoing payload, preserving upstream context
- **Key payload fields:** `processName`, `stepsCount`, `exceptionRate`, `bottlenecks`, `aiAnalysis` (truncated), `easeScore`, `benefitScore`, `hoursSaved`, `risks`, `strategicBenefits`, `complianceNotes`

### Handoff Flow

```
PMV → ?_a={_has_pmv:true, processName, caseCount, eventCount, ...}
Assessment → ?_a={_chain:"process-mining,assessment", _has_pmv:true, ...merged...}
PDD/Agentic → ?_a={...all previous..., pdd_data/agentic_data}
Business Case ← receives from any upstream tool
```

Each tool checks `window.location.search` for `_a` on load and pre-fills fields accordingly. An import banner is shown when data is detected.

## localStorage Persistence

Each tool has its own namespace:

| Tool | localStorage Key | Data Shape |
|------|-----------------|------------|
| PDD Planner | `rpa_blueprints_v2` | `{ [slotName]: { projectName, fields[], checks[], sliders[], hook, ts } }` |
| Agentic Planner | `agentic_blueprints_v1` | Same shape |
| Assessment | `rpa_assessments_v1` | Same shape |
| Business Case | `business_cases_v1` | Same shape |

**Common pattern:** `loadSlots()` returns parsed object or `{}`, `saveSlot(name, data)` writes to localStorage, `deleteSlot(name)` removes. Dropdown selector shows timestamped slots. JSON export/import buttons serialize the full slots object.

## Key Patterns When Editing

### CSS
- Each tool defines its own CSS variables in `:root` — do NOT share variables across tools
- Dark mode in Process Mining Visualizer is scoped exclusively to `.flow-graph-panel` (overrides variables within that container)
- Consistent class naming: `.card`, `.section`, `.section-header`, `.label`, `.field`, `.stat-label`, `.stat-value`

### HTML Structure
- Standard pattern: `<div class="wrapper">` (or `.container`) → `<header class="header">` → sections with `<div class="card section">` → footer
- Each phase/section uses `<div class="section-header">` with left border accent
- AI panel is always at the bottom with toggle for custom key

### JavaScript
- Everything in a single `<script>` block at the end of `<body>` (or before `</body>`)
- No modules, no imports (except CDN globals)
- Functions are declared at top level (no IIFE wrapper typically)
- DOM references cached in variables at script top
- `marked.setOptions({ breaks: true, gfm: true })` called early
- DOMPurify used as `DOMPurify.sanitize(marked.parse(text))` for rendering AI output

### Mermaid Flowcharts (PDD + Agentic only)
- Mermaid initialized with `mermaid.initialize({ startOnLoad: false, theme: 'base', ... })`
- `cleanMermaidCode()` in Agentic Planner sanitizes output (strips state diagram syntax, wraps labels in quotes)
- Rendered via `mermaid.render()` into a dedicated panel
- Zoom controls: +/−/Fit buttons with CSS transform scale on the SVG container

## Things to Know Before Editing

1. **These files are large** (up to ~2,500 lines each). Use targeted Edit operations, not full-file rewrites.
2. **No linting or formatting standards.** Match the existing style: 4-space indentation (assessment.html, process-mining.html) or 8-space (PDD.html, Agentic.html, Business_Case.html). **Never mix indentation within a file — it will cause syntax errors.**
3. **The `gemini_api_key` localStorage key is used by all tools** despite the misleading name — it stores any API key, not just Gemini.
4. **URL encoding is fragile.** The `_a` parameter uses `btoa(encodeURIComponent(JSON.stringify(obj)))`. If you add fields to the payload, make sure they're JSON-serializable (no functions, no undefined, no circular refs).
5. **Sample CSV for PMV testing** is generated dynamically by the "Download Sample CSV" link — not a static file.
6. **The Cloudflare Worker proxy** is external infrastructure not in this repo. If it's down, only custom-key mode works.
7. **Each tool page is ~70-100 KB** (HTML + inline CSS + inline JS). Loading additional large libraries or data could cause noticeable performance issues.
8. **Inter-tool handoff depends on URL length limits.** The base64 payload must fit in a URL. AI analysis text is truncated before being added to handoff payloads.
9. **PDF files** in the repo are example outputs only — they're not generated by the code.

## Repository Details

- **Git remote:** `https://github.com/joshdeadbody/PDD-planner.git`
- **Branch:** `master` (only branch)
- **Deployment:** GitHub Pages from `master` branch, root directory
- **License:** MIT (in `LICENSE`)
- **No CI/CD, no tests, no build tools, no .gitignore**

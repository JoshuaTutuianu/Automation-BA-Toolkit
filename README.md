# Automation BA Toolkit — Process Mining, Assessment, Scoping & Business Case Suite

A suite of five linked browser-based tools that replicate the complete Business Analysis workflow for both classic RPA and probabilistic AI agents — from event log mining and suitability assessment through to structured design documentation and financial justification. Built as a portfolio piece demonstrating practical Business Analysis methodology.

No installation. No account. Runs entirely in the browser.

**Live tool:** [joshdeadbody.github.io/Automation-BA-Toolkit](https://joshdeadbody.github.io/Automation-BA-Toolkit/)

---

## The Workflow

The tools are designed to be used in sequence, with the Process Mining Visualizer as the preferred entry point:

1. Open the **Process Mining Visualizer** (`index.html`)
2. Upload a CSV event log — the tool maps the process flow, surfaces bottlenecks, flags outliers, and provides AI analysis
3. Click **"Pre-fill Assessment"** to send metrics to the Assessment Tool, or send directly to a planner
4. In the **Process Assessment Tool** (`assessment.html`), complete the remaining suitability questions
5. Choose your pipeline: **"Send to RPA PDD Planner"**, **"Send to Agentic Planner"**, or **"Build Business Case"** — all parameters pass automatically via URL
6. The selected Planner or Builder opens with all relevant context pre-filled (Assessment scores + Process Mining metrics)
7. Complete the remaining discovery phases and export your Markdown document

**All routing paths:**

```
Process Mining Visualizer  ──→  Process Assessment Tool  ──→  PDD Planner  ──→  Business Case Builder
         │                                      │                                        ^
         └──→ PDD Planner (direct)              └──→ Agentic Planner  ───────────────────┘
         └──→ Agentic Planner (direct)
```

When the Assessment Tool receives Process Mining data, it acts as a transparent bridge — merging PMV fields into its outgoing payload so downstream tools receive the combined dataset.

---

## Tool 0 — Process Mining Visualizer

Upload an event log CSV to map process flows, surface bottlenecks, and assess automation potential with hard data before any scoping begins. Serves as the data-driven entry point to the suite.

**Core features:**
- Drag-and-drop CSV upload (required columns: case_id, activity, timestamp — flexible column name aliases supported)
- D3.js flow graph visualization with topological layered layout, frequency-weighted edges, and color-coded durations
- Interactive frequency filter slider to declutter low-volume transitions
- Sortable data dump tables: Transitions, Paths, Nodes
- Outlier detection (≥2σ from mean) with per-transition filtering
- Incomplete case reporting against the most common terminal activity
- Auto-fitted zoom/pan with restore-preserving re-renders
- Sample CSV download for instant testing

**AI reviewer:** Analyzes the hard process mining data and returns structured findings across four sections — Process Summary, Bottlenecks, RPA Suitability Assessment, and Red Flags.

**Forward to Pipeline bar:** Available after CSV upload. Sends process name, case/event/activity counts, top path, transitions summary, outlier/incomplete counts, bottleneck nodes, and truncated AI analysis to any downstream tool.

---

## Tool 1 — Process Assessment Tool

Based on UiPath's automation suitability scoring model. Determines whether a process is worth automating before any discovery work begins, and helps decide if the solution requires rigid RPA or an autonomous agent.

**Eliminatory gates** — hard stops that end the assessment immediately if triggered:
- Non-digital or heavily physical input types
- Process relies entirely on subjective human judgment

**Postponement gates** — flags that don't eliminate but mark the process as not yet ready:
- Process or supporting applications are actively changing or unstable

**Weighted scoring** — once past the gates, the tool scores across two independent dimensions:
- **Ease of Implementation:** process stability, application count, step count, decision complexity, data structure — with multipliers for thin client (1.6×) and OCR dependency (1.2×)
- **Benefit / Suitability:** digital data percentage, exception rate, data structure, decision complexity
- **Bandwidth Freed:** calculated as Benefit × Frequency × Volume × AHT ÷ 60 (man-hours/year)

**Additional features:**
- localStorage save/load with named slots and timestamped dropdown selector
- JSON export/import for portability
- PMV import banner — when opened from the Process Mining Visualizer, pre-fills process name, steps count, exception rate, and contextual notes
- Clear & Reset with confirmation

**AI reviewer** — reads both the hard scores and the free-text notes, providing a structured assessment of viability, flagged risks, and a final recommendation (PROCEED / INVESTIGATE FURTHER / DO NOT AUTOMATE).

---

## Tool 2 — Classic RPA PDD Planner

Structures the Process Design Document for deterministic, hard-coded robots. Focuses on mapping the exact "happy path" and strict exception handling.

**Phases:**
1. AS-IS Process Mapping (with Feasibility Gate checklist)
2. Business Value & ROI (with Data Confidence slider)
3. Technical & Business Exceptions (with Exception Mapping Confidence slider)
4. Dependency Mapping
5. The TO-BE Automated State (with Architecture Confidence slider)
6. Edge Case Audit (with self-check checklist and Worst-Case Scenario)
7. PDD Readiness Gate (final QA checklist)

**Additional features:**
- Live status bar: Phases Open (0/7), Items Checked, Fields Filled (%), Avg Confidence
- Confidence sliders (1–10) per phase with low-confidence warning flags (<7)
- Time-boxing pills (15 min, 30 min, 1 hour, Open)
- localStorage save/load with named slots
- JSON export/import
- "The PM Move" Next Action hook — captures the specific next step to move the pipeline forward
- "Build Business Case →" button — sends completed PDD data to the Business Case Builder

**AI Reviewer Persona:** Senior RPA Business Analyst Lead. Evaluates feasibility gate items, calculates ROI from raw volume/time data, challenges missing exceptions and undefined dependencies, outputs a Stakeholder Value Score (1–10), and generates a Mermaid.js `graph LR` flowchart of the mapped process.

**Flowchart Visualizer:** AI-generated Mermaid.js diagrams render in a dedicated panel with zoom controls (+/−/Fit) and mouse-wheel zoom. Diagrams use a compact left-to-right layout with nodes capped at 20.

---

## Tool 3 — Agentic Automation Planner (AAP)

Structures the design document for probabilistic AI agents. Shifts the BA focus away from step-by-step instructions toward mapping objectives, tool boundaries, and risk mitigation.

**Phases:**
1. Mission & Context (Objective State, Context Payload, Success Metrics & KPIs)
2. The Toolkit (Data Sensitivity, Tool Scope, Blacklist — with Tooling Confidence slider)
3. Guardrails & Boundaries (Behavioral Rules, Negative Boundaries, Known Limitations)
4. Autonomy & Handoffs (Autonomy Thresholds, Escalation Triggers)
5. Identity, Access & Governance (Execution Identity, Regulatory Compliance, Blast Radius, Escalation Owner)
6. Verification Artifacts & Audit Gates (Required Proof of Work, Audit Mechanism, Format Verification checklist)
7. Readiness Gate (final deployment checklist)

**Additional features:** Same status bar, confidence sliders, time-boxing, save/load, JSON export/import, Next Action hook, and "Build Business Case →" button as the PDD Planner.

**AI Reviewer Persona:** Senior AI Agent Architect / Risk Assessor. Aggressively challenges weak guardrails, broad permissions, and lack of deterministic verification artifacts. Fails the assessment if the Blast Radius is not mitigated by the Required Proof of Work. Outputs a Stakeholder Value Score (1–10) and generates a Mermaid.js `graph LR` capability map. The tool includes a `cleanMermaidCode()` sanitizer that actively converts state diagram syntax to graph LR and wraps all node labels in double quotes to prevent parsing errors.

**Flowchart Visualizer:** Same zoomable Mermaid.js panel as the PDD Planner. Strictly uses `graph LR` layout — state diagrams and sequence diagrams are explicitly forbidden and auto-converted.

---

## Tool 4 — Business Case Builder

Structures the financial justification and executive sign-off for automation initiatives. Translates technical scoping into business value to secure budget approval.

**Phases:**
1. **The Financial Model** — Dev hours, blended rate, license/infra costs vs. hours saved, exception handling overhead, and fully loaded FTE cost. Auto-calculates Total Implementation Cost, Annual Financial Benefit, 12-Month ROI, and Payback Period.
2. **Strategic Benefits** — Productivity Gains, Quality & Compliance Enhancements, Employee Experience Impact
3. **Risks & Mitigation** — Primary Execution Risks and Mitigation Strategy (pre-filled with exceptions and boundaries from upstream tools)
4. **Recommendation & Sign-Off** — Final verdict (Proceed / Hold / Reject) and Executive Summary Narrative

**Live ROI Dashboard:** Four metric cards updating in real time as costs and savings are entered.

**Chart.js Cumulative Cash Flow Graph:** Bar chart visualizing Year 0 (Launch) through Year 3 cumulative cash flow, color-coded green for positive and red for negative.

**Additional features:**
- localStorage save/load with named slots
- JSON export/import
- Markdown export with embedded AI CFO assessment
- Import banner — receives data from Assessment Tool, PDD Planner, or Agentic Planner, pre-filling initiative name, hours saved, risks, strategic benefits, and compliance notes

**AI Reviewer Persona:** Strict CFO / Financial Approver. This is a **multi-turn conversational chat** — unlike the one-shot reviews in the other tools. The AI challenges underestimated costs, overly optimistic savings, and scores the likelihood of budget approval. Quick-prompt pills allow instant follow-ups: "Challenge Costs", "Pitch to CEO", and "Pre-Mortem Rejection".

---

## AI & API Setup

All five tools use a **proxy by default** — no API key required. This ensures the AI reviewer works out of the box for anyone accessing the tool, including recruiters or practitioners who may not have their own key.

**Using your own key and model:**

The tools support any OpenAI-compatible endpoint. In the API settings panel (toggle "Custom Key"):
- Paste your **Base URL** (e.g. `https://api.openai.com/v1`, `https://openrouter.ai/api/v1`, or any compatible endpoint)
- Paste your **API Key**
- Specify the **model name** (e.g. `gpt-4o`, `o1`, `gemini-2.5-pro`, `mistral-large`)

This means the tools are compatible with OpenAI, OpenRouter, Anthropic (via compatible wrappers), locally hosted models via Ollama, or any provider following the OpenAI API standard.

Configuration is persisted in localStorage per tool and can be cleared with the × button.

---

## Methodology Notes

**Process Mining Visualizer** — the D3 flow graph, outlier detection (2σ threshold), and bottleneck identification provide a data-driven foundation before subjective assessment begins. The frequency filter allows analysts to isolate the dominant process flow from noise.

**Assessment Tool** — the scoring model and gate logic are based on industry-standard suitability frameworks, adapted for browser-based use with additional weighting for thin client and OCR scenarios that are commonly underestimated during scoping.

**Deterministic vs. Probabilistic Scoping** — The split between the two planners reflects the reality of modern automation. If a process relies on stable UIs and structured data, the RPA PDD Planner ensures tight, step-by-step governance. If a process relies on unstructured data and dynamic routing, the Agentic Planner ensures the blast radius is contained and the agent's output is highly auditable.

**The Business Case Handoff** — The addition of the Business Case Builder bridges the gap between technical Business Analysis and executive sponsorship. It ensures that before a line of code is written, the initiative makes financial sense and has a clear payback period.

**URL-based handoff** — the tools pass parameters to each other via URL (`_a` parameter with base64-encoded JSON) rather than localStorage. This keeps them stateless, independently usable, and easy to share or bookmark at any point in the workflow. The Assessment Tool acts as a transparent bridge, merging Process Mining data into its outgoing payload so downstream planners receive the complete dataset.

**Hybrid chain support** — when data flows through multiple tools (e.g. PMV → Assessment → PDD → Business Case), all upstream context is preserved via the `_chain` and `_has_pmv` flags. Each tool appends its own layer without overwriting prior data.

---

## License

MIT — free to use, modify, and deploy, including within an organisation. See `LICENSE` for details.

---

*Built by Tutuianu Joshua | RPA & Agentic BA Portfolio | [GitHub](https://github.com/joshdeadbody)*

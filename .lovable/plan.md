# AI Document Summarizer — Plan

A modern, single-page web app that turns long PDF/TXT documents into structured, AI-generated summaries with quality checks. No login, no database — fully stateless.

## User flow

1. Land on a clean hero page explaining the tool.
2. Drag & drop or browse a **PDF or TXT** file (max ~10 MB).
3. See an **extracted text preview** (first ~800 words) in a scrollable card.
4. Choose summary **length** (Short / Medium / Detailed) and optional **language**.
5. Click **Summarize** → progress loader animates through stages (Extracting → Chunking → Summarizing → Evaluating).
6. Output appears in card sections:
   - **Key Points** (bulleted)
   - **Important Insights**
   - **Conclusion**
7. **Quality panel** shows AI-rated Faithfulness, Coherence, Readability (0–100 with progress bars + short rationale).
8. Actions: **Copy to clipboard**, **Download as PDF**, **Reset**.

## Pages / routes

- `/` — full app (upload + summary + quality). Single page, card-based.
- `/about` — short page describing how it works (architecture diagram, tech, prompt design) — gives it the "final-year project" feel.

## How summarization works (technical)

- **PDF parsing**: client-side with `pdfjs-dist` (Worker-compatible, no native deps). TXT read directly.
- **Chunking**: split extracted text into ~3000-token chunks with ~200-token overlap.
- **Server function** `summarizeDocument` (TanStack `createServerFn`) accepts `{ chunks, length, language }`.
  - **Map step**: each chunk summarized in parallel via Lovable AI Gateway (`google/gemini-3-flash-preview`) with a structured tool-call returning `{keyPoints[], insights[], conclusion}`.
  - **Reduce step**: combined chunk summaries fed back to the model with the "professional research analyst" persona to produce the final structured summary at the requested length.
- **Quality scoring**: a second server function `evaluateSummary` sends source + summary to the model with a JSON-schema tool returning faithfulness/coherence/readability scores and one-line rationales.
- All AI calls go through Lovable AI Gateway (no API key needed).

> Note on the original spec: this project runs on TanStack Start (TS), not Python/FastAPI — same architecture, just in the supported stack. ROUGE is omitted (per your choice); qualitative AI-rated checks are kept.

## Design

- **Style**: minimal, modern, Gen-Z friendly. Generous spacing, rounded-2xl cards, soft shadows, subtle gradient accents.
- **Theme**: dark + light toggle (persisted in localStorage), accessible contrast.
- **Color**: indigo/violet primary with a soft accent gradient for the hero and CTA.
- **Typography**: Inter; large headings, comfortable body.
- **Motion**: fade/slide-in on summary reveal, animated progress steps, hover lift on cards.
- **Responsive**: mobile-first; upload + summary stack vertically on small screens, two-column on desktop.

## Components

- `Header` (logo, theme toggle, About link)
- `Hero` (title, one-liner, CTA scroll)
- `UploadCard` (drag-drop, file info, extracted text preview)
- `ControlsCard` (length toggle group, language select, Summarize button)
- `ProgressStepper` (4 animated stages)
- `SummaryCard` (Key Points / Insights / Conclusion sections, copy button, download PDF)
- `QualityCard` (3 progress bars + rationales)
- `Footer`

## Out of scope (can add later)

History, accounts, multi-model toggle UI, sentence highlighting, ROUGE scoring.

## Deliverables

- Fully working app at `/` with About page
- Reusable shadcn components, dark/light mode, mobile responsive
- PDF download of summary
- Clean, modular code ready for demo

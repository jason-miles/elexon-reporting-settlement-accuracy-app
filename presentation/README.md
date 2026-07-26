# Elexon Settlement Accuracy App — Presentation

A **show-don't-tell** presentation for the Elexon Reporting Settlement Accuracy App, built using the [show-not-tell-apps](https://github.com/daniel-zoccali_data/show-not-tell-apps) template.

## Features

- **Scroll mode** — Vertically stacked sections (default)
- **Slide mode** — Full-viewport with keyboard navigation (← → arrows, Space, Escape, F for fullscreen)
- **Download** — Export as PDF or PPTX
- **C4 Architecture diagrams** — As-Is and To-Be diagrams for Elexon settlement monitoring

## Running the Presentation

```bash
cd presentation
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Integration with APX App

When you build a Databricks APX app for the Elexon project, you can integrate this presentation:

1. Copy `src/components/SlideDeck.tsx`, `MermaidDiagram.tsx`, and `Presentation.tsx` into your APX app
2. Add a route for `/presentation` (e.g. `routes/_sidebar/presentation.tsx`)
3. Add a "Presentation" item to the sidebar navigation
4. Install dependencies: `bun add mermaid html2canvas jspdf pptxgenjs lucide-react`

## Source

Content is derived from `docs/PRD.md` — the single source of truth for the presentation.

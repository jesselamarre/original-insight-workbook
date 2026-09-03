# Original Insight

**A 3-week digital validation workbook for early-stage founders and researchers.**
Designed by [Lighthouse](https://lighthouse.ku.dk), University of Copenhagen.

🔗 **Live site:** _https://jesselamarre.github.io/original-insight-workbook/_

---

## What this is

Original Insight is a self-guided, browser-based workbook that walks founders, student innovators, and researchers through a disciplined process for validating an early-stage idea, in three weeks instead of a full semester (or a funding round).

It's adapted from the Lighthouse Launch program's six-session curriculum, compressed into a self-serve format anyone can work through on their own, with a co-founder, or as part of a research team.

The whole thing is a single static website: no accounts, no backend, no data collection. Everything a visitor types is saved locally in their own browser and never leaves their device.

## Who it's for

Anyone with an early idea for a product, service, or social venture who wants to test it against reality before building it, most commonly:
- University students and researchers exploring a spin-out or venture idea
- Early-stage founders doing pre-seed validation
- Innovation program cohorts (Lighthouse's own, or others adapting this format)

## What's inside

| Section | What it covers |
|---|---|
| **Start Here** | The reasoning behind the process: why problem comes before solution, the math behind pivoting, and the ground rules for the three weeks. |
| **Week 1 — Define & Map** | A guided problem-statement builder, plus a picker between three fillable business model canvases (Lean, Social Business Model, Service Mapping), problem red flags, and the problem-solution fit spectrum. |
| **Week 2 — Rank & Prioritize** | A dynamic Assumption Bank, repeatable Risk Profile cards, and a Prioritization Table that automatically calculates Risk and Priority scores as you type. |
| **Week 3 — Experiment & Learn** | Five tabbed Experiment Design Canvases, a filterable menu of 18 validation experiment patterns, and guidance for running and reviewing results. |
| **Reference** | A 4-question diagnostic that recommends which canvas to start with, plus a searchable glossary. |

Every section ends with a **Field Notes** reflection box — short prompts designed to make the actual thinking visible, not just the outputs.

## How to use it (for visitors)

1. Open the site and start with the **Start Here** tab, it's short, but the reasoning underneath the three weeks makes everything after it click.
2. Work through **Week 1 → Week 2 → Week 3** in order, they build on each other.
3. Fill in fields as you go. Everything **autosaves automatically** to your browser as you type (look for the small dot that flashes next to a field after you edit it).
4. Use the **sidebar progress bars** to see how much of each week you've filled in.
5. Use the **download icon** (top right) at any point to export a plain-text copy of everything you've answered, useful as a backup, or to paste into a doc or share with a teammate.
6. Use the **print icon** to generate a clean, printable version of the whole workbook (including all five experiment canvases), handy for saving as a PDF or printing on paper.
7. The **reset icon** clears all saved answers in that browser, this can't be undone, so export first if you want to keep a copy.

**Note on privacy:** since answers are stored only in each visitor's own browser (via `localStorage`), nobody, including whoever hosts the site, can see what any individual visitor has typed. There's no server, database, or account system.

## Project structure

```
├── index.html      # All page content and markup (single-page app, tab-based navigation)
├── styles.css      # All visual styling, including the color palette and print stylesheet
└── script.js       # Navigation, autosave, dynamic tables, progress tracking, export/print/reset
```

No build step, no dependencies, no package manager. It's plain HTML, CSS, and JavaScript, open `index.html` directly in a browser and it works.

## Running it locally

Just open `index.html` in any modern browser, everything works offline except the University of Copenhagen logo in the top bar, which is loaded from KU's own design guide site.

## Hosting it

This repository is set up to be published directly via **GitHub Pages** (Settings → Pages → Deploy from a branch → `main` → `/root`). Once enabled, GitHub will publish it at `https://<yourusername>.github.io/<repo-name>/`.

## Customizing

- **Colors and fonts:** all defined as CSS custom properties at the top of `styles.css` (the `:root` block). Change a value there and it updates everywhere that color is used.
- **Content:** all workbook text lives directly in `index.html`, organized into `<section class="panel">` blocks, one per tab.
- **The KU logo:** currently loaded from `https://designguide.ku.dk/download/co-branding/ku_logo_uk_hh.png`. To host it yourself instead, download the file, add it to this repository, and update the `src` attribute in the `.ku-brand` block in `index.html`.

## License

_License to be confirmed with Lighthouse / University of Copenhagen before publishing._

Once decided, this section should state either:
- **All rights reserved** (default if no license file is added), or
- The terms of an open license such as **Creative Commons Attribution-NonCommercial-ShareAlike 4.0**, if Lighthouse wants to formally permit other educators or institutions to reuse and adapt this workbook.

## Credits

Adapted from the **Lighthouse Launch** program materials (Sessions 1 through 6) by [Lighthouse](https://lighthouse.ku.dk), University of Copenhagen, for self-guided use by student founders and researchers.

# ADR-0019: Generate the resume from one canonical career record

- Status: Proposed
- Date: 2026-08-24

## Context

`public/resume.pdf` was a checked-in binary with no source in the repo — the
README's instruction was literally "drop the PDF here". Meanwhile
`src/content/portfolio.ts` described the same career, in different words, as a
second hand-maintained copy. Nothing connected them, and they drifted:

- the site said the GE years ran `2015 – 2018`; the earliest date anyone can
  source is Jul 2016, which is what the resume said;
- a comment in `portfolio.ts` (echoed in its test) asserted that Deloitte's
  internal HR title was "Lead Infrastructure Engineer II". It is simply
  "Manager" — the Deloitte rank, no discipline attached (confirmed 2026-08-22);
- two of the four certifications on the resume are expired (AWS DevOps Engineer
  – Professional, Apr 2021–Apr 2024; Certified SAFe 5 POPM, Feb 2023–Feb 2024)
  and were listed undated, which reads as a current credential;
- "Go" was absent from the languages line while a Go KEDA external scaler was
  one of the projects on the page.

A resume is also read by machines before it is read by people. Whatever produces
it has to guarantee a real text layer: no images of text, no multi-column
layout, no subsetted font that breaks copy-paste.

## Decision

- **`src/content/career.ts` is the canonical career record.** Employment dates,
  job titles, role bullets, the org size, skills, certifications and education
  are written there exactly once. `portfolio.ts` derives the site from it;
  `scripts/generate-resume.mts` renders the PDF from it. Site prose (headline,
  value prop, about paragraphs, project copy) stays in `portfolio.ts`.
- **`pnpm resume` regenerates the PDF.** `public/resume.pdf` is generated, never
  hand-edited, and a unit test fails if the committed file is not byte-identical
  to what the data produces. The generator is therefore deterministic — no
  `/CreationDate`, no file id, no clock.
- **The generator is hand-rolled and has zero dependencies**
  (`src/lib/resume/`). It runs on Node 24's built-in TypeScript stripping, which
  is why the modules under `src/lib/resume/` use explicit `.ts` import
  specifiers and `tsconfig.json` sets `allowImportingTsExtensions` (safe under
  `noEmit`).
  - Headless Chrome (`page.pdf`) was rejected: a browser download in CI to
    typeset ~55 lines of text, and it re-encodes fonts on output — the exact
    failure mode an ATS-parseable resume must not have.
  - `pdfkit` / `@react-pdf/renderer` were rejected: a font engine and a dozen
    transitive packages for a job that needs "put a string at (x, y)".
  - LaTeX/Typst were rejected: an external binary CI does not have.
- **ATS-parseability is a property of the output, enforced by tests.** Base-14
  fonts (`Helvetica`, `-Bold`, `-Oblique`) with `/Encoding /WinAnsiEncoding`,
  nothing embedded and nothing subsetted; a single column; conventional section
  headings; text emitted in reading order. A character WinAnsi cannot represent
  is a hard error, not a silent `?`.
- **One page is enforced structurally.** `fitResume()` returns the largest body
  size in a narrow band that fits and throws otherwise.
- **Two cuts, one published.** `public/resume.pdf` is the leadership cut and the
  only one the site offers. The IC / AI-infrastructure cut reorders and
  reweights the *same* verified bullets and is written to `resumes/`
  (gitignored) for attaching to applications by hand. It must never be emitted
  into `public/`: this is a static export (ADR-0018), so a file under `public/`
  is copied to `out/` and served at a guessable URL whether or not anything
  links to it — "unlinked" is not "unpublished". A test asserts that only a
  `published` variant may target `public/`.

## Consequences

- A career fact can now only be changed in one place, and the shipped PDF cannot
  lag behind it: `pnpm test` fails until `pnpm resume` has been run.
- The site's Experience section now shows the resume's own quantified bullets
  rather than shortened paraphrases of them. That is the point — the paraphrases
  were the second copy.
- Base-14 fonts are resolved by the viewer rather than embedded. Every mainstream
  reader (Preview/Quartz, Acrobat, Chrome's PDFium) ships them; a viewer without
  a real Helvetica-Bold will substitute a face and the bold weight may not show.
  That is the accepted cost of guaranteeing a clean text layer, and it is why the
  layout never depends on weight alone to carry meaning.
- The font width tables in `font-metrics.ts` are load-bearing and are calibrated
  against measurements poppler took from the *previous* PDF. A wrong table does
  not throw; it wraps lines in the wrong place. Recalibrate before changing them.
- Adding content is now bounded by the page: when `fitResume()` throws, the fix
  is to cut a bullet, not to shrink the type.

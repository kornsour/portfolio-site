/**
 * Regenerate the resume PDFs from `src/content/career.ts`.
 *
 *   pnpm resume                    # both cuts
 *   pnpm resume --variant=em       # leadership cut only  → public/resume.pdf
 *   pnpm resume --variant=ic       # IC cut only          → resumes/…_ic.pdf
 *   pnpm resume --check            # fail if the PUBLISHED PDF is stale
 *   pnpm resume --text             # also print the extracted text layer
 *
 * TWO CUTS, ONE PUBLISHED. `public/resume.pdf` is the leadership cut and the
 * only one the site offers — it is what `person.resumeHref` points at. The IC
 * cut is a real, finished artifact Andrew attaches to individual applications
 * by hand, and it is written to a top-level `resumes/` directory *outside*
 * `public/` on purpose: this site is a static export, so every file under
 * `public/` is copied into `out/` and served at a guessable URL whether or not
 * anything links to it. Not linking a file is not the same as not publishing
 * it.
 *
 * Run with Node's built-in TypeScript stripping (Node >= 24, which this repo
 * already pins in `engines` and `.nvmrc`) — hence the explicit `.ts` extensions
 * on the imports below. No bundler, no ts-node, no new dependency.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type VariantId, VARIANTS } from "../src/lib/resume/document.ts";
import { extractPdfText } from "../src/lib/resume/extract-text.ts";
import { generateResume } from "../src/lib/resume/generate.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const allVariants = Object.keys(VARIANTS) as VariantId[];

const args = process.argv.slice(2);
const check = args.includes("--check");
const showText = args.includes("--text");
const variantArg = args.find((arg) => arg.startsWith("--variant="))?.split("=")[1];
const requested: VariantId[] =
	variantArg === undefined || variantArg === "all" ? allVariants : [variantArg as VariantId];

for (const id of requested) {
	if (!(id in VARIANTS)) {
		console.error(`Unknown variant "${id}". Known: ${allVariants.join(", ")}`);
		process.exit(1);
	}
}

let stale = false;

for (const id of requested) {
	const result = generateResume(id);
	const target = resolve(repoRoot, result.output);

	if (check) {
		// Only the published cut is committed, so it is the only one that CAN be
		// stale. The IC cut is gitignored and regenerated on demand.
		if (!result.published) continue;
		let existing: Buffer | null = null;
		try {
			existing = readFileSync(target);
		} catch {
			existing = null;
		}
		const same = existing !== null && existing.equals(result.pdf);
		console.log(`${same ? "✓" : "✗"} ${result.output} ${same ? "up to date" : "STALE"}`);
		if (!same) stale = true;
		continue;
	}

	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, result.pdf);
	console.log(
		`${result.output} — ${VARIANTS[id].label}${result.published ? "" : " (not published)"}, ` +
			`${result.bodySize}pt body, content ends at ${result.contentBottom.toFixed(1)}pt of 758, ` +
			`${result.pdf.length.toLocaleString()} bytes`,
	);

	if (showText) {
		console.log(`\n--- extracted text layer: ${result.output} ---`);
		console.log(extractPdfText(result.pdf).text);
		console.log("--- end ---\n");
	}
}

if (stale) {
	console.error("\nThe committed PDF does not match src/content/career.ts. Run: pnpm resume");
	process.exit(1);
}

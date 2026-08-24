import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	certifications,
	education,
	formatMonthYear,
	identity,
	independentEngineering,
	positionById,
	positions,
	skillRows,
} from "../../content/career.ts";
import { buildResumeDocument, VARIANTS } from "./document.ts";
import { extractPdfText } from "./extract-text.ts";
import { generateResume } from "./generate.ts";
import { PAGE_BOTTOM_LIMIT } from "./layout.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");

/** The text an ATS would pull out of the shipped resume. */
const shipped = generateResume("em");
const shippedText = extractPdfText(shipped.pdf).text;

describe("the generated resume is what an ATS can read", () => {
	it("emits exactly one page", () => {
		expect(extractPdfText(shipped.pdf).pageCount).toBe(1);
		expect(shipped.contentBottom).toBeLessThanOrEqual(PAGE_BOTTOM_LIMIT);
	});

	it("extracts every bullet, title, employer and date from the source data", () => {
		// This is the diff that proves ATS-parseability: every fact in the source
		// has to come back out of the file. If a glyph is unencodable or a run is
		// dropped, this is where it surfaces.
		const missing: string[] = [];
		const flat = shippedText.replace(/\n/g, " ").replace(/\s+/g, " ");

		const expected: string[] = [
			identity.fullName.toUpperCase(),
			identity.email,
			identity.phone,
			identity.location.resume,
			identity.linkedin.display,
			identity.github.display,
			identity.website,
			independentEngineering.heading,
			education.school,
			education.degree,
			education.minors,
			formatMonthYear(education.graduated),
			...positions.flatMap((position) => [
				position.title,
				position.employer,
				position.location,
				...position.bullets.map((bullet) => bullet.text),
			]),
			...independentEngineering.bullets.map((bullet) => bullet.text),
			...skillRows.flatMap((row) => [row.label, row.text]),
			...certifications.map((certification) => certification.name),
		];

		for (const value of expected) {
			// Wrapping inserts line breaks; compare against the whitespace-flattened
			// text so a wrapped sentence still has to appear verbatim.
			if (!flat.includes(value.replace(/\s+/g, " "))) missing.push(value);
		}
		expect(missing).toEqual([]);
	});

	it("dates the Deloitte role from Jan 2021", () => {
		const deloitte = positionById("deloitte");
		expect(deloitte.start).toEqual({ year: 2021, month: 1 });
		expect(deloitte.end).toBeNull();
		expect(shippedText).toContain("Jan 2021 – Present");
	});

	it("uses the functional title, spelled out", () => {
		expect(shippedText).toContain("Engineering Manager, Platform Engineering");
	});

	it("lists Go among the languages", () => {
		const languages = skillRows.find((row) => row.id === "languages");
		expect(languages?.text).toMatch(/\bGo\b/);
		expect(shippedText).toMatch(/Languages:?[\s\S]*\bGo\b/);
	});

	it("renders an expired certification's expiry, so it cannot read as current", () => {
		const expired = certifications.filter((certification) => certification.status === "expired");
		expect(expired.length).toBeGreaterThan(0);
		for (const certification of expired) {
			expect(certification.expires).not.toBeNull();
			const expires = certification.expires;
			if (!expires) continue;
			expect(shippedText.replace(/\n/g, " ")).toContain(`expired ${formatMonthYear(expires)}`);
		}
		// The two we have no dates for stay undated rather than being guessed at.
		const unknown = certifications.filter((certification) => certification.status === "unknown");
		for (const certification of unknown) {
			expect(certification.issued).toBeNull();
			expect(certification.expires).toBeNull();
		}
	});

	it("keeps the independent projects out of the employment history", () => {
		// ADR-free but load-bearing: these are personal projects and must never
		// carry an employer or a date, on any variant.
		for (const variantId of Object.keys(VARIANTS) as (keyof typeof VARIANTS)[]) {
			const document = buildResumeDocument(variantId);
			const blocks = document.sections.flatMap((section) => section.blocks);
			const independent = blocks.find(
				(block) => block.kind === "entry" && block.title === independentEngineering.heading,
			);
			if (independent && independent.kind === "entry") {
				expect(independent.dates).toBeUndefined();
				expect(independent.subtitle).toBeUndefined();
			}
		}
	});

	it("embeds no fonts and subsets nothing — the reason the text extracts at all", () => {
		const raw = Buffer.from(shipped.pdf).toString("latin1");
		expect(raw).toContain("/BaseFont /Helvetica");
		expect(raw).toContain("/Encoding /WinAnsiEncoding");
		expect(raw).not.toContain("/FontFile");
		expect(raw).not.toContain("/Subtype /TrueType");
	});

	it("keeps public/resume.pdf byte-identical to what the data generates", () => {
		// The whole point of the exercise: the committed PDF cannot drift from
		// src/content/career.ts, because this fails the moment it does.
		const committed = readFileSync(resolve(repoRoot, "public/resume.pdf"));
		expect(committed.equals(shipped.pdf), "public/resume.pdf is stale — run `pnpm resume`").toBe(
			true,
		);
	});
});

describe("resume variants", () => {
	it("publishes exactly one cut, and only that cut may live under public/", () => {
		// This is a STATIC EXPORT: everything under public/ is copied into out/
		// and served at a guessable URL whether or not a link points at it. So
		// "the site offers the leadership cut" has to be enforced by where the
		// file is written, not by which links exist.
		const published = Object.values(VARIANTS).filter((variant) => variant.published);
		expect(published.map((variant) => variant.id)).toEqual(["em"]);
		expect(VARIANTS.em.output).toBe("public/resume.pdf");
		for (const variant of Object.values(VARIANTS)) {
			expect(variant.output.startsWith("public/")).toBe(variant.published);
		}
	});

	it("promotes the independent engineering work in the IC cut", () => {
		const em = buildResumeDocument("em").sections.map((section) => section.heading);
		const ic = buildResumeDocument("ic").sections.map((section) => section.heading);
		expect(em).toEqual(["SUMMARY", "EXPERIENCE", "SKILLS", "EDUCATION"]);
		expect(ic.indexOf("INDEPENDENT ENGINEERING")).toBeLessThan(ic.indexOf("EXPERIENCE"));
	});

	it("reweights the IC cut without dropping the leadership evidence entirely", () => {
		const icDeloitte = buildResumeDocument("ic")
			.sections.find((section) => section.heading === "EXPERIENCE")
			?.blocks.find(
				(block) => block.kind === "entry" && block.title === positionById("deloitte").title,
			);
		expect(icDeloitte?.kind).toBe("entry");
		if (icDeloitte?.kind !== "entry") return;
		// The platform-architecture bullet leads; the org-building bullet is still
		// there, just last. An IC cut that erased "built and leads a 33-person
		// org" would be throwing away the strongest credibility signal on the page.
		expect(icDeloitte.bullets[0]).toContain("multi-tenant Kubernetes platform");
		expect(icDeloitte.bullets.at(-1)).toContain("four-squad Platform Engineering organization");
	});

	it("reorders the skill categories without dropping one", () => {
		const rowIds = skillRows.map((row) => row.id);
		for (const variant of Object.values(VARIANTS)) {
			expect([...variant.skillOrder].sort()).toEqual([...rowIds].sort());
		}
		expect(VARIANTS.em.skillOrder[0]).toBe("leadership");
		expect(VARIANTS.ic.skillOrder[0]).toBe("platform");
	});

	it("never introduces a fact the default resume does not already state", () => {
		const emBullets = new Set([
			...positions.flatMap((position) => position.bullets.map((bullet) => bullet.text)),
			...independentEngineering.bullets.map((bullet) => bullet.text),
		]);
		const icDocument = buildResumeDocument("ic");
		for (const section of icDocument.sections) {
			for (const block of section.blocks) {
				if (block.kind !== "entry") continue;
				for (const bullet of block.bullets) expect(emBullets.has(bullet)).toBe(true);
			}
		}
	});

	it("still fits on one page", () => {
		for (const variantId of Object.keys(VARIANTS) as (keyof typeof VARIANTS)[]) {
			const result = generateResume(variantId);
			expect(extractPdfText(result.pdf).pageCount).toBe(1);
			expect(result.contentBottom).toBeLessThanOrEqual(PAGE_BOTTOM_LIMIT);
		}
	});
});

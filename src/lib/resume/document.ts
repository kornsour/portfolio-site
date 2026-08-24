/**
 * Turn the canonical career record into a variant-resolved, layout-ready
 * document.
 *
 * THE VARIANT MECHANISM. Andrew targets both leadership and individual
 * contributor roles (the hard gates are remote-US and total comp, not
 * seniority), and one resume written entirely in manager voice under-serves a
 * Staff/Principal AI-infrastructure application. A variant therefore does three
 * things and only these three — it never introduces a fact:
 *
 *   1. picks a summary (both live in `career.ts`),
 *   2. re-orders and filters bullets by their per-variant weight,
 *   3. re-orders sections — specifically, whether Independent Engineering sits
 *      as a trailing entry inside EXPERIENCE (leadership cut, where employment
 *      history leads) or as its own section above it (IC cut, where the
 *      hands-on inference work is the pitch).
 *
 * Because every string still comes from `career.ts`, a variant cannot say
 * anything the default resume does not already say.
 */

import {
	type Bullet,
	certifications,
	education,
	formatCertificationDates,
	formatMonthYear,
	formatResumePeriod,
	identity,
	independentEngineering,
	type Position,
	positions,
	skillRows,
	summaries,
} from "../../content/career.ts";
import type { PdfMetadata } from "./pdf-writer.ts";

export type VariantId = "em" | "ic";

export interface VariantConfig {
	id: VariantId;
	label: string;
	/** Where `generate-resume.mts` writes it, relative to the repo root. */
	output: string;
	/**
	 * Does the SITE offer this cut? Exactly one variant may be `true`, and only
	 * a `true` variant may live under `public/`.
	 *
	 * WHY THIS IS A FLAG AND NOT A COMMENT: this is a statically exported Next
	 * site, so everything under `public/` is copied into `out/` and served at a
	 * guessable URL whether or not anything links to it. "Unlinked" is not
	 * "unpublished". Andrew's instruction was that the site offers the
	 * leadership cut — a statement about what the site presents, which
	 * dropping a second PDF into `public/` and simply not linking it would
	 * quietly violate.
	 */
	published: boolean;
	summary: string;
	/** Bullets weighted below this are dropped from this cut. */
	bulletThreshold: number;
	/** Re-rank bullets by weight, instead of keeping the authored order. */
	rankBullets: boolean;
	independentPlacement: "within-experience" | "own-section";
	/**
	 * Skill-row ids in the order this cut presents them. Every id in
	 * `skillRows` must appear exactly once — reordering is allowed, dropping a
	 * whole category is not.
	 */
	skillOrder: readonly string[];
}

export const VARIANTS: Record<VariantId, VariantConfig> = {
	em: {
		id: "em",
		label: "Engineering leadership",
		output: "public/resume.pdf",
		published: true,
		summary: summaries.em,
		bulletThreshold: 0,
		rankBullets: false,
		independentPlacement: "within-experience",
		skillOrder: ["leadership", "platform", "ai", "languages"],
	},
	ic: {
		id: "ic",
		label: "Individual contributor (Staff/Principal, AI infrastructure)",
		// `resumes/` is a top-level output directory, gitignored, and outside
		// `public/` — so the static export never sees it and the deployed site
		// cannot serve it. This is a real, finished artifact, not a draft: it is
		// attached to individual applications by hand.
		output: "resumes/akaiserauer_resume_ic.pdf",
		published: false,
		summary: summaries.ic,
		// Ranking + a threshold is the whole reweighting mechanism. The one
		// judgement call inside it — that `deloitte-backstage` (org-wide adoption
		// and onboarding, an influence-without-authority story) is the bullet an
		// IC cut can afford to lose — is flagged for Andrew's review; it is a
		// choice about emphasis, not a claim, and everything it drops still
		// appears in full on the leadership cut.
		bulletThreshold: 50,
		rankBullets: true,
		independentPlacement: "own-section",
		// Same four rows, hands-on first. Leadership stays on the page — it is
		// real and it is differentiating for a Staff/Principal candidate — it
		// just stops being the first thing a skim lands on.
		skillOrder: ["platform", "ai", "languages", "leadership"],
	},
};

export type Block =
	| { kind: "paragraph"; text: string }
	| { kind: "entry"; title: string; dates?: string; subtitle?: string; bullets: string[] }
	| { kind: "labelled"; label: string; text: string };

export interface DocSection {
	heading: string;
	blocks: Block[];
}

export interface ContactItem {
	text: string;
	url?: string;
}

export interface ResumeDocument {
	variant: VariantId;
	name: string;
	contact: ContactItem[];
	sections: DocSection[];
	metadata: PdfMetadata;
}

function selectBullets(bullets: readonly Bullet[], variant: VariantConfig): string[] {
	const kept = bullets.filter((bullet) => bullet.weight[variant.id] >= variant.bulletThreshold);
	const ordered = variant.rankBullets
		? [...kept].sort((a, b) => b.weight[variant.id] - a.weight[variant.id])
		: kept;
	return ordered.map((bullet) => bullet.text);
}

function positionEntry(position: Position, variant: VariantConfig): Block {
	return {
		kind: "entry",
		title: position.title,
		dates: formatResumePeriod(position),
		subtitle: `${position.employer} | ${position.location}`,
		bullets: selectBullets(position.bullets, variant),
	};
}

function independentEntry(variant: VariantConfig): Block {
	return {
		kind: "entry",
		title: independentEngineering.heading,
		bullets: selectBullets(independentEngineering.bullets, variant),
	};
}

function skillsSection(variant: VariantConfig): DocSection {
	const ordered = variant.skillOrder.map((id) => {
		const row = skillRows.find((candidate) => candidate.id === id);
		if (!row) throw new Error(`Variant "${variant.id}" orders unknown skill row "${id}"`);
		return row;
	});
	if (ordered.length !== skillRows.length) {
		throw new Error(
			`Variant "${variant.id}" lists ${ordered.length} skill rows but career.ts has ${skillRows.length}. ` +
				"A variant may reorder categories; it may not drop one.",
		);
	}

	const certLine = certifications
		.map((certification) => {
			const dates = formatCertificationDates(certification);
			return dates === "" ? certification.name : `${certification.name} ${dates}`;
		})
		.join("; ");

	return {
		heading: "SKILLS",
		blocks: [
			...ordered.map((row): Block => ({ kind: "labelled", label: row.label, text: row.text })),
			{ kind: "labelled", label: "Certifications", text: certLine },
		],
	};
}

function educationSection(): DocSection {
	return {
		heading: "EDUCATION",
		blocks: [
			{
				kind: "paragraph",
				text: `${education.school}: ${education.degree} | ${education.location} | ${formatMonthYear(
					education.graduated,
				)} | Minors: ${education.minors}`,
			},
		],
	};
}

export function buildResumeDocument(variantId: VariantId): ResumeDocument {
	const variant = VARIANTS[variantId];

	const experience: DocSection = {
		heading: "EXPERIENCE",
		blocks: positions.map((position) => positionEntry(position, variant)),
	};

	const independent: DocSection = {
		heading: independentEngineering.heading.toUpperCase(),
		blocks: [
			{ kind: "entry", title: "", bullets: selectBullets(independentEngineering.bullets, variant) },
		],
	};

	const sections: DocSection[] = [
		{ heading: "SUMMARY", blocks: [{ kind: "paragraph", text: variant.summary }] },
	];

	if (variant.independentPlacement === "own-section") {
		sections.push(independent, experience);
	} else {
		experience.blocks.push(independentEntry(variant));
		sections.push(experience);
	}

	sections.push(skillsSection(variant), educationSection());

	return {
		variant: variantId,
		name: identity.fullName.toUpperCase(),
		contact: [
			{ text: identity.email, url: `mailto:${identity.email}` },
			{ text: identity.phone },
			{ text: identity.location.resume },
			{ text: identity.linkedin.display, url: identity.linkedin.url },
			{ text: identity.github.display, url: identity.github.url },
			{ text: identity.website, url: `https://${identity.website}` },
		],
		sections,
		metadata: {
			// ASCII only: PDF document-info strings are read as PDFDocEncoding,
			// not WinAnsi, so an em dash here shows up as "Š" in a viewer's
			// title bar. The page content stream is unaffected.
			title: `${identity.name} - Resume`,
			author: identity.fullName,
			subject: variant.label,
			keywords:
				"platform engineering, Kubernetes, AWS, engineering management, LLM inference, AI infrastructure",
		},
	};
}

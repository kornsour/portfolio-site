/**
 * Lay a `ResumeDocument` out on one US-Letter page.
 *
 * ONE PAGE IS A HARD CONSTRAINT, so it is enforced structurally rather than by
 * eyeballing the result: `fitResume` walks a narrow band of body sizes and
 * returns the largest that fits. If even the smallest overflows, generation
 * FAILS — a two-page resume, or a silently 6pt one, is not an acceptable
 * output. The band is narrow on purpose: shrinking type is a last resort, and
 * when the floor is hit the right fix is to cut a bullet, not to keep
 * shrinking.
 *
 * Layout choices that exist for the ATS, not for looks:
 *   - Single column. A two-column resume linearizes into interleaved nonsense
 *     in most parsers.
 *   - Standard section headings (SUMMARY / EXPERIENCE / SKILLS / EDUCATION),
 *     spelled the boring way.
 *   - Dates on the same baseline as the job title, right-aligned — one text
 *     run, still in reading order, no tables and no tab stops.
 *   - Rules are drawn as graphics, never as a row of underscores that would
 *     land in the extracted text.
 */

import type { Block, ResumeDocument } from "./document.ts";
import { stringWidth, wrapText } from "./font-metrics.ts";
import { type DrawOp, PAGE_HEIGHT, PAGE_WIDTH } from "./pdf-writer.ts";

const MARGIN_X = 42;
const MARGIN_TOP = 32;
const MARGIN_BOTTOM = 34;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const BOTTOM_LIMIT = PAGE_HEIGHT - MARGIN_BOTTOM;

const BULLET_GLYPH_X = MARGIN_X + 3;
const BULLET_TEXT_X = MARGIN_X + 12;
const BULLET_TEXT_WIDTH = CONTENT_WIDTH - 12;

/** Largest first: the first size that fits wins. */
export const BODY_SIZES = [9, 8.9, 8.8, 8.7, 8.6, 8.5] as const;

export interface LayoutResult {
	ops: DrawOp[];
	bodySize: number;
	/** Distance from the top of the page to the last baseline drawn. */
	contentBottom: number;
	fits: boolean;
}

export class ResumeOverflowError extends Error {
	constructor(bottom: number) {
		super(
			`The resume does not fit on one page at any body size down to ${BODY_SIZES.at(-1)}pt ` +
				`(content reaches ${bottom.toFixed(1)}pt, the page allows ${BOTTOM_LIMIT}pt). ` +
				"Cut or shorten a bullet in src/content/career.ts — do not shrink the type further.",
		);
		this.name = "ResumeOverflowError";
	}
}

/**
 * Wrap with a shorter first line, for a run that starts after an inline label.
 */
function wrapAfterLabel(
	text: string,
	size: number,
	firstWidth: number,
	restWidth: number,
): string[] {
	const words = text.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let current = "";
	for (const word of words) {
		const width = lines.length === 0 ? firstWidth : restWidth;
		const candidate = current === "" ? word : `${current} ${word}`;
		if (stringWidth(candidate, "Helvetica", size) <= width || current === "") {
			current = candidate;
		} else {
			lines.push(current);
			current = word;
		}
	}
	if (current !== "") lines.push(current);
	return lines;
}

export function layoutResume(document: ResumeDocument, bodySize: number): LayoutResult {
	const ops: DrawOp[] = [];

	const lead = bodySize * 1.16;
	const headingSize = bodySize + 0.5;
	const titleSize = bodySize + 0.5;
	const contactSize = bodySize - 0.4;
	const nameSize = bodySize * 1.7;

	let cursor = MARGIN_TOP;

	const baselineFor = (size: number) => cursor + size * 0.76;

	const centered = (text: string, font: Parameters<typeof stringWidth>[1], size: number) =>
		MARGIN_X + (CONTENT_WIDTH - stringWidth(text, font, size)) / 2;

	// ---- header ------------------------------------------------------------
	let y = baselineFor(nameSize);
	ops.push({
		kind: "text",
		x: centered(document.name, "Helvetica-Bold", nameSize),
		y,
		text: document.name,
		font: "Helvetica-Bold",
		size: nameSize,
	});
	cursor += nameSize * 1.18;

	const separator = "  |  ";
	const contactWidth = document.contact.reduce(
		(total, item, index) =>
			total +
			stringWidth(item.text, "Helvetica", contactSize) +
			(index === 0 ? 0 : stringWidth(separator, "Helvetica", contactSize)),
		0,
	);
	let x = MARGIN_X + (CONTENT_WIDTH - contactWidth) / 2;
	y = baselineFor(contactSize);
	document.contact.forEach((item, index) => {
		if (index > 0) {
			ops.push({
				kind: "text",
				x,
				y,
				text: separator,
				font: "Helvetica",
				size: contactSize,
			});
			x += stringWidth(separator, "Helvetica", contactSize);
		}
		const width = stringWidth(item.text, "Helvetica", contactSize);
		ops.push({ kind: "text", x, y, text: item.text, font: "Helvetica", size: contactSize });
		if (item.url) ops.push({ kind: "link", x, y, width, size: contactSize, url: item.url });
		x += width;
	});
	cursor += contactSize * 1.3 + 2;

	// ---- sections ----------------------------------------------------------
	const drawParagraph = (text: string, indent: number, width: number, size: number) => {
		for (const line of wrapText(text, "Helvetica", size, width)) {
			ops.push({
				kind: "text",
				x: indent,
				y: baselineFor(size),
				text: line,
				font: "Helvetica",
				size,
			});
			cursor += lead;
		}
	};

	const drawBullets = (bullets: readonly string[]) => {
		bullets.forEach((bullet, index) => {
			const lines = wrapText(bullet, "Helvetica", bodySize, BULLET_TEXT_WIDTH);
			lines.forEach((line, lineIndex) => {
				const baseline = baselineFor(bodySize);
				if (lineIndex === 0) {
					ops.push({
						kind: "text",
						x: BULLET_GLYPH_X,
						y: baseline,
						text: "•",
						font: "Helvetica",
						size: bodySize,
					});
				}
				ops.push({
					kind: "text",
					x: BULLET_TEXT_X,
					y: baseline,
					text: line,
					font: "Helvetica",
					size: bodySize,
				});
				cursor += lead;
			});
			if (index < bullets.length - 1) cursor += 1.2;
		});
	};

	const drawBlock = (block: Block) => {
		if (block.kind === "paragraph") {
			drawParagraph(block.text, MARGIN_X, CONTENT_WIDTH, bodySize);
			return;
		}
		if (block.kind === "labelled") {
			const label = `${block.label}: `;
			const labelWidth = stringWidth(label, "Helvetica-Bold", bodySize);
			const lines = wrapAfterLabel(block.text, bodySize, CONTENT_WIDTH - labelWidth, CONTENT_WIDTH);
			lines.forEach((line, index) => {
				const baseline = baselineFor(bodySize);
				if (index === 0) {
					ops.push({
						kind: "text",
						x: MARGIN_X,
						y: baseline,
						text: label,
						font: "Helvetica-Bold",
						size: bodySize,
					});
				}
				ops.push({
					kind: "text",
					x: index === 0 ? MARGIN_X + labelWidth : MARGIN_X,
					y: baseline,
					text: line,
					font: "Helvetica",
					size: bodySize,
				});
				cursor += lead;
			});
			return;
		}

		if (block.title !== "") {
			const baseline = baselineFor(titleSize);
			ops.push({
				kind: "text",
				x: MARGIN_X,
				y: baseline,
				text: block.title,
				font: "Helvetica-Bold",
				size: titleSize,
			});
			if (block.dates) {
				ops.push({
					kind: "text",
					x: MARGIN_X + CONTENT_WIDTH - stringWidth(block.dates, "Helvetica", bodySize),
					y: baseline,
					text: block.dates,
					font: "Helvetica",
					size: bodySize,
				});
			}
			cursor += titleSize * 1.18;
		}
		if (block.subtitle) {
			ops.push({
				kind: "text",
				x: MARGIN_X,
				y: baselineFor(bodySize),
				text: block.subtitle,
				font: "Helvetica-Oblique",
				size: bodySize,
			});
			cursor += lead;
		}
		drawBullets(block.bullets);
	};

	document.sections.forEach((section, sectionIndex) => {
		cursor += sectionIndex === 0 ? 4 : 7;
		const baseline = baselineFor(headingSize);
		ops.push({
			kind: "text",
			x: MARGIN_X,
			y: baseline,
			text: section.heading,
			font: "Helvetica-Bold",
			size: headingSize,
		});
		ops.push({
			kind: "rule",
			x1: MARGIN_X,
			x2: MARGIN_X + CONTENT_WIDTH,
			y: baseline + 2.8,
			width: 0.6,
			gray: 0.55,
		});
		cursor += headingSize * 1.18 + 3;

		section.blocks.forEach((block, blockIndex) => {
			if (blockIndex > 0 && block.kind === "entry") cursor += 5;
			drawBlock(block);
		});
	});

	return {
		ops,
		bodySize,
		contentBottom: cursor,
		fits: cursor <= BOTTOM_LIMIT,
	};
}

/** Largest body size that keeps the document on one page. Throws if none does. */
export function fitResume(document: ResumeDocument): LayoutResult {
	let last: LayoutResult | null = null;
	for (const size of BODY_SIZES) {
		const result = layoutResume(document, size);
		if (result.fits) return result;
		last = result;
	}
	throw new ResumeOverflowError(last?.contentBottom ?? 0);
}

export const PAGE_BOTTOM_LIMIT = BOTTOM_LIMIT;

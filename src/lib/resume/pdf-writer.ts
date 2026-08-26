/**
 * A very small PDF 1.7 writer — enough for a one-page, text-only resume and
 * nothing more.
 *
 * WHY HAND-ROLLED. The alternatives were weighed against this repo's actual
 * constraints (a static export, no server runtime, a CI budget that is
 * currently zero, and `package.json`'s five runtime dependencies):
 *
 *   - Headless Chrome (puppeteer/playwright `page.pdf`) — a ~150MB browser
 *     download in CI to render a page of text, and Chrome subsets and
 *     re-encodes fonts on the way out, which is the exact failure mode an
 *     ATS-parseable resume must not have. Rejected.
 *   - `pdfkit` / `@react-pdf/renderer` — perfectly good, but they pull a font
 *     engine and a dozen transitive packages to lay out ~55 lines of text.
 *   - LaTeX / Typst — an external binary that CI does not have.
 *
 * What is actually needed is: place a string at (x, y) in one of three base-14
 * fonts, draw a hairline rule, and attach a link annotation. That is a few
 * hundred lines and no dependencies, and it means we control the one property
 * that matters — the text layer is plain WinAnsi bytes in reading order.
 *
 * DETERMINISM IS A FEATURE. No `/CreationDate`, no `/ModDate`, no random ids:
 * the same input produces byte-identical output, which is what lets
 * `resume-pdf.test.ts` assert that the committed `public/resume.pdf` is
 * actually the file this data generates. That test is the thing that stops the
 * resume drifting from its source again.
 */

import { encodeWinAnsi, type FontName, stringWidth } from "./font-metrics.ts";

export const PAGE_WIDTH = 612; // US Letter, points
export const PAGE_HEIGHT = 792;

const FONT_KEYS: Record<FontName, string> = {
	Helvetica: "F1",
	"Helvetica-Bold": "F2",
	"Helvetica-Oblique": "F3",
};

export interface TextOp {
	kind: "text";
	/** Left edge, in points from the left of the page. */
	x: number;
	/** Baseline, in points from the TOP of the page (y grows downward). */
	y: number;
	text: string;
	font: FontName;
	size: number;
}

export interface RuleOp {
	kind: "rule";
	x1: number;
	x2: number;
	/** Distance from the top of the page. */
	y: number;
	width: number;
	/** 0 = black, 1 = white. */
	gray: number;
}

export interface LinkOp {
	kind: "link";
	x: number;
	/** Baseline, from the top of the page. */
	y: number;
	width: number;
	size: number;
	url: string;
}

export type DrawOp = TextOp | RuleOp | LinkOp;

export interface PdfMetadata {
	title: string;
	author: string;
	subject: string;
	keywords: string;
}

function num(value: number): string {
	// Three decimals is far below the resolution of anything that reads this,
	// and trimming trailing zeros keeps the stream diffable.
	return value.toFixed(3).replace(/\.?0+$/, "") || "0";
}

/** Convert a "distance from the top" coordinate into PDF user space. */
function fromTop(y: number): number {
	return PAGE_HEIGHT - y;
}

function buildContentStream(ops: readonly DrawOp[]): string {
	const parts: string[] = [];
	for (const op of ops) {
		if (op.kind === "text") {
			if (op.text.length === 0) continue;
			parts.push(
				`BT /${FONT_KEYS[op.font]} ${num(op.size)} Tf 1 0 0 1 ${num(op.x)} ${num(
					fromTop(op.y),
				)} Tm (${encodeWinAnsi(op.text)}) Tj ET`,
			);
		} else if (op.kind === "rule") {
			parts.push(
				`q ${num(op.gray)} G ${num(op.width)} w ${num(op.x1)} ${num(fromTop(op.y))} m ${num(
					op.x2,
				)} ${num(fromTop(op.y))} l S Q`,
			);
		}
	}
	return parts.join("\n");
}

function buildAnnots(ops: readonly DrawOp[]): string[] {
	const annots: string[] = [];
	for (const op of ops) {
		if (op.kind !== "link") continue;
		const top = fromTop(op.y - op.size * 0.78);
		const bottom = fromTop(op.y + op.size * 0.22);
		annots.push(
			`<< /Type /Annot /Subtype /Link /Rect [${num(op.x)} ${num(bottom)} ${num(
				op.x + op.width,
			)} ${num(top)}] /Border [0 0 0] /A << /S /URI /URI (${encodeWinAnsi(op.url)}) >> >>`,
		);
	}
	return annots;
}

/**
 * Serialize a single page of draw ops into a complete PDF file.
 */
export function renderPdf(ops: readonly DrawOp[], metadata: PdfMetadata): Buffer {
	const content = buildContentStream(ops);
	const annots = buildAnnots(ops);

	const objects: string[] = [];
	const push = (body: string): number => {
		objects.push(body);
		return objects.length; // 1-based object number
	};

	// Object numbering is fixed so the file stays diffable.
	const catalog = push(""); // 1 — filled in below
	const pages = push("");
	const page = push("");
	const contents = push(
		`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
	);
	const fontRegular = push(
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
	);
	const fontBold = push(
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
	);
	const fontOblique = push(
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>",
	);
	const info = push(
		`<< /Title (${encodeWinAnsi(metadata.title)}) /Author (${encodeWinAnsi(
			metadata.author,
		)}) /Subject (${encodeWinAnsi(metadata.subject)}) /Keywords (${encodeWinAnsi(
			metadata.keywords,
		)}) /Producer (portfolio-site scripts/generate-resume.mts) >>`,
	);

	const annotRefs: number[] = annots.map((annot) => push(annot));

	objects[catalog - 1] =
		`<< /Type /Catalog /Pages ${pages} 0 R /Lang (en-US) /MarkInfo << /Marked false >> >>`;
	objects[pages - 1] = `<< /Type /Pages /Kids [${page} 0 R] /Count 1 >>`;
	objects[page - 1] =
		`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
		`/Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R /F3 ${fontOblique} 0 R >> >> ` +
		`/Contents ${contents} 0 R` +
		(annotRefs.length > 0 ? ` /Annots [${annotRefs.map((n) => `${n} 0 R`).join(" ")}]` : "") +
		" >>";

	let body = "%PDF-1.7\n%âãÏÓ\n";
	const offsets: number[] = [];
	for (let i = 0; i < objects.length; i++) {
		offsets.push(Buffer.byteLength(body, "latin1"));
		body += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
	}

	const xrefOffset = Buffer.byteLength(body, "latin1");
	let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (const offset of offsets) {
		xref += `${offset.toString().padStart(10, "0")} 00000 n \n`;
	}
	// No /ID: it would either be random (non-deterministic) or a hash of the
	// content (pointless here), and it is optional for an unencrypted file.
	xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

	return Buffer.from(body + xref, "latin1");
}

/** Convenience: measure a run the same way the layout does. */
export function measure(text: string, font: FontName, size: number): number {
	return stringWidth(text, font, size);
}

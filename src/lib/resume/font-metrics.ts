/**
 * Adobe AFM widths for the PDF base-14 fonts we use, plus the WinAnsi byte
 * encoding that goes with them.
 *
 * WHY BASE-14 AND NOT AN EMBEDDED FONT: an ATS reads the text layer, not the
 * picture. A subsetted, custom-encoded font is the single most common way a
 * good-looking resume extracts as mojibake. Helvetica + Helvetica-Bold +
 * Helvetica-Oblique with `/Encoding /WinAnsiEncoding` are resolved by the
 * viewer, embed nothing, subset nothing, and every extractor on earth maps the
 * bytes back to the right characters. Helvetica is also metrically identical to
 * Arial, which is what the previous hand-made resume used — so the generated
 * page measures the same as the one it replaces.
 *
 * CALIBRATION (do this again before trusting any change to these tables). The
 * numbers below were checked against the *old* `public/resume.pdf`, which
 * poppler measures independently:
 *
 *   pdftotext -bbox-layout public/resume.pdf -
 *
 *   "ajkaiserauer@gmail.com"  x: 46.100 → 145.253  = 99.153pt
 *     Σ widths (regular) = 11.017em  ⇒  99.153 / 11.017 = 9.000pt exactly.
 *   "ANDREW" / "KAISERAUER"  (bold, LibreOffice added 0.98pt tracking)
 *     solving the two-word system gives 13.963pt ≈ 14pt and tc = 0.98pt,
 *     and the inter-word gap it predicts (5.852pt) matches the measured
 *     5.866pt.
 *
 * Two independent strings, one regular and one bold, landing on exact round
 * point sizes is what says these width tables are the real Adobe ones and not
 * a plausible-looking guess. A wrong table does not fail — it silently wraps
 * lines in the wrong place.
 *
 * (We deliberately do NOT use character tracking ourselves: `Tc` is legal but
 * naive text extractors sometimes turn a tracked run into s p a c e d o u t
 * letters. Nothing here is worth that risk.)
 */

export type FontName = "Helvetica" | "Helvetica-Bold" | "Helvetica-Oblique";

/** Widths for U+0020..U+007E, in 1/1000 em, in codepoint order. */
const HELVETICA_ASCII = [
	278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556,
	556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667,
	611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
	667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500,
	222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const HELVETICA_BOLD_ASCII = [
	278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556,
	556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667,
	611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667,
	667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556,
	278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

/**
 * The non-ASCII characters this resume is allowed to contain, mapped to their
 * WinAnsi byte and their width in each weight. Anything outside this table is a
 * hard error at generation time — see `encodeWinAnsi`. A resume that silently
 * renders a `?` where an en dash was is exactly the kind of drift this whole
 * pipeline exists to stop.
 */
const EXTRAS: Record<string, { byte: number; regular: number; bold: number }> = {
	"–": { byte: 0x96, regular: 556, bold: 556 }, // – en dash
	"—": { byte: 0x97, regular: 1000, bold: 1000 }, // — em dash
	"•": { byte: 0x95, regular: 350, bold: 350 }, // • bullet
	"‘": { byte: 0x91, regular: 222, bold: 278 }, // ‘
	"’": { byte: 0x92, regular: 222, bold: 278 }, // ’
	"“": { byte: 0x93, regular: 333, bold: 500 }, // “
	"”": { byte: 0x94, regular: 333, bold: 500 }, // ”
	"…": { byte: 0x85, regular: 1000, bold: 1000 }, // …
	"·": { byte: 0xb7, regular: 278, bold: 278 }, // ·
	"×": { byte: 0xd7, regular: 584, bold: 584 }, // ×
	"²": { byte: 0xb2, regular: 333, bold: 333 }, // ²
	"°": { byte: 0xb0, regular: 400, bold: 400 }, // °
	é: { byte: 0xe9, regular: 556, bold: 556 }, // é
};

/** Thrown when the content contains a character WinAnsi cannot represent. */
export class UnencodableCharacterError extends Error {
	constructor(char: string, context: string) {
		super(
			`Character ${JSON.stringify(char)} (U+${char
				.codePointAt(0)
				?.toString(16)
				.toUpperCase()
				.padStart(
					4,
					"0",
				)}) is not in WinAnsiEncoding, so it cannot be written into a base-14 PDF. ` +
				`Replace it with an ASCII equivalent in the resume source. Context: "${context}"`,
		);
		this.name = "UnencodableCharacterError";
	}
}

function widthOfChar(char: string, font: FontName): number {
	const code = char.charCodeAt(0);
	const bold = font === "Helvetica-Bold";
	if (code >= 0x20 && code <= 0x7e) {
		const table = bold ? HELVETICA_BOLD_ASCII : HELVETICA_ASCII;
		const width = table[code - 0x20];
		// A hole in the table would silently mis-wrap every line that uses the
		// character, so treat it the same way as an unencodable one.
		if (width === undefined) throw new UnencodableCharacterError(char, char);
		return width;
	}
	const extra = EXTRAS[char];
	if (extra) return bold ? extra.bold : extra.regular;
	throw new UnencodableCharacterError(char, char);
}

/** Width of `text` at `size` points, in points. */
export function stringWidth(text: string, font: FontName, size: number): number {
	let total = 0;
	for (const char of text) total += widthOfChar(char, font);
	return (total * size) / 1000;
}

/**
 * Encode a string as WinAnsi bytes with PDF string escaping, ready to drop
 * between `(` and `)` in a content stream.
 */
export function encodeWinAnsi(text: string): string {
	let out = "";
	for (const char of text) {
		const code = char.charCodeAt(0);
		let byte: number;
		if (code >= 0x20 && code <= 0x7e) {
			byte = code;
		} else {
			const extra = EXTRAS[char];
			if (!extra) throw new UnencodableCharacterError(char, text);
			byte = extra.byte;
		}
		if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
			out += `\\${String.fromCharCode(byte)}`;
		} else if (byte < 0x20 || byte > 0x7e) {
			out += `\\${byte.toString(8).padStart(3, "0")}`;
		} else {
			out += String.fromCharCode(byte);
		}
	}
	return out;
}

/** Decode the escaped WinAnsi form produced by `encodeWinAnsi` back to text. */
export function decodeWinAnsi(escaped: string): string {
	const byteToChar = new Map<number, string>();
	for (const [char, meta] of Object.entries(EXTRAS)) byteToChar.set(meta.byte, char);

	let out = "";
	for (let i = 0; i < escaped.length; i++) {
		const char = escaped[i];
		if (char !== "\\") {
			out += char;
			continue;
		}
		const next = escaped[i + 1] ?? "";
		if (/[0-7]/.test(next)) {
			const octal = escaped.slice(i + 1, i + 4);
			const byte = Number.parseInt(octal, 8);
			out += byteToChar.get(byte) ?? String.fromCharCode(byte);
			i += 3;
		} else {
			out += next;
			i += 1;
		}
	}
	return out;
}

/**
 * Greedy word wrap. Returns the lines; never breaks inside a word, because a
 * hyphenated break is a word an ATS keyword match will miss.
 */
export function wrapText(text: string, font: FontName, size: number, maxWidth: number): string[] {
	const words = text.split(/\s+/).filter((word) => word.length > 0);
	const lines: string[] = [];
	let current = "";
	for (const word of words) {
		const candidate = current === "" ? word : `${current} ${word}`;
		if (stringWidth(candidate, font, size) <= maxWidth || current === "") {
			current = candidate;
		} else {
			lines.push(current);
			current = word;
		}
	}
	if (current !== "") lines.push(current);
	return lines;
}

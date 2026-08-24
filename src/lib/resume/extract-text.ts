/**
 * Read the text layer back out of a PDF produced by `pdf-writer.ts`.
 *
 * This is the "what does an ATS actually see" check, run in the unit suite with
 * no dependencies and no external binaries. It walks the page content stream
 * and collects every string handed to a text-showing operator, in the order the
 * file presents them — which is the order a linear extractor reads.
 *
 * HONEST LIMITATION: this reads our own output with our own encoder, so it can
 * prove "the bytes say what the data says" but it cannot, by itself, prove that
 * a *third-party* parser agrees. The independent check is poppler:
 *
 *   pdftotext -layout public/resume.pdf -
 *
 * Run that after any change to the writer, and diff it against
 * `expectedResumeLines()`. The unit test catches content drift; poppler catches
 * encoding drift. They are different failures.
 */

export interface ExtractedPdf {
	/** One entry per text-showing operator, in file order. */
	runs: string[];
	/** `runs`, joined with newlines — the closest thing to "the text". */
	text: string;
	pageCount: number;
}

const OCTAL_ESCAPES: Record<number, string> = {
	133: "…",
	145: "‘",
	146: "’",
	147: "“",
	148: "”",
	149: "•",
	150: "–",
	151: "—",
	176: "°",
	178: "²",
	183: "·",
	215: "×",
	233: "é",
};

function decodePdfString(raw: string): string {
	let out = "";
	for (let i = 0; i < raw.length; i++) {
		const char = raw[i];
		if (char !== "\\") {
			out += char;
			continue;
		}
		const next = raw[i + 1] ?? "";
		if (next >= "0" && next <= "7") {
			let octal = "";
			let j = i + 1;
			while (octal.length < 3) {
				const digit = raw[j];
				if (digit === undefined || digit < "0" || digit > "7") break;
				octal += digit;
				j++;
			}
			const byte = Number.parseInt(octal, 8);
			out += OCTAL_ESCAPES[byte] ?? String.fromCharCode(byte);
			i = j - 1;
		} else {
			out += next;
			i += 1;
		}
	}
	return out;
}

/**
 * Pull the literal strings out of a content stream. Handles `(...) Tj` and
 * `[(...) n (...)] TJ`, which is everything a text-only PDF uses.
 */
function stringsInStream(stream: string): string[] {
	const runs: string[] = [];
	let i = 0;
	let pending: string[] = [];

	while (i < stream.length) {
		const char = stream[i];
		if (char === "(") {
			let depth = 1;
			let j = i + 1;
			let raw = "";
			while (j < stream.length && depth > 0) {
				const c = stream[j];
				if (c === "\\") {
					raw += c;
					raw += stream[j + 1] ?? "";
					j += 2;
					continue;
				}
				if (c === "(") depth++;
				if (c === ")") {
					depth--;
					if (depth === 0) break;
				}
				raw += c;
				j++;
			}
			pending.push(decodePdfString(raw));
			i = j + 1;
			continue;
		}
		if (char === "T" && (stream[i + 1] === "j" || stream[i + 1] === "J")) {
			if (pending.length > 0) {
				runs.push(pending.join(""));
				pending = [];
			}
			i += 2;
			continue;
		}
		i++;
	}
	return runs;
}

/** Extract the text layer of a single-page, uncompressed PDF. */
export function extractPdfText(pdf: Buffer | Uint8Array): ExtractedPdf {
	const raw = Buffer.from(pdf).toString("latin1");
	const pageCount = Number(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/.exec(raw)?.[1] ?? "0");

	const runs: string[] = [];
	const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
	let match = streamPattern.exec(raw);
	while (match !== null) {
		runs.push(...stringsInStream(match[1] ?? ""));
		match = streamPattern.exec(raw);
	}

	return { runs, text: runs.join("\n"), pageCount };
}

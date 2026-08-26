import { describe, expect, it } from "vitest";
import {
	decodeWinAnsi,
	encodeWinAnsi,
	stringWidth,
	UnencodableCharacterError,
	wrapText,
} from "./font-metrics.ts";

/**
 * CALIBRATION, pinned. These two figures were measured out of the previous,
 * independently produced `public/resume.pdf` with poppler
 * (`pdftotext -bbox-layout`), which lays that file out with its own copy of the
 * Arial/Helvetica metrics:
 *
 *   "ajkaiserauer@gmail.com"  spans 46.100 → 145.253 = 99.153pt at 9pt.
 *   "ANDREW"                  spans 194.500 → 262.386 = 67.886pt at 14pt bold,
 *                             with 0.98pt of tracking on 5 gaps (4.900pt).
 *
 * Reproducing a number the toolchain has already published, before trusting any
 * number it has not, is the only thing that separates a correct width table
 * from a plausible one — a wrong table does not throw, it just wraps lines in
 * the wrong place.
 */
describe("base-14 metrics agree with an independently laid-out PDF", () => {
	it("measures the contact line at exactly the width poppler measured", () => {
		expect(stringWidth("ajkaiserauer@gmail.com", "Helvetica", 9)).toBeCloseTo(99.153, 3);
	});

	it("recovers a round 14pt bold from the name, which was set with tracking", () => {
		// The old resume's name has letter tracking, so neither word alone pins a
		// size. Two words give two equations — width = Σem·size + gaps·tracking —
		// and solving them with THESE width tables has to land on a round font
		// size and a plausible tracking value. It does: 14.00pt and 0.98pt, which
		// is LibreOffice's "expanded by 0.98pt". A wrong bold table would produce
		// neither.
		const emA = stringWidth("ANDREW", "Helvetica-Bold", 1);
		const emK = stringWidth("KAISERAUER", "Helvetica-Bold", 1);
		const [measuredA, gapsA] = [67.886, 5];
		const [measuredK, gapsK] = [101.43, 9];
		// size = (measuredK·gapsA − measuredA·gapsK) / (emK·gapsA − emA·gapsK)
		const size = (measuredK * gapsA - measuredA * gapsK) / (emK * gapsA - emA * gapsK);
		const tracking = (measuredA - emA * size) / gapsA;
		expect(size).toBeCloseTo(14, 1);
		expect(tracking).toBeCloseTo(0.98, 1);
	});

	it("treats oblique as metrically identical to regular", () => {
		expect(stringWidth("Deloitte US Member Firm", "Helvetica-Oblique", 9)).toBeCloseTo(
			stringWidth("Deloitte US Member Firm", "Helvetica", 9),
			6,
		);
	});
});

describe("WinAnsi encoding", () => {
	it("round-trips every non-ASCII character the resume actually uses", () => {
		const sample = "en – dash, em — dash, bullet •, 4.81× faster, O(T²) to O(T)";
		expect(decodeWinAnsi(encodeWinAnsi(sample))).toBe(sample);
	});

	it("escapes the characters that would otherwise close a PDF string", () => {
		expect(encodeWinAnsi("(a) \\ b")).toBe("\\(a\\) \\\\ b");
	});

	it("refuses a character it cannot represent instead of silently dropping it", () => {
		// An arrow is the tempting one — "O(T²)→O(T)" reads well and is not in
		// WinAnsi. Failing loudly is what forces the ASCII rewrite.
		expect(() => encodeWinAnsi("O(T²)→O(T)")).toThrow(UnencodableCharacterError);
	});
});

describe("word wrapping", () => {
	it("never breaks inside a word", () => {
		const lines = wrapText("Kubernetes GitOps observability", "Helvetica", 9, 60);
		for (const line of lines) expect(line).not.toMatch(/-$/);
		expect(lines.join(" ")).toBe("Kubernetes GitOps observability");
	});

	it("keeps every line inside the measure, except an unbreakable single word", () => {
		const lines = wrapText(
			"Built and lead a four-squad Platform Engineering organization",
			"Helvetica",
			9,
			120,
		);
		for (const line of lines) {
			if (line.includes(" ")) expect(stringWidth(line, "Helvetica", 9)).toBeLessThanOrEqual(120);
		}
	});
});

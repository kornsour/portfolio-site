/**
 * The one entry point: variant id in, PDF bytes out. Pure and deterministic —
 * no clock, no filesystem, no randomness — so the unit suite can assert that
 * the committed `public/resume.pdf` is byte-identical to what today's data
 * produces.
 */

import { buildResumeDocument, VARIANTS, type VariantId } from "./document.ts";
import { fitResume } from "./layout.ts";
import { renderPdf } from "./pdf-writer.ts";

export interface GeneratedResume {
	pdf: Buffer;
	bodySize: number;
	/** How far down the page the content reaches, in points. */
	contentBottom: number;
	output: string;
	/** True only for the cut the site itself offers. */
	published: boolean;
}

export function generateResume(variantId: VariantId): GeneratedResume {
	const variant = VARIANTS[variantId];
	const document = buildResumeDocument(variantId);
	const layout = fitResume(document);
	return {
		pdf: renderPdf(layout.ops, document.metadata),
		bodySize: layout.bodySize,
		contentBottom: layout.contentBottom,
		output: variant.output,
		published: variant.published,
	};
}

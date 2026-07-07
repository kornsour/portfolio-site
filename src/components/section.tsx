import type { ReactNode } from "react";

/**
 * Shared section shell: anchor target, consistent vertical rhythm, and an
 * eyebrow-style heading.
 */
export function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-20 py-16 sm:py-24">
			<h2
				id={`${id}-heading`}
				className="mb-10 text-sm font-semibold uppercase tracking-widest text-spartan-600 dark:text-spartan-400"
			>
				{title}
			</h2>
			{children}
		</section>
	);
}

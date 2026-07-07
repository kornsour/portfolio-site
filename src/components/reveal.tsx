"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Gentle fade/slide-in when the element scrolls into view.
 *
 * Content is visible by default; the hidden state is only applied from JS to
 * elements below the fold, so nothing disappears without JavaScript, nothing
 * above the fold flashes, and prefers-reduced-motion disables it entirely.
 */
export function Reveal({
	children,
	className = "",
	delay = 0,
}: {
	children: ReactNode;
	className?: string;
	delay?: number;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		if (el.getBoundingClientRect().top <= window.innerHeight) return;

		el.classList.add("reveal-hidden");
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					el.classList.remove("reveal-hidden");
					observer.disconnect();
				}
			},
			{ rootMargin: "0px 0px -48px 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`reveal ${className}`}
			style={delay ? { transitionDelay: `${delay}ms` } : undefined}
		>
			{children}
		</div>
	);
}

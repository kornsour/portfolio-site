"use client";

import { MoonIcon, SunIcon } from "@/components/icons";

/**
 * Flips the `.dark` class on <html> and persists the choice. The icons swap
 * purely via CSS (`dark:` variants), so there's no hydration-sensitive state —
 * the init script in layout.tsx has already set the class before paint.
 */
export function ThemeToggle() {
	function toggle() {
		const isDark = document.documentElement.classList.toggle("dark");
		try {
			localStorage.setItem("theme", isDark ? "dark" : "light");
		} catch {
			// localStorage unavailable (private mode) — theme still toggles for the session.
		}
	}

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label="Toggle color theme"
			className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spartan-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
		>
			<SunIcon className="hidden size-5 dark:block" />
			<MoonIcon className="size-5 dark:hidden" />
		</button>
	);
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { person } from "@/content/portfolio";
import { env } from "@/env";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const description =
	"Engineering and platform leader who builds the systems other engineers build on — platform engineering, developer experience, and AI infrastructure.";

export const metadata: Metadata = {
	metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
	title: {
		default: `${person.name} — Engineering & Platform Leader`,
		template: `%s · ${person.name}`,
	},
	description,
	alternates: { canonical: "/" },
	openGraph: {
		type: "website",
		url: "/",
		siteName: person.name,
		title: `${person.name} — Engineering & Platform Leader`,
		description,
	},
	twitter: {
		card: "summary_large_image",
		title: `${person.name} — Engineering & Platform Leader`,
		description,
	},
	robots: { index: true, follow: true },
};

// Set the theme class before first paint to avoid a flash of the wrong theme.
const themeInit = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme-init snippet, no user input */}
				<script dangerouslySetInnerHTML={{ __html: themeInit }} />
			</head>
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	);
}

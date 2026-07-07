import { ImageResponse } from "next/og";
import { person } from "@/content/portfolio";

export const alt = `${person.name} — Engineering & Platform Leader`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: 80,
				backgroundColor: "#09090b",
				color: "#fafafa",
				fontFamily: "sans-serif",
			}}
		>
			<div style={{ display: "flex", width: 96, height: 8, backgroundColor: "#4f46e5" }} />
			<div style={{ display: "flex", flexDirection: "column" }}>
				<div style={{ fontSize: 72, fontWeight: 600, letterSpacing: "-0.02em" }}>{person.name}</div>
				<div style={{ marginTop: 24, fontSize: 34, color: "#a1a1aa", lineHeight: 1.4 }}>
					{person.headline}
				</div>
			</div>
			<div style={{ display: "flex", fontSize: 26, color: "#71717a" }}>andrewkaiserauer.com</div>
		</div>,
		size,
	);
}

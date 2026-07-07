import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#18453B",
				borderRadius: 8,
				color: "#ffffff",
				fontSize: 17,
				fontWeight: 600,
				fontFamily: "sans-serif",
			}}
		>
			AK
		</div>,
		size,
	);
}

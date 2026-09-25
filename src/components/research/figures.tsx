import {
	costByTokenType,
	costVsPass,
	type FigureId,
	oracleCost,
	priceVsTaskCost,
} from "@/content/research";

/**
 * The white paper's charts, redrawn as inline SVG so they follow the site
 * theme. Axis and label ink uses the zinc text tokens; the single-series
 * charts use the Spartan accent. The stacked chart needs three categorical
 * hues, which the muted Spartan ramp cannot supply at a readable chroma, so it
 * uses a CVD-validated blue / orange / aqua set (the same three the paper
 * uses). Every mark carries a <title> for a hover readout, and each figure
 * sits next to the table that holds its numbers.
 */

const axisText = "fill-zinc-500 dark:fill-zinc-400";
const labelText = "fill-zinc-900 dark:fill-zinc-100";
const mutedText = "fill-zinc-600 dark:fill-zinc-400";
const grid = "stroke-zinc-200 dark:stroke-zinc-800";
const accentFill = "fill-spartan-600 dark:fill-spartan-400";
const accentStroke = "stroke-spartan-600 dark:stroke-spartan-400";
const surfaceFill = "fill-white dark:fill-zinc-950";

const usd = (value: number, digits = 3) => `$${value.toFixed(digits)}`;

function CostVsPass() {
	const width = 640;
	const height = 360;
	const left = 64;
	const right = 20;
	const top = 44;
	const bottom = 56;
	const x = (cost: number) => left + (cost / 0.6) * (width - left - right);
	const y = (pass: number) => top + ((100 - pass) / 20) * (height - top - bottom);
	// Label placement per point, tuned so no two labels collide. A label is a
	// name line and a value line (or one line when `inline`); `note` adds a third.
	const labels: Record<
		string,
		{ dx: number; dy: number; anchor: "start" | "end"; inline?: boolean; note?: string }
	> = {
		"Always Sonnet": {
			dx: 8,
			dy: 34,
			anchor: "start",
			note: `Dashed ring: hindsight oracle, ${usd(oracleCost)}`,
		},
		"Parent picks (C1_inline)": { dx: 14, dy: -14, anchor: "start", inline: true },
		"Always Haiku": { dx: 14, dy: -4, anchor: "start" },
		"Always Opus (B, the default)": { dx: 8, dy: 72, anchor: "end" },
	};
	return (
		<svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-labelledby="fig-cvp">
			<title id="fig-cvp">
				Scatter plot of cost per completed task against pass rate for four policies
			</title>
			{[80, 85, 90, 95, 100].map((tick) => (
				<g key={tick}>
					<line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className={grid} />
					<text x={left - 10} y={y(tick) + 4} textAnchor="end" fontSize={13} className={axisText}>
						{tick}%
					</text>
				</g>
			))}
			{[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].map((tick) => (
				<text
					key={tick}
					x={x(tick)}
					y={height - bottom + 22}
					textAnchor="middle"
					fontSize={13}
					className={axisText}
				>
					{usd(tick, 2)}
				</text>
			))}
			<text
				x={(left + width - right) / 2}
				y={height - 8}
				textAnchor="middle"
				fontSize={13}
				className={mutedText}
			>
				Cost per completed task (list price, USD)
			</text>
			<text
				transform={`translate(16 ${(top + height - bottom) / 2}) rotate(-90)`}
				textAnchor="middle"
				fontSize={13}
				className={mutedText}
			>
				Pass rate
			</text>
			<circle
				cx={x(oracleCost)}
				cy={y(100)}
				r={13}
				fill="none"
				strokeWidth={1.5}
				strokeDasharray="3 3"
				className="stroke-zinc-400 dark:stroke-zinc-500"
			>
				{/* A <title> must hold one string: split text nodes break hydration. */}
				<title>{`Hindsight oracle: ${usd(oracleCost)} per completed task, 100% pass`}</title>
			</circle>
			{costVsPass.map((point) => {
				const label = labels[point.policy] ?? { dx: 14, dy: 0, anchor: "start" as const };
				const cx = x(point.cost);
				const cy = y(point.pass);
				const value = `${usd(point.cost)} · ${point.pass}%`;
				return (
					<g key={point.policy}>
						<circle
							cx={cx}
							cy={cy}
							r={7}
							strokeWidth={2.5}
							className={`${accentStroke} ${point.highlight ? accentFill : surfaceFill}`}
						>
							<title>{`${point.policy}: ${usd(point.cost)} per completed task, ${point.pass}% pass`}</title>
						</circle>
						<text
							x={cx + label.dx}
							y={cy + label.dy}
							textAnchor={label.anchor}
							fontSize={14}
							fontWeight={600}
							className={labelText}
						>
							{point.policy}
							{label.inline && <tspan fontWeight={400} className={mutedText}>{`  ${value}`}</tspan>}
						</text>
						{!label.inline && (
							<text
								x={cx + label.dx}
								y={cy + label.dy + 17}
								textAnchor={label.anchor}
								fontSize={13}
								className={mutedText}
							>
								{value}
							</text>
						)}
						{label.note && (
							<text
								x={cx + label.dx}
								y={cy + label.dy + 34}
								textAnchor={label.anchor}
								fontSize={13}
								className={axisText}
							>
								{label.note}
							</text>
						)}
					</g>
				);
			})}
		</svg>
	);
}

const SEGMENTS = [
	{
		key: "cacheReads",
		/** Legend x-offset, sized to the labels so they never overlap. */
		legendX: 0,
		label: "Cache reads",
		className: "fill-[#2a78d6] dark:fill-[#3987e5]",
	},
	{
		key: "cacheWrites",
		legendX: 112,
		label: "Cache writes (1-hour TTL)",
		className: "fill-[#eb6834] dark:fill-[#d95926]",
	},
	{
		key: "output",
		legendX: 310,
		label: "Output",
		className: "fill-[#1baf7a] dark:fill-[#199e70]",
	},
] as const;

function CostByTokenType() {
	const width = 640;
	const left = 196;
	const right = 72;
	const top = 48;
	const rowHeight = 64;
	const barHeight = 30;
	const height = top + costByTokenType.length * rowHeight + 36;
	const max = 0.55;
	const scale = (value: number) => (value / max) * (width - left - right);
	return (
		<svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-labelledby="fig-cbt">
			<title id="fig-cbt">
				Stacked bars of mean worker session cost by token type for Sonnet, Haiku and Opus
			</title>
			{SEGMENTS.map((segment) => (
				<g key={segment.key} transform={`translate(${left + segment.legendX} 14)`}>
					<rect width={12} height={12} rx={3} className={segment.className} />
					<text x={18} y={11} fontSize={13} className={mutedText}>
						{segment.label}
					</text>
				</g>
			))}
			{[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((tick) => (
				<g key={tick}>
					<line
						x1={left + scale(tick)}
						x2={left + scale(tick)}
						y1={top - 6}
						y2={height - 30}
						className={grid}
					/>
					<text
						x={left + scale(tick)}
						y={height - 12}
						textAnchor="middle"
						fontSize={13}
						className={axisText}
					>
						{usd(tick, 2)}
					</text>
				</g>
			))}
			{costByTokenType.map((row, rowIndex) => {
				const barY = top + rowIndex * rowHeight + (rowHeight - barHeight) / 2;
				let offset = 0;
				return (
					<g key={row.model}>
						<text
							x={left - 12}
							y={barY + 12}
							textAnchor="end"
							fontSize={14}
							fontWeight={600}
							className={labelText}
						>
							{row.model}
						</text>
						<text x={left - 12} y={barY + 29} textAnchor="end" fontSize={12} className={mutedText}>
							{row.detail}
						</text>
						{SEGMENTS.map((segment) => {
							const value = row[segment.key];
							const segmentX = left + scale(offset);
							const segmentWidth = scale(value);
							offset += value;
							return (
								<g key={segment.key}>
									{/* 2px surface gap between stacked segments. */}
									<rect
										x={segmentX}
										y={barY}
										width={Math.max(segmentWidth - 2, 1)}
										height={barHeight}
										rx={3}
										className={segment.className}
									>
										<title>{`${row.model} · ${segment.label}: ${usd(value)}`}</title>
									</rect>
									{segmentWidth > 58 && (
										<text
											x={segmentX + (segmentWidth - 2) / 2}
											y={barY + barHeight / 2 + 5}
											textAnchor="middle"
											fontSize={13}
											fontWeight={600}
											className="pointer-events-none fill-white"
										>
											{usd(value)}
										</text>
									)}
								</g>
							);
						})}
						<text
							x={left + scale(row.total) + 8}
							y={barY + barHeight / 2 + 5}
							fontSize={14}
							fontWeight={600}
							className={labelText}
						>
							{usd(row.total)}
						</text>
					</g>
				);
			})}
		</svg>
	);
}

function PriceVsTaskCost() {
	const width = 640;
	const left = 150;
	const right = 40;
	const top = 44;
	const rowHeight = 50;
	const height = top + priceVsTaskCost.length * rowHeight + 44;
	// Log2 axis from 0.25× to 8×.
	const x = (ratio: number) => left + ((Math.log2(ratio) + 2) / 5) * (width - left - right);
	const ticks = [0.25, 0.5, 1, 2, 4, 8];
	return (
		<svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-labelledby="fig-pvt">
			<title id="fig-pvt">
				Per-token list price against measured cost per completed task, relative to Sonnet 5
			</title>
			<g transform={`translate(${left} 14)`}>
				<circle
					cx={6}
					cy={6}
					r={6}
					strokeWidth={2.5}
					className={`stroke-zinc-400 dark:stroke-zinc-500 ${surfaceFill}`}
				/>
				<text x={18} y={11} fontSize={13} className={mutedText}>
					List price per token
				</text>
				<circle cx={196} cy={6} r={6} className={accentFill} />
				<text x={208} y={11} fontSize={13} className={mutedText}>
					Measured cost per completed task
				</text>
			</g>
			{ticks.map((tick) => (
				<g key={tick}>
					<line
						x1={x(tick)}
						x2={x(tick)}
						y1={top}
						y2={height - 36}
						strokeDasharray={tick === 1 ? "4 4" : undefined}
						className={tick === 1 ? "stroke-zinc-400 dark:stroke-zinc-600" : grid}
					/>
					<text x={x(tick)} y={height - 18} textAnchor="middle" fontSize={13} className={axisText}>
						{tick}×
					</text>
				</g>
			))}
			{priceVsTaskCost.map((row, index) => {
				const cy = top + index * rowHeight + rowHeight / 2;
				const same = row.price === row.task;
				return (
					<g key={row.model}>
						<text
							x={left - 16}
							y={cy + 5}
							textAnchor="end"
							fontSize={14}
							fontWeight={600}
							className={labelText}
						>
							{row.model}
						</text>
						{!same && (
							<>
								<line
									x1={x(row.price)}
									x2={x(row.task)}
									y1={cy}
									y2={cy}
									strokeWidth={2}
									className="stroke-zinc-400 dark:stroke-zinc-600"
								/>
								<circle
									cx={x(row.price)}
									cy={cy}
									r={7}
									strokeWidth={2.5}
									className={`stroke-zinc-400 dark:stroke-zinc-500 ${surfaceFill}`}
								>
									<title>{`${row.model}: ${row.price}× Sonnet’s price per token`}</title>
								</circle>
								<text
									x={x(row.price) - 12}
									y={cy + 5}
									textAnchor="end"
									fontSize={13}
									className={mutedText}
								>
									{row.price}×
								</text>
							</>
						)}
						<circle cx={x(row.task)} cy={cy} r={7} className={accentFill}>
							<title>{`${row.model}: ${row.task}× Sonnet’s cost per completed task`}</title>
						</circle>
						<text
							x={x(row.task) + 13}
							y={cy + 5}
							fontSize={14}
							fontWeight={600}
							className={labelText}
						>
							{same ? "1× (reference)" : `${row.task}×`}
						</text>
					</g>
				);
			})}
		</svg>
	);
}

const FIGURES: Record<FigureId, () => React.JSX.Element> = {
	"cost-vs-pass": CostVsPass,
	"cost-by-token-type": CostByTokenType,
	"price-vs-task-cost": PriceVsTaskCost,
};

export function ResearchFigure({ figure }: { figure: FigureId }) {
	const Chart = FIGURES[figure];
	// Below ~34rem the SVG text would scale down past legibility, so on a phone
	// the chart keeps its size and scrolls sideways inside its frame instead.
	return (
		<div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
			<div className="min-w-[34rem]">
				<Chart />
			</div>
		</div>
	);
}

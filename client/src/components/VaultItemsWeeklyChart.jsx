import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMediaQuery } from "../hooks/useMediaQuery";

function WeeklyTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }
  const row = payload[0].payload;
  const count = Number(payload[0].value);
  const start = row.weekStart ? new Date(row.weekStart) : null;
  const end = start ? new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md dark:border-cyan-300/20 dark:bg-cyber-900/95">
      {start && end ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {start.toLocaleDateString()} – {end.toLocaleDateString()}
        </p>
      ) : null}
      <p className="mt-1 font-semibold text-slate-900 dark:text-cyan-100">
        {count} {count === 1 ? "item" : "items"} created
      </p>
    </div>
  );
}

function VaultItemsWeeklyChart({ data }) {
  const isWide = useMediaQuery("(min-width: 640px)");

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const chartHeight = isWide ? 300 : 240;
  const xAxisHeight = isWide ? 56 : 44;

  return (
    <div className="vault-weekly-chart w-full text-slate-600 dark:text-slate-300">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 4, left: isWide ? -8 : -16, bottom: isWide ? 4 : 0 }}
          barCategoryGap={isWide ? "12%" : "8%"}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-[0.15]" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: isWide ? 11 : 9, fill: "currentColor" }}
            tickLine={false}
            axisLine={{ stroke: "currentColor", opacity: 0.25 }}
            interval={0}
            angle={isWide ? -32 : -48}
            textAnchor="end"
            height={xAxisHeight}
          />
          <YAxis
            tick={{ fontSize: isWide ? 11 : 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={{ stroke: "currentColor", opacity: 0.25 }}
            allowDecimals={false}
            width={isWide ? 36 : 28}
          />
          <Tooltip cursor={{ fill: "currentColor", opacity: 0.06 }} content={(tooltipProps) => <WeeklyTooltip {...tooltipProps} />} />
          <Bar
            dataKey="count"
            name="Items created"
            fill="url(#vaultBarGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
          <defs>
            <linearGradient id="vaultBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#0369a1" stopOpacity={0.85} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default VaultItemsWeeklyChart;

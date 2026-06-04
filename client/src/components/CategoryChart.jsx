import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "../utils/formatters.js";

const chartColors = {
  Food: "#16826a",
  Transport: "#087f8c",
  Bills: "#8b5cf6",
  Entertainment: "#b7791f",
  Shopping: "#c2410c",
  Health: "#0f766e",
  Other: "#6b7280"
};

export default function CategoryChart({ categoryTotals }) {
  const chartData = categoryTotals
    .filter((item) => item.total > 0)
    .map((item) => ({
      ...item,
      fill: chartColors[item.category] || "#16826a"
    }));

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Breakdown</p>
          <h2>Category spend</h2>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="empty-state compact">
          <strong>No chart data</strong>
          <p>Add expenses to see category totals.</p>
        </div>
      ) : (
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8df" />
              <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(22, 130, 106, 0.08)" }}
                formatter={(value) => [formatCurrency(value), "Spent"]}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

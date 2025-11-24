"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type CategoryData = {
  name: string;
  value: number;
  color: string;
};

type CategoryChartProps = {
  data: CategoryData[];
};

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="name"
          stroke="#999"
          style={{ fontSize: "12px" }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#999" style={{ fontSize: "12px" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#000",
            border: "1px solid #d5ff0a",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${String(index)}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

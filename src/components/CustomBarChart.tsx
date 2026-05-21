"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CustomBarChartProps {
  data: any[];
  keys: { key: string; color: string; name?: string }[];
  xAxisKey: string;
  stacked?: boolean;
  unit?: string;
}

export default function CustomBarChart({ data, keys, xAxisKey, stacked = false, unit = "%" }: CustomBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#888" 
          tick={{ fill: "#ccc", fontSize: 14 }} 
        />
        <YAxis 
          stroke="#888" 
          tick={{ fill: "#ccc" }} 
          domain={[0, 'auto']}
          unit={unit}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#1A1D24", border: "1px solid #333", color: "#E0E0E0" }}
          itemStyle={{ color: "#E0E0E0" }}
          cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        {keys.map((k) => (
          <Bar 
            key={k.key} 
            dataKey={k.key} 
            name={k.name || k.key} 
            fill={k.color} 
            animationDuration={1000}
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            maxBarSize={80}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

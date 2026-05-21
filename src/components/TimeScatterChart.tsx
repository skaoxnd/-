"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimeScatterChartProps {
  data: { x: number; y: number }[];
  isMacro: boolean;
}

export default function TimeScatterChart({ data, isMacro }: TimeScatterChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="?간 (?" 
          stroke="#888" 
          unit="s"
          domain={[0, 100]} // Just showing a 100s window
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="?릭 간격" 
          stroke="#888" 
          unit="s"
          domain={isMacro ? [0.245, 0.255] : [0, 1.5]}
        />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }} 
          contentStyle={{ backgroundColor: "#1A1D24", border: "1px solid #333", color: "#E0E0E0" }}
          formatter={(value: any) => typeof value === 'number' ? value.toFixed(4) + 's' : String(value)}
        />
        <Scatter 
          name="Click Interval" 
          data={data} 
          fill={isMacro ? "var(--crimson-red)" : "var(--neon-green)"} 
          line={isMacro}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

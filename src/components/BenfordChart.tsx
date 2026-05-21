"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BenfordChartProps {
  data: any[];
  showLine: boolean;
}

export default function BenfordChart({ data, showLine }: BenfordChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
        <XAxis 
          dataKey="digit" 
          stroke="#888" 
          tick={{ fill: "#ccc", fontSize: 14 }} 
        />
        <YAxis 
          stroke="#888" 
          tick={{ fill: "#ccc" }} 
          domain={[0, 35]}
          unit="%"
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#1A1D24", border: "1px solid #333", color: "#E0E0E0" }}
          itemStyle={{ color: "#E0E0E0" }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        
        <Bar 
          dataKey="?제분포" 
          name="?의??C ?출 ??" 
          fill="#6b7280" 
          radius={[4, 4, 0, 0]} 
          maxBarSize={60}
          animationDuration={1000}
        />
        
        {showLine && (
          <Line 
            type="monotone" 
            dataKey="벤포드확률" 
            name="벤포드 자연 확률 (수학적 진실)" 
            stroke="var(--crimson-red)" 
            strokeWidth={4}
            dot={{ r: 6, fill: "var(--crimson-red)", strokeWidth: 2, stroke: "#121212" }}
            activeDot={{ r: 8 }}
            animationDuration={1500}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface MapScatterProps {
  points: { x: number; y: number }[];
  policeTarget: { x: number; y: number };
  actualTarget: { x: number; y: number };
  bufferRadius: number;
  onGridClick: (x: number, y: number) => void;
}

export default function MapScatter({ points, policeTarget, actualTarget, bufferRadius, onGridClick }: MapScatterProps) {
  // Convert 0-100 coordinates to percentages
  const toPct = (val: number) => `${val}%`;

  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (bufferRadius < 10) return; // Only allow click when buffer is somewhat expanded
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // Snap to nearest 5 for easier clicking
    const snappedX = Math.round(x / 5) * 5;
    const snappedY = Math.round(y / 5) * 5;
    onGridClick(snappedX, snappedY);
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-square bg-[#0a0a0a] border border-[#333] rounded overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '10% 10%'
        }}
      />
      
      <svg className="absolute inset-0 w-full h-full cursor-crosshair" onClick={handleSVGClick}>
        {/* Buffers */}
        {points.map((pt, i) => (
          <motion.circle
            key={`buffer-${i}`}
            cx={toPct(pt.x)}
            cy={toPct(pt.y)}
            r={`${bufferRadius}%`}
            fill="rgba(255, 48, 48, 0.15)"
            stroke="rgba(255, 48, 48, 0.4)"
            strokeWidth="1"
            transition={{ duration: 0.1 }}
          />
        ))}

        {/* Courier Points */}
        {points.map((pt, i) => (
          <circle
            key={`pt-${i}`}
            cx={toPct(pt.x)}
            cy={toPct(pt.y)}
            r="4"
            fill="var(--neon-green)"
          />
        ))}

        {/* Police Target (Arithmetic Mean) */}
        <g transform={`translate(${policeTarget.x}%, ${policeTarget.y}%)`} style={{ transformOrigin: "center" }}>
          <circle cx="0" cy="0" r="6" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#fff" strokeWidth="2" opacity="0.8" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#fff" strokeWidth="2" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}

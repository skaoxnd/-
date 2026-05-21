"use client";

import { ReactNode } from "react";

interface ControlPanelProps {
  title?: string;
  children: ReactNode;
}

export default function ControlPanel({ title = "CONTROL CONSOLE", children }: ControlPanelProps) {
  return (
    <div className="w-full h-full bg-[#0d0f12] border-t border-gray-800 p-6 flex flex-col relative overflow-hidden">
      {/* 장식용 스캔라인 */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{ backgroundImage: 'linear-gradient(transparent 50%, #000 50%)', backgroundSize: '100% 4px' }} />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-400 font-mono text-sm tracking-wider flex items-center gap-2">
          <span className="text-[var(--crimson-red)]">&gt;</span> {title}
        </h3>
      </div>
      
      <div className="flex-1 flex flex-col gap-4 relative z-10">
        {children}
      </div>
    </div>
  );
}

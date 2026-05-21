"use client";

import React from "react";
import NarrativeBox from "./NarrativeBox";
import { Terminal, Cpu, Database, Wifi } from "lucide-react";
import { useGameProgress } from "./GameProgressProvider";

interface ShellLayoutProps {
  narrativeText: string;
  visualization: React.ReactNode;
  controls: React.ReactNode;
  onNarrativeComplete?: () => void;
}

export default function ShellLayout({ narrativeText, visualization, controls, onNarrativeComplete }: ShellLayoutProps) {
  const { deviceId } = useGameProgress();
  
  return (
    <div className="flex flex-col w-full h-full p-4 gap-4 bg-[var(--background)] cyber-border">
      {/* Top Header / Status Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#222] pb-2 px-2">
        <div className="flex items-center gap-2 text-[var(--neon-green)] font-mono">
          <Terminal size={20} />
          <span className="font-bold tracking-widest text-lg neon-text-green">N.P.A FORENSIC TERMINAL v2.4</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono text-gray-500">
          <div className="flex items-center gap-1"><Cpu size={14} className="text-gray-400"/> CPU: 82%</div>
          <div className="flex items-center gap-1"><Database size={14} className="text-gray-400"/> RAM: 4.2GB/8.0GB</div>
          <div className="flex items-center gap-1 text-[var(--neon-green)] animate-pulse"><Wifi size={14}/> ONLINE [{deviceId}]</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row w-full flex-1 gap-4 overflow-hidden">
        {/* Left Column: Narrative (40%) */}
        <div className="w-full md:w-2/5 md:h-full flex flex-col gap-4 overflow-hidden">
          <div className="flex-[3] bg-[var(--panel-bg)] border border-[#222] rounded-md overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <NarrativeBox text={narrativeText} onComplete={onNarrativeComplete} />
          </div>
          <div className="flex-[2] bg-[var(--panel-bg)] border border-[#222] rounded-md overflow-y-auto p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] custom-scrollbar">
            {controls}
          </div>
        </div>

        {/* Right Column: Visualization & Controls (60%) */}
        <div className="w-full md:w-3/5 h-2/3 md:h-full flex flex-col">
          <div className="flex-1 bg-[var(--panel-bg)] border border-[#222] rounded-md overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            {visualization}
          </div>
        </div>
      </div>
    </div>
  );
}

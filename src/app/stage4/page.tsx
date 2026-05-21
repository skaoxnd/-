"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import MapScatter from "@/components/MapScatter";
import { stage4Config } from "@/data/gameConfig";
import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Stage4Page() {
  const router = useRouter();
  const [bufferRadius, setBufferRadius] = useState(0);
  const [clickAttempt, setClickAttempt] = useState<{x: number, y: number} | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showError, setShowError] = useState(false);

  let narrativeText = stage4Config.narrative.intro;
  if (isResolved) {
    narrativeText = stage4Config.narrative.success;
  }

  const handleGridClick = (x: number, y: number) => {
    setClickAttempt({ x, y });
    const target = stage4Config.data.actualTarget;
    // Allow a small margin of error (±5)
    if (Math.abs(x - target.x) <= 5 && Math.abs(y - target.y) <= 5) {
      setIsResolved(true);
      setShowError(false);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const visualization = (
    <div className="w-full h-full p-4 flex flex-col items-center relative">
      <h2 className="text-xl font-mono text-[var(--neon-green)] mb-6 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        {isResolved ? "??처 ?정 ?료 (?곽 물류 창고)" : "지리적 ?로?일?(버퍼??률 ?"}
      </h2>
      <div className="flex-1 w-full flex items-center justify-center">
        <MapScatter 
          points={stage4Config.data.points}
          policeTarget={stage4Config.data.policeTarget}
          actualTarget={stage4Config.data.actualTarget}
          bufferRadius={bufferRadius}
          onGridClick={handleGridClick}
        />
      </div>
      {clickAttempt && !isResolved && (
        <div className="absolute bottom-4 font-mono text-xs text-gray-500">
          마??분석 좌표: [{clickAttempt.x}, {clickAttempt.y}]
        </div>
      )}
    </div>
  );

  const controls = (
    <div className="flex flex-col h-full justify-center gap-6 px-8">
      <div className="flex flex-col gap-4 bg-black/40 p-6 rounded border border-gray-800">
        <div className="flex items-center gap-3">
          <MapPin className="text-[var(--neon-green)]" />
          <h4 className="text-lg font-mono text-gray-200">버퍼 반경 설정</h4>
        </div>
        <p className="text-sm text-gray-500">
          슬라이더를 조절하여 교차하는 붉은 영역 중앙을 <b>직접 클릭</b>하십시오.
        </p>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-mono text-gray-500">0</span>
          <input 
            type="range" 
            min="0" 
            max="60" 
            step="1"
            value={bufferRadius} 
            onChange={(e) => setBufferRadius(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[var(--crimson-red)]"
          />
          <span className="font-mono text-[var(--crimson-red)]">{bufferRadius}</span>
        </div>
        {showError && <p className="text-[var(--crimson-red)] text-sm font-mono mt-2 animate-pulse">?당 좌표???률 밀?? ???다. 붉???군집??중앙???릭?십?오.</p>}
      </div>

      {isResolved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end">
          <button 
            onClick={() => router.push("/stage5")}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--neon-green)] text-black font-bold font-mono hover:shadow-[0_0_15px_var(--neon-green)] transition-all animate-pulse"
          >
            최종 ?의???문 <ArrowRight size={20} />
          </button>
        </motion.div>
      )}
    </div>
  );

  return (
    <ShellLayout
      narrativeText={narrativeText}
      visualization={visualization}
      controls={controls}
    />
  );
}

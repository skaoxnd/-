"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import MapScatter from "@/components/MapScatter";
import { stage4Config } from "@/data/gameConfig";
import { ArrowRight, MapPin, Lock } from "lucide-react";
import { useGameProgress } from "@/components/GameProgressProvider";
import { motion } from "framer-motion";

export default function Stage4Page() {
  const router = useRouter();
  const { unlockStage } = useGameProgress();
  const [bufferRadius, setBufferRadius] = useState(0);
  const [clickAttempt, setClickAttempt] = useState<{x: number, y: number} | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isIntroRead, setIsIntroRead] = useState(false);
  const [isSuccessRead, setIsSuccessRead] = useState(false);

  let narrativeText = stage4Config.narrative.intro;
  if (isResolved) {
    narrativeText = stage4Config.narrative.success;
  }

  const handleGridClick = (x: number, y: number) => {
    if (!isIntroRead) return;
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

  const handleNarrativeComplete = () => {
    if (!isResolved) {
      setIsIntroRead(true);
    } else {
      setIsSuccessRead(true);
    }
  };

  const securityLock = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono text-center border border-dashed border-red-500/30 rounded-lg bg-red-950/5">
      <Lock className="text-[var(--crimson-red)] animate-pulse mb-4" size={32} />
      <h3 className="text-lg font-bold text-[var(--crimson-red)] uppercase tracking-wider mb-2">
        보안 제어 잠금 (SYS_LOCK)
      </h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        사건 데이터 분석 및 제어 장치가 비활성화되어 있습니다.
        먼저 좌측의 시스템 대화 로그(NARRATIVE_LOG)를 끝까지 읽어 수사 요건을 활성화하십시오.
      </p>
    </div>
  );

  const visualization = !isIntroRead ? securityLock : (
    <div className="w-full h-full p-4 flex flex-col items-center relative">
      <h2 className="text-xl font-mono text-[var(--neon-green)] mb-6 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        {isResolved ? "은신처 특정 완료 (외곽 물류 창고)" : "지리적 프로파일링 (버퍼존 확률 맵)"}
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
          마지막 분석 좌표: [{clickAttempt.x}, {clickAttempt.y}]
        </div>
      )}
    </div>
  );

  const controls = !isIntroRead ? (
    <div className="flex flex-col h-full justify-center items-center p-6 text-center font-mono">
      <p className="text-gray-500 text-sm">대화 분석 완료 시 제어 인터페이스 활성화</p>
    </div>
  ) : (
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
        {showError && <p className="text-[var(--crimson-red)] text-sm font-mono mt-2 animate-pulse">해당 좌표는 확률 밀도가 낮습니다. 붉은색 군집의 중앙을 클릭하십시오.</p>}
      </div>

      {isResolved && !isSuccessRead && (
        <div className="flex flex-col items-end mt-4">
          <p className="text-sm text-gray-500 font-mono animate-pulse">
            사건 분석 완료. 결과 로그 분석 대기 중...
          </p>
        </div>
      )}

      {isResolved && isSuccessRead && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end mt-4">
          <button 
            onClick={() => {
              unlockStage(5);
              router.push("/stage5");
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--neon-green)] text-black font-bold font-mono hover:shadow-[0_0_15px_var(--neon-green)] transition-all"
          >
            최종 용의자 심문 <ArrowRight size={20} />
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
      onNarrativeComplete={handleNarrativeComplete}
    />
  );
}

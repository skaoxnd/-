"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import BenfordChart from "@/components/BenfordChart";
import { stage5Config } from "@/data/gameConfig";
import { Power, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { useGameProgress } from "@/components/GameProgressProvider";
import { motion } from "framer-motion";

export default function Stage5Page() {
  const router = useRouter();
  const { unlockStage } = useGameProgress();
  const [isBenfordOn, setIsBenfordOn] = useState(false);
  const [code, setCode] = useState("");
  const [isError, setIsError] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [isIntroRead, setIsIntroRead] = useState(false);
  const [isSuccessRead, setIsSuccessRead] = useState(false);

  let narrativeText = stage5Config.narrative.intro;
  if (isCleared) {
    narrativeText = stage5Config.narrative.success;
  }

  const handleVerify = () => {
    if (code === stage5Config.data.correctPassword) {
      setIsError(false);
      setIsCleared(true);
    } else {
      setIsError(true);
      setCode("");
    }
  };

  const handleNarrativeComplete = () => {
    if (!isCleared) {
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
        {isBenfordOn ? "벤포드의 법칙 (자연 곡선 vs 조작된 장부)" : "용의자 장부 (균등 위장 데이터)"}
      </h2>
      <div className="w-full flex-1 min-h-[300px]">
        <BenfordChart data={stage5Config.data.benford} showLine={isBenfordOn} />
      </div>
      
      {isCleared && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-md"
        >
          <CheckCircle size={100} className="text-[var(--neon-green)] mb-6" />
          <h1 className="text-5xl font-mono text-white tracking-widest neon-text-green">MISSION CLEAR</h1>
          <p className="text-xl text-gray-400 mt-4 font-sans">모든 스테이지 데이터 검증 완료</p>
          
          {!isSuccessRead ? (
            <p className="mt-8 font-mono text-sm text-gray-500 animate-pulse">
              🔒 최종 종결 대화 분석 완료 대기 중...
            </p>
          ) : (
            <button 
              onClick={() => {
                unlockStage(6);
                router.push("/epilogue");
              }}
              className="mt-8 px-6 py-2 border border-[var(--neon-green)] text-[var(--neon-green)] font-mono hover:bg-[var(--neon-green)] hover:text-black transition-colors"
            >
              보고서 승인
            </button>
          )}
        </motion.div>
      )}
    </div>
  );

  const controls = !isIntroRead ? (
    <div className="flex flex-col h-full justify-center items-center p-6 text-center font-mono">
      <p className="text-gray-500 text-sm">대화 분석 완료 시 제어 인터페이스 활성화</p>
    </div>
  ) : (
    <div className="flex flex-col h-full justify-center gap-6 px-8">
      <div className="flex items-center justify-between bg-black/40 p-6 rounded border border-gray-800">
        <div>
          <h4 className="text-lg font-mono text-gray-200">벤포드의 자연 확률 모델</h4>
          <p className="text-sm text-gray-500 mt-1">회색 막대와 붉은 곡선을 비교하십시오.</p>
        </div>
        <button 
          onClick={() => setIsBenfordOn(!isBenfordOn)}
          disabled={isCleared}
          className={`p-4 rounded-full transition-all ${isBenfordOn ? 'bg-[var(--neon-green)] text-black shadow-[0_0_20px_var(--neon-green)]' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
        >
          <Power size={32} />
        </button>
      </div>

      {isBenfordOn && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 bg-black/40 p-6 rounded border border-gray-800">
          <label className="font-mono text-sm text-[var(--crimson-red)] flex items-center gap-2">
            <AlertTriangle size={16} /> 오차가 가장 큰 3개의 숫자(1~9)를 입력하라
          </label>
          <p className="text-xs text-gray-500 mb-2">실제 장부(막대)와 수학적 진실(곡선)의 간격이 큰 순서대로 암호를 입력하여 백도어 시스템을 강제 해독하십시오.</p>
          <div className="flex gap-4">
            <input 
              type="text" 
              maxLength={3}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              disabled={isCleared}
              placeholder="___"
              className={`flex-1 bg-black border-2 ${isError ? 'border-[var(--crimson-red)]' : 'border-gray-700'} text-white font-mono text-2xl p-3 text-center tracking-[1em] rounded focus:outline-none focus:border-[var(--neon-green)] transition-colors`}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button 
              onClick={handleVerify}
              disabled={code.length !== 3 || isCleared}
              className="bg-gray-800 disabled:opacity-50 text-white px-8 font-mono font-bold rounded hover:bg-gray-700 transition-colors"
            >
              해독
            </button>
          </div>
          {isError && <p className="text-[var(--crimson-red)] font-mono text-sm animate-pulse">접근 거부: 비밀번호가 일치하지 않습니다.</p>}
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

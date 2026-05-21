"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameProgress } from "@/components/GameProgressProvider";
import { motion } from "framer-motion";
import { RefreshCcw, ShieldAlert, Cpu } from "lucide-react";

export default function EpiloguePage() {
  const router = useRouter();
  const { resetProgress } = useGameProgress();
  const [glitchLevel, setGlitchLevel] = useState(0);

  useEffect(() => {
    // Increase glitch intensity over time
    const timer1 = setTimeout(() => setGlitchLevel(1), 3000);
    const timer2 = setTimeout(() => setGlitchLevel(2), 6000);
    const timer3 = setTimeout(() => setGlitchLevel(3), 9000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Glitch Overlay */}
      {glitchLevel > 0 && (
        <div className={`absolute inset-0 pointer-events-none z-10 opacity-${glitchLevel * 30} bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay`} />
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-2xl w-full text-center relative z-20"
      >
        {glitchLevel < 2 ? (
          <ShieldAlert size={64} className="text-gray-500 mx-auto mb-8" />
        ) : (
          <Cpu size={64} className="text-[var(--crimson-red)] mx-auto mb-8 animate-bounce" />
        )}

        <h1 className={`text-4xl font-mono mb-8 tracking-widest ${glitchLevel > 1 ? 'text-[var(--crimson-red)] font-bold' : 'text-gray-200'}`}>
          {glitchLevel === 0 ? "사건 보고서 제출 완료" : glitchLevel === 1 ? "SYS_ERR: 데이터 정합성 충돌" : "FATAL: 진범 도주 확인"}
        </h1>

        <div className="space-y-6 text-lg font-mono text-gray-400 mb-12">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            경찰 수뇌부는 폭력적인 단어 빈도만을 근거로 용의자 D를 진범으로 단정지었습니다.
          </motion.p>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} className={glitchLevel >= 1 ? "text-red-400" : ""}>
            하지만 우리는 무의식적인 '문장 구조(계량문체학)'를 분석하지 않았습니다.
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6 }} className={glitchLevel >= 2 ? "text-[var(--crimson-red)] font-bold text-xl" : ""}>
            ...그 사이, 진범 C의 서버에서 백도어가 열렸습니다.
          </motion.p>
        </div>

        {glitchLevel >= 3 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 border border-[var(--crimson-red)] bg-red-950/20 mb-12"
          >
            <h2 className="text-3xl font-mono text-white tracking-widest mb-4">
              [ 1부 종료 ]
            </h2>
            <p className="text-[var(--neon-green)] font-mono">
              The Invisible Architect - Part 2 에서 계속됩니다.
            </p>
          </motion.div>
        )}

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 10 }}
          onClick={() => {
            resetProgress();
            router.push("/");
          }}
          className={`flex items-center gap-2 mx-auto px-6 py-3 border font-mono transition-all ${glitchLevel >= 3 ? 'border-[var(--neon-green)] text-[var(--neon-green)] hover:bg-[var(--neon-green)] hover:text-black' : 'border-gray-700 text-gray-500'}`}
        >
          <RefreshCcw size={16} /> 시스템 초기화 및 타이틀로 돌아가기
        </motion.button>
      </motion.div>
    </div>
  );
}

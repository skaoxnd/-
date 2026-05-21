"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useGameProgress } from "@/components/GameProgressProvider";

export default function IntroPage() {
  const router = useRouter();
  const { deviceId, maxUnlockedStage, resetProgress } = useGameProgress();
  const [logs, setLogs] = useState<string[]>([]);
  const [bootComplete, setBootComplete] = useState(false);

  const bootSequence = [
    "INITIALIZING KERNEL...",
    "LOADING SECURE MODULES... [OK]",
    "ESTABLISHING ENCRYPTED CONNECTION... [OK]",
    "ACCESSING N.P.A COLD CASE DATABASE...",
    "DECRYPTING FILE: 2023-F-994...",
    "WARNING: COGNITIVE BIAS DETECTED IN PREVIOUS REPORTS.",
    "LOADING FACTFULNESS PROTOCOL... [ACTIVE]",
    "SYSTEM READY."
  ];

  useEffect(() => {
    let delay = 0;
    bootSequence.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === bootSequence.length - 1) {
          setTimeout(() => setBootComplete(true), 800);
        }
      }, delay);
      delay += Math.random() * 400 + 200; // Random delay for realism
    });
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-black flex flex-col items-center justify-center p-4 cyber-border relative overflow-hidden">
      <div className="max-w-3xl w-full flex flex-col gap-8 z-10">
        <div className="flex items-center gap-4 text-[var(--neon-green)]">
          <ShieldAlert size={48} className="animate-pulse" />
          <div>
            <h1 className="text-4xl font-mono font-bold tracking-widest neon-text-green">
              보이지 않는 설계자와 마지막 증명
            </h1>
            <p className="text-gray-400 font-mono mt-2">N.P.A STATISTICAL PROFILING UNIT</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-lg min-h-[300px] font-mono text-sm shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
            <Terminal size={16} className="text-gray-500" />
            <span className="text-gray-500">root@forensic-terminal:~#</span>
          </div>
          <div className="flex flex-col gap-2">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={log.includes("WARNING") ? "text-[var(--crimson-red)]" : "text-[#00ffcc]"}
              >
                {log}
              </motion.div>
            ))}
            {!bootComplete && (
              <motion.div 
                animate={{ opacity: [1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-3 h-5 bg-[#00ffcc] inline-block mt-2"
              />
            )}
          </div>
        </div>

        {bootComplete && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <p className="text-gray-400 font-mono text-center mb-4">
              {maxUnlockedStage > 0 && <span className="text-[var(--neon-green)] block mb-2">[ 접속됨: AGENT {deviceId} ]</span>}
              당신의 무기는 직감이 아닌 '차가운 데이터'입니다.<br/>
              통계의 편견을 부수고 진범을 찾아내십시오.
            </p>
            
            {maxUnlockedStage > 0 ? (
              <div className="flex flex-col gap-4 w-full max-w-md mt-4">
                <button
                  onClick={() => router.push(maxUnlockedStage === 5 ? "/epilogue" : `/stage${maxUnlockedStage}`)}
                  className="w-full px-8 py-3 bg-[var(--neon-green)] text-black font-mono font-bold text-lg hover:shadow-[0_0_20px_rgba(57,255,20,0.6)] transition-all"
                >
                  [ 진행 데이터 이어서 하기 (Stage {maxUnlockedStage}) ]
                </button>
                <button
                  onClick={resetProgress}
                  className="w-full px-8 py-3 bg-transparent border border-gray-600 text-gray-400 font-mono font-bold hover:bg-gray-800 hover:text-white transition-all"
                >
                  [ 새로 시작 (데이터 초기화) ]
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/prologue")}
                className="px-8 py-4 bg-transparent border-2 border-[var(--neon-green)] text-[var(--neon-green)] font-mono font-bold text-xl hover:bg-[var(--neon-green)] hover:text-black transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] mt-4"
              >
                [ 시스템 가동 (프롤로그) ]
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

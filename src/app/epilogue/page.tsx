"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function EpiloguePage() {
  const [logs, setLogs] = useState<string[]>([]);

  const endingSequence = [
    "[SYSTEM] 기밀 데이터 원본 회수 완료.",
    "[SYSTEM] 사건 번호 2023-F-994 영구 종결.",
    "--------------------------------------------------",
    ">> 당신은 눈앞에 보이는 큰 숫자에 겁을 먹고 (크기 본능),",
    ">> 하나의 선이 영원히 이어질 것이라 착각하며 (직선 본능),",
    ">> 세상이 평면적이고 평균적일 것이라는 본능에 지배당했던",
    ">> 과거 수사의 오류를 모두 바로잡았습니다.",
    " ",
    ">> 직관이 아닌 '데이터'로 세상을 바라보았고,",
    ">> 교만한 범죄자의 마지막 거짓말마저 통계로 찢어버렸습니다.",
    " ",
    ">> 세상을 올바르게 이해하는 힘,",
    ">> 그것이 바로 팩트풀니스(Factfulness)입니다."
  ];

  useEffect(() => {
    let isMounted = true;
    setLogs([]); // Reset logs on mount
    
    const timeouts: NodeJS.Timeout[] = [];
    let delay = 500;
    
    endingSequence.forEach((log) => {
      const t = setTimeout(() => {
        if (isMounted) {
          setLogs(prev => [...prev, log]);
        }
      }, delay);
      timeouts.push(t);
      delay += 800; 
    });

    return () => {
      isMounted = false;
      timeouts.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-black flex flex-col items-center justify-center p-4 cyber-border relative overflow-hidden">
      <div className="max-w-3xl w-full flex flex-col gap-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 text-[var(--neon-green)] border-b border-gray-800 pb-6"
        >
          <CheckCircle size={48} />
          <div>
            <h1 className="text-4xl font-mono font-bold tracking-widest neon-text-green">
              미제사건 파일 : 완벽한 증명
            </h1>
            <p className="text-gray-400 font-mono mt-2">수고하셨습니다. 프로파일러님.</p>
          </div>
        </motion.div>

        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-lg min-h-[400px] font-mono text-lg shadow-[0_0_20px_rgba(57,255,20,0.1)]">
          <div className="flex flex-col gap-3">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={log.includes("[SYSTEM]") ? "text-[var(--neon-green)] font-bold" : "text-gray-300 leading-relaxed"}
              >
                {log}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

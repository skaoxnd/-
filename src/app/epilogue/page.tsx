"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function EpiloguePage() {
  const [logs, setLogs] = useState<string[]>([]);

  const endingSequence = [
    "[SYSTEM] 기? ?이???본 ?수 ?료.",
    "[SYSTEM] ?건 번호 2023-F-994 ?구 종결.",
    "--------------------------------------------------",
    ">> ?신? ?앞??보이?????자??겁을 먹고 (?기 본능),",
    ">> ?나???이 ?원???어?것이??착각?며 (직선 본능),",
    ">> ?상???면?이??균?일 것이?는 본능??지배당?던",
    ">> 과거 ?사???류?모두 바로?았?니??",
    " ",
    ">> 직????닌 '?이????상??바라보았?",
    ">> 교만??범죄?의 마??거짓말마? ?계??버렸?니??",
    " ",
    ">> ?상???바르게 ?해?는 ??",
    ">> 그것??바로 ?트??스(Factfulness)?니??"
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
              미제?건 ?일 : ?벽??증명
            </h1>
            <p className="text-gray-400 font-mono mt-2">?고?셨?니?? ?로?일?님.</p>
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

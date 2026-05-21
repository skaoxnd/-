"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import BenfordChart from "@/components/BenfordChart";
import { stage5Config } from "@/data/gameConfig";
import { Power, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function Stage5Page() {
  const router = useRouter();
  const [isBenfordOn, setIsBenfordOn] = useState(false);
  const [code, setCode] = useState("");
  const [isError, setIsError] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

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

  const visualization = (
    <div className="w-full h-full p-4 flex flex-col items-center relative">
      <h2 className="text-xl font-mono text-[var(--neon-green)] mb-6 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        {isBenfordOn ? "벤포?의 법칙 (?연 곡선 vs 조작????)" : "?의???? (균등 ?장 ?이??"}
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
          <p className="text-xl text-gray-400 mt-4 font-sans">모든 ?테?? ?이??검??료</p>
          <button 
            onClick={() => router.push("/epilogue")}
            className="mt-8 px-6 py-2 border border-[var(--neon-green)] text-[var(--neon-green)] font-mono hover:bg-[var(--neon-green)] hover:text-black transition-colors"
          >
            보고???인
          </button>
        </motion.div>
      )}
    </div>
  );

  const controls = (
    <div className="flex flex-col h-full justify-center gap-6 px-8">
      <div className="flex items-center justify-between bg-black/40 p-6 rounded border border-gray-800">
        <div>
          <h4 className="text-lg font-mono text-gray-200">벤포???연 ?률 모델</h4>
          <p className="text-sm text-gray-500 mt-1">?색 막?? 붉? 곡선??비교?십?오.</p>
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
            <AlertTriangle size={16} /> ?차가 가????3개의 ?자(1~9)??력?라
          </label>
          <p className="text-xs text-gray-500 mb-2">?제 ??(막?)? ?학??진실(곡선)??간격?????서???호??력???드?스?? 강제 ?독?십?오.</p>
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
              ?독
            </button>
          </div>
          {isError && <p className="text-[var(--crimson-red)] font-mono text-sm animate-pulse">?근 거?: 비?번호가 ?치?? ?습?다.</p>}
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

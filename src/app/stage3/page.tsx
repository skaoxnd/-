"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import CustomBarChart from "@/components/CustomBarChart";
import { stage3Config } from "@/data/gameConfig";
import { ArrowRight, Search, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Stage3Page() {
  const router = useRouter();
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showError, setShowError] = useState(false);

  let narrativeText = stage3Config.narrative.intro;
  if (isResolved) {
    narrativeText = stage3Config.narrative.success;
  }

  // Format data for chart
  // Data looks like: [{ name: "Feature", threat: 85, suspect: 20 }]
  const getChartData = () => {
    if (selectedSuspect === null) return [];
    const threatData = stage3Config.data.suspects[0].values;
    const suspectData = stage3Config.data.suspects[selectedSuspect].values;
    
    return stage3Config.data.features.map((feature, idx) => ({
      name: feature,
      "협박메일": threatData[idx],
      [stage3Config.data.suspects[selectedSuspect].name]: suspectData[idx]
    }));
  };

  const handleVerify = () => {
    if (selectedSuspect === 3) { // Suspect C is index 3
      setIsResolved(true);
      setShowError(false);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const visualization = (
    <div className="w-full h-full p-4 flex flex-col items-center">
      <h2 className="text-xl font-mono text-[var(--neon-green)] mb-6 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        {selectedSuspect ? `계량문체학 분석: 협박 메일 vs ${stage3Config.data.suspects[selectedSuspect].name}` : "문체 상관관계 대조표"}
      </h2>
      <div className="w-full flex-1 min-h-[300px]">
        {selectedSuspect !== null ? (
          <CustomBarChart 
            data={getChartData()} 
            xAxisKey="name" 
            keys={[
              { key: "협박메일", color: "var(--crimson-red)" },
              { key: stage3Config.data.suspects[selectedSuspect].name, color: "var(--neon-green)" }
            ]} 
            stacked={false}
            unit="%"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 font-mono border border-dashed border-gray-700 rounded-lg">
            대조할 용의자를 선택하십시오.
          </div>
        )}
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-col h-full justify-center gap-6 px-8">
      <div className="flex flex-col bg-black/40 p-6 rounded border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-[var(--neon-green)]" />
          <h4 className="text-lg font-mono text-gray-200">용의자 문체 분석</h4>
        </div>
        <p className="text-sm text-gray-500 mb-4">어떤 용의자의 문체가 협박 메일과 가장 일치하는지 분석하십시오.</p>
        
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(idx => (
            <button 
              key={idx}
              onClick={() => setSelectedSuspect(idx)} 
              className={`p-3 font-mono border transition-all text-left flex justify-between items-center ${selectedSuspect === idx ? 'border-[var(--neon-green)] text-[var(--neon-green)] shadow-[0_0_10px_var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
            >
              <span>{stage3Config.data.suspects[idx].name} 메일 확인</span>
              <Search size={18} />
            </button>
          ))}
        </div>
      </div>

      {selectedSuspect !== null && !isResolved && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col bg-black/40 p-6 rounded border border-[var(--neon-green)]">
          <h4 className="text-lg font-mono text-[var(--neon-green)] mb-4">상관관계 분석 완료</h4>
          <button 
            onClick={handleVerify} 
            className="w-full py-3 bg-[var(--neon-green)] text-black hover:bg-cyan-600 font-mono font-bold transition-colors"
          >
            진범 특정
          </button>
          {showError && <p className="text-[var(--crimson-red)] text-sm font-mono mt-3 animate-pulse">불일치. 통계적으로 상관관계가 너무 낮습니다.</p>}
        </motion.div>
      )}

      {isResolved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end mt-4">
          <button 
            onClick={() => router.push("/stage4")}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--neon-green)] text-black font-bold font-mono hover:shadow-[0_0_15px_var(--neon-green)] transition-all"
          >
            다음 추리 단계로 <ArrowRight size={20} />
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

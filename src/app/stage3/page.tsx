"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import CustomBarChart from "@/components/CustomBarChart";
import { stage3Config } from "@/data/gameConfig";
import { ArrowRight, Search, FileText, Lock } from "lucide-react";
import { useGameProgress } from "@/components/GameProgressProvider";
import { motion } from "framer-motion";

export default function Stage3Page() {
  const router = useRouter();
  const { unlockStage } = useGameProgress();
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isIntroRead, setIsIntroRead] = useState(false);
  const [isSuccessRead, setIsSuccessRead] = useState(false);

  let narrativeText = stage3Config.narrative.intro;
  if (isResolved) {
    narrativeText = stage3Config.narrative.success;
  } else if (selectedSuspect !== null) {
    // If suspect selected, show analysis info
    if (selectedSuspect === 3) {
      narrativeText = "계량문체학 분석 결과, 용의자 C의 이메일 문체 특징(명사/대명사 비율, 문장당 단어 수, 문맥 특징 등)이 협박 메일의 핵심 분포 패턴과 완벽하게 일치합니다.\n\n이는 단순 우연으로 볼 수 없으며, 용의자 C가 동일 인물(협박 메일의 작성자)이라는 강력한 통계적 증거입니다.\n\n자, 이제 우측의 분석 패널에서 최종 진범 특정을 완료하십시오.";
    } else {
      narrativeText = `>> [계량문체학 분석 대조: ${stage3Config.data.suspects[selectedSuspect].name}]\n\n협박 메일과 해당 용의자의 문체 상관관계를 계량 분석한 결과, 통계적 불일치가 감지되었습니다.\n두 텍스트의 어휘 사용 밀도와 통사적 습관이 다릅니다.\n이 용의자는 메일 작성자가 아닙니다. 다른 용의자를 분석하십시오.`;
    }
  }

  // Format data for chart
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

  const controls = !isIntroRead ? (
    <div className="flex flex-col h-full justify-center items-center p-6 text-center font-mono">
      <p className="text-gray-500 text-sm">대화 분석 완료 시 제어 인터페이스 활성화</p>
    </div>
  ) : (
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
              unlockStage(4);
              router.push("/stage4");
            }}
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
      onNarrativeComplete={handleNarrativeComplete}
    />
  );
}

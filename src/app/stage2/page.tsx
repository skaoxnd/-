"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import TimeScatterChart from "@/components/TimeScatterChart";
import { stage2Config } from "@/data/gameConfig";
import { ArrowRight, Activity, Calculator } from "lucide-react";
import { motion } from "framer-motion";

type AnalysisMode = 'None' | 'Average' | 'Median' | 'Skewness' | 'Variance';

export default function Stage2Page() {
  const router = useRouter();
  const [mode, setMode] = useState<AnalysisMode>('None');
  const [isResolved, setIsResolved] = useState(false);

  // Generate deterministic pseudo-random data for graph
  const humanData = useMemo(() => Array.from({length: 100}, (_, i) => ({ x: i, y: 0.4 + Math.random() * 0.8 })), []);
  const macroData = useMemo(() => Array.from({length: 100}, (_, i) => ({ x: i, y: 0.25 + (Math.random() * 0.001) })), []);

  let narrativeText = stage2Config.narrative.intro;
  if (mode === 'Variance') {
    narrativeText = stage2Config.narrative.success;
  } else if (mode === 'Average') {
    narrativeText = `>> [분석: 산술 평균]\n\n총 40,000번의 클릭을 10시간으로 나눈 평균 클릭 속도는 초당 1.11회입니다.\n이는 일반적인 게이머의 정상적인 클릭 속도 범위 안에 있습니다.\n평균값만으로는 기계적인 매크로의 증거를 찾을 수 없습니다.\n용의자의 알리바이는 여전히 유효합니다.`;
  } else if (mode === 'Median') {
    narrativeText = `>> [분석: 중앙값]\n\n모든 클릭 간격을 크기순으로 나열했을 때 위치하는 중앙값은 0.85초입니다.\n순간적인 게임의 몰입도를 고려할 때 이는 지극히 정상적인 수치입니다.\n이상치(Outlier)가 결괏값을 왜곡하지 않았음을 증명할 뿐 조작의 증거가 되지는 못합니다.\n용의자는 당신의 수사를 비웃고 있습니다.`;
  } else if (mode === 'Skewness') {
    narrativeText = `>> [분석: 왜도(Skewness)]\n\n데이터의 비대칭성을 나타내는 왜도를 분석한 결과, 0.02로 정규분포(0)에 매우 가까운 형태를 보입니다.\n이는 특정 시간에만 클릭 빈도가 집중되지 않았음을 의미합니다.\n용의자는 \"나는 10시간 동안 기복 없이 꾸준히 게임을 했다\"고 주장하고 있습니다.\n완전히 다른 기만 양상입니다.\n다른 방식으로 분산 자체를 확인해야 합니다.`;
  }

  const handleVerify = () => {
    setIsResolved(true);
  };

  const visualization = (
    <div className="w-full h-full p-4 flex flex-col items-center">
      <h2 className="text-xl font-mono text-[var(--neon-green)] mb-6 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        {mode === 'Variance' ? "클릭 간격 표준편차 (매크로 패턴)" : "클릭 간격 통계량 그래프 (정상 범위)"}
      </h2>
      <div className="w-full flex-1 min-h-[300px]">
        <TimeScatterChart data={mode === 'Variance' ? macroData : humanData} isMacro={mode === 'Variance'} />
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-col h-full justify-center gap-6 px-8">
      <div className="flex flex-col bg-black/40 p-6 rounded border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="text-[var(--neon-green)]" />
          <h4 className="text-lg font-mono text-gray-200">통계 분석 기법 선택</h4>
        </div>
        <p className="text-sm text-gray-500 mb-4">어떤 통계량을 추출해야 인간의 한계점과 기계의 특성이 드러날지 선택하십시오.</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setMode('Average')} className={`p-3 font-mono border transition-all ${mode === 'Average' ? 'border-[var(--neon-green)] text-[var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>산술 평균 (Mean)</button>
          <button onClick={() => setMode('Median')} className={`p-3 font-mono border transition-all ${mode === 'Median' ? 'border-[var(--neon-green)] text-[var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>중앙?(Median)</button>
          <button onClick={() => setMode('Skewness')} className={`p-3 font-mono border transition-all ${mode === 'Skewness' ? 'border-[var(--neon-green)] text-[var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>왜도 (Skewness)</button>
          <button onClick={() => setMode('Variance')} className={`p-3 font-mono border transition-all ${mode === 'Variance' ? 'border-[var(--crimson-red)] text-[var(--crimson-red)] shadow-[0_0_10px_var(--crimson-red)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>표준편차 (분산)</button>
        </div>
      </div>

      {mode === 'Variance' && !isResolved && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col bg-black/40 p-6 rounded border border-[var(--crimson-red)]">
          <h4 className="text-lg font-mono text-[var(--crimson-red)] mb-4 flex items-center gap-2"><Activity size={20}/>비정상적 분산 감지</h4>
          <p className="text-gray-300 font-mono mb-4 text-sm leading-relaxed">
            클릭 간격의 표준편차가 {stage2Config.data.macroStdDevThreshold} 이하로 검출되었습니다.<br/>
            이는 숨을 쉬는 인간에게는 나올 수 없는 기계적인 패턴입니다.
          </p>
          <button 
            onClick={handleVerify} 
            className="w-full py-3 bg-[var(--crimson-red)] text-white hover:bg-red-700 font-mono font-bold transition-colors"
          >
            매크로 적발 및 알리바이 파기
          </button>
        </motion.div>
      )}

      {isResolved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end mt-4">
          <button 
            onClick={() => router.push("/stage3")}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--neon-green)] text-black font-bold font-mono hover:shadow-[0_0_15px_var(--neon-green)] transition-all animate-pulse"
          >
            다음 사건 발생 확인 <ArrowRight size={20} />
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

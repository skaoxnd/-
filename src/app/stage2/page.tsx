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
    narrativeText = `>> [분석: ?술 ?균]\n\n?40,000??릭??10?간?로 ?눈 ?균 ?릭 ?도????1.11??초입?다.\n?는 ?반?인 게이머의 ?상?인 ?릭 ?도 범위 ?에 ?습?다.\n?균값만?로??기계??매크로의 증거?찾을 ???습?다.\n?의?의 ?리바이???전???효?니??`;
  } else if (mode === 'Median') {
    narrativeText = `>> [분석: 중앙?\n\n모든 ?릭 간격???기?으??열?을 ?????데 ?치??중앙값? 0.85초입?다.\n?간??게임??몰입?을 ?????????는 지극히 ?상?인 ?치?니??\n?상?Outlier)가 결괏값을 ?곡?? ?았?을 증명??? 조작??증거???? 못합?다.\n?의?? ?신???사?비웃??습?다.`;
  } else if (mode === 'Skewness') {
    narrativeText = `>> [분석: ?도(Skewness)]\n\n?이?의 비???????는 ?도?분석??결과, 0.02??규분포(0)??매우 가까운 ???태?보입?다.\n?는 ?정 ?간????릭 빈도가 ?중?? ?았?을 ???니??\n?의?는 "?? 10?간 ?안 기복 ?이 꾸???게임???다?????니????히???기?양?니??\n?른 방식?로 분산 ?체??인?야 ?니??`;
  }

  const handleVerify = () => {
    setIsResolved(true);
  };

  const visualization = (
    <div className="w-full h-full p-4 flex flex-col items-center">
      <h2 className="text-xl font-mono text-[var(--neon-green)] mb-6 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        {mode === 'Variance' ? "?릭 간격 ???차 (매크???턴)" : "?릭 간격 ?계??그래??(?상 범위)"}
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
          <h4 className="text-lg font-mono text-gray-200">?계 분석 기법 ?택</h4>
        </div>
        <p className="text-sm text-gray-500 mb-4">?떤 ?계?을 추출?야 ?간???계??? 기계???성???러?? ?택?십?오.</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setMode('Average')} className={`p-3 font-mono border transition-all ${mode === 'Average' ? 'border-[var(--neon-green)] text-[var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>?술 ?균 (Mean)</button>
          <button onClick={() => setMode('Median')} className={`p-3 font-mono border transition-all ${mode === 'Median' ? 'border-[var(--neon-green)] text-[var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>중앙?(Median)</button>
          <button onClick={() => setMode('Skewness')} className={`p-3 font-mono border transition-all ${mode === 'Skewness' ? 'border-[var(--neon-green)] text-[var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>?도 (Skewness)</button>
          <button onClick={() => setMode('Variance')} className={`p-3 font-mono border transition-all ${mode === 'Variance' ? 'border-[var(--crimson-red)] text-[var(--crimson-red)] shadow-[0_0_10px_var(--crimson-red)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>???차 (분산)</button>
        </div>
      </div>

      {mode === 'Variance' && !isResolved && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col bg-black/40 p-6 rounded border border-[var(--crimson-red)]">
          <h4 className="text-lg font-mono text-[var(--crimson-red)] mb-4 flex items-center gap-2"><Activity size={20}/>비정?적 분산 감?</h4>
          <p className="text-gray-300 font-mono mb-4 text-sm leading-relaxed">
            ?릭 간격?????차가 {stage2Config.data.macroStdDevThreshold} ?하?검출되?습?다.<br/>
            ?는 ???는 ?간?게?는 ?올 ???는 기계?인 ???입?다.
          </p>
          <button 
            onClick={handleVerify} 
            className="w-full py-3 bg-[var(--crimson-red)] text-white hover:bg-red-700 font-mono font-bold transition-colors"
          >
            매크??발 ??리바이 ?기
          </button>
        </motion.div>
      )}

      {isResolved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end mt-4">
          <button 
            onClick={() => router.push("/stage3")}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--neon-green)] text-black font-bold font-mono hover:shadow-[0_0_15px_var(--neon-green)] transition-all animate-pulse"
          >
            ?음 ?건 발생 ?인 <ArrowRight size={20} />
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

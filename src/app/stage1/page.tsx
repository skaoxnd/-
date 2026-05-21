"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import CustomBarChart from "@/components/CustomBarChart";
import { stage1Config } from "@/data/gameConfig";
import { ArrowRight, Filter } from "lucide-react";
import { motion } from "framer-motion";

type VariableType = 'None' | 'Age' | 'Time' | 'Type';

export default function Stage1Page() {
  const router = useRouter();
  const [selectedVar, setSelectedVar] = useState<VariableType>('None');
  const [isResolved, setIsResolved] = useState(false);
  const [showError, setShowError] = useState(false);

  let narrativeText = stage1Config.narrative.intro;

  if (selectedVar === 'Type') {
    narrativeText = stage1Config.narrative.success;
  } else if (selectedVar !== 'None') {
    narrativeText = `>> 변수 통제 분석: ${selectedVar === 'Age' ? '연령' : '시간'} 분석...\n\n분석 결과, 두 구역 모두 유의미한 미검거율 차이나 역전 현상(심슨의 역설)이 발견되지 않았습니다.\n이 변수는 사건의 진실을 가리고 있는 핵심 변수가 아닙니다.\n다른 변수를 선택하여 데이터를 다시 분할하십시오.`;
  }

  const handleSelectArea = (area: string) => {
    if (selectedVar === 'Type' && area === 'A구역') {
      setIsResolved(true);
      setShowError(false);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const getChartProps = () => {
    switch (selectedVar) {
      case 'Type':
        return {
          data: stage1Config.data.byType,
          keys: [
            { key: "일반범죄", color: "#6b7280" },
            { key: "지능범죄", color: "var(--crimson-red)" }
          ],
          stacked: true,
          unit: "건"
        };
      case 'Age':
        return {
          data: stage1Config.data.byAge,
          keys: [
            { key: "청소년", color: "#6b7280" },
            { key: "성인", color: "#4b5563" }
          ],
          stacked: true,
          unit: "건"
        };
      case 'Time':
        return {
          data: stage1Config.data.byTime,
          keys: [
            { key: "주간", color: "#6b7280" },
            { key: "야간", color: "#4b5563" }
          ],
          stacked: true,
          unit: "건"
        };
      default:
        return {
          data: stage1Config.data.overall,
          keys: [{ key: "rate", color: "var(--crimson-red)", name: "미?거율" }],
          stacked: false,
          unit: "%"
        };
    }
  };

  const chartProps = getChartProps();

  const visualization = (
    <div className="w-full h-full p-4 flex flex-col items-center">
      <h2 className="text-xl font-mono text-[var(--neon-green)] mb-6 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        {selectedVar === 'Type' 
          ? "범죄 유형별 미검거 건수 (심슨의 역설)" 
          : selectedVar !== 'None' 
          ? "단순 분할 데이터 (의미 없음)" 
          : "지역별 전체 미검거율"}
      </h2>
      <div className="w-full flex-1 min-h-[300px]">
        <CustomBarChart 
          data={chartProps.data} 
          xAxisKey="name" 
          keys={chartProps.keys} 
          stacked={chartProps.stacked}
          unit={chartProps.unit}
        />
      </div>
    </div>
  );

  const controls = (
    <div className="flex flex-col h-full justify-center gap-6 px-8">
      <div className="flex flex-col bg-black/40 p-6 rounded border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="text-[var(--neon-green)]" />
          <h4 className="text-lg font-mono text-gray-200">분석 변인(Variable) 선택</h4>
        </div>
        <p className="text-sm text-gray-500 mb-4">어떤 변인을 기준으로 데이터를 분할해야 진실이 드러날지 선택하십시오.</p>
        
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setSelectedVar('Age')} className={`p-3 font-mono border transition-all ${selectedVar === 'Age' ? 'border-[var(--neon-green)] text-[var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>연령별</button>
          <button onClick={() => setSelectedVar('Time')} className={`p-3 font-mono border transition-all ${selectedVar === 'Time' ? 'border-[var(--neon-green)] text-[var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>시간대별</button>
          <button onClick={() => setSelectedVar('Type')} className={`p-3 font-mono border transition-all ${selectedVar === 'Type' ? 'border-[var(--neon-green)] text-[var(--neon-green)] shadow-[0_0_10px_var(--neon-green)]' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>범죄 유형별</button>
        </div>
      </div>

      {selectedVar === 'Type' && !isResolved && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col bg-black/40 p-6 rounded border border-[var(--crimson-red)]">
          <h4 className="text-lg font-mono text-[var(--crimson-red)] mb-4">최종 판단: 진범의 실제 은신처는?</h4>
          <div className="flex gap-4">
            <button onClick={() => handleSelectArea('C구역')} className="flex-1 py-3 bg-gray-800 text-white hover:bg-gray-700 font-mono">C구역 (빈?가)</button>
            <button onClick={() => handleSelectArea('A구역')} className="flex-1 py-3 bg-[var(--crimson-red)] text-white hover:bg-red-700 font-mono font-bold">A구역 (오피스 타운)</button>
          </div>
          {showError && <p className="text-[var(--crimson-red)] text-sm font-mono mt-3 animate-pulse">오답입니다. 차트를 다시 분석하십시오.</p>}
        </motion.div>
      )}

      {isResolved && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end">
          <button 
            onClick={() => router.push("/stage2")}
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

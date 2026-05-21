"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import CustomBarChart from "@/components/CustomBarChart";
import { stage1Config } from "@/data/gameConfig";
import { useGameProgress } from "@/components/GameProgressProvider";
import { ArrowRight, Filter, Lock, Database, Play, CheckCircle2, AlertTriangle, Sparkles, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type VariableType = 'None' | 'Age' | 'Time' | 'Type';

export default function Stage1Page() {
  const router = useRouter();
  const { unlockStage } = useGameProgress();
  
  // STATES
  const [selectedVar, setSelectedVar] = useState<VariableType>('None');
  const [isResolved, setIsResolved] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);
  const [isIntroRead, setIsIntroRead] = useState(false);
  const [isSuccessRead, setIsSuccessRead] = useState(false);
  
  // CLUE AND ANALYSIS FLOW
  const [hasClue, setHasClue] = useState(false);
  const [showClueModal, setShowClueModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isDataAnalyzed, setIsDataAnalyzed] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [selectedAreaTarget, setSelectedAreaTarget] = useState<string | null>(null);

  // BYPASS ANIMATION STATE
  const [isHacking, setIsHacking] = useState(false);
  const [hackingLog, setHackingLog] = useState<string[]>([]);

  let narrativeText = stage1Config.narrative.intro;

  if (isResolved) {
    narrativeText = stage1Config.narrative.success;
  } else if (isDataAnalyzed) {
    if (selectedVar === 'Type') {
      narrativeText = "분석 결과: 사건 유형 통제 적용 결과, 데이터 분포의 심슨의 역설 왜곡이 파악되었다.\n\n개별 유형 분석 시 A구역의 미검거율이 일반 범죄(28% vs 27%), 지능형 범죄(8% vs 7%) 모두 C구역을 능가한다. 그러나 총합 데이터에서는 C구역의 단순 수치가 더 높아 보이는데, 이는 통계적 착시 현상이다.\n\n해킹 거점이 위치한 실제 구역을 최종 검증하고 허가 코드를 발급하라.";
    } else if (selectedVar !== 'None') {
      narrativeText = `경보: ${selectedVar === 'Age' ? '연령대별' : '시간대별'} 교차 분석 실행.\n\n분석 결과 해당 변인은 전체 미검거율 역전 현상(심슨의 역설)에 영향을 주는 독립 변수로 식별되지 않았다. 데이터 통제 효율성이 0에 가깝다.\n\n수사의 핵심 가림막 역할을 수행하는 실제 교란 변인을 찾아내 분석을 다시 시도하라.`;
    } else {
      narrativeText = "데이터 분석 완료: 원시 데이터 통합 뷰어 가동.\n\n수사본부의 수색 기조인 C구역(전체 25%) 및 A구역(전체 10%)의 통계치가 시각화되었다.\n\n데이터 통제가 배제된 전체 수치를 대조하고 가려진 하부 변인을 통제하여 실제 은거지가 위치한 구역을 도출해야 한다.";
    }
  }

  const handleNarrativeComplete = () => {
    if (!isResolved) {
      setIsIntroRead(true);
      setHasClue(true);
      setShowClueModal(true);
    } else {
      setIsSuccessRead(true);
    }
  };

  // EXECUTE DATA ANALYSIS PROCESS (1.8s)
  const runDataAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLogs([]);
    
    const logs = [
      "SYS_STAT: 원시 데이터 팩 로드 중... [SYS_STAT_RAW.DAT]",
      "DECOMPRESS: 데이터셋 아키텍처 해독 및 분할 진행...",
      "CORRELATION: 지역별 범죄 인덱스 가중치 계산...",
      "READY: 변인 교차 대조 매트릭스 준비 완료."
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        const next = prev + 10;
        if (next % 25 === 0 && currentLogIdx < logs.length) {
          setAnalysisLogs(l => [...l, logs[currentLogIdx]]);
          currentLogIdx++;
        }
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setIsDataAnalyzed(true);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 150);
  };

  const handleVerifyArea = () => {
    if (!selectedAreaTarget) return;

    if (selectedAreaTarget === 'C구역') {
      if (selectedVar === 'None') {
        setShowError("통계 분석 결함: 단순 합산 미검거율(25%)만 보고 C구역을 지목하는 것은 크기 편향성에 사로잡힌 심각한 추리적 맹점입니다. 변인을 세부 통제하여 개별 통계를 점검하십시오.");
      } else if (selectedVar === 'Age' || selectedVar === 'Time') {
        setShowError("통계 분석 결함: 연령별 혹은 시간대별 통제 결과, C구역에 어떠한 유의미한 미검거율 상승 지표도 식별되지 않았습니다. 여전히 단순 통계 편향성에 지배되고 있습니다.");
      } else if (selectedVar === 'Type') {
        setShowError("분석 모델 충돌: 개별 범죄 유형(일반/지능형) 모두에서 A구역의 미검거율이 실제로 더 높게 산출됩니다. 전체 합산 통계의 교차 왜곡에 근거한 C구역 지목은 명백한 분석 오류입니다.");
      }
      setTimeout(() => setShowError(null), 5000);
    } else if (selectedAreaTarget === 'A구역') {
      if (selectedVar !== 'Type') {
        setShowError("입증 부족: A구역 지목에 대한 합리적인 통계적 증거가 규명되지 않았습니다. 어떤 변인이 두 구역의 실제 위험률을 왜곡하고 있는지(심슨의 역설) 통계적으로 증명하기 전에는 수색 허가를 발령할 수 없습니다.");
        setTimeout(() => setShowError(null), 5000);
      } else {
        // CORRECT PATH
        setIsHacking(true);
        setHackingLog([]);
        const logs = [
          "SYS_ACCESS: 지역 보안망 방화벽 해제 시도...",
          "DATA_CORRELATION: 심슨의 역설 왜곡 지수 보정 완료...",
          "STAT_ANALYSIS: A구역(오피스 타운) 지능형 범죄 미검거 우선순위 확인...",
          "N.P.A_NET: 현장 수색대 GPS 비콘을 A구역으로 강제 고정...",
          "SUCCESS: A구역 전술 수색 승인 코드 발급 완료."
        ];
        
        let i = 0;
        const hackInterval = setInterval(() => {
          if (i < logs.length) {
            setHackingLog(prev => [...prev, logs[i]]);
            i++;
          } else {
            clearInterval(hackInterval);
            setTimeout(() => {
              setIsHacking(false);
              setIsResolved(true);
              setShowError(null);
            }, 600);
          }
        }, 350);
      }
    }
  };

  const getChartProps = () => {
    switch (selectedVar) {
      case 'Type':
        return {
          data: stage1Config.data.byType,
          keys: [
            { key: "일반범죄", color: "#4f46e5" },
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
            { key: "성인", color: "#374151" }
          ],
          stacked: true,
          unit: "건"
        };
      case 'Time':
        return {
          data: stage1Config.data.byTime,
          keys: [
            { key: "주간", color: "#d97706" },
            { key: "야간", color: "#1e3a8a" }
          ],
          stacked: true,
          unit: "건"
        };
      default:
        return {
          data: stage1Config.data.overall,
          keys: [{ key: "rate", color: "var(--crimson-red)", name: "종합 미검거율" }],
          stacked: false,
          unit: "%"
        };
    }
  };

  const chartProps = getChartProps();

  // LEFT SIDE CONTROLS
  const controls = !isDataAnalyzed ? (
    <div className="flex flex-col h-full justify-center items-center p-6 text-center font-mono">
      <p className="text-gray-500 text-xs">수사 사건 로그 분석 및 파일 마운트 대기 중</p>
    </div>
  ) : (
    <div className="flex flex-col h-full justify-center gap-4 px-6">
      {/* Variable Selection */}
      <div className="flex flex-col bg-black/40 p-4 rounded border border-gray-850">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="text-[var(--neon-green)]" size={16} />
          <h4 className="text-sm font-mono text-gray-200">분석 대조 통제 변인 선택</h4>
        </div>
        <p className="text-[11px] text-gray-500 mb-3">통계 교차 편향을 교정하기 위해 대조할 분할 데이터를 선택하십시오.</p>
        
        <div className="grid grid-cols-3 gap-2">
          <button 
            disabled={isResolved}
            onClick={() => setSelectedVar('Age')} 
            className={`py-2 px-1 font-mono text-[10px] border transition-all ${selectedVar === 'Age' ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-black' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
          >
            연령별
          </button>
          <button 
            disabled={isResolved}
            onClick={() => setSelectedVar('Time')} 
            className={`py-2 px-1 font-mono text-[10px] border transition-all ${selectedVar === 'Time' ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-black' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
          >
            시간대별
          </button>
          <button 
            disabled={isResolved}
            onClick={() => setSelectedVar('Type')} 
            className={`py-2 px-1 font-mono text-[10px] border transition-all ${selectedVar === 'Type' ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-black shadow-[0_0_8px_rgba(57,255,20,0.2)]' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
          >
            범죄 유형별
          </button>
        </div>
      </div>

      {/* Target Sector Selection (ALWAYS VISIBLE NOW) */}
      {!isResolved && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col bg-black/40 p-4 rounded border border-gray-850"
        >
          <h4 className="text-xs font-mono text-gray-300 mb-2 font-bold">수색 영장 신청 대상 구역 특정</h4>
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setSelectedAreaTarget('C구역')} 
              className={`flex-1 py-2 text-xs font-mono border transition-all ${selectedAreaTarget === 'C구역' ? 'bg-red-950/20 border-red-500 text-red-500 font-bold' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
            >
              C구역 (빈민가)
            </button>
            <button 
              onClick={() => setSelectedAreaTarget('A구역')} 
              className={`flex-1 py-2 text-xs font-mono border transition-all ${selectedAreaTarget === 'A구역' ? 'bg-green-950/20 border-[var(--neon-green)] text-[var(--neon-green)] font-bold' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}
            >
              A구역 (오피스 타운)
            </button>
          </div>
          
          {selectedAreaTarget && (
            <button 
              onClick={handleVerifyArea}
              className="w-full py-2.5 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white font-mono text-xs font-bold transition-all"
            >
              지정 구역 수색 허가 발급 명령 전송
            </button>
          )}

          {showError && (
            <p className="text-[var(--crimson-red)] text-[10px] font-mono mt-2 leading-relaxed animate-pulse">
              {showError}
            </p>
          )}
        </motion.div>
      )}

      {isResolved && !isSuccessRead && (
        <div className="flex flex-col items-end">
          <p className="text-xs text-gray-500 font-mono animate-pulse">
            허가 프로토콜 로드 완료. 대화 완료 대기 중...
          </p>
        </div>
      )}

      {isResolved && isSuccessRead && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end">
          <button 
            onClick={() => {
              unlockStage(2);
              router.push("/stage2");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--neon-green)] text-black font-bold font-mono text-xs hover:shadow-[0_0_10px_var(--neon-green)] transition-all"
          >
            제2장 분석 프로세스로 진입 <ArrowRight size={14} />
          </button>
        </motion.div>
      )}
    </div>
  );

  // RIGHT SIDE VISUALIZATION
  const securityLock = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono text-center">
      <Lock className="text-gray-600 mb-4 animate-pulse" size={32} />
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
        데이터 수집 대기 중 (LOCK)
      </h3>
      <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
        사건 보고 대화를 진행하여 수사 원시 파일(.DAT)을 획득하십시오.
      </p>
    </div>
  );

  const analysisWaiting = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono text-center bg-black/40">
      <div className="border border-[var(--neon-green)]/30 bg-black/60 p-8 rounded-lg shadow-[0_0_30px_rgba(57,255,20,0.1)] w-full max-w-md">
        <Database className="text-[var(--neon-green)] mx-auto mb-6 animate-pulse" size={56} />
        <h3 className="text-lg font-bold text-[var(--neon-green)] uppercase tracking-widest mb-4 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
          단서 파일 로딩 완료
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed mb-8">
          수사 원시 통계 파일(SYS_STAT_RAW.DAT)을 분석 연산 장치에 장착했습니다. 데이터 분할 알고리즘 분석기를 가동하십시오.
        </p>
        <button 
          onClick={runDataAnalysis}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--neon-green)] text-black font-mono font-bold text-sm hover:shadow-[0_0_20px_var(--neon-green)] transition-all rounded"
        >
          <Play size={18} fill="black" /> 분석 프로그램 실행 (SYS_DECRYPT.EXE)
        </button>
      </div>
    </div>
  );

  const analysisProgressView = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono bg-black/60">
      <div className="w-full max-w-md border border-[var(--neon-green)]/50 bg-black p-6 rounded shadow-[0_0_30px_rgba(57,255,20,0.15)]">
        <div className="flex justify-between items-center text-[var(--neon-green)] mb-4 font-bold text-sm">
          <span className="flex items-center gap-2"><Cpu className="animate-spin" size={16}/> RUNNING STATISTICAL ENGINE...</span>
          <span className="text-lg">{analysisProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-900 h-3 rounded overflow-hidden mb-6 border border-gray-800">
          <motion.div 
            style={{ width: `${analysisProgress}%` }}
            className="bg-[var(--neon-green)] h-full shadow-[0_0_15px_var(--neon-green)]"
          />
        </div>

        <div className="space-y-2 text-xs text-gray-400 min-h-[120px] bg-gray-950 p-4 rounded border border-gray-900">
          {analysisLogs.map((log, i) => (
            <div key={i} className="leading-relaxed font-bold tracking-wide">{`>> ${log}`}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const analysisViz = (
    <div className="w-full h-full p-4 flex flex-col items-center">
      <h2 className="text-sm font-mono text-[var(--neon-green)] mb-4 tracking-widest drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]">
        {selectedVar === 'Type' 
          ? "사건 유형별 미검거 통계 대조표 (통제 데이터)" 
          : selectedVar !== 'None' 
          ? "비효율 교사 데이터 (교란 편향 검출 실패)" 
          : "종합 미검거 비율 분포 (단순 데이터)"}
      </h2>
      <div className="w-full flex-1 min-h-[220px]">
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

  const getVisualization = () => {
    if (!isIntroRead) return securityLock;
    if (isAnalyzing) return analysisProgressView;
    if (!isDataAnalyzed) return analysisWaiting;
    return analysisViz;
  };

  return (
    <>
      {/* Clue Acquisition Popup */}
      <AnimatePresence>
        {showClueModal && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full border-2 border-[var(--neon-green)] bg-black p-6 rounded shadow-[0_0_30px_rgba(57,255,20,0.2)] font-mono text-center relative"
            >
              <div className="absolute top-2 right-2 text-[var(--neon-green)] animate-ping">
                <Sparkles size={16} />
              </div>
              <CheckCircle2 className="text-[var(--neon-green)] mx-auto mb-4 animate-bounce" size={48} />
              <h3 className="text-md font-bold text-white mb-2 tracking-wider">포렌식 수사 단서 획득</h3>
              <div className="bg-gray-950 p-4 border border-gray-850 rounded mb-6 text-left">
                <div className="text-xs text-[var(--neon-green)] font-bold mb-1">DATA_FILE_MOUNTED:</div>
                <div className="text-sm text-gray-250 font-bold mb-2">합동수사본부 사건 통계 원본 (SYS_STAT_RAW.DAT)</div>
                <div className="text-[10px] text-gray-500 leading-relaxed">
                  수사부서에서 작성한 과거 일반/지능형 범죄 미검거 현황 통합 기밀 시트. 미검거율 25%의 빈민가 수색의 정당성 검증을 위한 핵심 기초 데이터가 담겨 있습니다.
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowClueModal(false);
                  setHasClue(true);
                }}
                className="w-full py-2.5 bg-[var(--neon-green)] text-black font-bold text-xs hover:shadow-[0_0_12px_var(--neon-green)]"
              >
                단서 마운트 및 분석 콘솔 전송
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bypass Overlay Animation */}
      <AnimatePresence>
        {isHacking && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 font-mono text-xs select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.08)_0%,transparent_70%)] animate-pulse" />
            <div className="max-w-md w-full border border-[var(--neon-green)] bg-black/90 p-6 rounded shadow-[0_0_30px_rgba(57,255,20,0.3)] border-double">
              <div className="flex items-center gap-2 mb-4 text-[var(--neon-green)] font-bold text-sm border-b border-[var(--neon-green)]/30 pb-2">
                <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full animate-ping" />
                <span>SYS_BYPASS_ROUTING IN PROGRESS</span>
              </div>
              <div className="space-y-2 mb-6 min-h-[110px]">
                {hackingLog.map((log, index) => (
                  <div key={index} className="text-[var(--neon-green)] leading-relaxed animate-pulse">
                    {`>> ${log}`}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-950 h-3 rounded overflow-hidden border border-gray-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  className="bg-[var(--neon-green)] h-full shadow-[0_0_15px_var(--neon-green)]"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ShellLayout
        narrativeText={narrativeText}
        visualization={getVisualization()}
        controls={controls}
        onNarrativeComplete={handleNarrativeComplete}
      />
    </>
  );
}

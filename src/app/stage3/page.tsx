"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import { stage3Config } from "@/data/gameConfig";
import { useGameProgress } from "@/components/GameProgressProvider";
import { 
  ArrowRight, Lock, User, Activity, CheckSquare, Square, 
  ShieldAlert, Database, Play, CheckCircle2, Sparkles, Cpu 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Stage3Page() {
  const router = useRouter();
  const { unlockStage } = useGameProgress();
  
  // STATES
  const [selectedSuspects, setSelectedSuspects] = useState<string[]>([]);
  const [activeSuspectTab, setActiveSuspectTab] = useState<string | null>("A");
  const [isResolved, setIsResolved] = useState(false);
  const [isIntroRead, setIsIntroRead] = useState(false);
  const [isSuccessRead, setIsSuccessRead] = useState(false);
  const [showStdDev, setShowStdDev] = useState(false);
  const [showError, setShowError] = useState(false);

  // CLUE AND ANALYSIS FLOW STATES
  const [hasClue, setHasClue] = useState(false);
  const [showClueModal, setShowClueModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isDataAnalyzed, setIsDataAnalyzed] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);

  // BYPASS ANIMATION STATE
  const [isBypassing, setIsBypassing] = useState(false);
  const [bypassLog, setBypassLog] = useState<string[]>([]);

  const suspects = stage3Config.data.suspects;

  let narrativeText = isResolved ? stage3Config.narrative.success : stage3Config.narrative.intro;

  const handleToggleSuspect = (id: string) => {
    if (selectedSuspects.includes(id)) {
      setSelectedSuspects(prev => prev.filter(item => item !== id));
    } else {
      setSelectedSuspects(prev => [...prev, id]);
    }
  };

  const handleVerify = () => {
    // Correct suspects are C and D (they used macros)
    const isCorrect = 
      selectedSuspects.length === 2 && 
      selectedSuspects.includes("C") && 
      selectedSuspects.includes("D");

    if (isCorrect) {
      setIsBypassing(true);
      setBypassLog([]);
      setShowError(false);

      const logs = [
        "SYS_ANALYSIS: 클릭 시간간격 표준편차 대조 시작...",
        "LOG: 용의자 C 표준편차 0.001 - 기계식 조작 식별 [매크로]",
        "LOG: 용의자 D 표준편차 0.002 - 기계식 조작 식별 [매크로]",
        "LOG: 용의자 A & B 통계값 분산 확인 - 인간 고유 불규칙성 감지 [정상]",
        "SYS_BYPASS: A, B 알리바이 승인 및 수사 제외 완료.",
        "SUCCESS: 진범 후보 C, D로 압축 및 서버 잠금 해제."
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i < logs.length) {
          setBypassLog(prev => [...prev, logs[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsBypassing(false);
            setIsResolved(true);
          }, 600);
        }
      }, 350);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    }
  };

  const handleNarrativeComplete = () => {
    if (!isResolved) {
      setIsIntroRead(true);
      setHasClue(true);
      setShowClueModal(true);
    } else {
      setIsSuccessRead(true);
    }
  };

  const runDataAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLogs([]);
    
    const logs = [
      "SYS_STAT: 마우스 클릭 타임스탬프 로그 데이터 마운트 중...",
      "DECOMPRESS: 밀리초 단위 정밀 간격 데이터셋 로딩...",
      "CORRELATION: 시계열 편차 및 분산값 연산 모듈 초기화...",
      "SUCCESS: 4개 세션 데이터 무결성 검증 및 로딩 완료."
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

  const securityLock = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono text-center border border-dashed border-red-500/30 rounded-lg bg-red-950/5">
      <Lock className="text-[var(--crimson-red)] animate-pulse mb-4" size={32} />
      <h3 className="text-sm font-bold text-[var(--crimson-red)] uppercase tracking-wider mb-2">
        보안 제어 잠금 (SYS_LOCK)
      </h3>
      <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
        사건 데이터 분석 및 제어 장치가 비활성화되어 있습니다.
        먼저 좌측의 시스템 대화 로그(NARRATIVE_LOG)를 끝까지 읽어 수사 요건을 활성화하십시오.
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
          피의자 4인의 마우스 활동 로그 파일팩(MOUSE_ACTIVITY_DIARY.DAT)을 분석 연산 장치에 장착했습니다. 시간 간격 표준편차 복호화 분석기를 가동하십시오.
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
          <span className="flex items-center gap-2"><Cpu className="animate-spin" size={16}/> RUNNING TIME-SERIES DECRYPTION...</span>
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

  const chartData = suspects.map(s => ({
    name: s.name.split(" ")[0] + " " + s.name.split(" ")[1],
    total: s.totalClicks,
    stdDev: s.stdDev,
    variance: s.variance,
    isMacro: s.isMacro
  }));

  const activeSuspect = suspects.find(s => s.id === activeSuspectTab);

  const analysisViz = (
    <div className="w-full h-full p-4 flex flex-col overflow-y-auto custom-scrollbar">
      <h2 className="text-lg font-mono text-[var(--neon-green)] mb-4 text-center tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        용의자 4인 마우스 알리바이 정밀 통계
      </h2>
      
      {/* Tab select between Chart and Table */}
      <div className="flex gap-2 mb-4 justify-center">
        <button 
          onClick={() => setShowStdDev(false)}
          className={`px-4 py-2 border font-mono text-xs transition-all ${!showStdDev ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-black shadow-[0_0_5px_var(--neon-green)]' : 'border-gray-850 text-gray-500 hover:border-gray-700'}`}
        >
          마우스 총합 차트 (단순 누적)
        </button>
        <button 
          onClick={() => setShowStdDev(true)}
          className={`px-4 py-2 border font-mono text-xs transition-all ${showStdDev ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-black shadow-[0_0_5px_var(--neon-green)]' : 'border-gray-850 text-gray-500 hover:border-gray-700'}`}
        >
          표준편차 & 분산 테이블 (정밀 통계)
        </button>
      </div>

      {!showStdDev ? (
        <div className="w-full h-[240px] mb-4 bg-black/30 p-2 border border-gray-900 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#666" tick={{fill: '#888', fontSize: 10, fontFamily: 'monospace'}} />
              <YAxis stroke="#666" tick={{fill: '#888', fontSize: 10, fontFamily: 'monospace'}} />
              <Tooltip cursor={{fill: '#222'}} contentStyle={{backgroundColor: '#000', borderColor: '#333', fontFamily: 'monospace', fontSize: 11}} />
              <Bar dataKey="total" fill="#4f46e5" name="하루 클릭수 합계" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full mb-4 bg-black/40 border border-gray-850 rounded p-2 overflow-x-auto">
          <table className="w-full font-mono text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="p-2">용의자명</th>
                <th className="p-2">클릭 총합</th>
                <th className="p-2 text-[var(--neon-green)]">평균 시간간격 표준편차</th>
                <th className="p-2 text-[var(--neon-green)]">평균 시간간격 분산</th>
                <th className="p-2">분석결과</th>
              </tr>
            </thead>
            <tbody>
              {suspects.map(s => (
                <tr key={s.id} className="border-b border-gray-900 hover:bg-white/5 transition-colors">
                  <td className="p-2 font-bold text-gray-200">{s.name}</td>
                  <td className="p-2 text-gray-450">{s.totalClicks.toLocaleString()} 회</td>
                  <td className="p-2 font-semibold text-[var(--neon-green)]">{s.stdDev} 초</td>
                  <td className="p-2 font-semibold text-[var(--neon-green)]">{s.variance.toFixed(6)} 초²</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.isMacro ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-green-950 text-green-400 border border-green-900'}`}>
                      {s.isMacro ? "기계식 매크로 의심" : "인간 활동 일치"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[10px] text-gray-500 italic">
            * 매크로 프로그램 판정 기준: 클릭 간격 표준편차가 0.01초 미만인 경우.
          </div>
        </div>
      )}

      {/* Suspect Biography Selector & Details */}
      <div className="bg-black/50 border border-gray-850 rounded p-3 flex-1 flex flex-col">
        <h3 className="text-xs font-mono text-gray-400 mb-2 border-b border-gray-800 pb-1.5 flex items-center gap-1">
          <User size={14} className="text-[var(--neon-green)]" /> 수사 대상 프로필 분석
        </h3>
        
        <div className="flex gap-2 mb-3">
          {suspects.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSuspectTab(s.id)}
              className={`flex-1 py-1 px-2 border text-center font-mono text-xs transition-all ${activeSuspectTab === s.id ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-black/60 font-bold' : 'border-gray-850 text-gray-500 hover:border-gray-700'}`}
            >
              {s.id}
            </button>
          ))}
        </div>

        {activeSuspect && (
          <motion.div 
            key={activeSuspect.id}
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 text-xs font-mono text-gray-300 space-y-2 bg-[#050505] p-3 border border-gray-900 rounded"
          >
            <div className="flex justify-between border-b border-gray-900 pb-1">
              <span className="text-gray-250 font-bold text-sm">{activeSuspect.name}</span>
              <span className="text-gray-500">{activeSuspect.role} ({activeSuspect.age})</span>
            </div>
            <div className="leading-relaxed">
              <span className="text-[var(--neon-green)] font-semibold">알리바이 주장: </span>
              {activeSuspect.bio}
            </div>
            <div className="pt-1 flex gap-4 text-[10px] text-gray-500 border-t border-gray-900">
              <div>총 클릭 수: <span className="text-white">{activeSuspect.totalClicks}</span></div>
              <div>표준편차: <span className="text-white">{activeSuspect.stdDev}s</span></div>
              <div>분산: <span className="text-white">{activeSuspect.variance}s²</span></div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const getVisualization = () => {
    if (!isIntroRead) return securityLock;
    if (isAnalyzing) return analysisProgressView;
    if (!isDataAnalyzed) return analysisWaiting;
    return analysisViz;
  };

  const controlsWaiting = (
    <div className="flex flex-col h-full justify-center items-center p-6 text-center font-mono">
      <p className="text-gray-500 text-sm">대화 분석 완료 시 제어 인터페이스 활성화</p>
    </div>
  );

  const controlsActive = (
    <div className="flex flex-col h-full gap-4 px-6 justify-center">
      <div className="bg-black/40 p-4 rounded border border-gray-850">
        <h4 className="text-sm font-mono text-gray-200 mb-3 flex items-center gap-1.5">
          <Activity size={16} className="text-[var(--neon-green)]" /> 매크로 가동 용의자 지목
        </h4>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
          표준편차와 분산 테이블 분석 결과, 사람이 조작할 수 없는 기계적인 매크로 클릭 간격을 보여준 용의자들을 모두 체크하여 지목하십시오. (복수 선택 가능)
        </p>

        {/* Checkbox selector */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {suspects.map(s => {
            const isChecked = selectedSuspects.includes(s.id);
            const rawName = s.name.includes("(") 
              ? s.name.split("(")[1].replace(")", "").trim() 
              : s.name;
            return (
              <button
                key={s.id}
                onClick={() => handleToggleSuspect(s.id)}
                className={`flex items-center gap-2.5 p-3 border text-left font-mono text-xs transition-all rounded ${isChecked ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-black/60 font-bold' : 'border-gray-850 text-gray-400 hover:border-gray-700'}`}
              >
                {isChecked ? <CheckSquare size={16} className="text-[var(--neon-green)]" /> : <Square size={16} />}
                <div>
                  <div className="font-bold">{s.id}. {rawName}</div>
                  <div className="text-[9px] opacity-60 mt-0.5">{s.role}</div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedSuspects.length > 0 && (
          <button
            onClick={handleVerify}
            className="w-full py-3 bg-[var(--crimson-red)] text-white hover:bg-red-700 font-mono font-bold text-xs transition-all shadow-[0_0_10px_rgba(255,0,0,0.15)]"
          >
            지목 용의자(선택 {selectedSuspects.length}명) 통계 검증 실행
          </button>
        )}

        {showError && (
          <p className="text-[var(--crimson-red)] text-xs font-mono mt-3 text-center animate-pulse flex items-center justify-center gap-1.5">
            <ShieldAlert size={14} /> 검증 실패: 무고한 사람을 지목했거나 매크로 용의자가 누락되었습니다.
          </p>
        )}
      </div>
    </div>
  );

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
                <div className="text-sm text-gray-250 font-bold mb-2">피의자 4인의 마우스 활동 로그 파일팩 (MOUSE_ACTIVITY_DIARY.DAT)</div>
                <div className="text-[10px] text-gray-500 leading-relaxed">
                  용의자 4인의 사건 발생 시간대별 마우스 정밀 타임스탬프 로그 원본 데이터셋입니다. 마우스 클릭 속도의 통계적 표준편차 및 분산을 대조할 핵심 통계 자료입니다.
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
        {isBypassing && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 font-mono text-xs select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.08)_0%,transparent_70%)] animate-pulse" />
            <div className="max-w-md w-full border border-[var(--neon-green)] bg-black/90 p-6 rounded shadow-[0_0_30px_rgba(57,255,20,0.3)] border-double">
              <div className="flex items-center gap-2 mb-4 text-[var(--neon-green)] font-bold text-sm border-b border-[var(--neon-green)]/30 pb-2">
                <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full animate-ping" />
                <span>ALIBI_BYPASS IN PROGRESS</span>
              </div>
              <div className="space-y-2 mb-6 min-h-[110px]">
                {bypassLog.map((log, index) => (
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
        controls={
          isResolved ? (
            <div className="flex flex-col h-full justify-center items-end px-8">
              {isSuccessRead ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button 
                    onClick={() => {
                      unlockStage(4);
                      router.push("/stage4");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--neon-green)] text-black font-bold font-mono hover:shadow-[0_0_15px_var(--neon-green)] transition-all"
                  >
                    마지막 협박 메일 취조실 가기 <ArrowRight size={20} />
                  </button>
                </motion.div>
              ) : (
                <p className="text-sm text-gray-500 font-mono animate-pulse">
                  사건 분석 완료. 결과 로그 분석 대기 중...
                </p>
              )}
            </div>
          ) : (
            isDataAnalyzed ? controlsActive : controlsWaiting
          )
        }
        onNarrativeComplete={handleNarrativeComplete}
      />
    </>
  );
}

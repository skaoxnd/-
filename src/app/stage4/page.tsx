"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import { stage4Config } from "@/data/gameConfig";
import { useGameProgress } from "@/components/GameProgressProvider";
import { 
  Lock, FileWarning, Target, ShieldAlert, AlertTriangle, 
  Database, Play, CheckCircle2, Sparkles, Cpu 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Stage4Page() {
  const router = useRouter();
  const { unlockStage } = useGameProgress();
  
  // STATES
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [isIntroRead, setIsIntroRead] = useState(false);
  const [isSuccessRead, setIsSuccessRead] = useState(false);
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);

  // CLUE AND ANALYSIS FLOW STATES
  const [hasClue, setHasClue] = useState(false);
  const [showClueModal, setShowClueModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isDataAnalyzed, setIsDataAnalyzed] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);

  // WARRANT PROCESSING / LOADING STATE
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [showFailedModal, setShowFailedModal] = useState(false);

  let narrativeText = isResolved ? stage4Config.narrative.success : stage4Config.narrative.intro;

  const handleSelectC = () => {
    // Override warning: system forces D due to blame instinct
    setShowOverrideWarning(true);
    setSelectedSuspect("C");
    setTimeout(() => setShowOverrideWarning(false), 3500);
  };

  const handleSelectD = () => {
    setSelectedSuspect("D");
    setShowOverrideWarning(false);
  };

  const handleArrestD = () => {
    setIsProcessing(true);
    setProcessingLog([]);
    
    const logs = [
      "SYS_POLICE: 용의자 D(강성태)에 대한 구속 영장 승인 검토 중...",
      "DATABASE: 범죄 이력 대조 - 특수폭행 전과 3범 조회 완료 [유효]",
      "NET_SECURE: 용의자 D 신병 확보 명령 경찰 기동대에 발송 완료...",
      "SYS_STATUS: 피의자 체포 영장 발부 집행 시작...",
      "AUTHORIZING: 수사 종결 보고서 경찰 수뇌부에 최종 제출 중..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setProcessingLog(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setIsResolved(true);
          setShowFailedModal(true);
        }, 500);
      }
    }, 400);
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
      "SYS_TEXT: 복구된 협박메일 본문 유출 통계 정독...",
      "LEXICAL: 형태소 추출 및 폭력적 단어 출현 궤적 산출...",
      "CORRELATION: 피의자별 평소 대조군 언어 샘플 인덱싱...",
      "SUCCESS: 어휘 폭력성 대조 분석 데이터 마운트 완료."
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
      <h3 className="text-lg font-bold text-[var(--crimson-red)] uppercase tracking-wider mb-2">
        보안 제어 잠금 (SYS_LOCK)
      </h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        사건 데이터 분석 및 제어 장치가 비활성화되어 있습니다.
        먼저 좌측의 시스템 대화 로그(NARRATIVE_LOG)를 끝까지 읽어 수사 요건을 활성화하십시오.
      </p>
    </div>
  );

  const analysisWaiting = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono text-center bg-black/40">
      <div className="border border-[var(--crimson-red)]/30 bg-black/60 p-8 rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.15)] w-full max-w-md">
        <Database className="text-[var(--crimson-red)] mx-auto mb-6 animate-pulse" size={56} />
        <h3 className="text-lg font-bold text-[var(--crimson-red)] uppercase tracking-widest mb-4 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">
          단서 파일 로딩 완료
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed mb-8">
          복구된 경찰청 협박 메일 원본 데이터팩(POLICE_威胁信.DAT)을 텍스트 분석 장치에 장착했습니다. 언어 형태소 분석기를 가동하십시오.
        </p>
        <button 
          onClick={runDataAnalysis}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--crimson-red)] text-white font-mono font-bold text-sm hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] transition-all rounded"
        >
          <Play size={18} fill="white" /> 분석 프로그램 실행 (LEXICAL_ANALYZE.EXE)
        </button>
      </div>
    </div>
  );

  const analysisProgressView = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono bg-black/60">
      <div className="w-full max-w-md border border-red-950/80 bg-black p-6 rounded shadow-[0_0_30px_rgba(255,0,0,0.2)]">
        <div className="flex justify-between items-center text-[var(--crimson-red)] mb-4 font-bold text-sm">
          <span className="flex items-center gap-2"><Cpu className="animate-spin" size={16}/> LEXICAL FREQUENCY READING...</span>
          <span className="text-lg">{analysisProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-900 h-3 rounded overflow-hidden mb-6 border border-gray-800">
          <motion.div 
            style={{ width: `${analysisProgress}%` }}
            className="bg-[var(--crimson-red)] h-full shadow-[0_0_15px_var(--crimson-red)]"
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
    <div className="w-full h-full p-4 flex flex-col overflow-y-auto custom-scrollbar">
      <h2 className="text-lg font-mono text-[var(--crimson-red)] mb-3 text-center tracking-widest drop-shadow-[0_0_8px_rgba(255,48,48,0.8)] animate-pulse">
        [경보] 협박 메일 폭력성 분석 (비난 본능)
      </h2>
      
      <div className="flex-1 min-h-[180px] bg-red-950/5 border border-red-900/10 rounded p-2 mb-3">
        <h3 className="text-gray-450 font-mono mb-2 text-center text-xs">익명 협박 메일 내 폭력적 단어 출현 빈도</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={stage4Config.data.violentWords} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
            <XAxis type="number" stroke="#666" tick={{fill: '#888', fontSize: 9}} />
            <YAxis dataKey="name" type="category" stroke="#888" tick={{fill: '#ccc', fontFamily: 'monospace', fontSize: 10}} />
            <Tooltip cursor={{fill: '#222'}} contentStyle={{backgroundColor: '#005000', borderColor: '#ff3030', fontFamily: 'monospace', color: 'white', fontSize: 11}} />
            <Bar dataKey="count" fill="#ff3030" name="단어 빈도" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 min-h-[180px] bg-red-950/10 border border-red-900/30 rounded p-2">
        <h3 className="text-[var(--crimson-red)] font-mono mb-2 text-center text-xs font-bold">용의자 2인의 언어 습관 폭력성 지수</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={stage4Config.data.suspectViolentFrequency} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#666" tick={{fill: '#888', fontFamily: 'monospace', fontSize: 10}} />
            <YAxis stroke="#666" tick={{fill: '#888', fontSize: 10}} />
            <Tooltip cursor={{fill: '#222'}} contentStyle={{backgroundColor: '#000', borderColor: '#ff3030', fontFamily: 'monospace', color: 'white', fontSize: 11}} />
            <Bar dataKey="score" fill="#ff3030" name="폭력성 수치 (점)" />
          </BarChart>
        </ResponsiveContainer>
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
      <p className="text-gray-500 text-sm">대화 분석 및 단서 해독 완료 시 제어 인터페이스 활성화</p>
    </div>
  );

  const controlsActive = (
    <div className="flex flex-col h-full gap-4 px-6 justify-center">
      <div className="bg-black/40 p-4 rounded border border-red-900/50">
        <h4 className="text-sm font-mono text-[var(--crimson-red)] mb-3 flex items-center gap-1.5 font-bold">
          <FileWarning size={18} className="animate-pulse" /> 최종 피의자 구속 집행
        </h4>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
          경찰 수뇌부와 배심원단은 전과 및 폭력성 대조 지표가 압도적인 용의자를 즉시 구속 수감하라고 지시했습니다.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={handleSelectC}
            disabled={isResolved}
            className={`flex-1 py-3 text-xs font-mono font-bold transition-all border ${selectedSuspect === "C" ? 'bg-gray-800 border-gray-650 text-white' : 'border-gray-850 text-gray-400 hover:border-gray-700'}`}
          >
            C. 정도현 지목
          </button>
          
          <button 
            onClick={handleSelectD}
            disabled={isResolved}
            className={`flex-1 py-3 text-xs font-mono font-bold transition-all border ${selectedSuspect === "D" ? 'bg-[var(--crimson-red)] border-[var(--crimson-red)] text-white shadow-[0_0_12px_var(--crimson-red)] font-extrabold' : 'border-red-900 text-[var(--crimson-red)] hover:bg-red-950/30'}`}
          >
            D. 강성태 지목
          </button>
        </div>

        {/* Override warning if selecting C */}
        {selectedSuspect === "C" && showOverrideWarning && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-red-950/20 border border-red-800/40 rounded flex gap-2"
          >
            <ShieldAlert className="text-[var(--crimson-red)] shrink-0" size={16} />
            <div className="text-[10px] font-mono text-red-400 leading-relaxed">
              <strong>경찰 수뇌부 명령 거부됨:</strong> "용의자 C는 폭력성 지수가 12점에 불과하며, 범죄 전과가 없는 선량한 관리자입니다. D의 폭력 지수(95점) 및 협박 메일 매칭도가 압도적이므로 D를 즉각 체포하십시오. 사회적 분노를 잠재울 희생양이 필요합니다."
            </div>
          </motion.div>
        )}

        {selectedSuspect === "D" && !isResolved && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <button 
              onClick={handleArrestD} 
              className="w-full py-4 bg-[var(--crimson-red)] text-black font-mono font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)]"
            >
              <Target size={18} /> 용의자 D 구속 및 사건 송치 종결
            </button>
          </motion.div>
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
              className="max-w-md w-full border-2 border-[var(--crimson-red)] bg-black p-6 rounded shadow-[0_0_30px_rgba(255,0,0,0.2)] font-mono text-center relative"
            >
              <div className="absolute top-2 right-2 text-[var(--crimson-red)] animate-ping">
                <Sparkles size={16} />
              </div>
              <CheckCircle2 className="text-[var(--crimson-red)] mx-auto mb-4 animate-bounce" size={48} />
              <h3 className="text-md font-bold text-white mb-2 tracking-wider">포렌식 수사 단서 획득</h3>
              <div className="bg-gray-950 p-4 border border-red-900/40 rounded mb-6 text-left">
                <div className="text-xs text-[var(--crimson-red)] font-bold mb-1">DATA_FILE_MOUNTED:</div>
                <div className="text-sm text-gray-250 font-bold mb-2">복구된 경찰청 협박 메일 원본 (POLICE_威胁信.DAT)</div>
                <div className="text-[10px] text-gray-500 leading-relaxed">
                  범인이 보안망 폭파 직전 경찰서에 송신한 익명 위협 전자우편 로그 덤프입니다. 본문에 담긴 핵심 폭력적 키워드 출현 통계를 분석하여 주필자의 성향을 매칭해낼 유일한 텍스트 단서입니다.
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowClueModal(false);
                  setHasClue(true);
                }}
                className="w-full py-2.5 bg-[var(--crimson-red)] text-white font-bold text-xs hover:shadow-[0_0_12px_rgba(255,0,0,0.3)]"
              >
                단서 마운트 및 분석 콘솔 전송
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2-Second Authorized Loading screen */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 font-mono text-xs select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08)_0%,transparent_70%)] animate-pulse" />
            <div className="max-w-md w-full border border-red-500 bg-black/90 p-6 rounded shadow-[0_0_30px_rgba(239,68,68,0.3)] border-double">
              <div className="flex items-center gap-2 mb-4 text-red-500 font-bold text-sm border-b border-red-500/30 pb-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <span>WARRANT AUTHORIZATION IN PROGRESS</span>
              </div>
              <div className="space-y-2 mb-6 min-h-[110px]">
                {processingLog.map((log, index) => (
                  <div key={index} className="text-red-500 leading-relaxed animate-pulse">
                    {`>> ${log}`}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-950 h-3 rounded overflow-hidden border border-gray-800">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  className="bg-red-600 h-full shadow-[0_0_15px_#dc2626]"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Mission Failed Modal */}
      <AnimatePresence>
        {showFailedModal && (
          <div className="fixed inset-0 bg-black/95 z-40 backdrop-blur-sm flex flex-col items-center justify-center border-[8px] border-[var(--crimson-red)] p-8 select-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="max-w-xl w-full text-center flex flex-col items-center"
            >
              <AlertTriangle size={80} className="text-[var(--crimson-red)] mb-6 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-mono text-[var(--crimson-red)] font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] mb-2">
                MISSION FAILED
              </h1>
              <h2 className="text-lg font-mono text-gray-300 mb-6 border-b border-red-900/50 pb-2 w-full">
                오인 체포: 용의자 D는 범인이 아니었습니다.
              </h2>
              <div className="space-y-4 text-xs font-mono text-gray-400 text-left leading-relaxed bg-red-950/15 p-4 border border-red-900/30 rounded mb-8">
                <p>
                  • <strong>수사 오류 보고:</strong> 용의자 D가 유치장에 입건되어 구금된 직후, 동일한 포렌식 시각에 메인 기밀 서버에서 2차 데이터 백도어가 가동되며 기밀이 추가 유출되었습니다.
                </p>
                <p>
                  • <strong>비난 본능의 함정:</strong> 수뇌부와 시스템은 자극적이고 거친 폭력적 어휘 지표(95점)와 특수폭행 전과기록에만 흥분하여, 정작 서버 아키텍처를 침투할 기술 수준과 개연성이 D에게 전혀 없었다는 중대 결함을 무시했습니다.
                </p>
                <p>
                  • <strong>진범 도주:</strong> 진짜 설계자이자 내부 보안 취약점을 완벽히 장악하고 있던 용의자 C는, 모든 이들의 비난 본능이 D를 향해 집중된 사이 유유히 망을 탈출하여 어둠 속으로 사라졌습니다.
                </p>
              </div>
              
              {!isSuccessRead ? (
                <p className="font-mono text-xs text-gray-500 animate-pulse">
                  🔒 사건 종결 오류 보고 로그 해독 대기 중...
                </p>
              ) : (
                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => {
                    unlockStage(5); // Epilogue is stage 5
                    router.push("/epilogue");
                  }}
                  className="px-8 py-3 bg-[var(--crimson-red)] text-black font-extrabold font-mono text-sm hover:bg-red-500 transition-all shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                >
                  수사 결과 보고서 최종 확인
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ShellLayout
        narrativeText={narrativeText}
        visualization={getVisualization()}
        controls={
          isResolved ? (
            <div className="flex flex-col h-full justify-center items-end px-8">
              <p className="text-xs text-gray-500 font-mono">
                수사 분석 강제 종료됨.
              </p>
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

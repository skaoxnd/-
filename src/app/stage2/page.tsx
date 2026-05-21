"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import { stage2Config } from "@/data/gameConfig";
import { useGameProgress } from "@/components/GameProgressProvider";
import { 
  Lock, ArrowRight, Key, Cpu, AlertTriangle, 
  Gamepad2, Compass, Database, Play, CheckCircle2, Sparkles, MapPin, 
  RefreshCcw, MoveUp, MoveDown, MoveLeft, MoveRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// GRID CONFIG FOR STEALTH MINIGAME
const GRID_SIZE = 15;
// 0: path, 1: wall, 2: key, 3: mainframe, 4: start
const INITIAL_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1], // 0
  [1, 2, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 2, 1], // 1
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1], // 2 
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], // 4 
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
  [1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1], // 6
  [1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1], // 7
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1], // 8
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1], // 10 
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 11
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1], // 12 
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1], // 13
  [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1], // 14
];

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Enemy {
  id: number;
  path: { r: number; c: number; dir: Direction }[];
  pathIndex: number;
}

function createRectPath(r1: number, c1: number, r2: number, c2: number, clockwise: boolean = true) {
  const path: { r: number, c: number, dir: Direction }[] = [];
  if (clockwise) {
    for (let c = c1; c < c2; c++) path.push({ r: r1, c: c, dir: 'RIGHT' });
    for (let r = r1; r < r2; r++) path.push({ r: r, c: c2, dir: 'DOWN' });
    for (let c = c2; c > c1; c--) path.push({ r: r2, c: c, dir: 'LEFT' });
    for (let r = r2; r > r1; r--) path.push({ r: r, c: c1, dir: 'UP' });
  } else {
    for (let c = c2; c > c1; c--) path.push({ r: r1, c: c, dir: 'LEFT' });
    for (let r = r1; r < r2; r++) path.push({ r: r, c: c1, dir: 'DOWN' });
    for (let c = c1; c < c2; c++) path.push({ r: r2, c: c, dir: 'RIGHT' });
    for (let r = r2; r > r1; r--) path.push({ r: r, c: c2, dir: 'UP' });
  }
  return path;
}

const getFlashlightTiles = (enemy: Enemy) => {
  const tiles = [];
  let dr = 0, dc = 0;
  const currentDir = enemy.path[enemy.pathIndex].dir;
  if(currentDir === 'RIGHT') dc = 1;
  if(currentDir === 'LEFT') dc = -1;
  if(currentDir === 'UP') dr = -1;
  if(currentDir === 'DOWN') dr = 1;

  for(let i=1; i<=2; i++){
    const nr = enemy.path[enemy.pathIndex].r + dr * i;
    const nc = enemy.path[enemy.pathIndex].c + dc * i;
    if(nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE){
       if(INITIAL_GRID[nr][nc] === 1) break; // blocked by wall
       tiles.push({r: nr, c: nc, dist: i});
    }
  }
  return tiles;
};

export default function Stage2Page() {
  const router = useRouter();
  const { unlockStage } = useGameProgress();

  // STAGE PROGRESS STATES
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [bufferRadius, setBufferRadius] = useState<number>(15);
  const [isIntroRead, setIsIntroRead] = useState(false);
  const [isAnalysisSuccess, setIsAnalysisSuccess] = useState(false);
  const [showAnalysisError, setShowAnalysisError] = useState(false);

  // CLUE AND ANALYSIS FLOW
  const [showClueModal, setShowClueModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isDataAnalyzed, setIsDataAnalyzed] = useState(false);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  
  // MINIGAME STATES
  const [mode, setMode] = useState<"ANALYSIS" | "INFILTRATION">("ANALYSIS");
  const [agentPos, setAgentPos] = useState({ r: 13, c: 7 });
  const [keysCollected, setKeysCollected] = useState<Record<string, boolean>>({
    "1-1": false,
    "1-13": false,
    "7-7": false
  });
  
  const initialEnemies = [
    { id: 1, path: createRectPath(1, 1, 3, 5, true), pathIndex: 0 },
    { id: 2, path: createRectPath(1, 9, 3, 13, false), pathIndex: 4 },
    { id: 3, path: createRectPath(5, 1, 9, 13, true), pathIndex: 12 },
    { id: 4, path: createRectPath(11, 1, 13, 5, true), pathIndex: 2 },
    { id: 5, path: createRectPath(11, 9, 13, 13, false), pathIndex: 6 },
  ];
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);

  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameCleared, setIsGameCleared] = useState(false);
  const lastMoveTime = useRef<number>(0);
  
  // STAGE FINAL STATES
  const [isResolved, setIsResolved] = useState(false);
  const [isSuccessRead, setIsSuccessRead] = useState(false);
  const [isBypassing, setIsBypassing] = useState(false);
  const [bypassLog, setBypassLog] = useState<string[]>([]);

  // MAP DATA
  const points = stage2Config.data.points;
  const candidates = stage2Config.data.candidates;

  // RULE CHECKERS FOR ANALYSIS
  const currentCandidateData = candidates.find(c => c.id === selectedCandidate);
  
  const getViolations = () => {
    if (!currentCandidateData) return { bufferViolation: false, distanceViolation: false, crimeCountInside: 0 };
    
    let crimeCountInside = 0;
    let maxDistance = 0;

    points.forEach(pt => {
      const dist = Math.sqrt(Math.pow(pt.x - currentCandidateData.x, 2) + Math.pow(pt.y - currentCandidateData.y, 2));
      if (dist < bufferRadius) {
        crimeCountInside++;
      }
      if (dist > maxDistance) {
        maxDistance = dist;
      }
    });

    const bufferViolation = crimeCountInside > 0;
    const distanceViolation = maxDistance > stage2Config.data.maxComfortRange;

    return { bufferViolation, distanceViolation, crimeCountInside };
  };

  const { bufferViolation, distanceViolation, crimeCountInside } = getViolations();

  // VERIFY ANALYSIS SOLUTION
  const handleVerifyAnalysis = () => {
    if (selectedCandidate === "C" && bufferRadius >= 5 && bufferRadius <= 15) {
      setIsAnalysisSuccess(true);
      setShowAnalysisError(false);
    } else {
      setShowAnalysisError(true);
      setTimeout(() => setShowAnalysisError(false), 2500);
    }
  };

  const handleStartInfiltration = () => {
    setMode("INFILTRATION");
    setAgentPos({ r: 13, c: 7 });
    setKeysCollected({ "1-1": false, "1-13": false, "7-7": false });
    setIsGameOver(false);
    setIsGameCleared(false);
    setEnemies(initialEnemies);
  };

  // ENEMY PATROL LOOP (Stealth mechanics)
  useEffect(() => {
    if (mode !== "INFILTRATION" || isGameOver || isGameCleared) return;

    const interval = setInterval(() => {
      setEnemies(prev => prev.map(e => ({
        ...e,
        pathIndex: (e.pathIndex + 1) % e.path.length
      })));
    }, 280);

    return () => clearInterval(interval);
  }, [mode, isGameOver, isGameCleared]);

  // COLLISION DETECTION LOOP
  useEffect(() => {
    if (mode !== "INFILTRATION" || isGameOver || isGameCleared) return;

    const checkCollision = (ar: number, ac: number) => {
      const keyKey = `${ar}-${ac}`;
      if (keyKey in keysCollected && !keysCollected[keyKey]) {
        setKeysCollected(prev => ({ ...prev, [keyKey]: true }));
      }

      let hit = false;
      for (const e of enemies) {
        const ePos = e.path[e.pathIndex];
        if (ePos.r === ar && ePos.c === ac) hit = true;
        const lights = getFlashlightTiles(e);
        for (const l of lights) {
          if (l.r === ar && l.c === ac) hit = true;
        }
      }

      if (hit) {
        setIsGameOver(true);
      }

      // Check Win Condition
      if (ar === 0 && ac === 7) {
        const allKeys = Object.values(keysCollected).every(v => v);
        if (allKeys) {
          setIsGameCleared(true);
        }
      }
    };

    checkCollision(agentPos.r, agentPos.c);
  }, [agentPos, enemies, keysCollected, mode, isGameOver, isGameCleared]);

  // MOVE AGENT FUNCTION
  const moveAgent = (dr: number, dc: number) => {
    if (mode !== "INFILTRATION" || isGameOver || isGameCleared) return;

    // Movement Cooldown (Throttle)
    const now = Date.now();
    if (now - lastMoveTime.current < 130) return;
    lastMoveTime.current = now;

    setAgentPos(prev => {
      const nr = prev.r + dr;
      const nc = prev.c + dc;

      // Boundaries check
      if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return prev;

      // Wall check
      if (INITIAL_GRID[nr][nc] === 1) return prev;

      return { r: nr, c: nc };
    });
  };

  // KEYBOARD HANDLERS FOR MINIGAME
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== "INFILTRATION") return;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          moveAgent(-1, 0);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          moveAgent(1, 0);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          moveAgent(0, -1);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          moveAgent(0, 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, isGameOver, isGameCleared, agentPos]);

  const handleGameClearComplete = () => {
    setIsBypassing(true);
    setBypassLog([]);
    const logs = [
      "ESTABLISHING CONTEXT OVERRIDE...",
      "DOWNLOADING LOCAL ENCRYPTED LOGS... [33%]",
      "DOWNLOADING LOCAL ENCRYPTED LOGS... [75%]",
      "DOWNLOADING LOCAL ENCRYPTED LOGS... [100%]",
      "EXTRACTING MOUSE_ACTIVITY_DIARY.DAT...",
      "SUCCESS: SUSPECT LOGS SYNCED. TERMINATING S2 MODULE."
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
        }, 500);
      }
    }, 300);
  };

  const handleNarrativeComplete = () => {
    if (!isResolved) {
      setIsIntroRead(true);
      setShowClueModal(true);
    } else {
      setIsSuccessRead(true);
    }
  };

  const runGeographicAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLogs([]);
    
    const logs = [
      "GPS_LOCATOR: GPS 지리 좌표 파일 마운트 중...",
      "PROFILER: 침입 노드간 직선 거리 벡터 매핑...",
      "MATH_MODEL: 반경 내 분포 검증 알고리즘 가동...",
      "SUCCESS: 전술 지리 지도 렌더링 완료."
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

  // SVG MAP RENDERING
  const renderAnalysisViz = () => (
    <div className="w-full h-full p-4 flex flex-col items-center select-none overflow-y-auto custom-scrollbar">
      <h2 className="text-sm font-mono text-[var(--neon-green)] mb-3 tracking-widest drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
        A구역 전술 작전 지리 정보 지도
      </h2>

      <div className="w-full max-w-[380px] aspect-square bg-[#030508] border-2 border-gray-800 rounded relative overflow-hidden shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--neon-green)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>

        {/* Selected Candidate Max Comfort Range Circle */}
        {currentCandidateData && (
          <div 
            className="absolute border border-dashed border-blue-500/80 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
            style={{ 
              left: `${currentCandidateData.x}%`, 
              top: `${currentCandidateData.y}%`, 
              width: `${stage2Config.data.maxComfortRange * 2}%`, 
              height: `${stage2Config.data.maxComfortRange * 2}%`, 
              backgroundColor: 'rgba(59, 130, 246, 0.05)' 
            }} 
          >
            <div className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 text-[9px] text-blue-400 font-mono ml-1 whitespace-nowrap opacity-70">
              안전 활동 반경 ({stage2Config.data.maxComfortRange}m)
            </div>
          </div>
        )}

        {/* Intrusion Points & Their Buffer Zones */}
        {points.map(pt => (
          <div key={pt.id}>
            <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_red] transform -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${pt.x}%`, top: `${pt.y}%` }} />
            <div 
              className="absolute border border-red-500/40 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none z-10" 
              style={{ left: `${pt.x}%`, top: `${pt.y}%`, width: `${bufferRadius * 2}%`, height: `${bufferRadius * 2}%`, backgroundColor: 'rgba(255, 0, 0, 0.1)' }} 
            />
          </div>
        ))}
        
        {/* Candidates */}
        {candidates.map(c => {
          const isSelected = selectedCandidate === c.id;
          return (
            <div 
              key={c.id} 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group" 
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              onClick={() => setSelectedCandidate(c.id)}
            >
              <div className={`w-3 h-3 rounded-sm rotate-45 transition-all ${isSelected ? 'bg-[var(--neon-green)] shadow-[0_0_15px_var(--neon-green)] scale-150' : 'bg-gray-500 hover:bg-gray-300'}`} />
              <div className={`absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] whitespace-nowrap bg-black/80 px-1 py-0.5 rounded border ${isSelected ? 'text-[var(--neon-green)] border-[var(--neon-green)] font-bold' : 'text-gray-400 border-gray-700 opacity-0 group-hover:opacity-100'}`}>
                {c.id}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="w-full max-w-[380px] flex gap-4 mt-3 text-[10px] font-mono text-gray-400 justify-center shrink-0">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full" /> 진원지 (범죄)</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 border border-red-500/50 bg-red-500/10 rounded-full" /> 버퍼존 위험 구역</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-gray-500 rotate-45" /> 은신처 후보지</div>
      </div>
    </div>
  );

  const renderMinigameViz = () => {
    return (
      <div className="w-full h-full p-4 flex flex-col items-center bg-black/90 relative overflow-hidden">
        {/* Background glow effect for atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_80%)] pointer-events-none z-0" />
        
        <div className="flex justify-between w-full max-w-[380px] mb-4 font-mono text-[10px] sm:text-xs z-10 relative">
          <div className="flex gap-2 text-red-500 font-bold items-center border border-red-900/50 bg-red-950/30 px-3 py-1.5 rounded">
            <AlertTriangle size={14} /> 피격 시 즉각 발각
          </div>
          <div className="flex gap-2 text-yellow-400 font-bold items-center border border-yellow-900/50 bg-yellow-950/30 px-3 py-1.5 rounded">
            <Key size={14} /> 키 수집: {Object.values(keysCollected).filter(Boolean).length}/3
          </div>
        </div>
        
        <div className="relative bg-black border border-gray-800 p-2 sm:p-4 rounded shadow-[0_0_50px_rgba(0,0,0,1)] z-10">
          {/* GRID RENDERER */}
          <div 
            className="grid gap-[1px] bg-gray-950 border border-gray-900"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
              width: '100%',
              maxWidth: '380px',
              aspectRatio: '1 / 1'
            }}
          >
            {INITIAL_GRID.map((row, r) => 
              row.map((_, c) => {
                let content = null;
                let cellClass = "bg-transparent transition-colors duration-150";

                if (INITIAL_GRID[r][c] === 1) cellClass = "bg-zinc-800 border border-zinc-700 shadow-[inset_0_0_4px_rgba(255,255,255,0.05)]";
                
                const keyKey = `${r}-${c}`;
                if (keyKey in keysCollected && !keysCollected[keyKey]) {
                  content = <Key size={12} className="text-yellow-400 animate-pulse drop-shadow-[0_0_5px_yellow]" />;
                }

                if (INITIAL_GRID[r][c] === 3) {
                  content = <Database size={14} className="text-[var(--neon-green)] animate-pulse" />;
                  cellClass = "bg-green-950/20";
                }

                if (INITIAL_GRID[r][c] === 4) cellClass = "bg-blue-950/10";

                let lightDist = 0;
                enemies.forEach(e => {
                  const lights = getFlashlightTiles(e);
                  lights.forEach(l => {
                    if (l.r === r && l.c === c) lightDist = l.dist;
                  });
                });

                if (lightDist === 1) {
                  // Strong flashlight
                  cellClass = "bg-yellow-200/50 shadow-[inset_0_0_15px_rgba(250,204,21,0.6)] z-10 transition-colors duration-150";
                } else if (lightDist === 2) {
                  // Faded flashlight
                  cellClass = "bg-yellow-400/20 shadow-[inset_0_0_10px_rgba(250,204,21,0.2)] z-10 transition-colors duration-150";
                }

                const enemy = enemies.find(e => {
                  const ePos = e.path[e.pathIndex];
                  return ePos.r === r && ePos.c === c;
                });
                
                if (enemy) {
                  content = <div className="text-[12px] sm:text-[14px] select-none text-red-500 font-bold drop-shadow-[0_0_8px_red] z-20">👤</div>;
                  cellClass = "bg-red-950/60 shadow-[0_0_10px_rgba(239,68,68,0.3)] z-10";
                }

                if (agentPos.r === r && agentPos.c === c) {
                  content = <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[var(--neon-green)] rounded-full shadow-[0_0_12px_var(--neon-green)] animate-pulse z-20" />;
                }

                return (
                  <div key={`${r}-${c}`} className={`w-full aspect-square flex items-center justify-center ${cellClass}`}>
                    {content}
                  </div>
                );
              })
            )}
          </div>
          
          {/* Game Over / Cleared Overlays */}
          <AnimatePresence>
            {isGameOver && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center font-mono text-center z-30">
                <AlertTriangle size={56} className="text-red-500 mb-4 animate-bounce drop-shadow-[0_0_15px_red]" />
                <h3 className="text-3xl font-bold text-red-500 tracking-widest mb-2 shadow-red-500 drop-shadow-[0_0_10px_red]">발각됨</h3>
                <p className="text-xs text-red-400 mb-8 leading-relaxed px-4">순찰 중인 조직원의 시야에 노출되었습니다.<br/>체력이 존재하지 않으므로 즉시 사망 처리됩니다.</p>
                <button onClick={handleStartInfiltration} className="px-8 py-3 bg-red-600/20 border border-red-500 text-red-400 font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 rounded">
                  <RefreshCcw size={16} /> 처음부터 재시작
                </button>
              </motion.div>
            )}
            
            {isGameCleared && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-green-950/90 flex flex-col items-center justify-center font-mono text-center z-30 p-4">
                <Cpu size={48} className="text-[var(--neon-green)] mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-[var(--neon-green)] tracking-widest mb-2">SYSTEM BREACHED</h3>
                <p className="text-xs text-green-300 mb-6 leading-relaxed">서버에 성공적으로 접촉했습니다. 로그 탈취 및 보안 해제 스크립트를 가동합니다.</p>
                <button onClick={handleGameClearComplete} className="px-6 py-3 bg-[var(--neon-green)] text-black font-bold text-sm hover:shadow-[0_0_15px_var(--neon-green)] transition-all">
                  루트 권한 확보 및 클리어
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const securityLock = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono text-center border border-dashed border-[var(--neon-green)]/30 rounded-lg bg-green-950/5">
      <Lock className="text-[var(--neon-green)] animate-pulse mb-4" size={32} />
      <h3 className="text-sm font-bold text-[var(--neon-green)] uppercase tracking-wider mb-2">
        보안 제어 잠금 (SYS_LOCK)
      </h3>
      <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
        사건 데이터 분석 및 제어 장치가 비활성화되어 있습니다.
        먼저 좌측의 시스템 대화 로그를 끝까지 읽어 수사 요건을 활성화하십시오.
      </p>
    </div>
  );

  const analysisWaiting = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono text-center bg-black/40">
      <div className="border border-[var(--neon-green)]/30 bg-black/60 p-8 rounded-lg shadow-[0_0_30px_rgba(57,255,20,0.1)] w-full max-w-md">
        <MapPin className="text-[var(--neon-green)] mx-auto mb-6 animate-bounce" size={56} />
        <h3 className="text-lg font-bold text-[var(--neon-green)] uppercase tracking-widest mb-4 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]">
          위치 데이터 로딩 완료
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed mb-8">
          해킹 진원지 6곳의 GPS 좌표계가 마운트되었습니다. 지리 공간 분석 맵을 가동하여 버퍼존 검증을 시작하십시오.
        </p>
        <button 
          onClick={runGeographicAnalysis}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[var(--neon-green)] text-black font-mono font-bold text-sm hover:shadow-[0_0_20px_var(--neon-green)] transition-all rounded"
        >
          <Play size={18} fill="black" /> 지리 공간 분석기 가동
        </button>
      </div>
    </div>
  );

  const analysisProgressView = (
    <div className="flex flex-col items-center justify-center h-full p-8 font-mono bg-black/60">
      <div className="w-full max-w-md border border-[var(--neon-green)]/50 bg-black p-6 rounded shadow-[0_0_30px_rgba(57,255,20,0.15)]">
        <div className="flex justify-between items-center text-[var(--neon-green)] mb-4 font-bold text-sm">
          <span className="flex items-center gap-2"><Cpu className="animate-spin" size={16}/> RUNNING GEOGRAPHIC LOCATOR...</span>
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

  const getVisualization = () => {
    if (!isIntroRead) return securityLock;
    if (isAnalyzing) return analysisProgressView;
    if (!isDataAnalyzed) return analysisWaiting;
    return mode === "ANALYSIS" ? renderAnalysisViz() : renderMinigameViz();
  };

  const renderAnalysisControls = () => (
    <div className="flex flex-col h-full gap-4 px-6 justify-center">
      <div className="bg-black/40 p-4 rounded border border-gray-850">
        <h4 className="text-sm font-mono text-[var(--neon-green)] mb-3 font-bold">버퍼존 거리 감쇠 분석</h4>
        
        {/* 프로파일링 원리 설명 추가 */}
        <div className="text-[11px] text-gray-300 leading-relaxed mb-4 space-y-2 bg-blue-950/20 p-3 rounded border border-blue-900/30">
          <p className="font-bold text-blue-400">지리적 프로파일링 핵심 원리:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong className="text-red-400">버퍼존 (안전 반경)</strong>: 범죄자는 경찰의 수사망이 자신의 은신처로 좁혀오는 것을 막기 위해, 자신의 집(거점) 바로 근처에서는 범행을 저지르지 않습니다. (너무 가까우면 기각)</li>
            <li><strong className="text-green-400">거리 감쇠 (활동 한계)</strong>: 반대로 범죄자는 익숙하지 않은 너무 먼 지역까지 이동하는 것을 꺼립니다. (너무 멀어도 기각)</li>
          </ul>
          <p className="text-gray-400 italic">결론: 우측 맵의 슬라이더를 조절해 보십시오. 수사본부가 지목한 A(중심부)는 범죄지와 너무 가까워 버퍼존을 침범하게 됩니다.</p>
        </div>

        {/* Candidate List */}
        <div className="flex flex-col gap-2 mb-4">
          {candidates.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCandidate(c.id)}
              className={`text-left p-2 border font-mono text-xs transition-all ${selectedCandidate === c.id ? 'border-[var(--neon-green)] text-[var(--neon-green)] bg-[var(--neon-green)]/10 font-bold' : 'border-gray-800 text-gray-500 hover:border-gray-600'}`}
            >
              {c.id}. {c.name}
            </button>
          ))}
        </div>

        {/* Radius Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-mono text-gray-300 mb-2">
            <span>버퍼존 최소 반경 설정 (경찰 경계 구역)</span>
            <span className="text-[var(--neon-green)] font-bold">{bufferRadius} m</span>
          </div>
          <input 
            type="range" 
            min="5" max="25" 
            value={bufferRadius} 
            onChange={(e) => setBufferRadius(parseInt(e.target.value))}
            className="w-full accent-[var(--neon-green)] bg-gray-800 h-1.5 rounded appearance-none outline-none cursor-pointer"
          />
        </div>

        {/* Verification Logic */}
        <div className="p-3 bg-black/60 border border-gray-800 rounded mb-4 text-[10px] font-mono">
          <div className="flex justify-between mb-1.5">
            <span className="text-gray-500">선택된 타겟:</span>
            <span className="text-white font-bold">{currentCandidateData?.name || "없음"}</span>
          </div>
          <div className="flex justify-between mb-1.5">
            <span className="text-gray-500">버퍼존 침범 오류 (너무 가깝다):</span>
            <span className={!currentCandidateData ? "text-gray-600" : bufferViolation ? "text-red-500 font-bold" : "text-green-500"}>
              {currentCandidateData ? (bufferViolation ? `발생 (${crimeCountInside}건)` : "안전 (0건)") : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">거리 감쇠 오류 (너무 멀다):</span>
            <span className={!currentCandidateData ? "text-gray-600" : distanceViolation ? "text-red-500 font-bold" : "text-green-500"}>
              {currentCandidateData ? (distanceViolation ? "발생" : "안전") : "-"}
            </span>
          </div>
        </div>

        <button 
          onClick={handleVerifyAnalysis}
          disabled={!selectedCandidate}
          className="w-full py-3 bg-[var(--neon-green)] text-black font-mono font-bold text-xs hover:shadow-[0_0_15px_var(--neon-green)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          해당 타겟을 은신처로 확정 및 전술부대 침투 명령
        </button>

        {showAnalysisError && (
          <p className="text-[var(--crimson-red)] text-xs font-mono mt-3 text-center animate-pulse flex items-center justify-center gap-1.5">
            <AlertTriangle size={14} /> 규칙 위반: 버퍼존을 침범했거나 활동 반경을 초과했습니다.
          </p>
        )}
      </div>
    </div>
  );

  const renderMinigameControls = () => (
    <div className="flex flex-col h-full gap-4 px-6 justify-center">
      <div className="bg-black/40 p-4 rounded border border-gray-850">
        <h4 className="text-sm font-mono text-[var(--neon-green)] mb-3 flex items-center gap-2 font-bold">
          <Gamepad2 size={18} /> 은신처 서버실 잠입 작전
        </h4>
        <div className="text-[11px] text-gray-400 leading-relaxed mb-6 space-y-2">
          <p>
            <strong className="text-[var(--neon-green)]">목표:</strong> 순찰 중인 범죄 조직원(👤)의 <span className="text-yellow-400">손전등 불빛</span>을 피해 3개의 보안키(🔑)를 회수한 후 메인프레임(💾)에 접속하십시오.
          </p>
          <p>
            <strong className="text-red-500">경고:</strong> 조직원의 시야나 몸체에 1회라도 접촉하면 체력에 관계없이 즉시 사망 처리됩니다.
          </p>
          <p>
            조직원들은 맵의 구역별로 특정 궤도를 그리며 순찰합니다. 그들의 패턴과 시야각을 분석하고 사각지대를 이용해 파고드십시오.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="grid grid-cols-3 gap-2 w-32">
            <div />
            <button onClick={() => moveAgent(-1, 0)} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded active:bg-[var(--neon-green)] active:text-black transition-colors"><MoveUp size={18} /></button>
            <div />
            <button onClick={() => moveAgent(0, -1)} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded active:bg-[var(--neon-green)] active:text-black transition-colors"><MoveLeft size={18} /></button>
            <button onClick={() => moveAgent(1, 0)} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded active:bg-[var(--neon-green)] active:text-black transition-colors"><MoveDown size={18} /></button>
            <button onClick={() => moveAgent(0, 1)} className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded active:bg-[var(--neon-green)] active:text-black transition-colors"><MoveRight size={18} /></button>
          </div>
          <span className="text-[10px] text-gray-500 font-mono mt-2">키보드 방향키 또는 WASD 지원</span>
        </div>

        <button 
          onClick={handleStartInfiltration}
          className="w-full py-2 bg-gray-800 text-gray-300 font-mono text-xs hover:bg-gray-700 transition-colors border border-gray-700 flex items-center justify-center gap-2"
        >
          <RefreshCcw size={12} /> 작전 재시작
        </button>
      </div>
    </div>
  );

  return (
    <>
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
                <div className="text-sm text-gray-250 font-bold mb-2">사건 진원지 6곳의 GPS 좌표계 로그</div>
                <div className="text-[10px] text-gray-500 leading-relaxed space-y-2">
                  <p>가장 최근에 해킹 프로토콜 송출이 포착된 6개의 네트워크 진원지 좌표입니다.</p>
                  <p className="text-yellow-400 font-bold">⚠️ 경고: 해킹 전파 역추적 기술의 물리적 오차 범위가 10m이므로, 범인은 무조건 10m 밖에서 접속해야만 위치를 숨길 수 있습니다. (최소 버퍼존 10m 확정)</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowClueModal(false);
                }}
                className="w-full py-2.5 bg-[var(--neon-green)] text-black font-bold text-xs hover:shadow-[0_0_12px_var(--neon-green)]"
              >
                단서 마운트 및 분석 콘솔 전송
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAnalysisSuccess && mode === "ANALYSIS" && (
          <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 font-mono text-xs select-none">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full border border-[var(--neon-green)] bg-[#050505] p-8 rounded text-center shadow-[0_0_40px_rgba(57,255,20,0.15)]"
            >
              <Compass size={56} className="text-[var(--neon-green)] mx-auto mb-6 animate-pulse" />
              <h2 className="text-xl font-bold text-white mb-4 tracking-widest">TARGET LOCKED</h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                지리적 프로파일링 검증 완료.<br/>
                폐공장 뒷골목(C)은 모든 진원지로부터 완벽한 안전거리를 확보하면서도 활동 사정거리 내에 위치한 최적의 은신처입니다.<br/><br/>
                수색대를 은신처 서버실로 은밀히 파견합니다.
              </p>
              <button 
                onClick={handleStartInfiltration}
                className="w-full py-4 bg-[var(--neon-green)] text-black font-bold text-sm hover:shadow-[0_0_15px_var(--neon-green)] transition-all flex justify-center items-center gap-2"
              >
                잠입 작전 개시 <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBypassing && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 font-mono text-xs select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.08)_0%,transparent_70%)] animate-pulse" />
            <div className="max-w-md w-full border border-[var(--neon-green)] bg-black/90 p-6 rounded shadow-[0_0_30px_rgba(57,255,20,0.3)] border-double">
              <div className="flex items-center gap-2 mb-4 text-[var(--neon-green)] font-bold text-sm border-b border-[var(--neon-green)]/30 pb-2">
                <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full animate-ping" />
                <span>SERVER_BREACH IN PROGRESS</span>
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
        narrativeText={isResolved ? stage2Config.narrative.success : stage2Config.narrative.intro}
        visualization={getVisualization()}
        controls={
          isResolved ? (
            <div className="flex flex-col h-full justify-center items-end px-8">
              {isSuccessRead ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button 
                    onClick={() => {
                      unlockStage(3);
                      router.push("/stage3");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--neon-green)] text-black font-bold font-mono hover:shadow-[0_0_15px_var(--neon-green)] transition-all"
                  >
                    제3장 취조실로 이동 <ArrowRight size={20} />
                  </button>
                </motion.div>
              ) : (
                <p className="text-sm text-gray-500 font-mono animate-pulse">
                  로그 탈취 완료. 결과 확인 대기 중...
                </p>
              )}
            </div>
          ) : (
            !isDataAnalyzed ? (
              <div className="flex flex-col h-full justify-center items-center p-6 text-center font-mono">
                <p className="text-gray-500 text-sm">위치 데이터 로드 시 제어 인터페이스 활성화</p>
              </div>
            ) : mode === "ANALYSIS" ? renderAnalysisControls() : renderMinigameControls()
          )
        }
        onNarrativeComplete={handleNarrativeComplete}
      />
    </>
  );
}

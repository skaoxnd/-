"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShellLayout from "@/components/ShellLayout";
import { useGameProgress } from "@/components/GameProgressProvider";
import { ArrowRight, ShieldAlert, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function ProloguePage() {
  const router = useRouter();
  const { unlockStage } = useGameProgress();
  const [isIntroRead, setIsIntroRead] = useState(false);

  const narrativeText = `[ 국가 통합 데이터 센터 해킹 사건 ]\n\n비가 쏟아지던 3년 전의 밤. 스마트 시티의 심장부에서 1급 기밀 기술이 흔적도 없이 증발했습니다.\n범인은 방화벽을 우회했고, 훔친 데이터를 도심 곳곳의 무인 택배함을 통해 물리적인 USB 형태로 외부로 빼돌렸습니다.\n\n당시 수사 수뇌부는 수백 명의 인력을 투입해 현장의 CCTV와 목격자 진술에 의존한 1차원적인 수사를 펼쳤습니다. 하지만 그들은 스스로가 만들어낸 '인지적 편견'에 갇혀 엉뚱한 용의자들을 쫓았고, 사건은 결국 미제로 남았습니다.\n\n오늘 밤, 이 사건의 파일이 다시 열립니다.\n당신은 과거 경찰의 실패를 바로잡기 위해 비밀리에 소집된 'The Invisible Architect' (통계 프로파일링 수사팀)의 신임 요원입니다.\n\n이제 직감이 아닌 '차가운 데이터'로 숨겨진 진실을 밝혀내십시오.`;

  const visualization = (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black"></div>
      <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 1 }}
         className="z-10 text-[var(--neon-green)] font-mono text-center flex flex-col items-center"
      >
        <ShieldAlert size={64} className="mb-6 opacity-80" />
        <h1 className="text-4xl font-bold tracking-widest mb-4 drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">CASE FILE : 2023-F-994</h1>
        <p className="text-gray-400 mb-12 text-lg">STATUS: <span className="text-[var(--crimson-red)] font-bold animate-pulse">UNSOLVED (미제)</span></p>
        
        <div className="w-48 h-48 border border-gray-800 rounded-full flex flex-col items-center justify-center relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 border-2 border-gray-700 rounded-full animate-[spin_10s_linear_infinite] border-t-[var(--neon-green)]"></div>
          <div className="absolute inset-2 border border-gray-800 rounded-full animate-[spin_15s_linear_infinite_reverse] border-b-[var(--crimson-red)]"></div>
          <span className="text-3xl font-bold tracking-wider opacity-80">TOP<br/>SECRET</span>
        </div>
      </motion.div>
    </div>
  );

  const controls = (
    <div className="flex flex-col h-full justify-center items-center gap-6 px-8">
      {!isIntroRead ? (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-red-500/30 bg-red-950/10 rounded w-full text-center">
          <Lock className="text-[var(--crimson-red)] animate-pulse mb-3" size={24} />
          <p className="text-[var(--crimson-red)] font-mono text-sm mb-2">
            🔒 [보안 프로토콜: 사건 파일 전송 중]
          </p>
          <p className="text-xs text-gray-500 font-mono leading-relaxed">
            수사 개시 권한을 승인하려면<br />먼저 좌측의 기밀 파일 로그를 읽어주십시오.
          </p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-black/50 p-6 border border-gray-800 w-full rounded text-center">
          <p className="text-gray-400 font-mono text-sm mb-6 leading-relaxed">
            과거의 실패를 바로잡고 통계 수사를 개시하려면<br/>아래 승인 버튼을 누르십시오.
          </p>
          <button 
            onClick={() => {
              unlockStage(1);
              router.push("/stage1");
            }}
            className="flex items-center justify-center gap-2 w-full px-8 py-4 bg-[var(--neon-green)] text-black font-bold font-mono text-lg hover:shadow-[0_0_20px_var(--neon-green)] hover:scale-[1.02] transition-all"
          >
            첫 번째 수사 착수 <ArrowRight size={24} />
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
      onNarrativeComplete={() => setIsIntroRead(true)}
    />
  );
}

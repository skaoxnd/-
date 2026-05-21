"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const getStageNum = (path: string) => {
  if (path === "/prologue") return 0;
  if (path === "/stage1") return 1;
  if (path === "/stage2") return 2;
  if (path === "/stage3") return 3;
  if (path === "/stage4") return 4;
  if (path === "/stage5") return 5;
  if (path === "/epilogue") return 6;
  return -1; // root or unknown
};

const getPathFromStage = (stage: number) => {
  if (stage === 0) return "/prologue";
  if (stage === 6) return "/epilogue";
  if (stage >= 1 && stage <= 5) return `/stage${stage}`;
  return "/";
};

type ProgressContextType = {
  deviceId: string;
  maxUnlockedStage: number;
  unlockStage: (stage: number) => void;
  resetProgress: () => void;
};

export const GameProgressContext = createContext<ProgressContextType | null>(null);

export function GameProgressProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState<string>("");
  const [maxUnlockedStage, setMaxUnlockedStage] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let storedId = localStorage.getItem("agent_device_id");
    if (!storedId) {
      storedId = "AGENT-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem("agent_device_id", storedId);
    }
    setDeviceId(storedId);

    const storedStage = localStorage.getItem("max_unlocked_stage");
    if (storedStage) {
      setMaxUnlockedStage(parseInt(storedStage, 10));
    } else {
      localStorage.setItem("max_unlocked_stage", "0");
      setMaxUnlockedStage(0);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const requiredStage = getStageNum(pathname);
    if (requiredStage > maxUnlockedStage) {
      // Security Guard: Redirect back to max unlocked stage if attempting bypass
      router.replace(getPathFromStage(maxUnlockedStage));
    }
  }, [pathname, isLoaded, maxUnlockedStage, router]);

  const unlockStage = (stage: number) => {
    if (stage > maxUnlockedStage) {
      setMaxUnlockedStage(stage);
      localStorage.setItem("max_unlocked_stage", stage.toString());
    }
  };

  const resetProgress = () => {
    setMaxUnlockedStage(0);
    localStorage.setItem("max_unlocked_stage", "0");
    router.push("/prologue");
  };

  // Prevent rendering protected content before auth/progress is loaded
  if (!isLoaded && getStageNum(pathname) >= 0) {
    return <div className="h-screen w-screen bg-black flex items-center justify-center text-[var(--neon-green)] font-mono animate-pulse">LOADING SYSTEM...</div>;
  }

  return (
    <GameProgressContext.Provider value={{ deviceId, maxUnlockedStage, unlockStage, resetProgress }}>
      {children}
    </GameProgressContext.Provider>
  );
}

export const useGameProgress = () => {
  const ctx = useContext(GameProgressContext);
  if (!ctx) throw new Error("Must be used within GameProgressProvider");
  return ctx;
};

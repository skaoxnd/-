"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";

interface NarrativeBoxProps {
  text: string;
  onComplete?: () => void;
}

export default function NarrativeBox({ text, onComplete }: NarrativeBoxProps) {
  // Split narrative by \n\n to create pages
  const pages = text.split("\n\n").filter(p => p.trim() !== "");
  
  const [currentPage, setCurrentPage] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Reset entirely when the root text changes
  useEffect(() => {
    setCurrentPage(0);
    setDisplayedText("");
    setCharIndex(0);
    setHasCompleted(false);
  }, [text]);

  // Handle typing effect for the current page
  useEffect(() => {
    const currentText = pages[currentPage];
    if (!currentText) return;

    if (charIndex < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + currentText[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 20); // Typing speed
      return () => clearTimeout(timer);
    } else {
      if (currentPage === pages.length - 1 && !hasCompleted) {
        setHasCompleted(true);
        if (onComplete) {
          onComplete();
        }
      }
    }
  }, [charIndex, currentPage, pages, onComplete, hasCompleted]);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      setDisplayedText("");
      setCharIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setDisplayedText("");
      setCharIndex(0);
    }
  };

  const handleSkip = () => {
    if (charIndex < pages[currentPage].length) {
      setDisplayedText(pages[currentPage]);
      setCharIndex(pages[currentPage].length);
    }
  };

  const isTyping = charIndex < (pages[currentPage]?.length || 0);

  return (
    <div className="h-full flex flex-col p-6 bg-transparent relative">
      <h2 className="text-[var(--neon-green)] font-mono text-xs uppercase tracking-widest mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--neon-green)] rounded-full animate-pulse"></span>
          SYSTEM_NARRATIVE_LOG
        </div>
        <div className="text-gray-500">
          [{currentPage + 1} / {pages.length}]
        </div>
      </h2>
      
      <div 
        className="flex-1 overflow-y-auto font-sans text-[var(--neon-green)] text-lg leading-relaxed whitespace-pre-wrap custom-scrollbar" 
        style={{ textShadow: '0 0 5px rgba(57,255,20,0.3)' }}
        onClick={() => isTyping ? handleSkip() : handleNext()}
      >
        {displayedText}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-5 bg-[var(--neon-green)] ml-1 align-middle shadow-[0_0_8px_var(--neon-green)]"
        />
      </div>

      {/* Dialog Navigation */}
      <div className="mt-4 flex justify-between items-center border-t border-[#333] pt-4">
        <button 
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="flex items-center gap-1 text-gray-500 hover:text-[var(--neon-green)] disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
        >
          <ChevronLeft size={20} /> <span className="font-mono text-sm">이전 내용</span>
        </button>

        {isTyping ? (
          <button 
            onClick={handleSkip}
            className="flex items-center gap-1 font-mono text-sm text-gray-400 hover:text-white transition-colors"
          >
            스킵 <SkipForward size={16} />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            disabled={currentPage === pages.length - 1}
            className={`flex items-center gap-1 transition-colors ${currentPage === pages.length - 1 ? 'text-gray-600 opacity-50' : 'text-[var(--neon-green)] hover:text-[var(--foreground)]'}`}
          >
            <span className="font-mono text-sm">다음 내용</span> <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

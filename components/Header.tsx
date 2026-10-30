"use client";

import React from "react";
import { Sparkles, FileText, History, RotateCcw, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onReset: () => void;
  isGenerated: boolean;
}

export function Header({
  historyCount,
  onOpenHistory,
  onReset,
  isGenerated,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                스토리뱅크 <span className="text-indigo-600 font-extrabold">AI자소서 메이커</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              지원 정보와 STAR 경험으로 1분 만에 완성하는 맞춤형 자기소개서
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isGenerated && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="새로운 자소서 작성"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">새로 작성</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>히스토리</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-600 text-white text-[11px] font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

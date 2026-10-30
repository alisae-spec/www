"use client";

import React, { useState } from "react";
import {
  GeneratedSection,
} from "@/types/cover-letter";
import {
  calculateCharCounts,
  exportToWord,
  exportToText,
  exportToPdfNative,
} from "@/lib/export";
import {
  FileText,
  Download,
  Copy,
  Check,
  RotateCcw,
  PlusCircle,
  MinusCircle,
  Sparkles,
  Heading,
  Printer,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Sliders,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

interface Step5Props {
  company: string;
  jobTitle: string;
  careerLevel: string;
  targetCharCount: number;
  sections: GeneratedSection[];
  overallFeedback?: string;
  onUpdateSection: (index: number, updated: Partial<GeneratedSection>) => void;
  onRegenerateAll: () => void;
}

export function Step5ResultEditor({
  company,
  jobTitle,
  careerLevel,
  targetCharCount,
  sections,
  overallFeedback,
  onUpdateSection,
  onRegenerateAll,
}: Step5Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [adjustingIndex, setAdjustingIndex] = useState<number | null>(null);
  const [adjustAction, setAdjustAction] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!sections || sections.length === 0) {
    return null;
  }

  const currentSection = sections[activeTab] || sections[0];
  const charStats = calculateCharCounts(currentSection.content);
  const targetCount = currentSection.targetCharCount || targetCharCount;
  const ratio = Math.round((charStats.withSpaces / targetCount) * 100);

  // Copy single section
  const handleCopySection = (index: number) => {
    const sec = sections[index];
    const text = `${sec.headline ? sec.headline + "\n\n" : ""}${sec.content}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Copy all sections
  const handleCopyAll = () => {
    let fullText = `[자기소개서] ${company} - ${jobTitle}\n\n`;
    sections.forEach((sec, idx) => {
      fullText += `문항 ${idx + 1}. ${sec.title}\n`;
      if (sec.headline) fullText += `${sec.headline}\n`;
      fullText += `${sec.content}\n\n`;
    });
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Export Word
  const handleWordExport = async () => {
    try {
      setIsExportingWord(true);
      await exportToWord({
        company,
        jobTitle,
        careerLevel,
        targetCharCount,
        sections,
      });
    } catch (err) {
      console.error(err);
      alert("Word 파일 생성 중 오류가 발생했습니다.");
    } finally {
      setIsExportingWord(false);
    }
  };

  // Export Text
  const handleTextExport = () => {
    exportToText({
      company,
      jobTitle,
      careerLevel,
      targetCharCount,
      sections,
    });
  };

  // AI Adjust Action
  const handleAiAdjust = async (
    action: "expand" | "shorten" | "rewrite" | "generate_headline"
  ) => {
    try {
      setAdjustingIndex(activeTab);
      setAdjustAction(action);
      setActionSuccessMessage(null);

      const res = await fetch("/api/cover-letter/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          company,
          jobTitle,
          questionTitle: currentSection.title,
          currentHeadline: currentSection.headline,
          currentContent: currentSection.content,
          targetCharCount: targetCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "수정 실패");
      }

      onUpdateSection(activeTab, {
        headline: data.headline,
        content: data.content,
      });

      const actionLabels: Record<string, string> = {
        expand: "분량을 늘렸습니다 (+15%)",
        shorten: "핵심 위주로 분량을 줄였습니다 (-15%)",
        rewrite: "새로운 어조로 문항을 다시 썼습니다",
        generate_headline: "임팩트 있는 소제목을 생성했습니다",
      };

      setActionSuccessMessage(actionLabels[action] || "완료되었습니다.");
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "문항 조정 중 오류가 발생했습니다.");
    } finally {
      setAdjustingIndex(null);
      setAdjustAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden space-y-0">
      {/* Top Banner with overall company and resume stats */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 no-print">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                ✨ Gemini 3.8 Flash 자소서 생성 완료
              </span>
              <span className="text-xs text-indigo-200 font-medium">
                총 {sections.length}개 문항
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {company} · {jobTitle}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 mt-1">
              {careerLevel} 지원 · 문항별 목표 글자 수: 약 {targetCharCount}자
            </p>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleWordExport}
              disabled={isExportingWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer"
            >
              {isExportingWord ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Word (.docx) 다운로드</span>
            </button>

            <button
              type="button"
              onClick={exportToPdfNative}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
              title="깔끔한 이력서 서식으로 즉시 PDF 저장 또는 인쇄"
            >
              <Printer className="w-4 h-4" />
              <span>PDF / 인쇄</span>
            </button>

            <button
              type="button"
              onClick={handleTextExport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>.txt</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-300">전체 복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>전체 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {overallFeedback && (
          <div className="mt-4 pt-3 border-t border-indigo-700/50 flex items-start gap-2 text-xs text-indigo-100/90 bg-indigo-950/40 p-3 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200 mr-1.5">AI 평가 총평:</span>
              <span>{overallFeedback}</span>
            </div>
          </div>
        )}
      </div>

      {/* Question Tabs Navigation */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar no-print">
        {sections.map((sec, idx) => {
          const isActive = idx === activeTab;
          const stats = calculateCharCounts(sec.content);
          return (
            <button
              key={sec.id || idx}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "border-indigo-600 text-indigo-600 bg-white rounded-t-xl shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {idx + 1}
              </span>
              <span className="max-w-[140px] sm:max-w-[200px] truncate">
                {sec.title}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                ({stats.withSpaces}자)
              </span>
            </button>
          );
        })}
      </div>

      {/* Editor Body */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Question Header & Headline */}
        <div className="space-y-3 pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg">
                문항 {activeTab + 1}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {currentSection.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopySection(activeTab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {copiedIndex === activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>문항 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Headline input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Heading className="w-3.5 h-3.5 text-indigo-500" />
                소제목 (헤드라인)
              </span>
              <button
                type="button"
                onClick={() => handleAiAdjust("generate_headline")}
                disabled={adjustingIndex !== null}
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                소제목 AI 재추천
              </button>
            </label>
            <input
              type="text"
              value={currentSection.headline}
              onChange={(e) =>
                onUpdateSection(activeTab, { headline: e.target.value })
              }
              placeholder="[임팩트 있는 성과 중심 소제목을 입력하세요]"
              className="w-full px-3.5 py-2 text-sm font-bold text-indigo-900 bg-indigo-50/40 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Content Textarea with Live Char Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">자기소개서 본문 (자유롭게 직접 수정 가능)</span>
            {actionSuccessMessage && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {actionSuccessMessage}
              </span>
            )}
          </div>

          <div className="relative">
            {adjustingIndex === activeTab && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-2 z-10">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                <span className="text-xs font-bold text-slate-800">
                  {adjustAction === "expand" && "Gemini가 디테일을 보강하여 분량을 늘리는 중..."}
                  {adjustAction === "shorten" && "Gemini가 핵심 위주로 분량을 줄이는 중..."}
                  {adjustAction === "rewrite" && "Gemini가 문장을 새롭게 재작성하는 중..."}
                  {adjustAction === "generate_headline" && "소제목을 다듬는 중..."}
                </span>
              </div>
            )}

            <textarea
              rows={12}
              value={currentSection.content}
              onChange={(e) =>
                onUpdateSection(activeTab, { content: e.target.value })
              }
              className="w-full p-4 text-sm leading-relaxed bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-sans"
            />
          </div>

          {/* Real-time Character Counter Bar (PRD Requirement 5) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-800 text-sm">
                  📊 글자 수:{" "}
                  <span className="text-indigo-600">
                    {charStats.withSpaces.toLocaleString()}자
                  </span>{" "}
                  <span className="text-slate-500 font-medium">
                    (공백 포함)
                  </span>
                </span>
                <span className="text-slate-400">|</span>
                <span className="font-semibold text-slate-600">
                  {charStats.withoutSpaces.toLocaleString()}자{" "}
                  <span className="text-slate-400 font-normal">
                    (공백 제외)
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  목표 {targetCount}자 대비:
                </span>
                <span
                  className={`font-bold ${
                    ratio >= 90 && ratio <= 110
                      ? "text-emerald-600"
                      : ratio < 90
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {ratio}% ({charStats.withSpaces > targetCount ? "+" : ""}
                  {charStats.withSpaces - targetCount}자)
                </span>
              </div>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  ratio >= 90 && ratio <= 110
                    ? "bg-emerald-500"
                    : ratio < 90
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(ratio, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI Action Toolbar for this Question (PRD Requirement 5) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>AI 맞춤 도구 (클릭 한 번으로 글자 수와 문체 조절)</span>
            <span>Gemini 3.8 Flash 엔진</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => handleAiAdjust("rewrite")}
              disabled={adjustingIndex !== null}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span>🔄 다시 쓰기</span>
            </button>

            <button
              type="button"
              onClick={() => handleAiAdjust("expand")}
              disabled={adjustingIndex !== null}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>➕ 길게 늘리기 (+15%)</span>
            </button>

            <button
              type="button"
              onClick={() => handleAiAdjust("shorten")}
              disabled={adjustingIndex !== null}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <MinusCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>➖ 짧게 줄이기 (-15%)</span>
            </button>

            <button
              type="button"
              onClick={() => handleAiAdjust("generate_headline")}
              disabled={adjustingIndex !== null}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>🎯 소제목 재생성</span>
            </button>
          </div>
        </div>

        {/* Question Pager */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 no-print">
          <button
            type="button"
            disabled={activeTab === 0}
            onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 문항</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {activeTab + 1} / {sections.length}
          </span>

          <button
            type="button"
            disabled={activeTab === sections.length - 1}
            onClick={() =>
              setActiveTab((prev) => Math.min(sections.length - 1, prev + 1))
            }
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>다음 문항</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

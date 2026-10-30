"use client";

import React from "react";
import { GeneratedSection } from "@/types/cover-letter";
import { calculateCharCounts } from "@/lib/export";

interface PrintViewProps {
  company: string;
  jobTitle: string;
  careerLevel: string;
  sections: GeneratedSection[];
}

export function PrintView({
  company,
  jobTitle,
  careerLevel,
  sections,
}: PrintViewProps) {
  if (!sections || sections.length === 0) return null;

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="print-only max-w-4xl mx-auto p-8 text-black bg-white font-sans">
      {/* Header */}
      <div className="text-center pb-6 border-b-2 border-slate-900 mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          [자기소개서] {company} - {jobTitle}
        </h1>
        <div className="flex justify-center items-center gap-4 text-xs text-slate-600">
          <span>지원 구분: {careerLevel}</span>
          <span>•</span>
          <span>작성 일자: {today}</span>
          <span>•</span>
          <span>작성 도구: 스토리뱅크 AI자소서 메이커</span>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((sec, idx) => {
          const stats = calculateCharCounts(sec.content);
          return (
            <div key={sec.id || idx} className="space-y-2 pb-5 border-b border-slate-200">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  {idx + 1}. {sec.title}
                </h2>
                <span className="text-[11px] text-slate-400">
                  (공백포함 {stats.withSpaces}자 / 공백제외 {stats.withoutSpaces}자)
                </span>
              </div>

              {sec.headline && (
                <div className="text-sm font-bold text-blue-900 mb-1">
                  {sec.headline}
                </div>
              )}

              <p className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap text-justify">
                {sec.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

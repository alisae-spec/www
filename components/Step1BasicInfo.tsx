"use client";

import React from "react";
import { Building2, Briefcase, UserCheck, Sparkles } from "lucide-react";
import { SAMPLE_PRESETS, SamplePreset } from "@/lib/sample-data";

interface Step1Props {
  company: string;
  jobTitle: string;
  careerLevel: string;
  onChangeCompany: (val: string) => void;
  onChangeJobTitle: (val: string) => void;
  onChangeCareerLevel: (val: string) => void;
  onApplyPreset: (preset: SamplePreset) => void;
}

export function Step1BasicInfo({
  company,
  jobTitle,
  careerLevel,
  onChangeCompany,
  onChangeJobTitle,
  onChangeCareerLevel,
  onApplyPreset,
}: Step1Props) {
  const careerLevels = ["신입", "경력", "인턴/체험형", "무관"];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              지원 기본 정보 입력
            </h2>
            <p className="text-xs text-slate-500">
              지원하려는 기업명과 목표 직무를 입력해주세요.
            </p>
          </div>
        </div>

        {/* Quick sample loader */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            예시 불러오기:
          </span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
            >
              {preset.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            지원 회사명 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={company}
              onChange={(e) => onChangeCompany(e.target.value)}
              placeholder="예: 카카오, 현대자동차, 삼성전자"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Job Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            목표 직무 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => onChangeJobTitle(e.target.value)}
              placeholder="예: 프론트엔드 개발자, 서비스 기획(PO)"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Career Level */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
            지원 구분
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {careerLevels.map((lvl) => {
              const isSelected = careerLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onChangeCareerLevel(lvl)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

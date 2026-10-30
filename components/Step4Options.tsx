"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sliders,
  Gauge,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { QuestionPreset, ToneType } from "@/types/cover-letter";

interface Step4Props {
  questions: QuestionPreset[];
  onToggleQuestion: (id: string) => void;
  onAddQuestion: (title: string, description: string) => void;
  onRemoveQuestion: (id: string) => void;
  targetCharCount: number;
  onChangeTargetCharCount: (count: number) => void;
  tone: ToneType;
  onChangeTone: (t: ToneType) => void;
  canGenerate: boolean;
  missingRequirements: string[];
  isGenerating: boolean;
  onGenerate: () => void;
}

export function Step4Options({
  questions,
  onToggleQuestion,
  onAddQuestion,
  onRemoveQuestion,
  targetCharCount,
  onChangeTargetCharCount,
  tone,
  onChangeTone,
  canGenerate,
  missingRequirements,
  isGenerating,
  onGenerate,
}: Step4Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const charOptions = [500, 700, 800, 1000, 1200, 1500];

  const toneOptions: Array<{ id: ToneType; title: string; desc: string }> = [
    {
      id: "confident",
      title: "자신감 & 성과 중심",
      desc: "주도적 성과와 전문성을 부각시키는 설득력 높은 톤",
    },
    {
      id: "logical",
      title: "논리적 & 분석적",
      desc: "원인 분석, 문제 해결 인과관계와 데이터를 강조하는 톤",
    },
    {
      id: "enthusiastic",
      title: "열정적 & 진취적",
      desc: "직무에 대한 강한 애착과 빠른 실행력을 보여주는 톤",
    },
    {
      id: "sincere",
      title: "성실 & 진정성",
      desc: "조직 융화력과 책임감, 꾸준한 성장을 신뢰감 있게 전달하는 톤",
    },
  ];

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddQuestion(newTitle.trim(), newDesc.trim() || "사용자 맞춤 작성 문항");
    setNewTitle("");
    setNewDesc("");
    setShowAddModal(false);
  };

  const selectedCount = questions.filter((q) => q.isSelected).length;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
          4
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            자소서 문항 및 작성 옵션 선택
          </h2>
          <p className="text-xs text-slate-500">
            작성할 문항 항목과 목표 글자 수, 문체(어조)를 선택하세요.
          </p>
        </div>
      </div>

      {/* Question Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            생성할 자소서 문항 선택 ({selectedCount}개 선택됨)
          </label>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            직접 문항 추가
          </button>
        </div>

        {/* Question cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {questions.map((q) => (
            <div
              key={q.id}
              onClick={() => onToggleQuestion(q.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                q.isSelected
                  ? "bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/10 shadow-2xs"
                  : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="mt-0.5 text-indigo-600">
                {q.isSelected ? (
                  <CheckSquare className="w-5 h-5 fill-indigo-600 text-white" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs sm:text-sm font-bold ${
                      q.isSelected ? "text-indigo-950" : "text-slate-700"
                    }`}
                  >
                    {q.title}
                  </div>
                  {q.id.startsWith("custom_") && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveQuestion(q.id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {q.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding custom question */}
        {showAddModal && (
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800">
              사용자 정의 문항 추가
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="예: 공동의 목표를 달성하기 위해 협력했던 경험"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="문항에 대한 간단한 설명 또는 강조할 포인트"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddCustom}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                문항 추가
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Target Char Count & Tone Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
        {/* Target Char Count */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-600" />
              문항당 목표 글자 수 (공백 포함)
            </span>
            <span className="text-xs text-indigo-600 font-extrabold">
              약 {targetCharCount}자
            </span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {charOptions.map((count) => {
              const isSelected = targetCharCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChangeTargetCharCount(count)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {count}자
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400">
            기업 채용 사이트 글자 수 제한 기준에 맞추어 자유롭게 선택하세요. (생성 후에도 언제든 글자 수 늘리기/줄이기가 가능합니다)
          </p>
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-600" />
            자소서 어조 및 문체 스타일
          </label>
          <div className="grid grid-cols-2 gap-2">
            {toneOptions.map((opt) => {
              const isSelected = tone === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeTone(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/10 text-indigo-950 shadow-2xs"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold">{opt.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation Message if not ready */}
      {!canGenerate && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">생성 전 입력 확인이 필요합니다:</div>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-700">
              {missingRequirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Big Action CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!canGenerate || isGenerating}
          onClick={onGenerate}
          className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg ${
            canGenerate && !isGenerating
              ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-300 hover:shadow-indigo-400 active:scale-[0.99]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Gemini 3.8 Flash가 직무 맞춤 자소서를 작성하는 중입니다...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>✨ Gemini 3.8-Flash로 맞춤 자기소개서 1분 만에 생성</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

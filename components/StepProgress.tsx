"use client";

import React from "react";
import { Check, Building2, Briefcase, FileSearch, Sparkles, Edit3 } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  completedSteps: number[];
  onSelectStep?: (step: number) => void;
}

export function StepProgress({
  currentStep,
  completedSteps,
  onSelectStep,
}: StepProgressProps) {
  const steps = [
    { number: 1, title: "기본 정보", icon: Building2 },
    { number: 2, title: "채용공고", icon: FileSearch },
    { number: 3, title: "내 경험(STAR)", icon: Briefcase },
    { number: 4, title: "문항 선택", icon: Sparkles },
    { number: 5, title: "결과 및 편집", icon: Edit3 },
  ];

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs no-print">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />

        {steps.map((step) => {
          const isDone = completedSteps.includes(step.number);
          const isActive = currentStep === step.number;
          const Icon = step.icon;

          return (
            <div
              key={step.number}
              onClick={() => onSelectStep && onSelectStep(step.number)}
              className={`relative z-10 flex flex-col items-center group cursor-pointer transition-transform ${
                isActive ? "scale-105" : ""
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${
                  isDone
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : isActive
                    ? "bg-white text-indigo-600 border-2 border-indigo-600 shadow-md ring-4 ring-indigo-50"
                    : "bg-slate-100 text-slate-400 border border-slate-200 group-hover:bg-slate-200"
                }`}
              >
                {isDone ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <span
                className={`mt-1.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? "text-indigo-600 font-bold"
                    : isDone
                    ? "text-slate-800"
                    : "text-slate-400"
                }`}
              >
                <span className="hidden sm:inline">Step {step.number}. </span>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

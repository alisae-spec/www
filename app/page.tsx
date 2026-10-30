"use client";

import React, { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { StepProgress } from "@/components/StepProgress";
import { Step1BasicInfo } from "@/components/Step1BasicInfo";
import { Step2JobPosting } from "@/components/Step2JobPosting";
import { Step3Experience } from "@/components/Step3Experience";
import { Step4Options } from "@/components/Step4Options";
import { Step5ResultEditor } from "@/components/Step5ResultEditor";
import { HistoryModal } from "@/components/HistoryModal";
import { PrintView } from "@/components/PrintView";
import { DEFAULT_QUESTIONS, SamplePreset, SAMPLE_PRESETS } from "@/lib/sample-data";
import {
  StarExperience,
  QuestionPreset,
  GeneratedSection,
  CoverLetterHistoryItem,
  ExperienceInputMode,
  JobPostingInputMode,
  ToneType,
} from "@/types/cover-letter";
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Zap, ArrowDown } from "lucide-react";

const HISTORY_STORAGE_KEY = "storybank_cover_letters_history_v1";

export default function Home() {
  // Step 1: Basic Info
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [careerLevel, setCareerLevel] = useState("신입");

  // Step 2: Job Posting
  const [jobPosting, setJobPosting] = useState("");
  const [jobPostingMode, setJobPostingMode] = useState<JobPostingInputMode>("text");

  // Step 3: Experience
  const [experienceType, setExperienceType] = useState<ExperienceInputMode>("star");
  const [starExperience, setStarExperience] = useState<StarExperience>({
    situation: "",
    task: "",
    action: "",
    result: "",
  });
  const [experienceDoc, setExperienceDoc] = useState("");

  // Step 4: Questions & Options
  const [questions, setQuestions] = useState<QuestionPreset[]>(DEFAULT_QUESTIONS);
  const [targetCharCount, setTargetCharCount] = useState<number>(700);
  const [tone, setTone] = useState<ToneType>("confident");

  // Generation & Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<GeneratedSection[]>([]);
  const [overallFeedback, setOverallFeedback] = useState<string>("");

  // History & Modal
  const [history, setHistory] = useState<CoverLetterHistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 20);
        }
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }
    return [];
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Active step tracker
  const [currentStep, setCurrentStep] = useState<number>(1);
  const resultRef = useRef<HTMLDivElement>(null);

  // Save history helper
  const saveToHistory = (newEntry: CoverLetterHistoryItem) => {
    try {
      setHistory((prev) => {
        const updated = [newEntry, ...prev.filter((item) => item.id !== newEntry.id)].slice(0, 20);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }
  };

  // Delete item from history
  const handleDeleteHistoryItem = (id: string) => {
    try {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error("Failed to delete history item:", e);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      setHistory([]);
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  };

  // Load an existing history item
  const handleLoadHistoryItem = (item: CoverLetterHistoryItem) => {
    setCompany(item.company);
    setJobTitle(item.jobTitle);
    setCareerLevel(item.careerLevel || "신입");
    setTargetCharCount(item.targetCharCount || 700);
    setTone((item.tone as ToneType) || "confident");
    setGeneratedSections(item.sections);
    setCurrentStep(5);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Apply Sample Preset
  const handleApplyPreset = (preset: SamplePreset) => {
    setCompany(preset.company);
    setJobTitle(preset.jobTitle);
    setCareerLevel(preset.careerLevel);
    setJobPosting(preset.jobPosting);
    setJobPostingMode("text");
    setExperienceType("star");
    setStarExperience({ ...preset.starExperience });
  };

  // Validation calculation
  const hasBasicInfo = company.trim().length > 0 && jobTitle.trim().length > 0;
  const hasJobPosting = jobPosting.trim().length > 0;
  const hasStarInput =
    starExperience.situation.trim().length > 0 ||
    starExperience.task.trim().length > 0 ||
    starExperience.action.trim().length > 0 ||
    starExperience.result.trim().length > 0;
  const hasDocInput = experienceDoc.trim().length > 0;
  const hasExperience =
    experienceType === "star" ? hasStarInput || hasDocInput : hasDocInput || hasStarInput;
  const selectedQuestions = questions.filter((q) => q.isSelected);
  const hasQuestions = selectedQuestions.length > 0;

  const canGenerate = hasBasicInfo && hasJobPosting && hasExperience && hasQuestions;

  const missingRequirements: string[] = [];
  if (!hasBasicInfo) missingRequirements.push("Step 1: 지원 회사명과 직무를 입력해주세요.");
  if (!hasJobPosting) missingRequirements.push("Step 2: 채용공고 내용을 입력하거나 파일을 업로드해주세요.");
  if (!hasExperience) missingRequirements.push("Step 3: 내 경험(STAR 직접 입력 또는 경험 파일 업로드)을 입력해주세요.");
  if (!hasQuestions) missingRequirements.push("Step 4: 생성할 자소서 문항을 1개 이상 선택해주세요.");

  // Completed steps calculation for step bar
  const completedSteps: number[] = [];
  if (hasBasicInfo) completedSteps.push(1);
  if (hasJobPosting) completedSteps.push(2);
  if (hasExperience) completedSteps.push(3);
  if (hasQuestions) completedSteps.push(4);
  if (generatedSections.length > 0) completedSteps.push(5);

  // Question toggle & add/remove handlers
  const handleToggleQuestion = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isSelected: !q.isSelected } : q))
    );
  };

  const handleAddQuestion = (title: string, description: string) => {
    const newId = `custom_${Date.now()}`;
    setQuestions((prev) => [
      ...prev,
      { id: newId, title, description, isSelected: true },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleUpdateSection = (index: number, updated: Partial<GeneratedSection>) => {
    setGeneratedSections((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  // Trigger Generation
  const handleGenerate = async () => {
    if (!canGenerate || isGenerating) return;

    try {
      setIsGenerating(true);
      setCurrentStep(5);

      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          jobTitle,
          careerLevel,
          jobPosting,
          experienceType,
          starExperience: experienceType === "star" ? starExperience : undefined,
          experienceDoc: experienceType === "file" ? experienceDoc : undefined,
          questions: selectedQuestions.map((q) => ({ id: q.id, title: q.title })),
          targetCharCount,
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "자소서 생성 실패");
      }

      const formattedSections: GeneratedSection[] = data.items.map(
        (item: any, idx: number) => ({
          id: `sec_${Date.now()}_${idx}`,
          questionId: item.questionId,
          title: item.questionTitle,
          headline: item.headline,
          content: item.content,
          targetCharCount,
        })
      );

      setGeneratedSections(formattedSections);
      setOverallFeedback(data.overallFeedback || "");

      // Auto save to history (LocalStorage)
      const newHistoryItem: CoverLetterHistoryItem = {
        id: `cl_${Date.now()}`,
        createdAt: new Date().toISOString(),
        company,
        jobTitle,
        careerLevel,
        targetCharCount,
        tone,
        sections: formattedSections,
      };
      saveToHistory(newHistoryItem);

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      alert(err.message || "자기소개서 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset all
  const handleReset = () => {
    if (confirm("새로운 자기소개서를 작성하시겠습니까? 현재 작성 중인 입력폼이 초기화됩니다.")) {
      setCompany("");
      setJobTitle("");
      setCareerLevel("신입");
      setJobPosting("");
      setExperienceType("star");
      setStarExperience({ situation: "", task: "", action: "", result: "" });
      setExperienceDoc("");
      setGeneratedSections([]);
      setOverallFeedback("");
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-800">
      {/* Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        isGenerated={generatedSections.length > 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 pt-2 pb-1 no-print">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin-slow" />
            <span>AI 기반 STAR 스토리 자기소개서 메이커</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            합격하는 자기소개서, <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              STAR 경험 스토리를 담아 1분 만에
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            채용공고의 핵심 역량 키워드와 본인의 STAR 경험을 완벽 매칭하여 맞춤형 자소서를 작성하고 Word 및 PDF로 즉시 다운로드하세요.
          </p>

          {/* Quick preset trigger pills */}
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">🚀 1초 만에 테스트해보기:</span>
            {SAMPLE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer"
              >
                {p.badge} ({p.company})
              </button>
            ))}
          </div>
        </div>

        {/* Step Progress Bar */}
        <StepProgress
          currentStep={currentStep}
          completedSteps={completedSteps}
          onSelectStep={(step) => setCurrentStep(step)}
        />

        {/* Form Steps */}
        <div className="space-y-6 no-print">
          {/* Step 1: Basic Info */}
          <Step1BasicInfo
            company={company}
            jobTitle={jobTitle}
            careerLevel={careerLevel}
            onChangeCompany={(val) => {
              setCompany(val);
              setCurrentStep(1);
            }}
            onChangeJobTitle={(val) => {
              setJobTitle(val);
              setCurrentStep(1);
            }}
            onChangeCareerLevel={setCareerLevel}
            onApplyPreset={handleApplyPreset}
          />

          {/* Step 2: Job Posting */}
          <Step2JobPosting
            jobPosting={jobPosting}
            onChangeJobPosting={(val) => {
              setJobPosting(val);
              setCurrentStep(2);
            }}
            inputMode={jobPostingMode}
            onChangeInputMode={setJobPostingMode}
          />

          {/* Step 3: Experience (STAR / File) */}
          <Step3Experience
            experienceType={experienceType}
            onChangeExperienceType={(mode) => {
              setExperienceType(mode);
              setCurrentStep(3);
            }}
            starExperience={starExperience}
            onChangeStar={(field, val) => {
              setStarExperience((prev) => ({ ...prev, [field]: val }));
              setCurrentStep(3);
            }}
            experienceDoc={experienceDoc}
            onChangeExperienceDoc={(val) => {
              setExperienceDoc(val);
              setCurrentStep(3);
            }}
            onFillSampleStar={() => {
              setStarExperience({ ...SAMPLE_PRESETS[0].starExperience });
            }}
          />

          {/* Step 4: Questions & Options */}
          <Step4Options
            questions={questions}
            onToggleQuestion={handleToggleQuestion}
            onAddQuestion={handleAddQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            targetCharCount={targetCharCount}
            onChangeTargetCharCount={setTargetCharCount}
            tone={tone}
            onChangeTone={setTone}
            canGenerate={canGenerate}
            missingRequirements={missingRequirements}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>

        {/* Step 5: Result & Editor */}
        <div ref={resultRef} className="pt-2">
          {generatedSections.length > 0 && (
            <Step5ResultEditor
              company={company}
              jobTitle={jobTitle}
              careerLevel={careerLevel}
              targetCharCount={targetCharCount}
              sections={generatedSections}
              overallFeedback={overallFeedback}
              onUpdateSection={handleUpdateSection}
              onRegenerateAll={handleGenerate}
            />
          )}
        </div>

        {/* Printable View (Visible only during window.print) */}
        <PrintView
          company={company}
          jobTitle={jobTitle}
          careerLevel={careerLevel}
          sections={generatedSections}
        />
      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadItem={handleLoadHistoryItem}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 no-print text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} 스토리뱅크 AI자소서 메이커 · Powered by Gemini 3.8 Flash
          </span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>🔒 브라우저 로컬 저장으로 개인정보 보호</span>
            <span>⚡ 초고속 실시간 생성</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

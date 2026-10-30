"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  FileText,
  X,
  FileCheck2,
  ArrowRight,
} from "lucide-react";
import { StarExperience, ExperienceInputMode } from "@/types/cover-letter";

interface Step3Props {
  experienceType: ExperienceInputMode;
  onChangeExperienceType: (mode: ExperienceInputMode) => void;
  starExperience: StarExperience;
  onChangeStar: (field: keyof StarExperience, val: string) => void;
  experienceDoc: string;
  onChangeExperienceDoc: (val: string) => void;
  onFillSampleStar?: () => void;
}

export function Step3Experience({
  experienceType,
  onChangeExperienceType,
  starExperience,
  onChangeStar,
  experienceDoc,
  onChangeExperienceDoc,
  onFillSampleStar,
}: Step3Props) {
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtractingStar, setIsExtractingStar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef<number>(0);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setParseError("파일 크기는 최대 5MB 이하만 업로드 가능합니다.");
      return;
    }

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isTxt =
      file.type.includes("text") ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md") ||
      lowerName.endsWith(".rtf") ||
      lowerName.endsWith(".csv");
    const isImage =
      file.type.startsWith("image/") ||
      lowerName.endsWith(".png") ||
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".webp");

    if (!isPdf && !isTxt && !isImage) {
      setParseError("PDF, TXT 또는 이미지(PNG/JPG) 파일만 지원됩니다.");
      return;
    }

    setParseError(null);
    setIsParsing(true);
    setFileName(file.name);
    // Ensure we switch to file view
    onChangeExperienceType("file");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          const base64Data = resultStr.includes(",")
            ? resultStr.split(",")[1]
            : resultStr;

          const res = await fetch("/api/parse-document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: file.type || (isPdf ? "application/pdf" : isImage ? "image/jpeg" : "text/plain"),
              fileName: file.name,
              docType: "experience_doc",
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || "문서 파싱 실패");
          }

          onChangeExperienceDoc(data.extractedText);
        } catch (innerErr: any) {
          setParseError(
            innerErr.message ||
              "문서 분석에 실패했습니다. 직접 텍스트로 붙여넣어 주세요."
          );
        } finally {
          setIsParsing(false);
        }
      };

      reader.onerror = () => {
        setParseError("파일을 읽는 중 오류가 발생했습니다.");
        setIsParsing(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setParseError(
        err.message || "문서 분석 중 예기치 못한 오류가 발생했습니다."
      );
      setIsParsing(false);
    }
  };

  // Drag event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  };

  // Convert parsed document text to STAR fields
  const handleExtractStarFromDoc = async () => {
    if (!experienceDoc || isExtractingStar) return;

    try {
      setIsExtractingStar(true);
      const res = await fetch("/api/cover-letter/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rewrite",
          company: "지원 회사",
          jobTitle: "목표 직무",
          questionTitle: "경험 요약",
          currentContent: experienceDoc,
          targetCharCount: 600,
          instructions:
            "주어진 경험 텍스트에서 가장 대표적인 핵심 프로젝트 1개를 선택하여 상황(S), 과제(T), 행동(A), 결과(R) 4개 구조로 명확히 분리 추출하세요.",
        }),
      });

      const data = await res.json();
      if (data.success && data.content) {
        // Simple heuristics or copy to action
        onChangeStar("action", data.content);
        onChangeExperienceType("star");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtractingStar(false);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-xs space-y-4 ${
        isDragging
          ? "border-indigo-600 ring-4 ring-indigo-500/20 bg-indigo-50/20"
          : "border-slate-200/90"
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.rtf,.csv,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Global Drag Overlay over Step 3 */}
      {isDragging && (
        <div className="absolute inset-0 z-30 bg-indigo-600/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-3 animate-bounce">
            <Upload className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight mb-1">
            이곳에 경험 파일(PDF / TXT)을 놓아주세요!
          </h3>
          <p className="text-sm text-indigo-100 max-w-md">
            이력서, 포트폴리오, 경력기술서를 드롭하시면 Gemini AI가 경험과 핵심 성과를 자동으로 추출합니다.
          </p>
        </div>
      )}

      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              내 경험 입력
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                STAR 또는 파일 중 택1
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              STAR 구조로 직접 작성하거나, 이력서/경력기술서 파일을 드래그하여 업로드하세요.
            </p>
          </div>
        </div>

        {/* Radio toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChangeExperienceType("star")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              experienceType === "star"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            STAR 구조 직접 입력
          </button>
          <button
            type="button"
            onClick={() => onChangeExperienceType("file")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              experienceType === "file"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📄 경험 파일 업로드
          </button>
        </div>
      </div>

      {/* Mode 1: STAR Form */}
      {experienceType === "star" ? (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-indigo-900">
              <span className="font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[11px] shrink-0">
                STAR 공식
              </span>
              <span>상황(S) ➔ 과제(T) ➔ 행동(A) ➔ 결과(R) 순서로 경험을 논리적으로 서술합니다.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onFillSampleStar && (
                <button
                  type="button"
                  onClick={onFillSampleStar}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  예시 채우기
                </button>
              )}
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => onChangeExperienceType("file")}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                파일 드롭하여 불러오기
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* S: 상황 */}
            <div className="space-y-1.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">
                    S
                  </span>
                  상황 (Situation)
                </label>
                <span className="text-[11px] text-slate-400">당시 직면한 배경 및 문제</span>
              </div>
              <textarea
                rows={3}
                value={starExperience.situation}
                onChange={(e) => onChangeStar("situation", e.target.value)}
                placeholder="예: 신규 서비스 런칭 직후 트래픽 증가로 인해 페이지 로딩 속도가 3초 이상 지연되고 이탈률이 급증했습니다."
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* T: 과제 */}
            <div className="space-y-1.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
                    T
                  </span>
                  과제 및 목표 (Task)
                </label>
                <span className="text-[11px] text-slate-400">내가 해결해야 했던 목표/역할</span>
              </div>
              <textarea
                rows={3}
                value={starExperience.task}
                onChange={(e) => onChangeStar("task", e.target.value)}
                placeholder="예: 사용자 이탈을 방지하기 위해 1개월 이내에 로딩 속도를 1초 이내로 단축하고 성능 점수를 85점 이상으로 높여야 했습니다."
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* A: 행동 (가장 중요) */}
            <div className="space-y-1.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[11px]">
                    A
                  </span>
                  행동 및 노력 (Action) - 핵심
                </label>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  ★ 가장 중요: 본인이 직접 주도한 실행 방법과 고민
                </span>
              </div>
              <textarea
                rows={4}
                value={starExperience.action}
                onChange={(e) => onChangeStar("action", e.target.value)}
                placeholder="예: Next.js 동적 임포트와 번들 최적화를 도입하여 불필요한 번들을 분리했습니다. 또한 가상 스크롤을 적용해 대용량 목록 렌더링 성능을 개선하고, 캐싱 정책을 최적화했습니다."
                className="w-full p-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* R: 결과 */}
            <div className="space-y-1.5 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">
                    R
                  </span>
                  결과 및 성과 (Result)
                </label>
                <span className="text-[11px] text-slate-400">구체적 수치(%), 배운 점</span>
              </div>
              <textarea
                rows={2}
                value={starExperience.result}
                onChange={(e) => onChangeStar("result", e.target.value)}
                placeholder="예: 초기 로딩 속도 65% 단축(3.8초 ➔ 1.1초), 성능 점수 94점 달성 및 사용자 가입 전환율 28% 상승 성과를 거두었습니다."
                className="w-full p-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Resume / Experience Document Upload & Drag Zone */
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${
              isDragging
                ? "border-indigo-600 bg-indigo-50/80 scale-[1.01]"
                : "border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30"
            }`}
          >
            {isParsing ? (
              <div className="flex flex-col items-center gap-2.5 text-indigo-600 py-4">
                <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
                <span className="text-sm font-bold">
                  Gemini AI가 이력서/경력기술서를 분석하고 있습니다...
                </span>
                <span className="text-xs text-slate-500">
                  {fileName} (프로젝트, 기여도, 수치 성과 추출 중)
                </span>
              </div>
            ) : fileName && experienceDoc ? (
              <div className="flex flex-col items-center gap-2 text-slate-700 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {fileName} 분석 완료!
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  경험 데이터 추출이 완료되었습니다. 다른 파일을 올리려면 클릭하거나 이곳으로 드래그하세요.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {experienceDoc.length.toLocaleString()}자 파싱됨
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName(null);
                      onChangeExperienceDoc("");
                    }}
                    className="text-xs text-rose-600 hover:underline px-2 py-1"
                  >
                    삭제 후 다시 올리기
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5 py-4 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1 shadow-2xs">
                  <Upload className="w-7 h-7 text-indigo-600" />
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-800">
                  이력서, 포트폴리오, 경력기술서 파일을 마우스로 끌어다 놓으세요
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  클릭하여 파일 선택 또는 <strong className="text-indigo-600">이곳으로 드래그 앤 드롭</strong>하세요 (PDF, TXT, 이미지 최대 5MB)
                </p>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Gemini 3.8 Flash가 프로젝트와 수치 성과를 자동 추출합니다
                </span>
              </div>
            )}
          </div>

          {parseError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{parseError}</span>
            </div>
          )}

          {experienceDoc && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  추출된 경험 내용 (자소서 생성 시 직접 반영됩니다)
                </span>
                <span className="text-slate-400 font-medium">
                  {experienceDoc.length}자
                </span>
              </div>
              <textarea
                rows={5}
                value={experienceDoc}
                onChange={(e) => onChangeExperienceDoc(e.target.value)}
                placeholder="추출된 경험 내용이 여기에 표시됩니다. 직접 내용을 추가하거나 수정할 수도 있습니다."
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

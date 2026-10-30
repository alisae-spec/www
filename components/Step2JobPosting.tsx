"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  X,
  Sparkles,
} from "lucide-react";
import { JobPostingInputMode } from "@/types/cover-letter";

interface Step2Props {
  jobPosting: string;
  onChangeJobPosting: (val: string) => void;
  inputMode: JobPostingInputMode;
  onChangeInputMode: (mode: JobPostingInputMode) => void;
}

export function Step2JobPosting({
  jobPosting,
  onChangeJobPosting,
  inputMode,
  onChangeInputMode,
}: Step2Props) {
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef<number>(0);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // 5MB Limit check
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
    onChangeInputMode("file");

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
              docType: "job_posting",
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || "문서 파싱 실패");
          }

          onChangeJobPosting(data.extractedText);
        } catch (innerErr: any) {
          setParseError(
            innerErr.message || "문서 분석에 실패했습니다. 직접 텍스트로 입력해주세요."
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
        err.message || "문서 분석에 실패했습니다. 직접 텍스트로 입력해주세요."
      );
      setIsParsing(false);
    }
  };

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
      handleFileUpload(e.dataTransfer.files[0]);
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

      {/* Global Drag Overlay over Step 2 */}
      {isDragging && (
        <div className="absolute inset-0 z-30 bg-indigo-600/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-3 animate-bounce">
            <Upload className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight mb-1">
            이곳에 채용공고 파일(PDF / TXT)을 놓아주세요!
          </h3>
          <p className="text-sm text-indigo-100 max-w-md">
            채용공고 파일을 드롭하시면 Gemini AI가 주요 업무 및 자격요건을 자동으로 파싱합니다.
          </p>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              채용공고 입력
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                필수
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              채용공고의 주요 업무와 자격요건을 텍스트로 붙여넣거나 파일을 드래그하여 업로드하세요.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChangeInputMode("text")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              inputMode === "text"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ✍️ 텍스트 직접 입력
          </button>
          <button
            type="button"
            onClick={() => onChangeInputMode("file")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              inputMode === "file"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📄 파일 업로드 (PDF/TXT)
          </button>
        </div>
      </div>

      {/* Mode 1: Textarea */}
      {inputMode === "text" ? (
        <div className="space-y-2">
          <div className="relative">
            <textarea
              rows={6}
              value={jobPosting}
              onChange={(e) => onChangeJobPosting(e.target.value)}
              placeholder={`채용공고 내용을 복사하여 붙여넣어 주세요.\n\n예시:\n[주요 업무]\n- 대규모 트래픽 웹 서비스 프론트엔드 아키텍처 설계\n- Next.js 기반 반응형 UI/UX 개발\n\n[자격 요건]\n- React, TypeScript 실무 경험 2년 이상\n- 웹 성능 최적화 경험 보유자`}
              className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-mono"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>💡 팁: &apos;주요 업무&apos;와 &apos;자격 요건&apos;이 상세할수록 합격률 높은 맞춤형 키워드가 생성됩니다.</span>
            <span className="font-medium text-slate-500">
              {jobPosting.length.toLocaleString()}자 입력됨
            </span>
          </div>
        </div>
      ) : (
        /* Mode 2: File Upload */
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
                  Gemini AI가 채용공고 문서를 분석하고 있습니다...
                </span>
                <span className="text-xs text-slate-500">
                  {fileName} (텍스트 구조화 및 핵심 역량 파싱 중)
                </span>
              </div>
            ) : fileName && jobPosting ? (
              <div className="flex flex-col items-center gap-2 text-slate-700 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {fileName} 분석 완료!
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  채용공고 텍스트 파싱에 성공했습니다. 다른 파일로 교체하려면 클릭하거나 드래그하세요.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {jobPosting.length.toLocaleString()}자 파싱됨
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileName(null);
                      onChangeJobPosting("");
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
                  채용공고 PDF 또는 TXT 파일을 마우스로 끌어다 놓으세요
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  클릭하여 파일 선택 또는 <strong className="text-indigo-600">이곳으로 드래그 앤 드롭</strong>하세요 (최대 5MB)
                </p>
              </div>
            )}
          </div>

          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {jobPosting && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>파싱된 공고 내용 미리보기:</span>
                <span className="text-slate-400">{jobPosting.length}자</span>
              </div>
              <p className="text-xs text-slate-600 max-h-32 overflow-y-auto whitespace-pre-wrap font-mono">
                {jobPosting}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

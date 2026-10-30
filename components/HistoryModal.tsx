"use client";

import React from "react";
import {
  CoverLetterHistoryItem,
} from "@/types/cover-letter";
import {
  X,
  History,
  Trash2,
  ExternalLink,
  Calendar,
  Building2,
  Briefcase,
  FileText,
  Download,
} from "lucide-react";
import { exportToWord } from "@/lib/export";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CoverLetterHistoryItem[];
  onLoadItem: (item: CoverLetterHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryModal({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onDeleteItem,
  onClearAll,
}: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                작성 히스토리
              </h3>
              <p className="text-xs text-slate-500">
                최근 작성한 자기소개서 목록 (최대 20개 자동 보관)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("모든 히스토리 내역을 삭제하시겠습니까?")) {
                    onClearAll();
                  }
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2.5 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
              >
                전체 비우기
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <History className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
              <div className="font-bold text-slate-700 text-sm">
                저장된 작성 이력이 없습니다.
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                자소서를 생성하면 브라우저 LocalStorage에 자동으로 안전하게 보관됩니다.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">
                          {item.company}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-bold text-indigo-600 text-sm">
                          {item.jobTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span>문항 {item.sections.length}개</span>
                        <span>목표 {item.targetCharCount}자</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadItem(item);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        불러오기
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          exportToWord({
                            company: item.company,
                            jobTitle: item.jobTitle,
                            careerLevel: item.careerLevel,
                            targetCharCount: item.targetCharCount,
                            sections: item.sections,
                          })
                        }
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Word 파일 다운로드"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview of first section */}
                  {item.sections[0] && (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                      <span className="font-semibold text-slate-700 mr-1.5">
                        {item.sections[0].headline || item.sections[0].title}:
                      </span>
                      {item.sections[0].content}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

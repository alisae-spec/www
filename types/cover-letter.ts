export interface StarExperience {
  situation: string; // S: 상황 (배경, 직면한 문제)
  task: string;      // T: 과제/목표 (내가 달성해야 했던 목표나 역할)
  action: string;    // A: 행동 (구체적인 실행 방법, 본인의 주도적 노력)
  result: string;    // R: 결과 (정량적/정성적 성과, 배운 점)
}

export interface QuestionPreset {
  id: string;
  title: string;
  description: string;
  isSelected: boolean;
}

export interface GeneratedSection {
  id: string;
  questionId: string;
  title: string;
  headline: string; // 헤드라인 / 소제목
  content: string;  // 본문 텍스트
  targetCharCount: number;
}

export interface CoverLetterHistoryItem {
  id: string;
  createdAt: string;
  company: string;
  jobTitle: string;
  careerLevel: string;
  targetCharCount: number;
  tone: string;
  sections: GeneratedSection[];
}

export type ExperienceInputMode = 'star' | 'file';
export type JobPostingInputMode = 'text' | 'file';
export type ToneType = 'confident' | 'logical' | 'enthusiastic' | 'sincere';

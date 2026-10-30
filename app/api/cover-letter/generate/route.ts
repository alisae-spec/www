import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

interface GeneratePayload {
  company: string;
  jobTitle: string;
  careerLevel?: string;
  jobPosting: string;
  experienceType: "star" | "file";
  starExperience?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  experienceDoc?: string;
  questions: Array<{ id: string; title: string }>;
  targetCharCount: number;
  tone: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GeneratePayload = await req.json();
    const {
      company,
      jobTitle,
      careerLevel = "신입/경력",
      jobPosting,
      experienceType,
      starExperience,
      experienceDoc,
      questions,
      targetCharCount = 700,
      tone = "confident",
    } = body;

    if (!company || !jobTitle) {
      return NextResponse.json(
        { error: "회사명과 지원 직무를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!jobPosting || jobPosting.trim().length === 0) {
      return NextResponse.json(
        { error: "채용공고 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const hasStar =
      starExperience &&
      (starExperience.situation ||
        starExperience.task ||
        starExperience.action ||
        starExperience.result);
    const hasDoc = experienceDoc && experienceDoc.trim().length > 0;

    if (!hasStar && !hasDoc) {
      return NextResponse.json(
        { error: "STAR 경험 또는 경험 문서 중 하나를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "작성할 자소서 문항을 하나 이상 선택해주세요." },
        { status: 400 }
      );
    }

    // Safety trimming: Keep up to 4000 characters for job posting and experience to ensure fast generation
    const trimmedJobPosting = jobPosting.slice(0, 4000);
    const trimmedExperienceDoc = experienceDoc ? experienceDoc.slice(0, 4000) : "";

    const toneDescriptions: Record<string, string> = {
      confident: "자신감 있고 전문성이 돋보이며, 주도적인 성취를 강조하는 당당한 어조",
      logical: "논리적이고 분석적이며, 문제 해결 과정과 인과관계를 체계적으로 밝히는 객관적인 어조",
      enthusiastic: "기업과 직무에 대한 강한 열정과 도전 정신, 적극적인 실행력을 보여주는 진취적인 어조",
      sincere: "신뢰감과 진정성이 느껴지며, 조직 융화력과 책임감을 강조하는 성실한 어조",
    };

    const selectedToneDesc = toneDescriptions[tone] || toneDescriptions.confident;

    let experiencePromptSection = "";
    if (experienceType === "star" && starExperience) {
      experiencePromptSection = `
[지원자의 STAR 경험]
- Situation (상황): ${starExperience.situation || "상황 기술 없음"}
- Task (과제/목표): ${starExperience.task || "과제 기술 없음"}
- Action (행동/노력): ${starExperience.action || "행동 기술 없음"}
- Result (결과/성과): ${starExperience.result || "결과 기술 없음"}
`;
    } else {
      experiencePromptSection = `
[지원자의 이력/경험 기술서 내용]
${trimmedExperienceDoc}
`;
    }

    const questionListPrompt = questions
      .map((q, idx) => `${idx + 1}. [${q.id}] ${q.title}`)
      .join("\n");

    const systemPrompt = `당신은 대기업, 테크 유니콘, 공공기관의 인사담당자 및 채용 컨설턴트 수준의 전문 역량을 갖춘 AI 자기소개서 전문 작성가입니다.
지원자가 제공한 목표 회사, 직무, 채용공고의 핵심 역량/키워드, 그리고 지원자의 실제 경험(STAR 또는 이력 내용)을 긴밀하게 연결하여 서류 합격률이 매우 높은 최적화된 자기소개서를 작성해야 합니다.

[작성 원칙]
1. 각 문항마다 인상적이고 구체적인 핵심 성과/키워드가 드러나는 '소제목(헤드라인)'을 반드시 [소제목 형식]으로 작성하세요.
2. STAR 기법(상황-과제-행동-결과)을 본문에 유기적으로 녹여내며, 특히 지원자가 직접 수행한 구체적 액션과 정량적/정성적 성과(숫자, 개선율, 임팩트)를 부각하세요.
3. 뜬구름 잡는 미사여구나 진부한 클리셰('엄격하지만 자상하신 부모님', '최선을 다하겠습니다' 등)는 절대 배제하고, 두괄식으로 직무 전문성을 드러내세요.
4. 요청된 어조: ${selectedToneDesc}
5. 각 문항의 목표 글자 수는 공백 포함 약 ${targetCharCount}자 내외(오차범위 ±50자)로 충실하고 밀도 높은 분량으로 작성하세요. 너무 짧거나 빈약하지 않아야 합니다.`;

    const userPrompt = `[지원 기본 정보]
- 지원 기업: ${company}
- 지원 직무: ${jobTitle}
- 지원 구분: ${careerLevel}

[채용공고 내용]
${trimmedJobPosting}

${experiencePromptSection}

[작성할 자기소개서 문항 목록]
${questionListPrompt}

[요구사항]
위 문항 목록에 명시된 모든 문항에 대해 각각 맞춤형 자기소개서를 생성하세요.
각 문항의 본문은 공백 포함 약 ${targetCharCount}자로 작성되어야 합니다.
결과는 아래 JSON 스키마 규격에 맞춰 정확하게 반환해주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              description: "각 문항별 생성된 자기소개서 항목",
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: {
                    type: Type.STRING,
                    description: "문항 ID (예: motivation, competency 등)",
                  },
                  questionTitle: {
                    type: Type.STRING,
                    description: "문항 제목",
                  },
                  headline: {
                    type: Type.STRING,
                    description: "임팩트 있는 소제목 (대괄호 포함)",
                  },
                  content: {
                    type: Type.STRING,
                    description: "자기소개서 본문 텍스트 (줄바꿈 포함, 완성된 문장)",
                  },
                },
                required: ["questionId", "questionTitle", "headline", "content"],
              },
            },
            overallFeedback: {
              type: Type.STRING,
              description: "작성된 자기소개서의 주요 강점 및 면접 대비 조언 1~2줄",
            },
          },
          required: ["items"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini 모델로부터 응답을 받지 못했습니다.");
    }

    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      items: parsedData.items,
      overallFeedback: parsedData.overallFeedback || "",
    });
  } catch (error: any) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "자기소개서 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}

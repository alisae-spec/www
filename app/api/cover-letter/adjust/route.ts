import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { Type } from "@google/genai";

interface AdjustPayload {
  action: "expand" | "shorten" | "rewrite" | "generate_headline";
  company: string;
  jobTitle: string;
  questionTitle: string;
  currentHeadline?: string;
  currentContent: string;
  targetCharCount: number;
  instructions?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AdjustPayload = await req.json();
    const {
      action,
      company,
      jobTitle,
      questionTitle,
      currentHeadline = "",
      currentContent,
      targetCharCount,
      instructions,
    } = body;

    if (!currentContent || currentContent.trim().length === 0) {
      return NextResponse.json(
        { error: "조정할 본문 내용이 없습니다." },
        { status: 400 }
      );
    }

    let actionInstruction = "";
    if (action === "expand") {
      actionInstruction = `현재 본문의 논리적 뼈대를 유지하면서, 행동(Action)의 구체적인 문제 분석 과정, 기술적/실무적 디테일, 협업 시 소통 노력, 직무적 깨달음을 풍부하게 보강하여 분량을 약 15~25% 늘려 작성하세요. 목표 글자 수: 공백 포함 약 ${Math.round(
        targetCharCount * 1.15
      )}자.`;
    } else if (action === "shorten") {
      actionInstruction = `현재 본문에서 중복되거나 부차적인 수식어구를 깔끔하게 정돈하고, 핵심 문제-해결-성과 인과관계를 더욱 압축적이고 힘 있게 요약하여 분량을 약 15~25% 줄이세요. 목표 글자 수: 공백 포함 약 ${Math.round(
        targetCharCount * 0.85
      )}자.`;
    } else if (action === "rewrite") {
      actionInstruction = `현재 경험의 팩트는 보존하되, 도입부의 접근법과 문장 구성을 참신하게 바꾸고 직무 전문성과 주도성을 더욱 강력하게 어필할 수 있도록 새롭게 전면 재작성하세요. 목표 글자 수: 공백 포함 약 ${targetCharCount}자.`;
    } else if (action === "generate_headline") {
      actionInstruction = `현재 본문 내용을 대표하는 가장 매력적이고 직관적인 소제목(헤드라인)을 새로 제시하고 본문은 다듬어주세요.`;
    }

    if (instructions) {
      actionInstruction += `\n추가 사용자 요청사항: ${instructions}`;
    }

    const systemPrompt = `당신은 대한민국 최고의 취업/이직 자기소개서 전문 에디터입니다.
주어진 자기소개서 문항과 기존 본문을 바탕으로 사용자의 요구에 맞춰 문장을 정밀하게 수정하고 품질을 극대화합니다.
문장은 두괄식으로 명확해야 하며 비문이 없어야 합니다.`;

    const userPrompt = `[지원 정보]
- 회사명: ${company || "지원 기업"}
- 직무: ${jobTitle || "지원 직무"}
- 문항: ${questionTitle}

[현재 소제목]
${currentHeadline}

[현재 본문]
${currentContent}

[수정 요청 작업]
작업 유형: ${action}
${actionInstruction}

요구사항에 맞추어 새로운 소제목과 본문을 작성하여 JSON 형식으로 응답해주세요.`;

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
            headline: {
              type: Type.STRING,
              description: "새로운 소제목 (대괄호 포함)",
            },
            content: {
              type: Type.STRING,
              description: "조정/재작성된 본문 내용 (단락 구성 포함)",
            },
            changeSummary: {
              type: Type.STRING,
              description: "수정된 주요 포인트 한 줄 설명",
            },
          },
          required: ["headline", "content"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini 응답을 받지 못했습니다.");
    }

    const parsed = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      headline: parsed.headline || currentHeadline,
      content: parsed.content,
      changeSummary: parsed.changeSummary || "",
    });
  } catch (error: any) {
    console.error("Cover letter adjust error:", error);
    return NextResponse.json(
      {
        error:
          error?.message || "문항 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }
}

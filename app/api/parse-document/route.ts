import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileBase64, mimeType, docType, fileName } = body;

    if (!fileBase64) {
      return NextResponse.json(
        { error: "파일 데이터가 전달되지 않았습니다." },
        { status: 400 }
      );
    }

    // Safety check on size (max 5MB base64 is ~7MB string)
    if (fileBase64.length > 7 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 용량은 최대 5MB 이하만 지원됩니다." },
        { status: 400 }
      );
    }

    // Determine effective MIME type and file format
    const lowerName = (fileName || "").toLowerCase();
    let effectiveMime = mimeType || "";

    const isPdf = lowerName.endsWith(".pdf") || effectiveMime === "application/pdf";
    const isImage =
      effectiveMime.startsWith("image/") ||
      lowerName.endsWith(".png") ||
      lowerName.endsWith(".jpg") ||
      lowerName.endsWith(".jpeg") ||
      lowerName.endsWith(".webp");
    const isText =
      effectiveMime.includes("text") ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md") ||
      lowerName.endsWith(".rtf") ||
      lowerName.endsWith(".csv") ||
      lowerName.endsWith(".json");

    // If it's plain text or markdown
    if (isText && !isPdf && !isImage) {
      const buffer = Buffer.from(fileBase64, "base64");
      const text = buffer.toString("utf-8");
      return NextResponse.json({
        success: true,
        extractedText: text.slice(0, 5000),
      });
    }

    if (isPdf) {
      effectiveMime = "application/pdf";
    } else if (lowerName.endsWith(".png")) {
      effectiveMime = "image/png";
    } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
      effectiveMime = "image/jpeg";
    } else if (lowerName.endsWith(".webp")) {
      effectiveMime = "image/webp";
    } else if (!effectiveMime) {
      effectiveMime = "application/pdf";
    }

    // If it's PDF or image document type, utilize Gemini's native multimodal document processing!
    const isJobPosting = docType === "job_posting";
    const prompt = isJobPosting
      ? `다음 채용공고 문서 파일에서 핵심 내용을 추출하여 한국어 텍스트로 정리해주세요.
포함할 항목:
1. 회사명 및 포지션
2. 주요 업무 (Responsibility)
3. 지원 자격 요건 (Requirements)
4. 우대 사항 (Preferred Qualifications)
불필요한 서식이나 이미지 캡션은 제외하고 깔끔한 텍스트로 작성해주세요.`
      : `다음 이력서/경력기술서 문서 파일에서 지원자의 주요 경험을 추출하여 한국어 텍스트로 정리해주세요.
포함할 항목:
1. 프로젝트/업무명 및 수행 기간
2. 직면했던 문제 상황(Situation) 및 달성 과제(Task)
3. 본인이 주도한 구체적 액션(Action)
4. 수치화된 성과 및 배운 점(Result)
자소서 작성에 바로 활용할 수 있도록 일목요연하게 정리해주세요.`;

    const docPart = {
      inlineData: {
        mimeType: effectiveMime,
        data: fileBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [docPart, { text: prompt }],
      },
      config: {
        systemInstruction: "당신은 문서에서 핵심 정보를 정확하고 일목요연하게 추출하는 전문 문서 파서입니다.",
        temperature: 0.2,
      },
    });

    const extractedText = response.text || "";

    return NextResponse.json({
      success: true,
      extractedText: extractedText.trim(),
    });
  } catch (error: any) {
    console.error("Document parsing error:", error);
    return NextResponse.json(
      {
        error:
          "파일을 분석하는 데 실패했습니다. 파일이 손상되었거나 암호화되어 있을 수 있습니다. 직접 텍스트를 복사하여 입력해주세요.",
      },
      { status: 500 }
    );
  }
}

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { GeneratedSection } from "@/types/cover-letter";
import { jsPDF } from "jspdf";

export function calculateCharCounts(text: string) {
  if (!text) return { withSpaces: 0, withoutSpaces: 0 };
  const withSpaces = text.length;
  const withoutSpaces = text.replace(/\s/g, "").length;
  return { withSpaces, withoutSpaces };
}

interface ExportData {
  company: string;
  jobTitle: string;
  careerLevel?: string;
  targetCharCount: number;
  sections: GeneratedSection[];
}

export async function exportToWord(data: ExportData) {
  const { company, jobTitle, careerLevel = "신입/경력", sections } = data;
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `[자기소개서] ${company} - ${jobTitle}`,
          bold: true,
          size: 36, // 18pt
          font: "Malgun Gothic",
          color: "1E3A8A",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `지원 구분: ${careerLevel}   |   작성일: ${today}`,
          size: 20,
          font: "Malgun Gothic",
          color: "64748B",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 300 },
      border: {
        bottom: {
          color: "CBD5E1",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 10,
        },
      },
    }),
  ];

  sections.forEach((sec, idx) => {
    // Question Title
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: `${idx + 1}. ${sec.title}`,
            bold: true,
            size: 26, // 13pt
            font: "Malgun Gothic",
            color: "0F172A",
          }),
        ],
      })
    );

    // Headline (소제목)
    if (sec.headline) {
      children.push(
        new Paragraph({
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: sec.headline,
              bold: true,
              size: 22, // 11pt
              font: "Malgun Gothic",
              color: "2563EB",
            }),
          ],
        })
      );
    }

    // Split content by newlines
    const paragraphs = sec.content.split("\n\n");
    paragraphs.forEach((pText) => {
      if (pText.trim()) {
        children.push(
          new Paragraph({
            spacing: { after: 140, line: 360 }, // 1.5 line height
            alignment: AlignmentType.BOTH,
            children: [
              new TextRun({
                text: pText.trim(),
                size: 21, // 10.5pt
                font: "Malgun Gothic",
                color: "334155",
              }),
            ],
          })
        );
      }
    });

    // Character Count info
    const counts = calculateCharCounts(sec.content);
    children.push(
      new Paragraph({
        spacing: { after: 350 },
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: `(공백포함: ${counts.withSpaces.toLocaleString()}자 / 공백제외: ${counts.withoutSpaces.toLocaleString()}자)`,
            size: 18,
            font: "Malgun Gothic",
            color: "94A3B8",
            italics: true,
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `자기소개서_${company}_${jobTitle}_${new Date().toISOString().slice(0, 10)}.docx`;
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToText(data: ExportData) {
  const { company, jobTitle, careerLevel = "신입/경력", sections } = data;
  const today = new Date().toLocaleDateString("ko-KR");

  let content = `=========================================================\n`;
  content += `[자기소개서] ${company} - ${jobTitle}\n`;
  content += `지원 구분: ${careerLevel} | 작성일: ${today}\n`;
  content += `=========================================================\n\n`;

  sections.forEach((sec, idx) => {
    const counts = calculateCharCounts(sec.content);
    content += `---------------------------------------------------------\n`;
    content += `문항 ${idx + 1}. ${sec.title}\n`;
    if (sec.headline) {
      content += `소제목: ${sec.headline}\n`;
    }
    content += `---------------------------------------------------------\n`;
    content += `${sec.content}\n\n`;
    content += `[글자수: 공백포함 ${counts.withSpaces}자 / 공백제외 ${counts.withoutSpaces}자]\n\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const fileName = `자기소개서_${company}_${jobTitle}_${new Date().toISOString().slice(0, 10)}.txt`;
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPdfNative() {
  window.print();
}

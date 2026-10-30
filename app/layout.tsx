import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: '스토리뱅크 AI자소서 메이커 | STAR 기반 맞춤형 자기소개서 생성기',
  description: '지원 정보와 STAR 경험 스토리를 바탕으로 맞춤형 자기소개서를 1분 만에 생성하고 다운로드하는 AI 웹 서비스',
  openGraph: {
    title: '스토리뱅크 AI자소서 메이커',
    description: '지원 정보와 STAR 경험 스토리를 바탕으로 맞춤형 자기소개서를 1분 만에 생성하고 다운로드하는 AI 웹 서비스',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '스토리뱅크 AI자소서 메이커',
    description: '지원 정보와 STAR 경험 스토리를 바탕으로 맞춤형 자기소개서를 1분 만에 생성하고 다운로드하는 AI 웹 서비스',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

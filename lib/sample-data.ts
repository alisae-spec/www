import { QuestionPreset, StarExperience } from "@/types/cover-letter";

export const DEFAULT_QUESTIONS: QuestionPreset[] = [
  {
    id: "motivation",
    title: "지원동기 및 입사 후 포부",
    description: "해당 기업과 직무를 선택한 이유 및 기여하고 싶은 목표",
    isSelected: true,
  },
  {
    id: "competency",
    title: "직무 핵심 역량 및 전문성",
    description: "직무 수행에 필요한 지식, 기술, 프로젝트 성과 중심 서술",
    isSelected: true,
  },
  {
    id: "problem_solving",
    title: "문제 해결 및 위기 극복 경험",
    description: "예기치 못한 난관을 주도적이고 창의적으로 극복한 사례",
    isSelected: false,
  },
  {
    id: "personality",
    title: "성격의 장단점 및 협업/소통 스타일",
    description: "팀워크, 갈등 조율, 업무 태도 및 지속적 개선 노력",
    isSelected: false,
  },
];

export interface SamplePreset {
  name: string;
  badge: string;
  company: string;
  jobTitle: string;
  careerLevel: string;
  jobPosting: string;
  starExperience: StarExperience;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    name: "IT/개발: 카카오 프론트엔드",
    badge: "개발/IT",
    company: "카카오",
    jobTitle: "프론트엔드 개발자",
    careerLevel: "신입/주니어",
    jobPosting: `[주요 업무]
- 대규모 트래픽을 처리하는 반응형 웹 서비스 및 모바일 웹 UI/UX 개발
- Next.js, React 기반 컴포넌트 아키텍처 설계 및 최적화
- 웹 성능 측정 및 코어 웹 바이탈(LCP, FID, CLS) 개선
- 백엔드 및 디자인팀과의 유기적인 애자일 협업

[자격 요건]
- HTML, CSS, Modern JavaScript(ES6+), TypeScript에 대한 깊은 이해
- React, Next.js 실무 또는 프로젝트 경험자
- 성능 최적화(번들링, 레이지 로딩, 렌더링 최적화)에 관심과 경험이 있는 분
- 원활한 커뮤니케이션 능력과 능동적인 문제 해결 마인드셋`,
    starExperience: {
      situation: "대학생 및 취준생 대상 일정 관리 웹 서비스를 런칭했으나, 초기 렌더링 시 대용량 데이터 로드로 인해 LCP(최대 콘텐츠 렌더링 시간)가 3.8초까지 지연되고 사용자 이탈률이 40%에 달하는 문제가 발생했습니다.",
      task: "사용자 이탈을 막기 위해 핵심 페이지의 초기 로딩 속도를 1.5초 이내로 단축하고, 전반적인 웹 성능 점수(Lighthouse)를 85점 이상으로 개선해야 했습니다.",
      action: "Next.js의 동적 임포트(Dynamic Import)와 이미지 최적화 파이프라인을 도입했습니다. 번들 분석기를 활용해 불필요하게 번들링되던 외부 라이브러리를 경량화하고, 가상 스크롤(Virtual Scroll)을 구현해 수천 개의 일정을 끊김 없이 렌더링했습니다. 또한 브라우저 캐싱과 API 응답 메모이제이션을 적용했습니다.",
      result: "초기 로딩 속도가 3.8초에서 1.1초로 약 71% 단축되었으며, Lighthouse 성능 점수가 58점에서 94점으로 대폭 향상되었습니다. 결과적으로 신규 유저 가입 전환율이 28% 상승했습니다."
    }
  },
  {
    name: "기획/PM: 토스 프로덕트 매니저",
    badge: "기획/PM",
    company: "비바리퍼블리카(토스)",
    jobTitle: "Product Manager (PO)",
    careerLevel: "경력",
    jobPosting: `[주요 업무]
- 토스 결제 및 송금 관련 사용자 퍼널 분석 및 가설 기반 지표 개선
- 고객 피드백 수집 및 데이터(Amplitude, SQL) 기반의 프로덕트 로드맵 수립
- 개발, 디자인, 데이터 분석가 등 크로스 펑셔널 팀 리딩
- A/B 테스트를 통한 기능 검증 및 빠른 이터레이션

[자격 요건]
- 데이터 기반 의사결정 및 프로덕트 지표(전환율, 리텐션) 개선 경험
- 복잡한 비즈니스 로직을 사용자 친화적 경험으로 단순화할 수 있는 역량
- 높은 오너십과 실패를 두려워하지 않는 실험 정신`,
    starExperience: {
      situation: "커머스 결제 단계에서 본인 인증 및 결제 수단 선택 시 이탈률이 32%로 집계되어 결제 완료율에 병목이 발생하고 있었습니다.",
      task: "결제 플로우의 불필요한 단계를 축소하여 결제 이탈률을 15% 이하로 낮추고, 1인당 결제 전환율을 높이는 프로덕트 개선을 주도해야 했습니다.",
      action: "Amplitude 이벤트 로그와 히트맵을 분석하여 사용자가 생체인증 오류 및 약관 동의 단계에서 가장 많이 이탈함을 발견했습니다. 원터치 간편결제 시스템을 기획하고, A/B 테스트를 통해 간소화된 2단계 결제 UI를 배포했습니다. 개발 및 QA 팀과 일일 스탠드업을 진행하며 2주 단위 스프린트로 기민하게 릴리즈했습니다.",
      result: "결제 이탈률이 32%에서 13.5%로 대폭 감소하였으며, 결제 전환율 24% 상승, 월간 거래액(GMV) 1억 8천만 원 추가 성장을 견인했습니다."
    }
  },
  {
    name: "마케팅: 올리브영 브랜드 마케터",
    badge: "마케팅",
    company: "CJ올리브영",
    jobTitle: "디지털 브랜드 마케터",
    careerLevel: "신입",
    jobPosting: `[주요 업무]
- 2030 타깃 디지털 마케팅 캠페인 기획 및 숏폼/SNS 콘텐츠 제작
- 퍼포먼스 광고 집행 및 ROAS 지표 모니터링/최적화
- 온/오프라인 연계 옴니채널 프로모션 실행

[자격 요건]
- 뷰티/트렌드에 대한 높은 관심과 소비자 인사이트 도출 역량
- 데이터 기반의 성과 분석 및 광고 소재 기획 역량
- 주도적으로 아이디어를 실행하고 결과를 검증할 수 있는 인재`,
    starExperience: {
      situation: "신규 뷰티 브랜드 런칭 당시, 인지도 부족으로 인해 공식몰 유입량이 목표치의 30% 수준에 머물렀습니다.",
      task: "한정된 300만 원의 예산으로 1개월 내 인스타그램 및 틱톡을 통한 20대 여성 타깃 유입을 3배 이상 늘리고 브랜드 인지도를 확보해야 했습니다.",
      action: "타깃층의 공감을 얻을 수 있는 '파우치 속 필수템' 테마의 숏폼 릴스 5편을 직접 기획·제작하고, 마이크로 인플루언서 20명과의 시딩 협업을 진행했습니다. 매일 클릭률(CTR)과 전환율(CVR)을 트래킹하여 성과가 높은 소재에 예산을 집중 집행(소재 최적화)했습니다.",
      result: "릴스 누적 조회수 45만 회를 돌파하며 공식몰 유입이 전월 대비 340% 급증했고, ROAS 420%를 기록하며 초도 물량 완판을 달성했습니다."
    }
  }
];

# 📚 역사 교육 플랫폼 개발 아키텍처 가이드 (Subject Migration Guide)

이 웹 애플리케이션은 중학교/고등학교 교과 대비를 위해 개발된 **Vite + React 기반의 초고속 인터랙티브 교육 플랫폼**입니다. 교과서 데이터를 JSON 규격에 맞춰 입력하면 **AI 채점, 빈칸 학습, 카드 게임, TTS(텍스트 음성 변환) 기능**이 즉시 동작하도록 템플릿화되어 설계되었습니다.

역사 과목 외에 **수학, 과학, 영어, 사회 등 다른 과목에도 즉시 적용**할 수 있도록 전체 구조와 가이드를 제공합니다.

---

## 📂 프로젝트 폴더 구조

타 과목에 본 템플릿을 복사하여 적용할 때 참고할 핵심 파일 지도입니다.

```text
history-app/
├── public/
│   ├── audio/              # [TTS] 빌드 타임에 생성된 정적 MP3 오디오 파일 폴더 (MD5 해시명 및 마스코트용)
│   └── images/             # [시각 자료] 유물, 도표, 그림 등의 이미지 파일 폴더
├── src/
│   ├── assets/             # 정적 웹 에셋 (배경이 투명하게 전처리된 고품질 마스코트 캐릭터 PNG 등)
│   ├── components/
│   │   ├── FlashcardsSection.jsx # [학습 탭] 역사카드 모드 (카드 뒤집기, 메모리 게임, 객관식, 서술형)
│   │   └── Timeline.jsx    # [대시보드] 타임라인 시각화 컴포넌트 (과목 특성에 맞춰 활성/비활성 가능)
│   ├── data/
│   │   ├── chapters.js     # ★[데이터] 핵심 교과서 콘텐츠 및 문제 데이터베이스
│   │   └── mascotFeedback.js # [대사 데이터] 마스코트의 반응 대사 구조 정의
│   ├── pages/
│   │   ├── Dashboard.jsx   # [페이지] 메인 코스웨어 대시보드 (은행나라 보물 상점 및 박물관 통합)
│   │   └── Chapter.jsx     # [페이지] 소단원 상세 학습 및 AI 노트패드, 실전/서술형 퀴즈
│   ├── utils/
│   │   ├── audio.js        # [사운드] 효과음 재생 및 오프라인 TTS MP3 재생 컨트롤러
│   │   └── gemini.js       # [AI] Gemini 2.5 Flash를 이용한 단원 서술 평가 및 실시간 힌트 제공
│   ├── App.jsx             # [루트] 라우팅 및 다중 학습자 프로필(닉네임) 관리
│   ├── index.css           # [디자인] 글래스모피즘 기반 프리미엄 다크/라이트 CSS 테마 (스크롤프리 뷰포트)
│   └── main.jsx            # 진입점
├── scratch/
│   └── generate_mascot_audio.py # [자동화] 교과 피드백 음성을 ElevenLabs API로 일괄 생성해 주는 Python 스크립트
├── vercel.json             # [배포] Vercel 새로고침 404 오류 방지 규칙 파일
└── package.json            # 빌드 및 라이브러리 의존성 정의
```

---

## 🛠️ 타 과목 확장 3단계 마이그레이션

새로운 과목(예: 과학, 영어)으로 전환하고자 할 때 다음 3단계만 진행하면 즉시 신규 과목 학습 앱이 완성됩니다.

### 1단계: 교과 데이터 구축 (`src/data/chapters.js` 수정)
- 학습할 과목의 단원 정보, 빈칸 채우기 문장, 카드 용어(단어), 실전 4지선다 퀴즈, 서술형 문제 목록을 양식에 맞게 입력합니다.
- 상세 규격 및 예시는 [데이터 스키마 템플릿 가이드(data_schema_template.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/data_schema_template.md)를 참고하세요.

### 2단계: TTS 음성 MP3 생성 및 리소스 매핑
- 교과서의 모든 설명 텍스트를 기기 구애 없이 맑은 한국어 성우 음성으로 듣기 위해 빌드 타임에 MP3를 자동 추출합니다.
- 상세 실행 방법 및 마스코트 연동은 [정적 TTS 오디오 빌드 가이드(audio_generation_utility.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/audio_generation_utility.md)와 [API 및 오프라인 연동 설계 가이드(api_integration.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/docs/api_integration.md)를 참고하세요.

### 3단계: 테마 및 레이아웃 커스텀
- `src/App.jsx`에서 헤더 타이틀을 수정합니다.
- 역사 과목이 아니어서 타임라인 시각화가 불필요하다면 `src/pages/Dashboard.jsx`에서 `<Timeline />` 컴포넌트를 주석 처리하거나 제거할 수 있습니다.
- `src/index.css` 상단의 `--primary` 및 `--secondary` 색상 코드를 변경하여 과목의 아이덴티티 컬러(예: 과학은 초록색, 수학은 하늘색 등)로 손쉽게 분위기를 바꿀 수 있습니다.

---

## 📘 세부 가이드 문서 목록

각 기능의 작동 메커니즘과 복사를 위한 템플릿 코드는 아래 개별 문서를 확인해 주세요.

1. **[데이터 규격 및 교과 데이터 템플릿](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/data_schema_template.md)**
   - `chapters.js` 데이터의 JSON 형식 상세 명세 및 타 교과(수학/영어/과학) 작성 예시 제공.
2. **[정적 TTS MP3 음성 빌드 유틸리티](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/audio_generation_utility.md)**
   - `gTTS` 기반의 텍스트 추출 및 MD5 파일명 변환 스크립트 코드와 실행 환경 구축 설명.
3. **[프론트엔드 아키텍처 및 상태 관리](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/docs/frontend_architecture.md)**
   - 닉네임 기반의 로컬 스토리지 상태 격리 프리픽스 및 게임화 상태 관리 구조 설명.
4. **[UI 디자인 시스템 및 스크롤 프리 레이아웃](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/docs/ui_design_system.md)**
   - 글래스모피즘 테마 디자인 토큰, 스크롤프리 레이아웃 패딩 최적화 및 CSS3 마스코트 애니메이션 설명.
5. **[API 및 오프라인 연동 설계](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/docs/api_integration.md)**
   - Gemini 2.5 Flash 실시간 API 연동 및 ElevenLabs 오디오 정적 사전 생성 재생 아키텍처.
6. **[학습 프로세스 및 게임 메커니즘](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/docs/learning_workflow.md)**
   - 이해 -> 각인 -> 용어정복 -> 실전 -> 서술형으로 이루어지는 학습 흐름 및 상점/박물관 해금 시스템 설명.

# 🎨 UI 디자인 시스템 및 스크롤 프리 레이아웃 (UI & Design System)

본 플랫폼은 현대적인 **글래스모피즘(Glassmorphism) 테마**와 스크롤이 필요 없는 **컴팩트 뷰포트 레이아웃**을 적용하여 직관적이고 몰입감 넘치는 학습 환경을 설계했습니다.

---

## 1. 디자인 시스템 토큰 및 글래스모피즘

[index.css](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/src/index.css) 파일에 정의된 CSS Custom Properties 변수 목록입니다. 시스템 다크 모드를 완벽히 추종하도록 기획되었습니다.

```css
:root {
  --primary: #1E3A8A;       /* 황실 딥 블루 */
  --secondary: #D97706;     /* 따뜻한 세피아 골드 */
  --background: #F8FAFC;    /* 백그라운드 */
  --surface: #FFFFFF;       /* 카드 표면 */
  --text: #0F172A;          /* 주요 텍스트 */
  --text-muted: #64748B;    /* 서브 설명 텍스트 */
  --border: #E2E8F0;
}
```

### ✨ 글래스모피즘 카드 스타일
반투명한 백그라운드와 미세한 경계 테두리, 그리고 배경 블러(`backdrop-filter: blur(10px)`) 처리를 통해 모던하고 왜곡 없는 카드 가독성을 지원합니다.

---

## 2. 스크롤 프리(Scroll-Free) 컴팩트 레이아웃

태블릿, 노트북 화면에서 화면 내 스크롤 조작 없이도 헤더 영역부터 제출/다음 단계 제어 버튼까지 단일 화면(One-Screen)에 보이도록 레이아웃 높이를 정밀 조정했습니다.

### 📐 주요 레이아웃 리사이징 내역
- **여백 및 패딩 최소화**:
  - 메인 앱 내부 패딩을 `2rem` -> `1rem`으로 절반 축소하여 가로 및 세로 가용 면적을 확보했습니다.
  - 카드 패딩을 `1.5rem` -> `1.15rem`으로, 버튼 패딩을 `0.5rem 1.15rem`으로 줄여 수직 압축율을 극대화했습니다.
- **제목 및 탭 마진 축소**:
  - `Chapter.jsx` 상단의 단원 정보 카드 여백을 `2rem` -> `0.75rem`으로 변경했습니다.
  - 모바일이나 PC 화면에서 뒤집기 카드나 문제 풀이가 나타났을 때 스크롤바가 생기지 않고 브라우저 뷰포트 하단부의 오버플로우가 사라졌습니다.

---

## 3. 마스코트 인터랙티브 애니메이션

마스코트 캐릭터 등장 시 단조로움을 없애고 활발한 생동감을 부여하기 위해 CSS3 키프레임 애니메이션을 도입했습니다.

- **`mascotFloat`**: 위아래로 천천히 떠다니는 바운스 효과(12px 범위)를 부여하여 화면 공중에 떠 있는 느낌을 유도합니다.
- **`mascotPulse`**: 웅장한 목소리 발화에 연동하여 마스코트 이미지 크기가 살짝 커졌다 작아지는 스케일 펄스(1.05배)를 조화시켰습니다.

```css
@keyframes mascotFloat {
  0% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0); }
}

@keyframes mascotPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.mascot-speaking {
  animation: mascotFloat 2s ease-in-out infinite, mascotPulse 1.5s ease-in-out infinite;
}
```

---

## 🔗 관련 문서 링크
- [프론트엔드 아키텍처 및 상태 관리 (frontend_architecture.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/frontend_architecture.md)
- [API 및 오프라인 연동 가이드 (api_integration.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/api_integration.md)
- [학습 프로세스 워크플로우 (learning_workflow.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이%20브/CodingAI/history.ms.2-1-2/history-app/docs/learning_workflow.md)

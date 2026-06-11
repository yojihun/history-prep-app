# 💻 프론트엔드 아키텍처 및 상태 관리 (Frontend Architecture)

본 플랫폼은 **Vite + React** 기반의 고성능 싱글 페이지 애플리케이션(SPA)으로, 학습자의 주도적 참여를 위한 게임화(Gamification) 요소와 유연한 다중 프로필 시스템을 지원합니다.

---

## 1. 다중 학습자 프로필 및 로컬 스토리지 연동

학습자별로 독립적인 학습 진도와 보석/경험치 상태를 유지할 수 있도록 **닉네임 기반 네임스페이스 격리 기술**을 도입했습니다.

- **닉네임 상태 관리**: `App.jsx`에서 `current_nickname`을 감지하여 실시간 프로필 스위칭이 가능합니다. (기본값: `"도담"`)
- **로컬 스토리지 프리픽스(Prefix)**: 닉네임이 변경될 때마다 키 이름 앞에 `{닉네임}_` 접두사를 자동으로 결합하여 저장 영역을 완벽하게 분리합니다.
  - 예: `도담_xp`, `도담_gems`, `도담_level`, `도담_unlocked_items`, `도담_notes_{chapterId}`

### 🔄 상태 변경에 따른 스토리지 동기화 흐름
닉네임(`nickname`) 상태가 바뀔 때마다 `useEffect` 훅이 반응하여 해당 네임스페이스의 데이터를 다시 불러옵니다:

```javascript
const prefix = nickname ? `${nickname}_` : '';

useEffect(() => {
  setXp(parseInt(localStorage.getItem(`${prefix}xp`)) || 0);
  setGems(parseInt(localStorage.getItem(`${prefix}gems`)) || 0);
  setLevel(parseInt(localStorage.getItem(`${prefix}level`)) || 1);
  // ... 생략 ...
}, [nickname]);
```

---

## 2. 게임화(Gamification) 상태 기획

학습 의욕을 고취하기 위해 다음과 같은 네 가지 핵심 상태 변수와 제어 모듈을 기획하여 구동하고 있습니다.

1. **경험치 (XP)**
   - 빈칸 채우기, 퀴즈 정답, 서술형 및 학습 목표 통과 시 정해진 점수만큼 누적됩니다.
   - 경험치가 100 단위를 넘어설 때마다 레벨이 자동으로 상승하며 축하 모달과 전용 사운드가 재생됩니다.
2. **보석 (Gems)**
   - 고난도 학습 미션(서술형 평가 통과 등) 완수 시 획득할 수 있는 희소 화폐입니다.
   - 메인 대시보드의 **은행나라 보물 상점**에서 역사적 유물을 잠금 해제(구입)하는 데 사용됩니다.
3. **레벨 (Level)**
   - $Level = \lfloor XP / 100 \rfloor + 1$ 공식에 의해 자동으로 유도됩니다.
4. **해금 유물 목록 (Unlocked Items)**
   - 사용자가 보석으로 구입해 은행나라 박물관에 진열 중인 유물 아이디 리스트입니다.

---

## 3. 라우팅 아키텍처 (`react-router-dom`)

`BrowserRouter` 기반의 라우팅 구조를 통해 화면 전환 간 불필요한 새로고침을 제거하고, 상태 보존을 실현했습니다.

- `/`: [Dashboard.jsx](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/src/pages/Dashboard.jsx) (메인 코스웨어 홈, 상점 및 박물관 뷰 포함)
- `/chapter/:chapterId`: [Chapter.jsx](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/src/pages/Chapter.jsx) (소단원 학습 및 문제 풀이 탭 뷰)

---

## 🔗 관련 문서 링크
- [UI 디자인 시스템 가이드 (ui_design_system.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/ui_design_system.md)
- [API 및 오프라인 연동 가이드 (api_integration.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/api_integration.md)
- [학습 프로세스 워크플로우 (learning_workflow.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이브/CodingAI/history.ms.2-1-2/history-app/docs/learning_workflow.md)

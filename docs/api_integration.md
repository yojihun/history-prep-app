# 🔌 API 및 오프라인 연동 설계 (API & Offline Integration)

본 플랫폼은 서버 비용 절감 및 인터넷 속도에 구애받지 않는 안정성을 실현하기 위해, 실시간 거대 언어 모델(LLM) API 사용과 오프라인 자원의 활용을 고도로 이원화하여 설계했습니다.

---

## 1. Gemini AI 실시간 API 연동 (`src/utils/gemini.js`)

브라우저 단에서 직접 Google AI Studio의 **Gemini 2.5 Flash** API를 호출하여 학습 도우미 피드백 및 주관식 채점을 수행합니다. API 호출을 처리하는 모듈은 [gemini.js](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/src/utils/gemini.js)에 구현되어 있습니다.

### A. 학습 목표 도우미 및 채점
- **함수**: `checkLearningObjective(objective, referenceData, userDescription)`
- **프롬프트 가이드**: 학습 목표 달성 여부를 판별하기 위해, 해당 단원의 핵심 용어 설명(`referenceData.flashcards`)과 빈칸 문제쌍(`referenceData.fillInTheBlanks`)을 참고용 콘텍스트로 주입합니다.
- **점진적 비계 설정(Scaffolding)**: 학생이 한 번에 정답을 쉽게 알아채지 못하도록, 피드백에는 누락된 사항 중 1~2개만을 질문 형태로 노출하도록 유도합니다.
- **오류 복구(Fallback)**: API 할당량 초과(429)나 네트워크 지연 등의 오류 발생 시, `isCompleted: false`와 함께 에러 원인 안내 메시지를 기본값으로 반환하도록 구성했습니다.

### B. 실시간 힌트 제공
- **함수**: `getObjectiveHint(objective, referenceData, currentText)`
- **동작**: 학생이 아직 입력을 작성하지 않았거나 작성 도중 막혔을 때, 학습자가 첫 문장을 뗄 수 있도록 방향을 잡아 주는 1~2문장의 가이드 질문 힌트를 생성합니다.

### C. 주관식 서술형 채점
- **함수**: `gradeSubjectiveAnswer(question, expectedAnswer, userAnswer)`
- **스키마 제약**: AI가 JSON Schema 구조(`{ grade: "A" | "B" | "C", feedback: string }`)를 준수하도록 강제하여 클라이언트 앱에서 파싱 실패 확률을 낮췄습니다.

---

## 2. ElevenLabs 오프라인 정적 오디오 연동

사용자가 문제 풀이 결과를 확인할 때마다 실시간으로 ElevenLabs API를 연동하여 TTS(텍스트 음성 변환)를 수행하게 되면 막대한 API 비용과 네트워크 대기 지연(Latency)이 발생합니다. 이를 개선하기 위해 **빌드타임 사전 생성(Static Pre-generation) 방식**을 도입했습니다.

### A. 마스코트 음성 및 Voice ID 매핑
- 마스코트 캐릭터의 특징에 부합하는 활성 보이스를 ElevenLabs 라이브러리에서 선별하여 지정했습니다.
  - 👑 **임금님 (King)**: `pNInz6obpgDQGcFmaJgB` (Adam - 신뢰감을 주는 중후한 남성 목소리)
  - ⚔️ **장군님 (General)**: `SOYHLrjzK2X1ezoPC6cr` (Harry - 기개 있고 힘찬 장군 목소리)
  - 🎓 **선비님 (Scholar)**: `dMZ8mX0Ph1cjrCK7Jhrg` (Seonguk - 지적이고 차분한 학자 목소리)

### B. 사전 생성 자동화 스크립트
- [generate_mascot_audio.py](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/scratch/generate_mascot_audio.py) Python 스크립트가 로컬 환경의 ElevenLabs API를 활용해 미리 오디오 파일을 일괄 생성합니다.
- 생성된 18종의 피드백 음성은 `public/audio/{line_id}.mp3` 경로에 저장됩니다. (예: `king_s1.mp3`, `general_f1.mp3` 등)

### C. 클라이언트 재생 메커니즘
- [audio.js](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/src/utils/audio.js) 내 `playMascotSpeech(lineId)` 함수가 호출되면, 네트워크 요청 없이 `/audio/{lineId}.mp3` 정적 에셋 파일로 직접 접근하여 딜레이 없이 즉시 재생합니다.
- 일반 교과 단원 설명글은 MD5 해시값을 매핑명으로 사용하는 정적 TTS 재생기(`playStaticTTS(text)`)를 통해 캐싱 및 조회가 수행됩니다.

---

## 🔗 관련 문서 링크
- [프론트엔드 아키텍처 및 상태 관리 (frontend_architecture.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/docs/frontend_architecture.md)
- [UI 디자인 시스템 가이드 (ui_design_system.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/docs/ui_design_system.md)
- [학습 프로세스 워크플로우 (learning_workflow.md)](file:///Users/jihoonkim/Library/CloudStorage/GoogleDrive-yojihun@e-mirim.hs.kr/내%20드라이🇧ᅳ/CodingAI/history.ms.2-1-2/history-app/docs/learning_workflow.md)

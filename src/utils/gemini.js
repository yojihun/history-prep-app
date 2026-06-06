const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export async function gradeSubjectiveAnswer(question, expectedAnswer, userAnswer) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const prompt = `역사 공부 서술형 답안 채점기입니다.
질문: ${question}
모범 답안 / 핵심 용어: ${expectedAnswer}
학생의 답안: ${userAnswer}

위 질문과 모범 답안을 바탕으로 학생의 답안을 공정하게 평가해 주세요.
A 등급: 모범 답안의 핵심 키워드가 포함되고 설명이 논리적이며 올바른 경우
B 등급: 핵심 키워드가 일부 누락되었거나 내용이 약간 부족하지만 핵심 취지는 맞춘 경우
C 등급: 오답이거나 질문의 요지에서 벗어난 경우

JSON 형식으로 "grade" (A, B, C 중 하나)와 한국어로 학생에게 주는 격려와 보완점이 섞인 "feedback" 내용을 작성해서 돌려주세요.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              grade: {
                type: "STRING",
                enum: ["A", "B", "C"]
              },
              feedback: {
                type: "STRING"
              }
            },
            required: ["grade", "feedback"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini grading failed:", error);
    let errorMsg = "서버 연결 또는 API 호출 문제로 상세 피드백을 가져오지 못했습니다.";
    if (error.message && error.message.includes("credits are depleted")) {
      errorMsg = "제미나이 API 키의 크레딧(사용량 선결제 금액)이 모두 소진되었습니다. 구글 AI Studio에서 결제 정보를 확인해 주세요.";
    } else if (error.message && (error.message.includes("quota") || error.message.includes("429"))) {
      errorMsg = "API 호출 속도 제한 또는 할당량이 초과되었습니다.";
    }
    return {
      grade: "B",
      feedback: `${errorMsg} 모범 답안과 본인 답안을 비교해 보세요.`
    };
  }
}

export async function checkLearningObjective(objective, referenceData, userDescription) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const flashcardsText = referenceData.flashcards && referenceData.flashcards.length > 0
    ? referenceData.flashcards.map(f => `- ${f.term}: ${f.definition}`).join('\n')
    : "없음";
    
  const blanksText = referenceData.fillInTheBlanks && referenceData.fillInTheBlanks.length > 0
    ? referenceData.fillInTheBlanks.map(b => `- ${b.sentence} (정답: ${b.answer})`).join('\n')
    : "없음";

  const prompt = `역사 학습 목표 서술형 답안 채점 및 피드백 튜터입니다.

[학습 목표]
${objective}

[해당 단원의 핵심 용어 및 개념]
${flashcardsText}

[해당 단원의 핵심 설명 문장]
${blanksText}

[학생이 서술한 내용]
${userDescription}

[임무]
학생이 작성한 내용을 바탕으로 해당 학습 목표를 달성했는지 평가해 주세요.
1. 학생의 서술이 학습 목표의 핵심 내용을 올바르게 담고 있다면 'isCompleted'를 true로 설정하고, 칭찬과 축하의 피드백을 적어주세요.
2. 만약 학습 목표를 완벽히 달성하기에 누락된 핵심 개념이나 오개념이 있다면 'isCompleted'를 false로 설정하세요.
3. 중요: 누락되거나 틀린 점이 여러 개 있더라도 피드백에는 한 번에 모두 나열하지 말고, **가장 중요하거나 먼저 해결해야 할 1~2가지**에 대해서만 힌트를 주는 질문이나 유도 문장으로 피드백을 작성하세요. 학생이 직접 스스로 생각하고 내용을 보완할 수 있도록 돕는 것이 목적입니다. (예: "좋은 설명입니다! 그런데 역사적 사실이 사람마다 다르게 해석될 수 있는 원인이나 관점을 뜻하는 용어는 무엇인지 설명에 추가해 볼까요?")

반드시 아래 JSON 스키마를 준수하여 응답해 주세요.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              isCompleted: {
                type: "BOOLEAN"
              },
              feedback: {
                type: "STRING"
              }
            },
            required: ["isCompleted", "feedback"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini learning objective check failed:", error);
    let errorMsg = "서버 연결 또는 API 호출 문제로 피드백을 가져오지 못했습니다.";
    if (error.message && error.message.includes("credits are depleted")) {
      errorMsg = "제미나이 API 키의 크레딧이 모두 소진되었습니다.";
    } else if (error.message && (error.message.includes("quota") || error.message.includes("429"))) {
      errorMsg = "API 호출 속도 제한 또는 할당량이 초과되었습니다.";
    }
    return {
      isCompleted: false,
      feedback: `${errorMsg} 작성한 내용을 다시 검토하고 보완해 보세요.`
    };
  }
}

export async function getObjectiveHint(objective, referenceData, currentText) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  const flashcardsText = referenceData.flashcards && referenceData.flashcards.length > 0
    ? referenceData.flashcards.map(f => `- ${f.term}: ${f.definition}`).join('\n')
    : "없음";
    
  const blanksText = referenceData.fillInTheBlanks && referenceData.fillInTheBlanks.length > 0
    ? referenceData.fillInTheBlanks.map(b => `- ${b.sentence} (정답: ${b.answer})`).join('\n')
    : "없음";

  const prompt = `역사 학습 목표 서술형 답안 작성을 돕는 힌트 도우미입니다.

[학습 목표]
${objective}

[해당 단원의 핵심 용어 및 개념]
${flashcardsText}

[해당 단원의 핵심 설명 문장]
${blanksText}

[학생이 지금까지 서술한 내용 (비어있을 수 있음)]
${currentText || "(아직 작성하지 않음)"}

[임무]
학생이 학습 목표에 대해 더 구체적으로 서술할 수 있도록 유도하는 구체적인 힌트를 한국어로 1~2문장으로 제공해 주세요.
- 학생이 적은 내용이 있다면, 그 내용을 칭찬하고 다음으로 무엇을 서술하면 좋을지 구체적인 키워드나 질문 형태로 방향을 제시해 주세요.
- 학생이 아직 아무것도 적지 않았다면, 학습 목표를 이루기 위해 어떤 내용을 먼저 써야 할지 첫 단추를 끼울 수 있는 구체적인 가이드 질문을 주세요.
- 정답을 직접적으로 문장 그대로 다 알려주지 마시고, 힌트의 형식(예: "~에 대한 내용을 포함해서 적어볼까요?", "~가 강조한 사실은 무엇일까요?")을 유지해 주세요.

JSON 형식으로 "hint" 키에 힌트 문장(string)을 담아서 반환해 주세요.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              hint: {
                type: "STRING"
              }
            },
            required: ["hint"]
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini hint retrieval failed:", error);
    return {
      hint: "해당 단원의 핵심 용어를 참고하여 학습 목표를 달성할 수 있도록 요약해 보세요."
    };
  }
}



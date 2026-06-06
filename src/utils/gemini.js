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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini grading failed:", error);
    // Graceful fallback in case of errors or limit hits
    return {
      grade: "B",
      feedback: "서버 연결 또는 API 호출 문제로 상세 피드백을 가져오지 못했습니다. 학생 스스로 모범 답안과 비교하여 확인해 보세요."
    };
  }
}

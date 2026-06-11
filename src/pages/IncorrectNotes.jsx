import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Check, AlertCircle, BookOpen, Layers, Award } from 'lucide-react';
import { playCorrectSound, playIncorrectSound } from '../utils/audio';

export default function IncorrectNotes({ nickname, addXp, addGems, triggerMascot }) {
  const navigate = useNavigate();
  const prefix = nickname ? `${nickname}_` : '';
  const [incorrectList, setIncorrectList] = useState([]);
  
  // Load incorrect notes list
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${prefix}incorrect_notes`);
      const parsed = saved ? JSON.parse(saved) : [];
      setIncorrectList(Array.isArray(parsed) ? parsed : []);
    } catch {
      setIncorrectList([]);
    }
  }, [nickname]);

  // Handle Note cycle changes
  const updateNoteState = (updatedList) => {
    setIncorrectList(updatedList);
    localStorage.setItem(`${prefix}incorrect_notes`, JSON.stringify(updatedList));
  };

  const handleBlankCheck = (noteId, userAns, correctAns) => {
    const isCorrect = userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();
    const list = incorrectList.map(note => {
      if (note.id === noteId) {
        const nextCorrectCount = isCorrect ? (note.correctCount || 0) + 1 : 0;
        return {
          ...note,
          step: 'retry',
          correctCount: nextCorrectCount,
          lastAttemptCorrect: isCorrect
        };
      }
      return note;
    });

    if (isCorrect) {
      playCorrectSound();
      addXp(10);
      triggerMascot('success', '통과! +10 XP');
    } else {
      playIncorrectSound();
      triggerMascot('fail', '틀렸습니다. 다시 도전!');
    }
    updateNoteState(list);
  };

  const handleRetrySubmit = (noteId, userAnsIndex, correctIndex) => {
    const isCorrect = parseInt(userAnsIndex) === correctIndex;
    let list = incorrectList.map(note => {
      if (note.id === noteId) {
        const nextCorrectCount = isCorrect ? (note.correctCount || 0) + 1 : 0;
        return {
          ...note,
          correctCount: nextCorrectCount,
          lastAttemptCorrect: isCorrect,
          step: 'summary'
        };
      }
      return note;
    });

    // Remove if correctCount reaches 2
    const targetNote = list.find(n => n.id === noteId);
    if (targetNote && targetNote.correctCount >= 2) {
      list = list.filter(n => n.id !== noteId);
      playCorrectSound();
      addXp(20);
      addGems(1);
      triggerMascot('success', '오답노트 마스터! 💎 +1');
    } else {
      if (isCorrect) {
        playCorrectSound();
        addXp(10);
        triggerMascot('success', '1차 정복! +10 XP');
      } else {
        playIncorrectSound();
        triggerMascot('fail', '정답을 복습하고 다시 오세요');
        // Reset step to summary to review explanation
        list = list.map(note => {
          if (note.id === noteId) {
            return { ...note, step: 'summary', correctCount: 0 };
          }
          return note;
        });
      }
    }
    updateNoteState(list);
  };

  return (
    <div className="animate-fade-in">
      <button 
        onClick={() => navigate('/')} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-muted)', marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
      >
        <ArrowLeft size={20} />
        대시보드로 돌아가기
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📝 오답노트 (복습 학습)
        </h2>
        <span className="glass-card" style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', margin: 0 }}>
          대기 중인 오답: <strong>{incorrectList.length}개</strong>
        </span>
      </div>

      {incorrectList.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h3 style={{ margin: 0 }}>오답노트가 텅 비어 있습니다!</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1rem' }}>
            모든 퀴즈를 완벽하게 풀었거나 틀린 문제를 모두 정복하셨습니다. 아주 훌륭합니다!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {incorrectList.map((note) => (
            <IncorrectNoteItem 
              key={note.id} 
              note={note} 
              onBlankCheck={handleBlankCheck} 
              onRetrySubmit={handleRetrySubmit}
              onBackToSummary={(noteId) => {
                const list = incorrectList.map(n => n.id === noteId ? { ...n, step: 'summary' } : n);
                updateNoteState(list);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IncorrectNoteItem({ note, onBlankCheck, onRetrySubmit, onBackToSummary }) {
  const [blankValue, setBlankValue] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);

  // Define blank components for summary step (Step 1: Explain & review)
  const parts = note.question.split(/(\[.*?\])/);
  const correctBlankAns = note.options ? note.options[note.answer] : "";

  return (
    <div className="glass-card" style={{ 
      borderColor: note.lastAttemptCorrect === false ? '#ef4444' : 'var(--border)',
      borderLeft: `6px solid ${note.step === 'summary' ? 'var(--primary)' : note.step === 'blank' ? 'var(--secondary)' : '#22c55e'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          📌 퀴즈 복습 (성공 횟수: {note.correctCount || 0} / 2)
        </span>
        <span style={{ 
          fontSize: '0.8rem', 
          padding: '0.25rem 0.6rem', 
          borderRadius: '12px', 
          fontWeight: 'bold',
          backgroundColor: note.step === 'summary' ? 'rgba(30, 58, 138, 0.1)' : note.step === 'blank' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: note.step === 'summary' ? 'var(--primary)' : note.step === 'blank' ? 'var(--secondary)' : '#16a34a'
        }}>
          {note.step === 'summary' ? '1단계: 핵심해설 복습' : note.step === 'blank' ? '2단계: 빈칸 채우기 퀴즈' : '3단계: 재도전 풀기'}
        </span>
      </div>

      {note.step === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--text-muted)' }}>질문 문항</h4>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{note.question}</p>
          </div>
          
          <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
            <h5 style={{ margin: '0 0 0.25rem 0', color: 'var(--secondary)', fontSize: '0.9rem' }}>핵심 요약 해설</h5>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{note.explanation}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => onBlankCheck(note.id, "", "") || onBackToSummary(note.id)} // Go to blank stage
              style={{ padding: '0.6rem 1.5rem', backgroundColor: 'var(--secondary)' }}
            >
              다음 단계: 빈칸 채우기 도전 ➔
            </button>
          </div>
        </div>
      )}

      {note.step === 'blank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--text-muted)' }}>빈칸에 들어갈 단어는 무엇일까요?</h4>
            <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.8' }}>
              {note.question.replace(correctBlankAns, " [ ______ ] ")}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <input 
              type="text" 
              value={blankValue}
              onChange={(e) => setBlankValue(e.target.value)}
              placeholder="정답 입력..."
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--text)',
                fontSize: '1rem'
              }}
            />
            <button 
              className="btn btn-primary"
              onClick={() => {
                onBlankCheck(note.id, blankValue, correctBlankAns);
                setBlankValue("");
              }}
              disabled={!blankValue.trim()}
              style={{ padding: '0.6rem 1.5rem' }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {note.step === 'retry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--text-muted)' }}>최종 객관식 재도전</h4>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{note.question}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {note.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                style={{
                  padding: '0.8rem 1rem',
                  textAlign: 'left',
                  borderRadius: '8px',
                  border: selectedOption === idx ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: selectedOption === idx ? 'rgba(30, 58, 138, 0.08)' : 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  width: '100%'
                }}
              >
                {idx + 1}) {option}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <button 
              className="btn btn-outline"
              onClick={() => onBackToSummary(note.id)}
              style={{ padding: '0.6rem 1.2rem' }}
            >
              해설 다시보기
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                onRetrySubmit(note.id, selectedOption, note.answer);
                setSelectedOption(null);
              }}
              disabled={selectedOption === null}
              style={{ padding: '0.6rem 1.5rem' }}
            >
              재도전 제출
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

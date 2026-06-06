import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Volume2, RefreshCw, Award, Check, AlertCircle, Edit3 } from 'lucide-react';
import { chapters, quizzes } from '../data/chapters';
import FlashcardsSection from '../components/FlashcardsSection';
import { playCorrectSound, playIncorrectSound } from '../utils/audio';
import { gradeSubjectiveAnswer } from '../utils/gemini';

export default function Chapter() {
  const { chapterId } = useParams();
  const chapter = chapters.find(c => c.id === chapterId);
  const chapterQuizzes = quizzes.filter(q => q.chapterId === chapterId);
  const subjectiveQuizzes = chapter ? (chapter.subjectiveQuizzes || []) : [];
  
  const [activeTab, setActiveTab] = useState('objectives'); // 'objectives' | 'blanks' | 'flashcards' | 'quiz' | 'subjective_quiz'
  const [completedObjectives, setCompletedObjectives] = useState(new Set());

  if (!chapter) return <div>Chapter not found</div>;

  const toggleObjective = (id) => {
    setCompletedObjectives(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="animate-fade-in">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={20} />
        목록으로 돌아가기
      </Link>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2>{chapter.title}</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'objectives' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('objectives')}
          >
            학습 목표
          </button>
          <button 
            className={`btn ${activeTab === 'blanks' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('blanks')}
          >
            빈칸 채우기
          </button>
          <button 
            className={`btn ${activeTab === 'flashcards' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('flashcards')}
          >
            역사 카드 (용어 정복)
          </button>
          <button 
            className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('quiz')}
          >
            실전 퀴즈 ({chapterQuizzes.length}문제)
          </button>
          <button 
            className={`btn ${activeTab === 'subjective_quiz' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('subjective_quiz')}
          >
            서술형 퀴즈 ({subjectiveQuizzes.length}문제)
          </button>
        </div>
      </div>

      {activeTab === 'objectives' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chapter.sections.map(section => (
            <div key={section.id} className="glass-card">
              <h3 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                {section.title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {section.subsections.map(sub => (
                  <div 
                    key={sub.id} 
                    style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer' }}
                    onClick={() => toggleObjective(sub.id)}
                  >
                    <div style={{ color: completedObjectives.has(sub.id) ? 'var(--secondary)' : 'var(--text-muted)', marginTop: '2px' }}>
                      {completedObjectives.has(sub.id) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <div>
                      <h4 style={{ marginBottom: '0.25rem' }}>{sub.title} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>(p.{sub.page})</span></h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{sub.objective}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'blanks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {chapter.sections.map(section => (
            <div key={section.id}>
              {section.subsections.map(sub => (
                sub.fillInTheBlanks && sub.fillInTheBlanks.length > 0 && (
                  <div key={sub.id} className="glass-card" style={{ marginBottom: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.1rem' }}>{sub.title}</h3>
                    
                    {sub.imageUrl && (
                      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <img 
                          src={sub.imageUrl} 
                          alt={sub.imageCaption || sub.title}
                          style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', objectFit: 'cover' }}
                        />
                        {sub.imageCaption && (
                          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>▲ {sub.imageCaption}</p>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {sub.fillInTheBlanks.map((blank, idx) => (
                        <BlankCard key={`${sub.id}-${idx}`} data={blank} index={idx} />
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'flashcards' && (
        <FlashcardsSection chapter={chapter} />
      )}

      {activeTab === 'quiz' && (
        <QuizMode chapterQuizzes={chapterQuizzes} />
      )}

      {activeTab === 'subjective_quiz' && (
        <SubjectiveQuizMode subjectiveQuizzes={subjectiveQuizzes} />
      )}
    </div>
  );
}

// ----------------------------------------------------
// Blank card for Blanks tab
// ----------------------------------------------------
function BlankCard({ data, index }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const parts = data.sentence.split(/(\[.*?\])/);
  
  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
      <p style={{ fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '1rem' }}>
        <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Q{index + 1}.</span>
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const answerText = part.slice(1, -1);
            return (
              <span 
                key={i} 
                style={{
                  display: 'inline-block',
                  minWidth: '60px',
                  padding: '0 0.5rem',
                  borderBottom: '2px solid var(--primary)',
                  color: showAnswer ? 'var(--primary)' : 'transparent',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  backgroundColor: showAnswer ? 'rgba(30, 58, 138, 0.1)' : 'var(--border)',
                  borderRadius: '4px',
                  margin: '0 4px',
                  transition: 'all 0.3s'
                }}
              >
                {answerText}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
      <button 
        className="btn btn-outline" 
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        {showAnswer ? '정답 숨기기' : '정답 확인'}
      </button>
    </div>
  );
}

// ----------------------------------------------------
// QUIZ MODE (One question at a time with correct/incorrect sounds)
// ----------------------------------------------------
function QuizMode({ chapterQuizzes }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const initQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsFinished(false);
  };

  if (chapterQuizzes.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>아직 등록된 퀴즈가 없습니다.</p>
      </div>
    );
  }

  const currentQ = chapterQuizzes[currentIndex];

  const handleSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedAnswer === currentQ.answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    if (currentIndex + 1 < chapterQuizzes.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {isFinished ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Award size={48} style={{ color: 'var(--secondary)' }} />
          <h3>퀴즈 완료!</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            {score} / {chapterQuizzes.length} 문제 맞춤
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            성적: {Math.round((score / chapterQuizzes.length) * 100)}점
          </p>
          <button className="btn btn-primary" onClick={initQuiz} style={{ marginTop: '1.5rem' }}>
            다시 풀기
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>문제 번호: <strong>{currentIndex + 1} / {chapterQuizzes.length}</strong></span>
            <span>현재 점수: <strong>{score}점</strong></span>
          </div>

          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem', lineHeight: '1.5', wordBreak: 'keep-all' }}>
            Q{currentIndex + 1}. {currentQ.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {currentQ.options.map((option, idx) => {
              let bg = 'transparent';
              let border = '1px solid var(--border)';
              let color = 'var(--text)';

              if (isSubmitted) {
                if (idx === currentQ.answer) {
                  bg = 'rgba(34, 197, 94, 0.1)';
                  border = '1px solid #22c55e';
                  color = '#16a34a';
                } else if (idx === selectedAnswer) {
                  bg = 'rgba(239, 68, 68, 0.1)';
                  border = '1px solid #ef4444';
                  color = '#dc2626';
                }
              } else if (idx === selectedAnswer) {
                border = '2px solid var(--primary)';
                bg = 'rgba(30, 58, 138, 0.08)';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isSubmitted}
                  style={{
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    borderRadius: '8px',
                    backgroundColor: bg,
                    border: border,
                    color: color,
                    cursor: isSubmitted ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}
                >
                  <span>{idx + 1}) {option}</span>
                  {isSubmitted && idx === currentQ.answer && <Check size={16} style={{ color: '#22c55e' }} />}
                  {isSubmitted && idx === selectedAnswer && idx !== currentQ.answer && <AlertCircle size={16} style={{ color: '#ef4444' }} />}
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
              <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>해설</h4>
              <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>{currentQ.explanation}</p>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            {!isSubmitted ? (
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit} 
                disabled={selectedAnswer === null}
                style={{ width: '100%' }}
              >
                답안 제출
              </button>
            ) : (
              <button 
                className="btn btn-secondary" 
                onClick={handleNext}
                style={{ width: '100%' }}
              >
                {currentIndex + 1 === chapterQuizzes.length ? '결과 보기' : '다음 문제'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// SUBJECTIVE QUIZ MODE (School Exam style rated by Gemini)
// ----------------------------------------------------
function SubjectiveQuizMode({ subjectiveQuizzes }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [gradingResult, setGradingResult] = useState(null); // { grade, feedback }
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState([]); // Array of { question, grade, feedback }

  const initSubjectiveQuiz = () => {
    setCurrentIndex(0);
    setUserAnswer("");
    setGradingResult(null);
    setIsLoading(false);
    setIsFinished(false);
    setHistory([]);
  };

  if (subjectiveQuizzes.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>이 단원에는 서술형 문제가 아직 등록되지 않았습니다.</p>
      </div>
    );
  }

  const currentQ = subjectiveQuizzes[currentIndex];

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setIsLoading(true);
    
    const result = await gradeSubjectiveAnswer(
      currentQ.question,
      currentQ.expectedAnswer,
      userAnswer
    );

    setGradingResult(result);
    setHistory(prev => [...prev, { question: currentQ.question, grade: result.grade, feedback: result.feedback }]);
    setIsLoading(false);

    if (result.grade === 'A' || result.grade === 'B') {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setGradingResult(null);
    if (currentIndex + 1 < subjectiveQuizzes.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {isFinished ? (
        <div className="glass-card" style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <Award size={48} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
            <h3>서술형 평가 완료</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((h, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: `4px solid ${h.grade === 'A' ? '#22c55e' : h.grade === 'B' ? '#eab308' : '#ef4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 'bold', lineHeight: '1.4' }}>Q{idx + 1}. {h.question}</span>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    backgroundColor: h.grade === 'A' ? 'rgba(34, 197, 94, 0.15)' : h.grade === 'B' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: h.grade === 'A' ? '#22c55e' : h.grade === 'B' ? '#eab308' : '#ef4444'
                  }}>
                    등급: {h.grade}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{h.feedback}</p>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={initSubjectiveQuiz} style={{ marginTop: '1rem' }}>
            다시 도전하기
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>서술형 문제: <strong>{currentIndex + 1} / {subjectiveQuizzes.length}</strong></span>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>서술형 질문:</h4>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0, wordBreak: 'keep-all', fontWeight: 'bold' }}>
              Q{currentIndex + 1}. {currentQ.question}
            </p>
          </div>

          {/* User Input Area */}
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={gradingResult !== null || isLoading}
              placeholder="여기에 서술형 답안을 작성하세요..."
              style={{
                width: '100%',
                height: '130px',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'none',
                boxSizing: 'border-box',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Loader or Grading Output */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', color: 'var(--secondary)' }}>
              <RefreshCw className="animate-spin" size={18} />
              <span>Gemini AI 교사가 서술형 채점 중입니다... 잠시만 기다려 주세요.</span>
            </div>
          )}

          {gradingResult && (
            <div className="animate-fade-in" style={{ padding: '1.25rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: `4px solid ${gradingResult.grade === 'A' ? '#22c55e' : gradingResult.grade === 'B' ? '#eab308' : '#ef4444'}`, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem', 
                  color: gradingResult.grade === 'A' ? '#22c55e' : gradingResult.grade === 'B' ? '#eab308' : '#ef4444'
                }}>
                  채점 결과 등급: {gradingResult.grade}
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>{gradingResult.feedback}</p>
              
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                <strong>학교 모범 답안:</strong> {currentQ.expectedAnswer}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            {gradingResult === null ? (
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit} 
                disabled={!userAnswer.trim() || isLoading}
                style={{ width: '100%' }}
              >
                답안 제출 및 AI 채점
              </button>
            ) : (
              <button 
                className="btn btn-secondary" 
                onClick={handleNext}
                style={{ width: '100%' }}
              >
                {currentIndex + 1 === subjectiveQuizzes.length ? '결과 보기' : '다음 문제'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

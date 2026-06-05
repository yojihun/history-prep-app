import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { chapters, quizzes } from '../data/chapters';

export default function Chapter() {
  const { chapterId } = useParams();
  const chapter = chapters.find(c => c.id === chapterId);
  const chapterQuizzes = quizzes.filter(q => q.chapterId === chapterId);
  
  const [activeTab, setActiveTab] = useState('objectives'); // 'objectives' | 'blanks' | 'quiz'
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
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
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
            빈칸 채우기 (개념 학습)
          </button>
          <button 
            className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('quiz')}
          >
            실전 퀴즈 ({chapterQuizzes.length}문제)
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

      {activeTab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chapterQuizzes.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>아직 등록된 퀴즈가 없습니다.</p>
            </div>
          ) : (
            chapterQuizzes.map((quiz, index) => (
              <QuizCard key={quiz.id} quiz={quiz} index={index} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function BlankCard({ data, index }) {
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Replace brackets [answer] with a blank span
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

function QuizCard({ quiz, index }) {
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSelect = (idx) => {
    if (showExplanation) return;
    setSelected(idx);
    setShowExplanation(true);
  };

  return (
    <div className="glass-card">
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Q{index + 1}. {quiz.question}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {quiz.options.map((opt, idx) => {
          let bg = 'transparent';
          let border = '1px solid var(--border)';
          let color = 'var(--text)';
          
          if (showExplanation) {
            if (idx === quiz.answer) {
              bg = 'rgba(34, 197, 94, 0.1)';
              border = '1px solid #22c55e';
              color = '#16a34a';
            } else if (idx === selected) {
              bg = 'rgba(239, 68, 68, 0.1)';
              border = '1px solid #ef4444';
              color = '#dc2626';
            }
          } else if (idx === selected) {
            border = '1px solid var(--primary)';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                padding: '1rem',
                textAlign: 'left',
                borderRadius: '8px',
                background: bg,
                border: border,
                color: color,
                cursor: showExplanation ? 'default' : 'pointer',
                transition: 'all 0.2s',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            >
              {idx + 1}) {opt}
            </button>
          );
        })}
      </div>
      {showExplanation && (
        <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
          <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>해설</h4>
          <p style={{ fontSize: '0.95rem' }}>{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
}

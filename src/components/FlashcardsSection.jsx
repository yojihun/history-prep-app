import { useState, useEffect } from 'react';
import { RefreshCw, Check, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Layers, Award, Volume2, VolumeX, Edit3 } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, playStaticTTS, stopStaticTTS } from '../utils/audio';
import { gradeSubjectiveAnswer } from '../utils/gemini';


export default function FlashcardsSection({ chapter }) {
  const allCards = chapter.sections.flatMap(sec => 
    sec.subsections.flatMap(sub => 
      (sub.flashcards || []).map(card => ({
        ...card,
        subsectionTitle: sub.title
      }))
    )
  );

  const [mode, setMode] = useState('study'); // 'study' | 'memory' | 'test' | 'subjective'

  if (allCards.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>이 단원에는 등록된 역사 카드가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Mode Selector */}
      <div className="glass-card" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', padding: '1rem' }}>
        <button 
          className={`btn ${mode === 'study' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('study')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <BookOpen size={16} />
          카드 뒤집기
        </button>
        <button 
          className={`btn ${mode === 'memory' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('memory')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <Layers size={16} />
          메모리 매칭
        </button>
        <button 
          className={`btn ${mode === 'test' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('test')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <Award size={16} />
          객관식 테스트
        </button>
        <button 
          className={`btn ${mode === 'subjective' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('subjective')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
        >
          <Edit3 size={16} />
          서술형 테스트
        </button>
      </div>

      {/* Mode Renderers */}
      {mode === 'study' && <StudyMode cards={allCards} />}
      {mode === 'memory' && <MemoryMode cards={allCards} />}
      {mode === 'test' && <TestMode cards={allCards} />}
      {mode === 'subjective' && <SubjectiveMode cards={allCards} />}
    </div>
  );
}

// ----------------------------------------------------
// 1) STUDY MODE (Flashcard Study)
// ----------------------------------------------------
function StudyMode({ cards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <span>단원 전체 카드 수: <strong>{cards.length}장</strong></span>
        <span>진행률: <strong>{currentIndex + 1} / {cards.length}</strong></span>
      </div>

      {/* Card Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          width: '100%',
          maxWidth: '450px',
          height: '280px',
          perspective: '1000px',
          cursor: 'pointer',
        }}
      >
        <div 
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Card Front (Term) */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
              borderRadius: '16px',
              border: '2px solid var(--primary)',
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15), rgba(0, 0, 0, 0.4))',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              backdropFilter: 'blur(8px)',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 'bold' }}>{currentCard.subsectionTitle}</span>
            <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text)', textAlign: 'center', wordBreak: 'keep-all' }}>{currentCard.term}</h2>
            <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>클릭하여 뜻 확인하기</p>
          </div>

          {/* Card Back (Definition) */}
          <div 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
              borderRadius: '16px',
              border: '2px solid var(--secondary)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0, 0, 0, 0.5))',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              backdropFilter: 'blur(8px)',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 'bold' }}>{currentCard.term}</span>
            <p style={{ fontSize: '1.15rem', lineHeight: '1.6', color: 'var(--text)', textAlign: 'center', wordBreak: 'keep-all', margin: 0 }}>
              {currentCard.definition}
            </p>
            <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>클릭하여 용어 보기</p>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
        <button className="btn btn-outline" onClick={handlePrev} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} />
          이전 카드
        </button>
        <button className="btn btn-outline" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          다음 카드
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2) MEMORY MODE (Memory Matching Game)
// ----------------------------------------------------
function MemoryMode({ cards }) {
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]); // indices
  const [matchedPairs, setMatchedPairs] = useState([]); // terms matched
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initGame = () => {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    const items = [];
    selected.forEach((c) => {
      items.push({ id: `term-${c.term}`, type: 'term', text: c.term, term: c.term });
      items.push({ id: `def-${c.term}`, type: 'def', text: c.definition, term: c.term });
    });

    const shuffledItems = items.sort(() => 0.5 - Math.random());
    setGameCards(shuffledItems);
    setSelectedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, [cards]);

  const handleCardClick = (index) => {
    if (selectedCards.length === 2) return;
    if (selectedCards.includes(index)) return;
    if (matchedPairs.includes(gameCards[index].term)) return;

    const nextSelected = [...selectedCards, index];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMoves(prev => prev + 1);
      const firstCard = gameCards[nextSelected[0]];
      const secondCard = gameCards[nextSelected[1]];

      if (firstCard.term === secondCard.term) {
        setTimeout(() => {
          setMatchedPairs(prev => {
            const next = [...prev, firstCard.term];
            if (next.length === 6 || next.length === gameCards.length / 2) {
              setIsWon(true);
            }
            return next;
          });
          setSelectedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        <span>매칭 시도 횟수: <strong>{moves}회</strong></span>
        <button onClick={initGame} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <RefreshCw size={14} /> 새 게임 시작
        </button>
      </div>

      {isWon ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Award size={48} style={{ color: 'var(--secondary)' }} />
          <h3>축하합니다! 모두 맞추셨습니다!</h3>
          <p style={{ color: 'var(--text-muted)' }}>시도 횟수: {moves}회</p>
          <button className="btn btn-primary" onClick={initGame} style={{ marginTop: '1rem' }}>
            한 번 더 하기
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.75rem',
          width: '100%',
          maxWidth: '600px'
        }}>
          {gameCards.map((card, idx) => {
            const isSelected = selectedCards.includes(idx);
            const isMatched = matchedPairs.includes(card.term);
            const showFace = isSelected || isMatched;

            return (
              <div 
                key={card.id}
                onClick={() => handleCardClick(idx)}
                style={{
                  height: '140px',
                  borderRadius: '12px',
                  border: isMatched ? '2px solid #22c55e' : showFace ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isMatched ? 'rgba(34, 197, 94, 0.08)' : showFace ? 'rgba(30, 58, 138, 0.15)' : 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '0.75rem',
                  cursor: isMatched ? 'default' : 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxSizing: 'border-box'
                }}
              >
                {showFace ? (
                  <span style={{ 
                    fontSize: card.type === 'term' ? '1.1rem' : '0.8rem', 
                    fontWeight: card.type === 'term' ? 'bold' : 'normal',
                    textAlign: 'center', 
                    color: isMatched ? '#22c55e' : 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'keep-all'
                  }}>
                    {card.text}
                  </span>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '1.8rem', fontWeight: 'bold' }}>?</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 3) TEST MODE (Multiple Choice Test with Audio & Voice Variety)
// ----------------------------------------------------
function TestMode({ cards }) {
  const [useTTS, setUseTTS] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const initTest = () => {
    const shuffledCards = [...cards].sort(() => 0.5 - Math.random());
    const testSize = Math.min(10, shuffledCards.length);
    const selected = shuffledCards.slice(0, testSize);

    const generated = selected.map((card) => {
      const otherCards = cards.filter(c => c.term !== card.term);
      const distractors = otherCards
        .map(c => c.term)
        .filter((value, idx, self) => self.indexOf(value) === idx)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      while (distractors.length < 3) {
        distractors.push("기타 역사적 용어 " + (distractors.length + 1));
      }

      // Fresh shuffle of options for each question
      const options = [card.term, ...distractors].sort(() => 0.5 - Math.random());
      const correctIdx = options.indexOf(card.term);

      return {
        definition: card.definition,
        correctTerm: card.term,
        options,
        correctIdx
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsFinished(false);
  };

  useEffect(() => {
    initTest();
  }, [cards]);

  // Static TTS Trigger on question changes
  useEffect(() => {
    if (useTTS && questions.length > 0 && !isFinished && !isSubmitted) {
      playStaticTTS(questions[currentIndex].definition);
    }
    return () => {
      stopStaticTTS();
    };
  }, [currentIndex, useTTS, questions, isFinished, isSubmitted]);

  const handleSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedAnswer === questions[currentIndex].correctIdx;

    if (isCorrect) {
      setScore(prev => prev + 1);
      playCorrectSound();
      // Read correct term aloud
      setTimeout(() => {
        playStaticTTS(`정답은 ${questions[currentIndex].correctTerm}입니다.`);
      }, 900);
    } else {
      playIncorrectSound();
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {isFinished ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Award size={48} style={{ color: 'var(--secondary)' }} />
          <h3>테스트 결과</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            {score} / {questions.length} 문제 맞춤
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            점수: {Math.round((score / questions.length) * 100)}점
          </p>
          <button className="btn btn-primary" onClick={initTest} style={{ marginTop: '1.5rem' }}>
            다시 도전하기
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', alignItems: 'center' }}>
            <span>테스트 문항: <strong>{currentIndex + 1} / {questions.length}</strong></span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => setUseTTS(!useTTS)} 
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', height: '28px', minHeight: 'auto' }}
              >
                {useTTS ? <Volume2 size={13} /> : <VolumeX size={13} />}
                음성 {useTTS ? 'ON' : 'OFF'}
              </button>
              <span>현재 점수: <strong>{score}점</strong></span>
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h4 style={{ color: 'var(--primary)', margin: 0, fontSize: '0.9rem' }}>다음 설명이 뜻하는 역사 용어를 고르세요:</h4>
              <button 
                onClick={() => playStaticTTS(currentQ.definition)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <Volume2 size={15} />
              </button>
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0, wordBreak: 'keep-all' }}>
              "{currentQ.definition}"
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {currentQ.options.map((option, idx) => {
              let bg = 'transparent';
              let border = '1px solid var(--border)';
              let color = 'var(--text)';

              if (isSubmitted) {
                if (idx === currentQ.correctIdx) {
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
                  <span>{idx + 1}. {option}</span>
                  {isSubmitted && idx === currentQ.correctIdx && <Check size={16} style={{ color: '#22c55e' }} />}
                  {isSubmitted && idx === selectedAnswer && idx !== currentQ.correctIdx && <AlertCircle size={16} style={{ color: '#ef4444' }} />}
                </button>
              );
            })}
          </div>

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
                {currentIndex + 1 === questions.length ? '결과 보기' : '다음 문제'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 4) SUBJECTIVE MODE (Subjective Test powered by Gemini)
// ----------------------------------------------------
function SubjectiveMode({ cards }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [gradingResult, setGradingResult] = useState(null); // { grade, feedback }
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [history, setHistory] = useState([]); // Array of { term, grade, feedback }

  const initSubjective = () => {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    const testSize = Math.min(5, shuffled.length); // 5 questions for subjective test
    const selected = shuffled.slice(0, testSize);

    // Mix question types:
    // 0: Given definition -> Write term
    // 1: Given term -> Write definition
    const generated = selected.map((card, idx) => {
      const type = idx % 2; 
      return {
        type,
        term: card.term,
        definition: card.definition,
        questionText: type === 0 
          ? `다음 설명이 가리키는 역사 용어는 무엇인지 쓰시오:\n"${card.definition}"`
          : `역사 용어 [ ${card.term} ]의 역사적 정의 및 뜻을 서술하시오.`,
        expectedAnswer: type === 0 ? card.term : card.definition
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setUserAnswer("");
    setGradingResult(null);
    setIsLoading(false);
    setIsFinished(false);
    setHistory([]);
  };

  useEffect(() => {
    initSubjective();
  }, [cards]);

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setIsLoading(true);
    const currentQ = questions[currentIndex];
    
    const result = await gradeSubjectiveAnswer(
      currentQ.questionText,
      currentQ.expectedAnswer,
      userAnswer
    );

    setGradingResult(result);
    setHistory(prev => [...prev, { term: currentQ.term, grade: result.grade, feedback: result.feedback }]);
    setIsLoading(false);
    
    // Play feedback sound based on grade
    if (result.grade === 'A' || result.grade === 'B') {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    setGradingResult(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {isFinished ? (
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <Award size={48} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
            <h3>서술형 테스트 완료</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((h, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: `4px solid ${h.grade === 'A' ? '#22c55e' : h.grade === 'B' ? '#eab308' : '#ef4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.05rem' }}>{idx + 1}. {h.term}</strong>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    backgroundColor: h.grade === 'A' ? 'rgba(34, 197, 94, 0.15)' : h.grade === 'B' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: h.grade === 'A' ? '#22c55e' : h.grade === 'B' ? '#eab308' : '#ef4444'
                  }}>
                    등급: {h.grade}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{h.feedback}</p>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={initSubjective} style={{ marginTop: '1rem' }}>
            다시 도전하기
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>서술형 문항: <strong>{currentIndex + 1} / {questions.length}</strong></span>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--background)', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>아래 질문을 읽고 답안을 서술하시오:</h4>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0, wordBreak: 'keep-all', whiteSpace: 'pre-line' }}>
              {currentQ.questionText}
            </p>
          </div>

          {/* User Input Area */}
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={gradingResult !== null || isLoading}
              placeholder="여기에 답안을 서술하세요..."
              style={{
                width: '100%',
                height: '110px',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Loader or Grading Output */}
          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', color: 'var(--secondary)' }}>
              <RefreshCw className="animate-spin" size={18} />
              <span>AI 교사가 채점 중입니다... 잠시만 기다려 주세요.</span>
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
                  채점 등급: {gradingResult.grade}
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>{gradingResult.feedback}</p>
              
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                <strong>모범 답안:</strong> {currentQ.expectedAnswer}
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
                채점 받기 (Gemini AI)
              </button>
            ) : (
              <button 
                className="btn btn-secondary" 
                onClick={handleNext}
                style={{ width: '100%' }}
              >
                {currentIndex + 1 === questions.length ? '결과 보기' : '다음 문제'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

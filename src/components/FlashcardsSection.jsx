import { useState, useEffect } from 'react';
import { RefreshCw, Check, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Layers, Award, Volume2, VolumeX } from 'lucide-react';

export default function FlashcardsSection({ chapter }) {
  // Collect all flashcards from all subsections of this chapter
  const allCards = chapter.sections.flatMap(sec => 
    sec.subsections.flatMap(sub => 
      (sub.flashcards || []).map(card => ({
        ...card,
        subsectionTitle: sub.title
      }))
    )
  );

  const [mode, setMode] = useState('study'); // 'study' | 'memory' | 'test'

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
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', padding: '1rem' }}>
        <button 
          className={`btn ${mode === 'study' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('study')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <BookOpen size={18} />
          뒤집기 카드 학습
        </button>
        <button 
          className={`btn ${mode === 'memory' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('memory')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Layers size={18} />
          메모리 매칭 게임
        </button>
        <button 
          className={`btn ${mode === 'test' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMode('test')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Award size={18} />
          용어 객관식 테스트
        </button>
      </div>

      {/* Mode Renderers */}
      {mode === 'study' && <StudyMode cards={allCards} />}
      {mode === 'memory' && <MemoryMode cards={allCards} />}
      {mode === 'test' && <TestMode cards={allCards} />}
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
      <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <span>단원 전체 카드 수: <strong>{cards.length}장</strong></span>
        <span style={{ marginLeft: 'auto' }}>진행률: <strong>{currentIndex + 1} / {cards.length}</strong></span>
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
            className="glass-cardFront"
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
            className="glass-cardBack"
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

  // Initialize the game
  const initGame = () => {
    // Select up to 6 random cards
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    // Create 12 card items (6 terms, 6 definitions)
    const items = [];
    selected.forEach((c) => {
      items.push({ id: `term-${c.term}`, type: 'term', text: c.term, term: c.term });
      items.push({ id: `def-${c.term}`, type: 'def', text: c.definition, term: c.term });
    });

    // Shuffle the 12 items
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
    if (selectedCards.length === 2) return; // wait for check
    if (selectedCards.includes(index)) return; // already clicked
    if (matchedPairs.includes(gameCards[index].term)) return; // already matched

    const nextSelected = [...selectedCards, index];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMoves(prev => prev + 1);
      const firstCard = gameCards[nextSelected[0]];
      const secondCard = gameCards[nextSelected[1]];

      if (firstCard.term === secondCard.term) {
        // Match found
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
        // Match failed - flip back
        setTimeout(() => {
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        <span>매칭 시도 횟수: <strong>{moves}회</strong></span>
        <button onClick={initGame} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
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
                  transform: showFace ? 'rotateY(0deg)' : 'rotateY(0deg)',
                  boxShadow: showFace ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  boxSizing: 'border-box'
                }}
              >
                {showFace ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}>
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
                  </div>
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
// 3) TEST MODE (Multiple Choice Test)
// ----------------------------------------------------
function TestMode({ cards }) {
  const [useTTS, setUseTTS] = useState(true);

  // Helper to speak Korean text
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Cancel current speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95; // Clear natural rate
    window.speechSynthesis.speak(utterance);
  };

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const initTest = () => {
    // Generate questions for all cards (up to 10 questions to keep it structured)
    const shuffledCards = [...cards].sort(() => 0.5 - Math.random());
    const testSize = Math.min(10, shuffledCards.length);
    const selected = shuffledCards.slice(0, testSize);

    const generated = selected.map((card) => {
      // Find 3 distractors from the rest of the cards
      const otherCards = cards.filter(c => c.term !== card.term);
      const distractors = otherCards
        .map(c => c.term)
        .filter((value, idx, self) => self.indexOf(value) === idx) // unique terms
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // In case we don't have enough cards, pad with placeholders
      while (distractors.length < 3) {
        distractors.push("기타 역사적 용어 " + (distractors.length + 1));
      }

      // Mix correct answer with distractors
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

  // TTS Trigger on question changes
  useEffect(() => {
    if (useTTS && questions.length > 0 && !isFinished) {
      speakText(questions[currentIndex].definition);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex, useTTS, questions, isFinished]);

  const handleSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    if (selectedAnswer === questions[currentIndex].correctIdx) {
      setScore(prev => prev + 1);
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
                title={useTTS ? "자동 읽기 끄기" : "자동 읽기 켜기"}
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
                onClick={() => speakText(currentQ.definition)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                title="다시 듣기"
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

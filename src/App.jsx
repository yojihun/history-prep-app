import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chapter from './pages/Chapter';
import IncorrectNotes from './pages/IncorrectNotes';
import { playLevelUpSound, playGemRewardSound, playMilestoneFanfare, playXpSound, playMascotNotifySound, playMascotSpeech, stopMascotSpeech } from './utils/audio';
import { MASCOT_LINES } from './data/mascotFeedback';

export const SHOP_ITEMS = [
  { id: 'prism', name: '분광 프리즘', cost: 3, image: '/images/pottery.png', desc: '뉴턴이 빛의 분산을 증명할 때 사용한 유리 프리즘 모형입니다.' },
  { id: 'microscope', name: '복합 현미경', cost: 4, image: '/images/mummy.png', desc: '세포를 최초로 관찰하는 데 사용한 고전적 현미경 모형입니다.' },
  { id: 'telescope', name: '갈릴레이 망원경', cost: 5, image: '/images/terracotta.png', desc: '목성의 위성들을 관찰할 때 사용했던 유서 깊은 망원경입니다.' },
  { id: 'magnet', name: 'U자형 자석', cost: 4, image: '/images/changan.png', desc: '자기장의 분포와 세기를 시각화하여 관찰하는 교육용 자석입니다.' },
  { id: 'beaker', name: '비커 세트', cost: 6, image: '/images/sillok.png', desc: '액체의 부피 측정 및 용해 실험 시 필수적인 연구 장비입니다.' },
  { id: 'periodic', name: '원소 주기율표', cost: 6, image: '/images/forbidden_city.png', desc: '원소들을 성질에 따라 체계적으로 분류한 현대 화학의 지도입니다.' }
];


function App() {
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('current_nickname') || '도담';
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(nickname);

  // Gamification States
  const [xp, setXp] = useState(0);
  const [gems, setGems] = useState(0);
  const [level, setLevel] = useState(1);
  const [unlockedItems, setUnlockedItems] = useState([]);

  // Animation and Popup states
  const [triggerLevelUp, setTriggerLevelUp] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState("");
  const [mascotBubble, setMascotBubble] = useState(null);

  const prefix = nickname ? `${nickname}_` : '';

  // Load profile states reactive to nickname
  useEffect(() => {
    setXp(parseInt(localStorage.getItem(`${prefix}xp`)) || 0);
    setGems(parseInt(localStorage.getItem(`${prefix}gems`)) || 0);
    setLevel(parseInt(localStorage.getItem(`${prefix}level`)) || 1);
    try {
      const items = localStorage.getItem(`${prefix}unlocked_items`);
      setUnlockedItems(items ? JSON.parse(items) : []);
    } catch {
      setUnlockedItems([]);
    }
  }, [nickname]);

  const addXp = (amount) => {
    setXp(prev => {
      const nextXp = prev + amount;
      localStorage.setItem(`${prefix}xp`, nextXp);
      
      const nextLevel = Math.floor(nextXp / 100) + 1;
      setLevel(currLevel => {
        if (nextLevel > currLevel) {
          localStorage.setItem(`${prefix}level`, nextLevel);
          setLevelUpMessage(`레벨 업! Level ${nextLevel} 달성! 🎉`);
          playLevelUpSound();
          setTriggerLevelUp(true);
        } else {
          playXpSound();
        }
        return nextLevel;
      });
      
      return nextXp;
    });
  };

  const addGems = (amount) => {
    setGems(prev => {
      const next = prev + amount;
      localStorage.setItem(`${prefix}gems`, next);
      playGemRewardSound();
      return next;
    });
  };

  const deductGems = (amount) => {
    setGems(prev => {
      const next = Math.max(0, prev - amount);
      localStorage.setItem(`${prefix}gems`, next);
      return next;
    });
  };

  const unlockItem = (itemId) => {
    setUnlockedItems(prev => {
      const next = [...prev, itemId];
      localStorage.setItem(`${prefix}unlocked_items`, JSON.stringify(next));
      playMilestoneFanfare();
      return next;
    });
  };

  const triggerMascot = (category, subtext) => {
    const mascotTypes = ['einstein', 'curie', 'galileo'];
    const randomMascot = mascotTypes[Math.floor(Math.random() * mascotTypes.length)];
    
    const lines = MASCOT_LINES[randomMascot]?.[category] || [];
    if (lines.length === 0) return;
    
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    
    const mascots = {
      einstein: { name: 'Albert Einstein', image: '/images/einstein.png' },
      curie: { name: 'Marie Curie', image: '/images/curie.png' },
      galileo: { name: 'Galileo Galilei', image: '/images/galileo.png' }
    };
    
    setMascotBubble({
      ...mascots[randomMascot],
      text: randomLine.text,
      subtext: subtext
    });
    
    // Play character notification sound
    playMascotNotifySound();
    
    // Play character speech offline locally
    playMascotSpeech(randomLine.id);
    
    // Auto hide after 3.8 seconds
    setTimeout(() => {
      setMascotBubble(null);
    }, 3800);
  };

  return (
    <Router>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <header style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, hsla(270, 95%, 68%, 0.12) 0%, hsla(180, 100%, 45%, 0.08) 100%)',
          borderBottom: '2px solid var(--primary)',
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'blur(16px)'
        }}>
          <h1 style={{ fontSize: '1.35rem', margin: 0 }}>중학교 2학년 과학 2차 시험대비</h1>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* 레벨 & 보석 정보 표시 */}
            <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '20px', margin: 0, fontSize: '0.95rem' }}>
              <div>⭐ <strong>Lv.{level}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({xp % 100}/100 XP)</span></div>
              <div style={{ borderLeft: '1px solid var(--border)', height: '16px' }} />
              <div>💎 <strong>{gems}</strong> 개</div>
            </div>

            {/* 학습자 프로필 카드 */}
            <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '20px', margin: 0 }}>
              {isEditingNickname ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      width: '120px'
                    }}
                    maxLength={10}
                  />
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      const trimmed = newNickname.trim() || '도담';
                      setNickname(trimmed);
                      localStorage.setItem('current_nickname', trimmed);
                      setIsEditingNickname(false);
                    }}
                  >
                    저장
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>학습자:</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{nickname}</strong>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    onClick={() => {
                      setNewNickname(nickname);
                      setIsEditingNickname(true);
                    }}
                  >
                    변경
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={
              <Dashboard 
                nickname={nickname} 
                level={level}
                xp={xp}
                gems={gems}
                unlockedItems={unlockedItems}
                deductGems={deductGems}
                unlockItem={unlockItem}
              />
            } />
            <Route path="/chapter/:chapterId" element={
              <Chapter 
                nickname={nickname} 
                addXp={addXp}
                addGems={addGems}
                triggerMascot={triggerMascot}
              />
            } />
            <Route path="/incorrect-notes" element={
              <IncorrectNotes 
                nickname={nickname}
                addXp={addXp}
                addGems={addGems}
                triggerMascot={triggerMascot}
              />
            } />
          </Routes>
        </main>
        
        <footer style={{ marginTop: '1.5rem', padding: '1rem 0 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', borderTop: '1px solid var(--border)' }}>
          <p>created by Daddy.Dodam.Kim 2026. 6. 5.</p>
        </footer>

        {/* 1) 듀오링고 스타일의 레벨 업 세레머니 모달 */}
        {triggerLevelUp && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div className="glass-card" style={{
              maxWidth: '450px',
              width: '90%',
              textAlign: 'center',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '2px solid var(--secondary)'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--secondary)'
              }}>
                <img 
                  src="/images/einstein.png" 
                  alt="Einstein Mascot" 
                  style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                />
              </div>

              <h2 style={{ fontSize: '1.75rem', color: 'var(--secondary)', margin: 0 }}>🎉 LEVEL UP! 🎉</h2>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{levelUpMessage}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                "Outstanding progress! Your dedication to scientific inquiry has unlocked new advanced equipment in the laboratory store. Use your gems to inspect them!"
              </p>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', fontSize: '1.05rem' }}
                onClick={() => setTriggerLevelUp(false)}
              >
                Let's inspect! (실험실 확인)
              </button>
            </div>
          </div>
        )}

        {/* 2) floating 실시간 나노바나나 캐릭터 피드백 피치버블 */}
        {mascotBubble && (
          <div 
            onClick={() => {
              setMascotBubble(null);
              stopMascotSpeech();
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1900,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(5px)',
              animation: 'fadeIn 0.25s ease-out',
              cursor: 'pointer'
            }}
          >
            <div className="mascot-speaking" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              maxWidth: '600px',
              width: '95%',
              textAlign: 'center'
            }}>
              {/* 캐릭터 이미지 (배경 투명하게 마스코트만 부각 - 4배 크기) */}
              <div style={{
                width: '350px',
                height: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.45))'
              }}>
                <img 
                  src={mascotBubble.image} 
                  alt={mascotBubble.name}
                  style={{ width: '320px', height: '320px', objectFit: 'contain' }}
                />
              </div>

              {/* 말풍선 */}
              <div className="glass-card" style={{
                padding: '1.25rem 1.75rem',
                borderRadius: '24px',
                backgroundColor: 'var(--surface)',
                border: '2px solid var(--primary)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
                margin: 0
              }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                  👤 {mascotBubble.name}
                </strong>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 'bold', lineHeight: '1.5', wordBreak: 'keep-all', color: 'var(--text)' }}>
                  "{mascotBubble.text}"
                </p>
                {mascotBubble.subtext && (
                  <span style={{ fontSize: '0.95rem', color: 'var(--secondary)', fontWeight: 'bold', display: 'block', marginTop: '0.5rem' }}>
                    {mascotBubble.subtext}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

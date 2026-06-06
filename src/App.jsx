import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chapter from './pages/Chapter';
import { playLevelUpSound, playGemRewardSound, playMilestoneFanfare } from './utils/audio';

export const SHOP_ITEMS = [
  { id: 'pottery', name: '빗살무늬 토기', cost: 3, image: '/images/pottery.png', desc: '신석기 시대 식량 저장과 조리에 사용된 대표적 토기입니다.' },
  { id: 'mummy', name: '이집트 미라', cost: 4, image: '/images/mummy.png', desc: '고대 이집트의 내세 신앙과 영혼 불멸관을 보여주는 유물입니다.' },
  { id: 'terracotta', name: '병마용 병사', cost: 5, image: '/images/terracotta.png', desc: '진시황릉 인근에 묻힌 강력한 황제 권력의 군사 모형입니다.' },
  { id: 'changan', name: '장안성 전경', cost: 4, image: '/images/changan.png', desc: '국제적이고 개방적이었던 당나라의 계획도시 수도 전경입니다.' },
  { id: 'sillok', name: '조선왕조실록', cost: 6, image: '/images/sillok.png', desc: '조선 시대의 대표적 사료이자 유네스코 세계기록유산입니다.' },
  { id: 'forbidden', name: '자금성 모형', cost: 6, image: '/images/forbidden_city.png', desc: '명·청 시대 황제 독재 권력의 위엄을 상징하는 거대 궁궐입니다.' }
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

  const triggerMascot = (type, text, subtext) => {
    const mascots = {
      king: { name: '세종 바나나 대왕', image: '/images/king_banana.png' },
      general: { name: '이순신 바나나 장군', image: '/images/general_banana.png' },
      scholar: { name: '바나나 선비', image: '/images/scholar_banana.png' }
    };
    
    setMascotBubble({
      ...mascots[type],
      text,
      subtext
    });
    
    // Auto hide after 3.8 seconds
    setTimeout(() => {
      setMascotBubble(null);
    }, 3800);
  };

  return (
    <Router>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>시흥은행중학교 2학년 1학기 2차 시험 - 역사</h1>
          
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
          </Routes>
        </main>
        
        <footer style={{ marginTop: '4rem', padding: '2rem 0 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', borderTop: '1px solid var(--border)' }}>
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
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                border: '3px solid var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--secondary)'
              }}>
                <img 
                  src="/images/king_banana.png" 
                  alt="King Sejong Banana" 
                  style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                />
              </div>

              <h2 style={{ fontSize: '1.75rem', color: 'var(--secondary)', margin: 0 }}>🎉 LEVEL UP! 🎉</h2>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{levelUpMessage}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                "경의 학업 열정이 대단하구려! 학식이 날로 정진하여 기쁘기 그지없소. 내 특별히 황실의 보물고를 열어줄 테니 보석으로 귀한 유물들을 수집해 보시게나!"
              </p>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', fontSize: '1.05rem' }}
                onClick={() => setTriggerLevelUp(false)}
              >
                영광입니다! (보물고 확인)
              </button>
            </div>
          </div>
        )}

        {/* 2) floating 실시간 나노바나나 캐릭터 피드백 피치버블 */}
        {mascotBubble && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1rem',
            animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* 말풍선 */}
            <div className="glass-card" style={{
              maxWidth: '260px',
              padding: '0.85rem 1.1rem',
              borderRadius: '16px',
              borderBottomRightRadius: '2px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '-8px',
                width: '16px',
                height: '16px',
                backgroundColor: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                transform: 'rotate(-45deg)',
                zIndex: -1
              }} />
              <strong style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>
                👤 {mascotBubble.name}
              </strong>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.92rem', fontWeight: 'bold', lineHeight: '1.4', wordBreak: 'keep-all' }}>
                "{mascotBubble.text}"
              </p>
              {mascotBubble.subtext && (
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 'bold' }}>
                  {mascotBubble.subtext}
                </span>
              )}
            </div>

            {/* 캐릭터 이미지 */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              <img 
                src={mascotBubble.image} 
                alt={mascotBubble.name}
                style={{ width: '68px', height: '68px', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

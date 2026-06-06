import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chapter from './pages/Chapter';

function App() {
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('current_nickname') || '기본 학습자';
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(nickname);

  return (
    <Router>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>시흥은행중학교 2학년 1학기 2차 시험 - 역사</h1>
          
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
                    const trimmed = newNickname.trim() || '기본 학습자';
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
        </header>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard nickname={nickname} />} />
            <Route path="/chapter/:chapterId" element={<Chapter nickname={nickname} />} />
          </Routes>
        </main>
        
        <footer style={{ marginTop: '4rem', padding: '2rem 0 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', borderTop: '1px solid var(--border)' }}>
          <p>created by Daddy.Dodam.Kim 2026. 6. 5.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;


import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chapter from './pages/Chapter';

function App() {
  return (
    <Router>
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.8rem' }}>시흥은행중학교 2학년 1학기 2차 시험 - 역사</h1>
        </header>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chapter/:chapterId" element={<Chapter />} />
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

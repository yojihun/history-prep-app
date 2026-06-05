import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Chapter from './pages/Chapter';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>역사 2-1 기말고사 대비</h1>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chapter/:chapterId" element={<Chapter />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

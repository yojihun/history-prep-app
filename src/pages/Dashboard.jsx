import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { chapters } from '../data/chapters';
import Timeline from '../components/Timeline';

export default function Dashboard() {
  return (
    <div className="animate-fade-in">

      <Timeline />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {chapters.map((chapter, idx) => (
          <Link to={`/chapter/${chapter.id}`} key={chapter.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <BookOpen size={24} />
                <h3>{chapter.title}</h3>
              </div>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', flex: 1, color: 'var(--text-muted)' }}>
                {chapter.sections.map(sec => (
                  <li key={sec.id} style={{ marginBottom: '0.5rem' }}>{sec.title}</li>
                ))}
              </ul>
              <button className="btn btn-primary" style={{ width: '100%' }}>
                학습하기
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

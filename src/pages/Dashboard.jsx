import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Sparkles } from 'lucide-react';
import { chapters } from '../data/chapters';
import Timeline from '../components/Timeline';
import { SHOP_ITEMS } from '../App';

export default function Dashboard({ level, xp, gems, unlockedItems, deductGems, unlockItem }) {
  const [activeTab, setActiveTab] = useState('chapters'); // 'chapters' | 'museum'

  const handleBuyItem = (item) => {
    if (gems >= item.cost && !unlockedItems.includes(item.id)) {
      deductGems(item.cost);
      unlockItem(item.id);
    }
  };

  return (
    <div className="animate-fade-in">
      <Timeline />

      {/* 대시보드 탭 헤더 */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button 
          onClick={() => setActiveTab('chapters')}
          className={`btn ${activeTab === 'chapters' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '20px' }}
        >
          📖 학습 단원 목록
        </button>
        <button 
          onClick={() => setActiveTab('museum')}
          className={`btn ${activeTab === 'museum' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          🏛️ 나노바나나 보물 박물관 ({unlockedItems.length} / {SHOP_ITEMS.length})
        </button>
      </div>

      {activeTab === 'chapters' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {chapters.map((chapter) => (
            <Link to={`/chapter/${chapter.id}`} key={chapter.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* 상점 정보 및 듀오링고 캐릭터 인사 */}
          <div className="glass-card" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem', 
            backgroundColor: 'rgba(217, 119, 6, 0.04)',
            border: '1px dashed var(--secondary)',
            flexWrap: 'wrap'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: '2px solid var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <img 
                src="/images/king_banana.png" 
                alt="Sejong Banana" 
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h3 style={{ color: 'var(--secondary)', margin: '0 0 0.5rem 0' }}>바나나 대왕의 역사 상점 & 박물관</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                학습 목표 달성, 서술형 만점(A, B 등급), 그리고 퀴즈 완성을 통해 보석(💎)을 모으세요! 모은 보석으로 교과서 속에 등장하는 역사적 보물들을 박물관에 해금해 채워나갈 수 있습니다.
              </p>
            </div>
          </div>

          {/* 박물관 보물 리스트 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {SHOP_ITEMS.map((item) => {
              const isUnlocked = unlockedItems.includes(item.id);
              return (
                <div key={item.id} className="glass-card" style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  opacity: isUnlocked ? 1 : 0.8,
                  borderColor: isUnlocked ? 'var(--secondary)' : 'var(--border)',
                  backgroundColor: isUnlocked ? 'rgba(217, 119, 6, 0.02)' : 'var(--surface)',
                  transition: 'all 0.2s'
                }}>
                  {/* 보물 이미지 */}
                  <div style={{ 
                    position: 'relative', 
                    height: '160px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    overflow: 'hidden',
                    filter: isUnlocked ? 'none' : 'grayscale(100%) blur(1px)'
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                    />
                    {!isUnlocked && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        gap: '0.25rem'
                      }}>
                        <span>💎</span> {item.cost}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.name}</span>
                      {isUnlocked && <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(217, 119, 6, 0.15)', color: 'var(--secondary)', borderRadius: '4px' }}>수집 완료 🏛️</span>}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', minHeight: '40px' }}>
                      {item.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    {isUnlocked ? (
                      <button className="btn btn-outline" disabled style={{ width: '100%', borderColor: 'var(--secondary)', color: 'var(--secondary)', opacity: 0.6, cursor: 'default' }}>
                        박물관 진열 중
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleBuyItem(item)}
                        disabled={gems < item.cost}
                        style={{ 
                          width: '100%', 
                          backgroundColor: gems >= item.cost ? 'var(--secondary)' : 'var(--border)',
                          color: gems >= item.cost ? '#white' : 'var(--text-muted)',
                        }}
                      >
                        {gems >= item.cost ? `💎 ${item.cost}개로 수집하기` : `보석 부족 (💎 ${item.cost}개 필요)`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

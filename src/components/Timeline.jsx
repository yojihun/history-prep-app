import { useState } from 'react';
import { X } from 'lucide-react';

const timelineEvents = [
  { 
    year: '약 390만 년 전', 
    title: '오스트랄로피테쿠스 아파렌시스 출현', 
    mindmap: {
      root: '오스트랄로피테쿠스 아파렌시스',
      children: [
        { text: '최초의 인류' },
        { text: '[두 발]로 걷기 (직립 보행)' },
        { text: '간단한 [도구] 사용' }
      ]
    }
  },
  { 
    year: '기원전 8000년경', 
    title: '신석기 시대 시작 (농경과 목축)',
    mindmap: {
      root: '신석기 시대',
      children: [
        { text: '[농경]과 목축 시작 (신석기 혁명)' },
        { text: '돌을 갈아 만든 [간석기] 사용' },
        { text: '식량 저장을 위한 [빗살무늬 토기]' },
        { text: '움집을 짓고 [정착] 생활' }
      ]
    }
  },
  { 
    year: '기원전 3000년경', 
    title: '메소포타미아/이집트 문명 발생',
    mindmap: {
      root: '고대 4대 문명',
      children: [
        { text: '농사짓기 좋은 [큰 강] 유역' },
        { text: '[청동기] 무기와 도구 사용' },
        { text: '기록을 위한 [문자] 발명' },
        { text: '도시 국가의 성립과 [계급] 발생' }
      ]
    }
  },
  { 
    year: '기원전 221년', 
    title: '진(秦)의 중국 통일',
    mindmap: {
      root: '진나라 통일',
      children: [
        { text: '최초의 황제 [진시황제]' },
        { text: '중앙 집권을 위한 [군현제] 실시' },
        { text: '화폐, 도량형, [문자] 통일' },
        { text: '흉노 방어를 위한 [만리장성]' }
      ]
    }
  },
  { 
    year: '기원전 202년', 
    title: '한(漢) 건국',
    mindmap: {
      root: '한나라 발전',
      children: [
        { text: '전성기를 이끈 [한 무제]' },
        { text: '[유가(유교)] 사상을 통치 이념으로 삼음' },
        { text: '장건의 파견과 [비단길] 개척' },
        { text: '소금과 철의 [전매] 제도' }
      ]
    }
  },
  { 
    year: '589년', 
    title: '수(隋)의 중국 통일',
    mindmap: {
      root: '수나라',
      children: [
        { text: '위진 남북조 시대 통일' },
        { text: '남북을 잇는 [대운하] 건설' },
        { text: '[과거제] 실시' },
        { text: '고구려 원정 실패로 멸망' }
      ]
    }
  },
  { 
    year: '618년', 
    title: '당(唐) 건국',
    mindmap: {
      root: '당나라',
      children: [
        { text: '중앙 행정 조직 [3성 6부]제' },
        { text: '서역과 교류하는 [개방적] 문화' },
        { text: '국제 도시 [장안]' },
        { text: '토지 제도인 [균전제]' }
      ]
    }
  },
  { 
    year: '960년', 
    title: '송(宋) 건국',
    mindmap: {
      root: '송나라',
      children: [
        { text: '문신을 우대하는 [문치주의]' },
        { text: '우주와 인간 본성을 탐구하는 [성리학]' },
        { text: '새로운 지배층 [사대부]' },
        { text: '강남 지역의 [농업]과 상공업 발달' }
      ]
    }
  },
  { 
    year: '1206년', 
    title: '몽골 제국 성립',
    mindmap: {
      root: '몽골 제국 (원)',
      children: [
        { text: '[칭기즈 칸]의 통일' },
        { text: '교통망을 연결하는 [역참] 제도' },
        { text: '엄격한 신분제인 [몽골인 제일주의]' },
        { text: '동서 문화 교류 확대 ([비단길] 안정)' }
      ]
    }
  },
  { 
    year: '1368년', 
    title: '명(明) 건국',
    mindmap: {
      root: '명나라',
      children: [
        { text: '한족 왕조의 부흥' },
        { text: '홍무제의 농촌 통제책 [이갑제]' },
        { text: '황제 독재 권력 강화' },
        { text: '정화의 [항해] (남해 원정)' }
      ]
    }
  },
  { 
    year: '1616년', 
    title: '후금 건국 (이후 청)',
    mindmap: {
      root: '청나라',
      children: [
        { text: '만주족이 세운 왕조' },
        { text: '강압책: [변발]과 호복 강요' },
        { text: '회유책: 한족 관리를 함께 등용 ([만한 병용])' },
        { text: '신대륙에서 [은] 대량 유입' }
      ]
    }
  }
];

export default function Timeline() {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="glass-card animate-fade-in" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>주요 사건 타임라인</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>가로로 스크롤하여 확인하고, 사건을 클릭해 마인드맵을 펼쳐보세요.</span>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '2rem', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', position: 'relative', minWidth: '1600px', height: '140px', alignItems: 'center' }}>
          {/* 가로 선 */}
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', backgroundColor: 'var(--border)', transform: 'translateY(-50%)', zIndex: 1 }}></div>
          
          {timelineEvents.map((event, idx) => (
            <div 
              key={idx} 
              style={{ 
                flex: 1, 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                zIndex: 2,
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => setSelectedEvent(event)}
            >
              <div style={{ 
                position: 'absolute', 
                top: idx % 2 === 0 ? '-4.5rem' : 'auto', 
                bottom: idx % 2 === 1 ? '-4.5rem' : 'auto',
                textAlign: 'center',
                width: '140px',
                opacity: hoverIndex === idx || hoverIndex === null ? 1 : 0.5,
                transition: 'all 0.3s',
                transform: hoverIndex === idx ? 'scale(1.1)' : 'scale(1)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.2rem' }}>{event.year}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: '1.2' }}>{event.title}</div>
              </div>
              
              <div style={{ 
                width: hoverIndex === idx ? '20px' : '14px', 
                height: hoverIndex === idx ? '20px' : '14px', 
                backgroundColor: hoverIndex === idx ? 'var(--secondary)' : 'var(--primary)', 
                borderRadius: '50%', 
                border: '3px solid var(--background)',
                transition: 'all 0.3s',
                boxShadow: hoverIndex === idx ? '0 0 10px var(--secondary)' : 'none'
              }}></div>
            </div>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <div className="animate-fade-in" style={{ 
          marginTop: '2rem', 
          padding: '2rem', 
          backgroundColor: 'var(--background)', 
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          position: 'relative'
        }}>
          <button 
            onClick={() => setSelectedEvent(null)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>
          
          <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary)' }}>
            {selectedEvent.title} 마인드맵
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <MindmapNode node={selectedEvent.mindmap} isRoot />
          </div>
        </div>
      )}
    </div>
  );
}

function MindmapNode({ node, isRoot }) {
  if (isRoot) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        {/* Root Node */}
        <div style={{ 
          padding: '1rem 2rem', 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          borderRadius: '30px',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          position: 'relative'
        }}>
          {node.root}
          {/* 하단 연결선 */}
          <div style={{ position: 'absolute', bottom: '-2rem', left: '50%', width: '2px', height: '2rem', backgroundColor: 'var(--border)' }}></div>
        </div>
        
        {/* Children Level */}
        <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* 가로 연결선 (자식이 2개 이상일 때) */}
          {node.children.length > 1 && (
            <div style={{ 
              position: 'absolute', 
              top: '-1px', 
              left: '10%', 
              right: '10%', 
              height: '2px', 
              backgroundColor: 'var(--border)' 
            }}></div>
          )}
          
          {node.children.map((child, idx) => (
            <div key={`${node.root}-${idx}`} style={{ position: 'relative', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 세로 연결선 */}
              <div style={{ position: 'absolute', top: '0', left: '50%', width: '2px', height: '1.5rem', backgroundColor: 'var(--border)' }}></div>
              <MindmapChild text={child.text} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function MindmapChild({ text }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const parts = text.split(/(\[.*?\])/);
  const hasBlank = parts.some(p => p.startsWith('[') && p.endsWith(']'));

  return (
    <div 
      onClick={() => { if (hasBlank) setShowAnswer(!showAnswer) }}
      style={{ 
        padding: '0.8rem 1.2rem', 
        backgroundColor: 'var(--surface)', 
        border: `2px solid ${hasBlank && !showAnswer ? 'var(--secondary)' : 'var(--border)'}`, 
        borderRadius: '12px',
        maxWidth: '200px',
        textAlign: 'center',
        cursor: hasBlank ? 'pointer' : 'default',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.3s'
      }}
    >
      <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const answerText = part.slice(1, -1);
            return (
              <span 
                key={i} 
                style={{
                  display: 'inline-block',
                  minWidth: '50px',
                  padding: '0 0.3rem',
                  borderBottom: '2px dashed var(--secondary)',
                  color: showAnswer ? 'var(--secondary)' : 'transparent',
                  fontWeight: 'bold',
                  backgroundColor: showAnswer ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                  transition: 'all 0.3s'
                }}
              >
                {answerText}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
      {hasBlank && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          {showAnswer ? '숨기기' : '클릭하여 빈칸 확인'}
        </div>
      )}
    </div>
  );
}

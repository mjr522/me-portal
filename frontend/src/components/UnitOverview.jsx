import React from 'react';

export default function UnitOverview({ unit, completedTopics, onLaunchLesson }) {
  if (!unit) return null;

  const numTopics = unit.topics.length;
  const numCompleted = unit.topics.filter(t => completedTopics.has(t)).length;
  const progressPercent = numTopics > 0 ? Math.round((numCompleted / numTopics) * 100) : 0;

  return (
    <div>
      {/* Unit Hero Banner */}
      <div style={{ background: unit.color_gradient, padding: '30px', borderRadius: '18px', color: 'white', marginBottom: '30px' }}>
        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
          {unit.badge}
        </span>
        <h1 style={{ marginTop: '10px', marginBottom: '10px', fontWeight: 700, color: 'white' }}>
          {unit.icon} {unit.title}
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{unit.desc}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left Column: Topics List */}
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>📚 Unit Curriculum & Topics</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Select a topic below or from the sidebar to open the interactive lesson sandbox:</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {unit.topics.map((topic, idx) => {
              const isCompleted = completedTopics.has(topic);
              const isSim = topic.includes("Lesson 3") || topic.includes("Lesson 6") || topic.includes("Lesson 14") || topic.includes("Lesson 15") || topic.includes("Lesson 20") || topic.includes("Lesson 26") || topic.includes("Lesson 30") || topic.includes("Lesson 36");
              
              return (
                <div
                  key={topic}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isCompleted && <span style={{ color: '#10b981' }}>✅</span>}
                      {idx + 1}. {topic}
                    </div>
                    <span
                      style={{
                        background: isSim ? '#ea580c' : '#475569',
                        color: 'white',
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 500,
                        display: 'inline-block',
                        marginTop: '6px'
                      }}
                    >
                      {isSim ? "🔥 Interactive Simulator" : "📝 Conceptual Lesson"}
                    </span>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: '0.88rem' }}
                    onClick={() => onLaunchLesson(topic)}
                  >
                    Launch Lesson ➡️
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Unit Progress & Objectives */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              COMPLETION PROGRESS
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: unit.accent_color }}>
              {numCompleted} / {numTopics}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '5px' }}>Topics Mastered ({progressPercent}%)</div>
            <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '4px', marginTop: '15px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: unit.accent_color, width: `${progressPercent}%`, transition: 'width 0.3s' }}></div>
            </div>
          </div>

          <div className="objectives-card">
            <h4 style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>💡 Unit Learning Objectives</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Work through the interactive simulators and concept checks to master each lesson's core mechanics objectives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

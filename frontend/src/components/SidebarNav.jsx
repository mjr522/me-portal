import React from 'react';

export default function SidebarNav({ unit, currentTopic, onSelectTopic, onReturnHome }) {
  if (!unit) return null;

  const topicsOptions = ["Unit Overview", ...unit.topics];

  return (
    <aside className="sidebar">
      <button className="btn-secondary" onClick={onReturnHome} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        ⬅ Return to Course Home
      </button>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '10px 0' }} />

      <div>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>
          {unit.icon} {unit.badge}
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 12px 0' }}>{unit.title}</h3>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
          Navigate Curriculum:
        </div>
        {topicsOptions.map((topic) => {
          const isActive = topic === "Unit Overview" ? currentTopic === null : currentTopic === topic;
          return (
            <div
              key={topic}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTopic(topic === "Unit Overview" ? null : topic)}
            >
              <span>{topic === "Unit Overview" ? "🏠" : "📄"}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topic}</span>
            </div>
          );
        })}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '10px 0' }} />

      {/* Sidebar Mechanics Glossary */}
      <div style={{ fontSize: '0.85rem' }}>
        <h4 style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🏗️ Mechanics Guide
        </h4>
        <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>Equilibrium</strong>: Net forces & moments sum to zero (ΣF=0, ΣM=0).</li>
          <li><strong>Simply Supported</strong>: Left Pin, Right Roller.</li>
          <li><strong>Stress (σ, τ)</strong>: Force per unit area (MPa or psi).</li>
          <li><strong>UDL</strong>: Uniformly distributed load along length.</li>
        </ul>
      </div>
    </aside>
  );
}

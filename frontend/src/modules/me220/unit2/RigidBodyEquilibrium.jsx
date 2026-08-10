import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const KaTeX = ({ math, renderError }) => {
  const containerRef = React.useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: false,
          throwOnError: false,
        });
      } catch (error) {
        if (renderError) renderError(error);
      }
    }
  }, [math, renderError]);
  return <span ref={containerRef} />;
};

export default function RigidBodyEquilibrium() {
  // Phase state: 'instructions' | 'guided_question' | 'poe_predict' | 'poe_observe' | 'poe_explain'
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeHypothesis, setPoeHypothesis] = useState(null);
  const [poeFinalAnswer, setPoeFinalAnswer] = useState(null);

  // Simulator state
  const [P, setP] = useState(60);
  const [xp, setXp] = useState(2.5);
  const [leftSupport, setLeftSupport] = useState('pin'); // 'pin', 'roller', 'fixed'
  const [rightSupport, setRightSupport] = useState('roller'); // 'pin', 'roller', 'free'

  const isLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoeHypothesis(null);
    setPoeFinalAnswer(null);
    setP(60);
    setXp(2.5);
    setLeftSupport('pin');
    setRightSupport('roller');
  };

  // Determinacy calculation
  const L = 10.0;
  let unknowns = 0;
  if (leftSupport === 'roller') unknowns += 1;
  else if (leftSupport === 'pin') unknowns += 2;
  else if (leftSupport === 'fixed') unknowns += 3;

  if (rightSupport === 'roller') unknowns += 1;
  else if (rightSupport === 'pin') unknowns += 2;

  let status = 'determinate';
  if (unknowns < 3 || (leftSupport === 'roller' && rightSupport === 'roller')) {
    status = 'unstable';
  } else if (unknowns > 3) {
    status = 'indeterminate';
  }

  let Ray = 0, Rby = 0, Rax = 0, Ma = 0;
  let solved = false;

  if (status === 'determinate') {
    solved = true;
    if (leftSupport === 'fixed' && rightSupport === 'free') {
      Ray = P;
      Rax = 0;
      Ma = P * xp;
    } else if (leftSupport === 'pin' && rightSupport === 'roller') {
      Rby = (P * xp) / L;
      Ray = P - Rby;
      Rax = 0;
    } else if (leftSupport === 'roller' && rightSupport === 'pin') {
      Ray = (P * (L - xp)) / L;
      Rby = P - Ray;
      Rax = 0;
    }
  }

  // Plotly data setup
  const traces = [];

  // Beam line
  traces.push({
    x: [0, 10],
    y: [0, 0],
    mode: 'lines',
    line: {
      color: status === 'unstable' ? '#ef4444' : (status === 'indeterminate' ? '#f59e0b' : '#475569'),
      width: 22
    },
    name: 'Beam',
    hoverinfo: 'skip'
  });

  // Left support drawing (Equilateral Pin & Roller)
  const pinW = 0.7; // Half width
  const pinH = 1.21; // Height for equilateral triangle (1.4 * sqrt(3)/2)
  if (leftSupport === 'pin') {
    traces.push({
      x: [-pinW, 0, pinW, -pinW],
      y: [-pinH, 0, -pinH, -pinH],
      fill: 'toself',
      mode: 'lines',
      line: { color: '#3b82f6', width: 2.5 },
      fillcolor: 'rgba(59, 130, 246, 0.25)',
      showlegend: false,
      hoverinfo: 'skip'
    });
    // Ground line
    traces.push({
      x: [-pinW - 0.2, pinW + 0.2],
      y: [-pinH, -pinH],
      mode: 'lines',
      line: { color: '#3b82f6', width: 3 },
      showlegend: false,
      hoverinfo: 'skip'
    });
  } else if (leftSupport === 'roller') {
    const rH = 0.95;
    traces.push({
      x: [-pinW, 0, pinW, -pinW],
      y: [-rH, 0, -rH, -rH],
      fill: 'toself',
      mode: 'lines',
      line: { color: '#10b981', width: 2.5 },
      fillcolor: 'rgba(16, 185, 129, 0.25)',
      showlegend: false,
      hoverinfo: 'skip'
    });
    // Roller wheels
    traces.push({
      x: [-0.35, 0.35],
      y: [-rH - 0.2, -rH - 0.2],
      mode: 'markers',
      marker: { size: 10, color: '#10b981', symbol: 'circle' },
      showlegend: false,
      hoverinfo: 'skip'
    });
    // Ground line below rollers
    traces.push({
      x: [-pinW - 0.2, pinW + 0.2],
      y: [-rH - 0.4, -rH - 0.4],
      mode: 'lines',
      line: { color: '#10b981', width: 3 },
      showlegend: false,
      hoverinfo: 'skip'
    });
  } else if (leftSupport === 'fixed') {
    traces.push({
      x: [-0.3, -0.3],
      y: [-6, 6],
      mode: 'lines',
      line: { color: '#475569', width: 10 },
      showlegend: false,
      hoverinfo: 'skip'
    });
    for (let y = -5; y <= 5; y += 2.5) {
      traces.push({
        x: [-0.9, -0.3],
        y: [y - 1, y + 1],
        mode: 'lines',
        line: { color: '#94a3b8', width: 2 },
        showlegend: false,
        hoverinfo: 'skip'
      });
    }
  }

  // Right support drawing (Equilateral Pin & Roller)
  if (rightSupport === 'pin') {
    traces.push({
      x: [10 - pinW, 10, 10 + pinW, 10 - pinW],
      y: [-pinH, 0, -pinH, -pinH],
      fill: 'toself',
      mode: 'lines',
      line: { color: '#3b82f6', width: 2.5 },
      fillcolor: 'rgba(59, 130, 246, 0.25)',
      showlegend: false,
      hoverinfo: 'skip'
    });
    // Ground line
    traces.push({
      x: [10 - pinW - 0.2, 10 + pinW + 0.2],
      y: [-pinH, -pinH],
      mode: 'lines',
      line: { color: '#3b82f6', width: 3 },
      showlegend: false,
      hoverinfo: 'skip'
    });
  } else if (rightSupport === 'roller') {
    const rH = 0.95;
    traces.push({
      x: [10 - pinW, 10, 10 + pinW, 10 - pinW],
      y: [-rH, 0, -rH, -rH],
      fill: 'toself',
      mode: 'lines',
      line: { color: '#10b981', width: 2.5 },
      fillcolor: 'rgba(16, 185, 129, 0.25)',
      showlegend: false,
      hoverinfo: 'skip'
    });
    // Roller wheels
    traces.push({
      x: [9.65, 10.35],
      y: [-rH - 0.2, -rH - 0.2],
      mode: 'markers',
      marker: { size: 10, color: '#10b981', symbol: 'circle' },
      showlegend: false,
      hoverinfo: 'skip'
    });
    // Ground line below rollers
    traces.push({
      x: [10 - pinW - 0.2, 10 + pinW + 0.2],
      y: [-rH - 0.4, -rH - 0.4],
      mode: 'lines',
      line: { color: '#10b981', width: 3 },
      showlegend: false,
      hoverinfo: 'skip'
    });
  }

  const annotations = [];

  // Point load P vector
  if (P > 0) {
    const len = 3.5 + 4.5 * (P / 100);
    annotations.push({
      ax: xp, ay: len,
      x: xp, y: 0.3,
      xref: 'x', yref: 'y',
      axref: 'x', ayref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1.3,
      arrowwidth: 5.5,
      arrowcolor: '#ef4444',
      text: ''
    });
    annotations.push({
      x: xp,
      y: (len + 0.3) / 2,
      xref: 'x', yref: 'y',
      showarrow: false,
      text: `P = ${P.toFixed(0)} kN`,
      font: { family: 'Outfit, sans-serif', size: 14, color: '#ef4444', weight: 'bold' },
      xshift: 40
    });
  }

  // Reactions vectors
  if (solved) {
    if (Ray !== 0) {
      const r_len = 2.8 + 3.8 * (Math.abs(Ray) / 100);
      const sign_ay = Ray > 0 ? 1 : -1;
      annotations.push({
        ax: 0, ay: sign_ay < 0 ? 0.3 : -r_len,
        x: 0, y: sign_ay < 0 ? -r_len : -0.3,
        xref: 'x', yref: 'y',
        axref: 'x', ayref: 'y',
        showarrow: true,
        arrowhead: 3,
        arrowsize: 1.2,
        arrowwidth: 5,
        arrowcolor: '#3b82f6',
        text: ''
      });
      const midY = ((sign_ay < 0 ? 0.3 : -r_len) + (sign_ay < 0 ? -r_len : -0.3)) / 2;
      annotations.push({
        x: 0,
        y: midY,
        xref: 'x', yref: 'y',
        showarrow: false,
        text: `Ray = ${Ray.toFixed(1)} kN`,
        font: { family: 'Outfit, sans-serif', size: 13, color: '#3b82f6', weight: 'bold' },
        xshift: -36
      });
    }

    if (Rby !== 0) {
      const r_len = 2.8 + 3.8 * (Math.abs(Rby) / 100);
      const sign_by = Rby > 0 ? 1 : -1;
      annotations.push({
        ax: 10, ay: sign_by < 0 ? 0.3 : -r_len,
        x: 10, y: sign_by < 0 ? -r_len : -0.3,
        xref: 'x', yref: 'y',
        axref: 'x', ayref: 'y',
        showarrow: true,
        arrowhead: 3,
        arrowsize: 1.2,
        arrowwidth: 5,
        arrowcolor: '#10b981',
        text: ''
      });
      const midY = ((sign_by < 0 ? 0.3 : -r_len) + (sign_by < 0 ? -r_len : -0.3)) / 2;
      annotations.push({
        x: 10,
        y: midY,
        xref: 'x', yref: 'y',
        showarrow: false,
        text: `Rby = ${Rby.toFixed(1)} kN`,
        font: { family: 'Outfit, sans-serif', size: 13, color: '#10b981', weight: 'bold' },
        xshift: 36
      });
    }

    if (Ma !== 0) {
      const r_arc = 1.0 + Math.min(1.4, Math.abs(Ma) / 600);
      const num_points = 30;
      let start_ang = -30 * Math.PI / 180;
      let end_ang = 210 * Math.PI / 180;
      if (Ma > 0) {
        start_ang = 210 * Math.PI / 180;
        end_ang = -30 * Math.PI / 180;
      }
      const arcX = [];
      const arcY = [];
      for (let i = 0; i <= num_points; i++) {
        const a = start_ang + (end_ang - start_ang) * (i / num_points);
        arcX.push(r_arc * Math.cos(a));
        arcY.push(r_arc * Math.sin(a));
      }
      traces.push({
        x: arcX,
        y: arcY,
        mode: 'lines',
        line: { color: '#8b5cf6', width: 4.5 },
        showlegend: false,
        hoverinfo: 'skip'
      });

      const end_x = r_arc * Math.cos(end_ang);
      const end_y = r_arc * Math.sin(end_ang);
      const dir = Ma > 0 ? -1.0 : 1.0;
      const tx = dir * (-Math.sin(end_ang));
      const ty = dir * Math.cos(end_ang);
      const arrow_len = 0.5;
      const tail_x = end_x - arrow_len * tx;
      const tail_y = end_y - arrow_len * ty;

      annotations.push({
        ax: tail_x, ay: tail_y,
        x: end_x, y: end_y,
        xref: 'x', yref: 'y',
        axref: 'x', ayref: 'y',
        showarrow: true,
        arrowhead: 3,
        arrowsize: 1.2,
        arrowwidth: 4.5,
        arrowcolor: '#8b5cf6',
        text: ''
      });

      annotations.push({
        x: end_x,
        y: end_y,
        text: `Ma = ${Ma.toFixed(0)} kNm`,
        font: { family: 'Outfit, sans-serif', size: 13, color: '#8b5cf6', weight: 'bold' },
        showarrow: false,
        xshift: end_x > 0 ? 38 : -38,
        yshift: end_y > 0 ? 18 : -18
      });
    }
  }

  const layout = {
    xaxis: {
      range: [-2, 12],
      gridcolor: '#f8fafc',
      zeroline: false,
      fixedrange: true,
      title: 'Beam Span (m)'
    },
    yaxis: {
      range: [-8, 10],
      showgrid: false,
      zeroline: false,
      showticklabels: false,
      scaleanchor: 'x',
      scaleratio: 1,
      fixedrange: true
    },
    margin: { l: 30, r: 30, t: 10, b: 40 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true
  };

  const guidedOptions = [
    "Ray = 80.0 kN (up), Ma = -400.0 kN-m (Clockwise)",
    "Ray = 40.0 kN (up), Ma = 0.0 kN-m (simply supported)",
    "Ray = 80.0 kN (up), Ma = +400.0 kN-m (Counterclockwise)",
    "Ray = 80.0 kN (up), Ma = -800.0 kN-m (Clockwise)"
  ];

  const poeOptions = [
    "Determinate; Ray = 45.0 kN (up), Rby = 15.0 kN (up).",
    "Determinate; Ray = 30.0 kN (up), Rby = 30.0 kN (up).",
    "Indeterminate; reactions cannot be solved using statics alone.",
    "Unstable; beam will spin around left Pin."
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Module Title */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 2 • Lesson 11
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2.2rem' }}>
          Intro to Equilibrium of Rigid Bodies
        </h1>
      </div>

      {/* Learning Objectives */}
      <div className="objectives-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learning Objectives
          </span>
        </div>
        <ul style={{ paddingLeft: '20px', margin: '0' }}>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Apply the three equations of equilibrium (<KaTeX math="\sum F_x = 0" />, <KaTeX math="\sum F_y = 0" />, <KaTeX math="\sum M_O = 0" />) in 2D.
          </li>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Distinguish between statically determinate, indeterminate, and unstable structural beam systems.
          </li>
          <li style={{ marginBottom: '0px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Calculate support reaction forces and moments for various support configurations (Pin, Roller, Fixed).
          </li>
        </ul>
      </div>

      {/* Main Grid: Left Simulator (7 cols) & Right Sidecar (5 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '24px' }}>
        
        {/* LEFT COLUMN: INTERACTIVE WORKSPACE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Interactive Support Reaction Solver
          </h3>

          {isLocked && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1.5px solid #fef3c7',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#b45309',
              fontSize: '0.9rem'
            }}>
              <span>⚠️</span>
              <span><b>Controls are locked!</b> Select your hypothesis in the POE Challenge sidecar to unlock.</span>
            </div>
          )}

          {/* Status Banner */}
          <div style={{
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '0.95rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: status === 'determinate' ? '#f0fdf4' : (status === 'indeterminate' ? '#fffbeb' : '#fef2f2'),
            border: `1.5px solid ${status === 'determinate' ? '#bbf7d0' : (status === 'indeterminate' ? '#fef3c7' : '#fee2e2')}`,
            color: status === 'determinate' ? '#166534' : (status === 'indeterminate' ? '#9a3412' : '#991b1b')
          }}>
            <span>{status === 'determinate' ? '✅' : (status === 'indeterminate' ? '⚠️' : '🚨')}</span>
            <span>
              {status === 'determinate' && 'Statically Determinate Beam System'}
              {status === 'indeterminate' && `Statically Indeterminate System (${unknowns} Unknowns, 3 Equations)`}
              {status === 'unstable' && `UNSTABLE STRUCTURE! (${unknowns} Reactions, Insufficient Restraint)`}
            </span>
          </div>

          {/* Plotly Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '340px' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Reaction Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderBottom: '4px solid #3b82f6', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Left Vert. Reaction (Ray)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{solved ? `${Ray.toFixed(1)} kN` : '-'}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderBottom: '4px solid #10b981', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Right Vert. Reaction (Rby)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{solved ? `${Rby.toFixed(1)} kN` : '-'}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderBottom: '4px solid #64748b', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Horiz. Reaction (Rax)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569', marginTop: '4px' }}>{solved ? `${Rax.toFixed(1)} kN` : '-'}</div>
            </div>
          </div>

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {/* Control Box 1: Load */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>1. Point Load (P)</div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Load Magnitude, P</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{P} kN</span>
                </div>
                <input type="range" min="0" max="100" step="10" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Position, x_P</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{xp.toFixed(1)} m</span>
                </div>
                <input type="range" min="0" max="10" step="0.5" value={xp} disabled={isLocked} onChange={(e) => setXp(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
              </div>
            </div>

            {/* Control Box 2: Left Support */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>2. Left Support (A)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['pin', 'roller', 'fixed'].map((type) => (
                  <button key={type} disabled={isLocked} onClick={() => setLeftSupport(type)} style={{
                    padding: '6px 10px',
                    border: leftSupport === type ? '1.5px solid #10b981' : '1px solid var(--border-light)',
                    backgroundColor: leftSupport === type ? '#10b981' : 'transparent',
                    color: leftSupport === type ? '#fff' : 'var(--text-main)',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: 0.82 + 'rem',
                    cursor: isLocked ? 'not-allowed' : 'pointer'
                  }}>
                    {type === 'pin' ? 'Pin (2 Reactions)' : (type === 'roller' ? 'Roller (1 Reaction)' : 'Fixed (3 Reactions)')}
                  </button>
                ))}
              </div>
            </div>

            {/* Control Box 3: Right Support */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>3. Right Support (B)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['pin', 'roller', 'free'].map((type) => (
                  <button key={type} disabled={isLocked} onClick={() => setRightSupport(type)} style={{
                    padding: '6px 10px',
                    border: rightSupport === type ? '1.5px solid #10b981' : '1px solid var(--border-light)',
                    backgroundColor: rightSupport === type ? '#10b981' : 'transparent',
                    color: rightSupport === type ? '#fff' : 'var(--text-main)',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: isLocked ? 'not-allowed' : 'pointer'
                  }}>
                    {type === 'pin' ? 'Pin (2 Reactions)' : (type === 'roller' ? 'Roller (1 Reaction)' : 'Free (0 Reactions)')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Equation Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderLeft: '4px solid #10b981',
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--text-main)'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>Equilibrium Derivations & Calculations:</div>
            {solved ? (
              <div>
                {leftSupport === 'pin' && (
                  <>
                    <KaTeX math="\sum M_A = 0 \implies R_{By} \cdot 10 - P \cdot x_P = 0" /><br />
                    • <KaTeX math={`R_{By} = (${P} \\cdot ${xp.toFixed(1)}) / 10 = `} /> <b>{Rby.toFixed(1)} kN</b> (up)<br />
                    <KaTeX math="\sum F_y = 0 \implies R_{Ay} + R_{By} - P = 0" /><br />
                    • <KaTeX math={`R_{Ay} = ${P} - ${Rby.toFixed(1)} = `} /> <b>{Ray.toFixed(1)} kN</b> (up)<br />
                    <KaTeX math="\sum F_x = 0 \implies R_{Ax} = 0.0\text{ kN}" />
                  </>
                )}
                {leftSupport === 'fixed' && (
                  <>
                    <KaTeX math="\sum F_y = 0 \implies R_{Ay} - P = 0 \implies R_{Ay} = " /> <b>{Ray.toFixed(1)} kN</b> (up)<br />
                    <KaTeX math="\sum M_A = 0 \implies -M_A - P \cdot x_P = 0 \implies M_A = " /> <b>-{Ma.toFixed(1)} kN-m</b> (Clockwise)<br />
                    <KaTeX math="\sum F_x = 0 \implies R_{Ax} = 0.0\text{ kN}" />
                  </>
                )}
                {leftSupport === 'roller' && (
                  <>
                    <KaTeX math="\sum M_B = 0 \implies -R_{Ay} \cdot 10 + P \cdot (10 - x_P) = 0" /><br />
                    • <KaTeX math={`R_{Ay} = (${P} \\cdot ${(L - xp).toFixed(1)}) / 10 = `} /> <b>{Ray.toFixed(1)} kN</b> (up)<br />
                    <KaTeX math="\sum F_y = 0 \implies R_{Ay} + R_{By} - P = 0 \implies R_{By} = " /> <b>{Rby.toFixed(1)} kN</b> (up)
                  </>
                )}
              </div>
            ) : (
              <div>
                {status === 'indeterminate' ? (
                  <span style={{ color: '#9a3412' }}>
                    <b>Indeterminate System:</b> Unknown reactions ({unknowns}) exceed 3 equations of statics. Requires elastic deflection analysis to solve.
                  </span>
                ) : (
                  <span style={{ color: '#991b1b' }}>
                    <b>Unstable Structure:</b> Insufficient boundary constraints. Under load, the beam will experience rigid-body rotation or translation.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SIDECAR PEDAGOGY */}
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.04)',
          border: '2px solid #10b981',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
              {phase === 'instructions' && '📖 Step 1: Instructions'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Practice'}
              {phase === 'poe_predict' && '🔮 POE Challenge: Predict'}
              {phase === 'poe_observe' && '👀 POE Challenge: Observe & Correct'}
              {phase === 'poe_explain' && '💡 POE Challenge: Explain'}
            </h4>

            {/* PHASE 1: INSTRUCTIONS */}
            {phase === 'instructions' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                <p style={{ marginBottom: '12px' }}>
                  This simulator allows you to explore support conditions and reaction forces for a horizontal rigid beam.
                </p>
                <ul style={{ paddingLeft: '18px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '6px' }}><b>Support Conditions:</b> Toggle Left Support (Pin, Roller, Fixed) and Right Support (Pin, Roller, Free).</li>
                  <li style={{ marginBottom: '6px' }}><b>Load Sliders:</b> Adjust magnitude <i>P</i> and location <i>x_P</i>.</li>
                  <li style={{ marginBottom: '6px' }}><b>System Determinacy:</b> Automatically classified as Statically Determinate, Indeterminate, or Unstable.</li>
                </ul>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>
                  Start Practice 🔍
                </button>
              </div>
            )}

            {/* PHASE 2: GUIDED PRACTICE */}
            {phase === 'guided_question' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, marginBottom: '8px' }}>Guided Scenario:</p>
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  • <b>Left Support:</b> Fixed<br />
                  • <b>Right Support:</b> Free (Cantilever beam)<br />
                  • <b>Point Load P:</b> 80 kN<br />
                  • <b>Position x_P:</b> 5.0 m (mid-span)
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Question: What is the left vertical reaction force <KaTeX math="R_{Ay}" /> and reaction moment <KaTeX math="M_A" />?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {guidedOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="guided" checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ marginBottom: '12px' }} onClick={() => setGuidedSubmitted(true)}>
                  Submit Answer
                </button>

                {guidedSubmitted && (
                  <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', backgroundColor: guidedAnswer?.includes('Ray = 80.0 kN (up), Ma = -400') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${guidedAnswer?.includes('Ray = 80.0 kN (up), Ma = -400') ? '#bbf7d0' : '#fee2e2'}`, color: guidedAnswer?.includes('Ray = 80.0 kN (up), Ma = -400') ? '#166534' : '#991b1b', marginBottom: '14px' }}>
                    {guidedAnswer?.includes('Ray = 80.0 kN (up), Ma = -400')
                      ? 'Correct! Since the right end is free, the left fixed support carries the entire vertical load: Ray = 80 kN (up). Summing moments about A: -Ma - P * x_P = 0 => Ma = -400 kN-m (clockwise).'
                      : 'Incorrect. Write equilibrium: sum Fy = Ray - 80 = 0 => Ray = 80 kN (up). sum Ma = -Ma - 80 * 5 = 0 => Ma = -400 kN-m (clockwise).'}
                  </div>
                )}

                <button className="btn-secondary" onClick={() => setPhase('poe_predict')}>
                  Go to POE Challenge 🔮
                </button>
              </div>
            )}

            {/* PHASE 3: POE PREDICT */}
            {phase === 'poe_predict' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, color: '#b45309', marginBottom: '8px' }}>
                  Predict Phase (Controls Locked!):
                </p>
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  • <b>Left Support:</b> Pin (at x = 0)<br />
                  • <b>Right Support:</b> Roller (at x = 10)<br />
                  • <b>Point Load P:</b> 60 kN<br />
                  • <b>Position x_P:</b> 2.5 m (one-quarter span)
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Predict the determinacy classification and the vertical reaction forces <KaTeX math="R_{Ay}" /> and <KaTeX math="R_{By}" />:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeP" checked={poeHypothesis === opt} onChange={() => setPoeHypothesis(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" disabled={!poeHypothesis} onClick={() => { setPoeFinalAnswer(poeHypothesis); setPhase('poe_observe'); }}>
                  Test Hypothesis 🧪
                </button>
              </div>
            )}

            {/* PHASE 4: POE OBSERVE */}
            {phase === 'poe_observe' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>
                  Observe & Correct Phase (Controls Unlocked!):
                </p>
                <p style={{ marginBottom: '10px' }}>
                  1. Set Left Support to <b>Pin</b> and Right Support to <b>Roller</b>.<br />
                  2. Set Load to <b>60 kN</b> and Position to <b>2.5 m</b>.<br />
                  3. Observe the reactions displayed on the sandbox.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeO" checked={poeFinalAnswer === opt} onChange={() => setPoeFinalAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe_explain')}>
                  Final Submit 📤
                </button>
              </div>
            )}

            {/* PHASE 5: POE EXPLAIN */}
            {phase === 'poe_explain' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, marginBottom: '6px' }}>Your final selection:</p>
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-card)', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '12px' }}>
                  {poeFinalAnswer}
                </div>

                {poeFinalAnswer === "Determinate; Ray = 45.0 kN (up), Rby = 15.0 kN (up)." ? (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, marginBottom: '14px' }}>
                    🎉 Correct! Excellent statics calculations.
                  </div>
                ) : (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#9a3412', fontWeight: 700, marginBottom: '14px' }}>
                    ⚠️ Incorrect. Review the equilibrium derivation below.
                  </div>
                )}

                <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <h5 style={{ fontWeight: 700, margin: '10px 0 6px 0' }}>Explanation:</h5>
                  <ol style={{ paddingLeft: '18px', margin: 0 }}>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Determinacy:</b> Pin has 2 reactions, Roller has 1. Total reactions = 3. Equals 3 equilibrium equations <KaTeX math="\implies" /> <b>Statically Determinate</b>.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Moments about A:</b> <KaTeX math="\sum M_A = 0 \implies R_{By} \cdot 10 - 60 \cdot 2.5 = 0 \implies R_{By} = 15.0\text{ kN}" /> (up).
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Vertical Equilibrium:</b> <KaTeX math="\sum F_y = 0 \implies R_{Ay} + 15 - 60 = 0 \implies R_{Ay} = 45.0\text{ kN}" /> (up).
                    </li>
                  </ol>
                </div>

                <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={resetSimulator}>
                  Reset Simulator 🔄
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

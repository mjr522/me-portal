import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathInline({ math }) {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathBlock({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function CoupleSystems() {
  // Phase state
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState('');
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeAnswer, setPoeAnswer] = useState('');

  // Sandbox state
  const [f1, setF1] = useState(80);
  const [theta1, setTheta1] = useState(90);
  const [f2, setF2] = useState(0);
  const [theta2, setTheta2] = useState(270);
  const [Mc, setMc] = useState(0);
  const [xa, setXa] = useState(0);
  const [ya, setYa] = useState(0);
  const [configMode, setConfigMode] = useState('independent'); // independent or couple

  const slidersLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer('');
    setGuidedSubmitted(false);
    setPoeAnswer('');
    setF1(80);
    setTheta1(90);
    setF2(0);
    setTheta2(270);
    setMc(0);
    setXa(0);
    setYa(0);
    setConfigMode('independent');
  };

  // Pure couple synchronization logic
  const effectiveF2 = configMode === 'couple' ? f1 : f2;
  const effectiveTheta2 = configMode === 'couple' ? (theta1 + 180) % 360 : theta2;

  // Force 1 components at (-20, 0)
  const x1 = -20, y1 = 0;
  const rad1 = (theta1 * Math.PI) / 180;
  const f1x = f1 * Math.cos(rad1);
  const f1y = f1 * Math.sin(rad1);

  // Force 2 components at (+20, 0)
  const x2 = 20, y2 = 0;
  const rad2 = (effectiveTheta2 * Math.PI) / 180;
  const f2x = effectiveF2 * Math.cos(rad2);
  const f2y = effectiveF2 * Math.sin(rad2);

  // Resultant force components
  const Rx = f1x + f2x;
  const Ry = f1y + f2y;
  const R_mag = Math.sqrt(Rx * Rx + Ry * Ry);

  // Moments about A
  const m1a = (x1 - xa) * f1y - (y1 - ya) * f1x;
  const m2a = (x2 - xa) * f2y - (y2 - ya) * f2x;
  const Mr_A = m1a + m2a + Mc;

  // Equations display text formatting
  let m1a_str = `(${x1 - xa}) · (${f1y.toFixed(0)})`;
  if (ya !== 0) {
    const ry1 = y1 - ya;
    m1a_str += ` - (${ry1.toFixed(1)}) · (${f1x.toFixed(0)})`;
  }
  let m2a_str = `(${x2 - xa}) · (${f2y.toFixed(0)})`;
  if (ya !== 0) {
    const ry2 = y2 - ya;
    m2a_str += ` - (${ry2.toFixed(1)}) · (${f2x.toFixed(0)})`;
  }

  // Plotly traces and annotations
  const traces = [];

  // Rigid plate
  traces.push({
    x: [-50, 50, 50, -50, -50],
    y: [15, 15, -15, -15, 15],
    mode: 'lines',
    fill: 'toself',
    fillcolor: 'rgba(203, 213, 225, 0.25)',
    line: { color: '#475569', width: 2.5 },
    showlegend: false,
    hoverinfo: 'skip',
  });

  // Reference point A marker
  traces.push({
    x: [xa],
    y: [ya],
    mode: 'markers',
    marker: { size: 10, color: '#1e293b', symbol: 'circle' },
    showlegend: false,
    hoverinfo: 'text',
    hovertext: `Reference Point A (at x = ${xa.toFixed(1)} m, y = ${ya.toFixed(1)} m)`,
  });

  const annotations = [
    {
      x: xa,
      y: ya - 6,
      text: '<b>Point A</b>',
      font: { family: 'Outfit, sans-serif', size: 12, color: '#1e293b' },
      showarrow: false,
    },
  ];

  const scale_f = 0.25;

  // Force F1 Arrow (Blue) at (-20, 0)
  if (f1 > 0) {
    annotations.push({
      ax: -20,
      ay: 0,
      x: -20 + f1x * scale_f,
      y: f1y * scale_f,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 3,
      arrowcolor: '#3b82f6',
      text: '',
    });

    const midX = -20 + (f1x * scale_f) / 2;
    const midY = (f1y * scale_f) / 2;
    const len = Math.sqrt(f1x * f1x + f1y * f1y);
    let px = 0, py = 0;
    if (len > 0) {
      px = -f1y / len;
      py = f1x / len;
    }
    annotations.push({
      x: midX + px * 5.0,
      y: midY + py * 5.0,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `F1 = ${f1}N`,
      font: { family: 'Outfit, sans-serif', size: 10, color: '#3b82f6', weight: 'bold' },
    });
  }

  // Force F2 Arrow (Green) at (+20, 0)
  if (effectiveF2 > 0) {
    annotations.push({
      ax: 20,
      ay: 0,
      x: 20 + f2x * scale_f,
      y: f2y * scale_f,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 3,
      arrowcolor: '#10b981',
      text: '',
    });

    const midX = 20 + (f2x * scale_f) / 2;
    const midY = (f2y * scale_f) / 2;
    const len = Math.sqrt(f2x * f2x + f2y * f2y);
    let px = 0, py = 0;
    if (len > 0) {
      px = -f2y / len;
      py = f2x / len;
    }
    annotations.push({
      x: midX + px * 5.0,
      y: midY + py * 5.0,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `F2 = ${effectiveF2}N`,
      font: { family: 'Outfit, sans-serif', size: 10, color: '#10b981', weight: 'bold' },
    });
  }

  // Resultant Equivalent Force R at A (Purple arrow)
  if (R_mag > 0) {
    annotations.push({
      ax: xa,
      ay: ya,
      x: xa + Rx * scale_f,
      y: ya + Ry * scale_f,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1.2,
      arrowwidth: 4.5,
      arrowcolor: '#8b5cf6',
      text: '',
    });

    const midX = xa + (Rx * scale_f) / 2;
    const midY = ya + (Ry * scale_f) / 2;
    const len = Math.sqrt(Rx * Rx + Ry * Ry);
    let px = 0, py = 0;
    if (len > 0) {
      px = -Ry / len;
      py = Rx / len;
    }
    annotations.push({
      x: midX + px * 6.0,
      y: midY + py * 6.0,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `R = ${R_mag.toFixed(0)}N`,
      font: { family: 'Outfit, sans-serif', size: 11, color: '#8b5cf6', weight: 'bold' },
    });
  }

  // Independent Couple Mc (Orange circular arrow at center)
  if (Mc !== 0) {
    const cx = 0, cy = 0;
    const r_arc = 5 + Math.min(10, Math.abs(Mc) / 100);
    const num_points = 30;
    let start_ang = (-30 * Math.PI) / 180;
    let end_ang = (210 * Math.PI) / 180;
    if (Mc < 0) {
      start_ang = (210 * Math.PI) / 180;
      end_ang = (-30 * Math.PI) / 180;
    }

    const arcX = [];
    const arcY = [];
    for (let i = 0; i <= num_points; i++) {
      const a = start_ang + (end_ang - start_ang) * (i / num_points);
      arcX.push(cx + r_arc * Math.cos(a));
      arcY.push(cy + r_arc * Math.sin(a));
    }

    traces.push({
      x: arcX,
      y: arcY,
      mode: 'lines',
      line: { color: '#f59e0b', width: 3.0 },
      showlegend: false,
      hoverinfo: 'skip',
    });

    const end_x = cx + r_arc * Math.cos(end_ang);
    const end_y = cy + r_arc * Math.sin(end_ang);
    const dir = Mc > 0 ? 1.0 : -1.0;
    const tx = dir * -Math.sin(end_ang);
    const ty = dir * Math.cos(end_ang);
    const arrow_len = 4.5;
    const tail_x = end_x - arrow_len * tx;
    const tail_y = end_y - arrow_len * ty;

    annotations.push({
      ax: tail_x,
      ay: tail_y,
      x: end_x,
      y: end_y,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1.0,
      arrowwidth: 3,
      arrowcolor: '#f59e0b',
      text: '',
    });

    annotations.push({
      x: end_x,
      y: end_y,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `Mc = ${Mc} N-m`,
      font: { family: 'Outfit, sans-serif', size: 10, color: '#f59e0b', weight: 'bold' },
      xshift: end_x > cx ? 35 : -35,
      yshift: end_y > cy ? 15 : -15,
    });
  }

  // Equivalent resultant moment Mr_A (Purple dashed circular arrow centered at A)
  if (Math.abs(Mr_A) > 0.05) {
    const r_arc = 7 + Math.min(12, Math.abs(Mr_A) / 100);
    const num_points = 30;
    let start_ang = (-30 * Math.PI) / 180;
    let end_ang = (210 * Math.PI) / 180;
    if (Mr_A < 0) {
      start_ang = (210 * Math.PI) / 180;
      end_ang = (-30 * Math.PI) / 180;
    }

    const arcX = [];
    const arcY = [];
    for (let i = 0; i <= num_points; i++) {
      const a = start_ang + (end_ang - start_ang) * (i / num_points);
      arcX.push(xa + r_arc * Math.cos(a));
      arcY.push(ya + r_arc * Math.sin(a));
    }

    traces.push({
      x: arcX,
      y: arcY,
      mode: 'lines',
      line: { color: '#a855f7', width: 2.5, dash: 'dash' },
      showlegend: false,
      hoverinfo: 'skip',
    });

    const end_x = xa + r_arc * Math.cos(end_ang);
    const end_y = ya + r_arc * Math.sin(end_ang);
    const dir = Mr_A > 0 ? 1.0 : -1.0;
    const tx = dir * -Math.sin(end_ang);
    const ty = dir * Math.cos(end_ang);
    const arrow_len = 4.5;
    const tail_x = end_x - arrow_len * tx;
    const tail_y = end_y - arrow_len * ty;

    annotations.push({
      ax: tail_x,
      ay: tail_y,
      x: end_x,
      y: end_y,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1.0,
      arrowwidth: 3,
      arrowcolor: '#a855f7',
      text: '',
    });

    annotations.push({
      x: end_x,
      y: end_y,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `Mr_A = ${Mr_A.toFixed(0)} N-m`,
      font: { family: 'Outfit, sans-serif', size: 10, color: '#a855f7', weight: 'bold' },
      xshift: end_x > xa ? 35 : -35,
      yshift: end_y > ya ? 15 : -15,
    });
  }

  const layout = {
    xaxis: {
      range: [-60, 60],
      showgrid: false,
      zeroline: true,
      zerolinecolor: '#cbd5e1',
      fixedrange: true,
      title: 'Plate X Dimension (m)',
    },
    yaxis: {
      range: [-35, 35],
      showgrid: false,
      zeroline: false,
      scaleanchor: 'x',
      scaleratio: 1,
      fixedrange: true,
      title: 'Plate Y Dimension (m)',
    },
    margin: { l: 40, r: 15, t: 15, b: 40 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true,
  };

  const phaseTitles = {
    instructions: '📖 Step 1: Instructions',
    guided_question: '🔍 Step 2: Guided Practice',
    poe_predict: '🔮 POE Challenge: Predict',
    poe_observe: '👀 POE Challenge: Observe & Correct',
    poe_explain: '💡 POE Challenge: Explain',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px' }}>
      {/* Page Title Header */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 1 • Lesson 7
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Couples and Force-Couple Systems</h1>
      </div>

      {/* Learning Objectives Card */}
      <div className="objectives-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(37, 99, 235, 0.04) 100%)', border: '1px solid rgba(59, 130, 246, 0.18)', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Learning Objectives</span>
        </div>
        <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Define a couple as two equal, opposite, non-collinear forces.</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Reduce a general force system to an equivalent force-couple system at point A.</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Demonstrate that a couple moment is a free vector independent of the reduction point.</li>
        </ul>
      </div>

      {/* Main Grid: Left Sandbox (7 cols), Right Sidecar (3 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)', gap: '24px' }}>
        {/* LEFT COLUMN: SANDBOX */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>Interactive Force-Couple Simplification Model</h3>

          {slidersLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <span>⚠️</span>
              <span><b>Controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Chart Container */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', padding: '10px', marginBottom: '15px' }}>
            <Plot
              data={traces}
              layout={layout}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '320px' }}
              useResizeHandler={true}
            />
          </div>

          {/* Toggle Selector for Force Configuration */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', marginBottom: '15px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Force Configuration:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={slidersLocked}
                onClick={() => setConfigMode('independent')}
                style={{ padding: '6px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, backgroundColor: configMode === 'independent' ? 'rgba(139, 92, 246, 0.05)' : '#ffffff', color: configMode === 'independent' ? '#8b5cf6' : '#475569', borderColor: configMode === 'independent' ? '#8b5cf6' : '#cbd5e1' }}
              >
                Independent
              </button>
              <button
                disabled={slidersLocked}
                onClick={() => setConfigMode('couple')}
                style={{ padding: '6px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, backgroundColor: configMode === 'couple' ? 'rgba(139, 92, 246, 0.05)' : '#ffffff', color: configMode === 'couple' ? '#8b5cf6' : '#475569', borderColor: configMode === 'couple' ? '#8b5cf6' : '#cbd5e1' }}
              >
                Pure Couple Lock
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: '3.5px solid #8b5cf6', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Equivalent Resultant Force (R)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#8b5cf6' }}>{R_mag.toFixed(1)} N</div>
            </div>

            <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: '3.5px solid #a855f7', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Equivalent Moment at A (Mr_A)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#a855f7' }}>{Mr_A.toFixed(0)} N-m</div>
            </div>
          </div>

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '15px' }}>
            {/* Force 1 (Blue) */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderLeft: '4px solid #3b82f6', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Force F1 (at x = -20 m)
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Magnitude, F1</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{f1.toFixed(0)} N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={f1}
                  disabled={slidersLocked}
                  onChange={(e) => setF1(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Angle, θ1</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{theta1.toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={theta1}
                  disabled={slidersLocked}
                  onChange={(e) => setTheta1(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
            </div>

            {/* Force 2 (Green) */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderLeft: '4px solid #10b981', borderRadius: '12px', padding: '12px', opacity: configMode === 'couple' ? 0.55 : 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Force F2 (at x = +20 m)
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Magnitude, F2</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>{effectiveF2.toFixed(0)} N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={effectiveF2}
                  disabled={slidersLocked || configMode === 'couple'}
                  onChange={(e) => setF2(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked || configMode === 'couple' ? 'not-allowed' : 'pointer' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Angle, θ2</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>{effectiveTheta2.toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={effectiveTheta2}
                  disabled={slidersLocked || configMode === 'couple'}
                  onChange={(e) => setTheta2(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked || configMode === 'couple' ? 'not-allowed' : 'pointer' }}
                />
              </div>
            </div>

            {/* External Couple Moment Mc (Orange) */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Independent Couple Moment
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Moment, Mc</span>
                  <span style={{ fontWeight: 600, color: '#f59e0b' }}>{Mc.toFixed(0)} N-m</span>
                </div>
                <input
                  type="range"
                  min="-300"
                  max="300"
                  step="50"
                  value={Mc}
                  disabled={slidersLocked}
                  onChange={(e) => setMc(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
            </div>

            {/* Reference Point A position (Purple) */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderLeft: '4px solid #8b5cf6', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Reference Point A
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Position X_a</span>
                  <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{xa.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  step="5"
                  value={xa}
                  disabled={slidersLocked}
                  onChange={(e) => setXa(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Position Y_a</span>
                  <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{ya.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="2"
                  value={ya}
                  disabled={slidersLocked}
                  onChange={(e) => setYa(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Live Equation Display */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#1e293b', borderLeft: '4px solid #8b5cf6', lineHeight: 1.4 }}>
            <b>Equivalent Force-Couple Reduction Math:</b><br />
            Resultant Force: R = ({Rx.toFixed(1)}i + {Ry.toFixed(1)}j) N [Mag: {R_mag.toFixed(1)} N]<br />
            Moments about A (at x = {xa.toFixed(1)} m, y = {ya.toFixed(1)} m):<br />
            • M1_A = {m1a_str} = {m1a.toFixed(0)} N-m<br />
            • M2_A = {m2a_str} = {m2a.toFixed(0)} N-m<br />
            • Mc (Free Couple Moment) = {Mc.toFixed(0)} N-m<br />
            Equivalent Moment: <b>Mr_A = {Mr_A.toFixed(0)} N-m</b>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDECAR */}
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.04)', border: '2px solid #3b82f6', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)', height: 'fit-content' }}>
          <h4 style={{ marginTop: 0, color: '#3b82f6', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>
            {phaseTitles[phase]}
          </h4>

          {/* Phase 1: Instructions */}
          {phase === 'instructions' && (
            <div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '12px', color: '#334155' }}>
                A <b>couple</b> consists of two equal, opposite, and non-collinear forces. A couple moment is a <b>free vector</b>, meaning its effect is independent of the pivot point.
              </p>
              <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
                <b>Key Mechanics:</b>
                <ul style={{ paddingLeft: '18px', marginTop: '6px' }}>
                  <li style={{ marginBottom: '4px' }}>Use <b>Force Configuration</b> toggle to lock forces into a <b>Pure Couple</b>.</li>
                  <li style={{ marginBottom: '4px' }}>Adjust <b>F1</b> (blue at <MathInline math="x=-20\text{ m}" />) and <b>F2</b> (green at <MathInline math="x=+20\text{ m}" />).</li>
                  <li style={{ marginBottom: '4px' }}>Slide <b>Reference Point A</b> along <MathInline math="X_A, Y_A" /> to move reduction point.</li>
                  <li style={{ marginBottom: '4px' }}>Slide <b>Mc</b> to add an independent couple moment.</li>
                </ul>
              </div>
              <button
                onClick={() => setPhase('guided_question')}
                style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
              >
                Start Practice 🔍
              </button>
            </div>
          )}

          {/* Phase 2: Guided Question */}
          {phase === 'guided_question' && (
            <div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#334155', marginBottom: '12px' }}>
                <b>Guided Scenario:</b><br />
                Set sliders to:<br />
                • <b>F1</b>: <code>100 N</code>, <b>θ1</b>: <code>90°</code> (up)<br />
                • <b>F2</b>: <code>50 N</code>, <b>θ2</b>: <code>270°</code> (down)<br />
                • <b>Mc</b>: <code>0 N-m</code><br />
                • <b>Reference Point A</b>: <code>x_a = 0.0 m, y_a = 0.0 m</code>
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                What is the equivalent system at point A?
              </p>

              {[
                'R = 50 N (up), Mr_A = +1500 N-m (Counterclockwise)',
                'R = 50 N (up), Mr_A = -3000 N-m (Clockwise)',
                'R = 150 N (up), Mr_A = -1500 N-m (Clockwise)',
                'R = 50 N (down), Mr_A = -3000 N-m (Clockwise)',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vcoup_guided_radio"
                    value={opt}
                    checked={guidedAnswer === opt}
                    onChange={(e) => {
                      setGuidedAnswer(e.target.value);
                      setGuidedSubmitted(false);
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {opt}
                </label>
              ))}

              <button
                onClick={() => setGuidedSubmitted(true)}
                style={{ width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '8px', marginBottom: '12px' }}
              >
                Submit Answer
              </button>

              {guidedSubmitted && (
                <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '12px', backgroundColor: guidedAnswer.includes('R = 50 N (up), Mr_A = -3000') ? '#ecfdf5' : '#fef2f2', border: `1px solid ${guidedAnswer.includes('R = 50 N (up), Mr_A = -3000') ? '#a7f3d0' : '#fecaca'}`, color: guidedAnswer.includes('R = 50 N (up), Mr_A = -3000') ? '#065f46' : '#991b1b' }}>
                  {guidedAnswer.includes('R = 50 N (up), Mr_A = -3000') ? (
                    <span>Correct! Resultant force is <MathInline math="R = 100 - 50 = 50\text{ N}" /> (up). Moment of <MathInline math="F_1" /> about A(0,0) is <MathInline math="-100 \cdot 20 = -2000\text{ N-m}" /> (CW). Moment of <MathInline math="F_2" /> about A(0,0) is <MathInline math="-50 \cdot 20 = -1000\text{ N-m}" /> (CW). Total equivalent moment at A is <MathInline math="M_{R,A} = -3000\text{ N-m}" />.</span>
                  ) : (
                    <span>Incorrect. Sum forces: <MathInline math="R = 100 - 50 = 50\text{ N}" /> (up). Sum moments about A(0,0): <MathInline math="-100 \cdot 20 - 50 \cdot 20 = -3000\text{ N-m}" /> (CW).</span>
                  )}
                </div>
              )}

              <hr style={{ margin: '16px 0', borderColor: 'rgba(59, 130, 246, 0.2)' }} />
              <button
                onClick={() => {
                  setPhase('poe_predict');
                  setPoeAnswer('');
                }}
                style={{ width: '100%', background: '#3b82f6', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Go to POE Challenge 🔮
              </button>
            </div>
          )}

          {/* Phase 3: POE Predict */}
          {phase === 'poe_predict' && (
            <div>
              <p style={{ fontSize: '0.88rem', color: '#b45309', fontWeight: 600, marginBottom: '8px' }}>
                Predict Phase (Controls Locked!):
              </p>
              <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '12px' }}>
                <b>Scenario:</b><br />
                • <b>F1</b>: <code>100 N</code>, <b>θ1</b>: <code>90°</code> (pointing up at <MathInline math="x_1=-20\text{ m}" />)<br />
                • <b>F2</b>: <code>100 N</code>, <b>θ2</b>: <code>270°</code> (pointing down at <MathInline math="x_2=+20\text{ m}" />)<br />
                • <b>Mc</b>: <code>0 N-m</code>
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Without unlocking controls, predict resultant <MathInline math="R" /> and moment <MathInline math="M_{R,A}" /> at <MathInline math="x_A=0\text{ m}" /> vs <MathInline math="x_A=+10\text{ m}" />:
              </p>

              {[
                'R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.',
                'R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -3000 N-m at x = 10 m.',
                'R = 200 N (down); Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.',
                'R = 0 N; Mr_A = 0 N-m at x = 0 m, and Mr_A = -1000 N-m at x = 10 m.',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vcoup_poe_p_radio"
                    value={opt}
                    checked={poeAnswer === opt}
                    onChange={(e) => setPoeAnswer(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  {opt}
                </label>
              ))}

              <button
                disabled={!poeAnswer}
                onClick={() => setPhase('poe_observe')}
                style={{ width: '100%', background: poeAnswer ? '#2563eb' : '#94a3b8', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: poeAnswer ? 'pointer' : 'not-allowed', marginTop: '12px' }}
              >
                Test Hypothesis 🧪
              </button>
            </div>
          )}

          {/* Phase 4: POE Observe */}
          {phase === 'poe_observe' && (
            <div>
              <p style={{ fontSize: '0.88rem', color: '#16a34a', fontWeight: 600, marginBottom: '8px' }}>
                Observe & Correct Phase (Controls Unlocked!):
              </p>
              <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '12px' }}>
                <b>Instructions:</b><br />
                1. Switch configuration to <b>Pure Couple Lock</b> and set <MathInline math="F_1 = 100\text{ N}, \theta_1 = 90^\circ" />.<br />
                2. Inspect resultant force R (shows 0 N).<br />
                3. Move reference point A slider between <MathInline math="x_A = 0.0" /> and <MathInline math="x_A = 10.0\text{ m}" />.<br />
                4. Observe if equivalent moment <MathInline math="M_{R,A}" /> changes or stays the same!
              </p>

              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Finalize your answer:
              </p>

              {[
                'R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.',
                'R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -3000 N-m at x = 10 m.',
                'R = 200 N (down); Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.',
                'R = 0 N; Mr_A = 0 N-m at x = 0 m, and Mr_A = -1000 N-m at x = 10 m.',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vcoup_poe_o_radio"
                    value={opt}
                    checked={poeAnswer === opt}
                    onChange={(e) => setPoeAnswer(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  {opt}
                </label>
              ))}

              <button
                onClick={() => setPhase('poe_explain')}
                style={{ width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '12px' }}
              >
                Final Submit 📤
              </button>
            </div>
          )}

          {/* Phase 5: POE Explain */}
          {phase === 'poe_explain' && (
            <div>
              <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
                <b>Your final selection:</b><br />
                <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>{poeAnswer}</code>
              </p>

              {poeAnswer.includes('R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.') ? (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  🎉 <b>Correct!</b> Outstanding understanding of couples.
                </div>
              ) : (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  ⚠️ <b>Incorrect.</b> Look at the couple properties explanation below.
                </div>
              )}

              <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: '#1e293b' }}>Explanation:</h5>
                <ol style={{ paddingLeft: '18px', margin: 0 }}>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Resultant Force (R):</b> Forces are equal and opposite (<MathInline math="\vec{F}_1 = +100\hat{j}, \vec{F}_2 = -100\hat{j}" />), so <MathInline math="R = F_1 + F_2 = 0\text{ N}" />.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Couple Moment:</b> Separated by <MathInline math="d = 40\text{ m}" />, moment is <MathInline math="M = -F \cdot d = -100 \cdot 40 = -4000\text{ N-m}" /> (clockwise).
                  </li>
                  <li>
                    <b>Free Vector Property:</b> Because net force is zero (<MathInline math="R=0" />), the couple moment is a <b>free vector</b> and is the <b>same about every point</b> in space! Thus, whether A is at <MathInline math="x_A = 0" />, <MathInline math="x_A = 10" />, or anywhere else, the equivalent moment is always <b>-4000 N-m</b>.
                  </li>
                </ol>
              </div>

              <button
                onClick={resetSimulator}
                style={{ width: '100%', background: '#64748b', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Reset Simulator 🔄
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

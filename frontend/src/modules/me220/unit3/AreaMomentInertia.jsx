import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function AreaMomentInertia() {
  const [shape, setShape] = useState('rect'); // 'rect' | 'circ' | 'box' | 'ibeam'
  const [axis, setAxis] = useState('x'); // 'x' | 'y'
  const [b, setB] = useState(40); // mm
  const [h, setH] = useState(80); // mm
  const [t, setT] = useState(5); // mm

  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poePredictAns, setPoePredictAns] = useState(null);
  const [poeFinalAns, setPoeFinalAns] = useState(null);

  const isLocked = phase === 'poe_predict';

  // Math Calculations
  let Ix = 0, Iy = 0, A = 0;
  if (shape === 'rect') {
    Ix = (b * Math.pow(h, 3)) / 12;
    Iy = (h * Math.pow(b, 3)) / 12;
    A = b * h;
  } else if (shape === 'circ') {
    const D = h;
    Ix = (Math.PI * Math.pow(D, 4)) / 64;
    Iy = Ix;
    A = (Math.PI * D * D) / 4;
  } else if (shape === 'box') {
    const bi = Math.max(1, b - 2 * t);
    const hi = Math.max(1, h - 2 * t);
    Ix = (b * Math.pow(h, 3) - bi * Math.pow(hi, 3)) / 12;
    Iy = (h * Math.pow(b, 3) - hi * Math.pow(bi, 3)) / 12;
    A = b * h - bi * hi;
  } else if (shape === 'ibeam') {
    const bi = Math.max(1, b - t);
    const hi = Math.max(1, h - 2 * t);
    Ix = (b * Math.pow(h, 3) - bi * Math.pow(hi, 3)) / 12;
    Iy = (2 * t * Math.pow(b, 3) + (h - 2 * t) * Math.pow(t, 3)) / 12;
    A = 2 * b * t + Math.max(0, h - 2 * t) * t;
  }

  const Iactive = axis === 'x' ? Ix : Iy;

  const resetSimulator = () => {
    setShape('rect');
    setAxis('x');
    setB(40);
    setH(80);
    setT(5);
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoePredictAns(null);
    setPoeFinalAns(null);
  };

  const generatePlotData = () => {
    const traces = [];
    const annotations = [];

    // --- Subplot 1: Cross-Section View (Left) ---
    if (shape === 'rect') {
      traces.push({
        x: [-b / 2, -b / 2, b / 2, b / 2, -b / 2],
        y: [-h / 2, h / 2, h / 2, -h / 2, -h / 2],
        mode: 'lines', fill: 'toself', fillcolor: 'rgba(139, 92, 246, 0.08)',
        line: { color: '#8b5cf6', width: 2.5 },
        xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
      });
    } else if (shape === 'circ') {
      const cx = [], cy = [];
      const radOuter = h / 2;
      for (let th = 0; th <= 365; th += 5) {
        const rad = (th * Math.PI) / 180;
        cx.push(radOuter * Math.cos(rad));
        cy.push(radOuter * Math.sin(rad));
      }
      traces.push({
        x: cx, y: cy,
        mode: 'lines', fill: 'toself', fillcolor: 'rgba(139, 92, 246, 0.08)',
        line: { color: '#8b5cf6', width: 2.5 },
        xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
      });
    } else if (shape === 'box') {
      traces.push({
        x: [-b / 2, -b / 2, b / 2, b / 2, -b / 2],
        y: [-h / 2, h / 2, h / 2, -h / 2, -h / 2],
        mode: 'lines', fill: 'toself', fillcolor: 'rgba(139, 92, 246, 0.08)',
        line: { color: '#8b5cf6', width: 2.5 },
        xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
      });
      const bi = Math.max(1, b - 2 * t);
      const hi = Math.max(1, h - 2 * t);
      traces.push({
        x: [-bi / 2, -bi / 2, bi / 2, bi / 2, -bi / 2],
        y: [-hi / 2, hi / 2, hi / 2, -hi / 2, -hi / 2],
        mode: 'lines', fill: 'toself', fillcolor: '#ffffff',
        line: { color: '#8b5cf6', width: 1.5 },
        xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
      });
    } else if (shape === 'ibeam') {
      const hi = Math.max(1, h - 2 * t);
      const ix = [-b / 2, -b / 2, b / 2, b / 2, t / 2, t / 2, b / 2, b / 2, -b / 2, -b / 2, -t / 2, -t / 2, -b / 2];
      const iy = [hi / 2, h / 2, h / 2, hi / 2, hi / 2, -hi / 2, -hi / 2, -h / 2, -h / 2, -hi / 2, -hi / 2, hi / 2, hi / 2];
      traces.push({
        x: ix, y: iy,
        mode: 'lines', fill: 'toself', fillcolor: 'rgba(139, 92, 246, 0.08)',
        line: { color: '#8b5cf6', width: 2.5 },
        xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
      });
    }

    // Neutral axes
    traces.push({
      x: [-60, 60], y: [0, 0],
      mode: 'lines', line: { color: axis === 'x' ? '#3b82f6' : '#cbd5e1', width: axis === 'x' ? 3.0 : 1.5, dash: axis === 'x' ? 'solid' : 'dash' },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });
    traces.push({
      x: [0, 0], y: [-60, 60],
      mode: 'lines', line: { color: axis === 'y' ? '#ef4444' : '#cbd5e1', width: axis === 'y' ? 3.0 : 1.5, dash: axis === 'y' ? 'solid' : 'dash' },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    annotations.push({
      x: 50, y: 8, xref: 'x1', yref: 'y1',
      text: 'X-Axis', font: { family: 'Outfit', size: 9, color: axis === 'x' ? '#3b82f6' : '#94a3b8', weight: 'bold' },
      showarrow: false
    });
    annotations.push({
      x: 8, y: 50, xref: 'x1', yref: 'y1',
      text: 'Y-Axis', font: { family: 'Outfit', size: 9, color: axis === 'y' ? '#ef4444' : '#94a3b8', weight: 'bold' },
      showarrow: false
    });

    // --- Subplot 2: Beam Deflection Visualization (Right) ---
    let sag = 0.5 * (1.0e6 / Iactive);
    if (sag > 1.2) sag = 1.2;
    if (sag < 0.05) sag = 0.05;

    // Supports
    traces.push({
      x: [0.1, 0.2, 0.3, 0.1], y: [-1.2, -1.0, -1.2, -1.2],
      mode: 'lines', line: { color: '#475569', width: 2 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });
    traces.push({
      x: [1.7, 1.8, 1.9, 1.7], y: [-1.2, -1.0, -1.2, -1.2],
      mode: 'lines', line: { color: '#475569', width: 2 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    const beamX = [];
    const beamY = [];
    const beamL = 1.6;
    const steps = 40;
    const mid = beamL / 2;

    for (let i = 0; i <= steps; i++) {
      const xLocal = (i / steps) * beamL;
      let valY = 0;
      if (xLocal <= mid) {
        valY = -sag * (3 * mid * xLocal * xLocal - Math.pow(xLocal, 3)) / (mid * mid * mid);
      } else {
        const xSym = beamL - xLocal;
        valY = -sag * (3 * mid * xSym * xSym - Math.pow(xSym, 3)) / (mid * mid * mid);
      }
      beamX.push(0.2 + xLocal);
      beamY.push(valY);
    }

    traces.push({
      x: beamX, y: beamY,
      mode: 'lines', line: { color: '#8b5cf6', width: 5.5 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    annotations.push({
      ax: 1.0, ay: 0.8,
      x: 1.0, y: -sag - 0.05,
      xref: 'x2', yref: 'y2', axref: 'x2', ayref: 'y2',
      showarrow: true, arrowhead: 2, arrowsize: 0.8, arrowwidth: 3.5, arrowcolor: '#ef4444', text: ''
    });

    annotations.push({
      x: 1.0, y: -sag - 0.45, xref: 'x2', yref: 'y2',
      text: `Deflection ∝ 1/I<br>(${Iactive > 3e5 ? 'Stiff Beam' : 'Flexible Beam'})`,
      font: { family: 'Outfit', size: 9, color: '#475569', weight: 'bold' },
      showarrow: false
    });

    const layout = {
      grid: { rows: 1, columns: 2, pattern: 'independent' },
      xaxis: { domain: [0, 0.48], range: [-60, 60], showgrid: true, gridcolor: 'rgba(128, 128, 128, 0.05)', zeroline: false, fixedrange: true },
      yaxis: { domain: [0, 1], range: [-60, 60], showgrid: true, gridcolor: 'rgba(128, 128, 128, 0.05)', zeroline: false, scaleanchor: 'x1', scaleratio: 1, fixedrange: true },
      xaxis2: { domain: [0.52, 1.0], range: [-0.1, 2.1], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      yaxis2: { domain: [0, 1], range: [-2.0, 1.2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      margin: { l: 15, r: 15, t: 15, b: 15 },
      showlegend: false,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      annotations
    };

    return { traces, layout };
  };

  const { traces, layout } = generatePlotData();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1.5px solid var(--border-light)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 4 • Lesson 30
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Area Moment of Inertia</h1>
      </div>

      {/* Objectives */}
      <div className="objectives-card" style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Target style={{ color: '#8b5cf6' }} size={22} />
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learning Objectives
          </span>
        </div>
        <ul>
          <li>Calculate Area Moment of Inertia ($I_x, I_y$) for common beam cross-sections.</li>
          <li>Understand how cross-sectional geometry dictates bending resistance.</li>
          <li>Compare structural mass efficiency of solid vs. hollow and I-beam sections.</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Simulator */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Interactive Area Moment of Inertia Sandbox</h3>

          {/* Lock Banner */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Shape Selector */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {[
              { id: 'rect', label: 'Rectangle' },
              { id: 'circ', label: 'Circle' },
              { id: 'box', label: 'Hollow Box' },
              { id: 'ibeam', label: 'I-Beam' }
            ].map((s) => (
              <button
                key={s.id}
                style={{
                  flex: 1, padding: '6px 8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem', fontWeight: 500, backgroundColor: shape === s.id ? '#8b5cf6' : 'white', color: shape === s.id ? 'white' : '#475569'
                }}
                disabled={isLocked}
                onClick={() => setShape(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Plotly Canvas */}
          <div style={{ width: '100%', height: '280px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '15px' }}>
            {/* Width */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px', opacity: shape === 'circ' ? 0.5 : 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>1. Width (b)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Base, b</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{b} mm</span>
              </div>
              <input type="range" min="20" max="100" step="5" value={b} disabled={isLocked || shape === 'circ'} onChange={(e) => setB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            {/* Height / Dia */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>2. Height (h / D)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>{shape === 'circ' ? 'Dia, D' : 'Height, h'}</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{h} mm</span>
              </div>
              <input type="range" min="20" max="100" step="5" value={h} disabled={isLocked} onChange={(e) => setH(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            {/* Thickness */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px', opacity: (shape === 'box' || shape === 'ibeam') ? 1 : 0.5 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>3. Thickness (t)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Wall, t</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{t} mm</span>
              </div>
              <input type="range" min="3" max="12" step="1" value={t} disabled={isLocked || (shape !== 'box' && shape !== 'ibeam')} onChange={(e) => setT(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            {/* Bending Axis */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>4. Bending Axis</div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <button
                  style={{ flex: 1, padding: '4px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: axis === 'x' ? '#8b5cf6' : 'white', color: axis === 'x' ? 'white' : '#475569', cursor: isLocked ? 'not-allowed' : 'pointer' }}
                  disabled={isLocked} onClick={() => setAxis('x')}
                >
                  X-Axis (Edge)
                </button>
                <button
                  style={{ flex: 1, padding: '4px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: axis === 'y' ? '#8b5cf6' : 'white', color: axis === 'y' ? 'white' : '#475569', cursor: isLocked ? 'not-allowed' : 'pointer' }}
                  disabled={isLocked} onClick={() => setAxis('y')}
                >
                  Y-Axis (Side)
                </button>
              </div>
            </div>
          </div>

          {/* Equations Box */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.82rem', marginTop: '15px', color: '#1e293b', borderLeft: '4px solid #8b5cf6', lineHeight: 1.5 }}>
            <div><b>Section Properties & Bending Resistance:</b></div>
            <div>• Cross-Sectional Area, <b>A</b> = <b>{A.toFixed(0)} $\text{mm}^2$</b></div>
            <div>• Inertia about X (Edge): <b>$I_x$</b> = <b>{(Ix / 1e4).toFixed(2)} $\times 10^4\text{ mm}^4$</b></div>
            <div>• Inertia about Y (Side): <b>$I_y$</b> = <b>{(Iy / 1e4).toFixed(2)} $\times 10^4\text{ mm}^4$</b></div>
            <div>• Active Bending Inertia: <b>I = {axis === 'x' ? 'I_x' : 'I_y'}</b> = <b>{(Iactive / 1e4).toFixed(2)} $\times 10^4\text{ mm}^4$</b></div>
          </div>
        </div>

        {/* Right Sidecar Column */}
        <div style={{ background: 'rgba(139, 92, 246, 0.04)', border: '2px solid #8b5cf6', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ marginTop: 0, color: '#8b5cf6', fontWeight: 700, fontSize: '1.1rem', marginBottom: '15px' }}>
              {phase === 'instructions' && '📖 Step 1: Instructions'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Practice'}
              {phase === 'poe_predict' && '🔮 POE Challenge: Predict'}
              {phase === 'poe_observe' && '👀 POE Challenge: Observe & Correct'}
              {phase === 'poe_explain' && '💡 POE Challenge: Explain'}
            </h4>

            {phase === 'instructions' && (
              <div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '12px' }}>
                  <b>Area Moment of Inertia (I)</b> quantifies a cross-section's resistance to bending:
                </p>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '20px', marginBottom: '15px' }}>
                  <li><b>X-Axis Bending (Edge):</b> $I_x = \int y^2 dA$</li>
                  <li><b>Y-Axis Bending (Side):</b> $I_y = \int x^2 dA$</li>
                </ul>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>Start Practice 🔍</button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Guided Practice:</b><br />
                  1. Select <b>Rectangle</b> shape ($b=20\text{ mm}$, $h=60\text{ mm}$).<br />
                  2. Compare $I_x$ (edge) vs $I_y$ (side).
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What are $I_x$ and $I_y$, and how many times stiffer is the board on its edge?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Ix = 36e4 mm⁴, Iy = 4e4 mm⁴; 9 times stiffer on edge',
                    'Ix = 36e4 mm⁴, Iy = 12e4 mm⁴; 3 times stiffer on edge',
                    'Ix = 18e4 mm⁴, Iy = 2e4 mm⁴; 9 times stiffer on edge',
                    'Ix = 72e4 mm⁴, Iy = 8e4 mm⁴; 9 times stiffer on edge'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>Submit Answer</button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: guidedAnswer && guidedAnswer.includes('36e4') && guidedAnswer.includes('9 times') ? '#dcfce7' : '#fef2f2', color: guidedAnswer && guidedAnswer.includes('36e4') && guidedAnswer.includes('9 times') ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer && guidedAnswer.includes('36e4') && guidedAnswer.includes('9 times')
                      ? 'Correct! Ix = 36 × 10^4 mm⁴, Iy = 4 × 10^4 mm⁴. Ratio = 36/4 = 9.'
                      : 'Incorrect. Ix = (20·60^3)/12 = 36 × 10^4 mm⁴, Iy = (60·20^3)/12 = 4 × 10^4 mm⁴.'}
                  </div>
                )}
                <hr style={{ margin: '15px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
                <button className="btn-secondary" onClick={() => setPhase('poe_predict')}>Go to POE Challenge 🔮</button>
              </div>
            )}

            {phase === 'poe_predict' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>Predict Phase (Controls Locked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Scenario:</b> Solid square $60 \times 60\text{ mm}$ vs Hollow box $60 \times 60\text{ mm}$ ($t=10\text{ mm}$).<br />
                  <b>Question:</b> Which beam has higher $I_x$, and which design is more material-efficient?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Solid has higher Ix; Hollow is more mass-efficient',
                    'Hollow has higher Ix; Solid is more mass-efficient',
                    'Both have equal Ix; Hollow is more mass-efficient',
                    'Solid has higher Ix; Solid is more mass-efficient'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="poe_p" value={opt} checked={poePredictAns === opt} onChange={() => { setPoePredictAns(opt); setPoeFinalAns(opt); }} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe_observe')} disabled={!poePredictAns}>Test Hypothesis 🧪</button>
              </div>
            )}

            {phase === 'poe_observe' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d', marginBottom: '8px' }}>Observe & Correct Phase (Controls Unlocked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Instructions:</b><br />
                  1. Compare Rectangle $60 \times 60\text{ mm}$ ($I_x = 108 \times 10^4, A = 3600$).<br />
                  2. Compare Hollow Box $60 \times 60\text{ mm}, t=10\text{ mm}$ ($I_x = 86.67 \times 10^4, A = 2000$).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Solid has higher Ix; Hollow is more mass-efficient',
                    'Hollow has higher Ix; Solid is more mass-efficient',
                    'Both have equal Ix; Hollow is more mass-efficient',
                    'Solid has higher Ix; Solid is more mass-efficient'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="poe_o" value={opt} checked={poeFinalAns === opt} onChange={() => setPoeFinalAns(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe_explain')}>Final Submit 📤</button>
              </div>
            )}

            {phase === 'poe_explain' && (
              <div>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Your final selection:</b><br />
                  <code style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>{poeFinalAns}</code>
                </p>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: poeFinalAns && poeFinalAns.includes('Solid has higher Ix; Hollow is more mass-efficient') ? '#dcfce7' : '#fef2f2', color: poeFinalAns && poeFinalAns.includes('Solid has higher Ix; Hollow is more mass-efficient') ? '#15803d' : '#b91c1c', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {poeFinalAns && poeFinalAns.includes('Solid has higher Ix; Hollow is more mass-efficient') ? '🎉 Correct! Excellent engineering judgement.' : '⚠️ Incorrect. Look at the calculations.'}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <b>Explanation:</b><br />
                  Removing the solid core removes material near the neutral axis which carries very little bending load. The hollow box loses only 19.8% of its inertia while shedding 44.4% of its weight!
                </div>
                <button className="btn-secondary" onClick={resetSimulator} style={{ marginTop: '15px' }}>Reset Simulator 🔄</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

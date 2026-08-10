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

export default function ShearStress() {
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeHypothesis, setPoeHypothesis] = useState(null);
  const [poeFinalAnswer, setPoeFinalAnswer] = useState(null);

  // Type and Sliders
  const [type, setType] = useState('single'); // 'single' or 'double'
  const [P, setP] = useState(80);
  const [d, setD] = useState(20);
  const [strength, setStrength] = useState(120);

  const isLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoeHypothesis(null);
    setPoeFinalAnswer(null);
    setType('single');
    setP(80);
    setD(20);
    setStrength(120);
  };

  // Math Sizing
  const A_pin = (Math.PI * d * d) / 4;
  const n_planes = type === 'single' ? 1 : 2;
  const A_v = n_planes * A_pin;
  const stress = (P * 1000) / A_v;
  const isFailed = stress > strength;

  // Plotly traces & annotations
  const traces = [];
  const annotations = [];

  const pinW = 0.15 + 0.25 * (d / 40);
  const offset_left = isFailed ? -0.4 : 0;
  const offset_right = isFailed ? 0.4 : 0;

  if (type === 'single') {
    // Single Shear
    traces.push({
      x: [-2.0 + offset_left, 0.4 + offset_left, 0.4 + offset_left, -2.0 + offset_left, -2.0 + offset_left],
      y: [0.7, 0.7, 1.3, 1.3, 0.7],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(148, 163, 184, 0.15)',
      line: { color: '#475569', width: 2 },
      showlegend: false, hoverinfo: 'skip'
    });

    traces.push({
      x: [-0.4 + offset_right, 2.0 + offset_right, 2.0 + offset_right, -0.4 + offset_right, -0.4 + offset_right],
      y: [0.1, 0.1, 0.7, 0.7, 0.1],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(148, 163, 184, 0.15)',
      line: { color: '#64748b', width: 2 },
      showlegend: false, hoverinfo: 'skip'
    });

    if (!isFailed) {
      traces.push({
        x: [-pinW / 2, -pinW / 2, pinW / 2, pinW / 2, -pinW / 2],
        y: [-0.2, 1.6, 1.6, -0.2, -0.2],
        mode: 'lines',
        fill: 'toself',
        fillcolor: 'rgba(249, 115, 22, 0.1)',
        line: { color: '#f97316', width: 3.0 },
        showlegend: false, hoverinfo: 'skip'
      });
    } else {
      traces.push({
        x: [-pinW / 2 + offset_left, -pinW / 2 + offset_left, pinW / 2 + offset_left, pinW / 2 + offset_left, -pinW / 2 + offset_left],
        y: [0.7, 1.6, 1.6, 0.7, 0.7],
        mode: 'lines',
        fill: 'toself',
        fillcolor: 'rgba(239, 68, 68, 0.15)',
        line: { color: '#ef4444', width: 2.5 },
        showlegend: false, hoverinfo: 'skip'
      });
      traces.push({
        x: [-pinW / 2 + offset_right, -pinW / 2 + offset_right, pinW / 2 + offset_right, pinW / 2 + offset_right, -pinW / 2 + offset_right],
        y: [-0.2, 0.7, 0.7, -0.2, -0.2],
        mode: 'lines',
        fill: 'toself',
        fillcolor: 'rgba(239, 68, 68, 0.15)',
        line: { color: '#ef4444', width: 2.5 },
        showlegend: false, hoverinfo: 'skip'
      });
    }

    annotations.push({
      ax: -2.0 + offset_left, ay: 1.0,
      x: -2.7 + offset_left, y: 1.0,
      showarrow: true, arrowhead: 2, arrowcolor: '#1e293b', arrowwidth: 3.5, text: ''
    });
    annotations.push({
      x: -2.7 + offset_left, y: 1.0,
      showarrow: false, text: `P = ${P} kN`,
      font: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' },
      xshift: -15
    });

    annotations.push({
      ax: 2.0 + offset_right, ay: 0.4,
      x: 2.7 + offset_right, y: 0.4,
      showarrow: true, arrowhead: 2, arrowcolor: '#1e293b', arrowwidth: 3.5, text: ''
    });
    annotations.push({
      x: 2.7 + offset_right, y: 0.4,
      showarrow: false, text: `P = ${P} kN`,
      font: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' },
      xshift: 15
    });

    if (!isFailed) {
      annotations.push({
        x: pinW / 2 + 0.4, y: 0.7,
        text: 'Shear Plane ✂️',
        font: { family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold' },
        showarrow: true, arrowhead: 1, arrowsize: 0.5, ax: 35, ay: 0
      });
    }
  } else {
    // Double Shear
    traces.push({
      x: [-2.0 + offset_left, 0.4 + offset_left, 0.4 + offset_left, -2.0 + offset_left, -2.0 + offset_left],
      y: [1.3, 1.3, 1.9, 1.9, 1.3],
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(148, 163, 184, 0.15)',
      line: { color: '#475569', width: 2 }, showlegend: false, hoverinfo: 'skip'
    });
    traces.push({
      x: [-2.0 + offset_left, 0.4 + offset_left, 0.4 + offset_left, -2.0 + offset_left, -2.0 + offset_left],
      y: [0.1, 0.1, 0.7, 0.7, 0.1],
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(148, 163, 184, 0.15)',
      line: { color: '#475569', width: 2 }, showlegend: false, hoverinfo: 'skip'
    });
    traces.push({
      x: [-0.4 + offset_right, 2.0 + offset_right, 2.0 + offset_right, -0.4 + offset_right, -0.4 + offset_right],
      y: [0.7, 0.7, 1.3, 1.3, 0.7],
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(148, 163, 184, 0.15)',
      line: { color: '#64748b', width: 2 }, showlegend: false, hoverinfo: 'skip'
    });

    if (!isFailed) {
      traces.push({
        x: [-pinW / 2, -pinW / 2, pinW / 2, pinW / 2, -pinW / 2],
        y: [-0.1, 2.1, 2.1, -0.1, -0.1],
        mode: 'lines', fill: 'toself', fillcolor: 'rgba(249, 115, 22, 0.1)',
        line: { color: '#f97316', width: 3.0 }, showlegend: false, hoverinfo: 'skip'
      });
    } else {
      traces.push({
        x: [-pinW / 2 + offset_left, -pinW / 2 + offset_left, pinW / 2 + offset_left, pinW / 2 + offset_left, -pinW / 2 + offset_left],
        y: [1.3, 2.1, 2.1, 1.3, 1.3],
        mode: 'lines', fill: 'toself', fillcolor: 'rgba(239, 68, 68, 0.15)',
        line: { color: '#ef4444', width: 2.5 }, showlegend: false, hoverinfo: 'skip'
      });
      traces.push({
        x: [-pinW / 2 + offset_right, -pinW / 2 + offset_right, pinW / 2 + offset_right, pinW / 2 + offset_right, -pinW / 2 + offset_right],
        y: [0.7, 1.3, 1.3, 0.7, 0.7],
        mode: 'lines', fill: 'toself', fillcolor: 'rgba(239, 68, 68, 0.15)',
        line: { color: '#ef4444', width: 2.5 }, showlegend: false, hoverinfo: 'skip'
      });
      traces.push({
        x: [-pinW / 2 + offset_left, -pinW / 2 + offset_left, pinW / 2 + offset_left, pinW / 2 + offset_left, -pinW / 2 + offset_left],
        y: [-0.1, 0.7, 0.7, -0.1, -0.1],
        mode: 'lines', fill: 'toself', fillcolor: 'rgba(239, 68, 68, 0.15)',
        line: { color: '#ef4444', width: 2.5 }, showlegend: false, hoverinfo: 'skip'
      });
    }

    annotations.push({
      ax: -2.0 + offset_left, ay: 1.6,
      x: -2.7 + offset_left, y: 1.6,
      showarrow: true, arrowhead: 2, arrowcolor: '#1e293b', arrowwidth: 2.5, text: ''
    });
    annotations.push({
      x: -2.7 + offset_left, y: 1.6, showarrow: false,
      text: `P/2 = ${(P / 2).toFixed(0)} kN`,
      font: { family: 'Outfit', size: 9, color: '#1e293b' }, xshift: -15
    });

    annotations.push({
      ax: -2.0 + offset_left, ay: 0.4,
      x: -2.7 + offset_left, y: 0.4,
      showarrow: true, arrowhead: 2, arrowcolor: '#1e293b', arrowwidth: 2.5, text: ''
    });
    annotations.push({
      x: -2.7 + offset_left, y: 0.4, showarrow: false,
      text: `P/2 = ${(P / 2).toFixed(0)} kN`,
      font: { family: 'Outfit', size: 9, color: '#1e293b' }, xshift: -15
    });

    annotations.push({
      ax: 2.0 + offset_right, ay: 1.0,
      x: 2.7 + offset_right, y: 1.0,
      showarrow: true, arrowhead: 2, arrowcolor: '#1e293b', arrowwidth: 3.5, text: ''
    });
    annotations.push({
      x: 2.7 + offset_right, y: 1.0, showarrow: false,
      text: `P = ${P} kN`,
      font: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' }, xshift: 15
    });

    if (!isFailed) {
      annotations.push({
        x: pinW / 2 + 0.4, y: 1.3, text: 'Plane 1',
        font: { family: 'Outfit', size: 8, color: '#ef4444' },
        showarrow: true, arrowhead: 1, arrowsize: 0.5, ax: 25, ay: 0
      });
      annotations.push({
        x: pinW / 2 + 0.4, y: 0.7, text: 'Plane 2',
        font: { family: 'Outfit', size: 8, color: '#ef4444' },
        showarrow: true, arrowhead: 1, arrowsize: 0.5, ax: 25, ay: 0
      });
    }
  }

  annotations.push({
    x: 0, y: type === 'single' ? 2.0 : 2.4,
    text: `τ = ${stress.toFixed(1)} MPa`,
    font: { family: 'Outfit', size: 13, color: isFailed ? '#ef4444' : '#f97316', weight: 'bold' },
    showarrow: false
  });

  const layout = {
    xaxis: { range: [-3.3, 3.3], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
    yaxis: { range: [-0.4, 2.7], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'x', scaleratio: 1, fixedrange: true },
    margin: { l: 10, r: 10, t: 10, b: 10 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true
  };

  const guidedOptions = [
    "τ = 254.6 MPa (FAILED)",
    "τ = 127.3 MPa (FAILED)",
    "τ = 254.6 MPa (SAFE)",
    "τ = 63.7 MPa (SAFE)"
  ];

  const poeOptions = [
    "τ = 101.9 MPa (FAILED)",
    "τ = 50.9 MPa (SAFE)",
    "τ = 203.7 MPa (FAILED)",
    "τ = 101.9 MPa (SAFE)"
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Title */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 3 • Lesson 25
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2.2rem' }}>
          Shear Stress
        </h1>
      </div>

      {/* Objectives */}
      <div className="objectives-card" style={{
        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(234, 88, 12, 0.05) 100%)',
        border: '1px solid rgba(249, 115, 22, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learning Objectives
          </span>
        </div>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Calculate average shear stress in pinned or bolted connections (<KaTeX math="\tau = P / A_v" />).
          </li>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Differentiate single shear (<KaTeX math="A_v = A_{\text{pin}}" />) vs. double shear (<KaTeX math="A_v = 2 A_{\text{pin}}" />) configurations.
          </li>
          <li style={{ marginBottom: '0px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Evaluate structural safety limits against shear failure (<KaTeX math="\tau \le \tau_y" />).
          </li>
        </ul>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '24px' }}>
        
        {/* LEFT COLUMN: SIMULATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Interactive Pinned Connection Simulator
            </h3>
            {/* Shear Type Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={isLocked} onClick={() => setType('single')} style={{
                padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: isLocked ? 'not-allowed' : 'pointer',
                border: type === 'single' ? '1.5px solid #f97316' : '1px solid var(--border-light)',
                backgroundColor: type === 'single' ? '#f97316' : 'transparent',
                color: type === 'single' ? '#fff' : 'var(--text-main)'
              }}>Single Shear Joint</button>
              <button disabled={isLocked} onClick={() => setType('double')} style={{
                padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: isLocked ? 'not-allowed' : 'pointer',
                border: type === 'double' ? '1.5px solid #f97316' : '1px solid var(--border-light)',
                backgroundColor: type === 'double' ? '#f97316' : 'transparent',
                color: type === 'double' ? '#fff' : 'var(--text-main)'
              }}>Double Shear Joint</button>
            </div>
          </div>

          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px 14px', color: '#b45309', fontSize: '0.9rem' }}>
              <span>⚠️ <b>Controls locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '280px' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Failure Warning */}
          {isFailed && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1.5px solid #fee2e2', color: '#b91c1c',
              borderRadius: '8px', padding: '10px 14px', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>💥</span>
              <span><b>PIN FAILURE!</b> Shear stress (<KaTeX math={`\\tau = ${stress.toFixed(1)}\\text{ MPa}`} />) exceeds material strength (<KaTeX math={`\\tau_y = ${strength}\\text{ MPa}`} />). Bolt sheared clean through!</span>
            </div>
          )}

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>1. Tension Load (P)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Force P</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{P} kN</span>
              </div>
              <input type="range" min="10" max="150" step="5" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>2. Pin Dia. (d)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Diameter d</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{d} mm</span>
              </div>
              <input type="range" min="10" max="40" step="2" value={d} disabled={isLocked} onChange={(e) => setD(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>3. Shear Strength (τ_y)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Strength τ_y</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{strength} MPa</span>
              </div>
              <input type="range" min="50" max="150" step="10" value={strength} disabled={isLocked} onChange={(e) => setStrength(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>
          </div>

          {/* Equation Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderLeft: `4px solid ${isFailed ? '#ef4444' : '#f97316'}`,
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--text-main)'
          }}>
            <b>Shear Stress Calculation (<KaTeX math="\tau" />):</b><br />
            • Pin Dia, <KaTeX math={`d = ${d}\\text{ mm}`} /><br />
            • Pin Area, <KaTeX math={`A_{\\text{pin}} = \\pi d^2 / 4 = \\pi (${d})^2 / 4 = ${A_pin.toFixed(1)}\\text{ mm}^2`} /><br />
            • Shear Planes, <KaTeX math={`n = ${n_planes}`} /> ({type === 'single' ? 'Single Shear' : 'Double Shear'})<br />
            • Total Shear Area, <KaTeX math={`A_v = n \\cdot A = ${n_planes} \\cdot ${A_pin.toFixed(1)}\\text{ mm}^2 = `} /> <b>{A_v.toFixed(1)} mm²</b><br />
            • Shear Stress, <b><KaTeX math="\tau = P / A_v" /></b> = <KaTeX math={`${P * 1000}\\text{ N} / ${A_v.toFixed(1)}\\text{ mm}^2 = `} /> <b>{stress.toFixed(2)} MPa</b><br />
            • Status: <b style={{ color: isFailed ? '#ef4444' : '#15803d' }}>{isFailed ? 'FAILED (τ > τ_y)' : 'SAFE (τ ≤ τ_y)'}</b>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDECAR */}
        <div style={{
          backgroundColor: 'rgba(249, 115, 22, 0.04)',
          border: '2px solid #f97316',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#f97316', fontWeight: 700, fontSize: '1.1rem' }}>
              {phase === 'instructions' && '📖 Step 1: Instructions'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Practice'}
              {phase === 'poe_predict' && '🔮 POE Challenge: Predict'}
              {phase === 'poe_observe' && '👀 POE Challenge: Observe & Correct'}
              {phase === 'poe_explain' && '💡 POE Challenge: Explain'}
            </h4>

            {phase === 'instructions' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '12px' }}>
                  <b>Shear Stress (<KaTeX math="\tau" />)</b> represents internal force intensity acting parallel to a plane: <KaTeX math="\tau = P / A_v" />.
                </p>
                <ul style={{ paddingLeft: '18px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '6px' }}><b>Single Shear:</b> Load transferred across 1 cut plane (<KaTeX math="A_v = A_{\text{pin}}" />).</li>
                  <li style={{ marginBottom: '6px' }}><b>Double Shear:</b> Load divided across 2 cut planes (<KaTeX math="A_v = 2 A_{\text{pin}}" />).</li>
                </ul>
                <button className="btn-primary" style={{ backgroundColor: '#f97316' }} onClick={() => setPhase('guided_question')}>
                  Start Practice 🔍
                </button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, marginBottom: '8px' }}>Guided Scenario:</p>
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  1. Toggle to <b>Single Shear Joint</b>.<br />
                  2. Load P: <b>80 kN</b>.<br />
                  3. Pin Dia. d: <b>20 mm</b>.<br />
                  4. Shear Strength <KaTeX math="\tau_y" />: <b>120 MPa</b>.
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Question: What is the shear stress, and does the pin fail?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {guidedOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="guidedSh" checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ backgroundColor: '#f97316', marginBottom: '12px' }} onClick={() => setGuidedSubmitted(true)}>
                  Submit Answer
                </button>

                {guidedSubmitted && (
                  <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', backgroundColor: guidedAnswer?.includes('254.6 MPa (FAILED)') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${guidedAnswer?.includes('254.6 MPa (FAILED)') ? '#bbf7d0' : '#fee2e2'}`, color: guidedAnswer?.includes('254.6 MPa (FAILED)') ? '#166534' : '#991b1b', marginBottom: '14px' }}>
                    {guidedAnswer?.includes('254.6 MPa (FAILED)')
                      ? 'Correct! Area A = pi * (20)^2 / 4 = 314.16 mm^2. Stress tau = 80,000 / 314.16 = 254.65 MPa > 120 MPa strength, causing the pin to shear!'
                      : 'Incorrect. Single shear tau = P/A = 80,000 / 314.2 = 254.6 MPa. Since 254.6 MPa > 120 MPa, the pin fails.'}
                  </div>
                )}

                <button className="btn-secondary" onClick={() => setPhase('poe_predict')}>
                  Go to POE Challenge 🔮
                </button>
              </div>
            )}

            {phase === 'poe_predict' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, color: '#b45309', marginBottom: '8px' }}>
                  Predict Phase (Specimen Controls Locked!):
                </p>
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  • Load P = <b>100 kN</b><br />
                  • Pin Dia. d = <b>25 mm</b><br />
                  • Shear Strength <KaTeX math="\tau_y" /> = <b>60 MPa</b><br />
                  • Joint configuration: <b>Double Shear</b>
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  What is the resulting shear stress, and does the pin fail?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeSh" checked={poeHypothesis === opt} onChange={() => setPoeHypothesis(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ backgroundColor: '#f97316' }} disabled={!poeHypothesis} onClick={() => { setPoeFinalAnswer(poeHypothesis); setPhase('poe_observe'); }}>
                  Test Hypothesis 🧪
                </button>
              </div>
            )}

            {phase === 'poe_observe' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, color: '#f97316', marginBottom: '8px' }}>
                  Observe & Correct Phase (Controls Unlocked!):
                </p>
                <p style={{ marginBottom: '10px' }}>
                  1. Toggle to <b>Double Shear Joint</b>.<br />
                  2. Set Load to <b>100 kN</b>, Pin Dia. to <b>25 mm</b>, Strength to <b>60 MPa</b>.<br />
                  3. Observe calculated stress and pin failure graphics.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeShO" checked={poeFinalAnswer === opt} onChange={() => setPoeFinalAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ backgroundColor: '#f97316' }} onClick={() => setPhase('poe_explain')}>
                  Final Submit 📤
                </button>
              </div>
            )}

            {phase === 'poe_explain' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, marginBottom: '6px' }}>Your final selection:</p>
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-card)', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '12px' }}>
                  {poeFinalAnswer}
                </div>

                {poeFinalAnswer === "τ = 101.9 MPa (FAILED)" ? (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, marginBottom: '14px' }}>
                    🎉 Correct! Great mechanical logic.
                  </div>
                ) : (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#9a3412', fontWeight: 700, marginBottom: '14px' }}>
                    ⚠️ Incorrect. Review the math below.
                  </div>
                )}

                <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <h5 style={{ fontWeight: 700, margin: '10px 0 6px 0' }}>Explanation:</h5>
                  <ol style={{ paddingLeft: '18px', margin: 0 }}>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Pin Area:</b> <KaTeX math="A_{\text{pin}} = \pi (25)^2 / 4 \approx 490.87\text{ mm}^2" />.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Double Shear Area:</b> <KaTeX math="A_v = 2 A_{\text{pin}} = 981.75\text{ mm}^2" />.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Shear Stress:</b> <KaTeX math="\tau = 100,000 / 981.75 \approx 101.86\text{ MPa}" />.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      Since <KaTeX math="\tau = 101.86\text{ MPa} > \tau_y = 60.0\text{ MPa}" />, the pin <b>fails</b> in double shear.
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

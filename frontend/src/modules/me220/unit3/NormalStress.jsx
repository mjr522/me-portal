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

export default function NormalStress() {
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeHypothesis, setPoeHypothesis] = useState(null);
  const [poeFinalAnswer, setPoeFinalAnswer] = useState(null);

  // Mode and Sliders
  const [mode, setMode] = useState('axial'); // 'axial' or 'bearing'
  const [P, setP] = useState(100);
  const [d, setD] = useState(40);
  const [B, setB] = useState(120);

  const isLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoeHypothesis(null);
    setPoeFinalAnswer(null);
    setMode('axial');
    setP(100);
    setD(40);
    setB(120);
  };

  // Math Sizing
  const rad = d / 2;
  const A_col = Math.PI * rad * rad;
  const stress_col = (P * 1000) / A_col;

  const A_b = B * B;
  const stress_b = (P * 1000) / A_b;

  // Plotly traces & annotations
  const traces = [];
  const annotations = [];

  if (mode === 'axial') {
    const colW = 0.3 + 1.2 * (d / 60);

    traces.push({
      x: [-colW / 2, -colW / 2, colW / 2, colW / 2, -colW / 2],
      y: [-1, 3, 3, -1, -1],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(249, 115, 22, 0.08)',
      line: { color: '#f97316', width: 2.5 },
      name: 'Column Body',
      hoverinfo: 'skip'
    });

    traces.push({
      x: [-colW / 2 - 0.2, colW / 2 + 0.2],
      y: [1.0, 1.0],
      mode: 'lines',
      line: { color: '#ef4444', width: 2, dash: 'dash' },
      name: 'Cut Plane Section A-A',
      hoverinfo: 'skip'
    });

    annotations.push({
      ax: 0, ay: -1.0,
      x: 0, y: -2.0,
      xref: 'x', yref: 'y',
      axref: 'x', ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 0.8,
      arrowwidth: 3.5,
      arrowcolor: '#1e293b',
      text: `P = ${P} kN`,
      font: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' },
      yshift: -15
    });

    annotations.push({
      ax: 0, ay: 3.0,
      x: 0, y: 4.0,
      xref: 'x', yref: 'y',
      axref: 'x', ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 0.8,
      arrowwidth: 3.5,
      arrowcolor: '#1e293b',
      text: `P = ${P} kN`,
      font: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' },
      yshift: 15
    });

    const numArrows = 5;
    for (let i = 0; i < numArrows; i++) {
      const x_coord = -colW / 2 + (colW / (numArrows - 1)) * i;
      annotations.push({
        ax: x_coord, ay: 1.0,
        x: x_coord, y: 1.6,
        xref: 'x', yref: 'y',
        axref: 'x', ayref: 'y',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 0.5,
        arrowwidth: 2.0,
        arrowcolor: '#ef4444',
        text: '',
        hoverinfo: 'skip'
      });
    }

    annotations.push({
      x: colW / 2 + 0.6, y: 1.0,
      xref: 'x', yref: 'y',
      text: 'Section A-A',
      font: { family: 'Outfit', size: 11, color: '#ef4444', weight: 'bold' },
      showarrow: false
    });

    annotations.push({
      x: 0, y: 1.9,
      xref: 'x', yref: 'y',
      text: `σ = ${stress_col.toFixed(1)} MPa`,
      font: { family: 'Outfit', size: 13, color: '#ef4444', weight: 'bold' },
      showarrow: false
    });
  } else {
    const colW = 0.3 + 0.8 * (d / 60);
    const footW = 0.6 + 1.6 * (B / 200);

    traces.push({
      x: [-colW / 2, -colW / 2, colW / 2, colW / 2, -colW / 2],
      y: [1, 3, 3, 1, 1],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(71, 85, 105, 0.08)',
      line: { color: '#475569', width: 2 },
      name: 'Column',
      hoverinfo: 'skip'
    });

    traces.push({
      x: [-footW / 2, -footW / 2, footW / 2, footW / 2, -footW / 2],
      y: [0, 1, 1, 0, 0],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(249, 115, 22, 0.12)',
      line: { color: '#f97316', width: 2.5 },
      name: 'Footing Base',
      hoverinfo: 'skip'
    });

    traces.push({
      x: [-2.5, 2.5],
      y: [0, 0],
      mode: 'lines',
      line: { color: '#94a3b8', width: 3 },
      name: 'Ground Line',
      hoverinfo: 'skip'
    });

    annotations.push({
      ax: 0, ay: 4.0,
      x: 0, y: 3.0,
      xref: 'x', yref: 'y',
      axref: 'x', ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 0.8,
      arrowwidth: 3.5,
      arrowcolor: '#1e293b',
      text: `P = ${P} kN`,
      font: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' },
      yshift: 15
    });

    const numArrows = 6;
    for (let i = 0; i < numArrows; i++) {
      const x_coord = -footW / 2 + (footW / (numArrows - 1)) * i;
      annotations.push({
        ax: x_coord, ay: -1.0,
        x: x_coord, y: -0.1,
        xref: 'x', yref: 'y',
        axref: 'x', ayref: 'y',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 0.5,
        arrowwidth: 2.0,
        arrowcolor: '#f97316',
        text: '',
        hoverinfo: 'skip'
      });
    }

    annotations.push({
      x: 0, y: -1.3,
      xref: 'x', yref: 'y',
      text: `σ_b = ${stress_b.toFixed(2)} MPa`,
      font: { family: 'Outfit', size: 13, color: '#f97316', weight: 'bold' },
      showarrow: false
    });

    annotations.push({
      x: 0, y: 0.5,
      xref: 'x', yref: 'y',
      text: 'Footing Pedestal',
      font: { family: 'Outfit', size: 9, color: '#f97316' },
      showarrow: false
    });
  }

  const layout = {
    xaxis: { range: [-3, 3], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
    yaxis: { range: [-2.2, 4.5], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'x', scaleratio: 1, fixedrange: true },
    margin: { l: 10, r: 10, t: 10, b: 10 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true
  };

  const guidedOptions = [
    "σ = 169.76 MPa",
    "σ = 42.44 MPa",
    "σ = 127.32 MPa",
    "σ = 84.88 MPa"
  ];

  const poeOptions = [
    "Axial stress inside the column is higher",
    "Bearing stress on the footing is higher",
    "Both stresses are equal because the load is the same"
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Title */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 3 • Lesson 20
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2.2rem' }}>
          Normal & Bearing Stress
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
            Calculate average normal stress under axial loading (<KaTeX math="\sigma = P / A" />).
          </li>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Calculate bearing stress at structural contact interfaces (<KaTeX math="\sigma_b = P / A_{\text{bearing}}" />).
          </li>
          <li style={{ marginBottom: '0px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Compare internal normal stress concentration vs. interface bearing stress distribution.
          </li>
        </ul>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '24px' }}>
        
        {/* LEFT COLUMN: SIMULATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Interactive Stress Sandbox
            </h3>
            {/* Mode Toggle Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={isLocked} onClick={() => setMode('axial')} style={{
                padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: isLocked ? 'not-allowed' : 'pointer',
                border: mode === 'axial' ? '1.5px solid #f97316' : '1px solid var(--border-light)',
                backgroundColor: mode === 'axial' ? '#f97316' : 'transparent',
                color: mode === 'axial' ? '#fff' : 'var(--text-main)'
              }}>Axial Normal Stress Mode</button>
              <button disabled={isLocked} onClick={() => setMode('bearing')} style={{
                padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem', cursor: isLocked ? 'not-allowed' : 'pointer',
                border: mode === 'bearing' ? '1.5px solid #f97316' : '1px solid var(--border-light)',
                backgroundColor: mode === 'bearing' ? '#f97316' : 'transparent',
                color: mode === 'bearing' ? '#fff' : 'var(--text-main)'
              }}>Footing Bearing Stress Mode</button>
            </div>
          </div>

          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px 14px', color: '#b45309', fontSize: '0.9rem' }}>
              <span>⚠️ <b>Controls locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '320px' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>1. Axial Force</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Load, P</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{P} kN</span>
              </div>
              <input type="range" min="20" max="200" step="10" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>2. Column Dia. (d)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Diameter, d</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{d} mm</span>
              </div>
              <input type="range" min="10" max="60" step="5" value={d} disabled={isLocked} onChange={(e) => setD(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>3. Footing Size (B)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Width, B</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{B} mm</span>
              </div>
              <input type="range" min="50" max="200" step="10" value={B} disabled={isLocked} onChange={(e) => setB(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>
          </div>

          {/* Live Equation Output */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderLeft: '4px solid #f97316',
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--text-main)'
          }}>
            {mode === 'axial' ? (
              <div>
                <b>Axial Normal Stress Calculation (<KaTeX math="\sigma" />):</b><br />
                • Load, <KaTeX math={`P = ${P}\\text{ kN} = ${P * 1000}\\text{ N}`} /><br />
                • Column Dia, <KaTeX math={`d = ${d}\\text{ mm}`} /><br />
                • Area, <KaTeX math={`A = \\pi d^2 / 4 = \\pi (${d})^2 / 4 = ${A_col.toFixed(1)}\\text{ mm}^2`} /><br />
                • Normal Stress, <b><KaTeX math="\sigma = P / A" /></b> = <KaTeX math={`${P * 1000}\\text{ N} / ${A_col.toFixed(1)}\\text{ mm}^2 = `} /> <b>{stress_col.toFixed(2)} MPa (Tension)</b>
              </div>
            ) : (
              <div>
                <b>Footing Bearing Stress Calculation (<KaTeX math="\sigma_b" />):</b><br />
                • Load, <KaTeX math={`P = ${P}\\text{ kN} = ${P * 1000}\\text{ N}`} /><br />
                • Footing Dimension, <KaTeX math={`B = ${B}\\text{ mm} \\times ${B}\\text{ mm}`} /><br />
                • Bearing Area, <KaTeX math={`A_{\\text{bearing}} = B^2 = ${A_b.toFixed(0)}\\text{ mm}^2`} /><br />
                • Bearing Stress, <b><KaTeX math="\sigma_b = P / A_{\text{bearing}}" /></b> = <KaTeX math={`${P * 1000}\\text{ N} / ${A_b.toFixed(0)}\\text{ mm}^2 = `} /> <b>{stress_b.toFixed(3)} MPa</b><br />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(Compare with Column Axial Stress: <KaTeX math={`\\sigma_{\\text{axial}} = ${stress_col.toFixed(2)}\\text{ MPa}`} />)</span>
              </div>
            )}
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
                  <b>Normal Stress (<KaTeX math="\sigma" />)</b> is the intensity of internal force acting perpendicular to a cut plane.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <b>Bearing Stress (<KaTeX math="\sigma_b" />)</b> is the contact compressive stress developed at the interface between two contacting surfaces.
                </p>
                <ul style={{ paddingLeft: '18px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '6px' }}><b>Axial Normal Stress:</b> <KaTeX math="\sigma = P / A" /></li>
                  <li style={{ marginBottom: '6px' }}><b>Bearing Stress:</b> <KaTeX math="\sigma_b = P / A_{\text{bearing}}" /></li>
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
                  1. Toggle to <b>Axial Normal Stress Mode</b>.<br />
                  2. Set <b>Axial Force (P):</b> 120 kN.<br />
                  3. Set <b>Column Dia. (d):</b> 30 mm.
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Question: What is the normal stress inside this column?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {guidedOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="guidedN" checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ backgroundColor: '#f97316', marginBottom: '12px' }} onClick={() => setGuidedSubmitted(true)}>
                  Submit Answer
                </button>

                {guidedSubmitted && (
                  <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', backgroundColor: guidedAnswer?.includes('169.76') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${guidedAnswer?.includes('169.76') ? '#bbf7d0' : '#fee2e2'}`, color: guidedAnswer?.includes('169.76') ? '#166534' : '#991b1b', marginBottom: '14px' }}>
                    {guidedAnswer?.includes('169.76')
                      ? 'Correct! Area A = pi * (30)^2 / 4 = 706.86 mm^2. Stress sigma = 120,000 N / 706.86 mm^2 = 169.76 MPa.'
                      : 'Incorrect. Area A = pi * d^2 / 4 = 706.86 mm^2. Then sigma = P/A = 120,000 N / 706.86 mm^2 = 169.76 MPa.'}
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
                  Predict Phase (Controls Locked!):
                </p>
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  A structural column with diameter <b>d = 30 mm</b> rests on a square footing of width <b>B = 100 mm</b> under load <b>P = 150 kN</b>.
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Which stress is higher: the axial stress inside the column (<KaTeX math="\sigma" />), or the bearing stress on the footing (<KaTeX math="\sigma_b" />)?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeN" checked={poeHypothesis === opt} onChange={() => setPoeHypothesis(opt)} />
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
                  1. Set <b>Load P</b> to <b>150 kN</b>.<br />
                  2. Set Column Dia <b>d = 30 mm</b> and Footing Width <b>B = 100 mm</b>.<br />
                  3. Toggle modes to compare calculated stresses.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeNO" checked={poeFinalAnswer === opt} onChange={() => setPoeFinalAnswer(opt)} />
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

                {poeFinalAnswer === "Axial stress inside the column is higher" ? (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, marginBottom: '14px' }}>
                    🎉 Correct! Excellent work.
                  </div>
                ) : (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#9a3412', fontWeight: 700, marginBottom: '14px' }}>
                    ⚠️ Incorrect. Look at the physics calculations below.
                  </div>
                )}

                <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <h5 style={{ fontWeight: 700, margin: '10px 0 6px 0' }}>Explanation:</h5>
                  <ol style={{ paddingLeft: '18px', margin: 0 }}>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Column Area:</b> <KaTeX math="A_{\text{col}} = \pi (30)^2 / 4 \approx 706.86\text{ mm}^2 \implies \sigma_{\text{axial}} = 150,000 / 706.86 \approx 212.21\text{ MPa}" />.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Bearing Area:</b> <KaTeX math="A_{\text{bearing}} = 100^2 = 10,000\text{ mm}^2 \implies \sigma_{\text{bearing}} = 150,000 / 10,000 = 15.0\text{ MPa}" />.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      The column axial stress is <b>over 14 times higher</b> than the footing bearing stress due to the smaller cross-sectional area.
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

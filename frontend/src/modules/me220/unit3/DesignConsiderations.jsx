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

const materials = {
  steel: { Sy: 250, name: 'Structural Steel (Sy = 250 MPa)' },
  alum: { Sy: 150, name: 'Aluminum Alloy (Sy = 150 MPa)' },
  tita: { Sy: 800, name: 'Titanium Alloy (Sy = 800 MPa)' }
};

export default function DesignConsiderations() {
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeHypothesis, setPoeHypothesis] = useState(null);
  const [poeFinalAnswer, setPoeFinalAnswer] = useState(null);

  // Material & Sliders
  const [matKey, setMatKey] = useState('steel');
  const [P, setP] = useState(150);
  const [targetFS, setTargetFS] = useState(2.0);
  const [d, setD] = useState(30);

  const isLocked = phase === 'poe_predict';
  const mat = materials[matKey];

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoeHypothesis(null);
    setPoeFinalAnswer(null);
    setMatKey('steel');
    setP(150);
    setTargetFS(2.0);
    setD(30);
  };

  // Math Calculations
  const A = (Math.PI * d * d) / 4; // mm2
  const stress = (P * 1000) / A; // MPa
  const allowableStress = mat.Sy / targetFS; // MPa
  const actualFS = mat.Sy / stress;

  let status = 'safe';
  if (stress > mat.Sy) {
    status = 'failed';
  } else if (stress > allowableStress) {
    status = 'warning';
  }

  // Plotly traces & annotations
  const traces = [];
  const annotations = [];

  // Ceiling
  traces.push({
    x: [-2, 2],
    y: [2.5, 2.5],
    mode: 'lines',
    line: { color: '#475569', width: 4 },
    showlegend: false,
    hoverinfo: 'skip'
  });

  const rodW = 0.05 + 0.35 * (d / 60);

  if (status !== 'failed') {
    const rodColor = status === 'safe' ? '#10b981' : '#f59e0b';
    traces.push({
      x: [-rodW / 2, -rodW / 2, rodW / 2, rodW / 2, -rodW / 2],
      y: [0, 2.5, 2.5, 0, 0],
      mode: 'lines',
      fill: 'toself',
      fillcolor: status === 'safe' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
      line: { color: rodColor, width: 3.5 },
      showlegend: false,
      hoverinfo: 'skip'
    });

    traces.push({
      x: [-0.8, -0.8, 0.8, 0.8, -0.8],
      y: [-1.4, 0, 0, -1.4, -1.4],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(71, 85, 105, 0.1)',
      line: { color: '#334155', width: 2.5 },
      showlegend: false,
      hoverinfo: 'skip'
    });

    annotations.push({
      x: 0, y: -0.7,
      text: `LOAD BLOCK<br>P = ${P} kN`,
      font: { family: 'Outfit', size: 10, color: '#334155', weight: 'bold' },
      showarrow: false
    });
  } else {
    // FAILED: Snapped rod
    traces.push({
      x: [-rodW / 2, -rodW / 2, rodW / 2, rodW / 2, -rodW / 2],
      y: [1.35, 2.5, 2.5, 1.35, 1.35],
      mode: 'lines',
      line: { color: '#ef4444', width: 3.5 },
      showlegend: false,
      hoverinfo: 'skip'
    });

    traces.push({
      x: [-rodW / 2, -rodW / 2, rodW / 2, rodW / 2, -rodW / 2],
      y: [-1.8, -0.65, -0.65, -1.8, -1.8],
      mode: 'lines',
      line: { color: '#ef4444', width: 3.5 },
      showlegend: false,
      hoverinfo: 'skip'
    });

    traces.push({
      x: [-rodW / 2, 0, rodW / 2],
      y: [1.35, 1.25, 1.35],
      mode: 'lines',
      line: { color: '#ef4444', width: 2 },
      showlegend: false,
      hoverinfo: 'skip'
    });
    traces.push({
      x: [-rodW / 2, 0, rodW / 2],
      y: [-0.65, -0.75, -0.65],
      mode: 'lines',
      line: { color: '#ef4444', width: 2 },
      showlegend: false,
      hoverinfo: 'skip'
    });

    traces.push({
      x: [-0.8, -0.8, 0.8, 0.8, -0.8],
      y: [-2.5, -1.1, -1.1, -2.5, -2.5],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(220, 38, 38, 0.1)',
      line: { color: '#ef4444', width: 2.5 },
      showlegend: false,
      hoverinfo: 'skip'
    });

    annotations.push({
      x: 0, y: -1.8,
      text: '💥 COLLAPSED!',
      font: { family: 'Outfit', size: 12, color: '#ef4444', weight: 'bold' },
      showarrow: false
    });
  }

  // Stress Meter Bar on the side (x = 2.2)
  const meterY_top = 2.0;
  const meterY_bot = -2.0;
  const meterX = 2.2;

  traces.push({
    x: [meterX - 0.15, meterX + 0.15, meterX + 0.15, meterX - 0.15, meterX - 0.15],
    y: [meterY_bot, meterY_bot, meterY_top, meterY_top, meterY_bot],
    mode: 'lines',
    line: { color: '#cbd5e1', width: 1.5 },
    showlegend: false,
    hoverinfo: 'skip'
  });

  let stressRatio = stress / mat.Sy;
  if (stressRatio > 1.2) stressRatio = 1.2;
  const fillY = meterY_bot + (meterY_top - meterY_bot) * (stressRatio / 1.2);
  const fillColor = status === 'safe' ? '#10b981' : (status === 'warning' ? '#f59e0b' : '#ef4444');

  traces.push({
    x: [meterX - 0.1, meterX + 0.1, meterX + 0.1, meterX - 0.1, meterX - 0.1],
    y: [meterY_bot, meterY_bot, fillY, fillY, meterY_bot],
    mode: 'lines',
    fill: 'toself',
    fillcolor: fillColor + '40',
    line: { color: fillColor, width: 1 },
    showlegend: false,
    hoverinfo: 'skip'
  });

  const allowRatio = allowableStress / mat.Sy;
  const allowY = meterY_bot + (meterY_top - meterY_bot) * (allowRatio / 1.2);

  traces.push({
    x: [meterX - 0.25, meterX + 0.25],
    y: [allowY, allowY],
    mode: 'lines',
    line: { color: '#6366f1', width: 2.5 },
    name: 'Allowable Stress Limit',
    hoverinfo: 'skip'
  });

  annotations.push({
    x: meterX + 0.3, y: allowY,
    text: 'Allowable Limit',
    font: { family: 'Outfit', size: 8, color: '#6366f1', weight: 'bold' },
    showarrow: false,
    xanchor: 'left'
  });

  annotations.push({
    x: meterX, y: meterY_top + 0.2,
    text: 'Stress Meter',
    font: { family: 'Outfit', size: 9, color: '#64748b', weight: 'bold' },
    showarrow: false
  });

  const layout = {
    xaxis: { range: [-2.5, 3.8], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
    yaxis: { range: [-2.8, 3.0], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'x', scaleratio: 1, fixedrange: true },
    margin: { l: 10, r: 10, t: 10, b: 10 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true
  };

  const guidedOptions = [
    "34 mm (Actual F.S. = 1.51)",
    "39 mm (Actual F.S. = 2.00)",
    "28 mm (Actual F.S. = 1.03)",
    "44 mm (Actual F.S. = 2.53)"
  ];

  const poeOptions = [
    "18 mm",
    "26 mm",
    "32 mm",
    "12 mm"
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Title */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 3 • Lesson 23
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2.2rem' }}>
          Design Considerations: Safety Factors
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
            Distinguish between internal stress (<KaTeX math="\sigma" />), material yield strength (<KaTeX math="S_y" />), and ultimate strength (<KaTeX math="S_u" />).
          </li>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Calculate allowable stress (<KaTeX math="\sigma_{\text{allow}} = S_y / FS_{\text{design}}" />) and size structural members.
          </li>
          <li style={{ marginBottom: '0px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Evaluate achieved structural factors of safety (<KaTeX math="FS_{\text{actual}} = S_y / \sigma_{\text{actual}}" />).
          </li>
        </ul>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '24px' }}>
        
        {/* LEFT COLUMN: SIMULATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Interactive Sizing Sandbox
            </h3>
            {/* Presets */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {Object.keys(materials).map((k) => (
                <button key={k} disabled={isLocked} onClick={() => setMatKey(k)} style={{
                  padding: '5px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem', cursor: isLocked ? 'not-allowed' : 'pointer',
                  border: matKey === k ? '1.5px solid #f97316' : '1px solid var(--border-light)',
                  backgroundColor: matKey === k ? '#f97316' : 'transparent',
                  color: matKey === k ? '#fff' : 'var(--text-main)'
                }}>{k === 'steel' ? 'Steel' : (k === 'alum' ? 'Aluminum' : 'Titanium')}</button>
              ))}
            </div>
          </div>

          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px 14px', color: '#b45309', fontSize: '0.9rem' }}>
              <span>⚠️ <b>Controls locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '300px' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Status Box */}
          <div style={{
            padding: '10px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: status === 'safe' ? '#f0fdf4' : (status === 'warning' ? '#fffbeb' : '#fef2f2'),
            border: `1.5px solid ${status === 'safe' ? '#dcfce7' : (status === 'warning' ? '#fef3c7' : '#fee2e2')}`,
            color: status === 'safe' ? '#15803d' : (status === 'warning' ? '#d97706' : '#b91c1c')
          }}>
            <span>{status === 'safe' ? '🟢' : (status === 'warning' ? '🟡' : '🔴')}</span>
            <span>
              {status === 'safe' && `Safe Design: Stress is within allowable limits. (Actual F.S. = ${actualFS.toFixed(2)} ≥ Target F.S. = ${targetFS.toFixed(1)})`}
              {status === 'warning' && `Marginal Design: Safe from yield, but fails safety factor target! (Actual F.S. = ${actualFS.toFixed(2)} < Target F.S. = ${targetFS.toFixed(1)})`}
              {status === 'failed' && `STRUCTURAL COLLAPSE! Actual stress exceeds material strength. (Actual F.S. = ${actualFS.toFixed(2)} < 1.0)`}
            </span>
          </div>

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>1. Weight Load (P)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Load P</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{P} kN</span>
              </div>
              <input type="range" min="50" max="300" step="10" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>2. Design F.S.</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Target F.S.</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{targetFS.toFixed(1)}</span>
              </div>
              <input type="range" min="1.2" max="3.5" step="0.1" value={targetFS} disabled={isLocked} onChange={(e) => setTargetFS(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>3. Rod Dia. (d)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Sized d</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{d} mm</span>
              </div>
              <input type="range" min="10" max="60" step="1" value={d} disabled={isLocked} onChange={(e) => setD(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>
          </div>

          {/* Equation Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderLeft: `4px solid ${status === 'safe' ? '#15803d' : (status === 'warning' ? '#d97706' : '#b91c1c')}`,
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--text-main)'
          }}>
            <b>Design sizing and safety factors:</b><br />
            • Sized Area, <b>A</b> = <KaTeX math={`\\pi d^2 / 4 = \\pi (${d})^2 / 4 = `} /> <b>{A.toFixed(1)} mm²</b><br />
            • Actual Stress, <b><KaTeX math="\sigma" /></b> = <KaTeX math={`P / A = ${P * 1000}\\text{ N} / ${A.toFixed(1)}\\text{ mm}^2 = `} /> <b>{stress.toFixed(2)} MPa</b><br />
            • Allowable Stress Target: <b><KaTeX math="\sigma_{\text{allow}} = S_y / FS_{\text{target}}" /></b> = <KaTeX math={`${mat.Sy} / ${targetFS.toFixed(1)} = `} /> <b>{allowableStress.toFixed(1)} MPa</b><br />
            • Achieved Factor of Safety: <b><KaTeX math="FS_{\text{actual}} = S_y / \sigma" /></b> = <KaTeX math={`${mat.Sy} / ${stress.toFixed(2)} = `} /> <b>{actualFS.toFixed(2)}</b>
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
                  <b>Stress (<KaTeX math="\sigma" />):</b> Internal load intensity determined by loading and geometry (<KaTeX math="\sigma = P / A" />).
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <b>Strength (<KaTeX math="S_y" />):</b> Maximum stress a material can withstand before yielding.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  <b>Factor of Safety:</b> <KaTeX math="\sigma_{\text{allow}} = S_y / FS_{\text{design}}" /> where <KaTeX math="\sigma_{\text{actual}} \le \sigma_{\text{allow}}" />.
                </p>
                <button className="btn-primary" style={{ backgroundColor: '#f97316' }} onClick={() => setPhase('guided_question')}>
                  Start Practice 🔍
                </button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, marginBottom: '8px' }}>Guided Scenario:</p>
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  1. Preset: <b>Steel</b> (<KaTeX math="S_y = 250\text{ MPa}" />).<br />
                  2. Load P: <b>150 kN</b>.<br />
                  3. Target F.S.: <b>2.0</b>.<br />
                  4. Adjust Rod Diameter <i>d</i> to find the smallest safe integer diameter.
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Question: What is the minimum safe diameter?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {guidedOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="guidedD" checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ backgroundColor: '#f97316', marginBottom: '12px' }} onClick={() => setGuidedSubmitted(true)}>
                  Submit Answer
                </button>

                {guidedSubmitted && (
                  <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', backgroundColor: guidedAnswer?.includes('39 mm') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${guidedAnswer?.includes('39 mm') ? '#bbf7d0' : '#fee2e2'}`, color: guidedAnswer?.includes('39 mm') ? '#166534' : '#991b1b', marginBottom: '14px' }}>
                    {guidedAnswer?.includes('39 mm')
                      ? 'Correct! Area A = pi * (39)^2 / 4 = 1194.6 mm^2. Stress sigma = 150,000 / 1194.6 = 125.6 MPa. Actual F.S. = 250 / 125.6 = 1.99 approx 2.0.'
                      : 'Incorrect. At d = 39 mm, stress is 125.6 MPa, satisfying allowable stress sigma_allow = 250 / 2.0 = 125 MPa.'}
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
                  • Load P: <b>200 kN</b><br />
                  • Target F.S.: <b>2.0</b><br />
                  • Material: <b>Titanium</b> (<KaTeX math="S_y = 800\text{ MPa}" />)
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  What is the minimum diameter <i>d</i> required to safely support this load with F.S. = 2.0?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeD" checked={poeHypothesis === opt} onChange={() => setPoeHypothesis(opt)} />
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
                  1. Select <b>Titanium</b> preset.<br />
                  2. Set Load to <b>200 kN</b> and Target F.S. to <b>2.0</b>.<br />
                  3. Vary Rod Diameter <i>d</i> until status turns green (🟢 Safe).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeDO" checked={poeFinalAnswer === opt} onChange={() => setPoeFinalAnswer(opt)} />
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

                {poeFinalAnswer === "26 mm" ? (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, marginBottom: '14px' }}>
                    🎉 Correct! Outstanding work.
                  </div>
                ) : (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#9a3412', fontWeight: 700, marginBottom: '14px' }}>
                    ⚠️ Incorrect. Look at the calculations below.
                  </div>
                )}

                <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <h5 style={{ fontWeight: 700, margin: '10px 0 6px 0' }}>Explanation:</h5>
                  <ol style={{ paddingLeft: '18px', margin: 0 }}>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Allowable Stress:</b> <KaTeX math="\sigma_{\text{allow}} = 800 / 2.0 = 400\text{ MPa}" />.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Required Area:</b> <KaTeX math="A \ge 200,000 / 400 = 500\text{ mm}^2" />.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Diameter:</b> <KaTeX math="d \ge \sqrt{4 \cdot 500 / \pi} \approx 25.23\text{ mm}" />. Rounding up to safe integer mm yields <b>26 mm</b>.
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

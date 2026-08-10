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
  steel: { E: 200000, Sy: 250, Su: 400, ey: 0.00125, eu: 0.012, erup: 0.015, name: 'Structural Steel (E = 200 GPa)' },
  alum: { E: 70000, Sy: 270, Su: 310, ey: 0.00386, eu: 0.010, erup: 0.013, name: 'Aluminum 6061-T6 (E = 70 GPa)' },
  tita: { E: 110000, Sy: 800, Su: 900, ey: 0.00727, eu: 0.012, erup: 0.015, name: 'Titanium Alloy (E = 110 GPa)' }
};

export default function StressStrainAxial() {
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeHypothesis, setPoeHypothesis] = useState(null);
  const [poeFinalAnswer, setPoeFinalAnswer] = useState(null);

  // Material and Sliders
  const [matKey, setMatKey] = useState('steel');
  const [P, setP] = useState(100);
  const [L, setL] = useState(3.0);
  const [A, setA] = useState(500);
  const [zoom, setZoom] = useState(500);

  const isLocked = phase === 'poe_predict';
  const mat = materials[matKey];

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoeHypothesis(null);
    setPoeFinalAnswer(null);
    setMatKey('steel');
    setP(100);
    setL(3.0);
    setA(500);
    setZoom(500);
  };

  // Math Calculations
  const stress = (P * 1000) / A; // MPa
  const isYielded = stress > mat.Sy;
  let strain = 0;

  if (!isYielded) {
    strain = stress / mat.E;
  } else {
    let ratio = (stress - mat.Sy) / (mat.Su - mat.Sy);
    if (ratio > 1.0) ratio = 1.0;
    strain = mat.ey + (mat.eu - mat.ey) * ratio * ratio;
  }

  const delta = strain * (L * 1000); // mm

  // Plotly Subplot Traces
  const traces = [];
  const annotations = [];

  // SUBPLOT 1: SPECIMEN (Left)
  const orig_len_plot = 1.5 + (L / 5.0) * 1.5;
  const stretched_len_plot = orig_len_plot + (delta * zoom / 1000);

  // Wall
  traces.push({
    x: [0.1, 0.2, 0.2, 0.1],
    y: [1.8, 1.8, 0.2, 0.2],
    mode: 'lines',
    fill: 'toself',
    fillcolor: '#94a3b8',
    line: { color: '#475569', width: 2.5 },
    xaxis: 'x1', yaxis: 'y1',
    showlegend: false,
    hoverinfo: 'skip'
  });

  // Specimen Bar
  const spec_height = 0.2 + 0.4 * (A / 1200);
  traces.push({
    x: [0.2, 0.2 + stretched_len_plot, 0.2 + stretched_len_plot, 0.2, 0.2],
    y: [1.0 + spec_height / 2, 1.0 + spec_height / 2, 1.0 - spec_height / 2, 1.0 - spec_height / 2, 1.0 + spec_height / 2],
    mode: 'lines',
    fill: 'toself',
    fillcolor: isYielded ? 'rgba(239, 68, 68, 0.08)' : 'rgba(249, 115, 22, 0.08)',
    line: { color: isYielded ? '#ef4444' : '#f97316', width: 2.5 },
    xaxis: 'x1', yaxis: 'y1',
    showlegend: false,
    hoverinfo: 'skip'
  });

  // Force arrow
  annotations.push({
    ax: 0.2 + stretched_len_plot, ay: 1.0,
    x: 0.2 + stretched_len_plot + 0.6, y: 1.0,
    xref: 'x1', yref: 'y1',
    axref: 'x1', ayref: 'y1',
    showarrow: true,
    arrowhead: 2,
    arrowsize: 0.8,
    arrowwidth: 3.5,
    arrowcolor: '#1e293b',
    text: ''
  });
  annotations.push({
    x: 0.2 + stretched_len_plot + 0.6, y: 1.0,
    xref: 'x1', yref: 'y1',
    showarrow: false,
    text: `P = ${P} kN`,
    font: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' },
    xshift: 15
  });

  annotations.push({
    x: 0.2 + stretched_len_plot / 2,
    y: 1.0 + spec_height / 2 + 0.2,
    xref: 'x1', yref: 'y1',
    text: `A = ${A} mm²`,
    font: { family: 'Outfit', size: 9, color: '#f97316' },
    showarrow: false
  });

  annotations.push({
    x: 0.2 + stretched_len_plot / 2,
    y: 1.0 - spec_height / 2 - 0.2,
    xref: 'x1', yref: 'y1',
    text: `L₀ = ${L.toFixed(1)} m`,
    font: { family: 'Outfit', size: 9, color: '#475569' },
    showarrow: false
  });

  annotations.push({
    x: 0.2 + stretched_len_plot / 2,
    y: 0.2,
    xref: 'x1', yref: 'y1',
    text: `δ = ${delta.toFixed(3)} mm (stretched)`,
    font: { family: 'Outfit', size: 10, color: isYielded ? '#ef4444' : '#f97316', weight: 'bold' },
    showarrow: false
  });

  // SUBPLOT 2: STRESS-STRAIN CURVE (Right)
  const strainPts = [];
  const stressPts = [];

  const step = mat.ey / 10;
  for (let e = 0; e <= mat.ey; e += step) {
    strainPts.push(e);
    stressPts.push(e * mat.E);
  }

  const plastStep = (mat.erup - mat.ey) / 20;
  for (let e = mat.ey; e <= mat.erup; e += plastStep) {
    strainPts.push(e);
    let ratio = (e - mat.ey) / (mat.eu - mat.ey);
    if (ratio > 1.0) ratio = 1.0;
    let s = mat.Sy + (mat.Su - mat.Sy) * Math.sin(ratio * Math.PI / 2);
    if (e > mat.eu) {
      let ratioDrop = (e - mat.eu) / (mat.erup - mat.eu);
      s = mat.Su - (mat.Su - mat.Sy * 0.9) * ratioDrop * ratioDrop;
    }
    stressPts.push(s);
  }

  traces.push({
    x: strainPts,
    y: stressPts,
    mode: 'lines',
    line: { color: '#94a3b8', width: 2 },
    name: 'Stress-Strain Curve',
    xaxis: 'x2', yaxis: 'y2',
    showlegend: false,
    hoverinfo: 'skip'
  });

  traces.push({
    x: [strain],
    y: [stress],
    mode: 'markers',
    marker: { size: 10, color: isYielded ? '#ef4444' : '#10b981' },
    name: 'Operating Point',
    xaxis: 'x2', yaxis: 'y2',
    showlegend: false,
    hoverinfo: 'text',
    hovertext: `Stress: ${stress.toFixed(1)} MPa\nStrain: ${strain.toFixed(5)}`
  });

  annotations.push({
    x: strain, y: stress,
    xref: 'x2', yref: 'y2',
    text: `  (ε=${strain.toFixed(5)}, σ=${stress.toFixed(1)} MPa)`,
    font: { family: 'Outfit', size: 9, color: isYielded ? '#ef4444' : '#10b981', weight: 'bold' },
    showarrow: false,
    xanchor: 'left',
    yshift: 10
  });

  const layout = {
    grid: { rows: 1, columns: 2, pattern: 'independent' },
    xaxis: { domain: [0, 0.48], range: [0, 4.5], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
    yaxis: { domain: [0, 1], range: [0, 2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
    xaxis2: {
      domain: [0.55, 1], range: [0, mat.erup * 1.1],
      title: 'Strain, ε (mm/mm)', titlefont: { family: 'Outfit', size: 10, color: '#475569' },
      tickfont: { family: 'Outfit', size: 8, color: '#64748b' },
      showgrid: true, gridcolor: 'rgba(128, 128, 128, 0.1)', fixedrange: true
    },
    yaxis2: {
      domain: [0, 1], range: [0, mat.Su * 1.15],
      title: 'Stress, σ (MPa)', titlefont: { family: 'Outfit', size: 10, color: '#475569' },
      tickfont: { family: 'Outfit', size: 8, color: '#64748b' },
      showgrid: true, gridcolor: 'rgba(128, 128, 128, 0.1)', fixedrange: true
    },
    margin: { l: 10, r: 10, t: 15, b: 35 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true
  };

  const guidedOptions = [
    "σ = 125.0 MPa, ε = 0.000625, δ = 2.50 mm",
    "σ = 125.0 MPa, ε = 0.000625, δ = 2.50 * 10^-3 mm",
    "σ = 80.0 MPa, ε = 0.000400, δ = 1.60 mm",
    "σ = 250.0 MPa, ε = 0.001250, δ = 5.00 mm"
  ];

  const poeOptions = [
    "Aluminum has higher strain and elongation; Steel yields but Aluminum remains elastic",
    "Aluminum has higher strain and elongation; Steel remains elastic but Aluminum yields",
    "Aluminum has higher strain and elongation; Both materials yield and deform plastically",
    "Steel has higher strain and elongation; Both remain elastic"
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Title */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 3 • Lesson 21
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2.2rem' }}>
          Normal Stress, Strain & Axial Loading
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
            Define normal strain (<KaTeX math="\epsilon = \delta / L_0" />) under tensile or compressive forces.
          </li>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Apply Hooke's Law (<KaTeX math="\sigma = E \epsilon" />) and compute axial elongation (<KaTeX math="\delta = PL_0 / AE" />).
          </li>
          <li style={{ marginBottom: '0px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Analyze elastic vs. plastic behavior using material stress-strain curves.
          </li>
        </ul>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '24px' }}>
        
        {/* LEFT COLUMN: SIMULATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Interactive Stress-Strain Specimen Simulator
            </h3>
            {/* Preset Toggles */}
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
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '280px' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Yield Warning */}
          {isYielded && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1.5px solid #fee2e2', color: '#b91c1c',
              borderRadius: '8px', padding: '10px 14px', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>⚠️</span>
              <span><b>MATERIAL YIELD LIMIT EXCEEDED!</b> Stress passed elastic limit (<KaTeX math={`S_y = ${mat.Sy}\\text{ MPa}`} />). Hooke's Law is invalid. Plastic deformation is occurring.</span>
            </div>
          )}

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>1. Force (P)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span>Load P</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{P} kN</span>
              </div>
              <input type="range" min="0" max="300" step="10" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>2. Length (L)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span>Length L</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{L.toFixed(1)} m</span>
              </div>
              <input type="range" min="1.0" max="5.0" step="0.5" value={L} disabled={isLocked} onChange={(e) => setL(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>3. Area (A)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span>Area A</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{A} mm²</span>
              </div>
              <input type="range" min="200" max="1200" step="50" value={A} disabled={isLocked} onChange={(e) => setA(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>4. Stretch Zoom</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span>Zoom</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>{zoom}x</span>
              </div>
              <input type="range" min="100" max="1000" step="100" value={zoom} disabled={isLocked} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>
          </div>

          {/* Equation Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderLeft: `4px solid ${isYielded ? '#ef4444' : '#f97316'}`,
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--text-main)'
          }}>
            {!isYielded ? (
              <div>
                <b>Elastic Deformations & Hooke's Law:</b><br />
                • Normal Stress: <b><KaTeX math="\sigma = P / A" /></b> = <KaTeX math={`${P * 1000}\\text{ N} / ${A}\\text{ mm}^2 = `} /> <b>{stress.toFixed(2)} MPa</b><br />
                • Elastic Strain: <b><KaTeX math="\epsilon = \sigma / E" /></b> = <KaTeX math={`${stress.toFixed(2)} / ${mat.E} = `} /> <b>{strain.toFixed(5)}</b><br />
                • Total Elongation: <b><KaTeX math="\delta = PL_0 / AE" /></b> = <KaTeX math={`(${P * 1000} \\cdot ${L}) / (${A} \\cdot ${mat.E / 1000}) = `} /> <b>{delta.toFixed(4)} mm</b>
              </div>
            ) : (
              <div>
                <b>Plastic Range (Hooke's Law Invalid):</b><br />
                • Normal Stress: <b><KaTeX math="\sigma = P / A" /></b> = {stress.toFixed(2)} MPa &gt; Yield Limit (<KaTeX math={`S_y = ${mat.Sy}\\text{ MPa}`} />)<br />
                • Strain (Non-linear): <b><KaTeX math={`\\epsilon = ${strain.toFixed(5)}`} /></b> (estimated from plastic curve)<br />
                • Plastic Elongation: <b><KaTeX math="\delta = \epsilon \cdot L_0" /></b> = <KaTeX math={`${strain.toFixed(5)} \\cdot ${L * 1000}\\text{ mm} = `} /> <b>{delta.toFixed(3)} mm</b><br />
                <span style={{ color: '#b91c1c', fontSize: '0.75rem' }}>(⚠️ Note: Initial slope E = {mat.E} MPa does NOT apply in plastic range!)</span>
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
                  <b>Strain (<KaTeX math="\epsilon" />)</b> measures deformation per unit length: <KaTeX math="\epsilon = \delta / L_0" />.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <b>Hooke's Law</b> states stress is proportional to strain in the elastic region: <KaTeX math="\sigma = E \epsilon" />.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  <b>Axial Elongation:</b> <KaTeX math="\delta = \frac{P L_0}{A E}" />.
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
                  1. Preset: <b>Structural Steel</b>.<br />
                  2. Force P: <b>100 kN</b>.<br />
                  3. Length L: <b>4.0 m</b>.<br />
                  4. Area A: <b>800 mm²</b>.
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Question: What is the normal stress, strain, and total elongation?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {guidedOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="guidedSS" checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ backgroundColor: '#f97316', marginBottom: '12px' }} onClick={() => setGuidedSubmitted(true)}>
                  Submit Answer
                </button>

                {guidedSubmitted && (
                  <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', backgroundColor: guidedAnswer?.includes('2.50 mm') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${guidedAnswer?.includes('2.50 mm') ? '#bbf7d0' : '#fee2e2'}`, color: guidedAnswer?.includes('2.50 mm') ? '#166534' : '#991b1b', marginBottom: '14px' }}>
                    {guidedAnswer?.includes('2.50 mm')
                      ? 'Correct! Stress sigma = 100 kN / 800 mm^2 = 125.0 MPa. Strain epsilon = 125.0 / 200,000 = 0.000625. Elongation delta = 0.000625 * 4000 mm = 2.50 mm.'
                      : 'Incorrect. Stress sigma = P/A = 125.0 MPa. Strain epsilon = sigma / E = 0.000625. Elongation delta = epsilon * L = 2.50 mm.'}
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
                  • Load P = 150 kN, Length L = 3.0 m, Area A = 500 mm² (<KaTeX math="\sigma = 300\text{ MPa}" />).<br />
                  • Compare <b>Structural Steel</b> (<KaTeX math="E = 200\text{ GPa}, S_y = 250\text{ MPa}" />) vs. <b>Aluminum 6061-T6</b> (<KaTeX math="E = 70\text{ GPa}, S_y = 270\text{ MPa}" />).
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Predict strain/elongation comparison and whether either material yields:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeSS" checked={poeHypothesis === opt} onChange={() => setPoeHypothesis(opt)} />
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
                  1. Set Load to <b>150 kN</b>, Length to <b>3.0 m</b>, Area to <b>500 mm²</b>.<br />
                  2. Cycle between <b>Steel</b> and <b>Aluminum</b> presets.<br />
                  3. Check yield warnings and elongation values.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeSSO" checked={poeFinalAnswer === opt} onChange={() => setPoeFinalAnswer(opt)} />
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

                {poeFinalAnswer === "Aluminum has higher strain and elongation; Both materials yield and deform plastically" ? (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, marginBottom: '14px' }}>
                    🎉 Correct! Incredible physical insight.
                  </div>
                ) : (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#9a3412', fontWeight: 700, marginBottom: '14px' }}>
                    ⚠️ Incorrect. Review the material limits below.
                  </div>
                )}

                <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <h5 style={{ fontWeight: 700, margin: '10px 0 6px 0' }}>Explanation:</h5>
                  <ol style={{ paddingLeft: '18px', margin: 0 }}>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Stress:</b> <KaTeX math="\sigma = 150,000\text{ N} / 500\text{ mm}^2 = 300\text{ MPa}" />.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Yield Limits:</b> Steel yields at 250 MPa, Aluminum yields at 270 MPa. Since 300 MPa &gt; both limits, <b>both materials yield plastically</b>.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Stiffness:</b> Aluminum has lower Modulus (<KaTeX math="E = 70\text{ GPa}" /> vs <KaTeX math="E = 200\text{ GPa}" />), so it experiences significantly higher strain and elongation.
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

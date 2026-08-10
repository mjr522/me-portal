import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function BeamDeflection() {
  const [support, setSupport] = useState('cant'); // 'cant' | 'simply'
  const [mat, setMat] = useState('steel'); // 'steel' | 'alum' | 'wood'
  const [P, setP] = useState(10); // kN
  const [L, setL] = useState(4.0); // m
  const [h, setH] = useState(200); // mm
  const [zoom, setZoom] = useState(10);

  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poePredictAns, setPoePredictAns] = useState(null);
  const [poeFinalAns, setPoeFinalAns] = useState(null);

  const isLocked = phase === 'poe_predict';

  const materials = {
    steel: { E: 200000, name: 'Structural Steel' },
    alum: { E: 70000, name: 'Aluminum 6061-T6' },
    wood: { E: 12000, name: 'Structural Timber' }
  };

  const selectedMat = materials[mat];

  // Math Calculations
  const b = h / 2;
  const t = 5;
  const bi = Math.max(1, b - 2 * t);
  const hi = Math.max(1, h - 2 * t);
  const Ix = (b * Math.pow(h, 3) - bi * Math.pow(hi, 3)) / 12; // mm4

  const PN = P * 1000;
  const Lmm = L * 1000;

  let deltaMax = 0;
  if (support === 'cant') {
    deltaMax = (PN * Math.pow(Lmm, 3)) / (3 * selectedMat.E * Ix);
  } else {
    deltaMax = (PN * Math.pow(Lmm, 3)) / (48 * selectedMat.E * Ix);
  }

  const deltaAllow = Lmm / 150;
  const isSafe = deltaMax <= deltaAllow;

  const resetSimulator = () => {
    setSupport('cant');
    setMat('steel');
    setP(10);
    setL(4.0);
    setH(200);
    setZoom(10);
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoePredictAns(null);
    setPoeFinalAns(null);
  };

  const generatePlotData = () => {
    const traces = [];
    const annotations = [];

    const steps = 40;
    const beamX = [];
    const beamY = [];

    for (let i = 0; i <= steps; i++) {
      const xCoord = (i / steps) * L;
      let dLocal = 0;
      const xmm = xCoord * 1000;

      if (support === 'cant') {
        dLocal = (PN * xmm * xmm * (3 * Lmm - xmm)) / (6 * selectedMat.E * Ix);
      } else {
        if (xCoord <= L / 2) {
          dLocal = (PN * xmm * (3 * Lmm * Lmm - 4 * xmm * xmm)) / (48 * selectedMat.E * Ix);
        } else {
          const xSym = (L - xCoord) * 1000;
          dLocal = (PN * xSym * (3 * Lmm * Lmm - 4 * xSym * xSym)) / (48 * selectedMat.E * Ix);
        }
      }

      const yPlot = -(dLocal * zoom) / 1000;
      beamX.push(xCoord);
      beamY.push(yPlot);
    }

    // Supports / Wall
    if (support === 'cant') {
      traces.push({
        x: [-0.15, 0, 0, -0.15], y: [0.4, 0.4, -0.4, -0.4],
        mode: 'lines', fill: 'toself', fillcolor: '#64748b', line: { color: '#475569', width: 2 },
        showlegend: false, hoverinfo: 'skip'
      });
    } else {
      traces.push({
        x: [-0.15, 0, 0.15, -0.15], y: [-0.2, 0, -0.2, -0.2],
        mode: 'lines', line: { color: '#475569', width: 2 }, showlegend: false, hoverinfo: 'skip'
      });
      const rollerY = beamY[beamY.length - 1];
      traces.push({
        x: [L - 0.15, L + 0.15], y: [rollerY - 0.08, rollerY - 0.08],
        mode: 'lines', line: { color: '#475569', width: 2 }, showlegend: false, hoverinfo: 'skip'
      });
    }

    // Deflected beam line
    traces.push({
      x: beamX, y: beamY,
      mode: 'lines', line: { color: isSafe ? '#8b5cf6' : '#ef4444', width: 5.0 },
      name: 'Deflected Beam', hoverinfo: 'skip'
    });

    // Original shape
    traces.push({
      x: [0, L], y: [0, 0],
      mode: 'lines', line: { color: '#cbd5e1', width: 1.5, dash: 'dash' },
      showlegend: false, hoverinfo: 'skip'
    });

    // Load arrow
    if (support === 'cant') {
      const tipY = beamY[beamY.length - 1];
      annotations.push({
        ax: L, ay: tipY + 0.5,
        x: L, y: tipY - 0.02,
        showarrow: true, arrowhead: 2, arrowsize: 0.8, arrowwidth: 3.5, arrowcolor: '#ef4444',
        text: `P = ${P} kN`, font: { family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold' },
        yshift: 10
      });
    } else {
      const midY = beamY[Math.floor(steps / 2)];
      annotations.push({
        ax: L / 2, ay: midY + 0.5,
        x: L / 2, y: midY - 0.02,
        showarrow: true, arrowhead: 2, arrowsize: 0.8, arrowwidth: 3.5, arrowcolor: '#ef4444',
        text: `P = ${P} kN`, font: { family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold' },
        yshift: 10
      });
    }

    // Max deflection indicator
    const maxIdx = support === 'cant' ? steps : Math.floor(steps / 2);
    const maxX = beamX[maxIdx];
    const maxY = beamY[maxIdx];

    traces.push({
      x: [maxX, maxX], y: [0, maxY],
      mode: 'lines', line: { color: '#3b82f6', width: 2, dash: 'dot' },
      showlegend: false, hoverinfo: 'skip'
    });

    annotations.push({
      x: maxX, y: maxY / 2,
      text: `δ_max = ${deltaMax.toFixed(1)} mm`,
      font: { family: 'Outfit', size: 9, color: '#3b82f6', weight: 'bold' },
      showarrow: false, xanchor: 'right', xshift: -5
    });

    const layout = {
      xaxis: { range: [-0.4, 6.5], showgrid: true, gridcolor: 'rgba(128, 128, 128, 0.05)', zeroline: false, fixedrange: true },
      yaxis: { range: [-1.4, 0.8], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'x', scaleratio: 1, fixedrange: true },
      margin: { l: 10, r: 10, t: 15, b: 35 },
      showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
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
          Unit 4 • Lesson 33
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Stresses & Deformations due to Bending</h1>
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
          <li>Calculate maximum elastic beam deflections ($\delta_{max}$) for cantilever and simply supported beams.</li>
          <li>Apply Appendix E deflection equations and evaluate serviceability limits ($\delta_{allow} = L/150$).</li>
          <li>Analyze the impact of material stiffness ($E$) and moment of inertia ($I$) on deflections.</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Simulator */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Interactive Elastic Deflection Simulator</h3>

          {/* Lock Banner */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Support Toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <button
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1.5px solid #cbd5e1', backgroundColor: support === 'cant' ? '#8b5cf6' : 'white', color: support === 'cant' ? 'white' : '#475569', fontWeight: 500, fontSize: '0.8rem', cursor: isLocked ? 'not-allowed' : 'pointer' }}
              disabled={isLocked} onClick={() => setSupport('cant')}
            >
              Cantilever Tip Load (Wing Model)
            </button>
            <button
              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1.5px solid #cbd5e1', backgroundColor: support === 'simply' ? '#8b5cf6' : 'white', color: support === 'simply' ? 'white' : '#475569', fontWeight: 500, fontSize: '0.8rem', cursor: isLocked ? 'not-allowed' : 'pointer' }}
              disabled={isLocked} onClick={() => setSupport('simply')}
            >
              Simply Supported Center Load (Bridge Model)
            </button>
          </div>

          {/* Material Presets */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {[
              { id: 'steel', label: 'Steel (E = 200 GPa)' },
              { id: 'alum', label: 'Aluminum (E = 70 GPa)' },
              { id: 'wood', label: 'Wood (E = 12 GPa)' }
            ].map((m) => (
              <button
                key={m.id}
                style={{ flex: 1, padding: '6px 8px', borderRadius: '8px', border: '1.5px solid #cbd5e1', backgroundColor: mat === m.id ? '#8b5cf6' : 'white', color: mat === m.id ? 'white' : '#475569', fontSize: '0.8rem', fontWeight: 500, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                disabled={isLocked} onClick={() => setMat(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Plotly Canvas */}
          <div style={{ width: '100%', height: '260px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '15px' }}>
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>1. Force (P)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Load, P</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{P} kN</span>
              </div>
              <input type="range" min="2" max="30" step="1" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>2. Span (L)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Length, L</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{L.toFixed(1)} m</span>
              </div>
              <input type="range" min="2.0" max="6.0" step="0.5" value={L} disabled={isLocked} onChange={(e) => setL(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>3. Height (h)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Height, h</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{h} mm</span>
              </div>
              <input type="range" min="100" max="300" step="10" value={h} disabled={isLocked} onChange={(e) => setH(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>4. Stretch Zoom</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Zoom</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{zoom}x</span>
              </div>
              <input type="range" min="2" max="30" step="2" value={zoom} disabled={isLocked} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>
          </div>

          {/* Design Status */}
          <div style={{ padding: '10px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', marginTop: '12px', backgroundColor: isSafe ? '#f0fdf4' : '#fef2f2', border: `1.5px solid ${isSafe ? '#dcfce7' : '#fee2e2'}`, color: isSafe ? '#15803d' : '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{isSafe ? '🟢' : '🔴'}</span>
            <span>
              {isSafe
                ? `Design Safe: Deflection (δ_max = ${deltaMax.toFixed(1)} mm) satisfies limit (δ_allow = L/150 = ${deltaAllow.toFixed(1)} mm).`
                : `EXCESSIVE DEFLECTION! δ_max = ${deltaMax.toFixed(1)} mm exceeds allowable limit of ${deltaAllow.toFixed(1)} mm.`}
            </span>
          </div>

          {/* Equations Box */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.82rem', marginTop: '15px', color: '#1e293b', borderLeft: '4px solid #8b5cf6', lineHeight: 1.5 }}>
            <div><b>Deflection Analysis (Appendix E Formulas):</b></div>
            <div>• Spar Inertia, <b>$I_x$</b> = <b>{(Ix / 1e6).toFixed(2)} $\times 10^6\text{ mm}^4$</b> (hollow box: {b}x{h}x{t} mm)</div>
            <div>• Elastic Modulus, <b>E</b> = <b>{selectedMat.E} MPa</b> ({selectedMat.name})</div>
            {support === 'cant' ? (
              <div>• Cantilever tip deflection: <b>{"$\\delta_{max} = \\frac{P L^3}{3 E I}$"}</b> = ({PN}·{Lmm}{'³'}) / (3·{selectedMat.E}·{Ix.toFixed(0)}) = <b>{deltaMax.toFixed(2)} mm</b></div>
            ) : (
              <div>• Simply supported center deflection: <b>{"$\\delta_{max} = \\frac{P L^3}{48 E I}$"}</b> = ({PN}·{Lmm}{'³'}) / (48·{selectedMat.E}·{Ix.toFixed(0)}) = <b>{deltaMax.toFixed(2)} mm</b></div>
            )}
            <div>• Allowable deflection limit: <b>$\delta_{allow} = L/150$</b> = <b>{deltaAllow.toFixed(1)} mm</b></div>
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
                  <b>Bending Deflections:</b><br />
                  Lateral loads create vertical elastic deflection ($\delta$):
                </p>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '20px', marginBottom: '15px' }}>
                  <li><b>Cantilever (Tip Load P):</b> {"$\\delta_{max} = \\frac{P L^3}{3 E I}$"}</li>
                  <li><b>Simply Supported (Center Load P):</b> {"$\\delta_{max} = \\frac{P L^3}{48 E I}$"}</li>
                </ul>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>Start Practice 🔍</button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Guided Scenario:</b><br />
                  1. Select <b>Cantilever</b>.<br />
                  2. Select <b>Aluminum</b> ($E = 70\text{ GPa}$).<br />
                  3. Set $P = 10\text{ kN}$, $L = 4.0\text{ m}$, $h = 200\text{ mm}$.
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What is $I_x$ and maximum deflection ($\delta_{max}$)?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'I_x = 48.6 * 10^6 mm⁴, δ_max = 47.6 mm',
                    'I_x = 24.3 * 10^6 mm⁴, δ_max = 95.2 mm',
                    'I_x = 48.6 * 10^6 mm⁴, δ_max = 16.7 mm',
                    'I_x = 97.2 * 10^6 mm⁴, δ_max = 23.8 mm'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>Submit Answer</button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: guidedAnswer && guidedAnswer.includes('48.6 * 10^6') && guidedAnswer.includes('47.6 mm') ? '#dcfce7' : '#fef2f2', color: guidedAnswer && guidedAnswer.includes('48.6 * 10^6') && guidedAnswer.includes('47.6 mm') ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer && guidedAnswer.includes('48.6 * 10^6') && guidedAnswer.includes('47.6 mm')
                      ? 'Correct! I_x ≈ 48.64 × 10^6 mm⁴, δ_max ≈ 47.6 mm.'
                      : 'Incorrect. Look at equations display: I_x ≈ 4.86 × 10^7 mm⁴ and δ_max ≈ 47.6 mm.'}
                  </div>
                )}
                <hr style={{ margin: '15px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
                <button className="btn-secondary" onClick={() => setPhase('poe_predict')}>Go to POE Challenge 🔮</button>
              </div>
            )}

            {phase === 'poe_predict' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>Predict Phase (Specimen Controls Locked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Scenario:</b> Cantilever tip load $P = 10\text{ kN}$, $L = 4.0\text{ m}$, $h = 200\text{ mm}$.<br />
                  <b>Question:</b> If we switch material from <b>Aluminum</b> ($E = 70\text{ GPa}$) to <b>Steel</b> ($E = 200\text{ GPa}$), what happens to maximum deflection?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Deflection is reduced by a factor of ~2.86 (it drops to ~16.7 mm)',
                    'Deflection is doubled (it increases to ~95.2 mm)',
                    'Deflection is reduced by half',
                    'Deflection remains exactly the same'
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
                  <b>Instructions:</b> Switch material to Steel and observe the new deflection value.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Deflection is reduced by a factor of ~2.86 (it drops to ~16.7 mm)',
                    'Deflection is doubled (it increases to ~95.2 mm)',
                    'Deflection is reduced by half',
                    'Deflection remains exactly the same'
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
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: poeFinalAns && poeFinalAns.includes('factor of ~2.86') ? '#dcfce7' : '#fef2f2', color: poeFinalAns && poeFinalAns.includes('factor of ~2.86') ? '#15803d' : '#b91c1c', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {poeFinalAns && poeFinalAns.includes('factor of ~2.86') ? '🎉 Correct! Excellent stiffness analysis.' : '⚠️ Incorrect. Look at the physics details below.'}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <b>Explanation:</b><br />
                  Deflection $\delta_{max} \propto 1/E$. Ratio $E_{steel}/E_{alum} = 200/70 \approx 2.86$. Steel is 2.86x stiffer, dividing deflection by 2.86 ($47.6 \to 16.7\text{ mm}$)!
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

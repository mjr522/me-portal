import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function ShearMomentDiagrams() {
  const [P, setP] = useState(20.0); // kN
  const [a, setA] = useState(5.0); // m
  const [lockScale, setLockScale] = useState(true);

  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [indAnswer, setIndAnswer] = useState(null);
  const [indSubmitted, setIndSubmitted] = useState(false);

  // POE 1 Answers
  const [poe1Predict, setPoe1Predict] = useState([]);
  const [poe1Final, setPoe1Final] = useState([]);

  // POE 2 Answers
  const [poe2Predict, setPoe2Predict] = useState([]);
  const [poe2Final, setPoe2Final] = useState([]);

  const L = 10.0;
  const isLocked = phase === 'poe1_predict' || phase === 'poe2_predict';

  // Math Beam Calculations
  const calculateBeam = () => {
    const RB = (P * a) / L;
    const RA = (P * (L - a)) / L;
    const x = [];
    const V = [];
    const M = [];

    const stepsLeft = 100;
    for (let i = 0; i < stepsLeft; i++) {
      const xi = (a * i) / stepsLeft;
      x.push(xi);
      V.push(RA);
      M.push(RA * xi);
    }

    // Step discontinuity at x = a
    x.push(a);
    V.push(RA);
    M.push(RA * a);

    x.push(a);
    V.push(RA - P);
    M.push(RA * a);

    const stepsRight = 100;
    for (let i = 1; i <= stepsRight; i++) {
      const xi = a + ((L - a) * i) / stepsRight;
      x.push(xi);
      V.push(RA - P);
      M.push(RA * xi - P * (xi - a));
    }

    return { x, V, M, RA, RB };
  };

  const res = calculateBeam();

  const resetSimulator = () => {
    setP(20.0);
    setA(5.0);
    setLockScale(true);
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setIndAnswer(null);
    setIndSubmitted(false);
    setPoe1Predict([]);
    setPoe1Final([]);
    setPoe2Predict([]);
    setPoe2Final([]);
  };

  const generatePlotData = () => {
    const data = [
      // Row 1: Beam (Index 0)
      { x: [0, L], y: [0, 0], mode: 'lines', line: { color: '#1e293b', width: 8 }, showlegend: false, hoverinfo: 'skip', xaxis: 'x1', yaxis: 'y1' },
      // Pin Support A (Index 1)
      { x: [-0.2, 0.2, 0, -0.2], y: [-0.2, -0.2, 0, -0.2], fill: 'toself', mode: 'lines', fillcolor: '#2563eb', line: { color: '#2563eb', width: 1 }, showlegend: false, hoverinfo: 'skip', xaxis: 'x1', yaxis: 'y1' },
      // Roller Support B (Index 2)
      { x: [L - 0.2, L + 0.2, L, L - 0.2], y: [-0.2, -0.2, 0, -0.2], fill: 'toself', mode: 'lines', fillcolor: '#16a34a', line: { color: '#16a34a', width: 1 }, showlegend: false, hoverinfo: 'skip', xaxis: 'x1', yaxis: 'y1' },
      // Roller baseline (Index 3)
      { x: [L - 0.25, L + 0.25], y: [-0.25, -0.25], mode: 'lines', line: { color: '#16a34a', width: 2 }, showlegend: false, hoverinfo: 'skip', xaxis: 'x1', yaxis: 'y1' },

      // Row 2: Shear V (Index 4)
      {
        x: res.x, y: res.V,
        mode: 'lines', line: { color: '#4f46e5', width: 2.5 },
        fill: 'tozeroy', fillcolor: 'rgba(79, 70, 229, 0.15)',
        name: 'Shear V',
        hovertemplate: '<b>Position x</b>: %{x:.2f} m<br><b>Shear V</b>: %{y:.2f} kN<extra></extra>',
        xaxis: 'x2', yaxis: 'y2'
      },
      // Baseline Shear (Index 5)
      { x: [0, L], y: [0, 0], mode: 'lines', line: { color: 'gray', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip', xaxis: 'x2', yaxis: 'y2' },

      // Row 3: Moment M (Index 6)
      {
        x: res.x, y: res.M,
        mode: 'lines', line: { color: '#0891b2', width: 2.5 },
        fill: 'tozeroy', fillcolor: 'rgba(8, 145, 178, 0.15)',
        name: 'Moment M',
        hovertemplate: '<b>Position x</b>: %{x:.2f} m<br><b>Moment M</b>: %{y:.2f} kNm<extra></extra>',
        xaxis: 'x3', yaxis: 'y3'
      },
      // Baseline Moment (Index 7)
      { x: [0, L], y: [0, 0], mode: 'lines', line: { color: 'gray', width: 1, dash: 'dash' }, showlegend: false, hoverinfo: 'skip', xaxis: 'x3', yaxis: 'y3' }
    ];

    const annotations = [];

    // Reaction A arrow
    if (Math.abs(res.RA) > 0.01) {
      const dir = res.RA > 0 ? 1 : -1;
      annotations.push({
        x: 0, y: 0,
        ax: 0, ay: -45 * dir,
        xref: 'x1', yref: 'y1',
        showarrow: true, arrowhead: 2, arrowsize: 1.2, arrowwidth: 2.5, arrowcolor: '#2563eb'
      });
      annotations.push({
        x: 0, y: -0.35 * dir,
        xref: 'x1', yref: 'y1',
        text: `<b>R<sub>A</sub> = ${Math.abs(res.RA).toFixed(1)} kN</b>`,
        showarrow: false, font: { color: '#2563eb', size: 10 }
      });
    }

    // Reaction B arrow
    if (Math.abs(res.RB) > 0.01) {
      const dir = res.RB > 0 ? 1 : -1;
      annotations.push({
        x: L, y: 0,
        ax: 0, ay: -45 * dir,
        xref: 'x1', yref: 'y1',
        showarrow: true, arrowhead: 2, arrowsize: 1.2, arrowwidth: 2.5, arrowcolor: '#16a34a'
      });
      annotations.push({
        x: L, y: -0.35 * dir,
        xref: 'x1', yref: 'y1',
        text: `<b>R<sub>B</sub> = ${Math.abs(res.RB).toFixed(1)} kN</b>`,
        showarrow: false, font: { color: '#16a34a', size: 10 }
      });
    }

    // Point load P arrow
    if (Math.abs(P) > 0.01) {
      if (P > 0) {
        annotations.push({
          x: a, y: 0,
          ax: 0, ay: 55,
          xref: 'x1', yref: 'y1',
          showarrow: true, arrowhead: 2, arrowsize: 1.4, arrowwidth: 3.5, arrowcolor: '#dc2626'
        });
        annotations.push({
          x: a, y: 0.65,
          xref: 'x1', yref: 'y1',
          text: `<b>P = ${Math.abs(P).toFixed(1)} kN</b> (Down)`,
          showarrow: false, font: { color: '#dc2626', size: 10 }
        });
      } else {
        annotations.push({
          x: a, y: 0,
          ax: 0, ay: -55,
          xref: 'x1', yref: 'y1',
          showarrow: true, arrowhead: 2, arrowsize: 1.4, arrowwidth: 3.5, arrowcolor: '#06b6d4'
        });
        annotations.push({
          x: a, y: -0.65,
          xref: 'x1', yref: 'y1',
          text: `<b>P = ${Math.abs(P).toFixed(1)} kN</b> (Up)`,
          showarrow: false, font: { color: '#06b6d4', size: 10 }
        });
      }
    }

    const layout = {
      height: 480,
      margin: { l: 60, r: 20, t: 10, b: 20 },
      hovermode: 'x unified',
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      showlegend: false,
      yaxis: { domain: [0.70, 1.0], fixedrange: true, showgrid: false, showticklabels: false },
      yaxis2: { domain: [0.35, 0.64], title: 'Shear V (kN)', showgrid: true, gridcolor: 'rgba(220, 220, 220, 0.6)', linecolor: 'black', autorange: !lockScale, range: lockScale ? [-55, 55] : undefined },
      yaxis3: { domain: [0.0, 0.29], title: 'Moment M (kNm)', showgrid: true, gridcolor: 'rgba(220, 220, 220, 0.6)', linecolor: 'black', autorange: !lockScale, range: lockScale ? [-135, 135] : undefined },
      xaxis: { anchor: 'y1', range: [-0.5, L + 0.5], fixedrange: true, showgrid: false, showticklabels: false },
      xaxis2: { anchor: 'y2', range: [-0.5, L + 0.5], fixedrange: true, showgrid: true, gridcolor: 'rgba(220, 220, 220, 0.6)', linecolor: 'black' },
      xaxis3: { anchor: 'y3', range: [-0.5, L + 0.5], fixedrange: true, showgrid: true, gridcolor: 'rgba(220, 220, 220, 0.6)', linecolor: 'black' },
      annotations
    };

    return { data, layout };
  };

  const { data, layout } = generatePlotData();

  const handleCheckboxToggle = (list, setList, opt) => {
    if (list.includes(opt)) {
      setList(list.filter((item) => item !== opt));
    } else {
      setList([...list, opt]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1.5px solid var(--border-light)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 4 • Lesson 36
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Shear & Bending Moment Diagrams</h1>
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
          <li>Construct shear force ($V$) and bending moment ($M$) diagrams graphically.</li>
          <li>Relate point loads to step discontinuities in shear force diagrams.</li>
          <li>Identify locations and magnitudes of peak bending moments.</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Simulator */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Interactive Beam Simulator</h3>

          {/* Lock Banner */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Beam controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock them.</span>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Point Load Magnitude, P (kN)</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>{P.toFixed(1)} kN</span>
              </div>
              <input type="range" min="-50" max="50" step="1" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Point Load Position, a (m)</span>
                <span style={{ fontWeight: 600, color: '#ef4444' }}>{a.toFixed(1)} m</span>
              </div>
              <input type="range" min="0" max="10" step="0.1" value={a} disabled={isLocked} onChange={(e) => setA(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <input type="checkbox" id="lockScaleCheck" checked={lockScale} onChange={(e) => setLockScale(e.target.checked)} />
            <label htmlFor="lockScaleCheck" style={{ fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>Lock Axes Scale</label>
          </div>

          {/* Plotly Canvas */}
          <div style={{ width: '100%', height: '480px' }}>
            <Plot data={data} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
          </div>
        </div>

        {/* Right Sidecar Column */}
        <div style={{ background: 'rgba(139, 92, 246, 0.04)', border: '2px solid #8b5cf6', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ marginTop: 0, color: '#8b5cf6', fontWeight: 700, fontSize: '1.1rem', marginBottom: '15px' }}>
              {phase === 'instructions' && '📖 Step 1: Instructions'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Question'}
              {phase === 'independent_question' && '📝 Step 3: Independent Practice'}
              {phase === 'experimentation' && '🧪 Step 4: Free Experimentation'}
              {phase === 'poe1_predict' && '🔮 POE Challenge 1: Predict'}
              {phase === 'poe1_observe' && '👀 POE Challenge 1: Observe & Correct'}
              {phase === 'poe1_explain' && '💡 POE Challenge 1: Explain'}
              {phase === 'poe2_predict' && '🔮 POE Challenge 2: Predict'}
              {phase === 'poe2_observe' && '👀 POE Challenge 2: Observe & Correct'}
              {phase === 'poe2_explain' && '💡 POE Challenge 2: Explain'}
            </h4>

            {phase === 'instructions' && (
              <div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '12px' }}>
                  <b>How to use the Widget:</b><br />
                  1. Adjust load magnitude $P$ and position $a$.<br />
                  2. Reaction forces ($R_A, R_B$) update via equilibrium ($\sum M_A = 0, \sum F_y = 0$).<br />
                  3. Observe how maximum bending moment always occurs directly under the point load!
                </p>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>Next Phase ➡️</button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Guided Exploration:</b><br />
                  Set $P = 30.0\text{ kN}$ and $a = 3.0\text{ m}$.
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What is the reaction force $R_A$ at support A?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {['9.0 kN', '21.0 kN', '30.0 kN', '15.0 kN'].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>Check Answer</button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: guidedAnswer === '21.0 kN' ? '#dcfce7' : '#fef2f2', color: guidedAnswer === '21.0 kN' ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer === '21.0 kN' ? 'Correct! R_A = P(L-a)/L = 30(10-3)/10 = 21 kN.' : 'Incorrect. Adjust sliders to match input and inspect left support calculation.'}
                  </div>
                )}
                <hr style={{ margin: '15px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
                <button className="btn-secondary" onClick={() => setPhase('independent_question')}>Next Phase ➡️</button>
              </div>
            )}

            {phase === 'independent_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Test Your Skills:</b><br />
                  Place a point load of <b>P = -40 kN</b> (upward) at <b>a = 5.0 m</b> (mid-span).
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What is the maximum bending moment and where does it occur?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    '100.0 kNm at x = 5.0 m',
                    '-100.0 kNm at x = 5.0 m',
                    '-200.0 kNm at x = 5.0 m',
                    '0.0 kNm along the entire beam'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="ind" value={opt} checked={indAnswer === opt} onChange={() => setIndAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setIndSubmitted(true)} style={{ marginBottom: '10px' }}>Submit Answer</button>

                {indSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: indAnswer === '-100.0 kNm at x = 5.0 m' ? '#dcfce7' : '#fef2f2', color: indAnswer === '-100.0 kNm at x = 5.0 m' ? '#15803d' : '#b91c1c' }}>
                    {indAnswer === '-100.0 kNm at x = 5.0 m' ? 'Excellent! Peak moment M_max = R_A · a = (-20) · 5 = -100 kNm.' : 'Incorrect. Set P=-40 and a=5 and check peak of BMD.'}
                  </div>
                )}
                <hr style={{ margin: '15px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
                <button className="btn-secondary" onClick={() => setPhase('experimentation')}>Next Phase ➡️</button>
              </div>
            )}

            {phase === 'experimentation' && (
              <div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '15px' }}>
                  <b>Experimentation Time!</b><br />
                  Try moving $a$ to boundaries ($0.0$ or $10.0$ m) and flipping sign of $P$. Note that shear jump is always equal to $P$.
                </p>
                <button className="btn-primary" onClick={() => setPhase('poe1_predict')}>Ready for POE Challenge 1? 🚀</button>
              </div>
            )}

            {phase === 'poe1_predict' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>POE 1 Predict (Controls Locked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  If load $P$ is positive (downward) and moves closer to support A ($a \to 0$), select ALL correct statements:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Reaction force RA increases',
                    'Reaction force RB increases',
                    'The maximum bending moment decreases',
                    'The maximum bending moment increases',
                    'The shear force jump at the load remains equal to P'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={poe1Predict.includes(opt)} onChange={() => handleCheckboxToggle(poe1Predict, setPoe1Predict, opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => { setPoe1Final([...poe1Predict]); setPhase('poe1_observe'); }} disabled={poe1Predict.length === 0}>
                  Test Hypothesis 🧪
                </button>
              </div>
            )}

            {phase === 'poe1_observe' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d', marginBottom: '8px' }}>POE 1 Observe & Correct (Controls Unlocked!):</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Reaction force RA increases',
                    'Reaction force RB increases',
                    'The maximum bending moment decreases',
                    'The maximum bending moment increases',
                    'The shear force jump at the load remains equal to P'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={poe1Final.includes(opt)} onChange={() => handleCheckboxToggle(poe1Final, setPoe1Final, opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe1_explain')}>Final Submit 📤</button>
              </div>
            )}

            {phase === 'poe1_explain' && (
              <div>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}><b>Your selections:</b></p>
                <ul style={{ fontSize: '0.78rem', marginBottom: '10px' }}>
                  {poe1Final.map((ans, i) => <li key={i}>{ans}</li>)}
                </ul>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '15px' }}>
                  <b>Explanation:</b><br />
                  • $R_A = P(1-a/L) \implies R_A \to P$ as $a \to 0$ (Correct)<br />
                  • $M_{max} = P a(L-a)/L \to 0$ as $a \to 0$ (Correct)<br />
                  • Shear jump at load remains $P$ (Correct)
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe2_predict')}>Next POE Challenge ➡️</button>
              </div>
            )}

            {phase === 'poe2_predict' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>POE 2 Predict (Controls Locked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  If load $P$ changes from downward (+P) to upward (-P), select ALL correct statements:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'The shear force diagram flips sign (mirror image across horizontal axis)',
                    'The bending moment diagram flips sign',
                    'The support reactions flip sign (now pull down instead of push up)',
                    'The magnitude of maximum bending moment increases',
                    'The shear force diagram stays exactly the same'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={poe2Predict.includes(opt)} onChange={() => handleCheckboxToggle(poe2Predict, setPoe2Predict, opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => { setPoe2Final([...poe2Predict]); setPhase('poe2_observe'); }} disabled={poe2Predict.length === 0}>
                  Test Hypothesis 🧪
                </button>
              </div>
            )}

            {phase === 'poe2_observe' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d', marginBottom: '8px' }}>POE 2 Observe & Correct (Controls Unlocked!):</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'The shear force diagram flips sign (mirror image across horizontal axis)',
                    'The bending moment diagram flips sign',
                    'The support reactions flip sign (now pull down instead of push up)',
                    'The magnitude of maximum bending moment increases',
                    'The shear force diagram stays exactly the same'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={poe2Final.includes(opt)} onChange={() => handleCheckboxToggle(poe2Final, setPoe2Final, opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe2_explain')}>Final Submit 📤</button>
              </div>
            )}

            {phase === 'poe2_explain' && (
              <div>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}><b>Your selections:</b></p>
                <ul style={{ fontSize: '0.78rem', marginBottom: '10px' }}>
                  {poe2Final.map((ans, i) => <li key={i}>{ans}</li>)}
                </ul>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '15px' }}>
                  <b>Explanation:</b><br />
                  Flipping load direction reverses shear signs, flips bending moment sign (hogging), and reverses support reactions to pull downward.
                </div>
                <button className="btn-secondary" onClick={resetSimulator}>Reset Simulator 🔄</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

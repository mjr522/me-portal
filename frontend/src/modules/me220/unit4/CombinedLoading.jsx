import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function CombinedLoading() {
  const [P, setP] = useState(100); // kN
  const [e, setE] = useState(10);  // mm
  const [b, setB] = useState(40);  // mm
  const [h, setH] = useState(80);  // mm

  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poePredictAns, setPoePredictAns] = useState(null);
  const [poeFinalAns, setPoeFinalAns] = useState(null);

  const isLocked = phase === 'poe_predict';

  // Math Calculations
  const A = b * h; // mm2
  const Ix = (b * Math.pow(h, 3)) / 12; // mm4
  const M = P * e * 1000; // N-mm
  const c = h / 2;

  const stressAxial = -(P * 1000) / A; // MPa
  const stressBendingMax = Math.abs(M * c) / Ix; // MPa

  const stressTop = stressAxial - (M * c) / Ix;
  const stressBot = stressAxial + (M * c) / Ix;

  const resetSimulator = () => {
    setP(100);
    setE(10);
    setB(40);
    setH(80);
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoePredictAns(null);
    setPoeFinalAns(null);
  };

  const generatePlotData = () => {
    const traces = [];
    const annotations = [];

    // --- Subplot 1: Eccentric Column (Left) ---
    const colW = 0.2 + 0.4 * (h / 120);
    traces.push({
      x: [1.0 - colW / 2, 1.0 - colW / 2, 1.0 + colW / 2, 1.0 + colW / 2, 1.0 - colW / 2],
      y: [0.5, 3.5, 3.5, 0.5, 0.5],
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(71, 85, 105, 0.08)',
      line: { color: '#475569', width: 2 },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    // Centroid line
    traces.push({
      x: [1.0, 1.0], y: [0.3, 3.7],
      mode: 'lines', line: { color: '#94a3b8', width: 1.5, dash: 'dash' },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    // Eccentric load arrow
    const offset_x = 1.0 + e / 100;
    annotations.push({
      ax: offset_x, ay: 4.1,
      x: offset_x, y: 3.52,
      xref: 'x1', yref: 'y1', axref: 'x1', ayref: 'y1',
      showarrow: true, arrowhead: 2, arrowsize: 0.8, arrowwidth: 3.5, arrowcolor: '#ef4444', text: ''
    });

    annotations.push({
      x: offset_x, y: 4.1, xref: 'x1', yref: 'y1',
      text: `P = ${P} kN`, font: { family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold' },
      showarrow: false, yshift: 10
    });

    if (Math.abs(e) > 1) {
      traces.push({
        x: [1.0, offset_x], y: [3.8, 3.8],
        mode: 'lines+markers', line: { color: '#10b981', width: 1.5 },
        marker: { size: 4 }, xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
      });
      annotations.push({
        x: (1.0 + offset_x) / 2, y: 4.0, xref: 'x1', yref: 'y1',
        text: `e = ${e}mm`, font: { family: 'Outfit', size: 8, color: '#10b981' }, showarrow: false
      });
    }

    // --- Subplot 2: Stress Profile (Right) ---
    const hPlot = 1.6 * (h / 120);
    traces.push({
      x: [-0.4, -0.4, 0.4, 0.4, -0.4],
      y: [-hPlot / 2, hPlot / 2, hPlot / 2, -hPlot / 2, -hPlot / 2],
      mode: 'lines', line: { color: '#cbd5e1', width: 1.5 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    const numArrows = 7;
    const combinedX = [];
    const combinedY = [];

    for (let i = 0; i < numArrows; i++) {
      const yCoord = -hPlot / 2 + (hPlot / (numArrows - 1)) * i;
      const stressFraction = yCoord / (hPlot / 2);
      const sVal = stressAxial - stressBendingMax * stressFraction;
      const arrowLen = sVal / 100;

      combinedX.push(arrowLen);
      combinedY.push(yCoord);

      const color = arrowLen < 0 ? '#ef4444' : '#3b82f6';
      annotations.push({
        ax: 0, ay: yCoord,
        x: arrowLen, y: yCoord,
        xref: 'x2', yref: 'y2', axref: 'x2', ayref: 'y2',
        showarrow: true, arrowhead: 2, arrowsize: 0.5, arrowwidth: 1.5, arrowcolor: color, text: ''
      });
    }

    traces.push({
      x: combinedX, y: combinedY,
      mode: 'lines', line: { color: '#8b5cf6', width: 2.5 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    traces.push({
      x: [0, 0], y: [-hPlot / 2 - 0.2, hPlot / 2 + 0.2],
      mode: 'lines', line: { color: '#94a3b8', width: 1.5 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    annotations.push({
      x: combinedX[combinedX.length - 1] < 0 ? combinedX[combinedX.length - 1] - 0.1 : combinedX[combinedX.length - 1] + 0.1,
      y: hPlot / 2, xref: 'x2', yref: 'y2',
      text: `σ_top = ${stressTop.toFixed(1)} MPa`,
      font: { family: 'Outfit', size: 9, color: stressTop < 0 ? '#ef4444' : '#3b82f6', weight: 'bold' },
      showarrow: false, xanchor: combinedX[combinedX.length - 1] < 0 ? 'right' : 'left'
    });

    annotations.push({
      x: combinedX[0] < 0 ? combinedX[0] - 0.1 : combinedX[0] + 0.1,
      y: -hPlot / 2, xref: 'x2', yref: 'y2',
      text: `σ_bot = ${stressBot.toFixed(1)} MPa`,
      font: { family: 'Outfit', size: 9, color: stressBot < 0 ? '#ef4444' : '#3b82f6', weight: 'bold' },
      showarrow: false, xanchor: combinedX[0] < 0 ? 'right' : 'left'
    });

    if (stressTop * stressBot < 0) {
      const yNA = (hPlot / 2) - stressTop * hPlot / (stressTop - stressBot);
      traces.push({
        x: [-0.4, 0.4], y: [yNA, yNA],
        mode: 'lines', line: { color: '#6366f1', width: 1.5, dash: 'dot' },
        xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
      });
      annotations.push({
        x: 0.5, y: yNA, xref: 'x2', yref: 'y2',
        text: 'NA (σ=0)', font: { family: 'Outfit', size: 8, color: '#6366f1', weight: 'bold' },
        showarrow: false, xanchor: 'left'
      });
    }

    const layout = {
      grid: { rows: 1, columns: 2, pattern: 'independent' },
      xaxis: { domain: [0, 0.45], range: [0.3, 1.7], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      yaxis: { domain: [0, 1], range: [0, 5], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      xaxis2: { domain: [0.55, 1.0], range: [-3.2, 3.2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      yaxis2: { domain: [0, 1], range: [-1.4, 1.4], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      margin: { l: 10, r: 10, t: 15, b: 15 },
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
          Unit 4 • Lesson 34
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Combined Loading: Axial & Bending</h1>
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
          <li>{"Apply the principle of superposition to combined axial and bending loads (\\sigma = \\pm \\frac{P}{A} \\pm \\frac{M y}{I})."}</li>
          <li>Analyze eccentric column loading and calculate induced bending moments ($M = P \cdot e$).</li>
          <li>Determine the critical eccentricity ($e_{crit} = h/6$) for zero tension limits (kern of section).</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Simulator */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Interactive Eccentric Column Simulator</h3>

          {/* Lock Banner */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Canvas */}
          <div style={{ width: '100%', height: '280px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '15px' }}>
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>1. Axial Load (P)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Load, P</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{P} kN</span>
              </div>
              <input type="range" min="10" max="200" step="10" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>2. Eccentricity (e)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Offset, e</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{e} mm</span>
              </div>
              <input type="range" min="-30" max="30" step="1" value={e} disabled={isLocked} onChange={(e) => setE(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>3. Width (b)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Width, b</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{b} mm</span>
              </div>
              <input type="range" min="20" max="80" step="5" value={b} disabled={isLocked} onChange={(e) => setB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>4. Height (h)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Height, h</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{h} mm</span>
              </div>
              <input type="range" min="60" max="120" step="5" value={h} disabled={isLocked} onChange={(e) => setH(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>
          </div>

          {/* Equations Box */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.82rem', marginTop: '15px', color: '#1e293b', borderLeft: '4px solid #8b5cf6', lineHeight: 1.5 }}>
            <div><b>Combined Stress superposition ($\sigma = P/A \pm My/I$):</b></div>
            <div>• Column Area, <b>A</b> = {A} $\text{mm}^2$ | Inertia, <b>$I_x$</b> = <b>{(Ix / 1e4).toFixed(1)} $\times 10^4\text{ mm}^4$</b></div>
            <div>• Uniform Axial Stress: <b>$\sigma_{axial} = -P / A$</b> = <b>{stressAxial.toFixed(2)} MPa (Comp)</b></div>
            <div>• Bending Moment: <b>M = P·e</b> = {P}·{e} = <b>{(M / 1e6).toFixed(2)} kN-m</b></div>
            <div>• Max Bending Stress: <b>$\sigma_{bending} = M \cdot c / I_x$</b> = <b>{stressBendingMax.toFixed(2)} MPa</b></div>
            <div>• Combined Stress top edge: <b>$\sigma_{top}$</b> = {stressAxial.toFixed(1)} - {((M * c) / Ix).toFixed(1)} = <b>{stressTop.toFixed(2)} MPa</b></div>
            <div>• Combined Stress bottom edge: <b>$\sigma_{bot}$</b> = {stressAxial.toFixed(1)} + {((M * c) / Ix).toFixed(1)} = <b>{stressBot.toFixed(2)} MPa</b></div>
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
                  <b>Combined Loading Superposition:</b><br />
                  When members experience axial loads and bending moments simultaneously, normal stresses superimpose:
                </p>
                <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', margin: '10px 0', fontFamily: 'monospace', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                  {"$\\sigma = \\pm \\frac{P}{A} \\pm \\frac{M y}{I}$"}
                </div>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>Start Practice 🔍</button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Guided Scenario:</b><br />
                  $P = 100\text{ kN}$, $e = 10\text{ mm}$, $b = 40\text{ mm}$, $h = 80\text{ mm}$.
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What is $\sigma_{axial}$ and combined stress at top edge ($\sigma_{top}$)?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'σ_axial = -31.25 MPa, σ_top = -54.69 MPa',
                    'σ_axial = -31.25 MPa, σ_top = -7.81 MPa',
                    'σ_axial = -15.63 MPa, σ_top = -39.06 MPa',
                    'σ_axial = -31.25 MPa, σ_top = -23.44 MPa'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>Submit Answer</button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: guidedAnswer && guidedAnswer.includes('-54.69 MPa') ? '#dcfce7' : '#fef2f2', color: guidedAnswer && guidedAnswer.includes('-54.69 MPa') ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer && guidedAnswer.includes('-54.69 MPa')
                      ? 'Correct! σ_axial = -31.25 MPa, σ_bending = 23.44 MPa. σ_top = -31.25 - 23.44 = -54.69 MPa.'
                      : 'Incorrect. Check equations display: σ_axial = -31.25 MPa and σ_top = -54.69 MPa.'}
                  </div>
                )}
                <hr style={{ margin: '15px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
                <button className="btn-secondary" onClick={() => setPhase('poe_predict')}>Go to POE Challenge 🔮</button>
              </div>
            )}

            {phase === 'poe_predict' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>Predict Phase (Sizer Controls Locked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Scenario:</b> $b = 40\text{ mm}$, $h = 80\text{ mm}$, $P = 100\text{ kN}$ compression.<br />
                  <b>Question:</b> At what critical eccentricity $e_{crit}$ does $\sigma_{bot}$ become zero? ($e_{crit} = h/6$).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {['13.3 mm', '10.0 mm', '20.0 mm', '6.7 mm'].map((opt, idx) => (
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
                  <b>Instructions:</b> Set $e = 13.3\text{ mm}$ and verify $\sigma_{bot}$ approaches 0.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {['13.3 mm', '10.0 mm', '20.0 mm', '6.7 mm'].map((opt, idx) => (
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
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: poeFinalAns === '13.3 mm' ? '#dcfce7' : '#fef2f2', color: poeFinalAns === '13.3 mm' ? '#15803d' : '#b91c1c', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {poeFinalAns === '13.3 mm' ? '🎉 Correct! Excellent understanding of combined load limits.' : '⚠️ Incorrect. Look at the details below.'}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <b>Explanation:</b><br />
                  {"Zero stress condition: $1 - \\frac{6 e}{h} = 0 \\implies e_{crit} = \\frac{h}{6} = \\frac{80}{6} \\approx 13.33\\text{ mm}$. Keeping $e \\le h/6$ prevents tensile stresses in brittle materials."}
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

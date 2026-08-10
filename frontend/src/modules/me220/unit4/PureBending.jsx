import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function PureBending() {
  const [M, setM] = useState(10); // kN-m
  const [b, setB] = useState(40); // mm
  const [h, setH] = useState(80); // mm

  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poePredictAns, setPoePredictAns] = useState(null);
  const [poeFinalAns, setPoeFinalAns] = useState(null);

  const isLocked = phase === 'poe_predict';

  // Math Calculations
  const Ix = (b * Math.pow(h, 3)) / 12; // mm4
  const c = h / 2; // mm
  const Mnmm = M * 1e6; // N-mm
  const stressMax = Math.abs(Mnmm * c) / Ix; // MPa
  const yieldLimit = 250; // MPa
  const isYielded = stressMax > yieldLimit;

  const resetSimulator = () => {
    setM(10);
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

    // --- Subplot 1: Curved Beam Profile (Left) ---
    const steps = 40;
    const beamL = 1.6;
    const thick = 0.2 + 0.3 * (h / 120);
    const sagCenter = -0.3 * (M / 20);

    const topX = [], topY = [];
    const botX = [], botY = [];
    const midX = [], midY = [];

    for (let i = 0; i <= steps; i++) {
      const xLocal = (i / steps) * beamL;
      const f = xLocal - beamL / 2;
      const yCurve = sagCenter * (1 - (4 * f * f) / (beamL * beamL));
      const xPlot = 0.2 + xLocal;

      midX.push(xPlot);
      midY.push(1.0 + yCurve);
      topX.push(xPlot);
      topY.push(1.0 + yCurve + thick / 2);
      botX.push(xPlot);
      botY.push(1.0 + yCurve - thick / 2);
    }

    // Beam shading
    traces.push({
      x: topX.concat(botX.slice().reverse()),
      y: topY.concat(botY.slice().reverse()),
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(139, 92, 246, 0.06)',
      line: { color: '#94a3b8', width: 1.5 },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    traces.push({
      x: topX, y: topY,
      mode: 'lines', line: { color: M >= 0 ? '#ef4444' : '#3b82f6', width: 2.5 },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    traces.push({
      x: botX, y: botY,
      mode: 'lines', line: { color: M >= 0 ? '#3b82f6' : '#ef4444', width: 2.5 },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    traces.push({
      x: midX, y: midY,
      mode: 'lines', line: { color: '#6366f1', width: 2, dash: 'dash' },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    annotations.push({
      x: 0.1, y: 1.0, xref: 'x1', yref: 'y1',
      text: M >= 0 ? '↻' : '↺', font: { family: 'Outfit', size: 18, color: '#1e293b' }, showarrow: false
    });
    annotations.push({
      x: 1.9, y: 1.0, xref: 'x1', yref: 'y1',
      text: M >= 0 ? '↺' : '↻', font: { family: 'Outfit', size: 18, color: '#1e293b' }, showarrow: false
    });

    annotations.push({
      x: 1.0, y: 1.0 + sagCenter + (sagCenter >= 0 ? thick / 2 + 0.25 : -thick / 2 - 0.25),
      xref: 'x1', yref: 'y1',
      text: M >= 0 ? 'Compression (Top)<br>Tension (Bottom)' : 'Tension (Top)<br>Compression (Bottom)',
      font: { family: 'Outfit', size: 8, color: '#475569', weight: 'bold' },
      showarrow: false
    });

    // --- Subplot 2: Stress Distribution (Right) ---
    const bPlot = 0.5 + 0.7 * (b / 100);
    const hPlot = 1.0 + 1.2 * (h / 120);

    traces.push({
      x: [-bPlot / 2, -bPlot / 2, bPlot / 2, bPlot / 2, -bPlot / 2],
      y: [-hPlot / 2, hPlot / 2, hPlot / 2, -hPlot / 2, -hPlot / 2],
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(139, 92, 246, 0.05)',
      line: { color: '#475569', width: 2 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    traces.push({
      x: [-bPlot / 2 - 0.3, bPlot / 2 + 0.3], y: [0, 0],
      mode: 'lines', line: { color: '#6366f1', width: 2.0, dash: 'dash' },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    const numArrows = 7;
    for (let i = 0; i < numArrows; i++) {
      const yCoord = -hPlot / 2 + (hPlot / (numArrows - 1)) * i;
      if (Math.abs(yCoord) > 0.05) {
        const stressFraction = yCoord / (hPlot / 2);
        const arrowLen = -1.2 * (M / 20) * stressFraction;
        const color = arrowLen < 0 ? '#ef4444' : '#3b82f6';

        annotations.push({
          ax: 0, ay: yCoord,
          x: arrowLen, y: yCoord,
          xref: 'x2', yref: 'y2', axref: 'x2', ayref: 'y2',
          showarrow: true, arrowhead: 2, arrowsize: 0.5, arrowwidth: 1.5, arrowcolor: color, text: ''
        });
      }
    }

    const topStressX = -1.2 * (M / 20);
    traces.push({
      x: [topStressX, -topStressX], y: [hPlot / 2, -hPlot / 2],
      mode: 'lines', line: { color: '#475569', width: 1.8 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    annotations.push({
      x: topStressX > 0 ? topStressX + 0.1 : topStressX - 0.1, y: hPlot / 2,
      xref: 'x2', yref: 'y2',
      text: `${M >= 0 ? 'Comp' : 'Tens'}: σ_top = ${stressMax.toFixed(1)} MPa`,
      font: { family: 'Outfit', size: 9, color: M >= 0 ? '#ef4444' : '#3b82f6', weight: 'bold' },
      showarrow: false, xanchor: topStressX > 0 ? 'left' : 'right'
    });

    annotations.push({
      x: -topStressX > 0 ? -topStressX + 0.1 : -topStressX - 0.1, y: -hPlot / 2,
      xref: 'x2', yref: 'y2',
      text: `${M >= 0 ? 'Tens' : 'Comp'}: σ_bot = ${stressMax.toFixed(1)} MPa`,
      font: { family: 'Outfit', size: 9, color: M >= 0 ? '#3b82f6' : '#ef4444', weight: 'bold' },
      showarrow: false, xanchor: -topStressX > 0 ? 'left' : 'right'
    });

    annotations.push({
      x: 0, y: -hPlot / 2 - 0.4, xref: 'x2', yref: 'y2',
      text: 'Neutral Axis (σ = 0)', font: { family: 'Outfit', size: 8, color: '#6366f1' }, showarrow: false
    });

    const layout = {
      grid: { rows: 1, columns: 2, pattern: 'independent' },
      xaxis: { domain: [0, 0.45], range: [0, 2.2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      yaxis: { domain: [0, 1], range: [0, 2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      xaxis2: { domain: [0.55, 1.0], range: [-2.2, 2.2], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'y2', scaleratio: 1, fixedrange: true },
      yaxis2: { domain: [0, 1], range: [-2.2, 2.2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
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
          Unit 4 • Lesson 32
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Pure Bending & Flexural Stress</h1>
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
          <li>{"Apply the flexure formula (\\sigma = -\\frac{M y}{I}) to determine normal stress distributions."}</li>
          <li>Identify tension and compression zones across beam cross-sections based on moment signs.</li>
          <li>Evaluate flexural yield thresholds under severe bending loads.</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Simulator */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Interactive Flexural Stress Solver</h3>

          {/* Lock Banner */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Canvas */}
          <div style={{ width: '100%', height: '290px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '15px' }}>
            {/* Moment M */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>1. Bending Moment</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                <span>Moment, M</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{M >= 0 ? `+${M}` : M} kN-m</span>
              </div>
              <input type="range" min="-20" max="20" step="2" value={M} disabled={isLocked} onChange={(e) => setM(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            {/* Width b */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>2. Beam Width (b)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                <span>Width, b</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{b} mm</span>
              </div>
              <input type="range" min="20" max="100" step="5" value={b} disabled={isLocked} onChange={(e) => setB(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            {/* Height h */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>3. Beam Height (h)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                <span>Height, h</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{h} mm</span>
              </div>
              <input type="range" min="40" max="120" step="5" value={h} disabled={isLocked} onChange={(e) => setH(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>
          </div>

          {/* Yield Warning */}
          {isYielded && (
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fee2e2', color: '#b91c1c', borderRadius: '8px', padding: '10px', marginTop: '12px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              <span><b>FLEXURAL YIELDING EXCEEDED!</b> Extreme fiber stress has passed the material's yield strength ($\sigma_{max} &gt; 250\text{ MPa}$).</span>
            </div>
          )}

          {/* Equations Box */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.82rem', marginTop: '15px', color: '#1e293b', borderLeft: '4px solid #8b5cf6', lineHeight: 1.5 }}>
            <div><b>Flexure Formula Calculations ($\sigma = -My / I$):</b></div>
            <div>• Moment of Inertia, <b>$I_x = b h^3 / 12$</b> = <b>{(Ix / 1e4).toFixed(2)} $\times 10^4\text{ mm}^4$</b></div>
            <div>• Dist. from Neutral Axis, <b>$y_{max} = \pm h/2$</b> = <b>$\pm${c.toFixed(1)} mm</b></div>
            <div>• Max Flexural Stress: <b>$\sigma_{max} = M \cdot c / I_x$</b> = ({Math.abs(M)} kN-m · $10^6$ · {c} mm) / {Ix.toFixed(0)} $\text{mm}^4$ = <b>{stressMax.toFixed(2)} MPa</b></div>
            <div>• Top Fiber: <b>{M >= 0 ? 'Compression' : 'Tension'}</b> | Bottom Fiber: <b>{M >= 0 ? 'Tension' : 'Compression'}</b></div>
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
                  <b>Flexure Formula ($\sigma = -M y / I$):</b><br />
                  When a beam experiences bending moments, internal normal stresses are generated across the cross section:
                </p>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '20px', marginBottom: '15px' }}>
                  <li><b>Neutral Axis ($y = 0$):</b> Zero stress.</li>
                  <li><b>Tension ($\sigma &gt; 0$):</b> Fibers stretch.</li>
                  <li><b>Compression ($\sigma &lt; 0$):</b> Fibers compress.</li>
                </ul>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>Start Practice 🔍</button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Guided Scenario:</b><br />
                  Set $M = +10\text{ kN-m}$, $b = 40\text{ mm}$, $h = 80\text{ mm}$.
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What is $\sigma_{max}$ and the stress state on top and bottom?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'σ_max = 234.38 MPa; Top in Comp (-234.4 MPa), Bottom in Tens (+234.4 MPa)',
                    'σ_max = 117.19 MPa; Top in Comp (-117.2 MPa), Bottom in Tens (+117.2 MPa)',
                    'σ_max = 234.38 MPa; Top in Tens (+234.4 MPa), Bottom in Comp (-234.4 MPa)',
                    'σ_max = 58.59 MPa; Top in Comp (-58.6 MPa), Bottom in Tens (+58.6 MPa)'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>Submit Answer</button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: guidedAnswer && guidedAnswer.includes('234.38 MPa') && guidedAnswer.includes('Top in Comp') ? '#dcfce7' : '#fef2f2', color: guidedAnswer && guidedAnswer.includes('234.38 MPa') && guidedAnswer.includes('Top in Comp') ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer && guidedAnswer.includes('234.38 MPa') && guidedAnswer.includes('Top in Comp')
                      ? 'Correct! σ_max = 234.38 MPa. Since M > 0, Top is in Compression and Bottom is in Tension.'
                      : 'Incorrect. Recalculate: I_x = 1.71 × 10^6 mm⁴, σ_max = M·c/I_x = 234.4 MPa.'}
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
                  <b>Scenario:</b> $b = 40\text{ mm}$, $h = 80\text{ mm}$.<br />
                  <b>Question:</b> If you change $M$ from <b>+10 kN-m</b> to <b>-10 kN-m</b>, what happens to extreme fiber stresses?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Top changes to Tension (+234.4 MPa), Bottom changes to Compression (-234.4 MPa)',
                    'Top remains in Compression (-234.4 MPa), Bottom remains in Tension (+234.4 MPa)',
                    'Both top and bottom fibers become Tension (+234.4 MPa)',
                    'Bending stress drops to zero everywhere because the moment is negative'
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
                  <b>Instructions:</b> Slide Bending Moment $M$ to <code>-10 kN-m</code> and observe stress signs.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Top changes to Tension (+234.4 MPa), Bottom changes to Compression (-234.4 MPa)',
                    'Top remains in Compression (-234.4 MPa), Bottom remains in Tension (+234.4 MPa)',
                    'Both top and bottom fibers become Tension (+234.4 MPa)',
                    'Bending stress drops to zero everywhere because the moment is negative'
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
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: poeFinalAns && poeFinalAns.includes('Top changes to Tension') ? '#dcfce7' : '#fef2f2', color: poeFinalAns && poeFinalAns.includes('Top changes to Tension') ? '#15803d' : '#b91c1c', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {poeFinalAns && poeFinalAns.includes('Top changes to Tension') ? '🎉 Correct! Outstanding sign convention understanding.' : '⚠️ Incorrect. Look at the physics details below.'}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <b>Explanation:</b><br />
                  Reversing moment sign directly swaps tension and compression: -M curves downwards, stretching top fibers (Tension +234.4 MPa) and compressing bottom fibers (Compression -234.4 MPa).
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

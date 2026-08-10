import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function AngleOfTwist() {
  const [mat, setMat] = useState('steel'); // 'steel' | 'alum' | 'tita'
  const [T, setT] = useState(500); // N-m
  const [L, setL] = useState(2.0); // m
  const [D, setD] = useState(40); // mm
  const [zoom, setZoom] = useState(50);

  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poePredictAns, setPoePredictAns] = useState(null);
  const [poeFinalAns, setPoeFinalAns] = useState(null);

  const isLocked = phase === 'poe_predict';

  const materials = {
    steel: { G: 80000, name: 'Structural Steel' },
    alum: { G: 26000, name: 'Aluminum Alloy' },
    tita: { G: 44000, name: 'Titanium Alloy' }
  };

  const selectedMat = materials[mat];

  // Math
  const J = (Math.PI * Math.pow(D, 4)) / 32; // mm4
  const Tnmm = T * 1000;
  const Lmm = L * 1000;
  const phi = (Tnmm * Lmm) / (J * selectedMat.G); // radians
  const theta = (phi * 180) / Math.PI; // degrees

  const resetSimulator = () => {
    setMat('steel');
    setT(500);
    setL(2.0);
    setD(40);
    setZoom(50);
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoePredictAns(null);
    setPoeFinalAns(null);
  };

  const generatePlotData = () => {
    const traces = [];
    const annotations = [];

    const Lplot = 0.5 + 1.8 * (L / 3.0);
    const Rplot = 0.25 + 0.3 * (D / 80);
    const endX = 0.2 + Lplot;

    // --- Subplot 1: Helical Twist Cylinder (Left) ---
    // Wall
    traces.push({
      x: [0.1, 0.2, 0.2, 0.1],
      y: [1.3, 1.3, -1.3, -1.3],
      mode: 'lines',
      fill: 'toself',
      fillcolor: '#64748b',
      line: { color: '#475569', width: 2.5 },
      xaxis: 'x1', yaxis: 'y1',
      showlegend: false,
      hoverinfo: 'skip'
    });

    // Outer boundaries
    traces.push({
      x: [0.2, endX], y: [Rplot, Rplot],
      mode: 'lines', line: { color: '#94a3b8', width: 2 },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });
    traces.push({
      x: [0.2, endX], y: [-Rplot, -Rplot],
      mode: 'lines', line: { color: '#94a3b8', width: 2 },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    // Helical lines
    const startAngles = [0, 120, 240];
    const twistVisualRad = phi * zoom;

    startAngles.forEach((alpha0) => {
      const helixX = [];
      const helixY = [];
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const f = i / steps;
        const xVal = 0.2 + f * Lplot;
        const th = (alpha0 * Math.PI) / 180 + f * twistVisualRad;
        const yVal = Rplot * Math.sin(th);
        helixX.push(xVal);
        helixY.push(yVal);
      }
      traces.push({
        x: helixX, y: helixY,
        mode: 'lines',
        line: { color: '#f97316', width: 2.5 },
        xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
      });
    });

    // End face ellipse
    const faceX = [];
    const faceY = [];
    for (let th = 0; th <= 365; th += 10) {
      const thRad = (th * Math.PI) / 180;
      faceX.push(endX + 0.04 * Math.cos(thRad));
      faceY.push(Rplot * Math.sin(thRad));
    }
    traces.push({
      x: faceX, y: faceY,
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(249, 115, 22, 0.05)',
      line: { color: '#475569', width: 1.5 },
      xaxis: 'x1', yaxis: 'y1', showlegend: false, hoverinfo: 'skip'
    });

    annotations.push({
      x: endX + 0.3, y: 0,
      xref: 'x1', yref: 'y1',
      text: 'T', font: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' },
      showarrow: false
    });

    // --- Subplot 2: Rotating End Face (Right) ---
    const endFaceR = 1.0;
    const cx = [], cy = [];
    for (let th = 0; th <= 365; th += 5) {
      const rad = (th * Math.PI) / 180;
      cx.push(endFaceR * Math.cos(rad));
      cy.push(endFaceR * Math.sin(rad));
    }
    traces.push({
      x: cx, y: cy,
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(249, 115, 22, 0.03)',
      line: { color: '#475569', width: 2.5 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    // Original reference line
    traces.push({
      x: [0, 0], y: [0, endFaceR],
      mode: 'lines', line: { color: '#94a3b8', width: 1.5, dash: 'dash' },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    // Twisted line
    const finalAngleRad = ((90 + theta) * Math.PI) / 180;
    const tx = endFaceR * Math.cos(finalAngleRad);
    const ty = endFaceR * Math.sin(finalAngleRad);

    traces.push({
      x: [0, tx], y: [0, ty],
      mode: 'lines+markers', line: { color: '#f97316', width: 3.5 },
      marker: { size: 6, color: '#f97316' },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    // Arc theta
    const arcThetaX = [];
    const arcThetaY = [];
    const startAng = 90;
    const endAng = 90 + theta;
    for (let a = startAng; a <= endAng; a += Math.max(0.1, theta / 10)) {
      const aRad = (a * Math.PI) / 180;
      arcThetaX.push(0.4 * Math.cos(aRad));
      arcThetaY.push(0.4 * Math.sin(aRad));
    }
    traces.push({
      x: arcThetaX, y: arcThetaY,
      mode: 'lines', line: { color: '#ef4444', width: 2 },
      xaxis: 'x2', yaxis: 'y2', showlegend: false, hoverinfo: 'skip'
    });

    annotations.push({
      x: 0.5 * Math.cos(((90 + theta / 2) * Math.PI) / 180),
      y: 0.5 * Math.sin(((90 + theta / 2) * Math.PI) / 180),
      xref: 'x2', yref: 'y2',
      text: `θ = ${theta.toFixed(2)}°`,
      font: { family: 'Outfit', size: 10, color: '#ef4444', weight: 'bold' },
      showarrow: false
    });

    annotations.push({
      x: 0, y: -endFaceR - 0.3,
      xref: 'x2', yref: 'y2',
      text: 'Free End Face View',
      font: { family: 'Outfit', size: 9, color: '#64748b', weight: 'bold' },
      showarrow: false
    });

    const layout = {
      grid: { rows: 1, columns: 2, pattern: 'independent' },
      xaxis: { domain: [0, 0.48], range: [-0.2, 3.2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      yaxis: { domain: [0, 1], range: [-1.4, 1.4], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      xaxis2: { domain: [0.55, 1.0], range: [-1.5, 1.5], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'y2', scaleratio: 1, fixedrange: true },
      yaxis2: { domain: [0, 1], range: [-1.5, 1.5], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      margin: { l: 10, r: 10, t: 15, b: 15 },
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
        <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 3 • Lesson 27
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Angle of Twist in Torsion</h1>
      </div>

      {/* Objectives */}
      <div className="objectives-card" style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Target style={{ color: '#f97316' }} size={22} />
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learning Objectives
          </span>
        </div>
        <ul>
          <li>Calculate the angle of twist ($\phi$ in radians, $\theta$ in degrees) for circular shafts.</li>
          <li>Analyze how material stiffness ($G$) affects torsional deformation.</li>
          <li>Understand the inverse 4th-power relationship between shaft diameter ($D$) and angle of twist.</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Simulator */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Interactive Torsional Deformation Simulator</h3>

          {/* Lock Banner */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Material Presets */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            {[
              { id: 'steel', label: 'Steel (G = 80 GPa)' },
              { id: 'alum', label: 'Aluminum (G = 26 GPa)' },
              { id: 'tita', label: 'Titanium (G = 44 GPa)' }
            ].map((item) => (
              <button
                key={item.id}
                style={{
                  flex: 1, padding: '8px 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem', fontWeight: 500, backgroundColor: mat === item.id ? '#f97316' : 'white', color: mat === item.id ? 'white' : '#475569'
                }}
                disabled={isLocked}
                onClick={() => setMat(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Plotly Canvas */}
          <div style={{ width: '100%', height: '280px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '15px' }}>
            {/* Torque */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>1. Torque (T)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Torque</span>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{T} N-m</span>
              </div>
              <input type="range" min="100" max="2000" step="100" value={T} disabled={isLocked} onChange={(e) => setT(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f97316' }} />
            </div>

            {/* Length */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>2. Length (L)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Length</span>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{L.toFixed(1)} m</span>
              </div>
              <input type="range" min="0.5" max="3.0" step="0.5" value={L} disabled={isLocked} onChange={(e) => setL(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f97316' }} />
            </div>

            {/* Diameter */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>3. Dia. (D)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Diameter</span>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{D} mm</span>
              </div>
              <input type="range" min="20" max="80" step="4" value={D} disabled={isLocked} onChange={(e) => setD(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f97316' }} />
            </div>

            {/* Zoom */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>4. Twist Zoom</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Zoom</span>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{zoom}x</span>
              </div>
              <input type="range" min="10" max="200" step="10" value={zoom} disabled={isLocked} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f97316' }} />
            </div>
          </div>

          {/* Equation Box */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.82rem', marginTop: '15px', color: '#1e293b', borderLeft: '4px solid #f97316', lineHeight: 1.5 }}>
            <div><b>Torsional Deformation (Angle of Twist):</b></div>
            <div>• Polar Inertia, <b>J = $\pi D^4 / 32$</b> = <b>{J.toExponential(4)} $\text{mm}^4$</b></div>
            <div>• Shear Modulus, <b>G</b> = <b>{selectedMat.G} MPa</b> ({selectedMat.name})</div>
            <div>• Twist (radians): <b>$\phi = \frac{T \cdot L}{J \cdot G}$</b> = ({Tnmm} · {Lmm}) / (J · {selectedMat.G}) = <b>{phi.toFixed(5)} rad</b></div>
            <div>• Twist (degrees): <b>$\theta = \phi \cdot (180/\pi)$</b> = <b>{theta.toFixed(3)}°</b></div>
          </div>
        </div>

        {/* Right Sidecar Column */}
        <div style={{ background: 'rgba(249, 115, 22, 0.04)', border: '2px solid #f97316', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ marginTop: 0, color: '#f97316', fontWeight: 700, fontSize: '1.1rem', marginBottom: '15px' }}>
              {phase === 'instructions' && '📖 Step 1: Instructions'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Practice'}
              {phase === 'poe_predict' && '🔮 POE Challenge: Predict'}
              {phase === 'poe_observe' && '👀 POE Challenge: Observe & Correct'}
              {phase === 'poe_explain' && '💡 POE Challenge: Explain'}
            </h4>

            {phase === 'instructions' && (
              <div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '12px' }}>
                  <b>Angle of Twist ($\phi$ / $\theta$):</b><br />
                  When torque is applied to a circular shaft, the shaft deforms by twisting. The angle of twist ($\phi$ in radians) measures this angular deflection:
                </p>
                <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', margin: '10px 0', fontFamily: 'monospace', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                  $\phi = \frac{T \cdot L}{J \cdot G}$
                </div>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>Start Practice 🔍</button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Guided Scenario:</b><br />
                  1. Select <b>Steel</b> ($G = 80\text{ GPa}$).<br />
                  2. Set <b>Torque (T)</b> to <code>800 N-m</code>, <b>Length (L)</b> to <code>2.0 m</code>, and <b>Diameter (D)</b> to <code>40 mm</code>.
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What is $J$ and the angle of twist ($\theta$ in degrees)?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'J = 2.51 * 10^5 mm⁴, θ = 0.456°',
                    'J = 2.51 * 10^5 mm⁴, θ = 0.912°',
                    'J = 1.26 * 10^5 mm⁴, θ = 0.456°',
                    'J = 2.51 * 10^5 mm⁴, θ = 1.824°'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>Submit Answer</button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: guidedAnswer && guidedAnswer.includes('2.51 * 10^5') && guidedAnswer.includes('0.456') ? '#dcfce7' : '#fef2f2', color: guidedAnswer && guidedAnswer.includes('2.51 * 10^5') && guidedAnswer.includes('0.456') ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer && guidedAnswer.includes('2.51 * 10^5') && guidedAnswer.includes('0.456')
                      ? 'Correct! J ≈ 2.51 × 10^5 mm⁴ and θ ≈ 0.456°.'
                      : 'Incorrect. Check the values in the equations box: J ≈ 2.51 × 10^5 mm⁴ and θ ≈ 0.456°.'}
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
                  <b>Scenario:</b> $T = 500\text{ N-m}$, $L = 1.5\text{ m}$, Steel.<br />
                  <b>Question:</b> If we double the diameter of the shaft from <b>D = 20 mm</b> to <b>D = 40 mm</b>, how does the resulting angle of twist ($\theta$) change?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'θ decreases by a factor of 16 (divided by 16)',
                    'θ decreases by half (divided by 2)',
                    'θ decreases by a factor of 4 (divided by 4)',
                    'θ decreases by a factor of 8 (divided by 8)'
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
                  1. Select Steel preset, $T = 500\text{ N-m}$, $L = 1.5\text{ m}$.<br />
                  2. Compare $\theta$ at $D = 20\text{ mm}$ ($\theta \approx 8.52^\circ$) vs $D = 40\text{ mm}$ ($\theta \approx 0.53^\circ$).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'θ decreases by a factor of 16 (divided by 16)',
                    'θ decreases by half (divided by 2)',
                    'θ decreases by a factor of 4 (divided by 4)',
                    'θ decreases by a factor of 8 (divided by 8)'
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
                  <code style={{ fontSize: '0.8rem', color: '#f97316' }}>{poeFinalAns}</code>
                </p>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: poeFinalAns && poeFinalAns.includes('factor of 16') ? '#dcfce7' : '#fef2f2', color: poeFinalAns && poeFinalAns.includes('factor of 16') ? '#15803d' : '#b91c1c', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {poeFinalAns && poeFinalAns.includes('factor of 16') ? '🎉 Correct! Excellent work.' : '⚠️ Incorrect. Review the mechanics details below.'}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <b>Explanation:</b><br />
                  Polar inertia $J = \frac{\pi D^4}{32}$ scales with $D^4$. Doubling diameter increases $J$ by $2^4 = 16$ times. Since $\phi = \frac{TL}{JG}$, increasing $J$ by 16 divides $\theta$ by 16 ($8.52^\circ \to 0.53^\circ$)!
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

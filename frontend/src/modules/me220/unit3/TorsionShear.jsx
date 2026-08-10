import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock, ArrowRight, Lightbulb } from 'lucide-react';

export default function TorsionShear() {
  // State for simulator
  const [shaftType, setShaftType] = useState('solid'); // 'solid' | 'hollow'
  const [T, setT] = useState(500); // N-m
  const [c, setC] = useState(20); // mm
  const [ri, setRi] = useState(0); // mm

  // Sidecar phase
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poePredictAns, setPoePredictAns] = useState(null);
  const [poeFinalAns, setPoeFinalAns] = useState(null);

  const isLocked = phase === 'poe_predict';

  // Math Calculations
  const activeRi = shaftType === 'solid' ? 0 : ri;
  const J = (Math.PI / 2) * (Math.pow(c, 4) - Math.pow(activeRi, 4)); // mm^4
  const Tnmm = T * 1000; // N-mm
  const tauMax = (Tnmm * c) / J; // MPa
  const tauMin = shaftType === 'hollow' ? (Tnmm * activeRi) / J : 0; // MPa
  const yieldLimit = 80; // MPa
  const isYielded = tauMax > yieldLimit;

  // Handle shaft type toggle
  const handleTypeChange = (type) => {
    if (isLocked) return;
    setShaftType(type);
    if (type === 'solid') {
      setRi(0);
    } else {
      if (ri === 0 || ri >= c) {
        setRi(Math.floor(c / 2));
      }
    }
  };

  const handleCRangeChange = (val) => {
    if (isLocked) return;
    setC(val);
    if (shaftType === 'hollow' && ri >= val) {
      setRi(Math.max(1, val - 5));
    }
  };

  const resetSimulator = () => {
    setShaftType('solid');
    setT(500);
    setC(20);
    setRi(0);
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoePredictAns(null);
    setPoeFinalAns(null);
  };

  // Generate Plotly traces & layout
  const generatePlotData = () => {
    const traces = [];
    const annotations = [];

    // --- Subplot 1: Torsional Shaft (Left) ---
    // Fixed wall
    traces.push({
      x: [0.1, 0.2, 0.2, 0.1],
      y: [1.8, 1.8, 0.2, 0.2],
      mode: 'lines',
      fill: 'toself',
      fillcolor: '#64748b',
      line: { color: '#475569', width: 2 },
      xaxis: 'x1', yaxis: 'y1',
      showlegend: false,
      hoverinfo: 'skip'
    });

    // Cylinder outer body
    traces.push({
      x: [0.2, 1.8, 1.8, 0.2, 0.2],
      y: [1.6, 1.6, 0.4, 0.4, 1.6],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(148, 163, 184, 0.08)',
      line: { color: '#94a3b8', width: 2 },
      xaxis: 'x1', yaxis: 'y1',
      showlegend: false,
      hoverinfo: 'skip'
    });

    if (shaftType === 'hollow') {
      traces.push({
        x: [0.2, 1.8],
        y: [1.2, 1.2],
        mode: 'lines',
        line: { color: '#94a3b8', width: 1.5, dash: 'dot' },
        xaxis: 'x1', yaxis: 'y1',
        showlegend: false,
        hoverinfo: 'skip'
      });
      traces.push({
        x: [0.2, 1.8],
        y: [0.8, 0.8],
        mode: 'lines',
        line: { color: '#94a3b8', width: 1.5, dash: 'dot' },
        xaxis: 'x1', yaxis: 'y1',
        showlegend: false,
        hoverinfo: 'skip'
      });
    }

    // Curved Torque Arrow
    const arcX = [];
    const arcY = [];
    for (let th = -60; th <= 240; th += 10) {
      const rRad = (th * Math.PI) / 180;
      arcX.push(1.8 + 0.15 * Math.cos(rRad));
      arcY.push(1.0 + 0.5 * Math.sin(rRad));
    }
    traces.push({
      x: arcX,
      y: arcY,
      mode: 'lines',
      line: { color: '#1e293b', width: 3 },
      xaxis: 'x1', yaxis: 'y1',
      showlegend: false,
      hoverinfo: 'skip'
    });

    annotations.push({
      ax: arcX[arcX.length - 2], ay: arcY[arcY.length - 2],
      x: arcX[arcX.length - 1], y: arcY[arcY.length - 1],
      xref: 'x1', yref: 'y1',
      axref: 'x1', ayref: 'y1',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 0.8,
      arrowwidth: 3,
      arrowcolor: '#1e293b',
      text: ''
    });

    annotations.push({
      x: 1.8, y: 1.7,
      xref: 'x1', yref: 'y1',
      text: `T = ${T} N-m`,
      font: { family: 'Outfit', size: 11, color: '#1e293b', weight: 'bold' },
      showarrow: false
    });

    // --- Subplot 2: Cross Section & Stress Profile (Right) ---
    const outerPlotR = 1.2;
    const innerPlotR = outerPlotR * (activeRi / c);

    // Outer boundary circle
    const cx = [], cy = [];
    for (let th = 0; th <= 365; th += 5) {
      const rad = (th * Math.PI) / 180;
      cx.push(outerPlotR * Math.cos(rad));
      cy.push(outerPlotR * Math.sin(rad));
    }
    traces.push({
      x: cx, y: cy,
      mode: 'lines',
      line: { color: '#475569', width: 2.5 },
      fill: shaftType === 'hollow' ? 'none' : 'toself',
      fillcolor: 'rgba(249, 115, 22, 0.08)',
      xaxis: 'x2', yaxis: 'y2',
      showlegend: false,
      hoverinfo: 'skip'
    });

    if (shaftType === 'hollow') {
      const cix = [], ciy = [];
      for (let th = 0; th <= 365; th += 5) {
        const rad = (th * Math.PI) / 180;
        cix.push(innerPlotR * Math.cos(rad));
        ciy.push(innerPlotR * Math.sin(rad));
      }
      traces.push({
        x: cix, y: ciy,
        mode: 'lines',
        line: { color: '#475569', width: 2 },
        fill: 'toself',
        fillcolor: 'rgba(255, 255, 255, 1.0)',
        xaxis: 'x2', yaxis: 'y2',
        showlegend: false,
        hoverinfo: 'skip'
      });
    }

    // Stress arrows
    const stressColor = isYielded ? '#ef4444' : '#f97316';
    const numPoints = 5;
    const startVal = shaftType === 'hollow' ? innerPlotR : 0;
    const stepVal = (outerPlotR - startVal) / (numPoints - 1);

    // Right half (tau points UP)
    for (let i = 0; i < numPoints; i++) {
      const rPlot = startVal + stepVal * i;
      const actualRho = (rPlot / outerPlotR) * c;
      const actualStress = (Tnmm * actualRho) / J;
      const arrowLen = 0.8 * (actualStress / tauMax);

      if (rPlot > 0.05) {
        annotations.push({
          ax: rPlot, ay: 0,
          x: rPlot, y: arrowLen,
          xref: 'x2', yref: 'y2',
          axref: 'x2', ayref: 'y2',
          showarrow: true,
          arrowhead: 2,
          arrowsize: 0.5,
          arrowwidth: 1.5,
          arrowcolor: stressColor,
          text: ''
        });
      }
    }

    // Left half (tau points DOWN)
    for (let i = 0; i < numPoints; i++) {
      const rPlot = -(startVal + stepVal * i);
      const actualRho = Math.abs(rPlot / outerPlotR) * c;
      const actualStress = (Tnmm * actualRho) / J;
      const arrowLen = -0.8 * (actualStress / tauMax);

      if (Math.abs(rPlot) > 0.05) {
        annotations.push({
          ax: rPlot, ay: 0,
          x: rPlot, y: arrowLen,
          xref: 'x2', yref: 'y2',
          axref: 'x2', ayref: 'y2',
          showarrow: true,
          arrowhead: 2,
          arrowsize: 0.5,
          arrowwidth: 1.5,
          arrowcolor: stressColor,
          text: ''
        });
      }
    }

    // Envelope lines
    if (shaftType === 'solid') {
      traces.push({
        x: [-outerPlotR, 0, outerPlotR],
        y: [-0.8, 0, 0.8],
        mode: 'lines',
        line: { color: stressColor, width: 2, dash: 'dash' },
        xaxis: 'x2', yaxis: 'y2',
        showlegend: false,
        hoverinfo: 'skip'
      });
    } else {
      traces.push({
        x: [-outerPlotR, -innerPlotR],
        y: [-0.8, -0.8 * (activeRi / c)],
        mode: 'lines',
        line: { color: stressColor, width: 2, dash: 'dash' },
        xaxis: 'x2', yaxis: 'y2',
        showlegend: false,
        hoverinfo: 'skip'
      });
      traces.push({
        x: [innerPlotR, outerPlotR],
        y: [0.8 * (activeRi / c), 0.8],
        mode: 'lines',
        line: { color: stressColor, width: 2, dash: 'dash' },
        xaxis: 'x2', yaxis: 'y2',
        showlegend: false,
        hoverinfo: 'skip'
      });
    }

    // Stress Labels
    annotations.push({
      x: outerPlotR + 0.2, y: 0.8,
      xref: 'x2', yref: 'y2',
      text: `τ_max = ${tauMax.toFixed(1)} MPa`,
      font: { family: 'Outfit', size: 10, color: stressColor, weight: 'bold' },
      showarrow: false,
      xanchor: 'left'
    });

    if (shaftType === 'hollow') {
      annotations.push({
        x: innerPlotR + 0.1, y: 0.8 * (activeRi / c) - 0.2,
        xref: 'x2', yref: 'y2',
        text: `τ_min = ${tauMin.toFixed(1)} MPa`,
        font: { family: 'Outfit', size: 9, color: stressColor },
        showarrow: false,
        xanchor: 'left'
      });
    }

    const layout = {
      grid: { rows: 1, columns: 2, pattern: 'independent' },
      xaxis: { domain: [0, 0.45], range: [0, 2.2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      yaxis: { domain: [0, 1], range: [0, 2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      xaxis2: { domain: [0.55, 1.0], range: [-2.2, 2.2], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'y2', scaleratio: 1, fixedrange: true },
      yaxis2: { domain: [0, 1], range: [-2.2, 2.2], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
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
          Unit 3 • Lesson 26
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Shear Stress due to Torsion</h1>
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
          <li>Calculate torsional shear stress in solid and hollow circular shafts.</li>
          <li>Determine the polar moment of inertia ($J$) for circular cross-sections.</li>
          <li>Analyze shear stress distributions across radial distances ($\rho$).</li>
          <li>Compare structural mass efficiency of hollow vs. solid torsional shafts.</li>
        </ul>
      </div>

      {/* Main Grid: Left Simulator (7), Right Sidecar (3) */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Interactive Component */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Interactive Torsional Stress Profile Solver</h3>

          {/* Lock Warning */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Shaft Type Toggle */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button
              className={`btn-choice ${shaftType === 'solid' ? 'active' : ''}`}
              style={{
                flex: 1, padding: '8px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer',
                fontWeight: 500, backgroundColor: shaftType === 'solid' ? '#f97316' : 'white', color: shaftType === 'solid' ? 'white' : '#475569'
              }}
              disabled={isLocked}
              onClick={() => handleTypeChange('solid')}
            >
              Solid Circular Shaft
            </button>
            <button
              className={`btn-choice ${shaftType === 'hollow' ? 'active' : ''}`}
              style={{
                flex: 1, padding: '8px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer',
                fontWeight: 500, backgroundColor: shaftType === 'hollow' ? '#f97316' : 'white', color: shaftType === 'hollow' ? 'white' : '#475569'
              }}
              disabled={isLocked}
              onClick={() => handleTypeChange('hollow')}
            >
              Hollow Circular Shaft
            </button>
          </div>

          {/* Plotly Canvas */}
          <div style={{ width: '100%', height: '300px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '15px' }}>
            {/* Torque T */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                1. Applied Torque (T)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Torque, T</span>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{T} N-m</span>
              </div>
              <input
                type="range" min="100" max="2000" step="100" value={T} disabled={isLocked}
                onChange={(e) => setT(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316', cursor: isLocked ? 'not-allowed' : 'pointer' }}
              />
            </div>

            {/* Outer Radius c */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                2. Outer Radius (c)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Radius, c</span>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{c} mm</span>
              </div>
              <input
                type="range" min="15" max="40" step="1" value={c} disabled={isLocked}
                onChange={(e) => handleCRangeChange(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316', cursor: isLocked ? 'not-allowed' : 'pointer' }}
              />
            </div>

            {/* Inner Radius ri */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px', opacity: shaftType === 'hollow' ? 1 : 0.5 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                3. Inner Radius ($r_i$)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Radius, $r_i$</span>
                <span style={{ fontWeight: 600, color: '#f97316' }}>{activeRi} mm</span>
              </div>
              <input
                type="range" min="0" max={Math.max(1, c - 3)} step="1" value={activeRi} disabled={isLocked || shaftType === 'solid'}
                onChange={(e) => setRi(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316', cursor: (isLocked || shaftType === 'solid') ? 'not-allowed' : 'pointer' }}
              />
            </div>
          </div>

          {/* Yield Warning */}
          {isYielded && (
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fee2e2', color: '#b91c1c', borderRadius: '8px', padding: '10px', marginTop: '12px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              <span><b>SHEAR YIELD EXCEEDED!</b> Maximum shear stress exceeds the material's yield strength ($\tau_{max} &gt; 80\text{ MPa}$).</span>
            </div>
          )}

          {/* Equations Output Box */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '15px', color: '#1e293b', borderLeft: '4px solid #f97316', lineHeight: 1.5 }}>
            <div><b>Torsional Stress Equations:</b></div>
            <div>• Outer Radius, c = {c} mm | Inner Radius, $r_i$ = {activeRi} mm</div>
            <div>• Polar Moment, <b>{"J = $\\frac{\\pi}{2}(c^4 - r_i^4)$"}</b> = <b>{J.toExponential(4)} $\text{mm}^4$</b></div>
            <div>• Max Shear Stress: <b>{"$\\tau_{max} = \\frac{T \\cdot c}{J}$"}</b> = ({T} N-m · 1000 · {c} mm) / J = <b>{tauMax.toFixed(2)} MPa</b></div>
            {shaftType === 'hollow' && (
              <div>• Min Shear Stress: <b>{"$\\tau_{min} = \\frac{T \\cdot r_i}{J}$"}</b> = <b>{tauMin.toFixed(2)} MPa</b></div>
            )}
            <div>• Status: <b style={{ color: isYielded ? '#b91c1c' : '#15803d' }}>{isYielded ? 'YIELDED (τ_max > 80 MPa)' : 'SAFE (τ_max ≤ 80 MPa)'}</b></div>
          </div>
        </div>

        {/* Right Column: Sidecar Interactive Guide */}
        <div style={{ background: 'rgba(249, 115, 22, 0.04)', border: '2px solid #f97316', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ marginTop: 0, color: '#f97316', fontWeight: 700, fontSize: '1.1rem', marginBottom: '15px' }}>
              {phase === 'instructions' && '📖 Step 1: Instructions'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Practice'}
              {phase === 'poe_predict' && '🔮 POE Challenge: Predict'}
              {phase === 'poe_observe' && '👀 POE Challenge: Observe & Correct'}
              {phase === 'poe_explain' && '💡 POE Challenge: Explain'}
            </h4>

            {/* Step 1: Instructions */}
            {phase === 'instructions' && (
              <div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '15px' }}>
                  <b>Torsion</b> refers to the twisting of a straight member when subjected to moments (torques) that tend to produce rotation about its longitudinal axis.
                </p>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                  <b>Shear Stress Distribution:</b><br />
                  Inside a circular shaft, torsional shear stress ($\tau$) is zero at the center and increases linearly to a maximum at the outer boundary ($c$):
                </p>
                <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', margin: '10px 0', fontFamily: 'monospace', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                  {"$\\tau = \\frac{T \\cdot \\rho}{J}$"}
                </div>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>
                  Start Practice 🔍
                </button>
              </div>
            )}

            {/* Step 2: Guided Practice */}
            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.88rem', marginBottom: '10px' }}>
                  <b>Guided Practice:</b><br />
                  1. Select <b>Solid Circular Shaft</b>.<br />
                  2. Set <b>Applied Torque (T)</b> to <code>500 N-m</code>.<br />
                  3. Set <b>Outer Radius (c)</b> to <code>20 mm</code>.
                </p>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>
                  What is the Polar Moment of Inertia ($J$) and the maximum shear stress ($\tau_{max}$)?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'J = 2.51 * 10^5 mm⁴, τ_max = 39.79 MPa',
                    'J = 1.26 * 10^5 mm⁴, τ_max = 79.58 MPa',
                    'J = 5.03 * 10^5 mm⁴, τ_max = 19.89 MPa',
                    'J = 2.51 * 10^5 mm⁴, τ_max = 19.89 MPa'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>
                  Submit Answer
                </button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.85rem', padding: '10px', borderRadius: '8px', backgroundColor: guidedAnswer && guidedAnswer.includes('2.51 * 10^5') && guidedAnswer.includes('39.79') ? '#dcfce7' : '#fef2f2', color: guidedAnswer && guidedAnswer.includes('2.51 * 10^5') && guidedAnswer.includes('39.79') ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer && guidedAnswer.includes('2.51 * 10^5') && guidedAnswer.includes('39.79')
                      ? 'Correct! J = (π/2) c^4 = 2.51 × 10^5 mm⁴. τ_max = T·c / J = (500,000 · 20)/251,327 = 39.79 MPa.'
                      : 'Incorrect. Use the formula: J = π c^4 / 2 ≈ 2.51 × 10^5 mm⁴, and τ_max = T·c / J ≈ 39.79 MPa.'}
                  </div>
                )}
                <hr style={{ margin: '15px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
                <button className="btn-secondary" onClick={() => setPhase('poe_predict')}>
                  Go to POE Challenge 🔮
                </button>
              </div>
            )}

            {/* Step 3: POE Predict */}
            {phase === 'poe_predict' && (
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>
                  Predict Phase (Specimen Controls Locked!):
                </p>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Scenario:</b> Torque $T = 500\text{ N-m}$, outer radius $c = 20\text{ mm}$.<br />
                  <b>Question:</b> If we switch to a <b>Hollow Shaft</b> of same outer radius $c = 20\text{ mm}$, but with inner radius $r_i = 10\text{ mm}$, what happens to the maximum shear stress at the outer boundary?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'It increases from 39.8 MPa to 42.4 MPa',
                    'It decreases from 39.8 MPa to 37.2 MPa',
                    'It remains exactly 39.8 MPa because outer radius is the same',
                    'It increases to 79.6 MPa (doubles)'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="poe_p" value={opt} checked={poePredictAns === opt} onChange={() => { setPoePredictAns(opt); setPoeFinalAns(opt); }} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe_observe')} disabled={!poePredictAns}>
                  Test Hypothesis 🧪
                </button>
              </div>
            )}

            {/* Step 4: POE Observe */}
            {phase === 'poe_observe' && (
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#15803d', marginBottom: '8px' }}>
                  Observe & Correct Phase (Controls Unlocked!):
                </p>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Instructions:</b><br />
                  1. Toggle to <b>Hollow Circular Shaft</b>.<br />
                  2. Set $T = 500\text{ N-m}$, $c = 20\text{ mm}$, $r_i = 10\text{ mm}$.<br />
                  3. Observe the change in $J$ and $\tau_{max}$ in the equations box.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'It increases from 39.8 MPa to 42.4 MPa',
                    'It decreases from 39.8 MPa to 37.2 MPa',
                    'It remains exactly 39.8 MPa because outer radius is the same',
                    'It increases to 79.6 MPa (doubles)'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="poe_o" value={opt} checked={poeFinalAns === opt} onChange={() => setPoeFinalAns(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe_explain')}>
                  Final Submit 📤
                </button>
              </div>
            )}

            {/* Step 5: POE Explain */}
            {phase === 'poe_explain' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Your final selection:</b><br />
                  <code style={{ fontSize: '0.8rem', color: '#f97316' }}>{poeFinalAns}</code>
                </p>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: poeFinalAns && poeFinalAns.includes('increases from 39.8 MPa to 42.4 MPa') ? '#dcfce7' : '#fef2f2', color: poeFinalAns && poeFinalAns.includes('increases from 39.8 MPa to 42.4 MPa') ? '#15803d' : '#b91c1c', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {poeFinalAns && poeFinalAns.includes('increases from 39.8 MPa to 42.4 MPa')
                    ? '🎉 Correct! Excellent engineering intuition.'
                    : '⚠️ Incorrect. Look at the physics details below.'}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <b>Explanation:</b><br />
                  1. <b>Modifying J:</b> Hollowing out the center reduces $J$ from $251.3 \times 10^3\text{ mm}^4$ to $235.6 \times 10^3\text{ mm}^4$.<br />
                  2. <b>Maximum Stress:</b> Since $\tau_{max} = T \cdot c / J$, reducing $J$ increases $\tau_{max}$ from $39.79\text{ MPa}$ to $42.44\text{ MPa}$.<br />
                  <i>Conclusion:</i> Hollowing the core increases stress by only <b>6.7%</b> while removing <b>25% of the material</b>!
                </div>
                <button className="btn-secondary" onClick={resetSimulator} style={{ marginTop: '15px' }}>
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

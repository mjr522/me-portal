import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathInline({ math }) {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathBlock({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function VectorResolution() {
  // Phase state
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState('');
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeAnswer, setPoeAnswer] = useState('');

  // Sandbox State
  const [F, setF] = useState(50);
  const [unit, setUnit] = useState('lb'); // lb or N
  const [quadrant, setQuadrant] = useState(1); // 1, 2, 3, 4
  const [mode, setMode] = useState('angle'); // angle or slope
  const [refAxis, setRefAxis] = useState('horizontal'); // horizontal or vertical
  const [theta, setTheta] = useState(30);
  const [slopeType, setSlopeType] = useState('3-4-5-horiz');

  // Auxiliary Mass vs Weight State
  const [auxSystem, setAuxSystem] = useState('US Customary'); // US Customary or SI Metric
  const [auxMassUs, setAuxMassUs] = useState(3.0); // slugs
  const [auxMassSi, setAuxMassSi] = useState(50.0); // kg

  const slidersLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer('');
    setGuidedSubmitted(false);
    setPoeAnswer('');
    setF(50);
    setUnit('lb');
    setQuadrant(1);
    setMode('angle');
    setRefAxis('horizontal');
    setTheta(30);
    setSlopeType('3-4-5-horiz');
  };

  // Calculations
  let Fx = 0;
  let Fy = 0;
  let eqText = '';
  let slopeDesc = '';

  let signX = 1;
  let signY = 1;
  if (quadrant === 2) { signX = -1; signY = 1; }
  else if (quadrant === 3) { signX = -1; signY = -1; }
  else if (quadrant === 4) { signX = 1; signY = -1; }

  if (mode === 'angle') {
    const rad = (theta * Math.PI) / 180;
    const valCos = Math.cos(rad);
    const valSin = Math.sin(rad);

    if (refAxis === 'horizontal') {
      Fx = F * valCos * signX;
      Fy = F * valSin * signY;
      eqText = `Fx = ${signX < 0 ? '-' : ''}${F.toFixed(1)} * cos(${theta.toFixed(0)}°) = ${Fx.toFixed(2)} ${unit}\nFy = ${signY < 0 ? '-' : ''}${F.toFixed(1)} * sin(${theta.toFixed(0)}°) = ${Fy.toFixed(2)} ${unit}`;
    } else {
      Fx = F * valSin * signX;
      Fy = F * valCos * signY;
      eqText = `Fx = ${signX < 0 ? '-' : ''}${F.toFixed(1)} * sin(${theta.toFixed(0)}°) = ${Fx.toFixed(2)} ${unit}\nFy = ${signY < 0 ? '-' : ''}${F.toFixed(1)} * cos(${theta.toFixed(0)}°) = ${Fy.toFixed(2)} ${unit}`;
    }
  } else {
    let h = 4, v = 3, d = 5;
    if (slopeType === '3-4-5-horiz') {
      h = 4; v = 3; d = 5;
      slopeDesc = 'Hypotenuse (d) = 5. Cosine = 4/5, Sine = 3/5.';
    } else if (slopeType === '3-4-5-vert') {
      h = 3; v = 4; d = 5;
      slopeDesc = 'Hypotenuse (d) = 5. Cosine = 3/5, Sine = 4/5.';
    } else if (slopeType === '5-12-13-horiz') {
      h = 12; v = 5; d = 13;
      slopeDesc = 'Hypotenuse (d) = 13. Cosine = 12/13, Sine = 5/13.';
    } else if (slopeType === '5-12-13-vert') {
      h = 5; v = 12; d = 13;
      slopeDesc = 'Hypotenuse (d) = 13. Cosine = 5/13, Sine = 12/13.';
    } else if (slopeType === '8-15-17-horiz') {
      h = 15; v = 8; d = 17;
      slopeDesc = 'Hypotenuse (d) = 17. Cosine = 15/17, Sine = 8/17.';
    }

    Fx = F * (h / d) * signX;
    Fy = F * (v / d) * signY;
    eqText = `Fx = ${signX < 0 ? '-' : ''}${F.toFixed(1)} * (${h}/${d}) = ${Fx.toFixed(2)} ${unit}\nFy = ${signY < 0 ? '-' : ''}${F.toFixed(1)} * (${v}/${d}) = ${Fy.toFixed(2)} ${unit}`;
  }

  // Plotly data
  const theta_circle = Array.from({ length: 100 }, (_, i) => (i * 2 * Math.PI) / 99);
  const circleX = theta_circle.map((t) => F * Math.cos(t));
  const circleY = theta_circle.map((t) => F * Math.sin(t));

  const projLines = {
    x: [Fx, Fx, 0, Fx],
    y: [0, Fy, Fy, Fy],
    mode: 'lines',
    line: { color: '#94a3b8', width: 1.5, dash: 'dash' },
    showlegend: false,
    hoverinfo: 'skip',
  };

  const refCircle = {
    x: circleX,
    y: circleY,
    mode: 'lines',
    line: { color: '#cbd5e1', width: 1.5, dash: 'dot' },
    showlegend: false,
    hoverinfo: 'skip',
  };

  const annotations = [
    {
      ax: 0,
      ay: 0,
      x: Fx,
      y: Fy,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1.2,
      arrowwidth: 4.5,
      arrowcolor: '#ef4444',
      text: '',
    },
  ];

  if (F > 0) {
    annotations.push({
      x: Fx / 2,
      y: Fy / 2,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `F = ${F.toFixed(0)} ${unit}`,
      font: { family: 'Outfit, sans-serif', size: 12, color: '#ef4444', weight: 'bold' },
      yshift: 12,
      xshift: quadrant === 2 || quadrant === 3 ? -20 : 20,
    });
  }

  annotations.push(
    {
      ax: 0,
      ay: 0,
      x: Fx,
      y: 0,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 3,
      arrowcolor: '#3b82f6',
      text: '',
    },
    {
      x: Fx / 2,
      y: 0,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `Fx = ${Fx.toFixed(1)}`,
      font: { family: 'Outfit, sans-serif', size: 11, color: '#3b82f6', weight: 'bold' },
      yshift: quadrant === 3 || quadrant === 4 ? -15 : 15,
    },
    {
      ax: Fx,
      ay: 0,
      x: Fx,
      y: Fy,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 3,
      arrowcolor: '#22c55e',
      text: '',
    },
    {
      x: Fx,
      y: Fy / 2,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `Fy = ${Fy.toFixed(1)}`,
      font: { family: 'Outfit, sans-serif', size: 11, color: '#22c55e', weight: 'bold' },
      xshift: quadrant === 2 || quadrant === 3 ? -30 : 30,
    }
  );

  const layout = {
    xaxis: {
      range: [-110, 110],
      zeroline: true,
      zerolinecolor: '#64748b',
      zerolinewidth: 2,
      gridcolor: '#f1f5f9',
      fixedrange: true,
      title: 'X Axis',
    },
    yaxis: {
      range: [-110, 110],
      zeroline: true,
      zerolinecolor: '#64748b',
      zerolinewidth: 2,
      gridcolor: '#f1f5f9',
      fixedrange: true,
      scaleanchor: 'x',
      scaleratio: 1,
      title: 'Y Axis',
    },
    margin: { l: 40, r: 20, t: 20, b: 40 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true,
  };

  const phaseTitles = {
    instructions: '📖 Step 1: Instructions',
    guided_question: '🔍 Step 2: Guided Practice',
    poe_predict: '🔮 POE Challenge: Predict',
    poe_observe: '👀 POE Challenge: Observe & Correct',
    poe_explain: '💡 POE Challenge: Explain',
  };

  // Mass vs Weight calculation
  const auxWeightUs = auxMassUs * 32.174;
  const auxWeightSi = auxMassSi * 9.807;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px' }}>
      {/* Page Title Header */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 1 • Lesson 2
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Lab Tour; Fund. Skills Review; Units</h1>
      </div>

      {/* Learning Objectives Card */}
      <div className="objectives-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(37, 99, 235, 0.04) 100%)', border: '1px solid rgba(59, 130, 246, 0.18)', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Learning Objectives</span>
        </div>
        <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Resolve a force vector into rectangular components (<MathInline math="F_x, F_y" />).</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Correctly handle horizontal and vertical angle references and slope triangle ratios.</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Understand unit conversions and the physical distinction between mass and weight.</li>
        </ul>
      </div>

      {/* Main Grid: Left Sandbox (7 cols), Right Sidecar (3 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)', gap: '24px' }}>
        {/* LEFT COLUMN: SANDBOX */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>Interactive Vector Sandbox</h3>

          {slidersLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <span>⚠️</span>
              <span><b>Vector controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Canvas */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', padding: '10px', marginBottom: '15px' }}>
            <Plot
              data={[refCircle, projLines]}
              layout={layout}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '350px' }}
              useResizeHandler={true}
            />
          </div>

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '15px' }}>
            {/* 1. Force Magnitude & Unit */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                1. Force Magnitude & Unit
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Magnitude, F</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{F.toFixed(1)} {unit}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={F}
                  disabled={slidersLocked}
                  onChange={(e) => setF(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button
                  disabled={slidersLocked}
                  onClick={() => setUnit('lb')}
                  style={{ flex: 1, padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500, backgroundColor: unit === 'lb' ? '#3b82f6' : '#ffffff', color: unit === 'lb' ? '#ffffff' : '#475569', borderColor: unit === 'lb' ? '#3b82f6' : '#cbd5e1' }}
                >
                  US (lb)
                </button>
                <button
                  disabled={slidersLocked}
                  onClick={() => setUnit('N')}
                  style={{ flex: 1, padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500, backgroundColor: unit === 'N' ? '#3b82f6' : '#ffffff', color: unit === 'N' ? '#ffffff' : '#475569', borderColor: unit === 'N' ? '#3b82f6' : '#cbd5e1' }}
                >
                  SI (N)
                </button>
              </div>
            </div>

            {/* 2. Quadrant Selection */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                2. Quadrant Location
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { q: 1, label: 'Q1 (+, +)' },
                  { q: 2, label: 'Q2 (-, +)' },
                  { q: 3, label: 'Q3 (-, -)' },
                  { q: 4, label: 'Q4 (+, -)' },
                ].map((item) => (
                  <button
                    key={item.q}
                    disabled={slidersLocked}
                    onClick={() => setQuadrant(item.q)}
                    style={{ padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500, backgroundColor: quadrant === item.q ? '#3b82f6' : '#ffffff', color: quadrant === item.q ? '#ffffff' : '#475569', borderColor: quadrant === item.q ? '#3b82f6' : '#cbd5e1' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Orientation Mode */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                3. Orientation Mode
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <button
                  disabled={slidersLocked}
                  onClick={() => setMode('angle')}
                  style={{ flex: 1, padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500, backgroundColor: mode === 'angle' ? '#3b82f6' : '#ffffff', color: mode === 'angle' ? '#ffffff' : '#475569', borderColor: mode === 'angle' ? '#3b82f6' : '#cbd5e1' }}
                >
                  Angle (θ)
                </button>
                <button
                  disabled={slidersLocked}
                  onClick={() => setMode('slope')}
                  style={{ flex: 1, padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500, backgroundColor: mode === 'slope' ? '#3b82f6' : '#ffffff', color: mode === 'slope' ? '#ffffff' : '#475569', borderColor: mode === 'slope' ? '#3b82f6' : '#cbd5e1' }}
                >
                  Slope Triangle
                </button>
              </div>
            </div>

            {/* 4. Orientation Values */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderRadius: '12px', padding: '12px' }}>
              {mode === 'angle' ? (
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    4. Angle Reference
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <button
                      disabled={slidersLocked}
                      onClick={() => setRefAxis('horizontal')}
                      style={{ flex: 1, padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500, backgroundColor: refAxis === 'horizontal' ? '#3b82f6' : '#ffffff', color: refAxis === 'horizontal' ? '#ffffff' : '#475569', borderColor: refAxis === 'horizontal' ? '#3b82f6' : '#cbd5e1' }}
                    >
                      From Horiz
                    </button>
                    <button
                      disabled={slidersLocked}
                      onClick={() => setRefAxis('vertical')}
                      style={{ flex: 1, padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 500, backgroundColor: refAxis === 'vertical' ? '#3b82f6' : '#ffffff', color: refAxis === 'vertical' ? '#ffffff' : '#475569', borderColor: refAxis === 'vertical' ? '#3b82f6' : '#cbd5e1' }}
                    >
                      From Vert
                    </button>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                      <span>Relative Angle, θ</span>
                      <span style={{ fontWeight: 600, color: '#3b82f6' }}>{theta.toFixed(1)}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="1"
                      value={theta}
                      disabled={slidersLocked}
                      onChange={(e) => setTheta(parseFloat(e.target.value))}
                      style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    4. Slope Triangle Ratio
                  </div>
                  <select
                    value={slopeType}
                    disabled={slidersLocked}
                    onChange={(e) => setSlopeType(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', backgroundColor: '#ffffff', outline: 'none' }}
                  >
                    <option value="3-4-5-horiz">3:4:5 (Horiz: 4, Vert: 3)</option>
                    <option value="3-4-5-vert">3:4:5 (Horiz: 3, Vert: 4)</option>
                    <option value="5-12-13-horiz">5:12:13 (Horiz: 12, Vert: 5)</option>
                    <option value="5-12-13-vert">5:12:13 (Horiz: 5, Vert: 12)</option>
                    <option value="8-15-17-horiz">8:15:17 (Horiz: 15, Vert: 8)</option>
                  </select>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
                    {slopeDesc}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Equation Display */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.88rem', color: '#1e293b', borderLeft: '4px solid #3b82f6', whitespace: 'pre-line', marginBottom: '20px' }}>
            {eqText}
          </div>

          {/* Auxiliary Unit Conversion Box (Mass vs Weight) */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', padding: '16px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              ⚖️ Auxiliary: Mass vs. Weight (SI & US Customary)
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
              Understand the physical difference between Mass (inertia) and Force/Weight (gravity). Adjust mass to see weight:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Select Unit System</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setAuxSystem('US Customary')}
                    style={{ flex: 1, padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, backgroundColor: auxSystem === 'US Customary' ? '#2563eb' : '#ffffff', color: auxSystem === 'US Customary' ? '#ffffff' : '#475569' }}
                  >
                    US Customary
                  </button>
                  <button
                    onClick={() => setAuxSystem('SI Metric')}
                    style={{ flex: 1, padding: '6px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, backgroundColor: auxSystem === 'SI Metric' ? '#2563eb' : '#ffffff', color: auxSystem === 'SI Metric' ? '#ffffff' : '#475569' }}
                  >
                    SI Metric
                  </button>
                </div>
              </div>

              <div>
                {auxSystem === 'US Customary' ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                      <span>Mass, m (slugs)</span>
                      <span style={{ fontWeight: 600 }}>{auxMassUs.toFixed(1)} slugs</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="10.0"
                      step="0.5"
                      value={auxMassUs}
                      onChange={(e) => setAuxMassUs(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ marginTop: '8px', background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Weight, W = m × g</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>{auxWeightUs.toFixed(2)} lb</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>({auxMassUs.toFixed(1)} slugs × 32.2 ft/s²)</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                      <span>Mass, m (kg)</span>
                      <span style={{ fontWeight: 600 }}>{auxMassSi.toFixed(1)} kg</span>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="150.0"
                      step="5.0"
                      value={auxMassSi}
                      onChange={(e) => setAuxMassSi(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ marginTop: '8px', background: '#f8fafc', padding: '8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Weight, W = m × g</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>{auxWeightSi.toFixed(2)} N</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>({auxMassSi.toFixed(1)} kg × 9.81 m/s²)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDECAR */}
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.04)', border: '2px solid #3b82f6', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)', height: 'fit-content' }}>
          <h4 style={{ marginTop: 0, color: '#3b82f6', fontWeight: 700, fontSize: '1.1rem', marginBottom: '16px' }}>
            {phaseTitles[phase]}
          </h4>

          {/* Phase 1: Instructions */}
          {phase === 'instructions' && (
            <div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '12px', color: '#334155' }}>
                Welcome to the Vector Resolution Sandbox!
              </p>
              <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
                <b>Instructions:</b>
                <ol style={{ paddingLeft: '18px', marginTop: '6px' }}>
                  <li style={{ marginBottom: '6px' }}>Drag <b>Force Magnitude</b> slider to see the resultant length change.</li>
                  <li style={{ marginBottom: '6px' }}>Toggle between <b>Angle (θ)</b> and <b>Slope Triangle</b> orientation modes.</li>
                  <li style={{ marginBottom: '6px' }}>Select different <b>Quadrants</b> (Q1..Q4) to see sign updates (+ / -).</li>
                  <li style={{ marginBottom: '6px' }}>Switch reference axis between <b>From Horizontal</b> and <b>From Vertical</b> to see cosine and sine swap!</li>
                </ol>
                <p style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', marginTop: '8px' }}>
                  Tip: Blue vector = Fx (horizontal), Green vector = Fy (vertical). They add tip-to-tail to form red vector F.
                </p>
              </div>
              <button
                onClick={() => setPhase('guided_question')}
                style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
              >
                Start Practice 🔍
              </button>
            </div>
          )}

          {/* Phase 2: Guided Question */}
          {phase === 'guided_question' && (
            <div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#334155', marginBottom: '12px' }}>
                <b>Concept Check:</b><br />
                Configure the simulator to:<br />
                • <b>Force Magnitude</b>: <code>60.0 lb</code><br />
                • <b>Quadrant</b>: <code>Q2</code><br />
                • <b>Orientation Mode</b>: <code>Angle</code><br />
                • <b>Reference</b>: <code>From Vertical</code><br />
                • <b>Relative Angle</b>: <code>45.0°</code>
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Which trig function is used for <MathInline math="F_x" />, and what are the resulting components?
              </p>

              {[
                'Fx uses cosine: Fx = -42.43 lb, Fy = 42.43 lb',
                'Fx uses sine: Fx = -42.43 lb, Fy = 42.43 lb',
                'Fx uses sine: Fx = -30.00 lb, Fy = 51.96 lb',
                'Fx uses cosine: Fx = -51.96 lb, Fy = 30.00 lb',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vres_guided_radio"
                    value={opt}
                    checked={guidedAnswer === opt}
                    onChange={(e) => {
                      setGuidedAnswer(e.target.value);
                      setGuidedSubmitted(false);
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {opt}
                </label>
              ))}

              <button
                onClick={() => setGuidedSubmitted(true)}
                style={{ width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '8px', marginBottom: '12px' }}
              >
                Submit Answer
              </button>

              {guidedSubmitted && (
                <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '12px', backgroundColor: guidedAnswer.includes('Fx uses sine: Fx = -42.43') ? '#ecfdf5' : '#fef2f2', border: `1px solid ${guidedAnswer.includes('Fx uses sine: Fx = -42.43') ? '#a7f3d0' : '#fecaca'}`, color: guidedAnswer.includes('Fx uses sine: Fx = -42.43') ? '#065f46' : '#991b1b' }}>
                  {guidedAnswer.includes('Fx uses sine: Fx = -42.43') ? (
                    <span>Correct! Because the angle is measured from the <b>vertical axis</b>, the horizontal component <MathInline math="F_x" /> uses the sine function: <MathInline math="F_x = -F \sin(45^\circ) = -42.43\text{ lb}" />, and vertical component <MathInline math="F_y" /> uses cosine.</span>
                  ) : (
                    <span>Incorrect. Look closely at the equation display: since the angle is relative to the vertical axis, the opposite side is horizontal (<MathInline math="F_x" />), meaning it uses <MathInline math="\sin(45^\circ)" />.</span>
                  )}
                </div>
              )}

              <hr style={{ margin: '16px 0', borderColor: 'rgba(59, 130, 246, 0.2)' }} />
              <button
                onClick={() => {
                  setPhase('poe_predict');
                  setPoeAnswer('');
                }}
                style={{ width: '100%', background: '#3b82f6', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Start POE Challenge 🔮
              </button>
            </div>
          )}

          {/* Phase 3: POE Predict */}
          {phase === 'poe_predict' && (
            <div>
              <p style={{ fontSize: '0.88rem', color: '#b45309', fontWeight: 600, marginBottom: '8px' }}>
                Predict Phase (Vector Controls Locked!):
              </p>
              <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '12px' }}>
                <b>Scenario:</b><br />
                A force of magnitude <MathInline math="F = 50.0\text{ lb}" /> is directed in <b>Quadrant 3</b>. The orientation is defined by a <b>3:4:5 slope triangle</b> (Horizontal = 4, Vertical = 3).
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Without unlocking controls, predict the exact components <MathInline math="F_x" /> and <MathInline math="F_y" />:
              </p>

              {[
                'Fx = -40.0 lb, Fy = -30.0 lb',
                'Fx = -30.0 lb, Fy = -40.0 lb',
                'Fx = +40.0 lb, Fy = +30.0 lb',
                'Fx = -40.0 lb, Fy = +30.0 lb',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vres_poe_p_radio"
                    value={opt}
                    checked={poeAnswer === opt}
                    onChange={(e) => setPoeAnswer(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  {opt}
                </label>
              ))}

              <button
                disabled={!poeAnswer}
                onClick={() => setPhase('poe_observe')}
                style={{ width: '100%', background: poeAnswer ? '#2563eb' : '#94a3b8', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: poeAnswer ? 'pointer' : 'not-allowed', marginTop: '12px' }}
              >
                Test Hypothesis 🧪
              </button>
            </div>
          )}

          {/* Phase 4: POE Observe */}
          {phase === 'poe_observe' && (
            <div>
              <p style={{ fontSize: '0.88rem', color: '#16a34a', fontWeight: 600, marginBottom: '8px' }}>
                Observe & Correct Phase (Controls Unlocked!):
              </p>
              <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '12px' }}>
                <b>Instructions:</b><br />
                1. Set sandbox to <b>Q3</b>.<br />
                2. Toggle mode to <b>Slope Triangle</b>.<br />
                3. Select <b>3:4:5 (Horiz: 4, Vert: 3)</b>.<br />
                4. Set magnitude to <b>50.0 lb</b>.<br />
                5. Check components on graph.
              </p>

              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Finalize your answer:
              </p>

              {[
                'Fx = -40.0 lb, Fy = -30.0 lb',
                'Fx = -30.0 lb, Fy = -40.0 lb',
                'Fx = +40.0 lb, Fy = +30.0 lb',
                'Fx = -40.0 lb, Fy = +30.0 lb',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vres_poe_o_radio"
                    value={opt}
                    checked={poeAnswer === opt}
                    onChange={(e) => setPoeAnswer(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  {opt}
                </label>
              ))}

              <button
                onClick={() => setPhase('poe_explain')}
                style={{ width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginTop: '12px' }}
              >
                Final Submit 📤
              </button>
            </div>
          )}

          {/* Phase 5: POE Explain */}
          {phase === 'poe_explain' && (
            <div>
              <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
                <b>Your final selection:</b><br />
                <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem' }}>{poeAnswer}</code>
              </p>

              {poeAnswer === 'Fx = -40.0 lb, Fy = -30.0 lb' ? (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  🎉 <b>Correct!</b> Great work.
                </div>
              ) : (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  ⚠️ <b>Incorrect.</b> Review the physics explanation below.
                </div>
              )}

              <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: '#1e293b' }}>Explanation:</h5>
                <ol style={{ paddingLeft: '18px', margin: 0 }}>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Signs (Quadrant 3):</b> In Q3, vectors point left and down. Thus both <MathInline math="F_x" /> and <MathInline math="F_y" /> must be negative.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Slope Triangle Proportions:</b> Horizontal=4, Vertical=3, Hypotenuse=5. Cosine with horizontal is 4/5 = 0.8, Sine is 3/5 = 0.6.
                  </li>
                  <li>
                    <b>Components:</b><br />
                    • <MathInline math="F_x = -F \cdot \frac{4}{5} = -50 \cdot 0.8 = -40.0\text{ lb}" /><br />
                    • <MathInline math="F_y = -F \cdot \frac{3}{5} = -50 \cdot 0.6 = -30.0\text{ lb}" />
                  </li>
                </ol>
              </div>

              <button
                onClick={resetSimulator}
                style={{ width: '100%', background: '#64748b', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Reset Simulator 🔄
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

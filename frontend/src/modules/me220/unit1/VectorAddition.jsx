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

const DEFAULT_VECTORS = [
  { id: 'A', name: 'Vector A', f: 80, theta: 30, color: '#3b82f6' },
  { id: 'B', name: 'Vector B', f: 60, theta: 150, color: '#10b981' },
  { id: 'C', name: 'Vector C', f: 50, theta: 60, color: '#8b5cf6' },
  { id: 'D', name: 'Vector D', f: 40, theta: 270, color: '#f59e0b' },
  { id: 'E', name: 'Vector E', f: 30, theta: 315, color: '#ec4899' },
];

export default function VectorAddition() {
  // Phase state
  const [phase, setPhase] = useState('instructions'); // instructions, guided_question, poe_predict, poe_observe, poe_explain
  const [guidedAnswer, setGuidedAnswer] = useState('');
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeAnswer, setPoeAnswer] = useState('');

  // Vector Sandbox State
  const [numVectors, setNumVectors] = useState(2);
  const [vectors, setVectors] = useState(DEFAULT_VECTORS);
  const [showTipToTail, setShowTipToTail] = useState(true);
  const [showComponents, setShowComponents] = useState(false);

  const slidersLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer('');
    setGuidedSubmitted(false);
    setPoeAnswer('');
    setNumVectors(2);
    setVectors(DEFAULT_VECTORS);
    setShowTipToTail(true);
    setShowComponents(false);
  };

  const updateVector = (index, field, value) => {
    if (slidersLocked) return;
    setVectors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: parseFloat(value) || 0 };
      return next;
    });
  };

  const addVector = () => {
    if (slidersLocked || numVectors >= 5) return;
    setNumVectors((prev) => prev + 1);
  };

  const removeVector = () => {
    if (slidersLocked || numVectors <= 2) return;
    setNumVectors((prev) => prev - 1);
  };

  const resetVectorsTo2 = () => {
    if (slidersLocked) return;
    setNumVectors(2);
    setVectors(DEFAULT_VECTORS);
  };

  // Calculations
  const activeVectors = vectors.slice(0, numVectors);
  const vectorComponents = activeVectors.map((v) => {
    const rad = (v.theta * Math.PI) / 180;
    const vx = v.f * Math.cos(rad);
    const vy = v.f * Math.sin(rad);
    return { ...v, vx, vy };
  });

  const Rx = vectorComponents.reduce((sum, v) => sum + v.vx, 0);
  const Ry = vectorComponents.reduce((sum, v) => sum + v.vy, 0);
  const R_mag = Math.sqrt(Rx * Rx + Ry * Ry);

  let thetaR_rad = Math.atan2(Ry, Rx);
  let thetaR_deg = (thetaR_rad * 180) / Math.PI;
  if (thetaR_deg < 0) thetaR_deg += 360;

  let quad = 'Q1';
  if (Rx < 0 && Ry >= 0) quad = 'Q2';
  else if (Rx < 0 && Ry < 0) quad = 'Q3';
  else if (Rx >= 0 && Ry < 0) quad = 'Q4';

  // Build Plotly Traces and Annotations
  const traces = [];
  const annotations = [];

  // Projections if enabled
  if (showComponents) {
    vectorComponents.forEach((vc) => {
      traces.push({
        x: [vc.vx, vc.vx, 0],
        y: [0, vc.vy, vc.vy],
        mode: 'lines+markers',
        line: { color: vc.color, width: 1.5, dash: 'dash' },
        marker: { size: 4, color: vc.color },
        hoverinfo: 'skip',
      });
    });

    traces.push({
      x: [Rx, Rx, 0],
      y: [0, Ry, Ry],
      mode: 'lines+markers',
      line: { color: 'rgba(239, 68, 68, 0.4)', width: 2, dash: 'dot' },
      marker: { size: 4, color: 'rgba(239, 68, 68, 0.4)' },
      hoverinfo: 'skip',
    });
  }

  // Scaling bounds
  let maxCoord = 150;
  const allPoints = [0, Rx, Ry];
  let tempCumulX = 0;
  let tempCumulY = 0;
  vectorComponents.forEach((vc) => {
    allPoints.push(vc.vx, vc.vy);
    tempCumulX += vc.vx;
    tempCumulY += vc.vy;
    allPoints.push(tempCumulX, tempCumulY);
  });
  const maxAbsVal = Math.max(...allPoints.map(Math.abs));
  if (maxAbsVal > 140) {
    maxCoord = Math.ceil((maxAbsVal + 20) / 50) * 50;
  }

  // Tip-to-tail dashed lines
  let cumulX = 0;
  let cumulY = 0;
  if (showTipToTail) {
    vectorComponents.forEach((vc, i) => {
      const nextX = cumulX + vc.vx;
      const nextY = cumulY + vc.vy;
      if (i > 0) {
        traces.push({
          x: [cumulX, nextX],
          y: [cumulY, nextY],
          mode: 'lines',
          line: { color: vc.color, width: 3, dash: 'dash' },
          hoverinfo: 'skip',
        });
      }
      cumulX = nextX;
      cumulY = nextY;
    });
  }

  // Base vectors from origin
  vectorComponents.forEach((vc) => {
    annotations.push({
      ax: 0,
      ay: 0,
      x: vc.vx,
      y: vc.vy,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1.2,
      arrowwidth: 4,
      arrowcolor: vc.color,
      text: '',
    });
    annotations.push({
      x: vc.vx,
      y: vc.vy,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: vc.id,
      font: { family: 'Outfit, sans-serif', size: 14, color: vc.color, weight: 'bold' },
      xshift: vc.vx > 0 ? 12 : -12,
      yshift: vc.vy > 0 ? 12 : -12,
    });
  });

  // Tip-to-tail stacked arrows
  if (showTipToTail) {
    cumulX = 0;
    cumulY = 0;
    vectorComponents.forEach((vc, i) => {
      const nextX = cumulX + vc.vx;
      const nextY = cumulY + vc.vy;
      if (i > 0) {
        annotations.push({
          ax: cumulX,
          ay: cumulY,
          x: nextX,
          y: nextY,
          xref: 'x',
          yref: 'y',
          axref: 'x',
          ayref: 'y',
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1,
          arrowwidth: 3,
          arrowcolor: vc.color,
          text: '',
        });
        annotations.push({
          x: nextX,
          y: nextY,
          xref: 'x',
          yref: 'y',
          showarrow: false,
          text: `${vc.id}'`,
          font: { family: 'Outfit, sans-serif', size: 12, color: vc.color, weight: 'bold' },
          xshift: vc.vx > 0 ? 12 : -12,
          yshift: vc.vy > 0 ? 12 : -12,
        });
      }
      cumulX = nextX;
      cumulY = nextY;
    });
  }

  // Resultant vector R
  annotations.push({
    ax: 0,
    ay: 0,
    x: Rx,
    y: Ry,
    xref: 'x',
    yref: 'y',
    axref: 'x',
    ayref: 'y',
    showarrow: true,
    arrowhead: 3,
    arrowsize: 1.2,
    arrowwidth: 5,
    arrowcolor: '#ef4444',
    text: '',
  });
  annotations.push({
    x: Rx,
    y: Ry,
    xref: 'x',
    yref: 'y',
    showarrow: false,
    text: 'R',
    font: { family: 'Outfit, sans-serif', size: 16, color: '#ef4444', weight: 'bold' },
    xshift: Rx > 0 ? 17 : -17,
    yshift: Ry > 0 ? 17 : -17,
  });

  const layout = {
    xaxis: {
      range: [-maxCoord, maxCoord],
      zeroline: true,
      zerolinecolor: '#64748b',
      zerolinewidth: 2,
      gridcolor: '#f1f5f9',
      fixedrange: true,
      title: 'X Force Component (N)',
    },
    yaxis: {
      range: [-maxCoord, maxCoord],
      zeroline: true,
      zerolinecolor: '#64748b',
      zerolinewidth: 2,
      gridcolor: '#f1f5f9',
      fixedrange: true,
      scaleanchor: 'x',
      scaleratio: 1,
      title: 'Y Force Component (N)',
    },
    margin: { l: 50, r: 20, t: 20, b: 50 },
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px' }}>
      {/* Page Title Header */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 1 • Lesson 3
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Statics of Particles: Adding Forces</h1>
      </div>

      {/* Learning Objectives Card */}
      <div className="objectives-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(37, 99, 235, 0.04) 100%)', border: '1px solid rgba(59, 130, 246, 0.18)', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Learning Objectives</span>
        </div>
        <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Add multiple coplanar forces using rectangular components.</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Apply the tip-to-tail rule to graphically combine vectors.</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Determine the magnitude and angle of the resultant force vector.</li>
        </ul>
      </div>

      {/* Main Grid: Left Sandbox (7 cols), Right Sidecar (3 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)', gap: '24px' }}>
        {/* LEFT COLUMN: SANDBOX */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>Interactive Resultant Vector Sandbox</h3>

          {slidersLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <span>⚠️</span>
              <span><b>Vector controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Chart Container */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', padding: '10px', marginBottom: '15px' }}>
            <Plot
              data={traces}
              layout={layout}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '350px' }}
              useResizeHandler={true}
            />
          </div>

          {/* Vector Control Operations */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', marginBottom: '15px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Forces:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={slidersLocked || numVectors >= 5}
                onClick={addVector}
                style={{ padding: '6px 12px', border: '1.5px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', cursor: slidersLocked || numVectors >= 5 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#475569' }}
              >
                ➕ Add Force
              </button>
              <button
                disabled={slidersLocked || numVectors <= 2}
                onClick={removeVector}
                style={{ padding: '6px 12px', border: '1.5px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', cursor: slidersLocked || numVectors <= 2 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#475569' }}
              >
                ➖ Remove Force
              </button>
              <button
                disabled={slidersLocked}
                onClick={resetVectorsTo2}
                style={{ padding: '6px 12px', border: '1.5px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.82rem', color: '#475569' }}
              >
                🔄 Reset to 2
              </button>
            </div>
          </div>

          {/* Vector Sliders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
            {activeVectors.map((v, idx) => (
              <div key={v.id} style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128, 128, 128, 0.15)', borderLeft: `4px solid ${v.color}`, borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: v.color, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                  {v.name}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: '#475569' }}>
                    <span>Magnitude, F_{v.id}</span>
                    <span style={{ fontWeight: 600, color: v.color }}>{v.f.toFixed(1)} N</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={v.f}
                    disabled={slidersLocked}
                    onChange={(e) => updateVector(idx, 'f', e.target.value)}
                    style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: '#475569' }}>
                    <span>Angle, θ_{v.id}</span>
                    <span style={{ fontWeight: 600, color: v.color }}>{v.theta.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={v.theta}
                    disabled={slidersLocked}
                    onChange={(e) => updateVector(idx, 'theta', e.target.value)}
                    style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Visualization Options Toggle Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', marginBottom: '15px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visualization Options:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={slidersLocked}
                onClick={() => !slidersLocked && setShowTipToTail(!showTipToTail)}
                style={{
                  padding: '6px 12px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: slidersLocked ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  borderColor: showTipToTail ? '#ef4444' : '#cbd5e1',
                  backgroundColor: showTipToTail ? 'rgba(239, 68, 68, 0.05)' : '#ffffff',
                  color: showTipToTail ? '#ef4444' : '#475569',
                }}
              >
                Tip-to-Tail Rule
              </button>
              <button
                disabled={slidersLocked}
                onClick={() => !slidersLocked && setShowComponents(!showComponents)}
                style={{
                  padding: '6px 12px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: slidersLocked ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  borderColor: showComponents ? '#ef4444' : '#cbd5e1',
                  backgroundColor: showComponents ? 'rgba(239, 68, 68, 0.05)' : '#ffffff',
                  color: showComponents ? '#ef4444' : '#475569',
                }}
              >
                Show Projections
              </button>
            </div>
          </div>

          {/* Dynamic Component & Resultant Equation Box */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#1e293b', borderLeft: '4px solid #ef4444', display: 'grid', gridTemplateColumns: numVectors > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '12px' }}>
            {vectorComponents.map((vc) => (
              <div key={vc.id}>
                <b>{vc.name} Components:</b><br />
                {vc.id}x = {vc.f.toFixed(1)} * cos({vc.theta.toFixed(0)}°) = {vc.vx.toFixed(2)} N<br />
                {vc.id}y = {vc.f.toFixed(1)} * sin({vc.theta.toFixed(0)}°) = {vc.vy.toFixed(2)} N
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
              <b>Resultant Vector R = {activeVectors.map((v) => v.id).join(' + ')}:</b><br />
              Rx = {vectorComponents.map((v) => v.id + 'x').join(' + ')} = {Rx.toFixed(2)} N | Ry = {vectorComponents.map((v) => v.id + 'y').join(' + ')} = {Ry.toFixed(2)} N<br />
              R_mag = √(Rx² + Ry²) = {R_mag.toFixed(2)} N | θ_R = {thetaR_deg.toFixed(1)}° ({quad})
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
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '12px', color: '#334155' }}>
                This widget demonstrates vector addition of multiple forces:
              </p>
              <MathBlock math="\vec{R} = \vec{A} + \vec{B} + \dots" />
              <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '12px', marginBottom: '16px' }}>
                <b>Key Features:</b>
                <ul style={{ paddingLeft: '18px', marginTop: '6px' }}>
                  <li style={{ marginBottom: '4px' }}>Drag sliders for magnitude and direction of the forces.</li>
                  <li style={{ marginBottom: '4px' }}>Use <b>Add Force</b> / <b>Remove Force</b> to scale up to 5 vectors.</li>
                  <li style={{ marginBottom: '4px' }}>Toggle <b>Tip-to-Tail Rule</b> to see vector addition geometrically.</li>
                  <li style={{ marginBottom: '4px' }}>Toggle <b>Show Projections</b> to inspect components (<MathInline math="A_x, A_y" />).</li>
                </ul>
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
                <b>Guided Scenario:</b><br />
                Adjust the sliders to set:<br />
                • <b>Vector A</b>: <MathInline math="F_A = 70.0\text{ N}" /> at <MathInline math="\theta_A = 45^\circ" /><br />
                • <b>Vector B</b>: <MathInline math="F_B = 70.0\text{ N}" /> at <MathInline math="\theta_B = 135^\circ" />
              </p>
              <p style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic', marginBottom: '12px' }}>
                Tip: Enabling 'Tip-to-Tail' will show Vector B stacking on the end of Vector A.
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                What is the magnitude and direction of the resultant force <MathInline math="R" />?
              </p>

              {[
                'R = 140.0 N at 90.0° (points straight up)',
                'R = 98.99 N at 90.0° (points straight up)',
                'R = 0.0 N (forces cancel out)',
                'R = 98.99 N at 0.0° (points straight right)',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="guided_radio"
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
                <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '12px', backgroundColor: guidedAnswer.includes('98.99 N at 90.0°') ? '#ecfdf5' : '#fef2f2', border: `1px solid ${guidedAnswer.includes('98.99 N at 90.0°') ? '#a7f3d0' : '#fecaca'}`, color: guidedAnswer.includes('98.99 N at 90.0°') ? '#065f46' : '#991b1b' }}>
                  {guidedAnswer.includes('98.99 N at 90.0°') ? (
                    <span>Correct! The horizontal components are equal and opposite (<MathInline math="A_x = 70 \cos(45^\circ) = 49.5\text{ N}" /> and <MathInline math="B_x = 70 \cos(135^\circ) = -49.5\text{ N}" />), so they cancel (<MathInline math="R_x = 0" />). The vertical components add together to yield <MathInline math="R_y = 99.0\text{ N}" />.</span>
                  ) : (
                    <span>Incorrect. Calculate components: <MathInline math="A_x = 70\cos(45^\circ) = 49.5" />, <MathInline math="B_x = -49.5" /> (sum to 0). Vertical components <MathInline math="70\sin(45^\circ) = 49.5" /> add to yield 99.0 N vertically.</span>
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
                Go to POE Challenge 🔮
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
                • <b>Vector A</b>: <MathInline math="F_A = 80.0\text{ N}" /> at <MathInline math="\theta_A = 30^\circ" /> (Quadrant 1)<br />
                • <b>Vector B</b>: <MathInline math="F_B = 60.0\text{ N}" /> at <MathInline math="\theta_B = 150^\circ" /> (Quadrant 2)
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Without unlocking controls, predict which quadrant the resultant force <MathInline math="R" /> will lie in, and whether its horizontal component <MathInline math="R_x" /> is positive or negative:
              </p>

              {[
                'Quadrant 1, Rx is positive (+)',
                'Quadrant 2, Rx is negative (-)',
                'Quadrant 1, Rx is negative (-)',
                'Quadrant 2, Rx is positive (+)',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="poe_p_radio"
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
                1. Set <b>Vector A</b> to 80 N and 30°.<br />
                2. Set <b>Vector B</b> to 60 N and 150°.<br />
                3. Observe the resultant vector red arrow R.
              </p>

              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Finalize your answer:
              </p>

              {[
                'Quadrant 1, Rx is positive (+)',
                'Quadrant 2, Rx is negative (-)',
                'Quadrant 1, Rx is negative (-)',
                'Quadrant 2, Rx is positive (+)',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="poe_o_radio"
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

              {poeAnswer === 'Quadrant 1, Rx is positive (+)' ? (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  🎉 <b>Correct!</b> Great physical intuition.
                </div>
              ) : (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  ⚠️ <b>Incorrect.</b> Review the components explanation below.
                </div>
              )}

              <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: '#1e293b' }}>Explanation:</h5>
                <ol style={{ paddingLeft: '18px', margin: 0 }}>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Horizontal Components:</b><br />
                    • <MathInline math="A_x = 80 \cos(30^\circ) = +69.3\text{ N}" /> (right)<br />
                    • <MathInline math="B_x = 60 \cos(150^\circ) = -52.0\text{ N}" /> (left)<br />
                    • <MathInline math="R_x = 69.3 - 52.0 = +17.3\text{ N}" /> (net right, positive)
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Vertical Components:</b><br />
                    • <MathInline math="A_y = 80 \sin(30^\circ) = +40.0\text{ N}" /> (up)<br />
                    • <MathInline math="B_y = 60 \sin(150^\circ) = +30.0\text{ N}" /> (up)<br />
                    • <MathInline math="R_y = 40.0 + 30.0 = +70.0\text{ N}" /> (net up, positive)
                  </li>
                  <li>
                    <b>Resultant:</b><br />
                    Since both <MathInline math="R_x > 0" /> and <MathInline math="R_y > 0" />, the resultant vector lies in <b>Quadrant 1</b> (<MathInline math="R = 72.1\text{ N}" /> at <MathInline math="76.1^\circ" />).
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

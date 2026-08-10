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

export default function TrussSections() {
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeHypothesis, setPoeHypothesis] = useState(null);
  const [poeFinalAnswer, setPoeFinalAnswer] = useState(null);

  // Sliders
  const [P, setP] = useState(80);
  const [cutPos, setCutPos] = useState(2); // 1 or 2
  const [side, setSide] = useState('left'); // 'left' or 'right'

  const isLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoeHypothesis(null);
    setPoeFinalAnswer(null);
    setP(80);
    setCutPos(2);
    setSide('left');
  };

  // Math Sizing
  const L = 10.0;
  const H = 5.0;
  const Ray = P / 2;
  const Rcy = P / 2;

  const phi = Math.atan2(H, 2.5);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const nodes = {
    A: [0, 0], D: [5, 0], C: [10, 0],
    E: [2.5, H], B: [7.5, H]
  };

  const Fae = -Ray / sinPhi;
  const Fad = Ray / Math.tan(phi);

  const Fbc = -Rcy / sinPhi;
  const Fcd = Rcy / Math.tan(phi);

  const Fed = P / (2 * sinPhi);
  const Fbd = P / (2 * sinPhi);

  const Feb = -Ray; // -P/2

  // Plotly traces
  const traces = [];

  const members = [
    { n1: 'A', n2: 'E', f: Fae, label: 'AE' },
    { n1: 'E', n2: 'D', f: Fed, label: 'ED' },
    { n1: 'A', n2: 'D', f: Fad, label: 'AD' },
    { n1: 'E', n2: 'B', f: Feb, label: 'EB' },
    { n1: 'B', n2: 'D', f: Fbd, label: 'BD' },
    { n1: 'D', n2: 'C', f: Fcd, label: 'DC' },
    { n1: 'B', n2: 'C', f: Fbc, label: 'BC' }
  ];

  members.forEach(m => {
    const midX = (nodes[m.n1][0] + nodes[m.n2][0]) / 2;
    let inActiveSide = false;
    if (side === 'left') {
      inActiveSide = cutPos === 1 ? midX < 2.0 : midX < 6.0;
    } else {
      inActiveSide = cutPos === 1 ? midX > 2.0 : midX > 6.0;
    }

    let color = '#cbd5e1';
    let width = 1.5;

    if (inActiveSide) {
      if (m.f > 0.1) {
        color = '#3b82f6';
        width = 3.5;
      } else if (m.f < -0.1) {
        color = '#ef4444';
        width = 3.5;
      }
    } else {
      if (m.f > 0.1) color = 'rgba(59, 130, 246, 0.2)';
      else if (m.f < -0.1) color = 'rgba(239, 68, 68, 0.2)';
    }

    traces.push({
      x: [nodes[m.n1][0], nodes[m.n2][0]],
      y: [nodes[m.n1][1], nodes[m.n2][1]],
      mode: 'lines',
      line: { color: color, width: width },
      showlegend: false,
      hoverinfo: 'skip'
    });
  });

  const nodeKeys = ['A', 'B', 'C', 'D', 'E'];
  nodeKeys.forEach(n => {
    const nodeX = nodes[n][0];
    let activeNode = false;
    if (side === 'left') {
      activeNode = cutPos === 1 ? nodeX < 2.0 : nodeX <= 5.0;
    } else {
      activeNode = cutPos === 1 ? nodeX >= 2.5 : nodeX > 5.0;
    }

    const color = activeNode ? '#1e293b' : '#cbd5e1';
    traces.push({
      x: [nodes[n][0]],
      y: [nodes[n][1]],
      mode: 'markers+text',
      marker: { size: 10, color: color },
      text: [n],
      textposition: ['bottom left', 'top center', 'bottom right', 'bottom center', 'top center'][nodeKeys.indexOf(n)],
      font: { family: 'Outfit', size: 12, color: color, weight: 'bold' },
      showlegend: false,
      hoverinfo: 'skip'
    });
  });

  // Cutting plane line
  const cutX = cutPos === 1 ? 2.0 : 6.0;
  traces.push({
    x: [cutX, cutX],
    y: [-2, H + 2],
    mode: 'lines',
    line: { color: '#8b5cf6', width: 3, dash: 'dashdot' },
    name: 'Cutting Plane',
    hoverinfo: 'text',
    hovertext: `Cutting Plane x = ${cutX}`
  });

  const annotations = [];

  const addExposedArrow = (ax, ay, force, theta_rad, label, color_code) => {
    const arrow_len = 1.8;
    const sign = force > 0 ? 1 : -1;
    const targetX = ax + arrow_len * Math.cos(theta_rad) * sign;
    const targetY = ay + arrow_len * Math.sin(theta_rad) * sign;

    annotations.push({
      ax: ax, ay: ay,
      x: targetX, y: targetY,
      xref: 'x', yref: 'y',
      axref: 'x', ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 0.8,
      arrowwidth: 3.5,
      arrowcolor: color_code,
      text: label,
      font: { family: 'Outfit', size: 9, color: color_code, weight: 'bold' },
      xshift: (targetX - ax) > 0 ? 10 : -10,
      yshift: (targetY - ay) > 0 ? 10 : -10
    });
  };

  if (side === 'left') {
    if (cutPos === 1) {
      addExposedArrow(0, 0, Fae, phi, 'F_AE', '#ef4444');
      addExposedArrow(0, 0, Fad, 0, 'F_AD', '#3b82f6');
    } else {
      addExposedArrow(2.5, H, Feb, 0, 'F_EB', '#ef4444');
      addExposedArrow(5, 0, Fbd, phi, 'F_BD', '#3b82f6');
      addExposedArrow(5, 0, Fcd, 0, 'F_CD', '#3b82f6');

      annotations.push({
        ax: 0, ay: -2.5,
        x: 0, y: -0.2,
        xref: 'x', yref: 'y',
        axref: 'x', ayref: 'y',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 0.8,
        arrowwidth: 3,
        arrowcolor: '#3b82f6',
        text: `Ray = ${Ray.toFixed(0)}kN`,
        font: { family: 'Outfit', size: 10, color: '#3b82f6' },
        xshift: -25
      });
    }
  } else {
    if (cutPos === 2) {
      addExposedArrow(7.5, H, Feb, Math.PI, 'F_EB', '#ef4444');
      addExposedArrow(7.5, H, Fbd, Math.PI + phi, 'F_BD', '#3b82f6');
      addExposedArrow(10, 0, Fcd, Math.PI, 'F_CD', '#3b82f6');

      annotations.push({
        ax: 10, ay: -2.5,
        x: 10, y: -0.2,
        xref: 'x', yref: 'y',
        axref: 'x', ayref: 'y',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 0.8,
        arrowwidth: 3,
        arrowcolor: '#10b981',
        text: `Rcy = ${Rcy.toFixed(0)}kN`,
        font: { family: 'Outfit', size: 10, color: '#10b981' },
        xshift: 25
      });
    }
  }

  if (P > 0) {
    const len = 1.5 + 1.5 * (P / 100);
    annotations.push({
      ax: 5, ay: -len,
      x: 5, y: -0.2,
      xref: 'x', yref: 'y',
      axref: 'x', ayref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1,
      arrowwidth: 3.5,
      arrowcolor: '#ef4444',
      text: `P = ${P.toFixed(0)} kN`,
      font: { family: 'Outfit', size: 10, color: '#ef4444', weight: 'bold' },
      yshift: -15
    });
  }

  const layout = {
    xaxis: { range: [-2, 12], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
    yaxis: { range: [-4.5, 7.5], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'x', scaleratio: 1, fixedrange: true },
    margin: { l: 10, r: 10, t: 10, b: 10 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true
  };

  const guidedOptions = [
    "Ray + F_AE * sin(phi) = 0 => F_AE = -44.7 kN (Compression)",
    "Ray + F_AE * sin(phi) = 0 => F_AE = -89.4 kN (Compression)",
    "Ray - F_AE * cos(phi) = 0 => F_AE = 44.7 kN (Tension)",
    "F_AE = 0 kN, because it is a zero-force member"
  ];

  const poeOptions = [
    "Pivot Node B; F_CD = 20 kN (Tension)",
    "Pivot Node B; F_CD = 60 kN (Tension)",
    "Pivot Node D; F_CD = 40 kN (Compression)",
    "Pivot Node E; F_CD = 20 kN (Tension)"
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Title */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 2 • Lesson 16
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2.2rem' }}>
          Truss Analysis: Method of Sections
        </h1>
      </div>

      {/* Objectives */}
      <div className="objectives-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learning Objectives
          </span>
        </div>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Pass imaginary cutting planes through multi-member trusses to isolate free-body sections.
          </li>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Expose internal forces as external boundary vectors and apply moment equilibrium (<KaTeX math="\sum M_{\text{pivot}} = 0" />).
          </li>
          <li style={{ marginBottom: '0px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Strategically select pivot points to directly solve for desired member forces.
          </li>
        </ul>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '24px' }}>
        
        {/* LEFT COLUMN: SIMULATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Interactive Truss Section Solver
          </h3>

          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px 14px', color: '#b45309', fontSize: '0.9rem' }}>
              <span>⚠️ <b>Truss controls locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '300px' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>1. Crate Load (P)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Load Magnitude, P</span>
                <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{P} kN</span>
              </div>
              <input type="range" min="10" max="100" step="10" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>*Vertical load at bottom center Node D</div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>2. Section Options</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Cut Position</span>
                <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{cutPos === 1 ? 'Section 1 (Left)' : 'Section 2 (Right)'}</span>
              </div>
              <input type="range" min="1" max="2" step="1" value={cutPos} disabled={isLocked} onChange={(e) => setCutPos(parseInt(e.target.value))} style={{ width: '100%', marginBottom: '10px', cursor: isLocked ? 'not-allowed' : 'pointer' }} />

              <div style={{ display: 'flex', gap: '6px' }}>
                <button disabled={isLocked} onClick={() => setSide('left')} style={{
                  flex: 1, padding: '6px', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: isLocked ? 'not-allowed' : 'pointer',
                  border: side === 'left' ? '1.5px solid #8b5cf6' : '1px solid var(--border-light)',
                  backgroundColor: side === 'left' ? '#8b5cf6' : 'transparent',
                  color: side === 'left' ? '#fff' : 'var(--text-main)'
                }}>Left Section</button>
                <button disabled={isLocked} onClick={() => setSide('right')} style={{
                  flex: 1, padding: '6px', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: isLocked ? 'not-allowed' : 'pointer',
                  border: side === 'right' ? '1.5px solid #8b5cf6' : '1px solid var(--border-light)',
                  backgroundColor: side === 'right' ? '#8b5cf6' : 'transparent',
                  color: side === 'right' ? '#fff' : 'var(--text-main)'
                }}>Right Section</button>
              </div>
            </div>
          </div>

          {/* Equation Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderLeft: '4px solid #8b5cf6',
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--text-main)'
          }}>
            {cutPos === 1 ? (
              side === 'left' ? (
                <div>
                  <b>Section 1 (LHS) Equilibrium:</b><br />
                  <KaTeX math={`\\sum F_y = R_{Ay} + F_{AE} \\sin(63.4^\\circ) = 0 \\implies F_{AE} = -${Ray.toFixed(1)} / \\sin(63.4^\\circ) = `} /> <b>{Fae.toFixed(1)} kN</b> (Compression)<br />
                  <KaTeX math={`\\sum M_E = -R_{Ay} \\cdot 2.5 + F_{AD} \\cdot 5 = 0 \\implies F_{AD} = `} /> <b>{Fad.toFixed(1)} kN</b> (Tension)<br />
                  <KaTeX math={`\\sum F_x = F_{AD} + F_{AE}\\cos(63.4^\\circ) + F_{ED}\\cos(63.4^\\circ) = 0 \\implies F_{ED} = `} /> <b>{Fed.toFixed(1)} kN</b> (Tension)
                </div>
              ) : (
                <div>
                  <b>Section 1 (RHS) Equilibrium:</b><br />
                  <KaTeX math={`\\sum F_y = R_{Cy} + Py - F_{AE}\\sin(63.4^\\circ) - F_{ED}\\sin(63.4^\\circ) = 0`} /><br />
                  • Member forces: <KaTeX math={`F_{AE} = `} /> <b>{Fae.toFixed(1)} kN</b> (C) | <KaTeX math={`F_{ED} = `} /> <b>{Fed.toFixed(1)} kN</b> (T)<br />
                  <KaTeX math={`\\sum M_E = -Py \\cdot 2.5 - R_{Cy} \\cdot 7.5 + F_{AD} \\cdot 5 = 0 \\implies F_{AD} = `} /> <b>{Fad.toFixed(1)} kN</b> (Tension)
                </div>
              )
            ) : (
              side === 'left' ? (
                <div>
                  <b>Section 2 (LHS) Equilibrium:</b><br />
                  <b>Pivot Node B at (7.5, 5.0):</b><br />
                  <KaTeX math={`\\sum M_B = -R_{Ay} \\cdot 7.5 + P \\cdot 2.5 + F_{CD} \\cdot H = 0`} /><br />
                  • <KaTeX math={`-${Ray.toFixed(1)} \\cdot 7.5 + ${P} \\cdot 2.5 + F_{CD} \\cdot 5 = 0 \\implies 5 F_{CD} = 100 \\implies F_{CD} = `} /> <b>{Fcd.toFixed(1)} kN</b> (Tension)<br />
                  <b>Pivot Node D at (5.0, 0.0):</b><br />
                  <KaTeX math={`\\sum M_D = -R_{Ay} \\cdot 5 + F_{EB} \\cdot H = 0 \\implies F_{EB} = `} /> <b>{Math.abs(Feb).toFixed(1)} kN</b> (Compression)<br />
                  <KaTeX math={`\\sum F_y = R_{Ay} - P + F_{BD} \\sin(63.4^\\circ) = 0 \\implies F_{BD} = `} /> <b>{Fbd.toFixed(1)} kN</b> (Tension)
                </div>
              ) : (
                <div>
                  <b>Section 2 (RHS) Equilibrium:</b><br />
                  <KaTeX math={`\\sum M_B = R_{Cy} \\cdot 2.5 - F_{CD} \\cdot 5 = 0 \\implies F_{CD} = `} /> <b>{Fcd.toFixed(1)} kN</b> (Tension)<br />
                  <KaTeX math={`\\sum F_y = R_{Cy} - F_{BD} \\sin(63.4^\\circ) = 0 \\implies F_{BD} = `} /> <b>{Fbd.toFixed(1)} kN</b> (Tension)<br />
                  <KaTeX math={`\\sum F_x = -F_{EB} - F_{BC}\\cos(63.4^\\circ) - F_{BD}\\cos(63.4^\\circ) = 0 \\implies F_{EB} = `} /> <b>{Math.abs(Feb).toFixed(1)} kN</b> (Compression)
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SIDECAR */}
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.04)',
          border: '2px solid #10b981',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
              {phase === 'instructions' && '📖 Step 1: Instructions'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Practice'}
              {phase === 'poe_predict' && '🔮 POE Challenge: Predict'}
              {phase === 'poe_observe' && '👀 POE Challenge: Observe & Correct'}
              {phase === 'poe_explain' && '💡 POE Challenge: Explain'}
            </h4>

            {phase === 'instructions' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '12px' }}>
                  The <b>Method of Sections</b> cuts through a truss to isolate a section as a rigid body in static equilibrium.
                </p>
                <ul style={{ paddingLeft: '18px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '6px' }}><b>Cutting Plane:</b> Drag to cut through specific members.</li>
                  <li style={{ marginBottom: '6px' }}><b>Section Isolation:</b> Choose to analyze Left or Right section.</li>
                  <li style={{ marginBottom: '6px' }}><b>Pivot Selection:</b> Sum moments about member intersection points to solve forces directly.</li>
                </ul>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>
                  Start Practice 🔍
                </button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, marginBottom: '8px' }}>Guided Scenario:</p>
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  • <b>Load P:</b> 80 kN<br />
                  • <b>Cut Position:</b> Section 1 (Center-Left)<br />
                  • <b>Active Side:</b> Analyze Left Section
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Question: How is diagonal member AE resolved, and what is its force?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {guidedOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="guidedS" checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ marginBottom: '12px' }} onClick={() => setGuidedSubmitted(true)}>
                  Submit Answer
                </button>

                {guidedSubmitted && (
                  <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', backgroundColor: guidedAnswer?.includes('-44.7 kN') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${guidedAnswer?.includes('-44.7 kN') ? '#bbf7d0' : '#fee2e2'}`, color: guidedAnswer?.includes('-44.7 kN') ? '#166534' : '#991b1b', marginBottom: '14px' }}>
                    {guidedAnswer?.includes('-44.7 kN')
                      ? 'Correct! Isolate left section: Ray = 40 kN (up) and vertical component of F_AE. Ray + F_AE * sin(63.4°) = 0 => F_AE = -44.7 kN (Compression).'
                      : 'Incorrect. Vertical equilibrium: Ray + F_AE * sin(63.4°) = 0 => F_AE = -40 / 0.894 = -44.7 kN (Compression).'}
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
                  Predict Phase (Truss Controls Locked!):
                </p>
                <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  • <b>Load P:</b> 80 kN<br />
                  • <b>Cut Position:</b> Section 2 (cuts EB, BD, DC)<br />
                  • <b>Active Side:</b> Left Section
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  1) Which node is the optimal pivot point to solve for bottom chord force <KaTeX math="F_{CD}" /> directly?<br />
                  2) Calculate <KaTeX math="F_{CD}" />.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeS" checked={poeHypothesis === opt} onChange={() => setPoeHypothesis(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" disabled={!poeHypothesis} onClick={() => { setPoeFinalAnswer(poeHypothesis); setPhase('poe_observe'); }}>
                  Test Hypothesis 🧪
                </button>
              </div>
            )}

            {phase === 'poe_observe' && (
              <div style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>
                  Observe & Correct Phase (Controls Unlocked!):
                </p>
                <p style={{ marginBottom: '10px' }}>
                  1. Set Load to <b>80 kN</b>.<br />
                  2. Set Cut Position to <b>Section 2</b> and Active Side to <b>Left Section</b>.<br />
                  3. Inspect the moment equation around Node B.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeSO" checked={poeFinalAnswer === opt} onChange={() => setPoeFinalAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe_explain')}>
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

                {poeFinalAnswer === "Pivot Node B; F_CD = 20 kN (Tension)" ? (
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
                      <b>Optimal Pivot:</b> The cut members are EB, BD, and CD. Both EB and BD intersect at <b>Node B</b>. Taking moments about Node B eliminates EB and BD from the equation.
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Moment Equilibrium at B (7.5, 5.0):</b><br />
                      <KaTeX math="\sum M_B = -R_{Ay} \cdot 7.5 + P \cdot 2.5 + F_{CD} \cdot 5 = 0" /><br />
                      <KaTeX math="-40 \cdot 7.5 + 80 \cdot 2.5 + 5 F_{CD} = 0 \implies 5 F_{CD} = 100 \implies F_{CD} = 20.0\text{ kN}" /> (Tension).
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

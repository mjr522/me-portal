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

export default function TrussJoints() {
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeHypothesis, setPoeHypothesis] = useState(null);
  const [poeFinalAnswer, setPoeFinalAnswer] = useState(null);

  // Sliders
  const [P, setP] = useState(60);
  const [thetaP, setThetaP] = useState(270);
  const [H, setH] = useState(5.0);

  const isLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoeHypothesis(null);
    setPoeFinalAnswer(null);
    setP(60);
    setThetaP(270);
    setH(5.0);
  };

  // Math Calculations
  const radP = (thetaP * Math.PI) / 180;
  const Px = P * Math.cos(radP);
  const Py = P * Math.sin(radP);

  const Cy = -Py / 2;
  const Ay = -Py / 2;
  const Ax = -Px;

  const phi = Math.atan2(H, 5);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const Fab = -Ay / sinPhi;
  const Fad = -Ax - Fab * cosPhi;

  const Fbc = -Cy / sinPhi;
  const Fcd = -Fbc * cosPhi;

  const Fbd = -Py;

  const getForceStateStr = (f) => (f > 0.05 ? 'Tension' : f < -0.05 ? 'Compression' : 'Zero-Force');

  // Plotly data
  const traces = [];
  const nodes = {
    A: [0, 0],
    B: [5, H],
    C: [10, 0],
    D: [5, 0]
  };

  // Supports
  // Pin at A
  traces.push({
    x: [-0.3, 0, 0.3, -0.3], y: [-0.5, 0, -0.5, -0.5],
    fill: 'toself', mode: 'lines', line: { color: '#3b82f6', width: 1.5 },
    fillcolor: 'rgba(59, 130, 246, 0.15)', showlegend: false, hoverinfo: 'skip'
  });
  // Roller at C
  traces.push({
    x: [9.7, 10, 10.3, 9.7], y: [-0.4, 0, -0.4, -0.4],
    fill: 'toself', mode: 'lines', line: { color: '#10b981', width: 1.5 },
    fillcolor: 'rgba(16, 185, 129, 0.15)', showlegend: false, hoverinfo: 'skip'
  });
  traces.push({
    x: [9.8, 10.2], y: [-0.55, -0.55],
    mode: 'markers', marker: { size: 4, color: '#10b981' }, showlegend: false, hoverinfo: 'skip'
  });

  const drawMember = (n1, n2, force, label) => {
    let color = '#94a3b8';
    let width = 1.5;
    if (force > 0.1) {
      color = '#3b82f6';
      width = 2 + 4 * (Math.abs(force) / 100);
    } else if (force < -0.1) {
      color = '#ef4444';
      width = 2 + 4 * (Math.abs(force) / 100);
    }

    traces.push({
      x: [nodes[n1][0], nodes[n2][0]],
      y: [nodes[n1][1], nodes[n2][1]],
      mode: 'lines',
      line: { color: color, width: width },
      name: label,
      hoverinfo: 'text',
      hovertext: `Member ${label}: ${Math.abs(force).toFixed(1)} kN (${getForceStateStr(force)})`
    });

    if (Math.abs(force) > 5) {
      const dx = nodes[n2][0] - nodes[n1][0];
      const dy = nodes[n2][1] - nodes[n1][1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist;
      const uy = dy / dist;

      const arrow_offset = 0.9;
      const arrow_len = 0.4;
      const sign = force > 0 ? 1 : -1;

      traces.push({
        x: [nodes[n1][0] + ux * arrow_offset, nodes[n1][0] + ux * (arrow_offset + sign * arrow_len)],
        y: [nodes[n1][1] + uy * arrow_offset, nodes[n1][1] + uy * (arrow_offset + sign * arrow_len)],
        mode: 'lines',
        line: { color: color, width: 2 },
        showlegend: false,
        hoverinfo: 'skip'
      });
      traces.push({
        x: [nodes[n2][0] - ux * arrow_offset, nodes[n2][0] - ux * (arrow_offset + sign * arrow_len)],
        y: [nodes[n2][1] - uy * arrow_offset, nodes[n2][1] - uy * (arrow_offset + sign * arrow_len)],
        mode: 'lines',
        line: { color: color, width: 2 },
        showlegend: false,
        hoverinfo: 'skip'
      });
    }
  };

  drawMember('A', 'B', Fab, 'AB');
  drawMember('B', 'C', Fbc, 'BC');
  drawMember('B', 'D', Fbd, 'BD');
  drawMember('A', 'D', Fad, 'AD');
  drawMember('D', 'C', Fcd, 'CD');

  traces.push({
    x: [0, 5, 10, 5],
    y: [0, H, 0, 0],
    mode: 'markers+text',
    marker: { size: 10, color: '#1e293b' },
    text: ['A', 'B', 'C', 'D'],
    textposition: ['bottom left', 'top center', 'bottom right', 'bottom center'],
    font: { family: 'Outfit', size: 12, color: '#1e293b', weight: 'bold' },
    showlegend: false,
    hoverinfo: 'text',
    hovertext: 'Joint'
  });

  const annotations = [];
  if (P > 0) {
    const len = 1.5 + 2 * (P / 100);
    annotations.push({
      ax: 5 + Math.cos(radP) * len,
      ay: Math.sin(radP) * len,
      x: 5 + Math.cos(radP) * 0.2,
      y: Math.sin(radP) * 0.2,
      xref: 'x', yref: 'y',
      axref: 'x', ayref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1,
      arrowwidth: 3.5,
      arrowcolor: '#ef4444',
      text: `P = ${P.toFixed(0)} kN`,
      font: { family: 'Outfit', size: 10, color: '#ef4444', weight: 'bold' },
      yshift: radP > Math.PI ? -15 : 15
    });
  }

  const layout = {
    xaxis: { range: [-2, 12], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
    yaxis: { range: [-2.5, 9.5], showgrid: false, zeroline: false, showticklabels: false, scaleanchor: 'x', scaleratio: 1, fixedrange: true },
    margin: { l: 10, r: 10, t: 10, b: 10 },
    showlegend: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    annotations: annotations,
    autosize: true
  };

  const guidedOptions = [
    "F_BD = 80 kN, because the load is horizontal.",
    "F_BD = 0 kN, because there is no vertical load at Node D.",
    "F_BD = 40 kN, because the load is split symmetrically.",
    "F_BD = 80 kN (Tension), because it must balance Node B."
  ];

  const poeOptions = [
    "F_BD = 60 kN (Tension); F_AD = F_CD = 30 kN (Tension).",
    "F_BD = 60 kN (Compression); F_AD = F_CD = 30 kN (Compression).",
    "F_BD = 0 kN (Zero-force); F_AD = F_CD = 60 kN (Tension).",
    "F_BD = 60 kN (Tension); F_AD = F_CD = 0 kN (Zero-force)."
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Title */}
      <div style={{ borderBottom: '1.5px solid rgba(128,128,128,0.2)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 2 • Lesson 15
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2.2rem' }}>
          Truss Analysis: Method of Joints
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
            Isolate truss joints as 2D particles in static equilibrium (<KaTeX math="\sum F_x = 0" />, <KaTeX math="\sum F_y = 0" />).
          </li>
          <li style={{ marginBottom: '8px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Calculate internal axial member forces and classify states as Tension or Compression.
          </li>
          <li style={{ marginBottom: '0px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Visually and mathematically identify zero-force members.
          </li>
        </ul>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: '24px' }}>
        
        {/* LEFT COLUMN: SIMULATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Interactive 2D Truss Solver
          </h3>

          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px 14px', color: '#b45309', fontSize: '0.9rem' }}>
              <span>⚠️ <b>Truss controls locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '300px' }} config={{ responsive: true, displayModeBar: false }} />
            
            {/* Color Legend */}
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '4px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                <span style={{ color: '#3b82f6' }}>Tension (T)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '4px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
                <span style={{ color: '#ef4444' }}>Compression (C)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '2px', backgroundColor: '#94a3b8' }}></div>
                <span style={{ color: '#64748b' }}>Zero-Force Member</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>1. Load Magnitude</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Force, P</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{P} kN</span>
              </div>
              <input type="range" min="0" max="100" step="10" value={P} disabled={isLocked} onChange={(e) => setP(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>2. Load Direction</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Angle, θ_P</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{thetaP}°</span>
              </div>
              <input type="range" min="180" max="360" step="15" value={thetaP} disabled={isLocked} onChange={(e) => setThetaP(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>3. Truss Geometry</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Height, H</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{H.toFixed(1)} m</span>
              </div>
              <input type="range" min="3.0" max="8.0" step="0.5" value={H} disabled={isLocked} onChange={(e) => setH(parseFloat(e.target.value))} style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
            </div>
          </div>

          {/* Live Equation Output */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderLeft: '4px solid #10b981',
            borderRadius: '8px',
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <b>Truss External Reactions:</b><br />
              • <KaTeX math={`A_x = ${Ax.toFixed(1)}\\text{ kN}`} /><br />
              • <KaTeX math={`A_y = ${Ay.toFixed(1)}\\text{ kN}`} /><br />
              • <KaTeX math={`C_y = ${Cy.toFixed(1)}\\text{ kN}`} />
            </div>
            <div>
              <b>Member Internal Forces:</b><br />
              • <KaTeX math={`F_{AB} = `} /> <b>{Math.abs(Fab).toFixed(1)} kN</b> ({getForceStateStr(Fab)})<br />
              • <KaTeX math={`F_{BC} = `} /> <b>{Math.abs(Fbc).toFixed(1)} kN</b> ({getForceStateStr(Fbc)})<br />
              • <KaTeX math={`F_{BD} = `} /> <b>{Math.abs(Fbd).toFixed(1)} kN</b> ({getForceStateStr(Fbd)})<br />
              • <KaTeX math={`F_{AD} = `} /> <b>{Math.abs(Fad).toFixed(1)} kN</b> ({getForceStateStr(Fad)})<br />
              • <KaTeX math={`F_{CD} = `} /> <b>{Math.abs(Fcd).toFixed(1)} kN</b> ({getForceStateStr(Fcd)})
            </div>
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
                  The <b>Method of Joints</b> isolates each joint in a truss as a 2D particle in static equilibrium.
                </p>
                <ul style={{ paddingLeft: '18px', marginBottom: '16px' }}>
                  <li style={{ marginBottom: '6px' }}><b>Blue:</b> Tension (T) - internal forces pull away from joints.</li>
                  <li style={{ marginBottom: '6px' }}><b>Red:</b> Compression (C) - internal forces push into joints.</li>
                  <li style={{ marginBottom: '6px' }}><b>Gray:</b> Zero-Force Member - carries no force.</li>
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
                  • <b>Angle θ_P:</b> 180° (pointing horizontal left at Node D)<br />
                  • <b>Height H:</b> 5.0 m
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Question: What is the force in vertical member BD, and why?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {guidedOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="guidedJ" checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" style={{ marginBottom: '12px' }} onClick={() => setGuidedSubmitted(true)}>
                  Submit Answer
                </button>

                {guidedSubmitted && (
                  <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', backgroundColor: guidedAnswer?.includes('0 kN') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${guidedAnswer?.includes('0 kN') ? '#bbf7d0' : '#fee2e2'}`, color: guidedAnswer?.includes('0 kN') ? '#166534' : '#991b1b', marginBottom: '14px' }}>
                    {guidedAnswer?.includes('0 kN')
                      ? 'Correct! Isolating Joint D: BD is vertical, while AD, CD, and load P are horizontal. Vertical equilibrium sum Fy = F_BD = 0, making BD a zero-force member.'
                      : 'Incorrect. Isolate Joint D: the only vertical force is F_BD. For vertical equilibrium sum Fy = 0, so F_BD must equal 0.'}
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
                  • <b>Height H:</b> 5.0 m<br />
                  • <b>Load P:</b> 60 kN at <b>θ_P = 270°</b> (vertical downward at D)
                </div>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>
                  Predict the force in vertical member BD and bottom chord members AD & CD:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeJ" checked={poeHypothesis === opt} onChange={() => setPoeHypothesis(opt)} />
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
                  1. Set Height to <b>5.0 m</b>.<br />
                  2. Set Load to <b>60 kN</b> and Direction to <b>270°</b>.<br />
                  3. Observe member colors and force magnitudes.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {poeOptions.map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                      <input type="radio" name="poeJO" checked={poeFinalAnswer === opt} onChange={() => setPoeFinalAnswer(opt)} />
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

                {poeFinalAnswer === "F_BD = 60 kN (Tension); F_AD = F_CD = 30 kN (Tension)." ? (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontWeight: 700, marginBottom: '14px' }}>
                    🎉 Correct! Excellent understanding of joint equilibrium.
                  </div>
                ) : (
                  <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#9a3412', fontWeight: 700, marginBottom: '14px' }}>
                    ⚠️ Incorrect. Review the calculations below.
                  </div>
                )}

                <div style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  <h5 style={{ fontWeight: 700, margin: '10px 0 6px 0' }}>Explanation:</h5>
                  <ol style={{ paddingLeft: '18px', margin: 0 }}>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Joint D:</b> <KaTeX math="\sum F_y = 0 \implies F_{BD} - 60 = 0 \implies F_{BD} = 60\text{ kN}" /> (Tension).
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Joint B:</b> By symmetry, <KaTeX math="F_{AB} = F_{BC} = -42.43\text{ kN}" /> (Compression).
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <b>Joint A:</b> <KaTeX math="\sum F_x = 0 \implies F_{AD} + F_{AB}\cos(45^\circ) = 0 \implies F_{AD} = +30\text{ kN}" /> (Tension).
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

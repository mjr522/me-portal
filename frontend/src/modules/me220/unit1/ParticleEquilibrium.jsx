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

export default function ParticleEquilibrium() {
  // Phase state
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState('');
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeAnswer, setPoeAnswer] = useState('');

  // Sandbox state
  const [W, setW] = useState(500);
  const [thetaA, setThetaA] = useState(30);
  const [thetaB, setThetaB] = useState(30);

  const slidersLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer('');
    setGuidedSubmitted(false);
    setPoeAnswer('');
    setW(500);
    setThetaA(30);
    setThetaB(30);
  };

  // Calculations
  const radA = (thetaA * Math.PI) / 180;
  const radB = (thetaB * Math.PI) / 180;

  const denom = Math.sin(radA) + Math.cos(radA) * Math.tan(radB);
  let Ta = 0;
  let Tb = 0;
  let invalidConfig = false;

  if (denom <= 0.001) {
    invalidConfig = true;
  } else {
    Ta = W / denom;
    Tb = (Ta * Math.cos(radA)) / Math.cos(radB);
    if (Ta < 0 || Tb < 0) {
      invalidConfig = true;
    }
  }

  const isOverload = !invalidConfig && (Ta > 1200 || Tb > 1200);

  // Geometry calculations for Plotly canvas
  let ax = -60;
  let ay = 60 * Math.tan(radA);
  let bx = 60;
  let by = 60 * Math.tan(radB);

  if (ay > 60) {
    ay = 60;
    ax = -ay / Math.tan(radA);
  }
  if (by > 60) {
    by = 60;
    bx = by / Math.tan(radB);
  }

  const shift_phys_x = -45;

  const physTraces = [
    {
      x: [ax + shift_phys_x, shift_phys_x],
      y: [ay, 0],
      mode: 'lines+markers',
      line: { color: Ta > 1200 ? '#ef4444' : '#3b82f6', width: 2.5 + 4 * (Ta / 1500) },
      marker: { size: 6, color: '#334155' },
      hoverinfo: 'text',
      hovertext: `Cable A: Tension = ${Ta.toFixed(1)} N`,
    },
    {
      x: [bx + shift_phys_x, shift_phys_x],
      y: [by, 0],
      mode: 'lines+markers',
      line: { color: Tb > 1200 ? '#ef4444' : '#10b981', width: 2.5 + 4 * (Tb / 1500) },
      marker: { size: 6, color: '#334155' },
      hoverinfo: 'text',
      hovertext: `Cable B: Tension = ${Tb.toFixed(1)} N`,
    },
    {
      x: [shift_phys_x, shift_phys_x],
      y: [0, -30],
      mode: 'lines',
      line: { color: '#64748b', width: 3 },
      showlegend: false,
      hoverinfo: 'skip',
    },
    {
      x: [-15 + shift_phys_x, 15 + shift_phys_x, 15 + shift_phys_x, -15 + shift_phys_x, -15 + shift_phys_x],
      y: [-30, -30, -55, -55, -30],
      mode: 'lines',
      fill: 'toself',
      fillcolor: 'rgba(148, 163, 184, 0.2)',
      line: { color: '#475569', width: 2.5 },
      showlegend: false,
      hoverinfo: 'text',
      hovertext: `Crate: Weight = ${W.toFixed(0)} N`,
    },
    {
      x: [-80 + shift_phys_x, 80 + shift_phys_x],
      y: [65, 65],
      mode: 'lines',
      line: { color: '#475569', width: 6 },
      showlegend: false,
      hoverinfo: 'skip',
    },
  ];

  const divider = {
    x: [0, 0],
    y: [-80, 80],
    mode: 'lines',
    line: { color: '#cbd5e1', width: 2, dash: 'dash' },
    showlegend: false,
    hoverinfo: 'skip',
  };

  const fbd_origin_x = 50;
  const fbd_origin_y = 0;

  const fbdRing = {
    x: [fbd_origin_x],
    y: [fbd_origin_y],
    mode: 'markers',
    marker: { size: 10, color: '#1e293b' },
    showlegend: false,
    hoverinfo: 'text',
    hovertext: 'Particle equilibrium node (ring)',
  };

  const scale = 0.04;
  let fax_fbd = 0, fay_fbd = 0, fbx_fbd = 0, fby_fbd = 0;
  if (!invalidConfig) {
    fax_fbd = -Ta * Math.cos(radA) * scale;
    fay_fbd = Ta * Math.sin(radA) * scale;
    fbx_fbd = Tb * Math.cos(radB) * scale;
    fby_fbd = Tb * Math.sin(radB) * scale;
  }
  const fw_fbd = -W * scale;

  const annotations = [
    {
      x: shift_phys_x,
      y: 75,
      text: '<b>PHYSICAL SYSTEM</b>',
      font: { family: 'Outfit, sans-serif', size: 12, color: '#475569' },
      showarrow: false,
    },
    {
      x: fbd_origin_x,
      y: 75,
      text: '<b>FREE BODY DIAGRAM (FBD)</b>',
      font: { family: 'Outfit, sans-serif', size: 12, color: '#475569' },
      showarrow: false,
    },
    {
      x: shift_phys_x,
      y: -42,
      text: `W = ${W.toFixed(0)} N`,
      font: { family: 'Outfit, sans-serif', size: 11, color: '#ffffff' },
      showarrow: false,
    },
    {
      ax: fbd_origin_x,
      ay: fbd_origin_y,
      x: fbd_origin_x + fax_fbd,
      y: fbd_origin_y + fay_fbd,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: !invalidConfig,
      arrowhead: 3,
      arrowsize: 1,
      arrowwidth: 3.5,
      arrowcolor: Ta > 1200 ? '#ef4444' : '#3b82f6',
      text: '',
    },
    {
      x: fbd_origin_x + fax_fbd,
      y: fbd_origin_y + fay_fbd,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: invalidConfig ? '' : `Ta = ${Ta.toFixed(0)} N`,
      font: { family: 'Outfit, sans-serif', size: 11, color: Ta > 1200 ? '#ef4444' : '#3b82f6', weight: 'bold' },
      xshift: -35,
      yshift: 10,
    },
    {
      ax: fbd_origin_x,
      ay: fbd_origin_y,
      x: fbd_origin_x + fbx_fbd,
      y: fbd_origin_y + fby_fbd,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: !invalidConfig,
      arrowhead: 3,
      arrowsize: 1,
      arrowwidth: 3.5,
      arrowcolor: Tb > 1200 ? '#ef4444' : '#10b981',
      text: '',
    },
    {
      x: fbd_origin_x + fbx_fbd,
      y: fbd_origin_y + fby_fbd,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: invalidConfig ? '' : `Tb = ${Tb.toFixed(0)} N`,
      font: { family: 'Outfit, sans-serif', size: 11, color: Tb > 1200 ? '#ef4444' : '#10b981', weight: 'bold' },
      xshift: 35,
      yshift: 10,
    },
    {
      ax: fbd_origin_x,
      ay: fbd_origin_y,
      x: fbd_origin_x,
      y: fbd_origin_y + fw_fbd,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1,
      arrowwidth: 3.5,
      arrowcolor: '#64748b',
      text: '',
    },
    {
      x: fbd_origin_x,
      y: fbd_origin_y + fw_fbd,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: `W = ${W.toFixed(0)} N`,
      font: { family: 'Outfit, sans-serif', size: 11, color: '#64748b', weight: 'bold' },
      xshift: 30,
      yshift: -5,
    },
  ];

  const layout = {
    xaxis: {
      range: [-110, 110],
      showgrid: false,
      zeroline: false,
      showticklabels: false,
      fixedrange: true,
    },
    yaxis: {
      range: [-80, 80],
      showgrid: false,
      zeroline: false,
      showticklabels: false,
      scaleanchor: 'x',
      scaleratio: 1,
      fixedrange: true,
    },
    margin: { l: 10, r: 10, t: 10, b: 10 },
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
          Unit 1 • Lesson 4
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Forces & Equilibrium in a Plane</h1>
      </div>

      {/* Learning Objectives Card */}
      <div className="objectives-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(37, 99, 235, 0.04) 100%)', border: '1px solid rgba(59, 130, 246, 0.18)', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Learning Objectives</span>
        </div>
        <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Formulate particle static equilibrium equations (<MathInline math="\sum F_x = 0" />, <MathInline math="\sum F_y = 0" />).</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Construct Free Body Diagrams (FBD) isolating a single joint node.</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Analyze how cable geometry impacts internal tension levels and structural safety.</li>
        </ul>
      </div>

      {/* Main Grid: Left Sandbox (7 cols), Right Sidecar (3 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)', gap: '24px' }}>
        {/* LEFT COLUMN: SANDBOX */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>Interactive Cable Tension & FBD Model</h3>

          {slidersLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <span>⚠️</span>
              <span><b>Controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {invalidConfig && (
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fee2e2', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.88rem', fontWeight: 'bold' }}>
              <span>💥</span>
              <span><b>EQUILIBRIUM IMPOSSIBLE!</b> Cable geometry is unstable or requires compression.</span>
            </div>
          )}

          {isOverload && (
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fee2e2', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.88rem', fontWeight: 'bold' }}>
              <span>💥</span>
              <span><b>CABLE OVERLOAD WARNING!</b> Tension exceeds 1200 N. Cable structure will snap!</span>
            </div>
          )}

          {/* Plotly Canvas */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', padding: '10px', marginBottom: '15px' }}>
            <Plot
              data={[...physTraces, divider, fbdRing]}
              layout={layout}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '350px' }}
              useResizeHandler={true}
            />
          </div>

          {/* Metric Cards Row */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: '3.5px solid #3b82f6', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tension Cable A (Ta)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: invalidConfig || isOverload ? '#ef4444' : '#3b82f6' }}>
                {invalidConfig ? 'Unstable' : `${Ta.toFixed(1)} N`}
              </div>
            </div>

            <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: '3.5px solid #10b981', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tension Cable B (Tb)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: invalidConfig || isOverload ? '#ef4444' : '#10b981' }}>
                {invalidConfig ? 'Unstable' : `${Tb.toFixed(1)} N`}
              </div>
            </div>

            <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: '3.5px solid #64748b', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Crate Weight (W)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#475569' }}>
                {W.toFixed(0)} N
              </div>
            </div>
          </div>

          {/* Sliders Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
            {/* 1. Crate Load */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                1. Crate Load
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px', color: '#475569' }}>
                <span>Weight, W</span>
                <span style={{ fontWeight: 600, color: '#3b82f6' }}>{W.toFixed(0)} N</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={W}
                disabled={slidersLocked}
                onChange={(e) => setW(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
              />
            </div>

            {/* 2. Cable A Angle */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                2. Cable A Angle
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px', color: '#475569' }}>
                <span>Angle, θ_A</span>
                <span style={{ fontWeight: 600, color: '#3b82f6' }}>{thetaA.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="85"
                step="1"
                value={thetaA}
                disabled={slidersLocked}
                onChange={(e) => setThetaA(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
              />
            </div>

            {/* 3. Cable B Angle */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                3. Cable B Angle
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px', color: '#475569' }}>
                <span>Angle, θ_B</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>{thetaB.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="85"
                step="1"
                value={thetaB}
                disabled={slidersLocked}
                onChange={(e) => setThetaB(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
              />
            </div>
          </div>

          {/* Live Equation Display */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#1e293b', borderLeft: '4px solid #3b82f6', lineHeight: 1.5 }}>
            <b>Equilibrium Formulation & Direct Solution:</b><br />
            ΣFx: -Ta · cos({thetaA.toFixed(0)}°) + Tb · cos({thetaB.toFixed(0)}°) = 0<br />
            ΣFy: Ta · sin({thetaA.toFixed(0)}°) + Tb · sin({thetaB.toFixed(0)}°) - {W.toFixed(0)} = 0<br />
            {invalidConfig ? (
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Static Equilibrium Impossible! Geometry does not support tension balance.</span>
            ) : (
              <span><b>Calculated:</b> Ta = <b>{Ta.toFixed(1)} N</b>, Tb = <b>{Tb.toFixed(1)} N</b></span>
            )}
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
                This widget demonstrates particle equilibrium of a concurrent coplanar cable system:
              </p>
              <MathBlock math="\sum F_x = 0 \quad \text{and} \quad \sum F_y = 0" />
              <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '12px', marginBottom: '16px' }}>
                <b>Key Layout Features:</b>
                <ul style={{ paddingLeft: '18px', marginTop: '6px' }}>
                  <li style={{ marginBottom: '4px' }}><b>Left View</b>: The physical setup showing cable anchors and crate weight <MathInline math="W" />.</li>
                  <li style={{ marginBottom: '4px' }}><b>Right View</b>: Free Body Diagram (FBD) isolating node forces.</li>
                  <li style={{ marginBottom: '4px' }}>Drag sliders for Weight <MathInline math="W" /> and Cable angles (<MathInline math="\theta_A, \theta_B" />).</li>
                  <li style={{ marginBottom: '4px' }}>Observe how cable tensions increase as weight increases or angles flatten.</li>
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
                Adjust sliders to set:<br />
                • <b>Weight, W</b>: <code>600 N</code><br />
                • <b>Cable A Angle, θ_A</b>: <code>45.0°</code><br />
                • <b>Cable B Angle, θ_B</b>: <code>45.0°</code>
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                What is the tension in each cable, and why?
              </p>

              {[
                'Ta = Tb = 300 N, because the weight is shared equally.',
                'Ta = Tb = 424.3 N, because the forces must balance both vertically and horizontally.',
                'Ta = Tb = 600 N, because each cable carries the full load.',
                'Ta = 600 N, Tb = 0 N, because the left cable is a pin.',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="peq_guided_radio"
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
                <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '12px', backgroundColor: guidedAnswer.includes('424.3 N') ? '#ecfdf5' : '#fef2f2', border: `1px solid ${guidedAnswer.includes('424.3 N') ? '#a7f3d0' : '#fecaca'}`, color: guidedAnswer.includes('424.3 N') ? '#065f46' : '#991b1b' }}>
                  {guidedAnswer.includes('424.3 N') ? (
                    <span>Correct! Since angles are symmetric, <MathInline math="T_A = T_B" />. By vertical equilibrium: <MathInline math="2 T \sin(45^\circ) = 600 \implies T = 600 / (2 \cdot 0.7071) = 424.3\text{ N}" />.</span>
                  ) : (
                    <span>Incorrect. Look at vertical balance: <MathInline math="T_A \sin(45^\circ) + T_B \sin(45^\circ) = 600" />. Since <MathInline math="T_A = T_B" />, we get <MathInline math="2 T \sin(45^\circ) = 600" />, solving to <MathInline math="T = 424.3\text{ N}" />.</span>
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
                Predict Phase (Controls Locked!):
              </p>
              <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '12px' }}>
                <b>Scenario:</b><br />
                • <b>Weight, W</b>: <code>500 N</code><br />
                • <b>Cable A Angle, θ_A</b>: <code>30.0°</code><br />
                • <b>Cable B Angle, θ_B</b>: <code>30.0°</code>
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                1. Predict tension in each cable.<br />
                2. Predict what happens to tension if you flatten both cables to <code>10.0°</code>:
              </p>

              {[
                'Ta = Tb = 500 N; at 10.0°, tensions increase to over 1400 N.',
                'Ta = Tb = 250 N; at 10.0°, tensions decrease to 100 N.',
                'Ta = Tb = 500 N; at 10.0°, tensions remain 500 N.',
                'Ta = Tb = 1000 N; at 10.0°, tensions increase to 2800 N.',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="peq_poe_p_radio"
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
                1. Set Weight to 500 N, angles <MathInline math="\theta_A = \theta_B = 30^\circ" />. Observe tensions.<br />
                2. Lower angles to 10.0°. Notice cable thickness scaling and red failure warning.
              </p>

              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Finalize your answer:
              </p>

              {[
                'Ta = Tb = 500 N; at 10.0°, tensions increase to over 1400 N.',
                'Ta = Tb = 250 N; at 10.0°, tensions decrease to 100 N.',
                'Ta = Tb = 500 N; at 10.0°, tensions remain 500 N.',
                'Ta = Tb = 1000 N; at 10.0°, tensions increase to 2800 N.',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="peq_poe_o_radio"
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

              {poeAnswer.includes('Ta = Tb = 500 N; at 10.0°') ? (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  🎉 <b>Correct!</b> Outstanding job.
                </div>
              ) : (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  ⚠️ <b>Incorrect.</b> Look at the physics math below.
                </div>
              )}

              <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: '#1e293b' }}>Explanation:</h5>
                <ol style={{ paddingLeft: '18px', margin: 0 }}>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Symmetric Case (30°):</b><br />
                    • <MathInline math="\sum F_y = 2 T \sin(30^\circ) - 500 = 0" /><br />
                    • Since <MathInline math="\sin(30^\circ) = 0.5" />, <MathInline math="2 T (0.5) = 500 \implies T_A = T_B = 500\text{ N}" />.
                  </li>
                  <li>
                    <b>Shallow Case (10°):</b><br />
                    • <MathInline math="\sum F_y = 2 T \sin(10^\circ) - 500 = 0" /><br />
                    • Since <MathInline math="\sin(10^\circ) \approx 0.1736" />, <MathInline math="T = 500 / (2 \cdot 0.1736) = 1439.7\text{ N}" />!<br />
                    • As angle approaches <MathInline math="0^\circ" />, tension approaches infinity to support vertical weight.
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

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

export default function MomentTorque() {
  // Phase state
  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState('');
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poeAnswer, setPoeAnswer] = useState('');

  // Sandbox state
  const [xp, setXp] = useState(30);
  const [yp, setYp] = useState(20);
  const [fMag, setFMag] = useState(50);
  const [thetaF, setThetaF] = useState(270);
  const [method, setMethod] = useState('d_perp'); // d_perp or component

  const slidersLocked = phase === 'poe_predict';

  const resetSimulator = () => {
    setPhase('instructions');
    setGuidedAnswer('');
    setGuidedSubmitted(false);
    setPoeAnswer('');
    setXp(30);
    setYp(20);
    setFMag(50);
    setThetaF(270);
    setMethod('d_perp');
  };

  // Calculations
  const radF = (thetaF * Math.PI) / 180;
  let Fx = fMag * Math.cos(radF);
  let Fy = fMag * Math.sin(radF);
  if (Math.abs(Fx) < 0.0001) Fx = 0;
  if (Math.abs(Fy) < 0.0001) Fy = 0;

  let Mo = xp * Fy - yp * Fx;
  if (Math.abs(Mo) < 0.0001) Mo = 0;

  let d = 0;
  if (fMag > 0) {
    d = Math.abs(Mo) / fMag;
  }

  const signText = Mo > 0 ? '(+ CCW)' : Mo < 0 ? '(- CW)' : '(Zero)';

  // Build Plotly Traces and Annotations
  const traces = [];

  // Mech Potato Spline
  const potatoX = [-45, -30, 0, 35, 55, 60, 45, 10, -20, -50, -45];
  const potatoY = [-20, 45, 55, 45, 20, -15, -45, -55, -40, -35, -20];

  traces.push({
    x: potatoX,
    y: potatoY,
    mode: 'lines',
    fill: 'toself',
    fillcolor: 'rgba(148, 163, 184, 0.11)',
    line: { color: 'rgba(148, 163, 184, 0.35)', width: 2.5, shape: 'spline' },
    showlegend: false,
    hoverinfo: 'skip',
  });

  // Pivot point O
  traces.push({
    x: [0],
    y: [0],
    mode: 'markers',
    marker: { size: 12, color: '#1e293b', symbol: 'square' },
    showlegend: false,
    hoverinfo: 'text',
    hovertext: 'Pivot Point O (Origin)',
  });

  // Force Application point P
  traces.push({
    x: [xp],
    y: [yp],
    mode: 'markers',
    marker: { size: 8, color: '#3b82f6', symbol: 'circle' },
    showlegend: false,
    hoverinfo: 'text',
    hovertext: `Point of Application P: (${xp.toFixed(0)}, ${yp.toFixed(0)}) m`,
  });

  const scale = 0.35;
  const fx_draw = Fx * scale;
  const fy_draw = Fy * scale;

  const annotations = [
    {
      x: 0,
      y: -5,
      text: 'O',
      font: { family: 'Outfit, sans-serif', size: 14, color: '#1e293b', weight: 'bold' },
      showarrow: false,
    },
    {
      x: xp,
      y: yp,
      text: 'P',
      font: { family: 'Outfit, sans-serif', size: 14, color: '#3b82f6', weight: 'bold' },
      showarrow: false,
      xshift: xp > 0 ? 10 : -10,
      yshift: yp > 0 ? 10 : -10,
    },
  ];

  // Overall Force Vector Arrow at P
  if (fMag > 0) {
    const isDperp = method === 'd_perp';
    annotations.push({
      ax: xp,
      ay: yp,
      x: xp + fx_draw,
      y: yp + fy_draw,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 3,
      arrowsize: 1.2,
      arrowwidth: 4.5,
      arrowcolor: isDperp ? '#ef4444' : 'rgba(239, 68, 68, 0.25)',
      text: '',
    });

    if (isDperp) {
      const midX = xp + fx_draw / 2;
      const midY = yp + fy_draw / 2;
      const len = Math.sqrt(fx_draw * fx_draw + fy_draw * fy_draw);
      let px = 0, py = 0;
      if (len > 0) {
        px = -fy_draw / len;
        py = fx_draw / len;
      }
      annotations.push({
        x: midX + px * 8,
        y: midY + py * 8,
        xref: 'x',
        yref: 'y',
        showarrow: false,
        text: `F = ${fMag.toFixed(0)} N`,
        font: { family: 'Outfit, sans-serif', size: 12, color: '#ef4444', weight: 'bold' },
      });
    }
  }

  if (method === 'd_perp') {
    if (fMag > 0) {
      const dx = Fx / fMag;
      const dy = Fy / fMag;
      traces.push({
        x: [xp - dx * 120, xp + dx * 120],
        y: [yp - dy * 120, yp + dy * 120],
        mode: 'lines',
        line: { color: '#94a3b8', width: 1.5, dash: 'dash' },
        showlegend: false,
        hoverinfo: 'skip',
      });

      const t = (xp * Fx + yp * Fy) / (fMag * fMag);
      const qx = xp - t * Fx;
      const qy = yp - t * Fy;

      traces.push({
        x: [0, qx],
        y: [0, qy],
        mode: 'lines',
        line: { color: '#22c55e', width: 3.5 },
        hoverinfo: 'text',
        hovertext: `Lever Arm d_perp = ${d.toFixed(2)} m`,
      });

      if (d > 2) {
        const px_size = 2.5;
        const ux = Fx / fMag;
        const uy = Fy / fMag;
        let nx = -uy;
        let ny = ux;
        if (xp * nx + yp * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
        traces.push({
          x: [qx, qx + nx * px_size, qx + nx * px_size - ux * px_size, qx - ux * px_size, qx],
          y: [qy, qy + ny * px_size, qy + ny * px_size - uy * px_size, qy - uy * px_size, qy],
          mode: 'lines',
          line: { color: '#16a34a', width: 1.5 },
          fill: 'toself',
          fillcolor: 'rgba(34, 197, 94, 0.15)',
          showlegend: false,
          hoverinfo: 'skip',
        });
      }

      annotations.push({
        x: qx / 2,
        y: qy / 2,
        text: `d<sub>⊥</sub> = ${d.toFixed(1)}m`,
        font: { family: 'Outfit, sans-serif', size: 11, color: '#16a34a', weight: 'bold' },
        showarrow: false,
        xshift: qy > qx ? 25 : -25,
      });
    }
  } else {
    if (Fx !== 0) {
      annotations.push({
        ax: xp,
        ay: yp,
        x: xp + fx_draw,
        y: yp,
        xref: 'x',
        yref: 'y',
        axref: 'x',
        ayref: 'y',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 3.5,
        arrowcolor: '#ec4899',
        text: '',
      });
      annotations.push({
        x: xp + fx_draw / 2,
        y: yp,
        xref: 'x',
        yref: 'y',
        showarrow: false,
        text: `Fx = ${Fx.toFixed(0)} N`,
        font: { family: 'Outfit, sans-serif', size: 11, color: '#ec4899', weight: 'bold' },
        yshift: 12,
      });

      traces.push({
        x: [xp, xp],
        y: [0, yp],
        mode: 'lines',
        line: { color: '#22c55e', width: 2, dash: 'dot' },
        showlegend: false,
        hoverinfo: 'skip',
      });

      if (yp !== 0) {
        annotations.push({
          x: xp,
          y: yp / 2,
          text: `|y<sub>p</sub>| = ${Math.abs(yp).toFixed(0)}m`,
          font: { family: 'Outfit, sans-serif', size: 11, color: '#16a34a', weight: 'bold' },
          showarrow: false,
          xshift: xp >= 0 ? 35 : -35,
        });
      }
    }

    if (Fy !== 0) {
      annotations.push({
        ax: xp,
        ay: yp,
        x: xp,
        y: yp + fy_draw,
        xref: 'x',
        yref: 'y',
        axref: 'x',
        ayref: 'y',
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 3.5,
        arrowcolor: '#06b6d4',
        text: '',
      });
      annotations.push({
        x: xp,
        y: yp + fy_draw / 2,
        xref: 'x',
        yref: 'y',
        showarrow: false,
        text: `Fy = ${Fy.toFixed(0)} N`,
        font: { family: 'Outfit, sans-serif', size: 11, color: '#06b6d4', weight: 'bold' },
        xshift: 30,
      });

      traces.push({
        x: [0, xp],
        y: [yp, yp],
        mode: 'lines',
        line: { color: '#22c55e', width: 2, dash: 'dot' },
        showlegend: false,
        hoverinfo: 'skip',
      });

      if (xp !== 0) {
        annotations.push({
          x: xp / 2,
          y: yp,
          text: `|x<sub>p</sub>| = ${Math.abs(xp).toFixed(0)}m`,
          font: { family: 'Outfit, sans-serif', size: 11, color: '#16a34a', weight: 'bold' },
          showarrow: false,
          yshift: yp >= 0 ? 15 : -15,
        });
      }
    }
  }

  // Moment rotation arc near O
  if (Mo !== 0) {
    const radius_arc = 8 + Math.min(22, Math.abs(Mo) / 100);
    const num_points = 30;
    let start_ang = (-30 * Math.PI) / 180;
    let end_ang = (210 * Math.PI) / 180;
    if (Mo < 0) {
      start_ang = (210 * Math.PI) / 180;
      end_ang = (-30 * Math.PI) / 180;
    }

    const arcX = [];
    const arcY = [];
    for (let i = 0; i <= num_points; i++) {
      const a = start_ang + (end_ang - start_ang) * (i / num_points);
      arcX.push(radius_arc * Math.cos(a));
      arcY.push(radius_arc * Math.sin(a));
    }

    traces.push({
      x: arcX,
      y: arcY,
      mode: 'lines',
      line: { color: Mo > 0 ? '#a855f7' : '#f97316', width: 3.5 },
      showlegend: false,
      hoverinfo: 'skip',
    });

    const end_x = radius_arc * Math.cos(end_ang);
    const end_y = radius_arc * Math.sin(end_ang);
    const dir = Mo > 0 ? 1.0 : -1.0;
    const tx = dir * -Math.sin(end_ang);
    const ty = dir * Math.cos(end_ang);

    const arrow_len = 6.0;
    const tail_x = end_x - arrow_len * tx;
    const tail_y = end_y - arrow_len * ty;

    annotations.push({
      ax: tail_x,
      ay: tail_y,
      x: end_x,
      y: end_y,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1.2,
      arrowwidth: 3.5,
      arrowcolor: Mo > 0 ? '#a855f7' : '#f97316',
      text: '',
    });

    annotations.push({
      x: end_x,
      y: end_y,
      xref: 'x',
      yref: 'y',
      showarrow: false,
      text: Mo > 0 ? 'Mo (+ CCW)' : 'Mo (- CW)',
      font: { family: 'Outfit, sans-serif', size: 10, color: Mo > 0 ? '#a855f7' : '#f97316', weight: 'bold' },
      xshift: end_x > 0 ? 30 : -30,
      yshift: end_y > 0 ? 15 : -15,
    });
  }

  const layout = {
    xaxis: {
      range: [-70, 70],
      zeroline: true,
      zerolinecolor: '#cbd5e1',
      gridcolor: '#f1f5f9',
      fixedrange: true,
      title: 'X Position (m)',
    },
    yaxis: {
      range: [-70, 70],
      zeroline: true,
      zerolinecolor: '#cbd5e1',
      gridcolor: '#f1f5f9',
      fixedrange: true,
      scaleanchor: 'x',
      scaleratio: 1,
      title: 'Y Position (m)',
    },
    margin: { l: 45, r: 15, t: 15, b: 45 },
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
          Unit 1 • Lesson 6
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Forces and Moments</h1>
      </div>

      {/* Learning Objectives Card */}
      <div className="objectives-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(37, 99, 235, 0.04) 100%)', border: '1px solid rgba(59, 130, 246, 0.18)', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Learning Objectives</span>
        </div>
        <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Calculate the moment of a force about a point using perpendicular distance (<MathInline math="M_O = F \cdot d_\perp" />).</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Apply Varignon's theorem and component method (<MathInline math="M_O = r_x F_y - r_y F_x" />).</li>
          <li style={{ marginBottom: '8px', fontSize: '0.92rem', color: '#64748b' }}>Determine rotational sense (CCW positive +, CW negative -).</li>
        </ul>
      </div>

      {/* Main Grid: Left Sandbox (7 cols), Right Sidecar (3 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)', gap: '24px' }}>
        {/* LEFT COLUMN: SANDBOX */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>Interactive Moment & Torque Sandbox</h3>

          {slidersLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <span>⚠️</span>
              <span><b>Moment controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Chart Container */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', padding: '10px', marginBottom: '15px' }}>
            <Plot
              data={traces}
              layout={layout}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '330px' }}
              useResizeHandler={true}
            />
          </div>

          {/* Toggle Selector for Calculation Method */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', marginBottom: '15px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Moment Method:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={slidersLocked}
                onClick={() => setMethod('d_perp')}
                style={{ padding: '6px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, backgroundColor: method === 'd_perp' ? 'rgba(239, 68, 68, 0.05)' : '#ffffff', color: method === 'd_perp' ? '#ef4444' : '#475569', borderColor: method === 'd_perp' ? '#ef4444' : '#cbd5e1' }}
              >
                d<sub>⊥</sub> Method
              </button>
              <button
                disabled={slidersLocked}
                onClick={() => setMethod('component')}
                style={{ padding: '6px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', cursor: slidersLocked ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, backgroundColor: method === 'component' ? 'rgba(239, 68, 68, 0.05)' : '#ffffff', color: method === 'component' ? '#ef4444' : '#475569', borderColor: method === 'component' ? '#ef4444' : '#cbd5e1' }}
              >
                Component Method
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: '3.5px solid #22c55e', borderRadius: '8px', padding: '8px', textAlign: 'center', opacity: method === 'd_perp' ? 1 : 0.45 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Perpendicular distance (d<sub>⊥</sub>)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#22c55e' }}>{d.toFixed(1)} m</div>
            </div>

            <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: '3.5px solid #ef4444', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Force (F)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ef4444' }}>{fMag.toFixed(1)} N</div>
            </div>

            <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: '3.5px solid #a855f7', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Moment (Mo)</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#a855f7' }}>{Mo.toFixed(1)} N-m</div>
            </div>
          </div>

          {/* Controls Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '15px' }}>
            {/* 1. Force Point of Application */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderLeft: '4px solid #3b82f6', borderRadius: '12px', padding: '12px', opacity: method === 'd_perp' ? 0.65 : 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                1. Force Point of Application
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>x-coordinate, x_p</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{xp.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={xp}
                  disabled={slidersLocked}
                  onChange={(e) => setXp(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>y-coordinate, y_p</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{yp.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="5"
                  value={yp}
                  disabled={slidersLocked}
                  onChange={(e) => setYp(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
            </div>

            {/* 2. Force Definition */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(128,128,128,0.15)', borderLeft: '4px solid #ef4444', borderRadius: '12px', padding: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                2. Force Definition
              </div>
              <div style={{ marginBottom: '8px', opacity: method === 'component' ? 0.65 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Force Magnitude, F</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>{fMag.toFixed(1)} N</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={fMag}
                  disabled={slidersLocked}
                  onChange={(e) => setFMag(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
              <div style={{ opacity: method === 'component' ? 0.65 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: '#475569' }}>
                  <span>Angle, θ</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>{thetaF.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={thetaF}
                  disabled={slidersLocked}
                  onChange={(e) => setThetaF(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: slidersLocked ? 'not-allowed' : 'pointer' }}
                />
              </div>
              <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: '#475569', textAlign: 'center', borderTop: '1px dashed rgba(128,128,128,0.15)', paddingTop: '6px', opacity: method === 'd_perp' ? 0.65 : 1 }}>
                Fx = {Fx.toFixed(1)} N | Fy = {Fy.toFixed(1)} N
              </div>
            </div>
          </div>

          {/* Live Equation Display */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#1e293b', borderLeft: '4px solid #ef4444', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ opacity: method === 'd_perp' ? 1 : 0.4 }}>
              <b>Perpendicular Distance Method:</b><br />
              Mo = ± F · d<sub>⊥</sub><br />
              Mo = {Mo < 0 ? '-' : Mo > 0 ? '+' : ''} ({fMag.toFixed(0)} N) · ({d.toFixed(1)} m)<br />
              Mo = <b>{Mo.toFixed(1)} N-m</b> {signText}
            </div>
            <div style={{ opacity: method === 'component' ? 1 : 0.4 }}>
              <b>Component Method:</b><br />
              Mo = rx · Fy - ry · Fx<br />
              Mo = ({xp.toFixed(0)})·({Fy.toFixed(0)}) - ({yp.toFixed(0)})·({Fx.toFixed(0)})<br />
              Mo = <b>{Mo.toFixed(1)} N-m</b> {signText}
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
                A <b>moment</b> represents the measure of a force's tendency to cause a body to rotate about a specific pivot point.
              </p>
              <div style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
                <b>Key Mechanics:</b>
                <ul style={{ paddingLeft: '18px', marginTop: '6px' }}>
                  <li style={{ marginBottom: '4px' }}>Drag <b>Force Point of Application</b> sliders to position <MathInline math="P(x_p, y_p)" />.</li>
                  <li style={{ marginBottom: '4px' }}>Drag <b>Force Definition</b> sliders for force magnitude <MathInline math="F" /> and angle <MathInline math="\theta" />.</li>
                  <li style={{ marginBottom: '4px' }}>Toggle between <MathInline math="d_\perp" /> method and Component method.</li>
                  <li style={{ marginBottom: '4px' }}>Observe the purple/orange arc arrow indicating moment magnitude and rotation sense (CCW +, CW -).</li>
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
                Set sliders to:<br />
                • <b>x-coordinate, x_p</b>: <code>-40.0 m</code><br />
                • <b>y-coordinate, y_p</b>: <code>20.0 m</code><br />
                • <b>Force Magnitude, F</b>: <code>80.0 N</code><br />
                • <b>Angle, θ</b>: <code>0.0°</code> (<MathInline math="F_x = 80\text{ N}, F_y = 0\text{ N}" />)
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                What is the perpendicular lever arm distance <MathInline math="d" /> and moment <MathInline math="M_O" /> about origin?
              </p>

              {[
                'd = 40.0 m, Mo = +3200 N-m (Counterclockwise)',
                'd = 20.0 m, Mo = -1600 N-m (Clockwise)',
                'd = 20.0 m, Mo = +1600 N-m (Counterclockwise)',
                'd = 44.7 m, Mo = -3200 N-m (Clockwise)',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vmom_guided_radio"
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
                <div style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '12px', backgroundColor: guidedAnswer.includes('-1600 N-m') ? '#ecfdf5' : '#fef2f2', border: `1px solid ${guidedAnswer.includes('-1600 N-m') ? '#a7f3d0' : '#fecaca'}`, color: guidedAnswer.includes('-1600 N-m') ? '#065f46' : '#991b1b' }}>
                  {guidedAnswer.includes('-1600 N-m') ? (
                    <span>Correct! Line of action is horizontal at <MathInline math="y=20\text{ m}" />. Perpendicular distance is <MathInline math="d=20\text{ m}" />. Force pulls right (+80 N), creating clockwise rotation: <MathInline math="M_O = -80 \cdot 20 = -1600\text{ N-m}" />. Vector: <MathInline math="r_x F_y - r_y F_x = -40(0) - 20(80) = -1600\text{ N-m}" />.</span>
                  ) : (
                    <span>Incorrect. Line of action is horizontal along <MathInline math="y=20" />. Perpendicular distance to origin is <MathInline math="d=20\text{ m}" />. A force pushing right at <MathInline math="y=20" /> rotates clockwise: <MathInline math="M_O = -1600\text{ N-m}" />.</span>
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
                Predict Phase (Moment Controls Locked!):
              </p>
              <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '12px' }}>
                <b>Scenario:</b><br />
                • <b>Force Position</b>: <MathInline math="P(30.0, 20.0)\text{ m}" /> (Q1)<br />
                • <b>Force Vector</b>: <MathInline math="\vec{F} = (0, -50.0)\text{ N}" /> (pointing down)
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Without unlocking controls, predict perpendicular distance <MathInline math="d" /> and moment <MathInline math="M_O" />:
              </p>

              {[
                'd = 30.0 m; Mo = -1500 N-m (Clockwise)',
                'd = 20.0 m; Mo = -1000 N-m (Clockwise)',
                'd = 30.0 m; Mo = +1500 N-m (Counterclockwise)',
                'd = 36.1 m; Mo = -1800 N-m (Clockwise)',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vmom_poe_p_radio"
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
                1. Set <b>x_p</b> to 30.0 m, <b>y_p</b> to 20.0 m.<br />
                2. Set <b>Force F</b> to 50.0 N, <b>Angle θ</b> to 270.0°.<br />
                3. Inspect perpendicular distance and moment rotation direction.
              </p>

              <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                Finalize your answer:
              </p>

              {[
                'd = 30.0 m; Mo = -1500 N-m (Clockwise)',
                'd = 20.0 m; Mo = -1000 N-m (Clockwise)',
                'd = 30.0 m; Mo = +1500 N-m (Counterclockwise)',
                'd = 36.1 m; Mo = -1800 N-m (Clockwise)',
              ].map((opt) => (
                <label key={opt} style={{ display: 'block', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', marginBottom: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="vmom_poe_o_radio"
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

              {poeAnswer === 'd = 30.0 m; Mo = -1500 N-m (Clockwise)' ? (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  🎉 <b>Correct!</b> Great job.
                </div>
              ) : (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', borderRadius: '8px', padding: '10px', marginBottom: '12px', fontSize: '0.88rem' }}>
                  ⚠️ <b>Incorrect.</b> Look at the calculations below.
                </div>
              )}

              <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                <h5 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: '#1e293b' }}>Explanation:</h5>
                <ol style={{ paddingLeft: '18px', margin: 0 }}>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Line of Action:</b> Since <MathInline math="\vec{F} = (0, -50)\text{ N}" />, the line of action is vertical through <MathInline math="x = 30\text{ m}" />. Perpendicular distance from origin is <MathInline math="d = 30\text{ m}" />.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <b>Rotational Sense:</b> Downward force on right side of origin rotates <b>clockwise</b> (negative moment).
                  </li>
                  <li>
                    <b>Scalar & Vector Calculations:</b><br />
                    • <MathInline math="M_O = -F \cdot d = -50 \cdot 30 = -1500\text{ N-m}" /><br />
                    • <MathInline math="\vec{M}_O = (r_x F_y - r_y F_x)\hat{k} = [30(-50) - 20(0)]\hat{k} = -1500\hat{k}\text{ N-m}" />.
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

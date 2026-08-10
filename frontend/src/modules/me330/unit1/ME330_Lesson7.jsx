import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathInline({ math }) {
  if (!math) return null;
  try {
    const k = katex?.default || katex;
    const html = k.renderToString(math, { throwOnError: false });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e) {
    return <span>{math}</span>;
  }
}

function MathBlock({ math }) {
  if (!math) return null;
  try {
    const k = katex?.default || katex;
    const html = k.renderToString(math, { displayMode: true, throwOnError: false });
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e) {
    return <div>{math}</div>;
  }
}

export default function ME330_Lesson7({ topicName, onComplete }) {
  const [phase, setPhase] = useState('instructions');
  const [poeChoice, setPoeChoice] = useState(null);

  // Controls
  const [loadKN, setLoadKN] = useState(50); // kN
  const [plateWidthMM, setPlateWidthMM] = useState(100); // mm
  const [holeDiameterMM, setHoleDiameterMM] = useState(20); // mm
  const [thicknessMM, setThicknessMM] = useState(10); // mm

  // Calculations
  const P = loadKN * 1000;
  const w = plateWidthMM / 1000;
  const d = Math.min(holeDiameterMM, plateWidthMM - 10) / 1000;
  const t = thicknessMM / 1000;

  const ratio = d / w; // d / w

  // Empirical Kt formula for hole in flat plate under tension
  const Kt = 3.0 - 3.13 * ratio + 3.66 * (ratio * ratio) - 1.53 * (ratio * ratio * ratio);

  // Net Area and Stresses
  const Anet = (w - d) * t;
  const sigmaNomMPa = (P / Anet) / 1e6;
  const sigmaMaxMPa = Kt * sigmaNomMPa;

  // Plot 1: Kt Curve vs d/w ratio
  const ratioList = [];
  const ktList = [];
  for (let r = 0.05; r <= 0.75; r += 0.02) {
    ratioList.push(r);
    ktList.push(3.0 - 3.13 * r + 3.66 * r * r - 1.53 * r * r * r);
  }

  const ktTrace = [
    {
      x: ratioList,
      y: ktList,
      type: 'scatter',
      mode: 'lines',
      name: 'K_t Curve',
      line: { color: '#3b82f6', width: 3 }
    },
    {
      x: [ratio],
      y: [Kt],
      type: 'scatter',
      mode: 'markers+text',
      name: 'Current Geometry',
      text: [`K_t = ${Kt.toFixed(2)}`],
      textposition: 'top right',
      marker: { color: '#ef4444', size: 12 }
    }
  ];

  const layoutKt = {
    title: { text: 'Stress Concentration Factor K_t vs (d/w)', font: { color: '#f3f4f6', size: 14 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    xaxis: { title: 'Hole to Width Ratio (d/w)', color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'K_t', color: '#9ca3af', gridcolor: '#374151', range: [1.5, 3.2] },
    margin: { l: 50, r: 30, t: 40, b: 40 }
  };

  // Plot 2: Transverse Stress Distribution across Net Section y in [-w/2, w/2]
  const yVals = [];
  const stressVals = [];
  const r_hole = d / 2;
  const w_half = w / 2;
  const nPoints = 100;

  for (let i = 0; i <= nPoints; i++) {
    const y = -w_half + (i / nPoints) * w;
    if (Math.abs(y) < r_hole) {
      yVals.push(y * 1000);
      stressVals.push(null); // Inside hole
    } else {
      // Analytical elasticity profile approximation for hole in plate
      const distRatio = r_hole / Math.abs(y);
      const s = sigmaNomMPa * (1 + 0.5 * Math.pow(distRatio, 2) + 1.5 * Math.pow(distRatio, 4));
      yVals.push(y * 1000);
      stressVals.push(s);
    }
  }

  const stressDistTrace = [
    {
      x: yVals,
      y: stressVals,
      type: 'scatter',
      mode: 'lines',
      name: 'Stress Distribution \\sigma_x(y)',
      line: { color: '#a78bfa', width: 3 },
      fill: 'tozeroy',
      fillcolor: 'rgba(167, 139, 250, 0.2)'
    }
  ];

  const layoutStressDist = {
    title: { text: 'Net-Section Stress Distribution \\sigma_x(y)', font: { color: '#f3f4f6', size: 14 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    xaxis: { title: 'Transverse Position y (mm)', color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'Normal Stress (MPa)', color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 40 }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
              ME 330 • UNIT 1 • LESSON 7
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#ffffff' }}>
              St. Venant's Principle & Stress Concentration Factors
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPhase('instructions')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase === 'instructions' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              Interactive Plate Lab
            </button>
            <button
              onClick={() => setPhase('poe_predict')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase.startsWith('poe') ? '#7c3aed' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              POE Challenge
            </button>
          </div>
        </div>
      </div>

      {phase === 'instructions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
          {/* Controls */}
          <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#60a5fa' }}>
              Plate & Hole Geometry
            </h2>

            {/* Force */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Tensile Force P (kN)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{loadKN} kN</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={loadKN}
                onChange={(e) => setLoadKN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Width */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Plate Width w (mm)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{plateWidthMM} mm</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={plateWidthMM}
                onChange={(e) => setPlateWidthMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Hole Diameter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Hole Diameter d (mm)</label>
                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{holeDiameterMM} mm</span>
              </div>
              <input
                type="range"
                min="2"
                max={plateWidthMM - 15}
                value={holeDiameterMM}
                onChange={(e) => setHoleDiameterMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>

            {/* Thickness */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Thickness t (mm)</label>
                <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{thicknessMM} mm</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={thicknessMM}
                onChange={(e) => setThicknessMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Kt Formula Card */}
            <div style={{ backgroundColor: '#1f2937', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Stress Concentration Definition</div>
              <MathBlock math="\sigma_{max} = K_t \cdot \sigma_{nom}" />
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Concentration Factor K_t</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444', margin: '4px 0' }}>
                  {Kt.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>d/w = {ratio.toFixed(2)}</div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Nominal Stress \sigma_{nom}</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#3b82f6', margin: '4px 0' }}>
                  {sigmaNomMPa.toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="P / A_{net}" /></div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Peak Stress \sigma_{max}</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f472b6', margin: '4px 0' }}>
                  {sigmaMaxMPa.toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>At hole boundary</div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>St. Venant Smoothing Dist</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#34d399', margin: '4px 0' }}>
                  x \ge {plateWidthMM} <span style={{ fontSize: '14px' }}>mm</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Uniform stress region</div>
              </div>
            </div>

            {/* Plots */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={ktTrace} layout={layoutKt} config={{ responsive: true }} style={{ width: '100%', height: '300px' }} />
              </div>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={stressDistTrace} layout={layoutStressDist} config={{ responsive: true }} style={{ width: '100%', height: '300px' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POE Challenge */}
      {phase.startsWith('poe') && (
        <div style={{ backgroundColor: '#111827', padding: '28px', borderRadius: '12px', border: '1px solid #374151', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '16px' }}>
            POE Challenge: The Tiny Hole Paradox in Elasticity
          </h2>

          <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
              <strong>Scenario:</strong> Consider a flat wide tension plate. As the hole diameter <MathInline math="d" /> becomes smaller and smaller (<MathInline math="d/w \to 0" />, approaching a microscopic pinhole):
            </p>
          </div>

          {phase === 'poe_predict' && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '14px' }}>
                Question: What value does the stress concentration factor <MathInline math="K_t" /> approach as <MathInline math="d/w \to 0" />?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'A', text: 'K_t \to 1.0 (Since the hole is tiny, it has virtually zero effect on stress).' },
                  { id: 'B', text: 'K_t \to 3.0 (According to elasticity theory, a circular hole amplifies peak stress by a factor of 3 regardless of hole radius!).' },
                  { id: 'C', text: 'K_t \to \infty (The stress at a sharp pinhole becomes infinitely high).' },
                  { id: 'D', text: 'K_t \to 0.0 (Stress drops to zero near small holes).' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPoeChoice(opt.id)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: '8px',
                      backgroundColor: poeChoice === opt.id ? '#3b82f6' : '#1f2937',
                      color: '#fff',
                      border: `1px solid ${poeChoice === opt.id ? '#60a5fa' : '#374151'}`,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <strong>({opt.id})</strong> {opt.text}
                  </button>
                ))}
              </div>

              <button onClick={() => setPhase('poe_observe')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
                Observe Results
              </button>
            </div>
          )}

          {phase === 'poe_observe' && (
            <div>
              <div style={{ backgroundColor: '#064e3b', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #10b981' }}>
                <h4 style={{ margin: 0, color: '#34d399', fontSize: '16px' }}>Observation Results</h4>
                <div style={{ marginTop: '12px', fontSize: '15px' }}>
                  <div>At d/w = 0.50 \implies K_t = 2.16</div>
                  <div>At d/w = 0.20 \implies K_t = 2.51</div>
                  <div>At d/w = 0.05 \implies K_t = 2.85</div>
                  <div style={{ color: '#34d399', fontWeight: 'bold', marginTop: '8px' }}>As d/w \to 0 \implies K_t \to 3.00 !</div>
                </div>
              </div>

              <button onClick={() => setPhase('poe_explain')} style={{ padding: '10px 24px', backgroundColor: '#059669', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
                View Explanation
              </button>
            </div>
          )}

          {phase === 'poe_explain' && (
            <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: poeChoice === 'B' ? '#34d399' : '#f87171', marginTop: 0 }}>
                {poeChoice === 'B' ? '✓ Correct! (B)' : 'Incorrect. Correct Answer is (B)'}
              </h4>
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                This is the famous <strong>Kirsch Solution</strong> in theory of elasticity:
              </p>
              <MathBlock math="\sigma_{\theta\theta}(r, \theta = \pi/2) = \sigma_{\infty} \left( 1 + \frac{1}{2} \frac{a^2}{r^2} + \frac{3}{4} \frac{a^4}{r^4} \right) \xrightarrow{r = a} 3 \sigma_{\infty}" />
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                No matter how small a circular hole is, the boundary condition disrupts the load flow lines and causes peak stress at the hole edge to equal <strong>3 times the nominal stress</strong>! (However, for extremely small holes, the volume of material affected by this peak stress is very tiny, which is why brittle materials may tolerate small flaws).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

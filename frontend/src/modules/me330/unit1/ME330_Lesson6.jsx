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

export default function ME330_Lesson6() {
  const [phase, setPhase] = useState('instructions');
  const [poeChoice, setPoeChoice] = useState(null);

  // Controls
  const [sigmaX, setSigmaX] = useState(120); // MPa
  const [sigmaY, setSigmaY] = useState(-40); // MPa
  const [sigmaZ, setSigmaZ] = useState(0); // MPa
  const [modulusGPa, setModulusGPa] = useState(200); // GPa
  const [poissonNu, setPoissonNu] = useState(0.30);

  // Calculations
  const E_pa = modulusGPa * 1e9;
  const sx = sigmaX * 1e6;
  const sy = sigmaY * 1e6;
  const sz = sigmaZ * 1e6;

  // Strains
  const ex = (sx - poissonNu * (sy + sz)) / E_pa;
  const ey = (sy - poissonNu * (sx + sz)) / E_pa;
  const ez = (sz - poissonNu * (sx + sy)) / E_pa;

  // Dilatation e = delta V / V0
  const e_vol = ex + ey + ez;

  // Bulk Modulus K
  const denomK = 3 * (1 - 2 * poissonNu);
  const bulkModulusGPa = denomK > 0.001 ? modulusGPa / denomK : Infinity;

  // Plotly Bar Chart Data
  const strainPlotTraces = [
    {
      x: ['\\epsilon_x (X-Strain)', '\\epsilon_y (Y-Strain)', '\\epsilon_z (Z-Strain)', 'e (Volumetric Strain)'],
      y: [ex * 1000, ey * 1000, ez * 1000, e_vol * 1000],
      type: 'bar',
      marker: { color: ['#3b82f6', '#10b981', '#a78bfa', '#f472b6'] }
    }
  ];

  const plotLayout = {
    title: { text: 'Normal Strains (\\times 10^{-3} m/m)', font: { color: '#f3f4f6', size: 15 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    xaxis: { color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'Strain (mm/m)', color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 50 }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
              ME 330 • UNIT 1 • LESSON 6
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#ffffff' }}>
              Generalized Hooke's Law & Dilatation
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPhase('instructions')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase === 'instructions' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              Multiaxial Lab
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
              Multiaxial Stress Inputs
            </h2>

            {/* Sigma X */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Normal Stress \sigma_x (MPa)</label>
                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{sigmaX} MPa</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                value={sigmaX}
                onChange={(e) => setSigmaX(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Sigma Y */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Normal Stress \sigma_y (MPa)</label>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{sigmaY} MPa</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                value={sigmaY}
                onChange={(e) => setSigmaY(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Sigma Z */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Normal Stress \sigma_z (MPa)</label>
                <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{sigmaZ} MPa</span>
              </div>
              <input
                type="range"
                min="-200"
                max="200"
                value={sigmaZ}
                onChange={(e) => setSigmaZ(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Poisson Ratio nu */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Poisson's Ratio \nu</label>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{poissonNu.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.495"
                step="0.005"
                value={poissonNu}
                onChange={(e) => setPoissonNu(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Bulk Modulus Card */}
            <div style={{ backgroundColor: '#1f2937', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Bulk Modulus K</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f472b6', marginTop: '2px' }}>
                K = {isFinite(bulkModulusGPa) ? `${bulkModulusGPa.toFixed(1)} GPa` : '∞ (Incompressible)'}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Strains Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Strain \epsilon_x</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', margin: '4px 0' }}>
                  {(ex * 1000).toFixed(3)} <span style={{ fontSize: '12px' }}>\times 10^{-3}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="\epsilon_x = \frac{\sigma_x - \nu(\sigma_y + \sigma_z)}{E}" /></div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Strain \epsilon_y</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', margin: '4px 0' }}>
                  {(ey * 1000).toFixed(3)} <span style={{ fontSize: '12px' }}>\times 10^{-3}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="\epsilon_y = \frac{\sigma_y - \nu(\sigma_x + \sigma_z)}{E}" /></div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Strain \epsilon_z</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a78bfa', margin: '4px 0' }}>
                  {(ez * 1000).toFixed(3)} <span style={{ fontSize: '12px' }}>\times 10^{-3}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="\epsilon_z = \frac{\sigma_z - \nu(\sigma_x + \sigma_y)}{E}" /></div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Dilatation e = \Delta V/V_0</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f472b6', margin: '4px 0' }}>
                  {(e_vol * 1000).toFixed(3)} <span style={{ fontSize: '12px' }}>\times 10^{-3}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="e = \epsilon_x + \epsilon_y + \epsilon_z" /></div>
              </div>
            </div>

            {/* Graphics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={strainPlotTraces} layout={plotLayout} config={{ responsive: true }} style={{ width: '100%', height: '320px' }} />
              </div>

              {/* Stress Element Canvas */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>Deformed Stress Cube Representation</h3>
                <svg width="280" height="260" style={{ backgroundColor: '#0f172a', borderRadius: '8px' }}>
                  {/* Original Square Element */}
                  <rect x="70" y="60" width="140" height="140" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="75" y="55" fill="#64748b" fontSize="11">Original (1x1)</text>

                  {/* Deformed Element (scale strain visually) */}
                  <rect
                    x={70 - (ex * 1000 * 5)}
                    y={60 - (ey * 1000 * 5)}
                    width={140 + (ex * 1000 * 10)}
                    height={140 + (ey * 1000 * 10)}
                    fill="rgba(59, 130, 246, 0.25)"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    rx="3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POE Challenge */}
      {phase.startsWith('poe') && (
        <div style={{ backgroundColor: '#111827', padding: '28px', borderRadius: '12px', border: '1px solid #374151', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '16px' }}>
            POE Challenge: Hydrostatic Volumetric Compression of Rubber vs Steel
          </h2>

          <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
              <strong>Scenario:</strong> A rubber block (<MathInline math="\nu \approx 0.499" />, <MathInline math="E = 0.05\text{ GPa}" />) and a steel block (<MathInline math="\nu = 0.30" />, <MathInline math="E = 200\text{ GPa}" />) are submerged deep under hydrostatic water pressure <MathInline math="p = 100\text{ MPa}" /> (<MathInline math="\sigma_x = \sigma_y = \sigma_z = -100\text{ MPa}" />).
            </p>
          </div>

          {phase === 'poe_predict' && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '14px' }}>
                Question: Which material experiences larger volumetric compression (dilatation <MathInline math="|e|" />)?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'A', text: 'Rubber shrinks much more in volume because its Young’s modulus E is so soft.' },
                  { id: 'B', text: 'Steel undergoes significantly greater volume contraction |e| because rubber is virtually incompressible (\nu \to 0.5).' },
                  { id: 'C', text: 'Both contract by the exact same volume ratio under uniform pressure.' }
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
                  <div>Rubber Dilatation e_{rubber} = \frac{1-2(0.499)}{0.05} (-300) = -0.012 \times 10^{-3} (Nearly 0!)</div>
                  <div>Steel Dilatation e_{steel} = \frac{1-2(0.30)}{200} (-300) = -0.600 \times 10^{-3} (50x larger volumetric compression!)</div>
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
                As Poisson's ratio <MathInline math="\nu \to 0.5" />, the bulk modulus <MathInline math="K = \frac{E}{3(1-2\nu)} \to \infty" />!
              </p>
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                Rubber is an <strong>incompressible material</strong> under uniform hydrostatic pressure. Even though rubber is extremely soft in uniaxial tension, under hydrostatic pressure it refuses to shrink in volume! Steel actually loses significantly more volume!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

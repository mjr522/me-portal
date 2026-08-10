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

const TORSION_MATS = {
  steel: { name: 'Structural Steel', G: 77.2, G_pa: 77.2e9, tau_yield: 145, color: '#3b82f6' },
  aluminum: { name: 'Aluminum 6061', G: 26.0, G_pa: 26.0e9, tau_yield: 150, color: '#10b981' },
  titanium: { name: 'Titanium Ti-6Al-4V', G: 44.0, G_pa: 44.0e9, tau_yield: 460, color: '#8b5cf6' },
  brass: { name: 'Cartridge Brass', G: 39.0, G_pa: 39.0e9, tau_yield: 85, color: '#f59e0b' },
};

export default function ME330_Lesson8({ topicName, onComplete }) {
  const [phase, setPhase] = useState('instructions');
  const [poeChoice, setPoeChoice] = useState(null);

  // Shaft Controls
  const [torqueNm, setTorqueNm] = useState(1500); // N*m
  const [lengthM, setLengthM] = useState(1.5); // m
  const [outerDiameterMM, setOuterDiameterMM] = useState(50); // mm
  const [innerDiameterMM, setInnerDiameterMM] = useState(25); // mm
  const [shaftType, setShaftType] = useState('hollow'); // solid or hollow
  const [materialKey, setMaterialKey] = useState('steel');

  const mat = TORSION_MATS[materialKey];

  // Calculations
  const T = torqueNm; // N*m
  const L = lengthM; // m
  const do_m = outerDiameterMM / 1000; // m
  const di_m = shaftType === 'hollow' ? Math.min(innerDiameterMM, outerDiameterMM - 4) / 1000 : 0; // m

  const co = do_m / 2; // m
  const ci = di_m / 2; // m

  // Polar Moment of Inertia J
  const J = (Math.PI / 2) * (Math.pow(co, 4) - Math.pow(ci, 4)); // m^4

  // Max Shear Stress
  const tauMaxPa = (T * co) / J;
  const tauMaxMPa = tauMaxPa / 1e6;

  // Angle of Twist phi
  const phiRad = (T * L) / (mat.G_pa * J);
  const phiDeg = (phiRad * 180) / Math.PI;

  // Cross Area & Mass (assuming steel density 7850 kg/m3)
  const AreaM2 = Math.PI * (co * co - ci * ci);
  const AreaMM2 = AreaM2 * 1e6;
  const massKg = AreaM2 * L * 7850;

  // Radial Shear Stress Distribution Plot
  const rVals = [];
  const tauVals = [];
  const numPts = 100;

  for (let i = -numPts; i <= numPts; i++) {
    const r = (i / numPts) * co;
    rVals.push(r * 1000); // mm

    if (Math.abs(r) < ci) {
      tauVals.push(null); // Void inside hollow shaft
    } else {
      const tau = (T * r) / J / 1e6;
      tauVals.push(tau);
    }
  }

  const stressPlotTrace = [
    {
      x: rVals,
      y: tauVals,
      type: 'scatter',
      mode: 'lines',
      name: 'Shear Stress \\tau(r)',
      line: { color: mat.color, width: 3 },
      fill: 'tozeroy',
      fillcolor: 'rgba(59, 130, 246, 0.2)'
    }
  ];

  const plotLayout = {
    title: { text: 'Cross-Sectional Shear Stress Profile \\tau(r)', font: { color: '#f3f4f6', size: 15 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    xaxis: { title: 'Radial Distance r (mm)', color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'Shear Stress \\tau (MPa)', color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 50 }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
              ME 330 • UNIT 1 • LESSON 8
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#ffffff' }}>
              Torsion - Shearing Stress & Angle of Twist
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPhase('instructions')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase === 'instructions' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              Torsion Lab
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
          {/* Controls Panel */}
          <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#60a5fa' }}>
              Shaft Geometry & Torque
            </h2>

            {/* Shaft Type Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#d1d5db' }}>Shaft Cross Section</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShaftType('solid')}
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: shaftType === 'solid' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: 'bold' }}
                >
                  Solid Shaft
                </button>
                <button
                  onClick={() => setShaftType('hollow')}
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: shaftType === 'hollow' ? '#8b5cf6' : '#1f2937', color: '#fff', fontWeight: 'bold' }}
                >
                  Hollow Shaft
                </button>
              </div>
            </div>

            {/* Material */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#d1d5db' }}>Material</label>
              <select
                value={materialKey}
                onChange={(e) => setMaterialKey(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151' }}
              >
                {Object.entries(TORSION_MATS).map(([k, item]) => (
                  <option key={k} value={k}>{item.name} (G = {item.G} GPa)</option>
                ))}
              </select>
            </div>

            {/* Torque */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Applied Torque T (N·m)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{torqueNm} N·m</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="50"
                value={torqueNm}
                onChange={(e) => setTorqueNm(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Outer Diameter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Outer Diameter d_o (mm)</label>
                <span style={{ fontWeight: 'bold', color: '#34d399' }}>{outerDiameterMM} mm</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={outerDiameterMM}
                onChange={(e) => setOuterDiameterMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Inner Diameter (if hollow) */}
            {shaftType === 'hollow' && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ fontSize: '14px', color: '#d1d5db' }}>Inner Diameter d_i (mm)</label>
                  <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{innerDiameterMM} mm</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max={outerDiameterMM - 4}
                  value={innerDiameterMM}
                  onChange={(e) => setInnerDiameterMM(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#8b5cf6' }}
                />
              </div>
            )}

            {/* Shaft Length */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Shaft Length L (m)</label>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{lengthM} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.1"
                value={lengthM}
                onChange={(e) => setLengthM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>
          </div>

          {/* Right Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Polar Moment J</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#60a5fa', margin: '4px 0' }}>
                  {(J * 1e8).toFixed(3)} <span style={{ fontSize: '12px' }}>\times 10^{-8} m⁴</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="J = \frac{\pi}{32}(d_o^4 - d_i^4)" /></div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Max Shear Stress \tau_{max}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: tauMaxMPa > mat.tau_yield ? '#f87171' : '#34d399', margin: '4px 0' }}>
                  {tauMaxMPa.toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="\tau_{max} = \frac{T c_o}{J}" /></div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Angle of Twist \phi</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f472b6', margin: '4px 0' }}>
                  {phiDeg.toFixed(2)}°
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="\phi = \frac{T L}{G J}" /> ({phiRad.toFixed(3)} rad)</div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Shaft Mass</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a78bfa', margin: '4px 0' }}>
                  {massKg.toFixed(2)} <span style={{ fontSize: '14px' }}>kg</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Area: {AreaMM2.toFixed(0)} mm²</div>
              </div>
            </div>

            {/* Graphics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={stressPlotTrace} layout={plotLayout} config={{ responsive: true }} style={{ width: '100%', height: '320px' }} />
              </div>

              {/* Torsion Cross-Section Canvas */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>Shaft Cross Section View</h3>
                <svg width="280" height="260" style={{ backgroundColor: '#0f172a', borderRadius: '8px' }}>
                  {/* Outer Circle */}
                  <circle cx="140" cy="130" r={outerDiameterMM * 1.8} fill={mat.color} opacity="0.4" stroke={mat.color} strokeWidth="3" />
                  {/* Inner Hole if hollow */}
                  {shaftType === 'hollow' && (
                    <circle cx="140" cy="130" r={innerDiameterMM * 1.8} fill="#0f172a" stroke="#475569" strokeWidth="2" />
                  )}

                  {/* Torque Arrow Arc */}
                  <path d="M 140 40 A 90 90 0 0 1 230 130" fill="none" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrTorque)" />
                  <text x="210" y="70" fill="#ef4444" fontSize="13" fontWeight="bold">T = {torqueNm} N·m</text>

                  <defs>
                    <marker id="arrTorque" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                    </marker>
                  </defs>
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
            POE Challenge: Solid vs. Hollow Shaft Torsional Efficiency
          </h2>

          <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
              <strong>Scenario:</strong> You are designing a drive shaft of length <MathInline math="L = 1.5\text{ m}" />.
              Shaft A is a <strong>Solid Shaft</strong> (<MathInline math="d = 40\text{ mm}" />, Area <MathInline math="A = 1256\text{ mm}^2" />).
              Shaft B is a <strong>Hollow Shaft</strong> (<MathInline math="d_o = 50\text{ mm}" />, <MathInline math="d_i = 30\text{ mm}" />, Area <MathInline math="A = 1256\text{ mm}^2" />).
              Both shafts have the <strong>EXACT SAME MASS AND CROSS-SECTIONAL AREA</strong> and carry torque <MathInline math="T = 1000\text{ N}\cdot\text{m}" />.
            </p>
          </div>

          {phase === 'poe_predict' && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '14px' }}>
                Question: How do the max shear stress <MathInline math="\tau_{max}" /> and angle of twist <MathInline math="\phi" /> compare?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'A', text: 'Hollow shaft has BOTH lower maximum shear stress \\tau_{max} AND smaller angle of twist \\phi!' },
                  { id: 'B', text: 'Solid shaft is stronger because its center is filled with material.' },
                  { id: 'C', text: 'Both shafts experience identical stress and twist because their cross-sectional areas are identical.' },
                  { id: 'D', text: 'Hollow shaft has lower stress but larger angle of twist.' }
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                  <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ color: '#ec4899', fontWeight: 'bold' }}>Solid Shaft (d = 40 mm)</div>
                    <div>J = 2.513 \times 10^{-7} m⁴</div>
                    <div>\tau_{max} = 79.6 MPa</div>
                    <div>\phi = 4.41°</div>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>Hollow Shaft (50 / 30 mm)</div>
                    <div>J = 5.341 \times 10^{-7} m⁴ (More than 2x larger!)</div>
                    <div>\tau_{max} = 46.8 MPa (41% reduction in stress!)</div>
                    <div>\phi = 2.07° (53% reduction in twist!)</div>
                  </div>
                </div>
              </div>

              <button onClick={() => setPhase('poe_explain')} style={{ padding: '10px 24px', backgroundColor: '#059669', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
                View Explanation
              </button>
            </div>
          )}

          {phase === 'poe_explain' && (
            <div style={{ backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px' }}>
              <h4 style={{ color: poeChoice === 'A' ? '#34d399' : '#f87171', marginTop: 0 }}>
                {poeChoice === 'A' ? '✓ Correct! (A)' : 'Incorrect. Correct Answer is (A)'}
              </h4>
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                In torsion, material near the center (<MathInline math="r \approx 0" />) carries very little shear stress and contributes almost nothing to polar moment of inertia <MathInline math="J = \int r^2 dA" />.
              </p>
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                By removing inefficient central material and placing it further from the axis of rotation in a hollow shaft, <strong>the polar moment of inertia <MathInline math="J" /> doubles for the exact same mass</strong>! This dramatically reduces both peak shear stress <MathInline math="\tau_{max} = \frac{T c_o}{J}" /> and angle of twist <MathInline math="\phi = \frac{T L}{G J}" />!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

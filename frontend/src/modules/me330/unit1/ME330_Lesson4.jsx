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

const THERMAL_MATS = {
  steel: { name: 'Structural Steel', alpha: 12e-6, E: 200, yield: 250, color: '#3b82f6' },
  aluminum: { name: 'Aluminum 6061', alpha: 23e-6, E: 70, yield: 270, color: '#10b981' },
  copper: { name: 'Pure Copper', alpha: 17e-6, E: 110, yield: 200, color: '#f59e0b' },
  invar: { name: 'Invar 36', alpha: 1.2e-6, E: 140, yield: 240, color: '#8b5cf6' },
};

export default function ME330_Lesson4({ topicName, onComplete }) {
  const [phase, setPhase] = useState('instructions');
  const [poeChoice, setPoeChoice] = useState(null);

  // Controls
  const [deltaT, setDeltaT] = useState(60); // deg C
  const [gapMM, setGapMM] = useState(0.5); // mm initial gap
  const [lengthM, setLengthM] = useState(1.5); // m
  const [areaMM2, setAreaMM2] = useState(400); // mm^2
  const [materialKey, setMaterialKey] = useState('steel');

  const mat = THERMAL_MATS[materialKey];

  // Calculations
  const L = lengthM;
  const g_m = gapMM / 1000;
  const A = areaMM2 * 1e-6;
  const E_pa = mat.E * 1e9;

  // Unrestrained Thermal Expansion
  const deltaT_m = mat.alpha * L * deltaT; // m
  const deltaT_mm = deltaT_m * 1000; // mm

  // Restraint & Stress
  let isRestrained = false;
  let netRestraintDeltaM = 0;
  let stressMPa = 0; // Negative for compression
  let forceKN = 0;

  if (deltaT_m > g_m) {
    isRestrained = true;
    netRestraintDeltaM = deltaT_m - g_m;
    const stressPa = (netRestraintDeltaM / L) * E_pa; // Pa compression
    stressMPa = stressPa / 1e6;
    forceKN = (stressPa * A) / 1000;
  }

  // Temperature required to close gap
  const deltaT_gap = g_m / (mat.alpha * L);

  // Plotly Stress vs Temp curve
  const tempArray = [];
  const stressArray = [];
  for (let t = -40; t <= 150; t += 2) {
    tempArray.push(t);
    const freeExp = mat.alpha * L * t;
    if (freeExp > g_m) {
      const s = ((freeExp - g_m) / L) * (mat.E * 1000);
      stressArray.push(s);
    } else {
      stressArray.push(0);
    }
  }

  const plotTrace = [
    {
      x: tempArray,
      y: stressArray,
      type: 'scatter',
      mode: 'lines',
      name: 'Compressive Thermal Stress',
      line: { color: mat.color, width: 3 }
    },
    {
      x: [deltaT],
      y: [stressMPa],
      type: 'scatter',
      mode: 'markers+text',
      name: 'Current State',
      text: [`(${deltaT}°C, ${stressMPa.toFixed(1)} MPa)`],
      textposition: 'top left',
      marker: { color: '#ef4444', size: 12 }
    }
  ];

  const plotLayout = {
    title: { text: `Thermal Stress vs Temperature (${mat.name})`, font: { color: '#f3f4f6', size: 15 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    xaxis: { title: 'Temperature Change \\(\\Delta T\\) (°C)', color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'Compressive Stress \\(\\sigma_{thermal}\\) (MPa)', color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 50 }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
              ME 330 • UNIT 1 • LESSON 4
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#ffffff' }}>
              Thermal Expansion & Restraint Stress Simulator
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPhase('instructions')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase === 'instructions' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              Simulator
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
          {/* Left Controls */}
          <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#60a5fa' }}>
              Thermal Controls
            </h2>

            {/* Material */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#d1d5db' }}>Material</label>
              <select
                value={materialKey}
                onChange={(e) => setMaterialKey(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151' }}
              >
                {Object.entries(THERMAL_MATS).map(([k, item]) => (
                  <option key={k} value={k}>{item.name} (\alpha = {(item.alpha * 1e6).toFixed(1)} \times 10^{-6}/°C)</option>
                ))}
              </select>
            </div>

            {/* Delta T */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Temperature Change \Delta T (°C)</label>
                <span style={{ fontWeight: 'bold', color: deltaT > 0 ? '#ef4444' : '#3b82f6' }}>{deltaT > 0 ? `+${deltaT}` : deltaT}°C</span>
              </div>
              <input
                type="range"
                min="-20"
                max="120"
                value={deltaT}
                onChange={(e) => setDeltaT(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>

            {/* Initial Gap */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Initial Wall Gap g (mm)</label>
                <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{gapMM} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={gapMM}
                onChange={(e) => setGapMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Length */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Bar Length L (m)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{lengthM} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={lengthM}
                onChange={(e) => setLengthM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Gap Close Threshold Card */}
            <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Gap Closure Temperature</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fbbf24', marginTop: '2px' }}>
                \Delta T_{gap} = {deltaT_gap.toFixed(1)}°C
              </div>
            </div>
          </div>

          {/* Right Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Free Expansion \delta_T</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa', margin: '4px 0' }}>
                  {deltaT_mm.toFixed(3)} <span style={{ fontSize: '14px' }}>mm</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}><MathInline math="\delta_T = \alpha L \Delta T" /></div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Wall Contact Status</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: isRestrained ? '#ef4444' : '#34d399', margin: '4px 0' }}>
                  {isRestrained ? '🔴 RESTRAINED' : '🟢 FREE GAP'}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {isRestrained ? `Overclosure: ${(netRestraintDeltaM*1000).toFixed(3)} mm` : `Remaining Gap: ${Math.max(0, gapMM - deltaT_mm).toFixed(3)} mm`}
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Thermal Stress \sigma_T</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: isRestrained ? '#f87171' : '#9ca3af', margin: '4px 0' }}>
                  {stressMPa.toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {isRestrained ? 'Compression' : 'Zero Stress'}
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Restraint Force P</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: isRestrained ? '#f87171' : '#9ca3af', margin: '4px 0' }}>
                  {forceKN.toFixed(1)} <span style={{ fontSize: '14px' }}>kN</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Wall Reaction</div>
              </div>
            </div>

            {/* Graphics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={plotTrace} layout={plotLayout} config={{ responsive: true }} style={{ width: '100%', height: '320px' }} />
              </div>

              {/* Thermal SVG Canvas */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>Thermal Restraint Diagram</h3>
                <svg width="280" height="260" style={{ backgroundColor: '#0f172a', borderRadius: '8px' }}>
                  {/* Left Rigid Wall */}
                  <rect x="20" y="40" width="15" height="180" fill="#475569" stroke="#64748b" />
                  {/* Right Rigid Wall */}
                  <rect x="245" y="40" width="15" height="180" fill="#475569" stroke="#64748b" />

                  {/* Expanding Bar */}
                  <rect
                    x="35"
                    y="100"
                    width={Math.min(210, 170 + (deltaT_mm * 15))}
                    height="60"
                    fill={mat.color}
                    opacity="0.85"
                    stroke="#fff"
                    strokeWidth="1.5"
                    rx="4"
                  />

                  {/* Gap Indicator */}
                  {gapMM > 0 && (
                    <line x1={35 + 170 + gapMM * 15} y1="40" x2={35 + 170 + gapMM * 15} y2="220" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                  )}

                  {/* Reaction Arrow if restrained */}
                  {isRestrained && (
                    <g>
                      <line x1="245" y1="130" x2="200" y2="130" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrRstr)" />
                      <text x="180" y="115" fill="#ef4444" fontSize="12" fontWeight="bold">P_wall</text>
                    </g>
                  )}
                  <defs>
                    <marker id="arrRstr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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
            POE Challenge: Length Dependence of Thermal Restraint Stress
          </h2>

          <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
              <strong>Scenario:</strong> Two Steel bars (<MathInline math="E = 200\text{ GPa}" />, <MathInline math="\alpha = 12 \times 10^{-6}/^\circ\text{C}" />) are fully restrained between rigid walls with NO initial gap (<MathInline math="g = 0" />).
              Bar 1 has length <MathInline math="L_1 = 1.0\text{ m}" /> and Bar 2 has length <MathInline math="L_2 = 2.0\text{ m}" />. Both undergo identical temperature rise <MathInline math="\Delta T = +50^\circ\text{C}" />.
            </p>
          </div>

          {phase === 'poe_predict' && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '14px' }}>
                Question: Which bar develops higher compressive thermal stress <MathInline math="\sigma_{thermal}" />?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'A', text: 'Bar 2 (2.0 m) experiences TWICE the thermal stress because its free elongation \\delta_T is twice as large.' },
                  { id: 'B', text: 'Bar 1 (1.0 m) experiences higher thermal stress because it is shorter and stiffer.' },
                  { id: 'C', text: 'Both bars experience the EXACT SAME thermal stress (\\sigma = 120\\text{ MPa}).' },
                  { id: 'D', text: 'Thermal stress cannot be determined without knowing the cross-sectional area.' }
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
                    <div>Bar 1 (L = 1.0 m)</div>
                    <div>\delta_T1 = 0.60 mm</div>
                    <div>\sigma_{thermal1} = 120.0 MPa</div>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px' }}>
                    <div>Bar 2 (L = 2.0 m)</div>
                    <div>\delta_T2 = 1.20 mm</div>
                    <div>\sigma_{thermal2} = 120.0 MPa</div>
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
              <h4 style={{ color: poeChoice === 'C' ? '#34d399' : '#f87171', marginTop: 0 }}>
                {poeChoice === 'C' ? '✓ Correct! (C)' : 'Incorrect. Correct Answer is (C)'}
              </h4>
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                For a fully restrained bar (<MathInline math="g=0" />), the thermal stress formula is:
              </p>
              <MathBlock math="\sigma_{thermal} = -\alpha E \Delta T" />
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                Notice that <strong>length <MathInline math="L" /> completely cancels out</strong>! Although the longer bar expands twice as much (<MathInline math="\delta_T = \alpha L \Delta T" />), it is also twice as long and flexible (<MathInline math="\delta = \frac{P L}{A E}" />). Thus, thermal stress in a fully restrained bar is independent of length!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

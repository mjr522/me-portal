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

export default function ME330_Lesson5({ topicName, onComplete }) {
  const [phase, setPhase] = useState('instructions');
  const [poeChoice, setPoeChoice] = useState(null);

  // Controls
  const [loadKN, setLoadKN] = useState(40); // kN
  const [loadX, setLoadX] = useState(2.5); // m load position from pivot
  const [x1, setX1] = useState(1.0); // m position of Rod 1
  const [x2, setX2] = useState(2.0); // m position of Rod 2
  const [area1, setArea1] = useState(300); // mm^2
  const [area2, setArea2] = useState(300); // mm^2
  const [length1, setLength1] = useState(1.5); // m
  const [length2, setLength2] = useState(1.5); // m
  const [modulus1, setModulus1] = useState(200); // GPa
  const [modulus2, setModulus2] = useState(200); // GPa

  // Calculations
  const P = loadKN * 1000; // N
  const k1 = (area1 * 1e-6 * modulus1 * 1e9) / length1; // N/m stiffness
  const k2 = (area2 * 1e-6 * modulus2 * 1e9) / length2; // N/m stiffness

  // Moment equilibrium: theta * (k1*x1^2 + k2*x2^2) = P*loadX
  const denom = k1 * x1 * x1 + k2 * x2 * x2;
  const thetaRad = (P * loadX) / denom; // rad
  const thetaDeg = (thetaRad * 180) / Math.PI;

  const delta1_mm = thetaRad * x1 * 1000; // mm
  const delta2_mm = thetaRad * x2 * 1000; // mm

  const force1_kN = (k1 * thetaRad * x1) / 1000; // kN
  const force2_kN = (k2 * thetaRad * x2) / 1000; // kN

  const stress1_MPa = (force1_kN * 1000) / (area1 * 1e-6) / 1e6; // MPa
  const stress2_MPa = (force2_kN * 1000) / (area2 * 1e-6) / 1e6; // MPa

  // Plotly Bar Chart Data
  const plotTraces = [
    {
      x: ['Rod 1 (x_1 = ' + x1 + 'm)', 'Rod 2 (x_2 = ' + x2 + 'm)'],
      y: [force1_kN, force2_kN],
      type: 'bar',
      name: 'Tension Force (kN)',
      marker: { color: '#3b82f6' }
    },
    {
      x: ['Rod 1 (x_1 = ' + x1 + 'm)', 'Rod 2 (x_2 = ' + x2 + 'm)'],
      y: [stress1_MPa, stress2_MPa],
      type: 'bar',
      name: 'Tensile Stress (MPa)',
      marker: { color: '#8b5cf6' }
    }
  ];

  const plotLayout = {
    title: { text: 'Rod Forces & Stresses', font: { color: '#f3f4f6', size: 15 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    barmode: 'group',
    xaxis: { color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 40 },
    legend: { font: { color: '#e5e7eb' } }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
              ME 330 • UNIT 1 • LESSON 5
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#ffffff' }}>
              Pivoting Rigid Link Compatibility
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPhase('instructions')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase === 'instructions' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              Simulator & Visuals
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
              Rigid Link & Rod Controls
            </h2>

            {/* Load */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Load Force P (kN)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{loadKN} kN</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={loadKN}
                onChange={(e) => setLoadKN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Load Position */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Load Location x_P (m)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{loadX} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={loadX}
                onChange={(e) => setLoadX(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Rod 1 Location */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Rod 1 Distance x_1 (m)</label>
                <span style={{ fontWeight: 'bold', color: '#34d399' }}>{x1} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={x1}
                onChange={(e) => setX1(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Rod 2 Location */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Rod 2 Distance x_2 (m)</label>
                <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{x2} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={x2}
                onChange={(e) => setX2(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Formula Card */}
            <div style={{ backgroundColor: '#1f2937', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Kinematic Compatibility</div>
              <MathBlock math="\frac{\delta_1}{x_1} = \frac{\delta_2}{x_2} = \theta" />
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Rotation Angle \theta</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f472b6', margin: '4px 0' }}>
                  {thetaDeg.toFixed(3)}°
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{(thetaRad * 1000).toFixed(2)} mrad</div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Rod 1 Force & Stretch</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#34d399', margin: '4px 0' }}>
                  {force1_kN.toFixed(1)} <span style={{ fontSize: '14px' }}>kN</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>\delta_1 = {delta1_mm.toFixed(3)} mm</div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Rod 2 Force & Stretch</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a78bfa', margin: '4px 0' }}>
                  {force2_kN.toFixed(1)} <span style={{ fontSize: '14px' }}>kN</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>\delta_2 = {delta2_mm.toFixed(3)} mm</div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Force Ratio F_2 / F_1</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa', margin: '4px 0' }}>
                  {(force2_kN / (force1_kN || 1)).toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Ratio x_2 / x_1 = {(x2 / x1).toFixed(2)}</div>
              </div>
            </div>

            {/* Graphics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={plotTraces} layout={plotLayout} config={{ responsive: true }} style={{ width: '100%', height: '320px' }} />
              </div>

              {/* Kinematic Link Diagram */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>Pivoting Link Deflection Schematic</h3>
                <svg width="280" height="260" style={{ backgroundColor: '#0f172a', borderRadius: '8px' }}>
                  {/* Pin Pivot O at (30, 80) */}
                  <polygon points="30,80 20,100 40,100" fill="#64748b" />
                  <circle cx="30" cy="80" r="5" fill="#e2e8f0" />
                  <text x="15" y="70" fill="#9ca3af" fontSize="12" fontWeight="bold">O</text>

                  {/* Undeflected Bar */}
                  <line x1="30" y1="80" x2="260" y2="80" stroke="#475569" strokeWidth="3" strokeDasharray="4 4" />

                  {/* Deflected Bar (exaggerated visual angle) */}
                  <line x1="30" y1="80" x2="260" y2={80 + Math.min(70, thetaDeg * 30)} stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />

                  {/* Supporting Rod 1 */}
                  <line x1={30 + x1 * 70} y1="10" x2={30 + x1 * 70} y2={80 + (x1 * 70 * Math.sin((thetaDeg * Math.PI) / 180))} stroke="#10b981" strokeWidth="3" />
                  <circle cx={30 + x1 * 70} cy="10" r="4" fill="#10b981" />

                  {/* Supporting Rod 2 */}
                  <line x1={30 + x2 * 70} y1="10" x2={30 + x2 * 70} y2={80 + (x2 * 70 * Math.sin((thetaDeg * Math.PI) / 180))} stroke="#8b5cf6" strokeWidth="3" />
                  <circle cx={30 + x2 * 70} cy="10" r="4" fill="#8b5cf6" />

                  {/* Load P Arrow */}
                  <line x1={30 + loadX * 70} y1={80 + (loadX * 70 * Math.sin((thetaDeg * Math.PI) / 180))} x2={30 + loadX * 70} y2={80 + (loadX * 70 * Math.sin((thetaDeg * Math.PI) / 180)) + 40} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrP)" />

                  <defs>
                    <marker id="arrP" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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
            POE Challenge: Force Distribution in Pivoting Link
          </h2>

          <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
              <strong>Scenario:</strong> A rigid bar is pivoted at the left end <MathInline math="x = 0" />.
              Rod 1 is at <MathInline math="x_1 = 1.0\text{ m}" /> and Rod 2 is at <MathInline math="x_2 = 2.0\text{ m}" />. Both rods have identical length, area, and stiffness <MathInline math="AE/L" />.
              A force <MathInline math="P" /> is applied at the right end.
            </p>
          </div>

          {phase === 'poe_predict' && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '14px' }}>
                Question: What is the ratio of force in Rod 2 compared to Rod 1 (<MathInline math="F_2 / F_1" />)?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'A', text: 'F_2 / F_1 = 2.0 (Rod 2 is twice as far from pivot, so it stretches twice as much and carries twice the force).' },
                  { id: 'B', text: 'F_2 / F_1 = 1.0 (Forces are equal because the rods have identical stiffness).' },
                  { id: 'C', text: 'F_2 / F_1 = 0.5 (Rod 1 is closer to pivot and carries twice the force).' },
                  { id: 'D', text: 'F_2 / F_1 = 4.0 (Force ratio depends on distance squared).' }
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
                  <div>Deflection Ratio \delta_2 / \delta_1 = 2.0</div>
                  <div>Force Ratio F_2 / F_1 = 2.0</div>
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
                By kinematic compatibility of small angle rigid body rotation <MathInline math="\theta" />:
              </p>
              <MathBlock math="\delta_1 = \theta \cdot x_1, \quad \delta_2 = \theta \cdot x_2 \implies \frac{\delta_2}{\delta_1} = \frac{x_2}{x_1} = 2.0" />
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                Since Hooke's law gives <MathInline math="F = k \delta" /> and both rods have equal stiffness <MathInline math="k" />, the force ratio is directly proportional to displacement ratio: <MathInline math="F_2 / F_1 = 2.0" />!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

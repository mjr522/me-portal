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

export default function ME330_Lesson3() {
  const [phase, setPhase] = useState('instructions');
  const [poeChoice, setPoeChoice] = useState(null);

  // System Controls
  const [loadKN, setLoadKN] = useState(100); // kN
  const [totalLengthM, setTotalLengthM] = useState(2.0); // m
  const [loadPosM, setLoadPosM] = useState(1.0); // m (a)
  const [area1MM2, setArea1MM2] = useState(500); // mm^2
  const [area2MM2, setArea2MM2] = useState(250); // mm^2
  const [modulus1GPa, setModulus1GPa] = useState(200); // GPa (Steel)
  const [modulus2GPa, setModulus2GPa] = useState(200); // GPa (Steel)

  // Math Calculations
  const P = loadKN * 1000; // N
  const L = totalLengthM; // m
  const a = Math.min(loadPosM, L - 0.05); // m
  const b = L - a; // m

  const A1 = area1MM2 * 1e-6; // m^2
  const A2 = area2MM2 * 1e-6; // m^2
  const E1 = modulus1GPa * 1e9; // Pa
  const E2 = modulus2GPa * 1e9; // Pa

  const f1 = a / (A1 * E1); // m/N (flexibility of seg 1)
  const f2 = b / (A2 * E2); // m/N (flexibility of seg 2)

  // Reactions using Method of Superposition / Compatibility: delta_total = 0
  const RB = P * (f1 / (f1 + f2)); // N
  const RA = P - RB; // N

  const RA_kN = RA / 1000;
  const RB_kN = RB / 1000;

  // Stresses & Deflection at load point C
  const stress1MPa = (RA / A1) / 1e6; // MPa (tension)
  const stress2MPa = (RB / A2) / 1e6; // MPa (compression)
  const deltaC_MM = (RA * f1) * 1000; // mm

  // Plotly Data for Internal Force N(x) and Deflection delta(x)
  const numPts = 100;
  const xVals = [];
  const nVals = [];
  const dVals = [];

  for (let i = 0; i <= numPts; i++) {
    const x = (i / numPts) * L;
    xVals.push(x);

    if (x <= a) {
      nVals.push(RA_kN); // Tension (+)
      dVals.push((RA * (x / (A1 * E1))) * 1000);
    } else {
      nVals.push(-RB_kN); // Compression (-)
      dVals.push((RB * ((L - x) / (A2 * E2))) * 1000);
    }
  }

  const afdTrace = {
    x: xVals,
    y: nVals,
    type: 'scatter',
    mode: 'lines',
    name: 'Axial Force N(x) [kN]',
    line: { color: '#3b82f6', width: 3 },
    fill: 'tozeroy',
    fillcolor: 'rgba(59, 130, 246, 0.2)'
  };

  const deltaTrace = {
    x: xVals,
    y: dVals,
    type: 'scatter',
    mode: 'lines',
    name: 'Displacement \\delta(x) [mm]',
    line: { color: '#ec4899', width: 3 }
  };

  const layoutAFD = {
    title: { text: 'Axial Force Diagram N(x)', font: { color: '#f3f4f6', size: 14 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    xaxis: { title: 'Position x (m)', color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'Axial Force N (kN)', color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 40 }
  };

  const layoutDelta = {
    title: { text: 'Axial Deflection Profile \\delta(x)', font: { color: '#f3f4f6', size: 14 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    xaxis: { title: 'Position x (m)', color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'Deflection \\delta (mm)', color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 40 }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
              ME 330 • UNIT 1 • LESSON 3
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#ffffff' }}>
              Statically Indeterminate Axial Systems & Superposition
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPhase('instructions')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase === 'instructions' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              Simulator & Diagrams
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
              System Configuration
            </h2>

            {/* Load P */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Intermediate Force P (kN)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{loadKN} kN</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={loadKN}
                onChange={(e) => setLoadKN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Load Position a */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Load Location a (m)</label>
                <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{a.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.2"
                max={totalLengthM - 0.2}
                step="0.05"
                value={loadPosM}
                onChange={(e) => setLoadPosM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Segment 1 Area */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Seg 1 Area A_1 (mm²)</label>
                <span style={{ fontWeight: 'bold', color: '#34d399' }}>{area1MM2} mm²</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={area1MM2}
                onChange={(e) => setArea1MM2(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Segment 2 Area */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Seg 2 Area A_2 (mm²)</label>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{area2MM2} mm²</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={area2MM2}
                onChange={(e) => setArea2MM2(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Superposition Method Card */}
            <div style={{ backgroundColor: '#1f2937', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Superposition Formula</div>
              <MathBlock math="R_B = P \frac{f_1}{f_1 + f_2}" />
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                where flexibility <MathInline math="f_i = \frac{L_i}{A_i E_i}" />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Reactions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Left Reaction R_A</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#60a5fa', margin: '4px 0' }}>
                  {RA_kN.toFixed(1)} <span style={{ fontSize: '14px' }}>kN</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {((RA_kN / loadKN) * 100).toFixed(1)}% of total load P
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Right Reaction R_B</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#a78bfa', margin: '4px 0' }}>
                  {RB_kN.toFixed(1)} <span style={{ fontSize: '14px' }}>kN</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {((RB_kN / loadKN) * 100).toFixed(1)}% of total load P
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Peak Displacement \delta_C</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f472b6', margin: '4px 0' }}>
                  {deltaC_MM.toFixed(3)} <span style={{ fontSize: '14px' }}>mm</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  at x = {a.toFixed(2)} m
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Max Stress \sigma_{max}</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#34d399', margin: '4px 0' }}>
                  {Math.max(stress1MPa, stress2MPa).toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {stress1MPa > stress2MPa ? 'Segment 1 (Tension)' : 'Segment 2 (Comp)'}
                </div>
              </div>
            </div>

            {/* Plots */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={[afdTrace]} layout={layoutAFD} config={{ responsive: true }} style={{ width: '100%', height: '300px' }} />
              </div>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={[deltaTrace]} layout={layoutDelta} config={{ responsive: true }} style={{ width: '100%', height: '300px' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POE Challenge */}
      {phase.startsWith('poe') && (
        <div style={{ backgroundColor: '#111827', padding: '28px', borderRadius: '12px', border: '1px solid #374151', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '16px' }}>
            POE Challenge: Stiff vs Flexible Reaction Load Attractiveness
          </h2>

          <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
              <strong>Scenario:</strong> A stepped bar fixed at both ends is loaded at the step (<MathInline math="a = b = L/2" />).
              Segment 1 (left) has twice the cross-sectional area of Segment 2 (right), i.e., <MathInline math="A_1 = 2 A_2" />, with identical material <MathInline math="E_1 = E_2" />.
            </p>
          </div>

          {phase === 'poe_predict' && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '14px' }}>
                Question: How do the reaction forces <MathInline math="R_A" /> (left) and <MathInline math="R_B" /> (right) compare?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'A', text: 'R_A = 2 R_B (The stiffer Segment 1 attracts 2/3 of the load).' },
                  { id: 'B', text: 'R_B = 2 R_A (The thinner Segment 2 carries twice the force).' },
                  { id: 'C', text: 'R_A = R_B = P / 2 (Reactions are equal because lengths a and b are equal).' },
                  { id: 'D', text: 'R_A = 4 R_B (Reaction depends on area squared).' }
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
                  <div>Left Reaction R_A = 66.7% of P (2/3 P)</div>
                  <div>Right Reaction R_B = 33.3% of P (1/3 P)</div>
                  <div style={{ color: '#34d399', fontWeight: 'bold', marginTop: '8px' }}>R_A = 2 \cdot R_B !</div>
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
                In statically indeterminate systems, <strong>stiffer load paths attract more load</strong>!
              </p>
              <MathBlock math="R_A = P \frac{k_1}{k_1 + k_2} = P \frac{\frac{A_1 E}{L/2}}{\frac{A_1 E}{L/2} + \frac{A_2 E}{L/2}} = P \frac{2 A_2}{2 A_2 + A_2} = \frac{2}{3} P" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

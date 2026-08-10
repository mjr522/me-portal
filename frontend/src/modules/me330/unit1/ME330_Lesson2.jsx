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

export default function ME330_Lesson2({ topicName, onComplete }) {
  const [phase, setPhase] = useState('instructions');
  const [poeChoice, setPoeChoice] = useState(null);

  // Connection Parameters
  const [loadKN, setLoadKN] = useState(60); // kN
  const [plateWidthMM, setPlateWidthMM] = useState(80); // mm
  const [plateThicknessMM, setPlateThicknessMM] = useState(10); // mm
  const [boltDiameterMM, setBoltDiameterMM] = useState(20); // mm
  const [shearType, setShearType] = useState('double'); // 'single' or 'double'
  const [sigmaAllowableMPa, setSigmaAllowableMPa] = useState(150); // MPa
  const [tauAllowableMPa, setTauAllowableMPa] = useState(90); // MPa
  const [bearingAllowableMPa, setBearingAllowableMPa] = useState(220); // MPa

  // Calculations
  const P = loadKN * 1000; // N
  const w = plateWidthMM / 1000; // m
  const t = plateThicknessMM / 1000; // m
  const db = boltDiameterMM / 1000; // m

  // Net Area of Plate
  const Anet = (w - db) * t; // m^2
  const sigmaNetMPa = (P / Anet) / 1e6; // MPa

  // Bolt Shear Area & Stress
  const Abolt = (Math.PI * db * db) / 4; // m^2
  const numShearPlanes = shearType === 'double' ? 2 : 1;
  const tauBoltMPa = (P / (numShearPlanes * Abolt)) / 1e6; // MPa

  // Bearing Stress
  const Abearing = db * t; // m^2
  const sigmaBearingMPa = (P / Abearing) / 1e6; // MPa

  // Factors of Safety
  const fsNet = sigmaAllowableMPa / sigmaNetMPa;
  const fsShear = tauAllowableMPa / tauBoltMPa;
  const fsBearing = bearingAllowableMPa / sigmaBearingMPa;

  const minFS = Math.min(fsNet, fsShear, fsBearing);
  let criticalMode = 'Net Tension';
  if (minFS === fsShear) criticalMode = 'Bolt Shear';
  if (minFS === fsBearing) criticalMode = 'Plate Bearing';

  // Plotly Bar Chart Data
  const barChartTraces = [
    {
      x: ['Net Tension (\\sigma_{net})', 'Bolt Shear (\\tau)', 'Bearing (\\sigma_b)'],
      y: [sigmaNetMPa, tauBoltMPa, sigmaBearingMPa],
      type: 'bar',
      name: 'Calculated Stress',
      marker: { color: ['#3b82f6', '#8b5cf6', '#f59e0b'] }
    },
    {
      x: ['Net Tension (\\sigma_{net})', 'Bolt Shear (\\tau)', 'Bearing (\\sigma_b)'],
      y: [sigmaAllowableMPa, tauAllowableMPa, bearingAllowableMPa],
      type: 'bar',
      name: 'Allowable Limit',
      marker: { color: '#4b5563' }
    }
  ];

  const barChartLayout = {
    title: { text: 'Stress vs. Allowable Limits', font: { color: '#f3f4f6', size: 16 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    barmode: 'group',
    xaxis: { color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'Stress (MPa)', color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 50 },
    legend: { font: { color: '#e5e7eb' } }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
              ME 330 • UNIT 1 • LESSON 2
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#ffffff' }}>
              Axially Loaded Pinned/Bolted Connections
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPhase('instructions')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase === 'instructions' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              Interactive Joint Lab
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
              Joint Geometry & Load
            </h2>

            {/* Shear Type Switch */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#d1d5db' }}>Shear Configuration</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShearType('single')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: shearType === 'single' ? '#ec4899' : '#1f2937', color: '#fff', fontWeight: 'bold' }}
                >
                  Single Shear (1 plane)
                </button>
                <button
                  onClick={() => setShearType('double')}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: shearType === 'double' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: 'bold' }}
                >
                  Double Shear (2 planes)
                </button>
              </div>
            </div>

            {/* Load Slider */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Applied Tensile Load P (kN)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{loadKN} kN</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={loadKN}
                onChange={(e) => setLoadKN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Bolt Diameter */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Bolt Diameter d_b (mm)</label>
                <span style={{ fontWeight: 'bold', color: '#a78bfa' }}>{boltDiameterMM} mm</span>
              </div>
              <input
                type="range"
                min="8"
                max="40"
                value={boltDiameterMM}
                onChange={(e) => setBoltDiameterMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Plate Width */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Plate Width w (mm)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{plateWidthMM} mm</span>
              </div>
              <input
                type="range"
                min="40"
                max="150"
                value={plateWidthMM}
                onChange={(e) => setPlateWidthMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Plate Thickness */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Plate Thickness t (mm)</label>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{plateThicknessMM} mm</span>
              </div>
              <input
                type="range"
                min="3"
                max="25"
                value={plateThicknessMM}
                onChange={(e) => setPlateThicknessMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Critical Mode Summary Box */}
            <div style={{ backgroundColor: minFS < 1.0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '14px', borderRadius: '8px', border: `1px solid ${minFS < 1.0 ? '#ef4444' : '#10b981'}` }}>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Critical Design Status</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: minFS < 1.0 ? '#f87171' : '#34d399' }}>
                {minFS < 1.0 ? `❌ FAILURE: ${criticalMode} (FS = ${minFS.toFixed(2)})` : `✓ SAFE: FS = ${minFS.toFixed(2)} (${criticalMode})`}
              </div>
            </div>
          </div>

          {/* Right Display Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {/* Net Tension */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Net Plate Tension <MathInline math="\sigma_{net}" /></div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: fsNet < 1 ? '#f87171' : '#60a5fa', margin: '4px 0' }}>
                  {sigmaNetMPa.toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  FS = {fsNet.toFixed(2)} (Allow: {sigmaAllowableMPa} MPa)
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                  <MathInline math="\sigma_{net} = \frac{P}{(w - d_b)t}" />
                </div>
              </div>

              {/* Bolt Shear */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Bolt Shear Stress \tau</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: fsShear < 1 ? '#f87171' : '#a78bfa', margin: '4px 0' }}>
                  {tauBoltMPa.toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  FS = {fsShear.toFixed(2)} (Allow: {tauAllowableMPa} MPa)
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                  <MathInline math={shearType === 'double' ? '\\tau = \\frac{P}{2 A_{bolt}}' : '\\tau = \\frac{P}{A_{bolt}}'} />
                </div>
              </div>

              {/* Bearing Stress */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Plate Bearing Stress \sigma_b</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: fsBearing < 1 ? '#f87171' : '#fbbf24', margin: '4px 0' }}>
                  {sigmaBearingMPa.toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  FS = {fsBearing.toFixed(2)} (Allow: {bearingAllowableMPa} MPa)
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                  <MathInline math="\sigma_b = \frac{P}{d_b \cdot t}" />
                </div>
              </div>
            </div>

            {/* Graphics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={barChartTraces} layout={barChartLayout} config={{ responsive: true }} style={{ width: '100%', height: '340px' }} />
              </div>

              {/* SVG Joint Diagram */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>Connection Diagram ({shearType.toUpperCase()} SHEAR)</h3>
                <svg width="280" height="280" style={{ backgroundColor: '#0f172a', borderRadius: '8px' }}>
                  {shearType === 'single' ? (
                    <g>
                      {/* Top Plate */}
                      <rect x="40" y="100" width="130" height="30" fill="#3b82f6" opacity="0.8" stroke="#60a5fa" strokeWidth="2" />
                      {/* Bottom Plate */}
                      <rect x="110" y="130" width="130" height="30" fill="#10b981" opacity="0.8" stroke="#34d399" strokeWidth="2" />
                      {/* Bolt */}
                      <rect x="120" y="85" width="20" height="90" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" rx="3" />
                      <line x1="110" y1="130" x2="150" y2="130" stroke="#ef4444" strokeWidth="3" strokeDasharray="3 3" />
                      <text x="160" y="134" fill="#ef4444" fontSize="11" fontWeight="bold">1 Shear Plane</text>
                    </g>
                  ) : (
                    <g>
                      {/* Upper Clevis Plate */}
                      <rect x="40" y="75" width="130" height="25" fill="#3b82f6" opacity="0.8" stroke="#60a5fa" strokeWidth="2" />
                      {/* Center Tongue Plate */}
                      <rect x="110" y="110" width="130" height="30" fill="#10b981" opacity="0.8" stroke="#34d399" strokeWidth="2" />
                      {/* Lower Clevis Plate */}
                      <rect x="40" y="150" width="130" height="25" fill="#3b82f6" opacity="0.8" stroke="#60a5fa" strokeWidth="2" />
                      {/* Bolt */}
                      <rect x="120" y="60" width="20" height="130" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" rx="3" />
                      <line x1="110" y1="105" x2="150" y2="105" stroke="#ef4444" strokeWidth="3" strokeDasharray="3 3" />
                      <line x1="110" y1="145" x2="150" y2="145" stroke="#ef4444" strokeWidth="3" strokeDasharray="3 3" />
                      <text x="160" y="128" fill="#ef4444" fontSize="11" fontWeight="bold">2 Shear Planes</text>
                    </g>
                  )}
                  {/* Tension Arrows */}
                  <line x1="35" y1="125" x2="10" y2="125" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrL)" />
                  <line x1="245" y1="125" x2="270" y2="125" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrR)" />
                  <defs>
                    <marker id="arrL" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 10 0 L 0 5 L 10 10 z" fill="#ef4444" />
                    </marker>
                    <marker id="arrR" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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
            POE Challenge: Single Shear vs. Double Shear Connection
          </h2>

          <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
              <strong>Scenario:</strong> A bolted lap joint carries a load <MathInline math="P = 60\text{ kN}" /> with bolt diameter <MathInline math="d_b = 20\text{ mm}" /> and plate thickness <MathInline math="t = 10\text{ mm}" />.
              If the engineer modifies the connection from a <strong>Single Shear</strong> lap joint to a <strong>Double Shear</strong> clevis joint with identical bolt diameter and plate thickness:
            </p>
          </div>

          {phase === 'poe_predict' && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '14px' }}>
                Question: How do the bolt shear stress <MathInline math="\tau" /> and the bearing stress <MathInline math="\sigma_b" /> change?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'A', text: 'Both bolt shear stress and bearing stress are cut in half.' },
                  { id: 'B', text: 'Bolt shear stress is HALVED (\tau_{double} = \frac{1}{2} \tau_{single}), but plate bearing stress remains UNCHANGED.' },
                  { id: 'C', text: 'Bolt shear stress is DOUBLED, while bearing stress is cut in half.' },
                  { id: 'D', text: 'Neither stress changes because the load P and bolt diameter d_b are identical.' }
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

              <button
                disabled={!poeChoice}
                onClick={() => setPhase('poe_observe')}
                style={{ padding: '10px 24px', backgroundColor: poeChoice ? '#7c3aed' : '#4b5563', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}
              >
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
                    <div style={{ color: '#ec4899', fontWeight: 'bold' }}>Single Shear (1 Plane)</div>
                    <div><MathInline math="\tau_{single} = 191.0\text{ MPa}" /></div>
                    <div><MathInline math="\sigma_{bearing} = 300.0\text{ MPa}" /></div>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>Double Shear (2 Planes)</div>
                    <div><MathInline math="\tau_{double} = 95.5\text{ MPa}" /> (Halved!)</div>
                    <div><MathInline math="\sigma_{bearing} = 300.0\text{ MPa}" /> (Unchanged!)</div>
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
              <h4 style={{ color: poeChoice === 'B' ? '#34d399' : '#f87171', marginTop: 0 }}>
                {poeChoice === 'B' ? '✓ Correct! (B)' : 'Incorrect. Correct Answer is (B)'}
              </h4>
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                <strong>Bolt Shear Stress:</strong> In double shear, the total load <MathInline math="P" /> is distributed across 2 shear cross-sections of the bolt. Thus, <MathInline math="\tau_{double} = \frac{P}{2 A_{bolt}} = \frac{1}{2} \tau_{single}" />.
              </p>
              <p style={{ lineHeight: '1.6', color: '#d1d5db' }}>
                <strong>Bearing Stress:</strong> Bearing stress depends only on the contact force and projected area against the central plate <MathInline math="\sigma_b = \frac{P}{d_b \cdot t}" />. Since the main plate thickness <MathInline math="t" /> and bolt diameter <MathInline math="d_b" /> are unchanged, the bearing stress remains identical!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

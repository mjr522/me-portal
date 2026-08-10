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

const MATERIALS = {
  steel: { name: 'Structural Steel', E: 200, E_pa: 200e9, yield: 250, color: '#3b82f6' },
  aluminum: { name: 'Aluminum 6061-T6', E: 70, E_pa: 70e9, yield: 270, color: '#10b981' },
  titanium: { name: 'Titanium Ti-6Al-4V', E: 110, E_pa: 110e9, yield: 830, color: '#8b5cf6' },
  brass: { name: 'Cartridge Brass', E: 105, E_pa: 105e9, yield: 140, color: '#f59e0b' },
  nylon: { name: 'Nylon 6,6', E: 3, E_pa: 3e9, yield: 75, color: '#ec4899' },
};

export default function ME330_Lesson1() {
  // Phase state
  const [phase, setPhase] = useState('instructions');
  const [poeChoice, setPoeChoice] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Controls State
  const [loadKN, setLoadKN] = useState(50); // kN
  const [lengthM, setLengthM] = useState(2.0); // m
  const [diameterMM, setDiameterMM] = useState(25); // mm
  const [materialKey, setMaterialKey] = useState('steel');
  const [crossSection, setCrossSection] = useState('circle'); // circle or square
  const [scaleExaggeration, setScaleExaggeration] = useState(100);

  const mat = MATERIALS[materialKey];

  // Calculations
  const P = loadKN * 1000; // N
  const L = lengthM; // m
  
  let A = 0; // m^2
  if (crossSection === 'circle') {
    const r = (diameterMM / 1000) / 2;
    A = Math.PI * r * r;
  } else {
    const side = diameterMM / 1000;
    A = side * side;
  }

  const stressPa = P / A; // Pa
  const stressMPa = stressPa / 1e6; // MPa
  const strain = stressPa / mat.E_pa; // mm/mm or m/m
  const elongationM = strain * L; // m
  const elongationMM = elongationM * 1000; // mm
  const yieldRatio = (stressMPa / mat.yield) * 100;
  const isYielded = stressMPa > mat.yield;

  // Plotly Stress-Strain curve
  const maxStrainPlot = (mat.yield / mat.E) / 1000 * 1.5;
  const strainPoints = [0, mat.yield / (mat.E * 1000), maxStrainPlot];
  const stressPoints = [0, mat.yield, mat.yield * 1.05];

  const plotTraces = [
    {
      x: strainPoints.map(e => e * 1000), // in m/m * 1000 (m strain)
      y: stressPoints,
      type: 'scatter',
      mode: 'lines',
      name: `${mat.name} Curve`,
      line: { color: mat.color, width: 3 }
    },
    {
      x: [strain * 1000],
      y: [stressMPa],
      type: 'scatter',
      mode: 'markers+text',
      name: 'Operating Point',
      text: [`(${ (strain*1000).toFixed(3) } m\epsilon, ${stressMPa.toFixed(1)} MPa)`],
      textposition: 'top left',
      marker: { color: isYielded ? '#ef4444' : '#10b981', size: 14, symbol: 'diamond' }
    }
  ];

  const plotLayout = {
    title: { text: `Stress-Strain Response (${mat.name})`, font: { color: '#f3f4f6', size: 16 } },
    paper_bgcolor: '#111827',
    plot_bgcolor: '#1f2937',
    xaxis: { title: 'Strain \\(\\epsilon\\) (mm/m \\(\\times 10^{-3}\\))', color: '#9ca3af', gridcolor: '#374151' },
    yaxis: { title: 'Normal Stress \\(\\sigma\\) (MPa)', color: '#9ca3af', gridcolor: '#374151' },
    margin: { l: 50, r: 30, t: 40, b: 50 },
    showlegend: true,
    legend: { font: { color: '#e5e7eb' }, x: 0.05, y: 0.95 }
  };

  // Deformation visual coordinates
  const baseWidth = diameterMM;
  const visualElongation = elongationMM * scaleExaggeration;
  const deformedLenMM = (lengthM * 300) + visualElongation;

  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #1f2937', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#1e3a8a', color: '#93c5fd', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' }}>
              ME 330 • UNIT 1 • LESSON 1
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: '#ffffff' }}>
              Stress, Strain & Elastic Modulus Simulator
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPhase('instructions')}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: phase === 'instructions' ? '#2563eb' : '#1f2937', color: '#fff', fontWeight: '600' }}
            >
              Lesson & Simulator
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
          {/* Left Controls Panel */}
          <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#60a5fa' }}>
              Parameters & Material
            </h2>

            {/* Material Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#d1d5db' }}>Material Selection</label>
              <select
                value={materialKey}
                onChange={(e) => setMaterialKey(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151' }}
              >
                {Object.entries(MATERIALS).map(([key, item]) => (
                  <option key={key} value={key}>{item.name} (E = {item.E} GPa, \sigma_y = {item.yield} MPa)</option>
                ))}
              </select>
            </div>

            {/* Cross Section */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#d1d5db' }}>Cross-Section Shape</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setCrossSection('circle')}
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: crossSection === 'circle' ? '#2563eb' : '#1f2937', color: '#fff' }}
                >
                  Circular (d)
                </button>
                <button
                  onClick={() => setCrossSection('square')}
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: crossSection === 'square' ? '#2563eb' : '#1f2937', color: '#fff' }}
                >
                  Square (w)
                </button>
              </div>
            </div>

            {/* Applied Force */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Applied Force P (kN)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{loadKN} kN</span>
              </div>
              <input
                type="range"
                min="1"
                max="250"
                value={loadKN}
                onChange={(e) => setLoadKN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Bar Length */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>Original Length L (m)</label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{lengthM} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={lengthM}
                onChange={(e) => setLengthM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Dimension (Diameter or Width) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#d1d5db' }}>
                  {crossSection === 'circle' ? 'Diameter d (mm)' : 'Side Width w (mm)'}
                </label>
                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{diameterMM} mm</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={diameterMM}
                onChange={(e) => setDiameterMM(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>

            {/* Visual Exaggeration Scale */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '14px', color: '#9ca3af' }}>Visual Elongation Scale</label>
                <span style={{ color: '#9ca3af' }}>{scaleExaggeration}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={scaleExaggeration}
                onChange={(e) => setScaleExaggeration(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#a855f7' }}
              />
            </div>

            {/* Quick Summary Box */}
            <div style={{ backgroundColor: isYielded ? 'rgba(239, 68, 68, 0.15)' : '#1f2937', padding: '12px', borderRadius: '8px', border: `1px solid ${isYielded ? '#ef4444' : '#374151'}` }}>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>Yield Status</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: isYielded ? '#f87171' : '#34d399' }}>
                {isYielded ? `⚠️ Plastic Yielding Exceeded! (${yieldRatio.toFixed(0)}% of \\sigma_y)` : `✓ Elastic Region (${yieldRatio.toFixed(1)}% of \\sigma_y)`}
              </div>
            </div>
          </div>

          {/* Right Display Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Formulas & Live Output Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Cross Area A</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>
                  {(A * 1e6).toFixed(1)} <span style={{ fontSize: '14px' }}>mm²</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  <MathInline math={crossSection === 'circle' ? 'A = \\frac{\\pi d^2}{4}' : 'A = w^2'} />
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Normal Stress \sigma</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: isYielded ? '#f87171' : '#38bdf8' }}>
                  {stressMPa.toFixed(1)} <span style={{ fontSize: '14px' }}>MPa</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  <MathInline math="\\sigma = \\frac{P}{A}" />
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Normal Strain \epsilon</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a78bfa' }}>
                  {(strain * 1000).toFixed(3)} <span style={{ fontSize: '14px' }}>\times 10^{-3}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  <MathInline math="\\epsilon = \\frac{\\sigma}{E}" />
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Elongation \delta</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f472b6' }}>
                  {elongationMM.toFixed(3)} <span style={{ fontSize: '14px' }}>mm</span>
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  <MathInline math="\\delta = \\frac{P L}{A E}" />
                </div>
              </div>
            </div>

            {/* Graphics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
              {/* Plotly Chart */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <Plot data={plotTraces} layout={plotLayout} config={{ responsive: true }} style={{ width: '100%', height: '340px' }} />
              </div>

              {/* Axial Bar Visual Canvas / SVG */}
              <div style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '12px' }}>Axial Bar Deformation Diagram</h3>
                <svg width="280" height="280" style={{ backgroundColor: '#0f172a', borderRadius: '8px' }}>
                  {/* Fixed Top Support */}
                  <line x1="40" y1="30" x2="240" y2="30" stroke="#64748b" strokeWidth="4" />
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line key={i} x1={45 + i * 22} y1="30" x2={55 + i * 22} y2="20" stroke="#475569" strokeWidth="2" />
                  ))}

                  {/* Original Bar Outline (dashed) */}
                  <rect x="110" y="30" width="60" height="170" fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="175" y="115" fill="#64748b" fontSize="11">Original L</text>

                  {/* Deformed Tensile Bar */}
                  <rect
                    x={110 + (baseWidth > 30 ? -2 : 2)}
                    y="30"
                    width={Math.max(20, 60 - visualElongation * 0.1)}
                    height={170 + Math.min(60, visualElongation)}
                    fill="url(#barGrad)"
                    stroke={mat.color}
                    strokeWidth="2"
                    rx="2"
                  />

                  {/* Applied Force Arrow */}
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={mat.color} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={mat.color} stopOpacity="0.3" />
                    </linearGradient>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                    </marker>
                  </defs>

                  <line
                    x1="140"
                    y1={30 + 170 + Math.min(60, visualElongation)}
                    x2="140"
                    y2={30 + 170 + Math.min(60, visualElongation) + 40}
                    stroke="#ef4444"
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                  />
                  <text x="150" y={30 + 170 + Math.min(60, visualElongation) + 30} fill="#ef4444" fontWeight="bold" fontSize="13">
                    P = {loadKN} kN
                  </text>
                </svg>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px', textAlign: 'center' }}>
                  Elongation <MathInline math={`\\delta = ${elongationMM.toFixed(3)}\\text{ mm}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POE Challenge Phase */}
      {phase.startsWith('poe') && (
        <div style={{ backgroundColor: '#111827', padding: '28px', borderRadius: '12px', border: '1px solid #374151', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <span style={{ backgroundColor: phase === 'poe_predict' ? '#7c3aed' : '#374151', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
              1. PREDICT
            </span>
            <span style={{ backgroundColor: phase === 'poe_observe' ? '#2563eb' : '#374151', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
              2. OBSERVE
            </span>
            <span style={{ backgroundColor: phase === 'poe_explain' ? '#059669' : '#374151', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
              3. EXPLAIN
            </span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f3f4f6', marginBottom: '12px' }}>
            Predict-Observe-Explain Challenge: Material Stiffness vs Stress & Elongation
          </h2>

          <div style={{ backgroundColor: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #a855f7' }}>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
              <strong>Scenario:</strong> You have two cylindrical bars of identical geometry (<MathInline math="L = 2.0\text{ m}" />, <MathInline math="d = 25\text{ mm}" />).
              Bar A is made of <strong>Aluminum 6061-T6</strong> (<MathInline math="E_A = 70\text{ GPa}" />). Bar B is made of <strong>Structural Steel</strong> (<MathInline math="E_B = 200\text{ GPa}" />).
              Both bars are subjected to the exact same tensile force <MathInline math="P = 50\text{ kN}" />.
            </p>
          </div>

          {phase === 'poe_predict' && (
            <div>
              <h3 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '14px' }}>
                Question: How do the Normal Stress <MathInline math="\sigma" /> and Elongation <MathInline math="\delta" /> compare between the two bars?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'A', text: 'Steel bar has higher stress and higher elongation than Aluminum bar.' },
                  { id: 'B', text: 'Both bars experience the EXACT SAME normal stress, but Aluminum bar elongates significantly more than Steel.' },
                  { id: 'C', text: 'Aluminum bar experiences higher normal stress because its Young’s modulus is lower.' },
                  { id: 'D', text: 'Both bars experience identical stress and identical elongation.' }
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
                onClick={() => {
                  setPoeSubmitted(true);
                  setPhase('poe_observe');
                }}
                style={{
                  padding: '10px 24px',
                  backgroundColor: poeChoice ? '#7c3aed' : '#4b5563',
                  color: '#fff',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: poeChoice ? 'pointer' : 'not-allowed'
                }}
              >
                Submit Prediction & Proceed to Observation
              </button>
            </div>
          )}

          {phase === 'poe_observe' && (
            <div>
              <div style={{ backgroundColor: '#064e3b', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #10b981' }}>
                <h4 style={{ margin: 0, color: '#34d399', fontSize: '16px', fontWeight: 'bold' }}>Observation Results</h4>
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                  <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '6px' }}>Aluminum 6061-T6 (E = 70 GPa)</div>
                    <div>Area A = 490.9 mm²</div>
                    <div>Stress \sigma_A = 101.9 MPa</div>
                    <div>Elongation \delta_A = 2.911 mm</div>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ color: '#3b82f6', fontWeight: 'bold', marginBottom: '6px' }}>Structural Steel (E = 200 GPa)</div>
                    <div>Area A = 490.9 mm²</div>
                    <div>Stress \sigma_B = 101.9 MPa</div>
                    <div>Elongation \delta_B = 1.019 mm</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPhase('poe_explain')}
                style={{ padding: '10px 24px', backgroundColor: '#059669', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Continue to Explanation
              </button>
            </div>
          )}

          {phase === 'poe_explain' && (
            <div>
              <div style={{ backgroundColor: poeChoice === 'B' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${poeChoice === 'B' ? '#10b981' : '#ef4444'}` }}>
                <h4 style={{ margin: 0, color: poeChoice === 'B' ? '#34d399' : '#f87171', fontSize: '16px', fontWeight: 'bold' }}>
                  {poeChoice === 'B' ? '✓ Excellent Prediction! Correct Answer: (B)' : 'Incorrect Prediction. Correct Answer: (B)'}
                </h4>
              </div>

              <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#d1d5db', backgroundColor: '#1f2937', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ color: '#60a5fa', marginTop: 0 }}>Engineering Explanation:</h4>
                <p>
                  1. <strong>Normal Stress <MathInline math="\sigma = P / A" />:</strong> Stress is purely a geometric and force ratio. Since both bars have the exact same force (<MathInline math="P = 50\text{ kN}" />) and cross-sectional diameter (<MathInline math="d = 25\text{ mm}" />), their internal normal stress is identical (<MathInline math="\sigma = 101.9\text{ MPa}" />), completely independent of material modulus <MathInline math="E" />!
                </p>
                <p>
                  2. <strong>Elongation <MathInline math="\delta = \frac{P L}{A E}" />:</strong> Elongation is inversely proportional to Young's Modulus <MathInline math="E" />. Steel is nearly 3 times stiffer than Aluminum (<MathInline math="200\text{ GPa}" /> vs <MathInline math="70\text{ GPa}" />), so Aluminum stretches nearly 3 times as much under the same load:
                </p>
                <MathBlock math="\frac{\delta_{Al}}{\delta_{Steel}} = \frac{E_{Steel}}{E_{Al}} = \frac{200}{70} \approx 2.86" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

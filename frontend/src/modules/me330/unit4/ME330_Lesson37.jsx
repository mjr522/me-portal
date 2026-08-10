import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock, BookOpen, ArrowRight, ShieldAlert, Layers, BarChart2 } from 'lucide-react';

function MathInline({ math }) {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathBlock({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const MATERIALS = {
  steel: { name: 'Structural Steel (A36)', E: 200, yieldStr: 250, color: '#3b82f6' },
  aluminum: { name: 'Aluminum 6061-T6', E: 70, yieldStr: 276, color: '#10b981' },
  titanium: { name: 'Titanium Ti-6Al-4V', E: 114, yieldStr: 880, color: '#8b5cf6' },
  timber: { name: 'Structural Timber (Pine)', E: 12, yieldStr: 35, color: '#f59e0b' },
  carbon: { name: 'Carbon Fiber Composite', E: 150, yieldStr: 600, color: '#ec4899' },
};

export default function ME330_Lesson37({ topicName, onComplete }) {
  // Simulator State
  const [materialKey, setMaterialKey] = useState('steel');
  const [sectionType, setSectionType] = useState('rect'); // 'rect', 'circle', 'tube', 'ibeam'
  
  // Dimensions (mm)
  const [dimWidth, setDimWidth] = useState(50); // b or outer diameter D_o
  const [dimHeight, setDimHeight] = useState(100); // h or inner diameter D_i
  const [dimThickness, setDimThickness] = useState(8); // for tube or ibeam flange
  
  // Length (m) & Load (kN)
  const [lengthM, setLengthM] = useState(3.0);
  const [appliedLoadKN, setAppliedLoadKN] = useState(50);
  
  // Active Tab
  const [activeTab, setActiveTab] = useState('sim'); // 'sim', 'theory', 'poe'

  // POE Quiz Phase State
  const [poePhase, setPoePhase] = useState('predict'); // 'predict', 'observe', 'explain'
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeExplanation, setPoeExplanation] = useState(null);
  const [poeScore, setPoeScore] = useState(0);

  const mat = MATERIALS[materialKey];
  const isLocked = poePhase === 'predict';

  // Section Calculations
  let area = 0; // mm^2
  let Ix = 0; // mm^4
  let Iy = 0; // mm^4

  if (sectionType === 'rect') {
    const b = dimWidth;
    const h = dimHeight;
    area = b * h;
    Ix = (b * Math.pow(h, 3)) / 12;
    Iy = (h * Math.pow(b, 3)) / 12;
  } else if (sectionType === 'circle') {
    const d = dimWidth;
    area = (Math.PI * Math.pow(d, 2)) / 4;
    Ix = (Math.PI * Math.pow(d, 4)) / 64;
    Iy = Ix;
  } else if (sectionType === 'tube') {
    const Do = dimWidth;
    const Di = Math.min(dimHeight, Do - 2);
    area = (Math.PI * (Math.pow(Do, 2) - Math.pow(Di, 2))) / 4;
    Ix = (Math.PI * (Math.pow(Do, 4) - Math.pow(Di, 4))) / 64;
    Iy = Ix;
  } else if (sectionType === 'ibeam') {
    const bf = dimWidth;
    const h = dimHeight;
    const tf = dimThickness;
    const tw = Math.max(3, tf * 0.7);
    area = 2 * bf * tf + (h - 2 * tf) * tw;
    Ix = (bf * Math.pow(h, 3) - (bf - tw) * Math.pow(h - 2 * tf, 3)) / 12;
    Iy = (2 * tf * Math.pow(bf, 3) + (h - 2 * tf) * Math.pow(tw, 3)) / 12;
  }

  const Imin = Math.min(Ix, Iy);
  const weakAxis = Iy < Ix ? 'Y-Y (Weak Axis)' : 'X-X (Weak Axis)';
  const rMin = Math.sqrt(Imin / area); // mm
  const lengthMM = lengthM * 1000;
  const slenderness = lengthMM / rMin; // L/r

  // Euler Critical Load Formula (P_cr = pi^2 * E * I / L^2)
  const E_MPa = mat.E * 1000; // GPa to MPa
  const P_cr_N = (Math.PI * Math.PI * E_MPa * Imin) / (lengthMM * lengthMM);
  const P_cr_kN = P_cr_N / 1000;

  // Critical Stress sigma_cr = P_cr / A = pi^2 * E / (L/r)^2
  const sigma_cr = P_cr_N / area; // MPa
  const appliedStress = (appliedLoadKN * 1000) / area; // MPa
  const factorOfSafety = P_cr_kN / (appliedLoadKN || 0.001);

  // Failure Mode Assessment
  let statusText = 'SAFE (Elastic Equilibrium)';
  let statusColor = '#10b981';
  let isBuckled = appliedLoadKN >= P_cr_kN;
  let isYielded = sigma_cr > mat.yieldStr;

  if (isBuckled) {
    statusText = 'CRITICAL BUCKLED! Applied Load P ≥ P_cr';
    statusColor = '#ef4444';
  } else if (isYielded && appliedStress >= mat.yieldStr) {
    statusText = 'YIELD FAILURE! Stress exceeds Yield Strength σ_y';
    statusColor = '#f59e0b';
  }

  // Plot 1 Data: Column Deflection Mode Shape w(x) = delta * sin(pi * x / L)
  const generateDeflectionPlot = () => {
    const points = 50;
    const xVals = [];
    const yVals = [];
    const maxDeflection = isBuckled ? Math.min(0.2 * lengthM, 0.4) : Math.min(0.2 * lengthM, 0.4) * (appliedLoadKN / P_cr_kN);

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * lengthM;
      // Pinned-Pinned fundamental mode shape
      const w = maxDeflection * Math.sin((Math.PI * x) / lengthM);
      xVals.push(w);
      yVals.push(x);
    }

    const traces = [
      // Straight baseline reference
      {
        x: Array(points + 1).fill(0),
        y: xVals.map((_, i) => (i / points) * lengthM),
        mode: 'lines',
        name: 'Initial Unloaded Column',
        line: { color: '#94a3b8', width: 2, dash: 'dash' }
      },
      // Deflected Column Curve
      {
        x: xVals,
        y: yVals,
        mode: 'lines',
        name: isBuckled ? 'Buckled Shape (P ≥ P_cr)' : 'Stable Column Profile',
        line: { color: isBuckled ? '#ef4444' : '#3b82f6', width: 5 }
      }
    ];

    // Annotations for pin supports & force vectors
    const annotations = [
      {
        x: 0, y: lengthM,
        ax: 0, ay: lengthM + 0.35,
        xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
        text: `P = ${appliedLoadKN.toFixed(1)} kN`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1.5,
        arrowcolor: isBuckled ? '#ef4444' : '#2563eb',
        font: { color: isBuckled ? '#ef4444' : '#2563eb', size: 13, family: 'Outfit, sans-serif' }
      },
      {
        x: 0, y: 0,
        text: '▲ Pinned Base (x=0)',
        showarrow: false,
        yshift: -20,
        font: { color: '#64748b', size: 11 }
      },
      {
        x: 0, y: lengthM,
        text: '▲ Pinned Top (x=L)',
        showarrow: false,
        yshift: 20,
        font: { color: '#64748b', size: 11 }
      }
    ];

    return { traces, annotations };
  };

  // Plot 2 Data: Euler Critical Stress vs Slenderness Curve
  const generateEulerCurvePlot = () => {
    const slendernessVals = [];
    const sigmaEulerVals = [];
    const yieldLineVals = [];

    for (let s = 10; s <= 200; s += 2) {
      slendernessVals.push(s);
      const s_cr = (Math.PI * Math.PI * E_MPa) / (s * s);
      sigmaEulerVals.push(s_cr);
      yieldLineVals.push(mat.yieldStr);
    }

    const currentOperatingSigma = Math.min(sigma_cr, mat.yieldStr * 1.5);

    const traces = [
      {
        x: slendernessVals,
        y: yieldLineVals,
        mode: 'lines',
        name: `Yield Limit σ_y (${mat.yieldStr} MPa)`,
        line: { color: '#f59e0b', width: 2, dash: 'dot' }
      },
      {
        x: slendernessVals,
        y: sigmaEulerVals,
        mode: 'lines',
        name: 'Euler Elastic Curve σ_cr(L/r)',
        line: { color: mat.color, width: 3 }
      },
      {
        x: [slenderness],
        y: [sigma_cr],
        mode: 'markers',
        name: 'Current Operating Column',
        marker: {
          size: 14,
          color: isBuckled ? '#ef4444' : '#10b981',
          symbol: 'diamond-open-dot',
          line: { color: isBuckled ? '#ef4444' : '#10b981', width: 3 }
        }
      }
    ];

    return traces;
  };

  const deflectionPlot = generateDeflectionPlot();
  const eulerCurveTraces = generateEulerCurvePlot();

  // POE Quiz Option Handling
  const handlePoeSubmit = () => {
    if (!poePrediction) return;
    setPoePhase('observe');
  };

  const handlePoeExplainSubmit = (optionIndex) => {
    setPoeExplanation(optionIndex);
    setPoePhase('explain');
    if (optionIndex === 1 && poePrediction === 'B') {
      setPoeScore(100);
      if (onComplete) onComplete(topicName);
    } else if (poePrediction === 'B') {
      setPoeScore(75);
      if (onComplete) onComplete(topicName);
    } else {
      setPoeScore(40);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'var(--font-family)' }}>
      {/* Header Banner */}
      <div className="portal-header" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2rem' }}>🏛️</span>
          <span className="unit-card-badge" style={{ background: '#3b82f6', color: '#fff', fontSize: '0.85rem' }}>ME 330 • Unit 4 • Lesson 37</span>
        </div>
        <h1 className="portal-title" style={{ fontSize: '2.2rem' }}>Euler Column Buckling Critical Load & Slenderness</h1>
        <p className="portal-desc">
          Analyze elastic structural instability under concentric axial load, radius of gyration <MathInline math="r = \sqrt{I/A}" />, and slenderness ratio <MathInline math="\lambda = L/r" />.
        </p>

        {/* Tab Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => setActiveTab('sim')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: activeTab === 'sim' ? '#2563eb' : 'rgba(255,255,255,0.1)', color: '#fff', transition: 'all 0.2s'
            }}
          >
            📊 Interactive Buckling Simulator
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: activeTab === 'theory' ? '#2563eb' : 'rgba(255,255,255,0.1)', color: '#fff', transition: 'all 0.2s'
            }}
          >
            📖 Mathematical Theory & Formulas
          </button>
          <button
            onClick={() => setActiveTab('poe')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: activeTab === 'poe' ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: '#fff', transition: 'all 0.2s'
            }}
          >
            🎯 POE Challenge Quiz
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE SIMULATOR */}
      {activeTab === 'sim' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>
          {/* Controls Column */}
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ Column Parameters & Material Setup
            </h3>

            {/* Material Dropdown */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Column Material:
              </label>
              <select
                value={materialKey}
                onChange={(e) => setMaterialKey(e.target.value)}
                disabled={isLocked}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 600 }}
              >
                {Object.entries(MATERIALS).map(([k, m]) => (
                  <option key={k} value={k}>
                    {m.name} (E = {m.E} GPa, σ_y = {m.yieldStr} MPa)
                  </option>
                ))}
              </select>
            </div>

            {/* Cross Section Dropdown */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Cross-Section Profile:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'rect', label: 'Solid Rectangular' },
                  { id: 'circle', label: 'Solid Circular' },
                  { id: 'tube', label: 'Hollow Circular Tube' },
                  { id: 'ibeam', label: 'I-Beam (Wide Flange)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSectionType(s.id)}
                    disabled={isLocked}
                    style={{
                      padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-light)',
                      background: sectionType === s.id ? '#2563eb' : 'var(--bg-primary)',
                      color: sectionType === s.id ? '#fff' : 'var(--text-main)', cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Dimension Inputs */}
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', marginBottom: '18px' }}>
              {sectionType === 'rect' && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>Width b (Weak Axis Direction):</span>
                      <span style={{ color: '#2563eb' }}>{dimWidth} mm</span>
                    </div>
                    <input
                      type="range" min="10" max="150" step="1" value={dimWidth}
                      onChange={(e) => setDimWidth(Number(e.target.value))} disabled={isLocked}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>Height h (Strong Axis Direction):</span>
                      <span style={{ color: '#2563eb' }}>{dimHeight} mm</span>
                    </div>
                    <input
                      type="range" min="10" max="250" step="1" value={dimHeight}
                      onChange={(e) => setDimHeight(Number(e.target.value))} disabled={isLocked}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                </>
              )}

              {sectionType === 'circle' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                    <span>Diameter d:</span>
                    <span style={{ color: '#2563eb' }}>{dimWidth} mm</span>
                  </div>
                  <input
                    type="range" min="10" max="200" step="1" value={dimWidth}
                    onChange={(e) => setDimWidth(Number(e.target.value))} disabled={isLocked}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                </div>
              )}

              {sectionType === 'tube' && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>Outer Diameter D_o:</span>
                      <span style={{ color: '#2563eb' }}>{dimWidth} mm</span>
                    </div>
                    <input
                      type="range" min="20" max="250" step="1" value={dimWidth}
                      onChange={(e) => setDimWidth(Number(e.target.value))} disabled={isLocked}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>Inner Diameter D_i:</span>
                      <span style={{ color: '#2563eb' }}>{dimHeight} mm</span>
                    </div>
                    <input
                      type="range" min="10" max={Math.max(10, dimWidth - 4)} step="1" value={dimHeight}
                      onChange={(e) => setDimHeight(Number(e.target.value))} disabled={isLocked}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                </>
              )}

              {sectionType === 'ibeam' && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>Flange Width b_f:</span>
                      <span style={{ color: '#2563eb' }}>{dimWidth} mm</span>
                    </div>
                    <input
                      type="range" min="30" max="200" step="1" value={dimWidth}
                      onChange={(e) => setDimWidth(Number(e.target.value))} disabled={isLocked}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>Section Height h:</span>
                      <span style={{ color: '#2563eb' }}>{dimHeight} mm</span>
                    </div>
                    <input
                      type="range" min="40" max="300" step="1" value={dimHeight}
                      onChange={(e) => setDimHeight(Number(e.target.value))} disabled={isLocked}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span>Flange Thickness t_f:</span>
                      <span style={{ color: '#2563eb' }}>{dimThickness} mm</span>
                    </div>
                    <input
                      type="range" min="3" max="25" step="1" value={dimThickness}
                      onChange={(e) => setDimThickness(Number(e.target.value))} disabled={isLocked}
                      style={{ width: '100%', accentColor: '#2563eb' }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Column Length Slider */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>Unbraced Length L:</span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>{lengthM.toFixed(2)} m</span>
              </div>
              <input
                type="range" min="0.5" max="10.0" step="0.1" value={lengthM}
                onChange={(e) => setLengthM(Number(e.target.value))} disabled={isLocked}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            {/* Applied Axial Load Slider */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>Applied Concentric Load P:</span>
                <span style={{ color: isBuckled ? '#ef4444' : '#2563eb', fontWeight: 700 }}>{appliedLoadKN.toFixed(1)} kN</span>
              </div>
              <input
                type="range" min="1" max={Math.max(200, Math.round(P_cr_kN * 1.5))} step="1" value={appliedLoadKN}
                onChange={(e) => setAppliedLoadKN(Number(e.target.value))} disabled={isLocked}
                style={{ width: '100%', accentColor: isBuckled ? '#ef4444' : '#2563eb' }}
              />
            </div>

            {/* Live Calculation Results Card */}
            <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '10px' }}>
                📐 Geometric & Stability Outputs
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div>Area A: <strong>{area.toFixed(1)} mm²</strong></div>
                <div>Weak Axis: <strong>{weakAxis}</strong></div>
                <div>Min Inertia I_min: <strong>{(Imin / 1e4).toFixed(2)} ×10⁴ mm⁴</strong></div>
                <div>Radius Gyration r_min: <strong>{rMin.toFixed(2)} mm</strong></div>
                <div style={{ gridColumn: 'span 2' }}>
                  Slenderness Ratio λ = L/r: <strong style={{ color: slenderness > 100 ? '#f59e0b' : '#2563eb' }}>{slenderness.toFixed(1)}</strong>
                </div>
                <div style={{ gridColumn: 'span 2', fontSize: '0.92rem', paddingTop: '6px', borderTop: '1px dashed rgba(37,99,235,0.3)' }}>
                  Euler Critical Load P_cr: <strong style={{ color: '#2563eb', fontSize: '1.05rem' }}>{P_cr_kN.toFixed(1)} kN</strong>
                </div>
                <div>Critical Stress σ_cr: <strong>{sigma_cr.toFixed(1)} MPa</strong></div>
                <div>Factor of Safety FS: <strong style={{ color: factorOfSafety >= 1.5 ? '#10b981' : '#ef4444' }}>{factorOfSafety.toFixed(2)}</strong></div>
              </div>
            </div>
          </div>

          {/* Graphics & Visualization Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status Banner */}
            <div style={{
              background: statusColor, color: '#fff', padding: '14px 20px', borderRadius: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {isBuckled ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
              <span>{statusText}</span>
            </div>

            {/* Plotly Deflection Container */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                📈 Pinned-Pinned Column Buckling Profile w(x)
              </h4>
              <Plot
                data={deflectionPlot.traces}
                layout={{
                  autosize: true,
                  height: 280,
                  margin: { l: 50, r: 30, t: 20, b: 40 },
                  xaxis: { title: 'Lateral Deflection w(x) [m]', range: [-0.6, 0.6] },
                  yaxis: { title: 'Column Axis Position x [m]', range: [-0.2, lengthM + 0.5] },
                  annotations: deflectionPlot.annotations,
                  showlegend: true,
                  legend: { x: 0.05, y: 1.1, orientation: 'h' },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)'
                }}
                useResizeHandler={true}
                style={{ width: '100%' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>

            {/* Plotly Euler Curve Container */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                📉 Critical Stress σ_cr vs Slenderness Ratio λ = L/r
              </h4>
              <Plot
                data={eulerCurveTraces}
                layout={{
                  autosize: true,
                  height: 250,
                  margin: { l: 50, r: 30, t: 20, b: 40 },
                  xaxis: { title: 'Slenderness Ratio λ = L/r', range: [0, 200] },
                  yaxis: { title: 'Critical Stress σ_cr [MPa]', range: [0, mat.yieldStr * 1.6] },
                  showlegend: true,
                  legend: { x: 0.35, y: 1.15, orientation: 'h' },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)'
                }}
                useResizeHandler={true}
                style={{ width: '100%' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATHEMATICAL THEORY */}
      {activeTab === 'theory' && (
        <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', lineHeight: '1.7' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', color: '#2563eb' }}>
            📚 Classical Euler Column Buckling Theory
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>1. Differential Equation of Buckling</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                For a pinned-pinned column subjected to an axial load <MathInline math="P" />, the bending moment at position <MathInline math="x" /> is <MathInline math="M(x) = -P w(x)" />.
              </p>
              <MathBlock math="EI \frac{d^2w}{dx^2} + P w = 0" />
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Solving this second-order linear differential equation with boundary conditions <MathInline math="w(0) = 0" /> and <MathInline math="w(L) = 0" /> yields non-trivial sinusoidal solutions:
              </p>
              <MathBlock math="w(x) = C \sin\left(\sqrt{\frac{P}{EI}} x\right)" />
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>2. Euler Critical Load Formula</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                The smallest eigenvalue (<MathInline math="n=1" />) gives the critical elastic buckling load:
              </p>
              <MathBlock math="P_{cr} = \frac{\pi^2 E I}{L^2}" />
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                <strong>Key Rule:</strong> Columns always buckle about the axis of minimum moment of inertia (<MathInline math="I_{min} = \min(I_x, I_y)" />) unless braced along that direction!
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(37, 99, 235, 0.06)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', color: '#1e40af' }}>
              3. Radius of Gyration (<MathInline math="r" />) & Slenderness Ratio (<MathInline math="\lambda" />)
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
              To express buckling resistance independently of cross-section shape, we define the radius of gyration <MathInline math="r" />:
            </p>
            <MathBlock math="r = \sqrt{\frac{I}{A}} \implies I = A r^2" />
            <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
              Substituting <MathInline math="I = A r^2" /> into the Euler formula gives the Critical Buckling Stress <MathInline math="\sigma_{cr}" />:
            </p>
            <MathBlock math="\sigma_{cr} = \frac{P_{cr}}{A} = \frac{\pi^2 E}{(L/r)^2}" />
            <p style={{ fontSize: '0.95rem', marginTop: '12px' }}>
              Where <MathInline math="\lambda = L/r" /> is the dimensionless <strong>Slenderness Ratio</strong>. As <MathInline math="L/r" /> increases, the critical buckling stress drops quadratically!
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: POE QUIZ CHALLENGE */}
      {activeTab === 'poe' && (
        <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Target size={28} color="#8b5cf6" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Predict - Observe - Explain (POE) Challenge</h2>
          </div>

          {/* Phase 1: Predict */}
          {poePhase === 'predict' && (
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', color: '#1e293b' }}>
                1. Predict: Doubling Column Length
              </h3>
              <p style={{ fontSize: '1rem', marginBottom: '18px', color: 'var(--text-main)' }}>
                A pin-ended steel column has length <MathInline math="L" /> and critical buckling load <MathInline math="P_{cr} = 100\text{ kN}" />. If you double its length to <MathInline math="2L" /> while keeping the cross-section identical, what is its new critical buckling load <MathInline math="P_{cr,new}" />?
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { key: 'A', label: 'A) 50 kN (Halved)' },
                  { key: 'B', label: 'B) 25 kN (Reduced to 1/4)' },
                  { key: 'C', label: 'C) 200 kN (Doubled)' },
                  { key: 'D', label: 'D) 12.5 kN (Reduced to 1/8)' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setPoePrediction(opt.key)}
                    style={{
                      padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'left',
                      background: poePrediction === opt.key ? '#8b5cf6' : 'var(--bg-card)',
                      color: poePrediction === opt.key ? '#fff' : 'var(--text-main)', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePoeSubmit}
                disabled={!poePrediction}
                style={{
                  padding: '12px 24px', background: poePrediction ? '#8b5cf6' : '#94a3b8', color: '#fff', border: 'none',
                  borderRadius: '8px', fontWeight: 700, cursor: poePrediction ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                Confirm Prediction & Observe Simulator ➡️
              </button>
            </div>
          )}

          {/* Phase 2: Observe */}
          {poePhase === 'observe' && (
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', color: '#8b5cf6' }}>
                2. Observe Simulator Result
              </h3>
              <p style={{ fontSize: '0.98rem', marginBottom: '16px' }}>
                You predicted choice <strong>{poePrediction}</strong>. Now look at the formula: <MathInline math="P_{cr} = \frac{\pi^2 E I}{L^2}" />. Because length <MathInline math="L" /> is squared in the denominator, doubling <MathInline math="L" /> leads to <MathInline math="(2L)^2 = 4L^2" /> denominator, reducing <MathInline math="P_{cr}" /> by a factor of 4 to <strong>25 kN</strong>!
              </p>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '20px', marginBottom: '12px' }}>
                3. Explain: Why is buckling governed by the weak axis <MathInline math="I_{min}" />?
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { idx: 0, label: 'A) Weak axis has higher stiffness and attracts more load.' },
                  { idx: 1, label: 'B) Buckling requires minimum strain energy, occurring along the axis with lowest flexural rigidity EI_min.' },
                  { idx: 2, label: 'C) The strong axis always yields in compression before buckling occurs.' }
                ].map((opt) => (
                  <button
                    key={opt.idx}
                    onClick={() => handlePoeExplainSubmit(opt.idx)}
                    style={{
                      padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'left',
                      background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phase 3: Explain / Score */}
          {poePhase === 'explain' && (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '24px', borderRadius: '12px', border: '1px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <CheckCircle size={28} color="#10b981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>
                  POE Master Score: {poeScore}%
                </h3>
              </div>
              <p style={{ fontSize: '0.98rem', color: '#064e3b', marginBottom: '16px' }}>
                <strong>Explanation Summary:</strong> Critical buckling occurs at the lowest energy threshold. Because flexural rigidity is <MathInline math="E I" />, buckling naturally instigates about the axis with minimum moment of inertia <MathInline math="I_{min}" />.
              </p>
              <button
                onClick={() => {
                  setPoePhase('predict');
                  setPoePrediction(null);
                  setPoeExplanation(null);
                }}
                style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                🔄 Retry Challenge
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

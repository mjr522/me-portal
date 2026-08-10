import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock, BookOpen, ArrowRight, ShieldAlert, Layers, Activity } from 'lucide-react';

function MathInline({ math }) {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathBlock({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const MATERIALS = {
  steel36: { name: 'Structural Steel (A36)', E: 200, yieldStr: 250, color: '#3b82f6' },
  steel4340: { name: 'High-Strength Steel (4340)', E: 205, yieldStr: 860, color: '#1e40af' },
  aluminum: { name: 'Aluminum 6061-T6', E: 70, yieldStr: 276, color: '#10b981' },
  titanium: { name: 'Titanium Ti-6Al-4V', E: 114, yieldStr: 880, color: '#8b5cf6' },
  timber: { name: 'Structural Timber', E: 12, yieldStr: 35, color: '#f59e0b' },
};

const BOUNDARY_CONDITIONS = {
  pinned_pinned: {
    name: 'Pinned - Pinned',
    theoK: 1.0,
    designK: 1.0,
    desc: 'Both ends free to rotate but fixed in position.',
    shapeFunc: (x, L, delta) => delta * Math.sin((Math.PI * x) / L)
  },
  fixed_free: {
    name: 'Fixed - Free (Cantilever)',
    theoK: 2.0,
    designK: 2.1,
    desc: 'Base fixed against rotation & translation; top free.',
    shapeFunc: (x, L, delta) => delta * (1 - Math.cos((Math.PI * x) / (2 * L)))
  },
  fixed_fixed: {
    name: 'Fixed - Fixed',
    theoK: 0.5,
    designK: 0.65,
    desc: 'Both ends fully fixed against rotation & translation.',
    shapeFunc: (x, L, delta) => (delta / 2) * (1 - Math.cos((2 * Math.PI * x) / L))
  },
  fixed_pinned: {
    name: 'Fixed - Pinned',
    theoK: 0.707,
    designK: 0.8,
    desc: 'Base fixed against rotation; top pinned.',
    shapeFunc: (x, L, delta) => delta * (2 * Math.pow(x / L, 3) - 3 * Math.pow(x / L, 2) + (x / L))
  }
};

export default function ME330_Lesson38({ topicName, onComplete }) {
  // Simulator State
  const [materialKey, setMaterialKey] = useState('steel36');
  const [bcKey, setBcKey] = useState('pinned_pinned');
  const [useDesignK, setUseDesignK] = useState(false);
  
  // Section & Length Dimensions (mm & m)
  const [widthB, setWidthB] = useState(60);
  const [heightH, setHeightH] = useState(80);
  const [lengthM, setLengthM] = useState(3.0);
  const [appliedLoadKN, setAppliedLoadKN] = useState(60);

  // Active Tab
  const [activeTab, setActiveTab] = useState('sim'); // 'sim', 'theory', 'poe'

  // POE Quiz Phase State
  const [poePhase, setPoePhase] = useState('predict'); // 'predict', 'observe', 'explain'
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeExplanation, setPoeExplanation] = useState(null);
  const [poeScore, setPoeScore] = useState(0);

  const mat = MATERIALS[materialKey];
  const bc = BOUNDARY_CONDITIONS[bcKey];
  const K = useDesignK ? bc.designK : bc.theoK;
  const isLocked = poePhase === 'predict';

  // Section Calculations (Rectangular b x h)
  const area = widthB * heightH; // mm^2
  const Ix = (widthB * Math.pow(heightH, 3)) / 12;
  const Iy = (heightH * Math.pow(widthB, 3)) / 12;
  const Imin = Math.min(Ix, Iy);
  const rMin = Math.sqrt(Imin / area); // mm

  const lengthMM = lengthM * 1000;
  const Le_m = K * lengthM;
  const slendernessEff = (K * lengthMM) / rMin; // KL/r

  const E_MPa = mat.E * 1000;

  // Transition Slenderness Ratio C_c = sqrt(2 * pi^2 * E / sigma_y)
  const C_c = Math.sqrt((2 * Math.PI * Math.PI * E_MPa) / mat.yieldStr);

  // Inelastic vs Elastic Critical Stress Calculation
  let sigma_cr = 0; // MPa
  let regime = '';

  if (slendernessEff <= C_c) {
    regime = 'Inelastic Buckling (Johnson Parabolic Equation)';
    // Johnson Parabolic Formula: sigma_cr = sigma_y * [1 - 0.5 * (lambda / C_c)^2]
    sigma_cr = mat.yieldStr * (1 - 0.5 * Math.pow(slendernessEff / C_c, 2));
  } else {
    regime = 'Elastic Buckling (Euler Formula)';
    // Euler Formula: sigma_cr = pi^2 * E / (KL/r)^2
    sigma_cr = (Math.PI * Math.PI * E_MPa) / Math.pow(slendernessEff, 2);
  }

  const P_cr_N = sigma_cr * area;
  const P_cr_kN = P_cr_N / 1000;
  const appliedStress = (appliedLoadKN * 1000) / area; // MPa
  const factorOfSafety = P_cr_kN / (appliedLoadKN || 0.001);

  const isBuckled = appliedLoadKN >= P_cr_kN;

  // Plot 1: Deflected Mode Shape w(x)
  const generateDeflectionPlot = () => {
    const points = 60;
    const xVals = [];
    const yVals = [];
    const maxDeflection = isBuckled ? 0.3 * lengthM : 0.3 * lengthM * (appliedLoadKN / P_cr_kN);

    for (let i = 0; i <= points; i++) {
      const x = (i / points) * lengthM;
      const w = bc.shapeFunc(x, lengthM, maxDeflection);
      xVals.push(w);
      yVals.push(x);
    }

    const traces = [
      // Straight Unloaded Column Axis
      {
        x: Array(points + 1).fill(0),
        y: yVals,
        mode: 'lines',
        name: 'Initial Column Axis',
        line: { color: '#94a3b8', width: 2, dash: 'dash' }
      },
      // Deflected Shape under End Conditions
      {
        x: xVals,
        y: yVals,
        mode: 'lines',
        name: `${bc.name} Mode (K = ${K})`,
        line: { color: isBuckled ? '#ef4444' : '#2563eb', width: 5 }
      }
    ];

    // Inflection point markers if Fixed-Fixed or Fixed-Pinned
    if (bcKey === 'fixed_fixed') {
      traces.push({
        x: [bc.shapeFunc(lengthM * 0.25, lengthM, maxDeflection), bc.shapeFunc(lengthM * 0.75, lengthM, maxDeflection)],
        y: [lengthM * 0.25, lengthM * 0.75],
        mode: 'markers',
        name: 'Inflection Points (M=0)',
        marker: { size: 10, color: '#f59e0b', symbol: 'x' }
      });
    }

    return traces;
  };

  // Plot 2: Johnson Parabolic vs Euler Column Curve (sigma_cr vs KL/r)
  const generateColumnCurvePlot = () => {
    const lambdaArray = [];
    const johnsonArray = [];
    const eulerArray = [];

    for (let s = 5; s <= 200; s += 2) {
      lambdaArray.push(s);

      // Johnson curve up to C_c
      if (s <= C_c) {
        const sigJ = mat.yieldStr * (1 - 0.5 * Math.pow(s / C_c, 2));
        johnsonArray.push(sigJ);
      } else {
        johnsonArray.push(null);
      }

      // Euler curve
      const sigE = (Math.PI * Math.PI * E_MPa) / (s * s);
      eulerArray.push(sigE);
    }

    const transitionSigma = mat.yieldStr / 2;

    const traces = [
      // Johnson Parabolic Curve
      {
        x: lambdaArray.filter((_, i) => johnsonArray[i] !== null),
        y: johnsonArray.filter((v) => v !== null),
        mode: 'lines',
        name: 'Johnson Parabola (Inelastic)',
        line: { color: '#f59e0b', width: 3.5 }
      },
      // Euler Curve
      {
        x: lambdaArray,
        y: eulerArray,
        mode: 'lines',
        name: 'Euler Curve (Elastic)',
        line: { color: '#3b82f6', width: 3, dash: 'dash' }
      },
      // Transition Point (C_c, sigma_y / 2)
      {
        x: [C_c],
        y: [transitionSigma],
        mode: 'markers+text',
        name: `Transition C_c = ${C_c.toFixed(1)}`,
        marker: { size: 12, color: '#8b5cf6', symbol: 'diamond' },
        text: [`C_c (${C_c.toFixed(1)})`],
        textposition: 'top right',
        font: { color: '#8b5cf6', size: 11, family: 'Outfit, sans-serif' }
      },
      // Current Operating Point
      {
        x: [slendernessEff],
        y: [sigma_cr],
        mode: 'markers',
        name: 'Current Operating Column',
        marker: {
          size: 14,
          color: isBuckled ? '#ef4444' : '#10b981',
          symbol: 'circle',
          line: { color: '#ffffff', width: 2 }
        }
      }
    ];

    return traces;
  };

  const deflectionTraces = generateDeflectionPlot();
  const columnCurveTraces = generateColumnCurvePlot();

  // POE Quiz Handlers
  const handlePoeSubmit = () => {
    if (!poePrediction) return;
    setPoePhase('observe');
  };

  const handlePoeExplainSubmit = (optionIndex) => {
    setPoeExplanation(optionIndex);
    setPoePhase('explain');
    if (optionIndex === 0 && poePrediction === 'A') {
      setPoeScore(100);
      if (onComplete) onComplete(topicName);
    } else if (poePrediction === 'A') {
      setPoeScore(75);
      if (onComplete) onComplete(topicName);
    } else {
      setPoeScore(40);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'var(--font-family)' }}>
      {/* Header Banner */}
      <div className="portal-header" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2rem' }}>🔩</span>
          <span className="unit-card-badge" style={{ background: '#8b5cf6', color: '#fff', fontSize: '0.85rem' }}>ME 330 • Unit 4 • Lesson 38</span>
        </div>
        <h1 className="portal-title" style={{ fontSize: '2.2rem' }}>Effective Length Factors (K) & Yield vs Buckling Transition</h1>
        <p className="portal-desc">
          Explore end support constraints, effective length <MathInline math="L_e = K L" />, transition slenderness ratio <MathInline math="C_c" />, and Johnson Parabolic vs Euler Elastic column design curves.
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
            📊 Effective Length Simulator
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: activeTab === 'theory' ? '#2563eb' : 'rgba(255,255,255,0.1)', color: '#fff', transition: 'all 0.2s'
            }}
          >
            📖 Theory & Johnson Formula
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
              ⚙️ Support & Geometry Setup
            </h3>

            {/* Boundary Condition Selector */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                End Support Boundary Conditions:
              </label>
              <select
                value={bcKey}
                onChange={(e) => setBcKey(e.target.value)}
                disabled={isLocked}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontWeight: 600 }}
              >
                {Object.entries(BOUNDARY_CONDITIONS).map(([k, b]) => (
                  <option key={k} value={k}>
                    {b.name} (K = {useDesignK ? b.designK : b.theoK})
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>{bc.desc}</p>
            </div>

            {/* K Factor Toggle: Theoretical vs Design */}
            <div style={{ marginBottom: '18px', background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Use AISC Recommended Design K:</span>
              <button
                onClick={() => setUseDesignK(!useDesignK)}
                disabled={isLocked}
                style={{
                  padding: '6px 14px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer',
                  background: useDesignK ? '#8b5cf6' : '#94a3b8', color: '#fff'
                }}
              >
                {useDesignK ? `Design K (${bc.designK})` : `Theoretical K (${bc.theoK})`}
              </button>
            </div>

            {/* Material Dropdown */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Material Selection:
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

            {/* Dimensions */}
            <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '10px', marginBottom: '18px' }}>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                  <span>Cross-Section Width b:</span>
                  <span style={{ color: '#2563eb' }}>{widthB} mm</span>
                </div>
                <input
                  type="range" min="20" max="150" step="1" value={widthB}
                  onChange={(e) => setWidthB(Number(e.target.value))} disabled={isLocked}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                  <span>Cross-Section Height h:</span>
                  <span style={{ color: '#2563eb' }}>{heightH} mm</span>
                </div>
                <input
                  type="range" min="20" max="200" step="1" value={heightH}
                  onChange={(e) => setHeightH(Number(e.target.value))} disabled={isLocked}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>
            </div>

            {/* Column Length & Load Sliders */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                <span>Actual Length L:</span>
                <span style={{ color: '#2563eb' }}>{lengthM.toFixed(2)} m</span>
              </div>
              <input
                type="range" min="0.5" max="8.0" step="0.1" value={lengthM}
                onChange={(e) => setLengthM(Number(e.target.value))} disabled={isLocked}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600 }}>
                <span>Applied Load P:</span>
                <span style={{ color: isBuckled ? '#ef4444' : '#2563eb', fontWeight: 700 }}>{appliedLoadKN.toFixed(1)} kN</span>
              </div>
              <input
                type="range" min="1" max={Math.max(200, Math.round(P_cr_kN * 1.5))} step="1" value={appliedLoadKN}
                onChange={(e) => setAppliedLoadKN(Number(e.target.value))} disabled={isLocked}
                style={{ width: '100%', accentColor: isBuckled ? '#ef4444' : '#2563eb' }}
              />
            </div>

            {/* Outputs Card */}
            <div style={{ background: 'rgba(139, 92, 246, 0.06)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6d28d9', marginBottom: '10px' }}>
                📐 Effective Length & Failure Regime
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div>Factor K: <strong>{K}</strong></div>
                <div>Effective Length L_e: <strong>{Le_m.toFixed(2)} m</strong></div>
                <div>Slenderness λ_eff: <strong>{slendernessEff.toFixed(1)}</strong></div>
                <div>Transition C_c: <strong>{C_c.toFixed(1)}</strong></div>
                <div style={{ gridColumn: 'span 2', fontSize: '0.9rem', color: slendernessEff <= C_c ? '#f59e0b' : '#3b82f6', fontWeight: 700 }}>
                  Regime: {regime}
                </div>
                <div style={{ gridColumn: 'span 2', fontSize: '0.95rem', paddingTop: '6px', borderTop: '1px dashed rgba(139,92,246,0.3)' }}>
                  Critical Load P_cr: <strong style={{ color: '#2563eb', fontSize: '1.05rem' }}>{P_cr_kN.toFixed(1)} kN</strong>
                </div>
                <div>Critical Stress σ_cr: <strong>{sigma_cr.toFixed(1)} MPa</strong></div>
                <div>Safety Factor FS: <strong style={{ color: factorOfSafety >= 1.5 ? '#10b981' : '#ef4444' }}>{factorOfSafety.toFixed(2)}</strong></div>
              </div>
            </div>
          </div>

          {/* Visualization Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status Banner */}
            <div style={{
              background: isBuckled ? '#ef4444' : '#10b981', color: '#fff', padding: '14px 20px', borderRadius: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              {isBuckled ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
              <span>{isBuckled ? `BUCKLED! Applied P (${appliedLoadKN} kN) ≥ P_cr (${P_cr_kN.toFixed(1)} kN)` : `SAFE EQUILIBRIUM (FS = ${factorOfSafety.toFixed(2)})`}</span>
            </div>

            {/* Plotly Deflection Curve */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                📐 Effective Length Mode Shape ({bc.name}, K = {K})
              </h4>
              <Plot
                data={deflectionTraces}
                layout={{
                  autosize: true,
                  height: 280,
                  margin: { l: 50, r: 30, t: 20, b: 40 },
                  xaxis: { title: 'Deflection w(x) [m]', range: [-0.6, 0.6] },
                  yaxis: { title: 'Column Position x [m]', range: [-0.2, lengthM + 0.4] },
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

            {/* Plotly Johnson vs Euler Curve */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                📉 Column Design Curve: Johnson Parabola vs Euler Curve
              </h4>
              <Plot
                data={columnCurveTraces}
                layout={{
                  autosize: true,
                  height: 250,
                  margin: { l: 50, r: 30, t: 20, b: 40 },
                  xaxis: { title: 'Effective Slenderness Ratio λ_eff = KL/r', range: [0, 200] },
                  yaxis: { title: 'Critical Stress σ_cr [MPa]', range: [0, mat.yieldStr * 1.2] },
                  showlegend: true,
                  legend: { x: 0.15, y: 1.15, orientation: 'h' },
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
            📚 Effective Length Factors & Inelastic Buckling Theory
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>1. Effective Length <MathInline math="L_e = K L" /></h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                The effective length <MathInline math="L_e" /> represents the distance between points of zero moment (inflection points) on the deflected column axis.
              </p>
              <MathBlock math="P_{cr} = \frac{\pi^2 E I}{(K L)^2}" />
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Fixed constraints prevent end rotation, shortening the effective length (<MathInline math="K < 1.0" />) and dramatically increasing buckling capacity!
              </p>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>2. Transition Slenderness <MathInline math="C_c" /></h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                The theoretical boundary between elastic buckling and yielding occurs when critical stress reaches half the yield strength (<MathInline math="\sigma_{cr} = \sigma_y / 2" />):
              </p>
              <MathBlock math="C_c = \sqrt{\frac{2\pi^2 E}{\sigma_y}}" />
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '24px', borderRadius: '12px', border: '1px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', color: '#b45309' }}>
              3. Johnson Parabolic Formula for Intermediate Columns (<MathInline math="\lambda_{eff} \le C_c" />)
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
              For short and intermediate columns, local material yielding occurs before overall elastic stability is lost. The empirical Johnson Parabolic formula accounts for inelastic buckling:
            </p>
            <MathBlock math="\sigma_{cr} = \sigma_y \left[ 1 - \frac{\sigma_y (K L/r)^2}{4 \pi^2 E} \right] = \sigma_y \left[ 1 - \frac{1}{2} \left( \frac{\lambda_{eff}}{C_c} \right)^2 \right]" />
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px' }}>
                1. Predict: Fixed-Fixed vs Pinned-Pinned Buckling Capacity
              </h3>
              <p style={{ fontSize: '1rem', marginBottom: '18px' }}>
                If you change a column's end supports from <strong>Pinned-Pinned (K=1.0)</strong> to <strong>Fixed-Fixed (K=0.5)</strong> while keeping all other dimensions identical, how does the critical buckling load <MathInline math="P_{cr}" /> change?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { key: 'A', label: 'A) Increases by a factor of 4 (4x P_cr)' },
                  { key: 'B', label: 'B) Doubles (2x P_cr)' },
                  { key: 'C', label: 'C) Halves (0.5x P_cr)' },
                  { key: 'D', label: 'D) Remains unchanged' }
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
                  borderRadius: '8px', fontWeight: 700, cursor: poePrediction ? 'pointer' : 'not-allowed'
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
                You predicted <strong>Choice {poePrediction}</strong>. Using <MathInline math="P_{cr} = \frac{\pi^2 E I}{(K L)^2}" />, when <MathInline math="K = 0.5" />, the denominator becomes <MathInline math="(0.5 L)^2 = 0.25 L^2" />. Dividing by 0.25 yields a <strong>4x increase</strong> in load capacity!
              </p>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '20px', marginBottom: '12px' }}>
                3. Explain: Why does the Johnson Parabolic formula replace Euler for short columns (<MathInline math="\lambda < C_c" />)?
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { idx: 0, label: 'A) In short columns, local plastic yielding precedes overall elastic instability, making pure Euler theory over-predict load capacity.' },
                  { idx: 1, label: 'B) Short columns cannot bend at all due to zero shear stress.' },
                  { idx: 2, label: 'C) The radius of gyration shrinks to zero for short lengths.' }
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
                <strong>Explanation Summary:</strong> High slenderness (<MathInline math="\lambda > C_c" />) fails elastically via Euler buckling. Low slenderness (<MathInline math="\lambda \le C_c" />) causes yield stress limits to be reached, necessitating Johnson parabolic transition curve.
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

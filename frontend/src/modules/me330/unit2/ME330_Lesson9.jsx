import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { HelpCircle, CheckCircle, AlertTriangle, RefreshCw, BarChart2, BookOpen, Sliders } from 'lucide-react';

function MathInline({ math }) {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathBlock({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ME330_Lesson9() {
  const [activeTab, setActiveTab] = useState('sandbox'); // 'sandbox', 'poe', 'theory'
  
  // Section parameters
  const [sectionType, setSectionType] = useState('rectangular'); // rectangular, ibeam, circular
  const [b, setB] = useState(100); // mm
  const [h, setH] = useState(200); // mm
  const [tf, setTf] = useState(15); // mm (for I-beam)
  const [tw, setTw] = useState(10); // mm (for I-beam)
  const [d, setD] = useState(150); // mm (diameter for circle)
  
  // Load and Yield properties
  const [moment, setMoment] = useState(25); // kN*m
  const [sigmaYield, setSigmaYield] = useState(250); // MPa (e.g. A36 steel)
  const [evalY, setEvalY] = useState(100); // mm (height from NA)

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Geometric & Mechanics Calculations
  let I = 0; // mm^4
  let c = 0; // mm (max distance from NA)
  let area = 0; // mm^2

  if (sectionType === 'rectangular') {
    c = h / 2;
    I = (b * Math.pow(h, 3)) / 12;
    area = b * h;
  } else if (sectionType === 'circular') {
    c = d / 2;
    I = (Math.PI * Math.pow(d, 4)) / 64;
    area = (Math.PI * Math.pow(d, 2)) / 4;
  } else if (sectionType === 'ibeam') {
    c = h / 2;
    // Outer rect - Inner cutouts
    const I_outer = (b * Math.pow(h, 3)) / 12;
    const inner_h = h - 2 * tf;
    const inner_w = b - tw;
    const I_inner = (inner_w * Math.pow(inner_h, 3)) / 12;
    I = I_outer - I_inner;
    area = 2 * b * tf + inner_h * tw;
  }

  // Convert Moment to N*mm: 1 kN*m = 1e6 N*mm
  const M_Nmm = moment * 1e6;
  const S = I / c; // Section Modulus mm^3
  const sigmaMax = M_Nmm / S; // MPa (N/mm^2)
  const clampedY = Math.min(Math.max(evalY, -c), c);
  const sigmaY = -(M_Nmm * clampedY) / I; // Flexure formula: sigma = -M*y / I
  const safetyFactor = sigmaYield / Math.abs(sigmaMax);

  // Plotly Stress Profile Data
  const yValues = [];
  const stressValues = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const yVal = -c + (2 * c * i) / steps;
    yValues.push(yVal);
    // sigma = -M * y / I
    const sig = -(M_Nmm * yVal) / I;
    stressValues.push(sig);
  }

  const stressProfileTrace = {
    x: stressValues,
    y: yValues,
    mode: 'lines+markers',
    name: 'Bending Stress σ(y)',
    line: { color: '#8b5cf6', width: 3 },
    marker: { size: 4 }
  };

  const zeroLine = {
    x: [0, 0],
    y: [-c * 1.1, c * 1.1],
    mode: 'lines',
    name: 'Neutral Axis (y=0)',
    line: { color: '#64748b', dash: 'dash', width: 2 }
  };

  const selectedPoint = {
    x: [sigmaY],
    y: [clampedY],
    mode: 'markers',
    name: `Point y=${clampedY.toFixed(0)}mm`,
    marker: { color: '#ef4444', size: 12, symbol: 'diamond' }
  };

  const plotLayout = {
    title: { text: 'Flexural Stress Profile Across Beam Height', font: { color: '#f8fafc', size: 16 } },
    xaxis: { title: 'Bending Stress σ (MPa) [ Tension + / Comp - ]', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'Distance y from Neutral Axis (mm)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 60, r: 30, t: 50, b: 50 },
    showlegend: true,
    legend: { x: 0.05, y: 0.95, font: { color: '#f8fafc' } }
  };

  const handleReset = () => {
    setSectionType('rectangular');
    setB(100);
    setH(200);
    setTf(15);
    setTw(10);
    setD(150);
    setMoment(25);
    setSigmaYield(250);
    setEvalY(100);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 9</div>
        <h1 style={styles.title}>Beams in Bending & The Flexure Formula</h1>
        <p style={styles.subtitle}>
          Explore elastic bending stresses, Section Modulus <MathInline math="S = I/c" />, and maximum flexural stress <MathInline math="\sigma_{max} = \frac{M}{S}" />.
        </p>
      </header>

      {/* Navigation Tabs */}
      <div style={styles.tabBar}>
        <button
          style={activeTab === 'sandbox' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('sandbox')}
        >
          <Sliders size={18} style={{ marginRight: 8 }} /> Interactive Sandbox
        </button>
        <button
          style={activeTab === 'poe' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('poe')}
        >
          <HelpCircle size={18} style={{ marginRight: 8 }} /> POE Challenge
        </button>
        <button
          style={activeTab === 'theory' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('theory')}
        >
          <BookOpen size={18} style={{ marginRight: 8 }} /> Theory & Derivations
        </button>
      </div>

      {/* SANDBOX TAB */}
      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          {/* Controls Column */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Parameters & Section Geometry</h2>

            {/* Section Type Selector */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Cross-Section Geometry:</label>
              <select
                style={styles.select}
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
              >
                <option value="rectangular">Solid Rectangular (b × h)</option>
                <option value="ibeam">Structural I-Beam (Flange & Web)</option>
                <option value="circular">Solid Circular (Diameter D)</option>
              </select>
            </div>

            {/* Dimension Sliders */}
            {sectionType === 'rectangular' && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Width b: {b} mm</label>
                  <input
                    type="range" min="30" max="300" value={b}
                    onChange={(e) => setB(Number(e.target.value))}
                    style={styles.slider}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Height h: {h} mm</label>
                  <input
                    type="range" min="50" max="400" value={h}
                    onChange={(e) => setH(Number(e.target.value))}
                    style={styles.slider}
                  />
                </div>
              </>
            )}

            {sectionType === 'circular' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Diameter D: {d} mm</label>
                <input
                  type="range" min="40" max="300" value={d}
                  onChange={(e) => setD(Number(e.target.value))}
                  style={styles.slider}
                />
              </div>
            )}

            {sectionType === 'ibeam' && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Total Height h: {h} mm</label>
                  <input
                    type="range" min="100" max="400" value={h}
                    onChange={(e) => setH(Number(e.target.value))}
                    style={styles.slider}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Flange Width b: {b} mm</label>
                  <input
                    type="range" min="50" max="250" value={b}
                    onChange={(e) => setB(Number(e.target.value))}
                    style={styles.slider}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Flange Thickness tf: {tf} mm</label>
                  <input
                    type="range" min="5" max="30" value={tf}
                    onChange={(e) => setTf(Number(e.target.value))}
                    style={styles.slider}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Web Thickness tw: {tw} mm</label>
                  <input
                    type="range" min="5" max="25" value={tw}
                    onChange={(e) => setTw(Number(e.target.value))}
                    style={styles.slider}
                  />
                </div>
              </>
            )}

            {/* Bending Load Slider */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Bending Moment M: {moment} kN·m</label>
              <input
                type="range" min="-100" max="100" step="1" value={moment}
                onChange={(e) => setMoment(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            {/* Evaluation y Slider */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Evaluation Distance y from N.A.: {clampedY} mm</label>
              <input
                type="range" min={-c} max={c} step="1" value={clampedY}
                onChange={(e) => setEvalY(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            {/* Yield Strength Slider */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Material Yield Strength σ_yield: {sigmaYield} MPa</label>
              <input
                type="range" min="100" max="800" step="10" value={sigmaYield}
                onChange={(e) => setSigmaYield(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <button style={styles.resetBtn} onClick={handleReset}>
              <RefreshCw size={16} style={{ marginRight: 6 }} /> Reset All Parameters
            </button>
          </div>

          {/* Results & Graphics Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Calculation Output Cards */}
            <div style={styles.resultsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Inertia I_z</span>
                <span style={styles.metricValue}>{(I / 1e4).toFixed(2)} ×10⁴ mm⁴</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Section Modulus S</span>
                <span style={styles.metricValue}>{(S / 1e3).toFixed(2)} ×10³ mm³</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Max Stress |σ_max|</span>
                <span style={{ ...styles.metricValue, color: Math.abs(sigmaMax) > sigmaYield ? '#ef4444' : '#10b981' }}>
                  {Math.abs(sigmaMax).toFixed(1)} MPa
                </span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Factor of Safety</span>
                <span style={{ ...styles.metricValue, color: safetyFactor >= 1.0 ? '#10b981' : '#ef4444' }}>
                  {safetyFactor.toFixed(2)} {safetyFactor >= 1.0 ? '✅' : '⚠️ FAIL'}
                </span>
              </div>
            </div>

            {/* Live Point Evaluation Banner */}
            <div style={styles.bannerCard}>
              <div style={{ fontWeight: 600, color: '#a78bfa' }}>
                Stress at y = {clampedY} mm:
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 4 }}>
                <MathInline math={`\\sigma(y) = -\\frac{M \\cdot y}{I} = ${sigmaY.toFixed(2)} \\text{ MPa}`} />
                <span style={{ marginLeft: 12, fontSize: '0.95rem', color: sigmaY > 0 ? '#34d399' : sigmaY < 0 ? '#f87171' : '#94a3b8' }}>
                  ({sigmaY > 0 ? 'Tension' : sigmaY < 0 ? 'Compression' : 'Neutral Axis'})
                </span>
              </div>
            </div>

            {/* Plotly Chart */}
            <div style={styles.chartWrapper}>
              <Plot
                data={[stressProfileTrace, zeroLine, selectedPoint]}
                layout={plotLayout}
                useResizeHandler={true}
                style={{ width: '100%', height: '360px' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      )}

      {/* POE CHALLENGE TAB */}
      {activeTab === 'poe' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>💡 Predict-Observe-Explain (POE) Challenge</h2>
          <p style={styles.poeQuestion}>
            <strong>Question:</strong> Suppose you have a rectangular cross-section beam subjected to a constant bending moment <MathInline math="M" />.
            If you change the cross-section by <strong>doubling its depth <MathInline math="h" /></strong> while keeping its width <MathInline math="b" /> unchanged, by what factor does the maximum flexural stress <MathInline math="\sigma_{max}" /> change?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'half', text: 'It decreases to 1/2 of original stress' },
              { id: 'quarter', text: 'It decreases to 1/4 of original stress (decreases by a factor of 4)' },
              { id: 'double', text: 'It doubles' },
              { id: 'quadruple', text: 'It quadruples' }
            ].map((opt) => (
              <label
                key={opt.id}
                style={{
                  ...styles.poeOptionLabel,
                  borderColor: poePrediction === opt.id ? '#8b5cf6' : '#334155',
                  backgroundColor: poePrediction === opt.id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(30, 41, 59, 0.5)'
                }}
              >
                <input
                  type="radio"
                  name="poe"
                  value={opt.id}
                  checked={poePrediction === opt.id}
                  onChange={() => {
                    setPoePrediction(opt.id);
                    setPoeSubmitted(true);
                  }}
                />
                <span style={{ marginLeft: 10 }}>{opt.text}</span>
              </label>
            ))}
          </div>

          {poeSubmitted && (
            <div
              style={{
                ...styles.feedbackBox,
                backgroundColor: poePrediction === 'quarter' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'quarter' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'quarter' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! Max stress is reduced to 1/4 (25%).
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Not quite. Consider how depth h affects Inertia I vs outer distance c!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                For a rectangular section, <MathInline math="I = \frac{b h^3}{12}" /> and <MathInline math="c = \frac{h}{2}" />.<br />
                The Section Modulus is <MathInline math="S = \frac{I}{c} = \frac{b h^2}{6}" />.<br />
                Plugging into flexure stress:
                <MathBlock math="\sigma_{max} = \frac{M}{S} = \frac{6 M}{b h^2}" />
                Because <MathInline math="h" /> is squared in the denominator, doubling <MathInline math="h \to 2h" /> causes <MathInline math="h^2 \to 4 h^2" />, reducing stress to <MathInline math="\frac{1}{4}" /> of its original value! Depth is much more effective than width at resisting bending!
              </div>
            </div>
          )}
        </div>
      )}

      {/* THEORY TAB */}
      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory & Derivations</h2>
          <div style={styles.theoryContent}>
            <h3>1. Kinematic Assumptions of Pure Bending (Euler-Bernoulli Beam Theory)</h3>
            <ul>
              <li>Planar cross-sections perpendicular to the longitudinal axis remain plane and perpendicular after bending.</li>
              <li>Material is linear elastic, isotropic, and homogeneous obeying Hooke's Law (<MathInline math="\sigma = E \epsilon" />).</li>
              <li>Deformations are small.</li>
            </ul>

            <h3>2. Strain Distribution & The Neutral Axis</h3>
            <p>
              The normal strain varies linearly with distance <MathInline math="y" /> from the neutral surface:
              <MathBlock math="\epsilon_x(y) = -\frac{y}{\rho}" />
              where <MathInline math="\rho" /> is the radius of curvature.
            </p>

            <h3>3. Flexure Formula Derivation</h3>
            <p>
              Applying Hooke's law: <MathInline math="\sigma_x = E \epsilon_x = -\frac{E}{\rho} y" />.<br />
              Equating the resultant internal bending moment to the stress distribution across cross-section area <MathInline math="A" />:
              <MathBlock math="M = -\int_A y \, \sigma_x \, dA = \frac{E}{\rho} \int_A y^2 \, dA = \frac{E}{\rho} I" />
              Substituting <MathInline math="\frac{E}{\rho} = \frac{M}{I}" /> back gives the fundamental <strong>Elastic Flexure Formula</strong>:
              <MathBlock math="\sigma(y) = -\frac{M y}{I}" />
            </p>

            <h3>4. Section Modulus <MathInline math="S" /></h3>
            <p>
              Maximum flexural stress occurs at the extreme outer fibers (<MathInline math="y = c" />):
              <MathBlock math="\sigma_{max} = \frac{M c}{I} = \frac{M}{S} \quad \text{where } S = \frac{I}{c}" />
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    marginBottom: '24px',
    textAlign: 'left'
  },
  titleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '9999px',
    background: 'rgba(139, 92, 246, 0.2)',
    color: '#a78bfa',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '8px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: '4px 0 8px 0',
    color: '#f8fafc'
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0
  },
  tabBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '1px solid #334155',
    paddingBottom: '12px'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 600,
    transition: 'all 0.2s'
  },
  activeTab: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    background: '#8b5cf6',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
  },
  gridTwoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: '24px'
  },
  card: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #334155',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: '0 0 16px 0',
    color: '#f8fafc'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#cbd5e1',
    marginBottom: '6px',
    fontWeight: 500
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: '#0f172a',
    color: '#f8fafc',
    fontSize: '0.9rem'
  },
  slider: {
    width: '100%',
    accentColor: '#8b5cf6'
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #475569',
    background: '#334155',
    color: '#f8fafc',
    cursor: 'pointer',
    fontWeight: 600,
    marginTop: '12px'
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  metricCard: {
    background: '#0f172a',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column'
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: 600
  },
  metricValue: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#f8fafc',
    marginTop: '4px'
  },
  bannerCard: {
    background: '#0f172a',
    borderLeft: '4px solid #8b5cf6',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    borderLeftWidth: '4px'
  },
  chartWrapper: {
    background: '#0f172a',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #334155'
  },
  poeQuestion: {
    fontSize: '1.05rem',
    lineHeight: 1.6,
    color: '#e2e8f0',
    marginBottom: '20px'
  },
  poeOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  poeOptionLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 18px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  feedbackBox: {
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid'
  },
  theoryContent: {
    lineHeight: 1.7,
    color: '#cbd5e1'
  }
};

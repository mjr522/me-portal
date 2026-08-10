import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Sliders, BookOpen } from 'lucide-react';

function MathInline({ math }) {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathBlock({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ME330_Lesson14() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Controls
  const [loadType, setLoadType] = useState('constant'); // 'constant', 'triangular'
  const [w0, setW0] = useState(10); // kN/m
  const [L, setL] = useState(6); // m
  const [queryX, setQueryX] = useState(3.0); // m

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Calculations for Simply Supported Beam
  // 1) Constant load w(x) = w0:
  //    Total load W = w0 * L, R_A = R_B = w0 * L / 2
  //    V(x) = R_A - w0 * x = w0*(L/2 - x)
  //    M(x) = R_A * x - w0 * x^2 / 2 = (w0/2)*(L*x - x^2)
  // 2) Triangular load w(x) = w0 * x / L:
  //    Total load W = w0 * L / 2
  //    Resultant acts at 2/3 L from left support => R_B = W * (L/3)/L = W/3 = w0*L/6
  //    R_A = W - R_B = w0*L/3
  //    V(x) = R_A - integral_0^x (w0*u/L) du = w0*L/3 - w0*x^2/(2L)
  //    M(x) = R_A * x - integral_0^x (w0*u/L)(x - u) du = (w0*L/3)*x - w0*x^3/(6L)

  const numPts = 200;
  const xArr = [];
  const wArr = [];
  const vArr = [];
  const mArr = [];

  const Ra = loadType === 'constant' ? (w0 * L) / 2 : (w0 * L) / 3;

  for (let i = 0; i <= numPts; i++) {
    const x = (L * i) / numPts;
    xArr.push(x);

    let wx = 0;
    let vx = 0;
    let mx = 0;

    if (loadType === 'constant') {
      wx = w0;
      vx = Ra - w0 * x;
      mx = (w0 / 2) * (L * x - x * x);
    } else {
      wx = (w0 * x) / L;
      vx = Ra - (w0 * x * x) / (2 * L);
      mx = (w0 * L / 3) * x - (w0 * Math.pow(x, 3)) / (6 * L);
    }

    wArr.push(wx);
    vArr.push(vx);
    mArr.push(mx);
  }

  // Live Query point values & slopes
  const clampedX = Math.min(Math.max(queryX, 0), L);
  const qWx = loadType === 'constant' ? w0 : (w0 * clampedX) / L;
  const qVx = loadType === 'constant' ? Ra - w0 * clampedX : Ra - (w0 * clampedX * clampedX) / 2 / L;
  const qMx = loadType === 'constant'
    ? (w0 / 2) * (L * clampedX - clampedX * clampedX)
    : (w0 * L / 3) * clampedX - (w0 * Math.pow(clampedX, 3)) / (6 * L);

  // Zero Shear position (where M is peak!)
  // Constant: x_zero = L/2
  // Triangular: V(x) = 0 => w0*L/3 = w0*x^2/(2L) => x^2 = 2/3 L^2 => x = sqrt(2/3)*L ≈ 0.8165 L
  const xZeroShear = loadType === 'constant' ? L / 2 : Math.sqrt(2 / 3) * L;
  const mPeak = loadType === 'constant'
    ? (w0 * L * L) / 8
    : (w0 * L * L) / (9 * Math.sqrt(3));

  // Plotly Traces
  const wTrace = { x: xArr, y: wArr, mode: 'lines', name: 'w(x) [kN/m]', line: { color: '#ef4444', width: 3 } };
  const vTrace = { x: xArr, y: vArr, mode: 'lines', name: 'V(x) [kN]', line: { color: '#06b6d4', width: 3 } };
  const mTrace = { x: xArr, y: mArr, mode: 'lines', name: 'M(x) [kN·m]', line: { color: '#8b5cf6', width: 3 } };

  const cutLineW = { x: [clampedX, clampedX], y: [0, Math.max(...wArr) * 1.2], mode: 'lines', line: { color: '#f59e0b', dash: 'dot' } };
  const cutLineV = { x: [clampedX, clampedX], y: [Math.min(...vArr) * 1.2, Math.max(...vArr) * 1.2], mode: 'lines', line: { color: '#f59e0b', dash: 'dot' } };
  const cutLineM = { x: [clampedX, clampedX], y: [0, Math.max(...mArr) * 1.2], mode: 'lines', line: { color: '#f59e0b', dash: 'dot' } };

  const handleReset = () => {
    setLoadType('constant');
    setW0(10);
    setL(6);
    setQueryX(3.0);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 14</div>
        <h1 style={styles.title}>Shear & Bending Moment Calculus Relations</h1>
        <p style={styles.subtitle}>
          Understand <MathInline math="\frac{dV}{dx} = -w(x)" /> and <MathInline math="\frac{dM}{dx} = V(x)" /> with area integration principles.
        </p>
      </header>

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

      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Distributed Load & Position</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Load Profile Type:</label>
              <select
                style={styles.select}
                value={loadType}
                onChange={(e) => setLoadType(e.target.value)}
              >
                <option value="constant">Uniform Load (w = w₀)</option>
                <option value="triangular">Triangular Load (w = w₀ x / L)</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Load Intensity w₀: {w0} kN/m</label>
              <input
                type="range" min="1" max="40" value={w0}
                onChange={(e) => setW0(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Beam Span L: {L} m</label>
              <input
                type="range" min="2" max="12" value={L}
                onChange={(e) => setL(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Query Position x: {clampedX.toFixed(2)} m</label>
              <input
                type="range" min="0" max={L} step="0.05" value={clampedX}
                onChange={(e) => setQueryX(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <button style={styles.resetBtn} onClick={handleReset}>
              <RefreshCw size={16} style={{ marginRight: 6 }} /> Reset Parameters
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.resultsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Slope dV/dx = -w(x)</span>
                <span style={{ ...styles.metricValue, color: '#ef4444' }}>{-qWx.toFixed(2)} kN/m</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Slope dM/dx = V(x)</span>
                <span style={{ ...styles.metricValue, color: '#06b6d4' }}>{qVx.toFixed(2)} kN</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Zero Shear Location</span>
                <span style={{ ...styles.metricValue, color: '#10b981' }}>x = {xZeroShear.toFixed(2)} m</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Max Moment M_max</span>
                <span style={{ ...styles.metricValue, color: '#8b5cf6' }}>{mPeak.toFixed(2)} kN·m</span>
              </div>
            </div>

            {/* Stacked Calculus Diagrams */}
            <div style={styles.chartWrapper}>
              <Plot
                data={[wTrace, cutLineW]}
                layout={{ title: 'Load Intensity w(x)', height: 160, paper_bgcolor: 'rgba(15,23,42,0.8)', plot_bgcolor: 'rgba(15,23,42,0.8)', font: { color: '#f8fafc' }, margin: { l: 50, r: 20, t: 30, b: 30 } }}
                useResizeHandler={true} style={{ width: '100%' }} config={{ responsive: true, displayModeBar: false }}
              />
            </div>
            <div style={styles.chartWrapper}>
              <Plot
                data={[vTrace, cutLineV]}
                layout={{ title: 'Shear Force V(x)', height: 160, paper_bgcolor: 'rgba(15,23,42,0.8)', plot_bgcolor: 'rgba(15,23,42,0.8)', font: { color: '#f8fafc' }, margin: { l: 50, r: 20, t: 30, b: 30 } }}
                useResizeHandler={true} style={{ width: '100%' }} config={{ responsive: true, displayModeBar: false }}
              />
            </div>
            <div style={styles.chartWrapper}>
              <Plot
                data={[mTrace, cutLineM]}
                layout={{ title: 'Bending Moment M(x)', height: 160, paper_bgcolor: 'rgba(15,23,42,0.8)', plot_bgcolor: 'rgba(15,23,42,0.8)', font: { color: '#f8fafc' }, margin: { l: 50, r: 20, t: 30, b: 30 } }}
                useResizeHandler={true} style={{ width: '100%' }} config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'poe' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>💡 Predict-Observe-Explain (POE) Challenge</h2>
          <p style={styles.poeQuestion}>
            <strong>Question:</strong> For a simply supported beam under a triangular distributed load <MathInline math="w(x) = w_0 \frac{x}{L}" />, at what location along the beam span does the maximum bending moment <MathInline math="M_{max}" /> occur?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'mid', text: 'x = L / 2 (at midspan)' },
              { id: 'sqrt3', text: 'x = L / √3 ≈ 0.577 L' },
              { id: 'sqrt23', text: 'x = √(2/3) L ≈ 0.816 L' },
              { id: 'right', text: 'x = L (at the right support)' }
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
                  name="poe14"
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
                backgroundColor: poePrediction === 'sqrt23' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'sqrt23' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'sqrt23' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! Maximum moment occurs where shear is zero, at x = √(2/3) L.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Find where shear force V(x) = 0 by solving dM/dx = V(x) = 0.
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                Maximum moment occurs where <MathInline math="\frac{dM}{dx} = V(x) = 0" />.<br />
                The shear equation is <MathInline math="V(x) = \frac{w_0 L}{3} - \frac{w_0 x^2}{2 L}" />.<br />
                Setting <MathInline math="V(x) = 0" />:
                <MathBlock math="\frac{w_0 x^2}{2 L} = \frac{w_0 L}{3} \implies x^2 = \frac{2}{3} L^2 \implies x = \sqrt{\frac{2}{3}} L \approx 0.8165 L" />
                Because the load is heavier towards the right, zero shear (and hence maximum moment) shifts significantly to the right of midspan!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Differential & Integral Load Relations</h2>
          <div style={styles.theoryContent}>
            <h3>1. Differential Relationships</h3>
            <p>
              By considering horizontal/vertical force and moment balance of a differential element <MathInline math="dx" />:
              <MathBlock math="\frac{dV}{dx} = -w(x)" />
              <MathBlock math="\frac{dM}{dx} = V(x)" />
            </p>

            <h3>2. Area Integration Theorem</h3>
            <p>
              Integrating between two beam sections <MathInline math="x_1" /> and <MathInline math="x_2" />:
              <MathBlock math="V(x_2) - V(x_1) = -\int_{x_1}^{x_2} w(x) \, dx = -(\text{Area under } w(x) \text{ curve})" />
              <MathBlock math="M(x_2) - M(x_1) = \int_{x_1}^{x_2} V(x) \, dx = (\text{Area under } V(x) \text{ curve})" />
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
  header: { marginBottom: '24px' },
  titleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' },
  title: { fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#f8fafc' },
  subtitle: { color: '#94a3b8', fontSize: '1rem', margin: 0 },
  tabBar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px' },
  tab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  activeTab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  gridTwoCol: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' },
  card: { background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 },
  select: { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#f8fafc', fontSize: '0.9rem' },
  slider: { width: '100%', accentColor: '#ef4444' },
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: '#f8fafc', cursor: 'pointer', fontWeight: 600, marginTop: '12px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  metricCard: { background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  metricLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
  metricValue: { fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' },
  chartWrapper: { background: '#0f172a', borderRadius: '8px', padding: '8px', border: '1px solid #334155' },
  poeQuestion: { fontSize: '1.05rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: '20px' },
  poeOptions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  poeOptionLabel: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },
  feedbackBox: { padding: '20px', borderRadius: '8px', border: '1px solid' },
  theoryContent: { lineHeight: 1.7, color: '#cbd5e1' }
};

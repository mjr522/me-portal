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

export default function ME330_Lesson11() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Section & Load State
  const [b, setB] = useState(120); // mm
  const [h, setH] = useState(240); // mm
  const [P_kN, setP_kN] = useState(150); // kN (positive = tension, negative = compression)
  const [e_mm, setE_mm] = useState(40); // mm (eccentricity along y axis)

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Mechanics Calculations
  const P_N = P_kN * 1000;
  const area = b * h; // mm^2
  const I = (b * Math.pow(h, 3)) / 12; // mm^4
  const c = h / 2; // mm
  const r_sq = I / area; // r^2 = h^2 / 12
  const r = Math.sqrt(r_sq);
  const moment = P_N * e_mm; // N*mm

  // Kern limit for rectangle: e_kern = h / 6
  const e_kern = h / 6;

  // Normal stress at top and bottom fibers
  const sigma_axial = P_N / area; // MPa
  const sigma_top = sigma_axial - (moment * c) / I;
  const sigma_bot = sigma_axial + (moment * c) / I;

  // Neutral axis shift y_NA relative to geometric centroid
  // sigma(y) = P/A - (P*e*y)/I = 0 => y_NA = I / (A * e) = r_sq / e
  const y_NA = e_mm !== 0 ? r_sq / e_mm : null;

  // Stress distribution curve
  const yVals = [];
  const sigmaVals = [];
  const steps = 50;
  for (let i = 0; i <= steps; i++) {
    const y = -c + (2 * c * i) / steps;
    yVals.push(y);
    const sig = sigma_axial - (moment * y) / I;
    sigmaVals.push(sig);
  }

  const stressTrace = {
    x: sigmaVals,
    y: yVals,
    mode: 'lines',
    name: 'Total Stress σ(y)',
    line: { color: '#3b82f6', width: 3 }
  };

  const zeroAxis = {
    x: [0, 0],
    y: [-c * 1.1, c * 1.1],
    mode: 'lines',
    name: 'Zero Stress Line',
    line: { color: '#64748b', dash: 'dash' }
  };

  const naPoint = y_NA !== null && Math.abs(y_NA) <= c * 1.5 ? {
    x: [0],
    y: [y_NA],
    mode: 'markers+text',
    name: 'Neutral Axis (σ=0)',
    text: [`N.A. y=${y_NA.toFixed(1)}mm`],
    textposition: 'top right',
    marker: { color: '#ef4444', size: 10 }
  } : null;

  const layout = {
    title: { text: 'Combined Normal Stress Profile (Axial + Bending)', font: { color: '#f8fafc', size: 15 } },
    xaxis: { title: 'Normal Stress σ (MPa) [ Tension + / Comp - ]', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'Distance y from Centroid (mm)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 60, r: 30, t: 50, b: 50 },
    showlegend: true
  };

  const handleReset = () => {
    setB(120);
    setH(240);
    setP_kN(150);
    setE_mm(40);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 11</div>
        <h1 style={styles.title}>Eccentric Axial Loading & Neutral Axis Shift</h1>
        <p style={styles.subtitle}>
          Analyze combined axial load and bending moment <MathInline math="\sigma = \frac{P}{A} \pm \frac{M y}{I}" /> and Kern bounds.
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

      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          {/* Controls */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Cross-Section & Eccentric Load</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Section Width b: {b} mm</label>
              <input
                type="range" min="50" max="300" value={b}
                onChange={(e) => setB(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Section Height h: {h} mm</label>
              <input
                type="range" min="80" max="400" value={h}
                onChange={(e) => setH(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Axial Force P: {P_kN} kN (Tension &gt; 0 / Comp &lt; 0)</label>
              <input
                type="range" min="-300" max="300" step="5" value={P_kN}
                onChange={(e) => setP_kN(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Eccentricity e: {e_mm} mm</label>
              <input
                type="range" min={-h / 2} max={h / 2} step="1" value={e_mm}
                onChange={(e) => setE_mm(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <button style={styles.resetBtn} onClick={handleReset}>
              <RefreshCw size={16} style={{ marginRight: 6 }} /> Reset Parameters
            </button>
          </div>

          {/* Results Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.resultsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Axial Stress P/A</span>
                <span style={styles.metricValue}>{sigma_axial.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Equivalent Moment M=P·e</span>
                <span style={styles.metricValue}>{(moment / 1e6).toFixed(2)} kN·m</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Neutral Axis Shift y_NA</span>
                <span style={{ ...styles.metricValue, color: '#a78bfa' }}>
                  {y_NA !== null ? `${y_NA.toFixed(1)} mm` : '∞'}
                </span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Kern Limit (e_kern)</span>
                <span style={{ ...styles.metricValue, color: Math.abs(e_mm) <= e_kern ? '#10b981' : '#f59e0b' }}>
                  ±{e_kern.toFixed(1)} mm
                </span>
              </div>
            </div>

            {/* Banner info */}
            <div style={styles.bannerCard}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                Extreme Fiber Stresses:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div>Top Fiber (y = +{c}mm): <strong style={{ color: sigma_top > 0 ? '#34d399' : '#f87171' }}>{sigma_top.toFixed(2)} MPa</strong></div>
                <div>Bottom Fiber (y = -{c}mm): <strong style={{ color: sigma_bot > 0 ? '#34d399' : '#f87171' }}>{sigma_bot.toFixed(2)} MPa</strong></div>
              </div>
            </div>

            {/* Plot */}
            <div style={styles.chartWrapper}>
              <Plot
                data={naPoint ? [stressTrace, zeroAxis, naPoint] : [stressTrace, zeroAxis]}
                layout={layout}
                useResizeHandler={true}
                style={{ width: '100%', height: '360px' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      )}

      {/* POE TAB */}
      {activeTab === 'poe' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>💡 Predict-Observe-Explain (POE) Challenge</h2>
          <p style={styles.poeQuestion}>
            <strong>Question:</strong> For a rectangular cross-section column ($b \times h$) carrying a compressive load <MathInline math="P < 0" />, what maximum eccentricity <MathInline math="e" /> can the load have such that <strong>no tensile stress</strong> develops anywhere in the cross-section? (This boundary is known as the Kern of the section).
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'h12', text: 'e = h / 12' },
              { id: 'h6', text: 'e = h / 6 (Middle-third rule)' },
              { id: 'h4', text: 'e = h / 4' },
              { id: 'h2', text: 'e = h / 2' }
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
                  name="poe11"
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
                backgroundColor: poePrediction === 'h6' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'h6' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'h6' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! The Kern boundary is e = h/6.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Set stress at extreme fiber to zero and solve for e.
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                At the extreme fiber <MathInline math="y = h/2" />, total stress under compressive load <MathInline math="-P" /> is:
                <MathBlock math="\sigma_{top} = -\frac{P}{A} + \frac{(P \cdot e)(h/2)}{I} = -\frac{P}{A} \left( 1 - \frac{e (h/2)}{r^2} \right)" />
                For stress to remain non-positive (<MathInline math="\sigma \le 0" />):
                <MathBlock math="1 - \frac{e (h/2)}{h^2/12} \ge 0 \implies 1 - \frac{6 e}{h} \ge 0 \implies e \le \frac{h}{6}" />
                Hence the load must stay within the middle third (<MathInline math="2 e = h/3" />) of the section!
              </div>
            </div>
          )}
        </div>
      )}

      {/* THEORY TAB */}
      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Eccentric Axial Loading</h2>
          <div style={styles.theoryContent}>
            <h3>1. Principle of Superposition</h3>
            <p>
              An eccentric axial force <MathInline math="P" /> acting at distance <MathInline math="e" /> from the centroidal axis is statically equivalent to:
              1. A concentric axial force <MathInline math="P" /> at the centroid, PLUS<br />
              2. A bending moment <MathInline math="M = P \cdot e" />.
            </p>
            <MathBlock math="\sigma(y) = \frac{P}{A} - \frac{M y}{I} = \frac{P}{A} \left( 1 - \frac{e y}{r^2} \right)" />

            <h3>2. Shift of Neutral Axis</h3>
            <p>
              The neutral axis is defined by <MathInline math="\sigma(y_{NA}) = 0" />.
              <MathBlock math="y_{NA} = \frac{I}{A e} = \frac{r^2}{e}" />
              Notice that as eccentricity <MathInline math="e \to 0" />, <MathInline math="y_{NA} \to \infty" /> (pure axial stress).
            </p>

            <h3>3. Kern of Section (Middle-Third Rule)</h3>
            <p>
              In brittle materials (concrete, masonry, stone) that cannot support tension, the load eccentricity must remain within the <strong>Kern</strong> so that no tensile stresses develop anywhere across the section.
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
  titleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' },
  title: { fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#f8fafc' },
  subtitle: { color: '#94a3b8', fontSize: '1rem', margin: 0 },
  tabBar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px' },
  tab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  activeTab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#ffffff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  gridTwoCol: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' },
  card: { background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 },
  slider: { width: '100%', accentColor: '#3b82f6' },
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: '#f8fafc', cursor: 'pointer', fontWeight: 600, marginTop: '12px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  metricCard: { background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  metricLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
  metricValue: { fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' },
  bannerCard: { background: '#0f172a', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px', border: '1px solid #334155' },
  chartWrapper: { background: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #334155' },
  poeQuestion: { fontSize: '1.05rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: '20px' },
  poeOptions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  poeOptionLabel: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },
  feedbackBox: { padding: '20px', borderRadius: '8px', border: '1px solid' },
  theoryContent: { lineHeight: 1.7, color: '#cbd5e1' }
};

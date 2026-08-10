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

export default function ME330_Lesson21() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Stress Inputs
  const [sigmaX, setSigmaX] = useState(120); // MPa
  const [sigmaY, setSigmaY] = useState(40); // MPa (same sign as sigmaX!)
  const [tauXY, setTauXY] = useState(30); // MPa

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // In-Plane Principal Stresses
  const C_inplane = (sigmaX + sigmaY) / 2;
  const R_inplane = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));

  const sigmaA = C_inplane + R_inplane;
  const sigmaB = C_inplane - R_inplane;
  const sigmaC = 0; // Out-of-plane stress for Plane Stress state

  // Sort three principal stresses in descending order: sigma1 >= sigma2 >= sigma3
  const pStresses = [sigmaA, sigmaB, sigmaC].sort((a, b) => b - a);
  const sigma1 = pStresses[0];
  const sigma2 = pStresses[1];
  const sigma3 = pStresses[2];

  // Maximum Shear Stresses
  const tauInPlaneMax = R_inplane; // (sigmaA - sigmaB) / 2
  const tauAbsMax = (sigma1 - sigma3) / 2; // Governing 3D maximum shear stress

  const isOutofPlaneGoverning = tauAbsMax > tauInPlaneMax + 1e-4;

  // Helper to generate circle coordinates
  const makeCircle = (c, r, name, color) => {
    const x = [];
    const y = [];
    const pts = 120;
    for (let i = 0; i <= pts; i++) {
      const ang = (2 * Math.PI * i) / pts;
      x.push(c + r * Math.cos(ang));
      y.push(r * Math.sin(ang));
    }
    return {
      x, y, mode: 'lines', name,
      line: { color, width: name.includes('Outer') ? 3.5 : 2, dash: name.includes('Outer') ? 'solid' : 'dot' }
    };
  };

  // Three Mohr Circles:
  // Circle 12: between sigma1 and sigma2
  const c12 = (sigma1 + sigma2) / 2;
  const r12 = Math.abs(sigma1 - sigma2) / 2;
  const circle12 = makeCircle(c12, r12, 'Circle 1-2 (σ₁-σ₂)', '#3b82f6');

  // Circle 23: between sigma2 and sigma3
  const c23 = (sigma2 + sigma3) / 2;
  const r23 = Math.abs(sigma2 - sigma3) / 2;
  const circle23 = makeCircle(c23, r23, 'Circle 2-3 (σ₂-σ₃)', '#10b981');

  // Circle 13: outer circle between sigma1 and sigma3 (governs absolute max shear!)
  const c13 = (sigma1 + sigma3) / 2;
  const r13 = Math.abs(sigma1 - sigma3) / 2;
  const circle13 = makeCircle(c13, r13, 'Outer Circle 1-3 (Governing τ_abs_max)', '#ef4444');

  const principalMarkers = {
    x: [sigma1, sigma2, sigma3],
    y: [0, 0, 0],
    mode: 'markers+text',
    name: '3D Principal Stresses',
    text: [`σ₁ = ${sigma1.toFixed(1)}`, `σ₂ = ${sigma2.toFixed(1)}`, `σ₃ = ${sigma3.toFixed(1)}`],
    textposition: ['top right', 'top center', 'top left'],
    marker: { color: '#f59e0b', size: 10, symbol: 'diamond' }
  };

  const layout = {
    title: { text: "3D Mohr's Circle (Three Principal Circles)", font: { color: '#f8fafc', size: 15 } },
    xaxis: { title: 'Normal Stress σ (MPa)', color: '#94a3b8', gridcolor: '#334155', zerolinecolor: '#475569' },
    yaxis: { title: 'Shear Stress τ (MPa)', color: '#94a3b8', gridcolor: '#334155', zerolinecolor: '#475569', scaleanchor: 'x' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 50, r: 30, t: 50, b: 50 },
    showlegend: true
  };

  const handleReset = () => {
    setSigmaX(120);
    setSigmaY(40);
    setTauXY(30);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 21</div>
        <h1 style={styles.title}>3D Mohr's Circle & Absolute Maximum Shear Stress</h1>
        <p style={styles.subtitle}>
          Analyze 3D stress transformations, ordered principal stresses <MathInline math="\sigma_1 \ge \sigma_2 \ge \sigma_3" />, and <MathInline math="\tau_{abs\_max} = \frac{\sigma_1 - \sigma_3}{2}" />.
        </p>
      </header>

      <div style={styles.tabBar}>
        <button
          style={activeTab === 'sandbox' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('sandbox')}
        >
          <Sliders size={18} style={{ marginRight: 8 }} /> Interactive 3D Simulator
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
          <BookOpen size={18} style={{ marginRight: 8 }} /> 3D Stress Theory
        </button>
      </div>

      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ In-Plane Stress State</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>σ_x: {sigmaX} MPa</label>
              <input
                type="range" min="-150" max="200" value={sigmaX}
                onChange={(e) => setSigmaX(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>σ_y: {sigmaY} MPa</label>
              <input
                type="range" min="-150" max="200" value={sigmaY}
                onChange={(e) => setSigmaY(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>τ_xy: {tauXY} MPa</label>
              <input
                type="range" min="-100" max="100" value={tauXY}
                onChange={(e) => setTauXY(Number(e.target.value))}
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
                <span style={styles.metricLabel}>In-Plane Max Shear</span>
                <span style={styles.metricValue}>{tauInPlaneMax.toFixed(1)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Absolute Max Shear</span>
                <span style={{ ...styles.metricValue, color: '#ef4444' }}>{tauAbsMax.toFixed(1)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Ordered Principal σ₁</span>
                <span style={{ ...styles.metricValue, color: '#3b82f6' }}>{sigma1.toFixed(1)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Ordered Principal σ₃</span>
                <span style={{ ...styles.metricValue, color: '#10b981' }}>{sigma3.toFixed(1)} MPa</span>
              </div>
            </div>

            <div style={{ ...styles.bannerCard, borderLeftColor: isOutofPlaneGoverning ? '#ef4444' : '#10b981' }}>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>
                Governing Maximum Shear Assessment:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                {isOutofPlaneGoverning ? (
                  <span style={{ color: '#f87171', fontWeight: 700 }}>
                    ⚠️ Out-of-Plane Circle Governs! Both in-plane principal stresses have the same sign (σ_A = {sigmaA.toFixed(1)}, σ_B = {sigmaB.toFixed(1)}). Absolute max shear τ_abs_max = {tauAbsMax.toFixed(1)} MPa exceeds in-plane max shear ({tauInPlaneMax.toFixed(1)} MPa)!
                  </span>
                ) : (
                  <span style={{ color: '#34d399', fontWeight: 700 }}>
                    ✅ In-Plane Circle Governs! Principal stresses have opposite signs, so τ_abs_max = τ_inplane = {tauAbsMax.toFixed(1)} MPa.
                  </span>
                )}
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <Plot
                data={[circle12, circle23, circle13, principalMarkers]}
                layout={layout}
                useResizeHandler={true} style={{ width: '100%', height: '360px' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'poe' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>💡 Predict-Observe-Explain (POE) Challenge</h2>
          <p style={styles.poeQuestion}>
            <strong>Question:</strong> In a state of plane stress where both in-plane principal stresses are positive (<MathInline math="\sigma_A = 100\text{ MPa}" />, <MathInline math="\sigma_B = 40\text{ MPa}" />), what is the <strong>Absolute Maximum Shear Stress</strong> <MathInline math="\tau_{abs\_max}" />?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: '30', text: '30 MPa (calculated as (100 - 40) / 2)' },
              { id: '50', text: '50 MPa (calculated as (100 - 0) / 2 because out-of-plane stress σ_z = 0)' },
              { id: '70', text: '70 MPa (calculated as (100 + 40) / 2)' },
              { id: '100', text: '100 MPa' }
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
                  name="poe21"
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
                backgroundColor: poePrediction === '50' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === '50' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === '50' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! τ_abs_max = 50 MPa, which acts on out-of-plane 45° planes!
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Remember that plane stress has an out-of-plane principal stress σ_z = 0!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                The three principal stresses in 3D are:
                <MathBlock math="\sigma_A = 100\text{ MPa}, \quad \sigma_B = 40\text{ MPa}, \quad \sigma_C = \sigma_z = 0" />
                Sorting them in descending order: <MathInline math="\sigma_1 = 100, \sigma_2 = 40, \sigma_3 = 0" />.<br />
                The Absolute Maximum Shear Stress is governed by the outer circle:
                <MathBlock math="\tau_{abs\_max} = \frac{\sigma_1 - \sigma_3}{2} = \frac{100 - 0}{2} = 50\text{ MPa}" />
                Ignoring the out-of-plane stress <MathInline math="\sigma_3 = 0" /> would dangerously underestimate the maximum shear stress by 40% (30 MPa vs 50 MPa)!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: 3D Mohr's Circle & Absolute Max Shear</h2>
          <div style={styles.theoryContent}>
            <h3>1. Three Principal Circles</h3>
            <p>
              In 3D stress analysis, three principal stresses exist: <MathInline math="\sigma_1 \ge \sigma_2 \ge \sigma_3" />.
              Three Mohr circles are drawn between pairs <MathInline math="(\sigma_1, \sigma_2)" />, <MathInline math="(\sigma_2, \sigma_3)" />, and <MathInline math="(\sigma_1, \sigma_3)" />.
            </p>

            <h3>2. Absolute Maximum Shear Stress</h3>
            <MathBlock math="\tau_{abs\_max} = \frac{\sigma_1 - \sigma_3}{2}" />
            <p>
              For 2D Plane Stress (<MathInline math="\sigma_z = 0" />):
              - <strong>Case 1 (Opposite signs):</strong> If <MathInline math="\sigma_A > 0" /> and <MathInline math="\sigma_B < 0" />, then <MathInline math="\sigma_1 = \sigma_A" />, <MathInline math="\sigma_2 = 0" />, <MathInline math="\sigma_3 = \sigma_B" />, so <MathInline math="\tau_{abs\_max} = \tau_{in-plane} = \frac{\sigma_A - \sigma_B}{2}" />.
              - <strong>Case 2 (Same sign):</strong> If <MathInline math="\sigma_A > 0" /> and <MathInline math="\sigma_B > 0" />, then <MathInline math="\sigma_1 = \sigma_A" />, <MathInline math="\sigma_2 = \sigma_B" />, <MathInline math="\sigma_3 = 0" />, so <MathInline math="\tau_{abs\_max} = \frac{\sigma_A}{2} > \tau_{in-plane}" />!
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
  slider: { width: '100%', accentColor: '#ef4444' },
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: '#f8fafc', cursor: 'pointer', fontWeight: 600, marginTop: '12px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  metricCard: { background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  metricLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
  metricValue: { fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' },
  bannerCard: { background: '#0f172a', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '8px', border: '1px solid #334155' },
  chartWrapper: { background: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #334155' },
  poeQuestion: { fontSize: '1.05rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: '20px' },
  poeOptions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  poeOptionLabel: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },
  feedbackBox: { padding: '20px', borderRadius: '8px', border: '1px solid' },
  theoryContent: { lineHeight: 1.7, color: '#cbd5e1' }
};

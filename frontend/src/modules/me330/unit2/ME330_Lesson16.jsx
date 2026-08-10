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

export default function ME330_Lesson16() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Section & Load Controls
  const [sectionType, setSectionType] = useState('rectangular'); // rectangular, builtup_wood
  const [b, setB] = useState(100); // mm
  const [h, setH] = useState(200); // mm
  const [V_kN, setV_kN] = useState(40); // kN
  const [evalY, setEvalY] = useState(0); // mm from NA

  // Built-up beam fastener properties
  const [flangeThick, setFlangeThick] = useState(25); // mm
  const [fastenerCap_kN, setFastenerCap_kN] = useState(2.5); // kN per nail/bolt

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Mechanics Calculations
  const V_N = V_kN * 1000;
  const area = b * h; // mm^2
  const I = (b * Math.pow(h, 3)) / 12; // mm^4
  const c = h / 2;
  const clampedY = Math.min(Math.max(evalY, -c), c);

  // First moment of area Q at y
  // Q(y) = A' * y_bar' = b * (c - |y|) * (|y| + (c - |y|)/2) = (b/2) * (c^2 - y^2)
  const Q_y = (b / 2) * (c * c - clampedY * clampedY); // mm^3
  const tau_y = (V_N * Q_y) / (I * b); // MPa (N/mm^2)

  const tau_max = (1.5 * V_N) / area; // MPa at y=0

  // Shear flow at flange-web joint for built-up beam
  // Q_flange = A_flange * y_bar_flange = (b * flangeThick) * (h/2 - flangeThick/2)
  const Q_flange = (b * flangeThick) * (h / 2 - flangeThick / 2);
  const q_flow = (V_N * Q_flange) / I; // N/mm
  const s_spacing = (fastenerCap_kN * 1000) / q_flow; // mm pitch between nails

  // Profile data
  const yVals = [];
  const tauVals = [];
  const steps = 50;
  for (let i = 0; i <= steps; i++) {
    const y = -c + (2 * c * i) / steps;
    yVals.push(y);
    const Q = (b / 2) * (c * c - y * y);
    const tau = (V_N * Q) / (I * b);
    tauVals.push(tau);
  }

  const tauTrace = {
    x: tauVals,
    y: yVals,
    mode: 'lines',
    name: 'Transverse Shear Stress τ(y)',
    line: { color: '#10b981', width: 3 },
    fill: 'tozerox',
    fillcolor: 'rgba(16, 185, 129, 0.15)'
  };

  const pointMarker = {
    x: [tau_y],
    y: [clampedY],
    mode: 'markers',
    name: `Point y=${clampedY}mm`,
    marker: { color: '#ef4444', size: 10 }
  };

  const layout = {
    title: { text: 'Parabolic Shear Stress Distribution τ(y) across Height', font: { color: '#f8fafc', size: 15 } },
    xaxis: { title: 'Transverse Shear Stress τ (MPa)', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'Distance y from Neutral Axis (mm)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 60, r: 30, t: 50, b: 50 }
  };

  const handleReset = () => {
    setSectionType('rectangular');
    setB(100);
    setH(200);
    setV_kN(40);
    setEvalY(0);
    setFlangeThick(25);
    setFastenerCap_kN(2.5);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 16</div>
        <h1 style={styles.title}>Transverse Shear Stresses & Fastener Shear Flow</h1>
        <p style={styles.subtitle}>
          Analyze beam shear stress <MathInline math="\tau = \frac{V Q}{I t}" />, shear flow <MathInline math="q = \frac{V Q}{I}" />, and nail/bolt spacing <MathInline math="s = \frac{F_{bolt}}{q}" />.
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
          <BookOpen size={18} style={{ marginRight: 8 }} /> Theory & Formula
        </button>
      </div>

      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Beam Shear & Section Controls</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Transverse Shear Force V: {V_kN} kN</label>
              <input
                type="range" min="5" max="150" step="5" value={V_kN}
                onChange={(e) => setV_kN(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Section Width b: {b} mm</label>
              <input
                type="range" min="40" max="300" value={b}
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
              <label style={styles.label}>Evaluation Distance y: {clampedY} mm</label>
              <input
                type="range" min={-c} max={c} step="1" value={clampedY}
                onChange={(e) => setEvalY(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
            <h3 style={{ fontSize: '1rem', color: '#10b981', margin: '0 0 12px 0' }}>Built-Up Fastener Design</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Flange Board Thickness: {flangeThick} mm</label>
              <input
                type="range" min="10" max="50" value={flangeThick}
                onChange={(e) => setFlangeThick(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Fastener Shear Capacity F_bolt: {fastenerCap_kN} kN</label>
              <input
                type="range" min="0.5" max="10" step="0.5" value={fastenerCap_kN}
                onChange={(e) => setFastenerCap_kN(Number(e.target.value))}
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
                <span style={styles.metricLabel}>Max Shear τ_max (at NA)</span>
                <span style={{ ...styles.metricValue, color: '#10b981' }}>{tau_max.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Shear τ at y={clampedY}mm</span>
                <span style={styles.metricValue}>{tau_y.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Joint Shear Flow q</span>
                <span style={{ ...styles.metricValue, color: '#38bdf8' }}>{q_flow.toFixed(1)} N/mm</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Required Pitch s</span>
                <span style={{ ...styles.metricValue, color: '#f59e0b' }}>{s_spacing.toFixed(1)} mm</span>
              </div>
            </div>

            <div style={styles.bannerCard}>
              <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>
                Shear Stress vs Flexural Stress Location:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                Flexural stress <MathInline math="\sigma_{max}" /> occurs at outer fibers (<MathInline math="y = \pm h/2" />) where transverse shear stress is <strong>ZERO</strong> (<MathInline math="\tau = 0" />)!<br />
                Transverse shear stress reaches maximum <MathInline math="\tau_{max} = 1.5 V/A" /> at the <strong>Neutral Axis</strong> (<MathInline math="y = 0" />) where flexural stress is <strong>ZERO</strong>!
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <Plot
                data={[tauTrace, pointMarker]}
                layout={layout}
                useResizeHandler={true} style={{ width: '100%', height: '320px' }}
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
            <strong>Question:</strong> For a solid rectangular beam cross-section, how does the maximum transverse shear stress <MathInline math="\tau_{max}" /> at the neutral axis compare to the average shear stress <MathInline math="\tau_{avg} = V / A" />?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'equal', text: 'τ_max = τ_avg (1.0 times average shear)' },
              { id: 'ratio15', text: 'τ_max = 1.5 τ_avg (50% greater than average shear)' },
              { id: 'double', text: 'τ_max = 2.0 τ_avg (100% greater)' },
              { id: 'zero', text: 'τ_max = 0 at the neutral axis' }
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
                  name="poe16"
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
                backgroundColor: poePrediction === 'ratio15' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'ratio15' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'ratio15' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! Maximum transverse shear stress is 1.5 times average shear stress!
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Integrate the parabolic distribution across the rectangular area!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                For a rectangle of width <MathInline math="b" /> and height <MathInline math="h" />:
                <MathBlock math="I = \frac{b h^3}{12}, \quad Q_{max} = \frac{b h^2}{8}" />
                Plugging into <MathInline math="\tau_{max} = \frac{V Q_{max}}{I b}" />:
                <MathBlock math="\tau_{max} = \frac{V (b h^2 / 8)}{(b h^3 / 12) b} = \frac{12}{8} \cdot \frac{V}{b h} = \frac{3}{2} \cdot \frac{V}{A} = 1.5 \, \tau_{avg}" />
                The parabolic profile concentrates shear stress at the neutral axis!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Transverse Shear & Shear Flow</h2>
          <div style={styles.theoryContent}>
            <h3>1. The Shear Formula</h3>
            <p>
              Transverse shear force <MathInline math="V" /> causes longitudinal shear stress across horizontal longitudinal planes of a beam:
              <MathBlock math="\tau = \frac{V Q}{I t}" />
              where <MathInline math="Q = A' \bar{y}'" /> is the first moment of area above the plane of interest, <MathInline math="I" /> is total centroidal inertia, and <MathInline math="t" /> is section thickness at the cut.
            </p>

            <h3>2. Fastener Shear Flow <MathInline math="q" /></h3>
            <p>
              In built-up members (e.g. wooden boards nailed together, or steel plates welded to flanges), shear flow <MathInline math="q" /> represents force per unit length along the longitudinal joint:
              <MathBlock math="q = \frac{V Q_{flange}}{I} \quad [\text{N/mm or lb/in}]" />
              The required longitudinal spacing (pitch) <MathInline math="s" /> between nails/bolts of individual capacity <MathInline math="F_{bolt}" /> is:
              <MathBlock math="s = \frac{F_{bolt}}{q}" />
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
  titleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' },
  title: { fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#f8fafc' },
  subtitle: { color: '#94a3b8', fontSize: '1rem', margin: 0 },
  tabBar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px' },
  tab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  activeTab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#ffffff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  gridTwoCol: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' },
  card: { background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 },
  slider: { width: '100%', accentColor: '#10b981' },
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: '#f8fafc', cursor: 'pointer', fontWeight: 600, marginTop: '12px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  metricCard: { background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  metricLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
  metricValue: { fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' },
  bannerCard: { background: '#0f172a', borderLeft: '4px solid #10b981', padding: '16px', borderRadius: '8px', border: '1px solid #334155' },
  chartWrapper: { background: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #334155' },
  poeQuestion: { fontSize: '1.05rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: '20px' },
  poeOptions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  poeOptionLabel: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },
  feedbackBox: { padding: '20px', borderRadius: '8px', border: '1px solid' },
  theoryContent: { lineHeight: 1.7, color: '#cbd5e1' }
};

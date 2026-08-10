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

const PRESET_PROBLEMS = {
  overhang: {
    name: 'USAFA GR2 Benchmark: Overhanging Beam',
    L: 8, // m (total length)
    a: 6, // m (support B at x = 6m)
    P: 15, // kN at tip x = 8m
    w: 4, // kN/m UDL over 0 to 6m
    desc: 'Simply supported between 0 and 6m with an overhang to 8m carrying a tip load of 15 kN.'
  },
  cantilever: {
    name: 'Cantilever Beam with Distributed & Point Load',
    L: 5,
    a: 5,
    P: 25,
    w: 8,
    desc: 'Fixed support at x = 0m, free tip at x = 5m with point load 25 kN and full UDL of 8 kN/m.'
  },
  multi_point: {
    name: 'Simply Supported Beam with Asymmetric Point Load',
    L: 10,
    a: 10,
    P: 50,
    w: 2,
    desc: 'Supported at 0 and 10m, point load P=50kN at x=3m, UDL w=2kN/m across entire 10m.'
  }
};

export default function ME330_Lesson15() {
  const [activeTab, setActiveTab] = useState('sandbox');
  const [presetKey, setPresetKey] = useState('overhang');
  
  // Controls
  const preset = PRESET_PROBLEMS[presetKey];
  const [L, setL] = useState(preset.L);
  const [a, setA] = useState(preset.a); // Support B position
  const [P, setP] = useState(preset.P);
  const [w, setW] = useState(preset.w);

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  const selectPreset = (key) => {
    setPresetKey(key);
    const p = PRESET_PROBLEMS[key];
    setL(p.L);
    setA(p.a);
    setP(p.P);
    setW(p.w);
  };

  // Reactions Calculation
  // Case overhang: Pin at A (x=0), Roller at B (x=a)
  // UDL w acts from 0 to a. Point load P acts at x = L.
  // Equilibrium sum M_A = 0 => R_B * a = (w * a) * (a/2) + P * L
  const Rb = presetKey === 'cantilever' ? 0 : (w * a * (a / 2) + P * L) / a;
  const Ra = presetKey === 'cantilever' ? w * L + P : (w * a + P) - Rb;
  const Ma = presetKey === 'cantilever' ? (w * L * L) / 2 + P * L : 0; // Moment reaction at fixed support A

  // Curve generation
  const numPts = 300;
  const xArr = [];
  const vArr = [];
  const mArr = [];

  let maxV = -Infinity;
  let minV = Infinity;
  let maxM = -Infinity;
  let minM = Infinity;
  let xZeroShear = null;

  for (let i = 0; i <= numPts; i++) {
    const x = (L * i) / numPts;
    xArr.push(x);

    let vx = 0;
    let mx = 0;

    if (presetKey === 'cantilever') {
      vx = Ra - w * x;
      mx = -Ma + Ra * x - (w * x * x) / 2;
    } else {
      // Overhang or SS
      vx = Ra - w * Math.min(x, a);
      if (x > a) vx += Rb;
      if (x >= L) vx -= P;

      mx = Ra * x - (w * Math.pow(Math.min(x, a), 2)) / 2;
      if (x > a) {
        // subtract extra UDL portion if needed, but UDL ends at a
        mx += Rb * (x - a);
      }
    }

    if (vx > maxV) maxV = vx;
    if (vx < minV) minV = vx;
    if (mx > maxM) maxM = mx;
    if (mx < minM) minM = mx;

    // Zero shear check between 0 and a
    if (i > 0 && vArr[i - 1] * vx <= 0 && xZeroShear === null) {
      xZeroShear = x;
    }

    vArr.push(vx);
    mArr.push(mx);
  }

  const absMaxM = Math.max(Math.abs(maxM), Math.abs(minM));

  // Plotly layout
  const vTrace = {
    x: xArr, y: vArr, mode: 'lines', name: 'Shear V(x) [kN]',
    line: { color: '#06b6d4', width: 3 }, fill: 'tozeroy', fillcolor: 'rgba(6, 182, 212, 0.15)'
  };
  const mTrace = {
    x: xArr, y: mArr, mode: 'lines', name: 'Moment M(x) [kN·m]',
    line: { color: '#8b5cf6', width: 3 }, fill: 'tozeroy', fillcolor: 'rgba(139, 92, 246, 0.15)'
  };

  const layoutV = {
    title: { text: 'Shear Force Diagram V(x)', font: { color: '#f8fafc', size: 14 } },
    xaxis: { title: 'Position x (m)', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'V (kN)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)', plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' }, margin: { l: 50, r: 20, t: 40, b: 40 }
  };

  const layoutM = {
    title: { text: 'Bending Moment Diagram M(x)', font: { color: '#f8fafc', size: 14 } },
    xaxis: { title: 'Position x (m)', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'M (kN·m)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)', plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' }, margin: { l: 50, r: 20, t: 40, b: 40 }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 15</div>
        <h1 style={styles.title}>V-M Diagram Practice & Peak Solvers</h1>
        <p style={styles.subtitle}>
          Analyze complex multi-load beam problems and solve for peak shear <MathInline math="|V_{max}|" /> and bending moment <MathInline math="|M_{max}|" />.
        </p>
      </header>

      <div style={styles.tabBar}>
        <button
          style={activeTab === 'sandbox' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('sandbox')}
        >
          <Sliders size={18} style={{ marginRight: 8 }} /> Interactive Practice
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
          <BookOpen size={18} style={{ marginRight: 8 }} /> Practice Guide
        </button>
      </div>

      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Select Benchmark Problem</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {Object.keys(PRESET_PROBLEMS).map((key) => (
                <button
                  key={key}
                  onClick={() => selectPreset(key)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: presetKey === key ? '#8b5cf6' : '#334155',
                    background: presetKey === key ? 'rgba(139, 92, 246, 0.2)' : '#0f172a',
                    color: '#f8fafc',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {PRESET_PROBLEMS[key].name}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: 16 }}>
              {preset.desc}
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Tip Load P: {P} kN</label>
              <input
                type="range" min="0" max="100" value={P}
                onChange={(e) => setP(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Distributed Load w: {w} kN/m</label>
              <input
                type="range" min="0" max="20" value={w}
                onChange={(e) => setW(Number(e.target.value))}
                style={styles.slider}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.resultsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Max Shear |V_max|</span>
                <span style={{ ...styles.metricValue, color: '#06b6d4' }}>
                  {Math.max(Math.abs(maxV), Math.abs(minV)).toFixed(1)} kN
                </span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Max Abs Moment |M_max|</span>
                <span style={{ ...styles.metricValue, color: '#8b5cf6' }}>{absMaxM.toFixed(1)} kN·m</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Left Reaction R_A</span>
                <span style={styles.metricValue}>{Ra.toFixed(1)} kN</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Right Reaction R_B</span>
                <span style={styles.metricValue}>{Rb.toFixed(1)} kN</span>
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <Plot
                data={[vTrace]}
                layout={layoutV}
                useResizeHandler={true} style={{ width: '100%', height: '220px' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
            <div style={styles.chartWrapper}>
              <Plot
                data={[mTrace]}
                layout={layoutM}
                useResizeHandler={true} style={{ width: '100%', height: '220px' }}
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
            <strong>Question:</strong> For an overhanging beam carrying a UDL on the main span and a downward point load at the overhang tip, where can the absolute maximum bending moment <MathInline math="|M_{max}|" /> occur?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'mid', text: 'Only at the center of the main span' },
              { id: 'overhang', text: 'Either inside the span (at zero shear) OR at the overhanging support B' },
              { id: 'tip', text: 'Always at the free tip of the overhang' },
              { id: 'zero', text: 'Bending moment is zero everywhere' }
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
                  name="poe15"
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
                backgroundColor: poePrediction === 'overhang' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'overhang' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'overhang' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! Local peaks occur at zero shear within the span and at the overhanging support.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Remember that negative moment peaks at overhanging supports!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                In overhanging beams, the moment diagram typically has two local extrema:
                1. Positive local max inside the main span where shear passes through zero (<MathInline math="V(x) = 0" />).<br />
                2. Negative peak moment at support B due to the cantilever effect of the overhanging load (<MathInline math="M_B = -P \cdot (L - a)" />).<br />
                The governing peak design moment <MathInline math="|M_{max}|" /> is the greater of these two magnitudes!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Practice Guide & Strategy</h2>
          <div style={styles.theoryContent}>
            <h3>Strategy for Solving V-M Diagrams for Beam Design:</h3>
            <ol>
              <li>Draw a full external Free-Body Diagram (FBD) and calculate support reactions.</li>
              <li>Identify key section boundaries (where concentrated loads, moments, or load changes occur).</li>
              <li>Sketch shear diagram <MathInline math="V(x)" /> starting from left end <MathInline math="x = 0" />.</li>
              <li>Locate points where shear crosses zero (<MathInline math="V(x) = 0" />).</li>
              <li>Calculate areas under the shear diagram to find bending moments at key points:
                <MathBlock math="M(x_2) = M(x_1) + \int_{x_1}^{x_2} V(x) dx" />
              </li>
              <li>Compare all local peak moment values to identify <MathInline math="|M_{max}|" /> for section sizing (<MathInline math="S_{req} = |M_{max}| / \sigma_{allow}" />).</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
  header: { marginBottom: '24px' },
  titleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' },
  title: { fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#f8fafc' },
  subtitle: { color: '#94a3b8', fontSize: '1rem', margin: 0 },
  tabBar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px' },
  tab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  activeTab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#ffffff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  gridTwoCol: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' },
  card: { background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 },
  slider: { width: '100%', accentColor: '#8b5cf6' },
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

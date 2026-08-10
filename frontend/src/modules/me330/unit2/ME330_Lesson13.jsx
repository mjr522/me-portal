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

export default function ME330_Lesson13() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Beam Setup
  const [L, setL] = useState(6); // m
  const [P, setP] = useState(20); // kN
  const [xP, setXP] = useState(2); // m (position of point load)
  const [w, setW] = useState(5); // kN/m (uniform load)
  const [xCut, setXCut] = useState(3.5); // m (section cut position)

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Reactions for Simply Supported Beam under P at xP and UDL w over whole beam:
  // R_A * L = P * (L - xP) + w * L * (L/2)
  const Ra = (P * (L - xP) + w * L * (L / 2)) / L;
  const Rb = P + w * L - Ra;

  // Calculate V(x) and M(x) across beam
  const numPts = 200;
  const xArr = [];
  const vArr = [];
  const mArr = [];

  for (let i = 0; i <= numPts; i++) {
    const x = (L * i) / numPts;
    xArr.push(x);

    // Shear V(x)
    let vx = Ra - w * x;
    if (x > xP) vx -= P;
    vArr.push(vx);

    // Moment M(x)
    let mx = Ra * x - (w * x * x) / 2;
    if (x > xP) mx -= P * (x - xP);
    mArr.push(mx);
  }

  // Value at xCut
  const clampedXCut = Math.min(Math.max(xCut, 0), L);
  let vAtCut = Ra - w * clampedXCut;
  if (clampedXCut > xP) vAtCut -= P;

  let mAtCut = Ra * clampedXCut - (w * clampedXCut * clampedXCut) / 2;
  if (clampedXCut > xP) mAtCut -= P * (clampedXCut - xP);

  // Plot Traces
  const shearTrace = {
    x: xArr,
    y: vArr,
    mode: 'lines',
    name: 'Shear Force V(x) [kN]',
    line: { color: '#06b6d4', width: 3 },
    fill: 'tozeroy',
    fillcolor: 'rgba(6, 182, 212, 0.15)'
  };

  const momentTrace = {
    x: xArr,
    y: mArr,
    mode: 'lines',
    name: 'Bending Moment M(x) [kN·m]',
    line: { color: '#8b5cf6', width: 3 },
    fill: 'tozeroy',
    fillcolor: 'rgba(139, 92, 246, 0.15)'
  };

  const cutLineV = {
    x: [clampedXCut, clampedXCut],
    y: [Math.min(...vArr) * 1.2, Math.max(...vArr) * 1.2],
    mode: 'lines',
    name: `Cut Section x = ${clampedXCut.toFixed(2)} m`,
    line: { color: '#ef4444', dash: 'dash', width: 2 }
  };

  const cutLineM = {
    x: [clampedXCut, clampedXCut],
    y: [Math.min(...mArr) * 1.2, Math.max(...mArr) * 1.2],
    mode: 'lines',
    name: `Cut Section x = ${clampedXCut.toFixed(2)} m`,
    line: { color: '#ef4444', dash: 'dash', width: 2 }
  };

  const layoutV = {
    title: { text: 'Shear Force Diagram V(x)', font: { color: '#f8fafc', size: 14 } },
    xaxis: { title: 'Beam Position x (m)', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'Shear V (kN)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 50, r: 30, t: 40, b: 40 }
  };

  const layoutM = {
    title: { text: 'Bending Moment Diagram M(x)', font: { color: '#f8fafc', size: 14 } },
    xaxis: { title: 'Beam Position x (m)', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'Moment M (kN·m)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 50, r: 30, t: 40, b: 40 }
  };

  const handleReset = () => {
    setL(6);
    setP(20);
    setXP(2);
    setW(5);
    setXCut(3.5);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 13</div>
        <h1 style={styles.title}>Shear & Moment Diagrams by Method of Sections</h1>
        <p style={styles.subtitle}>
          Determine internal shear <MathInline math="V(x)" /> and bending moment <MathInline math="M(x)" /> by constructing free-body diagrams at section cuts.
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
            <h2 style={styles.cardTitle}>⚙️ Beam Loads & Section Cut</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Beam Length L: {L} m</label>
              <input
                type="range" min="3" max="12" step="0.5" value={L}
                onChange={(e) => {
                  const newL = Number(e.target.value);
                  setL(newL);
                  if (xP > newL) setXP(newL / 2);
                  if (xCut > newL) setXCut(newL / 2);
                }}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Point Load P: {P} kN</label>
              <input
                type="range" min="0" max="100" step="5" value={P}
                onChange={(e) => setP(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Point Load Position x_P: {xP} m</label>
              <input
                type="range" min="0" max={L} step="0.1" value={xP}
                onChange={(e) => setXP(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Distributed Load w: {w} kN/m</label>
              <input
                type="range" min="0" max="30" step="1" value={w}
                onChange={(e) => setW(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Section Cut Position x_cut: {clampedXCut.toFixed(2)} m</label>
              <input
                type="range" min="0" max={L} step="0.05" value={clampedXCut}
                onChange={(e) => setXCut(Number(e.target.value))}
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
                <span style={styles.metricLabel}>Reaction R_A (Left)</span>
                <span style={styles.metricValue}>{Ra.toFixed(2)} kN</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Reaction R_B (Right)</span>
                <span style={styles.metricValue}>{Rb.toFixed(2)} kN</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Shear V at Cut</span>
                <span style={{ ...styles.metricValue, color: '#06b6d4' }}>{vAtCut.toFixed(2)} kN</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Moment M at Cut</span>
                <span style={{ ...styles.metricValue, color: '#8b5cf6' }}>{mAtCut.toFixed(2)} kN·m</span>
              </div>
            </div>

            {/* FBD Summary Box */}
            <div style={styles.bannerCard}>
              <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>
                FBD Equilibrium at Cut <MathInline math={`x = ${clampedXCut.toFixed(2)}\\text{ m}`} />:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                <MathBlock math={`\\sum F_y = 0 \\implies V(x) = R_A - w x ${clampedXCut > xP ? '- P' : ''} = ${vAtCut.toFixed(2)}\\text{ kN}`} />
                <MathBlock math={`\\sum M_{cut} = 0 \\implies M(x) = R_A x - \\frac{w x^2}{2} ${clampedXCut > xP ? `- P(x - x_P)` : ''} = ${mAtCut.toFixed(2)}\\text{ kN}\\cdot\\text{m}`} />
              </div>
            </div>

            {/* Stacked Diagrams */}
            <div style={styles.chartWrapper}>
              <Plot
                data={[shearTrace, cutLineV]}
                layout={layoutV}
                useResizeHandler={true}
                style={{ width: '100%', height: '220px' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
            <div style={styles.chartWrapper}>
              <Plot
                data={[momentTrace, cutLineM]}
                layout={layoutM}
                useResizeHandler={true}
                style={{ width: '100%', height: '220px' }}
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
            <strong>Question:</strong> What happens to the Shear Force Diagram <MathInline math="V(x)" /> at the exact location <MathInline math="x = x_P" /> where a concentrated point load <MathInline math="P" /> is applied?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'smooth', text: 'V(x) changes smoothly with zero slope' },
              { id: 'jump', text: 'V(x) undergoes a vertical jump (discontinuity) downward equal to magnitude P' },
              { id: 'peak', text: 'V(x) reaches a peak triangular maximum' },
              { id: 'zero', text: 'V(x) always drops to zero' }
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
                  name="poe13"
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
                backgroundColor: poePrediction === 'jump' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'jump' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'jump' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! Concentrated point loads cause immediate vertical jumps in shear.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Think about equilibrium of an infinitely thin beam slice!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                Considering vertical equilibrium of a section cut immediately before and after <MathInline math="x_P" />:
                <MathBlock math="V(x_P^+) - V(x_P^-) = -P" />
                A concentrated force creates a step-function discontinuity in shear force. Correspondingly, the slope of the Bending Moment Diagram <MathInline math="\frac{dM}{dx} = V" /> changes abruptly at <MathInline math="x_P" />, creating a sharp peak (cusp) in <MathInline math="M(x)" />!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Method of Sections for Beams</h2>
          <div style={styles.theoryContent}>
            <h3>1. Sign Conventions for Internal Beam Actions</h3>
            <ul>
              <li><strong>Positive Shear <MathInline math="V" />:</strong> Tends to rotate the beam segment clockwise (downward force on right face, upward force on left face).</li>
              <li><strong>Positive Moment <MathInline math="M" />:</strong> Creates compression on top fibers and tension on bottom fibers (concave upward / "smiling beam").</li>
            </ul>

            <h3>2. Method of Sections Procedure</h3>
            <ol>
              <li>Determine global reaction forces at external beam supports using overall equilibrium.</li>
              <li>Pass an imaginary section cut through the beam at position <MathInline math="x" />.</li>
              <li>Draw a Free-Body Diagram (FBD) of either the left or right segment.</li>
              <li>Apply equilibrium equations <MathInline math="\sum F_y = 0" /> and <MathInline math="\sum M_{cut} = 0" /> to solve for internal functions <MathInline math="V(x)" /> and <MathInline math="M(x)" />.</li>
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
  titleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' },
  title: { fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#f8fafc' },
  subtitle: { color: '#94a3b8', fontSize: '1rem', margin: 0 },
  tabBar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px' },
  tab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  activeTab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#06b6d4', color: '#ffffff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  gridTwoCol: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' },
  card: { background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 },
  slider: { width: '100%', accentColor: '#06b6d4' },
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: '#f8fafc', cursor: 'pointer', fontWeight: 600, marginTop: '12px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  metricCard: { background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  metricLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
  metricValue: { fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' },
  bannerCard: { background: '#0f172a', borderLeft: '4px solid #06b6d4', padding: '16px', borderRadius: '8px', border: '1px solid #334155' },
  chartWrapper: { background: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #334155' },
  poeQuestion: { fontSize: '1.05rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: '20px' },
  poeOptions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  poeOptionLabel: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },
  feedbackBox: { padding: '20px', borderRadius: '8px', border: '1px solid' },
  theoryContent: { lineHeight: 1.7, color: '#cbd5e1' }
};

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

export default function ME330_Lesson12() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Section & Bending Controls
  const [b, setB] = useState(100); // mm (width along z-axis)
  const [h, setH] = useState(200); // mm (height along y-axis)
  const [momentMag, setMomentMag] = useState(15); // kN*m
  const [thetaDeg, setThetaDeg] = useState(30); // degrees (angle of M vector from z-axis)

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Moments of Inertia
  const Iz = (b * Math.pow(h, 3)) / 12; // mm^4
  const Iy = (h * Math.pow(b, 3)) / 12; // mm^4

  // Moment Components
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const M_Nmm = momentMag * 1e6;
  const Mz = M_Nmm * Math.cos(thetaRad);
  const My = M_Nmm * Math.sin(thetaRad);

  // Angle alpha of Neutral Axis
  // tan(alpha) = (Iz / Iy) * tan(theta)
  const tanAlpha = (Iz / Iy) * Math.tan(thetaRad);
  const alphaRad = Math.atan(tanAlpha);
  const alphaDeg = (alphaRad * 180) / Math.PI;

  // Stresses at 4 Corners of Rectangular Section
  // sigma(y, z) = - (Mz * y)/Iz + (My * z)/Iy
  const y_corner = h / 2;
  const z_corner = b / 2;

  const corners = [
    { name: 'Top-Right (A)', y: y_corner, z: z_corner },
    { name: 'Top-Left (B)', y: y_corner, z: -z_corner },
    { name: 'Bottom-Left (C)', y: -y_corner, z: -z_corner },
    { name: 'Bottom-Right (D)', y: -y_corner, z: z_corner }
  ].map(c => {
    const sigma = -(Mz * c.y) / Iz + (My * c.z) / Iy;
    return { ...c, sigma };
  });

  const maxStressObj = corners.reduce((max, c) => Math.abs(c.sigma) > Math.abs(max.sigma) ? c : max, corners[0]);

  // Visualizing Section & Neutral Axis in Plotly
  // Rectangular boundary
  const rectX = [z_corner, -z_corner, -z_corner, z_corner, z_corner];
  const rectY = [y_corner, y_corner, -y_corner, -y_corner, y_corner];

  const rectTrace = {
    x: rectX,
    y: rectY,
    mode: 'lines',
    name: 'Cross-Section Boundary',
    line: { color: '#64748b', width: 2 },
    fill: 'toself',
    fillcolor: 'rgba(30, 41, 59, 0.4)'
  };

  // Neutral axis line y = tan(alpha) * z
  const zLine = [-z_corner * 1.3, z_corner * 1.3];
  const yNALine = zLine.map(z => z * Math.tan(alphaRad));

  const naTrace = {
    x: zLine,
    y: yNALine,
    mode: 'lines',
    name: `Neutral Axis (α=${alphaDeg.toFixed(1)}°)`,
    line: { color: '#10b981', width: 3, dash: 'dash' }
  };

  // Moment vector arrow line
  const mVecLen = Math.min(b, h) * 0.7;
  const mTrace = {
    x: [0, mVecLen * Math.cos(thetaRad)],
    y: [0, mVecLen * Math.sin(thetaRad)],
    mode: 'lines+markers',
    name: `Moment Vector M (θ=${thetaDeg}°)`,
    line: { color: '#f59e0b', width: 4 },
    marker: { size: 8 }
  };

  // Corner markers with colored stress
  const cornerTrace = {
    x: corners.map(c => c.z),
    y: corners.map(c => c.y),
    mode: 'markers+text',
    name: 'Corner Stresses',
    text: corners.map(c => `${c.sigma.toFixed(1)} MPa`),
    textposition: ['top right', 'top left', 'bottom left', 'bottom right'],
    marker: {
      size: 10,
      color: corners.map(c => c.sigma > 0 ? '#34d399' : '#f87171')
    }
  };

  const layout = {
    title: { text: 'Cross-Section & Neutral Axis Orientation α', font: { color: '#f8fafc', size: 15 } },
    xaxis: { title: 'z-axis (mm)', color: '#94a3b8', gridcolor: '#334155', zerolinecolor: '#475569' },
    yaxis: { title: 'y-axis (mm)', color: '#94a3b8', gridcolor: '#334155', zerolinecolor: '#475569', scaleanchor: 'x' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 50, r: 30, t: 50, b: 50 },
    showlegend: true
  };

  const handleReset = () => {
    setB(100);
    setH(200);
    setMomentMag(15);
    setThetaDeg(30);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 12</div>
        <h1 style={styles.title}>Unsymmetric Bending & Non-Principal Axes</h1>
        <p style={styles.subtitle}>
          Analyze bending when moment vector <MathInline math="\vec{M}" /> is inclined to principal axes <MathInline math="\tan \alpha = \frac{I_z}{I_y} \tan \theta" />.
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
            <h2 style={styles.cardTitle}>⚙️ Controls & Geometry</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Width b (z-axis): {b} mm</label>
              <input
                type="range" min="50" max="300" value={b}
                onChange={(e) => setB(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Height h (y-axis): {h} mm</label>
              <input
                type="range" min="50" max="300" value={h}
                onChange={(e) => setH(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Moment Magnitude M: {momentMag} kN·m</label>
              <input
                type="range" min="1" max="50" value={momentMag}
                onChange={(e) => setMomentMag(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Moment Vector Angle θ: {thetaDeg}°</label>
              <input
                type="range" min="0" max="90" value={thetaDeg}
                onChange={(e) => setThetaDeg(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <button style={styles.resetBtn} onClick={handleReset}>
              <RefreshCw size={16} style={{ marginRight: 6 }} /> Reset Parameters
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.resultsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Inertia I_z / I_y</span>
                <span style={styles.metricValue}>{(Iz / Iy).toFixed(2)}</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>N.A. Angle α</span>
                <span style={{ ...styles.metricValue, color: '#10b981' }}>{alphaDeg.toFixed(1)}°</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Max Corner Stress</span>
                <span style={{ ...styles.metricValue, color: '#f59e0b' }}>
                  {Math.abs(maxStressObj.sigma).toFixed(1)} MPa
                </span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Max Stress Location</span>
                <span style={styles.metricValue}>{maxStressObj.name}</span>
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <Plot
                data={[rectTrace, naTrace, mTrace, cornerTrace]}
                layout={layout}
                useResizeHandler={true}
                style={{ width: '100%', height: '360px' }}
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
            <strong>Question:</strong> For a rectangular beam with height <MathInline math="h = 200\text{ mm}" /> and width <MathInline math="b = 100\text{ mm}" />, a bending moment is applied at angle <MathInline math="\theta = 45^\circ" /> relative to the z-axis. Is the Neutral Axis angle <MathInline math="\alpha" /> equal to <MathInline math="45^\circ" />?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'equal', text: 'Yes, α = 45° because θ = 45°' },
              { id: 'greater', text: 'No, α > 45° (in fact, tan(α) = (h/b)² tan(θ) = 4 × 1 = 4 ⇒ α ≈ 76°)' },
              { id: 'smaller', text: 'No, α < 45°' },
              { id: 'zero', text: 'α is always 0°' }
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
                  name="poe12"
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
                backgroundColor: poePrediction === 'greater' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'greater' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'greater' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! α ≈ 76°, significantly larger than 45°!
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Remember that tan(α) depends on the ratio Iz / Iy!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                The ratio of inertia for a rectangular section is:
                <MathBlock math="\frac{I_z}{I_y} = \frac{b h^3 / 12}{h b^3 / 12} = \left(\frac{h}{b}\right)^2 = \left(\frac{200}{100}\right)^2 = 4" />
                Using the unsymmetric bending formula:
                <MathBlock math="\tan \alpha = \frac{I_z}{I_y} \tan \theta = 4 \cdot \tan(45^\circ) = 4 \implies \alpha = \arctan(4) \approx 75.96^\circ" />
                Because the section is much stiffer about the z-axis (<MathInline math="I_z = 4 I_y" />), the neutral axis rotates heavily towards the y-axis!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Unsymmetric Bending</h2>
          <div style={styles.theoryContent}>
            <h3>1. Superposition of Principal Moment Components</h3>
            <p>
              When a bending moment <MathInline math="\vec{M}" /> acts at angle <MathInline math="\theta" /> relative to the principal centroidal z-axis:
              <MathBlock math="M_z = M \cos \theta, \quad M_y = M \sin \theta" />
              The total normal stress at coordinate <MathInline math="(y,z)" /> is:
              <MathBlock math="\sigma(y,z) = -\frac{M_z y}{I_z} + \frac{M_y z}{I_y}" />
            </p>

            <h3>2. Orientation of the Neutral Axis (<MathInline math="\alpha" />)</h3>
            <p>
              The neutral axis is defined by <MathInline math="\sigma(y,z) = 0" />:
              <MathBlock math="-\frac{M_z y}{I_z} + \frac{M_y z}{I_y} = 0 \implies y = \left( \frac{I_z}{I_y} \tan \theta \right) z" />
              Therefore, the slope of the Neutral Axis is <MathInline math="\tan \alpha" />:
              <MathBlock math="\tan \alpha = \frac{I_z}{I_y} \tan \theta" />
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
  titleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' },
  title: { fontSize: '2rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#f8fafc' },
  subtitle: { color: '#94a3b8', fontSize: '1rem', margin: 0 },
  tabBar: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px' },
  tab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  activeTab: { display: 'flex', alignItems: 'center', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#ffffff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 },
  gridTwoCol: { display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' },
  card: { background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: '#f8fafc' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 500 },
  slider: { width: '100%', accentColor: '#f59e0b' },
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: '#f8fafc', cursor: 'pointer', fontWeight: 600, marginTop: '12px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  metricCard: { background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  metricLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
  metricValue: { fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' },
  chartWrapper: { background: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #334155' },
  poeQuestion: { fontSize: '1.05rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: '20px' },
  poeOptions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  poeOptionLabel: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },
  feedbackBox: { padding: '20px', borderRadius: '8px', border: '1px solid' },
  theoryContent: { lineHeight: 1.7, color: '#cbd5e1' }
};

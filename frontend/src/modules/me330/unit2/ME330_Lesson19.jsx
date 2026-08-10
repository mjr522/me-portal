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

export default function ME330_Lesson19() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Controls
  const [sigmaX, setSigmaX] = useState(90); // MPa
  const [sigmaY, setSigmaY] = useState(-30); // MPa
  const [tauXY, setTauXY] = useState(40); // MPa
  const [thetaDeg, setThetaDeg] = useState(30); // deg

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Calculations for Mohr's Circle
  const C = (sigmaX + sigmaY) / 2;
  const R = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));

  const sigma1 = C + R;
  const sigma2 = C - R;
  const tauMaxInPlane = R;

  // Principal Angles
  const tan2ThetaP = (2 * tauXY) / (sigmaX - sigmaY);
  const thetaP1_rad = Math.atan2(2 * tauXY, sigmaX - sigmaY) / 2;
  const thetaP1_deg = (thetaP1_rad * 180) / Math.PI;

  // Rotated State at angle theta
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const doubleThetaRad = 2 * thetaRad;

  const diffSigma = (sigmaX - sigmaY) / 2;
  const sigmaXPrime = C + diffSigma * Math.cos(doubleThetaRad) + tauXY * Math.sin(doubleThetaRad);
  const sigmaYPrime = C - diffSigma * Math.cos(doubleThetaRad) - tauXY * Math.sin(doubleThetaRad);
  const tauXPrimeYPrime = -diffSigma * Math.sin(doubleThetaRad) + tauXY * Math.cos(doubleThetaRad);

  // Construct Circle geometry for Plotly
  const circleX = [];
  const circleY = [];
  const pts = 200;
  for (let i = 0; i <= pts; i++) {
    const ang = (2 * Math.PI * i) / pts;
    circleX.push(C + R * Math.cos(ang));
    circleY.push(R * Math.sin(ang));
  }

  const circleTrace = {
    x: circleX, y: circleY, mode: 'lines', name: "Mohr's Circle",
    line: { color: '#8b5cf6', width: 3 }
  };

  const centerPoint = {
    x: [C], y: [0], mode: 'markers+text', name: `Center C (${C.toFixed(1)}, 0)`,
    text: [`C (${C.toFixed(1)})`], textposition: 'bottom center',
    marker: { color: '#94a3b8', size: 10 }
  };

  const xyReferenceLine = {
    x: [sigmaX, sigmaY], y: [-tauXY, tauXY], mode: 'lines+markers', name: 'Original State X-Y',
    line: { color: '#64748b', width: 2, dash: 'dot' },
    marker: { color: '#64748b', size: 8 }
  };

  const rotatedStateLine = {
    x: [sigmaXPrime, sigmaYPrime], y: [-tauXPrimeYPrime, tauXPrimeYPrime], mode: 'lines+markers', name: `Rotated State X′-Y′ (${thetaDeg}°)`,
    line: { color: '#ef4444', width: 2.5 },
    marker: { color: '#ef4444', size: 10 }
  };

  const principalPoints = {
    x: [sigma1, sigma2], y: [0, 0], mode: 'markers+text', name: 'Principal Stresses σ₁, σ₂',
    text: [`σ₁ = ${sigma1.toFixed(1)}`, `σ₂ = ${sigma2.toFixed(1)}`], textposition: ['top right', 'top left'],
    marker: { color: '#34d399', size: 12, symbol: 'diamond' }
  };

  const maxShearPoints = {
    x: [C, C], y: [R, -R], mode: 'markers+text', name: 'Max In-Plane Shear τ_max',
    text: [`+τ_max = ${R.toFixed(1)}`, `-τ_max = -${R.toFixed(1)}`], textposition: ['top center', 'bottom center'],
    marker: { color: '#f59e0b', size: 10, symbol: 'cross' }
  };

  const layout = {
    title: { text: "2D Mohr's Circle in (σ, τ) Plane", font: { color: '#f8fafc', size: 15 } },
    xaxis: { title: 'Normal Stress σ (MPa)', color: '#94a3b8', gridcolor: '#334155', zerolinecolor: '#475569' },
    yaxis: { title: 'Shear Stress τ (MPa)', color: '#94a3b8', gridcolor: '#334155', zerolinecolor: '#475569', scaleanchor: 'x', scaleratio: 1 },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 50, r: 30, t: 50, b: 50 },
    showlegend: true
  };

  const handleReset = () => {
    setSigmaX(90);
    setSigmaY(-30);
    setTauXY(40);
    setThetaDeg(30);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 19</div>
        <h1 style={styles.title}>Interactive 2D Mohr's Circle Simulator</h1>
        <p style={styles.subtitle}>
          Visualize principal stresses <MathInline math="\sigma_1, \sigma_2" />, center <MathInline math="C" />, radius <MathInline math="R" />, and max shear stress <MathInline math="\tau_{max}" />.
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
          <BookOpen size={18} style={{ marginRight: 8 }} /> Mohr's Circle Rules
        </button>
      </div>

      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Stress State Inputs</h2>

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

            <div style={styles.inputGroup}>
              <label style={styles.label}>Element Rotation Angle θ: {thetaDeg}° (2θ = {2 * thetaDeg}° on circle)</label>
              <input
                type="range" min="-90" max="90" value={thetaDeg}
                onChange={(e) => setThetaDeg(Number(e.target.value))}
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
                <span style={styles.metricLabel}>Center C = (σ_x+σ_y)/2</span>
                <span style={styles.metricValue}>{C.toFixed(1)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Radius R = τ_max</span>
                <span style={{ ...styles.metricValue, color: '#f59e0b' }}>{R.toFixed(1)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Principal σ₁ (Max)</span>
                <span style={{ ...styles.metricValue, color: '#34d399' }}>{sigma1.toFixed(1)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Principal σ₂ (Min)</span>
                <span style={{ ...styles.metricValue, color: '#60a5fa' }}>{sigma2.toFixed(1)} MPa</span>
              </div>
            </div>

            <div style={styles.bannerCard}>
              <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>
                Principal Orientations & Rotated Values:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                Principal Plane Angle: <strong style={{ color: '#34d399' }}>θ_p1 = {thetaP1_deg.toFixed(1)}°</strong><br />
                At rotated state <MathInline math={`\\theta = ${thetaDeg}^\\circ`} />:<br />
                <MathInline math={`\\sigma_{x'} = ${sigmaXPrime.toFixed(1)}\\text{ MPa}, \\quad \\sigma_{y'} = ${sigmaYPrime.toFixed(1)}\\text{ MPa}, \\quad \\tau_{x'y'} = ${tauXPrimeYPrime.toFixed(1)}\\text{ MPa}`} />
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <Plot
                data={[circleTrace, centerPoint, xyReferenceLine, rotatedStateLine, principalPoints, maxShearPoints]}
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
            <strong>Question:</strong> On Mohr's Circle, an element rotation of angle <MathInline math="\theta" /> in physical real-space corresponds to a circle central angle rotation of what magnitude?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'same', text: 'Same angle θ in the same direction' },
              { id: 'half', text: 'Half the angle (θ / 2)' },
              { id: 'double', text: 'Double the angle (2θ) in the same direction' },
              { id: 'quad', text: 'Four times the angle (4θ)' }
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
                  name="poe19"
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
                backgroundColor: poePrediction === 'double' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'double' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'double' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! Rotations on Mohr's Circle are doubled (2θ).
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Look at the trigonometric argument in cos(2θ) and sin(2θ)!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                Because stress transformation equations involve <MathInline math="\cos(2\theta)" /> and <MathInline math="\sin(2\theta)" />, angles on Mohr's Circle are exactly <strong>twice</strong> the physical rotation angle:
                <MathBlock math="\theta_{circle} = 2 \theta_{physical}" />
                This is why perpendicular planes in real space (<MathInline math="90^\circ" /> apart, such as the x and y axes) map to opposite ends of a diameter on Mohr's Circle (<MathInline math="180^\circ" /> apart)!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Mohr's Circle Construction</h2>
          <div style={styles.theoryContent}>
            <h3>1. Circle Center & Radius</h3>
            <MathBlock math="C = \frac{\sigma_x + \sigma_y}{2}" />
            <MathBlock math="R = \sqrt{\left(\frac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2}" />

            <h3>2. Principal Stresses & Max In-Plane Shear</h3>
            <MathBlock math="\sigma_{1,2} = C \pm R = \frac{\sigma_x + \sigma_y}{2} \pm \sqrt{\left(\frac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2}" />
            <MathBlock math="\tau_{max, in-plane} = R" />

            <h3>3. Plotting Sign Convention</h3>
            <p>
              - Horizontal axis: Normal stress <MathInline math="\sigma" /> (Tension positive right, Compression negative left).<br />
              - Vertical axis: Shear stress <MathInline math="\tau" />.<br />
              - Reference point <MathInline math="X = (\sigma_x, -\tau_{xy})" /> and point <MathInline math="Y = (\sigma_y, \tau_{xy})" /> define the diameter.
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
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', background: '#334155', color: '#f8fafc', cursor: 'pointer', fontWeight: 600, marginTop: '12px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  metricCard: { background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' },
  metricLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 },
  metricValue: { fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' },
  bannerCard: { background: '#0f172a', borderLeft: '4px solid #8b5cf6', padding: '16px', borderRadius: '8px', border: '1px solid #334155' },
  chartWrapper: { background: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #334155' },
  poeQuestion: { fontSize: '1.05rem', lineHeight: 1.6, color: '#e2e8f0', marginBottom: '20px' },
  poeOptions: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  poeOptionLabel: { display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },
  feedbackBox: { padding: '20px', borderRadius: '8px', border: '1px solid' },
  theoryContent: { lineHeight: 1.7, color: '#cbd5e1' }
};

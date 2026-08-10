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

export default function ME330_Lesson17() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Stress State Inputs
  const [sigmaX, setSigmaX] = useState(80); // MPa
  const [sigmaY, setSigmaY] = useState(-30); // MPa
  const [tauXY, setTauXY] = useState(40); // MPa
  const [thetaDeg, setThetaDeg] = useState(30); // deg (plane angle)

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Calculations for current theta
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const doubleThetaRad = 2 * thetaRad;

  const avgSigma = (sigmaX + sigmaY) / 2;
  const diffSigma = (sigmaX - sigmaY) / 2;

  const sigmaTheta = avgSigma + diffSigma * Math.cos(doubleThetaRad) + tauXY * Math.sin(doubleThetaRad);
  const tauTheta = -diffSigma * Math.sin(doubleThetaRad) + tauXY * Math.cos(doubleThetaRad);

  // Sweep theta from -90 to +90 degrees
  const thetaArray = [];
  const sigmaThetaArray = [];
  const tauThetaArray = [];
  const steps = 180;

  for (let i = 0; i <= steps; i++) {
    const th = -90 + (180 * i) / steps;
    thetaArray.push(th);
    const thRad = (th * Math.PI) / 180;
    const dThRad = 2 * thRad;

    const sigT = avgSigma + diffSigma * Math.cos(dThRad) + tauXY * Math.sin(dThRad);
    const tauT = -diffSigma * Math.sin(dThRad) + tauXY * Math.cos(dThRad);

    sigmaThetaArray.push(sigT);
    tauThetaArray.push(tauT);
  }

  // Plotly traces
  const sigmaTrace = {
    x: thetaArray,
    y: sigmaThetaArray,
    mode: 'lines',
    name: 'Normal Stress σ_θ',
    line: { color: '#3b82f6', width: 3 }
  };

  const tauTrace = {
    x: thetaArray,
    y: tauThetaArray,
    mode: 'lines',
    name: 'Shear Stress τ_θ',
    line: { color: '#f59e0b', width: 3 }
  };

  const currentMarkerSigma = {
    x: [thetaDeg],
    y: [sigmaTheta],
    mode: 'markers',
    name: `σ_θ (${thetaDeg}°)`,
    marker: { color: '#3b82f6', size: 10, symbol: 'circle' }
  };

  const currentMarkerTau = {
    x: [thetaDeg],
    y: [tauTheta],
    mode: 'markers',
    name: `τ_θ (${thetaDeg}°)`,
    marker: { color: '#f59e0b', size: 10, symbol: 'square' }
  };

  const layout = {
    title: { text: 'Stress Components vs Oblique Cut Plane Angle θ', font: { color: '#f8fafc', size: 15 } },
    xaxis: { title: 'Plane Angle θ (degrees)', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'Stress Magnitude (MPa)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 60, r: 30, t: 50, b: 50 }
  };

  const handleReset = () => {
    setSigmaX(80);
    setSigmaY(-30);
    setTauXY(40);
    setThetaDeg(30);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 17</div>
        <h1 style={styles.title}>Stresses on Oblique Planes & Angle θ Transformation</h1>
        <p style={styles.subtitle}>
          Evaluate normal stress <MathInline math="\sigma_\theta" /> and shear stress <MathInline math="\tau_\theta" /> acting on an arbitrarily inclined internal plane.
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
            <h2 style={styles.cardTitle}>⚙️ Unrotated Stress Element & Angle θ</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Normal Stress σ_x: {sigmaX} MPa</label>
              <input
                type="range" min="-150" max="150" value={sigmaX}
                onChange={(e) => setSigmaX(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Normal Stress σ_y: {sigmaY} MPa</label>
              <input
                type="range" min="-150" max="150" value={sigmaY}
                onChange={(e) => setSigmaY(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Shear Stress τ_xy: {tauXY} MPa</label>
              <input
                type="range" min="-100" max="100" value={tauXY}
                onChange={(e) => setTauXY(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Plane Inclination Angle θ: {thetaDeg}°</label>
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
                <span style={styles.metricLabel}>Normal Stress σ_θ</span>
                <span style={{ ...styles.metricValue, color: '#3b82f6' }}>{sigmaTheta.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Shear Stress τ_θ</span>
                <span style={{ ...styles.metricValue, color: '#f59e0b' }}>{tauTheta.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Average Normal Stress σ_avg</span>
                <span style={styles.metricValue}>{avgSigma.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Plane Angle θ</span>
                <span style={styles.metricValue}>{thetaDeg}°</span>
              </div>
            </div>

            <div style={styles.bannerCard}>
              <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>
                Transformed Oblique Stress Equations:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                <MathBlock math={`\\sigma_\\theta = \\frac{${sigmaX} + (${sigmaY})}{2} + \\frac{${sigmaX} - (${sigmaY})}{2} \\cos(2 \\cdot ${thetaDeg}^\\circ) + ${tauXY} \\sin(2 \\cdot ${thetaDeg}^\\circ) = ${sigmaTheta.toFixed(2)}\\text{ MPa}`} />
                <MathBlock math={`\\tau_\\theta = -\\frac{${sigmaX} - (${sigmaY})}{2} \\sin(2 \\cdot ${thetaDeg}^\\circ) + ${tauXY} \\cos(2 \\cdot ${thetaDeg}^\\circ) = ${tauTheta.toFixed(2)}\\text{ MPa}`} />
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <Plot
                data={[sigmaTrace, tauTrace, currentMarkerSigma, currentMarkerTau]}
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
            <strong>Question:</strong> Under a pure uniaxial tensile stress state <MathInline math="\sigma_x > 0" />, <MathInline math="\sigma_y = 0" />, <MathInline math="\tau_{xy} = 0" />, at what plane angle <MathInline math="\theta" /> does the maximum shear stress <MathInline math="\tau_{max}" /> act on an inclined plane?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'theta0', text: 'θ = 0° (vertical plane)' },
              { id: 'theta45', text: 'θ = 45° (at 45 degrees inclination)' },
              { id: 'theta90', text: 'θ = 90° (horizontal plane)' },
              { id: 'theta60', text: 'θ = 60°' }
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
                  name="poe17"
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
                backgroundColor: poePrediction === 'theta45' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'theta45' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'theta45' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! Maximum shear occurs at θ = 45° and equals σ_x / 2.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Differentiate τ_θ with respect to θ and set derivative to 0!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                For pure uniaxial tension (<MathInline math="\sigma_y = 0, \tau_{xy} = 0" />):
                <MathBlock math="\tau_\theta = -\frac{\sigma_x}{2} \sin(2\theta)" />
                The sine function reaches its maximum magnitude of <MathInline math="1" /> when <MathInline math="2\theta = 90^\circ \implies \theta = 45^\circ" />.<br />
                The maximum shear stress magnitude is:
                <MathBlock math="|\tau_{max}| = \frac{\sigma_x}{2}" />
                This explains why ductile tension test specimens often slip and fail along 45° shear planes (cup-and-cone fractures)!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Oblique Plane Stress Equilibrium</h2>
          <div style={styles.theoryContent}>
            <h3>1. Force Equilibrium on a Wedged Stress Element</h3>
            <p>
              Consider a triangular wedge element with inclined face area <MathInline math="\Delta A" /> at angle <MathInline math="\theta" />:
              - Vertical face area = <MathInline math="\Delta A \cos \theta" />
              - Horizontal face area = <MathInline math="\Delta A \sin \theta" />
            </p>
            <p>
              Summing forces parallel and perpendicular to the inclined face yields the double-angle transformation equations:
              <MathBlock math="\sigma_\theta = \frac{\sigma_x + \sigma_y}{2} + \frac{\sigma_x - \sigma_y}{2} \cos 2\theta + \tau_{xy} \sin 2\theta" />
              <MathBlock math="\tau_\theta = -\frac{\sigma_x - \sigma_y}{2} \sin 2\theta + \tau_{xy} \cos 2\theta" />
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

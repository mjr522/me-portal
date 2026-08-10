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

export default function ME330_Lesson18() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Stress State Inputs
  const [sigmaX, setSigmaX] = useState(100); // MPa
  const [sigmaY, setSigmaY] = useState(20); // MPa
  const [tauXY, setTauXY] = useState(40); // MPa
  const [thetaDeg, setThetaDeg] = useState(25); // degrees rotation

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Calculations
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const dThetaRad = 2 * thetaRad;

  const avgSigma = (sigmaX + sigmaY) / 2;
  const diffSigma = (sigmaX - sigmaY) / 2;

  const sigmaXPrime = avgSigma + diffSigma * Math.cos(dThetaRad) + tauXY * Math.sin(dThetaRad);
  const sigmaYPrime = avgSigma - diffSigma * Math.cos(dThetaRad) - tauXY * Math.sin(dThetaRad);
  const tauXPrimeYPrime = -diffSigma * Math.sin(dThetaRad) + tauXY * Math.cos(dThetaRad);

  // Stress Invariant
  const invariantOriginal = sigmaX + sigmaY;
  const invariantRotated = sigmaXPrime + sigmaYPrime;

  // Principal Planes
  const tan2ThetaP = (2 * tauXY) / (sigmaX - sigmaY);
  const thetaP1_deg = (Math.atan(tan2ThetaP) * 180) / Math.PI / 2;
  const thetaP2_deg = thetaP1_deg + 90;

  // Sweep rotation angle theta for plot
  const angles = [];
  const sigXpArr = [];
  const sigYpArr = [];
  const tauXpYpArr = [];

  for (let th = -90; th <= 90; th += 1) {
    angles.push(th);
    const rad = (th * Math.PI) / 180;
    const dRad = 2 * rad;
    const sxp = avgSigma + diffSigma * Math.cos(dRad) + tauXY * Math.sin(dRad);
    const syp = avgSigma - diffSigma * Math.cos(dRad) - tauXY * Math.sin(dRad);
    const txpyp = -diffSigma * Math.sin(dRad) + tauXY * Math.cos(dRad);

    sigXpArr.push(sxp);
    sigYpArr.push(syp);
    tauXpYpArr.push(txpyp);
  }

  // Plotly traces
  const traceSx = { x: angles, y: sigXpArr, mode: 'lines', name: 'σ_x′', line: { color: '#3b82f6', width: 3 } };
  const traceSy = { x: angles, y: sigYpArr, mode: 'lines', name: 'σ_y′', line: { color: '#10b981', width: 3 } };
  const traceTxy = { x: angles, y: tauXpYpArr, mode: 'lines', name: 'τ_x′y′', line: { color: '#f59e0b', width: 3 } };

  const currentLine = {
    x: [thetaDeg, thetaDeg],
    y: [-180, 180],
    mode: 'lines',
    name: `Rotation θ=${thetaDeg}°`,
    line: { color: '#ef4444', dash: 'dash' }
  };

  const layout = {
    title: { text: 'Transformed Stress Components vs Element Rotation Angle θ', font: { color: '#f8fafc', size: 15 } },
    xaxis: { title: 'Element Rotation Angle θ (°)', color: '#94a3b8', gridcolor: '#334155' },
    yaxis: { title: 'Stress Magnitude (MPa)', color: '#94a3b8', gridcolor: '#334155' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 60, r: 30, t: 50, b: 50 }
  };

  const handleReset = () => {
    setSigmaX(100);
    setSigmaY(20);
    setTauXY(40);
    setThetaDeg(25);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 18</div>
        <h1 style={styles.title}>Plane Stress Transformation Equations</h1>
        <p style={styles.subtitle}>
          Transform 2D stress state components (<MathInline math="\sigma_x, \sigma_y, \tau_{xy}" />) to any rotated coordinate system (<MathInline math="x', y'" />).
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
          <BookOpen size={18} style={{ marginRight: 8 }} /> Theory & Invariants
        </button>
      </div>

      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Initial Stress State & Rotation θ</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>σ_x: {sigmaX} MPa</label>
              <input
                type="range" min="-200" max="200" value={sigmaX}
                onChange={(e) => setSigmaX(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>σ_y: {sigmaY} MPa</label>
              <input
                type="range" min="-200" max="200" value={sigmaY}
                onChange={(e) => setSigmaY(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>τ_xy: {tauXY} MPa</label>
              <input
                type="range" min="-120" max="120" value={tauXY}
                onChange={(e) => setTauXY(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Rotation Angle θ: {thetaDeg}°</label>
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
                <span style={styles.metricLabel}>Transformed σ_x′</span>
                <span style={{ ...styles.metricValue, color: '#3b82f6' }}>{sigmaXPrime.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Transformed σ_y′</span>
                <span style={{ ...styles.metricValue, color: '#10b981' }}>{sigmaYPrime.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Transformed τ_x′y′</span>
                <span style={{ ...styles.metricValue, color: '#f59e0b' }}>{tauXPrimeYPrime.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>First Invariant I_1</span>
                <span style={{ ...styles.metricValue, color: '#a78bfa' }}>{invariantRotated.toFixed(2)} MPa</span>
              </div>
            </div>

            <div style={styles.bannerCard}>
              <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>
                First Stress Invariant Verification:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                <MathInline math={`\\sigma_x + \\sigma_y = ${sigmaX} + ${sigmaY} = ${invariantOriginal.toFixed(2)}\\text{ MPa}`} /><br />
                <MathInline math={`\\sigma_{x'} + \\sigma_{y'} = ${sigmaXPrime.toFixed(2)} + ${sigmaYPrime.toFixed(2)} = ${invariantRotated.toFixed(2)}\\text{ MPa}`} /><br />
                <span style={{ color: '#34d399', fontWeight: 600 }}>The sum of normal stresses on orthogonal planes is constant for any rotation!</span>
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <Plot
                data={[traceSx, traceSy, traceTxy, currentLine]}
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
            <strong>Question:</strong> When rotating a 2D stress element through any arbitrary angle <MathInline math="\theta" />, what property of the normal stresses always remains invariant (unchanged)?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'diff', text: 'The difference σ_x′ - σ_y′ remains constant' },
              { id: 'sum', text: 'The sum σ_x′ + σ_y′ remains constant and equal to σ_x + σ_y' },
              { id: 'max', text: 'σ_x′ is always greater than σ_y′' },
              { id: 'zero', text: 'The shear stress τ_x′y′ is always zero' }
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
                  name="poe18"
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
                backgroundColor: poePrediction === 'sum' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'sum' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'sum' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! The sum of normal stresses on perpendicular faces is an invariant!
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Add the formulas for σ_x′ and σ_y′ together!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Proof:</strong><br />
                Adding <MathInline math="\sigma_{x'}" /> and <MathInline math="\sigma_{y'}" />:
                <MathBlock math="\sigma_{x'} = \frac{\sigma_x + \sigma_y}{2} + \frac{\sigma_x - \sigma_y}{2} \cos 2\theta + \tau_{xy} \sin 2\theta" />
                <MathBlock math="\sigma_{y'} = \frac{\sigma_x + \sigma_y}{2} - \frac{\sigma_x - \sigma_y}{2} \cos 2\theta - \tau_{xy} \sin 2\theta" />
                Adding them cancels all <MathInline math="\theta" /> terms:
                <MathBlock math="\sigma_{x'} + \sigma_{y'} = \frac{\sigma_x + \sigma_y}{2} + \frac{\sigma_x + \sigma_y}{2} = \sigma_x + \sigma_y = I_1" />
                This scalar sum is the <strong>First Stress Invariant</strong> <MathInline math="I_1" /> and geometrically represents twice the horizontal center coordinate of Mohr's Circle!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Stress Transformation Formulas</h2>
          <div style={styles.theoryContent}>
            <h3>1. Transformation Equations</h3>
            <MathBlock math="\sigma_{x'} = \frac{\sigma_x + \sigma_y}{2} + \frac{\sigma_x - \sigma_y}{2} \cos 2\theta + \tau_{xy} \sin 2\theta" />
            <MathBlock math="\sigma_{y'} = \frac{\sigma_x + \sigma_y}{2} - \frac{\sigma_x - \sigma_y}{2} \cos 2\theta - \tau_{xy} \sin 2\theta" />
            <MathBlock math="\tau_{x'y'} = -\frac{\sigma_x - \sigma_y}{2} \sin 2\theta + \tau_{xy} \cos 2\theta" />

            <h3>2. Principal Stresses & Planes</h3>
            <p>
              Principal planes are planes of zero shear stress (<MathInline math="\tau_{x'y'} = 0" />):
              <MathBlock math="\tan 2\theta_p = \frac{2 \tau_{xy}}{\sigma_x - \sigma_y}" />
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

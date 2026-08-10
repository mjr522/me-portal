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

export default function ME330_Lesson20() {
  const [activeTab, setActiveTab] = useState('sandbox');
  
  // Stress State and Joint Angle Controls
  const [sigmaX, setSigmaX] = useState(12); // MPa (e.g. wood axial tension)
  const [sigmaY, setSigmaY] = useState(0); // MPa
  const [tauXY, setTauXY] = useState(0); // MPa
  const [thetaDeg, setThetaDeg] = useState(35); // deg (angle of joint cut)

  // Glue / Adhesive Joint Capacities
  const [sigmaAllow, setSigmaAllow] = useState(8.0); // MPa (glue normal tension capacity)
  const [tauAllow, setTauAllow] = useState(5.0); // MPa (glue shear capacity)

  // POE State
  const [poePrediction, setPoePrediction] = useState(null);
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Calculations for Joint plane stresses
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const dThetaRad = 2 * thetaRad;

  const C = (sigmaX + sigmaY) / 2;
  const diffSigma = (sigmaX - sigmaY) / 2;
  const R = Math.sqrt(diffSigma * diffSigma + tauXY * tauXY);

  const sigmaN = C + diffSigma * Math.cos(dThetaRad) + tauXY * Math.sin(dThetaRad);
  const tauJoint = -diffSigma * Math.sin(dThetaRad) + tauXY * Math.cos(dThetaRad);

  // Safety Factors
  const sfNormal = sigmaN !== 0 ? sigmaAllow / Math.abs(sigmaN) : 999;
  const sfShear = tauJoint !== 0 ? tauAllow / Math.abs(tauJoint) : 999;
  const sfOverall = Math.min(sfNormal, sfShear);

  const isPass = sfOverall >= 1.0;

  // Mohr's Circle geometry
  const circleX = [];
  const circleY = [];
  const pts = 180;
  for (let i = 0; i <= pts; i++) {
    const ang = (2 * Math.PI * i) / pts;
    circleX.push(C + R * Math.cos(ang));
    circleY.push(R * Math.sin(ang));
  }

  const circleTrace = {
    x: circleX, y: circleY, mode: 'lines', name: "Mohr's Circle", line: { color: '#8b5cf6', width: 2.5 }
  };

  const jointPoint = {
    x: [sigmaN], y: [-tauJoint], mode: 'markers+text', name: `Joint Plane State (${thetaDeg}°)`,
    text: [`Joint (σ_n=${sigmaN.toFixed(2)}, τ=${tauJoint.toFixed(2)})`],
    textposition: 'top right',
    marker: { color: isPass ? '#10b981' : '#ef4444', size: 12, symbol: 'diamond' }
  };

  // Glue Failure Envelope Box: -sigmaAllow to +sigmaAllow, -tauAllow to +tauAllow
  const envX = [sigmaAllow, sigmaAllow, -sigmaAllow, -sigmaAllow, sigmaAllow];
  const envY = [tauAllow, -tauAllow, -tauAllow, tauAllow, tauAllow];

  const envTrace = {
    x: envX, y: envY, mode: 'lines', name: 'Glue Allowable Envelope',
    line: { color: '#f59e0b', width: 2, dash: 'dash' }
  };

  const layout = {
    title: { text: "Mohr's Circle & Adhesive Joint Failure Boundary", font: { color: '#f8fafc', size: 15 } },
    xaxis: { title: 'Normal Stress σ_n (MPa)', color: '#94a3b8', gridcolor: '#334155', zerolinecolor: '#475569' },
    yaxis: { title: 'Joint Shear Stress τ (MPa)', color: '#94a3b8', gridcolor: '#334155', zerolinecolor: '#475569', scaleanchor: 'x' },
    paper_bgcolor: 'rgba(15, 23, 42, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.8)',
    font: { color: '#f8fafc' },
    margin: { l: 50, r: 30, t: 50, b: 50 }
  };

  const handleReset = () => {
    setSigmaX(12);
    setSigmaY(0);
    setTauXY(0);
    setThetaDeg(35);
    setSigmaAllow(8.0);
    setTauAllow(5.0);
    setPoePrediction(null);
    setPoeSubmitted(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleBadge}>ME 330 • Lesson 20</div>
        <h1 style={styles.title}>Mohr's Circle Scarf Joint & Glued Splice Evaluator</h1>
        <p style={styles.subtitle}>
          Evaluate structural joint safety for inclined wood scarf joints and composite splices subject to normal and shear limits.
        </p>
      </header>

      <div style={styles.tabBar}>
        <button
          style={activeTab === 'sandbox' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('sandbox')}
        >
          <Sliders size={18} style={{ marginRight: 8 }} /> Interactive Joint Evaluator
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
          <BookOpen size={18} style={{ marginRight: 8 }} /> Design Criteria
        </button>
      </div>

      {activeTab === 'sandbox' && (
        <div style={styles.gridTwoCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚙️ Applied Load & Joint Angle</h2>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Applied Tensile Stress σ_x: {sigmaX} MPa</label>
              <input
                type="range" min="1" max="30" value={sigmaX}
                onChange={(e) => setSigmaX(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Scarf Cut Angle θ: {thetaDeg}°</label>
              <input
                type="range" min="5" max="85" value={thetaDeg}
                onChange={(e) => setThetaDeg(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
            <h3 style={{ fontSize: '1rem', color: '#f59e0b', margin: '0 0 12px 0' }}>Glue Strength Capacities</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Glue Tensile Allowable σ_allow: {sigmaAllow} MPa</label>
              <input
                type="range" min="1" max="20" step="0.5" value={sigmaAllow}
                onChange={(e) => setSigmaAllow(Number(e.target.value))}
                style={styles.slider}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Glue Shear Allowable τ_allow: {tauAllow} MPa</label>
              <input
                type="range" min="1" max="15" step="0.5" value={tauAllow}
                onChange={(e) => setTauAllow(Number(e.target.value))}
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
                <span style={styles.metricLabel}>Joint Normal Stress σ_n</span>
                <span style={styles.metricValue}>{sigmaN.toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Joint Shear Stress τ</span>
                <span style={styles.metricValue}>{Math.abs(tauJoint).toFixed(2)} MPa</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Overall Safety Factor</span>
                <span style={{ ...styles.metricValue, color: isPass ? '#10b981' : '#ef4444' }}>
                  {sfOverall.toFixed(2)}
                </span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricLabel}>Joint Status</span>
                <span style={{ ...styles.metricValue, color: isPass ? '#10b981' : '#ef4444' }}>
                  {isPass ? '✅ SAFE (PASS)' : '⚠️ FAIL'}
                </span>
              </div>
            </div>

            <div style={{ ...styles.bannerCard, borderLeftColor: isPass ? '#10b981' : '#ef4444' }}>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>
                Stress Evaluation on Scarf Cut (<MathInline math={`\\theta = ${thetaDeg}^\\circ`} />):
              </div>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                <MathInline math={`\\sigma_n = \\sigma_x \\cos^2(${thetaDeg}^\\circ) = ${sigmaN.toFixed(2)}\\text{ MPa} \\quad (\\text{Capacity: } ${sigmaAllow}\\text{ MPa})`} /><br />
                <MathInline math={`\\tau = -\\frac{\\sigma_x}{2} \\sin(2 \\cdot ${thetaDeg}^\\circ) = ${tauJoint.toFixed(2)}\\text{ MPa} \\quad (\\text{Capacity: } ${tauAllow}\\text{ MPa})`} />
              </div>
            </div>

            <div style={styles.chartWrapper}>
              <Plot
                data={[circleTrace, envTrace, jointPoint]}
                layout={layout}
                useResizeHandler={true} style={{ width: '100%', height: '340px' }}
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
            <strong>Question:</strong> For a wooden member carrying axial tension <MathInline math="\sigma_x" />, why are scarf joints cut at shallow angles (e.g., <MathInline math="\theta \ge 70^\circ" /> relative to vertical cross-section cut)?
          </p>

          <div style={styles.poeOptions}>
            {[
              { id: 'area', text: 'Shallow cuts increase glued contact area and align the joint closer to the grain line, reducing normal stress' },
              { id: 'zero', text: 'Shallow cuts eliminate shear stress completely' },
              { id: 'double', text: 'Shallow cuts double the tensile strength of the wood' },
              { id: 'none', text: 'There is no difference in load capacity' }
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
                  name="poe20"
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
                backgroundColor: poePrediction === 'area' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                borderColor: poePrediction === 'area' ? '#10b981' : '#ef4444'
              }}
            >
              {poePrediction === 'area' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontWeight: 700 }}>
                  <CheckCircle size={22} /> Correct! Shallow scarf cuts expand glue area and optimize normal vs shear stress balance.
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={22} /> Incorrect. Consider how the inclined cut area A / cos(θ) distributes forces!
                </div>
              )}
              <div style={{ marginTop: 12, lineHeight: 1.6, color: '#f8fafc' }}>
                <strong>Mathematical Explanation:</strong><br />
                As cut angle <MathInline math="\theta \to 90^\circ" /> (shallow slope):
                - Joint surface area grows as <MathInline math="A_{joint} = \frac{A_0}{\cos \theta}" />.<br />
                - Normal tensile stress perpendicular to glue line drops as <MathInline math="\sigma_n = \sigma_x \cos^2 \theta \to 0" />.<br />
                This spreads the load over a large bonded surface, enabling glued timber joints to achieve nearly 100% of solid wood strength!
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'theory' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📖 Theory: Scarf Joint Failure Criteria</h2>
          <div style={styles.theoryContent}>
            <h3>1. Stresses on Inclined Splice Line</h3>
            <p>
              For uniaxial tension <MathInline math="\sigma_x" /> with splice plane angle <MathInline math="\theta" />:
              <MathBlock math="\sigma_n = \sigma_x \cos^2 \theta" />
              <MathBlock math="\tau = -\frac{\sigma_x}{2} \sin(2\theta)" />
            </p>

            <h3>2. Interaction & Safety Factors</h3>
            <p>
              The joint safely supports the load if the point <MathInline math="(\sigma_n, \tau)" /> lies strictly within the adhesive allowable envelope:
              <MathBlock math="|\sigma_n| \le \sigma_{allow, glue} \quad \text{and} \quad |\tau| \le \tau_{allow, glue}" />
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

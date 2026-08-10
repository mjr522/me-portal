import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function ParallelAxis() {
  const [bf, setBf] = useState(100); // mm
  const [tf, setTf] = useState(20);  // mm
  const [hw, setHw] = useState(100); // mm
  const [tw, setTw] = useState(20);  // mm

  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poePredictAns, setPoePredictAns] = useState(null);
  const [poeFinalAns, setPoeFinalAns] = useState(null);

  const isLocked = phase === 'poe_predict';

  // Math Calculations
  const Af = bf * tf;
  const yf = hw + tf / 2;
  const Ixf = (bf * Math.pow(tf, 3)) / 12;

  const Aw = tw * hw;
  const yw = hw / 2;
  const Ixw = (tw * Math.pow(hw, 3)) / 12;

  const Atot = Af + Aw;
  const yBar = (Af * yf + Aw * yw) / Atot;

  const df = yf - yBar;
  const dw = yBar - yw;

  const IxFlange = Ixf + Af * df * df;
  const IxWeb = Ixw + Aw * dw * dw;
  const IxTot = IxFlange + IxWeb;

  const resetSimulator = () => {
    setBf(100);
    setTf(20);
    setHw(100);
    setTw(20);
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoePredictAns(null);
    setPoeFinalAns(null);
  };

  const generatePlotData = () => {
    const traces = [];
    const annotations = [];

    // Web: bottom y=0, top y=hw, x: [-tw/2, tw/2]
    traces.push({
      x: [-tw / 2, -tw / 2, tw / 2, tw / 2, -tw / 2],
      y: [0, hw, hw, 0, 0],
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(59, 130, 246, 0.08)',
      line: { color: '#3b82f6', width: 2 },
      showlegend: false, hoverinfo: 'skip'
    });

    // Flange: bottom y=hw, top y=hw+tf, x: [-bf/2, bf/2]
    traces.push({
      x: [-bf / 2, -bf / 2, bf / 2, bf / 2, -bf / 2],
      y: [hw, hw + tf, hw + tf, hw, hw],
      mode: 'lines', fill: 'toself', fillcolor: 'rgba(16, 185, 129, 0.08)',
      line: { color: '#10b981', width: 2 },
      showlegend: false, hoverinfo: 'skip'
    });

    // Centroid dots
    traces.push({
      x: [0], y: [yf], mode: 'markers',
      marker: { size: 8, color: '#10b981' },
      name: 'Flange Centroid', hoverinfo: 'text', hovertext: `Flange Centroid: y_f = ${yf.toFixed(1)} mm`
    });

    traces.push({
      x: [0], y: [yw], mode: 'markers',
      marker: { size: 8, color: '#3b82f6' },
      name: 'Web Centroid', hoverinfo: 'text', hovertext: `Web Centroid: y_w = ${yw.toFixed(1)} mm`
    });

    // Composite Neutral Axis
    const maxW = Math.max(bf, tw);
    traces.push({
      x: [-maxW / 2 - 15, maxW / 2 + 15], y: [yBar, yBar],
      mode: 'lines', line: { color: '#ef4444', width: 3 },
      name: 'Composite Neutral Axis', hoverinfo: 'text', hovertext: `Neutral Axis: ȳ = ${yBar.toFixed(1)} mm`
    });

    // Shift lines & annotations
    const offset_x = maxW / 2 + 5;
    traces.push({
      x: [offset_x, offset_x], y: [yBar, yf],
      mode: 'lines+markers', line: { color: '#10b981', width: 1.5, dash: 'dot' },
      marker: { size: 4 }, showlegend: false, hoverinfo: 'skip'
    });
    annotations.push({
      x: offset_x + 2, y: (yBar + yf) / 2,
      text: `d_f = ${df.toFixed(1)} mm`, font: { family: 'Outfit', size: 9, color: '#10b981' },
      showarrow: false, xanchor: 'left'
    });

    traces.push({
      x: [-offset_x, -offset_x], y: [yw, yBar],
      mode: 'lines+markers', line: { color: '#3b82f6', width: 1.5, dash: 'dot' },
      marker: { size: 4 }, showlegend: false, hoverinfo: 'skip'
    });
    annotations.push({
      x: -offset_x - 2, y: (yw + yBar) / 2,
      text: `d_w = ${dw.toFixed(1)} mm`, font: { family: 'Outfit', size: 9, color: '#3b82f6' },
      showarrow: false, xanchor: 'right'
    });

    annotations.push({
      x: maxW / 2 + 18, y: yBar,
      text: `ȳ = ${yBar.toFixed(1)} mm`, font: { family: 'Outfit', size: 10, color: '#ef4444', weight: 'bold' },
      showarrow: false, xanchor: 'left'
    });

    const layout = {
      xaxis: { range: [-maxW / 2 - 25, maxW / 2 + 35], showgrid: false, zeroline: false, showticklabels: false, fixedrange: true },
      yaxis: { range: [-15, hw + tf + 20], showgrid: true, gridcolor: 'rgba(128, 128, 128, 0.05)', zeroline: false, scaleanchor: 'x', scaleratio: 1, fixedrange: true },
      margin: { l: 15, r: 15, t: 15, b: 15 },
      showlegend: false, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      annotations
    };

    return { traces, layout };
  };

  const { traces, layout } = generatePlotData();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1.5px solid var(--border-light)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 4 • Lesson 31
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Parallel Axis Theorem</h1>
      </div>

      {/* Objectives */}
      <div className="objectives-card" style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Target style={{ color: '#8b5cf6' }} size={22} />
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Learning Objectives
          </span>
        </div>
        <ul>
          <li>Apply the Parallel Axis Theorem ($I = \bar{I} + A d^2$) to composite cross-sections.</li>
          <li>Locate the composite centroid ($\bar{y}$) of non-symmetric beams.</li>
          <li>Calculate individual segment shift distances ($d_i$) and total composite moment of inertia.</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Simulator */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Interactive T-Beam Composite Sizer</h3>

          {/* Lock Banner */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
            </div>
          )}

          {/* Plotly Canvas */}
          <div style={{ width: '100%', height: '300px' }}>
            <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '15px' }}>
            {/* Flange Width */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>1. Flange Width ($b_f$)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Width, $b_f$</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{bf} mm</span>
              </div>
              <input type="range" min="40" max="120" step="5" value={bf} disabled={isLocked} onChange={(e) => setBf(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            {/* Flange Thick */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>2. Flange Thick ($t_f$)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Thick, $t_f$</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{tf} mm</span>
              </div>
              <input type="range" min="5" max="25" step="1" value={tf} disabled={isLocked} onChange={(e) => setTf(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            {/* Web Height */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>3. Web Height ($h_w$)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Height, $h_w$</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{hw} mm</span>
              </div>
              <input type="range" min="40" max="120" step="5" value={hw} disabled={isLocked} onChange={(e) => setHw(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            {/* Web Width */}
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '10px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>4. Web Width ($t_w$)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '2px' }}>
                <span>Width, $t_w$</span>
                <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{tw} mm</span>
              </div>
              <input type="range" min="5" max="25" step="1" value={tw} disabled={isLocked} onChange={(e) => setTw(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>
          </div>

          {/* Equations Box */}
          <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.82rem', marginTop: '15px', color: '#1e293b', borderLeft: '4px solid #8b5cf6', lineHeight: 1.5 }}>
            <div><b>Parallel Axis Theorem calculations:</b></div>
            <div>• Composite Centroid: <b>{"ȳ = (A_f y_f + A_w y_w) / A_{tot}"}</b></div>
            <div>&nbsp;&nbsp;ȳ = ({Af}·{yf} + {Aw}·{yw}) / {Atot} = <b>{yBar.toFixed(2)} mm</b></div>
            <div>• Flange shift contribution: <b>{"$I_{xf} + A_f d_f^2$"}</b> = {Ixf.toFixed(0)} + {Af}·({df.toFixed(1)})² = <b>{IxFlange.toExponential(3)} $\text{mm}^4$</b></div>
            <div>• Web shift contribution: <b>{"$I_{xw} + A_w d_w^2$"}</b> = {Ixw.toFixed(0)} + {Aw}·({dw.toFixed(1)})² = <b>{IxWeb.toExponential(3)} $\text{mm}^4$</b></div>
            <div>• Total composite inertia: <b>$I_x$</b> = <b>{(IxTot / 1e4).toFixed(2)} $\times 10^4\text{ mm}^4$</b></div>
          </div>
        </div>

        {/* Right Sidecar Column */}
        <div style={{ background: 'rgba(139, 92, 246, 0.04)', border: '2px solid #8b5cf6', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ marginTop: 0, color: '#8b5cf6', fontWeight: 700, fontSize: '1.1rem', marginBottom: '15px' }}>
              {phase === 'instructions' && '📖 Step 1: Instructions'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Practice'}
              {phase === 'poe_predict' && '🔮 POE Challenge: Predict'}
              {phase === 'poe_observe' && '👀 POE Challenge: Observe & Correct'}
              {phase === 'poe_explain' && '💡 POE Challenge: Explain'}
            </h4>

            {phase === 'instructions' && (
              <div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '12px' }}>
                  The <b>Parallel Axis Theorem</b> calculates the Area Moment of Inertia of composite sections about their neutral axis:
                </p>
                <div style={{ background: 'white', padding: '8px 12px', borderRadius: '8px', margin: '10px 0', fontFamily: 'monospace', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                  $I = \sum (I_{\text{centroid}} + A d^2)$
                </div>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>Start Practice 🔍</button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Guided Scenario:</b><br />
                  Set T-beam parameters:<br />
                  $b_f = 120\text{ mm}$, $t_f = 20\text{ mm}$, $h_w = 80\text{ mm}$, $t_w = 20\text{ mm}$.
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What are $\bar{y}$ and $I_x$?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'ȳ = 65.0 mm, I_x = 4.47 * 10^6 mm⁴',
                    'ȳ = 70.0 mm, I_x = 5.67 * 10^6 mm⁴',
                    'ȳ = 65.0 mm, I_x = 5.67 * 10^6 mm⁴',
                    'ȳ = 50.0 mm, I_x = 3.24 * 10^6 mm⁴'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>Submit Answer</button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: guidedAnswer && guidedAnswer.includes('ȳ = 70.0 mm') ? '#dcfce7' : '#fef2f2', color: guidedAnswer && guidedAnswer.includes('ȳ = 70.0 mm') ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer && guidedAnswer.includes('ȳ = 70.0 mm')
                      ? 'Correct! ȳ = (2400·90 + 1600·40)/4000 = 70 mm, I_x = 5.67 × 10^6 mm⁴.'
                      : 'Incorrect. Look at the equations box: ȳ = 70.0 mm, I_x = 5.67 × 10^6 mm⁴.'}
                  </div>
                )}
                <hr style={{ margin: '15px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
                <button className="btn-secondary" onClick={() => setPhase('poe_predict')}>Go to POE Challenge 🔮</button>
              </div>
            )}

            {phase === 'poe_predict' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>Predict Phase (Sizer Controls Locked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Scenario:</b> $b_f = 100\text{ mm}$, $t_f = 20\text{ mm}$, $h_w = 100\text{ mm}$, $t_w = 20\text{ mm}$.<br />
                  <b>Question:</b> Where is the composite centroid ($\bar{y}$) located from the bottom of the web?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {['80 mm', '60 mm', '90 mm', '75 mm'].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="poe_p" value={opt} checked={poePredictAns === opt} onChange={() => { setPoePredictAns(opt); setPoeFinalAns(opt); }} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe_observe')} disabled={!poePredictAns}>Test Hypothesis 🧪</button>
              </div>
            )}

            {phase === 'poe_observe' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d', marginBottom: '8px' }}>Observe & Correct Phase (Controls Unlocked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Instructions:</b> Set $b_f = 100$, $t_f = 20$, $h_w = 100$, $t_w = 20$. Observe $ȳ$ line on plot.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {['80 mm', '60 mm', '90 mm', '75 mm'].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="poe_o" value={opt} checked={poeFinalAns === opt} onChange={() => setPoeFinalAns(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPhase('poe_explain')}>Final Submit 📤</button>
              </div>
            )}

            {phase === 'poe_explain' && (
              <div>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Your final selection:</b><br />
                  <code style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>{poeFinalAns}</code>
                </p>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: poeFinalAns === '80 mm' ? '#dcfce7' : '#fef2f2', color: poeFinalAns === '80 mm' ? '#15803d' : '#b91c1c', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {poeFinalAns === '80 mm' ? '🎉 Correct! Excellent work.' : '⚠️ Incorrect. Look at the details below.'}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <b>Explanation:</b><br />
                  $A_f = 2000\text{ mm}^2$ ($y_f = 110$), $A_w = 2000\text{ mm}^2$ ($y_w = 50$). Equal area shortcut: $\bar{y} = (110+50)/2 = 80\text{ mm}$!
                </div>
                <button className="btn-secondary" onClick={resetSimulator} style={{ marginTop: '15px' }}>Reset Simulator 🔄</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

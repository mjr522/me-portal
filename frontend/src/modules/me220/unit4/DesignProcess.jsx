import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Lock, Award } from 'lucide-react';

export default function DesignProcess() {
  const [weightW, setWeightW] = useState(3); // Weight
  const [weightC, setWeightC] = useState(3); // Cost
  const [weightS, setWeightS] = useState(3); // Strength
  const [weightD, setWeightD] = useState(3); // Stiffness
  const [weightM, setWeightM] = useState(3); // Manufacturing

  const [phase, setPhase] = useState('instructions');
  const [guidedAnswer, setGuidedAnswer] = useState(null);
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const [poePredictAns, setPoePredictAns] = useState(null);
  const [poeFinalAns, setPoeFinalAns] = useState(null);

  const isLocked = phase === 'poe_predict';

  // Base scores [Weight, Cost, Strength, Stiffness, Mfg]
  const baseA = [6, 9, 6, 5, 10]; // Aluminum Tube
  const baseB = [9, 3, 9, 9, 4];  // Carbon Fiber
  const baseC = [2, 6, 8, 8, 6];  // Steel Box
  const baseD = [7, 7, 5, 4, 8];  // Glass Fiber

  // Compute Totals
  const totalA = baseA[0] * weightW + baseA[1] * weightC + baseA[2] * weightS + baseA[3] * weightD + baseA[4] * weightM;
  const totalB = baseB[0] * weightW + baseB[1] * weightC + baseB[2] * weightS + baseB[3] * weightD + baseB[4] * weightM;
  const totalC = baseC[0] * weightW + baseC[1] * weightC + baseC[2] * weightS + baseC[3] * weightD + baseC[4] * weightM;
  const totalD = baseD[0] * weightW + baseD[1] * weightC + baseD[2] * weightS + baseD[3] * weightD + baseD[4] * weightM;

  const maxScore = Math.max(totalA, totalB, totalC, totalD);
  const winnerCode = maxScore === totalA ? 'A' : maxScore === totalB ? 'B' : maxScore === totalC ? 'C' : 'D';

  const resetSimulator = () => {
    setWeightW(3);
    setWeightC(3);
    setWeightS(3);
    setWeightD(3);
    setWeightM(3);
    setPhase('instructions');
    setGuidedAnswer(null);
    setGuidedSubmitted(false);
    setPoePredictAns(null);
    setPoeFinalAns(null);
  };

  const generatePlotData = () => {
    const categories = [
      'Design D (GF Panel)',
      'Design C (Steel Box)',
      'Design B (CF I-Beam)',
      'Design A (Al Tube)'
    ];
    const scores = [totalD, totalC, totalB, totalA];
    const colors = [
      winnerCode === 'D' ? '#8b5cf6' : '#94a3b8',
      winnerCode === 'C' ? '#8b5cf6' : '#94a3b8',
      winnerCode === 'B' ? '#8b5cf6' : '#94a3b8',
      winnerCode === 'A' ? '#8b5cf6' : '#94a3b8'
    ];

    const traces = [{
      x: scores,
      y: categories,
      type: 'bar',
      orientation: 'h',
      marker: { color: colors },
      text: scores.map(s => `${s} pts`),
      textposition: 'inside',
      insidetextanchor: 'end',
      hoverinfo: 'none'
    }];

    const layout = {
      xaxis: { range: [0, 260], showgrid: true, gridcolor: 'rgba(128, 128, 128, 0.05)', zeroline: false, fixedrange: true },
      yaxis: { tickfont: { family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold' }, fixedrange: true },
      margin: { l: 110, r: 10, t: 15, b: 25 },
      showlegend: false,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)'
    };

    return { traces, layout };
  };

  const { traces, layout } = generatePlotData();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1.5px solid var(--border-light)', paddingBottom: '15px', marginBottom: '25px' }}>
        <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unit 4 • Lesson 37
        </span>
        <h1 style={{ margin: '5px 0 0 0', fontWeight: 700, fontSize: '2rem' }}>Engineering Design Process</h1>
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
          <li>Apply the iterative engineering design process to structural problems.</li>
          <li>Construct and evaluate a Pugh Decision Matrix to perform concept trade studies.</li>
          <li>Analyze how customer requirements and weighting factors shift design selection.</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '20px' }}>
        {/* Left Column: Interactive Pugh Matrix & Chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1.2rem', fontWeight: 600 }}>Wing Spar Trade Study & Sizing Optimizer</h3>

          {/* Lock Banner */}
          {isLocked && (
            <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: '8px', padding: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.88rem' }}>
              <Lock size={18} />
              <span><b>Weighting factors are locked for prediction!</b> Submit a hypothesis in the sidecar to unlock.</span>
            </div>
          )}

          {/* Criteria Weight Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '15px' }}>
            {[
              { label: '⚖️ Weight', val: weightW, set: setWeightW },
              { label: '💰 Cost', val: weightC, set: setWeightC },
              { label: '💪 Strength', val: weightS, set: setWeightS },
              { label: '📏 Stiffness', val: weightD, set: setWeightD },
              { label: '🛠️ Mfg Ease', val: weightM, set: setWeightM }
            ].map((item, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{item.label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#8b5cf6', margin: '2px 0' }}>{item.val}</div>
                <input type="range" min="1" max="5" step="1" value={item.val} disabled={isLocked} onChange={(e) => item.set(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
              </div>
            ))}
          </div>

          {/* Pugh Matrix Table & Chart Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '15px', marginBottom: '20px' }}>
            {/* Table */}
            <div style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '12px', overflowX: 'auto' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', color: '#1e293b', borderBottom: '1.5px solid var(--border-light)', paddingBottom: '4px' }}>
                📊 Pugh Decision Matrix
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '4px' }}>Criterion</th>
                    <th style={{ padding: '4px' }}>Weight</th>
                    <th style={{ padding: '4px', backgroundColor: winnerCode === 'A' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', color: winnerCode === 'A' ? '#8b5cf6' : 'inherit' }}>Des. A (Al)</th>
                    <th style={{ padding: '4px', backgroundColor: winnerCode === 'B' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', color: winnerCode === 'B' ? '#8b5cf6' : 'inherit' }}>Des. B (CF)</th>
                    <th style={{ padding: '4px', backgroundColor: winnerCode === 'C' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', color: winnerCode === 'C' ? '#8b5cf6' : 'inherit' }}>Des. C (Steel)</th>
                    <th style={{ padding: '4px', backgroundColor: winnerCode === 'D' ? 'rgba(139, 92, 246, 0.15)' : 'transparent', color: winnerCode === 'D' ? '#8b5cf6' : 'inherit' }}>Des. D (GF)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Weight (Low mass)', w: weightW, a: baseA[0], b: baseB[0], c: baseC[0], d: baseD[0] },
                    { name: 'Cost (Affordability)', w: weightC, a: baseA[1], b: baseB[1], c: baseC[1], d: baseD[1] },
                    { name: 'Strength (Stress res.)', w: weightS, a: baseA[2], b: baseB[2], c: baseC[2], d: baseD[2] },
                    { name: 'Stiffness (Defl. res.)', w: weightD, a: baseA[3], b: baseB[3], c: baseC[3], d: baseD[3] },
                    { name: 'Mfg Ease', w: weightM, a: baseA[4], b: baseB[4], c: baseC[4], d: baseD[4] }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ textAlign: 'left', fontWeight: 500, padding: '4px' }}>{row.name}</td>
                      <td style={{ padding: '4px' }}>{row.w}</td>
                      <td style={{ padding: '4px', backgroundColor: winnerCode === 'A' ? 'rgba(139, 92, 246, 0.08)' : 'transparent' }}>{row.a * row.w}</td>
                      <td style={{ padding: '4px', backgroundColor: winnerCode === 'B' ? 'rgba(139, 92, 246, 0.08)' : 'transparent' }}>{row.b * row.w}</td>
                      <td style={{ padding: '4px', backgroundColor: winnerCode === 'C' ? 'rgba(139, 92, 246, 0.08)' : 'transparent' }}>{row.c * row.w}</td>
                      <td style={{ padding: '4px', backgroundColor: winnerCode === 'D' ? 'rgba(139, 92, 246, 0.08)' : 'transparent' }}>{row.d * row.w}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 800, backgroundColor: 'rgba(128,128,128,0.03)' }}>
                    <td style={{ textAlign: 'left', padding: '6px 4px', borderTop: '1.5px solid var(--border-light)' }}>Total Score</td>
                    <td style={{ borderTop: '1.5px solid var(--border-light)' }}>—</td>
                    <td style={{ borderTop: '1.5px solid var(--border-light)', color: winnerCode === 'A' ? '#8b5cf6' : 'inherit', fontWeight: winnerCode === 'A' ? 800 : 700 }}>{totalA}</td>
                    <td style={{ borderTop: '1.5px solid var(--border-light)', color: winnerCode === 'B' ? '#8b5cf6' : 'inherit', fontWeight: winnerCode === 'B' ? 800 : 700 }}>{totalB}</td>
                    <td style={{ borderTop: '1.5px solid var(--border-light)', color: winnerCode === 'C' ? '#8b5cf6' : 'inherit', fontWeight: winnerCode === 'C' ? 800 : 700 }}>{totalC}</td>
                    <td style={{ borderTop: '1.5px solid var(--border-light)', color: winnerCode === 'D' ? '#8b5cf6' : 'inherit', fontWeight: winnerCode === 'D' ? 800 : 700 }}>{totalD}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Plotly Horizontal Bar Chart */}
            <div style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '8px', height: '240px' }}>
              <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
            </div>
          </div>

          {/* Design Loop Steps */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '15px', fontSize: '0.85rem' }}>
            <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#1e293b' }}>🌀 The Engineering Design Loop</h4>
            <ol style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-muted)' }}>
              <li><b>Identify Problem:</b> Define requirements and constraints (weight, span, cost).</li>
              <li><b>Brainstorm Concepts:</b> Create concept designs (Al Tube, CF I-Beam, Steel Box, GF Panel).</li>
              <li><b>Formulate Criteria & Weights:</b> Establish customer priority weights.</li>
              <li><b>Evaluate Matrix:</b> Score options and select optimal concept (Pugh Matrix).</li>
              <li><b>Prototype & Test:</b> Build prototypes and run structural tests.</li>
            </ol>
          </div>
        </div>

        {/* Right Sidecar Column */}
        <div style={{ background: 'rgba(139, 92, 246, 0.04)', border: '2px solid #8b5cf6', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ marginTop: 0, color: '#8b5cf6', fontWeight: 700, fontSize: '1.1rem', marginBottom: '15px' }}>
              {phase === 'instructions' && '📖 Step 1: Design Concepts'}
              {phase === 'guided_question' && '🔍 Step 2: Guided Trade-off'}
              {phase === 'poe_predict' && '🔮 POE Challenge: Predict'}
              {phase === 'poe_observe' && '👀 POE Challenge: Observe'}
              {phase === 'poe_explain' && '💡 POE Challenge: Explain'}
            </h4>

            {phase === 'instructions' && (
              <div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '12px' }}>
                  A <b>Pugh Matrix</b> helps engineers evaluate multiple design concepts objectively:
                </p>
                <ol style={{ fontSize: '0.82rem', color: 'var(--text-muted)', paddingLeft: '18px', marginBottom: '15px' }}>
                  <li>Select criteria and assign weight factors (1-5).</li>
                  <li>Rate candidates (1-10) on each criterion.</li>
                  <li>Calculate total weighted score $\sum (Rating \times Weight)$.</li>
                </ol>
                <button className="btn-primary" onClick={() => setPhase('guided_question')}>Start Practice 🔍</button>
              </div>
            )}

            {phase === 'guided_question' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
                  <b>Guided Practice:</b><br />
                  Set <b>all criteria weights</b> to <code>2</code> using sliders.
                </p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
                  What are total scores for Design A and Design B under uniform weighting?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Design A: 72 pts, Design B: 68 pts (Design A wins)',
                    'Design A: 36 pts, Design B: 34 pts (Design A wins)',
                    'Design A: 60 pts, Design B: 72 pts (Design B wins)',
                    'Design A: 54 pts, Design B: 54 pts (It is a tie)'
                  ].map((opt, idx) => (
                    <label key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="guided" value={opt} checked={guidedAnswer === opt} onChange={() => setGuidedAnswer(opt)} />
                      {opt}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setGuidedSubmitted(true)} style={{ marginBottom: '10px' }}>Submit Answer</button>

                {guidedSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', padding: '8px', borderRadius: '8px', backgroundColor: guidedAnswer && guidedAnswer.includes('Design A: 72 pts, Design B: 68 pts') ? '#dcfce7' : '#fef2f2', color: guidedAnswer && guidedAnswer.includes('Design A: 72 pts, Design B: 68 pts') ? '#15803d' : '#b91c1c' }}>
                    {guidedAnswer && guidedAnswer.includes('Design A: 72 pts, Design B: 68 pts')
                      ? 'Correct! Design A = 36 × 2 = 72 pts, Design B = 34 × 2 = 68 pts.'
                      : 'Incorrect. Verify all sliders are set to 2.'}
                  </div>
                )}
                <hr style={{ margin: '15px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
                <button className="btn-secondary" onClick={() => setPhase('poe_predict')}>Go to POE Challenge 🔮</button>
              </div>
            )}

            {phase === 'poe_predict' && (
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>Predict Phase (Weights Locked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Solar UAV Scenario:</b><br />
                  Weight=5, Stiffness=4, Strength=4, Cost=1, Mfg=1.<br />
                  <b>Question:</b> Which design wins and what is its total score?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Design B (Carbon Fiber I-Beam) with score 124 pts',
                    'Design A (Aluminum Tube) with score 93 pts',
                    'Design B (Carbon Fiber I-Beam) with score 110 pts',
                    'Design D (Glass Fiber Panel) with score 86 pts'
                  ].map((opt, idx) => (
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
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d', marginBottom: '8px' }}>Observe & Correct Phase (Weights Unlocked!):</p>
                <p style={{ fontSize: '0.82rem', marginBottom: '10px' }}>
                  <b>Instructions:</b> Set weights: Weight=5, Cost=1, Strength=4, Stiffness=4, Mfg=1.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                  {[
                    'Design B (Carbon Fiber I-Beam) with score 124 pts',
                    'Design A (Aluminum Tube) with score 93 pts',
                    'Design B (Carbon Fiber I-Beam) with score 110 pts',
                    'Design D (Glass Fiber Panel) with score 86 pts'
                  ].map((opt, idx) => (
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
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: poeFinalAns && poeFinalAns.includes('Design B') && poeFinalAns.includes('124 pts') ? '#dcfce7' : '#fef2f2', color: poeFinalAns && poeFinalAns.includes('Design B') && poeFinalAns.includes('124 pts') ? '#15803d' : '#b91c1c', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {poeFinalAns && poeFinalAns.includes('Design B') && poeFinalAns.includes('124 pts') ? '🎉 Correct! Excellent decision-matrix mapping.' : '⚠️ Incorrect. Look at the calculations below.'}
                </div>
                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                  <b>Explanation:</b><br />
                  Design B = $9(5) + 3(1) + 9(4) + 9(4) + 4(1) = 45 + 3 + 36 + 36 + 4 = 124$ pts. Carbon Fiber dominates when structural performance is prioritized!
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

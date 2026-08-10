import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Target, CheckCircle, AlertCircle, RefreshCw, Lock, ArrowUp } from 'lucide-react';

export default function BeamSimulator() {
  // Concept check checkbox states
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [c4, setC4] = useState(false);
  const [c5, setC5] = useState(false);
  const [c6, setC6] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Simulator inputs
  const [w, setW] = useState(10.0); // kN/m
  const [L, setL] = useState(10.0); // m

  // Calculations
  const W = w * L;
  const RA = W / 2;
  const RB = W / 2;

  // Grade calculation
  const c1Correct = c1 === true;
  const c2Correct = c2 === true;
  const c3Correct = c3 === true;
  const c4Correct = c4 === false;
  const c5Correct = c5 === false;
  const c6Correct = c6 === false;
  const score = [c1Correct, c2Correct, c3Correct, c4Correct, c5Correct, c6Correct].filter(Boolean).length;

  const resetChallenge = () => {
    setC1(false);
    setC2(false);
    setC3(false);
    setC4(false);
    setC5(false);
    setC6(false);
    setSubmitted(false);
  };

  // Generate Plotly figure for simply supported beam with UDL
  const generatePlotData = () => {
    const traces = [];
    const annotations = [];

    const Hudl = w > 0 ? 0.2 + 0.8 * (w / 50.0) : 0.2;

    // 1. Beam
    traces.push({
      x: [0, L], y: [0, 0],
      mode: 'lines', line: { color: '#475569', width: 12 },
      name: 'Beam', hoverinfo: 'text', hovertext: `Simply Supported Beam<br>Length L = ${L.toFixed(2)} m`
    });

    // 2. Pin Support (Left)
    traces.push({
      x: [-0.2, 0, 0.2, -0.2],
      y: [-0.3, 0, -0.3, -0.3],
      fill: 'toself', mode: 'lines',
      line: { color: '#0284c7', width: 2 }, fillcolor: 'rgba(2, 132, 199, 0.2)',
      name: 'Pin Support (A)', hoverinfo: 'text', hovertext: 'Pin Support (A) [Left End]'
    });

    // 3. Roller Support (Right)
    traces.push({
      x: [L - 0.2, L, L + 0.2, L - 0.2],
      y: [-0.22, 0, -0.22, -0.22],
      fill: 'toself', mode: 'lines',
      line: { color: '#0f766e', width: 2 }, fillcolor: 'rgba(15, 118, 110, 0.2)',
      name: 'Roller Support (B)', hoverinfo: 'text', hovertext: 'Roller Support (B) [Right End]'
    });

    // Wheels under roller
    traces.push({
      x: [L - 0.1, L + 0.1], y: [-0.28, -0.28],
      mode: 'markers', marker: { size: 8, color: '#0f766e', symbol: 'circle' },
      showlegend: false, hoverinfo: 'skip'
    });

    // 4. UDL Box & arrows
    if (w > 0) {
      traces.push({
        x: [0, L, L, 0, 0],
        y: [0, 0, Hudl, Hudl, 0],
        fill: 'toself', fillcolor: 'rgba(239, 68, 68, 0.12)',
        line: { color: 'rgba(239, 68, 68, 0.5)', width: 2, dash: 'dash' },
        name: 'UDL', hoverinfo: 'text', hovertext: `UDL (w) = ${w.toFixed(2)} kN/m`
      });

      const numArrows = L < 8 ? 9 : (L > 14 ? 13 : 11);
      for (let i = 0; i < numArrows; i++) {
        const xArrow = (L * i) / (numArrows - 1);
        annotations.push({
          x: xArrow, y: 0.02,
          ax: xArrow, ay: Hudl,
          xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
          showarrow: true, arrowhead: 2, arrowsize: 1.0, arrowwidth: 1.5, arrowcolor: 'rgba(239, 68, 68, 0.55)'
        });
      }
    }

    // 5. Reaction Force Arrows
    const maxR = 500.0;
    if (RA > 0) {
      const arrowLA = 0.3 + 0.8 * (RA / maxR);
      annotations.push({
        x: 0, y: -0.05,
        ax: 0, ay: -arrowLA - 0.05,
        xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
        showarrow: true, arrowhead: 2, arrowsize: 1.4, arrowwidth: 4.0, arrowcolor: '#0284c7'
      });
      annotations.push({
        x: 0, y: -arrowLA - 0.22,
        text: `<b>R<sub>A</sub> = ${RA.toFixed(1)} kN</b>`,
        showarrow: false, font: { color: '#0284c7', size: 13, family: 'Outfit, sans-serif' }
      });
    }

    if (RB > 0) {
      const arrowLB = 0.3 + 0.8 * (RB / maxR);
      annotations.push({
        x: L, y: -0.05,
        ax: L, ay: -arrowLB - 0.05,
        xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
        showarrow: true, arrowhead: 2, arrowsize: 1.4, arrowwidth: 4.0, arrowcolor: '#0f766e'
      });
      annotations.push({
        x: L, y: -arrowLB - 0.22,
        text: `<b>R<sub>B</sub> = ${RB.toFixed(1)} kN</b>`,
        showarrow: false, font: { color: '#0f766e', size: 13, family: 'Outfit, sans-serif' }
      });
    }

    // 6. Equivalent Point Load
    if (W > 0) {
      const ayEq = Hudl + 0.35;
      annotations.push({
        x: L / 2, y: 0.03,
        ax: L / 2, ay: ayEq,
        xref: 'x', yref: 'y', axref: 'x', ayref: 'y',
        showarrow: true, arrowhead: 3, arrowsize: 1.1, arrowwidth: 2.5, arrowcolor: '#eab308'
      });
      annotations.push({
        x: L / 2, y: ayEq + 0.1,
        text: `<b>W = w·L = ${W.toFixed(1)} kN</b><br>(Resultant at L/2)`,
        showarrow: false, font: { color: '#b45309', size: 11, family: 'Outfit, sans-serif' },
        align: 'center'
      });
    }

    const layout = {
      xaxis: {
        title: { text: 'Beam Span (x, meters)', font: { size: 13, family: 'Outfit, sans-serif' } },
        range: [-1.0, L + 1.0],
        dtick: L > 10 ? 2.0 : 1.0,
        showgrid: true, gridcolor: 'rgba(128, 128, 128, 0.1)', zeroline: false, fixedrange: true
      },
      yaxis: {
        range: [-1.6, Hudl + 0.75],
        showgrid: false, zeroline: false, showticklabels: false, fixedrange: true
      },
      plot_bgcolor: 'rgba(0, 0, 0, 0)', paper_bgcolor: 'rgba(0, 0, 0, 0)',
      showlegend: false, margin: { l: 15, r: 15, t: 10, b: 15 }, height: 380, annotations
    };

    return { traces, layout };
  };

  const { traces, layout } = generatePlotData();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '5px' }}>Simply Supported Beam: UDL Reaction Solver</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>An Interactive Engineering Mechanics Classroom Demonstration</p>
      <hr style={{ borderColor: 'var(--border-light)', marginBottom: '25px' }} />

      {/* Concept Check Box */}
      <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1.5px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '24px', marginBottom: '25px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ color: '#1e3a8a', marginTop: 0, marginBottom: '10px', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          🧠 Pre-Simulation Challenge: Concept Check
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '15px' }}>
          To unlock the interactive beam model, test your understanding of beam mechanics first. Select the <b>three (3) correct statements</b> from the options below and click <b>Submit Answers</b>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
          <label style={{ fontSize: '0.9rem', display: 'flex', gap: '8px', cursor: submitted ? 'default' : 'pointer' }}>
            <input type="checkbox" checked={c1} disabled={submitted} onChange={(e) => setC1(e.target.checked)} />
            1. Due to the vertical symmetry of the load, the reaction forces at the ends are equal: $R_A = R_B = \frac{w \cdot L}{2}$.
          </label>
          <label style={{ fontSize: '0.9rem', display: 'flex', gap: '8px', cursor: submitted ? 'default' : 'pointer' }}>
            <input type="checkbox" checked={c2} disabled={submitted} onChange={(e) => setC2(e.target.checked)} />
            2. For calculating external reactions, the distributed load of intensity $w$ can be represented as an equivalent concentrated force $W = w \cdot L$ acting at the beam's midpoint $x = L/2$.
          </label>
          <label style={{ fontSize: '0.9rem', display: 'flex', gap: '8px', cursor: submitted ? 'default' : 'pointer' }}>
            <input type="checkbox" checked={c3} disabled={submitted} onChange={(e) => setC3(e.target.checked)} />
            3. If we double both the load intensity $w$ and the beam length $L$, the reaction forces $R_A$ and $R_B$ will quadruple.
          </label>
          <label style={{ fontSize: '0.9rem', display: 'flex', gap: '8px', cursor: submitted ? 'default' : 'pointer' }}>
            <input type="checkbox" checked={c4} disabled={submitted} onChange={(e) => setC4(e.target.checked)} />
            4. The reaction force at the left pin support is twice as large as the right roller support because the pin resists horizontal forces.
          </label>
          <label style={{ fontSize: '0.9rem', display: 'flex', gap: '8px', cursor: submitted ? 'default' : 'pointer' }}>
            <input type="checkbox" checked={c5} disabled={submitted} onChange={(e) => setC5(e.target.checked)} />
            5. Doubling only the beam length $L$ while keeping the load intensity $w$ constant will not change the reaction forces.
          </label>
          <label style={{ fontSize: '0.9rem', display: 'flex', gap: '8px', cursor: submitted ? 'default' : 'pointer' }}>
            <input type="checkbox" checked={c6} disabled={submitted} onChange={(e) => setC6(e.target.checked)} />
            6. The units of the reaction forces $R_A$ and $R_B$ are kN/m, while the distributed load intensity $w$ is in kN.
          </label>
        </div>

        {!submitted ? (
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => setSubmitted(true)}>
            Submit Answers 🔓
          </button>
        ) : (
          <div>
            <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '15px', fontWeight: 600, backgroundColor: score === 6 ? '#dcfce7' : '#fef3c7', color: score === 6 ? '#15803d' : '#b45309' }}>
              {score === 6 ? '🎉 Fantastic! 6/6 Correct Classifications. You have unlocked the simulation!' : `🔓 Simulation Unlocked! You got ${score}/6 correct classifications. Review the detailed feedback below.`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.85rem', marginBottom: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>{c1Correct ? '✅' : '❌'} <b>Symmetry Statement:</b> {c1Correct ? 'Correct! $R_A = R_B = wL/2$.' : 'Incorrect. Reactions must be equal due to symmetry.'}</div>
                <div>{c2Correct ? '✅' : '❌'} <b>Resultant Centroid:</b> {c2Correct ? 'Correct! UDL acts through midpoint L/2.' : 'Incorrect. Equivalent force acts at midpoint.'}</div>
                <div>{c3Correct ? '✅' : '❌'} <b>Scaling Rule:</b> {c3Correct ? 'Correct! Doubling both quadruples reactions.' : 'Incorrect. $R = (2w)(2L)/2 = 4 R$.'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>{c4Correct ? '✅' : '❌'} <b>Pin vs Roller:</b> {c4Correct ? 'Correct! Vertical reactions are equal.' : 'Incorrect. No horizontal forces exist here.'}</div>
                <div>{c5Correct ? '✅' : '❌'} <b>Length Scaling:</b> {c5Correct ? 'Correct! Doubling length doubles reactions.' : 'Incorrect. Reactions scale linearly with L.'}</div>
                <div>{c6Correct ? '✅' : '❌'} <b>Units Check:</b> {c6Correct ? 'Correct! Reactions in kN, load in kN/m.' : 'Incorrect. Units were swapped in statement.'}</div>
              </div>
            </div>

            <button className="btn-secondary" style={{ width: 'auto' }} onClick={resetChallenge}>
              Reset Challenge 🔄
            </button>
          </div>
        )}
      </div>

      {/* Simulator Container (Gated/Blurred if not submitted) */}
      <div style={{ filter: submitted ? 'none' : 'blur(6px) grayscale(30%)', pointerEvents: submitted ? 'auto' : 'none', opacity: submitted ? 1 : 0.5, transition: 'all 0.5s ease' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '15px' }}>📊 Interactive Beam Model & Simulation</h2>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Distributed Load Intensity, $w$ (kN/m)</label>
            <input type="range" min="0" max="50" step="1" value={w} onChange={(e) => setW(parseFloat(e.target.value))} style={{ width: '100%', marginTop: '6px', accentColor: '#3b82f6' }} />
            <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', color: '#3b82f6' }}>{w.toFixed(1)} kN/m</div>
          </div>
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Beam Length, $L$ (m)</label>
            <input type="range" min="2.0" max="20.0" step="0.5" value={L} onChange={(e) => setL(parseFloat(e.target.value))} style={{ width: '100%', marginTop: '6px', accentColor: '#3b82f6' }} />
            <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', color: '#3b82f6' }}>{L.toFixed(1)} m</div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '25px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Beam Length (L)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{L.toFixed(1)} m</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Load Intensity (w)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{w.toFixed(1)} kN/m</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Resultant Load (W)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{W.toFixed(1)} kN</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderBottom: '4px solid #0284c7', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Left Reaction ($R_A$)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0284c7' }}>{RA.toFixed(1)} kN</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderBottom: '4px solid #0f766e', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Right Reaction ($R_B$)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f766e' }}>{RB.toFixed(1)} kN</div>
          </div>
        </div>

        {/* Plotly Chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '15px', marginBottom: '25px' }}>
          <Plot data={traces} layout={layout} useResizeHandler style={{ width: '100%', height: '100%' }} config={{ responsive: true, displayModeBar: false }} />
        </div>

        {/* Calculations Walkthrough */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '15px' }}>📝 Detailed Calculation Walkthrough</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f1f5f9', borderRadius: '12px', padding: '20px', fontSize: '0.9rem' }}>
          <div>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Step 1: Calculate Total Equivalent Load ($W$)</h4>
            <p>$W = w \cdot L = {w.toFixed(2)}\text{{ kN/m}} \cdot {L.toFixed(2)}\text{{ m}} = {W.toFixed(2)}\text{{ kN}}$</p>
            <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>Step 2: Sum of Moments about Support A ($\sum M_A = 0$)</h4>
            <p>$\sum M_A = 0 \implies R_B \cdot L - W \cdot \frac{{L}}{{2}} = 0$</p>
            <p>$R_B \cdot {L.toFixed(2)} = {W.toFixed(2)} \cdot {(L / 2).toFixed(2)} = {(W * L / 2).toFixed(2)}\text{{ kN·m}}$</p>
            <p><b>$R_B = {RB.toFixed(2)}\text{{ kN}}$</b></p>
          </div>
          <div>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Step 3: Sum of Vertical Forces ($\sum F_y = 0$)</h4>
            <p>$\sum F_y = 0 \implies R_A + R_B - W = 0$</p>
            <p>$R_A = W - R_B = {W.toFixed(2)} - {RB.toFixed(2)} = \mathbf{{{RA.toFixed(2)}}\text{{ kN}}}$</p>
            <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>Step 4: Verification of Symmetry</h4>
            <p><b>$R_A = R_B = \frac{{w \cdot L}}{{2}} = \frac{{{w.toFixed(2)} \cdot {L.toFixed(2)}}}{{2}} = {RA.toFixed(2)}\text{{ kN}}$</b></p>
          </div>
        </div>
      </div>
    </div>
  );
}

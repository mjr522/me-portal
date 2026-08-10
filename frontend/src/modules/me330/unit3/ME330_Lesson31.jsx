import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathInline({ math }) {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathBlock({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ME330_Lesson31() {
  const [supportType, setSupportType] = useState('cantilever'); // 'cantilever' or 'simply_supported'
  const [enableP, setEnableP] = useState(true);
  const [enableW, setEnableW] = useState(true);
  const [enableM, setEnableM] = useState(false);

  const [P_kN, setP_kN] = useState(10); // kN
  const [w_kNm, setW_kNm] = useState(4); // kN/m
  const [M0_kNm, setM0_kNm] = useState(8); // kN*m

  const [L, setL] = useState(5.0); // m
  const [EI_kNm2, setEI_kNm2] = useState(8000); // kN*m^2

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  const nPts = 100;
  const xVals = Array.from({ length: nPts }, (_, i) => (i * L) / (nPts - 1));

  // Initialize arrays for deflection components (in mm)
  let vP_mm = Array(nPts).fill(0);
  let vW_mm = Array(nPts).fill(0);
  let vM_mm = Array(nPts).fill(0);

  if (supportType === 'cantilever') {
    // 1. Tip Point Load P
    if (enableP) {
      const P = P_kN; // kN
      vP_mm = xVals.map((x) => ((-P * x * x * (3 * L - x)) / (6 * EI_kNm2)) * 1000);
    }
    // 2. Uniform Load w
    if (enableW) {
      const w = w_kNm;
      vW_mm = xVals.map((x) => ((-w * x * x * (x * x - 4 * L * x + 6 * L * L)) / (24 * EI_kNm2)) * 1000);
    }
    // 3. Tip Couple M0
    if (enableM) {
      const M0 = M0_kNm;
      vM_mm = xVals.map((x) => ((-M0 * x * x) / (2 * EI_kNm2)) * 1000);
    }
  } else {
    // Simply Supported
    // 1. Center Point Load P
    if (enableP) {
      const P = P_kN;
      vP_mm = xVals.map((x) => {
        if (x <= L / 2) return ((-P * x * (3 * L * L - 4 * x * x)) / (48 * EI_kNm2)) * 1000;
        return ((-P * (L - x) * (3 * L * L - 4 * Math.pow(L - x, 2))) / (48 * EI_kNm2)) * 1000;
      });
    }
    // 2. Uniform Load w
    if (enableW) {
      const w = w_kNm;
      vW_mm = xVals.map((x) => ((-w * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3))) / (24 * EI_kNm2)) * 1000);
    }
    // 3. End Couple M0 at x=L
    if (enableM) {
      const M0 = M0_kNm;
      vM_mm = xVals.map((x) => ((-M0 * x * (L * L - x * x)) / (6 * L * EI_kNm2)) * 1000);
    }
  }

  // Total Superimposed Deflection
  const vTotal_mm = xVals.map((_, i) => vP_mm[i] + vW_mm[i] + vM_mm[i]);
  const maxTotalDefl_mm = Math.max(...vTotal_mm.map(Math.abs));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900 via-amber-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 31: Beam Deflections by Superposition & Reference Tables</h1>
        <p className="mt-2 text-amber-200">
          Decompose multi-load beams into standard Appendix E reference cases, compute individual deflections, and superimpose total elastic curves.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Superposition Case Builder</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Support Boundary Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSupportType('cantilever')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  supportType === 'cantilever' ? 'bg-orange-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Cantilever
              </button>
              <button
                onClick={() => setSupportType('simply_supported')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  supportType === 'simply_supported' ? 'bg-orange-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Simply Supported
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Load Case 1 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input type="checkbox" checked={enableP} onChange={(e) => setEnableP(e.target.checked)} className="rounded text-orange-600" />
                  Case 1: Point Load (P)
                </label>
                <span className="text-xs font-bold text-orange-600">{P_kN} kN</span>
              </div>
              {enableP && (
                <input type="range" min="1" max="50" step="1" value={P_kN} onChange={(e) => setP_kN(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              )}
            </div>

            {/* Load Case 2 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input type="checkbox" checked={enableW} onChange={(e) => setEnableW(e.target.checked)} className="rounded text-blue-600" />
                  Case 2: Distributed Load (w)
                </label>
                <span className="text-xs font-bold text-blue-600">{w_kNm} kN/m</span>
              </div>
              {enableW && (
                <input type="range" min="1" max="20" step="0.5" value={w_kNm} onChange={(e) => setW_kNm(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              )}
            </div>

            {/* Load Case 3 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input type="checkbox" checked={enableM} onChange={(e) => setEnableM(e.target.checked)} className="rounded text-purple-600" />
                  Case 3: Concentrated Moment (M0)
                </label>
                <span className="text-xs font-bold text-purple-600">{M0_kNm} kN·m</span>
              </div>
              {enableM && (
                <input type="range" min="1" max="30" step="1" value={M0_kNm} onChange={(e) => setM0_kNm(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              )}
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium">
                <span>Span Length (L):</span>
                <span className="font-bold">{L} m</span>
              </div>
              <input type="range" min="2" max="10" step="0.5" value={L} onChange={(e) => setL(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium">
                <span>Flexural Rigidity (EI):</span>
                <span className="font-bold">{EI_kNm2} kN·m²</span>
              </div>
              <input type="range" min="1000" max="20000" step="500" value={EI_kNm2} onChange={(e) => setEI_kNm2(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Results & Plotly Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 font-medium">Total Maximum Superimposed Deflection</span>
              <div className="text-2xl font-bold text-orange-600 mt-1">
                {maxTotalDefl_mm.toFixed(2)} <span className="text-sm font-normal">mm</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 text-right">
              Formula: <MathInline math="v_{\text{total}}(x) = v_P(x) + v_w(x) + v_M(x)" />
            </div>
          </div>

          {/* Plotly Chart */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Superimposed Elastic Deflection Curves</h3>
            <Plot
              data={[
                ...(enableP ? [{ x: xVals, y: vP_mm, mode: 'lines', name: 'Case 1 (P)', line: { color: '#f97316', width: 2, dash: 'dot' } }] : []),
                ...(enableW ? [{ x: xVals, y: vW_mm, mode: 'lines', name: 'Case 2 (w)', line: { color: '#3b82f6', width: 2, dash: 'dot' } }] : []),
                ...(enableM ? [{ x: xVals, y: vM_mm, mode: 'lines', name: 'Case 3 (M0)', line: { color: '#a855f7', width: 2, dash: 'dot' } }] : []),
                {
                  x: xVals,
                  y: vTotal_mm,
                  mode: 'lines',
                  name: 'TOTAL Superimposed Curve',
                  line: { color: '#ea580c', width: 4 },
                },
              ]}
              layout={{
                autosize: true,
                height: 380,
                margin: { l: 60, r: 40, t: 30, b: 50 },
                xaxis: { title: 'Position along beam x (m)', gridcolor: '#e2e8f0' },
                yaxis: { title: 'Deflection v (mm)', gridcolor: '#e2e8f0' },
                showlegend: true,
                legend: { orientation: 'h', y: -0.2 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
              }}
              useResizeHandler={true}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* POE Quiz Section */}
      <div className="bg-orange-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-orange-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          Under what physical conditions can the Principle of Superposition be applied to beam deflections?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="List required physical assumptions..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-sm transition"
          >
            Check Answer
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-orange-200 dark:border-slate-600">
            <h4 className="font-semibold text-orange-900 dark:text-orange-300">Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              Superposition requires two fundamental conditions:
              1. <strong>Linear Elastic Material Behavior</strong> (Hooke's law applies, no yielding).
              2. <strong>Small Deflections & Rotations</strong> (geometry of loading remains unchanged during deformation).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

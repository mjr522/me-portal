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

export default function ME330_Lesson33() {
  const [loadType, setLoadType] = useState('udl'); // 'udl' or 'point'
  const [w_kNm, setW_kNm] = useState(10); // kN/m
  const [P_kN, setP_kN] = useState(40); // kN
  const [L, setL] = useState(6.0); // m
  const [EI_kNm2, setEI_kNm2] = useState(12000); // kN*m^2

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Propped Cantilever Solution via Superposition
  // Fixed at x=0 (A), Prop Roller at x=L (B)
  let By = 0; // Prop reaction (kN)
  let Ay = 0; // Fixed base vertical reaction (kN)
  let MA = 0; // Fixed base moment (kN*m)

  if (loadType === 'udl') {
    By = (3 / 8) * w_kNm * L;
    Ay = (5 / 8) * w_kNm * L;
    MA = -(1 / 8) * w_kNm * L * L;
  } else {
    // Center point load P at x = L/2
    By = (5 / 16) * P_kN;
    Ay = (11 / 16) * P_kN;
    MA = -(3 / 16) * P_kN * L;
  }

  const nPts = 100;
  const xVals = Array.from({ length: nPts }, (_, i) => (i * L) / (nPts - 1));

  let V_vals = [];
  let M_vals = [];
  let v_vals_mm = [];

  if (loadType === 'udl') {
    const w = w_kNm;
    V_vals = xVals.map((x) => Ay - w * x);
    M_vals = xVals.map((x) => MA + Ay * x - (w * x * x) / 2);
    // Elastic curve: EI*v(x) = MA*x^2/2 + Ay*x^3/6 - w*x^4/24
    v_vals_mm = xVals.map((x) => {
      const v_m = ((MA * x * x) / 2 + (Ay * Math.pow(x, 3)) / 6 - (w * Math.pow(x, 4)) / 24) / EI_kNm2;
      return v_m * 1000;
    });
  } else {
    const P = P_kN;
    V_vals = xVals.map((x) => (x <= L / 2 ? Ay : Ay - P));
    M_vals = xVals.map((x) => (x <= L / 2 ? MA + Ay * x : MA + Ay * x - P * (x - L / 2)));
    // Deflection via piecewise integration/superposition
    v_vals_mm = xVals.map((x) => {
      // Primary cantilever under center load P + prop reaction By
      let vP = 0;
      if (x <= L / 2) {
        vP = (-P * x * x * (3 * (L / 2) - x)) / (6 * EI_kNm2);
      } else {
        vP = (-P * Math.pow(L / 2, 2) * (3 * x - L / 2)) / (6 * EI_kNm2);
      }
      const vBy = (By * x * x * (3 * L - x)) / (6 * EI_kNm2);
      return (vP + vBy) * 1000;
    });
  }

  const maxDefl_mm = Math.max(...v_vals_mm.map(Math.abs));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 33: Statically Indeterminate Beams & Propped Cantilever</h1>
        <p className="mt-2 text-rose-200">
          Enforce geometric compatibility conditions <MathInline math="v(L) = 0" /> to solve 1st degree statically indeterminate propped cantilever beams.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Propped Cantilever Setup</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Load Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setLoadType('udl')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  loadType === 'udl' ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Uniform Load (w)
              </button>
              <button
                onClick={() => setLoadType('point')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  loadType === 'point' ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Center Load (P)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loadType === 'udl' ? (
              <div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Uniform Distributed Load (<MathInline math="w" />):</span>
                  <span className="text-rose-600 font-bold">{w_kNm} kN/m</span>
                </div>
                <input type="range" min="2" max="30" step="1" value={w_kNm} onChange={(e) => setW_kNm(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Center Point Load (<MathInline math="P" />):</span>
                  <span className="text-rose-600 font-bold">{P_kN} kN</span>
                </div>
                <input type="range" min="10" max="100" step="5" value={P_kN} onChange={(e) => setP_kN(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
              </div>
            )}

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Span Length (<MathInline math="L" />):</span>
                <span className="text-blue-600 font-bold">{L} m</span>
              </div>
              <input type="range" min="2" max="12" step="0.5" value={L} onChange={(e) => setL(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Flexural Rigidity (<MathInline math="EI" />):</span>
                <span className="text-purple-600 font-bold">{EI_kNm2} kN·m²</span>
              </div>
              <input type="range" min="2000" max="30000" step="1000" value={EI_kNm2} onChange={(e) => setEI_kNm2(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>
          </div>

          <div className="bg-rose-50 dark:bg-slate-700/50 p-4 rounded-xl text-xs space-y-1">
            <h4 className="font-bold text-rose-900 dark:text-rose-200">Compatibility Formula</h4>
            <p><MathInline math="v_P(L) + v_B(L) = 0" /></p>
            {loadType === 'udl' ? (
              <p className="font-semibold text-rose-700 dark:text-rose-300">
                <MathInline math="-\frac{wL^4}{8EI} + \frac{B_y L^3}{3EI} = 0 \implies B_y = \frac{3}{8}wL" />
              </p>
            ) : (
              <p className="font-semibold text-rose-700 dark:text-rose-300">
                <MathInline math="-\frac{5PL^3}{48EI} + \frac{B_y L^3}{3EI} = 0 \implies B_y = \frac{5}{16}P" />
              </p>
            )}
          </div>
        </div>

        {/* Results & Plotly Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Reaction Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Redundant Prop By</span>
              <div className="text-xl font-bold text-rose-600 mt-1">
                {By.toFixed(2)} <span className="text-xs font-normal">kN</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Fixed Support Ay</span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {Ay.toFixed(2)} <span className="text-xs font-normal">kN</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Fixed Base Moment MA</span>
              <div className="text-xl font-bold text-purple-600 mt-1">
                {MA.toFixed(2)} <span className="text-xs font-normal">kN·m</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Peak Deflection (|v_max|)</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {maxDefl_mm.toFixed(2)} <span className="text-xs font-normal">mm</span>
              </div>
            </div>
          </div>

          {/* Plotly Shear, Moment & Deflection Plot */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Internal Shear V(x), Moment M(x), and Deflection v(x)</h3>
            <Plot
              data={[
                {
                  x: xVals,
                  y: V_vals,
                  mode: 'lines',
                  name: 'Shear V(x) (kN)',
                  line: { color: '#3b82f6', width: 2 },
                },
                {
                  x: xVals,
                  y: M_vals,
                  mode: 'lines',
                  name: 'Moment M(x) (kN·m)',
                  line: { color: '#a855f7', width: 2 },
                },
                {
                  x: xVals,
                  y: v_vals_mm,
                  mode: 'lines',
                  name: 'Deflection v(x) (mm)',
                  line: { color: '#e11d48', width: 3 },
                },
              ]}
              layout={{
                autosize: true,
                height: 380,
                margin: { l: 60, r: 40, t: 30, b: 50 },
                xaxis: { title: 'Position x along span (m)', gridcolor: '#e2e8f0' },
                yaxis: { title: 'Values (kN, kN·m, mm)', zeroline: true, gridcolor: '#e2e8f0' },
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
      <div className="bg-rose-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-rose-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          In a propped cantilever under uniform load <MathInline math="w" />, what fraction of the total applied load <MathInline math="wL" /> is carried by the prop reaction <MathInline math="B_y" />?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="State the load fraction..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm transition"
          >
            Check Answer
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-rose-200 dark:border-slate-600">
            <h4 className="font-semibold text-rose-900 dark:text-rose-300">Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              The prop reaction carries exactly <strong>3/8 (37.5%)</strong> of the total load <MathInline math="wL" />, while the fixed base support carries <strong>5/8 (62.5%)</strong> of <MathInline math="wL" /> plus the restraining moment <MathInline math="M_A = -\frac{wL^2}{8}" />!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

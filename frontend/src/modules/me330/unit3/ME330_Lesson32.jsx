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

const BEAM_SHAPES = {
  w10x30: { name: 'W10x30 Wide Flange', I_in4: 170, E_ksi: 29000 },
  w12x45: { name: 'W12x45 Wide Flange', I_in4: 350, E_ksi: 29000 },
  w14x68: { name: 'W14x68 Wide Flange', I_in4: 722, E_ksi: 29000 },
  custom: { name: 'Custom Aluminum Channel', I_in4: 120, E_ksi: 10000 },
};

export default function ME330_Lesson32() {
  const [beamShape, setBeamShape] = useState('w12x45');
  const [L_ft, setL_ft] = useState(20); // Beam span in feet
  const [limitRatio, setLimitRatio] = useState(360); // L/360, L/240, L/500
  const [P1_kips, setP1_kips] = useState(8); // kips at 0.4*L
  const [w_klf, setW_klf] = useState(1.2); // kips/ft

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  const shape = BEAM_SHAPES[beamShape];
  const L_in = L_ft * 12;
  const E = shape.E_ksi; // ksi
  const I = shape.I_in4; // in^4
  const EI = E * I; // kip*in^2

  const nPts = 100;
  const xVals_ft = Array.from({ length: nPts }, (_, i) => (i * L_ft) / (nPts - 1));

  // Compute deflections (in inches)
  // 1. Center/offset point load P1 at a = 0.4*L
  const a_in = 0.4 * L_in;
  const b_in = L_in - a_in;
  const P = P1_kips; // kips

  const vP_in = xVals_ft.map((x_ft) => {
    const x = x_ft * 12; // in
    if (x <= a_in) {
      return (-P * b_in * x * (L_in * L_in - b_in * b_in - x * x)) / (6 * L_in * EI);
    } else {
      return (-P * a_in * (L_in - x) * (2 * L_in * x - x * x - a_in * a_in)) / (6 * L_in * EI);
    }
  });

  // 2. Uniform load w
  const w = w_klf / 12; // kips/in
  const vW_in = xVals_ft.map((x_ft) => {
    const x = x_ft * 12;
    return (-w * x * (Math.pow(L_in, 3) - 2 * L_in * x * x + Math.pow(x, 3))) / (24 * EI);
  });

  // Combined Deflection
  const vTotal_in = xVals_ft.map((_, i) => vP_in[i] + vW_in[i]);
  const maxDefl_in = Math.max(...vTotal_in.map(Math.abs));

  // Allowable Deflection Limit
  const vAllowable_in = L_in / limitRatio;
  const passesLimit = maxDefl_in <= vAllowable_in;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 32: Multi-Load Beam Deflection Practice & Serviceability Limits</h1>
        <p className="mt-2 text-teal-200">
          Solve complex multi-load beam deflections, evaluate peak deflection locations, and verify structural serviceability limits (<MathInline math="L/360, L/240" />).
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Beam & Loading Setup</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Structural Section Selection</label>
            <select
              value={beamShape}
              onChange={(e) => setBeamShape(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
            >
              {Object.entries(BEAM_SHAPES).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name} (I = {val.I_in4} in⁴)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Serviceability Limit Criterion</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'L / 240', val: 240 },
                { label: 'L / 360', val: 360 },
                { label: 'L / 500', val: 500 },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setLimitRatio(item.val)}
                  className={`py-2 rounded-lg font-bold text-xs transition ${
                    limitRatio === item.val ? 'bg-teal-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Span Length (<MathInline math="L" />):</span>
                <span className="text-teal-600 font-bold">{L_ft} ft</span>
              </div>
              <input type="range" min="10" max="40" step="1" value={L_ft} onChange={(e) => setL_ft(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Concentrated Load (<MathInline math="P_1" /> at 0.4L):</span>
                <span className="text-blue-600 font-bold">{P1_kips} kips</span>
              </div>
              <input type="range" min="1" max="25" step="1" value={P1_kips} onChange={(e) => setP1_kips(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Uniform Load (<MathInline math="w" />):</span>
                <span className="text-purple-600 font-bold">{w_klf} kips/ft</span>
              </div>
              <input type="range" min="0.2" max="3.0" step="0.1" value={w_klf} onChange={(e) => setW_klf(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Results & Plotly Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Max Deflection (|v_max|)</span>
              <div className="text-xl font-bold text-teal-600 mt-1">
                {maxDefl_in.toFixed(3)} <span className="text-xs font-normal">in</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Allowable Limit (L/{limitRatio})</span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {vAllowable_in.toFixed(3)} <span className="text-xs font-normal">in</span>
              </div>
            </div>

            <div className={`p-4 rounded-xl shadow border col-span-2 flex items-center justify-between ${
              passesLimit
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-300'
            }`}>
              <div>
                <span className="text-xs font-medium uppercase">Serviceability Check</span>
                <p className="text-lg font-bold">
                  {passesLimit ? 'PASSED (Deflection within limit)' : 'FAILED (Exceeds allowable deflection!)'}
                </p>
              </div>
              <div className="text-3xl">{passesLimit ? '✓' : '⚠'}</div>
            </div>
          </div>

          {/* Plotly Deflection Curve Chart */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Beam Elastic Curve vs. L/{limitRatio} Deflection Limit</h3>
            <Plot
              data={[
                {
                  x: xVals_ft,
                  y: vTotal_in,
                  mode: 'lines',
                  name: 'Elastic Curve v(x)',
                  line: { color: '#0d9488', width: 3 },
                },
                {
                  x: [0, L_ft],
                  y: [-vAllowable_in, -vAllowable_in],
                  mode: 'lines',
                  name: `Allowable Limit (-L/${limitRatio})`,
                  line: { color: '#ef4444', width: 2, dash: 'dash' },
                },
              ]}
              layout={{
                autosize: true,
                height: 360,
                margin: { l: 60, r: 40, t: 30, b: 50 },
                xaxis: { title: 'Position along beam x (ft)', gridcolor: '#e2e8f0' },
                yaxis: { title: 'Deflection v (in)', gridcolor: '#e2e8f0' },
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
      <div className="bg-teal-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-teal-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-teal-900 dark:text-teal-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          Why do civil and mechanical design codes enforce deflection limits (<MathInline math="L/360" />) even when the beam's flexural stress is well below yielding?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Explain serviceability reasons..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm transition"
          >
            Check Answer
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-teal-200 dark:border-slate-600">
            <h4 className="font-semibold text-teal-900 dark:text-teal-300">Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              Excessive beam deflections can cause non-structural damage (cracking plaster/drywall, binding doors/windows, damaging attached pipes/machinery) and cause human discomfort due to vibration, even if the structure is completely safe against material yielding!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

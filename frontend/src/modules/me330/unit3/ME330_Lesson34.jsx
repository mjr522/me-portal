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

export default function ME330_Lesson34() {
  const [supportType, setSupportType] = useState('settlement'); // 'settlement' or 'spring'
  const [w_kNm, setW_kNm] = useState(12); // kN/m
  const [L, setL] = useState(5.0); // m
  const [EI_kNm2, setEI_kNm2] = useState(10000); // kN*m^2
  const [settlement_mm, setSettlement_mm] = useState(5.0); // mm downward
  const [kSpring_kNmm, setKSpring_kNmm] = useState(2.0); // kN/mm

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  const w = w_kNm; // kN/m
  const deltaP_m = (w * Math.pow(L, 4)) / (8 * EI_kNm2); // Unconstrained cantilever deflection at tip (m)
  const deltaP_mm = deltaP_m * 1000;

  // Unyielding rigid support baseline By
  const By_rigid = (3 / 8) * w * L;

  let By = 0;
  let displacementAtProp_mm = 0;

  if (supportType === 'settlement') {
    // Compatibility: -deltaP_m + By*L^3 / (3*EI) = -delta_settle_m
    const delta_settle_m = settlement_mm / 1000;
    if (deltaP_m >= delta_settle_m) {
      By = ((deltaP_m - delta_settle_m) * (3 * EI_kNm2)) / Math.pow(L, 3);
      displacementAtProp_mm = -settlement_mm;
    } else {
      // Prop lifts off or goes negative
      By = 0;
      displacementAtProp_mm = -deltaP_mm;
    }
  } else {
    // Elastic Spring Support: Compatibility -deltaP_m + By*L^3 / (3*EI) = -By / (kSpring * 1000)
    // By * (L^3/(3*EI) + 1/(kSpring*1000)) = deltaP_m
    const f_flexibility = Math.pow(L, 3) / (3 * EI_kNm2) + 1 / (kSpring_kNmm * 1000);
    By = deltaP_m / f_flexibility;
    displacementAtProp_mm = -(By / kSpring_kNmm);
  }

  const Ay = w * L - By;
  const MA = -(w * L * L) / 2 + By * L;

  // Curves
  const nPts = 100;
  const xVals = Array.from({ length: nPts }, (_, i) => (i * L) / (nPts - 1));

  // Rigid curve baseline
  const vRigid_mm = xVals.map((x) => {
    const v_m = (-(w * L * L / 4) * x * x + ((5 / 8) * w * L * Math.pow(x, 3)) / 6 - (w * Math.pow(x, 4)) / 24) / EI_kNm2;
    return v_m * 1000;
  });

  // Settling/Spring curve
  const vActual_mm = xVals.map((x) => {
    const v_m = ((MA * x * x) / 2 + (Ay * Math.pow(x, 3)) / 6 - (w * Math.pow(x, 4)) / 24) / EI_kNm2;
    return v_m * 1000;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900 via-rose-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 34: Indeterminate Settlement & Flexible Compatibility</h1>
        <p className="mt-2 text-rose-200">
          Formulate compatibility equations accounting for support settlement <MathInline math="v(L) = -\Delta" /> and elastic spring foundations <MathInline math="v(L) = -\frac{B_y}{k_s}" />.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Support Condition</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Prop Flexibility Model</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSupportType('settlement')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition ${
                  supportType === 'settlement' ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Fixed Settlement Δ
              </button>
              <button
                onClick={() => setSupportType('spring')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition ${
                  supportType === 'spring' ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Elastic Spring (ks)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {supportType === 'settlement' ? (
              <div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Support Settlement (<MathInline math="\Delta" />):</span>
                  <span className="text-rose-600 font-bold">{settlement_mm} mm</span>
                </div>
                <input type="range" min="0" max="25" step="0.5" value={settlement_mm} onChange={(e) => setSettlement_mm(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Spring Stiffness (<MathInline math="k_s" />):</span>
                  <span className="text-rose-600 font-bold">{kSpring_kNmm} kN/mm</span>
                </div>
                <input type="range" min="0.1" max="10" step="0.2" value={kSpring_kNmm} onChange={(e) => setKSpring_kNmm(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
              </div>
            )}

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Uniform Load (<MathInline math="w" />):</span>
                <span className="text-blue-600 font-bold">{w_kNm} kN/m</span>
              </div>
              <input type="range" min="2" max="30" step="1" value={w_kNm} onChange={(e) => setW_kNm(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Span Length (<MathInline math="L" />):</span>
                <span className="text-indigo-600 font-bold">{L} m</span>
              </div>
              <input type="range" min="2" max="10" step="0.5" value={L} onChange={(e) => setL(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Flexural Rigidity (<MathInline math="EI" />):</span>
                <span className="text-purple-600 font-bold">{EI_kNm2} kN·m²</span>
              </div>
              <input type="range" min="2000" max="25000" step="1000" value={EI_kNm2} onChange={(e) => setEI_kNm2(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Results & Plotly Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Reaction Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Actual Reaction By</span>
              <div className="text-xl font-bold text-rose-600 mt-1">
                {By.toFixed(2)} <span className="text-xs font-normal">kN</span>
              </div>
              <span className="text-xs text-slate-400">Rigid: {By_rigid.toFixed(1)} kN</span>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Base Reaction Ay</span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {Ay.toFixed(2)} <span className="text-xs font-normal">kN</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Base Moment MA</span>
              <div className="text-xl font-bold text-purple-600 mt-1">
                {MA.toFixed(2)} <span className="text-xs font-normal">kN·m</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Prop Displacement</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {displacementAtProp_mm.toFixed(2)} <span className="text-xs font-normal">mm</span>
              </div>
            </div>
          </div>

          {/* Plotly Deflection Curve Comparison */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Elastic Deflection Curve Comparison</h3>
            <Plot
              data={[
                {
                  x: xVals,
                  y: vRigid_mm,
                  mode: 'lines',
                  name: 'Rigid Support Baseline (Δ=0)',
                  line: { color: '#94a3b8', width: 2, dash: 'dash' },
                },
                {
                  x: xVals,
                  y: vActual_mm,
                  mode: 'lines',
                  name: supportType === 'settlement' ? 'Settling Support Curve' : 'Elastic Spring Support Curve',
                  line: { color: '#e11d48', width: 3 },
                },
              ]}
              layout={{
                autosize: true,
                height: 380,
                margin: { l: 60, r: 40, t: 30, b: 50 },
                xaxis: { title: 'Position x along span (m)', gridcolor: '#e2e8f0' },
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
      <div className="bg-rose-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-rose-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          How does support settlement at the prop (<MathInline math="\Delta > 0" />) affect the magnitude of the fixed base moment <MathInline math="M_A" />?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Predict increase or decrease in MA..."
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
              When the prop settles downward, the prop reaction <MathInline math="B_y" /> <strong>decreases</strong>. Because <MathInline math="M_A = -\frac{wL^2}{2} + B_y L" />, a smaller prop reaction <MathInline math="B_y" /> forces the fixed base to carry a <strong>larger magnitude negative bending moment</strong>, approaching pure cantilever behavior!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

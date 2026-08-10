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

export default function ME330_Lesson25() {
  const [P_kN, setP_kN] = useState(25); // Axial force (kN)
  const [M_kNm, setM_kNm] = useState(4.5); // Bending moment (kN*m)
  const [V_kN, setV_kN] = useState(15); // Shear force (kN)
  const [T_kNm, setT_kNm] = useState(3.0); // Torque (kN*m)
  const [do_mm, setDo_mm] = useState(80); // Outer diameter (mm)
  const [di_mm, setDi_mm] = useState(0); // Inner diameter (mm)
  const [targetPoint, setTargetPoint] = useState('A'); // 'A' (top), 'B' (bottom), 'C' (neutral right)

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Geometric properties
  const ro = do_mm / 2 / 1000; // m
  const ri = di_mm / 2 / 1000; // m
  const A = Math.PI * (ro * ro - ri * ri); // m^2
  const I = (Math.PI / 4) * (Math.pow(ro, 4) - Math.pow(ri, 4)); // m^4
  const J = 2 * I; // m^4

  // Conversion to N and N*m
  const P = P_kN * 1000;
  const M = M_kNm * 1000;
  const V = V_kN * 1000;
  const T = T_kNm * 1000;

  // Stresses at target points
  // Point A (Top: y = +ro, z = 0):
  // Axial: P/A, Bending: -M*ro/I (compression or tension depending on sign convention), Torsional: T*ro/J, Transverse shear: 0
  // Point B (Bottom: y = -ro, z = 0):
  // Axial: P/A, Bending: +M*ro/I, Torsional: T*ro/J, Transverse shear: 0
  // Point C (Neutral axis right: y = 0, z = +ro):
  // Axial: P/A, Bending: 0, Torsional: T*ro/J, Transverse shear: V_Q/(I*t)

  let y_pt = 0;
  let z_pt = 0;
  let isNeutralAxis = false;

  if (targetPoint === 'A') {
    y_pt = ro;
    z_pt = 0;
  } else if (targetPoint === 'B') {
    y_pt = -ro;
    z_pt = 0;
  } else {
    y_pt = 0;
    z_pt = ro;
    isNeutralAxis = true;
  }

  const sigma_axial = (P / A) / 1e6; // MPa
  const sigma_bending = (M * y_pt / I) / 1e6; // MPa
  const sigma_x = sigma_axial + sigma_bending; // Total normal stress (MPa)

  const tau_torsion = (T * ro / J) / 1e6; // MPa

  // Transverse shear stress for circular section at neutral axis
  let tau_transverse = 0;
  if (isNeutralAxis) {
    if (di_mm === 0) {
      tau_transverse = ((4 * V) / (3 * A)) / 1e6;
    } else {
      // Hollow circle transverse shear at neutral axis
      const k = ri / ro;
      tau_transverse = (((4 * V) / (3 * A)) * ((1 + k + k * k) / (1 + k * k))) / 1e6;
    }
  }
  const tau_xy = tau_torsion + tau_transverse; // Total shear stress (MPa)

  // Principal stresses
  const sigma_avg = sigma_x / 2;
  const R_stress = Math.sqrt(Math.pow(sigma_x / 2, 2) + Math.pow(tau_xy, 2));
  const sigma_1 = sigma_avg + R_stress;
  const sigma_2 = sigma_avg - R_stress;
  const tau_max = R_stress;

  // Mohr Circle coordinates
  const circlePts = 100;
  const MohrX = Array.from({ length: circlePts }, (_, i) => sigma_avg + R_stress * Math.cos((i * 2 * Math.PI) / (circlePts - 1)));
  const MohrY = Array.from({ length: circlePts }, (_, i) => R_stress * Math.sin((i * 2 * Math.PI) / (circlePts - 1)));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 25: Combined 2D Loading Normal & Shear Superposition</h1>
        <p className="mt-2 text-emerald-200">
          Superimpose axial, bending, torsional, and transverse shear stresses on multi-load structural elements to construct complete stress states.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Applied Loads & Cross-Section</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Target Surface Point</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTargetPoint('A')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  targetPoint === 'A' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Point A (Top)
              </button>
              <button
                onClick={() => setTargetPoint('B')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  targetPoint === 'B' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Point B (Bottom)
              </button>
              <button
                onClick={() => setTargetPoint('C')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  targetPoint === 'C' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Point C (N.A.)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Axial Load (<MathInline math="P" />):</span>
                <span className="text-emerald-600 font-bold">{P_kN} kN</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="5"
                value={P_kN}
                onChange={(e) => setP_kN(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Bending Moment (<MathInline math="M" />):</span>
                <span className="text-blue-600 font-bold">{M_kNm} kN·m</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.5"
                value={M_kNm}
                onChange={(e) => setM_kNm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Torque (<MathInline math="T" />):</span>
                <span className="text-purple-600 font-bold">{T_kNm} kN·m</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={T_kNm}
                onChange={(e) => setT_kNm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Transverse Shear (<MathInline math="V" />):</span>
                <span className="text-indigo-600 font-bold">{V_kN} kN</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="2"
                value={V_kN}
                onChange={(e) => setV_kN(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Outer Diameter (<MathInline math="d_o" />):</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{do_mm} mm</span>
              </div>
              <input
                type="range"
                min="40"
                max="150"
                step="5"
                value={do_mm}
                onChange={(e) => setDo_mm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Normal Stress (Axial + Bending)</span>
              <div className="text-lg font-bold text-emerald-600 mt-1">
                {sigma_x.toFixed(2)} <span className="text-xs font-normal">MPa</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                P/A: {sigma_axial.toFixed(1)} | My/I: {sigma_bending.toFixed(1)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Shear Stress (Torque + Transverse)</span>
              <div className="text-lg font-bold text-purple-600 mt-1">
                {tau_xy.toFixed(2)} <span className="text-xs font-normal">MPa</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Tr/J: {tau_torsion.toFixed(1)} | VQ/It: {tau_transverse.toFixed(1)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Principal Stresses (σ1, σ2)</span>
              <div className="text-sm font-bold text-blue-600 mt-1">
                σ1 = {sigma_1.toFixed(2)} MPa
              </div>
              <div className="text-sm font-bold text-red-600 mt-1">
                σ2 = {sigma_2.toFixed(2)} MPa
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Max In-Plane Shear (τmax)</span>
              <div className="text-xl font-bold text-amber-600 mt-1">
                {tau_max.toFixed(2)} <span className="text-xs font-normal">MPa</span>
              </div>
            </div>
          </div>

          {/* Plotly Mohr's Circle */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Mohr's Circle for Superimposed Stress State at Point {targetPoint}</h3>
            <Plot
              data={[
                {
                  x: MohrX,
                  y: MohrY,
                  mode: 'lines',
                  name: "Mohr's Circle",
                  line: { color: '#10b981', width: 3 },
                },
                {
                  x: [sigma_x, 0],
                  y: [tau_xy, -tau_xy],
                  mode: 'lines+markers',
                  name: 'Current Stress State (X-Face)',
                  marker: { size: 10, color: '#ef4444' },
                  line: { color: '#ef4444', dash: 'dash', width: 2 },
                },
                {
                  x: [sigma_1, sigma_2],
                  y: [0, 0],
                  mode: 'markers',
                  name: 'Principal Stresses (σ1, σ2)',
                  marker: { size: 12, color: '#3b82f6', symbol: 'diamond' },
                },
              ]}
              layout={{
                autosize: true,
                height: 380,
                margin: { l: 60, r: 40, t: 30, b: 50 },
                xaxis: { title: 'Normal Stress σ (MPa)', zeroline: true, gridcolor: '#e2e8f0' },
                yaxis: { title: 'Shear Stress τ (MPa)', zeroline: true, scaleanchor: 'x', scaleratio: 1, gridcolor: '#e2e8f0' },
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
      <div className="bg-emerald-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-emerald-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          Where on a circular cross-section undergoing combined bending (<MathInline math="M" />) and transverse shear (<MathInline math="V" />) is transverse shear stress maximum, and what is the bending stress at that same point?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="State location and bending stress..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition"
          >
            Check Answer
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-emerald-200 dark:border-slate-600">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-300">Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              Transverse shear stress is maximum at the <strong>Neutral Axis (<MathInline math="y=0" />)</strong> because <MathInline math="Q" /> is maximum there. At the neutral axis, bending stress <MathInline math="\sigma_{\text{bending}} = -\frac{My}{I} = 0" />! Conversely, bending stress is maximum at the extreme top and bottom fibers where transverse shear is zero.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

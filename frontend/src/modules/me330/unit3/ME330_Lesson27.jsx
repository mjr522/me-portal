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

export default function ME330_Lesson27() {
  // Geometry sliders
  const [L1, setL1] = useState(0.8); // Length along X (m)
  const [L2, setL2] = useState(0.5); // Length along Z (m)
  const [Ro_mm, setRo_mm] = useState(40); // Outer radius (mm)
  const [Ri_mm, setRi_mm] = useState(30); // Inner radius (mm)
  const [sigmaY_MPa, setSigmaY_MPa] = useState(250); // Yield strength (MPa)

  // Applied tip force vector F = (Fx, Fy, Fz) in kN
  const [Fx, setFx] = useState(1.5);
  const [Fy, setFy] = useState(-3.0);
  const [Fz, setFz] = useState(2.0);

  const [activePt, setActivePt] = useState('A'); // Points A, B, C, D around base rim

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Geometric parameters
  const Ro = Ro_mm / 1000; // m
  const Ri = Ri_mm / 1000; // m
  const A = Math.PI * (Ro * Ro - Ri * Ri);
  const I = (Math.PI / 4) * (Math.pow(Ro, 4) - Math.pow(Ri, 4));
  const J = 2 * I;

  // Base cut reactions at x = 0:
  // Tip is at (L1, 0, L2)
  // Force applied at tip: F = (Fx, Fy, Fz)
  // Position from base (0,0,0) to tip: r = (L1, 0, L2)
  // Internal Moment at base: M = r x F = (0*Fz - L2*Fy, L2*Fx - L1*Fz, L1*Fy - 0*Fx)
  const Mx = -L2 * Fy; // Torque T at base (kN*m)
  const My = L2 * Fx - L1 * Fz; // Bending M_y (kN*m)
  const Mz = L1 * Fy; // Bending M_z (kN*m)

  // Surface point coordinates around rim at x=0 cut:
  // Pt A: Top (+y=Ro, z=0)
  // Pt B: Bottom (-y=-Ro, z=0)
  // Pt C: Front (+z=Ro, y=0)
  // Pt D: Back (-z=-Ro, y=0)
  let y_pt = 0;
  let z_pt = 0;
  if (activePt === 'A') { y_pt = Ro; z_pt = 0; }
  else if (activePt === 'B') { y_pt = -Ro; z_pt = 0; }
  else if (activePt === 'C') { y_pt = 0; z_pt = Ro; }
  else if (activePt === 'D') { y_pt = 0; z_pt = -Ro; }

  // Stress component calculations (in MPa)
  // Normal stress sigma_x = P/A - (Mz*y)/I + (My*z)/I
  const sigma_axial = ((Fx * 1000) / A) / 1e6;
  const sigma_bend_z = -((Mz * 1000 * y_pt) / I) / 1e6;
  const sigma_bend_y = ((My * 1000 * z_pt) / I) / 1e6;
  const sigma_x = sigma_axial + sigma_bend_z + sigma_bend_y;

  // Torsional shear stress magnitude: tau_torsion = Mx * Ro / J
  const tau_torsion = Math.abs(((Mx * 1000 * Ro) / J) / 1e6);

  // Transverse shear stress from Vy and Fz (approximate max at neutral axes)
  let tau_vy = 0;
  let tau_fz = 0;
  const k = Ri / Ro;
  const Q_factor = ((4 / (3 * A)) * ((1 + k + k * k) / (1 + k * k))) / 1e6;

  if (activePt === 'C' || activePt === 'D') {
    tau_vy = Math.abs(Fy * 1000) * Q_factor;
  }
  if (activePt === 'A' || activePt === 'B') {
    tau_fz = Math.abs(Fz * 1000) * Q_factor;
  }

  const tau_total = Math.sqrt(Math.pow(tau_torsion + tau_vy, 2) + Math.pow(tau_fz, 2));

  // Principal stresses & Von Mises
  const sigma_avg = sigma_x / 2;
  const R_stress = Math.sqrt(Math.pow(sigma_x / 2, 2) + Math.pow(tau_total, 2));
  const sigma_1 = sigma_avg + R_stress;
  const sigma_2 = sigma_avg - R_stress;

  const vonMises = Math.sqrt(sigma_x * sigma_x + 3 * tau_total * tau_total);
  const factorOfSafety = sigmaY_MPa / vonMises;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-pink-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 27: 3D Combined Cantilever Elbow Stress Tensor Evaluator</h1>
        <p className="mt-2 text-rose-200">
          Analyze complex 3D pipe elbows subjected to triaxial tip forces, evaluate 3D stress tensors at critical base points, and determine Von Mises failure safety factors.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Elbow Geometry & Forces</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Select Base Rim Evaluation Point</label>
            <div className="grid grid-cols-4 gap-2">
              {['A', 'B', 'C', 'D'].map((pt) => (
                <button
                  key={pt}
                  onClick={() => setActivePt(pt)}
                  className={`py-2 rounded-lg font-medium text-xs transition ${
                    activePt === pt ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  Pt {pt} ({pt === 'A' ? '+Y' : pt === 'B' ? '-Y' : pt === 'C' ? '+Z' : '-Z'})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Segment 1 L1 (x): {L1} m</label>
                <input type="range" min="0.3" max="1.5" step="0.1" value={L1} onChange={(e) => setL1(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Segment 2 L2 (z): {L2} m</label>
                <input type="range" min="0.2" max="1.0" step="0.1" value={L2} onChange={(e) => setL2(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Outer Radius Ro: {Ro_mm} mm</label>
                <input type="range" min="20" max="80" step="2" value={Ro_mm} onChange={(e) => setRo_mm(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Inner Radius Ri: {Ri_mm} mm</label>
                <input type="range" min="0" max={Ro_mm - 5} step="2" value={Ri_mm} onChange={(e) => setRi_mm(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Tip Load Vector F (kN)</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Fx: {Fx} kN</label>
                  <input type="range" min="-5" max="5" step="0.5" value={Fx} onChange={(e) => setFx(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Fy: {Fy} kN</label>
                  <input type="range" min="-5" max="5" step="0.5" value={Fy} onChange={(e) => setFy(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Fz: {Fz} kN</label>
                  <input type="range" min="-5" max="5" step="0.5" value={Fz} onChange={(e) => setFz(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500">Yield Strength σY: {sigmaY_MPa} MPa</label>
              <input type="range" min="150" max="600" step="10" value={sigmaY_MPa} onChange={(e) => setSigmaY_MPa(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Reaction Moments Card */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Base Torque (Mx)</span>
              <div className="text-lg font-bold text-rose-600 mt-1">{Mx.toFixed(2)} kN·m</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Base Bending (My)</span>
              <div className="text-lg font-bold text-blue-600 mt-1">{My.toFixed(2)} kN·m</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Base Bending (Mz)</span>
              <div className="text-lg font-bold text-indigo-600 mt-1">{Mz.toFixed(2)} kN·m</div>
            </div>
          </div>

          {/* Stress Tensor & Failure Criteria Card */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200">Stress Tensor & Von Mises Yield Criterion at Pt {activePt}</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-slate-400">Normal Stress σx</span>
                <p className="font-bold text-slate-800 dark:text-slate-100">{sigma_x.toFixed(2)} MPa</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-slate-400">Total Shear τ</span>
                <p className="font-bold text-purple-600">{tau_total.toFixed(2)} MPa</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-slate-400">Von Mises Stress σvm</span>
                <p className="font-bold text-rose-600">{vonMises.toFixed(2)} MPa</p>
              </div>
              <div className={`p-3 rounded-lg border ${
                factorOfSafety >= 1.0 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-800 dark:text-red-300'
              }`}>
                <span className="text-xs">Safety Factor (FS)</span>
                <p className="font-bold text-lg">{factorOfSafety.toFixed(2)} {factorOfSafety >= 1.0 ? '✓' : '⚠ FAIL'}</p>
              </div>
            </div>
          </div>

          {/* Plotly 3D Pipe Elbow Render */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">3D Structural Pipe Elbow Model</h3>
            <Plot
              data={[
                {
                  type: 'scatter3d',
                  mode: 'lines+markers',
                  name: 'Pipe Segment 1 (Base to Elbow)',
                  x: [0, L1],
                  y: [0, 0],
                  z: [0, 0],
                  line: { color: '#e11d48', width: 10 },
                  marker: { size: 6 },
                },
                {
                  type: 'scatter3d',
                  mode: 'lines+markers',
                  name: 'Pipe Segment 2 (Elbow to Tip)',
                  x: [L1, L1],
                  y: [0, 0],
                  z: [0, L2],
                  line: { color: '#0284c7', width: 10 },
                  marker: { size: 6 },
                },
                {
                  type: 'scatter3d',
                  mode: 'lines+markers',
                  name: 'Tip Load Vector F',
                  x: [L1, L1 + Fx * 0.05],
                  y: [0, Fy * 0.05],
                  z: [L2, L2 + Fz * 0.05],
                  line: { color: '#16a34a', width: 6 },
                  marker: { size: 4 },
                },
              ]}
              layout={{
                autosize: true,
                height: 360,
                margin: { l: 20, r: 20, t: 20, b: 20 },
                scene: {
                  xaxis: { title: 'X Axis (m)' },
                  yaxis: { title: 'Y Axis (m)' },
                  zaxis: { title: 'Z Axis (m)' },
                  aspectmode: 'cube',
                },
                showlegend: true,
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
          In this cantilever elbow pipe, what physical load generates the internal torque <MathInline math="M_x" /> at the fixed base?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Identify the tip force component..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm transition"
          >
            Submit Answer
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-rose-200 dark:border-slate-600">
            <h4 className="font-semibold text-rose-900 dark:text-rose-300">Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              The vertical tip force <MathInline math="F_y" /> acting at moment arm <MathInline math="L_2" /> (along the Z-axis) creates a moment <MathInline math="M_x = L_2 \times F_y" /> directed along the X-axis of the base segment. This moment acts directly as <strong>torsion</strong> on the base segment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

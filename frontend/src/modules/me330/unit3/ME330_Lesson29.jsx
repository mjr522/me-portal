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

export default function ME330_Lesson29() {
  const [numElements, setNumElements] = useState(4); // 1, 2, 4, 8, 16
  const [length, setLength] = useState(1.0); // m
  const [area_cm2, setArea_cm2] = useState(10); // cm^2 -> 10e-4 m^2
  const [E_GPa, setE_GPa] = useState(200); // GPa -> 200e9 Pa
  const [P_kN, setP_kN] = useState(50); // Tip load (kN)
  const [loadType, setLoadType] = useState('point'); // 'point' (tip load) or 'distributed' (linear distributed w(x)=q0*(1-x/L))

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  const A = area_cm2 * 1e-4; // m^2
  const E = E_GPa * 1e9; // Pa
  const P = P_kN * 1000; // N

  const nNodes = numElements + 1;
  const dx = length / numElements;

  // FEA Stiffness Assembly & Solve for 1D Bar
  // K is (nNodes x nNodes) tridiagonal matrix
  // For uniform bar, ke = (A*E/dx) * [1 -1; -1 1]
  const k_elem = (A * E) / dx;

  // Create K matrix
  const K = Array.from({ length: nNodes }, () => Array(nNodes).fill(0));
  for (let e = 0; e < numElements; e++) {
    K[e][e] += k_elem;
    K[e][e + 1] -= k_elem;
    K[e + 1][e] -= k_elem;
    K[e + 1][e + 1] += k_elem;
  }

  // Load vector F
  const F = Array(nNodes).fill(0);
  if (loadType === 'point') {
    F[numElements] = P; // Tip load at x = L
  } else {
    // Distributed load w(x) = q0 * (1 - x/L), total load = P
    // q0 = 2*P/L
    const q0 = (2 * P) / length;
    for (let e = 0; e < numElements; e++) {
      const x1 = e * dx;
      const x2 = (e + 1) * dx;
      const w1 = q0 * (1 - x1 / length);
      const w2 = q0 * (1 - x2 / length);
      // Equivalent nodal forces
      F[e] += ((2 * w1 + w2) * dx) / 6;
      F[e + 1] += ((w1 + 2 * w2) * dx) / 6;
    }
  }

  // Apply Boundary Condition: Fixed at node 0 (u[0] = 0)
  // Solve reduced system for u[1...numElements]
  const u = Array(nNodes).fill(0);
  const nEq = numElements;

  // Forward elimination for tridiagonal system K_reduced
  const K_red = Array.from({ length: nEq }, (_, i) =>
    Array.from({ length: nEq }, (_, j) => K[i + 1][j + 1])
  );
  const F_red = F.slice(1);

  // Gaussian Elimination for K_red * u_red = F_red
  for (let i = 0; i < nEq; i++) {
    let pivot = K_red[i][i];
    for (let j = i; j < nEq; j++) K_red[i][j] /= pivot;
    F_red[i] /= pivot;

    if (i < nEq - 1) {
      const factor = K_red[i + 1][i];
      K_red[i + 1][i] = 0;
      K_red[i + 1][i + 1] -= factor * K_red[i][i + 1];
      F_red[i + 1] -= factor * F_red[i];
    }
  }

  // Back substitution
  const u_red = Array(nEq).fill(0);
  for (let i = nEq - 1; i >= 0; i--) {
    u_red[i] = F_red[i];
    if (i < nEq - 1) {
      u_red[i] -= K_red[i][i + 1] * u_red[i + 1];
    }
  }

  for (let i = 0; i < nEq; i++) {
    u[i + 1] = u_red[i];
  }

  // Convert u to mm
  const u_mm = u.map((val) => val * 1000);

  // Exact Analytical Solution
  const xExact = Array.from({ length: 100 }, (_, i) => (i * length) / 99);
  let uExact_mm = [];
  let sigmaExact_MPa = [];

  if (loadType === 'point') {
    // u(x) = (P*x)/(A*E)
    uExact_mm = xExact.map((x) => ((P * x) / (A * E)) * 1000);
    sigmaExact_MPa = xExact.map(() => (P / A) / 1e6);
  } else {
    // u(x) = (q0 / (A*E)) * (L*x - x^2/2 - L*x^2/(2L) + x^3/(3L)) ... integrate N(x) = q0*(L - x - (L-x)^2/(2L))
    const q0 = (2 * P) / length;
    uExact_mm = xExact.map((x) => ((q0 / (A * E)) * (x * length - (x * x) / 2 - (x * x * x) / (6 * length))) * 1000);
    sigmaExact_MPa = xExact.map((x) => ((q0 * (length - x - Math.pow(length - x, 2) / (2 * length))) / A) / 1e6);
  }

  // FEA Element Stresses: sigma_e = E * (u_{e+1} - u_e) / dx
  const feaStresses_MPa = [];
  const xElementMid = [];
  for (let e = 0; e < numElements; e++) {
    const du = u[e + 1] - u[e];
    const sig_e = (E * (du / dx)) / 1e6;
    feaStresses_MPa.push(sig_e);
    xElementMid.push((e + 0.5) * dx);
  }

  // Node x locations
  const xNodes = Array.from({ length: nNodes }, (_, i) => i * dx);

  // Tip displacement comparison
  const uTipFEA = u_mm[numElements];
  const uTipExact = uExact_mm[99];
  const tipErrorPercent = Math.abs((uTipFEA - uTipExact) / uTipExact) * 100;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 29: 1D FEA Bar Stiffness Matrix & Mesh Refinement</h1>
        <p className="mt-2 text-sky-200">
          Formulate 1D bar element stiffness matrices <MathInline math="[k^e] = \frac{AE}{L_e}\begin{bmatrix}1 & -1\\ -1 & 1\end{bmatrix}" />, assemble global equations, and evaluate mesh convergence.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Mesh & Material Settings</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Mesh Density (Number of Elements)</label>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 4, 8, 16].map((ne) => (
                <button
                  key={ne}
                  onClick={() => setNumElements(ne)}
                  className={`py-2 rounded-lg font-bold text-xs transition ${
                    numElements === ne ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {ne} Elem
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Loading Condition</label>
            <div className="flex gap-2">
              <button
                onClick={() => setLoadType('point')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition ${
                  loadType === 'point' ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Tip Point Load P
              </button>
              <button
                onClick={() => setLoadType('distributed')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition ${
                  loadType === 'distributed' ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Linear Distributed w(x)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Applied Load Magnitude (<MathInline math="P" />):</span>
                <span className="text-sky-600 font-bold">{P_kN} kN</span>
              </div>
              <input type="range" min="10" max="200" step="5" value={P_kN} onChange={(e) => setP_kN(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Bar Length (<MathInline math="L" />):</span>
                <span className="text-blue-600 font-bold">{length} m</span>
              </div>
              <input type="range" min="0.5" max="3.0" step="0.1" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Cross-Section Area (<MathInline math="A" />):</span>
                <span className="text-indigo-600 font-bold">{area_cm2} cm²</span>
              </div>
              <input type="range" min="2" max="50" step="1" value={area_cm2} onChange={(e) => setArea_cm2(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Elastic Modulus (<MathInline math="E" />):</span>
                <span className="text-purple-600 font-bold">{E_GPa} GPa</span>
              </div>
              <input type="range" min="50" max="400" step="10" value={E_GPa} onChange={(e) => setE_GPa(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Results & Plotly Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Element Stiffness (ke)</span>
              <div className="text-lg font-bold text-sky-600 mt-1">
                {(k_elem / 1e6).toFixed(2)} <span className="text-xs font-normal">MN/m</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">FEA Tip Displacement</span>
              <div className="text-lg font-bold text-blue-600 mt-1">
                {uTipFEA.toFixed(4)} <span className="text-xs font-normal">mm</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Exact Tip Displacement</span>
              <div className="text-lg font-bold text-emerald-600 mt-1">
                {uTipExact.toFixed(4)} <span className="text-xs font-normal">mm</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Tip Displ Error %</span>
              <div className={`text-lg font-bold mt-1 ${tipErrorPercent < 1.0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tipErrorPercent.toFixed(3)}%
              </div>
            </div>
          </div>

          {/* Plotly Displacement Curve */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">FEA Nodal Displacements vs. Analytical Solution u(x)</h3>
            <Plot
              data={[
                {
                  x: xExact,
                  y: uExact_mm,
                  mode: 'lines',
                  name: 'Exact Analytical u(x)',
                  line: { color: '#10b981', width: 3 },
                },
                {
                  x: xNodes,
                  y: u_mm,
                  mode: 'lines+markers',
                  name: `FEA Mesh (${numElements} Elements)`,
                  marker: { size: 8, color: '#0284c7' },
                  line: { color: '#0284c7', width: 2, dash: 'dash' },
                },
              ]}
              layout={{
                autosize: true,
                height: 360,
                margin: { l: 60, r: 40, t: 30, b: 50 },
                xaxis: { title: 'Position along bar x (m)', gridcolor: '#e2e8f0' },
                yaxis: { title: 'Axial Displacement u (mm)', gridcolor: '#e2e8f0' },
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
      <div className="bg-sky-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-sky-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-sky-900 dark:text-sky-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          Why does a 1-element FEA model yield 0% displacement error at the nodes for a single tip point load <MathInline math="P" />, but shows error under distributed loading <MathInline math="w(x)" />?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Explain shape functions and exactness..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg text-sm transition"
          >
            Check Explanation
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-sky-200 dark:border-slate-600">
            <h4 className="font-semibold text-sky-900 dark:text-sky-300">Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              The 1D bar element uses linear shape functions <MathInline math="N(x) = c_0 + c_1 x" />. For a constant point load, the true displacement field is strictly <strong>linear</strong> in <MathInline math="x" />, so the FEA shape function is <em>exact</em> at nodes! Under distributed loading <MathInline math="w(x)" />, the exact displacement field is quadratic or cubic, requiring mesh refinement for convergence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

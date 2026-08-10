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

export default function ME330_Lesson26() {
  // Position vector r = (rx, ry, rz) in meters
  const [rx, setRx] = useState(0.5);
  const [ry, setRy] = useState(0.2);
  const [rz, setRz] = useState(0.1);

  // Force vector F = (Fx, Fy, Fz) in kN
  const [Fx, setFx] = useState(2.0); // Axial load
  const [Fy, setFy] = useState(-5.0); // Transverse vertical load
  const [Fz, setFz] = useState(3.0); // Transverse horizontal load

  const [radius_mm, setRadius_mm] = useState(50); // Shaft radius in mm
  const [selectedPoint, setSelectedPoint] = useState('Top'); // Top (+y), Bottom (-y), Front (+z), Back (-z)

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Vector Cross Product M = r x F
  // Fx, Fy, Fz in kN; rx, ry, rz in m => Mx, My, Mz in kN*m
  const Mx = ry * Fz - rz * Fy; // Torsional Torque T
  const My = rz * Fx - rx * Fz; // Bending moment about Y
  const Mz = rx * Fy - ry * Fx; // Bending moment about Z

  // Geometric properties
  const R = radius_mm / 1000; // m
  const A = Math.PI * R * R; // m^2
  const Iz = (Math.PI / 4) * Math.pow(R, 4); // m^4
  const Iy = Iz;
  const J = 2 * Iz; // m^4

  // Evaluation points on shaft cross section at x = 0 cut
  let y_eval = 0;
  let z_eval = 0;
  if (selectedPoint === 'Top') { y_eval = R; z_eval = 0; }
  else if (selectedPoint === 'Bottom') { y_eval = -R; z_eval = 0; }
  else if (selectedPoint === 'Front') { y_eval = 0; z_eval = R; }
  else if (selectedPoint === 'Back') { y_eval = 0; z_eval = -R; }

  // Axial stress (Fx in kN => N)
  const sigma_axial = ((Fx * 1000) / A) / 1e6; // MPa

  // Bending stress: sigma_x = - (Mz * y) / Iz + (My * z) / Iy (in MPa)
  const sigma_bending_z = -((Mz * 1000 * y_eval) / Iz) / 1e6;
  const sigma_bending_y = ((My * 1000 * z_eval) / Iy) / 1e6;
  const sigma_total = sigma_axial + sigma_bending_z + sigma_bending_y;

  // Torsional shear stress: tau = Mx * R / J (in MPa)
  const tau_torsion = ((Mx * 1000 * R) / J) / 1e6;

  // Principal stresses
  const sigma_avg = sigma_total / 2;
  const R_stress = Math.sqrt(Math.pow(sigma_total / 2, 2) + Math.pow(tau_torsion, 2));
  const sigma_1 = sigma_avg + R_stress;
  const sigma_2 = sigma_avg - R_stress;
  const tau_max = R_stress;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 26: Vector Methods for Combined Loading (<MathInline math="\vec{M} = \vec{r} \times \vec{F}" />)</h1>
        <p className="mt-2 text-purple-200">
          Utilize 3D vector cross products to compute internal moments, resolve torsional vs. flexural bending components, and calculate surface stress tensors.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Vector Inputs & Surface Point</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Select Surface Point on Shaft</label>
            <div className="grid grid-cols-4 gap-2">
              {['Top', 'Bottom', 'Front', 'Back'].map((pt) => (
                <button
                  key={pt}
                  onClick={() => setSelectedPoint(pt)}
                  className={`py-2 px-2 rounded-lg font-medium text-xs transition ${
                    selectedPoint === pt ? 'bg-purple-600 text-white shadow' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Position Vector Sliders */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400">Position Vector <MathInline math="\vec{r} = (r_x, r_y, r_z)" /> (m)</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500">rx: {rx.toFixed(2)} m</label>
                <input type="range" min="0.1" max="1.5" step="0.05" value={rx} onChange={(e) => setRx(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-slate-500">ry: {ry.toFixed(2)} m</label>
                <input type="range" min="-0.5" max="0.5" step="0.05" value={ry} onChange={(e) => setRy(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-slate-500">rz: {rz.toFixed(2)} m</label>
                <input type="range" min="-0.5" max="0.5" step="0.05" value={rz} onChange={(e) => setRz(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Force Vector Sliders */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Force Vector <MathInline math="\vec{F} = (F_x, F_y, F_z)" /> (kN)</h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500">Fx: {Fx.toFixed(1)} kN</label>
                <input type="range" min="-10" max="10" step="0.5" value={Fx} onChange={(e) => setFx(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Fy: {Fy.toFixed(1)} kN</label>
                <input type="range" min="-10" max="10" step="0.5" value={Fy} onChange={(e) => setFy(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Fz: {Fz.toFixed(1)} kN</label>
                <input type="range" min="-10" max="10" step="0.5" value={Fz} onChange={(e) => setFz(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium">
              <span>Shaft Radius (<MathInline math="R" />):</span>
              <span className="text-purple-600 font-bold">{radius_mm} mm</span>
            </div>
            <input type="range" min="20" max="100" step="5" value={radius_mm} onChange={(e) => setRadius_mm(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
          </div>
        </div>

        {/* Results & Plotly Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Moment Vector Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Torque <MathInline math="M_x (T)" /></span>
              <div className="text-lg font-bold text-purple-600 mt-1">{Mx.toFixed(2)} kN·m</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Bending <MathInline math="M_y" /></span>
              <div className="text-lg font-bold text-blue-600 mt-1">{My.toFixed(2)} kN·m</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Bending <MathInline math="M_z" /></span>
              <div className="text-lg font-bold text-indigo-600 mt-1">{Mz.toFixed(2)} kN·m</div>
            </div>
          </div>

          {/* Stress Cards at Selected Point */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700 space-y-2">
            <h3 className="text-base font-semibold text-purple-900 dark:text-purple-200">Stress State at Point {selectedPoint}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-slate-400">Total Normal σx</span>
                <p className="font-bold text-slate-800 dark:text-slate-100">{sigma_total.toFixed(2)} MPa</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-slate-400">Shear Stress τ</span>
                <p className="font-bold text-purple-600">{tau_torsion.toFixed(2)} MPa</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-slate-400">Principal σ1</span>
                <p className="font-bold text-blue-600">{sigma_1.toFixed(2)} MPa</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-xs text-slate-400">Max Shear τmax</span>
                <p className="font-bold text-red-600">{tau_max.toFixed(2)} MPa</p>
              </div>
            </div>
          </div>

          {/* 3D Vector Plotly Viz */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">3D Vector Visualization (<MathInline math="\vec{r}" />, <MathInline math="\vec{F}" />, <MathInline math="\vec{M}" />)</h3>
            <Plot
              data={[
                {
                  type: 'scatter3d',
                  mode: 'lines+markers',
                  name: 'Position Vector r',
                  x: [0, rx],
                  y: [0, ry],
                  z: [0, rz],
                  line: { color: '#8b5cf6', width: 6 },
                  marker: { size: 4 },
                },
                {
                  type: 'scatter3d',
                  mode: 'lines+markers',
                  name: 'Force Vector F',
                  x: [rx, rx + Fx * 0.05],
                  y: [ry, ry + Fy * 0.05],
                  z: [rz, rz + Fz * 0.05],
                  line: { color: '#3b82f6', width: 6 },
                  marker: { size: 4 },
                },
                {
                  type: 'scatter3d',
                  mode: 'lines+markers',
                  name: 'Moment Vector M',
                  x: [0, Mx * 0.1],
                  y: [0, My * 0.1],
                  z: [0, Mz * 0.1],
                  line: { color: '#ef4444', width: 6, dash: 'dash' },
                  marker: { size: 4 },
                },
              ]}
              layout={{
                autosize: true,
                height: 380,
                margin: { l: 20, r: 20, t: 20, b: 20 },
                scene: {
                  xaxis: { title: 'X (m)' },
                  yaxis: { title: 'Y (m)' },
                  zaxis: { title: 'Z (m)' },
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
      <div className="bg-purple-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-purple-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          Which component of the moment vector <MathInline math="\vec{M} = \vec{r} \times \vec{F}" /> creates torsional shear stress on a shaft oriented along the X-axis?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Name the moment component (e.g. Mx, My, or Mz)..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-sm transition"
          >
            Check Answer
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-purple-200 dark:border-slate-600">
            <h4 className="font-semibold text-purple-900 dark:text-purple-300">Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              <MathInline math="M_x" /> is directed along the longitudinal axis of the shaft (X-axis). Therefore, <MathInline math="M_x" /> acts as internal torque <MathInline math="T" />, producing torsional shear stress <MathInline math="\tau = \frac{Tr}{J}" />. In contrast, <MathInline math="M_y" /> and <MathInline math="M_z" /> produce bending normal stresses!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

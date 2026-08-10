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

const MATERIAL_PRESETS = {
  steel: { name: 'Structural Steel (A36)', E: 200, nu: 0.29 },
  aluminum: { name: 'Aluminum 6061-T6', E: 68.9, nu: 0.33 },
  titanium: { name: 'Titanium Ti-6Al-4V', E: 114, nu: 0.34 },
};

export default function ME330_Lesson23() {
  const [rosetteType, setRosetteType] = useState('rectangular'); // 'rectangular' (0,45,90) or 'delta' (0,60,120)
  const [ea, setEa] = useState(400); // microstrain
  const [eb, setEb] = useState(250);
  const [ec, setEc] = useState(-150);
  const [material, setMaterial] = useState('steel');
  const [thetaDeg, setThetaDeg] = useState(30);

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Decode strain rosette measurements into Cartesian strain components (in microstrain)
  let ex = 0;
  let ey = 0;
  let gxy = 0;

  if (rosetteType === 'rectangular') {
    // 0 deg, 45 deg, 90 deg
    ex = ea;
    ey = ec;
    gxy = 2 * eb - (ea + ec);
  } else {
    // Delta rosette: 0 deg, 60 deg, 120 deg
    ex = ea;
    ey = (2 * eb + 2 * ec - ea) / 3;
    gxy = (2 / Math.sqrt(3)) * (eb - ec);
  }

  const eAvg = (ex + ey) / 2;
  const R_strain = Math.sqrt(Math.pow((ex - ey) / 2, 2) + Math.pow(gxy / 2, 2));

  const e1 = eAvg + R_strain;
  const e2 = eAvg - R_strain;
  const gammaMax = 2 * R_strain;

  let thetaP_rad = 0.5 * Math.atan2(gxy, ex - ey);
  let thetaP_deg = (thetaP_rad * 180) / Math.PI;

  // Transformed strain at angle theta
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const ex_prime = eAvg + ((ex - ey) / 2) * Math.cos(2 * thetaRad) + (gxy / 2) * Math.sin(2 * thetaRad);
  const ey_prime = eAvg - ((ex - ey) / 2) * Math.cos(2 * thetaRad) - (gxy / 2) * Math.sin(2 * thetaRad);
  const gxy_prime = - (ex - ey) * Math.sin(2 * thetaRad) + gxy * Math.cos(2 * thetaRad);

  // Stress calculation using Generalized Hooke's Law for Plane Stress
  const mat = MATERIAL_PRESETS[material];
  const E_MPa = mat.E * 1000; // GPa to MPa
  const factor = E_MPa / (1 - mat.nu * mat.nu);
  const sigma1 = factor * (e1 * 1e-6 + mat.nu * e2 * 1e-6); // MPa
  const sigma2 = factor * (e2 * 1e-6 + mat.nu * e1 * 1e-6); // MPa
  const tauMax = (sigma1 - sigma2) / 2;

  // Mohr's Circle for Strain Data
  const circleAngles = Array.from({ length: 100 }, (_, i) => (i * 2 * Math.PI) / 99);
  const circleX = circleAngles.map((a) => eAvg + R_strain * Math.cos(a));
  const circleY = circleAngles.map((a) => R_strain * Math.sin(a));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 23: Strain Rosettes & Strain Transformation</h1>
        <p className="mt-2 text-indigo-200">
          Analyze 45° Rectangular and 60° Delta strain rosettes, derive plane strain components, and evaluate principal strains and stresses.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Experimental Inputs</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Rosette Configuration</label>
            <div className="flex gap-2">
              <button
                onClick={() => setRosetteType('rectangular')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  rosetteType === 'rectangular'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                45° Rectangular
              </button>
              <button
                onClick={() => setRosetteType('delta')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  rosetteType === 'delta'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                60° Delta
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Gage A Strain (<MathInline math="\epsilon_a" /> at 0°):</span>
                <span className="text-blue-600 font-bold">{ea} μϵ</span>
              </div>
              <input
                type="range"
                min="-1000"
                max="1000"
                step="10"
                value={ea}
                onChange={(e) => setEa(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>
                  Gage B Strain (<MathInline math={`\\epsilon_b`} /> at {rosetteType === 'rectangular' ? '45°' : '60°'}):
                </span>
                <span className="text-emerald-600 font-bold">{eb} μϵ</span>
              </div>
              <input
                type="range"
                min="-1000"
                max="1000"
                step="10"
                value={eb}
                onChange={(e) => setEb(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>
                  Gage C Strain (<MathInline math={`\\epsilon_c`} /> at {rosetteType === 'rectangular' ? '90°' : '120°'}):
                </span>
                <span className="text-purple-600 font-bold">{ec} μϵ</span>
              </div>
              <input
                type="range"
                min="-1000"
                max="1000"
                step="10"
                value={ec}
                onChange={(e) => setEc(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Element Rotation Angle (<MathInline math="\theta" />):</span>
                <span className="text-indigo-600 font-bold">{thetaDeg}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={thetaDeg}
                onChange={(e) => setThetaDeg(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Material Selection</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              {Object.entries(MATERIAL_PRESETS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name} (E={val.E} GPa, ν={val.nu})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results & Mohr Circle Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Calculated Output Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Cartesian Strains</span>
              <div className="text-sm font-semibold mt-1 space-y-1">
                <p><MathInline math="\epsilon_x" /> = {ex.toFixed(1)} μϵ</p>
                <p><MathInline math="\epsilon_y" /> = {ey.toFixed(1)} μϵ</p>
                <p><MathInline math="\gamma_{xy}" /> = {gxy.toFixed(1)} μϵ</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Principal Strains</span>
              <div className="text-sm font-semibold mt-1 space-y-1">
                <p className="text-blue-600"><MathInline math="\epsilon_1" /> = {e1.toFixed(1)} μϵ</p>
                <p className="text-red-600"><MathInline math="\epsilon_2" /> = {e2.toFixed(1)} μϵ</p>
                <p><MathInline math="\gamma_{\max}" /> = {gammaMax.toFixed(1)} μϵ</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Transformed ({thetaDeg}°)</span>
              <div className="text-sm font-semibold mt-1 space-y-1">
                <p><MathInline math="\epsilon_{x'}" /> = {ex_prime.toFixed(1)} μϵ</p>
                <p><MathInline math="\epsilon_{y'}" /> = {ey_prime.toFixed(1)} μϵ</p>
                <p><MathInline math="\gamma_{x'y'}" /> = {gxy_prime.toFixed(1)} μϵ</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Calculated Stresses</span>
              <div className="text-sm font-semibold mt-1 space-y-1">
                <p className="text-indigo-600"><MathInline math="\sigma_1" /> = {sigma1.toFixed(2)} MPa</p>
                <p className="text-purple-600"><MathInline math="\sigma_2" /> = {sigma2.toFixed(2)} MPa</p>
                <p><MathInline math="\tau_{\max}" /> = {tauMax.toFixed(2)} MPa</p>
              </div>
            </div>
          </div>

          {/* Plotly Mohr's Circle Plot */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Mohr's Circle for Strain (<MathInline math="\epsilon" /> vs <MathInline math="\gamma/2" />)</h3>
            <Plot
              data={[
                {
                  x: circleX,
                  y: circleY,
                  mode: 'lines',
                  name: "Mohr's Circle",
                  line: { color: '#3b82f6', width: 3 },
                },
                {
                  x: [ex, ey],
                  y: [gxy / 2, -gxy / 2],
                  mode: 'lines+markers',
                  name: 'X-Y Strain State',
                  marker: { size: 10, color: '#ef4444' },
                  line: { color: '#ef4444', dash: 'dash', width: 2 },
                },
                {
                  x: [e1, e2],
                  y: [0, 0],
                  mode: 'markers',
                  name: 'Principal Strains (ϵ1, ϵ2)',
                  marker: { size: 12, color: '#10b981', symbol: 'diamond' },
                },
              ]}
              layout={{
                autosize: true,
                height: 380,
                margin: { l: 60, r: 40, t: 30, b: 50 },
                xaxis: { title: 'Normal Strain ϵ (μϵ)', zeroline: true, gridcolor: '#e2e8f0' },
                yaxis: { title: 'Shear Strain γ/2 (μϵ)', zeroline: true, scaleanchor: 'x', scaleratio: 1, gridcolor: '#e2e8f0' },
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
      <div className="bg-indigo-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-indigo-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          In a 45° rectangular rosette, if <MathInline math="\epsilon_a = 500\,\mu\epsilon" />, <MathInline math="\epsilon_b = 300\,\mu\epsilon" />, and <MathInline math="\epsilon_c = 100\,\mu\epsilon" />, what is the shear strain <MathInline math="\gamma_{xy}" />?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter predicted γ_xy in μϵ..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition"
          >
            Check Answer
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-indigo-200 dark:border-slate-600">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300">Explanation & Verification</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              Formula: <MathInline math="\gamma_{xy} = 2\epsilon_b - (\epsilon_a + \epsilon_c) = 2(300) - (500 + 100) = 600 - 600 = 0\,\mu\epsilon" />.
            </p>
            <p className="text-sm mt-2 font-medium text-emerald-600 dark:text-emerald-400">
              When <MathInline math="\gamma_{xy} = 0" />, the rosette axes (0° and 90°) directly align with the principal strain axes!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

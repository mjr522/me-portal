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

export default function ME330_Lesson24() {
  const [vesselType, setVesselType] = useState('cylinder'); // 'cylinder' or 'sphere'
  const [pressure, setPressure] = useState(2.5); // MPa
  const [radius, setRadius] = useState(300); // mm
  const [thickness, setThickness] = useState(12); // mm
  const [seamAngle, setSeamAngle] = useState(30); // degrees from circumferential/hoop axis

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  // Thin wall ratio check
  const r_over_t = radius / thickness;
  const isThinWalled = r_over_t >= 10;

  // Stresses
  let sigma1 = 0; // Hoop (cylinder) or Spherical membrane
  let sigma2 = 0; // Longitudinal (cylinder) or Spherical membrane
  const sigma3 = 0; // Radial stress at outer surface

  if (vesselType === 'cylinder') {
    sigma1 = (pressure * radius) / thickness; // Hoop stress
    sigma2 = (pressure * radius) / (2 * thickness); // Longitudinal stress
  } else {
    sigma1 = (pressure * radius) / (2 * thickness); // Spherical
    sigma2 = (pressure * radius) / (2 * thickness);
  }

  const inPlaneMaxShear = (sigma1 - sigma2) / 2;
  const absMaxShear = (sigma1 - sigma3) / 2;

  // Welded seam stress state (angle relative to hoop axis)
  const thetaRad = (seamAngle * Math.PI) / 180;
  const sigma_seam_normal = (sigma1 + sigma2) / 2 + ((sigma1 - sigma2) / 2) * Math.cos(2 * thetaRad);
  const tau_seam_shear = -((sigma1 - sigma2) / 2) * Math.sin(2 * thetaRad);

  // Mohr Circle Data (In-plane and Out-of-plane 3D Mohr Circles)
  const circlePoints = 80;
  const getCircle = (c, r) => {
    const angles = Array.from({ length: circlePoints }, (_, i) => (i * 2 * Math.PI) / (circlePoints - 1));
    return {
      x: angles.map((a) => c + r * Math.cos(a)),
      y: angles.map((a) => r * Math.sin(a)),
    };
  };

  // 3D Mohr circles: C12 between sigma2 & sigma1, C23 between sigma3 & sigma2, C13 between sigma3 & sigma1
  const c12 = (sigma1 + sigma2) / 2;
  const r12 = Math.abs(sigma1 - sigma2) / 2;
  const circle12 = getCircle(c12, r12);

  const c23 = (sigma2 + sigma3) / 2;
  const r23 = Math.abs(sigma2 - sigma3) / 2;
  const circle23 = getCircle(c23, r23);

  const c13 = (sigma1 + sigma3) / 2;
  const r13 = Math.abs(sigma1 - sigma3) / 2;
  const circle13 = getCircle(c13, r13);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 24: Thin-Walled Pressure Vessels</h1>
        <p className="mt-2 text-cyan-200">
          Analyze stress distributions in cylindrical and spherical pressure vessels, evaluate out-of-plane absolute maximum shear, and calculate helical weld stresses.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Vessel Parameters</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Vessel Geometry</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVesselType('cylinder')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  vesselType === 'cylinder'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Cylindrical Tank
              </button>
              <button
                onClick={() => setVesselType('sphere')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                  vesselType === 'sphere'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                Spherical Tank
              </button>
            </div>
          </div>

          {/* Thin-wall Check Alert */}
          <div className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between ${
            isThinWalled
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300'
          }`}>
            <span>Thin-Wall Criterion (<MathInline math="r/t \ge 10" />):</span>
            <span className="font-bold">{r_over_t.toFixed(1)} {isThinWalled ? '✓ (Valid)' : '⚠ (Thick-Wall!)'}</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Internal Pressure (<MathInline math="p" />):</span>
                <span className="text-cyan-600 font-bold">{pressure.toFixed(2)} MPa</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.1"
                value={pressure}
                onChange={(e) => setPressure(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Inner Radius (<MathInline math="r" />):</span>
                <span className="text-blue-600 font-bold">{radius} mm</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="10"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Wall Thickness (<MathInline math="t" />):</span>
                <span className="text-indigo-600 font-bold">{thickness} mm</span>
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
            </div>

            {vesselType === 'cylinder' && (
              <div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Helical Seam Angle (<MathInline math="\theta" />):</span>
                  <span className="text-purple-600 font-bold">{seamAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={seamAngle}
                  onChange={(e) => setSeamAngle(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Results & Mohr Circle Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Calculated Output Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">
                {vesselType === 'cylinder' ? 'Hoop Stress (σ1)' : 'Membrane Stress (σ1)'}
              </span>
              <div className="text-xl font-bold text-cyan-600 mt-1">
                {sigma1.toFixed(2)} <span className="text-xs font-normal">MPa</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">
                {vesselType === 'cylinder' ? 'Longitudinal (σ2)' : 'Membrane Stress (σ2)'}
              </span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {sigma2.toFixed(2)} <span className="text-xs font-normal">MPa</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">In-Plane Max Shear</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {inPlaneMaxShear.toFixed(2)} <span className="text-xs font-normal">MPa</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Abs Max Shear (3D)</span>
              <div className="text-xl font-bold text-red-600 mt-1">
                {absMaxShear.toFixed(2)} <span className="text-xs font-normal">MPa</span>
              </div>
            </div>
          </div>

          {vesselType === 'cylinder' && (
            <div className="bg-cyan-50 dark:bg-slate-800 p-4 rounded-xl shadow border border-cyan-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-cyan-900 dark:text-cyan-200">Helical Seam Stress at {seamAngle}°</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Normal: <MathInline math="\sigma_n" /> = <strong>{sigma_seam_normal.toFixed(2)} MPa</strong> | Shear: <MathInline math="\tau_{nt}" /> = <strong>{Math.abs(tau_seam_shear).toFixed(2)} MPa</strong>
                </p>
              </div>
            </div>
          )}

          {/* Plotly 3D Mohr's Circle Plot */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-2">3D Mohr's Circles & Out-of-Plane Shear</h3>
            <Plot
              data={[
                {
                  x: circle12.x,
                  y: circle12.y,
                  mode: 'lines',
                  name: 'In-Plane Circle (σ1 - σ2)',
                  line: { color: '#06b6d4', width: 2 },
                },
                {
                  x: circle23.x,
                  y: circle23.y,
                  mode: 'lines',
                  name: 'Out-of-Plane Circle (σ2 - σ3)',
                  line: { color: '#3b82f6', width: 2 },
                },
                {
                  x: circle13.x,
                  y: circle13.y,
                  mode: 'lines',
                  name: 'Governing 3D Circle (σ1 - σ3)',
                  line: { color: '#ef4444', width: 3 },
                },
                {
                  x: [sigma3, sigma2, sigma1],
                  y: [0, 0, 0],
                  mode: 'markers',
                  name: 'Principal Stresses (σ3, σ2, σ1)',
                  marker: { size: 10, color: '#10b981' },
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
      <div className="bg-cyan-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-cyan-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-cyan-900 dark:text-cyan-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          Why is a spherical pressure vessel twice as efficient as a cylindrical pressure vessel of the same radius and wall thickness?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Type your physical explanation..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg text-sm transition"
          >
            Submit Explanation
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-cyan-200 dark:border-slate-600">
            <h4 className="font-semibold text-cyan-900 dark:text-cyan-300">Detailed Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              For a cylindrical vessel, hoop stress is <MathInline math="\sigma_1 = \frac{pr}{t}" />. For a spherical vessel, isotropic symmetry yields <MathInline math="\sigma = \frac{pr}{2t}" />. Thus, the maximum normal stress in a sphere is <strong>half</strong> that of a cylinder, allowing it to withstand twice the internal pressure for a given thickness!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

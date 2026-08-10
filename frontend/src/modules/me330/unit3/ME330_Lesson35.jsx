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

export default function ME330_Lesson35() {
  const [activeTab, setActiveTab] = useState('solver'); // 'solver', 'review', 'exam'

  // Comprehensive Synthesis Solver State: Pressurized Drive Shaft under Bending & Torsion
  const [pressure_MPa, setPressure_MPa] = useState(2.0); // Pressure vessel p
  const [radius_mm, setRadius_mm] = useState(150); // Shaft/Vessel r
  const [thickness_mm, setThickness_mm] = useState(10); // Wall thickness t
  const [Fx_kN, setFx_kN] = useState(20); // Axial P
  const [Fy_kN, setFy_kN] = useState(-15); // Transverse V
  const [Torque_kNm, setTorque_kNm] = useState(5.0); // Torsion T
  const [Moment_kNm, setMoment_kNm] = useState(8.0); // Bending M
  const [yield_MPa, setYield_MPa] = useState(300); // Material yield strength

  // GR 3 Practice Quiz state
  const [examAnswers, setExamAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Calculations for Synthesis Solver
  const r = radius_mm / 1000; // m
  const t = thickness_mm / 1000; // m
  const A = 2 * Math.PI * r * t; // Thin wall hollow circle area (m^2)
  const I = Math.PI * Math.pow(r, 3) * t; // Thin wall hollow circle I (m^4)
  const J = 2 * I;

  // Stresses
  // 1. Pressure vessel stresses
  const sigma_hoop = (pressure_MPa * 1e6 * r) / t / 1e6; // MPa
  const sigma_long = (pressure_MPa * 1e6 * r) / (2 * t) / 1e6; // MPa

  // 2. Mechanical stresses (Axial & Bending)
  const sigma_axial = ((Fx_kN * 1000) / A) / 1e6; // MPa
  const sigma_bending = ((Moment_kNm * 1000 * r) / I) / 1e6; // MPa

  // Superimposed Normal Stress (Top Fiber: Hoop + Longitudinal + Axial + Bending)
  const sigma_x = sigma_long + sigma_axial + sigma_bending; // Longitudinal direction (X)
  const sigma_y = sigma_hoop; // Transverse/circumferential direction (Y)

  // 3. Torsional Shear Stress
  const tau_xy = ((Torque_kNm * 1000 * r) / J) / 1e6; // MPa

  // Principal Stresses
  const sigma_avg = (sigma_x + sigma_y) / 2;
  const R_stress = Math.sqrt(Math.pow((sigma_x - sigma_y) / 2, 2) + Math.pow(tau_xy, 2));
  const sigma_1 = sigma_avg + R_stress;
  const sigma_2 = sigma_avg - R_stress;
  const sigma_3 = 0; // Radial stress at outer surface

  const inPlaneMaxShear = R_stress;
  const absMaxShear = (sigma_1 - sigma_3) / 2;

  // Failure Criterion (Von Mises)
  const vonMises = Math.sqrt(sigma_1 * sigma_1 - sigma_1 * sigma_2 + sigma_2 * sigma_2);
  const factorOfSafety = yield_MPa / vonMises;

  // Mohr Circle coordinates
  const circlePts = 80;
  const getCircleData = (c, r_val) => {
    const angles = Array.from({ length: circlePts }, (_, i) => (i * 2 * Math.PI) / (circlePts - 1));
    return {
      x: angles.map((a) => c + r_val * Math.cos(a)),
      y: angles.map((a) => r_val * Math.sin(a)),
    };
  };

  const c12 = (sigma_1 + sigma_2) / 2;
  const r12 = Math.abs(sigma_1 - sigma_2) / 2;
  const circle12 = getCircleData(c12, r12);

  const c13 = (sigma_1 + sigma_3) / 2;
  const r13 = Math.abs(sigma_1 - sigma_3) / 2;
  const circle13 = getCircleData(c13, r13);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lesson 35: GR 3 Review & Comprehensive Synthesis Solver</h1>
          <p className="mt-2 text-indigo-200">
            Synthesize all Unit 3 concepts: strain rosettes, pressure vessels, 3D combined loadings, beam deflections, and statically indeterminate compatibility.
          </p>
        </div>
        <div className="flex bg-indigo-900/60 p-1.5 rounded-xl border border-indigo-700/50">
          <button
            onClick={() => setActiveTab('solver')}
            className={`px-4 py-2 rounded-lg font-medium text-xs transition ${
              activeTab === 'solver' ? 'bg-blue-600 text-white shadow' : 'text-indigo-200 hover:text-white'
            }`}
          >
            Synthesis Solver
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-lg font-medium text-xs transition ${
              activeTab === 'review' ? 'bg-blue-600 text-white shadow' : 'text-indigo-200 hover:text-white'
            }`}
          >
            Formula Cheat Sheet
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-4 py-2 rounded-lg font-medium text-xs transition ${
              activeTab === 'exam' ? 'bg-blue-600 text-white shadow' : 'text-indigo-200 hover:text-white'
            }`}
          >
            GR 3 Practice Quiz
          </button>
        </div>
      </div>

      {/* TAB 1: SYNTHESIS SOLVER */}
      {activeTab === 'solver' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Multi-Axial Load Parameters</h2>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Internal Pressure p: {pressure_MPa} MPa</label>
                  <input type="range" min="0" max="10" step="0.5" value={pressure_MPa} onChange={(e) => setPressure_MPa(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Shaft Radius r: {radius_mm} mm</label>
                  <input type="range" min="50" max="300" step="10" value={radius_mm} onChange={(e) => setRadius_mm(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Wall Thickness t: {thickness_mm} mm</label>
                  <input type="range" min="3" max="25" step="1" value={thickness_mm} onChange={(e) => setThickness_mm(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Yield Strength σY: {yield_MPa} MPa</label>
                  <input type="range" min="150" max="600" step="10" value={yield_MPa} onChange={(e) => setYield_MPa(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                </div>
              </div>

              <div className="space-y-2 border-t pt-2 border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Mechanical Load Resultants</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500">Axial Load Fx: {Fx_kN} kN</label>
                    <input type="range" min="-100" max="100" step="5" value={Fx_kN} onChange={(e) => setFx_kN(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Bending Moment M: {Moment_kNm} kN·m</label>
                    <input type="range" min="-20" max="20" step="1" value={Moment_kNm} onChange={(e) => setMoment_kNm(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500">Torsional Torque T: {Torque_kNm} kN·m</label>
                  <input type="range" min="0" max="25" step="1" value={Torque_kNm} onChange={(e) => setTorque_kNm(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Calculated Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">Normal Stress σx</span>
                <p className="font-bold text-blue-600 mt-1">{sigma_x.toFixed(2)} MPa</p>
                <span className="text-xs text-slate-400">Long+Axial+Bend</span>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">Hoop Stress σy</span>
                <p className="font-bold text-cyan-600 mt-1">{sigma_y.toFixed(2)} MPa</p>
                <span className="text-xs text-slate-400">pr/t</span>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">Shear Stress τxy</span>
                <p className="font-bold text-purple-600 mt-1">{tau_xy.toFixed(2)} MPa</p>
                <span className="text-xs text-slate-400">Tr/J</span>
              </div>

              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 font-medium">Von Mises σvm</span>
                <p className="font-bold text-indigo-600 mt-1">{vonMises.toFixed(2)} MPa</p>
                <span className={`text-xs font-semibold ${factorOfSafety >= 1.0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  FS = {factorOfSafety.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Plotly 3D Mohr's Circle */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-2">3D Mohr's Circles for Pressurized & Loaded Shaft</h3>
              <Plot
                data={[
                  {
                    x: circle12.x,
                    y: circle12.y,
                    mode: 'lines',
                    name: 'In-Plane Circle (σ1 - σ2)',
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
                    x: [sigma_3, sigma_2, sigma_1],
                    y: [0, 0, 0],
                    mode: 'markers',
                    name: 'Principal Stresses',
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
      )}

      {/* TAB 2: FORMULA CHEAT SHEET */}
      {activeTab === 'review' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 border-b pb-2 border-slate-200 dark:border-slate-700">
              Stress Transformations & Pressure Vessels
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-blue-600">Strain Rosette Transformation</h4>
                <MathBlock math="\epsilon_\theta = \frac{\epsilon_x + \epsilon_y}{2} + \frac{\epsilon_x - \epsilon_y}{2}\cos 2\theta + \frac{\gamma_{xy}}{2}\sin 2\theta" />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-cyan-600">Thin-Walled Cylindrical Vessel</h4>
                <MathBlock math="\sigma_{\text{hoop}} = \frac{pr}{t}, \quad \sigma_{\text{long}} = \frac{pr}{2t}, \quad \tau_{\text{abs}}^{\max} = \frac{pr}{2t}" />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-purple-600">Vector Methods for Combined Loading</h4>
                <MathBlock math="\vec{M} = \vec{r} \times \vec{F}, \quad \sigma_x = \frac{P}{A} - \frac{M_z y}{I_z} + \frac{M_y z}{I_y}" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 border-b pb-2 border-slate-200 dark:border-slate-700">
              Beam Deflections & Statically Indeterminate Systems
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-amber-600">Differential Equation of Elastic Curve</h4>
                <MathBlock math="EI \frac{d^2 v}{dx^2} = M(x) \implies EI v(x) = \iint M(x)dx^2 + C_1 x + C_2" />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-emerald-600">Standard Cantilever Deflection (Tip P)</h4>
                <MathBlock math="v_{\max} = -\frac{P L^3}{3 EI}, \quad \theta_{\max} = -\frac{P L^2}{2 EI}" />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h4 className="font-semibold text-rose-600">Propped Cantilever Compatibility</h4>
                <MathBlock math="v_P(L) + v_B(L) = 0 \implies -\frac{wL^4}{8EI} + \frac{B_y L^3}{3EI} = 0 \implies B_y = \frac{3}{8}wL" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRACTICE EXAM */}
      {activeTab === 'exam' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-700 space-y-6">
          <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 border-b pb-2 border-slate-200 dark:border-slate-700">
            GR 3 Comprehensive Practice Assessment
          </h3>

          <div className="space-y-5 text-sm">
            {/* Q1 */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">
                1. Thin-Walled Cylindrical Vessel:
              </h4>
              <p>
                A cylindrical pressure vessel of inner radius <MathInline math="r=400\,\text{mm}" /> and wall thickness <MathInline math="t=10\,\text{mm}" /> is subjected to internal pressure <MathInline math="p=2\,\text{MPa}" />. What is the absolute maximum shear stress (<MathInline math="\tau_{\text{abs}}^{\max}" />) on the outer wall?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {['40 MPa', '80 MPa', '20 MPa', '10 MPa'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setExamAnswers((prev) => ({ ...prev, q1: opt }))}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border ${
                      examAnswers.q1 === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">
                2. Propped Cantilever Reaction:
              </h4>
              <p>
                A propped cantilever beam of length <MathInline math="L" /> carries a uniform load <MathInline math="w" /> across its entire length. What is the vertical reaction force at the roller prop support?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {['(3/8) w L', '(5/8) w L', '(1/2) w L', '(1/4) w L'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setExamAnswers((prev) => ({ ...prev, q2: opt }))}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border ${
                      examAnswers.q2 === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">
                3. 1D FEA Bar Shape Functions:
              </h4>
              <p>
                True or False: A 1D bar element with linear shape functions produces exact nodal displacements for a single concentrated point load.
              </p>
              <div className="flex gap-3 pt-2">
                {['True', 'False'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setExamAnswers((prev) => ({ ...prev, q3: opt }))}
                    className={`py-2 px-6 rounded-lg text-xs font-medium border ${
                      examAnswers.q3 === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setExamSubmitted(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition"
          >
            Submit Assessment
          </button>

          {examSubmitted && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-slate-700 border border-indigo-200 dark:border-slate-600 space-y-2">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200">Solutions & Explanations</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                1. Correct: <strong>40 MPa</strong>. Hoop stress <MathInline math="\sigma_1 = \frac{pr}{t} = \frac{2(400)}{10} = 80\,\text{MPa}" />. Absolute max shear <MathInline math="\tau_{\text{abs}}^{\max} = \frac{\sigma_1 - 0}{2} = 40\,\text{MPa}" />.
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                2. Correct: <strong>(3/8) w L</strong>. Derived from compatibility <MathInline math="v(L) = -\frac{wL^4}{8EI} + \frac{B_y L^3}{3EI} = 0" />.
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                3. Correct: <strong>True</strong>. For constant axial force, the true displacement field is linear, which matches the element shape function exactly!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

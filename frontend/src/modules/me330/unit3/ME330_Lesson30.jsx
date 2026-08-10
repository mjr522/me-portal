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

export default function ME330_Lesson30() {
  const [config, setConfig] = useState('cantilever_point'); // 'cantilever_point', 'cantilever_udl', 'ss_udl', 'ss_point'
  const [L, setL] = useState(4.0); // m
  const [loadVal, setLoadVal] = useState(12.0); // kN or kN/m
  const [E_GPa, setE_GPa] = useState(200); // GPa
  const [I_cm4, setI_cm4] = useState(2500); // cm^4 (1 cm^4 = 1e-8 m^4)

  // POE Quiz state
  const [poePrediction, setPoePrediction] = useState('');
  const [poeSubmitted, setPoeSubmitted] = useState(false);

  const E = E_GPa * 1e9; // Pa
  const I_m4 = I_cm4 * 1e-8; // m^4
  const EI = E * I_m4;

  const nPts = 100;
  const xVals = Array.from({ length: nPts }, (_, i) => (i * L) / (nPts - 1));

  let M_vals = [];
  let theta_vals = []; // radians
  let v_vals_mm = [];

  let C1_str = '';
  let C2_str = '';

  if (config === 'cantilever_point') {
    const P = loadVal * 1000; // N
    C1_str = 'C_1 = 0 \\quad (\\text{from } \\theta(0)=0)';
    C2_str = 'C_2 = 0 \\quad (\\text{from } v(0)=0)';

    M_vals = xVals.map((x) => -P * (L - x) / 1000); // kN*m
    theta_vals = xVals.map((x) => (P * (x * x / 2 - L * x)) / EI);
    v_vals_mm = xVals.map((x) => ((P * (x * x * x / 6 - L * x * x / 2)) / EI) * 1000);
  } else if (config === 'cantilever_udl') {
    const w = loadVal * 1000; // N/m
    C1_str = 'C_1 = 0 \\quad (\\text{from } \\theta(0)=0)';
    C2_str = 'C_2 = 0 \\quad (\\text{from } v(0)=0)';

    M_vals = xVals.map((x) => (-w * Math.pow(L - x, 2) / 2) / 1000);
    theta_vals = xVals.map((x) => (-w * (Math.pow(x, 3) - 3 * L * x * x + 3 * L * L * x) / (6 * EI)));
    v_vals_mm = xVals.map((x) => ((-w * (Math.pow(x, 4) - 4 * L * Math.pow(x, 3) + 6 * L * L * x * x) / (24 * EI))) * 1000);
  } else if (config === 'ss_udl') {
    const w = loadVal * 1000; // N/m
    const C1 = (w * Math.pow(L, 3)) / (24 * EI);
    C1_str = `C_1 = \\frac{w L^3}{24 EI} \\quad (\\text{from } v(L)=0)`;
    C2_str = 'C_2 = 0 \\quad (\\text{from } v(0)=0)';

    M_vals = xVals.map((x) => (w * x * (L - x) / 2) / 1000);
    theta_vals = xVals.map((x) => (w * (L * Math.pow(x, 2) / 2 - Math.pow(x, 3) / 3) / (2 * EI)) - C1);
    v_vals_mm = xVals.map((x) => ((-w * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3)) / (24 * EI))) * 1000);
  } else if (config === 'ss_point') {
    const P = loadVal * 1000; // N
    const C1 = (P * L * L) / (16 * EI);
    C1_str = `C_1 = \\frac{P L^2}{16 EI} \\quad (\\text{from symmetry at } x=L/2)`;
    C2_str = 'C_2 = 0 \\quad (\\text{from } v(0)=0)';

    M_vals = xVals.map((x) => (x <= L / 2 ? (P * x / 2) / 1000 : (P * (L - x) / 2) / 1000));
    theta_vals = xVals.map((x) => {
      if (x <= L / 2) return (P * x * x / 4) / EI - C1;
      return (-P * Math.pow(L - x, 2) / 4) / EI + C1;
    });
    v_vals_mm = xVals.map((x) => {
      if (x <= L / 2) return ((-P * x * (3 * L * L - 4 * x * x) / (48 * EI))) * 1000;
      return ((-P * (L - x) * (3 * L * L - 4 * Math.pow(L - x, 2)) / (48 * EI))) * 1000;
    });
  }

  const vMax_mm = Math.max(...v_vals_mm.map(Math.abs));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight">Lesson 30: Beam Deflections by Elastic Curve Integration</h1>
        <p className="mt-2 text-amber-200">
          Solve the differential equation of the elastic curve <MathInline math="EI \frac{d^2v}{dx^2} = M(x)" /> using boundary conditions to obtain slope <MathInline math="\theta(x)" /> and deflection <MathInline math="v(x)" />.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md space-y-5 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold border-b pb-2 border-slate-200 dark:border-slate-700">Beam Setup</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Boundary Condition & Load Type</label>
            <select
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
            >
              <option value="cantilever_point">Cantilever - Tip Point Load P</option>
              <option value="cantilever_udl">Cantilever - Uniform Load w</option>
              <option value="ss_udl">Simply Supported - Uniform Load w</option>
              <option value="ss_point">Simply Supported - Center Point Load P</option>
            </select>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Load Magnitude ({config.includes('udl') ? 'kN/m' : 'kN'}):</span>
                <span className="text-amber-600 font-bold">{loadVal} {config.includes('udl') ? 'kN/m' : 'kN'}</span>
              </div>
              <input type="range" min="1" max="50" step="1" value={loadVal} onChange={(e) => setLoadVal(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Span Length (<MathInline math="L" />):</span>
                <span className="text-blue-600 font-bold">{L} m</span>
              </div>
              <input type="range" min="1" max="10" step="0.5" value={L} onChange={(e) => setL(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Young's Modulus (<MathInline math="E" />):</span>
                <span className="text-purple-600 font-bold">{E_GPa} GPa</span>
              </div>
              <input type="range" min="70" max="300" step="10" value={E_GPa} onChange={(e) => setE_GPa(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-medium">
                <span>Moment of Inertia (<MathInline math="I" />):</span>
                <span className="text-indigo-600 font-bold">{I_cm4} cm⁴</span>
              </div>
              <input type="range" min="500" max="10000" step="250" value={I_cm4} onChange={(e) => setI_cm4(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer" />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-slate-700/50 p-4 rounded-xl text-xs space-y-1">
            <h4 className="font-bold text-amber-900 dark:text-amber-200">Integration Constants</h4>
            <p><MathInline math={C1_str} /></p>
            <p><MathInline math={C2_str} /></p>
          </div>
        </div>

        {/* Results & Plotly Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow border border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-500 font-medium">Maximum Absolute Deflection (|v_max|)</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {vMax_mm.toFixed(2)} <span className="text-sm font-normal">mm</span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              Flexural Rigidity <MathInline math="EI" /> = <strong>{(EI / 1e3).toFixed(1)} kN·m²</strong>
            </div>
          </div>

          {/* Plotly Elastic Curve & Bending Moment Plot */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-semibold">Elastic Curve v(x) and Moment M(x)</h3>
            <Plot
              data={[
                {
                  x: xVals,
                  y: v_vals_mm,
                  mode: 'lines',
                  name: 'Deflection v(x) (mm)',
                  line: { color: '#f59e0b', width: 3 },
                },
                {
                  x: xVals,
                  y: M_vals,
                  mode: 'lines',
                  name: 'Bending Moment M(x) (kN·m)',
                  yaxis: 'y2',
                  line: { color: '#3b82f6', width: 2, dash: 'dash' },
                },
              ]}
              layout={{
                autosize: true,
                height: 380,
                margin: { l: 60, r: 60, t: 30, b: 50 },
                xaxis: { title: 'Position along beam x (m)', gridcolor: '#e2e8f0' },
                yaxis: { title: 'Deflection v (mm)', gridcolor: '#e2e8f0' },
                yaxis2: {
                  title: 'Moment M (kN·m)',
                  overlaying: 'y',
                  side: 'right',
                  showgrid: false,
                },
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
      <div className="bg-amber-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-md">
        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">Predict-Observe-Explain Challenge</h3>
        <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">
          What kinematic boundary conditions are applied at a fixed support (<MathInline math="x=0" />) vs a pin support (<MathInline math="x=0" />)?
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Type boundary conditions..."
            value={poePrediction}
            onChange={(e) => setPoePrediction(e.target.value)}
            disabled={poeSubmitted}
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm flex-1"
          />
          <button
            onClick={() => setPoeSubmitted(true)}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition"
          >
            Check Answer
          </button>
        </div>

        {poeSubmitted && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-700 border border-amber-200 dark:border-slate-600">
            <h4 className="font-semibold text-amber-900 dark:text-amber-300">Explanation</h4>
            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
              At a fixed support (<MathInline math="x=0" />), both displacement and slope are constrained: <MathInline math="v(0)=0" /> and <MathInline math="\theta(0)=\frac{dv}{dx}(0)=0" />. At a simple pin support (<MathInline math="x=0" />), displacement is zero (<MathInline math="v(0)=0" />), but slope <MathInline math="\theta(0)" /> is non-zero and bending moment is zero (<MathInline math="M(0)=0" />)!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Target, HelpCircle, CheckCircle, AlertTriangle, RefreshCw, Award, BookOpen, ArrowRight, ShieldAlert, Cpu, Layers } from 'lucide-react';

function MathInline({ math }) {
  const html = katex.renderToString(math, { throwOnError: false });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MathBlock({ math }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const PRESETS = {
  helicopter: {
    name: 'Helicopter Main Rotor Drive Shaft',
    P_kN: 30, // Tension
    T_kNm: 4.5,
    M_kNm: 2.0,
    V_kN: 15,
    p_MPa: 0,
    L_m: 2.5,
    Do_mm: 100,
    Di_mm: 84,
    matName: 'High-Strength Steel (4340)',
    E_GPa: 205,
    yield_MPa: 860
  },
  excavator: {
    name: 'Hydraulic Excavator Boom Cylinder Rod',
    P_kN: -140, // Compression (Buckling risk!)
    T_kNm: 0,
    M_kNm: 1.5,
    V_kN: 10,
    p_MPa: 25, // Hydraulic pressure
    L_m: 3.2,
    Do_mm: 110,
    Di_mm: 90,
    matName: 'Structural Steel (A36)',
    E_GPa: 200,
    yield_MPa: 350
  },
  wind_turbine: {
    name: 'Wind Turbine Main Shaft',
    P_kN: -80,
    T_kNm: 12.0,
    M_kNm: 8.5,
    V_kN: 40,
    p_MPa: 0,
    L_m: 4.0,
    Do_mm: 180,
    Di_mm: 140,
    matName: 'Forged Alloy Steel',
    E_GPa: 210,
    yield_MPa: 650
  },
  submarine: {
    name: 'Submarine Hull Internal Pressure Member',
    P_kN: -50,
    T_kNm: 1.0,
    M_kNm: 0.5,
    V_kN: 5,
    p_MPa: 8.0,
    L_m: 2.0,
    Do_mm: 120,
    Di_mm: 100,
    matName: 'Titanium Ti-6Al-4V',
    E_GPa: 114,
    yield_MPa: 880
  }
};

const EXAM_QUESTIONS = [
  {
    id: 1,
    unit: 'Unit 1: Axial & Torsion',
    question: 'A solid circular steel shaft (G = 80 GPa) with diameter d = 40 mm and length L = 1.5 m is subjected to a torque T = 1.2 kN·m. What is the maximum shear stress tau_max and angle of twist phi?',
    options: [
      'A) tau_max = 95.5 MPa, phi = 0.053 rad (3.04°)',
      'B) tau_max = 47.7 MPa, phi = 0.026 rad',
      'C) tau_max = 120.0 MPa, phi = 0.100 rad',
      'D) tau_max = 65.0 MPa, phi = 0.015 rad'
    ],
    correct: 0,
    explanation: 'Polar moment J = pi*d^4/32 = 2.513x10^-7 m^4. tau_max = T*c/J = (1200 * 0.02) / 2.513x10^-7 = 95.5 MPa. phi = T*L/(G*J) = (1200 * 1.5) / (80x10^9 * 2.513x10^-7) = 0.0537 rad = 3.07°.'
  },
  {
    id: 2,
    unit: 'Unit 2: Bending & Mohr\'s Circle',
    question: 'A beam element experiences normal stresses sigma_x = 120 MPa, sigma_y = -40 MPa, and shear stress tau_xy = 60 MPa. What is the maximum in-plane shear stress tau_max?',
    options: [
      'A) 100 MPa',
      'B) 80 MPa',
      'C) 140 MPa',
      'D) 60 MPa'
    ],
    correct: 0,
    explanation: 'tau_max = sqrt(((sigma_x - sigma_y)/2)^2 + tau_xy^2) = sqrt(((120 - (-40))/2)^2 + 60^2) = sqrt(80^2 + 60^2) = sqrt(6400 + 3600) = 100 MPa.'
  },
  {
    id: 3,
    unit: 'Unit 3: Pressure Vessels & Combined Loading',
    question: 'A thin-walled cylindrical vessel with radius r = 500 mm and wall thickness t = 10 mm contains internal pressure p = 3.0 MPa. What are the hoop stress sigma_h and longitudinal stress sigma_l?',
    options: [
      'A) sigma_h = 150 MPa, sigma_l = 75 MPa',
      'B) sigma_h = 75 MPa, sigma_l = 150 MPa',
      'C) sigma_h = 300 MPa, sigma_l = 150 MPa',
      'D) sigma_h = 100 MPa, sigma_l = 50 MPa'
    ],
    correct: 0,
    explanation: 'Hoop stress sigma_h = p*r/t = (3.0 * 500) / 10 = 150 MPa. Longitudinal stress sigma_l = p*r/(2t) = 75 MPa.'
  },
  {
    id: 4,
    unit: 'Unit 3: Deflections',
    question: 'A simply supported beam of length L under a center point load P has maximum deflection delta_max = P L^3 / (48 E I). If the beam span L is doubled to 2L under the same load P, how does maximum deflection change?',
    options: [
      'A) Increases by a factor of 8 (8x delta_max)',
      'B) Increases by a factor of 4 (4x delta_max)',
      'C) Doubles (2x delta_max)',
      'D) Increases by a factor of 16'
    ],
    correct: 0,
    explanation: 'Deflection is proportional to L^3. (2L)^3 = 8 L^3, so deflection increases by 8 times!'
  },
  {
    id: 5,
    unit: 'Unit 4: Column Buckling',
    question: 'A fixed-free (cantilever) column has length L = 2 m and effective length factor K = 2.0. What is its effective length L_e, and how does its Euler buckling load compare to an identical pinned-pinned column (K = 1.0)?',
    options: [
      'A) L_e = 4.0 m; Buckling load is 1/4 (25%) of the pinned-pinned column.',
      'B) L_e = 4.0 m; Buckling load is 1/2 (50%) of the pinned-pinned column.',
      'C) L_e = 1.0 m; Buckling load is 4x that of the pinned-pinned column.',
      'D) L_e = 2.0 m; Buckling load is identical.'
    ],
    correct: 0,
    explanation: 'Effective length L_e = K*L = 2.0 * 2 = 4.0 m. P_cr = pi^2*E*I / (K L)^2 = pi^2*E*I / (4 L^2), which is 1/4 (25%) of P_cr for pinned-pinned!'
  }
];

export default function ME330_Lesson40({ topicName, onComplete }) {
  // Active Tab
  const [activeTab, setActiveTab] = useState('evaluator'); // 'evaluator', 'summary', 'exam'

  // Presets & Custom Configuration State
  const [presetKey, setPresetKey] = useState('helicopter');
  const [PkN, setPkN] = useState(30);
  const [TkNm, setTkNm] = useState(4.5);
  const [MkNm, setMkNm] = useState(2.0);
  const [VkN, setVkN] = useState(15);
  const [pMPa, setPMPa] = useState(0);
  const [Lm, setLm] = useState(2.5);
  const [Domm, setDomm] = useState(100);
  const [Dimm, setDimm] = useState(84);
  const [yieldMPa, setYieldMPa] = useState(860);
  const [EGPa, setEGPa] = useState(205);

  // Exam Quiz State
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedExam, setSubmittedExam] = useState(false);
  const [examScore, setExamScore] = useState(0);

  const applyPreset = (key) => {
    setPresetKey(key);
    const p = PRESETS[key];
    setPkN(p.P_kN);
    setTkNm(p.T_kNm);
    setMkNm(p.M_kNm);
    setVkN(p.V_kN);
    setPMPa(p.p_MPa);
    setLm(p.L_m);
    setDomm(p.Do_mm);
    setDimm(p.Di_mm);
    setYieldMPa(p.yield_MPa);
    setEGPa(p.E_GPa);
  };

  // Section Geometry Calculations
  const Do = Domm;
  const Di = Math.min(Dimm, Do - 2);
  const wallThickness = (Do - Di) / 2;
  const area = (Math.PI * (Math.pow(Do, 2) - Math.pow(Di, 2))) / 4; // mm^2
  const I = (Math.PI * (Math.pow(Do, 4) - Math.pow(Di, 4))) / 64; // mm^4
  const J = 2 * I; // mm^4
  const rMin = Math.sqrt(I / area); // mm

  // Normal Stresses (MPa)
  const P_N = PkN * 1000;
  const M_Nmm = MkNm * 1e6;
  const T_Nmm = TkNm * 1e6;
  const V_N = VkN * 1000;

  const sigma_axial = P_N / area; // MPa
  const sigma_bending = (M_Nmm * (Do / 2)) / I; // MPa
  const sigma_long = pMPa > 0 ? (pMPa * Di) / (4 * wallThickness) : 0; // MPa
  const sigma_hoop = pMPa > 0 ? (pMPa * Di) / (2 * wallThickness) : 0; // MPa

  const sigma_x = sigma_axial + sigma_bending + sigma_long; // Total normal stress at extreme fiber
  const sigma_y = sigma_hoop;

  // Shear Stresses (MPa)
  const tau_torsion = (T_Nmm * (Do / 2)) / J; // MPa
  const tau_transverse = (4 * V_N) / (3 * area); // approx
  const tau_xy = Math.sqrt(Math.pow(tau_torsion, 2) + Math.pow(tau_transverse, 2));

  // Mohr's Circle & Principal Stresses
  const sigma_avg = (sigma_x + sigma_y) / 2;
  const R = Math.sqrt(Math.pow((sigma_x - sigma_y) / 2, 2) + Math.pow(tau_xy, 2));
  const sigma_1 = sigma_avg + R;
  const sigma_2 = sigma_avg - R;
  const tau_max = R;

  // Von Mises Equivalent Stress
  const sigma_vm = Math.sqrt(Math.pow(sigma_1, 2) - sigma_1 * sigma_2 + Math.pow(sigma_2, 2));

  // Column Buckling Check (if P is compressive < 0)
  const lengthMM = Lm * 1000;
  const K = 1.0; // Pinned-Pinned baseline
  const slendernessEff = (K * lengthMM) / rMin;
  const E_MPa = EGPa * 1000;
  const C_c = Math.sqrt((2 * Math.PI * Math.PI * E_MPa) / yieldMPa);

  let sigma_cr = 0;
  if (slendernessEff <= C_c) {
    sigma_cr = yieldMPa * (1 - 0.5 * Math.pow(slendernessEff / C_c, 2));
  } else {
    sigma_cr = (Math.PI * Math.PI * E_MPa) / Math.pow(slendernessEff, 2);
  }
  const P_cr_kN = (sigma_cr * area) / 1000;

  // Factors of Safety & Governing Failure Mode
  const FS_yield = yieldMPa / (sigma_vm || 0.001);
  const FS_shear = (yieldMPa / 2) / (tau_max || 0.001);
  const FS_buckling = PkN < 0 ? P_cr_kN / Math.abs(PkN) : 999;

  let govFS = Math.min(FS_yield, FS_shear);
  let govMode = 'Von Mises Ductile Yielding';

  if (PkN < 0 && FS_buckling < govFS) {
    govFS = FS_buckling;
    govMode = slendernessEff <= C_c ? 'Inelastic Column Buckling (Johnson)' : 'Elastic Column Buckling (Euler)';
  } else if (FS_shear < FS_yield) {
    govMode = 'Maximum Shear Stress (Tresca Yielding)';
  }

  // Plot 1: Mohr's Circle Plot
  const generateMohrCirclePlot = () => {
    const thetaPoints = 100;
    const circleX = [];
    const circleY = [];

    for (let i = 0; i <= thetaPoints; i++) {
      const angle = (i / thetaPoints) * 2 * Math.PI;
      circleX.push(sigma_avg + R * Math.cos(angle));
      circleY.push(R * Math.sin(angle));
    }

    return [
      // Mohr's Circle Line
      {
        x: circleX, y: circleY, mode: 'lines',
        name: "Mohr's Circle", line: { color: '#3b82f6', width: 3 }
      },
      // Center Point
      {
        x: [sigma_avg], y: [0], mode: 'markers',
        name: 'Center (σ_avg)', marker: { size: 10, color: '#64748b' }
      },
      // Principal Stresses (sigma_1, 0) & (sigma_2, 0)
      {
        x: [sigma_1, sigma_2], y: [0, 0], mode: 'markers+text',
        name: 'Principal Stresses (σ₁, σ₂)',
        marker: { size: 12, color: '#10b981', symbol: 'diamond' },
        text: [`σ₁ = ${sigma_1.toFixed(1)}`, `σ₂ = ${sigma_2.toFixed(1)}`],
        textposition: ['top right', 'top left']
      },
      // Stress State (sigma_x, tau_xy)
      {
        x: [sigma_x], y: [tau_xy], mode: 'markers+text',
        name: 'Current Stress State (σ_x, τ_xy)',
        marker: { size: 12, color: '#ef4444' },
        text: [`(σ_x, τ_xy)`],
        textposition: 'top right'
      }
    ];
  };

  // Plot 2: Von Mises Yield Ellipse
  const generateYieldEllipsePlot = () => {
    const pts = 100;
    const ellipseX = [];
    const ellipseY = [];

    for (let i = 0; i <= pts; i++) {
      const angle = (i / pts) * 2 * Math.PI;
      // Von Mises ellipse parametric equation in principal stress plane
      const s1 = yieldMPa * Math.cos(angle);
      const s2 = yieldMPa * (Math.cos(angle) / 2 + (Math.sqrt(3) / 2) * Math.sin(angle));
      ellipseX.push(s1);
      ellipseY.push(s2);
    }

    return [
      {
        x: ellipseX, y: ellipseY, mode: 'lines',
        name: `Von Mises Boundary (σ_y = ${yieldMPa} MPa)`,
        line: { color: '#f59e0b', width: 3 }
      },
      {
        x: [sigma_1], y: [sigma_2], mode: 'markers+text',
        name: 'Operating State (σ₁, σ₂)',
        marker: { size: 14, color: govFS < 1.0 ? '#ef4444' : '#10b981' },
        text: [`Operating (FS = ${govFS.toFixed(2)})`],
        textposition: 'top right'
      }
    ];
  };

  // Exam Quiz Handlers
  const handleAnswerSelect = (qId, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleExamSubmit = () => {
    let score = 0;
    EXAM_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correct) {
        score += 20;
      }
    });
    setExamScore(score);
    setSubmittedExam(true);
    if (score >= 70 && onComplete) {
      onComplete(topicName);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'var(--font-family)' }}>
      {/* Header Banner */}
      <div className="portal-header" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311b92 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2.2rem' }}>🎓</span>
          <span className="unit-card-badge" style={{ background: '#eab308', color: '#000', fontSize: '0.85rem', fontWeight: 800 }}>ME 330 • Unit 4 • Lesson 40</span>
        </div>
        <h1 className="portal-title" style={{ fontSize: '2.4rem' }}>Course Summary & Final Exam Comprehensive Synthesis</h1>
        <p className="portal-desc">
          Integrate all 4 core pillars of Strength of Materials: Axial/Torsion, Bending/Shear, Mohr's Circle/Pressure Vessels, Deflections & Column Buckling.
        </p>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => setActiveTab('evaluator')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: activeTab === 'evaluator' ? '#2563eb' : 'rgba(255,255,255,0.1)', color: '#fff'
            }}
          >
            ⚙️ Combined Failure Evaluator
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: activeTab === 'summary' ? '#2563eb' : 'rgba(255,255,255,0.1)', color: '#fff'
            }}
          >
            📖 ME 330 Master Equation Sheet
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            style={{
              padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: activeTab === 'exam' ? '#eab308' : 'rgba(255,255,255,0.1)', color: activeTab === 'exam' ? '#000' : '#fff'
            }}
          >
            🏆 Comprehensive Final Exam
          </button>
        </div>
      </div>

      {/* TAB 1: COMBINED FAILURE EVALUATOR */}
      {activeTab === 'evaluator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>
          {/* Controls Column */}
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>
              🔧 Real-World Component Presets
            </h3>

            {/* Presets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {Object.entries(PRESETS).map(([k, p]) => (
                <button
                  key={k}
                  onClick={() => applyPreset(k)}
                  style={{
                    padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.82rem',
                    background: presetKey === k ? '#2563eb' : 'var(--bg-primary)',
                    color: presetKey === k ? '#fff' : 'var(--text-main)', cursor: 'pointer', fontWeight: 600, textAlign: 'left'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
              🎛️ Applied Loading Controls
            </h4>

            {/* Load Sliders */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Axial Load P (+Tension / -Compression):</span>
                <span style={{ color: PkN < 0 ? '#ef4444' : '#2563eb' }}>{PkN} kN</span>
              </div>
              <input
                type="range" min="-200" max="200" step="5" value={PkN}
                onChange={(e) => setPkN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Applied Torque T:</span>
                <span style={{ color: '#2563eb' }}>{TkNm.toFixed(1)} kN·m</span>
              </div>
              <input
                type="range" min="0" max="20" step="0.5" value={TkNm}
                onChange={(e) => setTkNm(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Bending Moment M:</span>
                <span style={{ color: '#2563eb' }}>{MkNm.toFixed(1)} kN·m</span>
              </div>
              <input
                type="range" min="0" max="15" step="0.5" value={MkNm}
                onChange={(e) => setMkNm(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Internal Pressure p:</span>
                <span style={{ color: '#2563eb' }}>{pMPa.toFixed(1)} MPa</span>
              </div>
              <input
                type="range" min="0" max="40" step="1" value={pMPa}
                onChange={(e) => setPMPa(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>Component Span L:</span>
                <span style={{ color: '#2563eb' }}>{Lm.toFixed(2)} m</span>
              </div>
              <input
                type="range" min="0.5" max="6.0" step="0.1" value={Lm}
                onChange={(e) => setLm(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>

            {/* Calculations Card */}
            <div style={{ background: 'rgba(37, 99, 235, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '10px' }}>
                📊 Synthesis Stress Tensor Outputs
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div>Total σ_x: <strong>{sigma_x.toFixed(1)} MPa</strong></div>
                <div>Total σ_y (Hoop): <strong>{sigma_y.toFixed(1)} MPa</strong></div>
                <div>Shear τ_xy: <strong>{tau_xy.toFixed(1)} MPa</strong></div>
                <div>Max Shear τ_max: <strong>{tau_max.toFixed(1)} MPa</strong></div>
                <div>Principal σ₁: <strong>{sigma_1.toFixed(1)} MPa</strong></div>
                <div>Principal σ₂: <strong>{sigma_2.toFixed(1)} MPa</strong></div>
                <div style={{ gridColumn: 'span 2', fontSize: '0.95rem', color: '#2563eb', fontWeight: 700, paddingTop: '6px', borderTop: '1px dashed rgba(37,99,235,0.3)' }}>
                  Von Mises Stress σ_vm: {sigma_vm.toFixed(1)} MPa
                </div>
                {PkN < 0 && (
                  <div style={{ gridColumn: 'span 2', color: '#ef4444' }}>
                    Euler/Johnson Buckling P_cr: <strong>{P_cr_kN.toFixed(1)} kN</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Graphics & Governing Assessment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status Banner */}
            <div style={{
              background: govFS >= 1.5 ? '#10b981' : govFS >= 1.0 ? '#f59e0b' : '#ef4444',
              color: '#fff', padding: '16px 20px', borderRadius: '12px', fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                Governing Factor of Safety: {govFS.toFixed(2)} ({govFS >= 1.0 ? 'SAFE DESIGN' : 'CRITICAL FAILURE!'})
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Primary Failure Mode: <strong>{govMode}</strong>
              </div>
            </div>

            {/* Mohr's Circle Plot */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                ⭕ Combined Stress Mohr's Circle
              </h4>
              <Plot
                data={generateMohrCirclePlot()}
                layout={{
                  autosize: true,
                  height: 270,
                  margin: { l: 50, r: 30, t: 20, b: 40 },
                  xaxis: { title: 'Normal Stress σ [MPa]' },
                  yaxis: { title: 'Shear Stress τ [MPa]' },
                  showlegend: true,
                  legend: { x: 0.05, y: 1.15, orientation: 'h' },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)'
                }}
                useResizeHandler={true}
                style={{ width: '100%' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>

            {/* Von Mises Yield Ellipse */}
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                🎯 Von Mises Yield Ellipse Boundary
              </h4>
              <Plot
                data={generateYieldEllipsePlot()}
                layout={{
                  autosize: true,
                  height: 250,
                  margin: { l: 50, r: 30, t: 20, b: 40 },
                  xaxis: { title: 'Principal Stress σ₁ [MPa]' },
                  yaxis: { title: 'Principal Stress σ₂ [MPa]' },
                  showlegend: true,
                  legend: { x: 0.1, y: 1.15, orientation: 'h' },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)'
                }}
                useResizeHandler={true}
                style={{ width: '100%' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ME 330 MASTER EQUATION SHEET */}
      {activeTab === 'summary' && (
        <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', lineHeight: '1.7' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px', color: '#2563eb', textAlign: 'center' }}>
            📖 ME 330 Mechanics of Materials Master Formula Cheat Sheet
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Unit 1 */}
            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb', marginBottom: '10px' }}>
                Unit 1: Stress, Strain & Torsion
              </h3>
              <MathBlock math="\sigma = \frac{P}{A}, \quad \epsilon = \frac{\delta}{L}, \quad \delta = \frac{P L}{A E}" />
              <MathBlock math="\tau = \frac{T r}{J}, \quad \phi = \frac{T L}{G J}, \quad J = \frac{\pi d^4}{32}" />
            </div>

            {/* Unit 2 */}
            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb', marginBottom: '10px' }}>
                Unit 2: Flexure, Transverse Shear & Transformation
              </h3>
              <MathBlock math="\sigma = -\frac{M y}{I}, \quad \tau = \frac{V Q}{I b}" />
              <MathBlock math="\sigma_{1,2} = \frac{\sigma_x + \sigma_y}{2} \pm \sqrt{\left(\frac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2}" />
            </div>

            {/* Unit 3 */}
            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb', marginBottom: '10px' }}>
                Unit 3: Pressure Vessels & Deflections
              </h3>
              <MathBlock math="\sigma_{hoop} = \frac{p r}{t}, \quad \sigma_{long} = \frac{p r}{2 t}" />
              <MathBlock math="E I \frac{d^2 v}{dx^2} = M(x), \quad \delta_{max,cant} = \frac{P L^3}{3 E I}" />
            </div>

            {/* Unit 4 */}
            <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb', marginBottom: '10px' }}>
                Unit 4: Structural Stability & Buckling
              </h3>
              <MathBlock math="P_{cr} = \frac{\pi^2 E I}{(K L)^2}, \quad \lambda = \frac{K L}{r}, \quad r = \sqrt{\frac{I}{A}}" />
              <MathBlock math="\sigma_{cr,Euler} = \frac{\pi^2 E}{\lambda^2}, \quad C_c = \sqrt{\frac{2\pi^2 E}{\sigma_y}}" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPREHENSIVE FINAL EXAM */}
      {activeTab === 'exam' && (
        <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>🏆 ME 330 Comprehensive Final Exam</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>5 Multi-Topic Synthesis Questions covering Units 1 to 4.</p>
            </div>
            {submittedExam && (
              <div style={{ background: examScore >= 70 ? '#10b981' : '#ef4444', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, fontSize: '1.2rem' }}>
                Score: {examScore}% ({examScore >= 70 ? 'PASSED' : 'RETRY'})
              </div>
            )}
          </div>

          {EXAM_QUESTIONS.map((q, idx) => (
            <div key={q.id} style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
                {q.unit} • Question {idx + 1}
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '14px' }}>{q.question}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswerSelect(q.id, optIdx)}
                    disabled={submittedExam}
                    style={{
                      padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'left',
                      background: userAnswers[q.id] === optIdx ? '#2563eb' : 'var(--bg-card)',
                      color: userAnswers[q.id] === optIdx ? '#fff' : 'var(--text-main)', fontWeight: 600, cursor: submittedExam ? 'default' : 'pointer'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {submittedExam && (
                <div style={{ background: userAnswers[q.id] === q.correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: userAnswers[q.id] === q.correct ? '#065f46' : '#991b1b' }}>
                  <strong>{userAnswers[q.id] === q.correct ? '✓ Correct!' : '✗ Incorrect.'}</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}

          {!submittedExam ? (
            <button
              onClick={handleExamSubmit}
              disabled={Object.keys(userAnswers).length < EXAM_QUESTIONS.length}
              style={{
                padding: '14px 28px', background: Object.keys(userAnswers).length === EXAM_QUESTIONS.length ? '#eab308' : '#94a3b8',
                color: '#000', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem'
              }}
            >
              Submit Final Exam 🚀
            </button>
          ) : (
            <button
              onClick={() => {
                setSubmittedExam(false);
                setUserAnswers({});
              }}
              style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              🔄 Retake Exam
            </button>
          )}
        </div>
      )}
    </div>
  );
}

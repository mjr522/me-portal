import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Beam Deflection Sandbox
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        body {{
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 10px;
            background-color: transparent;
            color: #1e293b;
            overflow-x: hidden;
        }}
        .lock-warning {{
            background-color: #fffbeb;
            border: 1.5px solid #fef3c7;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #b45309;
            font-size: 0.88rem;
        }}
        .control-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin-top: 10px;
        }}
        .control-box {{
            background: rgba(255,255,255,0.85);
            border: 1px solid rgba(128, 128, 128, 0.15);
            border-radius: 12px;
            padding: 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }}
        .control-title {{
            font-size: 0.75rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }}
        .slider-container {{
            margin-bottom: 6px;
        }}
        .slider-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2px;
        }}
        .slider-title {{
            font-size: 0.75rem;
            color: #475569;
        }}
        .slider-value {{
            font-size: 0.75rem;
            font-weight: 600;
            color: #8b5cf6;
        }}
        .custom-slider {{
            -webkit-appearance: none;
            width: 100%;
            height: 5px;
            border-radius: 2.5px;
            background: #e2e8f0;
            outline: none;
        }}
        .custom-slider::-webkit-slider-thumb {{
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #8b5cf6;
            cursor: pointer;
            transition: transform 0.1s;
        }}
        .custom-slider::-webkit-slider-thumb:hover {{
            transform: scale(1.25);
        }}
        .custom-slider:disabled {{
            background: #cbd5e1;
            cursor: not-allowed;
        }}
        .custom-slider:disabled::-webkit-slider-thumb {{
            background: #94a3b8;
            cursor: not-allowed;
        }}
        .btn-group {{
            display: flex;
            gap: 6px;
            margin-bottom: 8px;
        }}
        .btn-choice {{
            flex: 1;
            padding: 6px 8px;
            border: 1.5px solid #cbd5e1;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Outfit', sans-serif;
            font-weight: 500;
            font-size: 0.8rem;
            color: #475569;
            transition: all 0.2s;
            text-align: center;
        }}
        .btn-choice.active {{
            border-color: #8b5cf6;
            background-color: #8b5cf6;
            color: white;
        }}
        .btn-choice:hover:not(.active) {{
            border-color: #94a3b8;
            background-color: #f8fafc;
        }}
        .btn-choice:disabled {{
            opacity: 0.5;
            cursor: not-allowed;
        }}
        .equation-box {{
            background: #f1f5f9;
            border-radius: 8px;
            padding: 10px 14px;
            font-family: monospace;
            font-size: 0.82rem;
            margin-top: 10px;
            color: #1e293b;
            border-left: 4px solid #8b5cf6;
            line-height: 1.4;
        }}
        .status-box {{
            padding: 8px 12px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.88rem;
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        .status-safe {{
            background-color: #f0fdf4;
            border: 1.5px solid #dcfce7;
            color: #15803d;
        }}
        .status-failed {{
            background-color: #fef2f2;
            border: 1.5px solid #fee2e2;
            color: #b91c1c;
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Case Selector & Material Selector -->
    <div class="btn-group">
        <button id="btn-cant" class="btn-choice active">Cantilever Tip Load (Wing Model)</button>
        <button id="btn-simply" class="btn-choice">Simply Supported Center Load (Bridge Model)</button>
    </div>
    <div class="btn-group">
        <button id="btn-steel" class="btn-choice active">Steel (E = 200 GPa)</button>
        <button id="btn-alum" class="btn-choice">Aluminum (E = 70 GPa)</button>
        <button id="btn-wood" class="btn-choice">Wood (E = 12 GPa)</button>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 260px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Load P -->
        <div class="control-box">
            <div class="control-title">1. Force (P)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Load, P</span>
                    <span class="slider-value" id="p-val-display">10 kN</span>
                </div>
                <input type="range" id="p-slider" min="2" max="30" step="1" value="10" class="custom-slider">
            </div>
        </div>

        <!-- Length L -->
        <div class="control-box">
            <div class="control-title">2. Span (L)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Length, L</span>
                    <span class="slider-value" id="l-val-display">4.0 m</span>
                </div>
                <input type="range" id="l-slider" min="2.0" max="6.0" step="0.5" value="4.0" class="custom-slider">
            </div>
        </div>

        <!-- Box Height h -->
        <div class="control-box">
            <div class="control-title">3. Section Height (h)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Height, h</span>
                    <span class="slider-value" id="h-val-display">200 mm</span>
                </div>
                <input type="range" id="h-slider" min="100" max="300" step="10" value="200" class="custom-slider">
            </div>
        </div>

        <!-- Visual Deflection Zoom -->
        <div class="control-box">
            <div class="control-title">4. Stretch Zoom</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Zoom Factor</span>
                    <span class="slider-value" id="z-val-display">10x</span>
                </div>
                <input type="range" id="z-slider" min="2" max="30" step="2" value="10" class="custom-slider">
            </div>
        </div>
    </div>

    <!-- Design status -->
    <div id="status-display" class="status-box status-safe">
        Status loading...
    </div>

    <!-- Live Equation Output -->
    <div class="equation-box" id="equation-display">
        Equations will load here...
    </div>

    <script>
        // Setup variables
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // Cache elements
        const btnCant = document.getElementById('btn-cant');
        const btnSimply = document.getElementById('btn-simply');
        const btnSteel = document.getElementById('btn-steel');
        const btnAlum = document.getElementById('btn-alum');
        const btnWood = document.getElementById('btn-wood');

        const pSlider = document.getElementById('p-slider');
        const lSlider = document.getElementById('l-slider');
        const hSlider = document.getElementById('h-slider');
        const zSlider = document.getElementById('z-slider');

        const lockBanner = document.getElementById('lock-banner');
        const statusDisplay = document.getElementById('status-display');
        const equationDisplay = document.getElementById('equation-display');

        // Material properties
        const materials = {{
            steel: {{ E: 200000, name: 'Structural Steel' }},
            alum: {{ G: 70000, E: 70000, name: 'Aluminum 6061-T6' }},
            wood: {{ E: 12000, name: 'Structural Timber' }}
        }};

        // State
        let state = {{
            support: 'cant',
            mat: 'steel',
            P: 10,
            L: 4.0,
            h: 200,
            zoom: 10
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vdef_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.support = sessionStorage.getItem('vdef_support') || 'cant';
            state.mat = sessionStorage.getItem('vdef_mat') || 'steel';
            state.P = parseFloat(sessionStorage.getItem('vdef_P') || '10');
            state.L = parseFloat(sessionStorage.getItem('vdef_L') || '4.0');
            state.h = parseFloat(sessionStorage.getItem('vdef_h') || '200');
            state.zoom = parseFloat(sessionStorage.getItem('vdef_zoom') || '10');
        }} else {{
            sessionStorage.setItem('vdef_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vdef_support', state.support);
            sessionStorage.setItem('vdef_mat', state.mat);
            sessionStorage.setItem('vdef_P', state.P);
            sessionStorage.setItem('vdef_L', state.L);
            sessionStorage.setItem('vdef_h', state.h);
            sessionStorage.setItem('vdef_zoom', state.zoom);
        }}

        // Support toggle
        btnCant.addEventListener('click', () => {{
            if (isLocked) return;
            state.support = 'cant';
            btnCant.classList.add('active');
            btnSimply.classList.remove('active');
            saveState();
            updatePlot();
        }});
        btnSimply.addEventListener('click', () => {{
            if (isLocked) return;
            state.support = 'simply';
            btnSimply.classList.add('active');
            btnCant.classList.remove('active');
            saveState();
            updatePlot();
        }});

        // Material Presets
        function setMaterial(mName) {{
            state.mat = mName;
            [btnSteel, btnAlum, btnWood].forEach(b => b.classList.remove('active'));
            if (mName === 'steel') btnSteel.classList.add('active');
            if (mName === 'alum') btnAlum.classList.add('active');
            if (mName === 'wood') btnWood.classList.add('active');
            saveState();
            updatePlot();
        }}
        btnSteel.addEventListener('click', () => {{ if (!isLocked) setMaterial('steel'); }});
        btnAlum.addEventListener('click', () => {{ if (!isLocked) setMaterial('alum'); }});
        btnWood.addEventListener('click', () => {{ if (!isLocked) setMaterial('wood'); }});

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            pSlider.disabled = true;
            lSlider.disabled = true;
            hSlider.disabled = true;
            zSlider.disabled = true;
            btnCant.disabled = true;
            btnSimply.disabled = true;
            btnSteel.disabled = true;
            btnAlum.disabled = true;
            btnWood.disabled = true;
        }}

        // Listeners
        pSlider.addEventListener('input', (e) => {{
            state.P = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            saveState();
            updatePlot();
        }});
        lSlider.addEventListener('input', (e) => {{
            state.L = parseFloat(e.target.value);
            document.getElementById('l-val-display').innerText = state.L.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});
        hSlider.addEventListener('input', (e) => {{
            state.h = parseFloat(e.target.value);
            document.getElementById('h-val-display').innerText = state.h.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});
        zSlider.addEventListener('input', (e) => {{
            state.zoom = parseFloat(e.target.value);
            document.getElementById('z-val-display').innerText = state.zoom.toFixed(0) + 'x';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            lSlider.value = state.L;
            document.getElementById('l-val-display').innerText = state.L.toFixed(1) + ' m';
            hSlider.value = state.h;
            document.getElementById('h-val-display').innerText = state.h.toFixed(0) + ' mm';
            zSlider.value = state.zoom;
            document.getElementById('z-val-display').innerText = state.zoom.toFixed(0) + 'x';

            if (state.support === 'cant') {{
                btnCant.classList.add('active');
                btnSimply.classList.remove('active');
            }} else {{
                btnSimply.classList.add('active');
                btnCant.classList.remove('active');
            }}
            setMaterial(state.mat);
        }}

        function updatePlot() {{
            let P = state.P;
            let L = state.L;
            let h = state.h;
            let zoom = state.zoom;
            let mat = materials[state.mat];
            let support = state.support;

            // Box beam spar sizing (Hollow box: width b = h/2 for standard proportions, thickness t = 5 mm)
            let b = h / 2;
            let t = 5;
            let bi = b - 2*t;
            let hi = h - 2*t;
            let Ix = (b * Math.pow(h, 3) - bi * Math.pow(hi, 3)) / 12; // mm4

            // Deflection calculation (max deflection in mm)
            // Cantilever tip: delta = P * L^3 / (3 * E * I)
            // Simply supported center: delta = P * L^3 / (48 * E * I)
            // Standard units: P in N (P * 1000), L in mm (L * 1000), E in MPa, I in mm4
            let P_N = P * 1000;
            let L_mm = L * 1000;
            let delta_max = 0;

            if (support === 'cant') {{
                delta_max = (P_N * Math.pow(L_mm, 3)) / (3 * mat.E * Ix);
            }} else {{
                delta_max = (P_N * Math.pow(L_mm, 3)) / (48 * mat.E * Ix);
            }}

            // Design Check: Allowable deflection limit = L / 150 (typical for bridge/wing visual limit)
            let delta_allow = L_mm / 150; 
            let isSafe = delta_max <= delta_allow;

            // Update status box
            if (isSafe) {{
                statusDisplay.className = 'status-box status-safe';
                statusDisplay.innerHTML = `<span>🟢</span> <b>Design Safe:</b> Deflection (δ_max = ${delta_max.toFixed(1)} mm) satisfies structural limit (δ_allow = L/150 = ${delta_allow.toFixed(1)} mm).`;
            }} else {{
                statusDisplay.className = 'status-box status-failed';
                statusDisplay.innerHTML = `<span>🔴</span> <b>EXCESSIVE DEFLECTION!</b> δ_max = ${delta_max.toFixed(1)} mm exceeds allowable limit of ${delta_allow.toFixed(1)} mm. Beam lacks stiffness.`;
            }}

            let traces = [];
            let annotations = [];

            // Draw graphical beam deflection curve
            // x: [-0.5, 6.5] m, y: [-1.2, 0.8] m
            let steps = 40;
            let beamX = [];
            let beamY = [];

            for (let i = 0; i <= steps; i++) {{
                let x_coord = (i / steps) * L; // 0 to L
                let d_local = 0;

                // Deflection curves based on x
                if (support === 'cant') {{
                    // Cantilever: d(x) = (P*x^2 / (6*E*I)) * (3L - x)
                    let x_mm = x_coord * 1000;
                    d_local = (P_N * x_mm * x_mm * (3 * L_mm - x_mm)) / (6 * mat.E * Ix); // mm
                }} else {{
                    // Simply supported center point load:
                    // for x <= L/2: d(x) = P*x*(3L^2 - 4x^2) / (48*E*I)
                    let x_mm = x_coord * 1000;
                    if (x_coord <= L/2) {{
                        d_local = (P_N * x_mm * (3 * L_mm * L_mm - 4 * x_mm * x_mm)) / (48 * mat.E * Ix);
                    }} else {{
                        let x_sym = (L - x_coord) * 1000;
                        d_local = (P_N * x_sym * (3 * L_mm * L_mm - 4 * x_sym * x_sym)) / (48 * mat.E * Ix);
                    }}
                }}

                // Scale for plotting: 100 mm deflection represents ~0.4 units vertically on plot
                let y_plot = - (d_local * zoom) / 1000; // negative downward deflection
                beamX.push(x_coord);
                beamY.push(y_plot);
            }}

            // Draw fixed wall or support points
            if (support === 'cant') {{
                // Wall at x = 0
                traces.push({{
                    x: [-0.15, 0, 0, -0.15],
                    y: [0.4, 0.4, -0.4, -0.4],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: '#64748b',
                    line: {{color: '#475569', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }} else {{
                // Pin support at x=0, Roller at x=L
                traces.push({{
                    x: [-0.15, 0, 0.15, -0.15],
                    y: [-0.2, 0, -0.2, -0.2],
                    mode: 'lines',
                    line: {{color: '#475569', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                let rollerY = beamY[beamY.length - 1];
                traces.push({{
                    x: [L - 0.15, L + 0.15],
                    y: [rollerY - 0.08, rollerY - 0.08],
                    mode: 'lines',
                    line: {{color: '#475569', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }}

            // Plot deflected beam centerline
            traces.push({{
                x: beamX,
                y: beamY,
                mode: 'lines',
                line: {{color: isSafe ? '#8b5cf6' : '#ef4444', width: 5.0}},
                name: 'Deflected Beam',
                hoverinfo: 'skip'
            }});

            // Draw original straight beam line
            traces.push({{
                x: [0, L],
                y: [0, 0],
                mode: 'lines',
                line: {{color: '#cbd5e1', width: 1.5, dash: 'dash'}},
                name: 'Original Shape',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw Load Arrow
            if (support === 'cant') {{
                // Tip load arrow at x = L pointing down to tip deflection y = beamY[last]
                let tipY = beamY[beamY.length - 1];
                annotations.push({{
                    ax: L, ay: tipY + 0.5,
                    x: L, y: tipY - 0.02,
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 0.8,
                    arrowwidth: 3.5,
                    arrowcolor: '#ef4444',
                    text: `P = ${P} kN`,
                    font: {{family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold'}},
                    yshift: 10
                }});
            }} else {{
                // Center load arrow at x = L/2 pointing down to center deflection
                let midY = beamY[Math.floor(steps/2)];
                annotations.push({{
                    ax: L/2, ay: midY + 0.5,
                    x: L/2, y: midY - 0.02,
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 0.8,
                    arrowwidth: 3.5,
                    arrowcolor: '#ef4444',
                    text: `P = ${P} kN`,
                    font: {{family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold'}},
                    yshift: 10
                }});
            }}

            // Deflection arrow line at max sag location
            let max_idx = support === 'cant' ? steps : Math.floor(steps / 2);
            let maxX = beamX[max_idx];
            let maxY = beamY[max_idx];

            traces.push({{
                x: [maxX, maxX],
                y: [0, maxY],
                mode: 'lines',
                line: {{color: '#3b82f6', width: 2, dash: 'dot'}},
                showlegend: false,
                hoverinfo: 'skip'
            }});

            annotations.push({{
                x: maxX, y: maxY/2,
                text: `δ_max = ${delta_max.toFixed(1)} mm`,
                font: {{family: 'Outfit', size: 9, color: '#3b82f6', weight: 'bold'}},
                showarrow: false,
                xanchor: 'right',
                xshift: -5
            }});

            const layout = {{
                xaxis: {{
                    range: [-0.4, 6.5],
                    showgrid: true,
                    gridcolor: 'rgba(128, 128, 128, 0.05)',
                    zeroline: false,
                    tickfont: {{family: 'Outfit', size: 9, color: '#64748b'}},
                    title: 'Beam Position, x (m)',
                    titlefont: {{family: 'Outfit', size: 10, color: '#475569'}},
                    fixedrange: true
                }},
                yaxis: {{
                    range: [-1.4, 0.8],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    scaleanchor: 'x',
                    scaleratio: 1,
                    fixedrange: true
                }},
                margin: {{l: 10, r: 10, t: 15, b: 35}},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                annotations: annotations
            }};

            Plotly.react('plotly-chart', traces, layout);

            // Update equations box
            equationDisplay.innerHTML = `
                <b>Deflection Analysis (Appendix E Formulas):</b><br>
                • Spar Inertia, <b>I_x</b> = <b>${(Ix/1e6).toFixed(2)} x 10⁶ mm⁴</b> (hollow box: ${b}x${h}x${t} mm)<br>
                • Elastic Modulus, <b>E</b> = <b>${mat.E} MPa</b> (${mat.name})<br>
                ${support === 'cant' ? 
                    `• Cantilever tip deflection: <b>δ_max = PL³ / 3EI</b><br>
                     &nbsp;&nbsp;δ_max = (${P_N}·${L_mm}³) / (3·${mat.E}·${Ix.toFixed(0)}) = <b>${delta_max.toFixed(2)} mm</b>` : 
                    `• Simply supported center deflection: <b>δ_max = PL³ / 48EI</b><br>
                     &nbsp;&nbsp;δ_max = (${P_N}·${L_mm}³) / (48·${mat.E}·${Ix.toFixed(0)}) = <b>${delta_max.toFixed(2)} mm</b>`
                }<br>
                • Allowable deflection limit: <b>δ_allow = L/150</b> = <b>${delta_allow.toFixed(1)} mm</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_beam_deflection():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #8b5cf6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 4 • Lesson 33</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Stresses & Deformations due to Bending</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit4"]
    topic_name = "Lesson 33: Stresses and Deformations due to Bending"
    objectives = unit.get("objectives", {}).get(topic_name, [])
    if objectives:
        obj_list_html = "".join(f'<li style="margin-bottom: 8px;">{obj}</li>' for obj in objectives)
        st.markdown(f"""
        <div class="objectives-card">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 1.2rem;">🎯</span>
                <span style="font-weight: 700; font-size: 1.05rem; color: {unit['accent_color']}; text-transform: uppercase; letter-spacing: 0.5px;">Learning Objectives</span>
            </div>
            <ul>
                {obj_list_html}
            </ul>
        </div>
        """, unsafe_allow_html=True)

    # Sidecar highlight style
    st.markdown("""
    <style>
    div[data-testid="column"]:has(.sidecar-anchor),
    div[data-testid="stColumn"]:has(.sidecar-anchor) {
        background-color: rgba(139, 92, 246, 0.04) !important;
        border: 2px solid #8b5cf6 !important;
        border-radius: 16px !important;
        padding: 24px !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
    }
    </style>
    """, unsafe_allow_html=True)

    # State init
    if "vdef_phase" not in st.session_state:
        st.session_state.vdef_phase = "instructions"
    if "vdef_sliders_locked" not in st.session_state:
        st.session_state.vdef_sliders_locked = False
    if "vdef_reset_counter" not in st.session_state:
        st.session_state.vdef_reset_counter = 0
    if "vdef_answers" not in st.session_state:
        st.session_state.vdef_answers = {}

    def reset_simulator():
        st.session_state.vdef_phase = "instructions"
        st.session_state.vdef_answers = {}
        st.session_state.vdef_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vdef_phase == "poe_predict":
        st.session_state.vdef_sliders_locked = True
    else:
        st.session_state.vdef_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Elastic Deflection Simulator")
        locked_js = "true" if st.session_state.vdef_sliders_locked else "false"
        reset_counter = st.session_state.vdef_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#8b5cf6; font-weight:700;">{phase_titles[st.session_state.vdef_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vdef_phase == "instructions":
            st.markdown(r"""
            **Bending Deflections:**
            When lateral loads are applied to a beam, it undergoes bending. This creates vertical elastic deflection ($\delta$).
            
            **Appendix E Formulas:**
            * **Cantilever (Tip Load P):** $\delta_{\text{max}} = \frac{P L^3}{3 E I}$
            * **Simply Supported (Center Load P):** $\delta_{\text{max}} = \frac{P L^3}{48 E I}$
            
            Observe how the deflection shape and maximum deflection change dynamically as you vary the support type, length, load, and material stiffness.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vdef_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vdef_phase == "guided_question":
            st.markdown(r"""
            **Guided Scenario:**
            1. Select **Cantilever** (Wing Model) preset.
            2. Select **Aluminum**preset.
            3. Set **Force (P)** to `10 kN`.
            4. Set **Span (L)** to `4.0 m`.
            5. Set **Section Height (h)** to `200 mm`. (This gives outer width $b = 100\text{ mm}$, thickness $t = 5\text{ mm}$).
            
            Observe the calculated values in the equations box.
            
            **Question:**
            What is the moment of inertia ($I_x$) and the maximum tip deflection ($\delta_{max}$)?
            """)
            
            ans = st.radio(
                "Select the correct results:",
                options=[
                    "I_x = 48.6 * 10^6 mm⁴, δ_max = 47.6 mm",
                    "I_x = 24.3 * 10^6 mm⁴, δ_max = 95.2 mm",
                    "I_x = 48.6 * 10^6 mm⁴, δ_max = 16.7 mm",
                    "I_x = 97.2 * 10^6 mm⁴, δ_max = 23.8 mm"
                ],
                key="vdef_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "48.6 * 10^6" in ans and "47.6 mm" in ans:
                    st.success(r"Correct! $I_x = \frac{100 \cdot 200^3 - 90 \cdot 190^3}{12} \approx 48.64 \times 10^6\text{ mm}^4$. tip deflection $\delta_{max} = \frac{10,000 \cdot (4000)^3}{3 \cdot 70,000 \cdot 48.64 \times 10^6} \approx 640 \times 10^9 / 10.21 \times 10^{10} \approx 47.6\text{ mm}$.")
                else:
                    st.error(r"Incorrect. Let's look at the equations display: $I_x \approx 4.86 \times 10^7\text{ mm}^4$ (which is $48.6 \times 10^6\text{ mm}^4$) and $\delta_{max} \approx 47.6\text{ mm}$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vdef_phase = "poe_predict"
                st.session_state.vdef_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vdef_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Specimen Controls Locked!):**
            
            **Scenario:**
            We keep the geometry and loading constant:
            * **Force (P)**: `10 kN`
            * **Span (L)**: `4.0 m`
            * **Height (h)**: `200 mm`
            * **Case**: **Cantilever Tip Load**
            
            **Question:**
            If we switch the material from **Aluminum** ($E = 70\text{ GPa}$) to **Structural Steel** ($E = 200\text{ GPa}$), what happens to the maximum deflection?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Deflection is reduced by a factor of ~2.86 (it drops to ~16.7 mm)",
                    "Deflection is doubled (it increases to ~95.2 mm)",
                    "Deflection is reduced by half",
                    "Deflection remains exactly the same"
                ],
                key="vdef_poe_p_radio"
            )
            st.session_state.vdef_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vdef_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vdef_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Select **Aluminum** preset, verify the deflection is `47.6 mm`.
            2. Toggle the material to **Steel**, and observe the new deflection value.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vdef_answers.get("poe", "Deflection is reduced by a factor of ~2.86 (it drops to ~16.7 mm)")
            options_list = [
                "Deflection is reduced by a factor of ~2.86 (it drops to ~16.7 mm)",
                "Deflection is doubled (it increases to ~95.2 mm)",
                "Deflection is reduced by half",
                "Deflection remains exactly the same"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vdef_poe_o_radio"
            )
            st.session_state.vdef_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vdef_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vdef_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vdef_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vdef_answers.get("poe") == "Deflection is reduced by a factor of ~2.86 (it drops to ~16.7 mm)":
                st.success("🎉 **Correct!** Excellent stiffness analysis.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics details below.")

            st.markdown(r"""
            ### Explanation:
            1. **Elastic Deflection Dependency**:
               From the cantilever tip deflection equation:
               $$\delta_{\text{max}} = \frac{P L^3}{3 E I}$$
               We see that deflection is inversely proportional to the Modulus of Elasticity ($E$):
               $$\delta_{\text{max}} \propto \frac{1}{E}$$
               
            2. **Material Stiffness Ratio**:
               Steel has a modulus $E_{\text{steel}} = 200\text{ GPa}$, while Aluminum has $E_{\text{aluminum}} = 70\text{ GPa}$. The ratio is:
               $$\frac{E_{\text{steel}}}{E_{\text{aluminum}}} = \frac{200}{70} \approx 2.86$$
               
            3. **Comparing Deflections**:
               * Aluminum: $\delta_{\text{max}} \approx 47.6\text{ mm}$
               * Steel: $\delta_{\text{max}} \approx \frac{47.6}{2.86} \approx 16.7\text{ mm}$
               
            *Conclusion:* Steel is roughly 2.86 times stiffer than aluminum. Consequently, switching from aluminum to steel divides the deflection of the wing tip by exactly 2.86.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

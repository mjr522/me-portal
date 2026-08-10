import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Angle of Twist Sandbox
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
            color: #f97316;
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
            background: #f97316;
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
            border-color: #f97316;
            background-color: #f97316;
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
            border-left: 4px solid #f97316;
            line-height: 1.4;
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Material presets (defines G) -->
    <div class="btn-group">
        <button id="btn-steel" class="btn-choice active">Steel (G = 80 GPa)</button>
        <button id="btn-alum" class="btn-choice">Aluminum (G = 26 GPa)</button>
        <button id="btn-tita" class="btn-choice">Titanium (G = 44 GPa)</button>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 280px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Torque T -->
        <div class="control-box">
            <div class="control-title">1. Applied Torque (T)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Torque, T</span>
                    <span class="slider-value" id="t-val-display">500 N-m</span>
                </div>
                <input type="range" id="t-slider" min="100" max="2000" step="100" value="500" class="custom-slider">
            </div>
        </div>

        <!-- Length L -->
        <div class="control-box">
            <div class="control-title">2. Length (L)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Length, L</span>
                    <span class="slider-value" id="l-val-display">2.0 m</span>
                </div>
                <input type="range" id="l-slider" min="0.5" max="3.0" step="0.5" value="2.0" class="custom-slider">
            </div>
        </div>

        <!-- Diameter D -->
        <div class="control-box">
            <div class="control-title">3. Shaft Dia. (D)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Diameter, D</span>
                    <span class="slider-value" id="d-val-display">40 mm</span>
                </div>
                <input type="range" id="d-slider" min="20" max="80" step="4" value="40" class="custom-slider">
            </div>
        </div>

        <!-- Visual Twist Zoom -->
        <div class="control-box">
            <div class="control-title">4. Twist Zoom</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Zoom Factor</span>
                    <span class="slider-value" id="z-val-display">50x</span>
                </div>
                <input type="range" id="z-slider" min="10" max="200" step="10" value="50" class="custom-slider">
            </div>
        </div>
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
        const btnSteel = document.getElementById('btn-steel');
        const btnAlum = document.getElementById('btn-alum');
        const btnTita = document.getElementById('btn-tita');
        const tSlider = document.getElementById('t-slider');
        const lSlider = document.getElementById('l-slider');
        const dSlider = document.getElementById('d-slider');
        const zSlider = document.getElementById('z-slider');
        const lockBanner = document.getElementById('lock-banner');
        const equationDisplay = document.getElementById('equation-display');

        // Material properties G in GPa (converted to MPa in calculations)
        const materials = {{
            steel: {{ G: 80000, name: 'Structural Steel' }},
            alum: {{ G: 26000, name: 'Aluminum Alloy' }},
            tita: {{ G: 44000, name: 'Titanium Alloy' }}
        }};

        // State
        let state = {{
            mat: 'steel',
            T: 500,
            L: 2.0,
            D: 40,
            zoom: 50
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vtwist_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.mat = sessionStorage.getItem('vtwist_mat') || 'steel';
            state.T = parseFloat(sessionStorage.getItem('vtwist_T') || '500');
            state.L = parseFloat(sessionStorage.getItem('vtwist_L') || '2.0');
            state.D = parseFloat(sessionStorage.getItem('vtwist_D') || '40');
            state.zoom = parseFloat(sessionStorage.getItem('vtwist_zoom') || '50');
        }} else {{
            sessionStorage.setItem('vtwist_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vtwist_mat', state.mat);
            sessionStorage.setItem('vtwist_T', state.T);
            sessionStorage.setItem('vtwist_L', state.L);
            sessionStorage.setItem('vtwist_D', state.D);
            sessionStorage.setItem('vtwist_zoom', state.zoom);
        }}

        // Material Presets
        function setMaterial(mName) {{
            state.mat = mName;
            [btnSteel, btnAlum, btnTita].forEach(b => b.classList.remove('active'));
            if (mName === 'steel') btnSteel.classList.add('active');
            if (mName === 'alum') btnAlum.classList.add('active');
            if (mName === 'tita') btnTita.classList.add('active');
            saveState();
            updatePlot();
        }}

        btnSteel.addEventListener('click', () => {{ if (!isLocked) setMaterial('steel'); }});
        btnAlum.addEventListener('click', () => {{ if (!isLocked) setMaterial('alum'); }});
        btnTita.addEventListener('click', () => {{ if (!isLocked) setMaterial('tita'); }});

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            tSlider.disabled = true;
            lSlider.disabled = true;
            dSlider.disabled = true;
            zSlider.disabled = true;
            btnSteel.disabled = true;
            btnAlum.disabled = true;
            btnTita.disabled = true;
        }}

        // Listeners
        tSlider.addEventListener('input', (e) => {{
            state.T = parseFloat(e.target.value);
            document.getElementById('t-val-display').innerText = state.T.toFixed(0) + ' N-m';
            saveState();
            updatePlot();
        }});
        lSlider.addEventListener('input', (e) => {{
            state.L = parseFloat(e.target.value);
            document.getElementById('l-val-display').innerText = state.L.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});
        dSlider.addEventListener('input', (e) => {{
            state.D = parseFloat(e.target.value);
            document.getElementById('d-val-display').innerText = state.D.toFixed(0) + ' mm';
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
            tSlider.value = state.T;
            document.getElementById('t-val-display').innerText = state.T.toFixed(0) + ' N-m';
            lSlider.value = state.L;
            document.getElementById('l-val-display').innerText = state.L.toFixed(1) + ' m';
            dSlider.value = state.D;
            document.getElementById('d-val-display').innerText = state.D.toFixed(0) + ' mm';
            zSlider.value = state.zoom;
            document.getElementById('z-val-display').innerText = state.zoom.toFixed(0) + 'x';
            setMaterial(state.mat);
        }}

        function updatePlot() {{
            let T = state.T;
            let L = state.L;
            let D = state.D;
            let zoom = state.zoom;
            let mat = materials[state.mat];

            // Math calculations
            // J = pi * D^4 / 32
            let J = Math.PI * Math.pow(D, 4) / 32; // mm4
            let T_nmm = T * 1000; // N-mm
            let L_mm = L * 1000; // mm
            let phi = (T_nmm * L_mm) / (J * mat.G); // radians
            let theta = phi * 180 / Math.PI; // degrees

            let traces = [];
            let annotations = [];

            // Visual stretch & twist variables
            let L_plot = 0.5 + 1.8 * (L / 3.0);
            let R_plot = 0.25 + 0.3 * (D / 80);
            let endX = 0.2 + L_plot;

            // ------------------ SUBPLOT 1: HELICAL TWIST CYLINDER (Left, x: [0, 0.48]) ------------------
            // Draw wall on left at x = 0.2
            traces.push({{
                x: [0.1, 0.2, 0.2, 0.1],
                y: [1.3, 1.3, -1.3, -1.3],
                mode: 'lines',
                fill: 'toself',
                fillcolor: '#64748b',
                line: {{color: '#475569', width: 2.5}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Cylinder upper and lower bounds
            traces.push({{
                x: [0.2, endX],
                y: [R_plot, R_plot],
                mode: 'lines',
                line: {{color: '#94a3b8', width: 2}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});
            traces.push({{
                x: [0.2, endX],
                y: [-R_plot, -R_plot],
                mode: 'lines',
                line: {{color: '#94a3b8', width: 2}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw twisted helical line along the cylinder surface
            // We draw 3 lines starting at different initial angles (0, 120, 240 degrees)
            let startAngles = [0, 120, 240];
            let twist_visual_rad = phi * zoom; // scale twist for visual inspection

            startAngles.forEach(alpha0 => {{
                let helixX = [];
                let helixY = [];
                let steps = 40;
                for (let i = 0; i <= steps; i++) {{
                    let f = i / steps;
                    let x_val = 0.2 + f * L_plot;
                    let th = alpha0 * Math.PI / 180 + f * twist_visual_rad;
                    let y_val = R_plot * Math.sin(th);
                    let z_val = R_plot * Math.cos(th); // depth check: draw solid if in front
                    
                    helixX.push(x_val);
                    helixY.push(y_val);
                }}

                traces.push({{
                    x: helixX,
                    y: helixY,
                    mode: 'lines',
                    line: {{color: '#f97316', width: 2.5}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }});

            // Draw right end face ellipse at x = endX
            let faceX = [];
            let faceY = [];
            for (let th = 0; th <= 365; th += 10) {{
                let th_rad = th * Math.PI / 180;
                faceX.push(endX + 0.04 * Math.cos(th_rad)); // thin visual projection
                faceY.push(R_plot * Math.sin(th_rad));
            }}
            traces.push({{
                x: faceX, y: faceY,
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(249, 115, 22, 0.05)',
                line: {{color: '#475569', width: 1.5}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Torque arrows at end
            annotations.push({{
                x: endX + 0.3, y: 0,
                xref: 'x1', yref: 'y1',
                text: `T`,
                font: {{family: 'Outfit', size: 9, color: '#1e293b', weight: 'bold'}},
                showarrow: false
            }});

            // ------------------ SUBPLOT 2: ROTATING END FACE (Right, x: [0.55, 1.0]) ------------------
            // Draw a flat circular cross section at right
            let endFaceR = 1.0;
            let cx = [], cy = [];
            for (let th = 0; th <= 365; th += 5) {{
                let rad = th * Math.PI / 180;
                cx.push(endFaceR * Math.cos(rad));
                cy.push(endFaceR * Math.sin(rad));
            }}
            traces.push({{
                x: cx, y: cy,
                mode: 'lines',
                line: {{color: '#475569', width: 2.5}},
                fill: 'toself',
                fillcolor: 'rgba(249, 115, 22, 0.03)',
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw original vertical reference line (un-twisted radius at 90 degrees)
            traces.push({{
                x: [0, 0],
                y: [0, endFaceR],
                mode: 'lines',
                line: {{color: '#94a3b8', width: 1.5, dash: 'dash'}},
                name: 'Original Position',
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw twisted radial line (rotated clockwise/counter-clockwise by theta)
            // Let's say twist rotates counter-clockwise by theta (so from 90 degrees we add theta)
            let final_angle_rad = (90 + theta) * Math.PI / 180;
            let tx = endFaceR * Math.cos(final_angle_rad);
            let ty = endFaceR * Math.sin(final_angle_rad);

            traces.push({{
                x: [0, tx],
                y: [0, ty],
                mode: 'lines+markers',
                line: {{color: '#f97316', width: 3.5}},
                marker: {{size: 6, color: '#f97316'}},
                name: 'Twisted Radial Line',
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw arc showing twist angle
            let arcThetaX = [];
            let arcThetaY = [];
            let startAng = 90;
            let endAng = 90 + theta;
            for (let a = startAng; a <= endAng; a += (theta / 10)) {{
                let a_rad = a * Math.PI / 180;
                arcThetaX.push(0.4 * Math.cos(a_rad));
                arcThetaY.push(0.4 * Math.sin(a_rad));
            }}
            traces.push({{
                x: arcThetaX, y: arcThetaY,
                mode: 'lines',
                line: {{color: '#ef4444', width: 2}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            annotations.push({{
                x: 0.5 * Math.cos((90 + theta/2) * Math.PI / 180),
                y: 0.5 * Math.sin((90 + theta/2) * Math.PI / 180),
                xref: 'x2', yref: 'y2',
                text: `θ = ${theta.toFixed(2)}°`,
                font: {{family: 'Outfit', size: 10, color: '#ef4444', weight: 'bold'}},
                showarrow: false
            }});

            annotations.push({{
                x: 0, y: -endFaceR - 0.3,
                xref: 'x2', yref: 'y2',
                text: 'Free End Face View',
                font: {{family: 'Outfit', size: 9, color: '#64748b', weight: 'bold'}},
                showarrow: false
            }});

            const layout = {{
                grid: {{rows: 1, columns: 2, pattern: 'independent'}},
                xaxis: {{
                    domain: [0, 0.48],
                    range: [-0.2, 3.2],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    domain: [0, 1],
                    range: [-1.4, 1.4],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                xaxis2: {{
                    domain: [0.55, 1.0],
                    range: [-1.5, 1.5],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    scaleanchor: 'y2',
                    scaleratio: 1,
                    fixedrange: true
                }},
                yaxis2: {{
                    domain: [0, 1],
                    range: [-1.5, 1.5],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                margin: {{l: 10, r: 10, t: 15, b: 15}},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                annotations: annotations
            }};

            Plotly.react('plotly-chart', traces, layout);

            // Update mathematical equations box
            equationDisplay.innerHTML = `
                <b>Torsional Deformation (Angle of Twist):</b><br>
                • Polar Inertia, <b>J = π·D⁴ / 32</b> = <b>${J.toExponential(4)} mm⁴</b><br>
                • Shear Modulus, <b>G</b> = <b>${mat.G} MPa</b> (${mat.name})<br>
                • Twist (radians): <b>φ = TL / JG</b> = (${T_nmm}·${L_mm}) / (J·${mat.G}) = <b>${phi.toFixed(5)} rad</b><br>
                • Twist (degrees): <b>θ = φ · (180/π)</b> = <b>${theta.toFixed(3)}°</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_angle_of_twist():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #f97316; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 3 • Lesson 27</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Angle of Twist in Torsion</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit3"]
    topic_name = "Lesson 27: Angle of Twist; Solving Torsion Problems"
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
        background-color: rgba(249, 115, 22, 0.04) !important;
        border: 2px solid #f97316 !important;
        border-radius: 16px !important;
        padding: 24px !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
    }
    </style>
    """, unsafe_allow_html=True)

    # State init
    if "vtwist_phase" not in st.session_state:
        st.session_state.vtwist_phase = "instructions"
    if "vtwist_sliders_locked" not in st.session_state:
        st.session_state.vtwist_sliders_locked = False
    if "vtwist_reset_counter" not in st.session_state:
        st.session_state.vtwist_reset_counter = 0
    if "vtwist_answers" not in st.session_state:
        st.session_state.vtwist_answers = {}

    def reset_simulator():
        st.session_state.vtwist_phase = "instructions"
        st.session_state.vtwist_answers = {}
        st.session_state.vtwist_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vtwist_phase == "poe_predict":
        st.session_state.vtwist_sliders_locked = True
    else:
        st.session_state.vtwist_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Torsional Deformation Simulator")
        locked_js = "true" if st.session_state.vtwist_sliders_locked else "false"
        reset_counter = st.session_state.vtwist_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#f97316; font-weight:700;">{phase_titles[st.session_state.vtwist_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vtwist_phase == "instructions":
            st.markdown(r"""
            **Angle of Twist (φ / θ):**
            When torque is applied to a circular shaft, the shaft deforms by twisting. The angle of twist ($\phi$ in radians) measures this angular deflection:
            $$\phi = \frac{T \cdot L}{J \cdot G}$$
            Where $L$ is the shaft length, $J$ is the polar moment of inertia, and $G$ is the material's Shear Modulus.
            
            Observe how the grid lines on the cylinder wrap helically as torque increases!
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vtwist_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vtwist_phase == "guided_question":
            st.markdown(r"""
            **Guided Scenario:**
            1. Select **Steel** ($G = 80\text{ GPa}$).
            2. Set **Torque (T)** to `800 N-m`.
            3. Set **Length (L)** to `2.0 m`.
            4. Set **Diameter (D)** to `40 mm`.
            
            Look at the equations box to verify the calculated parameters.
            
            **Question:**
            What is the polar moment of inertia ($J$) and the angle of twist ($\theta$ in degrees) for this steel shaft?
            """)
            
            ans = st.radio(
                "Select the correct calculations:",
                options=[
                    "J = 2.51 * 10^5 mm⁴, θ = 0.456°",
                    "J = 2.51 * 10^5 mm⁴, θ = 0.912°",
                    "J = 1.26 * 10^5 mm⁴, θ = 0.456°",
                    "J = 2.51 * 10^5 mm⁴, θ = 1.824°"
                ],
                key="vtwist_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "2.51 * 10^5" in ans and "0.456" in ans:
                    st.success(r"Correct! $J = \pi \cdot (40)^4 / 32 \approx 251,327\text{ mm}^4$. $\phi = (800,000 \cdot 2000) / (251,327 \cdot 80,000) \approx 0.007958\text{ rad}$. In degrees: $\theta = 0.007958 \cdot 180 / \pi \approx 0.456^\circ$.")
                else:
                    st.error(r"Incorrect. Double check the values in the equations box: $J \approx 2.51 \times 10^5\text{ mm}^4$ and $\theta \approx 0.456^\circ$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vtwist_phase = "poe_predict"
                st.session_state.vtwist_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vtwist_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Specimen Controls Locked!):**
            
            **Scenario:**
            We keep the loading and material constant:
            * **Torque (T)**: `500 N-m`
            * **Length (L)**: `1.5 m`
            * **Material**: **Steel** ($G = 80\text{ GPa}$)
            
            **Question:**
            If we double the diameter of the shaft from **D = 20 mm** to **D = 40 mm**, how does the resulting angle of twist (θ) change?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "θ decreases by a factor of 16 (divided by 16)",
                    "θ decreases by half (divided by 2)",
                    "θ decreases by a factor of 4 (divided by 4)",
                    "θ decreases by a factor of 8 (divided by 8)"
                ],
                key="vtwist_poe_p_radio"
            )
            st.session_state.vtwist_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vtwist_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vtwist_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Select **Steel** preset.
            2. Set **Torque T** to `500 N-m` and **Length L** to `1.5 m`.
            3. Set **Diameter D** to `20 mm` and write down the value of θ.
            4. Double **Diameter D** to `40 mm` and observe the new value of θ.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vtwist_answers.get("poe", "θ decreases by a factor of 16 (divided by 16)")
            options_list = [
                "θ decreases by a factor of 16 (divided by 16)",
                "θ decreases by half (divided by 2)",
                "θ decreases by a factor of 4 (divided by 4)",
                "θ decreases by a factor of 8 (divided by 8)"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vtwist_poe_o_radio"
            )
            st.session_state.vtwist_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vtwist_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vtwist_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vtwist_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vtwist_answers.get("poe") == "θ decreases by a factor of 16 (divided by 16)":
                st.success("🎉 **Correct!** Excellent work.")
            else:
                st.warning("⚠️ **Incorrect.** Review the calculations and mechanics details below.")

            st.markdown(r"""
            ### Explanation:
            1. **Diameter and Polar Inertia**:
               The polar moment of inertia ($J$) of a circular shaft scales with the **fourth power** of its diameter ($D^4$):
               $$J = \frac{\pi D^4}{32}$$
               Doubling the diameter from 20 mm to 40 mm increases $J$ by:
               $$2^4 = 16\text{ times}$$
               Specifically:
               * At $D = 20\text{ mm}$: $J \approx 1.57 \times 10^4\text{ mm}^4$
               * At $D = 40\text{ mm}$: $J \approx 2.51 \times 10^5\text{ mm}^4$ (exactly 16 times larger!)
               
            2. **Angle of Twist**:
               Since twist angle is inversely proportional to $J$ ($\phi = TL/JG$):
               $$\phi \propto \frac{1}{J}$$
               Increasing $J$ by 16 times divides the angle of twist by exactly 16:
               * At $D = 20\text{ mm}$: $\theta \approx 8.52^\circ$
               * At $D = 40\text{ mm}$: $\theta \approx 0.53^\circ$ ($8.52^\circ / 16 \approx 0.53^\circ$)
            
            *Conclusion:* Sizing shaft diameter is the most powerful design lever for torsional stiffness. Doubling diameter decreases angular deflection to just 6.25% of its original value!
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

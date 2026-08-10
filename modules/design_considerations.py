import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Design Considerations Sandbox
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
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 10px;
        }}
        .control-box {{
            background: rgba(255,255,255,0.85);
            border: 1px solid rgba(128, 128, 128, 0.15);
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        }}
        .control-title {{
            font-size: 0.8rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }}
        .slider-container {{
            margin-bottom: 8px;
        }}
        .slider-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2px;
        }}
        .slider-title {{
            font-size: 0.8rem;
            color: #475569;
        }}
        .slider-value {{
            font-size: 0.8rem;
            font-weight: 600;
            color: #f97316;
        }}
        .custom-slider {{
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #e2e8f0;
            outline: none;
        }}
        .custom-slider::-webkit-slider-thumb {{
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
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
            padding: 6px 10px;
            border: 1.5px solid #cbd5e1;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Outfit', sans-serif;
            font-weight: 500;
            font-size: 0.82rem;
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
            border-left: 4px solid #cbd5e1;
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
        .status-warning {{
            background-color: #fffbeb;
            border: 1.5px solid #fef3c7;
            color: #d97706;
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

    <!-- Material presets -->
    <div class="btn-group">
        <button id="btn-steel" class="btn-choice active">Steel (Sy = 250 MPa)</button>
        <button id="btn-alum" class="btn-choice">Aluminum (Sy = 150 MPa)</button>
        <button id="btn-tita" class="btn-choice">Titanium (Sy = 800 MPa)</button>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 300px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Load P -->
        <div class="control-box">
            <div class="control-title">1. Weight Load (P)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Load, P</span>
                    <span class="slider-value" id="p-val-display">150 kN</span>
                </div>
                <input type="range" id="p-slider" min="50" max="300" step="10" value="150" class="custom-slider">
            </div>
        </div>

        <!-- Design Factor of Safety -->
        <div class="control-box">
            <div class="control-title">2. Design F.S.</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Target F.S.</span>
                    <span class="slider-value" id="fs-val-display">2.0</span>
                </div>
                <input type="range" id="fs-slider" min="1.2" max="3.5" step="0.1" value="2.0" class="custom-slider">
            </div>
        </div>

        <!-- Sized Diameter -->
        <div class="control-box">
            <div class="control-title">3. Rod Diameter (d)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Sized d</span>
                    <span class="slider-value" id="d-val-display">30 mm</span>
                </div>
                <input type="range" id="d-slider" min="10" max="60" step="1" value="30" class="custom-slider">
            </div>
        </div>
    </div>

    <!-- Status Output -->
    <div id="status-display" class="status-box status-safe">
        Status loading...
    </div>

    <!-- Live Equation Output -->
    <div class="equation-box" id="equation-display">
        Equations loading...
    </div>

    <script>
        // Setup variables
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // Cache elements
        const btnSteel = document.getElementById('btn-steel');
        const btnAlum = document.getElementById('btn-alum');
        const btnTita = document.getElementById('btn-tita');
        const pSlider = document.getElementById('p-slider');
        const fsSlider = document.getElementById('fs-slider');
        const dSlider = document.getElementById('d-slider');
        const lockBanner = document.getElementById('lock-banner');
        const statusDisplay = document.getElementById('status-display');
        const equationDisplay = document.getElementById('equation-display');

        // Material Presets
        const materials = {{
            steel: {{ Sy: 250, name: 'Structural Steel' }},
            alum: {{ Sy: 150, name: 'Aluminum Alloy' }},
            tita: {{ Sy: 800, name: 'Titanium Alloy' }}
        }};

        // State
        let state = {{
            mat: 'steel',
            P: 150,
            FS: 2.0,
            d: 30
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vdes_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.mat = sessionStorage.getItem('vdes_mat') || 'steel';
            state.P = parseFloat(sessionStorage.getItem('vdes_P') || '150');
            state.FS = parseFloat(sessionStorage.getItem('vdes_FS') || '2.0');
            state.d = parseFloat(sessionStorage.getItem('vdes_d') || '30');
        }} else {{
            sessionStorage.setItem('vdes_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vdes_mat', state.mat);
            sessionStorage.setItem('vdes_P', state.P);
            sessionStorage.setItem('vdes_FS', state.FS);
            sessionStorage.setItem('vdes_d', state.d);
        }}

        // Material toggles
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
            pSlider.disabled = true;
            fsSlider.disabled = true;
            dSlider.disabled = true;
            btnSteel.disabled = true;
            btnAlum.disabled = true;
            btnTita.disabled = true;
        }}

        // Listeners
        pSlider.addEventListener('input', (e) => {{
            state.P = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            saveState();
            updatePlot();
        }});
        fsSlider.addEventListener('input', (e) => {{
            state.FS = parseFloat(e.target.value);
            document.getElementById('fs-val-display').innerText = state.FS.toFixed(1);
            saveState();
            updatePlot();
        }});
        dSlider.addEventListener('input', (e) => {{
            state.d = parseFloat(e.target.value);
            document.getElementById('d-val-display').innerText = state.d.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            fsSlider.value = state.FS;
            document.getElementById('fs-val-display').innerText = state.FS.toFixed(1);
            dSlider.value = state.d;
            document.getElementById('d-val-display').innerText = state.d.toFixed(0) + ' mm';
            setMaterial(state.mat);
        }}

        function updatePlot() {{
            let P = state.P;
            let targetFS = state.FS;
            let d = state.d;
            let mat = materials[state.mat];

            // Math Sizing
            let A = Math.PI * d * d / 4; // mm2
            let stress = (P * 1000) / A; // MPa
            let allowableStress = mat.Sy / targetFS; // MPa
            let actualFS = mat.Sy / stress; // actual safety factor achieved

            // Determine status
            let status = 'safe';
            if (stress > mat.Sy) {{
                status = 'failed';
            }} else if (stress > allowableStress) {{
                status = 'warning';
            }}

            // Render status box
            if (status === 'safe') {{
                statusDisplay.className = 'status-box status-safe';
                statusDisplay.innerHTML = `<span>🟢</span> <b>Safe Design:</b> Stress is within allowable limits. (Actual F.S. = ${actualFS.toFixed(2)} ≥ Target F.S. = ${targetFS.toFixed(1)})`;
                equationDisplay.style.borderLeftColor = '#15803d';
            }} else if (status === 'warning') {{
                statusDisplay.className = 'status-box status-warning';
                statusDisplay.innerHTML = `<span>🟡</span> <b>Marginal Design:</b> Safe from yield, but fails safety factor target! (Actual F.S. = ${actualFS.toFixed(2)} &lt; Target F.S. = ${targetFS.toFixed(1)})`;
                equationDisplay.style.borderLeftColor = '#d97706';
            }} else {{
                statusDisplay.className = 'status-box status-failed';
                statusDisplay.innerHTML = `<span>🔴</span> <b>STRUCTURAL COLLAPSE!</b> Actual stress exceeds material strength. (Actual F.S. = ${actualFS.toFixed(2)} &lt; 1.0)`;
                equationDisplay.style.borderLeftColor = '#b91c1c';
            }}

            let traces = [];
            let annotations = [];

            // Draw graphical simulation: Hanging weight
            // Axis x: [-3, 3], y: [-3, 3]
            // Draw ceiling at y = 2.5
            traces.push({{
                x: [-2, 2],
                y: [2.5, 2.5],
                mode: 'lines',
                line: {{color: '#475569', width: 4}},
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Sizing coordinates for rod representation
            let rodW = 0.05 + 0.35 * (d / 60); // visually scale rod thickness by diameter d

            if (status !== 'failed') {{
                // Draw healthy tension rod from y = 0 to y = 2.5
                let rodColor = '#10b981'; // safe
                if (status === 'warning') rodColor = '#f59e0b'; // warning

                traces.push({{
                    x: [-rodW/2, -rodW/2, rodW/2, rodW/2, -rodW/2],
                    y: [0, 2.5, 2.5, 0, 0],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: rodColor + '15',
                    line: {{color: rodColor, width: 3.5}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Draw heavy box block centered at y = -0.7
                // Box coordinates: x: [-0.8, 0.8], y: [-1.4, 0]
                traces.push({{
                    x: [-0.8, -0.8, 0.8, 0.8, -0.8],
                    y: [-1.4, 0, 0, -1.4, -1.4],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(71, 85, 105, 0.1)',
                    line: {{color: '#334155', width: 2.5}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                annotations.push({{
                    x: 0, y: -0.7,
                    text: `LOAD BLOCK<br>P = ${P} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#334155', weight: 'bold'}},
                    showarrow: false
                }});

            }} else {{
                // DRAW COLLAPSED STATE (Rod is snapped at center y=1.25, block fell down)
                // Draw upper rod segment hanging from ceiling
                traces.push({{
                    x: [-rodW/2, -rodW/2, rodW/2, rodW/2, -rodW/2],
                    y: [1.35, 2.5, 2.5, 1.35, 1.35],
                    mode: 'lines',
                    line: {{color: '#ef4444', width: 3.5}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Draw lower rod segment attached to weight (fell down)
                traces.push({{
                    x: [-rodW/2, -rodW/2, rodW/2, rodW/2, -rodW/2],
                    y: [-1.8, -0.65, -0.65, -1.8, -1.8],
                    mode: 'lines',
                    line: {{color: '#ef4444', width: 3.5}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Draw snapped ragged edges
                traces.push({{
                    x: [-rodW/2, 0, rodW/2],
                    y: [1.35, 1.25, 1.35],
                    mode: 'lines',
                    line: {{color: '#ef4444', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                traces.push({{
                    x: [-rodW/2, 0, rodW/2],
                    y: [-0.65, -0.75, -0.65],
                    mode: 'lines',
                    line: {{color: '#ef4444', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Draw load block on the ground (y: [-2.5, -1.1])
                traces.push({{
                    x: [-0.8, -0.8, 0.8, 0.8, -0.8],
                    y: [-2.5, -1.1, -1.1, -2.5, -2.5],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(220, 38, 38, 0.1)',
                    line: {{color: '#ef4444', width: 2.5}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                annotations.push({{
                    x: 0, y: -1.8,
                    text: '💥 COLLAPSED!',
                    font: {{family: 'Outfit', size: 12, color: '#ef4444', weight: 'bold'}},
                    showarrow: false
                }});
            }}

            // Show stress meter bar on the side (x = 2.0)
            // Draw background bar from y = -2 to y = 2
            let meterY_top = 2.0;
            let meterY_bot = -2.0;
            let meterX = 2.2;

            traces.push({{
                x: [meterX - 0.15, meterX + 0.15, meterX + 0.15, meterX - 0.15, meterX - 0.15],
                y: [meterY_bot, meterY_bot, meterY_top, meterY_top, meterY_bot],
                mode: 'lines',
                line: {{color: '#cbd5e1', width: 1.5}},
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Fill meter according to stress ratio: stress / Sy
            let stressRatio = stress / mat.Sy;
            if (stressRatio > 1.2) stressRatio = 1.2; // cap visual representation
            let fillY = meterY_bot + (meterY_top - meterY_bot) * (stressRatio / 1.2);
            let fillColor = '#10b981';
            if (status === 'warning') fillColor = '#f59e0b';
            if (status === 'failed') fillColor = '#ef4444';

            traces.push({{
                x: [meterX - 0.1, meterX + 0.1, meterX + 0.1, meterX - 0.1, meterX - 0.1],
                y: [meterY_bot, meterY_bot, fillY, fillY, meterY_bot],
                mode: 'lines',
                fill: 'toself',
                fillcolor: fillColor + '40',
                line: {{color: fillColor, width: 1}},
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Mark allowable stress line on the meter
            let allowRatio = allowableStress / mat.Sy;
            let allowY = meterY_bot + (meterY_top - meterY_bot) * (allowRatio / 1.2);
            traces.push({{
                x: [meterX - 0.25, meterX + 0.25],
                y: [allowY, allowY],
                mode: 'lines',
                line: {{color: '#6366f1', width: 2.5}},
                name: 'Allowable Stress Limit',
                hoverinfo: 'skip'
            }});

            annotations.push({{
                x: meterX + 0.3, y: allowY,
                text: 'Allowable Limit',
                font: {{family: 'Outfit', size: 8, color: '#6366f1', weight: 'bold'}},
                showarrow: false,
                xanchor: 'left'
            }});

            annotations.push({{
                x: meterX, y: meterY_top + 0.2,
                text: 'Stress Meter',
                font: {{family: 'Outfit', size: 9, color: '#64748b', weight: 'bold'}},
                showarrow: false
            }});

            const layout = {{
                xaxis: {{
                    range: [-2.5, 3.8],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    range: [-2.8, 3.0],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    scaleanchor: 'x',
                    scaleratio: 1,
                    fixedrange: true
                }},
                margin: {{l: 10, r: 10, t: 10, b: 10}},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                annotations: annotations
            }};

            Plotly.react('plotly-chart', traces, layout);

            // Print formulas
            equationDisplay.innerHTML = `
                <b>Design sizing and safety factors:</b><br>
                • Sized Area, <b>A</b> = π · d² / 4 = π · (${d})² / 4 = <b>${A.toFixed(1)} mm²</b><br>
                • Actual Stress, <b>σ</b> = P / A = ${P * 1000} N / ${A.toFixed(1)} mm² = <b>${stress.toFixed(2)} MPa</b><br>
                • Allowable Stress Target: <b>σ_allow = S_y / FS_target</b> = ${mat.Sy} / ${targetFS.toFixed(1)} = <b>${allowableStress.toFixed(1)} MPa</b><br>
                • Achieved Factor of Safety: <b>FS_actual = S_y / σ</b> = ${mat.Sy} / ${stress.toFixed(2)} = <b>${actualFS.toFixed(2)}</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_design_considerations():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #f97316; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 3 • Lesson 23</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Design Considerations: Safety Factors</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit3"]
    topic_name = "Lesson 23: Design Considerations:  Material Properties, Allowable Stress, Failure Modes, Factor of Safety"
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
    if "vdes_phase" not in st.session_state:
        st.session_state.vdes_phase = "instructions"
    if "vdes_sliders_locked" not in st.session_state:
        st.session_state.vdes_sliders_locked = False
    if "vdes_reset_counter" not in st.session_state:
        st.session_state.vdes_reset_counter = 0
    if "vdes_answers" not in st.session_state:
        st.session_state.vdes_answers = {}

    def reset_simulator():
        st.session_state.vdes_phase = "instructions"
        st.session_state.vdes_answers = {}
        st.session_state.vdes_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vdes_phase == "poe_predict":
        st.session_state.vdes_sliders_locked = True
    else:
        st.session_state.vdes_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Sizing Sandbox")
        locked_js = "true" if st.session_state.vdes_sliders_locked else "false"
        reset_counter = st.session_state.vdes_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#f97316; font-weight:700;">{phase_titles[st.session_state.vdes_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vdes_phase == "instructions":
            st.markdown(r"""
            **Stress vs. Strength:**
            * **Stress (σ):** The load intensity acting inside the member. Determined by external loading and geometry ($\sigma = P / A$).
            * **Strength ($S_y$):** The maximum stress the material can withstand before yielding. Determined strictly by material properties.
            
            **Factor of Safety (F.S.):**
            To ensure safety against structural failures, engineers enforce a design Factor of Safety ($FS_{\text{design}}$) greater than 1.0:
            $$\sigma_{\text{allow}} = \frac{S_y}{FS_{\text{design}}}$$
            $$\sigma_{\text{actual}} \le \sigma_{\text{allow}}$$
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vdes_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vdes_phase == "guided_question":
            st.markdown(r"""
            **Guided Scenario:**
            1. Select **Steel** ($S_y = 250\text{ MPa}$).
            2. Set **Load P** to `150 kN`.
            3. Set **Target F.S.** to `2.0`.
            4. Adjust the **Rod Diameter (d)** slider to find the smallest diameter that makes the design status safe.
            
            **Question:**
            What is the minimum safe diameter (nearest integer mm) to satisfy the target safety factor?
            """)
            
            ans = st.radio(
                "Select the correct minimum diameter:",
                options=[
                    "34 mm (Actual F.S. = 1.51)",
                    "39 mm (Actual F.S. = 2.00)",
                    "28 mm (Actual F.S. = 1.03)",
                    "44 mm (Actual F.S. = 2.53)"
                ],
                key="vdes_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "39 mm" in ans:
                    st.success(r"Correct! Area $A = \pi \cdot (39)^2 / 4 \approx 1194.6\text{ mm}^2$. Stress $\sigma = 150,000 / 1194.6 \approx 125.6\text{ MPa}$. Actual F.S. = $250 / 125.6 \approx 1.99 \approx 2.0$. Any diameter smaller than 39 mm fails to meet the safety target!")
                else:
                    st.error(r"Incorrect. Use the simulator to find when the status changes to green: at d = 39 mm, stress is 125.6 MPa, which satisfies the allowable stress $\sigma_{allow} = 250 / 2.0 = 125\text{ MPa}$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vdes_phase = "poe_predict"
                st.session_state.vdes_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vdes_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Specimen Controls Locked!):**
            
            **Scenario:**
            * **Load (P)**: `200 kN`
            * **Target F.S.**: `2.0`
            * **Material**: **Titanium** ($S_y = 800\text{ MPa}$)
            
            **Question:**
            What is the minimum diameter $d$ (rounded to the nearest mm) required to safely support this load with a Factor of Safety of 2.0?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "18 mm",
                    "26 mm",
                    "32 mm",
                    "12 mm"
                ],
                key="vdes_poe_p_radio"
            )
            st.session_state.vdes_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vdes_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vdes_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Select **Titanium** preset.
            2. Set **Load P** to `200 kN` and **Target F.S.** to `2.0`.
            3. Vary **Rod Diameter d** until the design status changes to green (**🟢 Safe Design**).
            4. Verify the required diameter.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vdes_answers.get("poe", "26 mm")
            options_list = ["18 mm", "26 mm", "32 mm", "12 mm"]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vdes_poe_o_radio"
            )
            st.session_state.vdes_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vdes_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vdes_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vdes_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vdes_answers.get("poe") == "26 mm":
                st.success("🎉 **Correct!** Excellent work.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics calculations below.")

            st.markdown(r"""
            ### Explanation:
            1. **Calculate Allowable Stress**:
               $$\sigma_{\text{allow}} = \frac{S_y}{FS} = \frac{800\text{ MPa}}{2.0} = 400\text{ MPa}$$
               
            2. **Calculate Minimum Required Area**:
               $$\sigma = \frac{P}{A} \le \sigma_{\text{allow}} \implies A \ge \frac{P}{\sigma_{\text{allow}}}$$
               $$A \ge \frac{200,000\text{ N}}{400\text{ N/mm}^2} = 500\text{ mm}^2$$
               
            3. **Determine Diameter**:
               $$A = \frac{\pi d^2}{4} \ge 500\text{ mm}^2$$
               $$d \ge \sqrt{\frac{4 \cdot 500}{\pi}} \approx \sqrt{636.62} \approx 25.23\text{ mm}$$
               
            Rounding up to the nearest integer mm to ensure safety yields **26 mm**. (At 25 mm, the area is $490.87\text{ mm}^2$, making the stress $407.44\text{ MPa} > 400\text{ MPa}$, which fails to meet the target safety factor).
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

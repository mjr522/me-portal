import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Normal & Bearing Stress Sandbox
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

    <!-- Mode Toggle -->
    <div class="btn-group">
        <button id="btn-axial" class="btn-choice active">Axial Normal Stress Mode</button>
        <button id="btn-bearing" class="btn-choice">Footing Bearing Stress Mode</button>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 320px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Load Magnitude -->
        <div class="control-box">
            <div class="control-title">1. Axial Force</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Load, P</span>
                    <span class="slider-value" id="p-val-display">100 kN</span>
                </div>
                <input type="range" id="p-slider" min="20" max="200" step="10" value="100" class="custom-slider">
            </div>
        </div>

        <!-- Column Diameter -->
        <div class="control-box">
            <div class="control-title">2. Column Dia. (d)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Diameter, d</span>
                    <span class="slider-value" id="d-val-display">40 mm</span>
                </div>
                <input type="range" id="d-slider" min="10" max="60" step="5" value="40" class="custom-slider">
            </div>
        </div>

        <!-- Footing Width -->
        <div class="control-box">
            <div class="control-title">3. Footing Size (B)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Width, B</span>
                    <span class="slider-value" id="b-val-display">120 mm</span>
                </div>
                <input type="range" id="b-slider" min="50" max="200" step="10" value="120" class="custom-slider">
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
        const btnAxial = document.getElementById('btn-axial');
        const btnBearing = document.getElementById('btn-bearing');
        const pSlider = document.getElementById('p-slider');
        const dSlider = document.getElementById('d-slider');
        const bSlider = document.getElementById('b-slider');
        const lockBanner = document.getElementById('lock-banner');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            mode: 'axial',
            P: 100,
            d: 40,
            B: 120
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vstress_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.mode = sessionStorage.getItem('vstress_mode') || 'axial';
            state.P = parseFloat(sessionStorage.getItem('vstress_P') || '100');
            state.d = parseFloat(sessionStorage.getItem('vstress_d') || '40');
            state.B = parseFloat(sessionStorage.getItem('vstress_B') || '120');
        }} else {{
            sessionStorage.setItem('vstress_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vstress_mode', state.mode);
            sessionStorage.setItem('vstress_P', state.P);
            sessionStorage.setItem('vstress_d', state.d);
            sessionStorage.setItem('vstress_B', state.B);
        }}

        // Handle buttons
        btnAxial.addEventListener('click', () => {{
            if (isLocked) return;
            state.mode = 'axial';
            btnAxial.classList.add('active');
            btnBearing.classList.remove('active');
            saveState();
            updatePlot();
        }});
        btnBearing.addEventListener('click', () => {{
            if (isLocked) return;
            state.mode = 'bearing';
            btnBearing.classList.add('active');
            btnAxial.classList.remove('active');
            saveState();
            updatePlot();
        }});

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            pSlider.disabled = true;
            dSlider.disabled = true;
            bSlider.disabled = true;
            btnAxial.disabled = true;
            btnBearing.disabled = true;
        }}

        // Sliders Listeners
        pSlider.addEventListener('input', (e) => {{
            state.P = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            saveState();
            updatePlot();
        }});
        dSlider.addEventListener('input', (e) => {{
            state.d = parseFloat(e.target.value);
            document.getElementById('d-val-display').innerText = state.d.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});
        bSlider.addEventListener('input', (e) => {{
            state.B = parseFloat(e.target.value);
            document.getElementById('b-val-display').innerText = state.B.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            dSlider.value = state.d;
            document.getElementById('d-val-display').innerText = state.d.toFixed(0) + ' mm';
            bSlider.value = state.B;
            document.getElementById('b-val-display').innerText = state.B.toFixed(0) + ' mm';

            if (state.mode === 'axial') {{
                btnAxial.classList.add('active');
                btnBearing.classList.remove('active');
            }} else {{
                btnBearing.classList.add('active');
                btnAxial.classList.remove('active');
            }}
        }}

        function updatePlot() {{
            let P = state.P;
            let d = state.d;
            let B = state.B;
            let mode = state.mode;

            let traces = [];
            let annotations = [];

            // Draw axis bounds: x: [-3, 3], y: [-2.5, 4.5]
            if (mode === 'axial') {{
                // AXIAL STRESS MODE
                // Column cross sectional area: A = pi * (d/2)^2
                let rad = d / 2;
                let A_col = Math.PI * rad * rad; // mm2
                let stress_col = (P * 1000) / A_col; // MPa (N/mm2)

                // Normalized width of column for plotting
                let colW = 0.3 + 1.2 * (d / 60); 

                // Draw column body (shaded cylinder/box)
                // Left boundary
                traces.push({{
                    x: [-colW/2, -colW/2, colW/2, colW/2, -colW/2],
                    y: [-1, 3, 3, -1, -1],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(249, 115, 22, 0.08)',
                    line: {{color: '#f97316', width: 2.5}},
                    name: 'Column Body',
                    hoverinfo: 'skip'
                }});

                // Draw cut line at y = 1.0
                traces.push({{
                    x: [-colW/2 - 0.2, colW/2 + 0.2],
                    y: [1.0, 1.0],
                    mode: 'lines',
                    line: {{color: '#ef4444', width: 2, dash: 'dash'}},
                    name: 'Cut Plane Section A-A',
                    hoverinfo: 'skip'
                }});

                // Show external forces
                // Downward tension at bottom (y = -1 pointing down)
                annotations.push({{
                    ax: 0, ay: -1.0,
                    x: 0, y: -2.0,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 0.8,
                    arrowwidth: 3.5,
                    arrowcolor: '#1e293b',
                    text: `P = ${P} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold'}},
                    yshift: -15
                }});

                // Upward tension at top (y = 3 pointing up)
                annotations.push({{
                    ax: 0, ay: 3.0,
                    x: 0, y: 4.0,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 0.8,
                    arrowwidth: 3.5,
                    arrowcolor: '#1e293b',
                    text: `P = ${P} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold'}},
                    yshift: 15
                }});

                // Normal stress distribution arrows crossing cut line at y = 1.0
                // We'll draw 5 small arrows pointing UP above the cut line representing tensile resistance
                let numArrows = 5;
                for (let i = 0; i < numArrows; i++) {{
                    let x_coord = -colW/2 + (colW / (numArrows - 1)) * i;
                    annotations.push({{
                        ax: x_coord, ay: 1.0,
                        x: x_coord, y: 1.6,
                        xref: 'x', yref: 'y',
                        axref: 'x', ayref: 'y',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 0.5,
                        arrowwidth: 2.0,
                        arrowcolor: '#ef4444',
                        text: '',
                        hoverinfo: 'skip'
                    }});
                }}

                // Text labels on plot
                annotations.push({{
                    x: colW/2 + 0.6,
                    y: 1.0,
                    xref: 'x',
                    yref: 'y',
                    text: 'Section A-A',
                    font: {{family: 'Outfit', size: 11, color: '#ef4444', weight: 'bold'}},
                    showarrow: false
                }});

                annotations.push({{
                    x: 0,
                    y: 1.9,
                    xref: 'x',
                    yref: 'y',
                    text: `σ = ${stress_col.toFixed(1)} MPa`,
                    font: {{family: 'Outfit', size: 13, color: '#ef4444', weight: 'bold'}},
                    showarrow: false
                }});

                equationDisplay.innerHTML = `
                    <b>Axial Normal Stress Calculation (σ):</b><br>
                    • Load, P = ${P} kN = ${P * 1000} N<br>
                    • Column Dia, d = ${d} mm<br>
                    • Area, A = π · d² / 4 = π · (${d})² / 4 = ${A_col.toFixed(1)} mm²<br>
                    • Normal Stress, <b>σ = P / A</b> = ${P * 1000} N / ${A_col.toFixed(1)} mm² = <b>${stress_col.toFixed(2)} MPa (Tension)</b>
                `;

            } else {{
                // BEARING STRESS MODE
                // Pedestal and Soil bearing stress
                // Bearing area: A_b = B * B
                let A_b = B * B; // mm2
                let stress_b = (P * 1000) / A_b; // MPa (N/mm2)

                // Column Area for comparison
                let rad = d / 2;
                let A_col = Math.PI * rad * rad;
                let stress_col = (P * 1000) / A_col;

                // Normalized widths
                let colW = 0.3 + 0.8 * (d / 60); 
                let footW = 0.6 + 1.6 * (B / 200);

                // Draw column body from y = 1 to y = 3
                traces.push({{
                    x: [-colW/2, -colW/2, colW/2, colW/2, -colW/2],
                    y: [1, 3, 3, 1, 1],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(71, 85, 105, 0.08)',
                    line: {{color: '#475569', width: 2}},
                    name: 'Column',
                    hoverinfo: 'skip'
                }});

                // Draw footing block from y = 0 to y = 1
                traces.push({{
                    x: [-footW/2, -footW/2, footW/2, footW/2, -footW/2],
                    y: [0, 1, 1, 0, 0],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(249, 115, 22, 0.12)',
                    line: {{color: '#f97316', width: 2.5}},
                    name: 'Footing Base',
                    hoverinfo: 'skip'
                }});

                // Draw ground line at y = 0
                traces.push({{
                    x: [-2.5, 2.5],
                    y: [0, 0],
                    mode: 'lines',
                    line: {{color: '#94a3b8', width: 3}},
                    name: 'Ground Line',
                    hoverinfo: 'skip'
                }});

                // Downward load on column top (y = 3 pointing down)
                annotations.push({{
                    ax: 0, ay: 4.0,
                    x: 0, y: 3.0,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 0.8,
                    arrowwidth: 3.5,
                    arrowcolor: '#1e293b',
                    text: `P = ${P} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold'}},
                    yshift: 15
                }});

                // Soil bearing pressure arrows pointing UP against footing (y = -1.2 to y = 0)
                let numArrows = 6;
                for (let i = 0; i < numArrows; i++) {{
                    let x_coord = -footW/2 + (footW / (numArrows - 1)) * i;
                    annotations.push({{
                        ax: x_coord, ay: -1.0,
                        x: x_coord, y: -0.1,
                        xref: 'x', yref: 'y',
                        axref: 'x', ayref: 'y',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 0.5,
                        arrowwidth: 2.0,
                        arrowcolor: '#f97316',
                        text: '',
                        hoverinfo: 'skip'
                    }});
                }}

                annotations.push({{
                    x: 0,
                    y: -1.3,
                    xref: 'x',
                    yref: 'y',
                    text: `σ_b = ${stress_b.toFixed(2)} MPa`,
                    font: {{family: 'Outfit', size: 13, color: '#f97316', weight: 'bold'}},
                    showarrow: false
                }});

                annotations.push({{
                    x: 0,
                    y: 0.5,
                    xref: 'x',
                    yref: 'y',
                    text: 'Footing Pedestal',
                    font: {{family: 'Outfit', size: 9, color: '#f97316'}},
                    showarrow: false
                }});

                equationDisplay.innerHTML = `
                    <b>Footing Bearing Stress Calculation (σ_b):</b><br>
                    • Load, P = ${P} kN = ${P * 1000} N<br>
                    • Footing Dimension, B = ${B} mm x ${B} mm<br>
                    • Bearing Area, A_bearing = B² = ${A_b.toFixed(0)} mm²<br>
                    • Bearing Stress, <b>σ_b = P / A_bearing</b> = ${P * 1000} N / ${A_b.toFixed(0)} mm² = <b>${stress_b.toFixed(3)} MPa</b><br>
                    <span style="font-size:0.75rem; color:#64748b;">(Compare with Column Axial Stress: σ_axial = ${stress_col.toFixed(2)} MPa)</span>
                `;
            }}

            const layout = {{
                xaxis: {{
                    range: [-3, 3],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    range: [-2.2, 4.5],
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
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_normal_stress():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #f97316; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 3 • Lesson 20</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Normal & Bearing Stress</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit3"]
    topic_name = "Lesson 20: Normal Stress"
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
    if "vstress_phase" not in st.session_state:
        st.session_state.vstress_phase = "instructions"
    if "vstress_sliders_locked" not in st.session_state:
        st.session_state.vstress_sliders_locked = False
    if "vstress_reset_counter" not in st.session_state:
        st.session_state.vstress_reset_counter = 0
    if "vstress_answers" not in st.session_state:
        st.session_state.vstress_answers = {}

    def reset_simulator():
        st.session_state.vstress_phase = "instructions"
        st.session_state.vstress_answers = {}
        st.session_state.vstress_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vstress_phase == "poe_predict":
        st.session_state.vstress_sliders_locked = True
    else:
        st.session_state.vstress_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Stress Sandbox")
        locked_js = "true" if st.session_state.vstress_sliders_locked else "false"
        reset_counter = st.session_state.vstress_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#f97316; font-weight:700;">{phase_titles[st.session_state.vstress_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vstress_phase == "instructions":
            st.markdown("""
            **Normal Stress (σ)** is the intensity of force acting perpendicular to a cross-sectional surface.
            
            **Bearing Stress (σ_b)** is a specific type of normal stress that occurs at the contact interface between two distinct bodies.
            
            **Key Formulas:**
            * **Axial Normal Stress:** $\sigma = P / A$
            * **Bearing Stress:** $\sigma_b = P / A_{bearing}$
            
            Use the toggle buttons at the top of the simulator to switch between these two modes.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vstress_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vstress_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            1. Toggle to **Axial Normal Stress Mode**.
            2. Set **Axial Force (P)** to `120 kN`.
            3. Set **Column Dia. (d)** to `30 mm`.
            
            Look at the equation box to inspect the calculated values.
            
            **Question:**
            What is the normal stress inside this column?
            """)
            
            ans = st.radio(
                "Select the correct calculation:",
                options=[
                    "σ = 169.76 MPa",
                    "σ = 42.44 MPa",
                    "σ = 127.32 MPa",
                    "σ = 84.88 MPa"
                ],
                key="vstress_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "169.76" in ans:
                    st.success(r"Correct! Area $A = \pi \cdot (30)^2 / 4 \approx 706.86\text{ mm}^2$. Stress $\sigma = 120,000\text{ N} / 706.86\text{ mm}^2 \approx 169.76\text{ MPa}$.")
                else:
                    st.error(r"Incorrect. Let's recalculate: Area $A = \pi \cdot d^2 / 4 = \pi \cdot 30^2 / 4 = 706.86\text{ mm}^2$. Then $\sigma = P/A = 120,000\text{ N} / 706.86\text{ mm}^2 \approx 169.76\text{ MPa}$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vstress_phase = "poe_predict"
                st.session_state.vstress_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vstress_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Controls Locked!):**
            
            **Scenario:**
            A structural column with diameter $d = 30\text{ mm}$ rests on a square concrete footing of width $B = 100\text{ mm}$ under a load $P = 150\text{ kN}$.
            
            **Question:**
            Which stress is higher: the axial stress inside the column ($\sigma$), or the bearing stress between the footing and the ground ($\sigma_b$)?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Axial stress inside the column is higher",
                    "Bearing stress on the footing is higher",
                    "Both stresses are equal because the load is the same"
                ],
                key="vstress_poe_p_radio"
            )
            st.session_state.vstress_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vstress_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vstress_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set **Load P** to `150 kN`.
            2. Toggle between modes and set **Column Dia. d** to `30 mm` and **Footing Width B** to `100 mm`.
            3. Observe the calculated values for both stresses in the equation boxes.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vstress_answers.get("poe", "Axial stress inside the column is higher")
            options_list = [
                "Axial stress inside the column is higher",
                "Bearing stress on the footing is higher",
                "Both stresses are equal because the load is the same"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vstress_poe_o_radio"
            )
            st.session_state.vstress_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vstress_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vstress_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vstress_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vstress_answers.get("poe") == "Axial stress inside the column is higher":
                st.success("🎉 **Correct!** Excellent work.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics calculations below.")

            st.markdown(r"""
            ### Explanation:
            Under a constant load $P$, stress is inversely proportional to the cross-sectional area over which the force is distributed:
            $$\sigma = \frac{P}{A}$$
            
            1. **Column Area**:
               $$A_{\text{col}} = \frac{\pi d^2}{4} = \frac{\pi (30)^2}{4} \approx 706.86\text{ mm}^2$$
               $$\sigma_{\text{axial}} = \frac{150,000\text{ N}}{706.86\text{ mm}^2} \approx 212.21\text{ MPa}$$
               
            2. **Bearing Area**:
               $$A_{\text{bearing}} = B^2 = (100)^2 = 10,000\text{ mm}^2$$
               $$\sigma_{\text{bearing}} = \frac{150,000\text{ N}}{10,000\text{ mm}^2} = 15.0\text{ MPa}$$
            
            Since the column diameter is much smaller than the footing width, the load is concentrated on a much smaller area inside the column. Consequently, the column axial stress is **over 14 times higher** than the footing bearing stress on the soil.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

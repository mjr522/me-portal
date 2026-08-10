import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Combined Loading Sandbox
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
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 280px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Compressive Force P -->
        <div class="control-box">
            <div class="control-title">1. Axial Load (P)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Load, P</span>
                    <span class="slider-value" id="p-val-display">100 kN</span>
                </div>
                <input type="range" id="p-slider" min="10" max="200" step="10" value="100" class="custom-slider">
            </div>
        </div>

        <!-- Eccentricity e -->
        <div class="control-box">
            <div class="control-title">2. Eccentricity (e)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Offset, e</span>
                    <span class="slider-value" id="e-val-display">10 mm</span>
                </div>
                <input type="range" id="e-slider" min="-30" max="30" step="1" value="10" class="custom-slider">
            </div>
        </div>

        <!-- Width b -->
        <div class="control-box">
            <div class="control-title">3. Column Width (b)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Width, b</span>
                    <span class="slider-value" id="b-val-display">40 mm</span>
                </div>
                <input type="range" id="b-slider" min="20" max="80" step="5" value="40" class="custom-slider">
            </div>
        </div>

        <!-- Height h -->
        <div class="control-box">
            <div class="control-title">4. Column Height (h)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Height, h</span>
                    <span class="slider-value" id="h-val-display">80 mm</span>
                </div>
                <input type="range" id="h-slider" min="60" max="120" step="5" value="80" class="custom-slider">
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
        const pSlider = document.getElementById('p-slider');
        const eSlider = document.getElementById('e-slider');
        const bSlider = document.getElementById('b-slider');
        const hSlider = document.getElementById('h-slider');
        const lockBanner = document.getElementById('lock-banner');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            P: 100,
            e: 10,
            b: 40,
            h: 80
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vcom_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.P = parseFloat(sessionStorage.getItem('vcom_P') || '100');
            state.e = parseFloat(sessionStorage.getItem('vcom_e') || '10');
            state.b = parseFloat(sessionStorage.getItem('vcom_b') || '40');
            state.h = parseFloat(sessionStorage.getItem('vcom_h') || '80');
        }} else {{
            sessionStorage.setItem('vcom_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vcom_P', state.P);
            sessionStorage.setItem('vcom_e', state.e);
            sessionStorage.setItem('vcom_b', state.b);
            sessionStorage.setItem('vcom_h', state.h);
        }}

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            pSlider.disabled = true;
            eSlider.disabled = true;
            bSlider.disabled = true;
            hSlider.disabled = true;
        }}

        // Listeners
        pSlider.addEventListener('input', (e) => {{
            state.P = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            saveState();
            updatePlot();
        }});
        eSlider.addEventListener('input', (e) => {{
            state.e = parseFloat(e.target.value);
            document.getElementById('e-val-display').innerText = state.e.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});
        bSlider.addEventListener('input', (e) => {{
            state.b = parseFloat(e.target.value);
            document.getElementById('b-val-display').innerText = state.b.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});
        hSlider.addEventListener('input', (e) => {{
            state.h = parseFloat(e.target.value);
            document.getElementById('h-val-display').innerText = state.h.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            eSlider.value = state.e;
            document.getElementById('e-val-display').innerText = state.e.toFixed(0) + ' mm';
            bSlider.value = state.b;
            document.getElementById('b-val-display').innerText = state.b.toFixed(0) + ' mm';
            hSlider.value = state.h;
            document.getElementById('h-val-display').innerText = state.h.toFixed(0) + ' mm';
        }}

        function updatePlot() {{
            let P = state.P;
            let e = state.e;
            let b = state.b;
            let h = state.h;

            // Math calculations
            let A = b * h; // area in mm2
            let Ix = (b * Math.pow(h, 3)) / 12; // inertia mm4
            let M = P * e * 1000; // eccentricity bending moment in N-mm
            let c = h / 2;

            // Axial stress (uniform compression)
            let stress_a = - (P * 1000) / A; // MPa (negative for comp)
            // Max bending stress
            let stress_b_max = Math.abs(M * c) / Ix; // MPa
            
            // Combined stress at left and right edges (extreme fibers y = -c and y = +c)
            // If e > 0, moment is positive, puts left in comp (-y direction has comp?
            // Let's draw stress along y coordinate, where y is vertical across height.
            // σ(y) = σ_axial - M*y / I.
            // If M > 0 (e > 0): top edge (y > 0) has comp (-M*y/I < 0), bottom edge (y < 0) has tension (-M*y/I > 0).
            let stress_top = stress_a - (M * c) / Ix;
            let stress_bot = stress_a + (M * c) / Ix;

            let traces = [];
            let annotations = [];

            // ------------------ SUBPLOT 1: ECCENTRIC COLUMN (Left, x: [0, 0.45]) ------------------
            // Draw column profile
            let colW = 0.2 + 0.4 * (h / 120);
            traces.push({{
                x: [1.0 - colW/2, 1.0 - colW/2, 1.0 + colW/2, 1.0 + colW/2, 1.0 - colW/2],
                y: [0.5, 3.5, 3.5, 0.5, 0.5],
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(71, 85, 105, 0.08)',
                line: {{color: '#475569', width: 2}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Centroidal centerline
            traces.push({{
                x: [1.0, 1.0],
                y: [0.3, 3.7],
                mode: 'lines',
                line: {{color: '#94a3b8', width: 1.5, dash: 'dash'}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw Eccentric Load Arrow at top face y = 3.5
            let offset_x = 1.0 + (e / 100); // map eccentricity to plot coords
            annotations.push({{
                ax: offset_x, ay: 4.1,
                x: offset_x, y: 3.52,
                xref: 'x1', yref: 'y1',
                axref: 'x1', ayref: 'y1',
                showarrow: true,
                arrowhead: 2,
                arrowsize: 0.8,
                arrowwidth: 3.5,
                arrowcolor: '#ef4444',
                text: ''
            }});
            annotations.push({{
                x: offset_x, y: 4.1,
                xref: 'x1', yref: 'y1',
                showarrow: false,
                text: `P = ${P} kN`,
                font: {{family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold'}},
                yshift: 10
            }});

            // Show eccentricity dimension line
            if (Math.abs(e) > 1) {{
                traces.push({{
                    x: [1.0, offset_x],
                    y: [3.8, 3.8],
                    mode: 'lines+markers',
                    line: {{color: '#10b981', width: 1.5}},
                    marker: {{size: 4, symbol: 'line-ns'}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                annotations.push({{
                    x: (1.0 + offset_x)/2, y: 4.0,
                    xref: 'x1', yref: 'y1',
                    text: `e = ${e}mm`,
                    font: {{family: 'Outfit', size: 8, color: '#10b981'}},
                    showarrow: false
                }});
            }}

            // ------------------ SUBPLOT 2: STRESS PROFILE (Right, x: [-2.5, 2.5], y: [-1.5, 1.5]) ------------------
            // Draw cross-section rectangle on right
            let h_plot = 1.6 * (h / 120);
            traces.push({{
                x: [-0.4, -0.4, 0.4, 0.4, -0.4],
                y: [-h_plot/2, h_plot/2, h_plot/2, -h_plot/2, -h_plot/2],
                mode: 'lines',
                line: {{color: '#cbd5e1', width: 1.5}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw composite stress line along y (vertical).
            // We draw horizontal arrows representing combined stresses at y-coordinates.
            let numArrows = 7;
            let combinedX = [];
            let combinedY = [];

            for (let i = 0; i < numArrows; i++) {{
                let y_coord = -h_plot/2 + (h_plot / (numArrows - 1)) * i;
                let stress_fraction = y_coord / (h_plot/2); // -1 to 1
                
                // Stress at this y: sigma = sigma_a - sigma_b_max * stress_fraction
                let s_val = stress_a - stress_b_max * stress_fraction;

                // Scale for arrow plotting: 100 MPa stress is 1.0 units horizontally
                let arrowLen = s_val / 100;
                
                combinedX.push(arrowLen);
                combinedY.push(y_coord);

                let color = arrowLen < 0 ? '#ef4444' : '#3b82f6'; // red for compression, blue for tension

                annotations.push({{
                    ax: 0, ay: y_coord,
                    x: arrowLen, y: y_coord,
                    xref: 'x2', yref: 'y2',
                    axref: 'x2', ayref: 'y2',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 0.5,
                    arrowwidth: 1.5,
                    arrowcolor: color,
                    text: ''
                }});
            }}

            // Draw envelope line
            traces.push({{
                x: combinedX,
                y: combinedY,
                mode: 'lines',
                line: {{color: '#8b5cf6', width: 2.5}},
                name: 'Combined Stress Profile',
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw zero-stress reference line (neutral axis)
            traces.push({{
                x: [0, 0],
                y: [-h_plot/2 - 0.2, h_plot/2 + 0.2],
                mode: 'lines',
                line: {{color: '#94a3b8', width: 1.5}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Label extreme fiber combined stresses
            annotations.push({{
                x: combinedX[combinedX.length - 1] < 0 ? combinedX[combinedX.length - 1] - 0.1 : combinedX[combinedX.length - 1] + 0.1,
                y: h_plot/2,
                xref: 'x2', yref: 'y2',
                text: `σ_top = ${stress_top.toFixed(1)} MPa`,
                font: {{family: 'Outfit', size: 9, color: stress_top < 0 ? '#ef4444' : '#3b82f6', weight: 'bold'}},
                showarrow: false,
                xanchor: combinedX[combinedX.length - 1] < 0 ? 'right' : 'left'
            }});

            annotations.push({{
                x: combinedX[0] < 0 ? combinedX[0] - 0.1 : combinedX[0] + 0.1,
                y: -h_plot/2,
                xref: 'x2', yref: 'y2',
                text: `σ_bot = ${stress_bot.toFixed(1)} MPa`,
                font: {{family: 'Outfit', size: 9, color: stress_bot < 0 ? '#ef4444' : '#3b82f6', weight: 'bold'}},
                showarrow: false,
                xanchor: combinedX[0] < 0 ? 'right' : 'left'
            }});

            // Find and label where stress is zero (shifting neutral axis)
            // If stress_top and stress_bot have different signs, NA crosses the column
            if (stress_top * stress_bot < 0) {{
                // y_NA = stress_a * c / stress_b_max
                let y_NA_plot = (stress_a * (h_plot/2)) / (stress_top - stress_bot); // wait, simpler: linear interpolation
                // y_NA = y_top - stress_top * (y_top - y_bot)/(stress_top - stress_bot)
                let y_NA = (h_plot/2) - stress_top * (h_plot) / (stress_top - stress_bot);

                traces.push({{
                    x: [-0.4, 0.4],
                    y: [y_NA, y_NA],
                    mode: 'lines',
                    line: {{color: '#6366f1', width: 1.5, dash: 'dot'}},
                    xaxis: 'x2', yaxis: 'y2',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                annotations.push({{
                    x: 0.5, y: y_NA,
                    xref: 'x2', yref: 'y2',
                    text: 'NA (σ=0)',
                    font: {{family: 'Outfit', size: 8, color: '#6366f1', weight: 'bold'}},
                    showarrow: false,
                    xanchor: 'left'
                }});
            }}

            const layout = {{
                grid: {{rows: 1, columns: 2, pattern: 'independent'}},
                xaxis: {{
                    domain: [0, 0.45],
                    range: [0.3, 1.7],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    domain: [0, 1],
                    range: [0, 5],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                xaxis2: {{
                    domain: [0.55, 1.0],
                    range: [-3.2, 3.2],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis2: {{
                    domain: [0, 1],
                    range: [-1.4, 1.4],
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

            // Update equations box
            equationDisplay.innerHTML = `
                <b>Combined Stress superposition (σ = P/A ± My/I):</b><br>
                • Column Area, <b>A</b> = ${A} mm² | Inertia, <b>I_x</b> = <b>${(Ix/1e4).toFixed(1)} x 10⁴ mm⁴</b><br>
                • Uniform Axial Stress: <b>σ_axial = -P / A</b> = <b>${stress_a.toFixed(2)} MPa (Comp)</b><br>
                • Bending Moment: <b>M = P·e</b> = ${P}·${e} = <b>${(M/1e6).toFixed(2)} kN-m</b><br>
                • Max Bending Stress: <b>σ_bending = M·c / I_x</b> = <b>${stress_b_max.toFixed(2)} MPa</b><br>
                • Combined Stress top edge: <b>σ_top</b> = ${stress_a.toFixed(1)} - ${((M*c)/Ix).toFixed(1)} = <b>${stress_top.toFixed(2)} MPa</b><br>
                • Combined Stress bottom edge: <b>σ_bot</b> = ${stress_a.toFixed(1)} + ${((M*c)/Ix).toFixed(1)} = <b>${stress_bot.toFixed(2)} MPa</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_combined_loading():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #8b5cf6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 4 • Lesson 34</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Combined Loading: Axial & Bending</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit4"]
    topic_name = "Lesson 34: Combined Loading"
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
    if "vcom_phase" not in st.session_state:
        st.session_state.vcom_phase = "instructions"
    if "vcom_sliders_locked" not in st.session_state:
        st.session_state.vcom_sliders_locked = False
    if "vcom_reset_counter" not in st.session_state:
        st.session_state.vcom_reset_counter = 0
    if "vcom_answers" not in st.session_state:
        st.session_state.vcom_answers = {}

    def reset_simulator():
        st.session_state.vcom_phase = "instructions"
        st.session_state.vcom_answers = {}
        st.session_state.vcom_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vcom_phase == "poe_predict":
        st.session_state.vcom_sliders_locked = True
    else:
        st.session_state.vcom_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Eccentric Column Simulator")
        locked_js = "true" if st.session_state.vcom_sliders_locked else "false"
        reset_counter = st.session_state.vcom_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#8b5cf6; font-weight:700;">{phase_titles[st.session_state.vcom_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vcom_phase == "instructions":
            st.markdown(r"""
            **Combined Loading Superposition:**
            When a structural member is subjected to multiple loading types simultaneously (such as axial compression AND bending moments), the normal stresses can be superimposed:
            $$\sigma = \sigma_{\text{axial}} + \sigma_{\text{bending}} = \pm \frac{P}{A} \pm \frac{M y}{I}$$
            
            An offset or eccentric axial load $P$ applied at distance $e$ from the centroidal axis generates both an axial load $P$ and a moment $M = P \cdot e$.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vcom_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vcom_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            1. Set **Axial Load (P)** to `100 kN`.
            2. Set **Eccentricity (e)** to `10 mm`.
            3. Set **Column Width (b)** to `40 mm` and **Height (h)** to `80 mm`.
            
            Look at the combined stress values shown in the equations display box.
            
            **Question:**
            What is the axial stress ($\sigma_{axial}$) and the maximum combined stress at the top edge ($\sigma_{top}$)?
            """)
            
            ans = st.radio(
                "Select the correct calculations:",
                options=[
                    "σ_axial = -31.25 MPa, σ_top = -54.69 MPa",
                    "σ_axial = -31.25 MPa, σ_top = -7.81 MPa",
                    "σ_axial = -15.63 MPa, σ_top = -39.06 MPa",
                    "σ_axial = -31.25 MPa, σ_top = -23.44 MPa"
                ],
                key="vcom_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "σ_axial = -31.25" in ans and "-54.69 MPa" in ans:
                    st.success(r"Correct! Area $A = 40 \cdot 80 = 3200\text{ mm}^2$. $\sigma_{axial} = -100,000 / 3200 = -31.25\text{ MPa}$. Bending moment $M = 100 \cdot 10 = 1000\text{ N-m} = 1.0 \times 10^6\text{ N-mm}$. $I_x = 1.7067 \times 10^6\text{ mm}^4$. $\sigma_{bending} = \frac{10^6 \cdot 40}{1.7067 \times 10^6} \approx 23.44\text{ MPa}$. Since the load is offset to the right/top, top fiber has added compression: $\sigma_{top} = -31.25 - 23.44 = -54.69\text{ MPa}$.")
                else:
                    st.error(r"Incorrect. Use the equations box to check values: $\sigma_{axial} = -31.25\text{ MPa}$ and $\sigma_{top} = -54.69\text{ MPa}$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vcom_phase = "poe_predict"
                st.session_state.vcom_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vcom_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Sizer Controls Locked!):**
            
            **Scenario:**
            Set the column geometry to: $b = 40\text{ mm}$, $h = 80\text{ mm}$.
            The column is loaded with $P = 100\text{ kN}$ in compression.
            
            **Question:**
            At what critical eccentricity $e$ (in mm) does the combined stress at the bottom edge of the column become exactly zero (meaning the column is entirely in compression on one side, and transitioning to tension on the other)?
            
            *Hint: Use the 'kern of the section' formula for a rectangle: $e_{crit} = h / 6$.*
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "13.3 mm",
                    "10.0 mm",
                    "20.0 mm",
                    "6.7 mm"
                ],
                key="vcom_poe_p_radio"
            )
            st.session_state.vcom_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vcom_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vcom_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set **b** to `40 mm` and **h** to `80 mm`.
            2. Set **Load P** to `100 kN`.
            3. Adjust **Eccentricity e** to the predicted offset value.
            4. Observe the combined stress profile and check when $\sigma_{bot}$ becomes zero.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vcom_answers.get("poe", "13.3 mm")
            options_list = ["13.3 mm", "10.0 mm", "20.0 mm", "6.7 mm"]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vcom_poe_o_radio"
            )
            st.session_state.vcom_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vcom_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vcom_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vcom_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vcom_answers.get("poe") == "13.3 mm":
                st.success("🎉 **Correct!** Excellent understanding of combined load limits.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics details below.")

            st.markdown(r"""
            ### Explanation:
            1. **Setting Up Edge Stress Equation**:
               Combined stress at the bottom edge is:
               $$\sigma_{\text{bot}} = -\frac{P}{A} + \frac{P \cdot e \cdot c}{I_x}$$
               Substituting $A = b \cdot h$, $c = h/2$, and $I_x = \frac{b h^3}{12}$:
               $$\sigma_{\text{bot}} = -\frac{P}{b h} + \frac{P \cdot e \cdot (h/2)}{\frac{b h^3}{12}} = -\frac{P}{b h} + \frac{6 P \cdot e}{b h^2} = -\frac{P}{b h}\left(1 - \frac{6 e}{h}\right)$$
               
            2. **Solving for Zero Stress**:
               To make $\sigma_{\text{bot}} = 0$:
               $$1 - \frac{6 e}{h} = 0 \implies e = \frac{h}{6}$$
               
            3. **Critical Offset for h = 80 mm**:
               $$e_{\text{crit}} = \frac{80\text{ mm}}{6} \approx 13.33\text{ mm}$$
               
            *Conclusion:* If eccentricity $e < 13.3\text{ mm}$, the entire column is in compression. If $e > 13.3\text{ mm}$, the bending stress exceeds the axial stress on one side, resulting in tensile stresses on the bottom/left edge. For brittle materials like concrete or stone that cannot support tension, keeping loads within this central "kern" ($e \le h/6$) is a fundamental design requirement.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

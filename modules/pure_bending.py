import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Pure Bending Sandbox
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
            color: #8b5cf6;
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
        .warning-box {{
            background-color: #fef2f2;
            border: 1.5px solid #fee2e2;
            color: #b91c1c;
            border-radius: 8px;
            padding: 10px;
            margin-top: 10px;
            font-weight: 600;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 290px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Bending Moment M -->
        <div class="control-box">
            <div class="control-title">1. Bending Moment</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Moment, M</span>
                    <span class="slider-value" id="m-val-display">+10 kN-m</span>
                </div>
                <input type="range" id="m-slider" min="-20" max="20" step="2" value="10" class="custom-slider">
            </div>
        </div>

        <!-- Width b -->
        <div class="control-box">
            <div class="control-title">2. Beam Width (b)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Width, b</span>
                    <span class="slider-value" id="b-val-display">40 mm</span>
                </div>
                <input type="range" id="b-slider" min="20" max="100" step="5" value="40" class="custom-slider">
            </div>
        </div>

        <!-- Height h -->
        <div class="control-box">
            <div class="control-title">3. Beam Height (h)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Height, h</span>
                    <span class="slider-value" id="h-val-display">80 mm</span>
                </div>
                <input type="range" id="h-slider" min="40" max="120" step="5" value="80" class="custom-slider">
            </div>
        </div>
    </div>

    <!-- Yield Warning -->
    <div id="yield-warning" class="warning-box" style="display: none;">
        <span>⚠️</span>
        <span><b>FLEXURAL YIELDING EXCEEDED!</b> Extreme fiber stress has passed the material's yield strength (σ_max &gt; 250 MPa).</span>
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
        const mSlider = document.getElementById('m-slider');
        const bSlider = document.getElementById('b-slider');
        const hSlider = document.getElementById('h-slider');
        const lockBanner = document.getElementById('lock-banner');
        const yieldWarning = document.getElementById('yield-warning');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            M: 10,
            b: 40,
            h: 80
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vpmo_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.M = parseFloat(sessionStorage.getItem('vpmo_M') || '10');
            state.b = parseFloat(sessionStorage.getItem('vpmo_b') || '40');
            state.h = parseFloat(sessionStorage.getItem('vpmo_h') || '80');
        }} else {{
            sessionStorage.setItem('vpmo_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vpmo_M', state.M);
            sessionStorage.setItem('vpmo_b', state.b);
            sessionStorage.setItem('vpmo_h', state.h);
        }}

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            mSlider.disabled = true;
            bSlider.disabled = true;
            hSlider.disabled = true;
        }}

        // Listeners
        mSlider.addEventListener('input', (e) => {{
            state.M = parseFloat(e.target.value);
            let sign = state.M >= 0 ? '+' : '';
            document.getElementById('m-val-display').innerText = sign + state.M.toFixed(0) + ' kN-m';
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
            mSlider.value = state.M;
            let sign = state.M >= 0 ? '+' : '';
            document.getElementById('m-val-display').innerText = sign + state.M.toFixed(0) + ' kN-m';
            bSlider.value = state.b;
            document.getElementById('b-val-display').innerText = state.b.toFixed(0) + ' mm';
            hSlider.value = state.h;
            document.getElementById('h-val-display').innerText = state.h.toFixed(0) + ' mm';
        }}

        function updatePlot() {{
            let M = state.M;
            let b = state.b;
            let h = state.h;

            // Math Flexure calculations
            let Ix = (b * Math.pow(h, 3)) / 12; // mm4
            let c = h / 2; // mm
            let M_nmm = M * 1e6; // kN-m to N-mm
            let stress_max = Math.abs(M_nmm * c) / Ix; // MPa (extreme fiber stress)

            let isYielded = stress_max > 250; // yield strength limit for standard steel
            if (isYielded) {{
                yieldWarning.style.display = 'flex';
            }} else {{
                yieldWarning.style.display = 'none';
            }}

            let traces = [];
            let annotations = [];

            // ------------------ SUBPLOT 1: PHYSICAL BEAM PROFILE (Left, x: [0, 0.45]) ------------------
            // Draw a segment of a beam curving based on M. 
            // We'll draw top, bottom boundaries, and a dashed centerline
            let steps = 40;
            let beamL = 1.6;
            let thick = 0.2 + 0.3 * (h / 120);

            // Curve offset (deflection height at center)
            // positive moment smiles (sag at center y < 0), negative moment frowns (hump at center y > 0)
            let sag_center = -0.3 * (M / 20); 

            let topX = [], topY = [];
            let botX = [], botY = [];
            let midX = [], midY = [];

            for (let i = 0; i <= steps; i++) {{
                let x_local = (i / steps) * beamL; // 0 to 1.6
                let f = x_local - beamL/2;
                // Parabolic shape: y = sag_center * (1 - 4 * f^2 / L^2)
                let y_curve = sag_center * (1 - (4 * f*f) / (beamL*beamL));

                let x_plot = 0.2 + x_local;
                
                midX.push(x_plot);
                midY.push(1.0 + y_curve);

                topX.push(x_plot);
                topY.push(1.0 + y_curve + thick/2);

                botX.push(x_plot);
                botY.push(1.0 + y_curve - thick/2);
            }}

            // Draw full shaded beam body
            traces.push({{
                x: topX.concat(botX.slice().reverse()),
                y: topY.concat(botY.slice().reverse()),
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(139, 92, 246, 0.06)',
                line: {{color: '#94a3b8', width: 1.5}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw boundaries and Neutral Axis
            traces.push({{
                x: topX, y: topY,
                mode: 'lines',
                line: {{color: M >= 0 ? '#ef4444' : '#3b82f6', width: 2.5}}, // top fiber color
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});
            traces.push({{
                x: botX, y: botY,
                mode: 'lines',
                line: {{color: M >= 0 ? '#3b82f6' : '#ef4444', width: 2.5}}, // bottom fiber color
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});
            traces.push({{
                x: midX, y: midY,
                mode: 'lines',
                line: {{color: '#6366f1', width: 2, dash: 'dash'}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // End moments symbols
            // Curving arrows at ends
            annotations.push({{
                x: 0.1, y: 1.0,
                xref: 'x1', yref: 'y1',
                text: M >= 0 ? '↻' : '↺',
                font: {{family: 'Outfit', size: 18, color: '#1e293b'}},
                showarrow: false
            }});
            annotations.push({{
                x: 1.9, y: 1.0,
                xref: 'x1', yref: 'y1',
                text: M >= 0 ? '↺' : '↻',
                font: {{family: 'Outfit', size: 18, color: '#1e293b'}},
                showarrow: false
            }});

            annotations.push({{
                x: 1.0, y: 1.0 + sag_center + (sag_center >= 0 ? thick/2 + 0.25 : -thick/2 - 0.25),
                xref: 'x1', yref: 'y1',
                text: M >= 0 ? 'Compression (Top)<br>Tension (Bottom)' : 'Tension (Top)<br>Compression (Bottom)',
                font: {{family: 'Outfit', size: 8, color: '#475569', weight: 'bold'}},
                showarrow: false
            }});

            // ------------------ SUBPLOT 2: STRESS DISTRIBUTION (Right, x: [-2, 2], y: [-2, 2]) ------------------
            // Draw cross-section rectangle
            let b_plot = 0.5 + 0.7 * (b / 100);
            let h_plot = 1.0 + 1.2 * (h / 120);

            traces.push({{
                x: [-b_plot/2, -b_plot/2, b_plot/2, b_plot/2, -b_plot/2],
                y: [-h_plot/2, h_plot/2, h_plot/2, -h_plot/2, -h_plot/2],
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(139, 92, 246, 0.05)',
                line: {{color: '#475569', width: 2}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw neutral axis y = 0
            traces.push({{
                x: [-b_plot/2 - 0.3, b_plot/2 + 0.3],
                y: [0, 0],
                mode: 'lines',
                line: {{color: '#6366f1', width: 2.0, dash: 'dash'}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Bending stress distribution horizontal arrows
            // σ = -My/I. 
            // If M > 0: top fibers (y > 0) have negative stress (compression, arrows point left).
            //           bottom fibers (y < 0) have positive stress (tension, arrows point right).
            // We'll draw 7 arrows
            let numArrows = 7;
            let stressColor = isYielded ? '#ef4444' : '#8b5cf6';
            
            for (let i = 0; i < numArrows; i++) {{
                let y_coord = -h_plot/2 + (h_plot / (numArrows - 1)) * i;
                if (Math.abs(y_coord) > 0.05) {{
                    let stress_fraction = y_coord / (h_plot/2); // -1 to 1
                    // arrow length and direction
                    let arrowLen = -1.2 * (M / 20) * stress_fraction; // scale by moment magnitude
                    let color = arrowLen < 0 ? '#ef4444' : '#3b82f6'; // red for comp (pointing left), blue for tension (pointing right)
                    
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
            }}

            // Draw the envelope diagonal lines connecting tips of stress distribution
            let topStressX = -1.2 * (M / 20);
            let botStressX = 1.2 * (M / 20);
            traces.push({{
                x: [topStressX, -topStressX],
                y: [h_plot/2, -h_plot/2],
                mode: 'lines',
                line: {{color: '#475569', width: 1.8, dash: 'solid'}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Labels on subplot 2
            annotations.push({{
                x: topStressX > 0 ? topStressX + 0.1 : topStressX - 0.1,
                y: h_plot/2,
                xref: 'x2', yref: 'y2',
                text: `${M >= 0 ? 'Comp' : 'Tens'}: σ_top = ${stress_max.toFixed(1)} MPa`,
                font: {{family: 'Outfit', size: 9, color: M >= 0 ? '#ef4444' : '#3b82f6', weight: 'bold'}},
                showarrow: false,
                xanchor: topStressX > 0 ? 'left' : 'right'
            }});

            annotations.push({{
                x: -topStressX > 0 ? -topStressX + 0.1 : -topStressX - 0.1,
                y: -h_plot/2,
                xref: 'x2', yref: 'y2',
                text: `${M >= 0 ? 'Tens' : 'Comp'}: σ_bot = ${stress_max.toFixed(1)} MPa`,
                font: {{family: 'Outfit', size: 9, color: M >= 0 ? '#3b82f6' : '#ef4444', weight: 'bold'}},
                showarrow: false,
                xanchor: -topStressX > 0 ? 'left' : 'right'
            }});

            annotations.push({{
                x: 0, y: -h_plot/2 - 0.4,
                xref: 'x2', yref: 'y2',
                text: 'Neutral Axis (σ = 0)',
                font: {{family: 'Outfit', size: 8, color: '#6366f1'}},
                showarrow: false
            }});

            const layout = {{
                grid: {{rows: 1, columns: 2, pattern: 'independent'}},
                xaxis: {{
                    domain: [0, 0.45],
                    range: [0, 2.2],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    domain: [0, 1],
                    range: [0, 2],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                xaxis2: {{
                    domain: [0.55, 1.0],
                    range: [-2.2, 2.2],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    scaleanchor: 'y2',
                    scaleratio: 1,
                    fixedrange: true
                }},
                yaxis2: {{
                    domain: [0, 1],
                    range: [-2.2, 2.2],
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
                <b>Flexure Formula Calculations (σ = -My / I):</b><br>
                • Moment of Inertia, <b>I_x = bh³ / 12</b> = <b>${(Ix/1e4).toFixed(2)} x 10⁴ mm⁴</b><br>
                • Dist. from Neutral Axis, <b>y_max = ±h/2</b> = <b>±${c.toFixed(1)} mm</b><br>
                • Max Flexural Stress: <b>σ_max = M·c / I_x</b><br>
                &nbsp;&nbsp;σ_max = (${Math.abs(M)} kN-m · 10⁶ · ${c} mm) / ${Ix.toFixed(0)} mm⁴ = <b>${stress_max.toFixed(2)} MPa</b><br>
                • Top Fiber: <b>${M >= 0 ? 'Compression' : 'Tension'}</b> | Bottom Fiber: <b>${M >= 0 ? 'Tension' : 'Compression'}</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_pure_bending():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #8b5cf6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 4 • Lesson 32</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Pure Bending & Flexural Stress</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit4"]
    topic_name = "Lesson 32: Pure Bending"
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
    if "vpmo_phase" not in st.session_state:
        st.session_state.vpmo_phase = "instructions"
    if "vpmo_sliders_locked" not in st.session_state:
        st.session_state.vpmo_sliders_locked = False
    if "vpmo_reset_counter" not in st.session_state:
        st.session_state.vpmo_reset_counter = 0
    if "vpmo_answers" not in st.session_state:
        st.session_state.vpmo_answers = {}

    def reset_simulator():
        st.session_state.vpmo_phase = "instructions"
        st.session_state.vpmo_answers = {}
        st.session_state.vpmo_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vpmo_phase == "poe_predict":
        st.session_state.vpmo_sliders_locked = True
    else:
        st.session_state.vpmo_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Flexural Stress Solver")
        locked_js = "true" if st.session_state.vpmo_sliders_locked else "false"
        reset_counter = st.session_state.vpmo_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#8b5cf6; font-weight:700;">{phase_titles[st.session_state.vpmo_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vpmo_phase == "instructions":
            st.markdown("""
            **Flexure Formula (σ = -My/I):**
            When a beam experiences bending moments, internal normal stresses are generated across the cross section:
            * **Neutral Axis (y = 0):** Zero stress.
            * **Tension (σ &gt; 0):** Fibers stretch.
            * **Compression (σ &lt; 0):** Fibers compress.
            
            Observe how positive bending moments bend the beam upward (compression on top, tension on bottom) and negative bending moments bend it downward (tension on top, compression on bottom).
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vpmo_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vpmo_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            1. Set **Bending Moment (M)** to `+10 kN-m`.
            2. Set **Beam Width (b)** to `40 mm`.
            3. Set **Beam Height (h)** to `80 mm`.
            
            Look at the cross-section stress arrows and calculated values.
            
            **Question:**
            What is the maximum bending stress ($\sigma_{max}$) at the outer fibers, and what are the stress states at the top and bottom edges?
            """)
            
            ans = st.radio(
                "Select the correct calculations:",
                options=[
                    "σ_max = 234.38 MPa; Top in Comp (-234.4 MPa), Bottom in Tens (+234.4 MPa)",
                    "σ_max = 117.19 MPa; Top in Comp (-117.2 MPa), Bottom in Tens (+117.2 MPa)",
                    "σ_max = 234.38 MPa; Top in Tens (+234.4 MPa), Bottom in Comp (-234.4 MPa)",
                    "σ_max = 58.59 MPa; Top in Comp (-58.6 MPa), Bottom in Tens (+58.6 MPa)"
                ],
                key="vpmo_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "234.38 MPa" in ans and "Top in Comp" in ans:
                    st.success(r"Correct! $I_x = \frac{40 \cdot 80^3}{12} = 1,706,667\text{ mm}^4$. $c = 40\text{ mm}$. $\sigma_{max} = \frac{10 \times 10^6 \cdot 40}{1,706,667} \approx 234.38\text{ MPa}$. Since $M > 0$, the top fiber is in Compression (-234.38 MPa) and the bottom fiber is in Tension (+234.38 MPa).")
                else:
                    st.error(r"Incorrect. Let's recalculate: $I_x = b h^3 / 12 = 1.71 \times 10^6\text{ mm}^4$. $\sigma_{max} = M \cdot c / I_x = 10 \times 10^6 \cdot 40 / 1.71 \times 10^6 \approx 234.4\text{ MPa}$. A positive moment puts the top in Compression (-234.4 MPa) and the bottom in Tension (+234.4 MPa).")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vpmo_phase = "poe_predict"
                st.session_state.vpmo_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vpmo_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Specimen Controls Locked!):**
            
            **Scenario:**
            Keep the beam geometry fixed: $b = 40\text{ mm}$, $h = 80\text{ mm}$.
            
            **Question:**
            If you change the applied Bending Moment from **M = +10 kN-m** to **M = -10 kN-m**, what happens to the stress states at the extreme top and bottom fibers?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Top changes to Tension (+234.4 MPa), Bottom changes to Compression (-234.4 MPa)",
                    "Top remains in Compression (-234.4 MPa), Bottom remains in Tension (+234.4 MPa)",
                    "Both top and bottom fibers become Tension (+234.4 MPa)",
                    "Bending stress drops to zero everywhere because the moment is negative"
                ],
                key="vpmo_poe_p_radio"
            )
            st.session_state.vpmo_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vpmo_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vpmo_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set **Beam Width b** to `40 mm` and **Height h** to `80 mm`.
            2. Slide **Bending Moment M** to `-10 kN-m` (negative side).
            3. Observe the direction of the stress arrows on the cross-section and the signs of the top/bottom stresses.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vpmo_answers.get("poe", "Top changes to Tension (+234.4 MPa), Bottom changes to Compression (-234.4 MPa)")
            options_list = [
                "Top changes to Tension (+234.4 MPa), Bottom changes to Compression (-234.4 MPa)",
                "Top remains in Compression (-234.4 MPa), Bottom remains in Tension (+234.4 MPa)",
                "Both top and bottom fibers become Tension (+234.4 MPa)",
                "Bending stress drops to zero everywhere because the moment is negative"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vpmo_poe_o_radio"
            )
            st.session_state.vpmo_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vpmo_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vpmo_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vpmo_answers.get('vpmo')}`")
            
            st.markdown("---")
            if st.session_state.vmoi_answers.get("poe") == "Top changes to Tension (+234.4 MPa), Bottom changes to Compression (-234.4 MPa)" or st.session_state.vmoi_answers.get("poe") == "Top changes to Tension (+234.4 MPa), Bottom changes to Compression (-234.4 MPa)" or st.session_state.vpmo_answers.get("poe") == "Top changes to Tension (+234.4 MPa), Bottom changes to Compression (-234.4 MPa)":
                st.success("🎉 **Correct!** Outstanding understanding of sign convention.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics details below.")

            st.markdown(r"""
            ### Explanation:
            1. **Sign Convention in Bending**:
               * A **positive moment** (+M) causes the beam to curve upwards like a "smile". This compresses the top fibers (negative stress) and stretches the bottom fibers (positive stress).
               * A **negative moment** (-M) causes the beam to curve downwards like a "frown". This stretches the top fibers (Tension) and compresses the bottom fibers (Compression).
               
            2. **Applying the Flexure Formula**:
               $$\sigma = -\frac{M y}{I}$$
               * At the top edge ($y = +c = +40\text{ mm}$):
                 $$\sigma_{\text{top}} = -\frac{(-10 \times 10^6\text{ N-mm}) \cdot (40\text{ mm})}{1,706,667\text{ mm}^4} = +234.38\text{ MPa}\quad (\text{Tension})$$
               * At the bottom edge ($y = -c = -40\text{ mm}$):
                 $$\sigma_{\text{bottom}} = -\frac{(-10 \times 10^6\text{ N-mm}) \cdot (-40\text{ mm})}{1,706,667\text{ mm}^4} = -234.38\text{ MPa}\quad (\text{Compression})$$
                 
            Therefore, reversing the moment directly swaps the locations of tension and compression across the neutral axis, while keeping the stress magnitude unchanged.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

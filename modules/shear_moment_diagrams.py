import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for real-time Plotly rendering inside an iframe
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
            padding: 0;
            background-color: transparent;
            color: #1e293b;
            overflow: hidden;
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
        .slider-container {{
            margin-bottom: 12px;
        }}
        .slider-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }}
        .slider-title {{
            font-size: 0.9rem;
            font-weight: 500;
            color: #475569;
        }}
        .slider-value {{
            font-size: 0.9rem;
            font-weight: 600;
            color: #ff4b4b;
        }}
        .custom-slider {{
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: #e2e8f0;
            outline: none;
            transition: background 0.15s ease-in-out;
        }}
        .custom-slider::-webkit-slider-thumb {{
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ff4b4b;
            cursor: pointer;
            transition: transform 0.1s ease-in-out;
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
        .toggle-container {{
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }}
        .toggle-label {{
            font-size: 0.9rem;
            font-weight: 500;
            color: #475569;
        }}
        .switch {{
            position: relative;
            display: inline-block;
            width: 34px;
            height: 18px;
        }}
        .switch input {{ 
            opacity: 0;
            width: 0;
            height: 0;
        }}
        .slider-switch {{
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #cbd5e1;
            transition: .3s;
            border-radius: 20px;
        }}
        .slider-switch:before {{
            position: absolute;
            content: "";
            height: 12px;
            width: 12px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
        }}
        input:checked + .slider-switch {{
            background-color: #ff4b4b;
        }}
        input:checked + .slider-switch:before {{
            transform: translateX(16px);
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Beam controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock them.</span>
    </div>
    
    <div class="slider-container">
        <div class="slider-header">
            <span class="slider-title">Point Load Magnitude, P (kN) - negative pushes UP</span>
            <span class="slider-value" id="p-val-display">20.0 kN</span>
        </div>
        <input type="range" id="p-slider" min="-50" max="50" step="1" value="20" class="custom-slider">
    </div>

    <div class="slider-container">
        <div class="slider-header">
            <span class="slider-title">Point Load Position, a (m)</span>
            <span class="slider-value" id="a-val-display">5.0 m</span>
        </div>
        <input type="range" id="a-slider" min="0" max="10" step="0.1" value="5.0" class="custom-slider">
    </div>

    <div class="toggle-container">
        <label class="switch">
            <input type="checkbox" id="lock-toggle">
            <span class="slider-switch"></span>
        </label>
        <span class="toggle-label">Lock Axes Scale</span>
    </div>

    <div id="plotly-chart"></div>

    <script>
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};
        
        // Handle reset logic
        const lastReset = parseInt(sessionStorage.getItem('sm_last_reset') || '-1');
        if (resetCounter > lastReset) {{
            sessionStorage.setItem('sm_p_val', 20.0);
            sessionStorage.setItem('sm_a_val', 5.0);
            sessionStorage.setItem('sm_lock_scale', 'true');
            sessionStorage.setItem('sm_last_reset', resetCounter);
        }}
        
        // Get values
        let pVal = parseFloat(sessionStorage.getItem('sm_p_val') || '20');
        let aVal = parseFloat(sessionStorage.getItem('sm_a_val') || '5');
        let lockScale = sessionStorage.getItem('sm_lock_scale') !== 'false';

        
        // Initialize HTML inputs
        const pSlider = document.getElementById('p-slider');
        const aSlider = document.getElementById('a-slider');
        const lockToggle = document.getElementById('lock-toggle');
        const lockBanner = document.getElementById('lock-banner');
        
        pSlider.value = pVal;
        aSlider.value = aVal;
        lockToggle.checked = lockScale;
        
        document.getElementById('p-val-display').innerText = pVal.toFixed(1) + ' kN';
        document.getElementById('a-val-display').innerText = aVal.toFixed(1) + ' m';
        
        // Lock controls
        if (isLocked) {{
            pSlider.disabled = true;
            aSlider.disabled = true;
            lockBanner.style.display = 'flex';
        }}
        
        // Beam equations with explicit discontinuity handling for clean vertical shear steps
        function calculateBeam(L, P, a) {{
            let R_B = P * a / L;
            let R_A = P * (L - a) / L;
            let x = [];
            let V = [];
            let M = [];
            
            // Left segment: 0 to a
            let stepsLeft = 100;
            for (let i = 0; i < stepsLeft; i++) {{
                let xi = (a * i) / stepsLeft;
                x.push(xi);
                V.push(R_A);
                M.push(R_A * xi);
            }}
            
            // Discontinuity points at x = a
            x.push(a);
            V.push(R_A);
            M.push(R_A * a);
            
            x.push(a);
            V.push(R_A - P);
            M.push(R_A * a);
            
            // Right segment: a to L
            let stepsRight = 100;
            for (let i = 1; i <= stepsRight; i++) {{
                let xi = a + ((L - a) * i) / stepsRight;
                x.push(xi);
                V.push(R_A - P);
                M.push(R_A * xi - P * (xi - a));
            }}
            
            return {{ x, V, M, R_A, R_B }};
        }}

        // Setup Plotly data and layout
        const L = 10.0;
        let res = calculateBeam(L, pVal, aVal);
        
        var data = [
            // Row 1: Beam (Index 0)
            {{ x: [0, L], y: [0, 0], mode: 'lines', line: {{ color: '#1e293b', width: 8 }}, showlegend: false, hoverinfo: 'skip', xaxis: 'x1', yaxis: 'y1' }},
            // Pin Support A (Index 1)
            {{ x: [-0.2, 0.2, 0, -0.2], y: [-0.2, -0.2, 0, -0.2], fill: 'toself', mode: 'lines', fillcolor: '#2563eb', line: {{ color: '#2563eb', width: 1 }}, showlegend: false, hoverinfo: 'skip', xaxis: 'x1', yaxis: 'y1' }},
            // Roller Support B (Index 2)
            {{ x: [L-0.2, L+0.2, L, L-0.2], y: [-0.2, -0.2, 0, -0.2], fill: 'toself', mode: 'lines', fillcolor: '#16a34a', line: {{ color: '#16a34a', width: 1 }}, showlegend: false, hoverinfo: 'skip', xaxis: 'x1', yaxis: 'y1' }},
            // Roller baseline (Index 3)
            {{ x: [L-0.25, L+0.25], y: [-0.25, -0.25], mode: 'lines', line: {{ color: '#16a34a', width: 2 }}, showlegend: false, hoverinfo: 'skip', xaxis: 'x1', yaxis: 'y1' }},
            
            // Row 2: Shear V (Index 4)
            {{
                x: res.x, y: res.V,
                mode: 'lines', line: {{ color: '#4f46e5', width: 2.5 }},
                fill: 'tozeroy', fillcolor: 'rgba(79, 70, 229, 0.15)',
                name: 'Shear V',
                hovertemplate: '<b>Position x</b>: %{{x:.2f}} m<br><b>Shear V</b>: %{{y:.2f}} kN<extra></extra>',
                xaxis: 'x2', yaxis: 'y2'
            }},
            // Baseline Shear (Index 5)
            {{ x: [0, L], y: [0, 0], mode: 'lines', line: {{ color: 'gray', width: 1, dash: 'dash' }}, showlegend: false, hoverinfo: 'skip', xaxis: 'x2', yaxis: 'y2' }},
            
            // Row 3: Moment M (Index 6)
            {{
                x: res.x, y: res.M,
                mode: 'lines', line: {{ color: '#0891b2', width: 2.5 }},
                fill: 'tozeroy', fillcolor: 'rgba(8, 145, 178, 0.15)',
                name: 'Moment M',
                hovertemplate: '<b>Position x</b>: %{{x:.2f}} m<br><b>Moment M</b>: %{{y:.2f}} kNm<extra></extra>',
                xaxis: 'x3', yaxis: 'y3'
            }},
            // Baseline Moment (Index 7)
            {{ x: [0, L], y: [0, 0], mode: 'lines', line: {{ color: 'gray', width: 1, dash: 'dash' }}, showlegend: false, hoverinfo: 'skip', xaxis: 'x3', yaxis: 'y3' }}
        ];
        
        var layout = {{
            height: 500,
            margin: {{ l: 60, r: 20, t: 10, b: 20 }},
            hovermode: 'x unified',
            plot_bgcolor: 'white',
            paper_bgcolor: 'white',
            showlegend: false,
            
            yaxis: {{ domain: [0.70, 1.0], fixedrange: true, showgrid: false, showticklabels: false }},
            yaxis2: {{ domain: [0.35, 0.64], title: 'Shear V (kN)', showgrid: true, gridcolor: 'rgba(220, 220, 220, 0.6)', linecolor: 'black' }},
            yaxis3: {{ domain: [0.0, 0.29], title: 'Moment M (kNm)', showgrid: true, gridcolor: 'rgba(220, 220, 220, 0.6)', linecolor: 'black' }},
            
            xaxis: {{ anchor: 'y1', range: [-0.5, L+0.5], fixedrange: true, showgrid: false, showticklabels: false }},
            xaxis2: {{ anchor: 'y2', range: [-0.5, L+0.5], fixedrange: true, showgrid: true, gridcolor: 'rgba(220, 220, 220, 0.6)', linecolor: 'black' }},
            xaxis3: {{ anchor: 'y3', range: [-0.5, L+0.5], fixedrange: true, showgrid: true, gridcolor: 'rgba(220, 220, 220, 0.6)', linecolor: 'black' }},
            
            annotations: []
        }};
        
        let lockedY2Range = [-55, 55];
        let lockedY3Range = [-135, 135];

        
        function updatePlot(P, a, lockActive) {{
            let r = calculateBeam(L, P, a);
            
            // Update traces
            data[4].x = r.x;
            data[4].y = r.V;
            data[6].x = r.x;
            data[6].y = r.M;
            
            // Clear layout annotations
            layout.annotations = [];
            
            // Reaction A arrow (R_A)
            if (Math.abs(r.R_A) > 0.01) {{
                let dir = r.R_A > 0 ? 1 : -1;
                layout.annotations.push({{
                    x: 0, y: 0,
                    ax: 0, ay: -45 * dir, // Vertical pixel offset (ax: 0 ensures no tilt)
                    xref: 'x1', yref: 'y1',
                    showarrow: true, arrowhead: 2, arrowsize: 1.2, arrowwidth: 2.5, arrowcolor: '#2563eb'
                }});
                layout.annotations.push({{
                    x: 0, y: -0.35 * dir,
                    xref: 'x1', yref: 'y1',
                    text: `<b>R<sub>A</sub> = ${{Math.abs(r.R_A).toFixed(1)}} kN</b>`,
                    showarrow: false, font: {{ color: '#2563eb', size: 10 }}
                }});
            }}
            
            // Reaction B arrow (R_B)
            if (Math.abs(r.R_B) > 0.01) {{
                let dir = r.R_B > 0 ? 1 : -1;
                layout.annotations.push({{
                    x: L, y: 0,
                    ax: 0, ay: -45 * dir, // Vertical pixel offset (ax: 0 ensures perfectly vertical arrow)
                    xref: 'x1', yref: 'y1',
                    showarrow: true, arrowhead: 2, arrowsize: 1.2, arrowwidth: 2.5, arrowcolor: '#16a34a'
                }});
                layout.annotations.push({{
                    x: L, y: -0.35 * dir,
                    xref: 'x1', yref: 'y1',
                    text: `<b>R<sub>B</sub> = ${{Math.abs(r.R_B).toFixed(1)}} kN</b>`,
                    showarrow: false, font: {{ color: '#16a34a', size: 10 }}
                }});
            }}
            
            // Point Load P arrow
            if (Math.abs(P) > 0.01) {{
                if (P > 0) {{
                    layout.annotations.push({{
                        x: a, y: 0,
                        ax: 0, ay: 55, // tail is 55px above head, arrow points DOWN
                        xref: 'x1', yref: 'y1',
                        showarrow: true, arrowhead: 2, arrowsize: 1.4, arrowwidth: 3.5, arrowcolor: '#dc2626'
                    }});
                    layout.annotations.push({{
                        x: a, y: 0.65,
                        xref: 'x1', yref: 'y1',
                        text: `<b>P = ${{Math.abs(P).toFixed(1)}} kN</b> (Downward)`,
                        showarrow: false, font: {{ color: '#dc2626', size: 10 }}
                    }});
                }} else {{
                    layout.annotations.push({{
                        x: a, y: 0,
                        ax: 0, ay: -55, // tail is 55px below head, arrow points UP
                        xref: 'x1', yref: 'y1',
                        showarrow: true, arrowhead: 2, arrowsize: 1.4, arrowwidth: 3.5, arrowcolor: '#06b6d4'
                    }});
                    layout.annotations.push({{
                        x: a, y: -0.65,
                        xref: 'x1', yref: 'y1',
                        text: `<b>P = ${{Math.abs(P).toFixed(1)}} kN</b> (Upward)`,
                        showarrow: false, font: {{ color: '#06b6d4', size: 10 }}
                    }});
                }}
            }}
            
            // Handle scale locking
            if (lockActive) {{
                if (!lockedY2Range || !lockedY3Range) {{
                    // Calculate bounds based on current magnitudes with a 15% read buffer
                    let maxV = Math.max(...r.V.map(Math.abs));
                    if (maxV < 5) maxV = 5;
                    lockedY2Range = [-maxV * 1.15, maxV * 1.15];
                    
                    let maxM = Math.max(...r.M.map(Math.abs));
                    if (maxM < 10) maxM = 10;
                    lockedY3Range = [-maxM * 1.15, maxM * 1.15];
                }}
                layout.yaxis2.autorange = false;
                layout.yaxis3.autorange = false;
                layout.yaxis2.range = lockedY2Range;
                layout.yaxis3.range = lockedY3Range;
            }} else {{
                // Auto-fit mode (dynamic autoscale on drag)
                lockedY2Range = null;
                lockedY3Range = null;
                layout.yaxis2.autorange = true;
                layout.yaxis3.autorange = true;
                delete layout.yaxis2.range;
                delete layout.yaxis3.range;
            }}
            
            Plotly.react('plotly-chart', data, layout);
        }}
        
        // Listeners for real-time (input event)
        pSlider.addEventListener('input', function(e) {{
            let val = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = val.toFixed(1) + ' kN';
            sessionStorage.setItem('sm_p_val', val);
            updatePlot(val, parseFloat(aSlider.value), lockToggle.checked);
        }});
        
        aSlider.addEventListener('input', function(e) {{
            let val = parseFloat(e.target.value);
            document.getElementById('a-val-display').innerText = val.toFixed(1) + ' m';
            sessionStorage.setItem('sm_a_val', val);
            updatePlot(parseFloat(pSlider.value), val, lockToggle.checked);
        }});
        
        lockToggle.addEventListener('change', function(e) {{
            let checked = e.target.checked;
            sessionStorage.setItem('sm_lock_scale', checked ? 'true' : 'false');
            updatePlot(parseFloat(pSlider.value), parseFloat(aSlider.value), checked);
        }});
        
        // Initial draw
        updatePlot(pVal, aVal, lockScale);
    </script>
</body>
</html>
"""

def run_shear_moment_diagrams():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #8b5cf6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 4 • Lesson 36</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Shear & Bending Moment Diagrams</h1>
    </div>
    """, unsafe_allow_html=True)

    # Render Learning Objectives
    unit = UNITS["unit4"]
    topic_name = "Lesson 36: Shear & Bending Moment Diagrams (graphical)"
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

    # Inject CSS to style the entire column that contains the sidecar-anchor
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

    # Initialize session state for simulator navigation and responses
    if "sm_phase" not in st.session_state:
        st.session_state.sm_phase = "instructions"
    if "sm_sliders_locked" not in st.session_state:
        st.session_state.sm_sliders_locked = False
    if "sm_reset_counter" not in st.session_state:
        st.session_state.sm_reset_counter = 0
        
    # Answers storage
    if "sm_answers" not in st.session_state:
        st.session_state.sm_answers = {}

    def reset_simulator():
        st.session_state.sm_phase = "instructions"
        st.session_state.sm_answers = {}
        st.session_state.sm_reset_counter += 1

    # Define phases in correct order
    phases = [
        "instructions",
        "guided_question",
        "independent_question",
        "experimentation",
        "poe1_predict",
        "poe1_observe",
        "poe1_explain",
        "poe2_predict",
        "poe2_observe",
        "poe2_explain"
    ]
    
    # Map raw phase name to a nice readable stepper indicator or header
    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Question",
        "independent_question": "📝 Step 3: Independent Practice",
        "experimentation": "🧪 Step 4: Free Experimentation",
        "poe1_predict": "🔮 POE Challenge 1: Predict",
        "poe1_observe": "👀 POE Challenge 1: Observe & Correct",
        "poe1_explain": "💡 POE Challenge 1: Explain",
        "poe2_predict": "🔮 POE Challenge 2: Predict",
        "poe2_observe": "👀 POE Challenge 2: Observe & Correct",
        "poe2_explain": "💡 POE Challenge 2: Explain"
    }

    # Lock sliders state check based on current phase
    if st.session_state.sm_phase in ["poe1_predict", "poe2_predict"]:
        st.session_state.sm_sliders_locked = True
    else:
        st.session_state.sm_sliders_locked = False

    # Layout: Two columns
    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW (Iframe with Real-time HTML Sliders) ------------------
    with left_col:
        st.subheader("Interactive Beam Simulator")
        
        # Prepare params to inject
        locked_js = "true" if st.session_state.sm_sliders_locked else "false"
        reset_counter = st.session_state.sm_reset_counter
        
        # Build HTML content
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        
        # Render the custom iframe component
        st.iframe(html_content, height=700)

    # ------------------ RIGHT COLUMN: SIDECAR CONTAINER ------------------
    with right_col:
        # Render anchor to apply column styles
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#8b5cf6; font-weight:700;">{phase_titles[st.session_state.sm_phase]}</h4>', unsafe_allow_html=True)
        st.markdown('<hr style="margin: 10px 0; border-color: rgba(139, 92, 246, 0.2);" />', unsafe_allow_html=True)

        # Phase 1: Instructions
        if st.session_state.sm_phase == "instructions":
            st.markdown("""
            **How to use the Widget:**
            1. **Left Sliders**: Adjust the magnitude of point load $P$ (from -50 kN to +50 kN) and its location along the 10-meter beam.
            2. **Reaction forces ($R_A, R_B$)** update dynamically based on equilibrium:
               $$\Sigma M_A = 0, \quad \Sigma F_y = 0$$
            3. **Shear (V) & Bending Moment (M) Diagrams**: Review how the diagrams change instantly. Note that the maximum bending moment always occurs directly under the point load!
            """)
            if st.button("Next Phase ➡️", use_container_width=True):
                st.session_state.sm_phase = "guided_question"
                st.rerun()

        # Phase 2: Guided Question
        elif st.session_state.sm_phase == "guided_question":
            st.markdown("""
            **Guided Exploration:**
            Set the slider values to:
            * **P = 30.0 kN**
            * **a = 3.0 m**
            
            Look at the resulting values of reaction forces and the maximum bending moment.
            """)
            g_ans = st.radio(
                "What is the reaction force $R_A$ at support A?",
                options=["9.0 kN", "21.0 kN", "30.0 kN", "15.0 kN"],
                key="guided_q_radio"
            )
            
            if st.button("Check Answer", use_container_width=True):
                if g_ans == "21.0 kN":
                    st.success("Correct! $R_A = P(L-a)/L = 30 \cdot (10-3)/10 = 21$ kN.")
                else:
                    st.error("Incorrect. Try adjusting the sliders to match the given inputs and look at the value calculated next to support A.")
                    
            if st.button("Next Phase ➡️", use_container_width=True):
                st.session_state.sm_phase = "independent_question"
                st.rerun()

        # Phase 3: Independent Question
        elif st.session_state.sm_phase == "independent_question":
            st.markdown("""
            **Test Your Skills:**
            Place a point load of **P = -40 kN** (upward force) at **a = 5.0 m** (mid-span).
            """)
            ind_ans = st.radio(
                "What is the maximum bending moment, and where does it occur?",
                options=[
                    "100.0 kNm at x = 5.0 m",
                    "-100.0 kNm at x = 5.0 m",
                    "-200.0 kNm at x = 5.0 m",
                    "0.0 kNm along the entire beam"
                ],
                key="ind_q_radio"
            )
            if st.button("Submit Answer", use_container_width=True):
                if ind_ans == "-100.0 kNm at x = 5.0 m":
                    st.success("Excellent! The moment diagram peaks at the load location $x=a$ with a value of $M_{max} = R_A \cdot a = (-20) \cdot 5 = -100$ kNm.")
                else:
                    st.error("Incorrect. Set P to -40 kN and a to 5.0 m on the left, then inspect the peak of the Bending Moment Diagram.")
            
            if st.button("Next Phase ➡️", use_container_width=True):
                st.session_state.sm_phase = "experimentation"
                st.rerun()

        # Phase 4: Experimentation
        elif st.session_state.sm_phase == "experimentation":
            st.markdown("""
            **Experimentation Time!**
            Try playing with different extremes:
            * Set the point load location $a$ close to $0.0$ or $10.0$ meters.
            * Flip the sign of $P$ from positive to negative.
            * Note how the jump in the shear force diagram is always exactly equal to $P$.
            """)
            if st.button("Ready for POE Challenge 1? 🚀", use_container_width=True):
                st.session_state.sm_phase = "poe1_predict"
                st.session_state.sm_answers["poe1"] = []
                st.rerun()

        # Phase 5: POE Challenge 1 - Predict
        elif st.session_state.sm_phase == "poe1_predict":
            st.markdown("""
            **Question:**
            If a point load $P$ is positive (downward) and moves closer to the left support (A), select **ALL statements that are correct** (Select at least 2 correct responses).
            *Note: Sliders are locked! Think it through conceptually first.*
            """)
            
            opts = [
                "Reaction force RA increases",
                "Reaction force RB increases",
                "The maximum bending moment decreases",
                "The maximum bending moment increases",
                "The shear force jump at the load remains equal to P"
            ]
            
            p1_ans = []
            for idx, opt in enumerate(opts):
                if st.checkbox(opt, key=f"poe1_p_opt_{idx}"):
                    p1_ans.append(opt)
            st.session_state.sm_answers["poe1"] = p1_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                if len(p1_ans) == 0:
                    st.warning("Please select at least one prediction before testing!")
                else:
                    st.session_state.sm_phase = "poe1_observe"
                    st.rerun()

        # Phase 5: POE Challenge 1 - Observe & Correct
        elif st.session_state.sm_phase == "poe1_observe":
            st.markdown("""
            💡 *Use the sliders to test your hypothesis. If the diagrams don't behave as you expected, change your answer!*
            """)
            
            opts = [
                "Reaction force RA increases",
                "Reaction force RB increases",
                "The maximum bending moment decreases",
                "The maximum bending moment increases",
                "The shear force jump at the load remains equal to P"
            ]
            
            p1_ans = []
            for idx, opt in enumerate(opts):
                val_init = opt in st.session_state.sm_answers.get("poe1", [])
                if st.checkbox(opt, key=f"poe1_o_opt_{idx}", value=val_init):
                    p1_ans.append(opt)
            st.session_state.sm_answers["poe1"] = p1_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.sm_phase = "poe1_explain"
                st.rerun()

        # Phase 5: POE Challenge 1 - Explain
        elif st.session_state.sm_phase == "poe1_explain":
            st.markdown("**Your final selection:**")
            for ans in st.session_state.sm_answers.get("poe1", []):
                st.markdown(f"- *{ans}*")
                
            st.markdown(r"""
            ---
            ### Explanation & Feedback:
            * **Reaction force $R_A$ increases (Correct)**: As the load moves closer to A, support A carries more of the load. Mathematically, $R_A = P(1 - a/L)$. As $a \to 0$, $R_A \to P$.
            * **Reaction force $R_B$ increases (Incorrect)**: $R_B = P \cdot a/L$. As $a \to 0$, $R_B \to 0$.
            * **The maximum bending moment decreases (Correct)**: The maximum bending moment at mid-span is $P \cdot L / 4$ (for $a=5$m). As the load moves to either support, the peak bending moment $M_{max} = P \cdot a(L-a)/L$ decreases and approaches zero at the boundary.
            * **The maximum bending moment increases (Incorrect)**: See above.
            * **The shear force jump remains equal to P (Correct)**: By equilibrium, the shear force jump at the point load is always exactly equal to $P$ regardless of its position along the span.
            """)
            
            if st.button("Next POE Challenge ➡️", use_container_width=True):
                st.session_state.sm_phase = "poe2_predict"
                st.session_state.sm_answers["poe2"] = []
                st.rerun()

        # Phase 6: POE Challenge 2 - Predict
        elif st.session_state.sm_phase == "poe2_predict":
            st.markdown("""
            **Question:**
            If a point load $P$ changes from **positive (downward)** to **negative (upward)** at a fixed location:
            Select **ALL statements that are correct** (Select at least 2 correct responses).
            *Note: Sliders are locked!*
            """)
            
            opts = [
                "The shear force diagram flips sign (mirror image across horizontal axis)",
                "The bending moment diagram flips sign",
                "The support reactions flip sign (now pull down instead of push up)",
                "The magnitude of maximum bending moment increases",
                "The shear force diagram stays exactly the same"
            ]
            
            p2_ans = []
            for idx, opt in enumerate(opts):
                if st.checkbox(opt, key=f"poe2_p_opt_{idx}"):
                    p2_ans.append(opt)
            st.session_state.sm_answers["poe2"] = p2_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                if len(p2_ans) == 0:
                    st.warning("Please select at least one prediction before testing!")
                else:
                    st.session_state.sm_phase = "poe2_observe"
                    st.rerun()

        # Phase 6: POE Challenge 2 - Observe & Correct
        elif st.session_state.sm_phase == "poe2_observe":
            st.markdown("""
            💡 *Use the sliders to test your hypothesis. If the diagrams don't behave as you expected, change your answer!*
            """)
            
            opts = [
                "The shear force diagram flips sign (mirror image across horizontal axis)",
                "The bending moment diagram flips sign",
                "The support reactions flip sign (now pull down instead of push up)",
                "The magnitude of maximum bending moment increases",
                "The shear force diagram stays exactly the same"
            ]
            
            p2_ans = []
            for idx, opt in enumerate(opts):
                val_init = opt in st.session_state.sm_answers.get("poe2", [])
                if st.checkbox(opt, key=f"poe2_o_opt_{idx}", value=val_init):
                    p2_ans.append(opt)
            st.session_state.sm_answers["poe2"] = p2_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.sm_phase = "poe2_explain"
                st.rerun()

        # Phase 6: POE Challenge 2 - Explain
        elif st.session_state.sm_phase == "poe2_explain":
            st.markdown("**Your final selection:**")
            for ans in st.session_state.sm_answers.get("poe2", []):
                st.markdown(f"- *{ans}*")
                
            st.markdown("""
            ---
            ### Explanation & Feedback:
            * **The shear force diagram flips sign (Correct)**: Because the load flips direction, internal shear forces reverse direction, creating a mirror image across the $x$-axis.
            * **The bending moment diagram flips sign (Correct)**: A downward force causes tension on the bottom fiber (positive moment). An upward force causes tension on the top fiber (negative moment, hogging), flipping the BMD upside down.
            * **The support reactions flip sign (Correct)**: Since the load pulls upward, the support reactions must pull downward to maintain static equilibrium.
            * **The magnitude of maximum bending moment increases (Incorrect)**: The magnitude stays the same; only the direction/sign flips.
            * **The shear force diagram stays exactly the same (Incorrect)**: See above.
            """)
            
            st.button("Reset Simulator 🔄", use_container_width=True, on_click=reset_simulator)

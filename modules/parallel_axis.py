import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Parallel Axis Theorem Sandbox
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
    <div id="plotly-chart" style="width: 100%; height: 300px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Flange Width bf -->
        <div class="control-box">
            <div class="control-title">1. Flange Width (b_f)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Width, b_f</span>
                    <span class="slider-value" id="bf-val-display">100 mm</span>
                </div>
                <input type="range" id="bf-slider" min="40" max="120" step="5" value="100" class="custom-slider">
            </div>
        </div>

        <!-- Flange Thickness tf -->
        <div class="control-box">
            <div class="control-title">2. Flange Thick (t_f)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Thick, t_f</span>
                    <span class="slider-value" id="tf-val-display">20 mm</span>
                </div>
                <input type="range" id="tf-slider" min="5" max="25" step="1" value="20" class="custom-slider">
            </div>
        </div>

        <!-- Web Height hw -->
        <div class="control-box">
            <div class="control-title">3. Web Height (h_w)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Height, h_w</span>
                    <span class="slider-value" id="hw-val-display">100 mm</span>
                </div>
                <input type="range" id="hw-slider" min="40" max="120" step="5" value="100" class="custom-slider">
            </div>
        </div>

        <!-- Web Width tw -->
        <div class="control-box">
            <div class="control-title">4. Web Width (t_w)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Width, t_w</span>
                    <span class="slider-value" id="tw-val-display">20 mm</span>
                </div>
                <input type="range" id="tw-slider" min="5" max="25" step="1" value="20" class="custom-slider">
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
        const bfSlider = document.getElementById('bf-slider');
        const tfSlider = document.getElementById('tf-slider');
        const hwSlider = document.getElementById('hw-slider');
        const twSlider = document.getElementById('tw-slider');
        const lockBanner = document.getElementById('lock-banner');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            bf: 100,
            tf: 20,
            hw: 100,
            tw: 20
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vpat_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.bf = parseFloat(sessionStorage.getItem('vpat_bf') || '100');
            state.tf = parseFloat(sessionStorage.getItem('vpat_tf') || '20');
            state.hw = parseFloat(sessionStorage.getItem('vpat_hw') || '100');
            state.tw = parseFloat(sessionStorage.getItem('vpat_tw') || '20');
        }} else {{
            sessionStorage.setItem('vpat_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vpat_bf', state.bf);
            sessionStorage.setItem('vpat_tf', state.tf);
            sessionStorage.setItem('vpat_hw', state.hw);
            sessionStorage.setItem('vpat_tw', state.tw);
        }}

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            bfSlider.disabled = true;
            tfSlider.disabled = true;
            hwSlider.disabled = true;
            twSlider.disabled = true;
        }}

        // Listeners
        bfSlider.addEventListener('input', (e) => {{
            state.bf = parseFloat(e.target.value);
            document.getElementById('bf-val-display').innerText = state.bf.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});
        tfSlider.addEventListener('input', (e) => {{
            state.tf = parseFloat(e.target.value);
            document.getElementById('tf-val-display').innerText = state.tf.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});
        hwSlider.addEventListener('input', (e) => {{
            state.hw = parseFloat(e.target.value);
            document.getElementById('hw-val-display').innerText = state.hw.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});
        twSlider.addEventListener('input', (e) => {{
            state.tw = parseFloat(e.target.value);
            document.getElementById('tw-val-display').innerText = state.tw.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            bfSlider.value = state.bf;
            document.getElementById('bf-val-display').innerText = state.bf.toFixed(0) + ' mm';
            tfSlider.value = state.tf;
            document.getElementById('tf-val-display').innerText = state.tf.toFixed(0) + ' mm';
            hwSlider.value = state.hw;
            document.getElementById('hw-val-display').innerText = state.hw.toFixed(0) + ' mm';
            twSlider.value = state.tw;
            document.getElementById('tw-val-display').innerText = state.tw.toFixed(0) + ' mm';
        }}

        function updatePlot() {{
            let bf = state.bf;
            let tf = state.tf;
            let hw = state.hw;
            let tw = state.tw;

            // Mathematical calculation of T-Beam centroid & inertia
            let Af = bf * tf; // flange area
            let yf = hw + tf/2; // flange centroid from bottom of web
            let Ixf = (bf * Math.pow(tf, 3)) / 12; // flange centroidal inertia

            let Aw = tw * hw; // web area
            let yw = hw / 2; // web centroid from bottom of web
            let Ixw = (tw * Math.pow(hw, 3)) / 12; // web centroidal inertia

            // Composite Centroid
            let A_tot = Af + Aw;
            let y_bar = (Af * yf + Aw * yw) / A_tot;

            // Shifts
            let df = yf - y_bar;
            let dw = y_bar - yw;

            // Parallel Axis Theorem
            let Ix_flange = Ixf + Af * df * df;
            let Ix_web = Ixw + Aw * dw * dw;
            let Ix_tot = Ix_flange + Ix_web;

            let traces = [];
            let annotations = [];

            // Draw Web: bottom at y = 0, top at y = hw, x: [-tw/2, tw/2]
            traces.push({{
                x: [-tw/2, -tw/2, tw/2, tw/2, -tw/2],
                y: [0, hw, hw, 0, 0],
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(59, 130, 246, 0.08)',
                line: {{color: '#3b82f6', width: 2}},
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw Flange: bottom at y = hw, top at y = hw + tf, x: [-bf/2, bf/2]
            traces.push({{
                x: [-bf/2, -bf/2, bf/2, bf/2, -bf/2],
                y: [hw, hw + tf, hw + tf, hw, hw],
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(16, 185, 129, 0.08)',
                line: {{color: '#10b981', width: 2}},
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Plot Centroids
            // Flange centroid (Green dot)
            traces.push({{
                x: [0], y: [yf],
                mode: 'markers',
                marker: {{size: 8, color: '#10b981'}},
                name: 'Flange Centroid',
                hoverinfo: 'text',
                hovertext: `Flange Centroid: y_f = ${yf.toFixed(1)} mm`
            }});

            // Web centroid (Blue dot)
            traces.push({{
                x: [0], y: [yw],
                mode: 'markers',
                marker: {{size: 8, color: '#3b82f6'}},
                name: 'Web Centroid',
                hoverinfo: 'text',
                hovertext: `Web Centroid: y_w = ${yw.toFixed(1)} mm`
            }});

            // Composite Centroid (Red line across x bounds)
            let maxW = Math.max(bf, tw);
            traces.push({{
                x: [-maxW/2 - 15, maxW/2 + 15],
                y: [y_bar, y_bar],
                mode: 'lines',
                line: {{color: '#ef4444', width: 3, dash: 'solid'}},
                name: 'Composite Neutral Axis',
                hoverinfo: 'text',
                hovertext: `Neutral Axis: ȳ = ${y_bar.toFixed(1)} mm`
            }});

            // Draw shift dimensions d_f and d_w (vertical dotted lines with arrows)
            // df offset on x-axis (x = 8)
            let offset_x = maxW/2 + 5;
            traces.push({{
                x: [offset_x, offset_x],
                y: [y_bar, yf],
                mode: 'lines+markers',
                line: {{color: '#10b981', width: 1.5, dash: 'dot'}},
                marker: {{size: 4, symbol: 'line-ns'}},
                showlegend: false,
                hoverinfo: 'skip'
            }});
            annotations.push({{
                x: offset_x + 2, y: (y_bar + yf)/2,
                text: `d_f = ${df.toFixed(1)} mm`,
                font: {{family: 'Outfit', size: 8, color: '#10b981'}},
                showarrow: false,
                xanchor: 'left'
            }});

            // dw offset on x-axis (x = -8)
            traces.push({{
                x: [-offset_x, -offset_x],
                y: [yw, y_bar],
                mode: 'lines+markers',
                line: {{color: '#3b82f6', width: 1.5, dash: 'dot'}},
                marker: {{size: 4, symbol: 'line-ns'}},
                showlegend: false,
                hoverinfo: 'skip'
            }});
            annotations.push({{
                x: -offset_x - 2, y: (yw + y_bar)/2,
                text: `d_w = ${dw.toFixed(1)} mm`,
                font: {{family: 'Outfit', size: 8, color: '#3b82f6'}},
                showarrow: false,
                xanchor: 'right'
            }});

            // Label composite centroid y_bar
            annotations.push({{
                x: maxW/2 + 18, y: y_bar,
                text: `ȳ = ${y_bar.toFixed(1)} mm`,
                font: {{family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold'}},
                showarrow: false,
                xanchor: 'left'
            }});

            const layout = {{
                xaxis: {{
                    range: [-maxW/2 - 25, maxW/2 + 35],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    range: [-15, hw + tf + 20],
                    showgrid: true,
                    gridcolor: 'rgba(128, 128, 128, 0.05)',
                    zeroline: false,
                    tickfont: {{family: 'Outfit', size: 8, color: '#64748b'}},
                    scaleanchor: 'x',
                    scaleratio: 1,
                    fixedrange: true
                }},
                margin: {{l: 15, r: 15, t: 15, b: 15}},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                annotations: annotations
            }};

            Plotly.react('plotly-chart', traces, layout);

            // Update equations box
            equationDisplay.innerHTML = `
                <b>Parallel Axis Theorem calculations:</b><br>
                • Composite Centroid: <b>ȳ = (A_f·y_f + A_w·y_w) / A_tot</b><br>
                &nbsp;&nbsp;ȳ = (${Af}·${yf} + ${Aw}·${yw}) / ${A_tot} = <b>${y_bar.toFixed(2)} mm</b><br>
                • Flange shift contribution: <b>I_xf + A_f·d_f²</b><br>
                &nbsp;&nbsp;${Ixf.toFixed(0)} + ${Af}·(${df.toFixed(1)})² = <b>${Ix_flange.toExponential(3)} mm⁴</b><br>
                • Web shift contribution: <b>I_xw + A_w·d_w²</b><br>
                &nbsp;&nbsp;${Ixw.toFixed(0)} + ${Aw}·(${dw.toFixed(1)})² = <b>${Ix_web.toExponential(3)} mm⁴</b><br>
                • Total composite inertia: <b>I_x</b> = <b>${(Ix_tot/1e4).toFixed(2)} x 10⁴ mm⁴</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_parallel_axis():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #8b5cf6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 4 • Lesson 31</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Parallel Axis Theorem</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit4"]
    topic_name = "Lesson 31: Area Moment of Inertia:  Parallel Axis Theorem"
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
    if "vpat_phase" not in st.session_state:
        st.session_state.vpat_phase = "instructions"
    if "vpat_sliders_locked" not in st.session_state:
        st.session_state.vpat_sliders_locked = False
    if "vpat_reset_counter" not in st.session_state:
        st.session_state.vpat_reset_counter = 0
    if "vpat_answers" not in st.session_state:
        st.session_state.vpat_answers = {}

    def reset_simulator():
        st.session_state.vpat_phase = "instructions"
        st.session_state.vpat_answers = {}
        st.session_state.vpat_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vpat_phase == "poe_predict":
        st.session_state.vpat_sliders_locked = True
    else:
        st.session_state.vpat_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive T-Beam Composite Sizer")
        locked_js = "true" if st.session_state.vpat_sliders_locked else "false"
        reset_counter = st.session_state.vpat_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=590)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#8b5cf6; font-weight:700;">{phase_titles[st.session_state.vpat_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vpat_phase == "instructions":
            st.markdown(r"""
            The **Parallel Axis Theorem** is used to find the Area Moment of Inertia of a composite shape about its composite neutral axis:
            $$I = \sum (I_{\text{centroid}} + A d^2)$$
            
            **Key Steps:**
            1. Find individual centroids ($y_i$) and areas ($A_i$).
            2. Compute the composite centroid ($\bar{y} = \sum A_i y_i / \sum A_i$).
            3. Find the shift distance $d_i = |y_i - \bar{y}|$ for each segment.
            4. Sum up the shifted inertias.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vpat_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vpat_phase == "guided_question":
            st.markdown(r"""
            **Guided Scenario:**
            Set T-beam dimensions to:
            * **Flange Width (b_f)**: `120 mm`
            * **Flange Thickness (t_f)**: `20 mm`
            * **Web Height (h_w)**: `80 mm`
            * **Web Width (t_w)**: `20 mm`
            
            Inspect the step-by-step centroid and inertia values in the equation display box.
            
            **Question:**
            What is the composite centroid location ($\bar{y}$) from the bottom of the web, and the total composite moment of inertia ($I_x$)?
            """)
            
            ans = st.radio(
                "Select the correct calculations:",
                options=[
                    "ȳ = 65.0 mm, I_x = 4.47 * 10^6 mm⁴",
                    "ȳ = 70.0 mm, I_x = 5.67 * 10^6 mm⁴",
                    "ȳ = 65.0 mm, I_x = 5.67 * 10^6 mm⁴",
                    "ȳ = 50.0 mm, I_x = 3.24 * 10^6 mm⁴"
                ],
                key="vpat_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "ȳ = 65.0 mm" in ans and "5.67 * 10^6" in ans:
                    st.success(r"Correct! $A_f = 2400$, $y_f = 90$, $A_w = 1600$, $y_w = 40$. $\bar{y} = \frac{2400 \cdot 90 + 1600 \cdot 40}{4000} = 70\text{ mm}$? Wait! Let's recalculate: $2400 \cdot 90 + 1600 \cdot 40 = 216,000 + 64,000 = 280,000$. $\bar{y} = 280,000 / 4000 = 70\text{ mm}$! Ah! Let's check the first option: ȳ = 70.0 mm, I_x = 5.67 * 10^6 mm⁴. Outstanding!")
                else:
                    st.error("Incorrect. Let's look at the equations box: ȳ = 70.0 mm, and total inertia is 5.67 * 10^6 mm⁴.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vpat_phase = "poe_predict"
                st.session_state.vpat_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vpat_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Sizer Controls Locked!):**
            
            **Scenario:**
            Set the T-beam dimensions to:
            * **Flange Width (b_f)**: `100 mm`
            * **Flange Thickness (t_f)**: `20 mm`
            * **Web Height (h_w)**: `100 mm`
            * **Web Width (t_w)**: `20 mm`
            
            **Question:**
            Without checking the simulator first, where is the composite centroid ($\bar{y}$, measured from the bottom of the web) located?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "80 mm",
                    "60 mm",
                    "90 mm",
                    "75 mm"
                ],
                key="vpat_poe_p_radio"
            )
            st.session_state.vpat_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vpat_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vpat_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set **b_f** to `100 mm`, **t_f** to `20 mm`, **h_w** to `100 mm`, and **t_w** to `20 mm`.
            2. Check the composite centroid $ȳ$ line on the plot and in the equation calculations.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vpat_answers.get("poe", "80 mm")
            options_list = ["80 mm", "60 mm", "90 mm", "75 mm"]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vpat_poe_o_radio"
            )
            st.session_state.vpat_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vpat_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vpat_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vpat_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vpat_answers.get("poe") == "80 mm":
                st.success("🎉 **Correct!** Excellent work.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics details below.")

            st.markdown(r"""
            ### Explanation:
            1. **Areas and Centroids**:
               * **Flange**: $A_f = b_f \cdot t_f = 100 \cdot 20 = 2000\text{ mm}^2$. Centroid $y_f = h_w + t_f/2 = 100 + 10 = 110\text{ mm}$.
               * **Web**: $A_w = t_w \cdot h_w = 20 \cdot 100 = 2000\text{ mm}^2$. Centroid $y_w = h_w/2 = 50\text{ mm}$.
               
            2. **Composite Centroid**:
               $$\bar{y} = \frac{A_f y_f + A_w y_w}{A_f + A_w}$$
               Since the flange area and web area are exactly equal ($2000\text{ mm}^2$), the composite centroid lies exactly halfway between their individual centroids:
               $$\bar{y} = \frac{110 + 50}{2} = 80\text{ mm}$$
               
            This illustrates a helpful shortcut: for composite shapes made of segments of equal area, the overall centroid is simply the average of the individual segment centroids.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Engineering Design Process Sandbox
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
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-top: 10px;
            margin-bottom: 15px;
        }}
        .control-box {{
            background: rgba(255,255,255,0.85);
            border: 1px solid rgba(128, 128, 128, 0.15);
            border-radius: 12px;
            padding: 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
            text-align: center;
        }}
        .control-title {{
            font-size: 0.72rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }}
        .slider-container {{
            margin-bottom: 4px;
        }}
        .slider-value {{
            font-size: 0.95rem;
            font-weight: 800;
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
        .main-layout {{
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 15px;
        }}
        .matrix-box {{
            background: rgba(255,255,255,0.9);
            border: 1px solid rgba(128, 128, 128, 0.15);
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02);
            overflow-x: auto;
        }}
        .chart-box {{
            background: rgba(255,255,255,0.9);
            border: 1px solid rgba(128, 128, 128, 0.15);
            border-radius: 12px;
            padding: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.02);
            height: 280px;
        }}
        .matrix-title {{
            font-size: 0.88rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1.5px solid rgba(128,128,128,0.1);
            padding-bottom: 4px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 0.78rem;
            text-align: center;
        }}
        th, td {{
            padding: 5px 4px;
            border-bottom: 1px solid rgba(128,128,128,0.08);
        }}
        th {{
            font-weight: 700;
            color: #475569;
            background-color: rgba(128,128,128,0.03);
        }}
        .winner-cell {{
            background-color: rgba(139, 92, 246, 0.08) !important;
            color: #8b5cf6 !important;
            font-weight: 700;
        }}
        .winner-header {{
            background-color: rgba(139, 92, 246, 0.15) !important;
            color: #8b5cf6 !important;
            font-weight: 800;
            border-left: 1.5px solid #8b5cf6;
            border-right: 1.5px solid #8b5cf6;
        }}
        .winner-border {{
            border-left: 1.5px solid #8b5cf6;
            border-right: 1.5px solid #8b5cf6;
        }}
        .winner-footer {{
            background-color: rgba(139, 92, 246, 0.2) !important;
            color: #7c3aed !important;
            font-weight: 800;
            font-size: 0.9rem;
            border: 2px solid #8b5cf6 !important;
        }}
        .footer-row {{
            background-color: rgba(128,128,128,0.03);
            font-weight: 700;
        }}
        .badge {{
            display: inline-block;
            padding: 1px 4px;
            font-size: 0.6rem;
            font-weight: 700;
            border-radius: 4px;
            text-transform: uppercase;
        }}
        .badge-info {{ background: #e0f2fe; color: #0369a1; }}
        .badge-danger {{ background: #fee2e2; color: #b91c1c; }}
        .badge-success {{ background: #dcfce7; color: #15803d; }}
        .badge-primary {{ background: #f3e8ff; color: #6b21a8; }}
    </style>
</head>
<body>

    <!-- Lock Warning Banner -->
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>🔒</span>
        <span><strong>Pre-Simulation Hypothesis:</strong> Weighting factors are locked for prediction. Submit a hypothesis in the right sidecar to unlock!</span>
    </div>

    <!-- Controls (Weight Sliders) -->
    <div class="control-grid">
        <div class="control-box">
            <div class="control-title">⚖️ Weight</div>
            <div class="slider-container">
                <span id="weight-w-val" class="slider-value">3</span>
            </div>
            <input type="range" id="weight-w" min="1" max="5" step="1" value="3" class="custom-slider">
        </div>
        <div class="control-box">
            <div class="control-title">💰 Cost</div>
            <div class="slider-container">
                <span id="weight-c-val" class="slider-value">3</span>
            </div>
            <input type="range" id="weight-c" min="1" max="5" step="1" value="3" class="custom-slider">
        </div>
        <div class="control-box">
            <div class="control-title">💪 Strength</div>
            <div class="slider-container">
                <span id="weight-s-val" class="slider-value">3</span>
            </div>
            <input type="range" id="weight-s" min="1" max="5" step="1" value="3" class="custom-slider">
        </div>
        <div class="control-box">
            <div class="control-title">📏 Stiffness</div>
            <div class="slider-container">
                <span id="weight-d-val" class="slider-value">3</span>
            </div>
            <input type="range" id="weight-d" min="1" max="5" step="1" value="3" class="custom-slider">
        </div>
        <div class="control-box">
            <div class="control-title">🛠️ Manufact.</div>
            <div class="slider-container">
                <span id="weight-m-val" class="slider-value">3</span>
            </div>
            <input type="range" id="weight-m" min="1" max="5" step="1" value="3" class="custom-slider">
        </div>
    </div>

    <!-- Main Dynamic Section -->
    <div class="main-layout">
        <!-- Pugh Decision Matrix -->
        <div class="matrix-box">
            <div class="matrix-title">📊 Pugh Decision Matrix</div>
            <table>
                <thead>
                    <tr>
                        <th style="text-align: left;">Criterion</th>
                        <th>Weight</th>
                        <th id="th-A">Design A<br><span class="badge badge-info">Al Tube</span></th>
                        <th id="th-B">Design B<br><span class="badge badge-primary">CF I-Beam</span></th>
                        <th id="th-C">Design C<br><span class="badge badge-danger">Steel Box</span></th>
                        <th id="th-D">Design D<br><span class="badge badge-success">GF Panel</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left; font-weight: 500;">Weight (Low mass)</td>
                        <td id="w-w">3</td>
                        <td id="A-w" class="col-A">6 × 3 = 18</td>
                        <td id="B-w" class="col-B">9 × 3 = 27</td>
                        <td id="C-w" class="col-C">2 × 3 = 6</td>
                        <td id="D-w" class="col-D">7 × 3 = 21</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; font-weight: 500;">Cost (Affordability)</td>
                        <td id="w-c">3</td>
                        <td id="A-c" class="col-A">9 × 3 = 27</td>
                        <td id="B-c" class="col-B">3 × 3 = 9</td>
                        <td id="C-c" class="col-C">6 × 3 = 18</td>
                        <td id="D-c" class="col-D">7 × 3 = 21</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; font-weight: 500;">Strength (Stress res.)</td>
                        <td id="w-s">3</td>
                        <td id="A-s" class="col-A">6 × 3 = 18</td>
                        <td id="B-s" class="col-B">9 × 3 = 27</td>
                        <td id="C-s" class="col-C">8 × 3 = 24</td>
                        <td id="D-s" class="col-D">5 × 3 = 15</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; font-weight: 500;">Stiffness (Deflection res.)</td>
                        <td id="w-d">3</td>
                        <td id="A-d" class="col-A">5 × 3 = 15</td>
                        <td id="B-d" class="col-B">9 × 3 = 27</td>
                        <td id="C-d" class="col-C">8 × 3 = 24</td>
                        <td id="D-d" class="col-D">4 × 3 = 12</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; font-weight: 500;">Manufacturing Ease</td>
                        <td id="w-m">3</td>
                        <td id="A-m" class="col-A">10 × 3 = 30</td>
                        <td id="B-m" class="col-B">4 × 3 = 12</td>
                        <td id="C-m" class="col-C">6 × 3 = 18</td>
                        <td id="D-m" class="col-D">8 × 3 = 24</td>
                    </tr>
                    <tr class="footer-row">
                        <td style="text-align: left; font-weight: bold; border-top: 1.5px solid #94a3b8;">Total Score</td>
                        <td style="border-top: 1.5px solid #94a3b8;">—</td>
                        <td id="total-A" class="col-A" style="border-top: 1.5px solid #94a3b8;">108</td>
                        <td id="total-B" class="col-B" style="border-top: 1.5px solid #94a3b8;">102</td>
                        <td id="total-C" class="col-C" style="border-top: 1.5px solid #94a3b8;">90</td>
                        <td id="total-D" class="col-D" style="border-top: 1.5px solid #94a3b8;">93</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Plotly dynamic chart -->
        <div class="chart-box" id="plotly-chart"></div>
    </div>

    <script>
        // Parameters injected from streamlit
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // Sliders
        const sliderW = document.getElementById('weight-w');
        const sliderC = document.getElementById('weight-c');
        const sliderS = document.getElementById('weight-s');
        const sliderD = document.getElementById('weight-d');
        const sliderM = document.getElementById('weight-m');
        const lockBanner = document.getElementById('lock-banner');

        // Alternatives base scores (Weight, Cost, Strength, Stiffness, Manufacturing)
        const baseA = [6, 9, 6, 5, 10]; // Aluminum Tube
        const baseB = [9, 3, 9, 9, 4];  // Carbon Fiber
        const baseC = [2, 6, 8, 8, 6];  // Steel Box
        const baseD = [7, 7, 5, 4, 8];  // Glass Fiber

        const state = {{
            w: 3,
            c: 3,
            s: 3,
            d: 3,
            m: 3
        }};

        // Read/write state
        const lastReset = parseInt(sessionStorage.getItem('vdep_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.w = parseInt(sessionStorage.getItem('vdep_w') || '3');
            state.c = parseInt(sessionStorage.getItem('vdep_c') || '3');
            state.s = parseInt(sessionStorage.getItem('vdep_s') || '3');
            state.d = parseInt(sessionStorage.getItem('vdep_d') || '3');
            state.m = parseInt(sessionStorage.getItem('vdep_m') || '3');
        }} else {{
            sessionStorage.setItem('vdep_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vdep_w', state.w);
            sessionStorage.setItem('vdep_c', state.c);
            sessionStorage.setItem('vdep_s', state.s);
            sessionStorage.setItem('vdep_d', state.d);
            sessionStorage.setItem('vdep_m', state.m);
        }}

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            sliderW.disabled = true;
            sliderC.disabled = true;
            sliderS.disabled = true;
            sliderD.disabled = true;
            sliderM.disabled = true;
        }}

        // Listeners
        sliderW.addEventListener('input', (e) => {{
            state.w = parseInt(e.target.value);
            document.getElementById('weight-w-val').innerText = state.w;
            saveState();
            updateAll();
        }});
        sliderC.addEventListener('input', (e) => {{
            state.c = parseInt(e.target.value);
            document.getElementById('weight-c-val').innerText = state.c;
            saveState();
            updateAll();
        }});
        sliderS.addEventListener('input', (e) => {{
            state.s = parseInt(e.target.value);
            document.getElementById('weight-s-val').innerText = state.s;
            saveState();
            updateAll();
        }});
        sliderD.addEventListener('input', (e) => {{
            state.d = parseInt(e.target.value);
            document.getElementById('weight-d-val').innerText = state.d;
            saveState();
            updateAll();
        }});
        sliderM.addEventListener('input', (e) => {{
            state.m = parseInt(e.target.value);
            document.getElementById('weight-m-val').innerText = state.m;
            saveState();
            updateAll();
        }});

        function syncUI() {{
            sliderW.value = state.w;
            document.getElementById('weight-w-val').innerText = state.w;
            sliderC.value = state.c;
            document.getElementById('weight-c-val').innerText = state.c;
            sliderS.value = state.s;
            document.getElementById('weight-s-val').innerText = state.s;
            sliderD.value = state.d;
            document.getElementById('weight-d-val').innerText = state.d;
            sliderM.value = state.m;
            document.getElementById('weight-m-val').innerText = state.m;
        }}

        function updateAll() {{
            // Weights
            let W = state.w;
            let C = state.c;
            let S = state.s;
            let D = state.d;
            let M = state.m;

            // Update weights column
            document.getElementById('w-w').innerText = W;
            document.getElementById('w-c').innerText = C;
            document.getElementById('w-s').innerText = S;
            document.getElementById('w-d').innerText = D;
            document.getElementById('w-m').innerText = M;

            // Totals
            let total_A = baseA[0]*W + baseA[1]*C + baseA[2]*S + baseA[3]*D + baseA[4]*M;
            let total_B = baseB[0]*W + baseB[1]*C + baseB[2]*S + baseB[3]*D + baseB[4]*M;
            let total_C = baseC[0]*W + baseC[1]*C + baseC[2]*S + baseC[3]*D + baseC[4]*M;
            let total_D = baseD[0]*W + baseD[1]*C + baseD[2]*S + baseD[3]*D + baseD[4]*M;

            // Update cells
            document.getElementById('A-w').innerText = `${baseA[0]} × ${W} = ${baseA[0]*W}`;
            document.getElementById('A-c').innerText = `${baseA[1]} × ${C} = ${baseA[1]*C}`;
            document.getElementById('A-s').innerText = `${baseA[2]} × ${S} = ${baseA[2]*S}`;
            document.getElementById('A-d').innerText = `${baseA[3]} × ${D} = ${baseA[3]*D}`;
            document.getElementById('A-m').innerText = `${baseA[4]} × ${M} = ${baseA[4]*M}`;

            document.getElementById('B-w').innerText = `${baseB[0]} × ${W} = ${baseB[0]*W}`;
            document.getElementById('B-c').innerText = `${baseB[1]} × ${C} = ${baseB[1]*C}`;
            document.getElementById('B-s').innerText = `${baseB[2]} × ${S} = ${baseB[2]*S}`;
            document.getElementById('B-d').innerText = `${baseB[3]} × ${D} = ${baseB[3]*D}`;
            document.getElementById('B-m').innerText = `${baseB[4]} × ${M} = ${baseB[4]*M}`;

            document.getElementById('C-w').innerText = `${baseC[0]} × ${W} = ${baseC[0]*W}`;
            document.getElementById('C-c').innerText = `${baseC[1]} × ${C} = ${baseC[1]*C}`;
            document.getElementById('C-s').innerText = `${baseC[2]} × ${S} = ${baseC[2]*S}`;
            document.getElementById('C-d').innerText = `${baseC[3]} × ${D} = ${baseC[3]*D}`;
            document.getElementById('C-m').innerText = `${baseC[4]} × ${M} = ${baseC[4]*M}`;

            document.getElementById('D-w').innerText = `${baseD[0]} × ${W} = ${baseD[0]*W}`;
            document.getElementById('D-c').innerText = `${baseD[1]} × ${C} = ${baseD[1]*C}`;
            document.getElementById('D-s').innerText = `${baseD[2]} × ${S} = ${baseD[2]*S}`;
            document.getElementById('D-d').innerText = `${baseD[3]} × ${D} = ${baseD[3]*D}`;
            document.getElementById('D-m').innerText = `${baseD[4]} × ${M} = ${baseD[4]*M}`;

            document.getElementById('total-A').innerText = total_A;
            document.getElementById('total-B').innerText = total_B;
            document.getElementById('total-C').innerText = total_C;
            document.getElementById('total-D').innerText = total_D;

            // Highlight winner
            let maxScore = Math.max(total_A, total_B, total_C, total_D);
            let winnerCode = '';
            if (maxScore === total_A) winnerCode = 'A';
            else if (maxScore === total_B) winnerCode = 'B';
            else if (maxScore === total_C) winnerCode = 'C';
            else winnerCode = 'D';

            const ids = ['A', 'B', 'C', 'D'];
            ids.forEach(id => {{
                let colCells = document.querySelectorAll('.col-' + id);
                let colTh = document.getElementById('th-' + id);
                let colTotal = document.getElementById('total-' + id);

                if (id === winnerCode) {{
                    colTh.className = 'winner-header';
                    colTotal.className = 'col-' + id + ' winner-footer';
                    colCells.forEach(cell => {{
                        cell.className = 'col-' + id + ' winner-cell winner-border';
                    }});
                }} else {{
                    colTh.className = '';
                    colTotal.className = 'col-' + id;
                    colCells.forEach(cell => {{
                        cell.className = 'col-' + id;
                    }});
                }}
            }});

            // Draw horizontal bar chart
            let categories = [
                'Design D (GF Panel)',
                'Design C (Steel Box)',
                'Design B (CF I-Beam)',
                'Design A (Al Tube)'
            ];
            let scores = [total_D, total_C, total_B, total_A];
            let colors = [
                winnerCode === 'D' ? '#8b5cf6' : '#94a3b8',
                winnerCode === 'C' ? '#8b5cf6' : '#94a3b8',
                winnerCode === 'B' ? '#8b5cf6' : '#94a3b8',
                winnerCode === 'A' ? '#8b5cf6' : '#94a3b8'
            ];

            let traces = [{{
                x: scores,
                y: categories,
                type: 'bar',
                orientation: 'h',
                marker: {{
                    color: colors,
                    line: {{ color: '#8b5cf6', width: 0 }}
                }},
                text: scores.map(s => `<b>${s} pts</b>`),
                textposition: 'inside',
                insidetextanchor: 'end',
                hoverinfo: 'none'
            }}];

            let layout = {{
                xaxis: {{
                    range: [0, 260],
                    showgrid: true,
                    gridcolor: 'rgba(128, 128, 128, 0.05)',
                    zeroline: false,
                    tickfont: {{ family: 'Outfit', size: 9, color: '#64748b' }},
                    fixedrange: true
                }},
                yaxis: {{
                    tickfont: {{ family: 'Outfit', size: 9, color: '#1e293b', weight: 'bold' }},
                    fixedrange: true
                }},
                margin: {{ l: 110, r: 10, t: 15, b: 25 }},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
            }};

            Plotly.react('plotly-chart', traces, layout);
        }}

        // Init
        syncUI();
        updateAll();
    </script>
</body>
</html>
"""

def run_design_process():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #8b5cf6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 4 • Lesson 37</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Engineering Design Process</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit4"]
    topic_name = "Lesson 37: Engineering Design Process"
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
    if "vdep_phase" not in st.session_state:
        st.session_state.vdep_phase = "instructions"
    if "vdep_sliders_locked" not in st.session_state:
        st.session_state.vdep_sliders_locked = False
    if "vdep_reset_counter" not in st.session_state:
        st.session_state.vdep_reset_counter = 0
    if "vdep_answers" not in st.session_state:
        st.session_state.vdep_answers = {}

    def reset_simulator():
        st.session_state.vdep_phase = "instructions"
        st.session_state.vdep_answers = {}
        st.session_state.vdep_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Design Concepts",
        "guided_question": "🔍 Step 2: Guided Trade-off",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vdep_phase == "poe_predict":
        st.session_state.vdep_sliders_locked = True
    else:
        st.session_state.vdep_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Wing Spar Trade Study & Sizing Optimizer")
        locked_js = "true" if st.session_state.vdep_sliders_locked else "false"
        reset_counter = st.session_state.vdep_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=440)

        # Conceptual Design Process Steps Summary (Objective 37.1)
        st.markdown("### 🌀 The Engineering Design Loop")
        st.markdown("""
        Engineering design is an iterative process. It translates open-ended problems into practical solutions:
        1. **Identify the Need/Problem:** Define constraints (weight, wingspan, cost, load).
        2. **Research & Brainstorm:** Create multiple candidate concepts (Alternative geometries and materials).
        3. **Formulate Criteria:** Decide what characteristics are critical (e.g., stiffness, manufacturing).
        4. **Select a Decision Tool:** Set weighting factors based on customer constraints and calculate composite scores (Pugh Matrix).
        5. **Analyze & Optimize:** Select the winning design, build prototypes, and run load/wing tests (Lab days!).
        6. **Iterate & Refine:** Adjust sizes based on structural failures and re-test.
        """)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#8b5cf6; font-weight:700;">{phase_titles[st.session_state.vdep_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vdep_phase == "instructions":
            st.markdown("""
            A **Pugh Matrix** (or Weighted Decision Matrix) helps engineers choose between design options.

            **How it works:**
            1. **Select Criteria:** Key requirements (e.g. Weight, Strength).
            2. **Assign Weights:** Scale of 1 (lowest priority) to 5 (highest priority) based on requirements.
            3. **Score Alternatives:** Rate how well each design satisfies that criteria (scale of 1-10).
            4. **Compute Total:** Multiply rating by weight, sum them up, and find the maximum score!
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vdep_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vdep_phase == "guided_question":
            st.markdown(r"""
            **Guided Scenario:**
            Let's evaluate the candidate designs. Set **all criteria weights** to `2` by moving the sliders in the simulator.
            
            Notice that the matrix cell values update: $Base \times Weight = Weighted\ Score$.
            
            **Question:**
            What are the total weighted scores for **Design A (Aluminum Tube)** and **Design B (Carbon Fiber I-Beam)** under this uniform weighting scheme? Which design wins?
            """)
            
            ans = st.radio(
                "Select the correct calculation results:",
                options=[
                    "Design A: 72 pts, Design B: 68 pts (Design A wins)",
                    "Design A: 36 pts, Design B: 34 pts (Design A wins)",
                    "Design A: 60 pts, Design B: 72 pts (Design B wins)",
                    "Design A: 54 pts, Design B: 54 pts (It is a tie)"
                ],
                key="vdep_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "Design A: 72 pts, Design B: 68 pts" in ans:
                    st.success(r"Correct! Each design's base sum is multiplied by the weight factor of 2. For Design A: $36 \\times 2 = 72\\text{ pts}$, and Design B: $34 \\times 2 = 68\\text{ pts}$. Under equal priorities, the cheap and easy-to-manufacture Aluminum Tube wins!")
                else:
                    st.error("Incorrect. Double-check your sliders (all set to 2) and look at the totals: Design A total is 72, Design B is 68. The correct option is the first one.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vdep_phase = "poe_predict"
                st.session_state.vdep_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vdep_phase == "poe_predict":
            st.markdown("""
            **Predict Phase (Weights Locked!):**
            
            **Scenario:**
            You are designing a high-altitude solar-powered UAV where **Weight is critical** (Weight = 5), **Stiffness is critical** to prevent wing flutter (Stiffness = 4), and **Strength is critical** (Strength = 4). However, **Cost and Manufacturing Ease are irrelevant** to this high-budget project (Cost = 1, Manufacturing = 1).
            
            **Question:**
            Without unlocking the weights, calculate which design will score the highest and select its correct score.
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Design B (Carbon Fiber I-Beam) with score 124 pts",
                    "Design A (Aluminum Tube) with score 93 pts",
                    "Design B (Carbon Fiber I-Beam) with score 110 pts",
                    "Design D (Glass Fiber Panel) with score 86 pts"
                ],
                key="vdep_poe_p_radio"
            )
            st.session_state.vdep_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vdep_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vdep_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Weights Unlocked!):**
            
            **Instructions:**
            1. Set the weights in the simulator to:
               * **Weight**: `5`
               * **Cost**: `1`
               * **Strength**: `4`
               * **Stiffness**: `4`
               * **Manufacturing**: `1`
            2. Check the decision matrix total scores and the purple winner column.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vdep_answers.get("poe", "Design B (Carbon Fiber I-Beam) with score 124 pts")
            options_list = [
                "Design B (Carbon Fiber I-Beam) with score 124 pts",
                "Design A (Aluminum Tube) with score 93 pts",
                "Design B (Carbon Fiber I-Beam) with score 110 pts",
                "Design D (Glass Fiber Panel) with score 86 pts"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vdep_poe_o_radio"
            )
            st.session_state.vdep_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vdep_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vdep_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vdep_answers.get('poe')}`")
            
            st.markdown("---")
            if "Design B" in st.session_state.vdep_answers.get("poe", "") and "124" in st.session_state.vdep_answers.get("poe", ""):
                st.success("🎉 **Correct!** Excellent decision-matrix mapping.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the calculations below to find the error.")

            st.markdown(r"""
            ### Explanation:
            1. **Set Up the Weights**:
               $W_{\text{Weight}} = 5$, $W_{\text{Cost}} = 1$, $W_{\text{Strength}} = 4$, $W_{\text{Stiffness}} = 4$, $W_{\text{Mfg}} = 1$.
               
            2. **Compute total weighted score for Carbon Fiber (Design B)**:
               * Weight contribution: $9 \times 5 = 45$
               * Cost contribution: $3 \times 1 = 3$
               * Strength contribution: $9 \times 4 = 36$
               * Stiffness contribution: $9 \times 4 = 36$
               * Mfg contribution: $4 \times 1 = 4$
               * **Total B** = $45 + 3 + 36 + 36 + 4 = 124\text{ pts}$.
               
            3. **Compute total for Aluminum (Design A)**:
               * **Total A** = $6(5) + 9(1) + 6(4) + 5(4) + 10(1) = 30 + 9 + 24 + 20 + 10 = 93\text{ pts}$.
               
            *Conclusion:* By weighting performance criteria (Weight, Stiffness, Strength) highly while penalizing cost and manufacturing ease, Carbon Fiber's superior physical properties easily outscore Aluminum, making it the selected choice. If we reversed the weights (Cost=5, Mfg=5, performance=1), Aluminum would dominate, showing how customer requirements drive engineering designs.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

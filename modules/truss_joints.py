import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Truss Joints Sandbox
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
            color: #10b981;
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
            background: #10b981;
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
            border-left: 4px solid #10b981;
            line-height: 1.4;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }}
        .legend-container {{
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 8px;
            font-size: 0.82rem;
            font-weight: 600;
        }}
        .legend-item {{
            display: flex;
            align-items: center;
            gap: 5px;
        }}
        .legend-line {{
            width: 25px;
            height: 4px;
            border-radius: 2px;
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Truss controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 300px;"></div>

    <div class="legend-container">
        <div class="legend-item">
            <div class="legend-line" style="background-color: #3b82f6;"></div>
            <span style="color:#3b82f6;">Tension (T)</span>
        </div>
        <div class="legend-item">
            <div class="legend-line" style="background-color: #ef4444;"></div>
            <span style="color:#ef4444;">Compression (C)</span>
        </div>
        <div class="legend-item">
            <div class="legend-line" style="background-color: #94a3b8; height: 1.5px;"></div>
            <span style="color:#64748b;">Zero-Force Member</span>
        </div>
    </div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Load Magnitude -->
        <div class="control-box">
            <div class="control-title">1. Load Magnitude</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Force, P</span>
                    <span class="slider-value" id="p-val-display">60 kN</span>
                </div>
                <input type="range" id="p-slider" min="0" max="100" step="10" value="60" class="custom-slider">
            </div>
        </div>

        <!-- Load Angle -->
        <div class="control-box">
            <div class="control-title">2. Load Direction</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ_P</span>
                    <span class="slider-value" id="theta-val-display">270°</span>
                </div>
                <input type="range" id="theta-slider" min="180" max="360" step="15" value="270" class="custom-slider">
            </div>
        </div>

        <!-- Truss Height -->
        <div class="control-box">
            <div class="control-title">3. Truss Geometry</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Height, H</span>
                    <span class="slider-value" id="h-val-display">5.0 m</span>
                </div>
                <input type="range" id="h-slider" min="3" max="8" step="0.5" value="5" class="custom-slider">
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
        const thetaSlider = document.getElementById('theta-slider');
        const hSlider = document.getElementById('h-slider');
        const lockBanner = document.getElementById('lock-banner');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            P: 60,
            thetaP: 270, // 270 is straight down
            H: 5.0
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vjoint_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.P = parseFloat(sessionStorage.getItem('vjoint_P') || '60');
            state.thetaP = parseFloat(sessionStorage.getItem('vjoint_thetaP') || '270');
            state.H = parseFloat(sessionStorage.getItem('vjoint_H') || '5.0');
        }} else {{
            sessionStorage.setItem('vjoint_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vjoint_P', state.P);
            sessionStorage.setItem('vjoint_thetaP', state.thetaP);
            sessionStorage.setItem('vjoint_H', state.H);
        }}

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            pSlider.disabled = true;
            thetaSlider.disabled = true;
            hSlider.disabled = true;
        }}

        // Sliders Listeners
        pSlider.addEventListener('input', (e) => {{
            state.P = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            saveState();
            updatePlot();
        }});
        thetaSlider.addEventListener('input', (e) => {{
            state.thetaP = parseFloat(e.target.value);
            document.getElementById('theta-val-display').innerText = state.thetaP.toFixed(0) + '°';
            saveState();
            updatePlot();
        }});
        hSlider.addEventListener('input', (e) => {{
            state.H = parseFloat(e.target.value);
            document.getElementById('h-val-display').innerText = state.H.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            thetaSlider.value = state.thetaP;
            document.getElementById('theta-val-display').innerText = state.thetaP.toFixed(0) + '°';
            hSlider.value = state.H;
            document.getElementById('h-val-display').innerText = state.H.toFixed(1) + ' m';
        }}

        function updatePlot() {{
            let P = state.P;
            let radP = state.thetaP * Math.PI / 180;
            let Px = P * Math.cos(radP);
            let Py = P * Math.sin(radP);
            let H = state.H;

            // Geometry (Warren Truss: 5 members)
            // Nodes: A(0,0), B(5, H), C(10,0), D(5,0)
            // Reaction solving (Statics on whole truss):
            // Pin at A, Roller at C
            // ΣMa = 0: Cy · 10 + Py · 5 - Px · 0 = 0 (Py is negative downward)
            // Cy = -Py * 5 / 10 = -Py / 2  (which is positive upward since Py is negative)
            // ΣFx = 0: Ax + Px = 0  => Ax = -Px
            // ΣFy = 0: Ay + Cy + Py = 0  => Ay = -Py - Cy = -Py / 2
            
            let Cy = -Py / 2;
            let Ay = -Py / 2;
            let Ax = -Px;

            // Member geometry angles
            // Angle of diagonal AB: tan(phi) = H / 5
            let phi = Math.atan2(H, 5);
            let cosPhi = Math.cos(phi);
            let sinPhi = Math.sin(phi);

            // Solve joints:
            // Joint A: connected to AD, AB
            // ΣFy = Ay + F_AB * sin(phi) = 0 => F_AB = -Ay / sin(phi)
            // ΣFx = Ax + F_AD + F_AB * cos(phi) = 0 => F_AD = -Ax - F_AB * cos(phi)
            let Fab = -Ay / sinPhi;
            let Fad = -Ax - Fab * cosPhi;

            // Joint C: connected to CD, BC
            // ΣFy = Cy + F_BC * sin(phi) = 0 => F_BC = -Cy / sin(phi)
            // ΣFx = -F_CD - F_BC * cos(phi) = 0 => F_CD = -F_BC * cos(phi)
            let Fbc = -Cy / sinPhi;
            let Fcd = -Fbc * cosPhi;

            // Joint D: connected to AD (left), CD (right), BD (vertical)
            // ΣFx = F_CD - F_AD + Px = 0 (Check!)
            // ΣFy = F_BD + Py = 0 => F_BD = -Py
            let Fbd = -Py;

            // Format equation display
            let t_c = (f) => f > 0.05 ? 'Tension' : (f < -0.05 ? 'Compression' : 'Zero-Force');
            equationDisplay.innerHTML = `
                <div>
                    <b>Truss External Reactions:</b><br>
                    · Ax = ${Ax.toFixed(1)} kN (left)<br>
                    · Ay = ${Ay.toFixed(1)} kN (up)<br>
                    · Cy = ${Cy.toFixed(1)} kN (up)
                </div>
                <div>
                    <b>Member Internal Forces:</b><br>
                    · F_AB = <b>${Math.abs(Fab).toFixed(1)} kN</b> (${t_c(Fab)})<br>
                    · F_BC = <b>${Math.abs(Fbc).toFixed(1)} kN</b> (${t_c(Fbc)})<br>
                    · F_BD = <b>${Math.abs(Fbd).toFixed(1)} kN</b> (${t_c(Fbd)})<br>
                    · F_AD = <b>${Math.abs(Fad).toFixed(1)} kN</b> (${t_c(Fad)})<br>
                    · F_CD = <b>${Math.abs(Fcd).toFixed(1)} kN</b> (${t_c(Fcd)})
                </div>
            `;

            // Draw Truss in Plotly
            const traces = [];

            // Nodes positions
            let nodes = {{
                A: [0, 0],
                B: [5, H],
                C: [10, 0],
                D: [5, 0]
            }};

            // Support markers
            // Pin at A
            traces.push({{
                x: [-0.3, 0, 0.3, -0.3], y: [-0.5, 0, -0.5, -0.5],
                fill: 'toself', mode: 'lines', line: {{color: '#3b82f6', width: 1.5}},
                fillcolor: 'rgba(59, 130, 246, 0.15)', showlegend: false, hoverinfo: 'skip'
            }});
            // Roller at C
            traces.push({{
                x: [9.7, 10, 10.3, 9.7], y: [-0.4, 0, -0.4, -0.4],
                fill: 'toself', mode: 'lines', line: {{color: '#10b981', width: 1.5}},
                fillcolor: 'rgba(16, 185, 129, 0.15)', showlegend: false, hoverinfo: 'skip'
            }});
            // roller wheels
            traces.push({{
                x: [9.8, 10.2], y: [-0.55, -0.55],
                mode: 'markers', marker: {{size: 4, color: '#10b981'}}, showlegend: false, hoverinfo: 'skip'
            }});

            // Member draw helper
            function drawMember(n1, n2, force, label) {{
                let color = '#94a3b8';
                let width = 1.5;
                if (force > 0.1) {{
                    color = '#3b82f6'; // Tension (Blue)
                    width = 2 + 4 * (Math.abs(force)/100);
                }} else if (force < -0.1) {{
                    color = '#ef4444'; // Compression (Red)
                    width = 2 + 4 * (Math.abs(force)/100);
                }}
                
                traces.push({{
                    x: [nodes[n1][0], nodes[n2][0]],
                    y: [nodes[n1][1], nodes[n2][1]],
                    mode: 'lines',
                    line: {{color: color, width: width}},
                    name: label,
                    hoverinfo: 'text',
                    hovertext: `Member ${label}: ${Math.abs(force).toFixed(1)} kN (${t_c(force)})`
                }});

                // Add small action-reaction arrows near ends of the member to show Tension/Compression physically
                if (Math.abs(force) > 5) {{
                    let dx = nodes[n2][0] - nodes[n1][0];
                    let dy = nodes[n2][1] - nodes[n1][1];
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    let ux = dx / dist;
                    let uy = dy / dist;

                    let arrow_offset = 0.9;
                    let arrow_len = 0.4;
                    
                    let sign = force > 0 ? 1 : -1; // Tension pulls away from joint, Compression pushes toward joint
                    
                    // Arrow near Node 1
                    traces.push({{
                        x: [nodes[n1][0] + ux * arrow_offset, nodes[n1][0] + ux * (arrow_offset + sign * arrow_len)],
                        y: [nodes[n1][1] + uy * arrow_offset, nodes[n1][1] + uy * (arrow_offset + sign * arrow_len)],
                        mode: 'lines',
                        line: {{color: color, width: 2}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                    // Arrow near Node 2
                    traces.push({{
                        x: [nodes[n2][0] - ux * arrow_offset, nodes[n2][0] - ux * (arrow_offset + sign * arrow_len)],
                        y: [nodes[n2][1] - uy * arrow_offset, nodes[n2][1] - uy * (arrow_offset + sign * arrow_len)],
                        mode: 'lines',
                        line: {{color: color, width: 2}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                }}
            }}

            // Draw 5 members
            drawMember('A', 'B', Fab, 'AB');
            drawMember('B', 'C', Fbc, 'BC');
            drawMember('B', 'D', Fbd, 'BD');
            drawMember('A', 'D', Fad, 'AD');
            drawMember('D', 'C', Fcd, 'CD');

            // Draw Node joints (slate circles)
            traces.push({{
                x: [0, 5, 10, 5],
                y: [0, H, 0, 0],
                mode: 'markers+text',
                marker: {{size: 10, color: '#1e293b'}},
                text: ['A', 'B', 'C', 'D'],
                textposition: ['bottom left', 'top center', 'bottom right', 'bottom center'],
                font: {{family: 'Outfit', size: 12, color: '#1e293b', weight: 'bold'}},
                showlegend: false,
                hoverinfo: 'text',
                hovertext: 'Joint'
            }});

            // Annotations (Load Arrow)
            const annotations = [];
            if (P > 0) {{
                let len = 1.5 + 2 * (P / 100);
                annotations.push({{
                    ax: 5 + Math.cos(radP) * len,
                    ay: Math.sin(radP) * len,
                    x: 5 + Math.cos(radP) * 0.2,
                    y: Math.sin(radP) * 0.2,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 3,
                    arrowsize: 1,
                    arrowwidth: 3.5,
                    arrowcolor: '#ef4444',
                    text: `P = ${P.toFixed(0)} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#ef4444', weight: 'bold'}},
                    yshift: radP > Math.PI ? -15 : 15
                }});
            }}

            const layout = {{
                xaxis: {{
                    range: [-2, 12],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    range: [-2.5, 9.5],
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

def run_truss_joints():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #10b981; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 2 • Lesson 15</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Truss Analysis: Method of Joints</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit2"]
    topic_name = "Lesson 15: Truss Analysis:  Method of Joints"
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
        background-color: rgba(16, 185, 129, 0.04) !important;
        border: 2px solid #10b981 !important;
        border-radius: 16px !important;
        padding: 24px !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
    }
    </style>
    """, unsafe_allow_html=True)

    # State init
    if "vjoint_phase" not in st.session_state:
        st.session_state.vjoint_phase = "instructions"
    if "vjoint_sliders_locked" not in st.session_state:
        st.session_state.vjoint_sliders_locked = False
    if "vjoint_reset_counter" not in st.session_state:
        st.session_state.vjoint_reset_counter = 0
    if "vjoint_answers" not in st.session_state:
        st.session_state.vjoint_answers = {}

    def reset_simulator():
        st.session_state.vjoint_phase = "instructions"
        st.session_state.vjoint_answers = {}
        st.session_state.vjoint_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vjoint_phase == "poe_predict":
        st.session_state.vjoint_sliders_locked = True
    else:
        st.session_state.vjoint_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive 2D Truss Solver")
        locked_js = "true" if st.session_state.vjoint_sliders_locked else "false"
        reset_counter = st.session_state.vjoint_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=600)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#10b981; font-weight:700;">{phase_titles[st.session_state.vjoint_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vjoint_phase == "instructions":
            st.markdown(r"""
            A **truss** is a structure composed of slender members joined at their endpoints. The **Method of Joints** analyzes internal forces by isolating each joint as a 2D particle equilibrium problem.
            
            **Key Mechanics:**
            * Drag sliders to adjust load magnitude $P$, load angle $\theta_P$, and truss height $H$.
            * Color coding indicates internal force state:
              * **Blue**: Tension (T) - member is stretched (internal forces pull away from joints).
              * **Red**: Compression (C) - member is squeezed (forces push toward joints).
              * **Gray**: Zero-Force Member - carries no force.
            * Small opposing arrows on each member represent the action-reaction forces acting on the joints.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vjoint_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vjoint_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            Set the sliders to:
            * **P**: `80 kN`
            * **θ_P**: `180°` (pointing horizontal, straight left at Node D)
            * **Height, H**: `5.0 m`
            
            Observe the changes in member forces.
            
            **Question:**
            What is the force in vertical member BD, and why?
            """)
            
            ans = st.radio(
                "Select the correct explanation:",
                options=[
                    "F_BD = 80 kN, because the load is horizontal.",
                    "F_BD = 0 kN, because there is no vertical load at Node D.",
                    "F_BD = 40 kN, because the load is split symmetrically.",
                    "F_BD = 80 kN (Tension), because it must balance Node B."
                ],
                key="vjoint_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "0 kN" in ans:
                    st.success("Correct! Looking at Joint D: BD is vertical, while AD, CD, and the load P are purely horizontal. Summing forces vertically at joint D: $\sum F_y = F_{BD} = 0$, meaning BD is a **zero-force member**.")
                else:
                    st.error("Incorrect. Isolate Joint D: the only vertical force is the internal force of BD. For vertical equilibrium, $F_{BD}$ must equal 0, making it a zero-force member.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vjoint_phase = "poe_predict"
                st.session_state.vjoint_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vjoint_phase == "poe_predict":
            st.markdown("""
            **Predict Phase (Truss Controls Locked!):**
            
            **Scenario:**
            * **Height, H**: `5.0 m`
            * **Load Magnitude, P**: `60 kN` at **θ_P = 270°** (vertical downward at D)
            
            **Question:**
            1. Predict the exact internal force and state of vertical member BD.
            2. Predict whether bottom chord members AD and CD are in tension or compression, and their values.
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "F_BD = 60 kN (Tension); F_AD = F_CD = 30 kN (Tension).",
                    "F_BD = 60 kN (Compression); F_AD = F_CD = 30 kN (Compression).",
                    "F_BD = 0 kN (Zero-force); F_AD = F_CD = 60 kN (Tension).",
                    "F_BD = 60 kN (Tension); F_AD = F_CD = 0 kN (Zero-force)."
                ],
                key="vjoint_poe_p_radio"
            )
            st.session_state.vjoint_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vjoint_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vjoint_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set Height to `5.0 m`.
            2. Set Load P to `60 kN` and Direction to `270°`.
            3. Observe the colors and magnitudes on the truss diagram.
            
            *Change your answer below if needed before final submit.*
            """)
            
            val_init = st.session_state.vjoint_answers.get("poe", "F_BD = 60 kN (Tension); F_AD = F_CD = 30 kN (Tension).")
            options_list = [
                "F_BD = 60 kN (Tension); F_AD = F_CD = 30 kN (Tension).",
                "F_BD = 60 kN (Compression); F_AD = F_CD = 30 kN (Compression).",
                "F_BD = 0 kN (Zero-force); F_AD = F_CD = 60 kN (Tension).",
                "F_BD = 60 kN (Tension); F_AD = F_CD = 0 kN (Zero-force)."
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vjoint_poe_o_radio"
            )
            st.session_state.vjoint_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vjoint_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vjoint_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vjoint_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vjoint_answers.get("poe") == "F_BD = 60 kN (Tension); F_AD = F_CD = 30 kN (Tension).":
                st.success("🎉 **Correct!** Excellent understanding of joint equilibrium.")
            else:
                st.warning("⚠️ **Incorrect.** Review the calculations below.")

            st.markdown(r"""
            ### Explanation:
            1. **Isolating Joint D**:
               * The forces meeting at Joint D are the vertical member BD, the horizontal members AD and CD, and the downward load $P = 60\text{ kN}$.
               * Vertical equilibrium: $\sum F_y = 0 \implies F_{BD} - 60 = 0 \implies F_{BD} = 60\text{ kN}$ (Tension, since it pulls away from Joint D to balance the downward load).
            2. **Isolating Joint B**:
               * Forces meeting at B are $F_{BD} = 60\text{ kN}$ (pulling down, away from B), and diagonals AB and BC.
               * By symmetry, $F_{AB} = F_{BC}$.
               * Vertical equilibrium: $-2 F_{AB} \sin\phi - F_{BD} = 0 \implies F_{AB} = \frac{-60}{2 \sin\phi}$.
               * Since $\sin\phi = 5 / \sqrt{5^2 + 5^2} = 0.7071$, we get $F_{AB} = F_{BC} = -42.43\text{ kN}$ (Compression).
            3. **Isolating Joint A**:
               * Forces are reaction $R_{Ay} = 30\text{ kN}$ (up), diagonal $F_{AB} = -42.43\text{ kN}$, and horizontal $F_{AD}$.
               * Horizontal equilibrium: $\sum F_x = 0 \implies F_{AD} + F_{AB} \cos\phi = 0$
               * $F_{AD} = -F_{AB} \cos\phi = -(-42.43)(0.7071) = +30\text{ kN}$ (Tension).
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Particle Equilibrium
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
        .danger-banner {{
            background-color: #fef2f2;
            border: 1.5px solid #fee2e2;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #991b1b;
            font-size: 0.88rem;
            font-weight: bold;
            animation: pulse 1.5s infinite alternate;
        }}
        @keyframes pulse {{
            0% {{ opacity: 0.8; }}
            100% {{ opacity: 1; }}
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
            margin-bottom: 4px;
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
            color: #3b82f6;
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
            background: #3b82f6;
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
            font-size: 0.85rem;
            margin-top: 10px;
            color: #1e293b;
            border-left: 4px solid #3b82f6;
            line-height: 1.4;
        }}
        .metric-row {{
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }}
        .metric-item {{
            flex: 1;
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px;
            text-align: center;
        }}
        .metric-label {{
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 600;
        }}
        .metric-val {{
            font-size: 1.15rem;
            font-weight: 700;
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>
    
    <div id="fail-banner" class="danger-banner" style="display: none;">
        <span>💥</span>
        <span><b>CABLE OVERLOAD WARNING!</b> Tension exceeds 1200 N. Cable structure will snap!</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 350px;"></div>

    <div class="metric-row">
        <div class="metric-item" style="border-bottom: 3.5px solid #3b82f6;">
            <div class="metric-label">Tension Cable A (Ta)</div>
            <div class="metric-val" id="ta-display" style="color: #3b82f6;">0.0 N</div>
        </div>
        <div class="metric-item" style="border-bottom: 3.5px solid #10b981;">
            <div class="metric-label">Tension Cable B (Tb)</div>
            <div class="metric-val" id="tb-display" style="color: #10b981;">0.0 N</div>
        </div>
        <div class="metric-item" style="border-bottom: 3.5px solid #64748b;">
            <div class="metric-label">Crate Weight (W)</div>
            <div class="metric-val" id="w-display" style="color: #475569;">500 N</div>
        </div>
    </div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Crate Weight -->
        <div class="control-box">
            <div class="control-title">1. Crate Load</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Weight, W</span>
                    <span class="slider-value" id="w-slider-val">500 N</span>
                </div>
                <input type="range" id="w-slider" min="100" max="1000" step="50" value="500" class="custom-slider">
            </div>
        </div>

        <!-- Cable A Angle -->
        <div class="control-box">
            <div class="control-title" style="color: #3b82f6;">2. Cable A Angle</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ_A</span>
                    <span class="slider-value" id="thetaA-slider-val" style="color:#3b82f6;">30.0°</span>
                </div>
                <input type="range" id="thetaA-slider" min="-15" max="85" step="1" value="30" class="custom-slider">
            </div>
        </div>

        <!-- Cable B Angle -->
        <div class="control-box">
            <div class="control-title" style="color: #10b981;">3. Cable B Angle</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ_B</span>
                    <span class="slider-value" id="thetaB-slider-val" style="color:#10b981;">30.0°</span>
                </div>
                <input type="range" id="thetaB-slider" min="-15" max="85" step="1" value="30" class="custom-slider">
            </div>
        </div>
    </div>

    <!-- Live Equation Output -->
    <div class="equation-box" id="equation-display">
        <b>Equilibrium Formulation:</b><br>
        ΣFx = -Ta*cos(θa) + Tb*cos(θb) = 0<br>
        ΣFy = Ta*sin(θa) + Tb*sin(θb) - W = 0
    </div>

    <script>
        // Setup variables
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // DOM Elements
        const wSlider = document.getElementById('w-slider');
        const thetaASlider = document.getElementById('thetaA-slider');
        const thetaBSlider = document.getElementById('thetaB-slider');
        const lockBanner = document.getElementById('lock-banner');
        const failBanner = document.getElementById('fail-banner');

        const taDisplay = document.getElementById('ta-display');
        const tbDisplay = document.getElementById('tb-display');
        const wDisplay = document.getElementById('w-display');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            W: 500,
            thetaA: 30,
            thetaB: 30
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('peq_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.W = parseFloat(sessionStorage.getItem('peq_W') || '500');
            state.thetaA = parseFloat(sessionStorage.getItem('peq_thetaA') || '30');
            state.thetaB = parseFloat(sessionStorage.getItem('peq_thetaB') || '30');
        }} else {{
            sessionStorage.setItem('peq_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('peq_W', state.W);
            sessionStorage.setItem('peq_thetaA', state.thetaA);
            sessionStorage.setItem('peq_thetaB', state.thetaB);
        }}

        // Handle locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            wSlider.disabled = true;
            thetaASlider.disabled = true;
            thetaBSlider.disabled = true;
        }}

        // Input Listeners
        wSlider.addEventListener('input', (e) => {{
            state.W = parseFloat(e.target.value);
            document.getElementById('w-slider-val').innerText = state.W.toFixed(0) + ' N';
            saveState();
            updatePlot();
        }});
        thetaASlider.addEventListener('input', (e) => {{
            state.thetaA = parseFloat(e.target.value);
            document.getElementById('thetaA-slider-val').innerText = state.thetaA.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});
        thetaBSlider.addEventListener('input', (e) => {{
            state.thetaB = parseFloat(e.target.value);
            document.getElementById('thetaB-slider-val').innerText = state.thetaB.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            wSlider.value = state.W;
            document.getElementById('w-slider-val').innerText = state.W.toFixed(0) + ' N';
            thetaASlider.value = state.thetaA;
            document.getElementById('thetaA-slider-val').innerText = state.thetaA.toFixed(1) + '°';
            thetaBSlider.value = state.thetaB;
            document.getElementById('thetaB-slider-val').innerText = state.thetaB.toFixed(1) + '°';
        }}

        function updatePlot() {{
            let W = state.W;
            let radA = state.thetaA * Math.PI / 180;
            let radB = state.thetaB * Math.PI / 180;

            // Solve simultaneous equilibrium equations:
            // 1) -Ta * cos(A) + Tb * cos(B) = 0  => Tb = Ta * cos(A) / cos(B)
            // 2) Ta * sin(A) + Tb * sin(B) = W
            // Ta * sin(A) + Ta * cos(A) * sin(B) / cos(B) = W
            // Ta * (sin(A) + cos(A) * tan(B)) = W
            // Ta = W / (sin(A) + cos(A) * tan(B))
            
            let denom = Math.sin(radA) + Math.cos(radA) * Math.tan(radB);
            let Ta = 0;
            let Tb = 0;
            let invalidConfig = false;

            if (denom <= 0.001) {
                invalidConfig = true;
            } else {
                Ta = W / denom;
                Tb = Ta * Math.cos(radA) / Math.cos(radB);
                if (Ta < 0 || Tb < 0) {
                    invalidConfig = true;
                }
            }

            // Display results
            if (invalidConfig) {
                taDisplay.innerText = 'Unstable';
                tbDisplay.innerText = 'Unstable';
                wDisplay.innerText = W.toFixed(0) + ' N';
                taDisplay.style.color = '#ef4444';
                tbDisplay.style.color = '#ef4444';
                failBanner.style.display = 'flex';
                failBanner.innerHTML = `<span>💥</span><span><b>EQUILIBRIUM IMPOSSIBLE!</b> Cable geometry is unstable or requires compression.</span>`;
            } else {
                taDisplay.innerText = Ta.toFixed(1) + ' N';
                tbDisplay.innerText = Tb.toFixed(1) + ' N';
                wDisplay.innerText = W.toFixed(0) + ' N';

                // Allowable limit check (1200 N)
                if (Ta > 1200 || Tb > 1200) {
                    failBanner.style.display = 'flex';
                    failBanner.innerHTML = `<span>💥</span><span><b>CABLE OVERLOAD WARNING!</b> Tension exceeds 1200 N. Cable structure will snap!</span>`;
                    taDisplay.style.color = '#ef4444';
                    tbDisplay.style.color = '#ef4444';
                } else {
                    failBanner.style.display = 'none';
                    taDisplay.style.color = '#3b82f6';
                    tbDisplay.style.color = '#10b981';
                }
            }

            // Equation text details
            if (invalidConfig) {
                equationDisplay.innerHTML = `
                    <b>Equilibrium Formulation & Direct Solution:</b><br>
                    ΣFx: -Ta · cos(${state.thetaA.toFixed(0)}°) + Tb · cos(${state.thetaB.toFixed(0)}°) = 0<br>
                    ΣFy: Ta · sin(${state.thetaA.toFixed(0)}°) + Tb · sin(${state.thetaB.toFixed(0)}°) - ${W.toFixed(0)} = 0<br>
                    <b>Static Equilibrium Impossible!</b> Geometry does not support static tension equilibrium.
                `;
            } else {
                equationDisplay.innerHTML = `
                    <b>Equilibrium Formulation & Direct Solution:</b><br>
                    ΣFx: -Ta · cos(${state.thetaA.toFixed(0)}°) + Tb · cos(${state.thetaB.toFixed(0)}°) = 0<br>
                    ΣFy: Ta · sin(${state.thetaA.toFixed(0)}°) + Tb · sin(${state.thetaB.toFixed(0)}°) - ${W.toFixed(0)} = 0<br>
                    <b>Calculated:</b> Ta = <b>${Ta.toFixed(1)} N</b>, Tb = <b>${Tb.toFixed(1)} N</b>
                `;
            }

            // Draw visual representation in Plotly
            // Left plot: Physical System, Right plot: FBD
            // Map coordinates:
            // Center ring is at origin (0, 0)
            // Left anchor: x = -100, y = 100 * tan(thetaA)
            // Right anchor: x = 100, y = 100 * tan(thetaB)
            // Crate hanger hangs down to y = -50
            
            // To make coordinates fit within a locked box, we can scale
            let ax = -60;
            let ay = 60 * Math.tan(radA);
            let bx = 60;
            let by = 60 * Math.tan(radB);

            // Cap anchor height to 60 for clean boundaries
            if (ay > 60) {{
                ay = 60;
                ax = -ay / Math.tan(radA);
            }}
            if (by > 60) {{
                by = 60;
                bx = by / Math.tan(radB);
            }}

            // Physical system traces:
            // Ceiling
            const ceiling = {{
                x: [-80, 80],
                y: [65, 65],
                mode: 'lines',
                line: {{color: '#475569', width: 6}},
                showlegend: false,
                hoverinfo: 'skip'
            }};

            // Physical cables
            const cableA = {{
                x: [ax, 0],
                y: [ay, 0],
                mode: 'lines+markers',
                line: {{color: Ta > 1200 ? '#ef4444' : '#3b82f6', width: 2.5 + 4 * (Ta/1500)}},
                marker: {{size: 6, color: '#334155'}},
                showlegend: false,
                hoverinfo: 'text',
                hovertext: `Cable A: Tension = ${Ta.toFixed(1)} N`
            }};
            const cableB = {{
                x: [bx, 0],
                y: [by, 0],
                mode: 'lines+markers',
                line: {{color: Tb > 1200 ? '#ef4444' : '#10b981', width: 2.5 + 4 * (Tb/1500)}},
                marker: {{size: 6, color: '#334155'}},
                showlegend: false,
                hoverinfo: 'text',
                hovertext: `Cable B: Tension = ${Tb.toFixed(1)} N`
            }};

            // Crate representation
            // A line hanging down, and a rectangle box for the crate
            const hanger = {{
                x: [0, 0],
                y: [0, -30],
                mode: 'lines',
                line: {{color: '#64748b', width: 3}},
                showlegend: false,
                hoverinfo: 'skip'
            }};
            const crateBox = {{
                x: [-15, 15, 15, -15, -15],
                y: [-30, -30, -55, -55, -30],
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(148, 163, 184, 0.2)',
                line: {{color: '#475569', width: 2.5}},
                showlegend: false,
                hoverinfo: 'text',
                hovertext: `Crate: Weight = ${W.toFixed(0)} N`
            }};

            // FBD (Free Body Diagram) - drawn as vector arrows from origin
            // Vector lengths scaled to force magnitude
            let scale = 0.04;
            let fax_fbd = 0, fay_fbd = 0, fbx_fbd = 0, fby_fbd = 0;
            if (!invalidConfig) {
                fax_fbd = -Ta * Math.cos(radA) * scale;
                fay_fbd = Ta * Math.sin(radA) * scale;
                fbx_fbd = Tb * Math.cos(radB) * scale;
                fby_fbd = Tb * Math.sin(radB) * scale;
            }
            let fw_fbd = -W * scale;

            // Split line (draw a vertical divider to separate Physical from FBD)
            const divider = {{
                x: [0, 0],
                y: [-80, 80],
                mode: 'lines',
                line: {{color: '#cbd5e1', width: 2, dash: 'dash'}},
                showlegend: false,
                hoverinfo: 'skip'
            }};

            // We can place the FBD on the right side of the canvas by shifting its origin
            let fbd_origin_x = 50;
            let fbd_origin_y = 0;
            
            // Re-offset Physical system to the left (shift x by -40)
            let shift_phys_x = -45;
            
            // Shift physical system traces
            const physTraces = [
                {{
                    x: [ax + shift_phys_x, shift_phys_x],
                    y: [ay, 0],
                    mode: 'lines+markers',
                    line: cableA.line,
                    marker: cableA.marker,
                    hoverinfo: cableA.hoverinfo,
                    hovertext: cableA.hovertext
                }},
                {{
                    x: [bx + shift_phys_x, shift_phys_x],
                    y: [by, 0],
                    mode: 'lines+markers',
                    line: cableB.line,
                    marker: cableB.marker,
                    hoverinfo: cableB.hoverinfo,
                    hovertext: cableB.hovertext
                }},
                {{
                    x: [shift_phys_x, shift_phys_x],
                    y: [0, -30],
                    mode: 'lines',
                    line: hanger.line,
                    showlegend: false,
                    hoverinfo: 'skip'
                }},
                {{
                    x: crateBox.x.map(x => x + shift_phys_x),
                    y: crateBox.y,
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: crateBox.fillcolor,
                    line: crateBox.line,
                    showlegend: false,
                    hoverinfo: crateBox.hoverinfo,
                    hovertext: crateBox.hovertext
                }},
                {{
                    x: ceiling.x.map(x => x + shift_phys_x),
                    y: ceiling.y,
                    mode: cableA.mode,
                    line: ceiling.line,
                    showlegend: false,
                    hoverinfo: 'skip'
                }}
            ];

            // FBD vectors starting at (fbd_origin_x, fbd_origin_y)
            const fbdRing = {{
                x: [fbd_origin_x],
                y: [fbd_origin_y],
                mode: 'markers',
                marker: {{size: 10, color: '#1e293b'}},
                showlegend: false,
                hoverinfo: 'text',
                hovertext: 'Particle equilibrium node (ring)'
            }};

            const traces_plot = [...physTraces, divider, fbdRing];

            // Setup Layout Annotations (Arrows for FBD forces)
            const annotations = [
                // Labels for physical view
                {{
                    x: shift_phys_x, y: 70,
                    text: '<b>PHYSICAL SYSTEM</b>',
                    font: {{family: 'Outfit', size: 12, color: '#475569'}},
                    showarrow: false
                }},
                // Labels for FBD view
                {{
                    x: fbd_origin_x, y: 70,
                    text: '<b>FREE BODY DIAGRAM (FBD)</b>',
                    font: {{family: 'Outfit', size: 12, color: '#475569'}},
                    showarrow: false
                }},
                // Crate Weight label
                {{
                    x: shift_phys_x, y: -42,
                    text: `W = ${W.toFixed(0)} N`,
                    font: {{family: 'Outfit', size: 11, color: '#ffffff'}},
                    showarrow: false
                }},
                // FBD Tension Ta Arrow (Blue)
                {{
                    ax: fbd_origin_x, ay: fbd_origin_y,
                    x: fbd_origin_x + fax_fbd, y: fbd_origin_y + fay_fbd,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: !invalidConfig,
                    arrowhead: 3,
                    arrowsize: 1,
                    arrowwidth: 3.5,
                    arrowcolor: Ta > 1200 ? '#ef4444' : '#3b82f6',
                    text: ''
                }},
                // FBD Tension Ta Label
                {{
                    x: fbd_origin_x + fax_fbd, y: fbd_origin_y + fay_fbd,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: invalidConfig ? '' : `Ta = ${Ta.toFixed(0)} N`,
                    font: {{family: 'Outfit', size: 11, color: Ta > 1200 ? '#ef4444' : '#3b82f6', weight: 'bold'}},
                    xshift: -35, yshift: 10
                }},
                // FBD Tension Tb Arrow (Green)
                {{
                    ax: fbd_origin_x, ay: fbd_origin_y,
                    x: fbd_origin_x + fbx_fbd, y: fbd_origin_y + fby_fbd,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: !invalidConfig,
                    arrowhead: 3,
                    arrowsize: 1,
                    arrowwidth: 3.5,
                    arrowcolor: Tb > 1200 ? '#ef4444' : '#10b981',
                    text: ''
                }},
                // FBD Tension Tb Label
                {{
                    x: fbd_origin_x + fbx_fbd, y: fbd_origin_y + fby_fbd,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: invalidConfig ? '' : `Tb = ${Tb.toFixed(0)} N`,
                    font: {{family: 'Outfit', size: 11, color: Tb > 1200 ? '#ef4444' : '#10b981', weight: 'bold'}},
                    xshift: 35, yshift: 10
                }},
                // FBD Weight W Arrow (Gray)
                {{
                    ax: fbd_origin_x, ay: fbd_origin_y,
                    x: fbd_origin_x, y: fbd_origin_y + fw_fbd,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 3,
                    arrowsize: 1,
                    arrowwidth: 3.5,
                    arrowcolor: '#64748b',
                    text: ''
                }},
                // FBD Weight W Label
                {{
                    x: fbd_origin_x, y: fbd_origin_y + fw_fbd,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: `W = ${W.toFixed(0)} N`,
                    font: {{family: 'Outfit', size: 11, color: '#64748b', weight: 'bold'}},
                    xshift: 30, yshift: -5
                }}
            ];

            const layout = {{
                xaxis: {{
                    range: [-110, 110],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    range: [-80, 80],
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

            Plotly.react('plotly-chart', traces_plot, layout);
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_particle_equilibrium():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #3b82f6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 1 • Lesson 4</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Forces & Equilibrium in a Plane</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit1"]
    topic_name = "Lesson 4: Forces & Equilibrium in a Plane  Free Body Diagrams"
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
        background-color: rgba(59, 130, 246, 0.04) !important;
        border: 2px solid #3b82f6 !important;
        border-radius: 16px !important;
        padding: 24px !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
    }
    </style>
    """, unsafe_allow_html=True)

    # State init
    if "peq_phase" not in st.session_state:
        st.session_state.peq_phase = "instructions"
    if "peq_sliders_locked" not in st.session_state:
        st.session_state.peq_sliders_locked = False
    if "peq_reset_counter" not in st.session_state:
        st.session_state.peq_reset_counter = 0
    if "peq_answers" not in st.session_state:
        st.session_state.peq_answers = {}

    def reset_simulator():
        st.session_state.peq_phase = "instructions"
        st.session_state.peq_answers = {}
        st.session_state.peq_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.peq_phase == "poe_predict":
        st.session_state.peq_sliders_locked = True
    else:
        st.session_state.peq_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Cable Tension & FBD Model")
        locked_js = "true" if st.session_state.peq_sliders_locked else "false"
        reset_counter = st.session_state.peq_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=620)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#3b82f6; font-weight:700;">{phase_titles[st.session_state.peq_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.peq_phase == "instructions":
            st.markdown(r"""
            This widget demonstrates particle equilibrium of a concurrent coplanar cable system:
            
            $$\sum F_x = 0$$
            $$\sum F_y = 0$$
            
            **Key Layout Features:**
            * **Left View**: The physical setup showing cable anchors and a crate of weight $W$.
            * **Right View**: The Free Body Diagram (FBD) showing forces isolated on a single particle point.
            * Drag sliders for Weight and Cable angles ($\theta_a$, $\theta_b$).
            * Observe how cable tensions increase as weight increases or cable angles become flatter.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.peq_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.peq_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            Adjust the sliders to set:
            * **Weight, W**: `600 N`
            * **Cable A Angle, θ_A**: `45.0°`
            * **Cable B Angle, θ_B**: `45.0°`
            
            Observe the resulting cable tensions in the sandbox.
            
            **Question:**
            What is the tension in each cable, and why?
            """)
            
            ans = st.radio(
                "Select the correct explanation:",
                options=[
                    "Ta = Tb = 300 N, because the weight is shared equally.",
                    "Ta = Tb = 424.3 N, because the forces must balance both vertically and horizontally.",
                    "Ta = Tb = 600 N, because each cable carries the full load.",
                    "Ta = 600 N, Tb = 0 N, because the left cable is a pin."
                ],
                key="peq_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "424.3 N" in ans:
                    st.success(r"Correct! Since angles are symmetric, $T_A = T_B$. By vertical equilibrium: $2 T \sin(45^\circ) = 600 \implies T = 600 / (2 \cdot 0.7071) = 424.3\text{ N}$.")
                else:
                    st.error(r"Incorrect. Let's look at vertical balance: $T_A \sin(45^\circ) + T_B \sin(45^\circ) = 600$. Since $T_A = T_B$, we get $2 T \sin(45^\circ) = 600$, which solves to $T = 424.3\text{ N}$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.peq_phase = "poe_predict"
                st.session_state.peq_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.peq_phase == "poe_predict":
            st.markdown("""
            **Predict Phase (Controls Locked!):**
            
            **Scenario:**
            * **Weight, W**: `500 N`
            * **Cable A Angle, θ_A**: `30.0°`
            * **Cable B Angle, θ_B**: `30.0°`
            
            **Question:**
            1. Predict the exact tension in each cable for this configuration.
            2. If you flatten both cables to `10.0°` while supporting the same weight, predict what happens to the tensions.
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Ta = Tb = 500 N; at 10.0°, tensions increase to over 1400 N.",
                    "Ta = Tb = 250 N; at 10.0°, tensions decrease to 100 N.",
                    "Ta = Tb = 500 N; at 10.0°, tensions remain 500 N.",
                    "Ta = Tb = 1000 N; at 10.0°, tensions increase to 2800 N."
                ],
                key="peq_poe_p_radio"
            )
            st.session_state.peq_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.peq_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.peq_phase == "poe_observe":
            st.markdown(r"""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set Weight to `500 N`, and angles $\theta_A = \theta_B = 30^\circ$. Observe tensions.
            2. Lower the angles to `10.0°`. Notice the cable thickness scaling and red failure warning.
            
            *You can modify your answer below before final submission!*
            """)
            
            val_init = st.session_state.peq_answers.get("poe", "Ta = Tb = 500 N; at 10.0°, tensions increase to over 1400 N.")
            options_list = [
                "Ta = Tb = 500 N; at 10.0°, tensions increase to over 1400 N.",
                "Ta = Tb = 250 N; at 10.0°, tensions decrease to 100 N.",
                "Ta = Tb = 500 N; at 10.0°, tensions remain 500 N.",
                "Ta = Tb = 1000 N; at 10.0°, tensions increase to 2800 N."
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="peq_poe_o_radio"
            )
            st.session_state.peq_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.peq_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.peq_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.peq_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.peq_answers.get("poe") == "Ta = Tb = 500 N; at 10.0°, tensions increase to over 1400 N.":
                st.success("🎉 **Correct!** Outstanding job.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics math below.")

            st.markdown(r"""
            ### Explanation:
            1. **Symmetric Case (30°)**:
               * $\sum F_y = 2 T \sin(30^\circ) - 500 = 0$
               * Since $\sin(30^\circ) = 0.5$, we get $2 T (0.5) = 500 \implies T_A = T_B = 500\text{ N}$.
            2. **Shallow Case (10°)**:
               * $\sum F_y = 2 T \sin(10^\circ) - 500 = 0$
               * Since $\sin(10^\circ) \approx 0.1736$, we get $T = 500 / (2 \cdot 0.1736) = 1439.7\text{ N}$!
               * As the cable angle approaches $0^\circ$, the tension approaches infinity because the vertical components of the cable forces must support the weight.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

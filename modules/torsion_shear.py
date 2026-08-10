import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Torsional Shear Stress Sandbox
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

    <!-- Shaft Type Toggle -->
    <div class="btn-group">
        <button id="btn-solid" class="btn-choice active">Solid Circular Shaft</button>
        <button id="btn-hollow" class="btn-choice">Hollow Circular Shaft</button>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 290px;"></div>

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

        <!-- Outer Radius c -->
        <div class="control-box">
            <div class="control-title">2. Outer Radius (c)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Radius, c</span>
                    <span class="slider-value" id="c-val-display">20 mm</span>
                </div>
                <input type="range" id="c-slider" min="15" max="40" step="1" value="20" class="custom-slider">
            </div>
        </div>

        <!-- Inner Radius ri -->
        <div class="control-box" id="inner-radius-box" style="opacity: 0.5;">
            <div class="control-title">3. Inner Radius (r_i)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Radius, r_i</span>
                    <span class="slider-value" id="ri-val-display">0 mm</span>
                </div>
                <input type="range" id="ri-slider" min="0" max="30" step="1" value="0" class="custom-slider" disabled>
            </div>
        </div>
    </div>

    <!-- Yield Warning -->
    <div id="yield-warning" class="warning-box" style="display: none;">
        <span>⚠️</span>
        <span><b>SHEAR YIELD EXCEEDED!</b> Maximum shear stress exceeds the material's yield strength (τ_max &gt; 80 MPa).</span>
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
        const btnSolid = document.getElementById('btn-solid');
        const btnHollow = document.getElementById('btn-hollow');
        const tSlider = document.getElementById('t-slider');
        const cSlider = document.getElementById('c-slider');
        const riSlider = document.getElementById('ri-slider');
        const riBox = document.getElementById('inner-radius-box');
        const lockBanner = document.getElementById('lock-banner');
        const yieldWarning = document.getElementById('yield-warning');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            type: 'solid',
            T: 500,
            c: 20,
            ri: 0
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vtor_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.type = sessionStorage.getItem('vtor_type') || 'solid';
            state.T = parseFloat(sessionStorage.getItem('vtor_T') || '500');
            state.c = parseFloat(sessionStorage.getItem('vtor_c') || '20');
            state.ri = parseFloat(sessionStorage.getItem('vtor_ri') || '0');
        }} else {{
            sessionStorage.setItem('vtor_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vtor_type', state.type);
            sessionStorage.setItem('vtor_T', state.T);
            sessionStorage.setItem('vtor_c', state.c);
            sessionStorage.setItem('vtor_ri', state.ri);
        }}

        // Mode Toggles
        btnSolid.addEventListener('click', () => {{
            if (isLocked) return;
            state.type = 'solid';
            state.ri = 0;
            btnSolid.classList.add('active');
            btnHollow.classList.remove('active');
            riSlider.disabled = true;
            riBox.style.opacity = '0.5';
            saveState();
            updatePlot();
        }});
        btnHollow.addEventListener('click', () => {{
            if (isLocked) return;
            state.type = 'hollow';
            if (state.ri === 0 || state.ri >= state.c) state.ri = Math.floor(state.c / 2);
            btnHollow.classList.add('active');
            btnSolid.classList.remove('active');
            riSlider.disabled = false;
            riBox.style.opacity = '1.0';
            saveState();
            updatePlot();
        }});

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            tSlider.disabled = true;
            cSlider.disabled = true;
            riSlider.disabled = true;
            btnSolid.disabled = true;
            btnHollow.disabled = true;
        }}

        // Listeners
        tSlider.addEventListener('input', (e) => {{
            state.T = parseFloat(e.target.value);
            document.getElementById('t-val-display').innerText = state.T.toFixed(0) + ' N-m';
            saveState();
            updatePlot();
        }});
        cSlider.addEventListener('input', (e) => {{
            state.c = parseFloat(e.target.value);
            document.getElementById('c-val-display').innerText = state.c.toFixed(0) + ' mm';
            
            // Adjust inner radius range
            riSlider.max = state.c - 3;
            if (state.type === 'hollow' && state.ri >= state.c) {{
                state.ri = state.c - 5;
                document.getElementById('ri-val-display').innerText = state.ri.toFixed(0) + ' mm';
            }}
            saveState();
            updatePlot();
        }});
        riSlider.addEventListener('input', (e) => {{
            state.ri = parseFloat(e.target.value);
            document.getElementById('ri-val-display').innerText = state.ri.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            tSlider.value = state.T;
            document.getElementById('t-val-display').innerText = state.T.toFixed(0) + ' N-m';
            cSlider.value = state.c;
            document.getElementById('c-val-display').innerText = state.c.toFixed(0) + ' mm';
            riSlider.max = state.c - 3;
            riSlider.value = state.ri;
            document.getElementById('ri-val-display').innerText = state.ri.toFixed(0) + ' mm';

            if (state.type === 'solid') {{
                btnSolid.classList.add('active');
                btnHollow.classList.remove('active');
                riSlider.disabled = true;
                riBox.style.opacity = '0.5';
            }} else {{
                btnHollow.classList.add('active');
                btnSolid.classList.remove('active');
                riSlider.disabled = isLocked ? true : false;
                riBox.style.opacity = '1.0';
            }}
        }}

        function updatePlot() {{
            let T = state.T;
            let c = state.c;
            let ri = state.ri;
            let type = state.type;

            // Math calculations
            // J = pi/2 * (c^4 - ri^4). Note: c and ri are in mm, need to convert to meters for standard,
            // but for stress in MPa: T is in N-m, c in mm, J in mm4.
            // Tau = T * rho / J.
            // Standard units: T in N-mm (T * 1000), c in mm, J in mm4. Stress is in MPa (N/mm2).
            let J = (Math.PI / 2) * (Math.pow(c, 4) - Math.pow(ri, 4)); // mm4
            let T_nmm = T * 1000; // N-mm
            let tau_max = (T_nmm * c) / J; // MPa
            let tau_min = (type === 'hollow') ? (T_nmm * ri) / J : 0; // MPa

            let yieldStrength = 80; // MPa (structural alloy limit)
            let isYielded = tau_max > yieldStrength;

            if (isYielded) {{
                yieldWarning.style.display = 'flex';
            }} else {{
                yieldWarning.style.display = 'none';
            }}

            let traces = [];
            let annotations = [];

            // ------------------ SUBPLOT 1: TORSIONAL SHAFT (Left, x: [0, 0.45]) ------------------
            // Draw 3D-like cylinder from x = 0.2 to x = 1.8. 
            // Left fixed boundary wall
            traces.push({{
                x: [0.1, 0.2, 0.2, 0.1],
                y: [1.8, 1.8, 0.2, 0.2],
                mode: 'lines',
                fill: 'toself',
                fillcolor: '#64748b',
                line: {{color: '#475569', width: 2}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Cylindrical boundary lines (solid gray)
            traces.push({{
                x: [0.2, 1.8, 1.8, 0.2, 0.2],
                y: [1.6, 1.6, 0.4, 0.4, 1.6],
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(148, 163, 184, 0.08)',
                line: {{color: '#94a3b8', width: 2}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            if (type === 'hollow') {{
                // Draw inner hollow lines dotted
                traces.push({{
                    x: [0.2, 1.8],
                    y: [1.2, 1.2],
                    mode: 'lines',
                    line: {{color: '#94a3b8', width: 1.5, dash: 'dot'}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                traces.push({{
                    x: [0.2, 1.8],
                    y: [0.8, 0.8],
                    mode: 'lines',
                    line: {{color: '#94a3b8', width: 1.5, dash: 'dot'}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }}

            // Draw curved Torque arrow at right end face (x = 1.8, y = 1.0)
            // Arc of ellipse from angle -60 to 240 degrees
            let arcX = [];
            let arcY = [];
            for (let th = -60; th <= 240; th += 10) {{
                let r_rad = th * Math.PI / 180;
                arcX.push(1.8 + 0.15 * Math.cos(r_rad));
                arcY.push(1.0 + 0.5 * Math.sin(r_rad));
            }}
            traces.push({{
                x: arcX,
                y: arcY,
                mode: 'lines',
                line: {{color: '#1e293b', width: 3}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Torque arrowhead
            annotations.push({{
                ax: arcX[arcX.length - 2], ay: arcY[arcY.length - 2],
                x: arcX[arcX.length - 1], y: arcY[arcY.length - 1],
                xref: 'x1', yref: 'y1',
                axref: 'x1', ayref: 'y1',
                showarrow: true,
                arrowhead: 2,
                arrowsize: 0.8,
                arrowwidth: 3,
                arrowcolor: '#1e293b',
                text: ''
            }});

            annotations.push({{
                x: 1.8, y: 1.7,
                xref: 'x1', yref: 'y1',
                text: `T = ${T} N-m`,
                font: {{family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold'}},
                showarrow: false
            }});

            // ------------------ SUBPLOT 2: CROSS-SECTION AND SHEAR PROFILE (Right, x: [0.55, 1.0]) ------------------
            // We draw circles centered at (0, 0)
            // Outer Circle radius c = 1.2 plot units. Inner Circle radius ri_plot = 1.2 * (ri/c)
            let outerPlotR = 1.2;
            let innerPlotR = outerPlotR * (ri / c);

            // Draw outer boundary circle
            let cx = [], cy = [];
            for (let th = 0; th <= 365; th += 5) {{
                let rad = th * Math.PI / 180;
                cx.push(outerPlotR * Math.cos(rad));
                cy.push(outerPlotR * Math.sin(rad));
            }}
            traces.push({{
                x: cx, y: cy,
                mode: 'lines',
                line: {{color: '#475569', width: 2.5}},
                fill: type === 'hollow' ? 'none' : 'toself',
                fillcolor: 'rgba(249, 115, 22, 0.04)',
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            if (type === 'hollow') {{
                // Draw inner boundary circle
                let cix = [], ciy = [];
                for (let th = 0; th <= 365; th += 5) {{
                    let rad = th * Math.PI / 180;
                    cix.push(innerPlotR * Math.cos(rad));
                    ciy.push(innerPlotR * Math.sin(rad));
                }}
                traces.push({{
                    x: cix, y: ciy,
                    mode: 'lines',
                    line: {{color: '#475569', width: 2}},
                    fill: 'toself',
                    fillcolor: 'rgba(255, 255, 255, 1.0)', // mask center to look hollow
                    xaxis: 'x2', yaxis: 'y2',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Shade the hollow donut ring
                // We do this by shading the outer trace, and masking with a white inner circle.
                // In Plotly, fill 'toself' on outer circle, then fill 'toself' on inner circle with background color. That works!
            }}

            // Draw classic butterfly shear stress distribution along horizontal axis y = 0
            // We draw arrows at different radii
            // Stress color
            let stressColor = isYielded ? '#ef4444' : '#f97316';

            // Right half distribution (x > 0, tau points vertically UP (+y))
            let numPoints = 5;
            let startVal = (type === 'hollow') ? innerPlotR : 0;
            let stepVal = (outerPlotR - startVal) / (numPoints - 1);

            for (let i = 0; i < numPoints; i++) {{
                let r_plot = startVal + stepVal * i;
                let actual_rho = (r_plot / outerPlotR) * c;
                let actual_stress = (T_nmm * actual_rho) / J;
                // scale arrow length
                let arrowLen = 0.8 * (actual_stress / tau_max);
                if (r_plot > 0.05) {{
                    annotations.push({{
                        ax: r_plot, ay: 0,
                        x: r_plot, y: arrowLen,
                        xref: 'x2', yref: 'y2',
                        axref: 'x2', ayref: 'y2',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 0.5,
                        arrowwidth: 1.5,
                        arrowcolor: stressColor,
                        text: ''
                    }});
                }}
            }}

            // Left half distribution (x < 0, tau points vertically DOWN (-y))
            for (let i = 0; i < numPoints; i++) {{
                let r_plot = -(startVal + stepVal * i);
                let actual_rho = Math.abs(r_plot / outerPlotR) * c;
                let actual_stress = (T_nmm * actual_rho) / J;
                // scale arrow length
                let arrowLen = -0.8 * (actual_stress / tau_max);
                if (Math.abs(r_plot) > 0.05) {{
                    annotations.push({{
                        ax: r_plot, ay: 0,
                        x: r_plot, y: arrowLen,
                        xref: 'x2', yref: 'y2',
                        axref: 'x2', ayref: 'y2',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 0.5,
                        arrowwidth: 1.5,
                        arrowcolor: stressColor,
                        text: ''
                    }});
                }}
            }}

            // Draw envelope lines connecting arrow tips to form the triangles
            if (type === 'solid') {{
                traces.push({{
                    x: [-outerPlotR, 0, outerPlotR],
                    y: [-0.8, 0, 0.8],
                    mode: 'lines',
                    line: {{color: stressColor, width: 2, dash: 'dash'}},
                    xaxis: 'x2', yaxis: 'y2',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }} else {{
                // Hollow trapezoidal envelopes
                traces.push({{
                    x: [-outerPlotR, -innerPlotR],
                    y: [-0.8, -0.8 * (ri/c)],
                    mode: 'lines',
                    line: {{color: stressColor, width: 2, dash: 'dash'}},
                    xaxis: 'x2', yaxis: 'y2',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                traces.push({{
                    x: [innerPlotR, outerPlotR],
                    y: [0.8 * (ri/c), 0.8],
                    mode: 'lines',
                    line: {{color: stressColor, width: 2, dash: 'dash'}},
                    xaxis: 'x2', yaxis: 'y2',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }}

            // Labels on subplot 2
            annotations.push({{
                x: outerPlotR + 0.2, y: 0.8,
                xref: 'x2', yref: 'y2',
                text: `τ_max = ${tau_max.toFixed(1)} MPa`,
                font: {{family: 'Outfit', size: 10, color: stressColor, weight: 'bold'}},
                showarrow: false,
                xanchor: 'left'
            }});

            if (type === 'hollow') {{
                annotations.push({{
                    x: innerPlotR + 0.1, y: 0.8 * (ri/c) - 0.2,
                    xref: 'x2', yref: 'y2',
                    text: `τ_min = ${tau_min.toFixed(1)} MPa`,
                    font: {{family: 'Outfit', size: 8, color: stressColor}},
                    showarrow: false,
                    xanchor: 'left'
                }});
            }}

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

            // Update equations box
            equationDisplay.innerHTML = `
                <b>Torsional Stress Equations:</b><br>
                • Outer Radius, c = ${c} mm | Inner Radius, r_i = ${ri} mm<br>
                • Polar Moment, <b>J = π/2 · (c⁴ - r_i⁴)</b> = <b>${J.toExponential(4)} mm⁴</b><br>
                • Max Shear Stress: <b>τ_max = T·c / J</b> = (${T} N-m · 1000 · ${c} mm) / J = <b>${tau_max.toFixed(2)} MPa</b><br>
                ${type === 'hollow' ? `• Min Shear Stress: <b>τ_min = T·r_i / J</b> = <b>${tau_min.toFixed(2)} MPa</b><br>` : ''}
                • Status: <b style="color:${isYielded ? '#b91c1c' : '#15803d'};">${isYielded ? 'YIELDED (τ_max &gt; 80 MPa)' : 'SAFE (τ_max ≤ 80 MPa)'}</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_torsion_shear():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #f97316; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 3 • Lesson 26</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Shear Stress due to Torsion</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit3"]
    topic_name = "Lesson 26: Shear Stress due to Torsion"
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
    if "vtor_phase" not in st.session_state:
        st.session_state.vtor_phase = "instructions"
    if "vtor_sliders_locked" not in st.session_state:
        st.session_state.vtor_sliders_locked = False
    if "vtor_reset_counter" not in st.session_state:
        st.session_state.vtor_reset_counter = 0
    if "vtor_answers" not in st.session_state:
        st.session_state.vtor_answers = {}

    def reset_simulator():
        st.session_state.vtor_phase = "instructions"
        st.session_state.vtor_answers = {}
        st.session_state.vtor_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vtor_phase == "poe_predict":
        st.session_state.vtor_sliders_locked = True
    else:
        st.session_state.vtor_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Torsional Stress Profile Solver")
        locked_js = "true" if st.session_state.vtor_sliders_locked else "false"
        reset_counter = st.session_state.vtor_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#f97316; font-weight:700;">{phase_titles[st.session_state.vtor_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vtor_phase == "instructions":
            st.markdown(r"""
            **Torsion** refers to the twisting of a straight member when subjected to moments (torques) that tend to produce rotation about its longitudinal axis.
            
            **Shear Stress Distribution:**
            Inside a circular shaft, torsional shear stress ($\tau$) is zero at the center and increases linearly to a maximum at the outer boundary ($c$):
            $$\tau = \frac{T \cdot \rho}{J}$$
            Where $J$ is the Polar Moment of Inertia, and $\rho$ is the radial distance from the center.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vtor_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vtor_phase == "guided_question":
            st.markdown(r"""
            **Guided Practice:**
            1. Select **Solid Circular Shaft**.
            2. Set **Applied Torque (T)** to `500 N-m`.
            3. Set **Outer Radius (c)** to `20 mm`.
            
            **Question:**
            What is the Polar Moment of Inertia ($J$) and the maximum shear stress ($\tau_{max}$)?
            """)
            
            ans = st.radio(
                "Select the correct calculation:",
                options=[
                    "J = 2.51 * 10^5 mm⁴, τ_max = 39.79 MPa",
                    "J = 1.26 * 10^5 mm⁴, τ_max = 79.58 MPa",
                    "J = 5.03 * 10^5 mm⁴, τ_max = 19.89 MPa",
                    "J = 2.51 * 10^5 mm⁴, τ_max = 19.89 MPa"
                ],
                key="vtor_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "2.51 * 10^5" in ans and "39.79" in ans:
                    st.success(r"Correct! $J = \frac{\pi}{2} c^4 = \frac{\pi}{2} (20)^4 \approx 251,327\text{ mm}^4 = 2.51 \times 10^5\text{ mm}^4$. Maximum stress $\tau_{max} = \frac{T \cdot c}{J} = \frac{500,000 \cdot 20}{251,327} \approx 39.79\text{ MPa}$.")
                else:
                    st.error(r"Incorrect. Use the simulator to verify the formula values: $J = \pi c^4 / 2 \approx 2.51 \times 10^5\text{ mm}^4$, and $\tau_{max} = T \cdot c / J \approx 39.79\text{ MPa}$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vtor_phase = "poe_predict"
                st.session_state.vtor_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vtor_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Specimen Controls Locked!):**
            
            **Scenario:**
            We have a torque $T = 500\text{ N-m}$ applied to a shaft of outer radius $c = 20\text{ mm}$.
            
            **Question:**
            If we switch to a **Hollow Shaft** of same outer radius $c = 20\text{ mm}$, but with an inner radius $r_i = 10\text{ mm}$ (meaning we hollow out the center 10 mm), what happens to the maximum shear stress at the outer boundary?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "It increases from 39.8 MPa to 42.4 MPa",
                    "It decreases from 39.8 MPa to 37.2 MPa",
                    "It remains exactly 39.8 MPa because outer radius is the same",
                    "It increases to 79.6 MPa (doubles)"
                ],
                key="vtor_poe_p_radio"
            )
            st.session_state.vtor_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vtor_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vtor_phase == "poe_observe":
            st.markdown(r"""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Toggle to **Hollow Circular Shaft**.
            2. Set **Applied Torque T** to `500 N-m`, **Outer Radius c** to `20 mm`, and **Inner Radius r_i** to `10 mm`.
            3. Observe the change in $J$ and $\tau_{max}$ in the equation display box.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vtor_answers.get("poe", "It increases from 39.8 MPa to 42.4 MPa")
            options_list = [
                "It increases from 39.8 MPa to 42.4 MPa",
                "It decreases from 39.8 MPa to 37.2 MPa",
                "It remains exactly 39.8 MPa because outer radius is the same",
                "It increases to 79.6 MPa (doubles)"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vtor_poe_o_radio"
            )
            st.session_state.vtor_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vtor_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vtor_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vtor_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vtor_answers.get("poe") == "It increases from 39.8 MPa to 42.4 MPa":
                st.success("🎉 **Correct!** Excellent engineering intuition.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics details below.")

            st.markdown(r"""
            ### Explanation:
            1. **Modifying J**:
               Hollowing out the center of the shaft removes material, which decreases its Polar Moment of Inertia ($J$):
               $$J_{\text{solid}} = \frac{\pi}{2}(20)^4 \approx 251.3 \times 10^3\text{ mm}^4$$
               $$J_{\text{hollow}} = \frac{\pi}{2}(20^4 - 10^4) \approx 235.6 \times 10^3\text{ mm}^4$$
               
            2. **Maximum Shear Stress**:
               Since maximum shear stress is inversely proportional to $J$ ($\tau_{max} = T \cdot c / J$):
               $$\tau_{\text{solid}} = \frac{500,000 \cdot 20}{251,327} \approx 39.79\text{ MPa}$$
               $$\tau_{\text{hollow}} = \frac{500,000 \cdot 20}{235,619} \approx 42.44\text{ MPa}$$
               
            *Conclusion:* Hollowing out the center increases the maximum stress by **only 6.7%**, even though we removed **25% of the material** (area goes from $1257\text{ mm}^2$ to $942\text{ mm}^2$). Because shear stress is linear and goes to zero at the center, material near the core carries almost no torque. Hollow shafts are therefore far more mass-efficient!
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

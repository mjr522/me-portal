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
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
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
            font-size: 0.82rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
        }}
        .btn-group {{
            display: flex;
            gap: 6px;
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
            font-size: 0.85rem;
            color: #475569;
            transition: all 0.2s;
            text-align: center;
        }}
        .btn-choice.active {{
            border-color: #3b82f6;
            background-color: #3b82f6;
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
        .slider-container {{
            margin-bottom: 8px;
        }}
        .slider-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }}
        .slider-title {{
            font-size: 0.85rem;
            font-weight: 500;
            color: #475569;
        }}
        .slider-value {{
            font-size: 0.85rem;
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
        select {{
            width: 100%;
            padding: 6px 10px;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.85rem;
            color: #475569;
            outline: none;
            background: white;
        }}
        select:disabled {{
            background: #cbd5e1;
            cursor: not-allowed;
        }}
        .equation-box {{
            background: #f1f5f9;
            border-radius: 8px;
            padding: 8px 12px;
            font-family: monospace;
            font-size: 0.88rem;
            margin-top: 10px;
            color: #1e293b;
            border-left: 4px solid #3b82f6;
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Vector controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 350px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Force Magnitude & Units -->
        <div class="control-box">
            <div class="control-title">1. Force Magnitude & Unit</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Magnitude, F</span>
                    <span class="slider-value" id="f-val-display">50.0 lb</span>
                </div>
                <input type="range" id="f-slider" min="10" max="100" step="1" value="50" class="custom-slider">
            </div>
            <div class="btn-group" style="margin-top: 6px;">
                <button class="btn-choice active" id="unit-us">US (lb)</button>
                <button class="btn-choice" id="unit-si">SI (N)</button>
            </div>
        </div>

        <!-- Quadrant Selection -->
        <div class="control-box">
            <div class="control-title">2. Quadrant Location</div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                <button class="btn-choice active" id="quad-1">Q1 (+, +)</button>
                <button class="btn-choice" id="quad-2">Q2 (-, +)</button>
                <button class="btn-choice" id="quad-3">Q3 (-, -)</button>
                <button class="btn-choice" id="quad-4">Q4 (+, -)</button>
            </div>
        </div>

        <!-- Input Mode (Angle vs Slope) -->
        <div class="control-box">
            <div class="control-title">3. Orientation Mode</div>
            <div class="btn-group" style="margin-bottom: 8px;">
                <button class="btn-choice active" id="mode-angle">Angle (θ)</button>
                <button class="btn-choice" id="mode-slope">Slope Triangle</button>
            </div>
        </div>

        <!-- Orientation Values -->
        <div class="control-box" id="orientation-detail-box">
            <div id="angle-controls">
                <div class="control-title">4. Angle Reference</div>
                <div class="btn-group" style="margin-bottom: 8px;">
                    <button class="btn-choice active" id="ref-horiz">From Horiz</button>
                    <button class="btn-choice" id="ref-vert">From Vert</button>
                </div>
                <div class="slider-container">
                    <div class="slider-header">
                        <span class="slider-title">Relative Angle, θ</span>
                        <span class="slider-value" id="theta-val-display">30.0°</span>
                    </div>
                    <input type="range" id="theta-slider" min="0" max="90" step="1" value="30" class="custom-slider">
                </div>
            </div>
            
            <div id="slope-controls" style="display: none;">
                <div class="control-title">4. Slope Triangle Ratio</div>
                <select id="slope-select">
                    <option value="3-4-5-horiz">3:4:5 (Horiz: 4, Vert: 3)</option>
                    <option value="3-4-5-vert">3:4:5 (Horiz: 3, Vert: 4)</option>
                    <option value="5-12-13-horiz">5:12:13 (Horiz: 12, Vert: 5)</option>
                    <option value="5-12-13-vert">5:12:13 (Horiz: 5, Vert: 12)</option>
                    <option value="8-15-17-horiz">8:15:17 (Horiz: 15, Vert: 8)</option>
                </select>
                <div style="font-size: 0.8rem; color:#64748b; margin-top:8px;" id="slope-description">
                    Hypotenuse (d) = 5.0. Cosine = 4/5, Sine = 3/5.
                </div>
            </div>
        </div>
    </div>

    <!-- Live Equation Output -->
    <div class="equation-box" id="equation-display">
        Fx = 50.0 * cos(30.0°) = 43.30 lb<br>
        Fy = 50.0 * sin(30.0°) = 25.00 lb
    </div>

    <script>
        // Setup variables
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // Cache DOM elements
        const fSlider = document.getElementById('f-slider');
        const thetaSlider = document.getElementById('theta-slider');
        const slopeSelect = document.getElementById('slope-select');
        const equationDisplay = document.getElementById('equation-display');
        const lockBanner = document.getElementById('lock-banner');

        // Buttons
        const btnSI = document.getElementById('unit-si');
        const btnUS = document.getElementById('unit-us');
        const btnQ1 = document.getElementById('quad-1');
        const btnQ2 = document.getElementById('quad-2');
        const btnQ3 = document.getElementById('quad-3');
        const btnQ4 = document.getElementById('quad-4');
        const btnModeAngle = document.getElementById('mode-angle');
        const btnModeSlope = document.getElementById('mode-slope');
        const btnRefHoriz = document.getElementById('ref-horiz');
        const btnRefVert = document.getElementById('ref-vert');

        // Panels
        const angleControls = document.getElementById('angle-controls');
        const slopeControls = document.getElementById('slope-controls');

        // State variables
        let state = {{
            F: 50,
            unit: 'lb',
            quadrant: 1,
            mode: 'angle', // 'angle' or 'slope'
            refAxis: 'horizontal', // 'horizontal' or 'vertical'
            theta: 30,
            slopeType: '3-4-5-horiz'
        }};

        // Read sessionStorage if exists (and not reset)
        const lastReset = parseInt(sessionStorage.getItem('vres_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.F = parseFloat(sessionStorage.getItem('vres_F') || '50');
            state.unit = sessionStorage.getItem('vres_unit') || 'lb';
            state.quadrant = parseInt(sessionStorage.getItem('vres_quadrant') || '1');
            state.mode = sessionStorage.getItem('vres_mode') || 'angle';
            state.refAxis = sessionStorage.getItem('vres_refAxis') || 'horizontal';
            state.theta = parseFloat(sessionStorage.getItem('vres_theta') || '30');
            state.slopeType = sessionStorage.getItem('vres_slopeType') || '3-4-5-horiz';
        }} else {{
            sessionStorage.setItem('vres_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vres_F', state.F);
            sessionStorage.setItem('vres_unit', state.unit);
            sessionStorage.setItem('vres_quadrant', state.quadrant);
            sessionStorage.setItem('vres_mode', state.mode);
            sessionStorage.setItem('vres_refAxis', state.refAxis);
            sessionStorage.setItem('vres_theta', state.theta);
            sessionStorage.setItem('vres_slopeType', state.slopeType);
        }}

        // Handle locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            fSlider.disabled = true;
            thetaSlider.disabled = true;
            slopeSelect.disabled = true;
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = true);
        }}

        // Setup triggers
        function setupButtonRadio(group, activeBtn, stateProp, stateVal) {{
            group.forEach(btn => {{
                btn.addEventListener('click', () => {{
                    if (isLocked) return;
                    group.forEach(b => b.classList.remove('active'));
                    activeBtn.classList.add('active');
                    state[stateProp] = stateVal;
                    saveState();
                    syncUI();
                    updatePlot();
                }});
            }});
        }}

        // Quadrants
        [btnQ1, btnQ2, btnQ3, btnQ4].forEach((btn, idx) => {{
            btn.addEventListener('click', () => {{
                if (isLocked) return;
                [btnQ1, btnQ2, btnQ3, btnQ4].forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.quadrant = idx + 1;
                saveState();
                updatePlot();
            }});
        }});

        // Unit system
        btnUS.addEventListener('click', () => {{
            if (isLocked) return;
            btnUS.classList.add('active');
            btnSI.classList.remove('active');
            state.unit = 'lb';
            saveState();
            syncUI();
            updatePlot();
        }});
        btnSI.addEventListener('click', () => {{
            if (isLocked) return;
            btnSI.classList.add('active');
            btnUS.classList.remove('active');
            state.unit = 'N';
            saveState();
            syncUI();
            updatePlot();
        }});

        // Modes
        btnModeAngle.addEventListener('click', () => {{
            if (isLocked) return;
            btnModeAngle.classList.add('active');
            btnModeSlope.classList.remove('active');
            state.mode = 'angle';
            angleControls.style.display = 'block';
            slopeControls.style.display = 'none';
            saveState();
            updatePlot();
        }});
        btnModeSlope.addEventListener('click', () => {{
            if (isLocked) return;
            btnModeSlope.classList.add('active');
            btnModeAngle.classList.remove('active');
            state.mode = 'slope';
            angleControls.style.display = 'none';
            slopeControls.style.display = 'block';
            saveState();
            updatePlot();
        }});

        // References
        btnRefHoriz.addEventListener('click', () => {{
            if (isLocked) return;
            btnRefHoriz.classList.add('active');
            btnRefVert.classList.remove('active');
            state.refAxis = 'horizontal';
            saveState();
            updatePlot();
        }});
        btnRefVert.addEventListener('click', () => {{
            if (isLocked) return;
            btnRefVert.classList.add('active');
            btnRefHoriz.classList.remove('active');
            state.refAxis = 'vertical';
            saveState();
            updatePlot();
        }});

        // Sliders
        fSlider.addEventListener('input', (e) => {{
            state.F = parseFloat(e.target.value);
            document.getElementById('f-val-display').innerText = state.F.toFixed(1) + ' ' + state.unit;
            saveState();
            updatePlot();
        }});

        thetaSlider.addEventListener('input', (e) => {{
            state.theta = parseFloat(e.target.value);
            document.getElementById('theta-val-display').innerText = state.theta.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});

        slopeSelect.addEventListener('change', (e) => {{
            state.slopeType = e.target.value;
            saveState();
            updatePlot();
        }});

        // Sync UI with state
        function syncUI() {{
            fSlider.value = state.F;
            document.getElementById('f-val-display').innerText = state.F.toFixed(1) + ' ' + state.unit;
            
            thetaSlider.value = state.theta;
            document.getElementById('theta-val-display').innerText = state.theta.toFixed(1) + '°';
            
            // Unit buttons
            if (state.unit === 'lb') {{
                btnUS.classList.add('active');
                btnSI.classList.remove('active');
            }} else {{
                btnSI.classList.add('active');
                btnUS.classList.remove('active');
            }}

            // Quadrants
            [btnQ1, btnQ2, btnQ3, btnQ4].forEach((btn, idx) => {{
                if (state.quadrant === idx + 1) btn.classList.add('active');
                else btn.classList.remove('active');
            }});

            // Mode
            if (state.mode === 'angle') {{
                btnModeAngle.classList.add('active');
                btnModeSlope.classList.remove('active');
                angleControls.style.display = 'block';
                slopeControls.style.display = 'none';
            }} else {{
                btnModeSlope.classList.add('active');
                btnModeAngle.classList.remove('active');
                angleControls.style.display = 'none';
                slopeControls.style.display = 'block';
            }}

            // Reference axis
            if (state.refAxis === 'horizontal') {{
                btnRefHoriz.classList.add('active');
                btnRefVert.classList.remove('active');
            }} else {{
                btnRefVert.classList.add('active');
                btnRefHoriz.classList.remove('active');
            }}

            slopeSelect.value = state.slopeType;
        }}

        // Calculations & Rendering
        function updatePlot() {{
            let F = state.F;
            let Fx = 0;
            let Fy = 0;
            let eqText = '';

            let signX = 1;
            let signY = 1;
            if (state.quadrant === 2) {{ signX = -1; signY = 1; }}
            else if (state.quadrant === 3) {{ signX = -1; signY = -1; }}
            else if (state.quadrant === 4) {{ signX = 1; signY = -1; }}

            if (state.mode === 'angle') {{
                let rad = state.theta * Math.PI / 180;
                let valCos = Math.cos(rad);
                let valSin = Math.sin(rad);

                if (state.refAxis === 'horizontal') {{
                    Fx = F * valCos * signX;
                    Fy = F * valSin * signY;
                    eqText = `Fx = ${signX < 0 ? '-' : ''}${F.toFixed(1)} * cos(${state.theta.toFixed(0)}°) = ${Fx.toFixed(2)} ${state.unit}<br>` +
                             `Fy = ${signY < 0 ? '-' : ''}${F.toFixed(1)} * sin(${state.theta.toFixed(0)}°) = ${Fy.toFixed(2)} ${state.unit}`;
                }} else {{
                    Fx = F * valSin * signX;
                    Fy = F * valCos * signY;
                    eqText = `Fx = ${signX < 0 ? '-' : ''}${F.toFixed(1)} * sin(${state.theta.toFixed(0)}°) = ${Fx.toFixed(2)} ${state.unit}<br>` +
                             `Fy = ${signY < 0 ? '-' : ''}${F.toFixed(1)} * cos(${state.theta.toFixed(0)}°) = ${Fy.toFixed(2)} ${state.unit}`;
                }}
            }} else {{
                let h = 4, v = 3, d = 5;
                let slopeDesc = '';
                if (state.slopeType === '3-4-5-horiz') {{
                    h = 4; v = 3; d = 5;
                    slopeDesc = 'Hypotenuse (d) = 5. Cosine = 4/5, Sine = 3/5.';
                }} else if (state.slopeType === '3-4-5-vert') {{
                    h = 3; v = 4; d = 5;
                    slopeDesc = 'Hypotenuse (d) = 5. Cosine = 3/5, Sine = 4/5.';
                }} else if (state.slopeType === '5-12-13-horiz') {{
                    h = 12; v = 5; d = 13;
                    slopeDesc = 'Hypotenuse (d) = 13. Cosine = 12/13, Sine = 5/13.';
                }} else if (state.slopeType === '5-12-13-vert') {{
                    h = 5; v = 12; d = 13;
                    slopeDesc = 'Hypotenuse (d) = 13. Cosine = 5/13, Sine = 12/13.';
                }} else if (state.slopeType === '8-15-17-horiz') {{
                    h = 15; v = 8; d = 17;
                    slopeDesc = 'Hypotenuse (d) = 17. Cosine = 15/17, Sine = 8/17.';
                }}
                document.getElementById('slope-description').innerText = slopeDesc;

                Fx = F * (h / d) * signX;
                Fy = F * (v / d) * signY;
                eqText = `Fx = ${signX < 0 ? '-' : ''}${F.toFixed(1)} * (${h}/${d}) = ${Fx.toFixed(2)} ${state.unit}<br>` +
                         `Fy = ${signY < 0 ? '-' : ''}${F.toFixed(1)} * (${v}/${d}) = ${Fy.toFixed(2)} ${state.unit}`;
            }}

            equationDisplay.innerHTML = eqText;

            // Generate Plotly Data
            const theta_circle = Array.from({{length: 100}}, (_, i) => i * 2 * Math.PI / 99);
            const circleX = theta_circle.map(t => F * Math.cos(t));
            const circleY = theta_circle.map(t => F * Math.sin(t));

            // Projections (Dashed lines)
            const projLines = {{
                x: [Fx, Fx, 0, Fx],
                y: [0, Fy, Fy, Fy],
                mode: 'lines',
                line: {{color: '#94a3b8', width: 1.5, dash: 'dash'}},
                name: 'Projections',
                showlegend: false,
                hoverinfo: 'skip'
            }};

            // Reference Circle
            const refCircle = {{
                x: circleX,
                y: circleY,
                mode: 'lines',
                line: {{color: '#cbd5e1', width: 1.5, dash: 'dot'}},
                name: 'Locus R=' + F,
                showlegend: false,
                hoverinfo: 'skip'
            }};

            const data = [refCircle, projLines];

            // Setup Layout & Annotations
            let annotations = [
                // Resultant Vector Arrow (Red)
                {{
                    ax: 0, ay: 0,
                    x: Fx, y: Fy,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 3,
                    arrowsize: 1.2,
                    arrowwidth: 4.5,
                    arrowcolor: '#ef4444',
                    text: ''
                }}
            ];

            if (F > 0) {{
                annotations.push({{
                    x: Fx / 2, y: Fy / 2,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: 'F = ' + F.toFixed(0) + ' ' + state.unit,
                    font: {{family: 'Outfit', size: 12, color: '#ef4444', weight: 'bold'}},
                    yshift: 12,
                    xshift: state.quadrant === 2 || state.quadrant === 3 ? -20 : 20
                }});
            }}

            annotations.push(
                // Fx Component Arrow (Blue) - along x-axis
                {{
                    ax: 0, ay: 0,
                    x: Fx, y: 0,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1,
                    arrowwidth: 3,
                    arrowcolor: '#3b82f6',
                    text: ''
                }},
                // Fx Component Label
                {{
                    x: Fx / 2, y: 0,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: 'Fx = ' + Fx.toFixed(1),
                    font: {{family: 'Outfit', size: 11, color: '#3b82f6', weight: 'bold'}},
                    yshift: state.quadrant === 3 || state.quadrant === 4 ? -15 : 15
                }},
                // Fy Component Arrow (Green) - stacked tip-to-tail
                {{
                    ax: Fx, ay: 0,
                    x: Fx, y: Fy,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1,
                    arrowwidth: 3,
                    arrowcolor: '#22c55e',
                    text: ''
                }},
                // Fy Component Label
                {{
                    x: Fx, y: Fy / 2,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: 'Fy = ' + Fy.toFixed(1),
                    font: {{family: 'Outfit', size: 11, color: '#22c55e', weight: 'bold'}},
                    xshift: state.quadrant === 2 || state.quadrant === 3 ? -30 : 30
                }}
            );

            const layout = {{
                xaxis: {{
                    range: [-110, 110],
                    zeroline: true,
                    zerolinecolor: '#64748b',
                    zerolinewidth: 2,
                    gridcolor: '#f1f5f9',
                    fixedrange: true,
                    title: 'X Axis'
                }},
                yaxis: {{
                    range: [-110, 110],
                    zeroline: true,
                    zerolinecolor: '#64748b',
                    zerolinewidth: 2,
                    gridcolor: '#f1f5f9',
                    fixedrange: true,
                    scaleanchor: 'x',
                    scaleratio: 1,
                    title: 'Y Axis'
                }},
                margin: {{l: 40, r: 20, t: 20, b: 40}},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                annotations: annotations
            }};

            Plotly.react('plotly-chart', data, layout);
        }}

        // Initialization
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_vector_resolution():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #3b82f6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 1 • Lesson 2</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Lab Tour; Fund. Skills Review; Units</h1>
    </div>
    """, unsafe_allow_html=True)

    # Render Learning Objectives
    unit = UNITS["unit1"]
    topic_name = "Lesson 2: Lab Tour; Fund. Skills Review; Units"
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

    # Inject CSS to style the right sidecar column
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

    # Initialize session state for simulator navigation and responses
    if "vres_phase" not in st.session_state:
        st.session_state.vres_phase = "instructions"
    if "vres_sliders_locked" not in st.session_state:
        st.session_state.vres_sliders_locked = False
    if "vres_reset_counter" not in st.session_state:
        st.session_state.vres_reset_counter = 0
    if "vres_answers" not in st.session_state:
        st.session_state.vres_answers = {}

    def reset_simulator():
        st.session_state.vres_phase = "instructions"
        st.session_state.vres_answers = {}
        st.session_state.vres_reset_counter += 1

    # Map raw phase name to a nice readable header
    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    # Lock sliders state check based on current phase
    if st.session_state.vres_phase == "poe_predict":
        st.session_state.vres_sliders_locked = True
    else:
        st.session_state.vres_sliders_locked = False

    # Layout: Two columns
    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW (Iframe with Real-time HTML Sliders) ------------------
    with left_col:
        st.subheader("Interactive Vector Sandbox")
        
        # Prepare params to inject
        locked_js = "true" if st.session_state.vres_sliders_locked else "false"
        reset_counter = st.session_state.vres_reset_counter
        
        # Build HTML content
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        
        # Render the custom iframe component
        st.iframe(html_content, height=620)

        # Auxiliary Unit Conversion Box (Objective 2.1 & 2.2)
        st.markdown("### ⚖️ Auxiliary: Mass vs. Weight (SI & US Customary)")
        st.write("Understand the physical difference between Mass (inertia) and Force/Weight (gravity). Adjust mass to see weight:")
        
        col_aux1, col_aux2 = st.columns(2)
        with col_aux1:
            system = st.radio("Select Unit System", ["US Customary", "SI Metric"], key="vres_aux_sys")
        with col_aux2:
            if system == "US Customary":
                mass = st.slider("Mass, m (slugs)", 0.5, 10.0, 3.0, 0.5)
                # W = m * g (g = 32.174 ft/s^2) -> 1 slug * 32.174 ft/s^2 = 32.174 lb
                weight = mass * 32.174
                st.metric(label="Weight, W (lb)", value=f"{weight:.2f} lb", delta=f"{mass:.1f} slugs × 32.2 ft/s²")
            else:
                mass = st.slider("Mass, m (kg)", 5.0, 150.0, 50.0, 5.0)
                # W = m * g (g = 9.807 m/s^2) -> N
                weight = mass * 9.807
                st.metric(label="Weight, W (N)", value=f"{weight:.2f} N", delta=f"{mass:.1f} kg × 9.81 m/s²")

    # ------------------ RIGHT COLUMN: SIDECAR CONTAINER ------------------
    with right_col:
        # Render anchor to apply column styles
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#3b82f6; font-weight:700;">{phase_titles[st.session_state.vres_phase]}</h4>', unsafe_allow_html=True)

        # Phase 1: Instructions
        if st.session_state.vres_phase == "instructions":
            st.markdown("""
            Welcome to the Vector Resolution Sandbox!
            
            **Instructions:**
            1. Drag the **Force Magnitude** slider to see the length of the resultant vector $F$ change.
            2. Toggle between **Angle (θ)** and **Slope Triangle** orientation modes.
            3. Select different **Quadrants** (Q1, Q2, Q3, Q4) to see how the component signs update (+ or -).
            4. Switch the reference axis between **From Horizontal** and **From Vertical** to see how the cosine and sine components swap!
            
            *Tip: The blue vector represents the $F_x$ component (horizontal), and the green vector represents the $F_y$ component (vertical). They add tip-to-tail to form the red vector $F$.*
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vres_phase = "guided_question"
                st.rerun()

        # Phase 2: Guided Practice
        elif st.session_state.vres_phase == "guided_question":
            st.markdown("""
            **Concept Check:**
            Configure the simulator to:
            * **Force Magnitude**: `60.0 lb`
            * **Quadrant**: `Q2`
            * **Orientation Mode**: `Angle`
            * **Reference**: `From Vertical`
            * **Relative Angle**: `45.0°`
            
            Observe the components:
            Which trig function is used for $F_x$, and what are the resulting components?
            """)
            
            ans = st.radio(
                "Select the correct components:",
                options=[
                    "Fx uses cosine: Fx = -42.43 lb, Fy = 42.43 lb",
                    "Fx uses sine: Fx = -42.43 lb, Fy = 42.43 lb",
                    "Fx uses sine: Fx = -30.00 lb, Fy = 51.96 lb",
                    "Fx uses cosine: Fx = -51.96 lb, Fy = 30.00 lb"
                ],
                key="vres_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "Fx uses sine: Fx = -42.43" in ans:
                    st.success(r"Correct! Because the angle is measured from the **vertical axis**, the horizontal component $F_x$ uses the sine function: $F_x = -F \sin(45^\circ) = -42.43\text{ lb}$, and the vertical component $F_y$ uses cosine.")
                else:
                    st.error("Incorrect. Look closely at the equation display in the sandbox: since the angle is relative to the vertical axis, the opposite side is horizontal ($F_x$), meaning it must use $\sin(45^\circ)$.")

            st.markdown("---")
            if st.button("Start POE Challenge 🔮", use_container_width=True):
                st.session_state.vres_phase = "poe_predict"
                st.session_state.vres_answers["poe"] = None
                st.rerun()

        # Phase 3: POE Predict
        elif st.session_state.vres_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Vector Controls Locked!):**
            
            **Scenario:**
            A force of magnitude $F = 50.0\text{ lb}$ is directed in **Quadrant 3**. The orientation is defined by a **3:4:5 slope triangle** (Horizontal dimension = 4, Vertical dimension = 3).
            
            **Question:**
            Without unlocking the controls, predict the exact components $F_x$ and $F_y$ (both magnitude and sign).
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Fx = -40.0 lb, Fy = -30.0 lb",
                    "Fx = -30.0 lb, Fy = -40.0 lb",
                    "Fx = +40.0 lb, Fy = +30.0 lb",
                    "Fx = -40.0 lb, Fy = +30.0 lb"
                ],
                key="vres_poe_p_radio"
            )
            st.session_state.vres_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vres_phase = "poe_observe"
                st.rerun()

        # Phase 4: POE Observe & Correct
        elif st.session_state.vres_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set the sandbox to **Q3** quadrant.
            2. Toggle orientation mode to **Slope Triangle**.
            3. Select the slope ratio **3:4:5 (Horiz: 4, Vert: 3)**.
            4. Adjust force magnitude to **50.0 lb**.
            5. Check the resulting components on the graph.
            
            *You can change your hypothesis below if the simulation disproved your guess!*
            """)
            
            val_init = st.session_state.vres_answers.get("poe", "Fx = -40.0 lb, Fy = -30.0 lb")
            options_list = [
                "Fx = -40.0 lb, Fy = -30.0 lb",
                "Fx = -30.0 lb, Fy = -40.0 lb",
                "Fx = +40.0 lb, Fy = +30.0 lb",
                "Fx = -40.0 lb, Fy = +30.0 lb"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vres_poe_o_radio"
            )
            st.session_state.vres_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vres_phase = "poe_explain"
                st.rerun()

        # Phase 5: POE Explain
        elif st.session_state.vres_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vres_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vres_answers.get("poe") == "Fx = -40.0 lb, Fy = -30.0 lb":
                st.success("🎉 **Correct!** Great work.")
            else:
                st.warning("⚠️ **Incorrect.** Review the physics explanation below to see why.")

            st.markdown(r"""
            ### Explanation:
            1. **Signs (Quadrant 3)**: In Quadrant 3, vectors point left and down. Thus, both $F_x$ and $F_y$ must be negative.
            2. **Slope Triangle Proportions**:
               * The slope triangle has a horizontal dimension of 4, vertical of 3, and hypotenuse of 5.
               * The cosine of the angle with the horizontal is $\frac{\text{horizontal}}{\text{hypotenuse}} = \frac{4}{5} = 0.8$.
               * The sine of the angle is $\frac{\text{vertical}}{\text{hypotenuse}} = \frac{3}{5} = 0.6$.
            3. **Components**:
               * $F_x = -F \cdot \frac{4}{5} = -50 \cdot 0.8 = -40.0\text{ lb}$
               * $F_y = -F \cdot \frac{3}{5} = -50 \cdot 0.6 = -30.0\text{ lb}$
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

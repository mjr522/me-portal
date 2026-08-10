import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Shear Stress Sandbox
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

    <!-- Shear Type Toggle -->
    <div class="btn-group">
        <button id="btn-single" class="btn-choice active">Single Shear Joint</button>
        <button id="btn-double" class="btn-choice">Double Shear Joint</button>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 280px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Load Force -->
        <div class="control-box">
            <div class="control-title">1. Tension Load (P)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Force, P</span>
                    <span class="slider-value" id="p-val-display">80 kN</span>
                </div>
                <input type="range" id="p-slider" min="10" max="150" step="5" value="80" class="custom-slider">
            </div>
        </div>

        <!-- Pin Diameter -->
        <div class="control-box">
            <div class="control-title">2. Pin Dia. (d)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Diameter, d</span>
                    <span class="slider-value" id="d-val-display">20 mm</span>
                </div>
                <input type="range" id="d-slider" min="10" max="40" step="2" value="20" class="custom-slider">
            </div>
        </div>

        <!-- Allowable Shear Stress -->
        <div class="control-box">
            <div class="control-title">3. Shear Strength (τ_y)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Strength, τ_y</span>
                    <span class="slider-value" id="strength-val-display">120 MPa</span>
                </div>
                <input type="range" id="strength-slider" min="50" max="150" step="10" value="120" class="custom-slider">
            </div>
        </div>
    </div>

    <!-- Failure warning -->
    <div id="fail-warning" class="warning-box" style="display: none;">
        <span>💥</span>
        <span><b>PIN FAILURE!</b> Shear stress exceeds the pin's material strength. The bolt has sheared clean through!</span>
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
        const btnSingle = document.getElementById('btn-single');
        const btnDouble = document.getElementById('btn-double');
        const pSlider = document.getElementById('p-slider');
        const dSlider = document.getElementById('d-slider');
        const strengthSlider = document.getElementById('strength-slider');
        const lockBanner = document.getElementById('lock-banner');
        const failWarning = document.getElementById('fail-warning');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            type: 'single',
            P: 80,
            d: 20,
            strength: 120
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vshear_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.type = sessionStorage.getItem('vshear_type') || 'single';
            state.P = parseFloat(sessionStorage.getItem('vshear_P') || '80');
            state.d = parseFloat(sessionStorage.getItem('vshear_d') || '20');
            state.strength = parseFloat(sessionStorage.getItem('vshear_strength') || '120');
        }} else {{
            sessionStorage.setItem('vshear_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vshear_type', state.type);
            sessionStorage.setItem('vshear_P', state.P);
            sessionStorage.setItem('vshear_d', state.d);
            sessionStorage.setItem('vshear_strength', state.strength);
        }}

        // Mode toggles
        btnSingle.addEventListener('click', () => {{
            if (isLocked) return;
            state.type = 'single';
            btnSingle.classList.add('active');
            btnDouble.classList.remove('active');
            saveState();
            updatePlot();
        }});
        btnDouble.addEventListener('click', () => {{
            if (isLocked) return;
            state.type = 'double';
            btnDouble.classList.add('active');
            btnSingle.classList.remove('active');
            saveState();
            updatePlot();
        }});

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            pSlider.disabled = true;
            dSlider.disabled = true;
            strengthSlider.disabled = true;
            btnSingle.disabled = true;
            btnDouble.disabled = true;
        }}

        // Listeners
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
        strengthSlider.addEventListener('input', (e) => {{
            state.strength = parseFloat(e.target.value);
            document.getElementById('strength-val-display').innerText = state.strength.toFixed(0) + ' MPa';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            dSlider.value = state.d;
            document.getElementById('d-val-display').innerText = state.d.toFixed(0) + ' mm';
            strengthSlider.value = state.strength;
            document.getElementById('strength-val-display').innerText = state.strength.toFixed(0) + ' MPa';

            if (state.type === 'single') {{
                btnSingle.classList.add('active');
                btnDouble.classList.remove('active');
            }} else {{
                btnDouble.classList.add('active');
                btnSingle.classList.remove('active');
            }}
        }}

        function updatePlot() {{
            let P = state.P;
            let d = state.d;
            let strength = state.strength;
            let type = state.type;

            // Math Sizing
            let A_pin = Math.PI * d * d / 4; // mm2
            let n_planes = (type === 'single') ? 1 : 2;
            let stress = (P * 1000) / (n_planes * A_pin); // MPa

            let isFailed = stress > strength;
            if (isFailed) {{
                failWarning.style.display = 'flex';
            }} else {{
                failWarning.style.display = 'none';
            }}

            let traces = [];
            let annotations = [];

            // Draw axis bounds: x: [-3, 3], y: [-1, 3]
            // Thickness of pin based on diameter d
            let pinW = 0.15 + 0.25 * (d / 40);

            // Snapping offsets
            let offset_left = isFailed ? -0.4 : 0;
            let offset_right = isFailed ? 0.4 : 0;

            if (type === 'single') {
                // SINGLE SHEAR JOINT
                // Top Plate: pulls LEFT (so offset_left applies to top)
                traces.push({{
                    x: [-2.0 + offset_left, 0.4 + offset_left, 0.4 + offset_left, -2.0 + offset_left, -2.0 + offset_left],
                    y: [0.7, 0.7, 1.3, 1.3, 0.7],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(148, 163, 184, 0.15)',
                    line: {{color: '#475569', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Bottom Plate: pulls RIGHT (so offset_right applies to bottom)
                traces.push({{
                    x: [-0.4 + offset_right, 2.0 + offset_right, 2.0 + offset_right, -0.4 + offset_right, -0.4 + offset_right],
                    y: [0.1, 0.1, 0.7, 0.7, 0.1],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(148, 163, 184, 0.15)',
                    line: {{color: '#64748b', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Draw Pin. Snaps at shear plane y = 0.7
                if (!isFailed) {{
                    // Unbroken vertical Pin from y = -0.2 to y = 1.6
                    traces.push({{
                        x: [-pinW/2, -pinW/2, pinW/2, pinW/2, -pinW/2],
                        y: [-0.2, 1.6, 1.6, -0.2, -0.2],
                        mode: 'lines',
                        fill: 'toself',
                        fillcolor: 'rgba(249, 115, 22, 0.1)',
                        line: {{color: '#f97316', width: 3.0}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                }} else {{
                    // Broken Pin: Top half moves left
                    traces.push({{
                        x: [-pinW/2 + offset_left, -pinW/2 + offset_left, pinW/2 + offset_left, pinW/2 + offset_left, -pinW/2 + offset_left],
                        y: [0.7, 1.6, 1.6, 0.7, 0.7],
                        mode: 'lines',
                        fill: 'toself',
                        fillcolor: 'rgba(239, 68, 68, 0.15)',
                        line: {{color: '#ef4444', width: 2.5}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                    // Broken Pin: Bottom half moves right
                    traces.push({{
                        x: [-pinW/2 + offset_right, -pinW/2 + offset_right, pinW/2 + offset_right, pinW/2 + offset_right, -pinW/2 + offset_right],
                        y: [-0.2, 0.7, 0.7, -0.2, -0.2],
                        mode: 'lines',
                        fill: 'toself',
                        fillcolor: 'rgba(239, 68, 68, 0.15)',
                        line: {{color: '#ef4444', width: 2.5}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                }}

                // Force arrows
                annotations.push({{
                    ax: -2.0 + offset_left, ay: 1.0,
                    x: -2.7 + offset_left, y: 1.0,
                    showarrow: true,
                    arrowhead: 2,
                    arrowcolor: '#1e293b',
                    arrowwidth: 3.5,
                    text: ''
                }});
                annotations.push({{
                    x: -2.7 + offset_left, y: 1.0,
                    showarrow: false,
                    text: `P = ${P} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold'}},
                    xshift: -15
                }});

                annotations.push({{
                    ax: 2.0 + offset_right, ay: 0.4,
                    x: 2.7 + offset_right, y: 0.4,
                    showarrow: true,
                    arrowhead: 2,
                    arrowcolor: '#1e293b',
                    arrowwidth: 3.5,
                    text: ''
                }});
                annotations.push({{
                    x: 2.7 + offset_right, y: 0.4,
                    showarrow: false,
                    text: `P = ${P} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold'}},
                    xshift: 15
                }});

                // Mark Shear Plane y=0.7
                if (!isFailed) {{
                    annotations.push({{
                        x: pinW/2 + 0.4, y: 0.7,
                        text: 'Shear Plane ✂️',
                        font: {{family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold'}},
                        showarrow: true,
                        arrowhead: 1,
                        arrowsize: 0.5,
                        ax: 35, ay: 0
                    }});
                }}

            } else {
                // DOUBLE SHEAR JOINT
                // Outer Plates (Top and Bottom): pull LEFT (offset_left)
                // Top Outer Plate (y: 1.3 to 1.9)
                traces.push({{
                    x: [-2.0 + offset_left, 0.4 + offset_left, 0.4 + offset_left, -2.0 + offset_left, -2.0 + offset_left],
                    y: [1.3, 1.3, 1.9, 1.9, 1.3],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(148, 163, 184, 0.15)',
                    line: {{color: '#475569', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                // Bottom Outer Plate (y: 0.1 to 0.7)
                traces.push({{
                    x: [-2.0 + offset_left, 0.4 + offset_left, 0.4 + offset_left, -2.0 + offset_left, -2.0 + offset_left],
                    y: [0.1, 0.1, 0.7, 0.7, 0.1],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(148, 163, 184, 0.15)',
                    line: {{color: '#475569', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Inner Center Plate: pulls RIGHT (offset_right) (y: 0.7 to 1.3)
                traces.push({{
                    x: [-0.4 + offset_right, 2.0 + offset_right, 2.0 + offset_right, -0.4 + offset_right, -0.4 + offset_right],
                    y: [0.7, 0.7, 1.3, 1.3, 0.7],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(148, 163, 184, 0.15)',
                    line: {{color: '#64748b', width: 2}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Draw Pin: Snaps at y=0.7 and y=1.3
                if (!isFailed) {{
                    // Unbroken Pin from y = -0.1 to y = 2.1
                    traces.push({{
                        x: [-pinW/2, -pinW/2, pinW/2, pinW/2, -pinW/2],
                        y: [-0.1, 2.1, 2.1, -0.1, -0.1],
                        mode: 'lines',
                        fill: 'toself',
                        fillcolor: 'rgba(249, 115, 22, 0.1)',
                        line: {{color: '#f97316', width: 3.0}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                }} else {{
                    // Broken Pin: Top segment (left)
                    traces.push({{
                        x: [-pinW/2 + offset_left, -pinW/2 + offset_left, pinW/2 + offset_left, pinW/2 + offset_left, -pinW/2 + offset_left],
                        y: [1.3, 2.1, 2.1, 1.3, 1.3],
                        mode: 'lines',
                        fill: 'toself',
                        fillcolor: 'rgba(239, 68, 68, 0.15)',
                        line: {{color: '#ef4444', width: 2.5}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                    // Broken Pin: Middle segment (right)
                    traces.push({{
                        x: [-pinW/2 + offset_right, -pinW/2 + offset_right, pinW/2 + offset_right, pinW/2 + offset_right, -pinW/2 + offset_right],
                        y: [0.7, 1.3, 1.3, 0.7, 0.7],
                        mode: 'lines',
                        fill: 'toself',
                        fillcolor: 'rgba(239, 68, 68, 0.15)',
                        line: {{color: '#ef4444', width: 2.5}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                    // Broken Pin: Bottom segment (left)
                    traces.push({{
                        x: [-pinW/2 + offset_left, -pinW/2 + offset_left, pinW/2 + offset_left, pinW/2 + offset_left, -pinW/2 + offset_left],
                        y: [-0.1, 0.7, 0.7, -0.1, -0.1],
                        mode: 'lines',
                        fill: 'toself',
                        fillcolor: 'rgba(239, 68, 68, 0.15)',
                        line: {{color: '#ef4444', width: 2.5}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                }}

                // Force arrows
                // Pulling Left on outer plates (split force: P/2 on top, P/2 on bottom)
                annotations.push({{
                    ax: -2.0 + offset_left, ay: 1.6,
                    x: -2.7 + offset_left, y: 1.6,
                    showarrow: true,
                    arrowhead: 2,
                    arrowcolor: '#1e293b',
                    arrowwidth: 2.5,
                    text: ''
                }});
                annotations.push({{
                    x: -2.7 + offset_left, y: 1.6,
                    showarrow: false,
                    text: `P/2 = ${(P/2).toFixed(0)} kN`,
                    font: {{family: 'Outfit', size: 9, color: '#1e293b'}},
                    xshift: -15
                }});

                annotations.push({{
                    ax: -2.0 + offset_left, ay: 0.4,
                    x: -2.7 + offset_left, y: 0.4,
                    showarrow: true,
                    arrowhead: 2,
                    arrowcolor: '#1e293b',
                    arrowwidth: 2.5,
                    text: ''
                }});
                annotations.push({{
                    x: -2.7 + offset_left, y: 0.4,
                    showarrow: false,
                    text: `P/2 = ${(P/2).toFixed(0)} kN`,
                    font: {{family: 'Outfit', size: 9, color: '#1e293b'}},
                    xshift: -15
                }});

                // Pulling Right on center plate (full force P)
                annotations.push({{
                    ax: 2.0 + offset_right, ay: 1.0,
                    x: 2.7 + offset_right, y: 1.0,
                    showarrow: true,
                    arrowhead: 2,
                    arrowcolor: '#1e293b',
                    arrowwidth: 3.5,
                    text: ''
                }});
                annotations.push({{
                    x: 2.7 + offset_right, y: 1.0,
                    showarrow: false,
                    text: `P = ${P} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold'}},
                    xshift: 15
                }});

                // Mark two shear planes
                if (!isFailed) {{
                    annotations.push({{
                        x: pinW/2 + 0.4, y: 1.3,
                        text: 'Plane 1',
                        font: {{family: 'Outfit', size: 8, color: '#ef4444'}},
                        showarrow: true,
                        arrowhead: 1,
                        arrowsize: 0.5,
                        ax: 25, ay: 0
                    }});
                    annotations.push({{
                        x: pinW/2 + 0.4, y: 0.7,
                        text: 'Plane 2',
                        font: {{family: 'Outfit', size: 8, color: '#ef4444'}},
                        showarrow: true,
                        arrowhead: 1,
                        arrowsize: 0.5,
                        ax: 25, ay: 0
                    }});
                }}
            }

            // Print stress value on plot
            annotations.push({{
                x: 0, y: type === 'single' ? 2.0 : 2.4,
                text: `τ = ${stress.toFixed(1)} MPa`,
                font: {{family: 'Outfit', size: 13, color: isFailed ? '#ef4444' : '#f97316', weight: 'bold'}},
                showarrow: false
            }});

            const layout = {{
                xaxis: {{
                    range: [-3.3, 3.3],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis: {{
                    range: [-0.4, 2.7],
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

            // Print mathematical formulas
            equationDisplay.innerHTML = `
                <b>Shear Stress Calculation (τ):</b><br>
                • Pin Dia, d = ${d} mm<br>
                • Pin Area, A = π · d² / 4 = π · (${d})² / 4 = <b>${A_pin.toFixed(1)} mm²</b><br>
                • Shear Planes, n = ${n_planes} (${type === 'single' ? 'Single Shear' : 'Double Shear'})<br>
                • Total Shear Area, A_v = n · A = ${n_planes} · ${A_pin.toFixed(1)} mm² = <b>${(n_planes * A_pin).toFixed(1)} mm²</b><br>
                • Shear Stress, <b>τ = P / A_v</b> = ${P * 1000} N / ${(n_planes * A_pin).toFixed(1)} mm² = <b>${stress.toFixed(2)} MPa</b><br>
                • Status: <b>${isFailed ? 'FAILED (τ &gt; τ_y)' : 'SAFE (τ ≤ τ_y)'}</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_shear_stress():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #f97316; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 3 • Lesson 25</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Shear Stress</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit3"]
    topic_name = "Lesson 25: Shear Stress"
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
    if "vshear_phase" not in st.session_state:
        st.session_state.vshear_phase = "instructions"
    if "vshear_sliders_locked" not in st.session_state:
        st.session_state.vshear_sliders_locked = False
    if "vshear_reset_counter" not in st.session_state:
        st.session_state.vshear_reset_counter = 0
    if "vshear_answers" not in st.session_state:
        st.session_state.vshear_answers = {}

    def reset_simulator():
        st.session_state.vshear_phase = "instructions"
        st.session_state.vshear_answers = {}
        st.session_state.vshear_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vshear_phase == "poe_predict":
        st.session_state.vshear_sliders_locked = True
    else:
        st.session_state.vshear_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Pinned Connection Simulator")
        locked_js = "true" if st.session_state.vshear_sliders_locked else "false"
        reset_counter = st.session_state.vshear_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#f97316; font-weight:700;">{phase_titles[st.session_state.vshear_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vshear_phase == "instructions":
            st.markdown(r"""
            **Shear Stress (τ)** represents force intensities acting parallel/tangent to a plane:
            $$\tau = \frac{P}{A_v}$$
            
            **Single vs. Double Shear:**
            * **Single Shear:** Force is transmitted across a single cut plane of the pin. ($A_v = A_{\text{pin}}$)
            * **Double Shear:** Force is split across two cut planes of the pin. ($A_v = 2 A_{\text{pin}}$)
            
            Toggle between Single and Double Shear joints using the buttons at the top of the simulator.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vshear_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vshear_phase == "guided_question":
            st.markdown("""
            **Guided Practice:**
            1. Toggle to **Single Shear Joint**.
            2. Set **Tension Load (P)** to `80 kN`.
            3. Set **Pin Dia. (d)** to `20 mm`.
            4. Set **Shear Strength (τ_y)** to `120 MPa`.
            
            Look at the simulator visualization and equations.
            
            **Question:**
            What is the shear stress, and does the pin fail?
            """)
            
            ans = st.radio(
                "Select the correct results:",
                options=[
                    "τ = 254.6 MPa (FAILED)",
                    "τ = 127.3 MPa (FAILED)",
                    "τ = 254.6 MPa (SAFE)",
                    "τ = 63.7 MPa (SAFE)"
                ],
                key="vshear_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "254.6 MPa (FAILED)" in ans:
                    st.success(r"Correct! Area $A = \pi (20)^2 / 4 \approx 314.16\text{ mm}^2$. Stress $\tau = 80,000 / 314.16 = 254.65\text{ MPa}$, which is > 120 MPa, causing the pin to shear in half!")
                else:
                    st.error(r"Incorrect. Let's recalculate: Area $A = \pi \cdot 20^2 / 4 \approx 314.2\text{ mm}^2$. Since it's single shear, $\tau = P/A = 80,000 / 314.2 \approx 254.6\text{ MPa}$. Since $254.6\text{ MPa} > 120\text{ MPa}$ strength, the pin fails.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vshear_phase = "poe_predict"
                st.session_state.vshear_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vshear_phase == "poe_predict":
            st.markdown("""
            **Predict Phase (Specimen Controls Locked!):**
            
            **Scenario:**
            * **Tension Load (P)**: `100 kN`
            * **Pin Dia. (d)**: `25 mm`
            * **Shear Strength (τ_y)**: `60 MPa`
            
            **Question:**
            If the connection is placed in **Double Shear**, what is the resulting shear stress in the pin, and does it fail?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "τ = 101.9 MPa (FAILED)",
                    "τ = 50.9 MPa (SAFE)",
                    "τ = 203.7 MPa (FAILED)",
                    "τ = 101.9 MPa (SAFE)"
                ],
                key="vshear_poe_p_radio"
            )
            st.session_state.vshear_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vshear_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vshear_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Toggle to **Double Shear Joint**.
            2. Set **Tension Load P** to `100 kN`, **Pin Dia. d** to `25 mm`, and **Shear Strength** to `60 MPa`.
            3. Observe the calculated shear stress and whether the pin snaps.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vshear_answers.get("poe", "τ = 101.9 MPa (FAILED)")
            options_list = [
                "I predict: τ = 101.9 MPa (FAILED)",
                "τ = 101.9 MPa (FAILED)",
                "τ = 50.9 MPa (SAFE)",
                "τ = 203.7 MPa (FAILED)",
                "τ = 101.9 MPa (SAFE)"
            ]
            # normalize since some might lack the prefix
            norm_opts = ["τ = 101.9 MPa (FAILED)", "τ = 50.9 MPa (SAFE)", "τ = 203.7 MPa (FAILED)", "τ = 101.9 MPa (SAFE)"]
            default_idx = norm_opts.indexOf(val_init) if val_init in norm_opts else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=norm_opts,
                index=default_idx,
                key="vshear_poe_o_radio"
            )
            st.session_state.vshear_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vshear_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vshear_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vshear_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vshear_answers.get("poe") == "τ = 101.9 MPa (FAILED)":
                st.success("🎉 **Correct!** Great mechanical logic.")
            else:
                st.warning("⚠️ **Incorrect.** Review the math below.")

            st.markdown(r"""
            ### Explanation:
            1. **Pin Cross-sectional Area**:
               $$A_{\text{pin}} = \frac{\pi d^2}{4} = \frac{\pi (25)^2}{4} \approx 490.87\text{ mm}^2$$
               
            2. **Double Shear Area**:
               Since it is a double shear connection, there are $n = 2$ shear planes. The load is divided between them:
               $$A_v = 2 A_{\text{pin}} = 2 \cdot 490.87 = 981.75\text{ mm}^2$$
               
            3. **Shear Stress**:
               $$\tau = \frac{P}{A_v} = \frac{100,000\text{ N}}{981.75\text{ mm}^2} \approx 101.86\text{ MPa}$$
               
            4. **Failure Check**:
               Comparing stress to shear strength:
               $$\tau = 101.86\text{ MPa} > \tau_y = 60.0\text{ MPa}$$
               
            Since the shear stress exceeds the pin's material strength, the pin **fails** and shears at both interfaces, even though double shear reduced the stress by 50% compared to single shear (which would be $203.7\text{ MPa}$).
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

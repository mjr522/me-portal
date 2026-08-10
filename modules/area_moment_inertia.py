import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Area Moment of Inertia Sandbox
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
        .btn-group {{
            display: flex;
            gap: 6px;
            margin-bottom: 8px;
        }}
        .btn-choice {{
            flex: 1;
            padding: 6px 8px;
            border: 1.5px solid #cbd5e1;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Outfit', sans-serif;
            font-weight: 500;
            font-size: 0.8rem;
            color: #475569;
            transition: all 0.2s;
            text-align: center;
        }}
        .btn-choice.active {{
            border-color: #8b5cf6;
            background-color: #8b5cf6;
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

    <!-- Shape Selector -->
    <div class="btn-group">
        <button id="btn-rect" class="btn-choice active">Rectangle</button>
        <button id="btn-circ" class="btn-choice">Circle</button>
        <button id="btn-box" class="btn-choice">Hollow Box</button>
        <button id="btn-ibeam" class="btn-choice">I-Beam</button>
    </div>

    <!-- Plotly Chart -->
    <div id="plotly-chart" style="width: 100%; height: 280px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Width b -->
        <div class="control-box" id="width-box">
            <div class="control-title">1. Width (b)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Base, b</span>
                    <span class="slider-value" id="b-val-display">40 mm</span>
                </div>
                <input type="range" id="b-slider" min="20" max="100" step="5" value="40" class="custom-slider">
            </div>
        </div>

        <!-- Height h -->
        <div class="control-box" id="height-box">
            <div class="control-title">2. Height (h / D)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Height, h</span>
                    <span class="slider-value" id="h-val-display">80 mm</span>
                </div>
                <input type="range" id="h-slider" min="20" max="100" step="5" value="80" class="custom-slider">
            </div>
        </div>

        <!-- Wall Thickness t -->
        <div class="control-box" id="thick-box" style="opacity: 0.5;">
            <div class="control-title">3. Thickness (t)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Wall, t</span>
                    <span class="slider-value" id="t-val-display">5 mm</span>
                </div>
                <input type="range" id="t-slider" min="3" max="12" step="1" value="5" class="custom-slider" disabled>
            </div>
        </div>

        <!-- Bending axis toggle -->
        <div class="control-box">
            <div class="control-title">4. Bending Axis</div>
            <div class="btn-group" style="margin-bottom:0; margin-top:2px;">
                <button id="btn-axis-x" class="btn-choice active" style="padding: 4px 6px; font-size: 0.75rem;">X-Axis (Edge)</button>
                <button id="btn-axis-y" class="btn-choice" style="padding: 4px 6px; font-size: 0.75rem;">Y-Axis (Side)</button>
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
        const btnRect = document.getElementById('btn-rect');
        const btnCirc = document.getElementById('btn-circ');
        const btnBox = document.getElementById('btn-box');
        const btnIbeam = document.getElementById('btn-ibeam');
        const btnAxisX = document.getElementById('btn-axis-x');
        const btnAxisY = document.getElementById('btn-axis-y');

        const bSlider = document.getElementById('b-slider');
        const hSlider = document.getElementById('h-slider');
        const tSlider = document.getElementById('t-slider');

        const widthBox = document.getElementById('width-box');
        const heightBox = document.getElementById('height-box');
        const thickBox = document.getElementById('thick-box');

        const lockBanner = document.getElementById('lock-banner');
        const equationDisplay = document.getElementById('equation-display');

        // State
        let state = {{
            shape: 'rect',
            b: 40,
            h: 80,
            t: 5,
            axis: 'x'
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vmoi_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.shape = sessionStorage.getItem('vmoi_shape') || 'rect';
            state.b = parseFloat(sessionStorage.getItem('vmoi_b') || '40');
            state.h = parseFloat(sessionStorage.getItem('vmoi_h') || '80');
            state.t = parseFloat(sessionStorage.getItem('vmoi_t') || '5');
            state.axis = sessionStorage.getItem('vmoi_axis') || 'x';
        }} else {{
            sessionStorage.setItem('vmoi_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vmoi_shape', state.shape);
            sessionStorage.setItem('vmoi_b', state.b);
            sessionStorage.setItem('vmoi_h', state.h);
            sessionStorage.setItem('vmoi_t', state.t);
            sessionStorage.setItem('vmoi_axis', state.axis);
        }}

        // Handle shape toggle
        function selectShape(sName) {{
            state.shape = sName;
            [btnRect, btnCirc, btnBox, btnIbeam].forEach(b => b.classList.remove('active'));
            if (sName === 'rect') btnRect.classList.add('active');
            if (sName === 'circ') btnCirc.classList.add('active');
            if (sName === 'box') btnBox.classList.add('active');
            if (sName === 'ibeam') btnIbeam.classList.add('active');

            // Manage input enablement
            if (sName === 'circ') {{
                bSlider.disabled = true;
                widthBox.style.opacity = '0.5';
                tSlider.disabled = true;
                thickBox.style.opacity = '0.5';
                hSlider.disabled = false;
                document.getElementById('height-box').getElementsByClassName('slider-title')[0].innerText = 'Diameter, D';
            }} else if (sName === 'rect') {{
                bSlider.disabled = false;
                widthBox.style.opacity = '1.0';
                tSlider.disabled = true;
                thickBox.style.opacity = '0.5';
                hSlider.disabled = false;
                document.getElementById('height-box').getElementsByClassName('slider-title')[0].innerText = 'Height, h';
            }} else {{
                bSlider.disabled = false;
                widthBox.style.opacity = '1.0';
                tSlider.disabled = false;
                thickBox.style.opacity = '1.0';
                hSlider.disabled = false;
                document.getElementById('height-box').getElementsByClassName('slider-title')[0].innerText = 'Height, h';
                // cap wall thickness based on h and b
                tSlider.max = Math.min(Math.floor(state.b / 2) - 2, Math.floor(state.h / 2) - 2);
                if (state.t > tSlider.max) {{
                    state.t = parseInt(tSlider.max);
                }}
            }}
            saveState();
            updatePlot();
        }}

        btnRect.addEventListener('click', () => {{ if (!isLocked) selectShape('rect'); }});
        btnCirc.addEventListener('click', () => {{ if (!isLocked) selectShape('circ'); }});
        btnBox.addEventListener('click', () => {{ if (!isLocked) selectShape('box'); }});
        btnIbeam.addEventListener('click', () => {{ if (!isLocked) selectShape('ibeam'); }});

        // Bending axis
        btnAxisX.addEventListener('click', () => {{
            if (isLocked) return;
            state.axis = 'x';
            btnAxisX.classList.add('active');
            btnAxisY.classList.remove('active');
            saveState();
            updatePlot();
        }});
        btnAxisY.addEventListener('click', () => {{
            if (isLocked) return;
            state.axis = 'y';
            btnAxisY.classList.add('active');
            btnAxisX.classList.remove('active');
            saveState();
            updatePlot();
        }});

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            bSlider.disabled = true;
            hSlider.disabled = true;
            tSlider.disabled = true;
            btnRect.disabled = true;
            btnCirc.disabled = true;
            btnBox.disabled = true;
            btnIbeam.disabled = true;
            btnAxisX.disabled = true;
            btnAxisY.disabled = true;
        }}

        // Listeners
        bSlider.addEventListener('input', (e) => {{
            state.b = parseFloat(e.target.value);
            document.getElementById('b-val-display').innerText = state.b.toFixed(0) + ' mm';
            if (state.shape === 'box' || state.shape === 'ibeam') {{
                tSlider.max = Math.min(Math.floor(state.b / 2) - 2, Math.floor(state.h / 2) - 2);
                if (state.t > tSlider.max) state.t = parseInt(tSlider.max);
            }}
            saveState();
            updatePlot();
        }});
        hSlider.addEventListener('input', (e) => {{
            state.h = parseFloat(e.target.value);
            let displayVal = state.shape === 'circ' ? ' D' : ' h';
            document.getElementById('h-val-display').innerText = state.h.toFixed(0) + ' mm';
            if (state.shape === 'box' || state.shape === 'ibeam') {{
                tSlider.max = Math.min(Math.floor(state.b / 2) - 2, Math.floor(state.h / 2) - 2);
                if (state.t > tSlider.max) state.t = parseInt(tSlider.max);
            }}
            saveState();
            updatePlot();
        }});
        tSlider.addEventListener('input', (e) => {{
            state.t = parseFloat(e.target.value);
            document.getElementById('t-val-display').innerText = state.t.toFixed(0) + ' mm';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            bSlider.value = state.b;
            document.getElementById('b-val-display').innerText = state.b.toFixed(0) + ' mm';
            hSlider.value = state.h;
            document.getElementById('h-val-display').innerText = state.h.toFixed(0) + ' mm';
            tSlider.value = state.t;
            document.getElementById('t-val-display').innerText = state.t.toFixed(0) + ' mm';

            if (state.axis === 'x') {{
                btnAxisX.classList.add('active');
                btnAxisY.classList.remove('active');
            }} else {{
                btnAxisY.classList.add('active');
                btnAxisX.classList.remove('active');
            }}

            selectShape(state.shape);
        }}

        function updatePlot() {{
            let shape = state.shape;
            let b = state.b;
            let h = state.h;
            let t = state.t;
            let axis = state.axis;

            // Mathematical calculation of I and Area
            let Ix = 0, Iy = 0, A = 0;

            if (shape === 'rect') {{
                Ix = (b * Math.pow(h, 3)) / 12;
                Iy = (h * Math.pow(b, 3)) / 12;
                A = b * h;
            }} else if (shape === 'circ') {{
                let D = h;
                Ix = (Math.PI * Math.pow(D, 4)) / 64;
                Iy = Ix;
                A = (Math.PI * D * D) / 4;
            }} else if (shape === 'box') {{
                let bi = b - 2*t;
                let hi = h - 2*t;
                Ix = ((b * Math.pow(h, 3)) - (bi * Math.pow(hi, 3))) / 12;
                Iy = ((h * Math.pow(b, 3)) - (hi * Math.pow(bi, 3))) / 12;
                A = (b * h) - (bi * hi);
            }} else if (shape === 'ibeam') {{
                let bi = b - t; // web gap
                let hi = h - 2*t; // inner height between flanges
                Ix = ((b * Math.pow(h, 3)) - (bi * Math.pow(hi, 3))) / 12;
                // Flanges are b x t, web is t x (h - 2t)
                Iy = (2 * t * Math.pow(b, 3) + (h - 2*t) * Math.pow(t, 3)) / 12;
                A = (2 * b * t) + (h - 2*t) * t;
            }}

            let I_active = axis === 'x' ? Ix : Iy;

            // Visual deflection scale: sag is inversely proportional to I_active
            // Let's set a normalized deflection scaling
            // Solid reference Ix for 40x80 rect is 1.7e6. Let's make deflection scale:
            let refI = 1.0e6;
            let sag = 0.5 * (refI / I_active);
            if (sag > 1.2) sag = 1.2; // cap visual sag so it doesn't break plot bounds
            if (sag < 0.05) sag = 0.05;

            let traces = [];
            let annotations = [];

            // ------------------ SUBPLOT 1: CROSS SECTION (Left, x: [-60, 60] mm, y: [-60, 60] mm) ------------------
            let boundaryX = [], boundaryY = [];
            
            if (shape === 'rect') {{
                traces.push({{
                    x: [-b/2, -b/2, b/2, b/2, -b/2],
                    y: [-h/2, h/2, h/2, -h/2, -h/2],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(139, 92, 246, 0.08)',
                    line: {{color: '#8b5cf6', width: 2.5}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }} else if (shape === 'circ') {{
                let cx = [], cy = [];
                let radOuter = h/2;
                for (let th = 0; th <= 365; th += 5) {{
                    let rad = th * Math.PI / 180;
                    cx.push(radOuter * Math.cos(rad));
                    cy.push(radOuter * Math.sin(rad));
                }}
                traces.push({{
                    x: cx, y: cy,
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(139, 92, 246, 0.08)',
                    line: {{color: '#8b5cf6', width: 2.5}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }} else if (shape === 'box') {{
                // Outer box
                traces.push({{
                    x: [-b/2, -b/2, b/2, b/2, -b/2],
                    y: [-h/2, h/2, h/2, -h/2, -h/2],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(139, 92, 246, 0.08)',
                    line: {{color: '#8b5cf6', width: 2.5}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                // Inner hollow box (white fill to mask)
                let bi = b - 2*t;
                let hi = h - 2*t;
                traces.push({{
                    x: [-bi/2, -bi/2, bi/2, bi/2, -bi/2],
                    y: [-hi/2, hi/2, hi/2, -hi/2, -hi/2],
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: '#ffffff',
                    line: {{color: '#8b5cf6', width: 1.5}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }} else if (shape === 'ibeam') {{
                // Draw I-beam outer profile directly as a single polygon path
                let bi = b - t; // web gap width
                let hi = h - 2*t; // web height
                
                let idx = [-b/2, -b/2, -t/2, -t/2, -b/2, -b/2, b/2, b/2, t/2, t/2, b/2, b/2, -b/2];
                let idy = [hi/2, h/2, h/2, -h/2, -h/2, -hi/2, -hi/2, -h/2, -h/2, h/2, h/2, hi/2, hi/2];
                // wait, let's trace:
                // Start top-left flange: (-b/2, hi/2) -> (-b/2, h/2) -> (b/2, h/2) -> (b/2, hi/2)
                // -> (t/2, hi/2) -> (t/2, -hi/2) -> (b/2, -hi/2) -> (b/2, -h/2) -> (-b/2, -h/2)
                // -> (-b/2, -hi/2) -> (-t/2, -hi/2) -> (-t/2, hi/2) -> (-b/2, hi/2)
                let ix = [-b/2, -b/2, b/2, b/2, t/2, t/2, b/2, b/2, -b/2, -b/2, -t/2, -t/2, -b/2];
                let iy = [hi/2, h/2, h/2, hi/2, hi/2, -hi/2, -hi/2, -h/2, -h/2, -hi/2, -hi/2, hi/2, hi/2];

                traces.push({{
                    x: ix, y: iy,
                    mode: 'lines',
                    fill: 'toself',
                    fillcolor: 'rgba(139, 92, 246, 0.08)',
                    line: {{color: '#8b5cf6', width: 2.5}},
                    xaxis: 'x1', yaxis: 'y1',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }}

            // Draw Neutral Axes
            // X-axis (horizontal, blue/purple)
            traces.push({{
                x: [-60, 60],
                y: [0, 0],
                mode: 'lines',
                line: {{color: axis === 'x' ? '#3b82f6' : '#cbd5e1', width: axis === 'x' ? 3.0 : 1.5, dash: axis === 'x' ? 'solid' : 'dash'}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});
            // Y-axis (vertical, red)
            traces.push({{
                x: [0, 0],
                y: [-60, 60],
                mode: 'lines',
                line: {{color: axis === 'y' ? '#ef4444' : '#cbd5e1', width: axis === 'y' ? 3.0 : 1.5, dash: axis === 'y' ? 'solid' : 'dash'}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            annotations.push({{
                x: 50, y: 8,
                xref: 'x1', yref: 'y1',
                text: 'X-Axis',
                font: {{family: 'Outfit', size: 9, color: axis === 'x' ? '#3b82f6' : '#94a3b8', weight: 'bold'}},
                showarrow: false
            }});
            annotations.push({{
                x: 8, y: 50,
                xref: 'x1', yref: 'y1',
                text: 'Y-Axis',
                font: {{family: 'Outfit', size: 9, color: axis === 'y' ? '#ef4444' : '#94a3b8', weight: 'bold'}},
                showarrow: false
            }});

            // ------------------ SUBPLOT 2: BEAM DEFLECTION (Right, x: [0, 2], y: [-2, 2]) ------------------
            // Draw supports at x = 0.2 and x = 1.8
            traces.push({{
                x: [0.1, 0.2, 0.3, 0.1],
                y: [-1.2, -1.0, -1.2, -1.2],
                mode: 'lines',
                line: {{color: '#475569', width: 2}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});
            traces.push({{
                x: [1.7, 1.8, 1.9, 1.7],
                y: [-1.2, -1.0, -1.2, -1.2],
                mode: 'lines',
                line: {{color: '#475569', width: 2}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw elastic curve of beam (simply supported with center load)
            // Equation: y = -sag * (3 * L * x^2 - 4 * x^3) / L^3 for x <= L/2 (and symmetric for RHS)
            let beamX = [];
            let beamY = [];
            let beamL = 1.6;
            let steps = 40;
            for (let i = 0; i <= steps; i++) {{
                let x_local = (i / steps) * beamL; // 0 to 1.6
                let val_y = 0;
                let mid = beamL / 2;
                if (x_local <= mid) {{
                    val_y = -sag * (3 * mid * x_local*x_local - Math.pow(x_local, 3)) / (mid * mid * mid);
                }} else {{
                    let x_sym = beamL - x_local;
                    val_y = -sag * (3 * mid * x_sym*x_sym - Math.pow(x_sym, 3)) / (mid * mid * mid);
                }}
                beamX.push(0.2 + x_local);
                beamY.push(val_y);
            }}

            // Draw beam centerline
            traces.push({{
                x: beamX,
                y: beamY,
                mode: 'lines',
                line: {{color: '#8b5cf6', width: 5.5}},
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Load arrow in center pointing down at y = sag_mid
            let arrowTipY = -sag;
            annotations.push({{
                ax: 1.0, ay: 0.8,
                x: 1.0, y: arrowTipY - 0.05,
                xref: 'x2', yref: 'y2',
                axref: 'x2', ayref: 'y2',
                showarrow: true,
                arrowhead: 2,
                arrowsize: 0.8,
                arrowwidth: 3.5,
                arrowcolor: '#ef4444',
                text: ''
            }});
            annotations.push({{
                x: 1.0, y: 0.8,
                xref: 'x2', yref: 'y2',
                showarrow: false,
                text: 'Load, P',
                font: {{family: 'Outfit', size: 9, color: '#ef4444', weight: 'bold'}},
                yshift: 10
            }});

            // Label deflection
            annotations.push({{
                x: 1.0, y: arrowTipY - 0.45,
                xref: 'x2', yref: 'y2',
                text: `Deflection ∝ 1/I<br>(${I_active > 3e5 ? 'Stiff Beam' : 'Flexible Beam'})`,
                font: {{family: 'Outfit', size: 9, color: '#475569', weight: 'bold'}},
                showarrow: false
            }});

            const layout = {{
                grid: {{rows: 1, columns: 2, pattern: 'independent'}},
                xaxis: {{
                    domain: [0, 0.48],
                    range: [-60, 60],
                    showgrid: true,
                    gridcolor: 'rgba(128, 128, 128, 0.05)',
                    zeroline: false,
                    tickfont: {{family: 'Outfit', size: 8, color: '#64748b'}},
                    fixedrange: true
                }},
                yaxis: {{
                    domain: [0, 1],
                    range: [-60, 60],
                    showgrid: true,
                    gridcolor: 'rgba(128, 128, 128, 0.05)',
                    zeroline: false,
                    scaleanchor: 'x1',
                    scaleratio: 1,
                    tickfont: {{family: 'Outfit', size: 8, color: '#64748b'}},
                    fixedrange: true
                }},
                xaxis2: {{
                    domain: [0.52, 1.0],
                    range: [-0.1, 2.1],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                yaxis2: {{
                    domain: [0, 1],
                    range: [-2.0, 1.2],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    fixedrange: true
                }},
                margin: {{l: 15, r: 15, t: 15, b: 15}},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                annotations: annotations
            }};

            Plotly.react('plotly-chart', traces, layout);

            // Update mathematical equations box
            equationDisplay.innerHTML = `
                <b>Section Properties & Bending Resistance:</b><br>
                • Cross-Sectional Area, <b>A</b> = <b>${A.toFixed(0)} mm²</b><br>
                • Inertia about X (Edge): <b>I_x</b> = <b>${(Ix/1e4).toFixed(2)} x 10⁴ mm⁴</b><br>
                • Inertia about Y (Side): <b>I_y</b> = <b>${(Iy/1e4).toFixed(2)} x 10⁴ mm⁴</b><br>
                • Active Bending Inertia: <b>I = ${axis === 'x' ? 'I_x' : 'I_y'}</b> = <b>${(I_active/1e4).toFixed(2)} x 10⁴ mm⁴</b>
            `;
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_area_moment_inertia():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #8b5cf6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 4 • Lesson 30</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Area Moment of Inertia</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit4"]
    topic_name = "Lesson 30: Area Moment of Inertia"
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
    if "vmoi_phase" not in st.session_state:
        st.session_state.vmoi_phase = "instructions"
    if "vmoi_sliders_locked" not in st.session_state:
        st.session_state.vmoi_sliders_locked = False
    if "vmoi_reset_counter" not in st.session_state:
        st.session_state.vmoi_reset_counter = 0
    if "vmoi_answers" not in st.session_state:
        st.session_state.vmoi_answers = {}

    def reset_simulator():
        st.session_state.vmoi_phase = "instructions"
        st.session_state.vmoi_answers = {}
        st.session_state.vmoi_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vmoi_phase == "poe_predict":
        st.session_state.vmoi_sliders_locked = True
    else:
        st.session_state.vmoi_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Area Moment of Inertia Sandbox")
        locked_js = "true" if st.session_state.vmoi_sliders_locked else "false"
        reset_counter = st.session_state.vmoi_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#8b5cf6; font-weight:700;">{phase_titles[st.session_state.vmoi_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vmoi_phase == "instructions":
            st.markdown("""
            **Area Moment of Inertia (I)** quantifies a cross-section's resistance to bending. It is purely a geometric property based on how the area is distributed relative to the neutral bending axis:
            * **X-Axis Bending (Edge):** $I_x = \int y^2 dA$
            * **Y-Axis Bending (Side):** $I_y = \int x^2 dA$
            
            Toggle between Rectangle, Circle, Hollow Box, and I-Beam profiles to observe their bending stiffness and corresponding physical beam deflections.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vmoi_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vmoi_phase == "guided_question":
            st.markdown(r"""
            **Guided Practice:**
            1. Select **Rectangle** shape.
            2. Set **Base, b** to `20 mm` and **Height, h** to `60 mm` (board on edge).
            3. Note the value of $I_x$.
            4. Toggle the bending axis to **Y-Axis** (board on side).
            5. Note the value of $I_y$.
            
            **Question:**
            What are the values of $I_x$ and $I_y$ (rounded to $10^4\text{ mm}^4$), and how many times stiffer is the board on its edge than on its side?
            """)
            
            ans = st.radio(
                "Select the correct results:",
                options=[
                    "Ix = 36e4 mm⁴, Iy = 4e4 mm⁴; 9 times stiffer on edge",
                    "Ix = 36e4 mm⁴, Iy = 12e4 mm⁴; 3 times stiffer on edge",
                    "Ix = 18e4 mm⁴, Iy = 2e4 mm⁴; 9 times stiffer on edge",
                    "Ix = 72e4 mm⁴, Iy = 8e4 mm⁴; 9 times stiffer on edge"
                ],
                key="vmoi_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "36e4" in ans and "9 times" in ans:
                    st.success(r"Correct! $I_x = \frac{20 \cdot 60^3}{12} = 360,000\text{ mm}^4 = 36 \times 10^4\text{ mm}^4$. $I_y = \frac{60 \cdot 20^3}{12} = 40,000\text{ mm}^4 = 4 \times 10^4\text{ mm}^4$. Bending about the X-axis is $36 / 4 = 9$ times stiffer, which matches $(h/b)^2 = (60/20)^2 = 9$!")
                else:
                    st.error(r"Incorrect. Let's compute: $I_x = b h^3 / 12 = 20 \cdot 60^3 / 12 = 36 \times 10^4\text{ mm}^4$. $I_y = h b^3 / 12 = 60 \cdot 20^3 / 12 = 4 \times 10^4\text{ mm}^4$. The stiffness ratio is $36 / 4 = 9$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vmoi_phase = "poe_predict"
                st.session_state.vmoi_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vmoi_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Cross-Section Controls Locked!):**
            
            **Scenario:**
            We compare two beam cross-sections of the same overall dimensions:
            * **Beam 1:** Solid square of size $60\text{ mm} \times 60\text{ mm}$.
            * **Beam 2:** Hollow square box of outer size $60\text{ mm} \times 60\text{ mm}$ with wall thickness $t = 10\text{ mm}$.
            
            **Question:**
            Which beam has the higher moment of inertia $I_x$, and which design is more material-efficient (strength-to-weight ratio)?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Solid has higher Ix; Hollow is more mass-efficient",
                    "Hollow has higher Ix; Solid is more mass-efficient",
                    "Both have equal Ix; Hollow is more mass-efficient",
                    "Solid has higher Ix; Solid is more mass-efficient"
                ],
                key="vmoi_poe_p_radio"
            )
            st.session_state.vmoi_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vmoi_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vmoi_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Select **Rectangle** shape and set **b** to `60 mm` and **h** to `60 mm`. Write down $I_x$ and Area $A$ (represents mass).
            2. Toggle to **Hollow Box** shape, set **b** to `60 mm`, **h** to `60 mm`, and **Wall t** to `10 mm`. Write down $I_x$ and Area $A$.
            3. Compare the bending resistance ($I_x$) and mass ($Area$) to check material efficiency.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vmoi_answers.get("poe", "Solid has higher Ix; Hollow is more mass-efficient")
            options_list = [
                "Solid has higher Ix; Hollow is more mass-efficient",
                "Hollow has higher Ix; Solid is more mass-efficient",
                "Both have equal Ix; Hollow is more mass-efficient",
                "Solid has higher Ix; Solid is more mass-efficient"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vmoi_poe_o_radio"
            )
            st.session_state.vmoi_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vmoi_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vmoi_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vmoi_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vmoi_answers.get("poe") == "Solid has higher Ix; Hollow is more mass-efficient":
                st.success("🎉 **Correct!** Excellent engineering judgement.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the calculations and geometry below.")

            st.markdown(r"""
            ### Explanation:
            1. **Solid Beam Properties**:
               * Area (Mass): $A = 60 \cdot 60 = 3600\text{ mm}^2$
               * Inertia: $I_x = \frac{60^4}{12} = 108 \times 10^4\text{ mm}^4$
               
            2. **Hollow Box Beam Properties** ($b_i = 60-20 = 40$, $h_i = 40$):
               * Area (Mass): $A = 60^2 - 40^2 = 2000\text{ mm}^2$ (uses **44.4% less material**!)
               * Inertia: $I_x = \frac{60^4 - 40^4}{12} = 86.67 \times 10^4\text{ mm}^4$ (only **19.8% less inertia**!)
               
            *Conclusion:* Slicing out the solid core of the beam removes material close to the neutral axis, which carries very little bending load. The hollow box retains most of its bending resistance ($I_x$) while shedding almost half its weight, making it significantly more material-efficient.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

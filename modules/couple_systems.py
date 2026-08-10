import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Couple Systems Sandbox
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
            transition: all 0.3s ease;
        }}
        .control-box.muted {{
            opacity: 0.55;
        }}
        .control-title {{
            font-size: 0.82rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 8px;
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
        
        #f1-slider::-webkit-slider-thumb {{ background: #3b82f6; }}
        #theta1-slider::-webkit-slider-thumb {{ background: #3b82f6; }}
        #f2-slider::-webkit-slider-thumb {{ background: #10b981; }}
        #theta2-slider::-webkit-slider-thumb {{ background: #10b981; }}
        #mc-slider::-webkit-slider-thumb {{ background: #f59e0b; }}
        #xa-slider::-webkit-slider-thumb {{ background: #8b5cf6; }}
        #ya-slider::-webkit-slider-thumb {{ background: #8b5cf6; }}
        
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
        .toggle-group {{
            display: flex;
            gap: 12px;
            margin-top: 6px;
        }}
        .toggle-btn {{
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
        .toggle-btn.active {{
            border-color: #8b5cf6;
            background-color: rgba(139, 92, 246, 0.05);
            color: #8b5cf6;
            font-weight: 600;
        }}
        .toggle-btn:disabled {{
            background: #f1f5f9;
            color: #94a3b8;
            border-color: #e2e8f0;
            cursor: not-allowed;
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 320px;"></div>

    <!-- Toggle Selector for Force Configuration -->
    <div style="margin-top: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.15);">
        <span style="font-size:0.85rem; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Force Configuration:</span>
        <div class="toggle-group" style="margin-top:0; gap:8px;">
            <button class="toggle-btn active" id="btn-config-independent">Independent</button>
            <button class="toggle-btn" id="btn-config-couple">Pure Couple Lock</button>
        </div>
    </div>

    <!-- Metrics showing Equivalent System at A -->
    <div class="metric-row">
        <div class="metric-item" style="border-bottom: 3.5px solid #8b5cf6;">
            <div class="metric-label">Equivalent Resultant Force (R)</div>
            <div class="metric-val" id="r-display" style="color: #8b5cf6;">0.0 N</div>
        </div>
        <div class="metric-item" style="border-bottom: 3.5px solid #a855f7;">
            <div class="metric-label">Equivalent Moment at A (Mr_A)</div>
            <div class="metric-val" id="mra-display" style="color: #a855f7;">0.0 N-m</div>
        </div>
    </div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Force 1 (Blue) -->
        <div class="control-box" style="border-left: 4px solid #3b82f6;">
            <div class="control-title" style="color: #3b82f6;">Force F1 (at x = -20 m)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Magnitude, F1</span>
                    <span class="slider-value" id="f1-val-display" style="color:#3b82f6;">80 N</span>
                </div>
                <input type="range" id="f1-slider" min="0" max="100" step="10" value="80" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ1</span>
                    <span class="slider-value" id="theta1-val-display" style="color:#3b82f6;">90°</span>
                </div>
                <input type="range" id="theta1-slider" min="0" max="360" step="15" value="90" class="custom-slider">
            </div>
        </div>

        <!-- Force 2 (Green) -->
        <div class="control-box" id="box-f2" style="border-left: 4px solid #10b981;">
            <div class="control-title" style="color: #10b981;">Force F2 (at x = +20 m)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Magnitude, F2</span>
                    <span class="slider-value" id="f2-val-display" style="color:#10b981;">0 N</span>
                </div>
                <input type="range" id="f2-slider" min="0" max="100" step="10" value="0" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ2</span>
                    <span class="slider-value" id="theta2-val-display" style="color:#10b981;">270°</span>
                </div>
                <input type="range" id="theta2-slider" min="0" max="360" step="15" value="270" class="custom-slider">
            </div>
        </div>

        <!-- External Couple Moment Mc (Orange) -->
        <div class="control-box" style="border-left: 4px solid #f59e0b;">
            <div class="control-title" style="color: #f59e0b;">Independent Couple Moment</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Moment, Mc</span>
                    <span class="slider-value" id="mc-val-display" style="color:#f59e0b;">0 N-m</span>
                </div>
                <input type="range" id="mc-slider" min="-300" max="300" step="50" value="0" class="custom-slider">
            </div>
        </div>

        <!-- Reference Point A position (Purple) -->
        <div class="control-box" style="border-left: 4px solid #8b5cf6;">
            <div class="control-title" style="color: #8b5cf6;">Reference Point A</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Position X_a</span>
                    <span class="slider-value" id="xa-val-display" style="color:#8b5cf6;">0.0 m</span>
                </div>
                <input type="range" id="xa-slider" min="-40" max="40" step="5" value="0" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Position Y_a</span>
                    <span class="slider-value" id="ya-val-display" style="color:#8b5cf6;">0.0 m</span>
                </div>
                <input type="range" id="ya-slider" min="-12" max="12" step="2" value="0" class="custom-slider">
            </div>
        </div>
    </div>

    <!-- Live Equation Output -->
    <div class="equation-box" id="equation-display">
        <b>Equivalent System Reduction:</b><br>
        Resultant Force: R = F1 + F2 = (0.00i + 0.00j) N<br>
        Resultant Moment at A: Mr_A = M1_A + M2_A + Mc = 0.0 N-m
    </div>

    <script>
        // Setup variables
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // Cache DOM elements
        const f1Slider = document.getElementById('f1-slider');
        const theta1Slider = document.getElementById('theta1-slider');
        const f2Slider = document.getElementById('f2-slider');
        const theta2Slider = document.getElementById('theta2-slider');
        const mcSlider = document.getElementById('mc-slider');
        const xaSlider = document.getElementById('xa-slider');
        const yaSlider = document.getElementById('ya-slider');
        const lockBanner = document.getElementById('lock-banner');

        const btnIndependent = document.getElementById('btn-config-independent');
        const btnCouple = document.getElementById('btn-config-couple');

        const rDisplay = document.getElementById('r-display');
        const mraDisplay = document.getElementById('mra-display');
        const equationDisplay = document.getElementById('equation-display');

        // State variables
        let state = {{
            f1: 80,
            theta1: 90,
            f2: 0,
            theta2: 270,
            Mc: 0,
            xa: 0,
            ya: 0,
            configMode: 'independent'
        }};

        // Read sessionStorage if exists (and not reset)
        const lastReset = parseInt(sessionStorage.getItem('vcoup_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.f1 = parseFloat(sessionStorage.getItem('vcoup_f1') || '80');
            state.theta1 = parseFloat(sessionStorage.getItem('vcoup_theta1') || '90');
            state.f2 = parseFloat(sessionStorage.getItem('vcoup_f2') || '0');
            state.theta2 = parseFloat(sessionStorage.getItem('vcoup_theta2') || '270');
            state.Mc = parseFloat(sessionStorage.getItem('vcoup_Mc') || '0');
            state.xa = parseFloat(sessionStorage.getItem('vcoup_xa') || '0');
            state.ya = parseFloat(sessionStorage.getItem('vcoup_ya') || '0');
            state.configMode = sessionStorage.getItem('vcoup_configMode') || 'independent';
        }} else {{
            sessionStorage.setItem('vcoup_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vcoup_f1', state.f1);
            sessionStorage.setItem('vcoup_theta1', state.theta1);
            sessionStorage.setItem('vcoup_f2', state.f2);
            sessionStorage.setItem('vcoup_theta2', state.theta2);
            sessionStorage.setItem('vcoup_Mc', state.Mc);
            sessionStorage.setItem('vcoup_xa', state.xa);
            sessionStorage.setItem('vcoup_ya', state.ya);
            sessionStorage.setItem('vcoup_configMode', state.configMode);
        }}

        function syncLockMode() {{
            if (state.configMode === 'couple') {{
                btnIndependent.classList.remove('active');
                btnCouple.classList.add('active');
                
                if (!isLocked) {{
                    f2Slider.disabled = true;
                    theta2Slider.disabled = true;
                }}
                document.getElementById('box-f2').classList.add('muted');
                
                // Force F2 to be equal and opposite to F1
                state.f2 = state.f1;
                state.theta2 = (state.theta1 + 180) % 360;
                
                f2Slider.value = state.f2;
                theta2Slider.value = state.theta2;
                document.getElementById('f2-val-display').innerText = state.f2.toFixed(0) + ' N';
                document.getElementById('theta2-val-display').innerText = state.theta2.toFixed(0) + '°';
            }} else {{
                btnIndependent.classList.add('active');
                btnCouple.classList.remove('active');
                
                if (!isLocked) {{
                    f2Slider.disabled = false;
                    theta2Slider.disabled = false;
                }}
                document.getElementById('box-f2').classList.remove('muted');
            }}
            saveState();
        }}

        btnIndependent.addEventListener('click', () => {{
            state.configMode = 'independent';
            syncLockMode();
            updatePlot();
        }});

        btnCouple.addEventListener('click', () => {{
            state.configMode = 'couple';
            syncLockMode();
            updatePlot();
        }});

        // Handle locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            f1Slider.disabled = true;
            theta1Slider.disabled = true;
            f2Slider.disabled = true;
            theta2Slider.disabled = true;
            mcSlider.disabled = true;
            xaSlider.disabled = true;
            yaSlider.disabled = true;
            btnIndependent.disabled = true;
            btnCouple.disabled = true;
        }}

        // Sliders Listeners
        f1Slider.addEventListener('input', (e) => {{
            state.f1 = parseFloat(e.target.value);
            document.getElementById('f1-val-display').innerText = state.f1.toFixed(0) + ' N';
            if (state.configMode === 'couple') {{
                state.f2 = state.f1;
                f2Slider.value = state.f2;
                document.getElementById('f2-val-display').innerText = state.f2.toFixed(0) + ' N';
            }}
            saveState();
            updatePlot();
        }});
        theta1Slider.addEventListener('input', (e) => {{
            state.theta1 = parseFloat(e.target.value);
            document.getElementById('theta1-val-display').innerText = state.theta1.toFixed(0) + '°';
            if (state.configMode === 'couple') {{
                state.theta2 = (state.theta1 + 180) % 360;
                theta2Slider.value = state.theta2;
                document.getElementById('theta2-val-display').innerText = state.theta2.toFixed(0) + '°';
            }}
            saveState();
            updatePlot();
        }});
        f2Slider.addEventListener('input', (e) => {{
            state.f2 = parseFloat(e.target.value);
            document.getElementById('f2-val-display').innerText = state.f2.toFixed(0) + ' N';
            saveState();
            updatePlot();
        }});
        theta2Slider.addEventListener('input', (e) => {{
            state.theta2 = parseFloat(e.target.value);
            document.getElementById('theta2-val-display').innerText = state.theta2.toFixed(0) + '°';
            saveState();
            updatePlot();
        }});
        mcSlider.addEventListener('input', (e) => {{
            state.Mc = parseFloat(e.target.value);
            document.getElementById('mc-val-display').innerText = state.Mc.toFixed(0) + ' N-m';
            saveState();
            updatePlot();
        }});
        xaSlider.addEventListener('input', (e) => {{
            state.xa = parseFloat(e.target.value);
            document.getElementById('xa-val-display').innerText = state.xa.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});
        yaSlider.addEventListener('input', (e) => {{
            state.ya = parseFloat(e.target.value);
            document.getElementById('ya-val-display').innerText = state.ya.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            f1Slider.value = state.f1;
            document.getElementById('f1-val-display').innerText = state.f1.toFixed(0) + ' N';
            theta1Slider.value = state.theta1;
            document.getElementById('theta1-val-display').innerText = state.theta1.toFixed(0) + '°';
            f2Slider.value = state.f2;
            document.getElementById('f2-val-display').innerText = state.f2.toFixed(0) + ' N';
            theta2Slider.value = state.theta2;
            document.getElementById('theta2-val-display').innerText = state.theta2.toFixed(0) + '°';
            mcSlider.value = state.Mc;
            document.getElementById('mc-val-display').innerText = state.Mc.toFixed(0) + ' N-m';
            xaSlider.value = state.xa;
            document.getElementById('xa-val-display').innerText = state.xa.toFixed(1) + ' m';
            yaSlider.value = state.ya;
            document.getElementById('ya-val-display').innerText = state.ya.toFixed(1) + ' m';
            syncLockMode();
        }}

        function updatePlot() {{
            let xa = state.xa;
            let ya = state.ya;

            // Force 1 components (located at x1 = -20, y1 = 0)
            let x1 = -20, y1 = 0;
            let rad1 = state.theta1 * Math.PI / 180;
            let f1x = state.f1 * Math.cos(rad1);
            let f1y = state.f1 * Math.sin(rad1);

            // Force 2 components (located at x2 = +20, y2 = 0)
            let x2 = 20, y2 = 0;
            let rad2 = state.theta2 * Math.PI / 180;
            let f2x = state.f2 * Math.cos(rad2);
            let f2y = state.f2 * Math.sin(rad2);

            // Resultant force components
            let Rx = f1x + f2x;
            let Ry = f1y + f2y;
            let R_mag = Math.sqrt(Rx*Rx + Ry*Ry);

            // Moment of F1 about A: r1_A x F1
            // r1_A = (x1 - xa)i + (y1 - ya)j
            // M1_A = (x1 - xa)*f1y - (y1 - ya)*f1x
            let m1a = (x1 - xa)*f1y - (y1 - ya)*f1x;

            // Moment of F2 about A: r2_A x F2
            let m2a = (x2 - xa)*f2y - (y2 - ya)*f2x;

            // Total resultant equivalent moment at A
            let Mr_A = m1a + m2a + state.Mc;

            // Update displays
            rDisplay.innerText = R_mag.toFixed(1) + ' N';
            mraDisplay.innerText = Mr_A.toFixed(0) + ' N-m';

            // Format equation display
            let m1a_str = `(${x1 - xa}) · (${f1y.toFixed(0)})`;
            if (ya !== 0) {{
                let ry1 = y1 - ya;
                m1a_str += ` - (${ry1.toFixed(1)}) · (${f1x.toFixed(0)})`;
            }}
            let m2a_str = `(${x2 - xa}) · (${f2y.toFixed(0)})`;
            if (ya !== 0) {{
                let ry2 = y2 - ya;
                m2a_str += ` - (${ry2.toFixed(1)}) · (${f2x.toFixed(0)})`;
            }}

            equationDisplay.innerHTML = `
                <b>Equivalent Force-Couple Reduction Math:</b><br>
                Resultant Force: R = (${Rx.toFixed(1)}i + ${Ry.toFixed(1)}j) N [Mag: ${R_mag.toFixed(1)} N]<br>
                Moments about A (at x = ${xa.toFixed(1)} m, y = ${ya.toFixed(1)} m):<br>
                · M1_A = ${m1a_str} = ${m1a.toFixed(0)} N-m<br>
                · M2_A = ${m2a_str} = ${m2a.toFixed(0)} N-m<br>
                · Mc (Free Couple Moment) = ${state.Mc.toFixed(0)} N-m<br>
                Equivalent Moment: <b>Mr_A = ${Mr_A.toFixed(0)} N-m</b>
            `;

            // Draw visual representation in Plotly
            const traces = [];

            // 1. Draw rigid plate (rectangle from x=-50 to 50, y=-15 to 15)
            traces.push({{
                x: [-50, 50, 50, -50, -50],
                y: [15, 15, -15, -15, 15],
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(203, 213, 225, 0.25)',
                line: {{color: '#475569', width: 2.5}},
                name: 'Rigid Plate',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // 2. Reference point A (Small black dot)
            traces.push({{
                x: [xa],
                y: [ya],
                mode: 'markers',
                marker: {{size: 10, color: '#1e293b', symbol: 'circle'}},
                name: 'Ref A',
                hoverinfo: 'text',
                hovertext: `Reference Point A (at x = ${xa.toFixed(1)} m, y = ${ya.toFixed(1)} m)`
            }});

            // Setup Layout Annotations
            const annotations = [
                // Origin / Reference label A
                {{
                    x: xa, y: ya - 6,
                    text: '<b>Point A</b>',
                    font: {{family: 'Outfit', size: 12, color: '#1e293b'}},
                    showarrow: false
                }}
            ];

            // 3. Force F1 Arrow (Blue) at (-20, 0)
            let scale_f = 0.25;
            if (state.f1 > 0) {{
                annotations.push({{
                    ax: -20, ay: 0,
                    x: -20 + f1x * scale_f, y: f1y * scale_f,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1,
                    arrowwidth: 3,
                    arrowcolor: '#3b82f6',
                    text: ''
                }});
                
                // F1 label adjacent to vector midpoint
                let midX = -20 + (f1x * scale_f) / 2;
                let midY = (f1y * scale_f) / 2;
                let len = Math.sqrt(f1x * f1x + f1y * f1y);
                let px = 0, py = 0;
                if (len > 0) {{
                    px = -f1y / len;
                    py = f1x / len;
                }}
                annotations.push({{
                    x: midX + px * 5.0,
                    y: midY + py * 5.0,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: `F1 = ${state.f1}N`,
                    font: {{family: 'Outfit', size: 10, color: '#3b82f6', weight: 'bold'}},
                }});
            }}

            // 4. Force F2 Arrow (Green) at (20, 0)
            if (state.f2 > 0) {{
                annotations.push({{
                    ax: 20, ay: 0,
                    x: 20 + f2x * scale_f, y: f2y * scale_f,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1,
                    arrowwidth: 3,
                    arrowcolor: '#10b981',
                    text: ''
                }});

                // F2 label adjacent to vector midpoint
                let midX = 20 + (f2x * scale_f) / 2;
                let midY = (f2y * scale_f) / 2;
                let len = Math.sqrt(f2x * f2x + f2y * f2y);
                let px = 0, py = 0;
                if (len > 0) {{
                    px = -f2y / len;
                    py = f2x / len;
                }}
                annotations.push({{
                    x: midX + px * 5.0,
                    y: midY + py * 5.0,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: `F2 = ${state.f2}N`,
                    font: {{family: 'Outfit', size: 10, color: '#10b981', weight: 'bold'}},
                }});
            }}

            // 5. Draw the resultant equivalent force R at A (Purple arrow)
            if (R_mag > 0) {{
                annotations.push({{
                    ax: xa, ay: ya,
                    x: xa + Rx * scale_f, y: ya + Ry * scale_f,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 3,
                    arrowsize: 1.2,
                    arrowwidth: 4.5,
                    arrowcolor: '#8b5cf6',
                    text: ''
                }});

                // R label adjacent to vector midpoint
                let midX = xa + (Rx * scale_f) / 2;
                let midY = ya + (Ry * scale_f) / 2;
                let len = Math.sqrt(Rx * Rx + Ry * Ry);
                let px = 0, py = 0;
                if (len > 0) {{
                    px = -Ry / len;
                    py = Rx / len;
                }}
                annotations.push({{
                    x: midX + px * 6.0,
                    y: midY + py * 6.0,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: `R = ${R_mag.toFixed(0)}N`,
                    font: {{family: 'Outfit', size: 11, color: '#8b5cf6', weight: 'bold'}},
                }});
            }}

            // 6. Draw Couple Mc representation (Circular arrow near the center)
            if (state.Mc !== 0) {{
                let cx = 0, cy = 0;
                let r_arc = 5 + Math.min(10, Math.abs(state.Mc) / 100);
                
                let num_points = 30;
                let start_ang = -30 * Math.PI / 180;
                let end_ang = 210 * Math.PI / 180;
                if (state.Mc < 0) {{
                    start_ang = 210 * Math.PI / 180;
                    end_ang = -30 * Math.PI / 180;
                }}
                
                let arcX = [];
                let arcY = [];
                for (let i = 0; i <= num_points; i++) {{
                    let a = start_ang + (end_ang - start_ang) * (i / num_points);
                    arcX.push(cx + r_arc * Math.cos(a));
                    arcY.push(cy + r_arc * Math.sin(a));
                }}

                traces.push({{
                    x: arcX,
                    y: arcY,
                    mode: 'lines',
                    line: {{color: '#f59e0b', width: 3.0}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Arrow head for couple
                let end_x = cx + r_arc * Math.cos(end_ang);
                let end_y = cy + r_arc * Math.sin(end_ang);
                let dir = state.Mc > 0 ? 1.0 : -1.0;
                let tx = dir * (-Math.sin(end_ang));
                let ty = dir * Math.cos(end_ang);
                let arrow_len = 4.5;
                let tail_x = end_x - arrow_len * tx;
                let tail_y = end_y - arrow_len * ty;

                annotations.push({{
                    ax: tail_x, ay: tail_y,
                    x: end_x, y: end_y,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1.0,
                    arrowwidth: 3,
                    arrowcolor: '#f59e0b',
                    text: ''
                }});

                // Mc text label next to arrowhead
                annotations.push({{
                    x: end_x, y: end_y,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: `Mc = ${state.Mc} N-m`,
                    font: {{family: 'Outfit', size: 10, color: '#f59e0b', weight: 'bold'}},
                    xshift: end_x > cx ? 35 : -35,
                    yshift: end_y > cy ? 15 : -15
                }});
            }}

            // 7. Draw equivalent resultant moment circular arrow centered at A (purple dash)
            if (Math.abs(Mr_A) > 0.05) {{
                let r_arc = 7 + Math.min(12, Math.abs(Mr_A) / 100);
                
                let num_points = 30;
                let start_ang = -30 * Math.PI / 180;
                let end_ang = 210 * Math.PI / 180;
                if (Mr_A < 0) {{
                    start_ang = 210 * Math.PI / 180;
                    end_ang = -30 * Math.PI / 180;
                }}
                
                let arcX = [];
                let arcY = [];
                for (let i = 0; i <= num_points; i++) {{
                    let a = start_ang + (end_ang - start_ang) * (i / num_points);
                    arcX.push(xa + r_arc * Math.cos(a));
                    arcY.push(ya + r_arc * Math.sin(a));
                }}

                traces.push({{
                    x: arcX,
                    y: arcY,
                    mode: 'lines',
                    line: {{color: '#a855f7', width: 2.5, dash: 'dash'}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // Arrow head for resultant moment
                let end_x = xa + r_arc * Math.cos(end_ang);
                let end_y = ya + r_arc * Math.sin(end_ang);
                let dir = Mr_A > 0 ? 1.0 : -1.0;
                let tx = dir * (-Math.sin(end_ang));
                let ty = dir * Math.cos(end_ang);
                let arrow_len = 4.5;
                let tail_x = end_x - arrow_len * tx;
                let tail_y = end_y - arrow_len * ty;

                annotations.push({{
                    ax: tail_x, ay: tail_y,
                    x: end_x, y: end_y,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1.0,
                    arrowwidth: 3,
                    arrowcolor: '#a855f7',
                    text: ''
                }});

                // Mr_A text label next to arrowhead
                annotations.push({{
                    x: end_x, y: end_y,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: `Mr_A = ${Mr_A.toFixed(0)} N-m`,
                    font: {{family: 'Outfit', size: 10, color: '#a855f7', weight: 'bold'}},
                    xshift: end_x > xa ? 35 : -35,
                    yshift: end_y > ya ? 15 : -15
                }});
            }}

            const layout = {{
                xaxis: {{
                    range: [-60, 60],
                    showgrid: false,
                    zeroline: true,
                    zerolinecolor: '#cbd5e1',
                    fixedrange: true,
                    title: 'Plate X Dimension (m)'
                }},
                yaxis: {{
                    range: [-35, 35],
                    showgrid: false,
                    zeroline: false,
                    scaleanchor: 'x',
                    scaleratio: 1,
                    fixedrange: true,
                    title: 'Plate Y Dimension (m)'
                }},
                margin: {{l: 40, r: 15, t: 15, b: 40}},
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

def run_couple_systems():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #3b82f6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 1 • Lesson 7</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Couples and Force-Couple Systems</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit1"]
    topic_name = "Lesson 7: Couples and Force-Couple Systems"
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
    if "vcoup_phase" not in st.session_state:
        st.session_state.vcoup_phase = "instructions"
    if "vcoup_sliders_locked" not in st.session_state:
        st.session_state.vcoup_sliders_locked = False
    if "vcoup_reset_counter" not in st.session_state:
        st.session_state.vcoup_reset_counter = 0
    if "vcoup_answers" not in st.session_state:
        st.session_state.vcoup_answers = {}

    def reset_simulator():
        st.session_state.vcoup_phase = "instructions"
        st.session_state.vcoup_answers = {}
        st.session_state.vcoup_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vcoup_phase == "poe_predict":
        st.session_state.vcoup_sliders_locked = True
    else:
        st.session_state.vcoup_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Force-Couple Simplification Model")
        locked_js = "true" if st.session_state.vcoup_sliders_locked else "false"
        reset_counter = st.session_state.vcoup_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=750)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#3b82f6; font-weight:700;">{phase_titles[st.session_state.vcoup_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vcoup_phase == "instructions":
            st.markdown(r"""
            A **couple** consists of two equal, opposite, and non-collinear forces. A couple moment is a **free vector**, meaning its effect is independent of the pivot point.
            
            **Key Mechanics:**
            * Use the **Force Configuration** toggle to switch between independent forces or lock them into a **Pure Couple**.
            * Drag sliders to adjust **Force F1** (Blue, located at $x_1=-20\text{ m}$) and **Force F2** (Green, located at $x_2=+20\text{ m}$).
            * Slide **Reference Point A** (small black dot) along $X_a$ and $Y_a$ to move the point about which we simplify the system.
            * Slide **Mc** (Orange) to add an independent couple moment.
            * Notice that as you move point A:
              * The equivalent resultant force $R$ (Purple arrow) is **constant**.
              * The equivalent moment $M_{R,A}$ (dashed purple arc) **changes** depending on where point A is located (unless $R=0$, in which case it is a couple and does not change!).
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vcoup_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vcoup_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            Set the sliders to:
            * **F1**: `100 N`, **θ1**: `90°` (pointing up)
            * **F2**: `50 N`, **θ2**: `270°` (pointing down)
            * **Mc**: `0 N-m`
            * **Reference Point A**: `x_a = 0.0 m`, `y_a = 0.0 m` (center)
            
            Observe the equivalent resultant force $R$ and moment $M_{R}^A$.
            
            **Question:**
            What is the equivalent system at point A?
            """)
            
            ans = st.radio(
                "Select the correct equivalent system at A(0,0):",
                options=[
                    "R = 50 N (up), Mr_A = +1500 N-m (Counterclockwise)",
                    "R = 50 N (up), Mr_A = -3000 N-m (Clockwise)",
                    "R = 150 N (up), Mr_A = -1500 N-m (Clockwise)",
                    "R = 50 N (down), Mr_A = -3000 N-m (Clockwise)"
                ],
                key="vcoup_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "R = 50 N (up), Mr_A = -3000" in ans:
                    st.success(r"Correct! Resultant force is $R = 100 - 50 = 50\text{ N}$ (upward). The moment of $F_1$ about A(0,0) is $M_1 = -F_1 \cdot d_1 = -100 \cdot 20 = -2000\text{ N-m}$ (clockwise). The moment of $F_2$ about A(0,0) is $M_2 = -F_2 \cdot d_2 = -50 \cdot 20 = -1000\text{ N-m}$ (clockwise). Total equivalent moment at A is $M_{R}^A = -3000\text{ N-m}$.")
                else:
                    st.error(r"Incorrect. Let's sum forces: $R = 100 - 50 = 50\text{ N}$ (up). Sum moments about origin A(0,0): $F_1$ is at $x=-20$, pulling up (+100 N), which creates a clockwise moment: $-100 \cdot 20 = -2000$. $F_2$ is at $x=20$, pulling down (-50 N), which also creates clockwise moment: $-50 \cdot 20 = -1000$. Sum = $-3000\text{ N-m}$ (CW).")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vcoup_phase = "poe_predict"
                st.session_state.vcoup_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vcoup_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Controls Locked!):**
            
            **Scenario:**
            * **F1**: `100 N`, **θ1**: `90°` (pointing up, at $x_1 = -20\text{ m}$)
            * **F2**: `100 N`, **θ2**: `270°` (pointing down, at $x_2 = +20\text{ m}$)
            * **Mc**: `0 N-m`
            
            **Question:**
            Without unlocking the controls, predict:
            1. The equivalent resultant force $R$.
            2. The equivalent moment $M_{R}^A$ if reference point A is placed at the origin ($x_A=0\text{ m}, y_A=0\text{ m}$) vs. if it is moved to ($x_A = +10\text{ m}, y_A=0\text{ m}$).
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.",
                    "R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -3000 N-m at x = 10 m.",
                    "R = 200 N (down); Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.",
                    "R = 0 N; Mr_A = 0 N-m at x = 0 m, and Mr_A = -1000 N-m at x = 10 m."
                ],
                key="vcoup_poe_p_radio"
            )
            st.session_state.vcoup_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vcoup_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vcoup_phase == "poe_observe":
            st.markdown(r"""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Switch configuration to **Pure Couple Lock** and set $F_1 = 100\text{ N}, \theta_1 = 90^\circ$ (which forces $F_2 = 100\text{ N}, \theta_2 = 270^\circ$).
            2. Inspect the resultant force $R$ (which should show $0\text{ N}$).
            3. Move the reference point A slider between $x_A = 0.0$ and $x_A = 10.0\text{ m}$, and adjust $y_A$ as well.
            4. Observe whether the equivalent moment $M_{R,A}$ changes or stays the same!
            
            *Update your hypothesis below before final submission.*
            """)
            
            val_init = st.session_state.vcoup_answers.get("poe", "R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.")
            options_list = [
                "R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.",
                "R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -3000 N-m at x = 10 m.",
                "R = 200 N (down); Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.",
                "R = 0 N; Mr_A = 0 N-m at x = 0 m, and Mr_A = -1000 N-m at x = 10 m."
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vcoup_poe_o_radio"
            )
            st.session_state.vcoup_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vcoup_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vcoup_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vcoup_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vcoup_answers.get("poe") == "R = 0 N; Mr_A = -4000 N-m at x = 0 m, and Mr_A = -4000 N-m at x = 10 m.":
                st.success("🎉 **Correct!** Outstanding understanding of couples.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the couple properties explanation below.")

            st.markdown(r"""
            ### Explanation:
            1. **Resultant Force (R)**:
               * Since $\vec{F}_1 = +100\hat{j}$ and $\vec{F}_2 = -100\hat{j}$, the forces are equal and opposite, so $R = F_1 + F_2 = 0\text{ N}$.
            2. **Couple Moment**:
               * Since the forces are equal, opposite, and separated by a distance $d = 40\text{ m}$, they form a **couple**.
               * The moment of this couple is $M = -F \cdot d = -100 \cdot 40 = -4000\text{ N-m}$ (clockwise).
            3. **Free Vector Property**:
               * A key mathematical property of couples is that their moment is a **free vector**.
               * Because the net force is zero ($R=0$), the moment of the system is the **same about every point** in space!
               * Thus, whether A is at $x_A = 0$, $x_A = 10$, $y_A = 12$, or any other coordinate, the equivalent moment is always **$-4000\text{ N-m}$**.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Moment Sandbox
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
            transition: opacity 0.3s ease;
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
        
        #xp-slider::-webkit-slider-thumb {{ background: #3b82f6; }}
        #yp-slider::-webkit-slider-thumb {{ background: #3b82f6; }}
        #f-slider::-webkit-slider-thumb {{ background: #ef4444; }}
        #theta-slider::-webkit-slider-thumb {{ background: #ef4444; }}
        
        .equation-box {{
            background: #f1f5f9;
            border-radius: 8px;
            padding: 10px 14px;
            font-family: monospace;
            font-size: 0.85rem;
            margin-top: 10px;
            color: #1e293b;
            border-left: 4px solid #ef4444;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
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
            transition: all 0.3s ease;
        }}
        .metric-item.muted {{
            opacity: 0.45;
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
            border-color: #ef4444;
            background-color: rgba(239, 68, 68, 0.05);
            color: #ef4444;
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
        <span><b>Moment controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 330px;"></div>

    <!-- Toggle Selector for Calculation Method -->
    <div style="margin-top: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.15);">
        <span style="font-size:0.85rem; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Moment Method:</span>
        <div class="toggle-group" style="margin-top:0; gap:8px;">
            <button class="toggle-btn active" id="toggle-method-dperp">d<sub>⊥</sub> Method</button>
            <button class="toggle-btn" id="toggle-method-component">Component Method</button>
        </div>
    </div>

    <div class="metric-row">
        <div class="metric-item" id="metric-dperp" style="border-bottom: 3.5px solid #22c55e;">
            <div class="metric-label">Perpendicular distance (d<sub>⊥</sub>)</div>
            <div class="metric-val" id="d-display" style="color: #22c55e;">0.0 m</div>
        </div>
        <div class="metric-item" id="metric-force" style="border-bottom: 3.5px solid #ef4444;">
            <div class="metric-label">Force (F)</div>
            <div class="metric-val" id="f-display" style="color: #ef4444;">0.0 N</div>
        </div>
        <div class="metric-item" id="metric-moment" style="border-bottom: 3.5px solid #a855f7;">
            <div class="metric-label">Moment (Mo)</div>
            <div class="metric-val" id="mo-display" style="color: #a855f7;">0.0 N-m</div>
        </div>
    </div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Force Position (x_p, y_p) -->
        <div class="control-box" id="box-application-point" style="border-left: 4px solid #3b82f6;">
            <div class="control-title" style="color: #3b82f6;">1. Force Point of Application</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">x-coordinate, x_p</span>
                    <span class="slider-value" id="xp-val-display" style="color: #3b82f6;">30.0 m</span>
                </div>
                <input type="range" id="xp-slider" min="-50" max="50" step="5" value="30" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">y-coordinate, y_p</span>
                    <span class="slider-value" id="yp-val-display" style="color: #3b82f6;">20.0 m</span>
                </div>
                <input type="range" id="yp-slider" min="-50" max="50" step="5" value="20" class="custom-slider">
            </div>
        </div>

        <!-- Force Definition (F, theta) -->
        <div class="control-box" id="box-force-definition" style="border-left: 4px solid #ef4444;">
            <div class="control-title" style="color: #ef4444;">2. Force Definition</div>
            <div class="slider-container" id="container-magnitude">
                <div class="slider-header">
                    <span class="slider-title">Force Magnitude, F</span>
                    <span class="slider-value" id="f-val-display" style="color: #ef4444;">50.0 N</span>
                </div>
                <input type="range" id="f-slider" min="0" max="100" step="5" value="50" class="custom-slider">
            </div>
            <div class="slider-container" id="container-angle">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ</span>
                    <span class="slider-value" id="theta-val-display" style="color: #ef4444;">270.0°</span>
                </div>
                <input type="range" id="theta-slider" min="0" max="360" step="5" value="270" class="custom-slider">
            </div>
            <div style="margin-top: 8px; font-family: monospace; font-size: 0.8rem; font-weight: 600; color: #475569; text-align: center; border-top: 1px dashed rgba(128,128,128,0.15); padding-top: 6px; transition: opacity 0.3s ease;" id="components-display">
                Fx = 0.0 N | Fy = -50.0 N
            </div>
        </div>
    </div>

    <!-- Live Equation Output -->
    <div class="equation-box" id="equation-display">
        <!-- Filled dynamically in updatePlot() -->
    </div>

    <script>
        // Setup variables
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // Cache DOM elements
        const xpSlider = document.getElementById('xp-slider');
        const ypSlider = document.getElementById('yp-slider');
        const fSlider = document.getElementById('f-slider');
        const thetaSlider = document.getElementById('theta-slider');
        const lockBanner = document.getElementById('lock-banner');

        const btnDperp = document.getElementById('toggle-method-dperp');
        const btnComponent = document.getElementById('toggle-method-component');

        const boxApplication = document.getElementById('box-application-point');
        const boxForce = document.getElementById('box-force-definition');
        const containerMagnitude = document.getElementById('container-magnitude');
        const containerAngle = document.getElementById('container-angle');
        const componentsDisplay = document.getElementById('components-display');

        const metricDperp = document.getElementById('metric-dperp');
        const dDisplay = document.getElementById('d-display');
        const fDisplay = document.getElementById('f-display');
        const moDisplay = document.getElementById('mo-display');
        const equationDisplay = document.getElementById('equation-display');

        // State variables
        let state = {{
            xp: 30,
            yp: 20,
            f_mag: 50,
            theta_f: 270,
            method: 'd_perp'
        }};

        // Read sessionStorage if exists (and not reset)
        const lastReset = parseInt(sessionStorage.getItem('vmom_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.xp = parseFloat(sessionStorage.getItem('vmom_xp') || '30');
            state.yp = parseFloat(sessionStorage.getItem('vmom_yp') || '20');
            state.f_mag = parseFloat(sessionStorage.getItem('vmom_f_mag') || '50');
            state.theta_f = parseFloat(sessionStorage.getItem('vmom_theta_f') || '270');
            state.method = sessionStorage.getItem('vmom_method') || 'd_perp';
        }} else {{
            sessionStorage.setItem('vmom_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vmom_xp', state.xp);
            sessionStorage.setItem('vmom_yp', state.yp);
            sessionStorage.setItem('vmom_f_mag', state.f_mag);
            sessionStorage.setItem('vmom_theta_f', state.theta_f);
            sessionStorage.setItem('vmom_method', state.method);
        }}

        // Handle locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            xpSlider.disabled = true;
            ypSlider.disabled = true;
            fSlider.disabled = true;
            thetaSlider.disabled = true;
            btnDperp.disabled = true;
            btnComponent.disabled = true;
        }}

        // Sliders Listeners
        xpSlider.addEventListener('input', (e) => {{
            state.xp = parseFloat(e.target.value);
            document.getElementById('xp-val-display').innerText = state.xp.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});
        ypSlider.addEventListener('input', (e) => {{
            state.yp = parseFloat(e.target.value);
            document.getElementById('yp-val-display').innerText = state.yp.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});
        fSlider.addEventListener('input', (e) => {{
            state.f_mag = parseFloat(e.target.value);
            document.getElementById('f-val-display').innerText = state.f_mag.toFixed(1) + ' N';
            saveState();
            updatePlot();
        }});
        thetaSlider.addEventListener('input', (e) => {{
            state.theta_f = parseFloat(e.target.value);
            document.getElementById('theta-val-display').innerText = state.theta_f.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});

        btnDperp.addEventListener('click', () => {{
            if (isLocked) return;
            state.method = 'd_perp';
            saveState();
            syncUI();
            updatePlot();
        }});

        btnComponent.addEventListener('click', () => {{
            if (isLocked) return;
            state.method = 'component';
            saveState();
            syncUI();
            updatePlot();
        }});

        function syncUI() {{
            xpSlider.value = state.xp;
            document.getElementById('xp-val-display').innerText = state.xp.toFixed(1) + ' m';
            ypSlider.value = state.yp;
            document.getElementById('yp-val-display').innerText = state.yp.toFixed(1) + ' m';
            fSlider.value = state.f_mag;
            document.getElementById('f-val-display').innerText = state.f_mag.toFixed(1) + ' N';
            thetaSlider.value = state.theta_f;
            document.getElementById('theta-val-display').innerText = state.theta_f.toFixed(1) + '°';

            if (state.method === 'd_perp') {{
                btnDperp.classList.add('active');
                btnComponent.classList.remove('active');

                // Mute Box 1 (Application Point)
                boxApplication.classList.add('muted');
                // Emphasize Metric d_perp
                metricDperp.classList.remove('muted');
                
                // Mute components display inside Box 2, Emphasize overall magnitude
                componentsDisplay.classList.add('muted');
                containerMagnitude.classList.remove('muted');
                containerAngle.classList.remove('muted');
            }} else {{
                btnDperp.classList.remove('active');
                btnComponent.classList.add('active');

                // Emphasize Box 1
                boxApplication.classList.remove('muted');
                // Mute Metric d_perp
                metricDperp.classList.add('muted');

                // Emphasize components display inside Box 2, Mute overall magnitude sliders
                componentsDisplay.classList.remove('muted');
                containerMagnitude.classList.add('muted');
                containerAngle.classList.add('muted');
            }}
        }}

        function updatePlot() {{
            let rx = state.xp;
            let ry = state.yp;
            let F_mag = state.f_mag;
            let radF = state.theta_f * Math.PI / 180;
            
            // Calculate components
            let Fx = F_mag * Math.cos(radF);
            let Fy = F_mag * Math.sin(radF);
            if (Math.abs(Fx) < 0.0001) Fx = 0;
            if (Math.abs(Fy) < 0.0001) Fy = 0;

            // Update Box 2 components text display
            componentsDisplay.innerText = `Fx = ${Fx.toFixed(1)} N | Fy = ${Fy.toFixed(1)} N`;

            // 1. Vector Moment Calculation
            let Mo = rx * Fy - ry * Fx;
            if (Math.abs(Mo) < 0.0001) Mo = 0;

            // 3. Lever Arm (Perpendicular Distance d)
            let d = 0;
            if (F_mag > 0) {{
                d = Math.abs(Mo) / F_mag;
            }}

            // Update displays
            dDisplay.innerText = d.toFixed(1) + ' m';
            fDisplay.innerText = F_mag.toFixed(1) + ' N';
            moDisplay.innerText = Mo.toFixed(1) + ' N-m';

            // Sign / direction text
            let signText = Mo > 0 ? '(+ CCW)' : (Mo < 0 ? '(- CW)' : '(Zero)');

            // Render equations based on method selection
            if (state.method === 'd_perp') {{
                equationDisplay.innerHTML = `
                    <div>
                        <b>Perpendicular Distance Method:</b><br>
                        Mo = ± F · d<sub>⊥</sub><br>
                        Mo = ${Mo < 0 ? '-' : (Mo > 0 ? '+' : '')} (${F_mag.toFixed(0)} N) · (${d.toFixed(1)} m)<br>
                        Mo = <b>${Mo.toFixed(1)} N-m</b> ${signText}
                    </div>
                    <div style="opacity: 0.4;">
                        <b>Component Method (Muted):</b><br>
                        Mo = rx · Fy - ry · Fx<br>
                        Mo = (${rx.toFixed(0)})·(${Fy.toFixed(0)}) - (${ry.toFixed(0)})·(${Fx.toFixed(0)}) = <b>${Mo.toFixed(1)} N-m</b>
                    </div>
                `;
            }} else {{
                equationDisplay.innerHTML = `
                    <div style="opacity: 0.4;">
                        <b>Perpendicular Distance Method (Muted):</b><br>
                        Mo = ± F · d<sub>⊥</sub> = ${Mo < 0 ? '-' : (Mo > 0 ? '+' : '')} (${F_mag.toFixed(0)} N) · (${d.toFixed(1)} m) = <b>${Mo.toFixed(1)} N-m</b>
                    </div>
                    <div>
                        <b>Component Method:</b><br>
                        Mo = rx · Fy - ry · Fx<br>
                        Mo = (${rx.toFixed(0)})·(${Fy.toFixed(0)}) - (${ry.toFixed(0)})·(${Fx.toFixed(0)})<br>
                        Mo = <b>${Mo.toFixed(1)} N-m</b> ${signText}
                    </div>
                `;
            }}

            // Draw representations in Plotly
            const traces = [];

            // Spline path coordinates for the background Mech Potato (Rigid Body)
            const potatoX = [-45, -30, 0, 35, 55, 60, 45, 10, -20, -50, -45];
            const potatoY = [-20, 45, 55, 45, 20, -15, -45, -55, -40, -35, -20];

            traces.push({{
                x: potatoX,
                y: potatoY,
                mode: 'lines',
                fill: 'toself',
                fillcolor: 'rgba(148, 163, 184, 0.11)',
                line: {{color: 'rgba(148, 163, 184, 0.35)', width: 2.5, shape: 'spline'}},
                name: 'Rigid Body',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Pivot point O (origin)
            traces.push({{
                x: [0],
                y: [0],
                mode: 'markers',
                marker: {{size: 12, color: '#1e293b', symbol: 'square'}},
                name: 'Pivot O',
                hoverinfo: 'text',
                hovertext: 'Pivot Point O (Origin)'
            }});

            // Force Application point P
            traces.push({{
                x: [rx],
                y: [ry],
                mode: 'markers',
                marker: {{size: 8, color: '#3b82f6', symbol: 'circle'}},
                name: 'P',
                hoverinfo: 'text',
                hovertext: `Point of Application P: (${rx.toFixed(0)}, ${ry.toFixed(0)}) m`
            }});

            let scale = 0.35;
            let fx_draw = Fx * scale;
            let fy_draw = Fy * scale;

            // Setup Layout Annotations list
            const annotations = [
                // Origin Label
                {{
                    x: 0, y: -5,
                    text: 'O',
                    font: {{family: 'Outfit', size: 14, color: '#1e293b', weight: 'bold'}},
                    showarrow: false
                }},
                // Force Application point P label
                {{
                    x: rx, y: ry,
                    text: 'P',
                    font: {{family: 'Outfit', size: 14, color: '#3b82f6', weight: 'bold'}},
                    showarrow: false,
                    xshift: rx > 0 ? 10 : -10,
                    yshift: ry > 0 ? 10 : -10
                }}
            ];

            // Draw Overall Force Arrow starting at P (solid in d_perp, transparent in component)
            if (F_mag > 0) {{
                let isDperp = state.method === 'd_perp';
                annotations.push({{
                    ax: rx, ay: ry,
                    x: rx + fx_draw, y: ry + fy_draw,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 3,
                    arrowsize: 1.2,
                    arrowwidth: 4.5,
                    arrowcolor: isDperp ? '#ef4444' : 'rgba(239, 68, 68, 0.25)',
                    text: ''
                }});

                // Force text label adjacent to the middle of the force vector (only in d_perp)
                if (isDperp) {{
                    let midX = rx + fx_draw / 2;
                    let midY = ry + fy_draw / 2;
                    let len = Math.sqrt(fx_draw * fx_draw + fy_draw * fy_draw);
                    let px = 0;
                    let py = 0;
                    if (len > 0) {{
                        px = -fy_draw / len;
                        py = fx_draw / len;
                    }}
                    let shift = 8;
                    annotations.push({{
                        x: midX + px * shift,
                        y: midY + py * shift,
                        xref: 'x', yref: 'y',
                        showarrow: false,
                        text: `F = ${F_mag.toFixed(0)} N`,
                        font: {{family: 'Outfit', size: 12, color: '#ef4444', weight: 'bold'}},
                    }});
                }}
            }}

            if (state.method === 'd_perp') {{
                // d_perp method: Show overall force arrow, line of action, and perpendicular line
                if (F_mag > 0) {{
                    // Line of Action (Gray dashed line passing through P along F direction)
                    let dx = Fx / F_mag;
                    let dy = Fy / F_mag;
                    traces.push({{
                        x: [rx - dx * 120, rx + dx * 120],
                        y: [ry - dy * 120, ry + dy * 120],
                        mode: 'lines',
                        line: {{color: '#94a3b8', width: 1.5, dash: 'dash'}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});

                    // Perpendicular point Q on Line of Action from origin (0, 0)
                    let t = (rx * Fx + ry * Fy) / (F_mag * F_mag);
                    let qx = rx - t * Fx;
                    let qy = ry - t * Fy;

                    // Lever arm line (Green from O to Q)
                    traces.push({{
                        x: [0, qx],
                        y: [0, qy],
                        mode: 'lines',
                        line: {{color: '#22c55e', width: 3.5}},
                        name: 'Lever Arm (d_perp)',
                        hoverinfo: 'text',
                        hovertext: `Lever Arm d_perp = ${d.toFixed(2)} m`
                    }});

                    // Perpendicular square marker at Q
                    if (d > 2) {{
                        let px_size = 2.5;
                        let ux = Fx / F_mag;
                        let uy = Fy / F_mag;
                        let nx = -uy;
                        let ny = ux;
                        if (rx * nx + ry * ny < 0) {{
                            nx = -nx;
                            ny = -ny;
                        }}
                        traces.push({{
                            x: [qx, qx + nx * px_size, qx + nx * px_size - ux * px_size, qx - ux * px_size, qx],
                            y: [qy, qy + ny * px_size, qy + ny * px_size - uy * px_size, qy - uy * px_size, qy],
                            mode: 'lines',
                            line: {{color: '#16a34a', width: 1.5}},
                            fill: 'toself',
                            fillcolor: 'rgba(34, 197, 94, 0.15)',
                            showlegend: false,
                            hoverinfo: 'skip'
                        }});
                    }}
                    
                    // Label perpendicular distance
                    annotations.push({{
                        x: qx / 2, y: qy / 2,
                        text: `d<sub>⊥</sub> = ${d.toFixed(1)}m`,
                        font: {{family: 'Outfit', size: 11, color: '#16a34a', weight: 'bold'}},
                        showarrow: false,
                        xshift: qy > qx ? 25 : -25
                    }});
                }}

            }} else {{
                // Component method: Fracture force into Fx and Fy starting at P, show guides along axes
                if (Fx !== 0) {{
                    // Fx Arrow
                    annotations.push({{
                        ax: rx, ay: ry,
                        x: rx + fx_draw, y: ry,
                        xref: 'x', yref: 'y',
                        axref: 'x', ayref: 'y',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 1,
                        arrowwidth: 3.5,
                        arrowcolor: '#ec4899',
                        text: ''
                    }});
                    // Fx Label adjacent to shaft midpoint
                    annotations.push({{
                        x: rx + fx_draw / 2, y: ry,
                        xref: 'x', yref: 'y',
                        showarrow: false,
                        text: `Fx = ${Fx.toFixed(0)} N`,
                        font: {{family: 'Outfit', size: 11, color: '#ec4899', weight: 'bold'}},
                        yshift: 12
                    }});

                    // Vertical distance guide line dy (lever arm for Fx) from x-axis vertically up to P
                    traces.push({{
                        x: [rx, rx],
                        y: [0, ry],
                        mode: 'lines',
                        line: {{color: '#22c55e', width: 2, dash: 'dot'}},
                        name: 'y_p guide',
                        hoverinfo: 'skip'
                    }});
                    // Label vertical distance guide
                    if (ry !== 0) {{
                        annotations.push({{
                            x: rx, y: ry / 2,
                            text: `|y<sub>p</sub>| = ${Math.abs(ry).toFixed(0)}m`,
                            font: {{family: 'Outfit', size: 11, color: '#16a34a', weight: 'bold'}},
                            showarrow: false,
                            xshift: rx >= 0 ? 35 : -35
                        }});
                    }}
                }}

                if (Fy !== 0) {{
                    // Fy Arrow
                    annotations.push({{
                        ax: rx, ay: ry,
                        x: rx, y: ry + fy_draw,
                        xref: 'x', yref: 'y',
                        axref: 'x', ayref: 'y',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 1,
                        arrowwidth: 3.5,
                        arrowcolor: '#06b6d4',
                        text: ''
                    }});
                    // Fy Label adjacent to shaft midpoint
                    annotations.push({{
                        x: rx, y: ry + fy_draw / 2,
                        xref: 'x', yref: 'y',
                        showarrow: false,
                        text: `Fy = ${Fy.toFixed(0)} N`,
                        font: {{family: 'Outfit', size: 11, color: '#06b6d4', weight: 'bold'}},
                        xshift: 30
                    }});

                    // Horizontal distance guide line dx (lever arm for Fy) from y-axis horizontally to P
                    traces.push({{
                        x: [0, rx],
                        y: [ry, ry],
                        mode: 'lines',
                        line: {{color: '#22c55e', width: 2, dash: 'dot'}},
                        name: 'x_p guide',
                        hoverinfo: 'skip'
                    }});
                    // Label horizontal distance guide
                    if (rx !== 0) {{
                        annotations.push({{
                            x: rx / 2, y: ry,
                            text: `|x<sub>p</sub>| = ${Math.abs(rx).toFixed(0)}m`,
                            font: {{family: 'Outfit', size: 11, color: '#16a34a', weight: 'bold'}},
                            showarrow: false,
                            yshift: ry >= 0 ? 15 : -15
                        }});
                    }}
                }}
            }}

            // Draw sign/rotation indicator arc (curved arrow) near the origin
            if (Mo !== 0) {{
                // Radius of the moment arc scales with the moment magnitude
                let radius_arc = 8 + Math.min(22, Math.abs(Mo) / 100);
                
                let num_points = 30;
                let start_ang = -30 * Math.PI / 180;
                let end_ang = 210 * Math.PI / 180;
                if (Mo < 0) {{
                    start_ang = 210 * Math.PI / 180;
                    end_ang = -30 * Math.PI / 180;
                }}
                
                let arcX = [];
                let arcY = [];
                for (let i = 0; i <= num_points; i++) {{
                    let a = start_ang + (end_ang - start_ang) * (i / num_points);
                    arcX.push(radius_arc * Math.cos(a));
                    arcY.push(radius_arc * Math.sin(a));
                }}

                traces.push({{
                    x: arcX,
                    y: arcY,
                    mode: 'lines',
                    line: {{color: Mo > 0 ? '#a855f7' : '#f97316', width: 3.5}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});

                // End angle point
                let end_x = radius_arc * Math.cos(end_ang);
                let end_y = radius_arc * Math.sin(end_ang);

                // Tangent direction at the end of the arc
                let dir = Mo > 0 ? 1.0 : -1.0;
                let tx = dir * (-Math.sin(end_ang));
                let ty = dir * Math.cos(end_ang);

                // Define tail of the arrowhead a bit back along the tangent
                let arrow_len = 6.0;
                let tail_x = end_x - arrow_len * tx;
                let tail_y = end_y - arrow_len * ty;

                // Add arrow head at the end of the arc pointing in the tangent direction
                annotations.push({{
                    ax: tail_x, ay: tail_y,
                    x: end_x, y: end_y,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 1.2,
                    arrowwidth: 3.5,
                    arrowcolor: Mo > 0 ? '#a855f7' : '#f97316',
                    text: ''
                }});

                // Place direction label next to the arc arrowhead
                annotations.push({{
                    x: end_x, y: end_y,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: Mo > 0 ? 'Mo (+ CCW)' : 'Mo (- CW)',
                    font: {{family: 'Outfit', size: 10, color: Mo > 0 ? '#a855f7' : '#f97316', weight: 'bold'}},
                    xshift: end_x > 0 ? 30 : -30,
                    yshift: end_y > 0 ? 15 : -15
                }});
            }}

            const layout = {{
                xaxis: {{
                    range: [-70, 70],
                    zeroline: true,
                    zerolinecolor: '#cbd5e1',
                    gridcolor: '#f1f5f9',
                    fixedrange: true,
                    title: 'X Position (m)'
                }},
                yaxis: {{
                    range: [-70, 70],
                    zeroline: true,
                    zerolinecolor: '#cbd5e1',
                    gridcolor: '#f1f5f9',
                    fixedrange: true,
                    scaleanchor: 'x',
                    scaleratio: 1,
                    title: 'Y Position (m)'
                }},
                margin: {{l: 45, r: 15, t: 15, b: 45}},
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

def run_moment_torque():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #3b82f6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 1 • Lesson 6</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Forces and Moments</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit1"]
    topic_name = "Lesson 6: Forces and Moments"
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
    if "vmom_phase" not in st.session_state:
        st.session_state.vmom_phase = "instructions"
    if "vmom_sliders_locked" not in st.session_state:
        st.session_state.vmom_sliders_locked = False
    if "vmom_reset_counter" not in st.session_state:
        st.session_state.vmom_reset_counter = 0
    if "vmom_answers" not in st.session_state:
        st.session_state.vmom_answers = {}

    def reset_simulator():
        st.session_state.vmom_phase = "instructions"
        st.session_state.vmom_answers = {}
        st.session_state.vmom_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vmom_phase == "poe_predict":
        st.session_state.vmom_sliders_locked = True
    else:
        st.session_state.vmom_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Moment & Torque Sandbox")
        locked_js = "true" if st.session_state.vmom_sliders_locked else "false"
        reset_counter = st.session_state.vmom_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=700)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#3b82f6; font-weight:700;">{phase_titles[st.session_state.vmom_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vmom_phase == "instructions":
            st.markdown(r"""
            A **moment** represents the measure of a force's tendency to cause a body to rotate about a specific pivot point.
            
            **Key Mechanics:**
            * Drag **Force Point of Application** sliders to position the force's application point $P(x_p, y_p)$ on the rigid body ("mech potato").
            * Drag **Force Definition** sliders to set the overall **Force Magnitude $F$** and **Angle $\theta$**.
            * Toggle between the **Perpendicular Distance ($d_\perp$) method** and the **Component method** to see how the moment is calculated using different techniques:
              - **$d_\perp$ Method**: Visualizes the force's line of action (dashed line) and the perpendicular lever arm $d_\perp$ from pivot $O$ to the line of action.
              - **Component Method**: Fractures the force into horizontal ($F_x$) and vertical ($F_y$) components, showing their respective perpendicular lever arms (distances from the axes, $|y_p|$ and $|x_p|$).
            * The **purple/orange circular arrow** near $O$ indicates the moment direction: Purple for counter-clockwise (+), Orange for clockwise (-), scaling in size with the moment's magnitude.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vmom_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vmom_phase == "guided_question":
            st.markdown(r"""
            **Guided Scenario:**
            Set the sliders to:
            * **x-coordinate, x_p**: `-40.0 m`
            * **y-coordinate, y_p**: `20.0 m`
            * **Force Magnitude, F**: `80.0 N`
            * **Angle, θ**: `0.0°` (resulting in $F_x = 80\text{ N}, F_y = 0\text{ N}$)
            
            Observe the perpendicular distance line and components.
            
            **Question:**
            What is the perpendicular lever arm distance $d$ and the moment $M_O$ about the origin?
            """)
            
            ans = st.radio(
                "Select the correct calculation:",
                options=[
                    "d = 40.0 m, Mo = +3200 N-m (Counterclockwise)",
                    "d = 20.0 m, Mo = -1600 N-m (Clockwise)",
                    "d = 20.0 m, Mo = +1600 N-m (Counterclockwise)",
                    "d = 44.7 m, Mo = -3200 N-m (Clockwise)"
                ],
                key="vmom_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "-1600 N-m" in ans:
                    st.success(r"Correct! The line of action of the force is horizontal at $y=20\text{ m}$. The perpendicular distance from $O(0,0)$ to this line is $d=20\text{ m}$. The force pulls to the right (+80 N), which creates a clockwise (negative) rotation around $O$: $M_O = -F \cdot d = -80 \cdot 20 = -1600\text{ N-m}$. Vector: $r_x F_y - r_y F_x = -40(0) - 20(80) = -1600\text{ N-m}$.")
                else:
                    st.error(r"Incorrect. Find the line of action: it is horizontal along $y=20$. Perpendicular distance to origin is $d=20\text{ m}$. A force pushing right (+80 N) at $y=20$ rotates the body clockwise, so $M_O = -1600\text{ N-m}$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vmom_phase = "poe_predict"
                st.session_state.vmom_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vmom_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Moment Controls Locked!):**
            
            **Scenario:**
            * **Force Position**: $P(30.0, 20.0)\text{ m}$ (in Q1)
            * **Force Vector**: $\vec{F} = (0, -50.0)\text{ N}$ (pointing straight down)
            
            **Question:**
            Without unlocking the controls, predict:
            1. The perpendicular distance (lever arm) $d$ from the origin to the force's line of action.
            2. The moment $M_O$ about the origin (magnitude and sign).
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "d = 30.0 m; Mo = -1500 N-m (Clockwise)",
                    "d = 20.0 m; Mo = -1000 N-m (Clockwise)",
                    "d = 30.0 m; Mo = +1500 N-m (Counterclockwise)",
                    "d = 36.1 m; Mo = -1800 N-m (Clockwise)"
                ],
                key="vmom_poe_p_radio"
            )
            st.session_state.vmom_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vmom_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vmom_phase == "poe_observe":
            st.markdown(r"""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set **x-coordinate, x_p** to `30.0 m`, and **y-coordinate, y_p** to `20.0 m`.
            2. Set **Force Magnitude, F** to `50.0 N`, and **Angle, θ** to `270.0°` (resulting in $F_x = 0\text{ N}, F_y = -50\text{ N}$).
            3. Inspect the perpendicular distance ($d_\perp$) line and moment rotation direction in the sandbox.
            
            *Change your answer below if needed before final submission!*
            """)
            
            val_init = st.session_state.vmom_answers.get("poe", "d = 30.0 m; Mo = -1500 N-m (Clockwise)")
            options_list = [
                "d = 30.0 m; Mo = -1500 N-m (Clockwise)",
                "d = 20.0 m; Mo = -1000 N-m (Clockwise)",
                "d = 30.0 m; Mo = +1500 N-m (Counterclockwise)",
                "d = 36.1 m; Mo = -1800 N-m (Clockwise)"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vmom_poe_o_radio"
            )
            st.session_state.vmom_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vmom_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vmom_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vmom_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vmom_answers.get("poe") == "d = 30.0 m; Mo = -1500 N-m (Clockwise)":
                st.success("🎉 **Correct!** Great job.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the calculations below.")

            st.markdown(r"""
            ### Explanation:
            1. **Line of Action**:
               * Since $\vec{F} = (0, -50)\text{ N}$, the force is entirely vertical. The line of action is a vertical line passing through $x = r_x = 30\text{ m}$.
               * The perpendicular distance from pivot $O(0,0)$ to this vertical line is simply its horizontal coordinate: $d = 30\text{ m}$.
            2. **Rotational Direction (Sign)**:
               * Applying a downward force on the right side of the origin rotates the lever **clockwise**, which corresponds to a negative moment.
            3. **Scalar Method**:
               * $M_O = - F \cdot d = -50\text{ N} \cdot 30\text{ m} = -1500\text{ N-m}$.
            4. **Vector Method**:
               * $\vec{M}_O = (r_x F_y - r_y F_x)\hat{k} = [30(-50) - 20(0)]\hat{k} = -1500\hat{k}\text{ N-m}$.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

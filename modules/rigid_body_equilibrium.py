import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Rigid Body Equilibrium
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
        .status-banner {{
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 12px;
            font-size: 0.88rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        .status-determinate {{
            background-color: #f0fdf4;
            border: 1.5px solid #bbf7d0;
            color: #166534;
        }}
        .status-indeterminate {{
            background-color: #fffbeb;
            border: 1.5px solid #fef3c7;
            color: #9a3412;
        }}
        .status-unstable {{
            background-color: #fef2f2;
            border: 1.5px solid #fee2e2;
            color: #991b1b;
            animation: blink 1s infinite alternate;
        }}
        @keyframes blink {{
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
        .btn-group {{
            display: flex;
            flex-direction: column;
            gap: 5px;
        }}
        .btn-choice {{
            padding: 6px 10px;
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
            border-color: #10b981;
            background-color: #10b981;
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
            font-size: 0.72rem;
            color: #64748b;
            font-weight: 600;
        }}
        .metric-val {{
            font-size: 1.1rem;
            font-weight: 700;
        }}
    </style>
</head>
<body>
    <div id="lock-banner" class="lock-warning" style="display: none;">
        <span>⚠️</span>
        <span><b>Controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Status indicator banner -->
    <div id="status-banner" class="status-banner status-determinate">
        <span id="status-icon">✅</span>
        <span id="status-text">Statically Determinate System</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 260px;"></div>

    <div class="metric-row">
        <div class="metric-item" style="border-bottom: 3.5px solid #3b82f6;">
            <div class="metric-label">Left Vert. Reaction (Ray)</div>
            <div class="metric-val" id="ray-display" style="color:#3b82f6;">-</div>
        </div>
        <div class="metric-item" style="border-bottom: 3.5px solid #22c55e;">
            <div class="metric-label">Right Vert. Reaction (Rby)</div>
            <div class="metric-val" id="rby-display" style="color:#22c55e;">-</div>
        </div>
        <div class="metric-item" style="border-bottom: 3.5px solid #64748b;">
            <div class="metric-label">Horiz. Reaction (Rax)</div>
            <div class="metric-val" id="rax-display" style="color:#475569;">-</div>
        </div>
    </div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Load controls -->
        <div class="control-box">
            <div class="control-title">1. Point Load (P)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Load Magnitude, P</span>
                    <span class="slider-value" id="p-val-display">60 kN</span>
                </div>
                <input type="range" id="p-slider" min="0" max="100" step="10" value="60" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Position, x_P</span>
                    <span class="slider-value" id="xp-val-display">2.5 m</span>
                </div>
                <input type="range" id="xp-slider" min="0" max="10" step="0.5" value="2.5" class="custom-slider">
            </div>
        </div>

        <!-- Left Support type -->
        <div class="control-box">
            <div class="control-title">2. Left Support (A)</div>
            <div class="btn-group">
                <button class="btn-choice active" id="left-pin">Pin (2 Reactions)</button>
                <button class="btn-choice" id="left-roller">Roller (1 Reaction)</button>
                <button class="btn-choice" id="left-fixed">Fixed (3 Reactions)</button>
            </div>
        </div>

        <!-- Right Support type -->
        <div class="control-box">
            <div class="control-title">3. Right Support (B)</div>
            <div class="btn-group">
                <button class="btn-choice" id="right-pin">Pin (2 Reactions)</button>
                <button class="btn-choice active" id="right-roller">Roller (1 Reaction)</button>
                <button class="btn-choice" id="right-free">Free (0 Reactions)</button>
            </div>
        </div>
    </div>

    <!-- Live Equation Output -->
    <div class="equation-box" id="equation-display">
        Equations will display here...
    </div>

    <script>
        // Setup variables
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // Cache elements
        const pSlider = document.getElementById('p-slider');
        const xpSlider = document.getElementById('xp-slider');
        const lockBanner = document.getElementById('lock-banner');
        const statusBanner = document.getElementById('status-banner');
        const statusIcon = document.getElementById('status-icon');
        const statusText = document.getElementById('status-text');

        const rayDisplay = document.getElementById('ray-display');
        const rbyDisplay = document.getElementById('rby-display');
        const raxDisplay = document.getElementById('rax-display');
        const equationDisplay = document.getElementById('equation-display');

        // Support buttons
        const btnLeftPin = document.getElementById('left-pin');
        const btnLeftRoller = document.getElementById('left-roller');
        const btnLeftFixed = document.getElementById('left-fixed');
        const btnRightPin = document.getElementById('right-pin');
        const btnRightRoller = document.getElementById('right-roller');
        const btnRightFree = document.getElementById('right-free');

        // State
        let state = {{
            P: 60,
            xp: 2.5,
            leftSupport: 'pin', // 'pin', 'roller', 'fixed'
            rightSupport: 'roller' // 'pin', 'roller', 'free'
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vrig_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.P = parseFloat(sessionStorage.getItem('vrig_P') || '60');
            state.xp = parseFloat(sessionStorage.getItem('vrig_xp') || '2.5');
            state.leftSupport = sessionStorage.getItem('vrig_leftSupport') || 'pin';
            state.rightSupport = sessionStorage.getItem('vrig_rightSupport') || 'roller';
        }} else {{
            sessionStorage.setItem('vrig_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vrig_P', state.P);
            sessionStorage.setItem('vrig_xp', state.xp);
            sessionStorage.setItem('vrig_leftSupport', state.leftSupport);
            sessionStorage.setItem('vrig_rightSupport', state.rightSupport);
        }}

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            pSlider.disabled = true;
            xpSlider.disabled = true;
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);
        }}

        // Setup button clicks
        function setupBtn(btn, value, group, stateProp) {{
            btn.addEventListener('click', () => {{
                if (isLocked) return;
                group.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state[stateProp] = value;
                saveState();
                updatePlot();
            }});
        }}

        const leftGroup = [btnLeftPin, btnLeftRoller, btnLeftFixed];
        setupBtn(btnLeftPin, 'pin', leftGroup, 'leftSupport');
        setupBtn(btnLeftRoller, 'roller', leftGroup, 'leftSupport');
        setupBtn(btnLeftFixed, 'fixed', leftGroup, 'leftSupport');

        const rightGroup = [btnRightPin, btnRightRoller, btnRightFree];
        setupBtn(btnRightPin, 'pin', rightGroup, 'rightSupport');
        setupBtn(btnRightRoller, 'roller', rightGroup, 'rightSupport');
        setupBtn(btnRightFree, 'free', rightGroup, 'rightSupport');

        // Sliders Listeners
        pSlider.addEventListener('input', (e) => {{
            state.P = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            saveState();
            updatePlot();
        }});
        xpSlider.addEventListener('input', (e) => {{
            state.xp = parseFloat(e.target.value);
            document.getElementById('xp-val-display').innerText = state.xp.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            xpSlider.value = state.xp;
            document.getElementById('xp-val-display').innerText = state.xp.toFixed(1) + ' m';

            leftGroup.forEach(btn => btn.classList.remove('active'));
            if (state.leftSupport === 'pin') btnLeftPin.classList.add('active');
            else if (state.leftSupport === 'roller') btnLeftRoller.classList.add('active');
            else if (state.leftSupport === 'fixed') btnLeftFixed.classList.add('active');

            rightGroup.forEach(btn => btn.classList.remove('active'));
            if (state.rightSupport === 'pin') btnRightPin.classList.add('active');
            else if (state.rightSupport === 'roller') btnRightRoller.classList.add('active');
            else if (state.rightSupport === 'free') btnRightFree.classList.add('active');
        }}

        function updatePlot() {{
            let L = 10.0;
            let P = state.P;
            let xp = state.xp;

            // Count unknowns
            let unknowns = 0;
            if (state.leftSupport === 'roller') unknowns += 1; // vertical Ray
            else if (state.leftSupport === 'pin') unknowns += 2; // Ray, Rax
            else if (state.leftSupport === 'fixed') unknowns += 3; // Ray, Rax, Ma

            if (state.rightSupport === 'roller') unknowns += 1; // Rby
            else if (state.rightSupport === 'pin') unknowns += 2; // Rby, Rbx
            // free = 0

            // Classify system determinacy
            // We have 3 standard equations of equilibrium in 2D
            let status = 'determinate';
            if (unknowns < 3) status = 'unstable';
            else if (unknowns > 3) status = 'indeterminate';
            
            // Special cases:
            // If we have two rollers (left roller, right roller) -> unknowns = 2 (unstable)
            // If we have fixed + roller -> unknowns = 4 (indeterminate)
            // Fixed + free -> unknowns = 3 (determinate, cantilever!)
            // Pin + Roller -> unknowns = 3 (determinate, simply supported!)
            // Roller + Pin -> unknowns = 3 (determinate!)
            // Roller + free -> unknowns = 1 (unstable)
            // Pin + free -> unknowns = 2 (unstable)
            // If leftFixed, rightPin -> unknowns = 5 (indeterminate)
            // If we have Roller left, Roller right: no horizontal restraint.
            if (state.leftSupport === 'roller' && state.rightSupport === 'roller') {{
                status = 'unstable'; // No horizontal restraint, unstable.
            }}

            // Apply status visual classes
            statusBanner.className = 'status-banner';
            if (status === 'determinate') {{
                statusBanner.classList.add('status-determinate');
                statusIcon.innerText = '✅';
                statusText.innerText = 'Statically Determinate Beam System';
            }} else if (status === 'indeterminate') {{
                statusBanner.classList.add('status-indeterminate');
                statusIcon.innerText = '⚠️';
                statusText.innerText = `Statically Indeterminate System (${unknowns} Unknowns, 3 Equations)`;
            }} else {{
                statusBanner.classList.add('status-unstable');
                statusIcon.innerText = '🚨';
                statusText.innerText = `UNSTABLE STRUCTURE! (${unknowns} Reactions, Insufficient Restraint)`;
            }}

            let Ray = 0, Rby = 0, Rax = 0, Ma = 0;
            let solved = false;

            if (status === 'determinate') {{
                solved = true;
                // Solve reactions
                if (state.leftSupport === 'fixed' && state.rightSupport === 'free') {{
                    // Cantilever beam
                    // Ray = P, Rax = 0, Ma = P * xp
                    Ray = P;
                    Rax = 0;
                    Ma = P * xp;
                }} else if (state.leftSupport === 'pin' && state.rightSupport === 'roller') {{
                    // Simply supported beam
                    // Rby = P * xp / L
                    // Ray = P - Rby
                    Rby = (P * xp) / L;
                    Ray = P - Rby;
                    Rax = 0;
                }} else if (state.leftSupport === 'roller' && state.rightSupport === 'pin') {{
                    // Simply supported beam (reversed supports)
                    Ray = (P * (L - xp)) / L;
                    Rby = P - Ray;
                    Rax = 0; // Rbx is 0
                }}
            }}

            // Update metrics
            if (solved) {{
                rayDisplay.innerText = Ray.toFixed(1) + ' kN';
                rbyDisplay.innerText = Rby.toFixed(1) + ' kN';
                raxDisplay.innerText = Rax.toFixed(1) + ' kN';
                
                let eqHtml = `<b>Equilibrium Calculations:</b><br>`;
                if (state.leftSupport === 'pin') {{
                    eqHtml += `ΣMa: Rby · 10 - P · ${xp.toFixed(1)} = 0<br>` +
                              `· Rby = (${P.toFixed(0)} · ${xp.toFixed(1)}) / 10 = <b>${Rby.toFixed(1)} kN</b> (up)<br>` +
                              `ΣFy: Ray + Rby - P = 0<br>` +
                              `· Ray = ${P.toFixed(0)} - ${Rby.toFixed(1)} = <b>${Ray.toFixed(1)} kN</b> (up)<br>` +
                              `ΣFx: Rax = <b>0.0 kN</b>`;
                }} else if (state.leftSupport === 'fixed') {{
                    eqHtml += `ΣFy: Ray - P = 0  =>  Ray = <b>${Ray.toFixed(1)} kN</b> (up)<br>` +
                              `ΣMa: -Ma - P · ${xp.toFixed(1)} = 0  =>  Ma = <b>-${Ma.toFixed(1)} kN-m</b> (Clockwise)<br>` +
                              `ΣFx: Rax = <b>0.0 kN</b>`;
                }} else {{
                    eqHtml += `ΣMb: -Ray · 10 + P · ${(L - xp).toFixed(1)} = 0<br>` +
                              `· Ray = (${P.toFixed(0)} · ${(L - xp).toFixed(1)}) / 10 = <b>${Ray.toFixed(1)} kN</b> (up)<br>` +
                              `ΣFy: Ray + Rby - P = 0  =>  Rby = <b>${Rby.toFixed(1)} kN</b> (up)<br>` +
                              `ΣFx: Rbx = <b>0.0 kN</b>`;
                }}
                equationDisplay.innerHTML = eqHtml;
            }} else {{
                rayDisplay.innerText = '-';
                rbyDisplay.innerText = '-';
                raxDisplay.innerText = '-';
                if (status === 'indeterminate') {{
                    equationDisplay.innerHTML = `<b>Calculation status: Indeterminate</b><br>` +
                                                 `The number of reaction forces (${unknowns}) exceeds the 3 equations of statics.<br>` +
                                                 `*Requires compatibility of deformation (elastic deflection analysis) to solve.*`;
                }} else {{
                    equationDisplay.innerHTML = `<b>Calculation status: Unstable</b><br>` +
                                                 `The structure lacks sufficient boundary constraints and is mathematically unstable.<br>` +
                                                 `*Under load, the structure will experience rigid-body motion (slip/spin).*`;
                }}
            }}

            // Draw Beam in Plotly
            const traces = [];

            // 1. Draw horizontal beam line (thick slate gray)
            // Draw x from 0 to 10
            traces.push({{
                x: [0, 10],
                y: [0, 0],
                mode: 'lines',
                line: {{
                    color: status === 'unstable' ? '#ef4444' : (status === 'indeterminate' ? '#f59e0b' : '#475569'), 
                    width: 12
                }},
                name: 'Beam',
                hoverinfo: 'skip'
            }});

            // 2. Draw Left Support Representation
            let ly = -2.5;
            if (state.leftSupport === 'pin') {{
                // Triangle
                traces.push({{
                    x: [-0.4, 0, 0.4, -0.4],
                    y: [ly, 0, ly, ly],
                    fill: 'toself',
                    mode: 'lines',
                    line: {{color: '#3b82f6', width: 2}},
                    fillcolor: 'rgba(59, 130, 246, 0.2)',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }} else if (state.leftSupport === 'roller') {{
                // Triangle on small circles
                traces.push({{
                    x: [-0.4, 0, 0.4, -0.4],
                    y: [ly + 0.6, 0, ly + 0.6, ly + 0.6],
                    fill: 'toself',
                    mode: 'lines',
                    line: {{color: '#10b981', width: 2}},
                    fillcolor: 'rgba(16, 185, 129, 0.2)',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                // wheels
                traces.push({{
                    x: [-0.25, 0.25],
                    y: [ly + 0.3, ly + 0.3],
                    mode: 'markers',
                    marker: {{size: 6, color: '#10b981'}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }} else if (state.leftSupport === 'fixed') {{
                // Clamp wall
                traces.push({{
                    x: [-0.3, -0.3],
                    y: [-6, 6],
                    mode: 'lines',
                    line: {{color: '#475569', width: 8}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                // diagonal hatching lines
                for (let y = -5; y <= 5; y += 2.5) {{
                    traces.push({{
                        x: [-0.9, -0.3],
                        y: [y - 1, y + 1],
                        mode: 'lines',
                        line: {{color: '#94a3b8', width: 1.5}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});
                }}
            }}

            // 3. Draw Right Support Representation
            let ry = -2.5;
            if (state.rightSupport === 'pin') {{
                traces.push({{
                    x: [9.6, 10, 10.4, 9.6],
                    y: [ry, 0, ry, ry],
                    fill: 'toself',
                    mode: 'lines',
                    line: {{color: '#3b82f6', width: 2}},
                    fillcolor: 'rgba(59, 130, 246, 0.2)',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }} else if (state.rightSupport === 'roller') {{
                traces.push({{
                    x: [9.6, 10, 10.4, 9.6],
                    y: [ry + 0.6, 0, ry + 0.6, ry + 0.6],
                    fill: 'toself',
                    mode: 'lines',
                    line: {{color: '#10b981', width: 2}},
                    fillcolor: 'rgba(16, 185, 129, 0.2)',
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
                traces.push({{
                    x: [9.75, 10.25],
                    y: [ry + 0.3, ry + 0.3],
                    mode: 'markers',
                    marker: {{size: 6, color: '#10b981'}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }}

            // Annotations (Arrows for Load and Reactions)
            const annotations = [];

            // 4. Draw Point Load Arrow (Red downward)
            if (P > 0) {{
                let len = 3 + 4 * (P / 100);
                annotations.push({{
                    ax: xp, ay: len,
                    x: xp, y: 0.2,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 3,
                    arrowsize: 1,
                    arrowwidth: 3.5,
                    arrowcolor: '#ef4444',
                    text: ''
                }});

                // P load label adjacent to vector midpoint
                annotations.push({{
                    x: xp,
                    y: (len + 0.2) / 2,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: `P = ${P.toFixed(0)} kN`,
                    font: {{family: 'Outfit', size: 11, color: '#ef4444', weight: 'bold'}},
                    xshift: 35
                }});
            }}

            // 5. Draw Reaction arrows if solved
            if (solved) {{
                // Left vertical Ray (Blue arrow upward)
                if (Ray !== 0) {{
                    let r_len = 2.5 + 3.5 * (Math.abs(Ray) / 100);
                    let sign_ay = Ray > 0 ? 1 : -1;
                    annotations.push({{
                        ax: 0, ay: sign_ay < 0 ? 0.2 : -r_len,
                        x: 0, y: sign_ay < 0 ? -r_len : -0.2,
                        xref: 'x', yref: 'y',
                        axref: 'x', ayref: 'y',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 0.9,
                        arrowwidth: 3,
                        arrowcolor: '#3b82f6',
                        text: ''
                    }});

                    // Ray label adjacent to vector midpoint
                    let midY = ((sign_ay < 0 ? 0.2 : -r_len) + (sign_ay < 0 ? -r_len : -0.2)) / 2;
                    annotations.push({{
                        x: 0,
                        y: midY,
                        xref: 'x', yref: 'y',
                        showarrow: false,
                        text: `Ray = ${Ray.toFixed(1)} kN`,
                        font: {{family: 'Outfit', size: 10, color: '#3b82f6', weight: 'bold'}},
                        xshift: -32
                    }});
                }}
                // Right vertical Rby (Green arrow upward)
                if (Rby !== 0) {{
                    let r_len = 2.5 + 3.5 * (Math.abs(Rby) / 100);
                    let sign_by = Rby > 0 ? 1 : -1;
                    annotations.push({{
                        ax: 10, ay: sign_by < 0 ? 0.2 : -r_len,
                        x: 10, y: sign_by < 0 ? -r_len : -0.2,
                        xref: 'x', yref: 'y',
                        axref: 'x', ayref: 'y',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 0.9,
                        arrowwidth: 3,
                        arrowcolor: '#10b981',
                        text: ''
                    }});

                    // Rby label adjacent to vector midpoint
                    let midY = ((sign_by < 0 ? 0.2 : -r_len) + (sign_by < 0 ? -r_len : -0.2)) / 2;
                    annotations.push({{
                        x: 10,
                        y: midY,
                        xref: 'x', yref: 'y',
                        showarrow: false,
                        text: `Rby = ${Rby.toFixed(1)} kN`,
                        font: {{family: 'Outfit', size: 10, color: '#10b981', weight: 'bold'}},
                        xshift: 32
                    }});
                }}
                // Left Fixed Moment Ma (Purple curved arc)
                if (Ma !== 0) {{
                    let r_arc = 0.8 + Math.min(1.2, Math.abs(Ma) / 600);
                    
                    let num_points = 30;
                    let start_ang = -30 * Math.PI / 180;
                    let end_ang = 210 * Math.PI / 180;
                    if (Ma > 0) {{ // clockwise reaction
                        start_ang = 210 * Math.PI / 180;
                        end_ang = -30 * Math.PI / 180;
                    }}
                    
                    let arcX = [];
                    let arcY = [];
                    for (let i = 0; i <= num_points; i++) {{
                        let a = start_ang + (end_ang - start_ang) * (i / num_points);
                        arcX.push(r_arc * Math.cos(a));
                        arcY.push(r_arc * Math.sin(a));
                    }}
                    
                    traces.push({{
                        x: arcX,
                        y: arcY,
                        mode: 'lines',
                        line: {{color: '#8b5cf6', width: 3.0}},
                        showlegend: false,
                        hoverinfo: 'skip'
                    }});

                    // Tangent arrowhead for Ma
                    let end_x = r_arc * Math.cos(end_ang);
                    let end_y = r_arc * Math.sin(end_ang);
                    let dir = Ma > 0 ? -1.0 : 1.0;
                    let tx = dir * (-Math.sin(end_ang));
                    let ty = dir * Math.cos(end_ang);
                    let arrow_len = 0.45;
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
                        arrowcolor: '#8b5cf6',
                        text: ''
                    }});

                    // Ma label next to arrowhead
                    annotations.push({{
                        x: end_x,
                        y: end_y,
                        text: `Ma = ${Ma.toFixed(0)} kNm`,
                        font: {{family: 'Outfit', size: 10, color: '#8b5cf6', weight: 'bold'}},
                        showarrow: false,
                        xshift: end_x > 0 ? 35 : -35,
                        yshift: end_y > 0 ? 15 : -15
                    }});
                }}
            }}

            const layout = {{
                xaxis: {{
                    range: [-2, 12],
                    gridcolor: '#f8fafc',
                    zeroline: false,
                    fixedrange: true,
                    title: 'Beam Span (m)'
                }},
                yaxis: {{
                    range: [-8, 10],
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false,
                    scaleanchor: 'x',
                    scaleratio: 1,
                    fixedrange: true
                }},
                margin: {{l: 30, r: 30, t: 10, b: 40}},
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

def run_rigid_body_equilibrium():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #10b981; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 2 • Lesson 11</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Intro to Equilibrium of Rigid Bodies</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit2"]
    topic_name = "Lesson 11: Intro to Equilibrium of Rigid Bodies"
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
    if "vrig_phase" not in st.session_state:
        st.session_state.vrig_phase = "instructions"
    if "vrig_sliders_locked" not in st.session_state:
        st.session_state.vrig_sliders_locked = False
    if "vrig_reset_counter" not in st.session_state:
        st.session_state.vrig_reset_counter = 0
    if "vrig_answers" not in st.session_state:
        st.session_state.vrig_answers = {}

    def reset_simulator():
        st.session_state.vrig_phase = "instructions"
        st.session_state.vrig_answers = {}
        st.session_state.vrig_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vrig_phase == "poe_predict":
        st.session_state.vrig_sliders_locked = True
    else:
        st.session_state.vrig_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Support Reaction Solver")
        locked_js = "true" if st.session_state.vrig_sliders_locked else "false"
        reset_counter = st.session_state.vrig_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=600)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#10b981; font-weight:700;">{phase_titles[st.session_state.vrig_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vrig_phase == "instructions":
            st.markdown("""
            This simulator explores support conditions for a horizontal rigid beam under a point load.
            
            **Key Mechanics:**
            * Toggles Left Support (Pin, Roller, Fixed) and Right Support (Pin, Roller, Free) to see how reactions adjust.
            * Drag sliders for load **magnitude P** and **position x_P** along the span.
            * Classifications:
              * **Statically Determinate**: Beam is stable, reactions solved exactly using 3 statics equations.
              * **Statically Indeterminate**: More reactions than statics equations. Need deformation compatibility.
              * **Unstable**: Insufficient restraint; beam will slide or spin under load.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vrig_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vrig_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            Configure the simulator to:
            * **Left Support**: `Fixed`
            * **Right Support**: `Free` (Cantilever beam)
            * **Point Load P**: `80 kN`
            * **Position x_P**: `5.0 m` (mid-span)
            
            Observe the left reaction moment $M_A$ and forces.
            
            **Question:**
            What is the left vertical reaction force $R_{Ay}$ and the reaction moment $M_A$?
            """)
            
            ans = st.radio(
                "Select the correct reactions:",
                options=[
                    "Ray = 80.0 kN (up), Ma = -400.0 kN-m (Clockwise)",
                    "Ray = 40.0 kN (up), Ma = 0.0 kN-m (simply supported)",
                    "Ray = 80.0 kN (up), Ma = +400.0 kN-m (Counterclockwise)",
                    "Ray = 80.0 kN (up), Ma = -800.0 kN-m (Clockwise)"
                ],
                key="vrig_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "Ray = 80.0 kN (up), Ma = -400" in ans:
                    st.success(r"Correct! Since the right end is free, the left fixed support carries the entire vertical load: $R_{Ay} = 80\text{ kN}$ (up). Summing moments about A: $-M_A - P \cdot x_P = 0 \implies M_A = -P \cdot x_P = -80 \cdot 5 = -400\text{ kN-m}$ (clockwise).")
                else:
                    st.error(r"Incorrect. Let's write equilibrium: $\sum F_y = R_{Ay} - 80 = 0 \implies R_{Ay} = 80\text{ kN}$ (up). $\sum M_A = -M_A - 80 \cdot 5 = 0 \implies M_A = -400\text{ kN-m}$ (clockwise).")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vrig_phase = "poe_predict"
                st.session_state.vrig_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vrig_phase == "poe_predict":
            st.markdown("""
            **Predict Phase (Beam Controls Locked!):**
            
            **Scenario:**
            * **Left Support**: `Pin` (at $x=0$)
            * **Right Support**: `Roller` (at $x=10$)
            * **Load Magnitude, P**: `60 kN`
            * **Position, x_P**: `2.5 m` (one-quarter span from left Pin)
            
            **Question:**
            1. Predict the determinacy classification of the beam.
            2. Calculate the vertical reaction forces $R_{Ay}$ and $R_{By}$.
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Determinate; Ray = 45.0 kN (up), Rby = 15.0 kN (up).",
                    "Determinate; Ray = 30.0 kN (up), Rby = 30.0 kN (up).",
                    "Indeterminate; reactions cannot be solved using statics alone.",
                    "Unstable; beam will spin around left Pin."
                ],
                key="vrig_poe_p_radio"
            )
            st.session_state.vrig_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vrig_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vrig_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set Left Support to `Pin` and Right Support to `Roller`.
            2. Set Load to `60 kN` and Position $x_P$ to `2.5 m`.
            3. Observe the determinacy banner and the solved vertical reaction values in the sandbox.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vrig_answers.get("poe", "Determinate; Ray = 45.0 kN (up), Rby = 15.0 kN (up).")
            options_list = [
                "Determinate; Ray = 45.0 kN (up), Rby = 15.0 kN (up).",
                "Determinate; Ray = 30.0 kN (up), Rby = 30.0 kN (up).",
                "Indeterminate; reactions cannot be solved using statics alone.",
                "Unstable; beam will spin around left Pin."
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vrig_poe_o_radio"
            )
            st.session_state.vrig_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vrig_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vrig_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vrig_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vrig_answers.get("poe") == "Determinate; Ray = 45.0 kN (up), Rby = 15.0 kN (up).":
                st.success("🎉 **Correct!** Excellent calculations.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the equilibrium derivations below.")

            st.markdown(r"""
            ### Explanation:
            1. **Determinacy**:
               * A Pin support has 2 reactions ($R_{Ax}, R_{Ay}$). A Roller has 1 reaction ($R_{By}$). Total reactions = 3.
               * Since we have 3 equations of equilibrium in 2D ($\sum F_x = 0$, $\sum F_y = 0$, $\sum M_O = 0$), we have $3 - 3 = 0$ redundant reactions. The system is **statically determinate**.
            2. **Moments about A**:
               * $\sum M_A = 0 \implies R_{By} \cdot 10 - P \cdot 2.5 = 0$
               * $10 R_{By} = 60 \cdot 2.5 = 150 \implies R_{By} = 15\text{ kN}$ (upward).
            3. **Vertical Equilibrium**:
               * $\sum F_y = 0 \implies R_{Ay} + R_{By} - P = 0$
               * $R_{Ay} + 15 - 60 = 0 \implies R_{Ay} = 45\text{ kN}$ (upward).
               * Note that since the load is closer to support A ($2.5\text{ m}$ vs $7.5\text{ m}$), support A carries three-quarters of the load ($45\text{ kN}$), while support B carries only one-quarter ($15\text{ kN}$).
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

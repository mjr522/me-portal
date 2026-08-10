import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Vector Addition
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
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
            margin-top: 10px;
        }}
        .control-box {{
            background: rgba(255,255,255,0.85);
            border: 1px solid rgba(128, 128, 128, 0.15);
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
            transition: all 0.2s;
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
        
        #fA-slider::-webkit-slider-thumb {{ background: #3b82f6; }}
        #thetaA-slider::-webkit-slider-thumb {{ background: #3b82f6; }}
        #fB-slider::-webkit-slider-thumb {{ background: #10b981; }}
        #thetaB-slider::-webkit-slider-thumb {{ background: #10b981; }}
        #fC-slider::-webkit-slider-thumb {{ background: #8b5cf6; }}
        #thetaC-slider::-webkit-slider-thumb {{ background: #8b5cf6; }}
        #fD-slider::-webkit-slider-thumb {{ background: #f59e0b; }}
        #thetaD-slider::-webkit-slider-thumb {{ background: #f59e0b; }}
        #fE-slider::-webkit-slider-thumb {{ background: #ec4899; }}
        #thetaE-slider::-webkit-slider-thumb {{ background: #ec4899; }}
        
        .equation-box {{
            background: #f1f5f9;
            border-radius: 8px;
            padding: 8px 12px;
            font-family: monospace;
            font-size: 0.85rem;
            margin-top: 10px;
            color: #1e293b;
            border-left: 4px solid #ef4444;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
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
        <span><b>Vector controls are currently locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 350px;"></div>

    <!-- Operation Row (Add, Remove, Reset) -->
    <div style="margin-top: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.15);">
        <span style="font-size:0.85rem; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Active Forces:</span>
        <div class="toggle-group" style="margin-top:0; gap:8px;">
            <button class="toggle-btn" id="btn-add-vector" style="font-weight:600;">➕ Add Force</button>
            <button class="toggle-btn" id="btn-remove-vector" style="font-weight:600;">➖ Remove Force</button>
            <button class="toggle-btn" id="btn-reset-vectors" style="font-weight:600;">🔄 Reset to 2</button>
        </div>
    </div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Vector A (Blue) -->
        <div class="control-box" id="box-a" style="border-left: 4px solid #3b82f6;">
            <div class="control-title" style="color: #3b82f6;">Vector A (Force A)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Magnitude, F_A</span>
                    <span class="slider-value" id="fA-val-display" style="color: #3b82f6;">80.0 N</span>
                </div>
                <input type="range" id="fA-slider" min="0" max="100" step="1" value="80" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ_A</span>
                    <span class="slider-value" id="thetaA-val-display" style="color: #3b82f6;">30.0°</span>
                </div>
                <input type="range" id="thetaA-slider" min="0" max="360" step="1" value="30" class="custom-slider">
            </div>
        </div>

        <!-- Vector B (Green) -->
        <div class="control-box" id="box-b" style="border-left: 4px solid #10b981;">
            <div class="control-title" style="color: #10b981;">Vector B (Force B)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Magnitude, F_B</span>
                    <span class="slider-value" id="fB-val-display" style="color: #10b981;">60.0 N</span>
                </div>
                <input type="range" id="fB-slider" min="0" max="100" step="1" value="60" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ_B</span>
                    <span class="slider-value" id="thetaB-val-display" style="color: #10b981;">150.0°</span>
                </div>
                <input type="range" id="thetaB-slider" min="0" max="360" step="1" value="150" class="custom-slider">
            </div>
        </div>

        <!-- Vector C (Purple) -->
        <div class="control-box" id="box-c" style="border-left: 4px solid #8b5cf6; display: none;">
            <div class="control-title" style="color: #8b5cf6;">Vector C (Force C)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Magnitude, F_C</span>
                    <span class="slider-value" id="fC-val-display" style="color: #8b5cf6;">50.0 N</span>
                </div>
                <input type="range" id="fC-slider" min="0" max="100" step="1" value="50" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ_C</span>
                    <span class="slider-value" id="thetaC-val-display" style="color: #8b5cf6;">60.0°</span>
                </div>
                <input type="range" id="thetaC-slider" min="0" max="360" step="1" value="60" class="custom-slider">
            </div>
        </div>

        <!-- Vector D (Orange) -->
        <div class="control-box" id="box-d" style="border-left: 4px solid #f59e0b; display: none;">
            <div class="control-title" style="color: #f59e0b;">Vector D (Force D)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Magnitude, F_D</span>
                    <span class="slider-value" id="fD-val-display" style="color: #f59e0b;">40.0 N</span>
                </div>
                <input type="range" id="fD-slider" min="0" max="100" step="1" value="40" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ_D</span>
                    <span class="slider-value" id="thetaD-val-display" style="color: #f59e0b;">270.0°</span>
                </div>
                <input type="range" id="thetaD-slider" min="0" max="360" step="1" value="270" class="custom-slider">
            </div>
        </div>

        <!-- Vector E (Pink) -->
        <div class="control-box" id="box-e" style="border-left: 4px solid #ec4899; display: none;">
            <div class="control-title" style="color: #ec4899;">Vector E (Force E)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Magnitude, F_E</span>
                    <span class="slider-value" id="fE-val-display" style="color: #ec4899;">30.0 N</span>
                </div>
                <input type="range" id="fE-slider" min="0" max="100" step="1" value="30" class="custom-slider">
            </div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Angle, θ_E</span>
                    <span class="slider-value" id="thetaE-val-display" style="color: #ec4899;">315.0°</span>
                </div>
                <input type="range" id="thetaE-slider" min="0" max="360" step="1" value="315" class="custom-slider">
            </div>
        </div>
    </div>

    <!-- Layout & Addition Rule toggles -->
    <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px; border-radius: 12px; border: 1px solid rgba(128,128,128,0.15);">
        <span style="font-size:0.85rem; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Visualization Options:</span>
        <div class="toggle-group" style="margin-top:0;">
            <button class="toggle-btn active" id="toggle-tiptotail">Tip-to-Tail Rule</button>
            <button class="toggle-btn" id="toggle-components">Show Projections</button>
        </div>
    </div>

    <!-- Live Equation Output -->
    <div class="equation-box" id="equation-display">
        <!-- Will be filled dynamically by updatePlot() -->
    </div>

    <script>
        // Setup variables
        const isLocked = {locked_js};
        const resetCounter = {reset_counter};

        // DOM elements
        const fASlider = document.getElementById('fA-slider');
        const thetaASlider = document.getElementById('thetaA-slider');
        const fBSlider = document.getElementById('fB-slider');
        const thetaBSlider = document.getElementById('thetaB-slider');
        const fCSlider = document.getElementById('fC-slider');
        const thetaCSlider = document.getElementById('thetaC-slider');
        const fDSlider = document.getElementById('fD-slider');
        const thetaDSlider = document.getElementById('thetaD-slider');
        const fESlider = document.getElementById('fE-slider');
        const thetaESlider = document.getElementById('thetaE-slider');

        const boxC = document.getElementById('box-c');
        const boxD = document.getElementById('box-d');
        const boxE = document.getElementById('box-e');

        const btnAdd = document.getElementById('btn-add-vector');
        const btnRemove = document.getElementById('btn-remove-vector');
        const btnResetVec = document.getElementById('btn-reset-vectors');

        const equationDisplay = document.getElementById('equation-display');
        const lockBanner = document.getElementById('lock-banner');

        const btnTipToTail = document.getElementById('toggle-tiptotail');
        const btnComponents = document.getElementById('toggle-components');

        // State
        let state = {{
            numVectors: 2,
            fA: 80,
            thetaA: 30,
            fB: 60,
            thetaB: 150,
            fC: 50,
            thetaC: 60,
            fD: 40,
            thetaD: 270,
            fE: 30,
            thetaE: 315,
            showTipToTail: true,
            showComponents: false
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vadd_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.numVectors = parseInt(sessionStorage.getItem('vadd_numVectors') || '2');
            state.fA = parseFloat(sessionStorage.getItem('vadd_fA') || '80');
            state.thetaA = parseFloat(sessionStorage.getItem('vadd_thetaA') || '30');
            state.fB = parseFloat(sessionStorage.getItem('vadd_fB') || '60');
            state.thetaB = parseFloat(sessionStorage.getItem('vadd_thetaB') || '150');
            state.fC = parseFloat(sessionStorage.getItem('vadd_fC') || '50');
            state.thetaC = parseFloat(sessionStorage.getItem('vadd_thetaC') || '60');
            state.fD = parseFloat(sessionStorage.getItem('vadd_fD') || '40');
            state.thetaD = parseFloat(sessionStorage.getItem('vadd_thetaD') || '270');
            state.fE = parseFloat(sessionStorage.getItem('vadd_fE') || '30');
            state.thetaE = parseFloat(sessionStorage.getItem('vadd_thetaE') || '315');
            state.showTipToTail = sessionStorage.getItem('vadd_showTipToTail') === 'true';
            state.showComponents = sessionStorage.getItem('vadd_showComponents') === 'true';
        }} else {{
            sessionStorage.setItem('vadd_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vadd_numVectors', state.numVectors);
            sessionStorage.setItem('vadd_fA', state.fA);
            sessionStorage.setItem('vadd_thetaA', state.thetaA);
            sessionStorage.setItem('vadd_fB', state.fB);
            sessionStorage.setItem('vadd_thetaB', state.thetaB);
            sessionStorage.setItem('vadd_fC', state.fC);
            sessionStorage.setItem('vadd_thetaC', state.thetaC);
            sessionStorage.setItem('vadd_fD', state.fD);
            sessionStorage.setItem('vadd_thetaD', state.thetaD);
            sessionStorage.setItem('vadd_fE', state.fE);
            sessionStorage.setItem('vadd_thetaE', state.thetaE);
            sessionStorage.setItem('vadd_showTipToTail', state.showTipToTail ? 'true' : 'false');
            sessionStorage.setItem('vadd_showComponents', state.showComponents ? 'true' : 'false');
        }}

        // Handle locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            fASlider.disabled = true;
            thetaASlider.disabled = true;
            fBSlider.disabled = true;
            thetaBSlider.disabled = true;
            fCSlider.disabled = true;
            thetaCSlider.disabled = true;
            fDSlider.disabled = true;
            thetaDSlider.disabled = true;
            fESlider.disabled = true;
            thetaESlider.disabled = true;
            btnTipToTail.disabled = true;
            btnComponents.disabled = true;
            btnAdd.disabled = true;
            btnRemove.disabled = true;
            btnResetVec.disabled = true;
        }}

        // Setup Toggles
        btnTipToTail.addEventListener('click', () => {{
            if (isLocked) return;
            state.showTipToTail = !state.showTipToTail;
            if (state.showTipToTail) btnTipToTail.classList.add('active');
            else btnTipToTail.classList.remove('active');
            saveState();
            updatePlot();
        }});

        btnComponents.addEventListener('click', () => {{
            if (isLocked) return;
            state.showComponents = !state.showComponents;
            if (state.showComponents) btnComponents.classList.add('active');
            else btnComponents.classList.remove('active');
            saveState();
            updatePlot();
        }});

        // Dynamic Add/Remove Vector logic
        btnAdd.addEventListener('click', () => {{
            if (isLocked) return;
            if (state.numVectors < 5) {{
                state.numVectors++;
                saveState();
                syncUI();
                updatePlot();
            }}
        }});

        btnRemove.addEventListener('click', () => {{
            if (isLocked) return;
            if (state.numVectors > 2) {{
                state.numVectors--;
                saveState();
                syncUI();
                updatePlot();
            }}
        }});

        btnResetVec.addEventListener('click', () => {{
            if (isLocked) return;
            state.numVectors = 2;
            state.fA = 80; state.thetaA = 30;
            state.fB = 60; state.thetaB = 150;
            state.fC = 50; state.thetaC = 60;
            state.fD = 40; state.thetaD = 270;
            state.fE = 30; state.thetaE = 315;
            saveState();
            syncUI();
            updatePlot();
        }});

        // Input Listeners
        fASlider.addEventListener('input', (e) => {{
            state.fA = parseFloat(e.target.value);
            document.getElementById('fA-val-display').innerText = state.fA.toFixed(1) + ' N';
            saveState();
            updatePlot();
        }});
        thetaASlider.addEventListener('input', (e) => {{
            state.thetaA = parseFloat(e.target.value);
            document.getElementById('thetaA-val-display').innerText = state.thetaA.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});

        fBSlider.addEventListener('input', (e) => {{
            state.fB = parseFloat(e.target.value);
            document.getElementById('fB-val-display').innerText = state.fB.toFixed(1) + ' N';
            saveState();
            updatePlot();
        }});
        thetaBSlider.addEventListener('input', (e) => {{
            state.thetaB = parseFloat(e.target.value);
            document.getElementById('thetaB-val-display').innerText = state.thetaB.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});

        fCSlider.addEventListener('input', (e) => {{
            state.fC = parseFloat(e.target.value);
            document.getElementById('fC-val-display').innerText = state.fC.toFixed(1) + ' N';
            saveState();
            updatePlot();
        }});
        thetaCSlider.addEventListener('input', (e) => {{
            state.thetaC = parseFloat(e.target.value);
            document.getElementById('thetaC-val-display').innerText = state.thetaC.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});

        fDSlider.addEventListener('input', (e) => {{
            state.fD = parseFloat(e.target.value);
            document.getElementById('fD-val-display').innerText = state.fD.toFixed(1) + ' N';
            saveState();
            updatePlot();
        }});
        thetaDSlider.addEventListener('input', (e) => {{
            state.thetaD = parseFloat(e.target.value);
            document.getElementById('thetaD-val-display').innerText = state.thetaD.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});

        fESlider.addEventListener('input', (e) => {{
            state.fE = parseFloat(e.target.value);
            document.getElementById('fE-val-display').innerText = state.fE.toFixed(1) + ' N';
            saveState();
            updatePlot();
        }});
        thetaESlider.addEventListener('input', (e) => {{
            state.thetaE = parseFloat(e.target.value);
            document.getElementById('thetaE-val-display').innerText = state.thetaE.toFixed(1) + '°';
            saveState();
            updatePlot();
        }});

        // Sync UI
        function syncUI() {{
            fASlider.value = state.fA;
            document.getElementById('fA-val-display').innerText = state.fA.toFixed(1) + ' N';
            thetaASlider.value = state.thetaA;
            document.getElementById('thetaA-val-display').innerText = state.thetaA.toFixed(1) + '°';

            fBSlider.value = state.fB;
            document.getElementById('fB-val-display').innerText = state.fB.toFixed(1) + ' N';
            thetaBSlider.value = state.thetaB;
            document.getElementById('thetaB-val-display').innerText = state.thetaB.toFixed(1) + '°';

            fCSlider.value = state.fC;
            document.getElementById('fC-val-display').innerText = state.fC.toFixed(1) + ' N';
            thetaCSlider.value = state.thetaC;
            document.getElementById('thetaC-val-display').innerText = state.thetaC.toFixed(1) + '°';

            fDSlider.value = state.fD;
            document.getElementById('fD-val-display').innerText = state.fD.toFixed(1) + ' N';
            thetaDSlider.value = state.thetaD;
            document.getElementById('thetaD-val-display').innerText = state.thetaD.toFixed(1) + '°';

            fESlider.value = state.fE;
            document.getElementById('fE-val-display').innerText = state.fE.toFixed(1) + ' N';
            thetaESlider.value = state.thetaE;
            document.getElementById('thetaE-val-display').innerText = state.thetaE.toFixed(1) + '°';

            if (state.showTipToTail) btnTipToTail.classList.add('active');
            else btnTipToTail.classList.remove('active');

            if (state.showComponents) btnComponents.classList.add('active');
            else btnComponents.classList.remove('active');

            // Toggle active boxes visibility
            boxC.style.display = state.numVectors >= 3 ? 'block' : 'none';
            boxD.style.display = state.numVectors >= 4 ? 'block' : 'none';
            boxE.style.display = state.numVectors >= 5 ? 'block' : 'none';

            // Disable / Enable buttons at boundaries
            if (!isLocked) {{
                btnAdd.disabled = state.numVectors >= 5;
                btnRemove.disabled = state.numVectors <= 2;
            }}
        }}

        function updatePlot() {{
            // Construct active vectors list
            const activeVectors = [
                {{ id: 'A', name: 'Vector A', f: state.fA, theta: state.thetaA, color: '#3b82f6' }},
                {{ id: 'B', name: 'Vector B', f: state.fB, theta: state.thetaB, color: '#10b981' }}
            ];
            if (state.numVectors >= 3) activeVectors.push({{ id: 'C', name: 'Vector C', f: state.fC, theta: state.thetaC, color: '#8b5cf6' }});
            if (state.numVectors >= 4) activeVectors.push({{ id: 'D', name: 'Vector D', f: state.fD, theta: state.thetaD, color: '#f59e0b' }});
            if (state.numVectors >= 5) activeVectors.push({{ id: 'E', name: 'Vector E', f: state.fE, theta: state.thetaE, color: '#ec4899' }});

            let Rx = 0;
            let Ry = 0;
            const vectorComponents = [];

            // Calculate components
            for (let v of activeVectors) {{
                let rad = v.theta * Math.PI / 180;
                let vx = v.f * Math.cos(rad);
                let vy = v.f * Math.sin(rad);
                Rx += vx;
                Ry += vy;
                vectorComponents.push({{ ...v, vx, vy }});
            }}

            let R_mag = Math.sqrt(Rx*Rx + Ry*Ry);
            
            // Resultant angle
            let thetaR_rad = Math.atan2(Ry, Rx);
            let thetaR_deg = thetaR_rad * 180 / Math.PI;
            if (thetaR_deg < 0) thetaR_deg += 360;

            let quad = 'Q1';
            if (Rx < 0 && Ry >= 0) quad = 'Q2';
            else if (Rx < 0 && Ry < 0) quad = 'Q3';
            else if (Rx >= 0 && Ry < 0) quad = 'Q4';

            // Display math formulas dynamic list
            let htmlComponents = '';
            for (let vc of vectorComponents) {{
                htmlComponents += `
                    <div>
                        <b>${vc.name} Components:</b><br>
                        ${vc.id}x = ${vc.f.toFixed(1)} * cos(${vc.theta.toFixed(0)}°) = ${vc.vx.toFixed(2)} N<br>
                        ${vc.id}y = ${vc.f.toFixed(1)} * sin(${vc.theta.toFixed(0)}°) = ${vc.vy.toFixed(2)} N
                    </div>
                `;
            }}

            // Equation grid template columns
            equationDisplay.style.gridTemplateColumns = state.numVectors > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';
            equationDisplay.innerHTML = htmlComponents + `
                <div style="grid-column: 1 / -1; border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 4px;">
                    <b>Resultant Vector R = ${activeVectors.map(v => v.id).join(' + ')}:</b><br>
                    Rx = ${vectorComponents.map(v => v.id + 'x').join(' + ')} = ${Rx.toFixed(2)} N | Ry = ${vectorComponents.map(v => v.id + 'y').join(' + ')} = ${Ry.toFixed(2)} N<br>
                    R_mag = √(Rx² + Ry²) = ${R_mag.toFixed(2)} N | θ_R = ${thetaR_deg.toFixed(1)}° (${quad})
                </div>
            `;

            // Prepare plot data
            const traces = [];

            // Add projection lines if enabled
            if (state.showComponents) {{
                for (let vc of vectorComponents) {{
                    traces.push({{
                        x: [vc.vx, vc.vx, 0],
                        y: [0, vc.vy, vc.vy],
                        mode: 'lines+markers',
                        line: {{color: vc.color, width: 1.5, dash: 'dash'}},
                        marker: {{size: 4, color: vc.color}},
                        hoverinfo: 'skip'
                    }});
                }}
                // R components (dashed red)
                traces.push({{
                    x: [Rx, Rx, 0],
                    y: [0, Ry, Ry],
                    mode: 'lines+markers',
                    line: {{color: 'rgba(239, 68, 68, 0.4)', width: 2, dash: 'dot'}},
                    marker: {{size: 4, color: 'rgba(239, 68, 68, 0.4)'}},
                    hoverinfo: 'skip'
                }});
            }}

            // Calculate auto plot scaling bounds
            let maxCoord = 150;
            let allPoints = [0, Rx, Ry];
            let tempCumulX = 0, tempCumulY = 0;
            for (let vc of vectorComponents) {{
                allPoints.push(vc.vx, vc.vy);
                tempCumulX += vc.vx;
                tempCumulY += vc.vy;
                allPoints.push(tempCumulX, tempCumulY);
            }}
            let maxAbsVal = Math.max(...allPoints.map(Math.abs));
            if (maxAbsVal > 140) {{
                maxCoord = Math.ceil((maxAbsVal + 20) / 50) * 50;
            }}

            // If Tip-to-Tail is enabled, draw stacked dashed lines
            let cumulX = 0;
            let cumulY = 0;
            if (state.showTipToTail) {{
                for (let i = 0; i < vectorComponents.length; i++) {{
                    let vc = vectorComponents[i];
                    let nextX = cumulX + vc.vx;
                    let nextY = cumulY + vc.vy;
                    if (i > 0) {{
                        traces.push({{
                            x: [cumulX, nextX],
                            y: [cumulY, nextY],
                            mode: 'lines',
                            line: {{color: vc.color, width: 3, dash: 'dash'}},
                            hoverinfo: 'skip'
                        }});
                    }}
                    cumulX = nextX;
                    cumulY = nextY;
                }}
            }}

            // Annotations (actual arrows and labels)
            const annotations = [];

            // 1. Draw base vectors at origin
            for (let vc of vectorComponents) {{
                annotations.push({{
                    ax: 0, ay: 0,
                    x: vc.vx, y: vc.vy,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 3,
                    arrowsize: 1.2,
                    arrowwidth: 4,
                    arrowcolor: vc.color,
                    text: ''
                }});
                annotations.push({{
                    x: vc.vx, y: vc.vy,
                    xref: 'x', yref: 'y',
                    showarrow: false,
                    text: vc.id,
                    font: {{family: 'Outfit', size: 14, color: vc.color, weight: 'bold'}},
                    xshift: vc.vx > 0 ? 12 : -12,
                    yshift: vc.vy > 0 ? 12 : -12
                }});
            }}

            // 2. Draw stacked vectors if Tip-to-Tail is enabled
            if (state.showTipToTail) {{
                cumulX = 0;
                cumulY = 0;
                for (let i = 0; i < vectorComponents.length; i++) {{
                    let vc = vectorComponents[i];
                    let nextX = cumulX + vc.vx;
                    let nextY = cumulY + vc.vy;
                    if (i > 0) {{
                        annotations.push({{
                            ax: cumulX, ay: cumulY,
                            x: nextX, y: nextY,
                            xref: 'x', yref: 'y',
                            axref: 'x', ayref: 'y',
                            showarrow: true,
                            arrowhead: 2,
                            arrowsize: 1,
                            arrowwidth: 3,
                            arrowcolor: vc.color,
                            text: ''
                        }});
                        annotations.push({{
                            x: nextX, y: nextY,
                            xref: 'x', yref: 'y',
                            showarrow: false,
                            text: vc.id + "'",
                            font: {{family: 'Outfit', size: 12, color: vc.color, weight: 'bold'}},
                            xshift: vc.vx > 0 ? 12 : -12,
                            yshift: vc.vy > 0 ? 12 : -12
                        }});
                    }}
                    cumulX = nextX;
                    cumulY = nextY;
                }}
            }}

            // 3. Draw Resultant Vector R
            annotations.push({{
                ax: 0, ay: 0,
                x: Rx, y: Ry,
                xref: 'x', yref: 'y',
                axref: 'x', ayref: 'y',
                showarrow: true,
                arrowhead: 3,
                arrowsize: 1.2,
                arrowwidth: 5,
                arrowcolor: '#ef4444',
                text: ''
            }});
            annotations.push({{
                x: Rx, y: Ry,
                xref: 'x', yref: 'y',
                showarrow: false,
                text: 'R',
                font: {{family: 'Outfit', size: 16, color: '#ef4444', weight: 'bold'}},
                xshift: Rx > 0 ? 17 : -17,
                yshift: Ry > 0 ? 17 : -17
            }});

            const layout = {{
                xaxis: {{
                    range: [-maxCoord, maxCoord],
                    zeroline: true,
                    zerolinecolor: '#64748b',
                    zerolinewidth: 2,
                    gridcolor: '#f1f5f9',
                    fixedrange: true,
                    title: 'X Force Component (N)'
                }},
                yaxis: {{
                    range: [-maxCoord, maxCoord],
                    zeroline: true,
                    zerolinecolor: '#64748b',
                    zerolinewidth: 2,
                    gridcolor: '#f1f5f9',
                    fixedrange: true,
                    scaleanchor: 'x',
                    scaleratio: 1,
                    title: 'Y Force Component (N)'
                }},
                margin: {{l: 50, r: 20, t: 20, b: 50}},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                annotations: annotations
            }};

            Plotly.react('plotly-chart', traces, layout);
        }

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_vector_addition():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #3b82f6; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 1 • Lesson 3</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Statics of Particles: Adding Forces</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit1"]
    topic_name = "Lesson 3: Statics of Particles: Adding Forces"
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
    if "vadd_phase" not in st.session_state:
        st.session_state.vadd_phase = "instructions"
    if "vadd_sliders_locked" not in st.session_state:
        st.session_state.vadd_sliders_locked = False
    if "vadd_reset_counter" not in st.session_state:
        st.session_state.vadd_reset_counter = 0
    if "vadd_answers" not in st.session_state:
        st.session_state.vadd_answers = {}

    def reset_simulator():
        st.session_state.vadd_phase = "instructions"
        st.session_state.vadd_answers = {}
        st.session_state.vadd_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vadd_phase == "poe_predict":
        st.session_state.vadd_sliders_locked = True
    else:
        st.session_state.vadd_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Resultant Vector Sandbox")
        locked_js = "true" if st.session_state.vadd_sliders_locked else "false"
        reset_counter = st.session_state.vadd_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=720)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#3b82f6; font-weight:700;">{phase_titles[st.session_state.vadd_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vadd_phase == "instructions":
            st.markdown(r"""
            This widget demonstrates vector addition of multiple forces:
            
            $$\vec{R} = \vec{A} + \vec{B} + \dots$$
            
            **Key Features:**
            * Drag sliders for magnitude and direction of the forces.
            * Use **Add Force** / **Remove Force** to dynamically scale up to 5 vectors.
            * Toggle **Tip-to-Tail Rule** to see vector addition geometrically.
            * Toggle **Show Projections** to see the components ($A_x, A_y$, etc.).
            * Observe how components add algebraically:
              $$R_x = \sum F_x \quad \text{and} \quad R_y = \sum F_y$$
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vadd_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vadd_phase == "guided_question":
            st.markdown(r"""
            **Guided Scenario:**
            Adjust the sliders to set:
            * **Vector A**: $F_A = 70.0\text{ N}$ at $\theta_A = 45^\circ$
            * **Vector B**: $F_B = 70.0\text{ N}$ at $\theta_B = 135^\circ$
            
            *Tip: Enabling 'Tip-to-Tail' will show Vector B stacking on the end of Vector A.*
            
            **Question:**
            What is the magnitude and direction of the resultant force $R$?
            """)
            
            ans = st.radio(
                "Resultant Force R:",
                options=[
                    "R = 140.0 N at 90.0° (points straight up)",
                    "R = 98.99 N at 90.0° (points straight up)",
                    "R = 0.0 N (forces cancel out)",
                    "R = 98.99 N at 0.0° (points straight right)"
                ],
                key="vadd_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "98.99 N at 90.0°" in ans:
                    st.success(r"Correct! The horizontal components are equal and opposite ($A_x = 70 \cos(45^\circ) = 49.5\text{ N}$ and $B_x = 70 \cos(135^\circ) = -49.5\text{ N}$), so they cancel out ($R_x = 0$). The vertical components are identical ($A_y = B_y = 49.5\text{ N}$), adding up to $R_y = 99.0\text{ N}$ straight up.")
                else:
                    st.error(r"Incorrect. Calculate the components: $A_x = 70 \cos(45^\circ) = 49.5$, $B_x = -49.5$, so they sum to 0. The vertical components $70 \sin(45^\circ) = 49.5$ add together to yield $99.0\text{ N}$ vertically.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vadd_phase = "poe_predict"
                st.session_state.vadd_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vadd_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Vector Controls Locked!):**
            
            **Scenario:**
            * **Vector A**: $F_A = 80.0\text{ N}$ at $\theta_A = 30^\circ$ (Quadrant 1)
            * **Vector B**: $F_B = 60.0\text{ N}$ at $\theta_B = 150^\circ$ (Quadrant 2)
            
            **Question:**
            Without unlocking the controls, predict which quadrant the resultant force $R$ will lie in, and whether its horizontal component $R_x$ is positive or negative.
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Quadrant 1, Rx is positive (+)",
                    "Quadrant 2, Rx is negative (-)",
                    "Quadrant 1, Rx is negative (-)",
                    "Quadrant 2, Rx is positive (+)"
                ],
                key="vadd_poe_p_radio"
            )
            st.session_state.vadd_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vadd_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vadd_phase == "poe_observe":
            st.markdown(r"""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set **Vector A** to $80\text{ N}$ and $30^\circ$.
            2. Set **Vector B** to $60\text{ N}$ and $150^\circ$.
            3. Observe the resultant vector red arrow $R$.
            
            *Modify your answer below if your prediction was disproved!*
            """)
            
            val_init = st.session_state.vadd_answers.get("poe", "Quadrant 1, Rx is positive (+)")
            options_list = [
                "Quadrant 1, Rx is positive (+)",
                "Quadrant 2, Rx is negative (-)",
                "Quadrant 1, Rx is negative (-)",
                "Quadrant 2, Rx is positive (+)"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vadd_poe_o_radio"
            )
            st.session_state.vadd_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vadd_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vadd_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vadd_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vadd_answers.get("poe") == "Quadrant 1, Rx is positive (+)":
                st.success("🎉 **Correct!** Great physical intuition.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the components explanation below.")

            st.markdown(r"""
            ### Explanation:
            1. **Horizontal Components**:
               * $A_x = 80 \cos(30^\circ) = +69.3\text{ N}$ (points right)
               * $B_x = 60 \cos(150^\circ) = -52.0\text{ N}$ (points left)
               * $R_x = 69.3 - 52.0 = +17.3\text{ N}$ (net force is to the right, positive)
            2. **Vertical Components**:
               * $A_y = 80 \sin(30^\circ) = +40.0\text{ N}$ (points up)
               * $B_y = 60 \sin(150^\circ) = +30.0\text{ N}$ (points up)
               * $R_y = 40.0 + 30.0 = +70.0\text{ N}$ (points up, positive)
            3. **Resultant**:
               * Since both $R_x > 0$ and $R_y > 0$, the resultant vector must lie in **Quadrant 1** ($R = 72.1\text{ N}$ at $76.1^\circ$).
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

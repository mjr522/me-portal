import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Truss Sections Sandbox
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
            margin-top: 4px;
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
            color: #8b5cf6;
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
        <span><b>Truss controls are locked!</b> Answer the Prediction challenge in the sidecar to unlock.</span>
    </div>

    <!-- Plotly Canvas -->
    <div id="plotly-chart" style="width: 100%; height: 300px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Load Magnitude -->
        <div class="control-box">
            <div class="control-title">1. Crate Load (P)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Load Magnitude, P</span>
                    <span class="slider-value" id="p-val-display">80 kN</span>
                </div>
                <input type="range" id="p-slider" min="10" max="100" step="10" value="80" class="custom-slider">
            </div>
            <div style="font-size:0.8rem; color:#64748b;">
                *Load is vertically downward at bottom center Node D.
            </div>
        </div>

        <!-- Cutting Plane and Side Selection -->
        <div class="control-box">
            <div class="control-title">2. Method of Sections Options</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Cut Position</span>
                    <span class="slider-value" id="cut-display">Section 2 (Center-Right)</span>
                </div>
                <input type="range" id="cut-slider" min="1" max="2" step="1" value="2" class="custom-slider">
            </div>
            <div class="btn-group">
                <button class="btn-choice active" id="side-left">Analyze Left Section</button>
                <button class="btn-choice" id="side-right">Analyze Right Section</button>
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

        // DOM elements
        const pSlider = document.getElementById('p-slider');
        const cutSlider = document.getElementById('cut-slider');
        const lockBanner = document.getElementById('lock-banner');
        const equationDisplay = document.getElementById('equation-display');

        const btnLeft = document.getElementById('side-left');
        const btnRight = document.getElementById('side-right');

        // State variables
        let state = {{
            P: 80,
            cutPos: 2, // 1: cuts AE, ED, AD; 2: cuts EB, BD, DC
            side: 'left' // 'left' or 'right'
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vsec_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.P = parseFloat(sessionStorage.getItem('vsec_P') || '80');
            state.cutPos = parseInt(sessionStorage.getItem('vsec_cutPos') || '2');
            state.side = sessionStorage.getItem('vsec_side') || 'left';
        }} else {{
            sessionStorage.setItem('vsec_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vsec_P', state.P);
            sessionStorage.setItem('vsec_cutPos', state.cutPos);
            sessionStorage.setItem('vsec_side', state.side);
        }}

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            pSlider.disabled = true;
            cutSlider.disabled = true;
            btnLeft.disabled = true;
            btnRight.disabled = true;
        }}

        // Sliders Listeners
        pSlider.addEventListener('input', (e) => {{
            state.P = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            saveState();
            updatePlot();
        }});
        cutSlider.addEventListener('input', (e) => {{
            state.cutPos = parseInt(e.target.value);
            let txt = state.cutPos === 1 ? 'Section 1 (Center-Left)' : 'Section 2 (Center-Right)';
            document.getElementById('cut-display').innerText = txt;
            saveState();
            updatePlot();
        }});

        btnLeft.addEventListener('click', () => {{
            if (isLocked) return;
            btnLeft.classList.add('active');
            btnRight.classList.remove('active');
            state.side = 'left';
            saveState();
            updatePlot();
        }});
        btnRight.addEventListener('click', () => {{
            if (isLocked) return;
            btnRight.classList.add('active');
            btnLeft.classList.remove('active');
            state.side = 'right';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            
            cutSlider.value = state.cutPos;
            let txt = state.cutPos === 1 ? 'Section 1 (Center-Left)' : 'Section 2 (Center-Right)';
            document.getElementById('cut-display').innerText = txt;

            if (state.side === 'left') {{
                btnLeft.classList.add('active');
                btnRight.classList.remove('active');
            }} else {{
                btnRight.classList.add('active');
                btnLeft.classList.remove('active');
            }}
        }}

        function updatePlot() {{
            let L = 10.0;
            let P = state.P;
            let H = 5.0; // Truss height is fixed at 5m to simplify prediction question
            let Py = -P; // load points down

            // Reactions (Simply supported at A(0,0) and C(10,0))
            // Symmetric load P at D(5,0)
            // Ray = P/2, Rcy = P/2, Rax = 0
            let Ray = P / 2;
            let Rcy = P / 2;
            let Rax = 0;

            // Geometry calculations
            // Diagonal members angle: tan(phi) = H / 2.5 = 5 / 2.5 = 2  => phi = 63.43°
            let phi = Math.atan2(H, 2.5);
            let cosPhi = Math.cos(phi);
            let sinPhi = Math.sin(phi);

            // Node coordinates:
            // A(0, 0), D(5, 0), C(10, 0)
            // E(2.5, H), B(7.5, H)
            const nodes = {{
                A: [0, 0], D: [5, 0], C: [10, 0],
                E: [2.5, H], B: [7.5, H]
            }};

            // Member force solving:
            // Joint A: Ray = P/2 up. F_AE sin(phi) + Ray = 0 => F_AE = -Ray / sin(phi) (Compression)
            // F_AD + F_AE cos(phi) = 0 => F_AD = -F_AE cos(phi) = Ray / tan(phi) (Tension)
            let Fae = -Ray / sinPhi;
            let Fad = Ray / Math.tan(phi);

            // Joint C: Rcy = P/2 up. F_BC sin(phi) + Rcy = 0 => F_BC = -Rcy / sin(phi)
            // -F_CD - F_BC cos(phi) = 0 => F_CD = -F_BC cos(phi) = Rcy / tan(phi)
            let Fbc = -Rcy / sinPhi;
            let Fcd = Rcy / Math.tan(phi);

            // Diagonals ED, BD
            // Joint D: Py down. F_ED sin(phi) + F_BD sin(phi) + Py = 0.
            // By symmetry: F_ED = F_BD.
            // 2 F_ED sin(phi) = P => F_ED = F_BD = P / (2 sin(phi)) (Tension)
            let Fed = P / (2 * sinPhi);
            let Fbd = P / (2 * sinPhi);

            // Top chord EB
            // Joint B: F_BC = -Fbc (Compression, pushing B). F_BD = -Fbd (Tension, pulling B).
            // ΣFx = F_EB - F_BC cos(phi) + F_BD cos(phi) = 0
            // Since BC is compression, it pushes B left. BD pulls down-left.
            // Let's resolve at B:
            // ΣFx = F_EB - F_BC * cos(phi) - F_BD * cos(phi) = 0 (using magnitudes, BC pushes right, BD pulls left)
            // Actually, we can solve EB by taking moments about Node D for Section 2 (EB, BD, CD cut):
            // LHS contains support A. ΣMd = -Ray * 5 + F_EB * H = 0 => F_EB = 5 Ray / H
            // Wait, looking at LHS: Ray is up, rotates clockwise around D (-Ray * 5).
            // F_EB is horizontal at top chord, pointing right. Rotates clockwise around D (+F_EB * H).
            // -Ray * 5 + F_EB * H = 0 => F_EB = 5 Ray / H = 5 * (P/2) / 5 = P/2 = 40 kN (Compression, actually pushing LHS left, so it is -40 kN).
            let Feb = -Ray; // -40 kN

            // Choose display text based on cut position and side
            let eqText = '';
            if (state.cutPos === 1) {{
                // Section 1 cuts AE, ED, AD
                // Cut line x = 2.0 (approx)
                if (state.side === 'left') {{
                    eqText = `<b>Section 1 (LHS) Equilibrium:</b><br>` +
                             `ΣFy: Ray + F_AE · sin(63.4°) = 0<br>` +
                             `· F_AE = -${Ray.toFixed(1)} / sin(63.4°) = <b>${Fae.toFixed(1)} kN</b> (Compression)<br>` +
                             `ΣMe (at x=2.5, y=5): -Ray · 2.5 + F_AD · 5 = 0<br>` +
                             `· F_AD = (${Ray.toFixed(1)} · 2.5) / 5 = <b>${Fad.toFixed(1)} kN</b> (Tension)<br>` +
                             `ΣFx: F_AD + F_AE · cos(63.4°) + F_ED · cos(63.4°) = 0<br>` +
                             `· F_ED = <b>${Fed.toFixed(1)} kN</b> (Tension)`;
                }} else {{
                    eqText = `<b>Section 1 (RHS) Equilibrium:</b><br>` +
                             `ΣFy: Rcy + Py - F_AE · sin(63.4°) - F_ED · sin(63.4°) = 0<br>` +
                             `· Solves to same member forces:<br>` +
                             `· F_AE = <b>${Fae.toFixed(1)} kN</b> (C) | F_ED = <b>${Fed.toFixed(1)} kN</b> (T)<br>` +
                             `ΣMe (at x=2.5, y=5): -Py · 2.5 - Rcy · 7.5 + F_AD · 5 = 0<br>` +
                             `· F_AD = <b>${Fad.toFixed(1)} kN</b> (Tension)`;
                }}
            }} else {{
                // Section 2 cuts EB, BD, DC
                // Cut line x = 6.0 (approx)
                if (state.side === 'left') {{
                    // LHS contains Node A, E, D, load P at D
                    // Pivot about Node B (intersection of EB and BD) to solve DC directly:
                    // B is at (7.5, 5). LHS reactions: Ray = 40. LHS load: P = 80 at (5,0).
                    // ΣMb = 0: -Ray · 7.5 + P · 2.5 + F_DC · H = 0
                    // -40 · 7.5 + 80 · 2.5 + F_DC · 5 = 0 => -300 + 200 + 5 F_DC = 0 => F_DC = 20 kN
                    eqText = `<b>Section 2 (LHS) Equilibrium:</b><br>` +
                             `ΣMb (Pivot B at x=7.5, y=5):<br>` +
                             `  -Ray · 7.5 + P · 2.5 + F_CD · H = 0<br>` +
                             `  -${Ray.toFixed(1)} · 7.5 + ${P.toFixed(0)} · 2.5 + F_CD · 5 = 0<br>` +
                             `  -300 + 200 + 5 · F_CD = 0  =>  F_CD = <b>${Fcd.toFixed(1)} kN</b> (Tension)<br>` +
                             `ΣMd (Pivot D at x=5, y=0):<br>` +
                             `  -Ray · 5 + F_EB · H = 0  =>  F_EB = <b>${Math.abs(Feb).toFixed(1)} kN</b> (Compression)<br>` +
                             `ΣFy: Ray - P + F_BD · sin(63.4°) = 0  =>  F_BD = <b>${Fbd.toFixed(1)} kN</b> (Tension)`;
                }} else {{
                    eqText = `<b>Section 2 (RHS) Equilibrium:</b><br>` +
                             `ΣMb (Pivot B at x=7.5, y=5):<br>` +
                             `  Rcy · 2.5 - F_CD · 5 = 0  =>  F_CD = <b>${Fcd.toFixed(1)} kN</b> (Tension)<br>` +
                             `ΣFy: Rcy - F_BD · sin(63.4°) = 0  =>  F_BD = <b>${Fbd.toFixed(1)} kN</b> (Tension)<br>` +
                             `ΣFx: -F_EB - F_BC · cos(63.4°) - F_BD · cos(63.4°) = 0<br>` +
                             `  F_EB = <b>${Math.abs(Feb).toFixed(1)} kN</b> (Compression)`;
                }}
            }}

            equationDisplay.innerHTML = eqText;

            // Render Plotly drawing
            const traces = [];

            // Draw full Warren truss skeleton
            // Member lines are colored by Tension/Compression, but faded on the UNSELECTED side
            let members = [
                {{n1: 'A', n2: 'E', f: Fae, label: 'AE', cut: 1}},
                {{n1: 'E', n2: 'D', f: Fed, label: 'ED', cut: 1}},
                {{n1: 'A', n2: 'D', f: Fad, label: 'AD', cut: 1}},
                {{n1: 'E', n2: 'B', f: Feb, label: 'EB', cut: 2}},
                {{n1: 'B', n2: 'D', f: Fbd, label: 'BD', cut: 2}},
                {{n1: 'D', n2: 'C', f: Fcd, label: 'DC', cut: 2}},
                {{n1: 'B', n2: 'C', f: Fbc, label: 'BC', cut: 0}} // never cut directly by section 1 or 2 sliders
            ];

            // Draw members
            members.forEach(m => {{
                // Determine if this member belongs to the active LHS or RHS
                // LHS nodes: A, E, D (D is left of cut 2, right of cut 1)
                // Cut line x-coordinates: Cut 1 is around x=2.0; Cut 2 is around x=6.0.
                let midX = (nodes[m.n1][0] + nodes[m.n2][0]) / 2;
                
                let inActiveSide = false;
                if (state.side === 'left') {{
                    if (state.cutPos === 1) inActiveSide = (midX < 2.0);
                    else inActiveSide = (midX < 6.0);
                }} else {{
                    if (state.cutPos === 1) inActiveSide = (midX > 2.0);
                    else inActiveSide = (midX > 6.0);
                }}

                let color = '#cbd5e1'; // faded gray for unselected section
                let width = 1.5;

                if (inActiveSide) {{
                    if (m.f > 0.1) {{
                        color = '#3b82f6'; // Tension
                        width = 3.5;
                    }} else if (m.f < -0.1) {{
                        color = '#ef4444'; // Compression
                        width = 3.5;
                    }}
                }} else {{
                    // Faded color still indicating tension/compression but highly transparent
                    if (m.f > 0.1) color = 'rgba(59, 130, 246, 0.15)';
                    else if (m.f < -0.1) color = 'rgba(239, 68, 68, 0.15)';
                }}

                traces.push({{
                    x: [nodes[m.n1][0], nodes[m.n2][0]],
                    y: [nodes[m.n1][1], nodes[m.n2][1]],
                    mode: 'lines',
                    line: {{color: color, width: width}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }});

            // Draw Node joints (faded if on unselected side)
            let nodeKeys = ['A', 'B', 'C', 'D', 'E'];
            nodeKeys.forEach(n => {{
                let nodeX = nodes[n][0];
                let isLeftNode = nodeX <= 5;
                if (n === 'B') isLeftNode = false; // B is at 7.5, right of cut
                if (n === 'E') isLeftNode = true;  // E is at 2.5, left of cut

                let activeNode = false;
                if (state.side === 'left') {{
                    if (state.cutPos === 1) activeNode = (nodeX < 2.0);
                    else activeNode = (nodeX <= 5.0);
                }} else {{
                    if (state.cutPos === 1) activeNode = (nodeX >= 2.5);
                    else activeNode = (nodeX > 5.0);
                }}

                let color = activeNode ? '#1e293b' : '#cbd5e1';
                traces.push({{
                    x: [nodes[n][0]],
                    y: [nodes[n][1]],
                    mode: 'markers+text',
                    marker: {{size: 10, color: color}},
                    text: [n],
                    textposition: ['bottom left', 'top center', 'bottom right', 'bottom center', 'top center'][nodeKeys.indexOf(n)],
                    font: {{family: 'Outfit', size: 12, color: color, weight: 'bold'}},
                    showlegend: false,
                    hoverinfo: 'skip'
                }});
            }});

            // Draw the cutting plane line (purple thick dashed line)
            let cutX = state.cutPos === 1 ? 2.0 : 6.0;
            traces.push({{
                x: [cutX, cutX],
                y: [-2, H + 2],
                mode: 'lines',
                line: {{color: '#a855f7', width: 3, dash: 'dashdot'}},
                name: 'Cutting Plane',
                hoverinfo: 'text',
                hovertext: `Cutting Plane x = ${cutX}`
            }});

            // Expose the cut members' internal forces as red/blue arrows at the cut line!
            // Expose forces on the active section pointing:
            // Tension: pulls away from the active nodes (outwards from cut)
            // Compression: pushes towards the active nodes
            // Section 1 cuts AE, ED, AD.
            // Section 2 cuts EB, BD, DC.
            const annotations = [];

            function addExposedForceArrow(ax, ay, force, theta_rad, label, color_code) {{
                // ax, ay: active node position
                // Force: magnitude and sign
                // theta_rad: angle pointing AWAY from active node along member
                let arrow_len = 1.8;
                let sign = force > 0 ? 1 : -1; // positive pulls away (Tension), negative pushes towards (Compression)
                
                // Expose vector arrow starting at node pointing along theta
                let targetX = ax + arrow_len * Math.cos(theta_rad) * sign;
                let targetY = ay + arrow_len * Math.sin(theta_rad) * sign;

                annotations.push({{
                    ax: ax, ay: ay,
                    x: targetX, y: targetY,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 2,
                    arrowsize: 0.8,
                    arrowwidth: 3.5,
                    arrowcolor: color_code,
                    text: label,
                    font: {{family: 'Outfit', size: 9, color: color_code, weight: 'bold'}},
                    xshift: (targetX - ax) > 0 ? 10 : -10,
                    yshift: (targetY - ay) > 0 ? 10 : -10
                }});
            }}

            // Add arrows on the active side
            if (state.side === 'left') {{
                if (state.cutPos === 1) {{
                    // LHS has support reactions at A
                    // Cut members: AE, ED, AD
                    // AE (from A to E): angle is phi. Node is A(0,0)
                    addExposedForceArrow(0, 0, Fae, phi, 'F_AE', '#ef4444');
                    // AD (from A to D): angle is 0. Node is A(0,0)
                    addExposedForceArrow(0, 0, Fad, 0, 'F_AD', '#3b82f6');
                }} else {{
                    // Cut members: EB, BD, DC
                    // EB (from E to B): angle is 0 (horizontal). Active node is E(2.5, H)
                    addExposedForceArrow(2.5, H, Feb, 0, 'F_EB', '#ef4444');
                    // BD (from D to B): angle is phi. Active node is D(5, 0)
                    addExposedForceArrow(5, 0, Fbd, phi, 'F_BD', '#3b82f6');
                    // DC (from D to C): angle is 0. Active node is D(5, 0)
                    addExposedForceArrow(5, 0, Fcd, 0, 'F_CD', '#3b82f6');

                    // Support reaction Ray at A (0,0)
                    annotations.push({{
                        ax: 0, ay: -2.5,
                        x: 0, y: -0.2,
                        xref: 'x', yref: 'y',
                        axref: 'x', ayref: 'y',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 0.8,
                        arrowwidth: 3,
                        arrowcolor: '#3b82f6',
                        text: `Ray = ${Ray.toFixed(0)}kN`,
                        font: {{family: 'Outfit', size: 10, color: '#3b82f6'}},
                        xshift: -25
                    }});
                }}
            }} else {{
                // Right Hand Side active
                if (state.cutPos === 2) {{
                    // Cut members: EB, BD, DC
                    // EB (from B to E): active node B(7.5, H), pointing left (PI)
                    addExposedForceArrow(7.5, H, Feb, Math.PI, 'F_EB', '#ef4444');
                    // BD (from B to D): active node B(7.5, H), pointing down-left (PI + phi)
                    addExposedForceArrow(7.5, H, Fbd, Math.PI + phi, 'F_BD', '#3b82f6');
                    // DC (from C to D): active node C(10, 0), pointing left (PI)
                    addExposedForceArrow(10, 0, Fcd, Math.PI, 'F_CD', '#3b82f6');

                    // Support reaction Rcy at C (10, 0)
                    annotations.push({{
                        ax: 10, ay: -2.5,
                        x: 10, y: -0.2,
                        xref: 'x', yref: 'y',
                        axref: 'x', ayref: 'y',
                        showarrow: true,
                        arrowhead: 2,
                        arrowsize: 0.8,
                        arrowwidth: 3,
                        arrowcolor: '#10b981',
                        text: `Rcy = ${Rcy.toFixed(0)}kN`,
                        font: {{family: 'Outfit', size: 10, color: '#10b981'}},
                        xshift: 25
                    }});
                }}
            }}

            // Draw downward load P at D(5,0)
            if (P > 0) {{
                let len = 1.5 + 1.5 * (P / 100);
                annotations.push({{
                    ax: 5, ay: -len,
                    x: 5, y: -0.2,
                    xref: 'x', yref: 'y',
                    axref: 'x', ayref: 'y',
                    showarrow: true,
                    arrowhead: 3,
                    arrowsize: 1,
                    arrowwidth: 3.5,
                    arrowcolor: '#ef4444',
                    text: `P = ${P.toFixed(0)} kN`,
                    font: {{family: 'Outfit', size: 10, color: '#ef4444', weight: 'bold'}},
                    yshift: -15
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
                    range: [-4.5, 7.5],
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

def run_truss_sections():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #10b981; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 2 • Lesson 16</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Truss Analysis: Method of Sections</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit2"]
    topic_name = "Lesson 16: Truss Analysis:  Method of Sections"
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
    if "vsec_phase" not in st.session_state:
        st.session_state.vsec_phase = "instructions"
    if "vsec_sliders_locked" not in st.session_state:
        st.session_state.vsec_sliders_locked = False
    if "vsec_reset_counter" not in st.session_state:
        st.session_state.vsec_reset_counter = 0
    if "vsec_answers" not in st.session_state:
        st.session_state.vsec_answers = {}

    def reset_simulator():
        st.session_state.vsec_phase = "instructions"
        st.session_state.vsec_answers = {}
        st.session_state.vsec_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vsec_phase == "poe_predict":
        st.session_state.vsec_sliders_locked = True
    else:
        st.session_state.vsec_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Truss Section Solver")
        locked_js = "true" if st.session_state.vsec_sliders_locked else "false"
        reset_counter = st.session_state.vsec_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=600)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#10b981; font-weight:700;">{phase_titles[st.session_state.vsec_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vsec_phase == "instructions":
            st.markdown("""
            The **Method of Sections** is used to find internal forces in specific members directly by passing an imaginary cutting plane through the truss.
            
            **Key Mechanics:**
            * Drag **Cut Position** to shift the purple dashed cutting plane.
            * Toggle **Left Section** vs. **Right Section** to choose which half of the truss to isolate and analyze.
            * Observe how internal member forces are exposed as **external boundary vectors** (Blue for Tension, Red for Compression) on the isolated free-body diagram.
            * Note how the reactions and applied loads are also isolated.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vsec_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vsec_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            Set the sliders to:
            * **Load Magnitude, P**: `80 kN`
            * **Cut Position**: `Section 1 (Center-Left)`
            * **Active Side**: `Analyze Left Section`
            
            Look at the exposed force vectors: $F_{AE}$, $F_{ED}$, $F_{AD}$.
            
            **Question:**
            How is diagonal member AE resolved, and what is its force?
            """)
            
            ans = st.radio(
                "Select the correct calculation:",
                options=[
                    "Ray + F_AE * sin(phi) = 0 => F_AE = -44.7 kN (Compression)",
                    "Ray + F_AE * sin(phi) = 0 => F_AE = -89.4 kN (Compression)",
                    "Ray - F_AE * cos(phi) = 0 => F_AE = 44.7 kN (Tension)",
                    "F_AE = 0 kN, because it is a zero-force member"
                ],
                key="vsec_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "-44.7 kN" in ans:
                    st.success(r"Correct! Isolate the left portion: the only vertical forces are reaction $R_{Ay} = 40\text{ kN}$ (up) and the vertical component of cut diagonal $F_{AE}$. Thus: $R_{Ay} + F_{AE} \sin(63.4^\circ) = 0 \implies F_{AE} = -40 / 0.894 = -44.7\text{ kN}$ (Compression).")
                else:
                    st.error(r"Incorrect. Let's look at vertical equilibrium: $R_{Ay} + F_{AE} \sin(63.4^\circ) = 0$. Since $R_{Ay} = P/2 = 40\text{ kN}$, we get $F_{AE} = -40 / 0.894 = -44.7\text{ kN}$ (Compression).")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vsec_phase = "poe_predict"
                st.session_state.vsec_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vsec_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Truss Controls Locked!):**
            
            **Scenario:**
            * **Load Magnitude, P**: `80 kN` (vertical downward at center Node D)
            * **Cut Position**: `Section 2` (cuts EB, BD, DC)
            * **Active Side**: `Left Section`
            * Note: $R_{Ay} = 40\text{ kN}$, and Node B is located at coordinates $(7.5, 5.0)$.
            
            **Question:**
            1. Which node is the optimal pivot point to solve for bottom chord force $F_{CD}$ directly using a single moment equation?
            2. Calculate the value and state (tension/compression) of $F_{CD}$.
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Pivot Node B; F_CD = 20 kN (Tension)",
                    "Pivot Node B; F_CD = 60 kN (Tension)",
                    "Pivot Node D; F_CD = 40 kN (Compression)",
                    "Pivot Node E; F_CD = 20 kN (Tension)"
                ],
                key="vsec_poe_p_radio"
            )
            st.session_state.vsec_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vsec_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vsec_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set Load P to `80 kN`.
            2. Set Cut Position to `Section 2`.
            3. Set Active Side to `Left Section`.
            4. Inspect the solved value of $F_{CD}$ and the moment equations in the equation display box.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vsec_answers.get("poe", "Pivot Node B; F_CD = 20 kN (Tension)")
            options_list = [
                "Pivot Node B; F_CD = 20 kN (Tension)",
                "Pivot Node B; F_CD = 60 kN (Tension)",
                "Pivot Node D; F_CD = 40 kN (Compression)",
                "Pivot Node E; F_CD = 20 kN (Tension)"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vsec_poe_o_radio"
            )
            st.session_state.vsec_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vsec_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vsec_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vsec_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vsec_answers.get("poe") == "Pivot Node B; F_CD = 20 kN (Tension)":
                st.success("🎉 **Correct!** Outstanding work.")
            else:
                st.warning("⚠️ **Incorrect.** Look at the physics calculations below.")

            st.markdown(r"""
            ### Explanation:
            1. **Optimal Pivot Point**:
               * The cut members are EB, BD, and CD. We want to find $F_{CD}$.
               * The other two cut members, EB and BD, both intersect at **Node B**.
               * Therefore, taking moments about **Node B** eliminates the moments of $F_{EB}$ and $F_{BD}$ (since their lines of action pass through B), allowing us to solve for $F_{CD}$ directly.
            2. **Moment Equilibrium about B (x=7.5, y=5.0)**:
               * Isolating the LHS section, the external forces are reaction $R_{Ay} = 40\text{ kN}$ at A(0,0), load $P = 80\text{ kN}$ at D(5,0), and the exposed force $F_{CD}$ at D(5,0) pointing right.
               * Summing moments about B:
                 $$\sum M_B = -R_{Ay} \cdot 7.5 + P \cdot 2.5 + F_{CD} \cdot H = 0$$
                 $$-40 \cdot 7.5 + 80 \cdot 2.5 + F_{CD} \cdot 5 = 0$$
                 $$-300 + 200 + 5 F_{CD} = 0 \implies 5 F_{CD} = 100 \implies F_{CD} = 20\text{ kN}$$
               * Since the result is positive, it pulls away from the cut, meaning it is in **Tension**.
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

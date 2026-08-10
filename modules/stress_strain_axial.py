import streamlit as st
from modules.course_data import UNITS

# HTML & JavaScript Template for Stress-Strain & Axial Loading Sandbox
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
            color: #f97316;
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

    <!-- Material Presets Toggle -->
    <div class="btn-group">
        <button id="btn-steel" class="btn-choice active">Structural Steel (E = 200 GPa)</button>
        <button id="btn-alum" class="btn-choice">Aluminum 6061-T6 (E = 70 GPa)</button>
        <button id="btn-tita" class="btn-choice">Titanium Alloy (E = 110 GPa)</button>
    </div>

    <!-- Plotly Chart -->
    <div id="plotly-chart" style="width: 100%; height: 280px;"></div>

    <!-- Controls -->
    <div class="control-grid">
        <!-- Load P -->
        <div class="control-box">
            <div class="control-title">1. Force (P)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Load, P</span>
                    <span class="slider-value" id="p-val-display">100 kN</span>
                </div>
                <input type="range" id="p-slider" min="0" max="300" step="10" value="100" class="custom-slider">
            </div>
        </div>

        <!-- Length L -->
        <div class="control-box">
            <div class="control-title">2. Length (L)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Length, L</span>
                    <span class="slider-value" id="l-val-display">3.0 m</span>
                </div>
                <input type="range" id="l-slider" min="1.0" max="5.0" step="0.5" value="3.0" class="custom-slider">
            </div>
        </div>

        <!-- Area A -->
        <div class="control-box">
            <div class="control-title">3. Area (A)</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Area, A</span>
                    <span class="slider-value" id="a-val-display">500 mm²</span>
                </div>
                <input type="range" id="a-slider" min="200" max="1200" step="50" value="500" class="custom-slider">
            </div>
        </div>

        <!-- Specimen View Zoom -->
        <div class="control-box">
            <div class="control-title">4. Stretch Zoom</div>
            <div class="slider-container">
                <div class="slider-header">
                    <span class="slider-title">Zoom Factor</span>
                    <span class="slider-value" id="z-val-display">500x</span>
                </div>
                <input type="range" id="z-slider" min="100" max="1000" step="100" value="500" class="custom-slider">
            </div>
        </div>
    </div>

    <!-- Plastic Yield Warning -->
    <div id="yield-warning" class="warning-box" style="display: none;">
        <span>⚠️</span>
        <span><b>MATERIAL YIELD LIMIT EXCEEDED!</b> Stress has passed the elastic limit. Hooke's Law (σ = Eε) is no longer valid. Permanent plastic deformation is occurring.</span>
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
        const btnSteel = document.getElementById('btn-steel');
        const btnAlum = document.getElementById('btn-alum');
        const btnTita = document.getElementById('btn-tita');
        const pSlider = document.getElementById('p-slider');
        const lSlider = document.getElementById('l-slider');
        const aSlider = document.getElementById('a-slider');
        const zSlider = document.getElementById('z-slider');
        const lockBanner = document.getElementById('lock-banner');
        const yieldWarning = document.getElementById('yield-warning');
        const equationDisplay = document.getElementById('equation-display');

        // Material properties data
        const materials = {{
            steel: {{ E: 200000, Sy: 250, Su: 400, ey: 0.00125, eu: 0.012, erup: 0.015 }},
            alum: {{ E: 70000, Sy: 270, Su: 310, ey: 0.00386, eu: 0.010, erup: 0.013 }},
            tita: {{ E: 110000, Sy: 800, Su: 900, ey: 0.00727, eu: 0.012, erup: 0.015 }}
        }};

        // State
        let state = {{
            mat: 'steel',
            P: 100,
            L: 3.0,
            A: 500,
            zoom: 500
        }};

        // Read/Write Session Storage
        const lastReset = parseInt(sessionStorage.getItem('vss_reset_counter') || '0');
        if (lastReset === resetCounter) {{
            state.mat = sessionStorage.getItem('vss_mat') || 'steel';
            state.P = parseFloat(sessionStorage.getItem('vss_P') || '100');
            state.L = parseFloat(sessionStorage.getItem('vss_L') || '3.0');
            state.A = parseFloat(sessionStorage.getItem('vss_A') || '500');
            state.zoom = parseFloat(sessionStorage.getItem('vss_zoom') || '500');
        }} else {{
            sessionStorage.setItem('vss_reset_counter', resetCounter);
            saveState();
        }}

        function saveState() {{
            sessionStorage.setItem('vss_mat', state.mat);
            sessionStorage.setItem('vss_P', state.P);
            sessionStorage.setItem('vss_L', state.L);
            sessionStorage.setItem('vss_A', state.A);
            sessionStorage.setItem('vss_zoom', state.zoom);
        }}

        // Handle buttons
        function setMaterial(mName) {{
            state.mat = mName;
            [btnSteel, btnAlum, btnTita].forEach(b => b.classList.remove('active'));
            if (mName === 'steel') btnSteel.classList.add('active');
            if (mName === 'alum') btnAlum.classList.add('active');
            if (mName === 'tita') btnTita.classList.add('active');
            saveState();
            updatePlot();
        }}

        btnSteel.addEventListener('click', () => {{ if (!isLocked) setMaterial('steel'); }});
        btnAlum.addEventListener('click', () => {{ if (!isLocked) setMaterial('alum'); }});
        btnTita.addEventListener('click', () => {{ if (!isLocked) setMaterial('tita'); }});

        // Locks
        if (isLocked) {{
            lockBanner.style.display = 'flex';
            pSlider.disabled = true;
            lSlider.disabled = true;
            aSlider.disabled = true;
            zSlider.disabled = true;
            btnSteel.disabled = true;
            btnAlum.disabled = true;
            btnTita.disabled = true;
        }}

        // Sliders Listeners
        pSlider.addEventListener('input', (e) => {{
            state.P = parseFloat(e.target.value);
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            saveState();
            updatePlot();
        }});
        lSlider.addEventListener('input', (e) => {{
            state.L = parseFloat(e.target.value);
            document.getElementById('l-val-display').innerText = state.L.toFixed(1) + ' m';
            saveState();
            updatePlot();
        }});
        aSlider.addEventListener('input', (e) => {{
            state.A = parseFloat(e.target.value);
            document.getElementById('a-val-display').innerText = state.A.toFixed(0) + ' mm²';
            saveState();
            updatePlot();
        }});
        zSlider.addEventListener('input', (e) => {{
            state.zoom = parseFloat(e.target.value);
            document.getElementById('z-val-display').innerText = state.zoom.toFixed(0) + 'x';
            saveState();
            updatePlot();
        }});

        function syncUI() {{
            pSlider.value = state.P;
            document.getElementById('p-val-display').innerText = state.P.toFixed(0) + ' kN';
            lSlider.value = state.L;
            document.getElementById('l-val-display').innerText = state.L.toFixed(1) + ' m';
            aSlider.value = state.A;
            document.getElementById('a-val-display').innerText = state.A.toFixed(0) + ' mm²';
            zSlider.value = state.zoom;
            document.getElementById('z-val-display').innerText = state.zoom.toFixed(0) + 'x';
            setMaterial(state.mat);
        }}

        function updatePlot() {{
            let P = state.P;
            let L = state.L;
            let A = state.A;
            let zoom = state.zoom;
            let mat = materials[state.mat];

            // Math calculations
            let stress = (P * 1000) / A; // MPa
            let strain = 0;
            let isYielded = stress > mat.Sy;

            if (!isYielded) {{
                strain = stress / mat.E;
            }} else {{
                // Approximate stress-strain curve in plastic region for plotting operating point
                // Curve: stress = Sy + (Su - Sy) * sqrt((strain - ey) / (eu - ey))
                // Solving for strain: strain = ey + (eu - ey) * ((stress - Sy)/(Su - Sy))^2
                let ratio = (stress - mat.Sy) / (mat.Su - mat.Sy);
                if (ratio > 1.0) ratio = 1.0; // cap at ultimate strength for visualization
                strain = mat.ey + (mat.eu - mat.ey) * ratio * ratio;
            }}

            let delta = strain * (L * 1000); // mm

            // Update warning display
            if (isYielded) {{
                yieldWarning.style.display = 'flex';
            }} else {{
                yieldWarning.style.display = 'none';
            }}

            let traces = [];
            let annotations = [];

            // ------------------ SUBPLOT 1: SPECIMEN (Left, x: [0, 0.45]) ------------------
            // Specimen length in plot coordinates: default original length represents 2.5 units
            let orig_len_plot = 1.5 + (L / 5.0) * 1.5; 
            let stretched_len_plot = orig_len_plot + (delta * zoom / 1000); // apply zoom factor to elongation for visibility

            // Draw fixed wall on left at x = 0.2
            traces.push({{
                x: [0.1, 0.2, 0.2, 0.1],
                y: [1.8, 1.8, 0.2, 0.2],
                mode: 'lines',
                fill: 'toself',
                fillcolor: '#94a3b8',
                line: {{color: '#475569', width: 2.5}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Draw specimen bar (width based on area A)
            let spec_height = 0.2 + 0.4 * (A / 1200);
            traces.push({{
                x: [0.2, 0.2 + stretched_len_plot, 0.2 + stretched_len_plot, 0.2, 0.2],
                y: [1.0 + spec_height/2, 1.0 + spec_height/2, 1.0 - spec_height/2, 1.0 - spec_height/2, 1.0 + spec_height/2],
                mode: 'lines',
                fill: 'toself',
                fillcolor: isYielded ? 'rgba(239, 68, 68, 0.08)' : 'rgba(249, 115, 22, 0.08)',
                line: {{color: isYielded ? '#ef4444' : '#f97316', width: 2.5}},
                xaxis: 'x1', yaxis: 'y1',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // Show force arrow at the right end
            annotations.push({{
                ax: 0.2 + stretched_len_plot, ay: 1.0,
                x: 0.2 + stretched_len_plot + 0.6, y: 1.0,
                xref: 'x1', yref: 'y1',
                axref: 'x1', ayref: 'y1',
                showarrow: true,
                arrowhead: 2,
                arrowsize: 0.8,
                arrowwidth: 3.5,
                arrowcolor: '#1e293b',
                text: ''
            }});
            annotations.push({{
                x: 0.2 + stretched_len_plot + 0.6, y: 1.0,
                xref: 'x1', yref: 'y1',
                showarrow: false,
                text: `P = ${P} kN`,
                font: {{family: 'Outfit', size: 10, color: '#1e293b', weight: 'bold'}},
                xshift: 15
            }});

            // Label specimen dimensions
            annotations.push({{
                x: 0.2 + stretched_len_plot / 2,
                y: 1.0 + spec_height/2 + 0.2,
                xref: 'x1', yref: 'y1',
                text: `A = ${A} mm²`,
                font: {{family: 'Outfit', size: 9, color: '#f97316'}},
                showarrow: false
            }});

            annotations.push({{
                x: 0.2 + stretched_len_plot / 2,
                y: 1.0 - spec_height/2 - 0.2,
                xref: 'x1', yref: 'y1',
                text: `L₀ = ${L.toFixed(1)} m`,
                font: {{family: 'Outfit', size: 9, color: '#475569'}},
                showarrow: false
            }});

            annotations.push({{
                x: 0.2 + stretched_len_plot / 2,
                y: 0.2,
                xref: 'x1', yref: 'y1',
                text: `δ = ${delta.toFixed(3)} mm (stretched)`,
                font: {{family: 'Outfit', size: 10, color: isYielded ? '#ef4444' : '#f97316', weight: 'bold'}},
                showarrow: false
            }});

            // ------------------ SUBPLOT 2: STRESS-STRAIN CURVE (Right, x: [0.55, 1.0]) ------------------
            // Build the background curve
            let strainPts = [];
            let stressPts = [];

            // Elastic segment
            let step = mat.ey / 10;
            for (let e = 0; e <= mat.ey; e += step) {{
                strainPts.push(e);
                stressPts.push(e * mat.E);
            }}

            // Plastic segment
            let plastStep = (mat.erup - mat.ey) / 20;
            for (let e = mat.ey; e <= mat.erup; e += plastStep) {{
                strainPts.push(e);
                // Parabolic stress-strain curve approximation
                let ratio = (e - mat.ey) / (mat.eu - mat.ey);
                if (ratio > 1.0) ratio = 1.0;
                let s = mat.Sy + (mat.Su - mat.Sy) * Math.sin(ratio * Math.PI / 2);
                if (e > mat.eu) {{
                    // necking/drop region
                    let ratioDrop = (e - mat.eu) / (mat.erup - mat.eu);
                    s = mat.Su - (mat.Su - mat.Sy * 0.9) * ratioDrop * ratioDrop;
                }}
                stressPts.push(s);
            }}

            // Add full stress-strain curve trace
            traces.push({{
                x: strainPts,
                y: stressPts,
                mode: 'lines',
                line: {{color: '#94a3b8', width: 2}},
                name: 'Stress-Strain Curve',
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'skip'
            }});

            // operating dot on stress-strain curve
            traces.push({{
                x: [strain],
                y: [stress],
                mode: 'markers',
                marker: {{size: 10, color: isYielded ? '#ef4444' : '#10b981'}},
                name: 'Operating Point',
                xaxis: 'x2', yaxis: 'y2',
                showlegend: false,
                hoverinfo: 'text',
                hovertext: `Stress: ${stress.toFixed(1)} MPa\\nStrain: ${strain.toFixed(5)}`
            }});

            // Operating labels on plot
            annotations.push({{
                x: strain,
                y: stress,
                xref: 'x2', yref: 'y2',
                text: `  (ε=${strain.toFixed(5)}, σ=${stress.toFixed(1)} MPa)`,
                font: {{family: 'Outfit', size: 9, color: isYielded ? '#ef4444' : '#10b981', weight: 'bold'}},
                showarrow: false,
                xanchor: 'left',
                yshift: 10
            }});

            // Label key points: Yield point and Ultimate strength
            annotations.push({{
                x: mat.ey,
                y: mat.Sy,
                xref: 'x2', yref: 'y2',
                text: 'Yield',
                font: {{family: 'Outfit', size: 8, color: '#64748b'}},
                showarrow: true,
                arrowhead: 1,
                arrowsize: 0.5,
                ax: -25, ay: -20
            }});

            // Layout settings
            const layout = {{
                grid: {{rows: 1, columns: 2, pattern: 'independent'}},
                xaxis: {{
                    domain: [0, 0.48],
                    range: [0, 4.5],
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
                    domain: [0.55, 1],
                    range: [0, mat.erup * 1.1],
                    title: 'Strain, ε (mm/mm)',
                    titlefont: {{family: 'Outfit', size: 10, color: '#475569'}},
                    tickfont: {{family: 'Outfit', size: 8, color: '#64748b'}},
                    showgrid: true,
                    gridcolor: 'rgba(128, 128, 128, 0.1)',
                    fixedrange: true
                }},
                yaxis2: {{
                    domain: [0, 1],
                    range: [0, mat.Su * 1.15],
                    title: 'Stress, σ (MPa)',
                    titlefont: {{family: 'Outfit', size: 10, color: '#475569'}},
                    tickfont: {{family: 'Outfit', size: 8, color: '#64748b'}},
                    showgrid: true,
                    gridcolor: 'rgba(128, 128, 128, 0.1)',
                    fixedrange: true
                }},
                margin: {{l: 10, r: 10, t: 15, b: 35}},
                showlegend: false,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                annotations: annotations
            }};

            Plotly.react('plotly-chart', traces, layout);

            // Update mathematical equations box
            if (!isYielded) {{
                equationDisplay.innerHTML = `
                    <b>Elastic Deformations and Hooke's Law:</b><br>
                    • Normal Stress: <b>σ = P / A</b> = ${P * 1000} N / ${A} mm² = <b>${stress.toFixed(2)} MPa</b><br>
                    • Elastic Strain: <b>ε = σ / E</b> = ${stress.toFixed(2)} MPa / ${mat.E} MPa = <b>${strain.toFixed(5)}</b><br>
                    • Total Elongation: <b>δ = ε · L₀ = PL₀ / AE</b> = (${P * 1000} · ${L}) / (${A} · ${mat.E/1000}) = <b>${delta.toFixed(4)} mm</b>
                `;
            }} else {{
                equationDisplay.innerHTML = `
                    <b>Plastic Range (Hooke's Law Invalid):</b><br>
                    • Normal Stress: <b>σ = P / A</b> = ${stress.toFixed(2)} MPa &gt; Yield Limit (Sy = ${mat.Sy} MPa)<br>
                    • Strain (Non-linear): <b>ε = ${strain.toFixed(5)}</b> (estimated from plastic curve)<br>
                    • Plastic Deformation: <b>δ = ε · L₀</b> = ${strain.toFixed(5)} · ${L * 1000} mm = <b>${delta.toFixed(3)} mm</b><br>
                    <span style="color:#b91c1c; font-size:0.75rem;">(⚠️ Note: E = ${mat.E} MPa is only the initial slope. Hooke's Law does NOT predict this elongation!)</span>
                `;
            }}
        }}

        // Init
        syncUI();
        updatePlot();
    </script>
</body>
</html>
"""

def run_stress_strain_axial():
    st.markdown(r"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: #f97316; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">Unit 3 • Lesson 21</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">Normal Stress, Strain & Axial Loading</h1>
    </div>
    """, unsafe_allow_html=True)

    # Objectives
    unit = UNITS["unit3"]
    topic_name = "Lesson 21: Normal Stress & Strain:  Axial Loading"
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
    if "vss_phase" not in st.session_state:
        st.session_state.vss_phase = "instructions"
    if "vss_sliders_locked" not in st.session_state:
        st.session_state.vss_sliders_locked = False
    if "vss_reset_counter" not in st.session_state:
        st.session_state.vss_reset_counter = 0
    if "vss_answers" not in st.session_state:
        st.session_state.vss_answers = {}

    def reset_simulator():
        st.session_state.vss_phase = "instructions"
        st.session_state.vss_answers = {}
        st.session_state.vss_reset_counter += 1

    phase_titles = {
        "instructions": "📖 Step 1: Instructions",
        "guided_question": "🔍 Step 2: Guided Practice",
        "poe_predict": "🔮 POE Challenge: Predict",
        "poe_observe": "👀 POE Challenge: Observe & Correct",
        "poe_explain": "💡 POE Challenge: Explain"
    }

    if st.session_state.vss_phase == "poe_predict":
        st.session_state.vss_sliders_locked = True
    else:
        st.session_state.vss_sliders_locked = False

    left_col, right_col = st.columns([7, 3])

    # ------------------ LEFT COLUMN: IPW ------------------
    with left_col:
        st.subheader("Interactive Stress-Strain Specimen Simulator")
        locked_js = "true" if st.session_state.vss_sliders_locked else "false"
        reset_counter = st.session_state.vss_reset_counter
        html_content = HTML_TEMPLATE.replace("{locked_js}", locked_js).replace("{reset_counter}", str(reset_counter)).replace("{{", "{").replace("}}", "}")
        st.iframe(html_content, height=580)

    # ------------------ RIGHT COLUMN: SIDECAR ------------------
    with right_col:
        st.markdown('<div class="sidecar-anchor"></div>', unsafe_allow_html=True)
        st.markdown(f'<h4 style="margin-top:0; color:#f97316; font-weight:700;">{phase_titles[st.session_state.vss_phase]}</h4>', unsafe_allow_html=True)

        # Instructions
        if st.session_state.vss_phase == "instructions":
            st.markdown(r"""
            **Strain (ε)** measures the deformation per unit length: $\epsilon = \delta / L_0$.
            
            **Hooke's Law** states that stress is proportional to strain in the elastic range: $\sigma = E \epsilon$.
            
            **Elongation (δ)** represents the total deformation:
            $$\delta = \frac{PL_0}{AE}$$
            
            This simulation couples a physically stretching bar with its material **Stress-Strain curve** to visualize these equations in action.
            """)
            if st.button("Start Practice 🔍", use_container_width=True):
                st.session_state.vss_phase = "guided_question"
                st.rerun()

        # Guided Practice
        elif st.session_state.vss_phase == "guided_question":
            st.markdown("""
            **Guided Scenario:**
            1. Select **Structural Steel** preset.
            2. Set **Force (P)** to `100 kN`.
            3. Set **Length (L)** to `4.0 m`.
            4. Set **Area (A)** to `800 mm²`.
            
            Observe the calculated values in the equation box.
            
            **Question:**
            What is the normal stress, strain, and total elongation of this steel rod?
            """)
            
            ans = st.radio(
                "Select the correct calculations:",
                options=[
                    "σ = 125.0 MPa, ε = 0.000625, δ = 2.50 mm",
                    "σ = 125.0 MPa, ε = 0.000625, δ = 2.50 * 10^-3 mm",
                    "σ = 80.0 MPa, ε = 0.000400, δ = 1.60 mm",
                    "σ = 250.0 MPa, ε = 0.001250, δ = 5.00 mm"
                ],
                key="vss_guided_radio"
            )
            
            if st.button("Submit Answer", use_container_width=True):
                if "125.0 MPa" in ans and "2.50 mm" in ans:
                    st.success(r"Correct! Stress $\sigma = 100\text{ kN} / 800\text{ mm}^2 = 125.0\text{ MPa}$. Strain $\epsilon = 125.0 / 200,000 = 0.000625$. Elongation $\delta = 0.000625 \cdot 4000\text{ mm} = 2.50\text{ mm}$.")
                else:
                    st.error(r"Incorrect. Let's recalculate: Stress $\sigma = P/A = 100,000\text{ N} / 800\text{ mm}^2 = 125.0\text{ MPa}$. Strain $\epsilon = \sigma / E = 125.0 / 200,000 = 0.000625$. Elongation $\delta = \epsilon \cdot L = 0.000625 \cdot 4,000\text{ mm} = 2.50\text{ mm}$.")

            st.markdown("---")
            if st.button("Go to POE Challenge 🔮", use_container_width=True):
                st.session_state.vss_phase = "poe_predict"
                st.session_state.vss_answers["poe"] = None
                st.rerun()

        # POE Predict
        elif st.session_state.vss_phase == "poe_predict":
            st.markdown(r"""
            **Predict Phase (Specimen Controls Locked!):**
            
            **Scenario:**
            We keep the geometry and loading fixed:
            * **Force (P)**: `150 kN`
            * **Length (L)**: `3.0 m`
            * **Area (A)**: `500 mm²`
            
            We will switch the specimen from **Structural Steel** ($E = 200\text{ GPa}$, yield $\sigma_y = 250\text{ MPa}$) to **Aluminum 6061-T6** ($E = 70\text{ GPa}$, yield $\sigma_y = 270\text{ MPa}$).
            
            **Question:**
            What happens to the strain and the elongation, and do either materials yield (permanently deform)?
            """)
            
            poe_ans = st.radio(
                "Select your hypothesis:",
                options=[
                    "Aluminum has higher strain and elongation; Steel yields but Aluminum remains elastic",
                    "Aluminum has higher strain and elongation; Steel remains elastic but Aluminum yields",
                    "Aluminum has higher strain and elongation; Both materials yield and deform plastically",
                    "Steel has higher strain and elongation; Both remain elastic"
                ],
                key="vss_poe_p_radio"
            )
            st.session_state.vss_answers["poe"] = poe_ans
            
            if st.button("Test Hypothesis 🧪", use_container_width=True):
                st.session_state.vss_phase = "poe_observe"
                st.rerun()

        # POE Observe
        elif st.session_state.vss_phase == "poe_observe":
            st.markdown("""
            **Observe & Correct Phase (Controls Unlocked!):**
            
            **Instructions:**
            1. Set **Force P** to `150 kN`, **Length L** to `3.0 m`, and **Area A** to `500 mm²`.
            2. Cycle through the material presets (**Steel** and **Aluminum**).
            3. Observe the stress, strain, and elongation values, and look for any yield warning messages.
            
            *Change your answer below if needed before submitting!*
            """)
            
            val_init = st.session_state.vss_answers.get("poe", "Aluminum has higher strain and elongation; Both materials yield and deform plastically")
            options_list = [
                "Aluminum has higher strain and elongation; Steel yields but Aluminum remains elastic",
                "Aluminum has higher strain and elongation; Steel remains elastic but Aluminum yields",
                "Aluminum has higher strain and elongation; Both materials yield and deform plastically",
                "Steel has higher strain and elongation; Both remain elastic"
            ]
            default_idx = options_list.index(val_init) if val_init in options_list else 0
            
            poe_ans = st.radio(
                "Select your finalized answer:",
                options=options_list,
                index=default_idx,
                key="vss_poe_o_radio"
            )
            st.session_state.vss_answers["poe"] = poe_ans
            
            if st.button("Final Submit 📤", use_container_width=True):
                st.session_state.vss_phase = "poe_explain"
                st.rerun()

        # POE Explain
        elif st.session_state.vss_phase == "poe_explain":
            st.markdown(f"**Your final selection:**\n`{st.session_state.vss_answers.get('poe')}`")
            
            st.markdown("---")
            if st.session_state.vss_answers.get("poe") == "Aluminum has higher strain and elongation; Both materials yield and deform plastically":
                st.success("🎉 **Correct!** Incredible physical insight.")
            else:
                st.warning("⚠️ **Incorrect.** Review the calculations and material limits below.")

            st.markdown(r"""
            ### Explanation:
            1. **Stress Calculation**:
               Under a load $P = 150\text{ kN}$ on a cross-sectional area $A = 500\text{ mm}^2$:
               $$\sigma = \frac{150,000\text{ N}}{500\text{ mm}^2} = 300\text{ MPa}$$
               
            2. **Material Yield Check**:
               * **Structural Steel**: Yield strength $\sigma_y = 250\text{ MPa}$. Since $\sigma = 300\text{ MPa} > 250\text{ MPa}$, **Steel yields**.
               * **Aluminum 6061-T6**: Yield strength $\sigma_y = 270\text{ MPa}$. Since $\sigma = 300\text{ MPa} > 270\text{ MPa}$, **Aluminum yields**.
               * *Conclusion*: Both materials exceed their elastic limit, so Hooke's Law is invalid for both under this load.
               
            3. **Stiffness and Elongation**:
               Because Aluminum's Modulus of Elasticity ($E = 70\text{ GPa}$) is much lower than Steel's ($E = 200\text{ GPa}$), Aluminum is less stiff and elongates much more under the same load. At 300 MPa, the steel rod elongates by over **6.0 mm** (highly plastic), while the aluminum rod elongates by over **15.0 mm** (entering severe plastic deformation).
            """)
            
            if st.button("Reset Simulator 🔄", use_container_width=True):
                reset_simulator()
                st.rerun()

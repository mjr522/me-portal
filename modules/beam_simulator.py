import streamlit as st
import plotly.graph_objects as go
import numpy as np

def run_beam_simulator():
    # Initialize Session State variables for Concept Check
    if "submitted" not in st.session_state:
        st.session_state.submitted = False
    if "c1" not in st.session_state:
        st.session_state.c1 = False
    if "c2" not in st.session_state:
        st.session_state.c2 = False
    if "c3" not in st.session_state:
        st.session_state.c3 = False
    if "c4" not in st.session_state:
        st.session_state.c4 = False
    if "c5" not in st.session_state:
        st.session_state.c5 = False
    if "c6" not in st.session_state:
        st.session_state.c6 = False

    # Inline css injection for simulator gating/metrics card
    st.markdown("""
    <style>
    /* Custom styles for the Concept Check Card */
    .concept-check-box {
        background: rgba(59, 130, 246, 0.05);
        border: 1.5px solid rgba(59, 130, 246, 0.2);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 25px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    
    .concept-title {
        color: #1e3a8a;
        font-size: 1.5rem;
        font-weight: 700;
        margin-top: 0;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    /* Glassmorphism/Premium Metrics Cards */
    .card-container {
        display: flex;
        justify-content: space-between;
        gap: 15px;
        margin-top: 15px;
        margin-bottom: 25px;
        flex-wrap: wrap;
    }
    
    .metric-card {
        flex: 1 1 calc(20% - 15px);
        background: rgba(128, 128, 128, 0.05);
        border: 1px solid rgba(128, 128, 128, 0.15);
        border-radius: 14px;
        padding: 16px 10px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .metric-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        border-color: #3b82f6;
    }
    
    .metric-title {
        font-size: 0.82rem;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 1.2px;
        margin-bottom: 6px;
    }
    
    .metric-value {
        font-size: 1.6rem;
        font-weight: 700;
        color: #1e293b;
    }
    
    /* Dark mode overrides for cards if Streamlit is in dark mode */
    @media (prefers-color-scheme: dark) {
        .concept-title {
            color: #60a5fa;
        }
        .metric-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .metric-value {
            color: #f8fafc;
        }
        .metric-title {
            color: #94a3b8;
        }
        .concept-check-box {
            background: rgba(59, 130, 246, 0.08);
            border-color: rgba(59, 130, 246, 0.3);
        }
    }
    
    /* Gating blur filter */
    div[data-testid="stVerticalBlock"]:has(#blur-anchor):not(:has(#question-box)) {
        filter: blur(8px) grayscale(30%);
        pointer-events: none;
        opacity: 0.4;
        user-select: none;
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    </style>
    """, unsafe_allow_html=True)

    st.title("Simply Supported Beam: UDL Reaction Solver")
    st.markdown("#### An Interactive Engineering Mechanics Classroom Demonstration")
    st.markdown("---")

    # 1. CONCEPT CHECK / GATING BOX (at the top)
    st.markdown('<div id="question-box"></div>', unsafe_allow_html=True)
    
    # Wrap question in a container
    with st.container():
        st.markdown("""
        <div class="concept-check-box">
            <div class="concept-title">🧠 Pre-Simulation Challenge: Concept Check</div>
            <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 15px;">
                To unlock the interactive beam model, test your understanding of beam mechanics first. 
                Select the <b>three (3) correct statements</b> from the options below and click <b>Submit Answers</b>.
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        # Render checkboxes
        c1 = st.checkbox(
            r"1. Due to the vertical symmetry of the load, the reaction forces at the ends are equal: $R_A = R_B = \frac{w \cdot L}{2}$.",
            value=st.session_state.c1,
            disabled=st.session_state.submitted
        )
        c2 = st.checkbox(
            r"2. For calculating external reactions, the distributed load of intensity $w$ can be represented as an equivalent concentrated force $W = w \cdot L$ acting at the beam's midpoint $x = L/2$.",
            value=st.session_state.c2,
            disabled=st.session_state.submitted
        )
        c3 = st.checkbox(
            r"3. If we double both the load intensity $w$ and the beam length $L$, the reaction forces $R_A$ and $R_B$ will quadruple.",
            value=st.session_state.c3,
            disabled=st.session_state.submitted
        )
        c4 = st.checkbox(
            r"4. The reaction force at the left pin support is twice as large as the right roller support because the pin resists horizontal forces.",
            value=st.session_state.c4,
            disabled=st.session_state.submitted
        )
        c5 = st.checkbox(
            r"5. Doubling only the beam length $L$ while keeping the load intensity $w$ constant will not change the reaction forces.",
            value=st.session_state.c5,
            disabled=st.session_state.submitted
        )
        c6 = st.checkbox(
            r"6. The units of the reaction forces $R_A$ and $R_B$ are kN/m, while the distributed load intensity $w$ is in kN.",
            value=st.session_state.c6,
            disabled=st.session_state.submitted
        )
        
        # Grading logic
        c1_correct = (c1 == True)
        c2_correct = (c2 == True)
        c3_correct = (c3 == True)
        c4_correct = (c4 == False)
        c5_correct = (c5 == False)
        c6_correct = (c6 == False)
        
        total_score = sum([c1_correct, c2_correct, c3_correct, c4_correct, c5_correct, c6_correct])
        
        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        
        if not st.session_state.submitted:
            if st.button("Submit Answers 🔓", type="primary"):
                st.session_state.c1 = c1
                st.session_state.c2 = c2
                st.session_state.c3 = c3
                st.session_state.c4 = c4
                st.session_state.c5 = c5
                st.session_state.c6 = c6
                st.session_state.submitted = True
                st.rerun()
        else:
            # Display grade and feedback
            if total_score == 6:
                st.success("🎉 **Fantastic! 6/6 Correct Classifications.** You have successfully unlocked the simulation!")
            else:
                st.warning(f"🔓 **Simulation Unlocked!** You got **{total_score}/6** correct classifications. Review the detailed statement feedback below, then interact with the sliders to see these principles in action!")
            
            # Detailed feedback cards
            st.markdown("### 🔍 Concept Feedback:")
            
            col_fb1, col_fb2 = st.columns(2)
            
            with col_fb1:
                if c1_correct:
                    st.markdown(r"✅ **Symmetry Statement: Correct!** " + ("You selected this." if c1 else "You left this unselected.") + "<br>Symmetry ensures that both reaction forces carry half of the total load: $R_A = R_B = wL/2$.", unsafe_allow_html=True)
                else:
                    st.markdown(r"❌ **Symmetry Statement: Incorrect.** " + ("You selected this, but it is true." if c1 else "You missed this statement; it is true.") + "<br>Symmetry dictates that the reactions must be equal: $R_A = R_B = wL/2$.", unsafe_allow_html=True)
                
                if c2_correct:
                    st.markdown(r"✅ **Resultant Centroid: Correct!** " + ("You selected this." if c2 else "You left this unselected.") + "<br>For external equilibrium calculations, a UDL acts through its centroid (midpoint of the beam).", unsafe_allow_html=True)
                else:
                    st.markdown(r"❌ **Resultant Centroid: Incorrect.** " + ("You selected this, but it is true." if c2 else "You missed this statement; it is true.") + "<br>The equivalent point load of a UDL acts exactly at the midpoint $L/2$ for reaction calculations.", unsafe_allow_html=True)
                
                if c3_correct:
                    st.markdown(r"✅ **Scaling Rule: Correct!** " + ("You selected this." if c3 else "You left this unselected.") + "<br>Since $R = wL/2$, doubling both $w$ and $L$ yields a $2 \\times 2 = 4$ times increase in reaction forces.", unsafe_allow_html=True)
                else:
                    st.markdown(r"❌ **Scaling Rule: Incorrect.** " + ("You selected this, but it is true." if c3 else "You missed this statement; it is true.") + "<br>Reaction force scale linearly with both $w$ and $L$, meaning doubling both quadruples the reactions: $R_{new} = \frac{(2w)(2L)}{2} = 4R$.", unsafe_allow_html=True)
            
            with col_fb2:
                if c4_correct:
                    st.markdown("✅ **Pin vs Roller: Correct!** " + ("You left this unchecked." if not c4 else "You selected this.") + "<br>Since the loading is purely vertical, there are no axial forces. Therefore, the horizontal reaction is zero, and the vertical reactions remain equal.", unsafe_allow_html=True)
                else:
                    st.markdown("❌ **Pin vs Roller: Incorrect.** " + ("You selected this, but it is false." if c4 else "You missed this statement; it is false.") + "<br>Even though the pin can resist horizontal forces, there are none here. Thus, vertical reaction forces are equal.", unsafe_allow_html=True)
                
                if c5_correct:
                    st.markdown("✅ **Length Scaling: Correct!** " + ("You left this unchecked." if not c5 else "You selected this.") + "<br>Doubling beam length $L$ doubles the total load, thereby doubling both reaction forces.", unsafe_allow_html=True)
                else:
                    st.markdown("❌ **Length Scaling: Incorrect.** " + ("You selected this, but it is false." if c5 else "You missed this statement; it is false.") + "<br>Reactions are directly proportional to length. Doubling $L$ doubles the reactions.", unsafe_allow_html=True)
                    
                if c6_correct:
                    st.markdown("✅ **Units Check: Correct!** " + ("You left this unchecked." if not c6 else "You selected this.") + "<br>Reactions are point forces (kN), whereas distributed loads are forces per unit length (kN/m). The statement incorrectly swapped them.", unsafe_allow_html=True)
                else:
                    st.markdown("❌ **Units Check: Incorrect.** " + ("You selected this, but it is false." if c6 else "You missed this statement; it is false.") + "<br>Reactions are concentrated forces (kN). Load intensity $w$ is a distributed force per meter (kN/m).", unsafe_allow_html=True)
            
            if st.button("Reset Challenge 🔄"):
                st.session_state.submitted = False
                st.session_state.c1 = False
                st.session_state.c2 = False
                st.session_state.c3 = False
                st.session_state.c4 = False
                st.session_state.c5 = False
                st.session_state.c6 = False
                st.rerun()

    st.markdown("---")
    
    # 2. INTERACTIVE DEMO CONTAINER (Blurred until submitted)
    demo_container = st.container()
    
    with demo_container:
        # If not submitted, render the anchor that triggers the CSS blur
        if not st.session_state.submitted:
            st.markdown('<div id="blur-anchor"></div>', unsafe_allow_html=True)
            st.info("🔒 Complete and submit the pre-simulation challenge above to unlock the interactive sliders and detailed analysis.")
            
        st.markdown("## 📊 Interactive Beam Model & Simulation")
        
        # Sliders for user input
        col_input1, col_input2 = st.columns(2)
        with col_input1:
            w = st.slider(
                "Distributed Load Intensity, $w$ (kN/m)",
                min_value=0.0,
                max_value=50.0,
                value=10.0,
                step=1.0,
                key="w_slider"
            )
        with col_input2:
            L = st.slider(
                "Beam Length, $L$ (m)",
                min_value=2.0,
                max_value=20.0,
                value=10.0,
                step=0.5,
                key="L_slider"
            )
            
        # Math Calculations
        W = w * L
        R_A = W / 2
        R_B = W / 2
        
        # Render premium summary cards
        st.markdown(f"""
        <div class="card-container">
            <div class="metric-card">
                <div class="metric-title">Beam Length (L)</div>
                <div class="metric-value">{L:.1f} m</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Load Intensity (w)</div>
                <div class="metric-value">{w:.1f} kN/m</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Resultant Load (W = w·L)</div>
                <div class="metric-value">{W:.1f} kN</div>
            </div>
            <div class="metric-card" style="border-bottom: 4px solid #0284c7;">
                <div class="metric-title">Left Reaction (R_A)</div>
                <div class="metric-value" style="color: #0284c7;">{R_A:.1f} kN</div>
            </div>
            <div class="metric-card" style="border-bottom: 4px solid #0f766e;">
                <div class="metric-title">Right Reaction (R_B)</div>
                <div class="metric-value" style="color: #0f766e;">{R_B:.1f} kN</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # --- PLOTLY GRAPHIC CONSTRUCTION ---
        fig = go.Figure()
        
        # Define Y axes headroom dynamically
        H_udl = 0.2 + 0.8 * (w / 50.0) if w > 0 else 0.2
        
        # 1. Draw Beam (thick slate horizontal line)
        fig.add_trace(go.Scatter(
            x=[0, L],
            y=[0, 0],
            mode='lines',
            line=dict(color='#475569', width=12),
            name='Beam',
            hoverinfo='text',
            hovertext=f'Simply Supported Beam<br>Length L = {L:.2f} m'
        ))
        
        # 2. Draw Left Support: Pin (A)
        fig.add_trace(go.Scatter(
            x=[-0.2, 0, 0.2, -0.2],
            y=[-0.3, 0, -0.3, -0.3],
            fill='toself',
            mode='lines',
            line=dict(color='#0284c7', width=2),
            fillcolor='rgba(2, 132, 199, 0.2)',
            name='Pin Support (A)',
            hoverinfo='text',
            hovertext='Pin Support (A) [Left End]<br>Restrains horizontal & vertical movement'
        ))
        
        # 3. Draw Right Support: Roller (B)
        fig.add_trace(go.Scatter(
            x=[L-0.2, L, L+0.2, L-0.2],
            y=[-0.22, 0, -0.22, -0.22],
            fill='toself',
            mode='lines',
            line=dict(color='#0f766e', width=2),
            fillcolor='rgba(15, 118, 110, 0.2)',
            name='Roller Support (B)',
            hoverinfo='text',
            hovertext='Roller Support (B) [Right End]<br>Restrains vertical movement only (allows horizontal expansion)'
        ))
        
        # Draw two tiny wheels under the roller support
        fig.add_trace(go.Scatter(
            x=[L-0.1, L+0.1],
            y=[-0.28, -0.28],
            mode='markers',
            marker=dict(size=8, color='#0f766e', symbol='circle'),
            showlegend=False,
            hoverinfo='skip'
        ))
        
        # 4. Draw Uniformly Distributed Load (UDL)
        if w > 0:
            fig.add_trace(go.Scatter(
                x=[0, L, L, 0, 0],
                y=[0, 0, H_udl, H_udl, 0],
                fill='toself',
                fillcolor='rgba(239, 68, 68, 0.12)',
                line=dict(color='rgba(239, 68, 68, 0.5)', width=2, dash='dash'),
                name='UDL',
                hoverinfo='text',
                hovertext=f'Uniformly Distributed Load (w)<br>Intensity = {w:.2f} kN/m'
            ))
            
            # Distribute load arrows inside the UDL box
            num_arrows = 9 if L < 8 else (13 if L > 14 else 11)
            for i in range(num_arrows):
                x_arrow = L * i / (num_arrows - 1)
                fig.add_annotation(
                    x=x_arrow, y=0.02,
                    ax=x_arrow, ay=H_udl,
                    xref="x", yref="y",
                    axref="x", ayref="y",
                    showarrow=True,
                    arrowhead=2,
                    arrowsize=1.0,
                    arrowwidth=1.5,
                    arrowcolor="rgba(239, 68, 68, 0.55)"
                )
                
        # 5. Draw Reaction Forces (Upward arrows)
        max_R = 500.0
        
        if R_A > 0:
            arrow_L_A = 0.3 + 0.8 * (R_A / max_R)
            fig.add_annotation(
                x=0, y=-0.05,
                ax=0, ay=-arrow_L_A - 0.05,
                xref="x", yref="y",
                axref="x", ayref="y",
                showarrow=True,
                arrowhead=2,
                arrowsize=1.4,
                arrowwidth=4.0,
                arrowcolor="#0284c7"
            )
            
            fig.add_annotation(
                x=0, y=-arrow_L_A - 0.22,
                text=f"<b>R<sub>A</sub> = {R_A:.1f} kN</b>",
                showarrow=False,
                font=dict(color="#0284c7", size=14, family="Outfit, sans-serif"),
                yref="y", xref="x"
            )
            
        if R_B > 0:
            arrow_L_B = 0.3 + 0.8 * (R_B / max_R)
            fig.add_annotation(
                x=L, y=-0.05,
                ax=L, ay=-arrow_L_B - 0.05,
                xref="x", yref="y",
                axref="x", ayref="y",
                showarrow=True,
                arrowhead=2,
                arrowsize=1.4,
                arrowwidth=4.0,
                arrowcolor="#0f766e"
            )
            
            fig.add_annotation(
                x=L, y=-arrow_L_B - 0.22,
                text=f"<b>R<sub>B</sub> = {R_B:.1f} kN</b>",
                showarrow=False,
                font=dict(color="#0f766e", size=14, family="Outfit, sans-serif"),
                yref="y", xref="x"
            )
            
        # 6. Draw Equivalent Concentrated Force
        if W > 0:
            ay_eq = H_udl + 0.35
            fig.add_annotation(
                x=L/2, y=0.03,
                ax=L/2, ay=ay_eq,
                xref="x", yref="y",
                axref="x", ayref="y",
                showarrow=True,
                arrowhead=3,
                arrowsize=1.1,
                arrowwidth=2.5,
                arrowcolor="#eab308"
            )
            
            fig.add_annotation(
                x=L/2, y=ay_eq + 0.1,
                text=f"<b>W = w·L = {W:.1f} kN</b><br>(Resultant at L/2)",
                showarrow=False,
                font=dict(color="#eab308", size=11, family="Outfit, sans-serif"),
                yref="y", xref="x",
                align="center"
            )
            
        # Figure Layout Styling
        fig.update_layout(
            xaxis=dict(
                title=dict(
                    text="Beam Span (x, meters)",
                    font=dict(size=13, family="Outfit, sans-serif")
                ),
                range=[-1.0, L + 1.0],
                dtick=2.0 if L > 10 else 1.0,
                showgrid=True,
                gridcolor="rgba(128, 128, 128, 0.1)",
                zeroline=False,
                showline=True,
                linecolor="rgba(128, 128, 128, 0.2)",
                tickfont=dict(family="Outfit, sans-serif")
            ),
            yaxis=dict(
                range=[-1.6, H_udl + 0.75],
                showgrid=False,
                zeroline=False,
                showticklabels=False,
                fixedrange=True
            ),
            plot_bgcolor="rgba(0, 0, 0, 0.0)",
            paper_bgcolor="rgba(0, 0, 0, 0.0)",
            showlegend=False,
            margin=dict(l=15, r=15, t=10, b=15),
            height=380,
            hovermode='closest'
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # 3. DETAILED LATEX STEP-BY-STEP CALCULATION
        st.markdown("## 📝 Detailed Calculation Walkthrough")
        st.markdown(r"""
        To calculate the reactions on a simply supported beam, we apply the equations of static equilibrium:
        $$\sum M = 0 \quad \text{and} \quad \sum F_y = 0$$
        Here is the step-by-step math for the current values:
        """)
        
        col_math1, col_math2 = st.columns(2)
        
        with col_math1:
            st.markdown("### Step 1: Calculate Total Equivalent Load ($W$)")
            st.markdown(f"The uniformly distributed load $w$ of intensity **{w:.2f} kN/m** spread over a length $L$ of **{L:.2f} m** is simplified to a single concentrated resultant force $W$ acting at the beam's center ($x = {L/2:.2f}$ m):")
            st.latex(rf"W = w \cdot L")
            st.latex(rf"W = {w:.2f} \text{{ kN/m}} \cdot {L:.2f} \text{{ m}} = {W:.2f} \text{{ kN}}")
            
            st.markdown(r"### Step 2: Sum of Moments about Support A ($\sum M_A = 0$)")
            st.markdown("Taking the left support (A) as the pivot, the clockwise moment from the distributed load $W$ must be balanced by the counter-clockwise moment from the right reaction $R_B$:")
            st.latex(rf"\sum M_A = 0 \implies R_B \cdot L - W \cdot \frac{L}{2} = 0")
            st.latex(rf"R_B \cdot {L:.2f} - {W:.2f} \cdot {L/2:.2f} = 0")
            st.latex(rf"R_B \cdot {L:.2f} = {W * L/2:.2f} \text{{ kN·m}}")
            st.latex(rf"R_B = \frac{{{W * L/2:.2f}}}{{{L:.2f}}} = {R_B:.2f} \text{{ kN}}")
            
        with col_math2:
            st.markdown(r"### Step 3: Sum of Vertical Forces ($\sum F_y = 0$)")
            st.markdown("Now, we apply vertical force equilibrium. The sum of the upward reaction forces ($R_A + R_B$) must equal the total downward load ($W$):")
            st.latex(rf"\sum F_y = 0 \implies R_A + R_B - W = 0")
            st.latex(rf"R_A + {R_B:.2f} - {W:.2f} = 0")
            st.latex(rf"R_A = {W:.2f} - {R_B:.2f} = {R_A:.2f} \text{{ kN}}")
            
            st.markdown("### Step 4: Verification of Symmetry")
            st.markdown("Because the load is symmetric across the span length:")
            st.latex(rf"R_A = R_B = \frac{{w \cdot L}}{{2}}")
            st.latex(rf"R_A = R_B = \frac{{{w:.2f} \cdot {L:.2f}}}{{2}} = {R_A:.2f} \text{{ kN}}")
            st.success(f"Verified: Left Support $R_A$ ({R_A:.2f} kN) + Right Support $R_B$ ({R_B:.2f} kN) = Total Load $W$ ({W:.2f} kN)")

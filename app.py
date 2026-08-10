import streamlit as st
from modules.course_data import UNITS
from modules.unit_views import show_unit_overview, show_topic_view

# Page configuration
st.set_page_config(
    page_title="Structural Mechanics Course Portal",
    page_icon="🏗️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize routing states
if "current_unit" not in st.session_state:
    st.session_state.current_unit = None
if "current_topic" not in st.session_state:
    st.session_state.current_topic = None

# Global styles and font imports
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

/* Apply Outfit font globally to standard text elements */
html, body, p, ol, ul, li, h1, h2, h3, h4, h5, h6, .stMarkdown, label, input, select {
    font-family: 'Outfit', sans-serif !important;
}

/* Apply Outfit font to course portal buttons specifically */
.stButton button {
    font-family: 'Outfit', sans-serif !important;
}

/* Dashboard styling */
.portal-header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    padding: 40px;
    border-radius: 20px;
    color: white;
    text-align: center;
    margin-bottom: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}
.portal-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: white !important;
    margin: 0 0 10px 0;
    letter-spacing: -0.5px;
    border: none;
    padding: 0;
}
.portal-desc {
    font-size: 1.15rem;
    opacity: 0.85;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
}

/* Unit Cards CSS */
.unit-card {
    background: white;
    border: 1px solid rgba(128, 128, 128, 0.15);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.unit-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.07);
}
.unit-card-badge {
    font-size: 0.72rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1.2px;
}

/* Cohesive dark mode adjustments */
@media (prefers-color-scheme: dark) {
    .unit-card {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.08);
    }
    .unit-card h3 {
        color: #f8fafc !important;
    }
    .unit-card p {
        color: #94a3b8 !important;
    }
}

/* Objectives Card styling */
.objectives-card {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(37, 99, 235, 0.03) 100%); 
    border: 1px solid rgba(59, 130, 246, 0.15); 
    border-radius: 12px; 
    padding: 20px; 
    margin-bottom: 25px;
}
.objectives-card ul {
    margin: 0;
    padding-left: 20px;
    line-height: 1.6;
    color: #475569;
}
@media (prefers-color-scheme: dark) {
    .objectives-card {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%); 
        border-color: rgba(59, 130, 246, 0.25);
    }
    .objectives-card ul {
        color: #cbd5e1;
    }
}
</style>
""", unsafe_allow_html=True)

# Check which page to render
if st.session_state.current_unit is None:
    # Render main dashboard Hub
    st.markdown("""
    <div class="portal-header">
        <h1 class="portal-title">🏗️ Structural Mechanics & Materials Portal</h1>
        <p class="portal-desc">An interactive engineering learning environment. Explore topics, simulate loadings, and master course materials.</p>
    </div>
    """, unsafe_allow_html=True)
    # Inject homepage-only CSS to make the entire unit cards clickable
    st.markdown("""
    <style>
    /* Scope column styling ONLY to columns containing .unit-card (the homepage) */
    div[data-testid="stColumn"]:has(.unit-card) {
        position: relative;
    }
    /* Stretch the element-container parent of the button to cover the entire card */
    div[data-testid="stColumn"]:has(.unit-card) div:has(> div[data-testid="stButton"]) {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 10 !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    /* Make the button fill the parent element-container and hide it */
    div[data-testid="stColumn"]:has(.unit-card) div[data-testid="stButton"],
    div[data-testid="stColumn"]:has(.unit-card) div[data-testid="stButton"] button {
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        opacity: 0 !important;
        cursor: pointer !important;
    }
    /* Re-route hover effects to activate when column is hovered */
    div[data-testid="stColumn"]:has(.unit-card):hover .unit-card {
        transform: translateY(-5px);
        box-shadow: 0 12px 25px rgba(0, 0, 0, 0.07);
        border-color: rgba(128, 128, 128, 0.3);
    }
    @media (prefers-color-scheme: dark) {
        div[data-testid="stColumn"]:has(.unit-card):hover .unit-card {
            border-color: rgba(255, 255, 255, 0.2);
        }
    }
    </style>
    """, unsafe_allow_html=True)

    # Calculate and display course progress
    total_completed = 0
    total_topics = 0
    for u_key, u_val in UNITS.items():
        completed_key = f"{u_key}_completed_topics"
        if completed_key in st.session_state:
            total_completed += len(st.session_state[completed_key])
        total_topics += len(u_val["topics"])
        
    progress_percentage = (total_completed / total_topics) if total_topics > 0 else 0.0
    
    st.markdown(f"### 📊 Overall Course Progress: {total_completed} / {total_topics} Topics Mastered")
    st.progress(progress_percentage)
    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    
    # 2x2 grid of units
    row1_col1, row1_col2 = st.columns(2)
    row2_col1, row2_col2 = st.columns(2)
    
    # Unit 1: Forces, Moments, & Particle Equilibrium
    with row1_col1:
        u = UNITS["unit1"]
        st.markdown(f"""
        <div class="unit-card" style="border-left: 6px solid {u['accent_color']};">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 2.2rem;">{u['icon']}</span>
                <div>
                    <span class="unit-card-badge">{u['badge']}</span>
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; border: none; padding: 0;">{u['title']}</h3>
                </div>
            </div>
            <p style="font-size: 0.92rem; color: #475569; line-height: 1.5; margin-bottom: 12px; height: 60px; overflow: hidden;">{u['desc']}</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Explore Unit 1 ➡️", key="enter_unit1", use_container_width=True, type="primary"):
            st.session_state.current_unit = "unit1"
            st.session_state.current_topic = None
            st.rerun()

    # Unit 2: Rigid Body Equilibrium
    with row1_col2:
        u = UNITS["unit2"]
        st.markdown(f"""
        <div class="unit-card" style="border-left: 6px solid {u['accent_color']};">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 2.2rem;">{u['icon']}</span>
                <div>
                    <span class="unit-card-badge">{u['badge']}</span>
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; border: none; padding: 0;">{u['title']}</h3>
                </div>
            </div>
            <p style="font-size: 0.92rem; color: #475569; line-height: 1.5; margin-bottom: 12px; height: 60px; overflow: hidden;">{u['desc']}</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Explore Unit 2 ➡️", key="enter_unit2", use_container_width=True, type="primary"):
            st.session_state.current_unit = "unit2"
            st.session_state.current_topic = None
            st.rerun()

    # Unit 3: Stress, Strain, Axial & Torsional Loading
    with row2_col1:
        u = UNITS["unit3"]
        st.markdown(f"""
        <div class="unit-card" style="border-left: 6px solid {u['accent_color']};">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 2.2rem;">{u['icon']}</span>
                <div>
                    <span class="unit-card-badge">{u['badge']}</span>
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; border: none; padding: 0;">{u['title']}</h3>
                </div>
            </div>
            <p style="font-size: 0.92rem; color: #475569; line-height: 1.5; margin-bottom: 12px; height: 60px; overflow: hidden;">{u['desc']}</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Explore Unit 3 ➡️", key="enter_unit3", use_container_width=True, type="primary"):
            st.session_state.current_unit = "unit3"
            st.session_state.current_topic = None
            st.rerun()

    # Unit 4: Beams and Wing Design Project
    with row2_col2:
        u = UNITS["unit4"]
        st.markdown(f"""
        <div class="unit-card" style="border-left: 6px solid {u['accent_color']};">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 2.2rem;">{u['icon']}</span>
                <div>
                    <span class="unit-card-badge">{u['badge']}</span>
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; border: none; padding: 0;">{u['title']}</h3>
                </div>
            </div>
            <p style="font-size: 0.92rem; color: #475569; line-height: 1.5; margin-bottom: 12px; height: 60px; overflow: hidden;">{u['desc']}</p>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Explore Unit 4 ➡️", key="enter_unit4", use_container_width=True, type="primary"):
            st.session_state.current_unit = "unit4"
            st.session_state.current_topic = None
            st.rerun()
            
else:
    # Render unit routing and sidebar spoke view
    unit_key = st.session_state.current_unit
    unit = UNITS[unit_key]
    
    # 1. Left Sidebar content
    with st.sidebar:
        if st.button("⬅ Return to Course Home", use_container_width=True, type="secondary"):
            st.session_state.current_unit = None
            st.session_state.current_topic = None
            st.rerun()
            
        st.markdown("---")
        st.markdown(f"### {unit['icon']} {unit['badge']}")
        st.markdown(f"**{unit['title']}**")
        st.markdown("---")
        
        # Build options list for radio selection
        topics_options = ["Unit Overview"] + unit["topics"]
        
        # Find selected index
        default_index = 0
        if st.session_state.current_topic in unit["topics"]:
            default_index = unit["topics"].index(st.session_state.current_topic) + 1
            
        # Dynamic key to force reset on programmatic topic changes
        radio_key = f"sidebar_nav_{st.session_state.current_topic}"
        
        selected_nav = st.radio(
            "Navigate Curriculum:",
            options=topics_options,
            index=default_index,
            key=radio_key
        )
        
        # Update topic in session state based on sidebar radio selection
        if selected_nav == "Unit Overview":
            if st.session_state.current_topic is not None:
                st.session_state.current_topic = None
                st.rerun()
        else:
            if st.session_state.current_topic != selected_nav:
                st.session_state.current_topic = selected_nav
                st.rerun()
                
        # Sidebar Glossary / Information Box
        st.markdown("---")
        if st.session_state.current_topic == "Lesson 14: Centroids and Distributed Loads":
            st.markdown("### 🏗️ Support Representations")
            st.info("📌 **Left (Pin):** Blue triangle. Prevents horizontal and vertical motion.")
            st.success("🟢 **Right (Roller):** Green triangle on rollers. Prevents vertical motion, allows horizontal slip.")
        else:
            st.markdown("### 🏗️ Mechanics Guide Glossary")
            st.markdown(r"""
            - **Equilibrium**: Static condition where net forces and moments sum to zero ($\sum F = 0$, $\sum M = 0$).
            - **Simply Supported**: Restrained vertically at both ends (Left Pin, Right Roller).
            - **Stress ($\sigma, \tau$)**: Internal resistance intensity (force per area, $N/mm^2$ or $MPa$).
            - **UDL**: Uniformly distributed load spread evenly along length.
            """)
        
    # 2. Main Page content based on selection
    if st.session_state.current_topic is None:
        show_unit_overview(unit_key)
    else:
        show_topic_view(unit_key, st.session_state.current_topic)

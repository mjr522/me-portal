import streamlit as st
import numpy as np
from modules.course_data import UNITS
from modules.beam_simulator import run_beam_simulator
from modules.shear_moment_diagrams import run_shear_moment_diagrams
from modules.vector_resolution import run_vector_resolution
from modules.vector_addition import run_vector_addition
from modules.particle_equilibrium import run_particle_equilibrium
from modules.moment_torque import run_moment_torque
from modules.couple_systems import run_couple_systems
from modules.rigid_body_equilibrium import run_rigid_body_equilibrium
from modules.truss_joints import run_truss_joints
from modules.truss_sections import run_truss_sections
from modules.normal_stress import run_normal_stress
from modules.stress_strain_axial import run_stress_strain_axial
from modules.design_considerations import run_design_considerations
from modules.shear_stress import run_shear_stress
from modules.torsion_shear import run_torsion_shear
from modules.angle_of_twist import run_angle_of_twist
from modules.area_moment_inertia import run_area_moment_inertia
from modules.parallel_axis import run_parallel_axis
from modules.pure_bending import run_pure_bending
from modules.beam_deflection import run_beam_deflection
from modules.combined_loading import run_combined_loading
from modules.design_process import run_design_process




def show_unit_overview(unit_key):
    unit = UNITS[unit_key]
    
    st.markdown(f"""
    <div style="background: {unit['color_gradient']}; padding: 30px; border-radius: 18px; color: white; margin-bottom: 30px;">
        <span style="background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px;">{unit['badge']}</span>
        <h1 style="margin-top: 10px; margin-bottom: 10px; font-weight: 700; color: white; border: none; padding: 0;">{unit['icon']} {unit['title']}</h1>
        <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 0;">{unit['desc']}</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("### 📚 Unit Curriculum & Topics")
        st.markdown("Select a topic from the sidebar or click one below to open the interactive lesson sandbox:")
        
        # Display topics as a visual list of cards
        for idx, topic in enumerate(unit["topics"]):
            is_sim = (unit_key == "unit1" and ("Lesson 2" in topic or "Lesson 3" in topic or "Lesson 4" in topic or "Lesson 6" in topic or "Lesson 7" in topic)) or \
                     (unit_key == "unit2" and ("Lesson 11" in topic or "Lesson 14" in topic or "Lesson 15" in topic or "Lesson 16" in topic)) or \
                     (unit_key == "unit3" and ("Lesson 20" in topic or "Lesson 21" in topic or "Lesson 23" in topic or "Lesson 25" in topic or "Lesson 26" in topic or "Lesson 27" in topic)) or \
                     (unit_key == "unit4" and ("Lesson 30" in topic or "Lesson 31" in topic or "Lesson 32" in topic or "Lesson 33" in topic or "Lesson 34" in topic or "Lesson 36" in topic or "Lesson 37" in topic))
            topic_badge = "🔥 Interactive Simulator" if is_sim else "📝 Conceptual Lesson"
            badge_color = "#ea580c" if is_sim else "#475569"

            
            # Use small columns to align topic text and a button
            subcol_text, subcol_btn = st.columns([3, 1])
            with subcol_text:
                st.markdown(f"""
                <div style="padding: 10px 0;">
                    <div style="font-weight: 600; font-size: 1.05rem;">{idx+1}. {topic}</div>
                    <span style="background: {badge_color}; color: white; font-size: 0.72rem; padding: 2px 8px; border-radius: 10px; font-weight: 500; display: inline-block; margin-top: 4px;">{topic_badge}</span>
                </div>
                """, unsafe_allow_html=True)
            with subcol_btn:
                st.write("") # Add spacing
                if st.button("Launch Lesson", key=f"launch_{unit_key}_{idx}", use_container_width=True):
                    st.session_state.current_topic = topic
                    st.rerun()
            st.markdown("<hr style='margin: 8px 0; opacity: 0.15;' />", unsafe_allow_html=True)
                    
    with col2:
        st.markdown("### 🏆 Unit Progress")
        # Let's count completed topics from session state
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        completed_set = st.session_state[completed_key]
        num_topics = len(unit["topics"])
        num_completed = len(completed_set)
        progress = num_completed / num_topics if num_topics > 0 else 0.0
        
        # Progress circular style
        st.markdown(f"""
        <div style="background: rgba(128, 128, 128, 0.03); border: 1.5px solid rgba(128, 128, 128, 0.1); border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <div style="font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">COMPLETION PROGRESS</div>
            <div style="font-size: 2.5rem; font-weight: 800; color: {unit['accent_color']}">{num_completed} / {num_topics}</div>
            <div style="font-size: 0.9rem; color: #64748b; margin-top: 5px;">Topics Mastered</div>
        </div>
        """, unsafe_allow_html=True)
        
        st.progress(progress)
        
        st.markdown("""
        ### 💡 Study Guide
        - **Read the glossary** in the sidebar to review core mechanics concepts.
        - **Unlock simulations** by answering the Pre-Simulation challenges.
        - **Verify your math** using the step-by-step equilibrium solvers.
        """)

def show_topic_view(unit_key, topic_name):
    unit = UNITS[unit_key]
    
    # Check if this is the active simulator
    if unit_key == "unit1" and topic_name == "Lesson 2: Lab Tour; Fund. Skills Review; Units":
        run_vector_resolution()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit1" and topic_name == "Lesson 3: Statics of Particles: Adding Forces":
        run_vector_addition()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit1" and topic_name == "Lesson 4: Forces & Equilibrium in a Plane  Free Body Diagrams":
        run_particle_equilibrium()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit1" and topic_name == "Lesson 6: Forces and Moments":
        run_moment_torque()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit1" and topic_name == "Lesson 7: Couples and Force-Couple Systems":
        run_couple_systems()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit2" and topic_name == "Lesson 11: Intro to Equilibrium of Rigid Bodies":
        run_rigid_body_equilibrium()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit2" and topic_name == "Lesson 15: Truss Analysis:  Method of Joints":
        run_truss_joints()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit2" and topic_name == "Lesson 16: Truss Analysis:  Method of Sections":
        run_truss_sections()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit2" and topic_name == "Lesson 14: Centroids and Distributed Loads":
        run_beam_simulator()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and the formulas, mark the topic as complete to update your dashboard progress!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit3" and topic_name == "Lesson 20: Normal Stress":
        run_normal_stress()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit3" and topic_name == "Lesson 21: Normal Stress & Strain:  Axial Loading":
        run_stress_strain_axial()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit3" and topic_name == "Lesson 23: Design Considerations:  Material Properties, Allowable Stress, Failure Modes, Factor of Safety":
        run_design_considerations()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit3" and topic_name == "Lesson 25: Shear Stress":
        run_shear_stress()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit3" and topic_name == "Lesson 26: Shear Stress due to Torsion":
        run_torsion_shear()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit3" and topic_name == "Lesson 27: Angle of Twist; Solving Torsion Problems":
        run_angle_of_twist()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit4" and topic_name == "Lesson 30: Area Moment of Inertia":
        run_area_moment_inertia()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit4" and topic_name == "Lesson 31: Area Moment of Inertia:  Parallel Axis Theorem":
        run_parallel_axis()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit4" and topic_name == "Lesson 32: Pure Bending":
        run_pure_bending()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit4" and topic_name == "Lesson 33: Stresses and Deformations due to Bending":
        run_beam_deflection()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit4" and topic_name == "Lesson 34: Combined Loading":
        run_combined_loading()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit4" and "Lesson 36" in topic_name:
        run_shear_moment_diagrams()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and diagrams, mark the topic as complete to update your dashboard progress!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return

    if unit_key == "unit4" and topic_name == "Lesson 37: Engineering Design Process":
        run_design_process()
        # Add a progress marker at the bottom of the simulator
        completed_key = f"{unit_key}_completed_topics"
        if completed_key not in st.session_state:
            st.session_state[completed_key] = set()
            
        st.markdown("---")
        col_mark1, col_mark2 = st.columns([2, 1])
        with col_mark1:
            st.info("💡 Tip: Once you have fully explored the simulation and completed the challenges, mark the topic as complete!")
        with col_mark2:
            is_completed = topic_name in st.session_state[completed_key]
            if is_completed:
                if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                    st.session_state[completed_key].remove(topic_name)
                    st.rerun()
            else:
                if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                    st.session_state[completed_key].add(topic_name)
                    st.rerun()
        return


    # Render standard lesson sandbox placeholder
    st.markdown(f"""
    <div style="border-bottom: 1.5px solid rgba(128,128,128,0.2); padding-bottom: 15px; margin-bottom: 25px;">
        <span style="color: {unit['accent_color']}; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">{unit['badge']} • Topic Study</span>
        <h1 style="margin: 5px 0 0 0; font-weight: 700;">{topic_name}</h1>
    </div>
    """, unsafe_allow_html=True)
    
    # Render objectives if they exist for this topic
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
        
    # Render interactive mock sandbox
    st.info("🔬 **Topic Sandbox Environment**: Interactive formulas and concepts are simulated below.")
    
    # Render customized sandbox features based on topic
    if "Vector" in topic_name or "Force" in topic_name or "Moment" in topic_name:
        st.markdown("### 🧮 Interactive Vector Calculator")
        st.write("Adjust the force magnitude and direction to calculate components and moments:")
        col_sl1, col_sl2 = st.columns(2)
        with col_sl1:
            f_val = st.slider("Force Magnitude, F (kN)", 0.0, 100.0, 50.0, 1.0)
        with col_sl2:
            theta_val = st.slider("Force Angle, θ (degrees)", 0.0, 90.0, 45.0, 5.0)
            
        theta_rad = np.radians(theta_val)
        fx = f_val * np.cos(theta_rad)
        fy = f_val * np.sin(theta_rad)
        
        st.markdown(f"""
        <div style="background: rgba(128,128,128,0.03); border: 1px dashed rgba(128,128,128,0.2); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <div style="font-weight: 600; margin-bottom: 10px; color: #475569;">Calculated Components:</div>
            <ul style="margin: 0; padding-left: 20px;">
                <li>Horizontal Component: <b>F<sub>x</sub> = F · cos(θ) = {fx:.2f} kN</b></li>
                <li>Vertical Component: <b>F<sub>y</sub> = F · sin(θ) = {fy:.2f} kN</b></li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
    elif "Stress" in topic_name or "Strain" in topic_name or "Axial" in topic_name:
        st.markdown("### 📏 Stress-Strain Calculator")
        st.write("Adjust the axial force and cross-sectional area to calculate normal stress:")
        col_sl1, col_sl2 = st.columns(2)
        with col_sl1:
            p_val = st.slider("Axial Force, P (kN)", 0.0, 500.0, 120.0, 5.0)
        with col_sl2:
            a_val = st.slider("Cross-Sectional Area, A (mm²)", 100.0, 2000.0, 500.0, 50.0)
            
        stress = (p_val * 1000) / a_val  # N/mm2 = MPa
        
        st.markdown(f"""
        <div style="background: rgba(128,128,128,0.03); border: 1px dashed rgba(128,128,128,0.2); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <div style="font-weight: 600; margin-bottom: 10px; color: #475569;">Calculated Normal Stress:</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: {unit['accent_color']};">σ = P / A = {stress:.2f} MPa</div>
            <div style="font-size: 0.85rem; color: #64748b; margin-top: 5px;">(1 MPa = 1 N/mm² = 1,000,000 N/m²)</div>
        </div>
        """, unsafe_allow_html=True)
        
    else:
        st.markdown("### 📚 Lesson Sandbox Concepts")
        st.write("This sandbox displays interactive conceptual structures, learning objectives, and roadmaps for this specific topic.")
        
        st.markdown(f"""
        <div style="background: rgba(128,128,128,0.03); border: 1.5px solid rgba(128,128,128,0.1); border-radius: 14px; padding: 20px; margin-bottom: 25px;">
            <h4 style="margin-top: 0; font-weight: 600; color: {unit['accent_color']};">🎯 Core Concepts Covered</h4>
            <ol style="margin-bottom: 0; padding-left: 20px;">
                <li>Foundational mechanics theories related to <b>{topic_name}</b>.</li>
                <li>Mathematical model formulation, structural diagrams, and assumptions.</li>
                <li>Design applications, loading scenarios, and analytical solving procedures.</li>
            </ol>
        </div>
        """, unsafe_allow_html=True)

    # Global interactive state elements for placeholders
    st.markdown("### 📈 Student Lab Activity")
    st.markdown("Check off tasks as you read the textbooks and complete the associated tutorial sheet:")
    
    col_cb1, col_cb2 = st.columns(2)
    with col_cb1:
        st.checkbox("Read textbook section on this topic", key=f"cb_read_{topic_name}")
        st.checkbox("Review lecture notes & derivation steps", key=f"cb_notes_{topic_name}")
    with col_cb2:
        st.checkbox("Attempt tutorial workbook questions", key=f"cb_tut_{topic_name}")
        st.checkbox("Validate numerical answers", key=f"cb_val_{topic_name}")
        
    st.markdown("---")
    
    # Progress completion marker
    completed_key = f"{unit_key}_completed_topics"
    if completed_key not in st.session_state:
        st.session_state[completed_key] = set()
        
    col_mark1, col_mark2 = st.columns([2, 1])
    with col_mark1:
        st.info("Marking a topic as complete updates your overall unit progress visible on the dashboard.")
    with col_mark2:
        is_completed = topic_name in st.session_state[completed_key]
        if is_completed:
            if st.button("✅ Topic Completed! (Click to Undo)", use_container_width=True):
                st.session_state[completed_key].remove(topic_name)
                st.rerun()
        else:
            if st.button("Mark Topic as Complete 🎯", type="primary", use_container_width=True):
                st.session_state[completed_key].add(topic_name)
                st.rerun()

// ME220: Structural Mechanics & Materials Course Data

export const me220Course = {
  id: "me220",
  code: "ME 220",
  title: "Fundamentals of Mechanics",
  subtitle: "An Interactive Engineering Learning Portal",
  description: "Explore fundamental static equilibrium, stress and strain, torsion, beam bending, and structural wing design.",
  badge: "Core Mechanics",
  units: {
    unit1: {
      id: "unit1",
      title: "Forces, Moments, & Particle Equilibrium",
      badge: "Unit 1",
      icon: "📐",
      desc: "Master the fundamentals of force systems, vectors, moments, couples, and particle equilibrium.",
      color_gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      accent_color: "#3b82f6",
      topics: [
        "Lesson 1: Course Introduction",
        "Lesson 2: Lab Tour; Fund. Skills Review; Units",
        "Lesson 3: Statics of Particles: Adding Forces",
        "Lesson 4: Forces & Equilibrium in a Plane Free Body Diagrams",
        "Lesson 5: Solving 2D Equilibrium Problems",
        "Lesson 6: Forces and Moments",
        "Lesson 7: Couples and Force-Couple Systems",
        "Lesson 8: Solving Moment Equations",
        "Lesson 9: Review for GR 1",
        "Lesson 10: Graded Review #1"
      ],
      objectives: {
        "Lesson 2: Lab Tour; Fund. Skills Review; Units": [
          "2.1. Apply correct numerical techniques—such as appropriate use of significant figures, rounding conventions, and unit conversions—in solving mechanics problems.",
          "2.2. Select and use appropriate metric (SI) and Imperial (English) units for forces, masses, lengths, and other physical quantities based on the context of a mechanics problem.",
          "2.3. Apply trigonometric functions and special triangle relationships to resolve vectors into components and solve for a resultant force's magnitude and direction."
        ],
        "Lesson 3: Statics of Particles: Adding Forces": [
          "3.1. Resolve a force vector into orthogonal components.",
          "3.2. Calculate the resultant force of a force system."
        ],
        "Lesson 4: Forces & Equilibrium in a Plane Free Body Diagrams": [
          "4.1. Define equilibrium in accordance with Newton's 2nd Law of Motion",
          "4.2. Draw a complete Free Body Diagram",
          "4.3. Apply equilibrium conditions to solve for unknowns in force systems using 2D equations of equilibrium"
        ],
        "Lesson 6: Forces and Moments": [
          "6.1. Recall the units of moments are force times distance (e.g., N-m, kN-m, lb-ft, kip-in) and understand their physical significance.",
          "6.2. Explain the concept of moments and how they produce rotational effects on mechanical systems, including aircraft and spacecraft (pitch, roll, and yaw).",
          "6.3. Calculate moments produced by forces about a point or axis using vector and scalar methods."
        ],
        "Lesson 7: Couples and Force-Couple Systems": [
          "7.1. Define a couple and analyze the equivalence between couple systems",
          "7.2. Simplify complex systems of forces and couples by combining them into equivalent resultant moments",
          "7.3. Calculate moments produced by individual forces and couple systems, including determining resultant moments about a point or axis"
        ]
      }
    },
    unit2: {
      id: "unit2",
      title: "Rigid Body Equilibrium",
      badge: "Unit 2",
      icon: "⚖️",
      desc: "Analyze the conditions of equilibrium for rigid structures, trusses, frames, and machine assemblies.",
      color_gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      accent_color: "#10b981",
      topics: [
        "Lesson 11: Intro to Equilibrium of Rigid Bodies",
        "Lesson 12: Equilibrium of Rigid Bodies II",
        "Lesson 13: Solving Equilibrium Problems",
        "Lesson 14: Centroids and Distributed Loads",
        "Lesson 15: Truss Analysis: Method of Joints",
        "Lesson 16: Truss Analysis: Method of Sections",
        "Lesson 17: Solving Truss Analysis Problems",
        "Lesson 18: Review for GR 2",
        "Lesson 19: Graded Review #2"
      ],
      objectives: {
        "Lesson 11: Intro to Equilibrium of Rigid Bodies": [
          "11.1. Apply concepts of supports and support reactions to 2D equilibrium conditions.",
          "11.2. Identify support types and model external interactions of a body as reaction forces and moments.",
          "11.3. Draw a complete FBD for a 2D structure.",
          "11.4. Solve for reaction forces in 2D rigid body problems using equilibrium conditions."
        ],
        "Lesson 14: Centroids and Distributed Loads": [
          "14.1. Define the centroids/centers of gravity of an area and of a volume.",
          "14.2. Determine the centroid of a 2D body and/or distributed load from tables, using the method of composites.",
          "14.3. Simplify distributed loads into a point load equivalent."
        ],
        "Lesson 15: Truss Analysis: Method of Joints": [
          "15.1. Describe a truss.",
          "15.2. Define an internal force.",
          "15.3. Apply the Method of Joints to solve for internal forces within a 2D truss, noting each joint is treated as a 2D particle equilibrium problem."
        ],
        "Lesson 16: Truss Analysis: Method of Sections": [
          "16.1. Draw a complete FBD of a truss system for either solution process – Method of Joints and Method of Sections.",
          "16.2. Apply the Method of Sections to solve for internal forces within a 2D truss."
        ]
      }
    },
    unit3: {
      id: "unit3",
      title: "Stress, Strain, Axial & Torsional Loading",
      badge: "Unit 3",
      icon: "🔩",
      desc: "Explore internal loadings, axial deformation, torsion, and mechanical properties of materials.",
      color_gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
      accent_color: "#f97316",
      topics: [
        "Lesson 20: Normal Stress",
        "Lesson 21: Normal Stress & Strain: Axial Loading",
        "Lesson 22: Solving Normal Stress & Strain Problems",
        "Lesson 23: Design Considerations: Material Properties, Allowable Stress, Failure Modes, Factor of Safety",
        "Lesson 24: Tensile Test Lab",
        "Lesson 25: Shear Stress",
        "Lesson 26: Shear Stress due to Torsion",
        "Lesson 27: Angle of Twist; Solving Torsion Problems",
        "Lesson 28: Review for GR 3",
        "Lesson 29: Graded Review #3"
      ],
      objectives: {
        "Lesson 20: Normal Stress": [
          "20.1. Explain the concept of stress.",
          "20.2. Recognize axial loading from given problem statements.",
          "20.3. Recognize bearing loads from given problem statements.",
          "20.4. Calculate normal and bearing stress."
        ],
        "Lesson 21: Normal Stress & Strain: Axial Loading": [
          "21.1. Explain the concept of strain.",
          "21.2. Calculate a strain value.",
          "21.3. Describe Hooke's Law and when/how to use it.",
          "21.4. Derive the elastic deformation equation.",
          "21.5. Extract material properties from a stress-strain curve.",
          "21.6. Calculate elongation using the elastic deformation equation."
        ],
        "Lesson 23: Design Considerations: Material Properties, Allowable Stress, Failure Modes, Factor of Safety": [
          "23.1. Explain the difference between Stress and Strength.",
          "23.2. Calculate the Factor of Safety of engineering structures.",
          "23.3. Use a given Factor of Safety to make design choices (like maximum loads, minimum dimensions, and material choices)."
        ],
        "Lesson 25: Shear Stress": [
          "25.1. Recognize shear loading based on given problem statement.",
          "25.2. Distinguish between single and double shear.",
          "25.3. Calculate shear stress."
        ],
        "Lesson 26: Shear Stress due to Torsion": [
          "26.1. Recognize torsion and torque based on a given problem statement.",
          "26.2. Draw FBDs of torque shafts and solve for internal torques.",
          "26.3. Determine shearing stresses and strains in a circular shaft subjected to torsion.",
          "26.4. Calculate shear stress in shafts caused by torsion."
        ],
        "Lesson 27: Angle of Twist; Solving Torsion Problems": [
          "27.1. Define angle of twist in a circular shaft subjected to torsion.",
          "27.2. Calculate angle of twist in shafts caused by torsion."
        ]
      }
    },
    unit4: {
      id: "unit4",
      title: "Beams and Wing Design Project",
      badge: "Unit 4",
      icon: "✈️",
      desc: "Design beams under bending, plot shear and moment diagrams, and apply knowledge to wing design.",
      color_gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      accent_color: "#8b5cf6",
      topics: [
        "Lesson 30: Area Moment of Inertia",
        "Lesson 31: Area Moment of Inertia: Parallel Axis Theorem",
        "Lesson 32: Pure Bending",
        "Lesson 33: Stresses and Deformations due to Bending",
        "Lesson 34: Combined Loading",
        "Lesson 35: Solving Combined Loading / Bending Stress and Deformation Problems",
        "Lesson 36: Shear & Bending Moment Diagrams (graphical)",
        "Lesson 37: Engineering Design Process",
        "Lesson 38: Intro to Wing DBT",
        "Lesson 39: Wing Build Day",
        "Lesson 40: Wing Test Day",
        "Lesson 41: Final Exam Review"
      ],
      objectives: {
        "Lesson 30: Area Moment of Inertia": [
          "30.1. Explain that area moment of inertia is a geometric property that quantifies a cross-section's resistance to bending.",
          "30.2. Explain the difference in bending resistance between a board placed on its side versus on its edge.",
          "30.3. Calculate the area moment of inertia for common structural beam shapes like rectangles, box beams, I-beams, and circular beams and demonstrate correct use of units."
        ],
        "Lesson 31: Area Moment of Inertia: Parallel Axis Theorem": [
          "31.1. Calculate the area moment of inertia for more complex shapes using Parallel Axis Theorem."
        ],
        "Lesson 32: Pure Bending": [
          "32.1. Describe the basic principles of bending.",
          "32.2. Identify the internal forces and stresses in a beam in bending, including tension, compression, and the neutral axis.",
          "32.3. Define and explain the roles of tension, compression, and the neutral axis in a beam under a bending load.",
          "32.4. Calculate the maximum bending stress on a beam.",
          "32.5. Draw FBDs and calculate the max internal bending moment for a simply supported beam under bending loads."
        ],
        "Lesson 33: Stresses and Deformations due to Bending": [
          "33.1. Explain the physical concept of bending in beams and how it differs from axial loading.",
          "33.2. Describe the internal stress distribution in a beam under pure bending, identifying regions of tension, compression, and the neutral axis.",
          "33.3. Determine the maximum bending stress in a beam when given the applied moment and section properties.",
          "33.4. Calculate the elastic deflection of a beam in bending using Appendix E.",
          "33.5. Understand the design implications for a beam in bending (aircraft wings, bridge beams)."
        ],
        "Lesson 34: Combined Loading": [
          "34.1. Explain how to mathematically combine bending (normal) stresses and axial (normal) stresses.",
          "34.2. Calculate the combined normal stresses due to bending and axial loads in a structural member.",
          "34.3. Identify the most severe stress situation."
        ],
        "Lesson 35: Solving Combined Loading / Bending Stress and Deformation Problems": [],
        "Lesson 36: Shear & Bending Moment Diagrams (graphical)": [
          "36.1. Explain the benefit of graphing shear force and bending moment diagrams.",
          "36.2. Graph shear force diagrams using a FBD.",
          "36.3. Graph bending moment diagrams using shear force diagrams."
        ],
        "Lesson 37: Engineering Design Process": [
          "37.1. Recognize steps in the design process.",
          "37.2. Correctly use multiple decision-making tools to select the best option."
        ]
      }
    }
  }
};

// ME 330: Mechanics of Deformable Bodies Course Data Catalog

export const me330Course = {
  id: "me330",
  code: "ME 330",
  title: "Mechanics of Deformable Bodies",
  subtitle: "Advanced Stress, Strain, & Structural Failure Analysis",
  description: "Explore 3D stress states, plane stress transformations, Mohr's Circle, elastic beam deflections, column buckling, and failure theories.",
  badge: "Advanced Mechanics",
  units: {
    unit1: {
      id: "unit1",
      title: "Stress & Strain Transformation & Mohr's Circle",
      badge: "Unit 1",
      icon: "🔄",
      desc: "Analyze 2D/3D plane stress transformations, principal stresses, maximum shear stress, and Mohr's Circle.",
      color_gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
      accent_color: "#06b6d4",
      topics: [
        "Lesson 1: Plane Stress Transformation Equations",
        "Lesson 2: Principal Stresses & Max In-Plane Shear",
        "Lesson 3: Interactive Mohr's Circle Simulator",
        "Lesson 4: Strain Transformation & Strain Rosettes",
        "Lesson 5: Generalized Hooke's Law for 3D States"
      ]
    },
    unit2: {
      id: "unit2",
      title: "Advanced Beam Deflections & Energy Methods",
      badge: "Unit 2",
      icon: "📊",
      desc: "Apply double integration, singularity functions, and Castigliano's Theorem to solve statically indeterminate beams.",
      color_gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      accent_color: "#8b5cf6",
      topics: [
        "Lesson 6: Slope and Deflection by Double Integration",
        "Lesson 7: Singularity Functions for Complex Loading",
        "Lesson 8: Statically Indeterminate Beam Analysis",
        "Lesson 9: Strain Energy & Castigliano's Theorem"
      ]
    },
    unit3: {
      id: "unit3",
      title: "Buckling of Columns & Elastic Stability",
      badge: "Unit 3",
      icon: "🏛️",
      desc: "Evaluate critical buckling loads, Euler column formulas, effective length factors, and eccentric column loading.",
      color_gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      accent_color: "#f59e0b",
      topics: [
        "Lesson 10: Euler Buckling Formula for Pin-Ended Columns",
        "Lesson 11: Effective Length Factors (K) for Column Supports",
        "Lesson 12: Eccentric Column Loading & Secant Formula",
        "Lesson 13: Imperfect Columns & Structural Stability"
      ]
    },
    unit4: {
      id: "unit4",
      title: "Failure Theories & Design Criteria",
      badge: "Unit 4",
      icon: "🛡️",
      desc: "Apply Maximum Shear Stress (Tresca), von Mises yield criteria, ductile vs. brittle failure models, and fatigue analysis.",
      color_gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      accent_color: "#ec4899",
      topics: [
        "Lesson 14: Maximum Shear Stress (Tresca) Criterion",
        "Lesson 15: von Mises (Distortion Energy) Yield Theory",
        "Lesson 16: Maximum Normal Stress Theory for Brittle Materials",
        "Lesson 17: Fatigue Failure & S-N Diagram Fundamentals"
      ]
    }
  }
};

// ME 330: Mechanics of Deformable Bodies Course Data Catalog

export const me330Course = {
  id: "me330",
  code: "ME 330",
  title: "Mechanics of Deformable Bodies",
  subtitle: "Advanced Stress, Strain, & Structural Failure Analysis",
  description: "Explore 3D stress states, plane stress transformations, Mohr's Circle, elastic beam deflections, column buckling, and failure theories.",
  badge: "Deformable Bodies",
  units: {
    unit1: {
      id: "unit1",
      title: "Axial Loading, Indeterminate Structures & Torsion (GR 1)",
      badge: "Unit 1",
      icon: "⚙️",
      desc: "Master axial stress/strain, statically indeterminate member superposition, thermal stresses, Poisson's ratio, Hooke's law, stress concentrations, and elastic torsion.",
      color_gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
      accent_color: "#06b6d4",
      topics: [
        "Lesson 1: Course Overview & Stress/Strain Fundamentals",
        "Lesson 2: Stress, Strain & Axially Loaded Members",
        "Lesson 3: Indeterminate Structures I",
        "Lesson 4: Indeterminate Structures II & Thermal Stresses",
        "Lesson 5: Indeterminate Structures III (Rotational Rigidity)",
        "Lesson 6: Generalized Hooke's Law & Poisson's Ratio",
        "Lesson 7: St. Venant's Principle & Stress Concentration Factors",
        "Lesson 8: Torsion - Shearing Stress and Strain"
      ]
    },
    unit2: {
      id: "unit2",
      title: "Beam Bending, Shear Diagrams & Stress Transformations (GR 2)",
      badge: "Unit 2",
      icon: "📊",
      desc: "Analyze beam flexure, eccentric/unsymmetric bending, continuous V-M relations, transverse shear (VQ/It), oblique plane stresses, and 2D/3D Mohr's Circle.",
      color_gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      accent_color: "#8b5cf6",
      topics: [
        "Lesson 9: Beams in Bending & Flexure Formula",
        "Lesson 11: Eccentric Axial Loading and Bending",
        "Lesson 12: Unsymmetric Bending",
        "Lesson 13: Beams in Bending & Shear/Moment (V-M) Diagrams",
        "Lesson 14: Shear and Bending Moment (V-M) Relations",
        "Lesson 15: V-M Diagram Practice",
        "Lesson 16: Transverse Shear Stresses in Beams",
        "Lesson 17: Stresses on Oblique Planes",
        "Lesson 18: Plane Stress Transformation I",
        "Lesson 19: Plane Stress Transformation II & Mohr's Circle",
        "Lesson 20: Mohr's Circle Practice",
        "Lesson 21: 3D Mohr's Circle & Absolute Maximum Shear Stress"
      ]
    },
    unit3: {
      id: "unit3",
      title: "Strain Rosettes, Pressure Vessels, Combined Loading & Deflections (GR 3)",
      badge: "Unit 3",
      icon: "🛢️",
      desc: "Evaluate strain rosettes, thin-walled pressure vessels, 3D combined vector loading, FEA bar fundamentals, beam deflection integration, and superposition.",
      color_gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      accent_color: "#f59e0b",
      topics: [
        "Lesson 23: Strain Rosettes & Strain Transformation",
        "Lesson 24: Thin-Walled Pressure Vessels",
        "Lesson 25: Combined Loading I",
        "Lesson 26: Combined Loading II (Vector Methods)",
        "Lesson 27: Combined Loading III (3D Worked Examples)",
        "Lesson 29: Introduction to Finite Element Analysis (FEA)",
        "Lesson 30: Beam Deflections by Integration",
        "Lesson 31: Beam Deflections by Superposition",
        "Lesson 32: Beam Deflection Practice",
        "Lesson 33: Statically Indeterminate Beam Deflections",
        "Lesson 34: Statically Indeterminate Beam Deflections Practice",
        "Lesson 35: Exam / GR 3 Review"
      ]
    },
    unit4: {
      id: "unit4",
      title: "Column Buckling & Final Exam Synthesis",
      badge: "Unit 4",
      icon: "🏛️",
      desc: "Derive Euler column buckling critical loads, analyze effective length factors (K) across support types, evaluate yield vs. buckling transitions, and synthesize full course mechanics.",
      color_gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
      accent_color: "#ec4899",
      topics: [
        "Lesson 37: Euler Column Buckling I",
        "Lesson 38: Euler Column Buckling II (End Conditions & Effective Length)",
        "Lesson 40: Course Summary & Final Exam Review"
      ]
    }
  }
};

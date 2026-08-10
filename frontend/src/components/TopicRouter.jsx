import React, { lazy, Suspense } from 'react';
import GenericLessonView from './GenericLessonView';

// ME 220 Unit 1 Components
const VectorAddition = lazy(() => import('../modules/me220/unit1/VectorAddition'));
const VectorResolution = lazy(() => import('../modules/me220/unit1/VectorResolution'));
const ParticleEquilibrium = lazy(() => import('../modules/me220/unit1/ParticleEquilibrium'));
const MomentTorque = lazy(() => import('../modules/me220/unit1/MomentTorque'));
const CoupleSystems = lazy(() => import('../modules/me220/unit1/CoupleSystems'));

// ME 220 Unit 2 Components
const RigidBodyEquilibrium = lazy(() => import('../modules/me220/unit2/RigidBodyEquilibrium'));
const TrussJoints = lazy(() => import('../modules/me220/unit2/TrussJoints'));
const TrussSections = lazy(() => import('../modules/me220/unit2/TrussSections'));

// ME 220 Unit 3 Components
const NormalStress = lazy(() => import('../modules/me220/unit3/NormalStress'));
const StressStrainAxial = lazy(() => import('../modules/me220/unit3/StressStrainAxial'));
const DesignConsiderations = lazy(() => import('../modules/me220/unit3/DesignConsiderations'));
const ShearStress = lazy(() => import('../modules/me220/unit3/ShearStress'));
const TorsionShear = lazy(() => import('../modules/me220/unit3/TorsionShear'));
const AngleOfTwist = lazy(() => import('../modules/me220/unit3/AngleOfTwist'));
const AreaMomentInertia = lazy(() => import('../modules/me220/unit3/AreaMomentInertia'));
const ParallelAxis = lazy(() => import('../modules/me220/unit3/ParallelAxis'));

// ME 220 Unit 4 Components
const PureBending = lazy(() => import('../modules/me220/unit4/PureBending'));
const BeamSimulator = lazy(() => import('../modules/me220/unit4/BeamSimulator'));
const ShearMomentDiagrams = lazy(() => import('../modules/me220/unit4/ShearMomentDiagrams'));
const BeamDeflection = lazy(() => import('../modules/me220/unit4/BeamDeflection'));
const CombinedLoading = lazy(() => import('../modules/me220/unit4/CombinedLoading'));
const DesignProcess = lazy(() => import('../modules/me220/unit4/DesignProcess'));

// ME 330 Unit 1 Components
const ME330_Lesson1 = lazy(() => import('../modules/me330/unit1/ME330_Lesson1'));
const ME330_Lesson2 = lazy(() => import('../modules/me330/unit1/ME330_Lesson2'));
const ME330_Lesson3 = lazy(() => import('../modules/me330/unit1/ME330_Lesson3'));
const ME330_Lesson4 = lazy(() => import('../modules/me330/unit1/ME330_Lesson4'));
const ME330_Lesson5 = lazy(() => import('../modules/me330/unit1/ME330_Lesson5'));
const ME330_Lesson6 = lazy(() => import('../modules/me330/unit1/ME330_Lesson6'));
const ME330_Lesson7 = lazy(() => import('../modules/me330/unit1/ME330_Lesson7'));
const ME330_Lesson8 = lazy(() => import('../modules/me330/unit1/ME330_Lesson8'));

// ME 330 Unit 2 Components
const ME330_Lesson9 = lazy(() => import('../modules/me330/unit2/ME330_Lesson9'));
const ME330_Lesson11 = lazy(() => import('../modules/me330/unit2/ME330_Lesson11'));
const ME330_Lesson12 = lazy(() => import('../modules/me330/unit2/ME330_Lesson12'));
const ME330_Lesson13 = lazy(() => import('../modules/me330/unit2/ME330_Lesson13'));
const ME330_Lesson14 = lazy(() => import('../modules/me330/unit2/ME330_Lesson14'));
const ME330_Lesson15 = lazy(() => import('../modules/me330/unit2/ME330_Lesson15'));
const ME330_Lesson16 = lazy(() => import('../modules/me330/unit2/ME330_Lesson16'));
const ME330_Lesson17 = lazy(() => import('../modules/me330/unit2/ME330_Lesson17'));
const ME330_Lesson18 = lazy(() => import('../modules/me330/unit2/ME330_Lesson18'));
const ME330_Lesson19 = lazy(() => import('../modules/me330/unit2/ME330_Lesson19'));
const ME330_Lesson20 = lazy(() => import('../modules/me330/unit2/ME330_Lesson20'));
const ME330_Lesson21 = lazy(() => import('../modules/me330/unit2/ME330_Lesson21'));

// ME 330 Unit 3 Components
const ME330_Lesson23 = lazy(() => import('../modules/me330/unit3/ME330_Lesson23'));
const ME330_Lesson24 = lazy(() => import('../modules/me330/unit3/ME330_Lesson24'));
const ME330_Lesson25 = lazy(() => import('../modules/me330/unit3/ME330_Lesson25'));
const ME330_Lesson26 = lazy(() => import('../modules/me330/unit3/ME330_Lesson26'));
const ME330_Lesson27 = lazy(() => import('../modules/me330/unit3/ME330_Lesson27'));
const ME330_Lesson29 = lazy(() => import('../modules/me330/unit3/ME330_Lesson29'));
const ME330_Lesson30 = lazy(() => import('../modules/me330/unit3/ME330_Lesson30'));
const ME330_Lesson31 = lazy(() => import('../modules/me330/unit3/ME330_Lesson31'));
const ME330_Lesson32 = lazy(() => import('../modules/me330/unit3/ME330_Lesson32'));
const ME330_Lesson33 = lazy(() => import('../modules/me330/unit3/ME330_Lesson33'));
const ME330_Lesson34 = lazy(() => import('../modules/me330/unit3/ME330_Lesson34'));
const ME330_Lesson35 = lazy(() => import('../modules/me330/unit3/ME330_Lesson35'));

// ME 330 Unit 4 Components
const ME330_Lesson37 = lazy(() => import('../modules/me330/unit4/ME330_Lesson37'));
const ME330_Lesson38 = lazy(() => import('../modules/me330/unit4/ME330_Lesson38'));
const ME330_Lesson40 = lazy(() => import('../modules/me330/unit4/ME330_Lesson40'));

export default function TopicRouter({ courseId, topicName, unitKey, onComplete }) {
  const renderModule = () => {
    if (courseId === 'me220') {
      if (topicName.includes("Lesson 3: Statics of Particles")) return <VectorAddition topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 4: Forces & Equilibrium")) return <VectorResolution topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 5: Solving 2D Equilibrium")) return <ParticleEquilibrium topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 6: Forces and Moments")) return <MomentTorque topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 7: Couples and Force-Couple")) return <CoupleSystems topicName={topicName} onComplete={onComplete} />;

      if (topicName.includes("Lesson 11: Intro to Equilibrium")) return <RigidBodyEquilibrium topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 14: Centroids and Distributed")) return <BeamSimulator topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 15: Truss Analysis:  Method of Joints")) return <TrussJoints topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 16: Truss Analysis:  Method of Sections")) return <TrussSections topicName={topicName} onComplete={onComplete} />;

      if (topicName.includes("Lesson 20: Normal Stress")) return <NormalStress topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 21: Normal Stress & Strain")) return <StressStrainAxial topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 23: Design Considerations")) return <DesignConsiderations topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 25: Shear Stress")) return <ShearStress topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 26: Shear Stress due to Torsion")) return <TorsionShear topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 27: Angle of Twist")) return <AngleOfTwist topicName={topicName} onComplete={onComplete} />;

      if (topicName.includes("Lesson 30: Area Moment of Inertia")) return <AreaMomentInertia topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 31: Area Moment of Inertia:  Parallel")) return <ParallelAxis topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 32: Pure Bending")) return <PureBending topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 33: Stresses and Deformations due to Bending")) return <BeamDeflection topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 34: Combined Loading")) return <CombinedLoading topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 36: Shear & Bending Moment Diagrams")) return <ShearMomentDiagrams topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 37: Engineering Design Process")) return <DesignProcess topicName={topicName} onComplete={onComplete} />;
    }

    if (courseId === 'me330') {
      // Unit 1
      if (topicName.includes("Lesson 1:")) return <ME330_Lesson1 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 2:")) return <ME330_Lesson2 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 3:")) return <ME330_Lesson3 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 4:")) return <ME330_Lesson4 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 5:")) return <ME330_Lesson5 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 6:")) return <ME330_Lesson6 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 7:")) return <ME330_Lesson7 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 8:")) return <ME330_Lesson8 topicName={topicName} onComplete={onComplete} />;

      // Unit 2
      if (topicName.includes("Lesson 9:")) return <ME330_Lesson9 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 11:")) return <ME330_Lesson11 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 12:")) return <ME330_Lesson12 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 13:")) return <ME330_Lesson13 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 14:")) return <ME330_Lesson14 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 15:")) return <ME330_Lesson15 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 16:")) return <ME330_Lesson16 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 17:")) return <ME330_Lesson17 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 18:")) return <ME330_Lesson18 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 19:")) return <ME330_Lesson19 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 20:")) return <ME330_Lesson20 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 21:")) return <ME330_Lesson21 topicName={topicName} onComplete={onComplete} />;

      // Unit 3
      if (topicName.includes("Lesson 23:")) return <ME330_Lesson23 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 24:")) return <ME330_Lesson24 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 25:")) return <ME330_Lesson25 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 26:")) return <ME330_Lesson26 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 27:")) return <ME330_Lesson27 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 29:")) return <ME330_Lesson29 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 30:")) return <ME330_Lesson30 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 31:")) return <ME330_Lesson31 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 32:")) return <ME330_Lesson32 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 33:")) return <ME330_Lesson33 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 34:")) return <ME330_Lesson34 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 35:")) return <ME330_Lesson35 topicName={topicName} onComplete={onComplete} />;

      // Unit 4
      if (topicName.includes("Lesson 37:")) return <ME330_Lesson37 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 38:")) return <ME330_Lesson38 topicName={topicName} onComplete={onComplete} />;
      if (topicName.includes("Lesson 40:")) return <ME330_Lesson40 topicName={topicName} onComplete={onComplete} />;
    }
    if (topicName.includes("Lesson 33: Statically Indeterminate Beam Deflections")) return <ME330_Lesson33 topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 34: Statically Indeterminate Beam Deflections Practice")) return <ME330_Lesson34 topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 35: Exam / GR 3 Review")) return <ME330_Lesson35 topicName={topicName} onComplete={onComplete} />;

    // Unit 4
    if (topicName.includes("Lesson 37: Euler Column Buckling I")) return <ME330_Lesson37 topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 38: Euler Column Buckling II")) return <ME330_Lesson38 topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 40: Course Summary & Final Exam Review")) return <ME330_Lesson40 topicName={topicName} onComplete={onComplete} />;

    // Fallback
    return <GenericLessonView topicName={topicName} unitKey={unitKey} onComplete={onComplete} />;
  };

  return (
    <Suspense fallback={
      <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>⚙️ Loading Interactive Mechanics Simulator...</h3>
      </div>
    }>
      {renderModule()}
    </Suspense>
  );
}

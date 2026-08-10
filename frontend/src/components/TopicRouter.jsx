import React, { lazy, Suspense } from 'react';
import GenericLessonView from './GenericLessonView';

// Unit 1 Components
const VectorAddition = lazy(() => import('../modules/me220/unit1/VectorAddition'));
const VectorResolution = lazy(() => import('../modules/me220/unit1/VectorResolution'));
const ParticleEquilibrium = lazy(() => import('../modules/me220/unit1/ParticleEquilibrium'));
const MomentTorque = lazy(() => import('../modules/me220/unit1/MomentTorque'));
const CoupleSystems = lazy(() => import('../modules/me220/unit1/CoupleSystems'));

// Unit 2 Components
const RigidBodyEquilibrium = lazy(() => import('../modules/me220/unit2/RigidBodyEquilibrium'));
const TrussJoints = lazy(() => import('../modules/me220/unit2/TrussJoints'));
const TrussSections = lazy(() => import('../modules/me220/unit2/TrussSections'));

// Unit 3 Components
const NormalStress = lazy(() => import('../modules/me220/unit3/NormalStress'));
const StressStrainAxial = lazy(() => import('../modules/me220/unit3/StressStrainAxial'));
const DesignConsiderations = lazy(() => import('../modules/me220/unit3/DesignConsiderations'));
const ShearStress = lazy(() => import('../modules/me220/unit3/ShearStress'));
const TorsionShear = lazy(() => import('../modules/me220/unit3/TorsionShear'));
const AngleOfTwist = lazy(() => import('../modules/me220/unit3/AngleOfTwist'));
const AreaMomentInertia = lazy(() => import('../modules/me220/unit3/AreaMomentInertia'));
const ParallelAxis = lazy(() => import('../modules/me220/unit3/ParallelAxis'));

// Unit 4 Components
const PureBending = lazy(() => import('../modules/me220/unit4/PureBending'));
const BeamSimulator = lazy(() => import('../modules/me220/unit4/BeamSimulator'));
const ShearMomentDiagrams = lazy(() => import('../modules/me220/unit4/ShearMomentDiagrams'));
const BeamDeflection = lazy(() => import('../modules/me220/unit4/BeamDeflection'));
const CombinedLoading = lazy(() => import('../modules/me220/unit4/CombinedLoading'));
const DesignProcess = lazy(() => import('../modules/me220/unit4/DesignProcess'));

export default function TopicRouter({ topicName, unitKey, onComplete }) {
  const renderModule = () => {
    // Unit 1
    if (topicName.includes("Lesson 3: Statics of Particles")) return <VectorAddition topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 4: Forces & Equilibrium")) return <VectorResolution topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 5: Solving 2D Equilibrium")) return <ParticleEquilibrium topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 6: Forces and Moments")) return <MomentTorque topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 7: Couples and Force-Couple")) return <CoupleSystems topicName={topicName} onComplete={onComplete} />;

    // Unit 2
    if (topicName.includes("Lesson 11: Intro to Equilibrium")) return <RigidBodyEquilibrium topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 14: Centroids and Distributed")) return <BeamSimulator topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 15: Truss Analysis:  Method of Joints")) return <TrussJoints topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 16: Truss Analysis:  Method of Sections")) return <TrussSections topicName={topicName} onComplete={onComplete} />;

    // Unit 3
    if (topicName.includes("Lesson 20: Normal Stress")) return <NormalStress topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 21: Normal Stress & Strain")) return <StressStrainAxial topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 23: Design Considerations")) return <DesignConsiderations topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 25: Shear Stress")) return <ShearStress topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 26: Shear Stress due to Torsion")) return <TorsionShear topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 27: Angle of Twist")) return <AngleOfTwist topicName={topicName} onComplete={onComplete} />;

    // Unit 4
    if (topicName.includes("Lesson 30: Area Moment of Inertia")) return <AreaMomentInertia topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 31: Area Moment of Inertia:  Parallel")) return <ParallelAxis topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 32: Pure Bending")) return <PureBending topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 33: Stresses and Deformations due to Bending")) return <BeamDeflection topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 34: Combined Loading")) return <CombinedLoading topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 36: Shear & Bending Moment Diagrams")) return <ShearMomentDiagrams topicName={topicName} onComplete={onComplete} />;
    if (topicName.includes("Lesson 37: Engineering Design Process")) return <DesignProcess topicName={topicName} onComplete={onComplete} />;

    // Conceptual Fallback for review/intro lessons
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

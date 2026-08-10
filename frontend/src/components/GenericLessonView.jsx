import React, { useState } from 'react';

export default function GenericLessonView({ topicName, unitKey, onComplete }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '30px' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        LESSON MODULE
      </div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 20px 0' }}>{topicName}</h2>

      <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb', marginBottom: '8px' }}>
          🧠 Conceptual Overview & Fundamentals
        </h3>
        <p style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>
          Welcome to {topicName}. Review the equations and concepts below, then complete the concept check to master this topic.
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>📝 Concept Check & Practice</h3>
        <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <p style={{ fontWeight: 600, marginBottom: '12px' }}>
            Question: How does static equilibrium apply to physical structural members?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            {[
              "The sum of all external forces and moments acting on the system must equal zero (ΣF = 0, ΣM = 0).",
              "Forces can be unbalanced as long as the object is moving at constant acceleration.",
              "Only vertical forces matter; horizontal forces do not affect equilibrium.",
              "Moments are only present when the object is actively rotating."
            ].map((option, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: selectedAnswer === idx ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                <input
                  type="radio"
                  name="quiz-option"
                  checked={selectedAnswer === idx}
                  onChange={() => setSelectedAnswer(idx)}
                  disabled={submitted}
                />
                <span style={{ fontSize: '0.92rem' }}>{option}</span>
              </label>
            ))}
          </div>

          {!submitted ? (
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              disabled={selectedAnswer === null}
              onClick={() => {
                setSubmitted(true);
                if (selectedAnswer === 0 && onComplete) {
                  onComplete(topicName);
                }
              }}
            >
              Submit Answer
            </button>
          ) : (
            <div>
              {selectedAnswer === 0 ? (
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#047857', borderRadius: '8px', fontWeight: 600 }}>
                  🎉 Correct! In static equilibrium, both net forces and net moments must sum to zero in all orthogonal axes.
                </div>
              ) : (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#b91c1c', borderRadius: '8px', fontWeight: 600 }}>
                  ❌ Incorrect. Remember Newton's first law: static equilibrium requires ΣF = 0 and ΣM = 0.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

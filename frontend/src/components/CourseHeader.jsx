import React from 'react';

export default function CourseHeader({ course }) {
  return (
    <div className="portal-header">
      <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, color: '#93c5fd', marginBottom: '10px' }}>
        Mechanical Engineering Portal · {course.code}
      </div>
      <h1 className="portal-title">⚙️ {course.title}</h1>
      <p className="portal-desc">{course.description}</p>
    </div>
  );
}

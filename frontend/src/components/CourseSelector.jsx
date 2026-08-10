import React from 'react';
import { getCourseList } from '../data/courses';

export default function CourseSelector({ currentCourseId, onSelectCourse }) {
  const courses = getCourseList();

  return (
    <div className="course-selector-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.2rem' }}>⚙️</span>
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', letterSpacing: '0.5px' }}>
          MECHANICAL ENGINEERING PORTAL
        </span>
        <span style={{ color: 'var(--text-muted)', opacity: 0.4 }}>|</span>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>SELECT COURSE:</span>
        <select
          value={currentCourseId}
          onChange={(e) => onSelectCourse(e.target.value)}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            fontFamily: 'inherit',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code}: {course.title}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="course-badge-pill">ME 220 Active</span>
      </div>
    </div>
  );
}

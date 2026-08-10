import React from 'react';
import { getCourseList } from '../data/courses';

export default function CourseSelector({ currentCourseId, onSelectCourse }) {
  const courses = getCourseList();

  return (
    <div className="course-selector-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.2rem' }}>🎓</span>
        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-muted)' }}>SELECT COURSE:</span>
        <select
          value={currentCourseId}
          onChange={(e) => onSelectCourse(e.target.value)}
          style={{
            padding: '6px 12px',
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
        <span className="course-badge-pill">Extensible Portal</span>
      </div>
    </div>
  );
}

import React from 'react';

export default function CourseHeader({ course }) {
  return (
    <div className="portal-header">
      <h1 className="portal-title">🏗️ {course.title}</h1>
      <p className="portal-desc">{course.description}</p>
    </div>
  );
}

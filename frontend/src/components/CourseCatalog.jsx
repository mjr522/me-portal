import React, { useState } from 'react';
import { getCourseList } from '../data/courses';

export default function CourseCatalog({ onSelectCourse }) {
  const courses = getCourseList();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Top Hero Banner */}
      <div className="portal-header" style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: 800, color: '#93c5fd', marginBottom: '10px' }}>
          United States Air Force Academy
        </div>
        <h1 className="portal-title">⚙️ USAFA Mechanical Engineering Portal</h1>
        <p className="portal-desc">
          Welcome to the USAFA Department of Mechanical Engineering Interactive Learning Portal. 
          Select a course below to launch interactive physics modules, real-time solvers, and POE challenges.
        </p>
      </div>

      {/* Catalog Search Bar & Stats */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        padding: '16px 24px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.3rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Search courses or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              width: '300px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <span>📚 {courses.length} Courses Cataloged</span>
          <span>⚡ 26+ Interactive Solvers</span>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '28px',
        marginBottom: '40px'
      }}>
        {filteredCourses.map((course) => {
          const unitKeys = Object.keys(course.units);
          let topicCount = 0;
          unitKeys.forEach((key) => {
            topicCount += course.units[key].topics.length;
          });

          return (
            <div
              key={course.id}
              className="unit-card"
              style={{
                padding: '32px',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                minHeight: '380px'
              }}
              onClick={() => onSelectCourse(course.id)}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <span className="course-badge-pill" style={{ marginBottom: '8px', display: 'inline-block' }}>
                      {course.code}
                    </span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                      {course.title}
                    </h2>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
                    {course.badge}
                  </span>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                  {course.description}
                </p>

                {/* Units List Preview */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '10px' }}>
                    Included Units ({unitKeys.length} Units · {topicCount} Topics)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {unitKeys.map((ukey) => {
                      const u = course.units[ukey];
                      return (
                        <div key={ukey} style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                          <span>{u.icon}</span>
                          <span style={{ fontWeight: 600 }}>{u.badge}:</span>
                          <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button className="btn-primary" style={{ marginTop: 'auto' }}>
                Launch {course.code} Course Portal ➡️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

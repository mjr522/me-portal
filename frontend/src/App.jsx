import React, { useState, useEffect } from 'react';
import { getCourseById } from './data/courses';
import CourseSelector from './components/CourseSelector';
import CourseHeader from './components/CourseHeader';
import SidebarNav from './components/SidebarNav';
import UnitOverview from './components/UnitOverview';
import TopicRouter from './components/TopicRouter';

export default function App() {
  const [courseId, setCourseId] = useState('me220');
  const [currentUnitKey, setCurrentUnitKey] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [completedTopics, setCompletedTopics] = useState(new Set());

  const course = getCourseById(courseId);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`completed_topics_${courseId}`);
    if (saved) {
      try {
        setCompletedTopics(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }
  }, [courseId]);

  // Save progress to localStorage
  const handleCompleteTopic = (topicName) => {
    setCompletedTopics((prev) => {
      const next = new Set(prev);
      next.add(topicName);
      localStorage.setItem(`completed_topics_${courseId}`, JSON.stringify([...next]));
      return next;
    });
  };

  // Calculate overall course progress
  let totalCompleted = 0;
  let totalTopics = 0;
  Object.values(course.units).forEach((u) => {
    totalTopics += u.topics.length;
    totalCompleted += u.topics.filter((t) => completedTopics.has(t)).length;
  });
  const overallProgressPercent = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

  const activeUnit = currentUnitKey ? course.units[currentUnitKey] : null;

  return (
    <div className="app-container">
      {/* Sidebar (shown when in a unit) */}
      {currentUnitKey && (
        <SidebarNav
          unit={activeUnit}
          currentTopic={currentTopic}
          onSelectTopic={(topic) => setCurrentTopic(topic)}
          onReturnHome={() => {
            setCurrentUnitKey(null);
            setCurrentTopic(null);
          }}
        />
      )}

      {/* Main Content Pane */}
      <main className="main-content">
        <CourseSelector currentCourseId={courseId} onSelectCourse={(id) => setCourseId(id)} />

        {currentUnitKey === null ? (
          <div>
            <CourseHeader course={course} />

            {/* Overall Course Progress */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '20px 24px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  📊 Overall Course Progress: {totalCompleted} / {totalTopics} Topics Mastered
                </h3>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{overallProgressPercent}%</span>
              </div>
              <div style={{ height: '10px', background: 'var(--border-light)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #2563eb, #3b82f6)', width: `${overallProgressPercent}%`, transition: 'width 0.4s' }}></div>
              </div>
            </div>

            {/* 2x2 Grid of Course Units */}
            <div className="unit-grid">
              {Object.entries(course.units).map(([key, u]) => (
                <div
                  key={key}
                  className="unit-card"
                  style={{ borderLeft: `6px solid ${u.accent_color}` }}
                  onClick={() => {
                    setCurrentUnitKey(key);
                    setCurrentTopic(null);
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '2.2rem' }}>{u.icon}</span>
                      <div>
                        <span className="unit-card-badge">{u.badge}</span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{u.title}</h3>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{u.desc}</p>
                  </div>

                  <button className="btn-primary">
                    Explore {u.badge} ➡️
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {currentTopic === null ? (
              <UnitOverview
                unit={activeUnit}
                completedTopics={completedTopics}
                onLaunchLesson={(topic) => setCurrentTopic(topic)}
              />
            ) : (
              <TopicRouter
                topicName={currentTopic}
                unitKey={currentUnitKey}
                onComplete={handleCompleteTopic}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Course, CourseDetail, Lesson, GamificationProfile } from './types';
import { api } from './services/api';
import { WelcomeLoginScreen } from './components/WelcomeLoginScreen';
import { DoraemonHouseWorld } from './components/DoraemonHouseWorld';
import { SubjectLearningWorld } from './components/SubjectLearningWorld';
import { sounds } from './services/soundEffects';

export type AppView = 'welcome' | 'house' | 'subject';

export const App: React.FC = () => {
  // Navigation View State: 'welcome' (Page 1) | 'house' (Page 2) | 'subject' (Page 3 & 4)
  const [currentView, setCurrentView] = useState<AppView>('welcome');

  // Student Profile State
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('doremon_student_name') || '';
  });
  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem('doremon_student_id') || 'student_himani';
  });

  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseDetail | null>(null);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all subjects and student progress from backend
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const activeId = localStorage.getItem('doremon_student_id') || studentId;
      const [coursesData, profileData] = await Promise.all([
        api.getCourses(),
        api.getGamificationProfile(activeId).catch(() => null),
      ]);
      setCourses(coursesData);
      setProfile(profileData);
    } catch (e) {
      console.error('Failed to load LMS data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handler: When student completes Page 1 Welcome Login
  const handleStartLearning = async (name: string) => {
    setStudentName(name);
    localStorage.setItem('doremon_student_name', name);
    try {
      await api.createOrSwitchStudentProfile(name);
    } catch {
      // fallback
    }
    await loadAllData();
    setCurrentView('house');
  };

  // Handler: Add a new Subject Cloud (Page 2 Add Subject Cloud Feature)
  const handleAddSubject = async (subjectTitle: string) => {
    await api.createSubject(subjectTitle);
    await loadAllData();
  };

  // Handler: Select a Subject Cloud to enter Page 3
  const handleSelectSubject = async (courseId: string) => {
    try {
      sounds.playMagicChime();
      const detail = await api.getCourseDetail(courseId);
      setSelectedCourseDetail(detail);
      setCurrentView('subject');
    } catch (e) {
      console.error('Failed to load subject details', e);
    }
  };

  // Handler: Delete a Subject Cloud
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    try {
      sounds.playMagicChime();
      await api.deleteCourse(courseId);
      if (selectedCourseDetail?.id === courseId) {
        setSelectedCourseDetail(null);
      }
      await loadAllData();
    } catch (e) {
      console.error('Failed to delete course', e);
    }
  };

  // Handler: Reload a course when new files are uploaded
  const handleReloadCourse = async (courseId: string) => {
    try {
      const detail = await api.getCourseDetail(courseId);
      setSelectedCourseDetail(detail);
      await loadAllData();
    } catch (e) {
      console.error('Failed to reload course', e);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#05162A] text-slate-800 font-sans">
      {/* ============================================================== */}
      {/* PAGE 1: DORAEMON WELCOMING LOGIN PAGE                          */}
      {/* ============================================================== */}
      {currentView === 'welcome' && (
        <WelcomeLoginScreen
          initialName={studentName}
          onStartLearning={handleStartLearning}
        />
      )}

      {/* ============================================================== */}
      {/* PAGE 2: DORAEMON'S HOUSE (MAIN SUBJECT WORLD)                  */}
      {/* ============================================================== */}
      {currentView === 'house' && (
        <DoraemonHouseWorld
          studentName={studentName || 'Student'}
          courses={courses}
          onSelectCourse={handleSelectSubject}
          onAddSubject={handleAddSubject}
          onDeleteCourse={handleDeleteCourse}
          onOpenProfileSwitch={() => setCurrentView('welcome')}
        />
      )}

      {/* ============================================================== */}
      {/* PAGE 3: INDIVIDUAL SUBJECT LEARNING WORLD & 3D UNIVERSE        */}
      {/* ============================================================== */}
      {currentView === 'subject' && selectedCourseDetail && (
        <SubjectLearningWorld
          courseDetail={selectedCourseDetail}
          studentName={studentName || 'Student'}
          onBackToHouse={() => setCurrentView('house')}
          onReloadCourse={handleReloadCourse}
        />
      )}
    </div>
  );
};

export default App;

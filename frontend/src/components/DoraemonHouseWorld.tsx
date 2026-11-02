import React from 'react';
import { Course } from '../types';
import { DoraemonHouseBackground } from './DoraemonHouseBackground';
import { FloatingCloudSubject } from './FloatingCloudSubject';
import { AddSubjectCloud } from './AddSubjectCloud';
import { sounds } from '../services/soundEffects';
import { Volume2, VolumeX, User, Sparkles } from 'lucide-react';

interface DoraemonHouseWorldProps {
  studentName: string;
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onAddSubject: (subjectName: string) => Promise<void>;
  onDeleteCourse: (courseId: string, courseTitle: string) => void;
  onOpenProfileSwitch: () => void;
}

export const DoraemonHouseWorld: React.FC<DoraemonHouseWorldProps> = ({
  studentName,
  courses,
  onSelectCourse,
  onAddSubject,
  onDeleteCourse,
  onOpenProfileSwitch,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(sounds.isEnabled());

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  const getHouseGreeting = () => {
    if (courses.length === 0) {
      return `Hey ${studentName}! Welcome to my house! Click the '+' cloud on the right to add your very first subject!`;
    }
    return `Welcome back, ${studentName}! Choose one of your subject clouds to continue learning, or click '+' to add another!`;
  };

  return (
    <DoraemonHouseBackground>
      {/* Top Navigation Bar inside Doraemon's House */}
      <header className="w-full px-4 sm:px-8 py-3 flex items-center justify-between z-20">
        {/* House Title Logo */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0288D1] to-[#29B6F6] p-1 flex items-center justify-center border-2 border-white shadow-md">
            <img
              src="/doraemon_reference.png"
              alt="Doraemon"
              className="w-7 h-7 object-contain drop-shadow"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Doremon's</span>
              <span className="text-[#E53935]">House</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-950 font-black shadow-xs">
                3D World
              </span>
            </h1>
            <p className="text-[10px] text-sky-800 font-bold hidden sm:block">
              Interactive Japanese Cartoon Learning Environment
            </p>
          </div>
        </div>

        {/* Right Student Profile Pill & Sound Switch */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Magical Chimes'}
            className="p-2 rounded-xl bg-white/80 hover:bg-white border border-sky-200 text-sky-900 shadow-xs transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#0288D1]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Student Profile Pill */}
          <button
            onClick={onOpenProfileSwitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 hover:bg-white border-2 border-sky-200 text-xs font-black text-slate-800 shadow-xs hover:scale-102 transition-all cursor-pointer"
            title="Switch student profile or change name"
          >
            <span className="text-sm">🎒</span>
            <span>{studentName}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-100 text-[#0288D1]">Switch</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage: Left side Doraemon, Right side Floating Clouds */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        {/* ============================================================== */}
        {/* LEFT SIDE: LARGE ANIMATED DORAEMON MASCOT & GUIDANCE DIALOGUE  */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
          {/* Animated Doraemon Cartoon Speech Bubble */}
          <div className="relative max-w-md p-4 rounded-3xl bg-white/95 backdrop-blur-md border-3 border-sky-300 shadow-xl animate-pop-in">
            <p className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
              {getHouseGreeting()}
            </p>
            {/* Speech pointer towards Doraemon */}
            <div className="absolute -bottom-2.5 left-1/2 lg:left-14 -translate-x-1/2 w-4 h-4 bg-white border-b-3 border-r-3 border-sky-300 rotate-45 transform" />
          </div>

          {/* Large Doraemon Character standing in Nobita's room */}
          <div className="relative group cursor-pointer" onClick={() => sounds.playMagicChime()}>
            {/* 3D Floor Shadow under Doraemon */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-10 rounded-full bg-slate-900/20 blur-md transform scale-y-50 group-hover:scale-110 transition-transform" />

            {/* Reference Image of Doraemon */}
            <div className="relative z-10 w-52 sm:w-64 h-64 sm:h-76 flex items-center justify-center">
              <img
                src="/doraemon_reference.png"
                alt="Doraemon in his house"
                className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-104 transition-transform duration-300 animate-float"
              />

              {/* Magical Sparkle on Click */}
              <div className="absolute top-2 right-4 text-2xl animate-spin opacity-80" style={{ animationDuration: '6s' }}>
                ✨
              </div>

              {/* Golden bell tooltip */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-yellow-400 text-yellow-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs border border-white">
                Magical Bell 🔔
              </div>
            </div>
          </div>

          <p className="text-xs font-black text-[#0288D1] bg-white/80 px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
            🌟 Doraemon is your AI Learning Companion
          </p>
        </div>

        {/* ============================================================== */}
        {/* RIGHT SIDE / CENTRE: MULTIPLE FLOATING 3D SUBJECT CLOUDS       */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start w-full">
          {/* Section Subtitle */}
          <div className="flex items-center gap-2 mb-2 px-2 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-sky-100 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#0288D1]" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
              Your Subject Clouds ({courses.length})
            </h2>
          </div>

          {/* Empty State Banner if user has 0 subjects */}
          {courses.length === 0 && (
            <div className="w-full max-w-lg p-5 rounded-3xl bg-white/90 backdrop-blur-md border-3 border-amber-300 shadow-lg mb-4 text-center space-y-2 animate-in zoom-in-95">
              <span className="text-3xl">✨</span>
              <h3 className="text-base font-black text-slate-900">
                No Subjects Added Yet!
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                You have full control. Click the golden <strong className="text-amber-800">+ Add Subject</strong> cloud below to create your very first subject!
              </p>
            </div>
          )}

          {/* Floating Clouds Container */}
          <div className="w-full flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            {/* User-Created Subject Clouds */}
            {courses.map((course, idx) => (
              <FloatingCloudSubject
                key={course.id}
                course={course}
                index={idx}
                onSelect={onSelectCourse}
                onDelete={onDeleteCourse}
              />
            ))}

            {/* The Dedicated "+" Add Subject Cloud (Always Available) */}
            <AddSubjectCloud onAddSubject={onAddSubject} />
          </div>
        </div>
      </div>
    </DoraemonHouseBackground>
  );
};

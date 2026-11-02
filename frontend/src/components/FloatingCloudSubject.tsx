import React from 'react';
import { Course } from '../types';
import { Sparkles, Trash2, BookOpen } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface FloatingCloudSubjectProps {
  course: Course;
  index: number;
  onSelect: (courseId: string) => void;
  onDelete: (courseId: string, courseTitle: string) => void;
}

export const FloatingCloudSubject: React.FC<FloatingCloudSubjectProps> = ({
  course,
  index,
  onSelect,
  onDelete,
}) => {
  // Distribute floating duration & delays so every cloud floats independently
  const floatDuration = 4 + (index % 3) * 0.8;
  const floatDelay = (index * 0.7) % 2.5;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playMagicChime();
    onSelect(course.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      onDelete(course.id, course.title);
    }
  };

  return (
    <div
      style={{
        animation: `cloud-float ${floatDuration}s ease-in-out infinite`,
        animationDelay: `${floatDelay}s`,
      }}
      className="relative group cursor-pointer transition-transform duration-300 select-none m-2 sm:m-4"
    >
      {/* 3D Drop Shadow projected onto the room environment */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-60 h-8 rounded-full bg-slate-900/15 blur-md transform scale-y-50 group-hover:scale-110 group-hover:opacity-30 transition-all duration-300" />

      {/* Layered Fluffy 3D Cartoon Cloud Body */}
      <div
        onClick={handleClick}
        className="relative w-64 sm:w-80 min-h-[140px] p-5 rounded-[45px] bg-gradient-to-b from-white via-[#F0F9FF] to-[#BAE6FD] border-3 border-sky-200 shadow-xl shadow-sky-400/25 group-hover:shadow-2xl group-hover:shadow-sky-500/40 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden"
      >
        {/* Soft Fluffy Cloud Bulges (Cartoon SVG aesthetic) */}
        <div className="absolute -top-6 left-8 w-20 h-20 rounded-full bg-white border-t-3 border-sky-100 -z-10 group-hover:scale-105 transition-transform" />
        <div className="absolute -top-9 left-24 w-28 h-28 rounded-full bg-white border-t-3 border-sky-100 -z-10 group-hover:scale-105 transition-transform" />
        <div className="absolute -top-5 right-10 w-20 h-20 rounded-full bg-white border-t-3 border-sky-100 -z-10 group-hover:scale-105 transition-transform" />

        {/* Top Header inside Cloud */}
        <div className="flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-sky-200 text-[#0288D1] text-[10px] font-black shadow-2xs">
            <span>☁️</span>
            <span>Subject Cloud #{index + 1}</span>
          </div>

          <button
            onClick={handleDelete}
            title="Delete this subject"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subject Name - Big, Bold, Clean Cartoon Typography */}
        <div className="my-2 text-center z-10 px-2">
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight group-hover:text-[#0288D1] transition-colors drop-shadow-2xs line-clamp-2">
            {course.title}
          </h3>
          {course.description && course.description !== 'Custom Subject' && (
            <p className="text-[11px] text-slate-500 font-semibold line-clamp-1 mt-0.5">
              {course.description}
            </p>
          )}
        </div>

        {/* Bottom Status / Topic Count Badge inside Cloud */}
        <div className="flex items-center justify-between z-10 pt-2 border-t border-sky-100/80">
          <span className="text-[10px] font-extrabold text-sky-800 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-[#0288D1]" />
            {course.topic_count > 0 ? (
              <span>{course.topic_count} Topics</span>
            ) : (
              <span>Ready for PPT/PDF</span>
            )}
          </span>

          <span className="text-[11px] font-black text-[#0288D1] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
            <span>Enter</span>
            <span>→</span>
          </span>
        </div>

        {/* Magical Sparkle Particle on Hover */}
        <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity text-yellow-400 animate-spin" style={{ animationDuration: '4s' }}>
          <Sparkles className="w-4 h-4 fill-yellow-400" />
        </div>
      </div>
    </div>
  );
};

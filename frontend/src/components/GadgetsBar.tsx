import React from 'react';
import { Compass, BookOpen, Clock, Lightbulb, CheckCircle2, Search, Sparkles } from 'lucide-react';

interface GadgetsBarProps {
  onOpenAnywhereDoor: () => void;
  onOpenMemoryBread: () => void;
  onOpenTakeCopter: () => void;
  onOpenTimeMachine: () => void;
  onOpenQuizGadget: () => void;
}

export const GadgetsBar: React.FC<GadgetsBarProps> = ({
  onOpenAnywhereDoor,
  onOpenMemoryBread,
  onOpenTakeCopter,
  onOpenTimeMachine,
  onOpenQuizGadget,
}) => {
  const gadgets = [
    {
      id: 'anywhere-door',
      name: 'Anywhere Door',
      badge: 'Topic Explorer',
      description: 'Teleport to any slide or topic with a magical door transition.',
      emoji: '🚪',
      bg: 'bg-white/95 hover:bg-sky-50/90',
      border: 'border-2 border-sky-100 hover:border-sky-300',
      text: 'text-sky-950',
      badgeBg: 'bg-sky-100 text-[#0288D1]',
      iconAnim: 'group-hover:scale-125 transition-transform duration-300',
      onClick: onOpenAnywhereDoor,
    },
    {
      id: 'memory-bread',
      name: 'Memory Bread',
      badge: 'Revision Flashcards',
      description: 'Flip bite-sized formula cards & memorize definitions with pop-in cards.',
      emoji: '🍞',
      bg: 'bg-white/95 hover:bg-sky-50/90',
      border: 'border-2 border-sky-100 hover:border-sky-300',
      text: 'text-sky-950',
      badgeBg: 'bg-sky-100 text-[#0288D1]',
      iconAnim: 'group-hover:-translate-y-1.5 transition-transform duration-200',
      onClick: onOpenMemoryBread,
    },
    {
      id: 'take-copter',
      name: 'Take-copter',
      badge: 'Concept Mindmap',
      description: 'Fly high above the syllabus with floating concept trees.',
      emoji: '🚁',
      bg: 'bg-white/95 hover:bg-sky-50/90',
      border: 'border-2 border-sky-100 hover:border-sky-300',
      text: 'text-sky-950',
      badgeBg: 'bg-sky-100 text-[#0288D1]',
      iconAnim: 'group-hover:rotate-12 group-hover:scale-120 transition-transform duration-200',
      onClick: onOpenTakeCopter,
    },
    {
      id: 'time-machine',
      name: 'Time Machine',
      badge: 'Exam Simulation',
      description: 'Travel through time for 15-minute timed mock tests under actual exam conditions.',
      emoji: '⏳',
      bg: 'bg-white/95 hover:bg-sky-50/90',
      border: 'border-2 border-sky-100 hover:border-sky-300',
      text: 'text-sky-950',
      badgeBg: 'bg-sky-100 text-[#0288D1]',
      iconAnim: 'group-hover:rotate-180 transition-transform duration-500',
      onClick: onOpenTimeMachine,
    },
    {
      id: 'quiz-gadget',
      name: 'Quiz Gadget',
      badge: 'Practice & XP',
      description: 'Earn XP, unlock gadget badges, and get celebrated by Doremon!',
      emoji: '🎯',
      bg: 'bg-white/95 hover:bg-sky-50/90',
      border: 'border-2 border-sky-100 hover:border-sky-300',
      text: 'text-sky-950',
      badgeBg: 'bg-sky-100 text-[#0288D1]',
      iconAnim: 'group-hover:scale-125 transition-transform duration-200',
      onClick: onOpenQuizGadget,
    },
  ];

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-bounce">✨</span>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">
            Doremon's 4D Learning Gadgets
          </h2>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold border border-sky-200">
            Interactive Tools
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium hidden sm:block">
          Select any gadget to explore concepts with cheerful animations
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {gadgets.map((gadget) => (
          <button
            key={gadget.id}
            onClick={gadget.onClick}
            className={`p-3.5 rounded-3xl border-2 ${gadget.border} ${gadget.bg} text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between group shadow-xs`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl ${gadget.iconAnim}`}>
                  {gadget.emoji}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${gadget.badgeBg}`}>
                  {gadget.badge}
                </span>
              </div>
              <h3 className={`font-black text-sm ${gadget.text} mb-1`}>
                {gadget.name}
              </h3>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                {gadget.description}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-black text-slate-700 group-hover:text-slate-950">
              <span className="flex items-center gap-1">
                <span>Activate</span>
                <Sparkles className="w-3 h-3 text-yellow-500" />
              </span>
              <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, BookOpen, Layers, ArrowRight, Play, CheckCircle2, FastForward } from 'lucide-react';
import { ThreePocketScene } from './ThreePocketScene';
import { sounds } from '../services/soundEffects';

export interface PocketTopicData {
  topicId: string;
  courseId: string;
  topicTitle: string;
  courseTitle: string;
  sourcePages?: number[];
  unitLabel?: string;
  summary?: string;
  importance?: string;
  contentType?: 'definition' | 'formula' | 'diagram' | 'case_study' | 'revision' | 'quiz' | 'flashcard';
}

interface PocketTopicModalProps {
  topic: PocketTopicData | null;
  isOpen: boolean;
  onClose: () => void;
  onEnterLesson: (courseId: string, topicId: string) => void;
}

export const PocketTopicModal: React.FC<PocketTopicModalProps> = ({
  topic,
  isOpen,
  onClose,
  onEnterLesson,
}) => {
  // Animation stages:
  // 1: Mascot Reacts to Selection ("Aha! Great choice!")
  // 2: Mascot looks down towards 4D Pocket
  // 3: Arm reaches inside 4D Pocket searching
  // 4: Magical particles, golden stars & soft glow flash
  // 5: Floating learning gadget emerges from pocket with real title
  // 6: Gadget unfolds into complete learning card ready to study
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  useEffect(() => {
    if (!isOpen || !topic) return;

    // Reset to stage 1 on open
    setStage(1);

    // Stage 1 -> 2: Mascot looks towards pocket (500ms)
    const t1 = setTimeout(() => {
      setStage(2);
      sounds.playClickSound();
    }, 550);

    // Stage 2 -> 3: Hand reaches into pocket searching (1200ms)
    const t2 = setTimeout(() => {
      setStage(3);
      sounds.playClickSound();
    }, 1200);

    // Stage 3 -> 4: Magical sparkle chime & aura bursts (1900ms)
    const t3 = setTimeout(() => {
      setStage(4);
      sounds.playMagicChime();
    }, 1900);

    // Stage 4 -> 5: Gadget emerges floating with title (2600ms)
    const t4 = setTimeout(() => {
      setStage(5);
      sounds.playPopSound();
      try {
        confetti({
          particleCount: 50,
          spread: 65,
          origin: { y: 0.65 },
          colors: ['#0288D1', '#FFD600', '#FF8A80', '#00E676'],
        });
      } catch (e) {}
    }, 2600);

    // Stage 5 -> 6: Fully opened and interactive (3300ms)
    const t5 = setTimeout(() => {
      setStage(6);
    }, 3300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, topic]);

  if (!isOpen || !topic) return null;

  // Determine gadget archetype based on prompt Part 5:
  // - Definitions: a magical book.
  // - Formulas: a glowing calculator.
  // - Diagrams: a holographic display.
  // - Case studies: a miniature scene.
  // - Revision notes: a small booklet.
  // - Quiz questions: floating question cards.
  // - Flashcards: animated memory cards.
  const titleLower = topic.topicTitle.toLowerCase();
  let gadgetArchetype: 'book' | 'calculator' | 'hologram' | 'scene' | 'booklet' | 'quiz_cards' | 'memory_cards' = 'book';

  if (topic.contentType) {
    if (topic.contentType === 'formula') gadgetArchetype = 'calculator';
    else if (topic.contentType === 'diagram') gadgetArchetype = 'hologram';
    else if (topic.contentType === 'case_study') gadgetArchetype = 'scene';
    else if (topic.contentType === 'revision') gadgetArchetype = 'booklet';
    else if (topic.contentType === 'quiz') gadgetArchetype = 'quiz_cards';
    else if (topic.contentType === 'flashcard') gadgetArchetype = 'memory_cards';
    else gadgetArchetype = 'book';
  } else {
    // Inferred from title keywords
    if (titleLower.includes('formula') || titleLower.includes('equation') || titleLower.includes('delay') || titleLower.includes('math') || titleLower.includes('latency')) {
      gadgetArchetype = 'calculator';
    } else if (titleLower.includes('network') || titleLower.includes('architecture') || titleLower.includes('diagram') || titleLower.includes('flowchart') || titleLower.includes('protocol') || titleLower.includes('cloud')) {
      gadgetArchetype = 'hologram';
    } else if (titleLower.includes('jio') || titleLower.includes('upi') || titleLower.includes('company') || titleLower.includes('tata') || titleLower.includes('case') || titleLower.includes('zomato')) {
      gadgetArchetype = 'scene';
    } else if (titleLower.includes('revision') || titleLower.includes('summary') || titleLower.includes('notes') || titleLower.includes('exam')) {
      gadgetArchetype = 'booklet';
    } else if (titleLower.includes('quiz') || titleLower.includes('test') || titleLower.includes('practice') || titleLower.includes('mcq')) {
      gadgetArchetype = 'quiz_cards';
    } else if (titleLower.includes('term') || titleLower.includes('memory') || titleLower.includes('flashcard')) {
      gadgetArchetype = 'memory_cards';
    } else {
      gadgetArchetype = 'book';
    }
  }

  // Gadget styling & details
  const gadgetConfigs = {
    book: {
      name: 'Magical Concept Tome',
      icon: '📖',
      subtitle: 'Definition Gadget',
      accentGradient: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-100 text-[#0288D1]',
      border: 'border-sky-300',
      desc: 'Opens into foundational definitions & deep conceptual insights.',
    },
    calculator: {
      name: 'Glowing Quantum Calculator',
      icon: '🧮',
      subtitle: 'Formula Gadget',
      accentGradient: 'from-amber-500 to-yellow-600',
      badgeBg: 'bg-amber-100 text-amber-900',
      border: 'border-amber-300',
      desc: 'Computes variables, equations, and step-by-step solved numeric problems.',
    },
    hologram: {
      name: '3D Holographic Projector',
      icon: '📊',
      subtitle: 'Diagram Gadget',
      accentGradient: 'from-indigo-500 to-purple-600',
      badgeBg: 'bg-indigo-100 text-indigo-900',
      border: 'border-indigo-300',
      desc: 'Projects visual architecture diagrams and workflow flowcharts in full 3D.',
    },
    scene: {
      name: 'Miniature Corporate Stage',
      icon: '🏢',
      subtitle: 'Case Study Gadget',
      accentGradient: 'from-orange-500 to-rose-600',
      badgeBg: 'bg-orange-100 text-orange-900',
      border: 'border-orange-300',
      desc: 'Reenacts Indian industry applications (UPI, Tata Motors, Jio, Zomato).',
    },
    booklet: {
      name: 'Pocket Revision Notebook',
      icon: '📑',
      subtitle: 'Revision Notes Gadget',
      accentGradient: 'from-teal-500 to-emerald-600',
      badgeBg: 'bg-teal-100 text-teal-900',
      border: 'border-teal-300',
      desc: 'High-yield exam notes, 2-mark questions, and Memory Bread takeaways.',
    },
    quiz_cards: {
      name: 'Floating Challenge Cards',
      icon: '🎯',
      subtitle: 'Quiz Gadget',
      accentGradient: 'from-emerald-500 to-cyan-600',
      badgeBg: 'bg-emerald-100 text-emerald-900',
      border: 'border-emerald-300',
      desc: 'Tests your understanding with MCQs, true/false, and instant feedback.',
    },
    memory_cards: {
      name: 'Animated Memory Deck',
      icon: '🎴',
      subtitle: 'Flashcard Gadget',
      accentGradient: 'from-fuchsia-500 to-pink-600',
      badgeBg: 'bg-fuchsia-100 text-fuchsia-900',
      border: 'border-fuchsia-300',
      desc: 'Spaced repetition cards that seal concepts into permanent long-term memory.',
    },
  };

  const config = gadgetConfigs[gadgetArchetype];

  const sourceStr = topic.sourcePages && topic.sourcePages.length > 0
    ? `${topic.unitLabel || 'Slide'} ${topic.sourcePages.join(', ')}`
    : 'Lecture Notes';

  const handleOpenLesson = () => {
    sounds.playCelebrateFanfare();
    onEnterLesson(topic.courseId, topic.topicId);
    onClose();
  };

  const handleSkip = () => {
    setStage(6);
    sounds.playPopSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[88vh] overflow-y-auto border-4 border-sky-300 shadow-2xl flex flex-col items-center p-5 sm:p-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-amber-50 pointer-events-none z-0" />

        {/* Mascot Animation Stage Container */}
        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Mascot Speech Bubble */}
          <div className="mb-3 px-5 py-2.5 rounded-full bg-white border-2 border-sky-200 shadow-md inline-flex items-center gap-2">
            <span className="text-base animate-bounce">✨</span>
            <span className="text-xs sm:text-sm font-black text-slate-800">
              {stage === 1 && "Aha! You selected a topic! Let me check my 4D pocket!"}
              {stage === 2 && "Looking down into the 4D pocket..."}
              {stage === 3 && "Reaching inside the pocket... Almost got the gadget!"}
              {stage === 4 && "Whoosh! Magical stars & aura glowing bright!"}
              {stage === 5 && `Ta-da! Pulled out the ${config.name}!`}
              {stage === 6 && "Your dynamic learning gadget is unlocked! Let's learn!"}
            </span>
          </div>

          {/* Real Three.js 3D Doraemon & 4D Pocket Gadget Emergence Scene */}
          <div className="relative my-1">
            <ThreePocketScene stage={stage} gadgetType={gadgetArchetype} />
          </div>

          {/* FLOATING TOPIC GADGET CARD: Emerges dynamically from pocket */}
          {stage >= 5 && (
            <div
              onClick={handleOpenLesson}
              className={`w-full max-w-md p-5 rounded-3xl bg-white border-2 ${config.border} shadow-2xl hover:shadow-sky-200 transition-all duration-300 cursor-pointer animate-pop-in hover:scale-102 mt-2 text-left`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl animate-bounce">
                    {config.icon}
                  </span>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${config.badgeBg}`}>
                      {config.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {config.subtitle}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                  {sourceStr}
                </span>
              </div>

              {/* DYNAMIC REAL EXTRACTED TOPIC TITLE */}
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug my-2">
                {topic.topicTitle}
              </h3>

              <p className="text-xs text-slate-500 font-medium mb-2.5">
                Course: <strong className="text-slate-700">{topic.courseTitle}</strong>
              </p>

              {topic.summary ? (
                <p className="text-xs text-slate-700 bg-sky-50/80 p-3 rounded-2xl border border-sky-100 font-medium leading-relaxed mb-3">
                  {topic.summary}
                </p>
              ) : (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium leading-relaxed mb-3">
                  {config.desc}
                </p>
              )}

              {/* Action Button */}
              <button
                onClick={handleOpenLesson}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r ${config.accentGradient} shadow-md hover:scale-101 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse`}
              >
                <span>Open Lesson & Learn Concept</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          )}

          {/* Skip animation button for student speed */}
          {stage < 5 && (
            <button
              onClick={handleSkip}
              className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 underline cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip Animation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

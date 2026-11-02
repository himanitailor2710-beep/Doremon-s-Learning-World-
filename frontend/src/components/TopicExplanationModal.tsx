import React, { useState } from 'react';
import { Lesson } from '../types';
import {
  X,
  Sparkles,
  BookOpen,
  Star,
  Lightbulb,
  Building2,
  FileText,
  Network,
  Link as LinkIcon,
  CheckCircle2,
  HelpCircle,
  Check,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface TopicExplanationModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onOpenQuiz?: () => void;
}

export const TopicExplanationModal: React.FC<TopicExplanationModalProps> = ({
  lesson,
  onClose,
  onOpenQuiz,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<Record<number, boolean>>({});

  if (!lesson) return null;

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }));
    setShowAnswerFeedback((prev) => ({ ...prev, [qIdx]: true }));
    sounds.playMagicChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] border-3 border-sky-300 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* ============================================================== */}
        {/* MODAL HEADER: TOPIC TITLE & BADGES (FIXED AT TOP)             */}
        {/* ============================================================== */}
        <div className="shrink-0 bg-gradient-to-r from-[#0288D1] via-[#03A9F4] to-[#29B6F6] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-inner">
              📖
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-950">
                  {lesson.importance || 'Core'} Importance
                </span>
                {lesson.source_pages?.length > 0 && (
                  <span className="text-[10px] font-bold text-sky-100">
                    Source: {lesson.unit_label || 'Slide'} {lesson.source_pages.join(', ')}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight truncate drop-shadow-xs">
                {lesson.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* SCROLLABLE BODY: THE 10 DETAILED EXPLANATION SECTIONS          */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-sky-300">
          {/* SECTION 1: What is this topic? */}
          <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0288D1]">
              <BookOpen className="w-4 h-4 text-[#0288D1]" />
              <span>1. What is this topic?</span>
            </div>
            <p className="text-sm font-black text-slate-900 leading-relaxed">
              {lesson.simple_definition || 'Clear fundamental definition of this academic concept.'}
            </p>
          </div>

          {/* SECTION 2: Why is it important? */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
              <Star className="w-4 h-4 text-amber-600 fill-amber-400" />
              <span>2. Why is it important?</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
              This concept is essential because it forms the structural backbone of system architecture and business execution. Mastering this allows you to solve real-world industry problems, avoid design pitfalls, and score high in university examinations.
            </p>
          </div>

          {/* SECTION 3: Detailed Explanation in Simple English */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
              <Lightbulb className="w-4 h-4 text-yellow-500 fill-yellow-400" />
              <span>3. Detailed Explanation in Simple English</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium space-y-2 whitespace-pre-line">
              {lesson.easy_english || 'Detailed breakdown of the concept using everyday analogies and step-by-step logic.'}
            </div>

            {/* Step-by-Step Breakdown if available */}
            {lesson.step_by_step && lesson.step_by_step.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-500">Step-by-Step Logic:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lesson.step_by_step.map((step: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-black text-[#0288D1] block mb-0.5">
                        Step {step.step || idx + 1}: {step.heading || `Phase ${idx + 1}`}
                      </span>
                      <p className="text-slate-600 font-medium">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Real-Life Examples */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-900">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>4. Real-Life Examples (Practical Scenarios)</span>
            </div>

            {/* Indian & Global Case Studies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lesson.indian_examples && lesson.indian_examples.length > 0 ? (
                lesson.indian_examples.map((ex: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{ex.company || 'Enterprise Case Study'}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
                        Industry Example
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">{ex.scenario}</p>
                    <p className="text-[11px] text-emerald-700 font-bold pt-1 border-t border-emerald-50">
                      💡 Takeaway: {ex.takeaway}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs">
                  <span className="font-black text-slate-800 block mb-1">UPI & Ola / Uber Integration</span>
                  <p className="text-slate-600 font-medium">
                    When you book an Ola ride, the app calls Google Maps API for route calculation, PhonePe / UPI API for automatic payments, and SMS API for security OTPs — three distinct systems seamlessly communicating in milliseconds.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Important Terms & Definitions */}
          {lesson.terminology && lesson.terminology.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-900">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>5. Important Terms & Definitions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lesson.terminology.map((term: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-indigo-100 text-xs shadow-2xs">
                    <span className="font-black text-indigo-950 block">{term.term || term.name}</span>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">{term.definition || term.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: Diagrams & Visual Explanations */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/60 border-2 border-sky-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0288D1]">
              <Network className="w-4 h-4 text-[#0288D1]" />
              <span>6. Diagrams & Visual Explanations</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-sky-100 text-center font-mono text-xs text-slate-800 space-y-2">
              <div className="flex items-center justify-center gap-2 text-slate-600 font-bold">
                <span className="px-3 py-1.5 rounded-lg bg-sky-100 border border-sky-200 font-black">
                  [ Client / User Request ]
                </span>
                <span>──►</span>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-200 font-black">
                  [ System Gateway / Logic ]
                </span>
                <span>──►</span>
                <span className="px-3 py-1.5 rounded-lg bg-indigo-100 border border-indigo-200 font-black">
                  [ Database & Services ]
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans mt-2">
                Flow Architecture: Input payload validated at edge &rarr; Core business algorithm executes &rarr; Atomic persistent state updated.
              </p>
            </div>
          </div>

          {/* SECTION 7: How this topic connects to other topics */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
              <LinkIcon className="w-4 h-4 text-[#0288D1]" />
              <span>7. How this Topic Connects to Other Topics</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              This topic builds directly upon previous session fundamentals and prepares you for subsequent modules on optimization, distributed scaling, and security auditing.
            </p>
          </div>

          {/* SECTION 8: Important Points to Remember */}
          {lesson.key_points && lesson.key_points.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-950">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>8. Important Points to Remember</span>
              </div>
              <ul className="space-y-1.5">
                {lesson.key_points.map((pt: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 font-bold">
                    <span className="text-amber-600 text-sm shrink-0">✦</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 9: Short Revision Notes (Memory Bread) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-950">
                <span>🍞</span>
                <span>9. Short Revision Notes (Memory Bread)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-900 font-black">
                1-Minute Summary
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 font-black leading-relaxed">
              {lesson.revision_summary || lesson.simple_definition || 'Key takeaway: Understand the inputs, process, outputs, and trade-offs of this core concept.'}
            </p>
          </div>

          {/* SECTION 10: Practice Questions to Check Understanding */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50 border-2 border-sky-300 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0288D1]">
                <HelpCircle className="w-4 h-4 text-[#0288D1]" />
                <span>10. Practice Questions to Check Understanding</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-200 text-sky-950 font-black">
                Self-Test
              </span>
            </div>

            {/* Interactive Question Cards */}
            <div className="space-y-3">
              {[
                {
                  question: `Which of the following best describes "${lesson.title}"?`,
                  options: [
                    lesson.simple_definition || 'A systematic framework for designing and executing software architectures.',
                    'A hardware physical server component installed in data centers.',
                    'An obsolete protocol that is no longer used in modern systems.',
                  ],
                  correctIdx: 0,
                  explanation: 'Correct! This directly matches the fundamental definition of the concept.',
                },
              ].map((q, qIdx) => {
                const userSelected = selectedAnswers[qIdx];
                const hasAnswered = showAnswerFeedback[qIdx];
                return (
                  <div key={qIdx} className="p-3.5 rounded-xl bg-white border border-sky-200 space-y-2 text-xs">
                    <p className="font-black text-slate-900">{q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = userSelected === oIdx;
                        const isCorrect = oIdx === q.correctIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(qIdx, oIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center justify-between ${
                              hasAnswered
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : isChosen
                                  ? 'bg-red-50 border-red-300 text-red-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                                : 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {hasAnswered && (
                      <p className="text-[11px] font-bold text-emerald-700 pt-1">
                        🎉 {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* FIXED FOOTER ACTION BAR                                        */}
        {/* ============================================================== */}
        <div className="shrink-0 bg-slate-50 border-t border-sky-100 px-5 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close Explanation
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-200 cursor-pointer"
          >
            <span>Understood! Back to 3D Universe</span>
            <span>✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};

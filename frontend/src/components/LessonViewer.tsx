import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Award,
  Layers,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  FileText,
  Lightbulb,
  Check,
  RotateCw,
  Flame
} from 'lucide-react';
import { Lesson } from '../types';
import { api } from '../services/api';
import { DoraemonMascot } from './DoraemonMascot';
import { sounds } from '../services/soundEffects';

interface LessonViewerProps {
  lesson: Lesson;
  onLessonCompleted: (xpEarned: number, newBadge?: string) => void;
  onNextTopic?: () => void;
  onPrevTopic?: () => void;
  onOpenTutorWithPrompt: (prompt: string) => void;
  onLaunchQuizForTopic: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  onLessonCompleted,
  onNextTopic,
  onPrevTopic,
  onOpenTutorWithPrompt,
  onLaunchQuizForTopic,
}) => {
  // 3 Simple Learning Modes (Requirement 7): 'simple' | 'detailed' | 'exam' | 'all'
  const [learningMode, setLearningMode] = useState<'simple' | 'detailed' | 'exam' | 'all'>('detailed');
  // Language toggle: English vs Hinglish
  const [language, setLanguage] = useState<'english' | 'hinglish'>('english');
  // Small Light toggle: Simplify Mode (ELI5)
  const [simplifyMode, setSimplifyMode] = useState<boolean>(false);
  // Lesson completion state
  const [isCompleted, setIsCompleted] = useState<boolean>(lesson.is_completed);
  const [isMarkingComplete, setIsMarkingComplete] = useState<boolean>(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0288D1', '#FFD600', '#E53935', '#00E676'],
      });
    } catch (e) {}
  };

  const handleMarkComplete = async () => {
    if (isCompleted || isMarkingComplete) return;
    setIsMarkingComplete(true);
    sounds.playCelebrateFanfare();
    try {
      const res = await api.completeLesson(lesson.topic_id, lesson.course_id);
      setIsCompleted(true);
      triggerConfetti();
      onLessonCompleted(res.xp_awarded, res.new_badge);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const sourceStr = lesson.source_pages && lesson.source_pages.length > 0
    ? `${lesson.unit_label} ${lesson.source_pages.join(', ')}`
    : `${lesson.unit_label} 1`;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Interactive Doraemon Companion Header Dock */}
      <div className="bg-white rounded-3xl p-6 border-2 border-sky-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-sky-100">
          <div className="flex items-center gap-3">
            <DoraemonMascot
              state={isCompleted ? 'celebrate' : 'study'}
              size="sm"
              showSpeechBubble={false}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0288D1] font-black">
                  {sourceStr}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                  {lesson.importance || 'Core Concept'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {lesson.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Course: {lesson.course_title}
              </p>
            </div>
          </div>

          {/* Language Toggle & Small Light Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Small Light Button */}
            <button
              onClick={() => {
                setSimplifyMode(!simplifyMode);
                sounds.playClickSound();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                simplifyMode
                  ? 'bg-yellow-400 text-yellow-950 shadow-md ring-2 ring-yellow-300 scale-102'
                  : 'bg-yellow-50 text-yellow-900 border border-yellow-200 hover:bg-yellow-100'
              }`}
              title="Small Light Gadget: Simplify to 5th-grade ELI5 terms"
            >
              <span className="text-sm">🔦</span>
              <span>Small Light</span>
            </button>

            {/* Language Switch */}
            <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => {
                  setLanguage('english');
                  sounds.playClickSound();
                }}
                className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                  language === 'english'
                    ? 'bg-white text-sky-800 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  setLanguage('hinglish');
                  sounds.playClickSound();
                }}
                className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                  language === 'hinglish'
                    ? 'bg-white text-sky-800 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>
        </div>

        {/* 3 Learning Modes Bar (Explicit Requirement Section 7) */}
        <div className="bg-sky-50/70 p-2 rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <span className="text-sm">🎯</span>
            <span className="font-black text-slate-800">Learning Mode:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'simple', label: '1. Explain Simply', emoji: '💡', desc: 'First-time learner' },
              { id: 'detailed', label: '2. Detailed Learning', emoji: '📚', desc: 'Complete in-depth concepts' },
              { id: 'exam', label: '3. Exam Preparation', emoji: '📝', desc: 'Definitions & university questions' },
              { id: 'all', label: 'All Sections', emoji: '🌟', desc: 'Show all 18 sections' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setLearningMode(m.id as any);
                  sounds.playClickSound();
                }}
                title={m.desc}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  learningMode === m.id
                    ? 'bg-[#0288D1] text-white shadow-xs scale-102'
                    : 'bg-white text-slate-700 hover:bg-sky-100 border border-slate-200'
                }`}
              >
                <span>{m.emoji}</span>
                <span className="ml-1">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6 Quick Action Companion Pills (User Requirement #7) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#0288D1]" />
            <span>Quick Tutor Actions:</span>
          </span>

          <button
            onClick={() => onOpenTutorWithPrompt(`Explain "${lesson.title}" in very simple, beginner-friendly English.`)}
            className="text-[11px] font-bold px-3 py-1 rounded-full bg-sky-50 text-[#0288D1] border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
          >
            💡 Explain Simply
          </button>

          <button
            onClick={() => onOpenTutorWithPrompt(`Explain "${lesson.title}" in natural Hinglish as used by Indian engineering students.`)}
            className="text-[11px] font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 transition-colors cursor-pointer"
          >
            🇮🇳 Explain in Hinglish
          </button>

          <button
            onClick={() => onOpenTutorWithPrompt(`Give me a detailed Indian real-life company example (UPI, Tata, Jio, Zomato) for "${lesson.title}".`)}
            className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            🏢 Give an Example
          </button>

          <button
            onClick={() => onOpenTutorWithPrompt(`Draw and explain a workflow diagram for "${lesson.title}".`)}
            className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            📊 Show Diagram
          </button>

          <button
            onClick={onLaunchQuizForTopic}
            className="text-[11px] font-bold px-3 py-1 rounded-full bg-yellow-50 text-yellow-900 border border-yellow-300 hover:bg-yellow-100 transition-colors cursor-pointer"
          >
            🎯 Quiz Me
          </button>

          <button
            onClick={() => onOpenTutorWithPrompt(`Give me a 3-bullet Memory Bread revision summary for "${lesson.title}".`)}
            className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            🍞 Revise This Topic
          </button>
        </div>

        {/* Small Light (ELI5) Banner if Active */}
        {simplifyMode && lesson.simplified_mode && (
          <div className="mt-4 p-4 rounded-3xl bg-yellow-50 border-2 border-yellow-300 shadow-sm animate-pop-in">
            <div className="flex items-center gap-2 text-yellow-900 font-black text-sm mb-1.5">
              <span>🔦</span>
              <span>Small Light: Simplified for 5th Graders</span>
            </div>
            <p className="text-xs text-yellow-950 font-medium leading-relaxed mb-2">
              {lesson.simplified_mode.eli5_text}
            </p>
            {lesson.simplified_mode.gadget_tip && (
              <p className="text-[11px] font-bold text-yellow-800 italic">
                💡 Doremon's Tip: {lesson.simplified_mode.gadget_tip}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* 1. Simple Definition */}
        <section className="bg-white rounded-3xl p-6 border-2 border-sky-100 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#0288D1] flex items-center gap-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-[#0288D1]" />
            <span>Simple Definition</span>
          </h2>
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-sky-950 font-semibold text-sm sm:text-base leading-relaxed">
            {lesson.simple_definition}
          </div>
        </section>

        {/* 2. Detailed Explanation (Easy English or Hinglish) */}
        <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0288D1]" />
              <span>
                {language === 'hinglish' ? 'Hinglish Explanation' : 'Detailed Explanation (Easy English)'}
              </span>
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {language === 'hinglish' ? '🇮🇳 Hinglish Active' : '🇺🇸 Easy English'}
            </span>
          </div>

          <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line font-medium">
            {language === 'hinglish' ? lesson.hinglish : lesson.easy_english}
          </div>
        </section>

        {/* 3. Step-by-Step Breakdown */}
        {lesson.step_by_step && lesson.step_by_step.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-[#0288D1]" />
              <span>Step-by-Step Breakdown</span>
            </h2>

            <div className="space-y-3">
              {lesson.step_by_step.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#0288D1] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                    {item.step || idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1">
                      {item.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Verified Key Points from Source Material */}
        {lesson.key_points && lesson.key_points.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Important Points from Source ({sourceStr})</span>
            </h2>

            <ul className="space-y-2">
              {lesson.key_points.map((pt, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 5. Indian Company Real-World Case Studies */}
        {lesson.indian_examples && lesson.indian_examples.length > 0 && (
          <section className="bg-gradient-to-br from-orange-50/70 via-white to-emerald-50/60 rounded-3xl p-6 border-2 border-orange-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🇮🇳</span>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Indian Industry Case Study
              </h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                Practical Application
              </span>
            </div>

            {lesson.indian_examples.map((item, idx) => (
              <div key={idx} className="bg-white/90 rounded-2xl p-4 border border-orange-200 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-black text-sm text-slate-900">
                    {item.company}
                  </h3>
                  {item.title && (
                    <span className="text-[11px] font-bold text-[#0288D1]">
                      {item.title}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-2.5">
                  {item.scenario}
                </p>
                <div className="p-2.5 rounded-xl bg-orange-50/80 text-[11px] sm:text-xs font-semibold text-orange-950 flex items-start gap-1.5 border border-orange-100">
                  <span>💡</span>
                  <span><strong>Key Takeaway:</strong> {item.takeaway}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 6. Important Terminology & Definitions */}
        {lesson.terminology && lesson.terminology.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
              <span className="text-base">📚</span>
              <span>Important Terminology & Meanings</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.terminology.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-200 transition-colors"
                >
                  <h3 className="font-black text-xs uppercase tracking-wide text-purple-900 mb-1">
                    {t.term}
                  </h3>
                  <p className="text-xs text-purple-950 font-medium leading-relaxed">
                    {t.definition}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Formulas with Solved Examples */}
        {lesson.formulas && lesson.formulas.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <span className="text-base">🧮</span>
              <span>Formulas & Solved Problems</span>
            </h2>

            <div className="space-y-4">
              {lesson.formulas.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
                  <div className="font-mono font-bold text-xs sm:text-sm text-sky-950 bg-white p-3 rounded-xl border border-sky-100 shadow-xs mb-2.5">
                    {f.formula}
                  </div>
                  <p className="text-xs text-slate-600 mb-2 font-medium">
                    <strong>Variables:</strong> {f.variables}
                  </p>
                  <div className="p-3 rounded-xl bg-white/80 border border-sky-100 text-xs text-sky-900 font-medium">
                    <strong className="text-sky-950">Solved Example:</strong> {f.solved_example}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Workflow Diagram / Flowchart */}
        {lesson.diagram && lesson.diagram.mermaid_syntax && (
          <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <span className="text-base">📊</span>
              <span>Workflow & Concept Diagram ({lesson.diagram.diagram_type || 'Flowchart'})</span>
            </h2>

            <div className="p-4 rounded-2xl bg-slate-900 text-sky-300 font-mono text-xs overflow-x-auto shadow-inner mb-2.5">
              <pre className="whitespace-pre">{lesson.diagram.mermaid_syntax}</pre>
            </div>
            {lesson.diagram.explanation && (
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                💡 <strong>Explanation:</strong> {lesson.diagram.explanation}
              </p>
            )}
          </section>
        )}

        {/* 9. Comparisons / Pros & Cons */}
        {lesson.comparisons && lesson.comparisons.comparison_table && lesson.comparisons.comparison_table.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <span className="text-base">⚖️</span>
              <span>Comparative Analysis & Trade-Offs</span>
            </h2>

            <div className="rounded-2xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-black text-slate-700">
                    <th className="p-3 w-1/3">Feature / Parameter</th>
                    <th className="p-3 text-emerald-800">{lesson.comparisons.item_a || 'Advantages'}</th>
                    <th className="p-3 text-amber-800">{lesson.comparisons.item_b || 'Limitations'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {lesson.comparisons.comparison_table.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{row.feature}</td>
                      <td className="p-3 font-medium text-emerald-950">{row.item_a_val}</td>
                      <td className="p-3 font-medium text-amber-950">{row.item_b_val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 10. Exam Notes & High Yield Tips */}
        {lesson.exam_notes && (
          <section className="bg-gradient-to-r from-red-50/70 to-amber-50/60 rounded-3xl p-6 border-2 border-red-200 shadow-xs">
            <h2 className="text-xs font-black uppercase tracking-wider text-red-900 flex items-center gap-2 mb-2.5">
              <Award className="w-4 h-4 text-red-600" />
              <span>University Exam Strategy & High Yield Tips</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
              {lesson.exam_notes}
            </div>
          </section>
        )}

        {/* 11. Short & Long Answer Questions */}
        <section className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#0288D1]" />
            <span>Important Short & Long Answer Questions</span>
          </h2>

          {lesson.short_questions && lesson.short_questions.map((q, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                2-Mark Question
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2 mb-1.5">
                {q.question}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                <strong>Model Answer:</strong> {q.answer}
              </p>
            </div>
          ))}

          {lesson.long_questions && lesson.long_questions.map((q, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                5-10 Mark Question
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2 mb-1.5">
                {q.question}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                <strong>Answer Structure Guideline:</strong> {q.guideline}
              </p>
            </div>
          ))}
        </section>

        {/* 12. Memory Bread Quick Revision Summary */}
        {lesson.revision_summary && (
          <section className="bg-amber-50/90 rounded-3xl p-6 border-2 border-amber-300 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl animate-bounce">🍞</span>
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-900">
                Memory Bread Revision Summary
              </h2>
            </div>
            <div className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed whitespace-pre-line">
              {lesson.revision_summary}
            </div>
          </section>
        )}
      </div>

      {/* Completion & Next Lesson Bottom Bar */}
      <div className="mt-8 p-5 bg-white/95 backdrop-blur-md rounded-3xl border-2 border-sky-200 shadow-xl flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkComplete}
            disabled={isCompleted || isMarkingComplete}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
              isCompleted
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:scale-102 animate-bounce'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Lesson Completed (+50 XP)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Mark as Completed (+50 XP)</span>
              </>
            )}
          </button>
        </div>

        {/* Next / Prev Navigation */}
        <div className="flex items-center gap-2">
          {onPrevTopic && (
            <button
              onClick={onPrevTopic}
              className="p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
          )}
          {onNextTopic && (
            <button
              onClick={onNextTopic}
              className="px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-102 transition-all"
            >
              <span>Next Topic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

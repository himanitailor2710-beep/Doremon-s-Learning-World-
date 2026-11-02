import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, AlertCircle, Award, Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../types';
import { api } from '../services/api';
import { DoraemonMascot } from './DoraemonMascot';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  courseId: string;
  topicTitle: string;
  onQuizCompleted: (xpEarned: number, newBadge?: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  topicId,
  courseId,
  topicTitle,
  onQuizCompleted,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizId, setQuizId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && topicId) {
      loadQuiz();
    }
  }, [isOpen, topicId]);

  const loadQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setSelectedAnswers({});
    setResultData(null);

    try {
      const data = await api.getQuiz(topicId);
      setQuizId(data.id);
      setQuestions(data.questions || []);
    } catch (e) {
      console.error('Failed to load quiz', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (submitted || questions.length === 0) return;
    const answersList = questions.map((_, idx) => selectedAnswers[idx] ?? -1);

    try {
      const res = await api.submitQuiz(quizId, courseId, topicId, answersList);
      setResultData(res);
      setSubmitted(true);
      if (res.score_percent >= 70) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0288D1', '#FFD600', '#E53935', '#00E676'],
          });
        } catch (e) {}
      }
      onQuizCompleted(res.xp_earned, res.new_badge);
    } catch (e) {
      console.error('Quiz submission failed', e);
    }
  };

  // Encouraging mascot message calculation
  const getMascotQuizFeedback = () => {
    if (!resultData) return '';
    if (resultData.score_percent === 100) {
      return "Mission complete! 🎉 A perfect 100%! You're a true Gadget Master!";
    } else if (resultData.score_percent >= 70) {
      return "Great job! One more topic mastered! Let's explore the next topic!";
    } else {
      return "Don't worry, let's try that question again! Review with Memory Bread!";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border-2 border-emerald-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl shadow-inner animate-float">
              🎯
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Quiz Gadget Practice</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-400 text-yellow-950 font-black">
                  +XP Mode
                </span>
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Topic: {topicTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-bold text-sm">
              Loading Quiz Gadget questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No questions found for this topic yet.
            </div>
          ) : (
            <>
              {/* Score & Mascot Banner if Submitted */}
              {submitted && resultData && (
                <div
                  className={`p-5 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pop-in ${
                    resultData.score_percent >= 70
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DoraemonMascot
                      state={resultData.score_percent >= 70 ? 'celebrate' : 'encourage'}
                      size="sm"
                      showSpeechBubble={false}
                    />
                    <div>
                      <h3 className="font-black text-base">
                        {getMascotQuizFeedback()}
                      </h3>
                      <p className="text-xs font-bold text-slate-600 mt-1">
                        Score: <strong>{resultData.score_percent}%</strong> ({resultData.correct_count}/{resultData.total_questions}) • +{resultData.xp_earned} XP Awarded!
                      </p>
                    </div>
                  </div>

                  {resultData.new_badge && (
                    <span className="text-xs px-3.5 py-1.5 rounded-full bg-yellow-300 text-yellow-950 font-black shadow-xs shrink-0">
                      🏆 Badge: {resultData.new_badge}!
                    </span>
                  )}
                </div>
              )}

              {/* Questions List */}
              {questions.map((q, qIdx) => {
                return (
                  <div
                    key={qIdx}
                    className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-emerald-800">
                        Question {qIdx + 1} of {questions.length}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {q.question}
                    </h4>

                    {/* Options */}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx;
                        let optStyle = 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400';

                        if (submitted) {
                          const isCorrect = optIdx === q.correct_index;
                          if (isCorrect) {
                            optStyle = 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-black';
                          } else if (isSelected && !isCorrect) {
                            optStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold';
                          } else {
                            optStyle = 'bg-slate-50 border-slate-200 text-slate-400';
                          }
                        } else if (isSelected) {
                          optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black';
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelect(qIdx, optIdx)}
                            className={`p-3 rounded-2xl border-2 text-xs cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                          >
                            <span className="leading-relaxed">{opt}</span>
                            {submitted && optIdx === q.correct_index && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation after submit */}
                    {submitted && (
                      <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 font-medium leading-relaxed">
                        <strong className="text-sky-900">💡 Why this is correct:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {submitted ? (
            <button
              onClick={loadQuiz}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          ) : (
            <p className="text-xs text-slate-500 font-medium">
              Pick your answers and submit to earn XP and level up!
            </p>
          )}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-200 disabled:opacity-50 cursor-pointer"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-900 shadow-xs cursor-pointer"
            >
              Done & Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

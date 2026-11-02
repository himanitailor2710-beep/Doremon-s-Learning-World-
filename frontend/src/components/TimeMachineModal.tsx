import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Clock, AlertTriangle, CheckCircle2, Award, RotateCcw } from 'lucide-react';
import { api } from '../services/api';

interface TimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const [examData, setExamData] = useState<any>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && courseId) {
      loadExam();
    }
  }, [isOpen, courseId]);

  // Countdown Timer
  useEffect(() => {
    if (!isOpen || isSubmitted || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSubmitted, secondsRemaining]);

  const loadExam = async () => {
    setLoading(true);
    setIsSubmitted(false);
    setAnswers({});
    setSecondsRemaining(15 * 60);
    try {
      const data = await api.getTimeMachineExam(courseId, 15);
      setExamData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = () => {
    if (isSubmitted || !examData) return;
    let correct = 0;
    const questions = examData.questions || [];
    questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correct_index) {
        correct++;
      }
    });
    setScore(correct);
    setIsSubmitted(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = secondsRemaining < 120;

  const questions = examData?.questions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-indigo-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl shadow-inner">
              ⏳
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Time Machine Exam Simulator</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-300 text-indigo-950 font-black">
                  Timed Practice
                </span>
              </h2>
              <p className="text-xs text-indigo-100 font-medium">
                {courseTitle} • 15-Minute Mock University Test
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Clock Display */}
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono font-black text-sm shadow-xs ${
                isUrgent
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-white/20 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeFormatted}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Exam Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-bold text-xs">
              Traveling through the Time Machine to prepare your exam...
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No questions found for this course yet.
            </div>
          ) : (
            <>
              {/* Score Report Card */}
              {isSubmitted && (
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base mb-1">
                      Time Machine Exam Completed!
                    </h3>
                    <p className="text-xs font-semibold">
                      You scored <strong>{score}</strong> out of <strong>{questions.length}</strong> points ({Math.round((score / questions.length) * 100)}%).
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                      🏆 Time Traveler Status Unlocked
                    </span>
                  </div>
                </div>
              )}

              {/* Questions */}
              {questions.map((q: any, qIdx: number) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-800">
                      Question {qIdx + 1} • {q.topic_title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {q.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {q.question}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => {
                      const isSelected = answers[qIdx] === optIdx;
                      let style = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300';

                      if (isSubmitted) {
                        if (optIdx === q.correct_index) {
                          style = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                        } else if (isSelected && optIdx !== q.correct_index) {
                          style = 'bg-rose-50 border-rose-300 text-rose-950';
                        } else {
                          style = 'bg-slate-50 border-slate-200 text-slate-400';
                        }
                      } else if (isSelected) {
                        style = 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => {
                            if (!isSubmitted) {
                              setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${style}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && optIdx === q.correct_index && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 font-medium leading-relaxed">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {isSubmitted ? (
            <button
              onClick={loadExam}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-50 border border-indigo-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Exam</span>
            </button>
          ) : (
            <p className="text-xs text-slate-500 font-medium">
              Answer all questions before the timer hits 00:00!
            </p>
          )}

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-900 shadow-xs cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

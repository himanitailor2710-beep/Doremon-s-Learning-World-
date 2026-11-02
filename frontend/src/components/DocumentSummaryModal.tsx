import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  HelpCircle,
  Layers,
  ArrowRight,
  ClipboardList,
  Target,
  FileText,
  Lightbulb,
  CheckCircle2,
  GitBranch
} from 'lucide-react';
import { CourseSummaryData, Course } from '../types';
import { api } from '../services/api';
import { sounds } from '../services/soundEffects';

interface DocumentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onStartLearning?: (courseId: string) => void;
}

export const DocumentSummaryModal: React.FC<DocumentSummaryModalProps> = ({
  isOpen,
  onClose,
  course,
  onStartLearning,
}) => {
  const [activeTab, setActiveTab] = useState<'8points' | 'quick' | 'detailed' | 'connects'>('8points');
  const [summaryData, setSummaryData] = useState<CourseSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      loadSummary();
    }
  }, [isOpen, course]);

  const loadSummary = async () => {
    if (!course) return;
    setIsLoading(true);
    try {
      const data = await api.getCourseSummary(course.id);
      setSummaryData(data);
    } catch (e) {
      console.error('Failed to load document summary', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl border-2 border-sky-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0288D1] via-[#03A9F4] to-[#29B6F6] text-white p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl shadow-inner">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-yellow-400 text-yellow-950">
                  Complete Document Summary
                </span>
                <span className="text-xs text-sky-100 font-bold">100% Zero-Omission Analysis</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                {course.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs for Summary Types */}
        <div className="bg-sky-50/80 px-6 py-2.5 border-b border-sky-100 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: '8points', label: '8 Core Educational Questions', emoji: '🎯' },
            { id: 'connects', label: 'How Everything Connects', emoji: '🔗' },
            { id: 'quick', label: 'Quick Summary', emoji: '⚡' },
            { id: 'detailed', label: 'Detailed Summary', emoji: '📚' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                sounds.playClickSound();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#0288D1] text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-900 hover:bg-white/70'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {isLoading ? (
            <div className="py-20 text-center">
              <span className="text-4xl animate-bounce inline-block mb-3">📖</span>
              <p className="text-sm font-black text-slate-700">Synthesizing complete document summary...</p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Analyzing all slides, concepts, and relationships without omissions
              </p>
            </div>
          ) : !summaryData ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              Summary could not be loaded. Please try again.
            </div>
          ) : (
            <>
              {/* TAB 1: 8 CORE EDUCATIONAL QUESTIONS (Requirement 6) */}
              {activeTab === '8points' && (
                <div className="space-y-4">
                  {/* Q1: What is this document about? */}
                  <div className="p-5 rounded-2xl bg-sky-50/70 border-2 border-sky-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0288D1] uppercase tracking-wider">
                      <span>1️⃣</span>
                      <span>What is this document about?</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {summaryData.what_is_it_about}
                    </p>
                  </div>

                  {/* Q2: What are the main topics? */}
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-indigo-700 uppercase tracking-wider">
                      <span>2️⃣</span>
                      <span>What are the main topics?</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {summaryData.main_topics.map((t, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                          <span className="font-black text-slate-900 block mb-0.5">{t.title}</span>
                          <span className="text-slate-500 font-medium text-[11px]">{t.brief}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q3: What will I learn from this document? */}
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wider">
                      <span>3️⃣</span>
                      <span>What will I learn from this document?</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                      {summaryData.what_will_learn.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Q4: What are the most important concepts? */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                      <span>4️⃣</span>
                      <span>What are the most important concepts?</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-700 font-medium">
                      {summaryData.important_concepts.map((pt, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/80 border border-amber-200">
                          {pt}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Q5: How are the topics connected? */}
                  <div className="p-5 rounded-2xl bg-purple-50/70 border-2 border-purple-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-900 uppercase tracking-wider">
                      <span>5️⃣</span>
                      <span>How are the topics connected?</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {summaryData.how_topics_connected}
                    </p>
                  </div>

                  {/* Q6: Which concepts should I understand first? */}
                  <div className="p-5 rounded-2xl bg-rose-50/70 border-2 border-rose-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-rose-900 uppercase tracking-wider">
                      <span>6️⃣</span>
                      <span>Which concepts should I understand first?</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                      {summaryData.understand_first.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-rose-500 font-black">▸</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Q7: What are the important exam-related points? */}
                  <div className="p-5 rounded-2xl bg-yellow-50 border-2 border-yellow-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-yellow-950 uppercase tracking-wider">
                      <span>7️⃣</span>
                      <span>What are the important exam-related points?</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                      {summaryData.exam_points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-600 font-black">★</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Q8: What is the overall conclusion? */}
                  <div className="p-5 rounded-2xl bg-blue-50/80 border-2 border-blue-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase tracking-wider">
                      <span>8️⃣</span>
                      <span>What is the overall conclusion?</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      {summaryData.conclusion}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: HOW EVERYTHING CONNECTS (Requirement 8) */}
              {activeTab === 'connects' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-purple-50/80 border-2 border-purple-200">
                    <h3 className="font-black text-base text-purple-950 mb-1 flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-purple-600" />
                      <span>How Everything Connects</span>
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {summaryData.how_topics_connected}
                    </p>
                  </div>

                  {/* Mermaid Diagram / Flowchart representation */}
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-black text-slate-800">
                      <span>📊 Topic Progression Flowchart</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Structured Hierarchy</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 overflow-x-auto text-xs font-mono text-slate-700 whitespace-pre">
                      {summaryData.mermaid_syntax}
                    </div>
                  </div>

                  {/* Explicit Topic Relationship Cards */}
                  <div className="space-y-3">
                    <h4 className="font-black text-sm text-slate-900">
                      Detailed Concept Interdependencies:
                    </h4>
                    {summaryData.connections.map((c, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border-2 border-sky-100 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span className="text-[#0288D1] font-black">{c.from_topic}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-100 text-[#0288D1] font-extrabold uppercase">
                            {c.relation_type}
                          </span>
                          <span className="text-slate-800 font-black">{c.to_topic}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{c.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: QUICK SUMMARY */}
              {activeTab === 'quick' && (
                <div className="p-6 rounded-3xl bg-sky-50/70 border-2 border-sky-200 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-[#0288D1] uppercase tracking-wider">
                    <span>⚡ Quick Executive Summary</span>
                  </div>
                  <p className="text-base font-semibold text-slate-800 leading-relaxed">
                    {summaryData.quick_summary}
                  </p>
                </div>
              )}

              {/* TAB 4: DETAILED SUMMARY */}
              {activeTab === 'detailed' && (
                <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {summaryData.detailed_summary}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>

          {onStartLearning && (
            <button
              onClick={() => {
                onStartLearning(course.id);
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-200 hover:scale-102 transition-all cursor-pointer"
            >
              <span>🚀 Start Learning Course Topics</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

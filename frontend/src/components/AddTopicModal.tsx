import React, { useState } from 'react';
import { X, Plus, Layers, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { Session } from '../types';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  sessions: Session[];
  onTopicAdded: () => void;
}

export const AddTopicModal: React.FC<AddTopicModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  sessions,
  onTopicAdded,
}) => {
  const [mode, setMode] = useState<'topic' | 'session'>('topic');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions.length > 0 ? sessions[0].id : ''
  );
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [importance, setImportance] = useState('High');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      setError('Topic title is required');
      return;
    }
    if (!selectedSessionId) {
      setError('Please select or create a session/module first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.addTopic(courseId, selectedSessionId, topicTitle.trim(), topicSummary.trim(), importance);
      onTopicAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add topic');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionTitle.trim()) {
      setError('Session/Chapter title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.addSession(courseId, sessionTitle.trim(), sessionDesc.trim());
      setSelectedSessionId(res.session_id);
      setMode('topic');
      onTopicAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-sky-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0288D1] to-[#03A9F4] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl shadow-inner">
              🧩
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                {mode === 'topic' ? 'Add Topic & Generate Lesson' : 'Add Chapter / Session'}
              </h2>
              <p className="text-xs text-sky-100 truncate max-w-xs">{courseTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-sky-100 bg-sky-50/60 p-1.5 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setMode('topic')}
            className={`flex-1 py-2 rounded-xl transition-colors cursor-pointer ${
              mode === 'topic' ? 'bg-white text-sky-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Add Topic Lesson
          </button>
          <button
            onClick={() => setMode('session')}
            className={`flex-1 py-2 rounded-xl transition-colors cursor-pointer ${
              mode === 'session' ? 'bg-white text-sky-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Add Chapter / Session
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {mode === 'topic' ? (
          <form onSubmit={handleCreateTopic} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Session / Chapter
              </label>
              {sessions.length === 0 ? (
                <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  No sessions exist yet.{' '}
                  <button
                    type="button"
                    onClick={() => setMode('session')}
                    className="font-bold underline text-amber-900 cursor-pointer"
                  >
                    Click here to create a session first.
                  </button>
                </div>
              ) : (
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-sky-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Topic Title *
              </label>
              <input
                type="text"
                placeholder="e.g., PESTEL Macro-Environment Analysis"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-sky-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Topic Summary / Notes
              </label>
              <textarea
                rows={2}
                placeholder="Key concepts or keywords for this topic..."
                value={topicSummary}
                onChange={(e) => setTopicSummary(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border border-sky-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Importance
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-sky-200 text-xs font-bold text-slate-800"
              >
                <option value="High">High (Likely Exam Question)</option>
                <option value="Medium">Medium (Core Syllabus)</option>
                <option value="Overview">Overview (Foundational)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || sessions.length === 0}
                className="px-6 py-2.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Generating Lesson...' : 'Save & Generate Lesson'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateSession} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Chapter / Session Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Module 2: Market Structure & Strategy"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-sky-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Chapter Description
              </label>
              <textarea
                rows={3}
                placeholder="Overview of topics and subtopics covered in this chapter..."
                value={sessionDesc}
                onChange={(e) => setSessionDesc(e.target.value)}
                className="w-full px-4 py-2 rounded-2xl border border-sky-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMode('topic')}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Back to Topics
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-200 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Adding Chapter...' : 'Create Chapter'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

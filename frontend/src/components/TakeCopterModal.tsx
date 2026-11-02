import React from 'react';
import { X, Layers, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { CourseDetail } from '../types';

interface TakeCopterModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseDetail | null;
  onSelectTopic: (topicId: string) => void;
}

export const TakeCopterModal: React.FC<TakeCopterModalProps> = ({
  isOpen,
  onClose,
  course,
  onSelectTopic,
}) => {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-yellow-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-5 text-yellow-950 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur flex items-center justify-center text-xl shadow-inner">
              🚁
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Take-copter Concept Explorer</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/40 font-black">
                  10,000 Ft Mindmap
                </span>
              </h2>
              <p className="text-xs text-yellow-900 font-semibold">
                Fly above {course.title} to visualize how every module connects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 text-yellow-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tree Map Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-yellow-50/20">
          {course.sessions.map((session, sIdx) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-yellow-200/80 p-5 shadow-xs relative"
            >
              {/* Module Header */}
              <div className="flex items-center justify-between mb-3 border-b border-yellow-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-yellow-400 text-yellow-950 flex items-center justify-center font-black text-xs">
                    {sIdx + 1}
                  </span>
                  <h3 className="font-black text-sm text-slate-800">
                    {session.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {session.topics.length} Concepts
                </span>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {session.topics.map((topic, tIdx) => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      onSelectTopic(topic.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-yellow-400 hover:bg-yellow-50/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 pr-2 overflow-hidden">
                      <span className="text-xs text-yellow-600 font-black">
                        #{tIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-yellow-900 truncate">
                        {topic.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {topic.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-yellow-600 transition-colors" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            Select any concept card above to land and begin your lesson.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-yellow-950 bg-yellow-400 hover:bg-yellow-500 shadow-xs cursor-pointer"
          >
            Close Flight
          </button>
        </div>
      </div>
    </div>
  );
};

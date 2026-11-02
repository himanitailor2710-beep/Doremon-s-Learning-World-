import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, ChevronRight, Layers, FileText } from 'lucide-react';
import { AnywhereDoorItem } from '../types';
import { api } from '../services/api';

interface AnywhereDoorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (courseId: string, topicId: string) => void;
}

export const AnywhereDoorModal: React.FC<AnywhereDoorModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
}) => {
  const [items, setItems] = useState<AnywhereDoorItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDirectory();
    }
  }, [isOpen, searchQuery]);

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const data = await api.getAnywhereDoorDirectory(searchQuery);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-pink-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
              🚪
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Anywhere Door</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-bold">
                  Topic Teleporter
                </span>
              </h2>
              <p className="text-xs text-pink-100 font-medium">
                Jump directly to any session, chapter, or slide across all your courses
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

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, concept, module, or course name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* List of Teleport Targets */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-slate-400">
              Opening Anywhere Door...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No topics found. Upload a PPT or PDF to populate your portal!
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.topic_id}
                onClick={() => {
                  onSelectTopic(item.course_id, item.topic_id);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-pink-300 hover:bg-pink-50/40 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center text-sm shrink-0 font-bold">
                    {item.file_type === 'pptx' ? '📊' : '📄'}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-pink-600 transition-colors truncate">
                      {item.topic_title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.course_title} • {item.session_title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.is_completed && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Learned</span>
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

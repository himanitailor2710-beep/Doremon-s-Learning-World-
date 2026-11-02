import React, { useState, useEffect } from 'react';
import { X, FileText, Search, Copy, Check } from 'lucide-react';
import { api } from '../services/api';

interface RawTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const RawTextModal: React.FC<RawTextModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const [chunks, setChunks] = useState<Array<{ unit_number: number; header: string; content: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      loadRawText();
    }
  }, [isOpen, courseId]);

  const loadRawText = async () => {
    setLoading(true);
    try {
      const data = await api.getCourseRawText(courseId);
      setChunks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!isOpen) return null;

  const filtered = chunks.filter(
    (c) =>
      c.header.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col border-2 border-sky-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0288D1] via-[#03A9F4] to-[#29B6F6] p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl shadow-inner">
              📄
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Original Extracted Source Text</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-400 text-yellow-950 font-black">
                  Zero Omission Audit
                </span>
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Course: {courseTitle}
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
        <div className="p-4 bg-sky-50 border-b border-sky-100 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search extracted keywords, slide contents, formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white border border-sky-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 font-medium"
            />
          </div>
          <span className="text-xs font-bold text-sky-800 shrink-0">
            {filtered.length} of {chunks.length} Units
          </span>
        </div>

        {/* Content Chunks */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-bold text-xs">
              Loading extracted source chunks...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching content found for "{searchTerm}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0288D1]">
                      Unit #{item.unit_number}
                    </span>
                    <h4 className="font-black text-sm text-slate-900 truncate">
                      {item.header || `Unit ${item.unit_number}`}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(item.content, idx)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-sky-600 cursor-pointer"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {item.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            This extracted text directly powers RAG semantic search and AI lesson synthesis.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-black text-xs hover:bg-slate-900 cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

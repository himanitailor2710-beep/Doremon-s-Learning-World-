import React, { useState } from 'react';
import { Plus, Sparkles, X, Loader2 } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface AddSubjectCloudProps {
  onAddSubject: (subjectName: string) => Promise<void>;
}

export const AddSubjectCloud: React.FC<AddSubjectCloudProps> = ({ onAddSubject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpen = () => {
    sounds.playMagicChime();
    setSubjectName('');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = subjectName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a subject name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onAddSubject(trimmed);
      sounds.playSuccessChime();
      setIsSubmitting(false);
      setIsOpen(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to create subject cloud.');
    }
  };

  return (
    <>
      {/* The Floating "+" Add Subject Cloud Button */}
      <div
        onClick={handleOpen}
        style={{
          animation: 'cloud-float 3.8s ease-in-out infinite',
          animationDelay: '1.2s',
        }}
        className="relative group cursor-pointer transition-transform duration-300 select-none m-2 sm:m-4"
        title="Click to add a new subject cloud!"
      >
        {/* 3D Drop Shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-60 h-8 rounded-full bg-yellow-500/15 blur-md transform scale-y-50 group-hover:scale-110 group-hover:opacity-30 transition-all duration-300" />

        {/* Golden-accented Fluffy Cloud Body */}
        <div className="relative w-64 sm:w-80 min-h-[140px] p-5 rounded-[45px] bg-gradient-to-b from-[#FFFDF7] via-[#FFF9E6] to-[#FFE082] border-3 border-dashed border-amber-300 shadow-xl shadow-amber-300/20 group-hover:shadow-2xl group-hover:shadow-amber-400/40 group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Top Fluffy Cloud Bulges */}
          <div className="absolute -top-6 left-12 w-20 h-20 rounded-full bg-[#FFFDF7] border-t-3 border-amber-200 -z-10" />
          <div className="absolute -top-8 left-28 w-24 h-24 rounded-full bg-[#FFFDF7] border-t-3 border-amber-200 -z-10" />
          <div className="absolute -top-5 right-12 w-18 h-18 rounded-full bg-[#FFFDF7] border-t-3 border-amber-200 -z-10" />

          {/* Plus Circle Icon with Golden Sparkle */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD600] to-[#FFE082] border-2 border-white shadow-md flex items-center justify-center text-[#01579B] mb-2 group-hover:rotate-90 group-hover:scale-110 transition-all duration-300">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>

          <h3 className="text-base font-black text-amber-950 tracking-tight">
            + Add Subject
          </h3>
          <p className="text-[11px] font-bold text-amber-800/80 mt-0.5">
            Click to create a new floating cloud
          </p>

          {/* Ambient Sparkles */}
          <div className="absolute top-2 right-4 text-amber-500 animate-pulse">
            ✨
          </div>
        </div>
      </div>

      {/* Small Beautiful Add Subject Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
          <div className="relative max-w-sm w-full bg-white rounded-3xl p-6 border-3 border-sky-300 shadow-2xl shadow-sky-950/30 text-center animate-in zoom-in-95 duration-200">
            {/* Header with Cloud Emoji */}
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">☁️</span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Add New Subject Cloud
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Product Management 2, Marketing..."
                  autoFocus
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-sky-300 focus:border-[#0288D1] focus:ring-3 focus:ring-sky-100 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner"
                />
                <p className="text-[10px] text-slate-500 font-semibold mt-1">
                  A personalized 3D cloud will be created in Doraemon's house.
                </p>
              </div>

              {errorMsg && (
                <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !subjectName.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-md shadow-sky-200 hover:scale-102 transition-all cursor-pointer disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Add Subject Cloud</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { X, RotateCw, ChevronLeft, ChevronRight, CheckCircle2, Bookmark, Award } from 'lucide-react';
import { Flashcard } from '../types';
import { api } from '../services/api';

interface MemoryBreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
}

export const MemoryBreadModal: React.FC<MemoryBreadModalProps> = ({
  isOpen,
  onClose,
  courseId,
}) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [memorizedCards, setMemorizedCards] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCards();
    }
  }, [isOpen, courseId]);

  const loadCards = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    try {
      const data = await api.getMemoryBreadCards(courseId);
      setCards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleMemorized = (id: string) => {
    setMemorizedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col border border-amber-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-5 text-amber-950 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur flex items-center justify-center text-xl shadow-inner">
              🍞
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>Memory Bread Revision</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/40 font-black">
                  Spaced Repetition
                </span>
              </h2>
              <p className="text-xs text-amber-900 font-semibold">
                Eat bread, memorize definitions & formulas before your exams!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 text-amber-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-bold text-xs">
              Baking Memory Bread flashcards...
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No flashcards available yet. Upload study materials first!
            </div>
          ) : (
            <div className="w-full">
              {/* Progress counter */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-3 px-1">
                <span>
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <span className="text-amber-700">
                  {Object.values(memorizedCards).filter(Boolean).length} Memorized
                </span>
              </div>

              {/* Interactive Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`w-full min-h-[260px] p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between select-none shadow-md ${
                  isFlipped
                    ? 'bg-amber-50/90 border-amber-300'
                    : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-lg'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {currentCard.card_type} • {currentCard.source_ref}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMemorized(currentCard.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        memorizedCards[currentCard.id]
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-black text-xs text-amber-800 uppercase tracking-wider mb-2">
                    {currentCard.topic_title}
                  </h3>

                  {/* Card Front or Back */}
                  {!isFlipped ? (
                    <div className="py-6 text-center">
                      <p className="text-lg font-black text-slate-900 leading-snug">
                        {currentCard.front}
                      </p>
                      <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Click to flip card</span>
                      </p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                        {currentCard.back}
                      </p>
                      <p className="text-xs text-amber-700 font-bold mt-4 flex items-center justify-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Click to flip back</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center font-semibold">
                  Course: {currentCard.course_title}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-300 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            {cards.length > 0 ? `${currentIndex + 1} / ${cards.length}` : '0 / 0'}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex >= cards.length - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <span>Next Bread</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

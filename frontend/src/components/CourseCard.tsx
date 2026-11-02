import React from 'react';
import { BookOpen, Layers, CheckCircle2, AlertCircle, Loader2, ArrowRight, Trash2, RotateCcw, ClipboardList, FileText, Plus, Sparkles } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelect: (courseId: string) => void;
  onOpenCoverage: (courseId: string) => void;
  onOpenRawText?: (courseId: string, courseTitle: string) => void;
  onAddTopic?: (courseId: string, courseTitle: string) => void;
  onOpenSummary?: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onRetry: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelect,
  onOpenCoverage,
  onOpenRawText,
  onAddTopic,
  onOpenSummary,
  onDelete,
  onRetry,
}) => {
  const isReady = course.status === 'ready';
  const isError = course.status === 'error';
  const isProcessing = !isReady && !isError;

  const unitLabel = course.file_type === 'pptx' ? 'Slides' : course.file_type === 'pdf' ? 'Pages' : 'Units';
  const progressRatio = course.topic_count > 0 
    ? Math.round((course.completed_topics_count / course.topic_count) * 100)
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between group hover:-translate-y-1">
      <div>
        {/* Top Header Card */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {course.file_type === 'pptx' ? '📊' : course.file_type === 'pdf' ? '📄' : '📚'}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                course.file_type === 'pptx'
                  ? 'bg-orange-100 text-orange-800'
                  : course.file_type === 'pdf'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-sky-100 text-[#0288D1]'
              }`}>
                {course.file_type}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                • {course.total_units} {unitLabel}
              </span>
            </div>

            {/* Status Chip */}
            {isReady && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready to Learn</span>
              </span>
            )}
            {isProcessing && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                <span>{course.progress_percent}% Processed</span>
              </span>
            )}
            {isError && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Processing Error</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => isReady && onSelect(course.id)}
            className={`font-black text-base text-slate-800 mb-1.5 leading-snug line-clamp-2 ${
              isReady ? 'cursor-pointer group-hover:text-[#0288D1] transition-colors' : ''
            }`}
          >
            {course.title}
          </h3>

          <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">
            Source: {course.filename}
          </p>

          {/* Processing message or completion stats */}
          {isProcessing ? (
            <div className="space-y-1.5 my-2">
              <div className="flex justify-between text-[11px] font-semibold text-sky-800">
                <span>{course.status_message || 'Analyzing topics...'}</span>
                <span>{course.progress_percent}%</span>
              </div>
              <div className="w-full h-2 bg-sky-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0288D1] to-[#03A9F4] rounded-full transition-all duration-300"
                  style={{ width: `${course.progress_percent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 my-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Course Mastery</span>
                <span className="text-sky-700 font-bold">{progressRatio}% Completed</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FFD600] to-[#FF9100] rounded-full transition-all duration-300"
                  style={{ width: `${progressRatio}%` }}
                />
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>{course.topic_count} Topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{course.completed_topics_count} Learned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {/* Complete Summary Button */}
          {isReady && onOpenSummary && (
            <button
              onClick={() => onOpenSummary(course)}
              title="View Complete Summary (8 Core Educational Questions)"
              className="p-2 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Summary</span>
            </button>
          )}

          {/* Coverage Checklist Button */}
          {isReady && (
            <button
              onClick={() => onOpenCoverage(course.id)}
              title="100% Slide/Page Coverage Checklist"
              className="p-2 rounded-xl text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Coverage</span>
            </button>
          )}

          {/* Raw Text Button */}
          {isReady && onOpenRawText && (
            <button
              onClick={() => onOpenRawText(course.id, course.title)}
              title="View Extracted Source Text"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-xs font-bold"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Add Topic Button */}
          {isReady && onAddTopic && (
            <button
              onClick={() => onAddTopic(course.id, course.title)}
              title="Add Chapter or Topic Manually"
              className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Retry Button if error */}
          {isError && (
            <button
              onClick={() => onRetry(course.id)}
              className="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-800 font-bold text-xs hover:bg-sky-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(course.id)}
            title="Delete Course"
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Enter Course Button */}
        {isReady && (
          <button
            onClick={() => onSelect(course.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>Learn Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

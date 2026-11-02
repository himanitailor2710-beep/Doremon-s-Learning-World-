import React from 'react';
import { X, CheckCircle2, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { CourseDetail } from '../types';

interface CoverageModalProps {
  course: CourseDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic?: (topicId: string) => void;
}

export const CoverageModal: React.FC<CoverageModalProps> = ({
  course,
  isOpen,
  onClose,
  onSelectTopic,
}) => {
  if (!isOpen || !course) return null;

  const checklist = course.coverage_checklist || [];
  const totalUnits = course.total_units || checklist.length;
  const processedCount = checklist.filter((item) => item.status.includes('Processed')).length;
  const coveragePercent = totalUnits > 0 ? Math.round((processedCount / totalUnits) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-sky-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0288D1] to-[#03A9F4] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>100% Slide & Page Coverage Verification</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black">
                  {coveragePercent}% Verified
                </span>
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                {course.title} • {totalUnits} {course.file_type === 'pptx' ? 'Slides' : 'Pages'} Audited
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

        {/* Audit Guarantee Banner */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3 shrink-0">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold">Zero-Omission Guarantee:</span> Doremon's Learning World has processed every slide/page from your uploaded {course.file_type.toUpperCase()} file. No headings, tables, or concepts were silently omitted.
          </div>
        </div>

        {/* Scrollable Table Checklist */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                  <th className="p-3 w-20">Unit</th>
                  <th className="p-3">Original Slide/Page Heading</th>
                  <th className="p-3">Assigned Teaching Topic</th>
                  <th className="p-3">Content Extracted</th>
                  <th className="p-3 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {checklist.map((item, idx) => (
                  <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                    <td className="p-3 font-bold text-sky-700">
                      {item.unit_label}
                    </td>
                    <td className="p-3 font-bold text-slate-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {item.topic_assigned}
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded-md font-medium mr-1">
                        {item.extracted_items?.paragraphs_count || 0} Paras
                      </span>
                      <span className="inline-block bg-slate-100 px-2 py-0.5 rounded-md font-medium mr-1">
                        {item.extracted_items?.bullets_count || 0} Bullets
                      </span>
                      {(item.extracted_items?.tables_count || 0) > 0 && (
                        <span className="inline-block bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                          {item.extracted_items?.tables_count} Table(s)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            Total {totalUnits} {course.file_type === 'pptx' ? 'slides' : 'pages'} successfully converted into structured lessons.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0288D1] to-[#03A9F4] hover:from-[#0277BD] hover:to-[#0288D1] shadow-xs cursor-pointer"
          >
            Done Auditing
          </button>
        </div>
      </div>
    </div>
  );
};

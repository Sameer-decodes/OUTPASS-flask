import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function PolicyModal({ isOpen, onClose }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !policy) {
      setLoading(true);
      api.getCollegePolicy()
        .then((data) => setPolicy(data))
        .catch((err) => console.error('Failed to load college policy', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, policy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">College Timings & Approval Routing Policy</h3>
            <p className="text-xs text-blue-100">Configured in backend/config.py</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Rules Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Case A Box */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-900 font-bold mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Case A: Teacher Approval
              </div>
              <p className="text-xs text-blue-800 leading-relaxed mb-3">
                Applied when the request falls <strong>entirely within normal college working hours</strong> on a working day.
              </p>
              <div className="bg-white/80 rounded-lg p-2.5 text-xs text-slate-700 font-medium flex items-center justify-between border border-blue-100">
                <span>Student</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-blue-700">Teacher</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                <span>Final Decision</span>
              </div>
            </div>

            {/* Case B Box */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Case B: Warden Approval
              </div>
              <p className="text-xs text-amber-800 leading-relaxed mb-3">
                Applied when the request covers <strong>holidays, weekly off-days, overnight, or outside college timings</strong>.
              </p>
              <div className="bg-white/80 rounded-lg p-2.5 text-xs text-slate-700 font-medium flex items-center justify-between border border-amber-100">
                <span>Student</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-amber-700">Warden</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                <span>Final Decision</span>
              </div>
            </div>
          </div>

          {/* Current Schedule Settings */}
          {policy && (
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <h4 className="font-bold text-slate-900 text-sm">Active College Schedule Settings</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Working Hours</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{policy.working_hours}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Working Days</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {policy.working_days.join(', ')}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Weekly Off-Days</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {policy.weekly_off_days.join(', ')}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-600" />
                    <span>College Holidays</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    {policy.holidays.length} configured dates (e.g. 2026-01-26, 2026-08-15)
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600">
            <strong>Key Guarantee:</strong> Approvers are automatically computed on the backend.
            Only one approval is required per request (teachers and wardens never need to double-approve the same request).
            Rejected requests do not proceed further.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

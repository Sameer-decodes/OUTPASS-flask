import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function DecisionModal({ isOpen, onClose, request, action, onConfirm, isSubmitting }) {
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen || !request) return null;

  const isApprove = action === 'approve';

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(request.id, action, rejectionReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div
          className={`px-6 py-4 text-white flex justify-between items-center ${
            isApprove
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
              : 'bg-gradient-to-r from-rose-600 to-red-600'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-base">
            {isApprove ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{isApprove ? 'Approve Request' : 'Reject Request'}</span>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-semibold text-slate-900">{request.student_name} ({request.roll_number || 'N/A'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Request Type:</span>
              <span className="font-semibold text-slate-900 uppercase">{request.leave_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reason:</span>
              <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">{request.reason}</span>
            </div>
            {request.destination && (
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-medium text-slate-800">{request.destination}</span>
              </div>
            )}
          </div>

          {isApprove ? (
            <p className="text-sm text-slate-600">
              Are you sure you want to approve this {request.leave_type} request? The student will be notified immediately on their dashboard.
            </p>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Reason for Rejection <span className="text-slate-400 font-normal">(Optional)</span>:
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Parent confirmation required, or timing not permitted..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
              />
              <p className="text-[11px] text-slate-500">
                This reason will be visible to the student on their dashboard.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-sm ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <span>{isApprove ? 'Confirm Approval' : 'Confirm Rejection'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

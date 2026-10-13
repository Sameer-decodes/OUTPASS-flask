import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  switch (status) {
    case 'Pending Teacher Approval':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Pending Teacher Approval
        </span>
      );

    case 'Pending Warden Approval':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
          <Clock className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
          Pending Warden Approval
        </span>
      );

    case 'Approved by Teacher':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Approved by Teacher
        </span>
      );

    case 'Approved by Warden':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Approved by Warden
        </span>
      );

    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          {status}
        </span>
      );
  }
}

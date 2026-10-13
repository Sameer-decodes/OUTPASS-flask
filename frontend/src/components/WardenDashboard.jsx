import React, { useState, useEffect } from 'react';
import { api } from '../api';
import StatusBadge from './StatusBadge';
import DecisionModal from './DecisionModal';
import {
  CheckCircle,
  XCircle,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  MapPin,
  Calendar,
  Clock,
  Moon,
} from 'lucide-react';

export default function WardenDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Decision Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getRequests();
      setRequests(data.requests || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDecision = (req, action) => {
    setSelectedRequest(req);
    setModalAction(action);
  };

  const handleCloseDecision = () => {
    setSelectedRequest(null);
    setModalAction(null);
  };

  const handleConfirmDecision = async (requestId, action, rejectionReason) => {
    try {
      setSubmittingAction(true);
      const res = await api.takeAction(requestId, action, rejectionReason);
      setFeedback({
        type: 'success',
        message: `Request #${requestId} has been ${action === 'approve' ? 'approved' : 'rejected'} by Warden.`,
      });
      handleCloseDecision();
      fetchRequests();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingAction(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.final_status === 'Pending Warden Approval').length;
  const approvedCount = requests.filter((r) => r.final_status === 'Approved by Warden').length;
  const rejectedCount = requests.filter((r) => r.final_status === 'Rejected').length;

  // Filter & Search
  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'PENDING' && r.final_status !== 'Pending Warden Approval') return false;
    if (statusFilter === 'APPROVED' && r.final_status !== 'Approved by Warden') return false;
    if (statusFilter === 'REJECTED' && r.final_status !== 'Rejected') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.student_name?.toLowerCase().includes(q);
      const matchRoll = r.roll_number?.toLowerCase().includes(q);
      const matchReason = r.reason?.toLowerCase().includes(q);
      const matchDest = r.destination?.toLowerCase().includes(q);
      return matchName || matchRoll || matchReason || matchDest;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Warden Header Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-800 to-amber-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Hostel Warden Portal &bull; Case B Handler
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Warden Dashboard &mdash; {user.name}</h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Responsible for requests involving college holidays, weekly off-days, overnight stays, or outside college timings.
          </p>
        </div>

        {/* Metrics Pill Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-amber-300">{pendingCount}</div>
            <div className="text-[11px] text-amber-100">Pending</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-teal-200">{approvedCount}</div>
            <div className="text-[11px] text-amber-100">Approved</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20">
            <div className="text-xl font-bold text-rose-300">{rejectedCount}</div>
            <div className="text-[11px] text-amber-100">Rejected</div>
          </div>
        </div>
      </div>

      {feedback.message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-xs font-semibold underline text-slate-500 hover:text-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Requests List Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by student, destination, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {[
                { key: 'ALL', label: `All (${totalCount})` },
                { key: 'PENDING', label: `Pending (${pendingCount})` },
                { key: 'APPROVED', label: `Approved (${approvedCount})` },
                { key: 'REJECTED', label: `Rejected (${rejectedCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1 rounded-md text-[11px] transition ${
                    statusFilter === tab.key
                      ? 'bg-white text-amber-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
              title="Refresh requests"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Requests rows */}
        <div className="divide-y divide-slate-100">
          {loading && requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
              Loading warden assigned requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No matching requests in Warden queue.
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isPending = req.final_status === 'Pending Warden Approval';

              return (
                <div
                  key={req.id}
                  className="p-5 hover:bg-slate-50/70 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Student Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-sm">
                        {req.student_name ? req.student_name.charAt(0) : 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{req.student_name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                            {req.roll_number || 'Roll N/A'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              req.leave_type === 'outpass'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {req.leave_type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{req.student_email}</div>
                      </div>
                    </div>

                    {/* Status badge & Actions */}
                    <div className="flex items-center gap-3">
                      <StatusBadge status={req.final_status} />

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenDecision(req, 'approve')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-500/20 transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenDecision(req, 'reject')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-500/20 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Box */}
                  <div className="bg-amber-50/40 rounded-xl p-3.5 border border-amber-200/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Reason Stated</span>
                      <p className="text-slate-800 font-medium leading-relaxed">{req.reason}</p>
                      {req.destination && (
                        <div className="flex items-center gap-1.5 text-slate-600 pt-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>Destination: <strong>{req.destination}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-amber-200/60 pt-2 md:pt-0 md:pl-3">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                        <Moon className="w-3 h-3 text-amber-600" />
                        Requested Timings (Off-Hours)
                      </span>
                      <div className="text-slate-800 font-semibold text-[11px]">
                        {formatDateTime(req.from_datetime)}
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        to {formatDateTime(req.to_datetime)}
                      </div>
                    </div>
                  </div>

                  {/* Rejection Notice */}
                  {req.final_status === 'Rejected' && req.rejection_reason && (
                    <div className="text-xs bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[11px] font-bold text-rose-900">Rejection Reason Provided:</strong>
                        <span>{req.rejection_reason}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Decision Modal */}
      <DecisionModal
        isOpen={!!selectedRequest}
        onClose={handleCloseDecision}
        request={selectedRequest}
        action={modalAction}
        onConfirm={handleConfirmDecision}
        isSubmitting={submittingAction}
      />
    </div>
  );
}

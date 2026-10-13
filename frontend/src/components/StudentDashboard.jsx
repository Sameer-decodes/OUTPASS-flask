import React, { useState, useEffect } from 'react';
import { api } from '../api';
import StatusBadge from './StatusBadge';
import {
  Send,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

export default function StudentDashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form states
  const [leaveType, setLeaveType] = useState('outpass'); // 'outpass' or 'leave'
  const [reason, setReason] = useState('');
  const [fromDatetime, setFromDatetime] = useState('');
  const [toDatetime, setToDatetime] = useState('');
  const [destination, setDestination] = useState('');

  // Routing preview state
  const [routingPreview, setRoutingPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  // Live routing preview evaluation when datetimes change
  useEffect(() => {
    if (fromDatetime && toDatetime) {
      const fromDate = new Date(fromDatetime);
      const toDate = new Date(toDatetime);

      if (toDate > fromDate) {
        setPreviewLoading(true);
        api.getRoutingPreview(fromDatetime, toDatetime)
          .then((res) => {
            setRoutingPreview(res);
          })
          .catch((err) => {
            setRoutingPreview(null);
          })
          .finally(() => {
            setPreviewLoading(false);
          });
      } else {
        setRoutingPreview(null);
      }
    } else {
      setRoutingPreview(null);
    }
  }, [fromDatetime, toDatetime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!fromDatetime || !toDatetime) {
      setFeedback({ type: 'error', message: 'Please select both start and end date/time.' });
      return;
    }

    if (new Date(toDatetime) <= new Date(fromDatetime)) {
      setFeedback({ type: 'error', message: 'Return date & time must be after Departure date & time.' });
      return;
    }

    if (leaveType === 'outpass' && !destination.trim()) {
      setFeedback({ type: 'error', message: 'Destination is required for an Out-Pass request.' });
      return;
    }

    if (!reason.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a reason for your request.' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        leave_type: leaveType,
        reason: reason.trim(),
        from_datetime: fromDatetime,
        to_datetime: toDatetime,
        destination: destination.trim(),
      };

      const res = await api.createRequest(payload);
      setFeedback({
        type: 'success',
        message: `${res.message} (${res.routing_reason})`,
      });

      // Reset form
      setReason('');
      setDestination('');
      setFromDatetime('');
      setToDatetime('');
      setRoutingPreview(null);

      // Refresh list
      fetchRequests();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return r.final_status.includes('Pending');
    if (statusFilter === 'APPROVED') return r.final_status.includes('Approved');
    if (statusFilter === 'REJECTED') return r.final_status === 'Rejected';
    return true;
  });

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome & Profile Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-2">
            <User className="w-3.5 h-3.5" />
            Student Portal
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, {user.name}</h2>
          <p className="text-blue-100 text-sm mt-1">
            Roll Number: <span className="font-semibold text-white">{user.roll_number || 'N/A'}</span> &bull; {user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20 min-w-[100px]">
            <div className="text-xl font-bold">{requests.length}</div>
            <div className="text-[11px] text-blue-200">Total Requests</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20 min-w-[100px]">
            <div className="text-xl font-bold text-emerald-300">
              {requests.filter((r) => r.final_status.includes('Approved')).length}
            </div>
            <div className="text-[11px] text-blue-200">Approved</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center border border-white/20 min-w-[100px]">
            <div className="text-xl font-bold text-amber-300">
              {requests.filter((r) => r.final_status.includes('Pending')).length}
            </div>
            <div className="text-[11px] text-blue-200">Pending</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Requests List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Request Submission Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">New Leave / Out-Pass Request</h3>
            </div>

            {feedback.message && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 mb-5 ${
                  feedback.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {feedback.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Readonly Profile info */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                  <span className="font-semibold text-slate-800">{user.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                  <span className="font-semibold text-slate-800">{user.roll_number || 'N/A'}</span>
                </div>
              </div>

              {/* Request Type Switch */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Request Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLeaveType('outpass')}
                    className={`py-2 text-xs font-semibold rounded-lg transition ${
                      leaveType === 'outpass'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Out-Pass (Day Visit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('leave')}
                    className={`py-2 text-xs font-semibold rounded-lg transition ${
                      leaveType === 'leave'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    College Leave
                  </button>
                </div>
              </div>

              {/* From Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  From Date & Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={fromDatetime}
                    onChange={(e) => setFromDatetime(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* To Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  To Date & Time <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={toDatetime}
                    onChange={(e) => setToDatetime(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Dynamic Live Routing Indicator Preview */}
              {previewLoading && (
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg">
                  <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                  Calculating automatic routing approver...
                </div>
              )}

              {routingPreview && !previewLoading && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                    routingPreview.assigned_approver_role === 'teacher'
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Auto-Routing: {routingPreview.assigned_approver_role === 'teacher' ? 'Teacher Approval' : 'Warden Approval'}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/70">
                      Case {routingPreview.assigned_approver_role === 'teacher' ? 'A' : 'B'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-tight">
                    {routingPreview.routing_reason}
                  </p>
                </div>
              )}

              {/* Destination (Optional for leave, required for outpass) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination {leaveType === 'outpass' ? <span className="text-rose-500">* (Required)</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={leaveType === 'outpass' ? 'e.g. City Central Library, Market' : 'e.g. Home, Hometown (Optional)'}
                    required={leaveType === 'outpass'}
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Request <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State the clear reason for this leave or out-pass..."
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-800"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for Automatic Approval</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Submitted Requests History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">My Submitted Requests</h3>
                <p className="text-xs text-slate-500">Track real-time approval status and decisions</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter pills */}
                <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-2.5 py-1 rounded-md text-[11px] transition capitalize ${
                        statusFilter === f
                          ? 'bg-white text-blue-600 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.toLowerCase()}
                    </button>
                  ))}
                </div>

                {/* Refresh */}
                <button
                  onClick={fetchRequests}
                  disabled={loading}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  title="Refresh requests"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="mt-4 space-y-3">
              {loading && requests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading your requests...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  No requests found for the selected filter.
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-xs transition bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            req.leave_type === 'outpass'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {req.leave_type}
                        </span>
                        <span className="text-xs text-slate-400">Request #{req.id}</span>
                      </div>
                      <StatusBadge status={req.final_status} />
                    </div>

                    {/* Request Details */}
                    <div>
                      <div className="text-xs font-semibold text-slate-900 mb-1">{req.reason}</div>
                      {req.destination && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Destination: <strong>{req.destination}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Datetime & Approver Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-100 text-slate-600">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Duration</div>
                        <div className="font-medium text-slate-800">
                          {formatDateTime(req.from_datetime)}
                        </div>
                        <div className="text-slate-500 text-[10px]">to {formatDateTime(req.to_datetime)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Assigned Approver</div>
                        <div className="font-semibold text-slate-800 capitalize">
                          {req.assigned_approver_role === 'teacher' ? '👨‍🏫 Teacher' : '🛡️ Warden'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {req.assigned_approver_role === 'teacher' ? 'Normal college hours' : 'Off-hours / Off-day'}
                        </div>
                      </div>
                    </div>

                    {/* Rejection Alert if rejected */}
                    {req.final_status === 'Rejected' && req.rejection_reason && (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] font-bold text-rose-900">Rejection Reason:</strong>
                          <span>{req.rejection_reason}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

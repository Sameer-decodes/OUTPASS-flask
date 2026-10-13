import React, { useState } from 'react';
import { api } from '../api';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(email.trim(), password);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    try {
      setLoading(true);
      const res = await api.login(demoEmail, demoPassword);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            College Leave & Out-Pass
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Automated role-based routing for Students, Faculty, and Hostel Wardens.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@college.com"
                  required
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full text-xs pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials Section */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>One-Click Demo Accounts</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Student */}
              <button
                type="button"
                onClick={() => handleQuickLogin('student@college.com', 'Student@123')}
                disabled={loading}
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Student Portal</div>
                    <div className="text-[10px] text-slate-500">Alex Morgan &bull; Roll CS-2026-042</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 group-hover:translate-x-0.5 transition">
                  Quick Login &rarr;
                </span>
              </button>

              {/* Teacher */}
              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@college.com', 'Teacher@123')}
                disabled={loading}
                className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Teacher Portal (Case A)</div>
                    <div className="text-[10px] text-slate-500">Prof. Robert Smith &bull; Normal Hours</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 group-hover:translate-x-0.5 transition">
                  Quick Login &rarr;
                </span>
              </button>

              {/* Warden */}
              <button
                type="button"
                onClick={() => handleQuickLogin('warden@college.com', 'Warden@123')}
                disabled={loading}
                className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Warden Portal (Case B)</div>
                    <div className="text-[10px] text-slate-500">Dr. Evelyn Reed &bull; Off-Hours & Holidays</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 group-hover:translate-x-0.5 transition">
                  Quick Login &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-[11px] text-center text-slate-500">
          Role-Based Access Control enforced &bull; Passwords stored as PBKDF2/SHA256 Hashes
        </p>
      </div>
    </div>
  );
}

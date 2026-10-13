import React from 'react';
import { GraduationCap, LogOut, Shield, UserCheck, Calendar, Info } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenPolicy }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return {
          label: 'Student',
          icon: <GraduationCap className="w-4 h-4 text-blue-600" />,
          bg: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'teacher':
        return {
          label: 'Teacher',
          icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'warden':
        return {
          label: 'Hostel Warden',
          icon: <Shield className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      default:
        return {
          label: role,
          icon: null,
          bg: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                College Leave & Out-Pass
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Automated Approval & Routing System
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* College Policy Button */}
              <button
                onClick={onOpenPolicy}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 transition border border-slate-200"
                title="View College Timings and Routing Rules"
              >
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>College Rules & Timings</span>
              </button>

              {/* User details */}
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900 leading-none">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {user.role === 'student' && user.roll_number
                      ? `Roll: ${user.roll_number}`
                      : user.email}
                  </div>
                </div>

                {/* Role Pill */}
                {badge && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition border border-rose-200"
                title="Log out of your account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

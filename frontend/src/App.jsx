import React, { useState, useEffect } from 'react';
import { getUser, setUser, api } from './api';
import Navbar from './components/Navbar';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import WardenDashboard from './components/WardenDashboard';
import PolicyModal from './components/PolicyModal';

export default function App() {
  const [user, setCurrentUser] = useState(() => getUser());
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    setUser(user);
  }, [user]);

  const handleLoginSuccess = (loggedInUser) => {
    setCurrentUser(loggedInUser);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenPolicy={() => setIsPolicyOpen(true)}
      />

      <main className="flex-1">
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : user.role === 'student' ? (
          <StudentDashboard user={user} />
        ) : user.role === 'teacher' ? (
          <TeacherDashboard user={user} />
        ) : user.role === 'warden' ? (
          <WardenDashboard user={user} />
        ) : (
          <div className="p-8 text-center text-rose-600">
            Unknown user role. Please logout and login again.
          </div>
        )}
      </main>

      {/* College Policy & Routing Rules Modal */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
      />

      {/* Clean Academic Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} College Leave & Out-Pass Management System. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setIsPolicyOpen(true)}
              className="hover:text-blue-600 transition underline underline-offset-2"
            >
              Approval Routing Rules
            </button>
            <span>&bull;</span>
            <span>PostgreSQL & Flask Backend</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

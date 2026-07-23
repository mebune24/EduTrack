import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { GraduationCap } from 'lucide-react';
import type { Role } from '../../types';

type Mode = 'signin' | 'register';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState<Mode>('signin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign-in fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [reg, setReg] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'parent' as Role,
  });

  const switchMode = (m: Mode) => {
    setError('');
    setMode(m);
  };

  /* ── Sign In ──────────────────────────────────────────────────────── */
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Register ─────────────────────────────────────────────────────── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (reg.password !== reg.confirmPassword) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, reg.email, reg.password);
      await setDoc(doc(db, 'users', credential.user.uid), {
        firstName: reg.firstName,
        lastName: reg.lastName,
        email: reg.email,
        role: reg.role,
        status: reg.role === 'student' ? 'pending' : 'active',
        createdAt: new Date().toISOString(),
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-colors';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

        {/* Header / Logo */}
        <div className="px-8 pt-9 pb-5 text-center">
          {/* Icon badge */}
          <div className="mx-auto h-14 w-14 bg-blue-50 flex items-center justify-center rounded-2xl mb-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>

          {/* Wordmark */}
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">Edu</span>
            <span className="text-3xl font-extrabold text-blue-600 tracking-tight">Track</span>
          </div>

          {/* Tagline */}
          <p className="text-slate-400 text-xs font-medium mt-1 tracking-wider uppercase">
            School Fees Management System
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              mode === 'signin'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
              mode === 'register'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="px-8 py-7">
          {/* Error banner */}
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* ── Sign In Form ── */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="si-email" className={labelClass}>Email address</label>
                <input
                  id="si-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="si-password" className={labelClass}>Password</label>
                <input
                  id="si-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Your password"
                  className={inputClass}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign in'}
              </button>
              <p className="text-center text-sm text-slate-500 pt-1">
                No account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-primary font-semibold hover:underline"
                >
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── Register Form ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="r-fname" className={labelClass}>First Name</label>
                  <input
                    id="r-fname"
                    type="text"
                    required
                    placeholder="John"
                    className={inputClass}
                    value={reg.firstName}
                    onChange={e => setReg({ ...reg, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="r-lname" className={labelClass}>Last Name</label>
                  <input
                    id="r-lname"
                    type="text"
                    required
                    placeholder="Doe"
                    className={inputClass}
                    value={reg.lastName}
                    onChange={e => setReg({ ...reg, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="r-email" className={labelClass}>Email address</label>
                <input
                  id="r-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                  value={reg.email}
                  onChange={e => setReg({ ...reg, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="r-role" className={labelClass}>Role</label>
                <select
                  id="r-role"
                  className={inputClass}
                  value={reg.role}
                  onChange={e => setReg({ ...reg, role: e.target.value as Role })}
                >
                  <option value="parent">Parent</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="bursar">Bursar</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="r-password" className={labelClass}>Password</label>
                <input
                  id="r-password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  className={inputClass}
                  value={reg.password}
                  onChange={e => setReg({ ...reg, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="r-confirm" className={labelClass}>Confirm Password</label>
                <input
                  id="r-confirm"
                  type="password"
                  required
                  placeholder="Repeat password"
                  className={inputClass}
                  value={reg.confirmPassword}
                  onChange={e => setReg({ ...reg, confirmPassword: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account…
                  </>
                ) : 'Create account'}
              </button>
              <p className="text-center text-sm text-slate-500 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

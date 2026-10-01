import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Mail, Sun, Moon, Lock, EyeOff, Eye, Shield, Zap, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { imageAssets } from '../data/imageAssets';

export const LoginView: React.FC = () => {
  const { setActiveTab, playTacticalSound, setIsAuthenticated, setUserProfile, setCurrentUserRole , theme, toggleTheme } = useCrisis();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    playTacticalSound('click');
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials or account role.');
      }

      // Success
      setIsAuthenticated(true);
      setUserProfile({
        fullName: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone || '',
      });
      
      // Store token if needed (localStorage.setItem('token', data.token))
      
      if (data.user.role === 'ADMIN') {
        setCurrentUserRole(data.user.operator_type || 'Crisis Operations Administrator');
        setActiveTab('dashboard'); // Admin Dashboard
      } else {
        setCurrentUserRole('USER');
        setActiveTab('user-dashboard'); // Normal User Dashboard
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or account role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex select-none relative">
      <button
        onClick={() => {
          playTacticalSound('click');
          toggleTheme();
        }}
        className="absolute top-6 right-6 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-colors cursor-pointer flex items-center justify-center shadow-subtle group z-50"
        title="Toggle Light/Dark Theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
        ) : (
          <Moon className="w-5 h-5 text-sky-500 group-hover:-rotate-12 transition-transform duration-500" />
        )}
      </button>
  
      {/* Absolute Back Button for small screens (mobile) */}
      <button
        onClick={() => { playTacticalSound('click'); setActiveTab('landing'); }}
        className="lg:hidden absolute top-6 left-6 z-50 p-2 rounded-full bg-black/40 border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-black/60 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Left Column */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-[var(--border-color)]">
        
        {/* Top bar with back button and logo */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => { playTacticalSound('click'); setActiveTab('landing'); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-black/40 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-xl tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                EcoCrisis <span className="text-sky-400 font-extrabold">Command</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">Monitor • Respond • Protect</p>
            </div>
          </div>
        </div>

        {/* The map graphic area - simulating the image map background */}
        <div className="absolute inset-0 z-0">
          <img src={imageAssets.login.url} alt="Map Background" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/60 to-[#070b12]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b12] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-md mt-auto mb-10">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Real-time <br/><span className="text-sky-400">Situational Awareness</span></h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Track incidents, manage resources and keep your communities safe.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Live Incident Monitoring</h4>
                <p className="text-xs text-[var(--text-muted)]">Real-time alerts & updates</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Resource Management</h4>
                <p className="text-xs text-[var(--text-muted)]">Coordinate teams & assets</p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Faster Response</h4>
                <p className="text-xs text-[var(--text-muted)]">Save time. Save lives.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[var(--bg-primary)]">
        <div className="w-full max-w-md bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Welcome Back</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your EcoCrisis Command account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
              <span className="text-xs text-red-300 leading-relaxed font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-3 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-10 pr-10 py-3 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">Account Role</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="USER"
                    checked={role === 'USER'}
                    onChange={() => setRole('USER')}
                    className="w-4 h-4 rounded-full bg-[var(--bg-primary)] border-[var(--border-color)] accent-sky-500"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">User</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={role === 'ADMIN'}
                    onChange={() => setRole('ADMIN')}
                    className="w-4 h-4 rounded-full bg-[var(--bg-primary)] border-[var(--border-color)] accent-sky-500"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">Admin</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-[var(--bg-primary)] border-[var(--border-color)] accent-sky-500" />
                <span className="text-xs text-[var(--text-muted)]">Remember me</span>
              </label>
              <button type="button" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-[var(--text-primary)] font-bold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all mt-4"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[var(--border-color)]"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] text-[var(--text-muted)] uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-[var(--border-color)]"></div>
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-xl bg-transparent border border-[var(--border-color)] hover:bg-white/5 text-[var(--text-primary)] font-semibold text-sm flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-[var(--text-muted)]">Don't have an account? </span>
            <button
              onClick={() => { playTacticalSound('click'); setActiveTab('register'); }}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

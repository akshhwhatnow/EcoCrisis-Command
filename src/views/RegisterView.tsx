import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Mail, Sun, Moon, Lock, EyeOff, Eye, Shield, Users, CheckCircle2, User, Phone, ArrowRight, ArrowLeft, XCircle } from 'lucide-react';
import { imageAssets } from '../data/imageAssets';
import { UserProfile } from '../types';
import { authApi } from '../services/api';

export const RegisterView: React.FC = () => {
  const { setActiveTab, playTacticalSound, setUserProfile, setIsAuthenticated, setCurrentUserRole , theme, toggleTheme } = useCrisis();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Validation Rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({ fullName, email, phone, password, role: 'USER' });

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      const profile: UserProfile = {
        fullName: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone || phone,
      };
      setUserProfile(profile);
      setIsAuthenticated(true);
      setCurrentUserRole('USER');
      playTacticalSound('success');
      setActiveTab('user-dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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

        {/* The map graphic area */}
        <div className="absolute inset-0 z-0">
          <img src={imageAssets.login.url} alt="Map Background" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/60 to-[#070b12]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b12] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-md mt-auto mb-10">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">Be Part of a Safer <br/><span className="text-sky-400">Tomorrow</span></h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            Create your account to access real-time monitoring, incident management and more.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
              <span className="text-sm text-[var(--text-primary)]">Real-time Incident Alerts</span>
            </div>
            <div className="flex gap-3 items-center">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
              <span className="text-sm text-[var(--text-primary)]">Manage Teams & Resources</span>
            </div>
            <div className="flex gap-3 items-center">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
              <span className="text-sm text-[var(--text-primary)]">Access Detailed Reports</span>
            </div>
            <div className="flex gap-3 items-center">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
              <span className="text-sm text-[var(--text-primary)]">Secure & Reliable Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[var(--bg-primary)] overflow-y-auto max-h-screen">
        <div className="w-full max-w-md bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-2xl my-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Create Account</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Join EcoCrisis Command</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  required
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
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Create a password"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Requirements Checklist */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5 p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-2">Password Requirements</p>
                  <div className={`flex items-center gap-2 text-xs ${hasMinLength ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${hasUppercase ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${hasNumber ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least one number</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${hasSpecial ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least one special character</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Confirm your password"
                  className={`w-full bg-[var(--bg-primary)] border rounded-xl pl-10 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none transition-colors ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-[var(--border-color)] focus:border-sky-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1 font-medium">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isPasswordValid || password !== confirmPassword}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-6 ${
                isPasswordValid && password === confirmPassword
                  ? 'bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-[var(--text-primary)] shadow-sky-500/20'
                  : 'bg-white/5 text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]'
              }`}
            >
              <span>Create Account</span>
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

          <div className="mt-4 text-center">
            <span className="text-xs text-[var(--text-muted)]">Already have an account? </span>
            <button
              onClick={() => { playTacticalSound('click'); setActiveTab('login'); }}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

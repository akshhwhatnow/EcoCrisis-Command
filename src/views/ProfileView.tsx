import React, { useState, useEffect } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { User, Mail, Phone, Save, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

export const ProfileView: React.FC = () => {
  const { userProfile, setUserProfile, playTacticalSound } = useCrisis();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = { fullName, email, phone };
    setUserProfile(updatedProfile);
    playTacticalSound('success');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">User Profile</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage your personal information and account settings
          </p>
        </div>
      </div>

      <div className="max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-panel">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-bold text-sm shadow-subtle flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
            {isSaved && (
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

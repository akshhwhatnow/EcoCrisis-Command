import React, { useState } from 'react';
import { useCrisis } from '../context/CrisisContext';
import { Shield, User, Bell, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';

export const UserDashboardView: React.FC = () => {
  const { userProfile, setIsAuthenticated, setActiveTab, playTacticalSound, addNotification, addNewCivilianIncident } = useCrisis() as any;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState('Control Room Operator');
  const [locationDetails, setLocationDetails] = useState('');
  const [description, setDescription] = useState('');

  const handleLogout = () => {
    playTacticalSound('click');
    setIsAuthenticated(false);
    setActiveTab('landing');
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !locationDetails) {
      alert("Please provide both location and description.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Geocode the location using Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationDetails)}&format=json&limit=1`);
      const data = await res.json();
      
      let lat = 14.845; // Default fallback to MVP region (Philippines)
      let lng = 121.215;
      
      if (data && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      } else {
        console.warn("Geocoding failed, using fallback coordinates.");
      }
      
      addNewCivilianIncident(selectedAgency, description, locationDetails, lat, lng);
      
      setLocationDetails('');
      setDescription('');
      alert(`Incident report successfully sent to ${selectedAgency}!`);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to send report. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 sm:p-12 font-sans select-none flex flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border-color)] pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {userProfile?.fullName || 'Citizen'}</h1>
            <p className="text-sm text-emerald-500 font-mono font-bold mt-1">Role: USER</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Secure Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-panel">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-500" />
            Active Alerts
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h3 className="font-bold text-amber-500 text-sm">Flood Warning - Riverside Area</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Evacuation recommended for low-lying areas. Follow designated routes.</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <h3 className="font-bold text-emerald-500 text-sm">All Clear - Downtown</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Previous power grid alerts have been resolved.</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-panel">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            Your Safety Status
          </h2>
          <div className="flex flex-col gap-4">
            <button className="w-full py-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-500 font-bold hover:bg-sky-500/30 transition-colors flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Mark as Safe
            </button>
            <p className="text-xs text-[var(--text-muted)] text-center">
              Reporting your status helps emergency responders prioritize resources efficiently.
            </p>
          </div>
        </div>

        {/* New Report Incident Card */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-panel mt-2">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            Report an Emergency or Hazard
          </h2>
          <form className="space-y-4" onSubmit={handleReportSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--text-secondary)]">Target Agency</label>
                <select 
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-rose-500"
                >
                  <option value="Control Room Operator">Control Room Operator</option>
                  <option value="Emergency Responder">Emergency Responder</option>
                  <option value="Agriculture Agency">Agriculture Agency</option>
                  <option value="Wildlife & Conservation">Wildlife & Conservation</option>
                  <option value="Local Authority">Local Authority</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--text-secondary)]">Location Details</label>
                <input 
                  type="text" 
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="e.g. 123 Main St, Near the bridge..." 
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-rose-500" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)]">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the situation, severity, and if anyone is in danger..." 
                rows={3} 
                required
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-rose-500 resize-none"
              ></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 disabled:opacity-50 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-500 font-bold hover:bg-rose-500/30 transition-colors flex items-center justify-center gap-2">
              Submit Report to Dispatch
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

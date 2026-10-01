import React, { useState, useEffect, useRef } from 'react';
import { useCrisis } from '../../context/CrisisContext';
import {
  Globe,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X,
  Flame,
  Truck,
  Bot,
  FileText,
  Activity,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../../types';

export const TopBar: React.FC = () => {
  const {
    currentUserRole,
    setCurrentUserRole,
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    incidents,
    resources,
    agents,
    responsePlans,
    setSelectedIncidentId,
    setSelectedResourceId,
    setSelectedAgentId,
    setActiveTab,
    playTacticalSound,
    isBackendConnected,
    userProfile,
    setIsAuthenticated,
  } = useCrisis();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const roles: UserRole[] = [
    'Control Room Operator',
    'Emergency Responder',
    'Agriculture Agency',
    'Wildlife & Conservation',
    'Local Authority',
  ];

  // Shortcut key listener (Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setShowSearchModal(true);
      } else if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowNotifications(false);
        setShowRoleDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showSearchModal) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSearchModal]);

  // Global Search Filter Results
  const filteredIncidents = incidents.filter(
    i =>
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.locationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = resources.filter(
    r =>
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAgents = agents.filter(
    a =>
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlans = responsePlans.filter(
    p =>
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 sm:px-6 flex items-center justify-between select-none z-30 sticky top-0 backdrop-blur-md">
        {/* Brand & Status */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-subtle">
              <Globe className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[var(--text-primary)] group-hover:text-sky-400 transition-colors">
                  EcoCrisis <span className="text-sky-400 font-extrabold">Command</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SIMULATION ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium hidden sm:block">
                Compound Environmental Emergency Intelligence
              </p>
            </div>
          </button>
        </div>

        {/* Center: Search Trigger Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => {
              playTacticalSound('click');
              setShowSearchModal(true);
            }}
            className="flex items-center justify-between w-64 lg:w-80 px-3 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-sky-500/40 text-xs text-[var(--text-muted)] transition-all cursor-pointer shadow-subtle"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Search incidents, units, agents...</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Simulation Drawer Toggle, Audio, Theme, Notifications, User */}
        {/* Right Controls: Database Health, Audio, Theme, Notifications, User Role */}
        <div className="flex items-center gap-2.5">
          {/* PostgreSQL / PostGIS Operational Badge */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-semibold ${
              isBackendConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
            title={
              isBackendConnected
                ? 'PostgreSQL/PostGIS Connected (NORMAL_POSTGRESQL)'
                : 'Backend Persistence Offline — Simulated Baseline'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isBackendConnected ? 'POSTGIS 3.4' : 'OFFLINE MODE'}</span>
          </div>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={() => {
              playTacticalSound('click');
              setSoundEnabled(!soundEnabled);
            }}
            className="w-9 h-9 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shadow-subtle"
            title={soundEnabled ? 'Tactical Audio Enabled' : 'Tactical Audio Muted'}
            aria-label={soundEnabled ? 'Mute tactical audio' : 'Enable tactical audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => {
              playTacticalSound('click');
              toggleTheme();
            }}
            className="w-9 h-9 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shadow-subtle"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Notifications Drawer Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playTacticalSound('click');
                setShowNotifications(!showNotifications);
              }}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center relative cursor-pointer shadow-subtle transition-all duration-300 ${
                unreadNotificationCount > 0 
                  ? 'border-red-500/50 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="Open notifications log"
            >
              <Bell className={`w-4 h-4 ${unreadNotificationCount > 0 ? 'animate-pulse' : ''}`} />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[var(--text-primary)] text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-highlight)] shadow-panel p-4 z-50 glass-panel-elevated animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                      System Activity Log
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">
                      {notifications.length} events
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto mt-2.5 space-y-2 pr-1">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => { if (n.incidentId) { setSelectedIncidentId(n.incidentId); setActiveTab('incidents'); setShowNotifications(false); } }}
                        className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                        n.level === 'critical'
                          ? 'bg-red-500/10 border-red-500/30 text-red-200'
                          : n.level === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : n.level === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5">
                          {n.level === 'critical' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <Activity className="w-3.5 h-3.5 text-sky-400" />
                          )}
                          {n.title}
                        </span>
                        <span className="text-[10px] opacity-70 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Role Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                playTacticalSound('click');
                setShowRoleDropdown(!showRoleDropdown);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] hover:border-sky-500/50 transition-colors cursor-pointer shadow-subtle"
              aria-label={`Current authorized role: ${currentUserRole}`}
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-400">
                {currentUserRole.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-[var(--text-primary)] leading-none">
                  {userProfile?.fullName ? `Welcome, ${userProfile.fullName}` : currentUserRole}
                </div>
                <div className="text-[10px] text-sky-400 leading-none mt-1 font-mono">
                  {userProfile?.fullName ? `Role: ADMINISTRATOR | Type: ${currentUserRole}` : 'Active Command Persona'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-highlight)] shadow-panel p-2 z-50 glass-panel-elevated animate-in fade-in duration-200">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2.5 py-1.5">
                  Select Command Persona
                </div>
                <div className="space-y-1 mt-1">
                  {roles.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        playTacticalSound('click');
                        setCurrentUserRole(r);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        currentUserRole === r
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{r}</span>
                      {currentUserRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                  <div className="my-1.5 border-t border-[var(--border-color)]"></div>
                  <button
                    type="button"
                    onClick={() => {
                      playTacticalSound('click');
                      setShowRoleDropdown(false);
                      setIsAuthenticated(false);
                      setActiveTab('landing');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Secure Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Palette Modal (Cmd+K) */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-2xl rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-highlight)] shadow-panel p-5 space-y-4">
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-3">
              <Search className="w-5 h-5 text-sky-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search incidents (I-1, I-4), rescue units, AI agents, response plans..."
                className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorized Results */}
            <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
              {/* Incidents */}
              {filteredIncidents.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Incidents
                  </div>
                  <div className="space-y-1">
                    {filteredIncidents.map(inc => (
                      <button
                        key={inc.id}
                        onClick={() => {
                          playTacticalSound('click');
                          setSelectedIncidentId(inc.id);
                          setActiveTab('dashboard');
                          setShowSearchModal(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-color)] transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Flame className="w-4 h-4 text-red-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-[var(--text-primary)] mr-2">{inc.id}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{inc.name}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            inc.severity === 'Critical'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {filteredResources.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Fleet Resources
                  </div>
                  <div className="space-y-1">
                    {filteredResources.map(res => (
                      <button
                        key={res.id}
                        onClick={() => {
                          playTacticalSound('click');
                          setSelectedResourceId(res.id);
                          setActiveTab('resources');
                          setShowSearchModal(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-color)] transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Truck className="w-4 h-4 text-sky-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-[var(--text-primary)] mr-2">{res.id}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{res.name}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {res.state}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Agents */}
              {filteredAgents.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Multi-Agent AI Network
                  </div>
                  <div className="space-y-1">
                    {filteredAgents.map(ag => (
                      <button
                        key={ag.id}
                        onClick={() => {
                          playTacticalSound('click');
                          setSelectedAgentId(ag.id);
                          setActiveTab('agents');
                          setShowSearchModal(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-color)] transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-[var(--text-primary)] mr-2">{ag.name}</span>
                            <span className="text-xs text-[var(--text-muted)]">{ag.role}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {ag.confidence}% Conf
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Plans */}
              {filteredPlans.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Response Plans
                  </div>
                  <div className="space-y-1">
                    {filteredPlans.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          playTacticalSound('click');
                          setActiveTab('plans');
                          setShowSearchModal(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-color)] transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-[var(--text-primary)] mr-2">{p.title}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-sky-400">
                          {p.isRecommended ? 'Recommended' : 'Candidate'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

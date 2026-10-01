import React from 'react';
import { useCrisis } from '../../context/CrisisContext';
import {
  LayoutDashboard,
  MapPin,
  Flame,
  Truck,
  Bot,
  FileCheck,
  GitCompare,
  ShieldCheck,
  Scale,
  FileText,
  Sliders,
  Settings,
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface NavGroup {
  title: string;
  items: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeVariant?: 'critical' | 'warning' | 'info';
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    incidents,
    resources,
    reviewFlags,
    phase,
    playTacticalSound,
  } = useCrisis();

  const criticalIncidentCount = incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const unavailableResourceCount = resources.filter(r => r.state === 'Unavailable').length;
  const pendingApprovalCount = reviewFlags.filter(f => !f.acknowledged).length;

  const navGroups: NavGroup[] = [
    {
      title: 'COMMAND',
      items: [
        {
          id: 'dashboard',
          label: 'Situation Room',
          icon: LayoutDashboard,
        },
        {
          id: 'map',
          label: 'Geospatial Theater',
          icon: MapPin,
        },
      ],
    },
    {
      title: 'ANALYZE',
      items: [
        {
          id: 'incidents',
          label: 'Incident Triage',
          icon: Flame,
          badge: criticalIncidentCount > 0 ? `${criticalIncidentCount} Critical` : undefined,
          badgeVariant: 'critical',
        },
        {
          id: 'resources',
          label: 'Fleet & Staging',
          icon: Truck,
          badge: unavailableResourceCount > 0 ? '1 Breakdown' : undefined,
          badgeVariant: 'warning',
        },
        {
          id: 'agents',
          label: '8 Domain Agents',
          icon: Bot,
        },
      ],
    },
    {
      title: 'DECIDE',
      items: [
        {
          id: 'plans',
          label: 'Candidate Plans',
          icon: FileCheck,
        },
        {
          id: 'plan-diff',
          label: 'Plan Differential',
          icon: GitCompare,
          badge: phase === 'REVISED_PLAN_READY' ? 'Option 1 Ready' : undefined,
          badgeVariant: 'warning',
        },
        {
          id: 'trade-offs',
          label: 'Objective Matrix',
          icon: Scale,
        },
        {
          id: 'approval',
          label: 'Commander Gate',
          icon: ShieldCheck,
          badge: pendingApprovalCount > 0 ? `${pendingApprovalCount} Review Flags` : undefined,
          badgeVariant: pendingApprovalCount > 0 ? 'critical' : undefined,
        },
      ],
    },
    {
      title: 'GOVERN',
      items: [
        {
          id: 'profile',
          label: 'User Profile',
          icon: FileCheck,
        },
        {
          id: 'audit',
          label: 'Decision Audit',
          icon: FileText,
        },
        {
          id: 'replanning',
          label: 'What-If Sandbox',
          icon: Sliders,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside className="w-60 lg:w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col justify-between select-none z-20 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Navigation Groups */}
      <div className="py-4 px-3 space-y-5">
        {navGroups.map(group => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] mb-1.5 font-mono">
              {group.title}
            </div>

            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playTacticalSound('click');
                      setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-subtle'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-sky-400' : 'text-[var(--text-muted)]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          item.badgeVariant === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]/40 text-[11px] text-[var(--text-muted)] space-y-1">
        <div className="flex items-center justify-between font-mono">
          <span>Engine Status</span>
          <span className="text-emerald-400 font-bold">POSTGIS 3.4</span>
        </div>
        <div className="text-[10px] truncate opacity-75 font-mono">
          MapLibre v6 • Allocation Heuristic
        </div>
      </div>
    </aside>
  );
};

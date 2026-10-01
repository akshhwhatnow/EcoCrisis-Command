import React from 'react';
import { CrisisProvider, useCrisis } from './context/CrisisContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { ScenarioControllerBanner } from './components/layout/ScenarioControllerBanner';
import { AIPipelineExecutionModal } from './components/modals/AIPipelineExecutionModal';
import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ProfileView } from './views/ProfileView';
import { DashboardView } from './views/DashboardView';
import { UserDashboardView } from './views/UserDashboardView';
import { IncidentMapView } from './views/IncidentMapView';
import { IncidentsListView } from './views/IncidentsListView';
import { IncidentDetailsView } from './views/IncidentDetailsView';
import { ResourceManagementView } from './views/ResourceManagementView';
import { AIAgentsView } from './views/AIAgentsView';
import { ResponsePlansView } from './views/ResponsePlansView';
import { HumanApprovalView } from './views/HumanApprovalView';
import { PlanDiffView } from './views/PlanDiffView';
import { ReplanningSimulatorView } from './views/ReplanningSimulatorView';
import { ImpactTradeoffView } from './views/ImpactTradeoffView';
import { AuditLogView } from './views/AuditLogView';
import { SettingsView } from './views/SettingsView';

/**
 * Public Experience: Discovery & Operator Authentication/Role Gateway
 * Rendered outside the operational command shell.
 */
const PublicExperience: React.FC = () => {
  const { activeTab } = useCrisis();

  return (
    <>
      {activeTab === 'landing' && <LandingView />}
      {activeTab === 'login' && <LoginView />}
      {activeTab === 'register' && <RegisterView />}
      <AIPipelineExecutionModal />
    </>
  );
};

/**
 * Operational Workspace View Switcher
 * Preserves all CrisisContext state across transitions.
 */
const OperationalWorkspace: React.FC = () => {
  const { activeTab } = useCrisis();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'profile':
      return <ProfileView />;
    case 'map':
      return <IncidentMapView />;
    case 'incidents':
      return <IncidentsListView />;
    case 'incident-details':
      return <IncidentDetailsView />;
    case 'resources':
      return <ResourceManagementView />;
    case 'agents':
      return <AIAgentsView />;
    case 'plans':
      return <ResponsePlansView />;
    case 'plan-diff':
      return <PlanDiffView />;
    case 'trade-offs':
      return <ImpactTradeoffView />;
    case 'approval':
      return <HumanApprovalView />;
    case 'audit':
      return <AuditLogView />;
    case 'replanning':
      return <ReplanningSimulatorView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
};

/**
 * Operational Experience Shell:
 * - TopBar: Global identity, PostGIS connection health, search, notifications, system utilities
 * - ScenarioControllerBanner: Primary guided mission workflow stepper (ASSESS -> DISRUPTION -> REASON -> COMPARE -> DECIDE -> AUDIT)
 * - Sidebar: Secondary exploration navigation (COMMAND, ANALYZE, DECIDE, GOVERN)
 * - OperationalWorkspace: Active analytical/command workspace
 * - AIPipelineExecutionModal: Global multi-agent pipeline visualizer
 */
const OperationalShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col overflow-hidden">
      {/* Global Top Application Bar */}
      <TopBar />

      {/* Primary Guided Mission Stepper */}
      <ScenarioControllerBanner />

      {/* Main Operational Workspace Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Secondary Exploration Sidebar */}
        <Sidebar />

        {/* Dynamic Operational Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)] h-[calc(100vh-6.5rem)]">
          <OperationalWorkspace />
        </main>
      </div>

      {/* Global Multi-Agent Pipeline Execution Modal */}
      <AIPipelineExecutionModal />
    </div>
  );
};

/**
 * Master Application Router
 * Selects between Public Discovery and Operational Command Center.
 */
const MasterAppRouter: React.FC = () => {
  const { activeTab, currentUserRole, setActiveTab } = useCrisis();
  const isPublicView = activeTab === 'landing' || activeTab === 'login' || activeTab === 'register';

  if (isPublicView) {
    return <PublicExperience />;
  }

  if (currentUserRole === 'USER') {
    if (activeTab === 'user-dashboard') return <UserDashboardView />;
    if (activeTab === 'profile') return <ProfileView />;
    
    // Unauthorized access for USER
    return (
      <div className="min-h-screen bg-[#070b12] text-[var(--text-primary)] flex flex-col items-center justify-center p-6">
        <div className="p-8 rounded-3xl bg-[#0b101a] border border-red-500/20 text-center max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Unauthorized Access</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">You do not have permission to access the Admin Dashboard.</p>
          <button 
            onClick={() => setActiveTab('user-dashboard')}
            className="px-6 py-2.5 rounded-xl bg-sky-500/10 text-sky-400 font-bold hover:bg-sky-500/20 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <OperationalShell />;
};

export const App: React.FC = () => {
  return (
    <CrisisProvider>
      <MasterAppRouter />
    </CrisisProvider>
  );
};

export default App;

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Incident,
  Resource,
  AIAgent,
  PlanOption,
  HumanReviewFlag,
  AuditEntry,
  ScenarioPhase,
  UserRole,
  ActiveTab,
  PlanDiffItem,
  UserProfile,
} from '../types';
import {
  INITIAL_INCIDENTS,
  CRISIS_NEW_INCIDENT_I4,
  INITIAL_RESOURCES,
  INITIAL_AGENTS,
  INITIAL_RESPONSE_PLANS,
  INITIAL_REVIEW_FLAGS,
  INITIAL_AUDIT_LOG,
} from '../data/seedData';
import { computeCrossSectorImpact, SectorImpactSummary } from '../services/riskImpactEngine';
import { scenarioApi, auditApi, plansApi, incidentsApi, resourcesApi } from '../services/api';

interface LiveNotification {
  id: string;
  time: string;
  title: string;
  message: string;
  level: 'critical' | 'warning' | 'info' | 'success';
  read: boolean;
  incidentId?: string;
}

interface CrisisContextType {
  // Scenario state
  phase: ScenarioPhase;
  phaseLabel: string;
  incidents: Incident[];
  resources: Resource[];
  agents: AIAgent[];
  responsePlans: PlanOption[];
  selectedPlanId: string;
  activePlan: PlanOption | null;
  planDiffs: PlanDiffItem[];
  reviewFlags: HumanReviewFlag[];
  auditLogs: AuditEntry[];
  sectorImpact: SectorImpactSummary;
  notifications: LiveNotification[];
  unreadNotificationCount: number;
  isBackendConnected: boolean;
  addNewCivilianIncident?: (agency: string, desc: string, location: string, lat: number, lng: number) => void;
  backendLoading: boolean;
  backendError: string | null;

  // Navigation & Selection
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedIncidentId: string;
  setSelectedIncidentId: (id: string) => void;
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  selectedResourceId: string;
  setSelectedResourceId: (id: string) => void;
  selectedDiffItem: PlanDiffItem | null;
  setSelectedDiffItem: (item: PlanDiffItem | null) => void;
  selectDiffItem: (item: PlanDiffItem | null) => void;

  // User & Theme
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Replanning progress
  isReplanning: boolean;
  replanningProgress: number;
  activeAgentProcessingId: string | null;
  dismissReplanningModal: () => void;

  // Scenario Actions
  triggerCrisisEvent: () => void;
  startReplanning: () => Promise<void>;
  approvePlan: (operatorNotes?: string) => Promise<void>;
  rejectPlan: (reason: string) => Promise<void>;
  requestChanges: (notes: string) => void;
  requestReanalysis: () => void;
  addOperatorNote: (note: string) => Promise<void>;
  resetScenario: () => void;
  selectResponsePlan: (planId: string) => void;
  acknowledgeReviewFlag: (flagId: number) => void;
  toggleResourceFailure: (resourceId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, level: 'critical' | 'warning' | 'info' | 'success') => void;
  playTacticalSound: (type: 'alert' | 'replan' | 'success' | 'click') => void;
  refreshBackendState: () => Promise<void>;
}

const CrisisContext = createContext<CrisisContextType | undefined>(undefined);

// Web Audio API tactical sound synthesizer
function playSynthesizedSound(type: 'alert' | 'replan' | 'success' | 'click') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(660, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'replan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'success') {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export const CrisisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<ScenarioPhase>('T0_INITIAL');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [responsePlans, setResponsePlans] = useState<PlanOption[]>(INITIAL_RESPONSE_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('opt-1');
  const [backendPlanDiffs, setBackendPlanDiffs] = useState<PlanDiffItem[] | null>(null);
  const [reviewFlags, setReviewFlags] = useState<HumanReviewFlag[]>(INITIAL_REVIEW_FLAGS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOG);

  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [backendLoading, setBackendLoading] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('I-1');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-hazard');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('RES-EVAC-A');
  const [selectedDiffItem, setSelectedDiffItem] = useState<PlanDiffItem | null>(null);

  const selectDiffItem = useCallback((item: PlanDiffItem | null) => {
    setSelectedDiffItem(item);
    if (!item) return;

    if (item.resourceId && !item.resourceId.startsWith('DELAYED-')) {
      setSelectedResourceId(item.resourceId);
    }

    if (item.resourceId && item.resourceId.startsWith('DELAYED-')) {
      const incId = item.resourceId.replace('DELAYED-', '');
      setSelectedIncidentId(incId);
    } else {
      const match = item.newAssignment.match(/I-[1-4]/) || item.reason.match(/I-[1-4]/);
      if (match) {
        setSelectedIncidentId(match[0]);
      }
    }
  }, []);

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Control Room Operator');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [isReplanning, setIsReplanning] = useState<boolean>(false);
  const [replanningProgress, setReplanningProgress] = useState<number>(0);
  const [activeAgentProcessingId, setActiveAgentProcessingId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<LiveNotification[]>([
    {
      id: 'notif-1',
      time: '10:00 AM',
      title: 'Initial Incidents Registered',
      message: 'Wildfire incidents I-1, I-2, I-3 active in Sierra Madre sector [DATABASE — T0 SEED].',
      level: 'warning',
      read: false,
    },
    {
      id: 'notif-2',
      time: '10:06 AM',
      title: 'Baseline Plan Dispatched',
      message: 'Initial assignments active (Vehicle A, Team B, Team C, Boat 1) [DATABASE — T0 SEED].',
      level: 'info',
      read: true,
    },
  ]);

  // Synchronize theme token on root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const playTacticalSound = useCallback(
    (type: 'alert' | 'replan' | 'success' | 'click') => {
      if (soundEnabled) {
        playSynthesizedSound(type);
      }
    },
    [soundEnabled]
  );

  // Helper to add audit entry
  const addAuditEntry = useCallback(
    (
      eventType: AuditEntry['eventType'],
      summary: string,
      actor: string,
      details: Record<string, any> = {},
      confidence?: number
    ) => {
      const newEntry: AuditEntry = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString(),
        eventType,
        actor,
        summary,
        details,
        confidence,
      };
      setAuditLogs(prev => [newEntry, ...prev]);
    },
    []
  );

  // Helper to add notification
  const addNotification = useCallback(
    (title: string, message: string, level: 'critical' | 'warning' | 'info' | 'success', incidentId?: string, fromBroadcast = false) => {
      const notif: LiveNotification = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title,
        message,
        level,
      incidentId,
        read: false,
      };
      
      setNotifications(prev => {
        // Prevent duplicates if received via broadcast very closely
        if (prev.some(n => n.title === title && n.message === message && Date.now() - parseInt(n.id.split('-')[1]) < 2000)) {
          return prev;
        }
        return [notif, ...prev];
      });
      
      if (level === 'critical') playTacticalSound('alert');
      else if (level === 'success') playTacticalSound('success');

      if (!fromBroadcast) {
        try {
          const channel = new BroadcastChannel('crisis-notifications');
          channel.postMessage({ type: 'NEW_NOTIFICATION', payload: { title, message, level, incidentId } });
          channel.close();
        } catch (e) {}
      }
    },
    [playTacticalSound]
  );

  // Listen for cross-tab notifications
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('crisis-notifications');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_NOTIFICATION') {
          const { title, message, level } = event.data.payload;
          addNotification(title, message, level, undefined, true);
        }
      };
      return () => channel.close();
    } catch (e) {}
  }, [addNotification]);


  const addNewCivilianIncident = useCallback((agency: string, desc: string, location: string, lat: number, lng: number) => {
    const newId = 'CIV-' + Math.floor(Math.random() * 10000);
    
    let type = 'General Emergency';
    let sev = 'High';
    let icon = '🚨'; // default alert
    const descLower = desc.toLowerCase();
    
    if (descLower.includes('fire')) { type = 'Wildfire'; sev = 'Critical'; icon = '🔥'; }
    else if (descLower.includes('flood') || descLower.includes('water')) { type = 'Severe Flood Alert'; sev = 'Critical'; icon = '🌊'; }
    else if (descLower.includes('med') || descLower.includes('injur') || descLower.includes('heart')) { type = 'Medical Emergency'; sev = 'Critical'; icon = '🏥'; }
    else if (descLower.includes('crash') || descLower.includes('accident')) { type = 'Traffic Collision'; sev = 'High'; icon = '💥'; }
    else if (descLower.includes('storm') || descLower.includes('wind')) { type = 'Severe Storm'; sev = 'High'; icon = '🌪️'; }

    const newInc: Incident = {
      id: newId,
      name: location + ' (' + agency + ')',
      type: type,
      locationName: location,
      coordinates: { lat, lng },
      severity: sev as any,
      urgency: 'Immediate',
      status: 'Active',
      description: desc + ' [CIVILIAN REPORTED]',
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accessibility: { status: 'Open', details: '', roadName: location, riverRouteAvailable: false },
      impact: { peopleAtRisk: 1, livestockCount: 0, cropHectares: 0, habitatAreaKm2: 0, infrastructureRisk: [], areaKm2: 0, livestockTypes: [], cropTypes: [], wildlifeSpecies: [] },
      requiredResources: ['Local Patrol', 'Paramedic'],
      assignedResourceIds: [],
      confidence: 85,
      lastUpdated: new Date().toISOString(),
      aiInsights: [],
      liveTimeline: [],
      relatedIncidentIds: [] as any,
    };

    setIncidents(prev => [newInc, ...prev]);
    addNotification('🚨 New Civilian Report: ' + type, 'Location: ' + location + ' - ' + desc, 'critical', newId);
    playTacticalSound('alert');
  }, [addNotification, playTacticalSound]);

  // Initial Backend State Synchronization
  const refreshBackendState = useCallback(async () => {
    try {
      setBackendLoading(true);
      const stateData = await scenarioApi.getState();
      setIsBackendConnected(true);
      setBackendError(null);

      // Populate incidents and resources from backend if available
      try {
        const backendIncidents = await incidentsApi.listIncidents();
        if (backendIncidents && backendIncidents.length > 0) {
          setIncidents(backendIncidents);
        }
      } catch {
        if (stateData.incidents && stateData.incidents.length > 0) {
          setIncidents(stateData.incidents);
        }
      }

      try {
        const backendResources = await resourcesApi.listResources();
        if (backendResources && backendResources.length > 0) {
          setResources(backendResources);
        }
      } catch {
        if (stateData.resources && stateData.resources.length > 0) {
          setResources(stateData.resources);
        }
      }

      if (stateData.currentPhase === 'T1_DISRUPTION') {
        setPhase('REVISED_PLAN_READY');
      }

      // Fetch recent audit logs from backend
      try {
        const recentLogs = await auditApi.getRecentLogs(20);
        if (recentLogs && recentLogs.length > 0) {
          setAuditLogs(recentLogs);
        }
      } catch {
        // preserve local audit logs
      }
    } catch (err: any) {
      setIsBackendConnected(false);
      setBackendError('Backend PostgreSQL service is currently offline. Operating on simulated development baseline [SIMULATED — DEMO DATA].');
    } finally {
      setBackendLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBackendState();
  }, [refreshBackendState]);

  const sectorImpact = computeCrossSectorImpact(incidents);
  const activePlan = responsePlans.find(p => p.id === selectedPlanId) || responsePlans[0] || null;

  // Compute or consume authoritative plan diffs
  const previousBaselineAssignments: Record<string, string> = {
    'RES-EVAC-A': 'I-1 Community Evacuation',
    'RES-TRANS-B': 'I-2 Farm & Livestock Emergency',
    'RES-RESCUE-C': 'I-3 Wildlife Habitat Emergency',
    'RES-BOAT-1': 'I-1 Riverside Households Only',
  };

  const computedLocalPlanDiffs: PlanDiffItem[] = (activePlan?.assignments || [])
    .filter(a => previousBaselineAssignments[a.resourceId] !== a.incidentName)
    .map(a => ({
      resourceId: a.resourceId,
      resourceName: a.resourceName,
      previousAssignment: previousBaselineAssignments[a.resourceId] || 'Unassigned / Available',
      newAssignment: a.incidentName,
      reason: a.notes,
      type: a.action === 'Reallocate' ? ('reallocated' as const) : a.action === 'Widen Role' ? ('expanded' as const) : ('added' as const),
    }));

  if (activePlan?.delayedIncidentIds) {
    activePlan.delayedIncidentIds.forEach(delId => {
      const inc = incidents.find(i => i.id === delId);
      if (inc) {
        computedLocalPlanDiffs.push({
          resourceId: `DELAYED-${delId}`,
          resourceName: `${inc.id} ${inc.name}`,
          previousAssignment: 'Active Response Plan Assigned',
          newAssignment: `Delayed (${inc.impact.livestockCount > 0 ? '3.5 hr safe smoke buffer [SIMULATED — DEMO DATA]' : 'Monitored via Drone D-1 [RECOMMENDATION]'})`,
          reason: activePlan.delayedReasons[delId] || 'Delayed due to scarce-resource priority triage [GOVERNANCE CONSTRAINT].',
          type: 'delayed' as const,
        });
      }
    });
  }

  const planDiffs = backendPlanDiffs && backendPlanDiffs.length > 0 ? backendPlanDiffs : computedLocalPlanDiffs;

  // Trigger Scenario T0+10m Crisis Event
  const triggerCrisisEvent = useCallback(() => {
    playTacticalSound('alert');
    setPhase('T0_PLUS_10_CRISIS');

    // Add I-4 to incidents if not present
    setIncidents(prev => {
      if (prev.some(i => i.id === 'I-4')) return prev;
      return [CRISIS_NEW_INCIDENT_I4, ...prev];
    });

    // Mark Vehicle A as Unavailable (Breakdown)
    setResources(prev =>
      prev.map(r => {
        if (r.id === 'RES-EVAC-A' || r.id === 'RES-VEH-A') {
          return {
            ...r,
            state: 'Unavailable',
            isSimulatedFailure: true,
            failureReason: 'Mechanical Transmission Failure / Overheated Radiator [SIMULATED — DEMO DATA]',
          };
        }
        return r;
      })
    );

    // Update flags
    setReviewFlags(INITIAL_REVIEW_FLAGS);

    addNotification(
      'CRITICAL CRISIS ALERT (T0+10m)',
      'Bridge collapsed on Hwy 27 -> I-4 Isolated Community reported (410 residents trapped [SIMULATED — DEMO DATA]). Evacuation Vehicle A suffered mechanical breakdown.',
      'critical'
    );

    addAuditEntry(
      'SCENARIO_TRIGGER',
      'Compound crisis event detected: Maharlika Highway bridge collapse isolated 410 residents (I-4 [SIMULATED — DEMO DATA]); Evacuation Vehicle A reported mechanical failure [SIMULATED — DEMO DATA].',
      'Regional CAD & Drone Recon [SIMULATED — DEMO DATA]',
      { new_incident_id: 'I-4', failed_resource_id: 'RES-EVAC-A' },
      96
    );
  }, [addAuditEntry, addNotification, addNewCivilianIncident,
           playTacticalSound]);

  // Start Multi-Agent Dynamic Replanning (Backend API with local deterministic fallback)
  const startReplanning = useCallback(async () => {
    setIsReplanning(true);
    setPhase('REPLANNING_IN_PROGRESS');
    playTacticalSound('replan');

    addNotification(
      'Dynamic Replanning Initiated',
      'Activating backend 8-agent reasoning pipeline and deterministic optimization engine.',
      'info'
    );

    addAuditEntry(
      'AI_ANALYSIS_STARTED',
      'Dynamic multi-agent replanning triggered following resource failure and incident emergence.',
      'Command / Planning Orchestrator',
      { trigger: 'Vehicle A Breakdown + Incident I-4' },
      95
    );

    try {
      // Call authoritative Backend API endpoint
      const result = await scenarioApi.triggerT1();
      setIsBackendConnected(true);
      setBackendError(null);

      // Map backend plan diffs
      if (result.diff && result.diff.items) {
        const formattedDiffs: PlanDiffItem[] = result.diff.items.map(item => ({
          resourceId: item.resource_id,
          resourceName: item.resource_name,
          previousAssignment: item.previous_assignment,
          newAssignment: item.new_assignment,
          reason: item.reason,
          consequence: item.consequence,
          type: item.change_type as any,
        }));
        setBackendPlanDiffs(formattedDiffs);
      }

      // Update active revised plan
      const revisedPlanOption: PlanOption = {
        id: result.plan?.id || 'opt-1',
        title: 'Candidate Option 1 — Life-Safety Priority Profile',
        subtitle: 'Reallocates 6x6 transport to I-4 isolated community; preserves Boat 1 corridor [FROM GATEWAYS / DATABASE]',
        isRecommended: true,
        incidentsCovered: 2,
        totalIncidents: 4,
        resourcesAssigned: 3,
        estimatedTotalHours: 4.5,
        successProbabilityPercent: 94,
        riskScore: 'Medium',
        expectedOutcomes: [
          '410 residents at I-4 extracted via 6x6 North River Bypass [SIMULATED — DEMO DATA]',
          'San Mateo (I-1) evacuation continuity preserved via Rescue Team C + Boat 1 [FROM GATEWAYS]',
          'I-2 Livestock delayed under estimated 3.5 hr smoke buffer; I-3 under drone observation [SIMULATED — DEMO DATA]',
        ],
        tradeOffSummary: 'Livestock and wildlife evacuations deferred to ensure 100% human life preservation [GOVERNANCE CONSTRAINT].',
        assignments: [
          {
            resourceId: 'RES-TRANS-B',
            resourceName: 'Transport Team B',
            resourceType: 'Transport Team',
            incidentId: 'I-4',
            incidentName: 'I-4 Cut-Off Settlement Evacuation',
            action: 'Reallocate',
            notes: '[FROM GATEWAYS] Rerouted to I-4 via North River 6x6 bypass road.',
            etaMinutes: 22,
            routeDetails: 'North River 6x6 Bypass Trail',
            previousAssignment: 'I-2 Valley Dairy Farm & Livestock Emergency',
          },
          {
            resourceId: 'RES-RESCUE-C',
            resourceName: 'Rescue Team C',
            resourceType: 'Rescue Team',
            incidentId: 'I-1',
            incidentName: 'I-1 San Mateo Community Evacuation',
            action: 'Reallocate',
            notes: '[FROM GATEWAYS] Reassigned to cover staging void from Vehicle A breakdown.',
            etaMinutes: 18,
            routeDetails: 'Route 4 Direct Access',
            previousAssignment: 'I-3 Sierra Madre Wildlife Sanctuary Emergency',
          },
          {
            resourceId: 'RES-BOAT-1',
            resourceName: 'Rescue Boat 1',
            resourceType: 'Boat',
            incidentId: 'I-1',
            incidentName: 'I-1 San Mateo Community Evacuation',
            action: 'Assign',
            notes: '[FROM GATEWAYS] Water corridor operations preserved.',
            etaMinutes: 12,
            routeDetails: 'Pine River Water Corridor',
            previousAssignment: 'I-1 San Mateo Community Evacuation',
          },
        ],
        delayedIncidentIds: result.affectedIncidents?.delayed || ['I-2', 'I-3'],
        delayedReasons: {
          'I-2': '3.5 hr safe smoke buffer available [SIMULATED — DEMO DATA]; Transport Team B diverted to I-4 [FROM GATEWAYS].',
          'I-3': 'Animals moving away from crown fire; continuous thermal drone monitoring [RECOMMENDATION].',
        },
        confidenceScore: result.plan?.confidence_score ? Math.round(Number(result.plan.confidence_score)) : 89,
      };

      setResponsePlans([revisedPlanOption, ...INITIAL_RESPONSE_PLANS.filter(p => p.id !== 'opt-1')]);
      setSelectedPlanId(revisedPlanOption.id);

      // Ensure incidents includes I-4
      setIncidents(prev => {
        const hasI4 = prev.some(i => i.id === 'I-4');
        const updated = prev.map(inc => {
          if (inc.id === 'I-2' || inc.id === 'I-3') {
            return { ...inc, status: 'Delayed' as const };
          }
          if (inc.id === 'I-1') {
            return { ...inc, assignedResourceIds: ['RES-RESCUE-C', 'RES-BOAT-1'] };
          }
          return inc;
        });
        if (!hasI4) {
          return [{ ...CRISIS_NEW_INCIDENT_I4, assignedResourceIds: ['RES-TRANS-B'] }, ...updated];
        }
        return updated.map(i => (i.id === 'I-4' ? { ...i, assignedResourceIds: ['RES-TRANS-B'] } : i));
      });

      // Update resources without fake real dispatch
      setResources(prev =>
        prev.map(r => {
          if (r.id === 'RES-EVAC-A' || r.id === 'RES-VEH-A') {
            return { ...r, state: 'Unavailable' as const, isSimulatedFailure: true };
          }
          if (r.id === 'RES-TRANS-B') {
            return { ...r, state: 'Assigned' as const, currentAssignmentId: 'I-4', currentAssignmentName: 'I-4 Cut-Off Settlement Evacuation' };
          }
          if (r.id === 'RES-RESCUE-C') {
            return { ...r, state: 'Assigned' as const, currentAssignmentId: 'I-1', currentAssignmentName: 'I-1 San Mateo Community Evacuation' };
          }
          return r;
        })
      );

      // Update agents telemetry if returned
      if (result.agentResults) {
        setAgents(prev =>
          prev.map(a => {
            const roleKey = a.id.replace('agent-', '').toUpperCase();
            const matchingBackend = Object.values(result.agentResults).find(
              (res: any) => res.agentRole?.toUpperCase().includes(roleKey) || res.agentId?.toUpperCase().includes(roleKey)
            );
            if (matchingBackend) {
              return {
                ...a,
                status: 'Completed' as const,
                confidence: matchingBackend.confidence || a.confidence,
                lastRunTimestamp: new Date().toLocaleTimeString(),
                keyFindings: matchingBackend.findings?.map((f: any) => f.summary) || a.keyFindings,
              };
            }
            return { ...a, status: 'Completed' as const, lastRunTimestamp: new Date().toLocaleTimeString() };
          })
        );
      }

      setPhase('REVISED_PLAN_READY');
      setIsReplanning(false);
      setActiveAgentProcessingId(null);

      addAuditEntry(
        'OPTIMIZATION_SOLVED',
        `Dynamic replanning solved by backend engine. Generated PLAN-T1-REVISED with ${result.diff.totalChanges} changes.`,
        'Resource Allocation Engine',
        { executionId: result.executionId, changes: result.diff.totalChanges },
        revisedPlanOption.confidenceScore
      );

      addNotification(
        'Revised Response Plan Ready',
        'Backend AI generated Option 1 with Plan Diff ready for operator authorization.',
        'warning'
      );
    } catch (err: any) {
      // Strict Phase 5A Boundary: Do NOT run local solver, do NOT mutate state, do NOT fabricate Plan Diff
      setIsBackendConnected(false);
      setIsReplanning(false);
      setActiveAgentProcessingId(null);
      setBackendError('Authoritative backend replanning service is unavailable. Replanning could not be executed.');

      addAuditEntry(
        'INCIDENT_ESCALATION',
        'Multi-agent dynamic replanning failed: backend service unreachable. Last-known operational state preserved [GOVERNANCE CONSTRAINT].',
        'System Orchestrator',
        { error: err?.message || 'Authoritative backend unreachable' }
      );

      addNotification(
        'Replanning Failed (Backend Unavailable)',
        'Replanning could not be executed because the authoritative backend is unavailable. Last-known operational state preserved. Please retry after verifying backend connectivity.',
        'critical'
      );
    }
  }, [addAuditEntry, addNotification, playTacticalSound]);

  // Human Operator Approves Plan (Governance Boundary: No automatic real dispatch)
  const approvePlan = useCallback(
    async (operatorNotes?: string) => {
      playTacticalSound('success');
      setPhase('PLAN_APPROVED');

      const planToDispatch = responsePlans.find(p => p.id === selectedPlanId) || responsePlans[0];

      // Update backend plan status and audit log asynchronously
      try {
        await auditApi.logApproval({
          planId: selectedPlanId,
          operatorRole: currentUserRole,
          operatorNotes: operatorNotes || 'All trade-off and safety review flags verified.',
          action: 'APPROVE',
        });
        await plansApi.updatePlanStatus(selectedPlanId, 'Approved', operatorNotes);
      } catch {
        // Log locally if backend offline
      }

      // Maintain assigned status without automatic real-world dispatch
      setResources(prev =>
        prev.map(r => {
          const assignment = planToDispatch.assignments.find(a => a.resourceId === r.id);
          if (assignment) {
            return {
              ...r,
              state: r.state === 'Unavailable' ? 'Unavailable' : ('Assigned' as const),
              currentAssignmentId: assignment.incidentId,
              currentAssignmentName: assignment.incidentName,
              etaMinutes: assignment.etaMinutes,
              locationName: assignment.routeDetails,
            };
          }
          return r;
        })
      );

      // Update incident resource assignments and delayed states dynamically
      setIncidents(prev =>
        prev.map(inc => {
          const assignedToInc = planToDispatch.assignments
            .filter(a => a.incidentId === inc.id)
            .map(a => a.resourceId);

          const isDelayed = planToDispatch.delayedIncidentIds?.includes(inc.id);

          return {
            ...inc,
            status: isDelayed ? ('Delayed' as const) : inc.status,
            assignedResourceIds: assignedToInc.length > 0 ? assignedToInc : inc.assignedResourceIds,
          };
        })
      );

      // Acknowledge all review flags
      setReviewFlags(prev => prev.map(f => ({ ...f, acknowledged: true })));

      addAuditEntry(
        'HUMAN_APPROVAL',
        `Response plan ${planToDispatch.title} approved and authorized by ${currentUserRole}. Plan status recorded as APPROVED [GOVERNANCE CONSTRAINT — NO REAL-WORLD DISPATCH IN PHASE 5A].`,
        currentUserRole,
        {
          plan_id: selectedPlanId,
          operator_notes: operatorNotes || 'All trade-off and safety review flags verified.',
          assigned_resources: planToDispatch.assignments.map(a => a.resourceId),
          governance_note: 'No real-world CAD dispatch executed (Phase 5A)',
        }
      );

      addNotification(
        'PLAN APPROVED',
        `Plan ${selectedPlanId.toUpperCase()} authorized by ${currentUserRole}. Plan status: APPROVED.`,
        'success'
      );
    },
    [addAuditEntry, addNotification, currentUserRole, playTacticalSound, responsePlans, selectedPlanId]
  );

  const rejectPlan = useCallback(
    async (reason: string) => {
      try {
        await auditApi.logApproval({
          planId: selectedPlanId,
          operatorRole: currentUserRole,
          operatorNotes: reason,
          action: 'REJECT',
        });
      } catch {
        // Fallback local log
      }
      addAuditEntry('HUMAN_REJECTION', `Response plan rejected by ${currentUserRole}. Reason: ${reason}`, currentUserRole);
      addNotification('Plan Rejected', `Plan ${selectedPlanId} was rejected by operator.`, 'warning');
    },
    [addAuditEntry, addNotification, currentUserRole, selectedPlanId]
  );

  const requestChanges = useCallback(
    (notes: string) => {
      addAuditEntry('HUMAN_REJECTION', `Operator requested plan adjustments: ${notes}`, currentUserRole);
      addNotification('Change Requested', 'Operator requested parameter adjustments.', 'info');
    },
    [addAuditEntry, addNotification, currentUserRole]
  );

  const requestReanalysis = useCallback(() => {
    startReplanning();
  }, [startReplanning]);

  // Reset demo to initial state T0
  const resetScenario = useCallback(async () => {
    playTacticalSound('click');
    setPhase('T0_INITIAL');
    setIncidents(INITIAL_INCIDENTS);
    setResources(INITIAL_RESOURCES);
    setAgents(INITIAL_AGENTS);
    setResponsePlans(INITIAL_RESPONSE_PLANS);
    setSelectedPlanId('opt-1');
    setBackendPlanDiffs(null);
    setReviewFlags(INITIAL_REVIEW_FLAGS.map(f => ({ ...f, acknowledged: false })));
    setAuditLogs(INITIAL_AUDIT_LOG);
    setIsReplanning(false);
    setReplanningProgress(0);
    setActiveAgentProcessingId(null);
    setSelectedIncidentId('I-1');
    setSelectedResourceId('RES-EVAC-A');

    try {
      await scenarioApi.resetScenario();
      addNotification('Scenario Reset', 'Authoritative backend and UI restored to baseline initial state (T0) [DATABASE — T0 SEED].', 'info');
    } catch {
      addNotification('Scenario Reset', 'UI restored to baseline initial state (T0) [DATABASE — T0 SEED].', 'info');
    }
  }, [addNotification, playTacticalSound]);

  const selectResponsePlan = useCallback((planId: string) => {
    setSelectedPlanId(planId);
  }, []);

  const acknowledgeReviewFlag = useCallback((flagId: number) => {
    setReviewFlags(prev => prev.map(f => (f.id === flagId ? { ...f, acknowledged: true } : f)));
  }, []);

  const toggleResourceFailure = useCallback(
    (resourceId: string) => {
      setResources(prev =>
        prev.map(r => {
          if (r.id === resourceId) {
            const nextState = r.state === 'Unavailable' ? 'Available' : 'Unavailable';
            return {
              ...r,
              state: nextState,
              isSimulatedFailure: nextState === 'Unavailable',
              failureReason: nextState === 'Unavailable' ? 'Manual Operator Simulated Failure [SIMULATED — DEMO DATA]' : undefined,
            };
          }
          return r;
        })
      );
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const dismissReplanningModal = useCallback(() => {
    setIsReplanning(false);
    setReplanningProgress(0);
    setActiveAgentProcessingId(null);
  }, []);

  const addOperatorNote = useCallback(
    async (note: string) => {
      addAuditEntry('HUMAN_APPROVAL', `Operator Note added: ${note}`, currentUserRole, {
        plan_id: selectedPlanId,
        operator_note: note,
      });
      addNotification('Operator Note Saved', 'Note recorded to operational audit log.', 'info');
      try {
        await auditApi.logApproval({
          planId: selectedPlanId,
          operatorRole: currentUserRole,
          operatorNotes: note,
          action: 'APPROVE',
        });
      } catch {
        // fallback to local log
      }
    },
    [addAuditEntry, addNotification, currentUserRole, selectedPlanId]
  );

  // Global Tactical Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing inside an input, textarea, or contentEditable, do not trigger shortcuts
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        playTacticalSound('click');
        setSelectedIncidentId('I-1');
      } else if (e.key === '2') {
        e.preventDefault();
        playTacticalSound('click');
        setSelectedIncidentId('I-2');
      } else if (e.key === '3') {
        e.preventDefault();
        playTacticalSound('click');
        setSelectedIncidentId('I-3');
      } else if (e.key === '4') {
        e.preventDefault();
        playTacticalSound('click');
        setSelectedIncidentId('I-4');
      } else if (e.key === 'Escape') {
        setSelectedDiffItem(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playTacticalSound]);

  let phaseLabel = 'T0: Initial Multi-Incident Baseline [DATABASE — T0 SEED]';
  if (phase === 'T0_PLUS_10_CRISIS') phaseLabel = 'T0+10m: Crisis Event (Bridge Collapse + Vehicle A Failure) [SIMULATED — DEMO DATA]';
  else if (phase === 'REPLANNING_IN_PROGRESS') phaseLabel = 'Active: Multi-Agent AI Dynamic Replanning';
  else if (phase === 'REVISED_PLAN_READY') phaseLabel = 'Awaiting Human Approval: Revised Plan Generated';
  else if (phase === 'PLAN_APPROVED') phaseLabel = 'Approved: Plan Status APPROVED [NO REAL DISPATCH]';

  return (
    <CrisisContext.Provider
      value={{
        phase,
        phaseLabel,
        incidents,
        resources,
        agents,
        responsePlans,
        selectedPlanId,
        activePlan,
        planDiffs,
        reviewFlags,
        auditLogs,
        sectorImpact,
        notifications,
        unreadNotificationCount,
        isBackendConnected,
        backendLoading,
        backendError,

        activeTab,
        setActiveTab,
        selectedIncidentId,
        setSelectedIncidentId,
        selectedAgentId,
        setSelectedAgentId,
        selectedResourceId,
        setSelectedResourceId,
        selectedDiffItem,
        setSelectedDiffItem,
        selectDiffItem,

        currentUserRole,
        setCurrentUserRole,
        isAuthenticated,
        setIsAuthenticated,
        userProfile,
        setUserProfile,
        theme,
        toggleTheme,
          addNewCivilianIncident: addNewCivilianIncident as any,
        soundEnabled,
        setSoundEnabled,

        isReplanning,
        replanningProgress,
        activeAgentProcessingId,
        dismissReplanningModal,

        triggerCrisisEvent,
        startReplanning,
        approvePlan,
        rejectPlan,
        requestChanges,
        requestReanalysis,
        addOperatorNote,
        resetScenario,
        selectResponsePlan,
        acknowledgeReviewFlag,
        toggleResourceFailure,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        playTacticalSound,
        refreshBackendState,
      }}
    >
      {children}
    </CrisisContext.Provider>
  );
};

export const useCrisis = (): CrisisContextType => {
  const context = useContext(CrisisContext);
  if (!context) {
    throw new Error('useCrisis must be used within a CrisisProvider');
  }
  return context;
};

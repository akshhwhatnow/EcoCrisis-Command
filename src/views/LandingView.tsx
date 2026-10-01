import React from 'react';
import { useCrisis } from '../context/CrisisContext';
import {
  Globe, Sun, Moon,
  ArrowRight,
  Shield,
  Sprout,
  Trees,
  Cpu,
  Zap,
  Users,
  AlertTriangle,
  Play,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Compass,
  Activity,
  FileCheck,
  Scale,
  GitCompare,
  FileText,
} from 'lucide-react';
import { imageAssets } from '../data/imageAssets';

export const LandingView: React.FC = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const { setActiveTab, playTacticalSound, theme, toggleTheme } = useCrisis();

  
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnterCommandCenter = () => {
    playTacticalSound('click');
    setActiveTab('login');
  };

  const handleOperatorLogin = () => {
    playTacticalSound('click');
    setActiveTab('login');
  };

  const handleRegister = () => {
    playTacticalSound('click');
    setActiveTab('register');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden flex flex-col justify-between select-none relative">
      {/* Background Environmental Hero Photograph with Vignette Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={imageAssets.hero.url}
          alt={imageAssets.hero.alt}
          className="w-full h-full object-cover opacity-20 scale-102 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/85 to-[#070b12]/95" />
      </div>

      {/* Top Navigation */}
      <header className="h-20 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-subtle">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              EcoCrisis <span className="text-sky-400 font-extrabold">Command</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">
              Multi-Agent Compound Emergency Intelligence
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[var(--text-muted)]">
          <a href="#pillars" onClick={(e) => scrollToSection(e, 'pillars')} className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Cross-Sector Pillars</a>
          <a href="#architecture" onClick={(e) => scrollToSection(e, 'architecture')} className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">8-Agent Architecture</a>
          <a href="#governance" onClick={(e) => scrollToSection(e, 'governance')} className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Human Governance</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOperatorLogin}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-[var(--border-color)] transition-all cursor-pointer"
          >
            Login
          </button>
          <button
            type="button"
            onClick={handleRegister}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-[var(--border-color)] transition-all cursor-pointer"
          >
            RegisterPage
          </button>
          <button
            type="button"
            onClick={handleEnterCommandCenter}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] shadow-subtle flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-16 pt-16 pb-20 flex flex-col items-center text-center max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold mb-6 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MULTI-AGENT AI DECISION SUPPORT PLATFORM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight text-[var(--text-primary)]">
          When one crisis triggers <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
            compound sector emergencies.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          EcoCrisis Command continuously coordinates human evacuations, agricultural livestock buffers, and wildlife sanctuary corridors against finite response fleet capacity — using deterministic mathematical optimization with mandatory human-in-the-loop gating.
        </p>

        {/* Primary Action Button */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleEnterCommandCenter}
            className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-bold text-sm shadow-panel flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#architecture"
            className="px-8 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-slate-800 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-sm border border-[var(--border-color)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>EXPLORE HOW IT WORKS</span>
          </a>
        </div>

        {/* Operational Pillar Badges */}
        <div className="mt-16 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 border border-[var(--border-color)] backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1 font-mono">
              8 Domain Agents
            </span>
            <span className="text-xl font-extrabold text-[var(--text-primary)]">Multi-Agent Pipeline</span>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">Cross-sector reasoning</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 border border-[var(--border-color)] backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1 font-mono">
              Allocation Engine
            </span>
            <span className="text-xl font-extrabold text-emerald-400">Deterministic Heuristic</span>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">Explicit constraints</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 border border-[var(--border-color)] backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1 font-mono">
              Spatial Theater
            </span>
            <span className="text-xl font-extrabold text-sky-400">MapLibre GIS</span>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">PostGIS 3.4 persistence</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-card)]/80 border border-[var(--border-color)] backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1 font-mono">
              Governance Gate
            </span>
            <span className="text-xl font-extrabold text-amber-400">Human Authorization</span>
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">No autonomous dispatch</span>
          </div>
        </div>
      </section>

      {/* Section 1: Cross-Sector Pillars */}
      <section id="pillars" className="relative z-10 px-6 md:px-16 py-16 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
              COMPOUND CRISIS DOMAIN
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
              Simultaneous Impact Across Three Critical Sectors
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
              Single-purpose emergency tools optimize one domain while creating catastrophic delays in adjacent sectors. EcoCrisis Command balances compound trade-offs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-red-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Human Settlements &amp; Safety</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Prioritizes residential evacuations, road access cutoffs, smoke toxicity hazards, and safe river transit routes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-emerald-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Agriculture &amp; Food Security</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Calculates smoke buffer exposure windows, livestock herd staging, and agricultural infrastructure protection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-purple-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Trees className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Wildlife &amp; Ecological Sanctuaries</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Evaluates endangered breeding corridors, fire flank containment firebreaks, and ecological monitoring stations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 8-Agent Architecture */}
      <section id="architecture" className="relative z-10 px-6 md:px-16 py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
              8 Specialized Domain Agents in Sequential Consensus
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
              Each agent analyzes a specific dimension of the emergency, producing evidence-backed findings with explicit provenance tagging.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: '1. Incident Assessment', desc: 'Triage, severity, and life-safety constraints' },
              { title: '2. Hazard: Fire & Weather', desc: 'Wind vectors and Rothermel spread calculations' },
              { title: '3. Agriculture Agent', desc: 'Livestock buffer timing and crop exposure' },
              { title: '4. Wildlife & Ecosystem', desc: 'Biodiversity corridors and flank containment' },
              { title: '5. Resource Allocation', desc: 'Deterministic matching of units to priorities' },
              { title: '6. Route & Logistics', desc: 'Road accessibility and 6x6 bypass routes' },
              { title: '7. Verification Agent', desc: 'Confidence scoring and constraint audit' },
              { title: '8. Command & Planning', desc: 'Candidate plan synthesis and human gating' },
            ].map((agent, i) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5">
                <span className="text-xs font-bold text-sky-400 block font-mono">{agent.title}</span>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Governance & CTA */}
      <section id="governance" className="relative z-10 px-6 md:px-16 py-16 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Strict Human-in-the-Loop Governance
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            AI recommends. Deterministic software calculates. Human commanders authorize. Autonomous dispatch is prohibited — every decision is recorded to an immutable audit ledger with exportable decision briefs.
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={handleEnterCommandCenter}
              className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-[var(--text-primary)] font-bold text-sm shadow-panel inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>ENTER COMMAND CENTER</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-color)] py-6 px-6 md:px-12 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EcoCrisis Command • Multi-Agent Crisis Decision Support</span>
          <span className="font-mono text-[11px]">PostgreSQL + PostGIS • MapLibre GL v6 • 8-Agent Pipeline</span>
        </div>
      </footer>
    </div>
  );
};


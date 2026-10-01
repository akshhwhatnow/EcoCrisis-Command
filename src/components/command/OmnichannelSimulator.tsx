import React, { useState } from 'react';
import { useCrisis } from '../../context/CrisisContext';
import { Radio, Satellite, Smartphone, Terminal, Activity } from 'lucide-react';

export const OmnichannelSimulator: React.FC = () => {
  const { addNotification, playTacticalSound } = useCrisis();
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processIncomingSignal = async (type: 'SMS' | 'LORA' | 'SAT') => {
    if (isProcessing) return;
    setIsProcessing(true);
    playTacticalSound('click');
    setLogs([]);

    const logSequence: string[] = [];
    
    if (type === 'SMS') {
      logSequence.push('> INCOMING SMS FALLBACK RECEIVED VIA TWILIO GATEWAY (2G NETWORK)');
      logSequence.push('> Parsing natural language string...');
      logSequence.push('> "Need help flood water rising fast 123 River Rd"');
      logSequence.push('> NLP Agent matched signature: [FLOOD, URGENT]');
    } else if (type === 'LORA') {
      logSequence.push('> INCOMING ENCRYPTED LORAWAN PACKET (NODE_ID: 9X44)');
      logSequence.push('> Validating mesh hop signatures... [OK]');
      logSequence.push('> Decoding binary payload...');
      logSequence.push('> Payload: STRUCTURAL_COLLAPSE @ LNG 121.3 LAT 14.8');
    } else if (type === 'SAT') {
      logSequence.push('> 🛰️ SAT-SOS WEBHOOK TRIGGERED (STARLINK API)');
      logSequence.push('> Receiving distress beacon coordinates...');
      logSequence.push('> Target isolated: Northern mountains. Signal weak.');
      logSequence.push('> Extracting medical urgency flags... [CRITICAL_INJURY]');
    }

    // Simulate terminal typing
    for (let i = 0; i < logSequence.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setLogs(prev => [...prev, logSequence[i]]);
      playTacticalSound('click');
    }

    await new Promise(r => setTimeout(r, 800));
    setLogs(prev => [...prev, '> INGESTION COMPLETE. FORWARDING TO AI PIPELINE...']);
    
    // Add the notification
    let title = '';
    let msg = '';
    if (type === 'SMS') {
      title = '📱 Offline SMS Report';
      msg = 'Flood reported via 2G SMS Gateway. NLP parsed: Urgent.';
    } else if (type === 'LORA') {
      title = '📻 LoRaWAN Mesh Alert';
      msg = 'Structural collapse detected via offline mesh radio node 9X44.';
    } else if (type === 'SAT') {
      title = '🛰️ Satellite SOS Alert';
      msg = 'Critical medical distress beacon received via SAT-SOS Webhook.';
    }

    addNotification(title, msg, 'critical');
    playTacticalSound('alert');
    setIsProcessing(false);
  };

  return (
    <div className="w-full mt-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden glass-panel shadow-panel flex flex-col sm:flex-row">
      <div className="p-4 sm:p-5 flex-1 border-b sm:border-b-0 sm:border-r border-[var(--border-color)]">
        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Omnichannel / Offline Ingestion
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Test system resiliency by simulating emergency data arriving from non-web, offline, or low-bandwidth hardware networks.
        </p>
        
        <div className="flex flex-col gap-2">
          <button 
            disabled={isProcessing}
            onClick={() => processIncomingSignal('SMS')}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-emerald-500/50 transition-colors text-left disabled:opacity-50"
          >
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">Simulate 2G SMS / USSD Fallback</span>
          </button>

          <button 
            disabled={isProcessing}
            onClick={() => processIncomingSignal('LORA')}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-purple-500/50 transition-colors text-left disabled:opacity-50"
          >
            <Radio className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">Simulate LoRaWAN Mesh Packet</span>
          </button>

          <button 
            disabled={isProcessing}
            onClick={() => processIncomingSignal('SAT')}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-amber-500/50 transition-colors text-left disabled:opacity-50"
          >
            <Satellite className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">Simulate Satellite SOS Beacon</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 bg-[#0a0a0a] min-h-[180px] font-mono text-[11px] leading-relaxed flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full p-2 border-b border-[#333] bg-[#111] flex items-center gap-2">
          <Terminal className="w-3 h-3 text-sky-400" />
          <span className="text-[#888] font-bold tracking-widest text-[10px]">INGESTION_TERMINAL</span>
        </div>
        <div className="mt-8 flex flex-col gap-1 overflow-y-auto">
          {logs.map((l, i) => (
            <div key={i} className="text-emerald-400 break-words">{l}</div>
          ))}
          {isProcessing && <div className="text-emerald-400/50 animate-pulse">_</div>}
          {!isProcessing && logs.length === 0 && (
            <div className="text-[#555]">Awaiting incoming offline packets...</div>
          )}
        </div>
      </div>
    </div>
  );
};

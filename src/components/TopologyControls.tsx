import React from 'react';
import {
  NetworkTopologyType,
  NetworkNode,
  PacketProtocol
} from '../types';
import {
  Play,
  RotateCcw,
  Activity,
  Send,
  Radio,
  Zap,
  ShieldAlert,
  Gauge,
  Sliders
} from 'lucide-react';

interface TopologyControlsProps {
  currentTopology: NetworkTopologyType;
  onChangeTopology: (topo: NetworkTopologyType) => void;
  nodes: NetworkNode[];
  selectedSourceId: string;
  selectedTargetId: string;
  onSelectSource: (id: string) => void;
  onSelectTarget: (id: string) => void;
  protocol: PacketProtocol;
  onChangeProtocol: (p: PacketProtocol) => void;
  onSendPacket: (isEchoReply?: boolean) => void;
  onStartContinuousTraffic: () => void;
  isContinuousTraffic: boolean;
  onResetFailures: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onTriggerBroadcast: () => void;
}

export const TopologyControls: React.FC<TopologyControlsProps> = ({
  currentTopology,
  onChangeTopology,
  nodes,
  selectedSourceId,
  selectedTargetId,
  onSelectSource,
  onSelectTarget,
  protocol,
  onChangeProtocol,
  onSendPacket,
  onStartContinuousTraffic,
  isContinuousTraffic,
  onResetFailures,
  simSpeed,
  onChangeSpeed,
  onTriggerBroadcast
}) => {
  const topologies: { id: NetworkTopologyType; label: string; icon: string }[] = [
    { id: 'star', label: 'Étoile (Star)', icon: '⭐' },
    { id: 'mesh', label: 'Maillé (Mesh)', icon: '🕸️' },
    { id: 'ring', label: 'Anneau (Ring)', icon: '🔄' },
    { id: 'bus', label: 'Bus (Coaxial)', icon: '🚌' },
    { id: 'tree', label: 'Arbre (Tree)', icon: '🌳' },
    { id: 'custom', label: 'Bac à Sable', icon: '🛠️' },
  ];

  const protocols: { id: PacketProtocol; label: string; desc: string; color: string }[] = [
    { id: 'ICMP', label: 'ICMP Ping', desc: 'Echo Request/Reply', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { id: 'HTTP', label: 'HTTP Web', desc: 'Requête GET /index', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    { id: 'TCP', label: 'TCP SYN', desc: 'Connexion 3-Way Handshake', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { id: 'UDP', label: 'UDP Stream', desc: 'Streaming direct sans accusé', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { id: 'ARP', label: 'ARP Who-Has', desc: 'Diffusion de résolution MAC', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  ];

  const onlineNodes = nodes.filter(n => n.status === 'online');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Topology Presets Bar */}
      <div>
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>1. Choisissez un Modèle de Topologie</span>
          <span className="text-[11px] text-zinc-500 font-normal">Modèles physiques & logiques</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {topologies.map(t => (
            <button
              key={t.id}
              onClick={() => onChangeTopology(t.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                currentTopology === t.id
                  ? 'bg-sky-500/15 border-sky-500 text-sky-200 shadow-md shadow-sky-500/10'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <span className="text-base mb-1">{t.icon}</span>
              <span className="truncate w-full text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Packet Transmission Test Bench */}
      <div className="pt-2 border-t border-zinc-800/80">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>2. Banc d’Essai & Émission de Paquets</span>
          <span className="text-[11px] text-zinc-500 font-normal">Test de transmission nœud à nœud</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Source Node Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> Nœud Émetteur (Source)
            </label>
            <select
              value={selectedSourceId}
              onChange={(e) => onSelectSource(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id} disabled={n.status === 'offline'}>
                  {n.name} ({n.ip}) {n.status === 'offline' ? '[HORS LIGNE]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Target Node Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Nœud Récepteur (Destination)
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => onSelectTarget(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id} disabled={n.status === 'offline'}>
                  {n.name} ({n.ip}) {n.status === 'offline' ? '[HORS LIGNE]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Protocol Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <Radio className="w-3 h-3 text-indigo-400" /> Protocole Réseau
            </label>
            <select
              value={protocol}
              onChange={(e) => onChangeProtocol(e.target.value as PacketProtocol)}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              {protocols.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label} - {p.desc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSendPacket(false)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Émettre le Paquet ({protocol})
            </button>

            <button
              onClick={() => onSendPacket(true)}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1.5 border border-zinc-700 transition-colors"
              title="Envoie un Ping (Echo Request) puis attend la réponse (Echo Reply)"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Ping Aller-Retour (RTT)
            </button>

            <button
              onClick={onStartContinuousTraffic}
              className={`px-3 py-2 text-xs rounded-lg flex items-center gap-1.5 border transition-all ${
                isContinuousTraffic
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              {isContinuousTraffic ? 'Arrêter le Trafic' : 'Injecter Trafic Continu'}
            </button>

            <button
              onClick={onTriggerBroadcast}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg flex items-center gap-1.5 border border-zinc-700 transition-colors"
              title="Diffuse un paquet vers toutes les stations pour observer le flood ou la gestion STP"
            >
              <Radio className="w-3.5 h-3.5 text-purple-400" /> Diffusion (Broadcast)
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed selector */}
            <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
              <span className="text-[11px] text-zinc-400">Vitesse :</span>
              {[0.5, 1, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => onChangeSpeed(speed)}
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    simSpeed === speed ? 'bg-sky-500/30 text-sky-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Reset links */}
            <button
              onClick={onResetFailures}
              className="px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs rounded-lg flex items-center gap-1 border border-zinc-700/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Réparer tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

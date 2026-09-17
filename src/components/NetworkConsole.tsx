import React, { useState } from 'react';
import { NetworkLog, NetworkStats, PacketProtocol } from '../types';
import { Terminal, Trash2, CheckCircle2, AlertCircle, AlertTriangle, Info, Filter } from 'lucide-react';

interface NetworkConsoleProps {
  logs: NetworkLog[];
  stats: NetworkStats;
  onClearLogs: () => void;
}

export const NetworkConsole: React.FC<NetworkConsoleProps> = ({ logs, stats, onClearLogs }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.protocol === filter || log.level === filter.toLowerCase();
  });

  const getLevelBadge = (level: NetworkLog['level']) => {
    switch (level) {
      case 'success':
        return <span className="text-emerald-400 flex items-center gap-1 font-bold">[OK]</span>;
      case 'error':
        return <span className="text-red-400 flex items-center gap-1 font-bold">[ÉCHEC]</span>;
      case 'warning':
        return <span className="text-amber-400 flex items-center gap-1 font-bold">[ALERTE]</span>;
      default:
        return <span className="text-sky-400 flex items-center gap-1">[INFO]</span>;
    }
  };

  const packetLossRate = stats.packetsSent > 0
    ? Math.round((stats.packetsDropped / stats.packetsSent) * 100)
    : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg space-y-3">
      {/* Live Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-zinc-800 pb-3">
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center">
          <span className="text-[11px] text-zinc-400 block">Paquets Émis</span>
          <span className="text-base font-bold font-mono text-zinc-100">{stats.packetsSent}</span>
        </div>
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center">
          <span className="text-[11px] text-zinc-400 block">Paquets Reçus</span>
          <span className="text-base font-bold font-mono text-emerald-400">{stats.packetsDelivered}</span>
        </div>
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center">
          <span className="text-[11px] text-zinc-400 block">Pertes (Drop)</span>
          <span className={`text-base font-bold font-mono ${stats.packetsDropped > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
            {stats.packetsDropped} ({packetLossRate}%)
          </span>
        </div>
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center">
          <span className="text-[11px] text-zinc-400 block">Collisions</span>
          <span className={`text-base font-bold font-mono ${stats.collisionsDetected > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
            {stats.collisionsDetected}
          </span>
        </div>
        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-zinc-400 block">Latence Moyenne</span>
          <span className="text-base font-bold font-mono text-sky-400">{stats.averageLatency} ms</span>
        </div>
      </div>

      {/* Terminal Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Console Réseau & Journal des Trames en Temps Réel
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {filteredLogs.length} événements
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-zinc-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-300 focus:outline-none"
            >
              <option value="ALL">Tous les protocoles</option>
              <option value="ICMP">ICMP (Ping)</option>
              <option value="HTTP">HTTP</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ARP">ARP</option>
              <option value="ERROR">Erreurs uniquement</option>
            </select>
          </div>

          <button
            onClick={onClearLogs}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded text-xs transition-colors"
            title="Effacer le journal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5 select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-zinc-600 text-center py-6 font-sans text-xs">
            Aucun événement enregistré. Émettez un paquet ou simulez un ping pour voir l'activité réseau.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed hover:bg-zinc-900/60 p-0.5 rounded">
              <span className="text-zinc-500 text-[10px] whitespace-nowrap">{log.timestamp}</span>
              {getLevelBadge(log.level)}
              <span className="text-indigo-400 text-[11px] px-1 bg-zinc-900 rounded font-semibold whitespace-nowrap">
                [{log.protocol}]
              </span>
              <span className="text-zinc-300 break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

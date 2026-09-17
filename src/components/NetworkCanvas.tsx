import React, { useRef, useState, useEffect } from 'react';
import {
  NetworkNode,
  NetworkLink,
  ActivePacket,
  NodeType
} from '../types';
import {
  Monitor,
  Server,
  Router as RouterIcon,
  Layers,
  AlertTriangle,
  Zap,
  Scissors,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';

interface NetworkCanvasProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  activePackets: ActivePacket[];
  selectedSourceId: string | null;
  selectedTargetId: string | null;
  onSelectNode: (nodeId: string) => void;
  onToggleLink: (linkId: string) => void;
  onToggleNodeStatus: (nodeId: string) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  onAddCustomNode?: (type: NodeType) => void;
  isCustomMode?: boolean;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  nodes,
  links,
  activePackets,
  selectedSourceId,
  selectedTargetId,
  onSelectNode,
  onToggleLink,
  onToggleNodeStatus,
  onUpdateNodePosition,
  onAddCustomNode,
  isCustomMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  // Dragging handlers
  const handleMouseDownNode = (e: React.MouseEvent, node: NetworkNode) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left click
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDraggingNodeId(node.id);
    setDragOffset({
      x: (e.clientX - rect.left) - node.x,
      y: (e.clientY - rect.top) - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(40, Math.min(rect.width - 40, (e.clientX - rect.left) - dragOffset.x));
    const newY = Math.max(40, Math.min(rect.height - 40, (e.clientY - rect.top) - dragOffset.y));
    onUpdateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setDraggingNodeId(null);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'pc':
        return <Monitor className="w-5 h-5 text-sky-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-emerald-400" />;
      case 'router':
        return <RouterIcon className="w-5 h-5 text-amber-400" />;
      case 'switch':
        return <Layers className="w-5 h-5 text-indigo-400" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-300" />;
    }
  };

  const getNodeColor = (node: NetworkNode) => {
    if (node.status === 'offline') return 'bg-zinc-800 border-red-500/70 text-zinc-500 shadow-none';
    if (node.id === selectedSourceId) return 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/20';
    if (node.id === selectedTargetId) return 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20';
    return 'bg-zinc-900/90 border-zinc-700 hover:border-zinc-500 shadow-md';
  };

  // Node coordinate lookup
  const nodeCoords = new Map<string, { x: number; y: number }>();
  nodes.forEach(n => nodeCoords.set(n.id, { x: n.x, y: n.y }));

  return (
    <div
      ref={containerRef}
      id="network-canvas-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-[520px] bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden select-none shadow-inner"
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* SVG for Cables and Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <linearGradient id="linkActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="packetGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Links */}
        {links.map(link => {
          const s = nodeCoords.get(link.source);
          const t = nodeCoords.get(link.target);
          if (!s || !t) return null;

          const isHovered = hoveredLinkId === link.id;
          const isBroken = link.status === 'broken';

          // Link line coordinates
          const dx = t.x - s.x;
          const dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const midX = (s.x + t.x) / 2;
          const midY = (s.y + t.y) / 2;

          return (
            <g key={link.id} className="pointer-events-auto cursor-pointer" onClick={() => onToggleLink(link.id)}>
              {/* Invisible fat hit area for easy clicking */}
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="transparent"
                strokeWidth={20}
                onMouseEnter={() => setHoveredLinkId(link.id)}
                onMouseLeave={() => setHoveredLinkId(null)}
              />

              {/* Rendered cable */}
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={isBroken ? '#ef4444' : isHovered ? '#67e8f9' : '#334155'}
                strokeWidth={isBroken ? 2 : Math.max(2, Math.min(5, link.bandwidthMbps / 2000 + 2))}
                strokeDasharray={isBroken ? '6 6' : 'none'}
                strokeOpacity={isBroken ? 0.9 : 0.8}
                className="transition-colors duration-200"
              />

              {/* Active data flow pulse indicator on working link */}
              {!isBroken && (
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="4 16"
                  strokeOpacity={0.3}
                  className="animate-pulse"
                />
              )}

              {/* Midpoint badge (Latency & Cut state) */}
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-20"
                  y="-10"
                  width="40"
                  height="20"
                  rx="10"
                  fill={isBroken ? '#450a0a' : isHovered ? '#0e7490' : '#18181b'}
                  stroke={isBroken ? '#f87171' : '#3f3f46'}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="3"
                  fill={isBroken ? '#fca5a5' : '#a1a1aa'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {isBroken ? 'COUPÉ' : `${link.latencyMs}ms`}
                </text>
              </g>
            </g>
          );
        })}

        {/* In-flight Active Packets */}
        {activePackets.map(packet => {
          if (packet.path.length < 2) return null;
          const currIdx = packet.currentPathIndex;
          const fromNodeId = packet.path[currIdx];
          const toNodeId = packet.path[currIdx + 1];
          if (!fromNodeId || !toNodeId) return null;

          const fromCoord = nodeCoords.get(fromNodeId);
          const toCoord = nodeCoords.get(toNodeId);
          if (!fromCoord || !toCoord) return null;

          const px = fromCoord.x + (toCoord.x - fromCoord.x) * packet.progress;
          const py = fromCoord.y + (toCoord.y - fromCoord.y) * packet.progress;

          return (
            <g key={packet.id} transform={`translate(${px}, ${py})`}>
              {/* Outer pulsing glow */}
              <circle
                r="14"
                fill="none"
                stroke={packet.color}
                strokeWidth="2"
                opacity="0.5"
                className="animate-ping"
              />
              {/* Packet Body */}
              <circle
                r="10"
                fill={packet.color}
                filter="url(#glow)"
              />
              {/* Protocol Label */}
              <text
                x="0"
                y="-14"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
                className="bg-black px-1 rounded"
              >
                {packet.protocol}
              </text>
            </g>
          );
        })}
      </svg>

      {/* HTML Nodes on top of SVG */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {nodes.map(node => {
          const isHovered = hoveredNodeId === node.id;
          const isOffline = node.status === 'offline';
          const isSource = node.id === selectedSourceId;
          const isTarget = node.id === selectedTargetId;

          return (
            <div
              key={node.id}
              id={`node-${node.id}`}
              style={{
                transform: `translate(${node.x}px, ${node.y}px) translate(-50%, -50%)`,
                cursor: draggingNodeId === node.id ? 'grabbing' : 'grab'
              }}
              onMouseDown={(e) => handleMouseDownNode(e, node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id);
              }}
              className={`absolute pointer-events-auto group rounded-xl border p-2 flex items-center gap-2 transition-transform duration-100 ${getNodeColor(
                node
              )}`}
            >
              {/* Icon */}
              <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800">
                {getNodeIcon(node.type)}
                {/* Status Dot */}
                <span
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-zinc-900 ${
                    isOffline ? 'bg-red-500' : 'bg-emerald-400'
                  }`}
                />
              </div>

              {/* Node Details */}
              <div className="flex flex-col pr-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold ${isOffline ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                    {node.name}
                  </span>
                  {isSource && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30">
                      SOURCE
                    </span>
                  )}
                  {isTarget && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                      CIBLE
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {node.ip}
                </span>
              </div>

              {/* Quick Actions overlay on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pl-1 border-l border-zinc-800">
                <button
                  type="button"
                  title={isOffline ? 'Allumer le nœud' : 'Éteindre le nœud (simuler panne)'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleNodeStatus(node.id);
                  }}
                  className={`p-1 rounded text-xs transition-colors ${
                    isOffline
                      ? 'text-emerald-400 hover:bg-emerald-950/50'
                      : 'text-red-400 hover:bg-red-950/50'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rich Tooltip */}
              {isHovered && !draggingNodeId && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 p-2.5 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-lg shadow-xl text-left z-50 pointer-events-none">
                  <div className="text-xs font-bold text-zinc-100 mb-1 flex items-center justify-between">
                    <span>{node.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {node.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                    <p>IP: <span className="text-zinc-200">{node.ip}</span></p>
                    <p>MAC: <span className="text-zinc-300">{node.mac}</span></p>
                    {node.role && <p className="text-sky-400 font-sans mt-1">{node.role}</p>}
                    <p className={`font-sans mt-1 font-medium ${isOffline ? 'text-red-400' : 'text-emerald-400'}`}>
                      Statut: {isOffline ? 'Hors ligne (Panne)' : 'En ligne / Opérationnel'}
                    </p>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1.5 border-t border-zinc-800 pt-1">
                    Glisser pour déplacer • Clic pour sélectionner
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Badges & Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="px-2.5 py-1 bg-zinc-900/80 backdrop-blur rounded-md border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span>{nodes.filter(n => n.status === 'online').length}/{nodes.length} Nœuds actifs</span>
          <span className="text-zinc-600">|</span>
          <span>{links.filter(l => l.status === 'active').length}/{links.length} Câbles opérationnels</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {isCustomMode && onAddCustomNode && (
          <div className="flex items-center gap-1 bg-zinc-900/90 backdrop-blur border border-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => onAddCustomNode('pc')}
              className="px-2 py-1 text-xs bg-sky-900/40 hover:bg-sky-900/70 text-sky-300 rounded flex items-center gap-1 border border-sky-800/50"
            >
              <Plus className="w-3 h-3" /> PC
            </button>
            <button
              onClick={() => onAddCustomNode('switch')}
              className="px-2 py-1 text-xs bg-indigo-900/40 hover:bg-indigo-900/70 text-indigo-300 rounded flex items-center gap-1 border border-indigo-800/50"
            >
              <Plus className="w-3 h-3" /> Switch
            </button>
            <button
              onClick={() => onAddCustomNode('router')}
              className="px-2 py-1 text-xs bg-amber-900/40 hover:bg-amber-900/70 text-amber-300 rounded flex items-center gap-1 border border-amber-800/50"
            >
              <Plus className="w-3 h-3" /> Routeur
            </button>
            <button
              onClick={() => onAddCustomNode('server')}
              className="px-2 py-1 text-xs bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-300 rounded flex items-center gap-1 border border-emerald-800/50"
            >
              <Plus className="w-3 h-3" /> Serveur
            </button>
          </div>
        )}

        <div className="px-2.5 py-1 bg-zinc-900/90 backdrop-blur rounded-md border border-zinc-800 text-[11px] text-zinc-400">
          💡 <span className="text-zinc-300">Astuce :</span> Cliquez sur un câble pour simuler une coupure
        </div>
      </div>
    </div>
  );
};

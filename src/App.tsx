import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  NetworkTopologyType,
  NetworkNode,
  NetworkLink,
  ActivePacket,
  PacketProtocol,
  NetworkLog,
  NetworkStats,
  NodeType
} from './types';
import { TOPOLOGY_PRESETS } from './data/topologies';
import { NETWORK_CHALLENGES } from './data/challenges';
import { findShortestPath } from './utils/routing';
import { NetworkCanvas } from './components/NetworkCanvas';
import { TopologyControls } from './components/TopologyControls';
import { NetworkConsole } from './components/NetworkConsole';
import { OsiSimulator } from './components/OsiSimulator';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { NetworkChallenges } from './components/NetworkChallenges';
import confetti from 'canvas-confetti';
import {
  Network,
  Share2,
  HelpCircle,
  BarChart3,
  Layers,
  Award,
  Sliders,
  Cpu,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeMainTab, setActiveMainTab] = useState<'topologies' | 'osi' | 'comparison' | 'challenges'>('topologies');

  // Topology state
  const [currentTopology, setCurrentTopology] = useState<NetworkTopologyType>('star');
  const [nodes, setNodes] = useState<NetworkNode[]>(() => [...TOPOLOGY_PRESETS.star.nodes]);
  const [links, setLinks] = useState<NetworkLink[]>(() => [...TOPOLOGY_PRESETS.star.links]);

  // Node selection for packet sending
  const [selectedSourceId, setSelectedSourceId] = useState<string>('pc1');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('pc2');
  const [protocol, setProtocol] = useState<PacketProtocol>('ICMP');

  // Simulation & Animation state
  const [activePackets, setActivePackets] = useState<ActivePacket[]>([]);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isContinuousTraffic, setIsContinuousTraffic] = useState<boolean>(false);

  // Statistics
  const [stats, setStats] = useState<NetworkStats>({
    packetsSent: 0,
    packetsDelivered: 0,
    packetsDropped: 0,
    collisionsDetected: 0,
    averageLatency: 14
  });

  // Event Logs
  const [logs, setLogs] = useState<NetworkLog[]>(() => [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      protocol: 'SYSTEM',
      message: 'Laboratoire de réseaux initialisé. Modèle par défaut : Topologie en Étoile (Star).'
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      protocol: 'STP',
      message: 'Spanning Tree Protocol (STP) actif : tous les ports de commutation sont à l’état FORWARDING.'
    }
  ]);

  // Challenge tracking
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);
  const [lastDeliveredPacket, setLastDeliveredPacket] = useState<ActivePacket | undefined>(undefined);

  const addLog = useCallback((
    level: NetworkLog['level'],
    protocol: NetworkLog['protocol'],
    message: string
  ) => {
    const newLog: NetworkLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      protocol,
      message
    };
    setLogs(prev => [newLog, ...prev.slice(0, 79)]); // Keep last 80 logs
  }, []);

  // Change topology preset
  const handleChangeTopology = (type: NetworkTopologyType) => {
    const preset = TOPOLOGY_PRESETS[type];
    setCurrentTopology(type);
    setNodes(preset.nodes.map(n => ({ ...n })));
    setLinks(preset.links.map(l => ({ ...l })));
    setActivePackets([]);
    setIsContinuousTraffic(false);

    // Pick reasonable default source/target
    if (preset.nodes.length >= 2) {
      setSelectedSourceId(preset.nodes[0].id);
      setSelectedTargetId(preset.nodes[1].id);
    }

    addLog('info', 'SYSTEM', `Basculement vers la topologie : ${preset.frenchName}`);
  };

  // Node position update (Drag & Drop)
  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
  };

  // Toggle link status (Cable cut / repair)
  const handleToggleLink = (linkId: string) => {
    setLinks(prev => prev.map(l => {
      if (l.id === linkId) {
        const nextStatus = l.status === 'broken' ? 'active' : 'broken';
        const sourceNode = nodes.find(n => n.id === l.source)?.name || l.source;
        const targetNode = nodes.find(n => n.id === l.target)?.name || l.target;

        if (nextStatus === 'broken') {
          addLog('error', 'SYSTEM', `Liaison physique COUPÉE entre ${sourceNode} et ${targetNode} (Perte de signal).`);
        } else {
          addLog('success', 'SYSTEM', `Liaison physique RÉTABLIE entre ${sourceNode} et ${targetNode} (Signal UP).`);
        }

        return { ...l, status: nextStatus };
      }
      return l;
    }));
  };

  // Toggle node status (Power down / up)
  const handleToggleNodeStatus = (nodeId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const nextStatus = n.status === 'offline' ? 'online' : 'offline';
        if (nextStatus === 'offline') {
          addLog('error', 'SYSTEM', `Panne matérielle : Le nœud ${n.name} (${n.ip}) est HORS LIGNE.`);
        } else {
          addLog('success', 'SYSTEM', `Redémarrage réussi : Le nœud ${n.name} (${n.ip}) est à nouveau EN LIGNE.`);
        }
        return { ...n, status: nextStatus };
      }
      return n;
    }));
  };

  // Select node by clicking on canvas
  const handleSelectNode = (nodeId: string) => {
    if (nodeId === selectedSourceId) {
      // do nothing or toggle
      return;
    }
    if (selectedSourceId && !selectedTargetId) {
      setSelectedTargetId(nodeId);
    } else {
      setSelectedSourceId(nodeId);
    }
  };

  // Reset all failures
  const handleResetFailures = () => {
    setNodes(prev => prev.map(n => ({ ...n, status: 'online' })));
    setLinks(prev => prev.map(l => ({ ...l, status: 'active' })));
    setActivePackets([]);
    addLog('info', 'SYSTEM', 'Tous les nœuds et câbles réseau ont été réinitialisés à l’état nominal.');
  };

  // Custom node adder for Sandbox mode
  const handleAddCustomNode = (type: NodeType) => {
    const nextIdx = nodes.length + 1;
    const names: Record<NodeType, string> = {
      pc: `Poste-${nextIdx}`,
      switch: `Switch-${nextIdx}`,
      router: `Routeur-${nextIdx}`,
      server: `Serveur-${nextIdx}`,
    };

    const newNode: NetworkNode = {
      id: `custom_${type}_${Date.now()}`,
      name: names[type],
      type,
      ip: `192.168.99.${nextIdx}`,
      mac: `52:54:00:99:99:${nextIdx.toString(16).padStart(2, '0')}`,
      x: 350 + (Math.random() * 80 - 40),
      y: 250 + (Math.random() * 80 - 40),
      status: 'online',
      role: 'Équipement personnalisé'
    };

    // Auto connect to nearest node if available
    let newLink: NetworkLink | null = null;
    if (nodes.length > 0) {
      const parent = nodes[nodes.length - 1];
      newLink = {
        id: `l_custom_${newNode.id}_${parent.id}`,
        source: parent.id,
        target: newNode.id,
        bandwidthMbps: 1000,
        latencyMs: 3,
        status: 'active'
      };
    }

    setNodes(prev => [...prev, newNode]);
    if (newLink) {
      setLinks(prev => [...prev, newLink]);
    }
    addLog('info', 'SYSTEM', `Ajout d'un nouvel équipement : ${newNode.name} (${newNode.ip})`);
  };

  // Packet Transmission logic
  const handleSendPacket = (isEchoReply: boolean = false, overrideSource?: string, overrideTarget?: string) => {
    const srcId = overrideSource || selectedSourceId;
    const tgtId = overrideTarget || selectedTargetId;

    if (!srcId || !tgtId) {
      addLog('warning', 'SYSTEM', 'Veuillez sélectionner une source et une cible.');
      return;
    }

    if (srcId === tgtId) {
      addLog('warning', 'SYSTEM', 'La source et la destination doivent être différentes.');
      return;
    }

    const srcNode = nodes.find(n => n.id === srcId);
    const tgtNode = nodes.find(n => n.id === tgtId);

    if (!srcNode || !tgtNode) return;

    // Check collision on bus topology
    if (currentTopology === 'bus' && activePackets.length > 0) {
      // Multiple active packets on a single bus trigger collision
      setStats(prev => ({
        ...prev,
        packetsSent: prev.packetsSent + 1,
        packetsDropped: prev.packetsDropped + 1,
        collisionsDetected: prev.collisionsDetected + 1
      }));
      addLog('error', 'CSMA', `[COLLISION CSMA/CD DÉTECTÉE !] Deux trames ont été émises simultanément sur le câble coaxial partagé. Les paquets sont détruits. Procédure de Backoff exponentiel engagée.`);
      setActivePackets([]);
      return;
    }

    setStats(prev => ({ ...prev, packetsSent: prev.packetsSent + 1 }));

    // Find shortest path using routing table
    const route = findShortestPath(nodes, links, srcId, tgtId);

    if (!route.reachable || route.path.length < 2) {
      setStats(prev => ({ ...prev, packetsDropped: prev.packetsDropped + 1 }));
      addLog(
        'error',
        protocol,
        `Échec d'envoi vers ${tgtNode.name} (${tgtNode.ip}) : ${route.reason || 'Chemin inaccessible'}`
      );
      return;
    }

    // Packet creation
    const protocolColors: Record<PacketProtocol, string> = {
      ICMP: '#34d399',
      HTTP: '#38bdf8',
      TCP: '#818cf8',
      UDP: '#fbbf24',
      ARP: '#c084fc',
    };

    const newPacket: ActivePacket = {
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      sourceId: srcId,
      targetId: tgtId,
      path: route.path,
      currentPathIndex: 0,
      progress: 0,
      protocol,
      payload: protocol === 'HTTP' ? 'GET /api' : protocol === 'ICMP' ? 'Echo Req' : 'Data',
      status: 'in-flight',
      speed: 0.015 * simSpeed,
      color: protocolColors[protocol],
      ttl: 64
    };

    const pathNames = route.path.map(id => nodes.find(n => n.id === id)?.name || id).join(' → ');
    addLog(
      'info',
      protocol,
      `Émission de ${srcNode.name} vers ${tgtNode.name} via [${pathNames}] (Latence estimée : ${route.totalLatency}ms)`
    );

    setActivePackets(prev => [...prev, newPacket]);
  };

  // Broadcast to all other nodes
  const handleTriggerBroadcast = () => {
    const srcNode = nodes.find(n => n.id === selectedSourceId) || nodes[0];
    const targets = nodes.filter(n => n.id !== srcNode.id && n.status === 'online');

    addLog('warning', 'ARP', `[BROADCAST ARP] ${srcNode.name} diffuse une trame à l'adresse MAC FF:FF:FF:FF:FF:FF sur tout le segment.`);

    targets.forEach((tgt, index) => {
      setTimeout(() => {
        handleSendPacket(false, srcNode.id, tgt.id);
      }, index * 200);
    });
  };

  // Animation Loop for In-Flight Packets
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setActivePackets(prevPackets => {
        if (prevPackets.length === 0) return prevPackets;

        const updatedPackets: ActivePacket[] = [];

        for (const packet of prevPackets) {
          const newProgress = packet.progress + packet.speed * simSpeed;

          if (newProgress >= 1) {
            // Segment finished
            const nextSegmentIndex = packet.currentPathIndex + 1;

            if (nextSegmentIndex < packet.path.length - 1) {
              // Move to next segment along path
              const currentNodeId = packet.path[nextSegmentIndex];
              const currentNode = nodes.find(n => n.id === currentNodeId);
              addLog('info', packet.protocol, `Paquet commuté par ${currentNode?.name || currentNodeId} (Transit L2/L3)`);

              updatedPackets.push({
                ...packet,
                currentPathIndex: nextSegmentIndex,
                progress: 0
              });
            } else {
              // Packet reached ultimate destination!
              const targetNode = nodes.find(n => n.id === packet.targetId);
              addLog('success', packet.protocol, `Paquet délivré avec succès à ${targetNode?.name || packet.targetId} (${targetNode?.ip}).`);

              const deliveredPacket: ActivePacket = {
                ...packet,
                status: 'delivered',
                progress: 1
              };

              setLastDeliveredPacket(deliveredPacket);
              setStats(prev => ({
                ...prev,
                packetsDelivered: prev.packetsDelivered + 1
              }));
            }
          } else {
            updatedPackets.push({
              ...packet,
              progress: newProgress
            });
          }
        }

        return updatedPackets;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [simSpeed, nodes, addLog]);

  // Check challenges completion whenever state changes
  useEffect(() => {
    if (!lastDeliveredPacket) return;

    NETWORK_CHALLENGES.forEach(ch => {
      if (!completedChallengeIds.includes(ch.id) && ch.topology === currentTopology) {
        const isPassed = ch.validate({
          stats,
          links,
          nodes,
          lastDeliveredPacket
        });

        if (isPassed) {
          setCompletedChallengeIds(prev => [...prev, ch.id]);
          addLog('success', 'SYSTEM', `🎉 FÉLICITATIONS ! Défi validé : "${ch.title}" !`);
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch (e) {
            // ignore
          }
        }
      }
    });
  }, [lastDeliveredPacket, stats, links, nodes, currentTopology, completedChallengeIds, addLog]);

  // Continuous traffic generator interval
  useEffect(() => {
    if (!isContinuousTraffic) return;

    const interval = setInterval(() => {
      if (nodes.length < 2) return;
      const onlineNodes = nodes.filter(n => n.status === 'online');
      if (onlineNodes.length < 2) return;

      const randomSrc = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
      let randomTgt = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
      while (randomTgt.id === randomSrc.id) {
        randomTgt = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
      }

      const protos: PacketProtocol[] = ['ICMP', 'HTTP', 'TCP', 'UDP'];
      const randProto = protos[Math.floor(Math.random() * protos.length)];

      handleSendPacket(false, randomSrc.id, randomTgt.id);
    }, 1800 / simSpeed);

    return () => clearInterval(interval);
  }, [isContinuousTraffic, nodes, simSpeed]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                Simulateur de Modèles Réseaux
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Laboratoire Interactif
                </span>
              </h1>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Topologies physiques (Étoile, Maillé, Bus, Anneau) & Modèles OSI / TCP-IP
              </p>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveMainTab('topologies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeMainTab === 'topologies'
                  ? 'bg-sky-500 text-zinc-950 font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Topologies Réseau</span>
            </button>

            <button
              onClick={() => setActiveMainTab('osi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeMainTab === 'osi'
                  ? 'bg-sky-500 text-zinc-950 font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Modèle OSI & TCP/IP</span>
            </button>

            <button
              onClick={() => setActiveMainTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeMainTab === 'comparison'
                  ? 'bg-sky-500 text-zinc-950 font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Comparatif</span>
            </button>

            <button
              onClick={() => setActiveMainTab('challenges')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeMainTab === 'challenges'
                  ? 'bg-sky-500 text-zinc-950 font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Défis / Lab</span>
              {completedChallengeIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                  {completedChallengeIds.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* VIEW 1: TOPOLOGIES & GRAPH SIMULATOR */}
        {activeMainTab === 'topologies' && (
          <div className="space-y-6">
            {/* Top Controls Bar */}
            <TopologyControls
              currentTopology={currentTopology}
              onChangeTopology={handleChangeTopology}
              nodes={nodes}
              selectedSourceId={selectedSourceId}
              selectedTargetId={selectedTargetId}
              onSelectSource={setSelectedSourceId}
              onSelectTarget={setSelectedTargetId}
              protocol={protocol}
              onChangeProtocol={setProtocol}
              onSendPacket={handleSendPacket}
              onStartContinuousTraffic={() => setIsContinuousTraffic(prev => !prev)}
              isContinuousTraffic={isContinuousTraffic}
              onResetFailures={handleResetFailures}
              simSpeed={simSpeed}
              onChangeSpeed={setSimSpeed}
              onTriggerBroadcast={handleTriggerBroadcast}
            />

            {/* Interactive Graph Canvas */}
            <div className="relative">
              <NetworkCanvas
                nodes={nodes}
                links={links}
                activePackets={activePackets}
                selectedSourceId={selectedSourceId}
                selectedTargetId={selectedTargetId}
                onSelectNode={handleSelectNode}
                onToggleLink={handleToggleLink}
                onToggleNodeStatus={handleToggleNodeStatus}
                onUpdateNodePosition={handleUpdateNodePosition}
                onAddCustomNode={handleAddCustomNode}
                isCustomMode={currentTopology === 'custom'}
              />
            </div>

            {/* Real-time Network Console & Packet Inspector */}
            <NetworkConsole
              logs={logs}
              stats={stats}
              onClearLogs={() => setLogs([])}
            />
          </div>
        )}

        {/* VIEW 2: OSI / TCP-IP ENCAPSULATION SIMULATOR */}
        {activeMainTab === 'osi' && (
          <div className="space-y-6">
            <OsiSimulator />
          </div>
        )}

        {/* VIEW 3: ARCHITECTURE COMPARISON MATRIX */}
        {activeMainTab === 'comparison' && (
          <div className="space-y-6">
            <ComparisonMatrix
              onSelectTopology={(topo) => {
                handleChangeTopology(topo);
                setActiveMainTab('topologies');
              }}
            />
          </div>
        )}

        {/* VIEW 4: PRACTICAL LAB CHALLENGES */}
        {activeMainTab === 'challenges' && (
          <div className="space-y-6">
            <NetworkChallenges
              onLoadChallengeTopology={(topo) => {
                handleChangeTopology(topo);
                setActiveMainTab('topologies');
              }}
              completedChallengeIds={completedChallengeIds}
              onChallengeCompleted={(id) => {
                if (!completedChallengeIds.includes(id)) {
                  setCompletedChallengeIds(prev => [...prev, id]);
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NetLab Simulator • Outil pédagogique et interactif de modélisation et simulation de réseaux</span>
          <span className="font-mono text-zinc-400">Modèles OSI & TCP/IP • Topologies Étoile, Maillé, Anneau, Bus, Arbre</span>
        </div>
      </footer>
    </div>
  );
}

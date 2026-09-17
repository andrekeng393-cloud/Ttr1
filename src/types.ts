export type NetworkTopologyType = 'star' | 'mesh' | 'ring' | 'bus' | 'tree' | 'custom';

export type NodeType = 'pc' | 'switch' | 'router' | 'server';

export type PacketProtocol = 'ICMP' | 'HTTP' | 'TCP' | 'UDP' | 'ARP';

export interface NetworkNode {
  id: string;
  name: string;
  type: NodeType;
  ip: string;
  mac: string;
  x: number;
  y: number;
  status: 'online' | 'offline' | 'busy' | 'fault';
  role?: string;
  description?: string;
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  bandwidthMbps: number;
  latencyMs: number;
  status: 'active' | 'broken' | 'congested';
}

export interface ActivePacket {
  id: string;
  sourceId: string;
  targetId: string;
  path: string[]; // list of node IDs
  currentPathIndex: number; // current segment index
  progress: number; // 0 to 1 between path[currentPathIndex] and path[currentPathIndex + 1]
  protocol: PacketProtocol;
  payload: string;
  status: 'in-flight' | 'delivered' | 'dropped' | 'collision';
  speed: number;
  color: string;
  ttl: number;
}

export interface NetworkLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  protocol: PacketProtocol | 'SYSTEM' | 'STP' | 'CSMA';
  source?: string;
  destination?: string;
  message: string;
  details?: {
    layer?: string;
    pdu?: string;
    headerInfo?: Record<string, string>;
  };
}

export interface NetworkStats {
  packetsSent: number;
  packetsDelivered: number;
  packetsDropped: number;
  collisionsDetected: number;
  averageLatency: number;
}

export interface OsiLayerInfo {
  number: number;
  name: string;
  frenchName: string;
  tcpEquivalent: string;
  pdu: string;
  protocols: string[];
  devices: string[];
  description: string;
  headerName: string;
  sampleHeaderFields: Record<string, string>;
}

export interface NetworkChallenge {
  id: string;
  title: string;
  difficulty: 'Facile' | 'Intermédiaire' | 'Avancé';
  topology: NetworkTopologyType;
  description: string;
  goalDescription: string;
  setupAction?: {
    breakLinks?: string[];
    offlineNodes?: string[];
  };
  validate: (state: {
    stats: NetworkStats;
    links: NetworkLink[];
    nodes: NetworkNode[];
    lastDeliveredPacket?: ActivePacket;
  }) => boolean;
  hint: string;
  explanation: string;
}

import { NetworkNode, NetworkLink } from '../types';

export interface RouteResult {
  path: string[];
  totalLatency: number;
  reachable: boolean;
  reason?: string;
}

/**
 * Computes shortest path using Dijkstra algorithm
 * Only traverses active links and online nodes
 */
export function findShortestPath(
  nodes: NetworkNode[],
  links: NetworkLink[],
  sourceId: string,
  targetId: string
): RouteResult {
  if (sourceId === targetId) {
    return { path: [sourceId], totalLatency: 0, reachable: true };
  }

  const nodeMap = new Map<string, NetworkNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const sourceNode = nodeMap.get(sourceId);
  const targetNode = nodeMap.get(targetId);

  if (!sourceNode || sourceNode.status === 'offline') {
    return { path: [], totalLatency: 0, reachable: false, reason: 'Le nœud source est hors ligne ou introuvable.' };
  }
  if (!targetNode || targetNode.status === 'offline') {
    return { path: [], totalLatency: 0, reachable: false, reason: 'Le nœud de destination est hors ligne ou introuvable.' };
  }

  // Build adjacency list with active links
  const adj = new Map<string, { neighborId: string; weight: number; linkId: string }[]>();
  nodes.forEach(n => adj.set(n.id, []));

  links.forEach(link => {
    if (link.status !== 'active') return;
    const sNode = nodeMap.get(link.source);
    const tNode = nodeMap.get(link.target);
    if (!sNode || !tNode || sNode.status === 'offline' || tNode.status === 'offline') return;

    const weight = link.latencyMs;
    adj.get(link.source)?.push({ neighborId: link.target, weight, linkId: link.id });
    adj.get(link.target)?.push({ neighborId: link.source, weight, linkId: link.id });
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  nodes.forEach(n => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  });

  distances.set(sourceId, 0);

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let smallestDist = Infinity;

    unvisited.forEach(nodeId => {
      const dist = distances.get(nodeId)!;
      if (dist < smallestDist) {
        smallestDist = dist;
        currentId = nodeId;
      }
    });

    if (currentId === null || smallestDist === Infinity) {
      break; // Remaining nodes are unreachable
    }

    if (currentId === targetId) {
      break; // Found destination
    }

    unvisited.delete(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.neighborId)) continue;
      const alt = smallestDist + edge.weight;
      if (alt < distances.get(edge.neighborId)!) {
        distances.set(edge.neighborId, alt);
        previous.set(edge.neighborId, currentId);
      }
    }
  }

  const destDist = distances.get(targetId);
  if (destDist === undefined || destDist === Infinity) {
    return {
      path: [],
      totalLatency: 0,
      reachable: false,
      reason: 'Aucun chemin physique actif ne relie la source et la destination (câble coupé ou switch intermédiaire hors-service).'
    };
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = targetId;
  while (curr) {
    path.unshift(curr);
    curr = previous.get(curr) || null;
  }

  return {
    path,
    totalLatency: destDist,
    reachable: true
  };
}

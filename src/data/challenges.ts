import { NetworkChallenge } from '../types';

export const NETWORK_CHALLENGES: NetworkChallenge[] = [
  {
    id: 'mesh_resilience',
    title: 'Résilience et Re-routage en Réseau Maillé',
    difficulty: 'Facile',
    topology: 'mesh',
    description: 'Dans un réseau maillé (Full Mesh), la redondance garantit que si une liaison tombe en panne, le trafic est instantanément re-routé sans coupure de service.',
    goalDescription: '1. Coupez le câble direct entre Routeur-Paris (r1) et Routeur-Rennes (r5) en cliquant dessus.\n2. Envoyez un paquet de Routeur-Paris vers Routeur-Rennes.\n3. Constatez que le paquet emprunte avec succès un chemin de secours (ex: via Lyon ou Bordeaux).',
    hint: 'Cliquez directement sur le câble orange/bleu entre Paris et Rennes sur le canevas pour simuler une coupure de fibre optique (il passera en rouge pointillé).',
    validate: (state) => {
      const directLink = state.links.find(
        l => (l.source === 'r1' && l.target === 'r5') || (l.source === 'r5' && l.target === 'r1')
      );
      const isBroken = directLink && directLink.status === 'broken';
      const lastP = state.lastDeliveredPacket;
      const successPacket = lastP && lastP.status === 'delivered' &&
        ((lastP.sourceId === 'r1' && lastP.targetId === 'r5') || (lastP.sourceId === 'r5' && lastP.targetId === 'r1')) &&
        lastP.path.length > 2; // took an alternate route of at least 3 nodes
      return Boolean(isBroken && successPacket);
    },
    explanation: 'Bravo ! Grâce au maillage complet et au calcul dynamique de plus court chemin (type OSPF/IS-IS), la coupure physique du lien direct n’a pas interrompu la connectivité : le paquet a transité par un routeur relais.'
  },
  {
    id: 'star_spof',
    title: 'Le Point Unique de Défaillance (SPOF) en Étoile',
    difficulty: 'Facile',
    topology: 'star',
    description: 'La topologie en étoile concentre tous les échanges sur le commutateur central (Switch-Core). Testez l’impact d’une panne matérielle du switch sur l’ensemble du réseau.',
    goalDescription: '1. Cliquez sur le Switch-Core pour l’éteindre (statut Offline / Rouge).\n2. Tentez d’envoyer un paquet (il sera immédiatement bloqué).\n3. Rallumez le switch (Online) et renvoyez un paquet avec succès.',
    hint: 'Cliquez directement sur le Switch-Core sur le schéma pour basculer son alimentation (En ligne / Hors ligne).',
    validate: (state) => {
      const sw = state.nodes.find(n => n.id === 'sw1');
      const isOnlineNow = sw && sw.status === 'online';
      const delivered = state.lastDeliveredPacket && state.lastDeliveredPacket.status === 'delivered';
      const droppedCount = state.stats.packetsDropped >= 1;
      return Boolean(isOnlineNow && droppedCount && delivered);
    },
    explanation: 'Parfait ! Vous avez expérimenté le point de vulnérabilité majeur de l’étoile : si le switch central s’arrête, aucun poste ne peut plus communiquer, même si tous les ordinateurs fonctionnent.'
  },
  {
    id: 'tree_inter_branch',
    title: 'Routage Inter-Bâtiments en Arbre',
    difficulty: 'Intermédiaire',
    topology: 'tree',
    description: 'Dans une architecture hiérarchique d’entreprise (Tree), les échanges entre deux sous-réseaux ou bâtiments différents doivent remonter jusqu’au niveau supérieur (Core).',
    goalDescription: 'Transmettez une requête depuis PC-Compta (Bâtiment A) vers le Serveur-BDD (Bâtiment B).',
    hint: 'Sélectionnez PC-Compta comme source et Serveur-BDD comme destination, puis cliquez sur "Émettre le Paquet".',
    validate: (state) => {
      const lastP = state.lastDeliveredPacket;
      if (!lastP || lastP.status !== 'delivered') return false;
      return (
        lastP.sourceId === 'tr_pc1' &&
        lastP.targetId === 'tr_srv' &&
        lastP.path.includes('tr_core')
      );
    },
    explanation: 'Excellent ! Le paquet a remonté la distribution A (Switch-Dist-BâtimentA), a franchi le Routeur-Core dorsal, puis est redescendu via la distribution B jusqu’au serveur de base de données.'
  },
  {
    id: 'bus_shared_medium',
    title: 'Diffusion et Partage de Média en Bus',
    difficulty: 'Intermédiaire',
    topology: 'bus',
    description: 'Dans une topologie en bus, le câble coaxial est un support de transmission partagé (Domaine de collision unique).',
    goalDescription: 'Envoyez un paquet entre Station-A et Station-C sur le bus coaxial.',
    hint: 'Sélectionnez Station-A et Station-C, choisissez le protocole HTTP ou ICMP et observez la propagation le long du câble dorsal.',
    validate: (state) => {
      const lastP = state.lastDeliveredPacket;
      if (!lastP || lastP.status !== 'delivered') return false;
      return (
        (lastP.sourceId === 'bn1' && lastP.targetId === 'bn3') ||
        (lastP.sourceId === 'bn3' && lastP.targetId === 'bn1')
      );
    },
    explanation: 'Très bien ! Sur un bus, le signal se propage aux deux extrémités jusqu’aux bouchons de terminaison qui absorbent l’onde pour éviter les échos parasites.'
  }
];

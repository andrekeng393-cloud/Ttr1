import { NetworkNode, NetworkLink, NetworkTopologyType } from '../types';

export interface TopologyData {
  name: string;
  frenchName: string;
  type: NetworkTopologyType;
  description: string;
  pros: string[];
  cons: string[];
  bestUseCases: string;
  cablingCost: 'Faible' | 'Moyen' | 'Élevé' | 'Très Élevé' | 'Variable';
  faultTolerance: 'Faible' | 'Moyenne' | 'Élevée' | 'Maximale' | 'Configurable';
  scalability: 'Faible' | 'Moyenne' | 'Élevée' | 'Très Élevée' | 'Illimitée';
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export const TOPOLOGY_PRESETS: Record<NetworkTopologyType, TopologyData> = {
  star: {
    name: 'Star Topology',
    frenchName: 'Topologie en Étoile',
    type: 'star',
    description: 'Tous les hôtes sont connectés indépendamment à un nœud central (commutateur/switch ou hub). Modèle standard des réseaux locaux LAN modernes.',
    pros: [
      'Facile à installer et à câbler',
      'Une panne d’un câble client n’affecte pas les autres nœuds',
      'Facile à diagnostiquer et administrer via le commutateur'
    ],
    cons: [
      'Point de défaillance unique (Single Point of Failure) : si le switch central tombe, tout le réseau s’arrête',
      'Nécessite plus de longueur de câble qu’un bus'
    ],
    bestUseCases: 'Bureaux, réseaux domestiques (Box Internet), salles de classe, réseaux LAN modernes.',
    cablingCost: 'Moyen',
    faultTolerance: 'Moyenne',
    scalability: 'Élevée',
    nodes: [
      { id: 'sw1', name: 'Switch-Core', type: 'switch', ip: '192.168.1.1', mac: '00:1A:2B:3C:4D:01', x: 400, y: 250, status: 'online', role: 'Nœud Central (Switch Gigabit)' },
      { id: 'pc1', name: 'PC-Finance', type: 'pc', ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:10', x: 220, y: 130, status: 'online', role: 'Client' },
      { id: 'pc2', name: 'PC-Marketing', type: 'pc', ip: '192.168.1.11', mac: '00:1A:2B:3C:4D:11', x: 580, y: 130, status: 'online', role: 'Client' },
      { id: 'pc3', name: 'PC-Dev', type: 'pc', ip: '192.168.1.12', mac: '00:1A:2B:3C:4D:12', x: 180, y: 340, status: 'online', role: 'Client' },
      { id: 'pc4', name: 'PC-RH', type: 'pc', ip: '192.168.1.13', mac: '00:1A:2B:3C:4D:13', x: 400, y: 430, status: 'online', role: 'Client' },
      { id: 'srv1', name: 'Serveur-Web', type: 'server', ip: '192.168.1.200', mac: '00:1A:2B:3C:4D:FE', x: 620, y: 340, status: 'online', role: 'Serveur Intranet' },
    ],
    links: [
      { id: 'l_sw_pc1', source: 'sw1', target: 'pc1', bandwidthMbps: 1000, latencyMs: 2, status: 'active' },
      { id: 'l_sw_pc2', source: 'sw1', target: 'pc2', bandwidthMbps: 1000, latencyMs: 2, status: 'active' },
      { id: 'l_sw_pc3', source: 'sw1', target: 'pc3', bandwidthMbps: 1000, latencyMs: 2, status: 'active' },
      { id: 'l_sw_pc4', source: 'sw1', target: 'pc4', bandwidthMbps: 1000, latencyMs: 2, status: 'active' },
      { id: 'l_sw_srv1', source: 'sw1', target: 'srv1', bandwidthMbps: 10000, latencyMs: 1, status: 'active' },
    ]
  },
  mesh: {
    name: 'Mesh Topology',
    frenchName: 'Topologie Maillée (Full Mesh)',
    type: 'mesh',
    description: 'Chaque nœud est interconnecté avec plusieurs autres nœuds (ou tous). Offre de multiples chemins redondants grâce aux protocoles de routage dynamique.',
    pros: [
      'Résilience extrême : aucun point de défaillance unique',
      'Routage alternatif instantané en cas de coupure de lien ou nœud',
      'Excellente gestion du trafic réparti'
    ],
    cons: [
      'Coût de câblage et complexité très élevés (N*(N-1)/2 liens)',
      'Nécessite des interfaces réseaux multiples par équipement'
    ],
    bestUseCases: 'Backbone Internet, Datacenters critiques, réseaux militaires, réseaux de télécommunication 4G/5G.',
    cablingCost: 'Très Élevé',
    faultTolerance: 'Maximale',
    scalability: 'Moyenne',
    nodes: [
      { id: 'r1', name: 'Routeur-Paris', type: 'router', ip: '10.0.1.1', mac: '52:54:00:12:34:01', x: 400, y: 90, status: 'online', role: 'Nœud Nord' },
      { id: 'r2', name: 'Routeur-Lyon', type: 'router', ip: '10.0.2.1', mac: '52:54:00:12:34:02', x: 630, y: 200, status: 'online', role: 'Nœud Est' },
      { id: 'r3', name: 'Routeur-Marseille', type: 'router', ip: '10.0.3.1', mac: '52:54:00:12:34:03', x: 550, y: 410, status: 'online', role: 'Nœud Sud-Est' },
      { id: 'r4', name: 'Routeur-Bordeaux', type: 'router', ip: '10.0.4.1', mac: '52:54:00:12:34:04', x: 250, y: 410, status: 'online', role: 'Nœud Sud-Ouest' },
      { id: 'r5', name: 'Routeur-Rennes', type: 'router', ip: '10.0.5.1', mac: '52:54:00:12:34:05', x: 170, y: 200, status: 'online', role: 'Nœud Ouest' },
    ],
    links: [
      // Full mesh between 5 routers
      { id: 'l_r1_r2', source: 'r1', target: 'r2', bandwidthMbps: 10000, latencyMs: 5, status: 'active' },
      { id: 'l_r1_r3', source: 'r1', target: 'r3', bandwidthMbps: 10000, latencyMs: 9, status: 'active' },
      { id: 'l_r1_r4', source: 'r1', target: 'r4', bandwidthMbps: 10000, latencyMs: 8, status: 'active' },
      { id: 'l_r1_r5', source: 'r1', target: 'r5', bandwidthMbps: 10000, latencyMs: 4, status: 'active' },
      { id: 'l_r2_r3', source: 'r2', target: 'r3', bandwidthMbps: 10000, latencyMs: 4, status: 'active' },
      { id: 'l_r2_r4', source: 'r2', target: 'r4', bandwidthMbps: 10000, latencyMs: 11, status: 'active' },
      { id: 'l_r2_r5', source: 'r2', target: 'r5', bandwidthMbps: 10000, latencyMs: 7, status: 'active' },
      { id: 'l_r3_r4', source: 'r3', target: 'r4', bandwidthMbps: 10000, latencyMs: 6, status: 'active' },
      { id: 'l_r3_r5', source: 'r3', target: 'r5', bandwidthMbps: 10000, latencyMs: 10, status: 'active' },
      { id: 'l_r4_r5', source: 'r4', target: 'r5', bandwidthMbps: 10000, latencyMs: 5, status: 'active' },
    ]
  },
  ring: {
    name: 'Ring Topology',
    frenchName: 'Topologie en Anneau (Ring / Token Ring)',
    type: 'ring',
    description: 'Chaque nœud est relié exactement à deux voisins, formant une boucle fermée unidirectionnelle ou bidirectionnelle (FDDI/Token Ring).',
    pros: [
      'Gestion ordonnée du trafic : pas de collision grâce au passage de jeton (Token)',
      'Débit prévisible même sous forte charge',
      'Câblage structuré en boucle'
    ],
    cons: [
      'Coupure de l’anneau si un nœud tombe en anneau simple',
      'Délai de transit dépendant du nombre de nœuds traversés'
    ],
    bestUseCases: 'Réseaux industriels automatisés, réseaux FDDI en fibre optique, anciennes architectures IBM Token Ring, métros et trains.',
    cablingCost: 'Moyen',
    faultTolerance: 'Faible',
    scalability: 'Faible',
    nodes: [
      { id: 'rn1', name: 'Poste-A', type: 'pc', ip: '172.16.0.10', mac: '00:50:56:C0:00:01', x: 400, y: 100, status: 'online', role: 'Station 1' },
      { id: 'rn2', name: 'Poste-B', type: 'pc', ip: '172.16.0.11', mac: '00:50:56:C0:00:02', x: 620, y: 220, status: 'online', role: 'Station 2' },
      { id: 'rn3', name: 'Poste-C', type: 'server', ip: '172.16.0.12', mac: '00:50:56:C0:00:03', x: 530, y: 430, status: 'online', role: 'Station 3' },
      { id: 'rn4', name: 'Poste-D', type: 'pc', ip: '172.16.0.13', mac: '00:50:56:C0:00:04', x: 270, y: 430, status: 'online', role: 'Station 4' },
      { id: 'rn5', name: 'Poste-E', type: 'pc', ip: '172.16.0.14', mac: '00:50:56:C0:00:05', x: 180, y: 220, status: 'online', role: 'Station 5' },
    ],
    links: [
      { id: 'l_rn1_rn2', source: 'rn1', target: 'rn2', bandwidthMbps: 100, latencyMs: 5, status: 'active' },
      { id: 'l_rn2_rn3', source: 'rn2', target: 'rn3', bandwidthMbps: 100, latencyMs: 5, status: 'active' },
      { id: 'l_rn3_rn4', source: 'rn3', target: 'rn4', bandwidthMbps: 100, latencyMs: 5, status: 'active' },
      { id: 'l_rn4_rn5', source: 'rn4', target: 'rn5', bandwidthMbps: 100, latencyMs: 5, status: 'active' },
      { id: 'l_rn5_rn1', source: 'rn5', target: 'rn1', bandwidthMbps: 100, latencyMs: 5, status: 'active' },
    ]
  },
  bus: {
    name: 'Bus Topology',
    frenchName: 'Topologie en Bus (Partagé / Coaxial)',
    type: 'bus',
    description: 'Tous les nœuds sont branchés sur un câble central unique (dorsale ou backbone) terminé par des bouchons de terminaison. Utilise le protocole CSMA/CD pour gérer les collisions.',
    pros: [
      'Très peu de câble nécessaire',
      'Très économique et facile à mettre en place pour petits parcs',
      'Simple pour débuter en réseau'
    ],
    cons: [
      'Risque permanent de collisions si deux stations émettent ensemble',
      'Une rupture du câble dorsal paralyse l’ensemble du bus',
      'Baisse drastique des performances si le nombre d’hôtes augmente'
    ],
    bestUseCases: 'Anciens réseaux 10BASE2/10BASE5 (câbles coaxiaux avec connecteurs BNC), bus de données industriels CAN dans l’automobile.',
    cablingCost: 'Faible',
    faultTolerance: 'Faible',
    scalability: 'Faible',
    nodes: [
      { id: 'bus_t1', name: 'Bouchon-Gauche', type: 'router', ip: '0.0.0.0', mac: '00:00:00:00:00:01', x: 120, y: 250, status: 'online', role: 'Terminaison 50Ω' },
      { id: 'bn1', name: 'Station-A', type: 'pc', ip: '192.168.0.1', mac: '00:11:22:33:44:01', x: 230, y: 120, status: 'online', role: 'Hôte A' },
      { id: 'bn2', name: 'Station-B', type: 'pc', ip: '192.168.0.2', mac: '00:11:22:33:44:02', x: 390, y: 380, status: 'online', role: 'Hôte B' },
      { id: 'bn3', name: 'Station-C', type: 'pc', ip: '192.168.0.3', mac: '00:11:22:33:44:03', x: 550, y: 120, status: 'online', role: 'Hôte C' },
      { id: 'bn4', name: 'Serveur-Partage', type: 'server', ip: '192.168.0.100', mac: '00:11:22:33:44:FE', x: 670, y: 380, status: 'online', role: 'Serveur de fichiers' },
      { id: 'bus_t2', name: 'Bouchon-Droit', type: 'router', ip: '0.0.0.0', mac: '00:00:00:00:00:02', x: 740, y: 250, status: 'online', role: 'Terminaison 50Ω' },
    ],
    links: [
      // Backbone segments
      { id: 'l_bus_seg1', source: 'bus_t1', target: 'bn1', bandwidthMbps: 10, latencyMs: 8, status: 'active' },
      { id: 'l_bus_seg2', source: 'bn1', target: 'bn2', bandwidthMbps: 10, latencyMs: 8, status: 'active' },
      { id: 'l_bus_seg3', source: 'bn2', target: 'bn3', bandwidthMbps: 10, latencyMs: 8, status: 'active' },
      { id: 'l_bus_seg4', source: 'bn3', target: 'bn4', bandwidthMbps: 10, latencyMs: 8, status: 'active' },
      { id: 'l_bus_seg5', source: 'bn4', target: 'bus_t2', bandwidthMbps: 10, latencyMs: 8, status: 'active' },
    ]
  },
  tree: {
    name: 'Tree / Hierarchical Topology',
    frenchName: 'Topologie en Arbre (Hiérarchique)',
    type: 'tree',
    description: 'Structure pyramidale à plusieurs niveaux (Cœur / Distribution / Accès). Combine les principes de l’étoile pour former une infrastructure d’entreprise hautement modulable.',
    pros: [
      'Organisation claire par étages (Core, Distribution, Access)',
      'Segmentation facile des départements (VLANs, sous-réseaux)',
      'Hautement évolutive pour de grands campus'
    ],
    cons: [
      'Si un commutateur de distribution intermédiaire tombe, toute sa branche est coupée',
      'Configuration plus complexe (routage inter-VLAN, agrégation de liens)'
    ],
    bestUseCases: 'Réseaux d’entreprises multisites, universités, hôpitaux, architectures Cisco 3-Tier standard.',
    cablingCost: 'Élevé',
    faultTolerance: 'Moyenne',
    scalability: 'Très Élevée',
    nodes: [
      { id: 'tr_core', name: 'Routeur-Core', type: 'router', ip: '10.10.0.1', mac: 'E8:65:49:10:00:01', x: 400, y: 80, status: 'online', role: 'Cœur de Réseau (Core)' },
      { id: 'tr_dist1', name: 'Switch-Dist-BâtimentA', type: 'switch', ip: '10.10.1.1', mac: 'E8:65:49:20:00:01', x: 250, y: 220, status: 'online', role: 'Distribution A' },
      { id: 'tr_dist2', name: 'Switch-Dist-BâtimentB', type: 'switch', ip: '10.10.2.1', mac: 'E8:65:49:30:00:01', x: 550, y: 220, status: 'online', role: 'Distribution B' },
      { id: 'tr_pc1', name: 'PC-Compta', type: 'pc', ip: '10.10.1.10', mac: 'E8:65:49:20:01:01', x: 170, y: 390, status: 'online', role: 'Poste Bât A' },
      { id: 'tr_pc2', name: 'PC-Design', type: 'pc', ip: '10.10.1.11', mac: 'E8:65:49:20:01:02', x: 310, y: 390, status: 'online', role: 'Poste Bât A' },
      { id: 'tr_pc3', name: 'PC-Ingénierie', type: 'pc', ip: '10.10.2.10', mac: 'E8:65:49:30:01:01', x: 470, y: 390, status: 'online', role: 'Poste Bât B' },
      { id: 'tr_srv', name: 'Serveur-BDD', type: 'server', ip: '10.10.2.100', mac: 'E8:65:49:30:FF:01', x: 630, y: 390, status: 'online', role: 'Base de données' },
    ],
    links: [
      { id: 'l_tree_c_d1', source: 'tr_core', target: 'tr_dist1', bandwidthMbps: 10000, latencyMs: 2, status: 'active' },
      { id: 'l_tree_c_d2', source: 'tr_core', target: 'tr_dist2', bandwidthMbps: 10000, latencyMs: 2, status: 'active' },
      { id: 'l_tree_d1_pc1', source: 'tr_dist1', target: 'tr_pc1', bandwidthMbps: 1000, latencyMs: 3, status: 'active' },
      { id: 'l_tree_d1_pc2', source: 'tr_dist1', target: 'tr_pc2', bandwidthMbps: 1000, latencyMs: 3, status: 'active' },
      { id: 'l_tree_d2_pc3', source: 'tr_dist2', target: 'tr_pc3', bandwidthMbps: 1000, latencyMs: 3, status: 'active' },
      { id: 'l_tree_d2_srv', source: 'tr_dist2', target: 'tr_srv', bandwidthMbps: 10000, latencyMs: 1, status: 'active' },
    ]
  },
  custom: {
    name: 'Custom Sandbox',
    frenchName: 'Bac à Sable Personnalisé (Sandbox)',
    type: 'custom',
    description: 'Concevez votre propre modèle de réseau : ajoutez des ordinateurs, des commutateurs, des routeurs et des serveurs, tracez des câbles et testez la transmission de paquets.',
    pros: [
      'Liberté totale de conception et d’expérimentation',
      'Test immédiat des pannes et du routage',
      'Idéal pour prototyper une maquette d’examen ou d’entreprise'
    ],
    cons: [
      'Nécessite de veiller soi-même à la cohérence de la topologie'
    ],
    bestUseCases: 'Laboratoire de travaux pratiques (TP), simulations personnalisées, prototypage d’architecture.',
    cablingCost: 'Variable',
    faultTolerance: 'Configurable',
    scalability: 'Illimitée',
    nodes: [
      { id: 'c_pc1', name: 'PC-Alpha', type: 'pc', ip: '192.168.10.1', mac: 'CA:FE:BA:BE:00:01', x: 200, y: 180, status: 'online', role: 'Station Émettrice' },
      { id: 'c_sw1', name: 'Switch-1', type: 'switch', ip: '192.168.10.254', mac: 'CA:FE:BA:BE:00:FE', x: 380, y: 180, status: 'online', role: 'Commutateur 1' },
      { id: 'c_r1', name: 'Routeur-Passerelle', type: 'router', ip: '192.168.10.253', mac: 'CA:FE:BA:BE:01:00', x: 480, y: 330, status: 'online', role: 'Passerelle / Gateway' },
      { id: 'c_srv1', name: 'Serveur-Cloud', type: 'server', ip: '8.8.8.8', mac: 'CA:FE:BA:BE:FF:FF', x: 650, y: 330, status: 'online', role: 'Serveur Web distant' },
    ],
    links: [
      { id: 'l_c_pc1_sw1', source: 'c_pc1', target: 'c_sw1', bandwidthMbps: 1000, latencyMs: 2, status: 'active' },
      { id: 'l_c_sw1_r1', source: 'c_sw1', target: 'c_r1', bandwidthMbps: 1000, latencyMs: 5, status: 'active' },
      { id: 'l_c_r1_srv1', source: 'c_r1', target: 'c_srv1', bandwidthMbps: 500, latencyMs: 25, status: 'active' },
    ]
  }
};

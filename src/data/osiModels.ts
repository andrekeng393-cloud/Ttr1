import { OsiLayerInfo } from '../types';

export const OSI_LAYERS: OsiLayerInfo[] = [
  {
    number: 7,
    name: 'Application',
    frenchName: 'Application',
    tcpEquivalent: 'Application',
    pdu: 'Données (Data)',
    protocols: ['HTTP/HTTPS', 'DNS', 'DHCP', 'FTP', 'SSH', 'SMTP'],
    devices: ['Navigateur Web', 'Client Mail', 'Serveur Applicatif'],
    description: 'Interface directe avec les applications utilisateur. Fournit les services réseau aux logiciels (requêtes web, e-mails, transfert de fichiers).',
    headerName: 'En-tête Applicatif (Ex: HTTP Header)',
    sampleHeaderFields: {
      'Méthode': 'GET /index.html HTTP/1.1',
      'Host': 'www.monsite-reseau.fr',
      'User-Agent': 'Mozilla/5.0 (NetLab Simulator v2.0)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Connection': 'keep-alive'
    }
  },
  {
    number: 6,
    name: 'Presentation',
    frenchName: 'Présentation',
    tcpEquivalent: 'Application',
    pdu: 'Données (Data)',
    protocols: ['TLS/SSL', 'ASCII', 'UTF-8', 'JPEG', 'JSON', 'MIME'],
    devices: ['Bibliothèques de chiffrement', 'Moteurs de sérialisation'],
    description: 'Traduction, formatage, compression et chiffrement/déchiffrement des données pour qu’elles soient compréhensibles par les deux extrémités.',
    headerName: 'En-tête de Présentation / TLS Record',
    sampleHeaderFields: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Encoding': 'gzip (Compressé)',
      'Security-Layer': 'TLS 1.3 (Cipher: AES_256_GCM)',
      'Session-Ticket': '0x8F3A4C9B...'
    }
  },
  {
    number: 5,
    name: 'Session',
    frenchName: 'Session',
    tcpEquivalent: 'Application',
    pdu: 'Données (Data)',
    protocols: ['NetBIOS', 'RPC', 'PPTP', 'Sockets POSIX', 'SIP'],
    devices: ['Gestionnaire de sessions logiques', 'API Système OS'],
    description: 'Établissement, gestion, synchronisation et clôture des sessions et dialogues entre applications distantes.',
    headerName: 'En-tête de Contrôle de Session',
    sampleHeaderFields: {
      'Session-ID': '0x992B104F',
      'Dialog-State': 'Full-Duplex Synchronized',
      'Checkpoint': 'SyncPoint #14 (Keep-Alive)'
    }
  },
  {
    number: 4,
    name: 'Transport',
    frenchName: 'Transport',
    tcpEquivalent: 'Transport',
    pdu: 'Segment (TCP) / Datagramme (UDP)',
    protocols: ['TCP', 'UDP', 'QUIC', 'SCTP'],
    devices: ['Pare-feu (Firewall L4)', 'Équilibreur de charge (L4 Load Balancer)'],
    description: 'Transmission de bout en bout fiable (TCP avec accusé de réception SYN/ACK et retransmission) ou rapide sans connexion (UDP). Découpage en segments et contrôle de flux.',
    headerName: 'En-tête TCP / UDP',
    sampleHeaderFields: {
      'Port Source': '54321 (Port éphémère client)',
      'Port Destination': '80 / 443 (HTTP/HTTPS)',
      'Sequence Number (SEQ)': '1029384756',
      'Acknowledgment (ACK)': '1029384757',
      'Flags': '[SYN, ACK] - Connexion établie',
      'Window Size': '65535 octets',
      'Checksum': '0xFA42 (Valide)'
    }
  },
  {
    number: 3,
    name: 'Network',
    frenchName: 'Réseau',
    tcpEquivalent: 'Internet',
    pdu: 'Paquet (Packet)',
    protocols: ['IPv4', 'IPv6', 'ICMP', 'OSPF', 'BGP', 'ARP'],
    devices: ['Routeur (Router)', 'Commutateur de niveau 3 (Layer 3 Switch)'],
    description: 'Adressage logique global (adresses IP) et routage des paquets à travers des réseaux hétérogènes pour trouver le meilleur chemin.',
    headerName: 'En-tête IPv4 (20 octets standard)',
    sampleHeaderFields: {
      'Version': 'IPv4 (0x4)',
      'IHL (Header Length)': '5 (20 octets)',
      'Type of Service (DSCP)': 'Default (0x00)',
      'Total Length': '1500 octets',
      'Identification': '0x3F1A',
      'TTL (Time-To-Live)': '64 sauts (Hops)',
      'Protocole': '6 (TCP)',
      'IP Source': '192.168.1.10',
      'IP Destination': '192.168.1.200'
    }
  },
  {
    number: 2,
    name: 'Data Link',
    frenchName: 'Liaison de Données',
    tcpEquivalent: 'Accès Réseau',
    pdu: 'Trame (Frame)',
    protocols: ['Ethernet 802.3', 'Wi-Fi 802.11', 'PPP', 'VLAN 802.1Q'],
    devices: ['Commutateur (Switch L2)', 'Pont (Bridge)', 'Carte réseau (NIC)'],
    description: 'Transfert physique nœud-à-nœud sur un même média local. Adressage physique (adresses MAC), contrôle d’accès au support (CSMA/CD) et détection d’erreurs (FCS CRC-32).',
    headerName: 'En-tête Ethernet II + CRC',
    sampleHeaderFields: {
      'MAC Destination': '00:1A:2B:3C:4D:FE (Switch/Serveur)',
      'MAC Source': '00:1A:2B:3C:4D:10 (Poste émetteur)',
      'EtherType': '0x0800 (IPv4)',
      'Preamble / SFD': '101010...10101011 (Synchronisation)',
      'FCS / CRC32': '0x8C194D77 (Contrôle intégrité)'
    }
  },
  {
    number: 1,
    name: 'Physical',
    frenchName: 'Physique',
    tcpEquivalent: 'Accès Réseau',
    pdu: 'Bits / Signaux (0 & 1)',
    protocols: ['Câble Cuivre RJ45 (Cat6)', 'Fibre Optique', 'Ondes Radio RF', 'DSL'],
    devices: ['Concentrateur (Hub)', 'Répéteur (Repeater)', 'Modem', 'Câbles'],
    description: 'Transmission brute des signaux binaires (tensions électriques, impulsions lumineuses ou ondes électromagnétiques) sur le média physique.',
    headerName: 'Codage de Signal Physique',
    sampleHeaderFields: {
      'Support': 'Câble Paire Torsadée Blindée (Cat6 RJ45)',
      'Encodage': 'Manchester / PAM-5 (1000BASE-T Gigabit)',
      'Vitesse / Débit': '1000 Mbps (1 Gbps Full-Duplex)',
      'Signal': 'Tension différentielle +1V / 0V / -1V',
      'Train binaire': '01001000 01100101 01101100 01101100 01101111...'
    }
  }
];

export const TCP_IP_LAYERS = [
  {
    name: 'Application',
    frenchName: 'Application',
    osiEquivalent: 'Couches 5, 6, 7 (Application, Présentation, Session)',
    protocols: ['HTTP', 'DNS', 'SSH', 'FTP', 'SMTP'],
    pdu: 'Données de l’application'
  },
  {
    name: 'Transport',
    frenchName: 'Transport',
    osiEquivalent: 'Couche 4 (Transport)',
    protocols: ['TCP', 'UDP', 'QUIC'],
    pdu: 'Segment / Datagramme'
  },
  {
    name: 'Internet',
    frenchName: 'Internet',
    osiEquivalent: 'Couche 3 (Réseau)',
    protocols: ['IP (IPv4, IPv6)', 'ICMP', 'IGMP', 'ARP'],
    pdu: 'Paquet IP'
  },
  {
    name: 'Network Access',
    frenchName: 'Accès Réseau (Hôte-Réseau)',
    osiEquivalent: 'Couches 1 & 2 (Liaison & Physique)',
    protocols: ['Ethernet', 'Wi-Fi 802.11', 'Fibre', 'DSL'],
    pdu: 'Trame & Bits'
  }
];

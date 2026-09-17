import React, { useState } from 'react';
import { OSI_LAYERS, TCP_IP_LAYERS } from '../data/osiModels';
import { OsiLayerInfo } from '../types';
import {
  Layers,
  ArrowRight,
  ArrowDown,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  FileCode,
  Radio,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';

export const OsiSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'encapsulation' | 'comparison' | 'inspector'>('encapsulation');
  const [userPayload, setUserPayload] = useState<string>('GET /index.html HTTP/1.1');
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = idle, 1..7 = encapsulation down, 8 = on wire, 9..15 = decapsulation up, 16 = delivered
  const [selectedLayerNumber, setSelectedLayerNumber] = useState<number>(4); // Default layer 4 transport
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);

  // Layers ordered from 7 down to 1 for sender
  const senderLayers = [...OSI_LAYERS]; // 7 to 1
  // Layers ordered from 1 up to 7 for receiver
  const receiverLayers = [...OSI_LAYERS].reverse(); // 1 to 7

  const handleStepForward = () => {
    setCurrentStep(prev => (prev < 16 ? prev + 1 : prev));
  };

  const handleStepBack = () => {
    setCurrentStep(prev => (prev > 0 ? prev - 1 : 0));
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlayingAuto(false);
  };

  const handleAutoPlay = () => {
    if (isPlayingAuto) {
      setIsPlayingAuto(false);
      return;
    }
    setIsPlayingAuto(true);
    setCurrentStep(1);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      if (step > 16) {
        clearInterval(interval);
        setIsPlayingAuto(false);
      } else {
        setCurrentStep(step);
      }
    }, 1200);
  };

  const selectedLayer = OSI_LAYERS.find(l => l.number === selectedLayerNumber) || OSI_LAYERS[0];

  // Helper to get step state for sender
  // Steps 1..7: Layer 7 is step 1, Layer 1 is step 7
  const isSenderLayerActive = (layerNum: number) => {
    const requiredStep = 8 - layerNum;
    return currentStep >= requiredStep;
  };

  // Steps 9..15: Layer 1 is step 9, Layer 7 is step 15
  const isReceiverLayerActive = (layerNum: number) => {
    const requiredStep = 8 + layerNum;
    return currentStep >= requiredStep;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Modèles d'Architecture : OSI (7 Couches) vs TCP/IP (4 Couches)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Comprenez le trajet exact des données, l'encapsulation des en-têtes et le rôle de chaque couche.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('encapsulation')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'encapsulation'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Simulateur d’Encapsulation
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Matrice OSI vs TCP/IP
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'inspector'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Inspecteur d'En-têtes
          </button>
        </div>
      </div>

      {/* TAB 1: ENCAPSULATION / DECAPSULATION SIMULATOR */}
      {activeTab === 'encapsulation' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <label className="text-xs text-zinc-400 whitespace-nowrap">Donnée Applicative :</label>
              <input
                type="text"
                value={userPayload}
                onChange={(e) => setUserPayload(e.target.value)}
                placeholder="Message à transmettre..."
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 w-full focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoPlay}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all ${
                  isPlayingAuto
                    ? 'bg-amber-500 text-black'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {isPlayingAuto ? 'Pause' : 'Animation Complète'}
              </button>

              <button
                onClick={handleStepBack}
                disabled={currentStep === 0}
                className="px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 rounded border border-zinc-700"
              >
                Précédent
              </button>

              <button
                onClick={handleStepForward}
                disabled={currentStep >= 16}
                className="px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 rounded border border-zinc-700"
              >
                Suivant (Étape {currentStep}/16)
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded border border-zinc-700"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current State Phase Banner */}
          <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg text-xs flex items-center justify-between text-zinc-300">
            <div>
              <span className="font-semibold text-indigo-300">Statut de la transmission : </span>
              {currentStep === 0 && 'En attente. Cliquez sur "Animation Complète" ou "Suivant" pour démarrer l’encapsulation.'}
              {currentStep >= 1 && currentStep <= 7 && `Encapsulation chez l'Émetteur : Couche ${8 - currentStep} (${OSI_LAYERS[currentStep - 1].frenchName}) ajoute son en-tête.`}
              {currentStep === 8 && 'Signal Physique sur le Support : Les bits (0 et 1) transitent par le câble Ethernet / Fibre optique.'}
              {currentStep >= 9 && currentStep <= 15 && `Décapsulation chez le Récepteur : Couche ${currentStep - 8} (${OSI_LAYERS[15 - currentStep].frenchName}) analyse et retire son en-tête.`}
              {currentStep === 16 && '✅ Message Reçu et Livré avec succès à l’application destinataire !'}
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
              PDU : {currentStep <= 3 ? 'Données' : currentStep === 4 ? 'Segment' : currentStep === 5 ? 'Paquet' : currentStep === 6 ? 'Trame' : 'Bits'}
            </span>
          </div>

          {/* Side-by-Side Transmission Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Sender Column (Couches 7 -> 1) */}
            <div className="lg:col-span-5 bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-semibold text-sky-400">
                <span>🖥️ Émetteur (Client / Poste A)</span>
                <span className="text-[10px] text-zinc-500 font-mono">Sens : Descente (Encapsulation) ↓</span>
              </div>

              <div className="space-y-1.5">
                {senderLayers.map(layer => {
                  const isActive = isSenderLayerActive(layer.number);
                  const isCurrent = currentStep === 8 - layer.number;

                  return (
                    <div
                      key={layer.number}
                      onClick={() => setSelectedLayerNumber(layer.number)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-1 ring-sky-400'
                          : isActive
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                          : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] bg-zinc-800 text-zinc-300">
                          {layer.number}
                        </span>
                        <div>
                          <div className="font-semibold">{layer.frenchName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{layer.pdu}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive ? 'bg-sky-950 text-sky-300 border border-sky-800' : 'bg-zinc-800 text-zinc-600'
                        }`}>
                          {isActive ? '+ ' + layer.headerName.split(' ')[0] : 'En attente'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle: Physical Link / Cable Signal */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center bg-zinc-950/40 border border-dashed border-zinc-800 rounded-xl p-3 text-center space-y-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Câble / Fibre
              </span>

              <div className={`w-full py-4 px-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                currentStep === 8
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-600'
              }`}>
                <Radio className="w-5 h-5" />
                <span className="text-[10px] font-mono break-all font-semibold">
                  {currentStep >= 7 && currentStep <= 9 ? '01001000 01100101 01101100' : 'Attente signal'}
                </span>
                <span className="text-[9px] text-zinc-400">Impulsions RJ45 / Laser</span>
              </div>

              <div className="text-[10px] text-zinc-500 text-center">
                Conversion en bits et propagation physique
              </div>
            </div>

            {/* Receiver Column (Couches 1 -> 7) */}
            <div className="lg:col-span-5 bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-semibold text-emerald-400">
                <span>🖧 Récepteur (Serveur Web)</span>
                <span className="text-[10px] text-zinc-500 font-mono">Sens : Montée (Décapsulation) ↑</span>
              </div>

              <div className="space-y-1.5">
                {senderLayers.map(layer => {
                  const isActive = isReceiverLayerActive(layer.number);
                  const isCurrent = currentStep === 8 + layer.number;

                  return (
                    <div
                      key={layer.number}
                      onClick={() => setSelectedLayerNumber(layer.number)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400'
                          : isActive
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                          : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] bg-zinc-800 text-zinc-300">
                          {layer.number}
                        </span>
                        <div>
                          <div className="font-semibold">{layer.frenchName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{layer.pdu}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-zinc-800 text-zinc-600'
                        }`}>
                          {isActive ? '✓ En-tête validé' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Visual Packet Breakdown (Russian Doll / Matryoshka visualization of headers) */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-400" />
              Structure de la Trame en transit (Principe des Poupées Russes)
            </h3>
            <p className="text-xs text-zinc-400 mb-3">
              Chaque couche inférieure enveloppe le PDU de la couche supérieure dans sa propre charge utile (Payload) en lui accolant son en-tête (Header).
            </p>

            <div className="p-3 bg-zinc-900/90 border border-zinc-700 rounded-lg overflow-x-auto flex items-center gap-1 text-[11px] font-mono">
              <span className="px-2 py-1 bg-amber-950/80 border border-amber-600 text-amber-300 rounded">
                [L2 Ethernet MAC]
              </span>
              <span className="px-2 py-1 bg-sky-950/80 border border-sky-600 text-sky-300 rounded">
                [L3 IPv4 Header]
              </span>
              <span className="px-2 py-1 bg-indigo-950/80 border border-indigo-600 text-indigo-300 rounded">
                [L4 TCP Header (Ports)]
              </span>
              <span className="px-2 py-1 bg-emerald-950/80 border border-emerald-600 text-emerald-300 rounded">
                [L5-L7 Donnée : "{userPayload}"]
              </span>
              <span className="px-2 py-1 bg-amber-950/80 border border-amber-600 text-amber-300 rounded">
                [FCS CRC32]
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OSI VS TCP/IP COMPARISON MATRIX */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
            Le modèle <strong>OSI (Open Systems Interconnection)</strong> est un modèle théorique normatif à 7 couches défini par l’ISO.
            Le modèle <strong>TCP/IP</strong> (modèle DoD / Internet) est le modèle pragmatique réellement déployé sur Internet, regroupant les couches supérieures en une seule couche Application.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-semibold">
                  <th className="py-2.5 px-3">N°</th>
                  <th className="py-2.5 px-3">Modèle OSI (ISO)</th>
                  <th className="py-2.5 px-3">Modèle TCP/IP</th>
                  <th className="py-2.5 px-3">Unité (PDU)</th>
                  <th className="py-2.5 px-3">Protocoles Clés</th>
                  <th className="py-2.5 px-3">Équipements Associés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {OSI_LAYERS.map(l => (
                  <tr
                    key={l.number}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedLayerNumber(l.number);
                      setActiveTab('inspector');
                    }}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-400">{l.number}</td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-100">{l.frenchName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800 text-indigo-300 font-mono text-[11px]">
                        {l.tcpEquivalent}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400">{l.pdu}</td>
                    <td className="py-2.5 px-3 text-zinc-300 font-mono text-[11px]">
                      {l.protocols.slice(0, 3).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">{l.devices.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HEADER INSPECTOR (WIRESHARK-LITE) */}
      {activeTab === 'inspector' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Layer Selector */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Sélectionnez une Couche à Inspecter :
            </label>
            {OSI_LAYERS.map(layer => (
              <button
                key={layer.number}
                onClick={() => setSelectedLayerNumber(layer.number)}
                className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                  selectedLayerNumber === layer.number
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-medium'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-[10px]">
                    {layer.number}
                  </span>
                  <span>{layer.frenchName} ({layer.name})</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            ))}
          </div>

          {/* Details & Field Breakdown */}
          <div className="md:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Couche {selectedLayer.number} : {selectedLayer.frenchName}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Équivalent TCP/IP : {selectedLayer.tcpEquivalent}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{selectedLayer.description}</p>
            </div>

            {/* Headers breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                📋 Structure de l’en-tête ({selectedLayer.headerName})
              </h4>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-xs space-y-2">
                {Object.entries(selectedLayer.sampleHeaderFields).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400 font-medium">{key} :</span>
                    <span className="text-zinc-200 font-semibold bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocols and Devices badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800 text-xs">
                <span className="text-zinc-400 font-semibold block mb-1">Protocoles Typiques :</span>
                <div className="flex flex-wrap gap-1">
                  {selectedLayer.protocols.map(p => (
                    <span key={p} className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[11px] font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800 text-xs">
                <span className="text-zinc-400 font-semibold block mb-1">Matériels / Équipements :</span>
                <div className="flex flex-wrap gap-1">
                  {selectedLayer.devices.map(d => (
                    <span key={d} className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

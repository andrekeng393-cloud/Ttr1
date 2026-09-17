import React from 'react';
import { TOPOLOGY_PRESETS } from '../data/topologies';
import { NetworkTopologyType } from '../types';
import { Check, X, AlertTriangle, ShieldCheck, DollarSign, Layers } from 'lucide-react';

interface ComparisonMatrixProps {
  onSelectTopology: (topo: NetworkTopologyType) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ onSelectTopology }) => {
  const topologies = Object.values(TOPOLOGY_PRESETS);

  const getToleranceBadge = (tolerance: string) => {
    switch (tolerance) {
      case 'Maximale':
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">Maximale</span>;
      case 'Élevée':
        return <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800">Élevée</span>;
      case 'Moyenne':
        return <span className="px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800">Moyenne</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800">Faible (Vulnérable)</span>;
    }
  };

  const getCostBadge = (cost: string) => {
    switch (cost) {
      case 'Faible':
        return <span className="text-emerald-400 font-semibold">€ Faible</span>;
      case 'Moyen':
        return <span className="text-amber-400 font-semibold">€€ Moyen</span>;
      case 'Élevé':
        return <span className="text-orange-400 font-semibold">€€€ Élevé</span>;
      case 'Très Élevé':
        return <span className="text-red-400 font-semibold">€€€€ Très Élevé</span>;
      default:
        return <span className="text-zinc-400">Variable</span>;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
      <div>
        <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" />
          Guide Comparatif & Analyse des Modèles de Topologies
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Chaque architecture de réseau représente un compromis d’ingénierie entre coût financier, redondance contre les pannes et complexité opérationnelle.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300 border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-semibold">
              <th className="py-3 px-3">Topologie</th>
              <th className="py-3 px-3">Tolérance aux Pannes</th>
              <th className="py-3 px-3">Coût de Câblage</th>
              <th className="py-3 px-3">Évolutivité (Scalabilité)</th>
              <th className="py-3 px-3">Point Unique de Défaillance (SPOF)</th>
              <th className="py-3 px-3">Cas d'usage Typique</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {topologies.map(t => (
              <tr key={t.type} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-3 px-3">
                  <div className="font-bold text-zinc-100">{t.frenchName}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">{t.name}</div>
                </td>
                <td className="py-3 px-3">{getToleranceBadge(t.faultTolerance)}</td>
                <td className="py-3 px-3">{getCostBadge(t.cablingCost)}</td>
                <td className="py-3 px-3">
                  <span className="font-medium text-zinc-300">{t.scalability}</span>
                </td>
                <td className="py-3 px-3 text-zinc-400">
                  {t.type === 'star' && <span className="text-red-400 font-medium">Oui (Switch central)</span>}
                  {t.type === 'mesh' && <span className="text-emerald-400 font-medium">Non (Redondance totale)</span>}
                  {t.type === 'ring' && <span className="text-red-400 font-medium">Oui (Coupure de boucle)</span>}
                  {t.type === 'bus' && <span className="text-red-400 font-medium">Oui (Câble dorsal)</span>}
                  {t.type === 'tree' && <span className="text-amber-400 font-medium">Partiel (Nœud parent)</span>}
                  {t.type === 'custom' && <span className="text-zinc-400">Selon architecture</span>}
                </td>
                <td className="py-3 px-3 text-zinc-400 max-w-xs">{t.bestUseCases}</td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => onSelectTopology(t.type)}
                    className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded text-xs transition-colors cursor-pointer"
                  >
                    Tester ce modèle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deep Dive Pros and Cons Accordion / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {topologies.slice(0, 3).map(t => (
          <div key={t.type} className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold text-zinc-200">{t.frenchName}</h4>
            <div className="space-y-1 text-[11px]">
              <span className="text-emerald-400 font-semibold block">Avantages :</span>
              <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                {t.pros.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
              <span className="text-red-400 font-semibold block pt-1">Inconvénients :</span>
              <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                {t.cons.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { NetworkChallenge, NetworkTopologyType } from '../types';
import { NETWORK_CHALLENGES } from '../data/challenges';
import { Award, CheckCircle2, ChevronRight, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NetworkChallengesProps {
  onLoadChallengeTopology: (topo: NetworkTopologyType) => void;
  completedChallengeIds: string[];
  onChallengeCompleted: (id: string) => void;
}

export const NetworkChallenges: React.FC<NetworkChallengesProps> = ({
  onLoadChallengeTopology,
  completedChallengeIds,
  onChallengeCompleted
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(NETWORK_CHALLENGES[0].id);
  const [showHint, setShowHint] = useState<boolean>(false);

  const currentChallenge = NETWORK_CHALLENGES.find(c => c.id === selectedChallengeId) || NETWORK_CHALLENGES[0];
  const isCompleted = completedChallengeIds.includes(currentChallenge.id);

  const handleSelectChallenge = (c: NetworkChallenge) => {
    setSelectedChallengeId(c.id);
    setShowHint(false);
    onLoadChallengeTopology(c.topology);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Défis & Travaux Pratiques Réseau (Lab Mode)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Testez vos compétences de diagnostic réseau en résolvant des scénarios réels de pannes et de routage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Progression :</span>
          <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
            {completedChallengeIds.length} / {NETWORK_CHALLENGES.length} validés
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Challenge List Sidebar */}
        <div className="md:col-span-4 space-y-2">
          {NETWORK_CHALLENGES.map(c => {
            const done = completedChallengeIds.includes(c.id);
            const isSelected = c.id === selectedChallengeId;

            return (
              <button
                key={c.id}
                onClick={() => handleSelectChallenge(c)}
                className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/80 text-amber-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-zinc-200">{c.title}</div>
                    <div className="text-[10px] text-zinc-500 capitalize">{c.difficulty} • Topologie : {c.topology}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            );
          })}
        </div>

        {/* Selected Challenge Main View */}
        <div className="md:col-span-8 bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-[11px] font-semibold">
                Niveau : {currentChallenge.difficulty}
              </span>
              {isCompleted && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Défi Réussi avec succès
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-zinc-100">{currentChallenge.title}</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">{currentChallenge.description}</p>

            {/* Objectives */}
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-amber-400 uppercase tracking-wide text-[11px] block mb-1">
                🎯 Objectif du TP :
              </span>
              <div className="text-zinc-300 whitespace-pre-line font-mono text-[11px]">
                {currentChallenge.goalDescription}
              </div>
            </div>

            {/* Hint toggler */}
            <div className="text-xs">
              <button
                onClick={() => setShowHint(prev => !prev)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Masquer l’indice' : 'Besoin d’un indice ?'}
              </button>
              {showHint && (
                <p className="mt-1.5 p-2 bg-indigo-950/40 border border-indigo-900 rounded text-indigo-300 text-[11px]">
                  💡 {currentChallenge.hint}
                </p>
              )}
            </div>

            {/* Explanation when done */}
            {isCompleted && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-300">
                <span className="font-bold block mb-1">💡 Analyse de l’expérience :</span>
                {currentChallenge.explanation}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <button
              onClick={() => onLoadChallengeTopology(currentChallenge.topology)}
              className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              Charger la configuration du défi
            </button>

            <span className="text-[11px] text-zinc-500">
              Interagissez directement sur le schéma réseau ci-dessus
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

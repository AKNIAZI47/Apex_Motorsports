import React, { useEffect, useState } from 'react';
import { X, Trophy, Timer, Flag, Award, AlertCircle } from 'lucide-react';
import { Race, RaceResult } from '../types';
import { JolpicaService } from '../services/jolpica';

interface Props {
  race: Race | null;
  onClose: () => void;
}

export const RaceDetailModal: React.FC<Props> = ({ race, onClose }) => {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!race) return;
    setLoading(true);
    JolpicaService.getRaceResults(Number(race.season), race.round).then((res) => {
      setResults(res);
      setLoading(false);
    });
  }, [race]);

  if (!race) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0d0d1f] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#16213e] to-[#0d0d1f] border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#e8002d] tracking-wider uppercase">
              <span>Round {race.round}</span>
              <span>•</span>
              <span>{race.season} Season</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{race.raceName}</h2>
            <p className="text-sm text-slate-400">{race.circuitName} — {race.locality}, {race.country}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-2 border-[#e8002d] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400">Loading classification and timing data...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No classified race results found for this event.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Pos</th>
                    <th className="py-3 px-3">No.</th>
                    <th className="py-3 px-4">Driver</th>
                    <th className="py-3 px-4">Constructor</th>
                    <th className="py-3 px-3">Grid</th>
                    <th className="py-3 px-3">Laps</th>
                    <th className="py-3 px-4">Time / Gap / Status</th>
                    <th className="py-3 px-3 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((r, idx) => {
                    const isWinner = idx === 0;
                    const isPodium = idx < 3;
                    const gridDelta = Number(r.grid) - Number(r.position);

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-white/[0.03] transition-colors ${
                          isPodium ? 'bg-white/[0.02]' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs ${
                              idx === 0
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : idx === 1
                                ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                                : idx === 2
                                ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                                : 'text-slate-400'
                            }`}
                          >
                            {r.positionText}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{r.number}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-1.5 h-6 rounded-full"
                              style={{ backgroundColor: r.constructor?.color || '#888' }}
                            />
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                {r.driver.fullName}
                                {r.fastestLap && (
                                  <span
                                    title="Fastest Lap"
                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-900/50 text-purple-300 border border-purple-500/40"
                                  >
                                    FL
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">{r.driver.nationality}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{r.constructor?.name}</td>
                        <td className="py-3 px-3 font-mono text-xs">
                          <span className="text-slate-400">P{r.grid}</span>
                          {!isNaN(gridDelta) && gridDelta !== 0 && (
                            <span
                              className={`ml-1.5 text-[11px] ${
                                gridDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {gridDelta > 0 ? `+${gridDelta}` : gridDelta}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{r.laps}</td>
                        <td className="py-3 px-4 font-mono text-xs">
                          <span
                            className={
                              r.status === 'Finished' || r.status.startsWith('+')
                                ? 'text-slate-200'
                                : 'text-rose-400 font-sans'
                            }
                          >
                            {r.time?.time || r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          {r.points > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-[#e8002d]/20 text-[#ff4d6d] border border-[#e8002d]/30 text-xs">
                              +{r.points}
                            </span>
                          ) : (
                            <span className="text-slate-600">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#080812] border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span> FL = Fastest Lap bonus point
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

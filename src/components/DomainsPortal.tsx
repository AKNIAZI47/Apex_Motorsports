import React from 'react';
import { 
  Trophy, 
  ChevronRight 
} from 'lucide-react';
import { MotorsportCategory } from '../types';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';

interface DomainsPortalProps {
  onSelectDomain: (category: MotorsportCategory) => void;
  onOpenUniversalNews?: () => void;
}

const DOMAIN_ORDER: MotorsportCategory[] = [
  'F1',
  'GTWORLD',
  'MOTOGP',
  'WEC',
  'WSBK',
  'WRC',
  'INDYCAR',
  'SUPERCARS',
  'DTM'
];

export const DomainsPortal: React.FC<DomainsPortalProps> = ({
  onSelectDomain
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Motorsport Series & Standings
          </h1>
        </div>
      </div>

      {/* 9 Championship Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOMAIN_ORDER.map((catKey) => {
          const cat = MOTORSPORT_CATEGORIES[catKey];
          if (!cat) return null;

          // Connect directly to live category standings data
          const standings = getCategoryStandings(catKey, CURRENT_YEAR);
          const topDriver = standings?.driverStandings?.[0];
          const leaderName = topDriver?.driver?.fullName || cat.championshipLeader.name;
          const leaderTeam = topDriver?.driver?.constructorName || cat.championshipLeader.team;
          const leaderPoints = topDriver?.points ?? cat.championshipLeader.points;

          return (
            <div
              key={catKey}
              onClick={() => onSelectDomain(catKey)}
              className="group relative glass-panel-elevated rounded-2xl border border-white/10 hover:border-white/25 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#ff1744]/10 cursor-pointer flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-black/60">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/40 to-transparent" />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-gradient-to-b from-[#0b0c10] to-[#050508]">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-[#ff4d6d] transition-colors">
                    {cat.name}
                  </h3>
                </div>

                {/* Leader Preview (Points Leader from Official Standings) */}
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Points Leader</div>
                      <div className="text-xs font-black text-white truncate">{leaderName}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">{leaderTeam}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="text-sm font-black font-mono text-amber-400">
                      {leaderPoints}
                    </span>
                    <span className="block text-[9px] font-mono text-slate-500 uppercase">PTS</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDomain(catKey);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-white/10 text-white hover:bg-[#ff1744] hover:shadow-lg hover:shadow-[#ff1744]/30"
                >
                  <span>View {cat.shortCode} Standings</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

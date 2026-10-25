import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  ChevronRight 
} from 'lucide-react';
import { MotorsportCategory } from '../types';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { getCategoryStandings, CURRENT_YEAR } from '../data/allMotorsportStandings';
import { JolpicaService } from '../services/jolpica';

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
  const [liveF1Leader, setLiveF1Leader] = useState<{ name: string; team: string; points: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    JolpicaService.getCurrentF1Standings().then((snapshot) => {
      const leader = snapshot.driverStandings[0];
      if (!cancelled && snapshot.live && leader) {
        setLiveF1Leader({
          name: leader.driver.fullName,
          team: leader.driver.constructorName || leader.constructors[0]?.name || 'Unknown team',
          points: leader.points,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
          const displayedLeader = catKey === 'F1' && liveF1Leader
            ? liveF1Leader
            : { name: leaderName, team: leaderTeam, points: leaderPoints };

          return (
            <div
              key={catKey}
              onClick={() => onSelectDomain(catKey)}
              className="series-card group relative border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Source-neutral series header: no unverified race artwork. */}
              <div
                className="series-visual relative h-48 w-full overflow-hidden"
                style={{ '--series-color': cat.badgeColor } as React.CSSProperties}
              >
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <span className="text-xs font-mono font-bold tracking-[0.24em] text-white/65 uppercase">
                    {cat.governingBody}
                  </span>
                  <div>
                    <span className="block text-5xl font-black tracking-tight text-white/90">
                      {cat.shortCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="series-card-body p-5 flex-1 flex flex-col justify-between space-y-4">
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
                      <div className="text-xs font-black text-white truncate">{displayedLeader.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{displayedLeader.team}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <span className="text-sm font-black font-mono text-amber-400">
                      {displayedLeader.points}
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

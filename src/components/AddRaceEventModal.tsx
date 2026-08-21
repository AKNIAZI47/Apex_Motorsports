import React, { useState } from 'react';
import { X, Trophy, Flag, Calendar, Clock, MapPin, Gauge, Sparkles, Check, PlusCircle } from 'lucide-react';
import { MotorsportCategory } from '../types';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';
import { raceEventStore, CustomRaceEvent } from '../services/raceEventStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: MotorsportCategory;
  onEventAdded?: (event: CustomRaceEvent) => void;
}

export const AddRaceEventModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialCategory = 'F1',
  onEventAdded,
}) => {
  const categories = Object.keys(MOTORSPORT_CATEGORIES) as MotorsportCategory[];

  const [category, setCategory] = useState<MotorsportCategory>(initialCategory);
  const [season, setSeason] = useState<number>(2026);
  const [round, setRound] = useState<number>(1);
  const [raceName, setRaceName] = useState<string>('');
  const [circuitName, setCircuitName] = useState<string>('');
  const [locality, setLocality] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('14:00:00Z');
  const [status, setStatus] = useState<'Completed' | 'Live In-Progress' | 'Scheduled'>('Completed');
  
  // Results & Highlights
  const [winnerName, setWinnerName] = useState<string>('');
  const [winnerTeam, setWinnerTeam] = useState<string>('');
  const [winnerTime, setWinnerTime] = useState<string>('');
  const [poleDriver, setPoleDriver] = useState<string>('');
  const [poleTime, setPoleTime] = useState<string>('');
  const [metricLabel, setMetricLabel] = useState<string>('Fastest Lap / Top Metric');
  const [metricValue, setMetricValue] = useState<string>('');
  const [metricDriver, setMetricDriver] = useState<string>('');
  const [totalLaps, setTotalLaps] = useState<number>(55);
  const [headlineNotes, setHeadlineNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!raceName.trim() || !circuitName.trim()) {
      alert('Please provide the Grand Prix / Event name and Circuit name.');
      return;
    }

    const newEv = raceEventStore.addEvent({
      category,
      season,
      round: Number(round),
      raceName: raceName.trim(),
      circuitName: circuitName.trim(),
      locality: locality.trim() || 'Circuit',
      country: country.trim() || 'Global',
      date,
      time,
      status,
      winner: winnerName.trim()
        ? {
            fullName: winnerName.trim(),
            team: winnerTeam.trim() || 'Official Competitor',
            timeOrScore: winnerTime.trim() || 'P1 Winner',
          }
        : undefined,
      polePosition: poleDriver.trim()
        ? {
            driverName: poleDriver.trim(),
            time: poleTime.trim() || 'Pole Sitter',
          }
        : undefined,
      fastestMetric: metricValue.trim()
        ? {
            label: metricLabel.trim(),
            value: metricValue.trim(),
            driverName: metricDriver.trim() || winnerName.trim() || 'Leader',
          }
        : undefined,
      totalLaps: Number(totalLaps) || 50,
      headlineNotes: headlineNotes.trim() || undefined,
    });

    if (onEventAdded) {
      onEventAdded(newEv);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#090a14] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/[0.04] to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ff1744]/20 border border-[#ff1744]/40 flex items-center justify-center text-[#ff1744]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase font-mono tracking-tight flex items-center gap-2">
                <span>Instant Race / Event Entry</span>
                <span className="text-[10px] bg-[#ff1744] text-white px-2 py-0.5 rounded font-mono font-bold">2026 LIVE</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Log a new motorsport race, grand prix round, rally stage, or drift battle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 font-mono text-xs">
          {/* Category & Season Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
                Motorsport Series
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MotorsportCategory)}
                className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#ff1744] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#090a14]">
                    {MOTORSPORT_CATEGORIES[c].shortCode} ({c})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
                Season / Year
              </label>
              <input
                type="number"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#ff1744]"
                min={1990}
                max={2030}
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
                Round Number
              </label>
              <input
                type="number"
                value={round}
                onChange={(e) => setRound(Number(e.target.value))}
                className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#ff1744]"
                min={1}
                max={50}
                required
              />
            </div>
          </div>

          {/* Event & Circuit Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
                Grand Prix / Race Event Name *
              </label>
              <input
                type="text"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                placeholder="e.g. Monaco Grand Prix 2026"
                className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#ff1744]"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
                Circuit / Venue Name *
              </label>
              <input
                type="text"
                value={circuitName}
                onChange={(e) => setCircuitName(e.target.value)}
                placeholder="e.g. Circuit de Monaco"
                className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#ff1744]"
                required
              />
            </div>
          </div>

          {/* Location & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
                Locality / City
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Monte Carlo"
                className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ff1744]"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Monaco"
                className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ff1744]"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ff1744] cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
              Event Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Completed', 'Live In-Progress', 'Scheduled'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    status === st
                      ? 'bg-[#ff1744]/20 border-[#ff1744] text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Race Results Section */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <Trophy className="w-4 h-4" />
              <span>P1 Winner & Podium Highlights (Optional)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  Race Winner Driver
                </label>
                <input
                  type="text"
                  value={winnerName}
                  onChange={(e) => setWinnerName(e.target.value)}
                  placeholder="e.g. Lewis Hamilton"
                  className="w-full bg-[#090a14] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  Winner Team / Car
                </label>
                <input
                  type="text"
                  value={winnerTeam}
                  onChange={(e) => setWinnerTeam(e.target.value)}
                  placeholder="e.g. Ferrari SF-26"
                  className="w-full bg-[#090a14] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  Winning Time / Score
                </label>
                <input
                  type="text"
                  value={winnerTime}
                  onChange={(e) => setWinnerTime(e.target.value)}
                  placeholder="e.g. 1:32:15.420"
                  className="w-full bg-[#090a14] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  Pole Position Sitter
                </label>
                <input
                  type="text"
                  value={poleDriver}
                  onChange={(e) => setPoleDriver(e.target.value)}
                  placeholder="e.g. Charles Leclerc (1:11.200)"
                  className="w-full bg-[#090a14] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  Key Metric (Fastest Lap / Drift Angle / Jump)
                </label>
                <input
                  type="text"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  placeholder="e.g. 1:13.450 (Lando Norris)"
                  className="w-full bg-[#090a14] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 font-bold mb-1 uppercase text-[11px]">
              Headline & Race Story Summary
            </label>
            <textarea
              value={headlineNotes}
              onChange={(e) => setHeadlineNotes(e.target.value)}
              placeholder="e.g. Dramatic final lap pass under wet weather conditions, securing championship points..."
              rows={2}
              className="w-full bg-[#121324] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ff1744] text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e8002d] to-[#ff1744] text-white text-xs font-bold font-mono shadow-lg shadow-[#ff1744]/30 hover:brightness-110 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Record & Publish Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

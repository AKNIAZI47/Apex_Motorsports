import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Gauge, 
  Flag, 
  Zap, 
  Compass, 
  Flame, 
  Layers,
  ChevronRight,
  ShieldCheck,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';
import { CIRCUITS } from '../data/circuitData';
import { CircuitInfo, MotorsportCategory } from '../types';
import { DISCIPLINE_TELEMETRY, DisciplineTelemetryConfig } from '../data/disciplineTelemetryData';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';

interface Props {
  initialCategory?: MotorsportCategory;
  initialCircuitId?: string;
  onSelectCategory?: (category: MotorsportCategory) => void;
}

export const CircuitMapReplay: React.FC<Props> = ({
  initialCategory = 'F1',
  initialCircuitId,
  onSelectCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>(initialCategory);
  const [selectedCircuitKey, setSelectedCircuitKey] = useState<string>(
    initialCircuitId || DISCIPLINE_TELEMETRY[initialCategory]?.defaultCircuitId || 'silverstone'
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0.15); // 0 to 1 along the lap
  const [currentLap, setCurrentLap] = useState<number>(12);
  const [totalLaps, setTotalLaps] = useState<number>(30);

  const disciplineConfig: DisciplineTelemetryConfig = useMemo(() => {
    return DISCIPLINE_TELEMETRY[selectedCategory] || DISCIPLINE_TELEMETRY.F1;
  }, [selectedCategory]);

  const [selectedDriverCode, setSelectedDriverCode] = useState<string>(() => {
    return disciplineConfig.drivers[0]?.code || 'VER';
  });

  // Sync when initialCategory or initialCircuitId prop changes from parent
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      const categoryCircuits = Object.values(CIRCUITS).filter((c) => c.category === initialCategory);
      const targetTrack = initialCircuitId || DISCIPLINE_TELEMETRY[initialCategory]?.defaultCircuitId || (categoryCircuits[0]?.id) || 'silverstone';
      setSelectedCircuitKey(targetTrack);
      const drivers = DISCIPLINE_TELEMETRY[initialCategory]?.drivers || [];
      if (drivers.length > 0) {
        setSelectedDriverCode(drivers[0].code);
      }
    }
  }, [initialCategory, initialCircuitId]);

  // Discipline-specific circuits matching category strictly
  const availableCircuits = useMemo(() => {
    const matched = Object.values(CIRCUITS).filter(
      (c) => c.category === selectedCategory
    );
    if (matched.length > 0) return matched;
    return [Object.values(CIRCUITS)[0]];
  }, [selectedCategory]);

  // Select circuit safely - ensure selected circuit belongs to the current category
  const circuit: CircuitInfo = useMemo(() => {
    if (CIRCUITS[selectedCircuitKey] && CIRCUITS[selectedCircuitKey].category === selectedCategory) {
      return CIRCUITS[selectedCircuitKey];
    }
    const defaultTrack = disciplineConfig.defaultCircuitId;
    if (CIRCUITS[defaultTrack] && CIRCUITS[defaultTrack].category === selectedCategory) {
      return CIRCUITS[defaultTrack];
    }
    return availableCircuits[0] || Object.values(CIRCUITS)[0];
  }, [selectedCircuitKey, availableCircuits, selectedCategory, disciplineConfig]);

  const handleCategorySwitch = (catKey: MotorsportCategory) => {
    setSelectedCategory(catKey);
    const catCircuits = Object.values(CIRCUITS).filter((c) => c.category === catKey);
    const defCircuit = DISCIPLINE_TELEMETRY[catKey]?.defaultCircuitId || catCircuits[0]?.id || 'silverstone';
    setSelectedCircuitKey(defCircuit);
    const catDrivers = DISCIPLINE_TELEMETRY[catKey]?.drivers || [];
    if (catDrivers.length > 0) {
      setSelectedDriverCode(catDrivers[0].code);
    }
    if (onSelectCategory) {
      onSelectCategory(catKey);
    }
  };

  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setProgress((prev) => {
          const lapBaseDuration = selectedCategory === 'DRIFT' ? 35 : selectedCategory === 'WEC' ? 65 : 75;
          const increment = (delta / lapBaseDuration) * speedMultiplier;
          let next = prev + increment;
          if (next >= 1) {
            next = next % 1;
            setCurrentLap((l) => (l >= totalLaps ? 1 : l + 1));
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, speedMultiplier, totalLaps, selectedCategory]);

  // Calculate coordinates along the SVG path for each vehicle
  const [carPositions, setCarPositions] = useState<{
    code: string;
    name: string;
    number: number | string;
    team: string;
    vehicle: string;
    color: string;
    x: number;
    y: number;
    speed: number;
    gear: number;
    throttle: number;
    brake: number;
    drs: boolean;
    tire: string;
    gap: string;
    pos: number;
    driftAngleDeg: number;
    leanAngleDeg: number;
    energyMJ: number;
    boostKw: number;
    jumpMeters: number;
    pacenote: string;
    specialtyMetric: string;
  }[]>([]);

  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const totalLength = path.getTotalLength();

    const positions = disciplineConfig.drivers.map((driver, index) => {
      let carProgress = (progress + driver.offset) % 1;
      if (carProgress < 0) carProgress += 1;

      const distance = carProgress * totalLength;
      const point = path.getPointAtLength(distance);

      // Track dynamics based on vehicle progression
      const isStraight =
        (carProgress > 0.82 && carProgress < 0.98) ||
        (carProgress > 0.0 && carProgress < 0.16) ||
        (carProgress > 0.45 && carProgress < 0.62);
      const isHeavyBraking =
        (carProgress > 0.16 && carProgress < 0.24) ||
        (carProgress > 0.62 && carProgress < 0.72);

      const topSpeedCap = disciplineConfig.maxSpeedExpected || 320;
      const baseSpeed = isStraight ? topSpeedCap * 0.94 : isHeavyBraking ? topSpeedCap * 0.32 : topSpeedCap * 0.65;
      const jitter = Math.sin(carProgress * 25 + index * 1.5) * 8;
      const speed = Math.max(45, Math.round(baseSpeed + jitter));

      const gear = selectedCategory === 'DRIFT'
        ? (speed > 130 ? 4 : speed > 90 ? 3 : 2)
        : (speed > 300 ? 8 : speed > 250 ? 7 : speed > 200 ? 6 : speed > 150 ? 5 : speed > 110 ? 4 : speed > 75 ? 3 : 2);

      const throttle = isHeavyBraking ? 0 : isStraight ? 100 : (selectedCategory === 'DRIFT' ? 95 : 75);
      const brake = isHeavyBraking ? 95 : 0;
      const drs = isStraight && speed > 270;

      // Specialized sensors
      const driftAngleDeg = selectedCategory === 'DRIFT'
        ? Math.min(76, Math.max(35, Math.round(58 + Math.sin(carProgress * 15 + index) * 16)))
        : 0;

      const leanAngleDeg = (selectedCategory === 'MOTOGP' || selectedCategory === 'WSBK')
        ? (isStraight ? 0 : Math.min(66, Math.max(42, Math.round(58 + Math.cos(carProgress * 18 + index) * 8))))
        : 0;

      const energyMJ = selectedCategory === 'WEC'
        ? Math.max(120, Math.round(900 - carProgress * 240))
        : 0;

      const boostKw = selectedCategory === 'WRC'
        ? (isStraight ? 100 : 0)
        : 0;

      const jumpMeters = selectedCategory === 'WRC' && (carProgress > 0.15 && carProgress < 0.22)
        ? Math.round(32 + Math.sin(carProgress * 50) * 8)
        : 0;

      const pacenote = carProgress < 0.2
        ? "Crest 150 Jump into 4 Right Don't Cut"
        : carProgress < 0.4
        ? "Fast 5 Left over Crest 80 Hairpin Right"
        : carProgress < 0.6
        ? "Flat Right 200 Keep Middle over Crest"
        : carProgress < 0.8
        ? "Caution 3 Left into Chicane Pine Trees"
        : "Full Throttle 300 Flying Finish Line";

      const gapSec = (index * 1.35).toFixed(1);

      return {
        code: driver.code,
        name: driver.name,
        number: driver.number,
        team: driver.team,
        vehicle: driver.vehicle,
        color: driver.color,
        x: point.x,
        y: point.y,
        speed,
        gear,
        throttle,
        brake,
        drs,
        tire: driver.tire || 'RACING SLICK',
        gap: index === 0 ? 'LEADER' : `+${gapSec}s`,
        pos: index + 1,
        driftAngleDeg,
        leanAngleDeg,
        energyMJ,
        boostKw,
        jumpMeters,
        pacenote,
        specialtyMetric: driver.specialtyMetric || `${speed} km/h`,
      };
    });

    setCarPositions(positions);
  }, [progress, circuit.id, disciplineConfig, selectedCategory]);

  const activeDriversList = disciplineConfig.drivers;
  const currentDriverExists = activeDriversList.some((d) => d.code === selectedDriverCode);
  const activeSelectedCode = currentDriverExists ? selectedDriverCode : (activeDriversList[0]?.code || '');

  const selectedCar = carPositions.find((c) => c.code === activeSelectedCode) || carPositions[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 9 Category Dedicated Quick-Switcher Bar */}
      <div className="p-4 glass-panel-elevated rounded-2xl border border-white/10 shadow-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Select Racing Series (Loads Category Telemetry & Competitors)</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Live Category Data Synchronized</span>
          </span>
        </div>

        {/* 9 Distinct Category Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {(Object.keys(DISCIPLINE_TELEMETRY) as MotorsportCategory[]).map((catKey) => {
            const config = DISCIPLINE_TELEMETRY[catKey];
            const isSelected = selectedCategory === catKey;
            const categoryMeta = MOTORSPORT_CATEGORIES[catKey];

            return (
              <button
                key={catKey}
                onClick={() => handleCategorySwitch(catKey)}
                className={`py-2 px-2 rounded-xl text-center font-mono font-bold text-xs transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#ff1744]/25 to-white/10 border-[#ff1744] text-white shadow-lg shadow-[#ff1744]/30 scale-102 ring-1 ring-[#ff1744]'
                    : 'glass-card text-slate-400 hover:text-white hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: categoryMeta?.badgeColor || '#ff1744' }}
                  />
                  <span className="truncate">{config.shortCode}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Header & Circuit Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 glass-panel-elevated border border-white/10 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff1744]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] tracking-widest uppercase">
            <Activity className="w-4 h-4" />
            <span>{disciplineConfig.name}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            {circuit.name}
          </h2>
          <p className="text-sm text-slate-300/80 font-mono mt-0.5">
            📍 {circuit.location}, {circuit.country} • {circuit.lapLengthKm} km • {circuit.turns} Turns • Surface: {circuit.surfaceType || 'ASPHALT'}
          </p>
        </div>

        {/* Category-Specific Circuit Select & Live Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#090a14] border border-white/15 rounded-xl px-3.5 py-2 shadow-inner">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">
              {disciplineConfig.shortCode} Circuit:
            </span>
            <select
              value={circuit.id}
              onChange={(e) => setSelectedCircuitKey(e.target.value)}
              className="bg-transparent text-white font-black text-xs sm:text-sm focus:outline-none cursor-pointer font-mono"
            >
              {availableCircuits.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0b0e14] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono shadow-lg shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE SESSION</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Track Canvas (8 cols) */}
        <div className="lg:col-span-8 glass-panel-elevated border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Circuit Map SVG Canvas */}
          <div className="relative w-full aspect-[16/10] bg-[#05060f]/90 rounded-xl border border-white/10 flex items-center justify-center p-4 overflow-hidden">
            {/* Ambient track glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff1744]/5 via-transparent to-cyan-500/5 pointer-events-none" />

            <svg
              ref={svgRef}
              viewBox="0 0 850 520"
              className="w-full h-full filter drop-shadow-[0_0_20px_rgba(255,23,68,0.2)]"
            >
              <defs>
                <linearGradient id="trackGradPrecision" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff1744" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#00f2fe" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                </linearGradient>

                <filter id="vehicleGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Outer Boundary Track Buffer */}
              <path
                d={circuit.pathData}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="32"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Track Surface */}
              <path
                ref={pathRef}
                d={circuit.pathData}
                fill="none"
                stroke={circuit.surfaceType === 'GRAVEL' ? '#3d2817' : '#121324'}
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Kerb / Surface Edge */}
              <path
                d={circuit.pathData}
                fill="none"
                stroke={circuit.surfaceType === 'GRAVEL' ? 'rgba(255, 183, 77, 0.4)' : 'rgba(255, 23, 68, 0.4)'}
                strokeWidth="2"
                strokeDasharray="8 6"
              />

              {/* Ideal Racing Line / Drift Transition Zone */}
              <path
                d={circuit.pathData}
                fill="none"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
              />

              {/* Point-to-Point / Stage Start Gate */}
              {circuit.isPointToPoint && circuit.keyCoordinates && circuit.keyCoordinates.length > 0 && (
                <g className="cursor-default">
                  {/* Start Launch Line Indicator */}
                  <circle
                    cx={circuit.keyCoordinates[0].x}
                    cy={circuit.keyCoordinates[0].y}
                    r="8"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <rect
                    x={circuit.keyCoordinates[0].x - 30}
                    y={circuit.keyCoordinates[0].y - 28}
                    width="60"
                    height="18"
                    rx="4"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  <text
                    x={circuit.keyCoordinates[0].x}
                    y={circuit.keyCoordinates[0].y - 16}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {circuit.startLabel || 'STAGE START'}
                  </text>
                </g>
              )}

              {/* Point-to-Point / Flying Finish Gate */}
              {circuit.isPointToPoint && circuit.keyCoordinates && circuit.keyCoordinates.length > 1 && (
                <g className="cursor-default">
                  {/* Finish Gate Flag Marker */}
                  <circle
                    cx={circuit.keyCoordinates[circuit.keyCoordinates.length - 1].x}
                    cy={circuit.keyCoordinates[circuit.keyCoordinates.length - 1].y}
                    r="8"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <rect
                    x={circuit.keyCoordinates[circuit.keyCoordinates.length - 1].x - 32}
                    y={circuit.keyCoordinates[circuit.keyCoordinates.length - 1].y - 28}
                    width="64"
                    height="18"
                    rx="4"
                    fill="#b45309"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  <text
                    x={circuit.keyCoordinates[circuit.keyCoordinates.length - 1].x}
                    y={circuit.keyCoordinates[circuit.keyCoordinates.length - 1].y - 16}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="black"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {circuit.finishLabel || 'FLYING FINISH'}
                  </text>
                </g>
              )}

              {/* Rally Splits Checkpoint Indicators */}
              {circuit.splits?.map((split) => (
                <g key={split.id} className="opacity-90 hover:opacity-100 transition-opacity">
                  <line
                    x1={split.x - 8}
                    y1={split.y - 8}
                    x2={split.x + 8}
                    y2={split.y + 8}
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />
                  <circle cx={split.x} cy={split.y} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
                  <rect
                    x={split.x + 10}
                    y={split.y - 10}
                    width="62"
                    height="16"
                    rx="3"
                    fill="#0c4a6ecc"
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  <text
                    x={split.x + 41}
                    y={split.y + 2}
                    fill="#bae6fd"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {split.name}
                  </text>
                </g>
              ))}

              {/* Drift Clipping Zones */}
              {circuit.clippingZones?.map((clip) => {
                const isOuter = clip.type === 'OUTER_ZONE';
                const zoneColor = isOuter ? '#f97316' : '#22c55e';
                return (
                  <g key={clip.id} className="opacity-90 hover:opacity-100 transition-opacity">
                    <circle
                      cx={clip.x}
                      cy={clip.y}
                      r={isOuter ? '18' : '10'}
                      fill="none"
                      stroke={zoneColor}
                      strokeWidth={isOuter ? '2.5' : '2'}
                      strokeDasharray={isOuter ? '4 3' : 'none'}
                    />
                    <circle cx={clip.x} cy={clip.y} r="3" fill={zoneColor} />
                    <rect
                      x={clip.x + 12}
                      y={clip.y - 8}
                      width="58"
                      height="15"
                      rx="3"
                      fill="#18181bcc"
                      stroke={zoneColor}
                      strokeWidth="1"
                    />
                    <text
                      x={clip.x + 41}
                      y={clip.y + 3}
                      fill="#ffffff"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {clip.name}
                    </text>
                  </g>
                );
              })}

              {/* Key Coordinates & Apex Markers */}
              {circuit.keyCoordinates?.map((coord, idx) => (
                <g key={idx} className="opacity-70 hover:opacity-100 transition-opacity">
                  <circle cx={coord.x} cy={coord.y} r="3.5" fill="#00f2fe" />
                  {coord.speed && (
                    <text
                      x={coord.x + 6}
                      y={coord.y - 6}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {coord.speed} {disciplineConfig.speedUnit}
                    </text>
                  )}
                </g>
              ))}

              {/* Animated Competitors */}
              {carPositions.map((car) => {
                const isFocused = car.code === activeSelectedCode;

                return (
                  <g
                    key={car.code}
                    onClick={() => setSelectedDriverCode(car.code)}
                    className="cursor-pointer transition-all duration-100"
                  >
                    {/* Focus pulsing ring */}
                    {isFocused && (
                      <circle
                        cx={car.x}
                        cy={car.y}
                        r="20"
                        fill="none"
                        stroke={car.color}
                        strokeWidth="2"
                        className="animate-ping"
                        style={{ animationDuration: '2s' }}
                      />
                    )}

                    {/* Competitor Dot */}
                    <circle
                      cx={car.x}
                      cy={car.y}
                      r={isFocused ? '11' : '8'}
                      fill={car.color}
                      stroke="#ffffff"
                      strokeWidth={isFocused ? '3' : '1.5'}
                      filter="url(#vehicleGlow)"
                    />

                    {/* Driver Tag Badge */}
                    <rect
                      x={car.x + 14}
                      y={car.y - 12}
                      width="38"
                      height="18"
                      rx="4"
                      fill="#04040aee"
                      stroke={car.color}
                      strokeWidth="1.2"
                    />
                    <text
                      x={car.x + 33}
                      y={car.y + 1}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="black"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {car.code}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Lap Counter & Discipline Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="bg-black/80 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 font-mono text-xs text-white flex items-center gap-2 shadow-lg">
                <span className="text-slate-400">LAP</span>
                <span className="font-black text-[#ff1744] text-sm">{currentLap}</span>
                <span className="text-slate-400">/ {totalLaps}</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 font-mono text-xs text-white shadow-lg">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: MOTORSPORT_CATEGORIES[selectedCategory]?.badgeColor || '#ff1744' }}
                />
                <span className="font-bold">{disciplineConfig.shortCode}</span>
              </div>
            </div>

            {/* Lap Record Corner Watermark */}
            {circuit.lapRecord && (
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 font-mono text-[11px] text-slate-300 shadow-lg hidden sm:block">
                <span className="text-[#ff1744] font-bold">RECORD: </span>
                <span>{circuit.lapRecord.time} ({circuit.lapRecord.driver})</span>
              </div>
            )}
          </div>

          {/* Playback Controls Bar */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Play/Pause & Speed Multipliers */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 rounded-xl bg-gradient-to-r from-[#e8002d] to-[#ff1744] hover:scale-105 text-white shadow-lg shadow-[#ff1744]/30 transition-all cursor-pointer"
                title={isPlaying ? 'Pause Replay' : 'Play Replay'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => setProgress(0)}
                className="p-2.5 rounded-xl glass-card hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Restart Lap"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Multiplier Pills */}
              <div className="flex items-center glass-card rounded-xl p-1 border border-white/10">
                {[1, 2, 5, 10].map((multiplier) => (
                  <button
                    key={multiplier}
                    onClick={() => setSpeedMultiplier(multiplier)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      speedMultiplier === multiplier
                        ? 'bg-[#ff1744] text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>
            </div>

            {/* Lap Progress Scrubber */}
            <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 shrink-0">
                {(progress * 100).toFixed(0)}% LAP
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={progress}
                onChange={(e) => setProgress(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff1744]"
              />
            </div>
          </div>
        </div>

        {/* Right Telemetry & Timing Tower (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Competitor Telemetry HUD */}
          {selectedCar && (
            <div className="glass-panel-elevated border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-10 rounded-lg shadow-md"
                    style={{ backgroundColor: selectedCar.color }}
                  />
                  <div>
                    <div className="text-xs font-mono font-bold text-[#ff1744]">
                      #{selectedCar.number} • {selectedCar.code}
                    </div>
                    <div className="font-black text-white text-base leading-tight">
                      {selectedCar.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[200px]">
                      {selectedCar.team} • {selectedCar.vehicle}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/10 text-white font-black border border-white/15">
                    P{selectedCar.pos}
                  </span>
                </div>
              </div>

              {/* Gauge Bento Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Speed Gauge */}
                <div className="glass-card rounded-xl p-3 text-center border border-white/5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Velocity ({disciplineConfig.speedUnit})
                  </span>
                  <div className="font-mono font-black text-2xl text-white mt-0.5">
                    {selectedCar.speed}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      {disciplineConfig.speedUnit}
                    </span>
                  </div>
                </div>

                {/* Gear Gauge */}
                <div className="glass-card rounded-xl p-3 text-center border border-white/5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Transmission Gear
                  </span>
                  <div className="font-mono font-black text-2xl text-[#ff1744] mt-0.5">
                    {selectedCar.gear}
                  </div>
                </div>

                {/* Throttle Gauge */}
                <div className="glass-card rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                    <span>Throttle</span>
                    <span className="text-emerald-400">{selectedCar.throttle}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-100"
                      style={{ width: `${selectedCar.throttle}%` }}
                    />
                  </div>
                </div>

                {/* Brake Gauge */}
                <div className="glass-card rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                    <span>Brake Pressure</span>
                    <span className="text-rose-400">{selectedCar.brake}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-100"
                      style={{ width: `${selectedCar.brake}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated Discipline Specialized Sensors */}
              {selectedCategory === 'DRIFT' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Drift Slip Angle</span>
                    </span>
                    <span className="text-base text-white">{selectedCar.driftAngleDeg}° ANGLE</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-150"
                      style={{ width: `${(selectedCar.driftAngleDeg / 80) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Infield Clip: 98% Accuracy</span>
                    <span className="text-emerald-400">Tandem Gap: 14 Inches</span>
                  </div>
                </div>
              )}

              {(selectedCategory === 'MOTOGP' || selectedCategory === 'WSBK') && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-orange-950/40 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Motorcycle Lean Gyro</span>
                    </span>
                    <span className="text-base text-white">{selectedCar.leanAngleDeg}° LEAN</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-150"
                      style={{ width: `${(selectedCar.leanAngleDeg / 70) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Holeshot Height: {selectedCar.speed > 300 ? 'SQUAT ACTIVE' : 'LIFT'}</span>
                    <span className="text-amber-400">Carbon Disc: 850°C</span>
                  </div>
                </div>
              )}

              {selectedCategory === 'WEC' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-red-950/40 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-rose-400" />
                      <span>Virtual Stint Energy</span>
                    </span>
                    <span className="text-base text-white">{selectedCar.energyMJ} MJ</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-150"
                      style={{ width: `${(selectedCar.energyMJ / 920) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Front MGU: {selectedCar.speed > 190 ? '200kW DEPLOY' : 'COASTING'}</span>
                    <span className="text-slate-300">BoP Ballast: 1045 kg</span>
                  </div>
                </div>
              )}

              {selectedCategory === 'WRC' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>100kW Hybrid Boost</span>
                    </span>
                    <span className="text-emerald-400 font-bold">{selectedCar.boostKw > 0 ? 'ACTIVE 100kW' : 'CHARGING'}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 bg-black/40 p-2 rounded-lg border border-white/5">
                    📢 <span className="text-amber-300 font-bold">PACENOTE:</span> {selectedCar.pacenote}
                  </div>
                </div>
              )}

              {selectedCategory === 'INDYCAR' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span>Push-to-Pass Supercapacitor</span>
                    </span>
                    <span className="text-emerald-400 font-bold">READY (+60 HP)</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 bg-black/40 p-2 rounded-lg border border-white/5 flex justify-between">
                    <span>Weight Jacker: +1.5 Turns</span>
                    <span className="text-cyan-400">Oval Draft: Active</span>
                  </div>
                </div>
              )}

              {selectedCategory === 'DTM' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-950/40 to-amber-950/40 border border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-orange-300">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span>Success Ballast & ABS Maps</span>
                    </span>
                    <span className="text-white font-bold">{selectedCar.specialtyMetric}</span>
                  </div>
                </div>
              )}

              {selectedCategory === 'SUPERCARS' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 to-blue-950/40 border border-red-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#ff1744]" />
                      <span>Gen3 V8 Locked Spool Diff</span>
                    </span>
                    <span className="text-amber-400 font-bold">{selectedCar.specialtyMetric}</span>
                  </div>
                </div>
              )}

              {selectedCategory === 'F1' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#e8002d]/20 to-cyan-950/40 border border-[#e8002d]/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>DRS & MGU-K Energy</span>
                    </span>
                    <span className={`font-bold ${selectedCar.drs ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {selectedCar.drs ? 'DRS OPEN' : 'DRS CLOSED'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 bg-black/40 p-2 rounded-lg border border-white/5 flex justify-between">
                    <span>MGU-K: 120kW Full Deploy</span>
                    <span className="text-cyan-400">Battery: 92%</span>
                  </div>
                </div>
              )}

              {/* Tire & Compound Info */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                <span className="text-slate-400">Tire Compound:</span>
                <span className="text-white font-bold px-2 py-0.5 rounded bg-white/10">
                  {selectedCar.tire}
                </span>
              </div>
            </div>
          )}

          {/* Live Timing Leaderboard Tower */}
          <div className="glass-panel-elevated border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[380px]">
            <div className="p-3.5 bg-[#090a14] border-b border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              <div className="flex items-center gap-2">
                <Flag className="w-3.5 h-3.5 text-[#ff1744]" />
                <span>{disciplineConfig.shortCode} Timing Tower</span>
              </div>
              <span className="text-emerald-400 text-[11px]">GAP / INTERVAL</span>
            </div>

            <div className="overflow-y-auto divide-y divide-white/5">
              {carPositions.map((car) => {
                const isSelected = car.code === activeSelectedCode;

                return (
                  <button
                    key={car.code}
                    onClick={() => setSelectedDriverCode(car.code)}
                    className={`w-full p-2.5 flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected ? 'bg-white/15 border-l-2 border-[#ff1744]' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 font-mono text-xs font-black text-slate-400">
                        {car.pos}
                      </span>
                      <div
                        className="w-1.5 h-6 rounded-full"
                        style={{ backgroundColor: car.color }}
                      />
                      <div>
                        <div className="font-mono font-black text-xs text-white leading-none">
                          {car.code} <span className="text-slate-400 text-[10px]">#{car.number}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">
                          {car.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">{car.gap}</div>
                      <div className="text-[9px] text-[#ff1744]">{car.speed} {disciplineConfig.speedUnit}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

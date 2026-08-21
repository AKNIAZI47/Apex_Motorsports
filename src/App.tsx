import React, { useState } from 'react';
import { 
  Compass, 
  Activity, 
  Newspaper, 
  Bot, 
  LayoutDashboard, 
  Grid, 
  User, 
  Shield, 
  ArrowRightLeft, 
  Cpu, 
  X,
  Sliders,
  Flame
} from 'lucide-react';
import { MotorsportsHub } from './components/MotorsportsHub';
import { CircuitMapReplay } from './components/CircuitMapReplay';
import { NewsPanel } from './components/NewsPanel';
import { F1Assistant } from './components/F1Assistant';
import { SeasonDashboard } from './components/SeasonDashboard';
import { GridView } from './components/GridView';
import { DriverProfile } from './components/DriverProfile';
import { ConstructorProfile } from './components/ConstructorProfile';
import { DriverComparison } from './components/DriverComparison';
import { ApexMotorsportsLogo } from './components/ApexMotorsportsLogo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Driver, MotorsportCategory } from './types';

export type TabType = 
  | 'motorsports' 
  | 'circuit' 
  | 'news' 
  | 'ai-assistant' 
  | 'dashboard' 
  | 'grid' 
  | 'driver' 
  | 'constructor' 
  | 'comparison';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('motorsports');
  const [selectedDiscipline, setSelectedDiscipline] = useState<MotorsportCategory>('WEC');
  const [targetCircuitId, setTargetCircuitId] = useState<string | undefined>(undefined);
  const [inspectedDriver, setInspectedDriver] = useState<Driver | null>(null);
  const [isQuickAssistantOpen, setIsQuickAssistantOpen] = useState(false);

  const handleSelectDriver = (driver: Driver) => {
    setInspectedDriver(driver);
    setActiveTab('driver');
  };

  const handleLaunchTelemetry = (category: MotorsportCategory, circuitId?: string) => {
    setSelectedDiscipline(category);
    setTargetCircuitId(circuitId);
    setActiveTab('circuit');
  };

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'motorsports', label: 'All Motorsports Hub', icon: Compass, badge: '9 CATEGORIES' },
    { id: 'circuit', label: 'Circuit Telemetry & Replay', icon: Activity, badge: 'MULTI-SERIES' },
    { id: 'news', label: 'Motorsport Wire', icon: Newspaper },
    { id: 'ai-assistant', label: 'Apex AI Intelligence', icon: Bot, badge: 'ZERO LIMITS' },
    { id: 'dashboard', label: 'Grand Prix Standings', icon: LayoutDashboard },
    { id: 'grid', label: 'Grid & Telemetry', icon: Grid },
    { id: 'driver', label: 'Driver Profiles', icon: User },
    { id: 'comparison', label: 'Head-to-Head', icon: ArrowRightLeft },
  ];

  return (
    <div className="min-h-screen bg-[#04040a] text-[#f0f0ff] f1-carbon-bg flex flex-col selection:bg-[#ff1744] selection:text-white relative">
      {/* Top Glassy Masthead */}
      <header className="border-b border-white/10 glass-panel-elevated sticky top-0 z-40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand Logo & Title with Nürburgring & Sliding Car Emblem */}
          <div 
            onClick={() => setActiveTab('motorsports')}
            className="cursor-pointer group flex items-center"
          >
            <ApexMotorsportsLogo size="md" showText={true} />
          </div>

          {/* Quick Actions (Ask Apex AI) */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Ask AI Action Button */}
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#e8002d] via-[#ff1744] to-[#ff4d6d] hover:brightness-110 text-white text-xs font-bold font-mono shadow-lg shadow-[#e8002d]/30 transition-all cursor-pointer border border-white/20"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Ask Apex AI</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 pt-1 border-t border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#ff1744] text-white bg-white/[0.06] shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#ff4d6d]' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-[#ff1744] text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary>
          {activeTab === 'motorsports' && (
            <MotorsportsHub 
              onLaunchTelemetry={handleLaunchTelemetry}
              onViewF1Dashboard={() => setActiveTab('dashboard')}
            />
          )}
          {activeTab === 'circuit' && (
            <CircuitMapReplay 
              initialCategory={selectedDiscipline}
              initialCircuitId={targetCircuitId}
              onSelectCategory={(cat) => setSelectedDiscipline(cat)}
            />
          )}
          {activeTab === 'news' && <NewsPanel />}
          {activeTab === 'ai-assistant' && <F1Assistant />}
          {activeTab === 'dashboard' && <SeasonDashboard />}
          {activeTab === 'grid' && <GridView onSelectDriver={handleSelectDriver} />}
          {activeTab === 'driver' && <DriverProfile initialDriver={inspectedDriver} />}
          {activeTab === 'constructor' && <ConstructorProfile onSelectDriver={handleSelectDriver} />}
          {activeTab === 'comparison' && <DriverComparison />}
        </ErrorBoundary>
      </main>

      {/* Floating Quick AI Access Button */}
      {activeTab !== 'ai-assistant' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsQuickAssistantOpen(!isQuickAssistantOpen)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#e8002d] via-[#ff1744] to-[#ff4d6d] text-white font-bold text-sm shadow-2xl shadow-[#e8002d]/50 hover:scale-105 transition-all border border-white/25 cursor-pointer"
            title="Open Quick Apex Motorsport Intelligence"
          >
            <Bot className="w-5 h-5" />
            <span className="hidden sm:inline font-mono">Ask Apex AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
        </div>
      )}

      {/* Quick AI Floating Modal Window */}
      {isQuickAssistantOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 sm:w-[480px] sm:h-[650px] z-50 p-4 sm:p-0 flex flex-col">
          <div className="flex-1 glass-panel-elevated border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
            <div className="bg-[#090a14] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ApexMotorsportsLogo size="sm" showText={false} />
                <div>
                  <div className="text-xs font-black text-white font-mono leading-none">Apex Motorsport Intelligence</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Realtime Multi-Series Engine</div>
                </div>
              </div>
              <button
                onClick={() => setIsQuickAssistantOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <F1Assistant />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 glass-panel mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <ApexMotorsportsLogo size="sm" showText={false} />
            <div>
              <span className="text-white font-bold">APEX MOTORSPORTS HUB</span>
              <span className="block text-[11px] text-slate-500">
                Formula 1 • WEC Hypercar • Formula Drift • MotoGP • WorldSBK • WRC • Supercars • DTM • IndyCar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">High-Precision Telemetry Engine (2026 Season)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;

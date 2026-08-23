import React, { useState } from 'react';
import { 
  Activity, 
  Newspaper, 
  Bot, 
  LayoutDashboard, 
  Grid, 
  User, 
  Shield, 
  ArrowRightLeft
} from 'lucide-react';
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
  | 'dashboard'
  | 'circuit' 
  | 'grid' 
  | 'driver' 
  | 'constructor' 
  | 'comparison'
  | 'news' 
  | 'ai-assistant';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedDiscipline, setSelectedDiscipline] = useState<MotorsportCategory>('F1');
  const [targetCircuitId, setTargetCircuitId] = useState<string | undefined>(undefined);
  const [inspectedDriver, setInspectedDriver] = useState<Driver | null>(null);

  const handleSelectDriver = (driver: Driver) => {
    setInspectedDriver(driver);
    setActiveTab('driver');
  };

  const handleLaunchTelemetry = (category: MotorsportCategory, circuitId?: string) => {
    setSelectedDiscipline(category);
    setTargetCircuitId(circuitId);
    setActiveTab('circuit');
  };

  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Grand Prix Standings', icon: LayoutDashboard },
    { id: 'circuit', label: 'Circuit Telemetry & Replay', icon: Activity },
    { id: 'grid', label: 'Grid & Competitors', icon: Grid },
    { id: 'driver', label: 'Driver Profiles', icon: User },
    { id: 'comparison', label: 'Head-to-Head', icon: ArrowRightLeft },
    { id: 'constructor', label: 'Constructors', icon: Shield },
    { id: 'news', label: 'Motorsport Wire', icon: Newspaper },
    { id: 'ai-assistant', label: 'Ask Apex AI', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-[#04040a] text-[#f0f0ff] f1-carbon-bg flex flex-col selection:bg-[#ff1744] selection:text-white relative">
      {/* Top Glassy Masthead */}
      <header className="border-b border-white/10 glass-panel-elevated sticky top-0 z-40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer group flex items-center"
          >
            <ApexMotorsportsLogo size="md" showText={true} />
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
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary>
          {activeTab === 'dashboard' && <SeasonDashboard />}
          {activeTab === 'circuit' && (
            <CircuitMapReplay 
              initialCategory={selectedDiscipline}
              initialCircuitId={targetCircuitId}
              onSelectCategory={(cat) => setSelectedDiscipline(cat)}
            />
          )}
          {activeTab === 'grid' && <GridView onSelectDriver={handleSelectDriver} onLaunchTelemetry={handleLaunchTelemetry} />}
          {activeTab === 'driver' && <DriverProfile initialDriver={inspectedDriver} />}
          {activeTab === 'comparison' && <DriverComparison />}
          {activeTab === 'constructor' && <ConstructorProfile onSelectDriver={handleSelectDriver} />}
          {activeTab === 'news' && <NewsPanel />}
          {activeTab === 'ai-assistant' && <F1Assistant />}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 glass-panel mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <ApexMotorsportsLogo size="sm" showText={false} />
            <div>
              <span className="text-white font-bold">APEX MOTORSPORTS</span>
              <span className="block text-[11px] text-slate-500">
                Formula 1 • WEC Hypercar • Formula Drift • MotoGP • WorldSBK • WRC • Supercars • DTM • IndyCar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">2026 World Championship Precision Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;

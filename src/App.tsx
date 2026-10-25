import React, { useState } from 'react';
import { 
  Activity, 
  Newspaper, 
  LayoutDashboard, 
  Grid, 
  User, 
  Shield, 
  ArrowRightLeft,
  ChevronLeft
} from 'lucide-react';
import { CircuitMapReplay } from './components/CircuitMapReplay';
import { NewsPanel } from './components/NewsPanel';
import { SeasonDashboard } from './components/SeasonDashboard';
import { GridView } from './components/GridView';
import { DriverProfile } from './components/DriverProfile';
import { ConstructorProfile } from './components/ConstructorProfile';
import { DriverComparison } from './components/DriverComparison';
import { DomainsPortal } from './components/DomainsPortal';
import { ApexMotorsportsLogo } from './components/ApexMotorsportsLogo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Driver, MotorsportCategory } from './types';
import { MOTORSPORT_CATEGORIES } from './data/motorsportCategories';

export type TabType = 
  | 'domains'
  | 'dashboard'
  | 'circuit' 
  | 'grid' 
  | 'driver' 
  | 'constructor' 
  | 'comparison'
  | 'news';

export function App() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<MotorsportCategory | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('domains');
  const [targetCircuitId, setTargetCircuitId] = useState<string | undefined>(undefined);
  const [inspectedDriver, setInspectedDriver] = useState<Driver | null>(null);

  // When user selects a category
  const handleSelectDomain = (category: MotorsportCategory) => {
    setSelectedDiscipline(category);
    setActiveTab('dashboard');
  };

  // Return to all categories
  const handleReturnToDomains = () => {
    setSelectedDiscipline(null);
    setActiveTab('domains');
  };

  const handleSelectDriver = (driver: Driver) => {
    setInspectedDriver(driver);
    setActiveTab('driver');
  };

  const handleLaunchTelemetry = (category: MotorsportCategory, circuitId?: string) => {
    setSelectedDiscipline(category);
    setTargetCircuitId(circuitId);
    setActiveTab('circuit');
  };

  const currentCategoryMeta = selectedDiscipline ? MOTORSPORT_CATEGORIES[selectedDiscipline] : null;

  const domainNavItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; isUniversal?: boolean }[] = [
    { id: 'dashboard', label: 'Grand Prix Standings', icon: LayoutDashboard },
    { id: 'circuit', label: 'Circuit Telemetry & Replay', icon: Activity },
    { id: 'grid', label: 'Grid & Competitors', icon: Grid },
    { id: 'driver', label: 'Driver Profiles', icon: User },
    { id: 'comparison', label: 'Head-to-Head', icon: ArrowRightLeft },
    { id: 'constructor', label: 'Constructors', icon: Shield },
    { id: 'news', label: 'Motorsport News', icon: Newspaper },
  ];

  return (
    <div className="app-shell min-h-screen text-[#f0f0ff] flex flex-col selection:bg-[#f04444] selection:text-white relative">
      {/* Top Masthead */}
      <header className="app-header border-b sticky top-0 z-40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo & Back Control */}
          <div className="flex items-center gap-3">
            <div 
              onClick={handleReturnToDomains}
              className="cursor-pointer group flex items-center"
              title="Apex Motorsports"
            >
              <ApexMotorsportsLogo size="md" showText={true} />
            </div>

            {(selectedDiscipline || activeTab === 'news') && (
              <div className="flex items-center gap-2 pl-3 border-l border-white/15">
                <button
                  onClick={handleReturnToDomains}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-[#ff4d6d]" />
                  <span>All Series</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Header - Clean empty container */}
          <div className="flex items-center gap-2.5" />
        </div>

        {/* Tab Navigation Bar (Shown when inside a domain, or when viewing news) */}
        {selectedDiscipline && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 pt-1 border-t border-white/5">
            {domainNavItems.map((item) => {
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
        )}
      </header>

      {/* Main Content Area */}
      <main className="app-main flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          {/* 1. When no domain is selected and not viewing news: Show Domains Portal */}
          {!selectedDiscipline && activeTab !== 'news' && (
            <DomainsPortal
              onSelectDomain={handleSelectDomain}
              onOpenUniversalNews={() => setActiveTab('news')}
            />
          )}

          {/* 2. News Feed: Accessible from home or domain */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              {!selectedDiscipline && (
                <button
                  onClick={handleReturnToDomains}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card text-xs font-mono font-bold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-[#ff4d6d]" />
                  <span>Back</span>
                </button>
              )}
              <NewsPanel initialDiscipline={selectedDiscipline || 'ALL'} />
            </div>
          )}

          {/* 3. Domain-Specific Views: Only rendered when a domain is selected */}
          {selectedDiscipline && activeTab === 'dashboard' && (
            <SeasonDashboard 
              category={selectedDiscipline} 
              onSelectCategory={setSelectedDiscipline} 
            />
          )}

          {selectedDiscipline && activeTab === 'circuit' && (
            <CircuitMapReplay 
              initialCategory={selectedDiscipline}
              initialCircuitId={targetCircuitId}
              onSelectCategory={(cat) => setSelectedDiscipline(cat)}
            />
          )}

          {selectedDiscipline && activeTab === 'grid' && (
            <GridView 
              category={selectedDiscipline}
              onSelectCategory={setSelectedDiscipline}
              onSelectDriver={handleSelectDriver} 
              onLaunchTelemetry={handleLaunchTelemetry} 
            />
          )}

          {selectedDiscipline && activeTab === 'driver' && (
            <DriverProfile 
              category={selectedDiscipline}
              onSelectCategory={setSelectedDiscipline}
              initialDriver={inspectedDriver} 
            />
          )}

          {selectedDiscipline && activeTab === 'comparison' && (
            <DriverComparison 
              category={selectedDiscipline}
              onSelectCategory={setSelectedDiscipline}
            />
          )}

          {selectedDiscipline && activeTab === 'constructor' && (
            <ConstructorProfile 
              category={selectedDiscipline}
              onSelectCategory={setSelectedDiscipline}
              onSelectDriver={handleSelectDriver} 
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 glass-panel mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <div onClick={handleReturnToDomains} className="cursor-pointer">
              <ApexMotorsportsLogo size="sm" showText={false} />
            </div>
            <div>
              <span className="text-white font-bold">APEX MOTORSPORTS</span>
              <span className="block text-[11px] text-slate-500">
                Formula 1 • WEC Hypercar • GT World Challenge • MotoGP • WorldSBK • WRC • Supercars • DTM • IndyCar
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={handleReturnToDomains} 
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              All Categories
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('news')} 
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Motorsport News
            </button>
            <span>•</span>
            <span className="text-slate-500">World Championship Motorsport Telemetry & Standings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;


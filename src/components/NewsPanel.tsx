import React, { useEffect, useState, useCallback } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Filter, BookOpen, X, ChevronRight, Activity } from 'lucide-react';
import { NewsArticle, MotorsportCategory } from '../types';
import { MotorsportNewsService } from '../services/motorsportNews';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';

interface Props {
  initialDiscipline?: MotorsportCategory | 'ALL';
}

export const NewsPanel: React.FC<Props> = ({ initialDiscipline = 'ALL' }) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<MotorsportCategory | 'ALL'>(initialDiscipline);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState<number>(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  // Sync if prop changes
  useEffect(() => {
    if (initialDiscipline) {
      setSelectedDiscipline(initialDiscipline);
    }
  }, [initialDiscipline]);

  // Load news dynamically on mount, discipline change, or refreshKey change
  const loadNews = useCallback(async (discipline: MotorsportCategory | 'ALL', key: number) => {
    setIsRefreshing(true);
    try {
      const data = await MotorsportNewsService.fetchLatestNews(discipline, key);
      setArticles(data);
    } catch (err) {
      console.error('Failed to load motorsport news:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadNews(selectedDiscipline, refreshKey);
  }, [selectedDiscipline, refreshKey, loadNews]);

  const handleManualRefresh = () => {
    setRefreshKey(Date.now());
  };

  const topics = ['ALL', 'RACE', 'TECH', 'ENDURANCE', 'RALLY', 'BIKES', 'GT'];

  const filteredArticles = selectedTopic === 'ALL'
    ? articles
    : articles.filter((a) => a.category.toUpperCase() === selectedTopic);

  const disciplines: { id: MotorsportCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Series' },
    { id: 'F1', label: 'Formula 1' },
    { id: 'GTWORLD', label: 'GT World Challenge' },
    { id: 'MOTOGP', label: 'MotoGP' },
    { id: 'WEC', label: 'WEC & 24H' },
    { id: 'WSBK', label: 'WorldSBK' },
    { id: 'WRC', label: 'WRC Rally' },
    { id: 'INDYCAR', label: 'IndyCar' },
    { id: 'SUPERCARS', label: 'Supercars' },
    { id: 'DTM', label: 'DTM / GT3' },
  ];

  // Relative time formatter
  const getRelativeTime = (isoString: string) => {
    const diff = Math.max(1, Math.floor((Date.now() - new Date(isoString).getTime()) / 60000));
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Sleek Professional Wire Header */}
      <div className="p-5 bg-[#121215] border border-white/10 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Official Motorsport News Wire</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
            {selectedDiscipline === 'ALL' ? 'All Motorsport Dispatches' : `${MOTORSPORT_CATEGORIES[selectedDiscipline]?.name || selectedDiscipline} News Wire`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time text bulletins, telemetry debriefs, and race steward classifications
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#18181b] hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#ff1744] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing Wire...' : 'Refresh News'}</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            {filteredArticles.length} Wires
          </span>
        </div>
      </div>

      {/* Series Filters */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
        {disciplines.map((d) => {
          const isSelected = selectedDiscipline === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDiscipline(d.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#e8002d] text-white border-white/20 shadow-md shadow-[#e8002d]/25'
                  : 'bg-[#18181b] text-slate-400 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Topic Filter Pills */}
      <div className="flex items-center justify-between gap-3 text-xs font-mono px-1">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-3.5 h-3.5 text-[#ff1744]" />
          <span className="uppercase font-bold">Topic:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                selectedTopic === t
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Pure Text-Based News Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#121215] rounded-2xl border border-white/5">
          <RefreshCw className="w-8 h-8 text-[#ff1744] animate-spin mb-2" />
          <p className="text-xs font-mono text-slate-400">Retrieving wire updates...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="p-12 text-center bg-[#121215] rounded-2xl border border-white/5">
          <p className="text-xs font-mono text-slate-400">No wire reports found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArticles.map((article) => {
            const catMeta = MOTORSPORT_CATEGORIES[article.discipline];
            const badgeColor = catMeta?.badgeColor || '#e8002d';

            return (
              <div
                key={article.id}
                onClick={() => setReadingArticle(article)}
                className="group bg-[#121215] hover:bg-[#18181e] border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                {/* Accent line */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-1"
                  style={{ backgroundColor: badgeColor }}
                />

                <div className="pl-2 space-y-3">
                  {/* Metadata Row */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded font-black text-[10px] uppercase text-white shadow-xs"
                        style={{ backgroundColor: badgeColor }}
                      >
                        {article.discipline}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold">
                        {article.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <span className="text-slate-300 font-bold">{article.source}</span>
                      <span>•</span>
                      <span>{getRelativeTime(article.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-base font-bold text-white group-hover:text-[#ff1744] transition-colors leading-snug">
                    {article.title}
                  </h3>

                  {/* Text Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                {/* Footer read link */}
                <div className="pl-2 mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-[11px] text-slate-500">Official Motorsport Dispatch</span>
                  <span className="text-[#ff1744] font-bold group-hover:underline flex items-center gap-1">
                    Read Report <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clean Full Article Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-white/15 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black text-white"
                    style={{ backgroundColor: MOTORSPORT_CATEGORIES[readingArticle.discipline]?.badgeColor || '#e8002d' }}
                  >
                    {readingArticle.discipline}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] font-bold">
                    {readingArticle.category}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">• {readingArticle.source}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
                  {readingArticle.title}
                </h3>
                <div className="text-xs text-slate-400 font-mono">
                  Published: {new Date(readingArticle.publishedAt).toLocaleString()} ({getRelativeTime(readingArticle.publishedAt)})
                </div>
              </div>

              <button
                onClick={() => setReadingArticle(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wire Content */}
            <div className="space-y-4 text-sm text-slate-200 leading-relaxed font-sans border-t border-b border-white/10 py-5">
              <p className="font-semibold text-slate-100 text-base">
                {readingArticle.summary}
              </p>
              {readingArticle.body ? (
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {readingArticle.body}
                </p>
              ) : null}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <a
                href={readingArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <span>Official Source Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setReadingArticle(null)}
                className="px-4 py-2 rounded-xl bg-[#e8002d] hover:bg-[#ff1744] text-white font-bold transition-colors cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

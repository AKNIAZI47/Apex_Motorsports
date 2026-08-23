import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Calendar, Tag, Sparkles, BookOpen, X, Filter, Flame, Compass, CheckCircle2 } from 'lucide-react';
import { NewsArticle, MotorsportCategory } from '../types';
import { MotorsportNewsService } from '../services/motorsportNews';
import { MOTORSPORT_CATEGORIES } from '../data/motorsportCategories';

export const NewsPanel: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscipline, setSelectedDiscipline] = useState<MotorsportCategory | 'ALL'>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    setLoading(true);
    MotorsportNewsService.fetchLatestNews(selectedDiscipline).then((data) => {
      setArticles(data);
      setLoading(false);
    });
  }, [selectedDiscipline]);

  const topics = ['ALL', 'TECH', 'RACE', 'ENDURANCE', 'DRIFT', 'RALLY', 'BIKES'];

  const filtered = selectedTopic === 'ALL'
    ? articles
    : articles.filter((a) => a.category === selectedTopic);

  const disciplines: { id: MotorsportCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Disciplines' },
    { id: 'WEC', label: 'WEC & 24H' },
    { id: 'DRIFT', label: 'Formula Drift' },
    { id: 'WRC', label: 'WRC Rally' },
    { id: 'MOTOGP', label: 'MotoGP' },
    { id: 'WSBK', label: 'WorldSBK' },
    { id: 'DTM', label: 'DTM / GT3' },
    { id: 'F1', label: 'Formula 1' },
    { id: 'SUPERCARS', label: 'Supercars' },
    { id: 'INDYCAR', label: 'IndyCar' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Discipline Switcher */}
      <div className="p-6 glass-panel-elevated rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e8002d]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff1744] tracking-widest uppercase">
              <Newspaper className="w-4 h-4" />
              <span>Global Motorsport Wire</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              Live Paddock & Technical Newsfeed
            </h2>
            <p className="text-sm text-slate-300/80 mt-1 max-w-2xl">
              Real-time reports, technical aerodynamic analysis, 24-hour race bulletins, WRC stage split updates, and drift telemetry recaps.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#e8002d]/20 text-[#ff4d6d] border border-[#e8002d]/30">
              ⚡ LIVE TELEMETRY WIRE
            </span>
          </div>
        </div>

        {/* Discipline Filter Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 mt-6 pt-4 border-t border-white/10">
          {disciplines.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDiscipline(d.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono whitespace-nowrap transition-all cursor-pointer border ${
                selectedDiscipline === d.id
                  ? 'bg-gradient-to-r from-[#e8002d] to-[#ff1744] text-white border-white/20 shadow-lg shadow-[#e8002d]/30'
                  : 'glass-card text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Filters */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Filter className="w-3.5 h-3.5 text-[#ff1744]" />
          <span className="uppercase font-bold">Filter By Topic:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {topics.map((top) => (
            <button
              key={top}
              onClick={() => setSelectedTopic(top)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                selectedTopic === top
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {top}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 glass-panel rounded-2xl border border-white/5">
          <div className="w-10 h-10 border-3 border-[#e8002d] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-300 font-mono">
            Fetching Paddock Telemetry Bulletins...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => {
            const catInfo = MOTORSPORT_CATEGORIES[article.discipline];

            return (
              <div
                key={article.id}
                onClick={() => setReadingArticle(article)}
                className="group glass-panel hover:glass-panel-elevated border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[#e8002d]/20"
              >
                {article.imageUrl && (
                  <div className="relative w-full h-48 overflow-hidden bg-black/60">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/40" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span
                        className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-black text-white shadow-md backdrop-blur-md"
                        style={{ backgroundColor: catInfo?.badgeColor || '#e8002d' }}
                      >
                        {article.discipline}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-black/70 text-slate-200 backdrop-blur-md border border-white/15">
                        {article.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
                      <span className="text-[#ff4d6d] font-bold">{article.source}</span>
                      <span>•</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#ff4d6d] transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#ff1744]">
                    <span className="flex items-center gap-1 group-hover:underline">
                      Read Full Wire <BookOpen className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl glass-panel-elevated border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setReadingArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-[#ff4d6d] font-bold uppercase mb-2">
              <span>{readingArticle.source}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">
                {readingArticle.discipline}
              </span>
              <span>•</span>
              <span>{readingArticle.category}</span>
            </div>

            <h2 className="text-2xl font-black text-white leading-tight">
              {readingArticle.title}
            </h2>

            <div className="text-xs text-slate-400 mt-2 font-mono">
              Published {new Date(readingArticle.publishedAt).toLocaleString()}
            </div>

            {readingArticle.imageUrl && (
              <img
                src={readingArticle.imageUrl}
                alt={readingArticle.title}
                className="w-full h-64 object-cover rounded-xl my-4 border border-white/15 shadow-xl"
                referrerPolicy="no-referrer"
              />
            )}

            <div className="text-sm text-slate-200 leading-relaxed space-y-4 mt-4">
              <p>{readingArticle.summary}</p>
              <p className="text-xs text-slate-400 italic border-l-2 border-[#ff1744] pl-3">
                Telemetry insights and paddock technical updates verified from official sanctioning bodies ({readingArticle.discipline}) and race engineering telemetry streams.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <a
                href={readingArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff1744] hover:underline"
              >
                Open Source Wire <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setReadingArticle(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Wire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

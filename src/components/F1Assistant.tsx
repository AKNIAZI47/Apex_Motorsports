import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ShieldAlert, 
  Flag, 
  Flame, 
  Zap, 
  History, 
  BookOpen, 
  AlertCircle, 
  Settings, 
  Cpu, 
  HardDrive, 
  Globe, 
  Server, 
  CheckCircle2, 
  ChevronDown, 
  Sliders,
  Compass,
  Gauge
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GeminiF1Service, ChatMessage, AISettings } from '../services/geminiService';
import { ApexMotorsportsLogo } from './ApexMotorsportsLogo';

const SUGGESTED_PROMPTS = [
  {
    discipline: 'WEC / 24H',
    category: 'Endurance',
    title: 'Le Mans Hypercar BoP & Stints',
    prompt: 'Explain the Balance of Performance (BoP) rules and stint energy (MegaJoules) regulations for Le Mans Hypercars (Ferrari 499P, Porsche 963, Toyota GR010) at the 24 Hours of Le Mans.',
  },
  {
    discipline: 'DRIFT',
    category: 'Pro Drift',
    title: 'Formula Drift 75° Angle Physics',
    prompt: 'Break down the telemetry and judging criteria for Formula DRIFT at Irwindale Speedway: initiation speed, steering knuckle lock angles (70°+), clipping zone proximity, and tandem chase rules.',
  },
  {
    discipline: 'WRC',
    category: 'Rally',
    title: 'Rally1 Hybrid & Finland Jumps',
    prompt: 'Explain how WRC Rally1 hybrid systems deploy 100kW electric boost across gravel stages, and how co-driver pacenote scales work through high-speed jumps in Finland.',
  },
  {
    discipline: 'MOTOGP',
    category: 'Two-Wheel',
    title: 'MotoGP 65° Lean Angle Telemetry',
    prompt: 'Explain the physics of 65-degree lean angles in MotoGP, ride-height holeshot shapeshifter devices, aerodynamic winglet downforce, and 366 km/h top speeds at Mugello.',
  },
  {
    discipline: 'F1',
    category: 'Technical',
    title: '2026 Engine & Active Aero Rules',
    prompt: 'Provide a detailed breakdown of the 2026 Formula 1 regulations: 350kW MGU-K electrical power, abolition of MGU-H, 100% sustainable fuels, and dual-mode active aerodynamics.',
  },
  {
    discipline: '24H NURBURG',
    category: 'Green Hell',
    title: 'Nürburgring 24h & Nordschleife',
    prompt: 'Detail the history, 170-corner layout, Caracciola Karussell banking, and multi-class GT3 traffic management during the Nürburgring 24 Hours on the Nordschleife.',
  },
  {
    discipline: 'WSBK',
    category: 'Superbike',
    title: 'WorldSBK Stoppie Braking Dynamics',
    prompt: 'Analyze Toprak Razgatlıoğlu braking technique on the BMW M1000RR in WorldSBK, including nose-wheelie stoppie entries and 3-race weekend format.',
  },
  {
    discipline: 'SUPERCARS',
    category: 'Touring',
    title: 'Bathurst 1000 Mount Panorama',
    prompt: 'Describe the V8 Supercars Gen3 race dynamics across Mount Panorama at Bathurst: Skyline, The Dipper, and 300 km/h Conrod Straight slipstreaming.',
  },
];

export const F1Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `### 🏁 Apex Motorsports AI

Ask anything across world championship motorsport disciplines:

* 🏎️ **Formula 1**: Aerodynamics, power units, 2026 regulations, race strategies, tire wear.
* ⏱️ **WEC & 24H Endurance**: Le Mans Hypercars (Ferrari 499P, Porsche 963, Toyota GR010), BoP curves.
* 💨 **Formula Drift**: Initiation physics, 75° angle telemetry, clipping zones, chase criteria.
* 🌲 **WRC Rally**: Rally1 hybrid boost, high-speed gravel dynamics, stage pacenotes.
* 🏍️ **MotoGP & WorldSBK**: 1000cc prototypes, 65° lean angles, holeshot devices, braking dynamics.
* 🏆 **DTM, IndyCar & Supercars**: GT3 sprint setups, Indy 500 oval drafts, Bathurst Mount Panorama.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'offline_engine',
      modelName: 'Apex Engine',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dailyFact, setDailyFact] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Settings & Engine State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(GeminiF1Service.getSettings());
  const [saveConfirmation, setSaveConfirmation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    GeminiF1Service.getDailyFact().then(setDailyFact);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveSettings = () => {
    GeminiF1Service.saveSettings(aiSettings);
    setSaveConfirmation(true);
    setTimeout(() => setSaveConfirmation(false), 2500);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await GeminiF1Service.sendMessage(text, history);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: response.provider as any,
        modelName: response.modelName,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (audioEnabled && 'speechSynthesis' in window) {
        speakText(response.reply, assistantMessage.id);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ **Paddock Uplink Notice**: ${err.message || 'Could not establish connection.'}\n\n*Tip: Open Engine Settings to switch to **Ollama / Local LLM** or the built-in Autonomous Engine.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'offline_engine',
        modelName: 'Error Handling',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }

    const cleanText = text.replace(/[*#`_\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] glass-panel-elevated rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
      {/* Top Header with Controls */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-[#121215] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <ApexMotorsportsLogo size="sm" />
          <h2 className="text-lg font-black text-white uppercase tracking-wider font-mono">
            Apex AI Intelligence
          </h2>
        </div>

        {/* Engine Settings Action Only */}
        <div className="flex items-center gap-2">
          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
              isSettingsOpen
                ? 'bg-[#ff1744] text-white border-white/30 shadow-lg shadow-[#ff1744]/30'
                : 'glass-card text-slate-300 hover:text-white hover:border-white/20'
            }`}
            title="AI Engine Configuration"
          >
            <Sliders className="w-4 h-4" />
            <span>Engine Settings</span>
          </button>

          {/* Speech Audio Toggle */}
          <button
            onClick={() => {
              if (speakingId) {
                window.speechSynthesis?.cancel();
                setSpeakingId(null);
              }
              setAudioEnabled(!audioEnabled);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              audioEnabled
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'glass-card text-slate-400 hover:text-white hover:border-white/20'
            }`}
            title={audioEnabled ? 'Voice Readout Active' : 'Voice Readout Disabled'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Slide-Down Engine Configuration Drawer */}
      {isSettingsOpen && (
        <div className="p-5 border-b border-white/10 bg-[#06060f]/95 backdrop-blur-xl shrink-0 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#ff1744]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Select AI Provider & Unlimited Local Engine
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Supports local Ollama models with zero rate limits
              </span>
            </div>

            {/* Provider Grid Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* 1. Ollama / Local (Zero limits) */}
              <button
                onClick={() => setAiSettings({ ...aiSettings, provider: 'ollama' })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  aiSettings.provider === 'ollama'
                    ? 'bg-gradient-to-br from-cyan-950/70 to-blue-950/70 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'glass-card border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs font-mono text-cyan-400">
                    <HardDrive className="w-4 h-4" />
                    <span>Ollama (Local)</span>
                  </div>
                  {aiSettings.provider === 'ollama' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  <strong>Zero request limits.</strong> Runs 100% locally on your machine via <code className="text-cyan-300">ollama serve</code>.
                </p>
              </button>

              {/* 2. Gemini Cloud Telemetry */}
              <button
                onClick={() => setAiSettings({ ...aiSettings, provider: 'gemini' })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  aiSettings.provider === 'gemini'
                    ? 'bg-gradient-to-br from-red-950/70 to-[#0e101f] border-[#ff1744] text-white shadow-lg shadow-[#ff1744]/20'
                    : 'glass-card border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs font-mono text-[#ff4d6d]">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini Cloud</span>
                  </div>
                  {aiSettings.provider === 'gemini' && <Check className="w-3.5 h-3.5 text-[#ff4d6d]" />}
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Server-side high-throughput Gemini model with motorsport system instructions.
                </p>
              </button>

              {/* 3. Custom / OpenRouter / DeepSeek */}
              <button
                onClick={() => setAiSettings({ ...aiSettings, provider: 'custom' })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  aiSettings.provider === 'custom'
                    ? 'bg-gradient-to-br from-purple-950/70 to-[#0e101f] border-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'glass-card border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs font-mono text-purple-400">
                    <Globe className="w-4 h-4" />
                    <span>Custom API</span>
                  </div>
                  {aiSettings.provider === 'custom' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Connect any OpenAI-compatible endpoint (OpenRouter, DeepSeek, LocalAI, vLLM).
                </p>
              </button>

              {/* 4. Autonomous Offline Engine */}
              <button
                onClick={() => setAiSettings({ ...aiSettings, provider: 'offline_engine' })}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  aiSettings.provider === 'offline_engine'
                    ? 'bg-gradient-to-br from-amber-950/70 to-[#0e101f] border-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'glass-card border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs font-mono text-amber-400">
                    <Cpu className="w-4 h-4" />
                    <span>Offline Engine</span>
                  </div>
                  {aiSettings.provider === 'offline_engine' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Built-in multi-discipline database with zero API keys and 100% offline uptime.
                </p>
              </button>
            </div>

            {/* Provider Detailed Inputs */}
            {aiSettings.provider === 'ollama' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl glass-card border border-cyan-500/30 bg-cyan-950/20">
                <div>
                  <label className="block text-[11px] font-mono text-cyan-300 font-bold mb-1">
                    OLLAMA ENDPOINT URL
                  </label>
                  <input
                    type="text"
                    value={aiSettings.ollamaEndpoint}
                    onChange={(e) => setAiSettings({ ...aiSettings, ollamaEndpoint: e.target.value })}
                    placeholder="http://127.0.0.1:11434"
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-cyan-300 font-bold mb-1">
                    OLLAMA MODEL NAME
                  </label>
                  <input
                    type="text"
                    value={aiSettings.ollamaModel}
                    onChange={(e) => setAiSettings({ ...aiSettings, ollamaModel: e.target.value })}
                    placeholder="llama3, mistral, phi3, deepseek-r1:8b"
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {aiSettings.provider === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl glass-card border border-purple-500/30 bg-purple-950/20">
                <div>
                  <label className="block text-[11px] font-mono text-purple-300 font-bold mb-1">
                    API ENDPOINT URL
                  </label>
                  <input
                    type="text"
                    value={aiSettings.customEndpoint}
                    onChange={(e) => setAiSettings({ ...aiSettings, customEndpoint: e.target.value })}
                    placeholder="https://openrouter.ai/api/v1"
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-purple-300 font-bold mb-1">
                    MODEL NAME
                  </label>
                  <input
                    type="text"
                    value={aiSettings.customModel}
                    onChange={(e) => setAiSettings({ ...aiSettings, customModel: e.target.value })}
                    placeholder="deepseek/deepseek-chat"
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-purple-300 font-bold mb-1">
                    API KEY (OPTIONAL/OPENROUTER)
                  </label>
                  <input
                    type="password"
                    value={aiSettings.customApiKey}
                    onChange={(e) => setAiSettings({ ...aiSettings, customApiKey: e.target.value })}
                    placeholder="sk-or-..."
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {saveConfirmation && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Settings Saved!
                </span>
              )}
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-mono font-bold border border-white/20 transition-colors cursor-pointer"
              >
                Apply Engine Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Prompts Bar */}
      <div className="p-3 bg-black/40 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-2 min-w-max">
          {SUGGESTED_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="px-3 py-1.5 rounded-xl glass-card border border-white/10 hover:border-[#ff1744] text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                {item.discipline}
              </span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'} animate-in fade-in duration-200`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff1744] to-[#e8002d] border border-white/20 flex items-center justify-center shrink-0 shadow-lg shadow-[#ff1744]/20 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-xl ${
                  isAssistant
                    ? 'glass-card border border-white/10 text-slate-200'
                    : 'bg-gradient-to-r from-[#e8002d] to-[#ff1744] text-white border border-white/20'
                }`}
              >
                {/* Assistant Message Header */}
                {isAssistant && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-white/10 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold">Apex Motorsports AI</span>
                      {msg.modelName && (
                        <span className="px-2 py-0.2 rounded bg-white/10 text-slate-300 text-[10px]">
                          {msg.modelName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="hover:text-white transition-colors cursor-pointer"
                        title="Copy to Clipboard"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {audioEnabled && (
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className={`hover:text-white transition-colors cursor-pointer ${
                            speakingId === msg.id ? 'text-cyan-400 animate-pulse' : ''
                          }`}
                          title="Read Out Loud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                {isAssistant ? (
                  <div className="prose prose-invert prose-sm max-w-none space-y-2 text-xs sm:text-sm leading-relaxed">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>
                )}

                {!isAssistant && (
                  <div className="text-right text-[10px] font-mono text-white/70 mt-2">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff1744] to-[#e8002d] border border-white/20 flex items-center justify-center shrink-0 shadow-lg shadow-[#ff1744]/20 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-[#ff1744] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-slate-300">
                Synthesizing multi-discipline telemetry & paddock intelligence...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-black/60 border-t border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 max-w-5xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Le Mans BoP, Drift 75° angles, WRC pacenotes, MotoGP 65° lean, F1 2026 rules, Nürburgring..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#ff1744] focus:ring-1 focus:ring-[#ff1744] transition-all font-sans"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              input.trim() && !loading
                ? 'bg-gradient-to-r from-[#e8002d] to-[#ff1744] text-white shadow-lg shadow-[#ff1744]/30 hover:scale-102'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Daily Fact Footer */}
        {dailyFact && (
          <div className="mt-2 text-center">
            <span className="text-[11px] text-slate-400 font-mono">
              💡 <strong className="text-slate-300">Apex Fact:</strong> {dailyFact}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

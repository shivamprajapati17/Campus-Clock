'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  Zap,
  Activity,
  Sliders,
  ShieldCheck,
  Power,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Moon,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface NodeData {
  id: string;
  type: 'root' | 'logical' | 'whatif' | 'catastrophe' | 'delusion';
  title: string;
  text: string;
  probability: string;
  anxiety: number;
  x: number;
  y: number;
  expanded?: boolean;
  subNodes?: NodeData[];
}

const GROUNDING_QUOTES = [
  "“You don’t have to control your thoughts. You just have to stop letting them control you.” — Dan Millman",
  "“Today is the tomorrow you worried about yesterday.” — Dale Carnegie",
  "“Nothing in the world can torment you as much as your own thoughts.” — Unknown",
  "“Breathe in calm. Exhale the narrative you just invented.”",
  "“99% of things you lose sleep over never actually happen.”",
  "“Your brain is trying to protect you by simulating worst-case scenarios. Thank it, then gently let it go.”",
];

const PRESETS = [
  "They haven't replied to my text in 25 minutes...",
  "My manager sent a Slack message: 'Do you have 5 minutes?'",
  "I waved at someone on the street and they looked right through me...",
  "I sent an email to the whole team and noticed a typo 2 seconds later...",
];

export default function OverthinkingEnginePage() {
  const [scenario, setScenario] = useState('');
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [intensity, setIntensity] = useState(3); // 1 = Low, 3 = High, 5 = Spiral
  const [groundingFilter, setGroundingFilter] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'logical' | 'whatif' | 'catastrophe' | 'delusion'>('all');
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [killSwitchTriggered, setKillSwitchTriggered] = useState(false);
  const [groundingQuote, setGroundingQuote] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Audio Context ref for ambient psychological hum
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(108, ctx.currentTime); // Low soothing drone
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
      } catch {
        // audio blocked
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    }
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [soundEnabled]);

  const handleStartEngine = (promptText?: string) => {
    const textToUse = promptText || scenario;
    if (!textToUse.trim()) return;

    setScenario(textToUse);
    setKillSwitchTriggered(false);
    setIsEngineRunning(true);
    setSelectedNode(null);
  };

  const handleKillSwitch = () => {
    setKillSwitchTriggered(true);
    const randomQuote = GROUNDING_QUOTES[Math.floor(Math.random() * GROUNDING_QUOTES.length)];
    setGroundingQuote(randomQuote);
    setIsEngineRunning(false);
    setGroundingFilter(false);
  };

  const toggleNodeExpansion = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Branch definitions generated from the scenario
  const currentScenario = scenario || "They haven't replied to my message in 20 minutes...";

  const branches: NodeData[] = [
    {
      id: 'node-logical',
      type: 'logical',
      title: 'Logical Reality',
      text: 'Their phone is muted, they are driving, eating lunch, or simply caught up in an ordinary afternoon task.',
      probability: '93.4%',
      anxiety: 6,
      x: 0,
      y: 0,
      subNodes: [
        {
          id: 'sub-logical-1',
          type: 'logical',
          title: 'Device in Another Room',
          text: 'Left charging on the desk while making coffee or talking to a colleague.',
          probability: '84%',
          anxiety: 4,
          x: 0,
          y: 0,
        },
        {
          id: 'sub-logical-2',
          type: 'logical',
          title: 'Standard Communication Latency',
          text: 'Healthy adults do not monitor their inbox every 120 seconds. This is completely routine.',
          probability: '98%',
          anxiety: 5,
          x: 0,
          y: 0,
        },
      ],
    },
    {
      id: 'node-whatif',
      type: 'whatif',
      title: "The 'What If?' Loop",
      text: "What if they saw the notification banner, read between the lines, and thought: 'Why did they say it like that?'",
      probability: '42.1%',
      anxiety: 58,
      x: 0,
      y: 0,
      subNodes: [
        {
          id: 'sub-whatif-1',
          type: 'whatif',
          title: 'Micro-Tone Dissection',
          text: "Did you use too many exclamation marks? Or did the period at the end look cold, passive-aggressive, and defensive?",
          probability: '51%',
          anxiety: 68,
          x: 0,
          y: 0,
        },
        {
          id: 'sub-whatif-2',
          type: 'whatif',
          title: 'Drafting Double-Text Clarifications',
          text: "Contemplating sending 'Haha no worries if you're busy!' but realizing that sounds 10x more anxious.",
          probability: '65%',
          anxiety: 72,
          x: 0,
          y: 0,
        },
      ],
    },
    {
      id: 'node-catastrophe',
      type: 'catastrophe',
      title: 'Worst-Case Catastrophe',
      text: "They are deeply offended, your friendship or professional standing is ruined, and they are drafting a farewell response.",
      probability: '4.8%',
      anxiety: 96,
      x: 0,
      y: 0,
      subNodes: [
        {
          id: 'sub-cat-1',
          type: 'catastrophe',
          title: 'The Group Chat Screenshots',
          text: "Your message was screenshotted and posted to a private channel titled 'Can you believe this absolute mess'.",
          probability: '3.1%',
          anxiety: 98,
          x: 0,
          y: 0,
        },
        {
          id: 'sub-cat-2',
          type: 'catastrophe',
          title: 'Irrevocable Social Isolation',
          text: "You will be quietly removed from dinner plans and future calendar invites with zero formal explanation.",
          probability: '1.2%',
          anxiety: 99,
          x: 0,
          y: 0,
        },
      ],
    },
    {
      id: 'node-delusion',
      type: 'delusion',
      title: 'The 3:00 AM Delusion',
      text: "Flee the country immediately. Buy a one-way ticket to rural Iceland, adopt an Arctic fox, and assume a new identity.",
      probability: '0.04%',
      anxiety: 81,
      x: 0,
      y: 0,
      subNodes: [
        {
          id: 'sub-del-1',
          type: 'delusion',
          title: 'Simulation Glitch Theory',
          text: "The universe is testing your willpower through 3 animated bouncing typing dots that disappear right before you scream.",
          probability: '0.001%',
          anxiety: 79,
          x: 0,
          y: 0,
        },
        {
          id: 'sub-del-2',
          type: 'delusion',
          title: 'The Monastery Escape',
          text: "Vow of absolute silence is the only remaining logical response. Throw your smartphone into a river.",
          probability: '0.005%',
          anxiety: 85,
          x: 0,
          y: 0,
        },
      ],
    },
  ];

  const getBranchStyle = (type: NodeData['type']) => {
    switch (type) {
      case 'logical':
        return {
          border: 'border-[#00F5FF]',
          glow: 'shadow-[0_0_20px_rgba(0,245,255,0.35)]',
          bg: 'bg-[#00F5FF]/10',
          badge: 'bg-[#00F5FF] text-black',
          titleColor: 'text-[#00F5FF]',
        };
      case 'whatif':
        return {
          border: 'border-[#9D4EDD]',
          glow: 'shadow-[0_0_20px_rgba(157,78,221,0.45)]',
          bg: 'bg-[#9D4EDD]/15',
          badge: 'bg-[#9D4EDD] text-white',
          titleColor: 'text-[#9D4EDD]',
        };
      case 'catastrophe':
        return {
          border: 'border-[#FF4D6D]',
          glow: 'shadow-[0_0_25px_rgba(255,77,109,0.5)]',
          bg: 'bg-[#FF4D6D]/15',
          badge: 'bg-[#FF4D6D] text-white animate-pulse',
          titleColor: 'text-[#FF4D6D]',
        };
      case 'delusion':
        return {
          border: 'border-[#C77DFF]/70',
          glow: 'shadow-[0_0_20px_rgba(199,125,255,0.25)]',
          bg: 'bg-[#C77DFF]/5 backdrop-blur-md',
          badge: 'bg-[#C77DFF]/40 text-[#E0AAFF]',
          titleColor: 'text-[#E0AAFF]',
        };
      default:
        return {
          border: 'border-white',
          glow: 'shadow-lg',
          bg: 'bg-white/10',
          badge: 'bg-white text-black',
          titleColor: 'text-white',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#E0E2EC] font-mono selection:bg-[#9D4EDD] selection:text-white relative overflow-x-hidden">
      {/* ── Background Grid & Ambient Glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(#00F5FF 1px, transparent 1px), radial-gradient(#9D4EDD 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px',
          }}
        />
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#9D4EDD]/15 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-[#00F5FF]/10 blur-[130px] pointer-events-none" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-20 border-b border-white/10 bg-[#0B0C10]/80 backdrop-blur-md px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9D4EDD] to-[#00F5FF] p-[2px] shadow-[0_0_15px_rgba(157,78,221,0.5)]">
            <div className="w-full h-full bg-[#0B0C10] rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#00F5FF] stroke-[2.2]" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white font-sans">
              The Overthinking Engine
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-[#9D4EDD] font-bold">
              Cognitive Distortion Simulator v2.4
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              soundEnabled
                ? 'border-[#00F5FF] bg-[#00F5FF]/10 text-[#00F5FF] shadow-[0_0_10px_rgba(0,245,255,0.3)]'
                : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'
            }`}
            title="Toggle 432Hz Ambient Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-bold">
              {soundEnabled ? 'Ambient Hum On' : 'Audio Muted'}
            </span>
          </button>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <span>Campus Clock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── 1. HERO SECTION ── */}
      <section className="relative z-10 pt-12 pb-8 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#9D4EDD]/40 bg-[#9D4EDD]/10 text-[#E0AAFF] text-xs font-bold shadow-[0_0_15px_rgba(157,78,221,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#00F5FF]" />
          <span>Neuro-Linguistic Spiral Mapping System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white font-sans leading-none">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5FF] via-[#9D4EDD] to-[#FF4D6D] drop-shadow-[0_0_35px_rgba(157,78,221,0.6)]">
            Overthinking
          </span> Engine
        </h1>

        <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto font-sans leading-relaxed">
          Input a simple everyday scenario. Watch your neural architecture systematically spiral it into catastrophic existential chaos.
        </p>

        {/* Central Glowing Input Bar */}
        <div className="relative max-w-2xl mx-auto pt-2">
          <div className="relative flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-[#13151D] border-2 border-[#9D4EDD] shadow-[0_0_25px_rgba(157,78,221,0.35)] transition-all focus-within:shadow-[0_0_35px_rgba(0,245,255,0.4)] focus-within:border-[#00F5FF]">
            <input
              type="text"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStartEngine();
              }}
              placeholder="e.g., They haven't replied to my message in 20 minutes..."
              className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 outline-none font-mono"
            />
            <button
              onClick={() => handleStartEngine()}
              disabled={!scenario.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#00F5FF] text-black font-extrabold text-xs uppercase tracking-wider font-sans hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,245,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Start Engine</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
              Common Triggers:
            </span>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleStartEngine(preset)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F5FF]/50 text-white/70 hover:text-white transition-all text-left truncate max-w-[260px]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── KILL SWITCH / GROUNDING RESET MODAL BANNER ── */}
      {killSwitchTriggered && (
        <div className="relative z-30 max-w-2xl mx-auto px-4 my-8 animate-fadeIn">
          <div className="p-8 rounded-2xl border-2 border-[#00F5FF] bg-[#111827]/90 backdrop-blur-xl shadow-[0_0_40px_rgba(0,245,255,0.3)] text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#00F5FF]/20 border border-[#00F5FF] flex items-center justify-center mx-auto text-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.5)]">
              <Compass className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold font-sans uppercase tracking-wider text-white">
              Neural Loop Terminated • Reality Restored
            </h3>
            <p className="text-base text-[#00F5FF] font-sans italic max-w-lg mx-auto leading-relaxed">
              {groundingQuote}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setKillSwitchTriggered(false);
                  setIsEngineRunning(true);
                }}
                className="px-5 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider text-white transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-engage Thought Analysis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. THE MIND-MAP SPIRAL (MAIN CANVAS) ── */}
      {isEngineRunning && !killSwitchTriggered && (
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
          {/* Active Scenario Anchor Node */}
          <div className="text-center relative">
            <div className="inline-block relative">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#161822] border-2 border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.15)] max-w-lg mx-auto">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#00F5FF] block mb-1">
                  Trigger Event (Origin Node)
                </span>
                <p className="text-sm sm:text-base font-bold text-white font-sans">
                  “{currentScenario}”
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
                  <span>Intensity: Level {intensity}/5</span>
                  <span>4 Branches Generated</span>
                </div>
              </div>
              {/* Connector stem downwards */}
              <div className="w-[2px] h-8 bg-gradient-to-b from-white/40 to-[#9D4EDD] mx-auto" />
            </div>
          </div>

          {/* Branch Filtering Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-black font-extrabold shadow-md'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              All 4 Branches
            </button>
            <button
              onClick={() => setActiveTab('logical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer border ${
                activeTab === 'logical'
                  ? 'border-[#00F5FF] bg-[#00F5FF]/20 text-[#00F5FF] shadow-[0_0_15px_rgba(0,245,255,0.3)]'
                  : 'border-white/10 text-white/60 hover:text-[#00F5FF]'
              }`}
            >
              Logical Reality (93%)
            </button>
            <button
              onClick={() => setActiveTab('whatif')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer border ${
                activeTab === 'whatif'
                  ? 'border-[#9D4EDD] bg-[#9D4EDD]/20 text-[#9D4EDD] shadow-[0_0_15px_rgba(157,78,221,0.3)]'
                  : 'border-white/10 text-white/60 hover:text-[#9D4EDD]'
              }`}
            >
              What If? Loop
            </button>
            <button
              onClick={() => setActiveTab('catastrophe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer border ${
                activeTab === 'catastrophe'
                  ? 'border-[#FF4D6D] bg-[#FF4D6D]/20 text-[#FF4D6D] shadow-[0_0_15px_rgba(255,77,109,0.3)]'
                  : 'border-white/10 text-white/60 hover:text-[#FF4D6D]'
              }`}
            >
              Catastrophe
            </button>
            <button
              onClick={() => setActiveTab('delusion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer border ${
                activeTab === 'delusion'
                  ? 'border-[#E0AAFF] bg-[#E0AAFF]/20 text-[#E0AAFF] shadow-[0_0_15px_rgba(224,170,255,0.3)]'
                  : 'border-white/10 text-white/60 hover:text-[#E0AAFF]'
              }`}
            >
              3:00 AM Delusion
            </button>
          </div>

          {/* ── 4 Main Branch Cards Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {branches
              .filter((b) => activeTab === 'all' || activeTab === b.type)
              .map((branch) => {
                const style = getBranchStyle(branch.type);
                const isFaded = groundingFilter && branch.type !== 'logical';
                const isHighlighted = groundingFilter && branch.type === 'logical';
                const isExpanded = !!expandedNodes[branch.id];

                return (
                  <div
                    key={branch.id}
                    className={`rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300 relative ${
                      style.border
                    } ${style.bg} ${style.glow} ${
                      isFaded
                        ? 'opacity-25 grayscale hover:opacity-80 transition-opacity'
                        : isHighlighted
                        ? 'ring-4 ring-[#00F5FF] scale-[1.02] bg-[#00F5FF]/15'
                        : ''
                    }`}
                  >
                    {/* Top Branch Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">
                          Branch Classification
                        </span>
                        <h3 className={`text-lg sm:text-xl font-bold font-sans uppercase tracking-tight ${style.titleColor}`}>
                          {branch.title}
                        </h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${style.badge}`}>
                        {branch.probability} Likely
                      </span>
                    </div>

                    {/* Core Thought Narrative */}
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans font-medium mb-4">
                      {branch.text}
                    </p>

                    {/* Anxiety Meter */}
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 mb-4">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                        <span className="text-white/60">Anxiety Metric</span>
                        <span className={style.titleColor}>{branch.anxiety}% Index</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            branch.type === 'logical'
                              ? 'bg-[#00F5FF]'
                              : branch.type === 'whatif'
                              ? 'bg-[#9D4EDD]'
                              : branch.type === 'catastrophe'
                              ? 'bg-[#FF4D6D]'
                              : 'bg-[#E0AAFF]'
                          }`}
                          style={{ width: `${branch.anxiety}%` }}
                        />
                      </div>
                    </div>

                    {/* Expand Sub-Thoughts Toggle */}
                    {branch.subNodes && branch.subNodes.length > 0 && (
                      <div className="space-y-3">
                        <button
                          onClick={() => toggleNodeExpansion(branch.id)}
                          className="w-full py-2 px-3 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-white/80 hover:text-white transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span>
                            {isExpanded
                              ? `Collapse ${branch.subNodes.length} Sub-Thoughts`
                              : `Unfold ${branch.subNodes.length} Sub-Thought Nodes`}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Sub Nodes Thread */}
                        {isExpanded && (
                          <div className="space-y-2.5 pl-3 border-l-2 border-white/20 pt-1 animate-fadeIn">
                            {branch.subNodes.map((sub) => (
                              <div
                                key={sub.id}
                                className="p-3 rounded-xl bg-black/50 border border-white/10 hover:border-white/30 transition-all text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white font-sans uppercase text-[11px]">
                                    {sub.title}
                                  </span>
                                  <span className="text-[9px] text-white/40">
                                    Prob: {sub.probability}
                                  </span>
                                </div>
                                <p className="text-[11px] text-white/70 font-sans leading-snug">
                                  {sub.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ── 3. FLOATING CONTROL DASHBOARD PANEL ── */}
      <div className="sticky bottom-4 z-40 max-w-3xl mx-auto px-4 mt-8 pb-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#13151D]/90 backdrop-blur-xl border-2 border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Slider 1: Overthink Intensity */}
          <div className="w-full sm:w-56 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/60">
              <span className="flex items-center gap-1 text-white">
                <Sliders className="w-3 h-3 text-[#9D4EDD]" />
                <span>Intensity</span>
              </span>
              <span className="text-[#9D4EDD] font-extrabold">
                {intensity === 1
                  ? 'Mild'
                  : intensity === 2
                  ? 'Moderate'
                  : intensity === 3
                  ? 'Active Spiral'
                  : intensity === 4
                  ? 'Deep Spiral'
                  : 'Cosmic Dread'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
              className="w-full h-1.5 rounded-lg bg-white/20 accent-[#9D4EDD] cursor-pointer"
            />
          </div>

          {/* Toggle: Apply Grounding Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-4 pt-2 sm:pt-0">
            <div className="text-left">
              <span className="text-xs font-bold text-white block">
                Grounding Filter
              </span>
              <span className="text-[9px] text-white/50 block">
                Silence catastrophizing
              </span>
            </div>
            <button
              onClick={() => setGroundingFilter(!groundingFilter)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 border cursor-pointer ${
                groundingFilter
                  ? 'bg-[#00F5FF] border-[#00F5FF]'
                  : 'bg-white/10 border-white/30'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full transition-transform ${
                  groundingFilter
                    ? 'translate-x-6 bg-black shadow-md'
                    : 'translate-x-0 bg-white'
                }`}
              />
            </button>
          </div>

          {/* Button: Kill Switch / Force Reset */}
          <button
            onClick={handleKillSwitch}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#FF4D6D] bg-[#FF4D6D]/15 hover:bg-[#FF4D6D]/25 text-[#FF4D6D] font-black text-xs uppercase tracking-wider font-sans transition-all shadow-[0_0_15px_rgba(255,77,109,0.3)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Power className="w-4 h-4 stroke-[2.5]" />
            <span>Kill Switch</span>
          </button>
        </div>
      </div>
    </div>
  );
}


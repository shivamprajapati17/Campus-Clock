'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  Zap,
  Sliders,
  Power,
  RotateCcw,
  Volume2,
  VolumeX,
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
  const [killSwitchTriggered, setKillSwitchTriggered] = useState(false);
  const [groundingQuote, setGroundingQuote] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Audio Context ref for ambient psychological hum
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (soundEnabled) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) throw new Error('Web Audio API unavailable');

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
          border: 'border-[#4DB6AC]',
          bg: 'bg-white',
          badge: 'bg-[#4DB6AC] text-black',
          strip: 'bg-[#4DB6AC]',
          titleColor: 'text-[#1B2E1F]',
        };
      case 'whatif':
        return {
          border: 'border-[#80CBC4]',
          bg: 'bg-white',
          badge: 'bg-[#80CBC4] text-black',
          strip: 'bg-[#80CBC4]',
          titleColor: 'text-[#1B2E1F]',
        };
      case 'catastrophe':
        return {
          border: 'border-[#BF360C]',
          bg: 'bg-white',
          badge: 'bg-[#BF360C] text-white',
          strip: 'bg-[#BF360C]',
          titleColor: 'text-[#1B2E1F]',
        };
      case 'delusion':
        return {
          border: 'border-[#A5D6A7]',
          bg: 'bg-white',
          badge: 'bg-[#A5D6A7] text-black',
          strip: 'bg-[#A5D6A7]',
          titleColor: 'text-[#1B2E1F]',
        };
      default:
        return {
          border: 'border-[#1B2E1F]',
          bg: 'bg-white',
          badge: 'bg-[#1B2E1F] text-white',
          strip: 'bg-[#1B2E1F]',
          titleColor: 'text-[#1B2E1F]',
        };
    }
  };

  const anxietyColor = (type: NodeData['type']) =>
    type === 'logical'
      ? '#4DB6AC'
      : type === 'whatif'
      ? '#80CBC4'
      : type === 'catastrophe'
      ? '#BF360C'
      : '#A5D6A7';

  return (
    <div className="min-h-screen bg-cream text-ink relative overflow-x-hidden">
      {/* ── Background dot-grid texture (blueprint substrate) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              'radial-gradient(#1B2E1F 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-20 border-b-3 border-black bg-white px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#80CBC4] border-3 border-black nb-shadow-sm flex items-center justify-center">
            <Brain className="w-5 h-5 text-black stroke-[2.2]" />
          </div>
          <div>
            <span className="font-black text-sm sm:text-base tracking-tight uppercase text-black block leading-none">
              The Overthinking Engine
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-[#2E7D32] font-black">
              Cognitive Distortion Simulator v2.4
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer nb-shadow-sm ${
              soundEnabled
                ? 'bg-[#4DB6AC] text-black'
                : 'bg-white text-black/60 hover:text-black'
            }`}
            title="Toggle 432Hz Ambient Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">
              {soundEnabled ? 'Ambient Hum On' : 'Audio Muted'}
            </span>
          </button>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border-2 border-black bg-[#FFD54F] hover:bg-[#FBC02D] text-xs font-black text-black transition-all flex items-center gap-1.5 nb-shadow-sm"
          >
            <span>Campus Clock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── 1. HERO SECTION ── */}
      <section className="relative z-10 pt-12 pb-8 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-black bg-white text-black text-xs font-black uppercase tracking-wider nb-shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Neuro-Linguistic Spiral Mapping System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-[0.95] text-black">
          The{' '}
          <span className="inline-block bg-[#80CBC4] border-3 border-black px-2 -rotate-1 nb-shadow">
            Overthinking
          </span>{' '}
          Engine
        </h1>

        <p className="text-sm sm:text-base font-bold text-black/70 max-w-xl mx-auto leading-relaxed">
          Input a simple everyday scenario. Watch your neural architecture systematically spiral it into catastrophic existential chaos.
        </p>

        {/* Central Input Bar */}
        <div className="relative max-w-2xl mx-auto pt-2">
          <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white border-3 border-black nb-shadow">
            <input
              type="text"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStartEngine();
              }}
              placeholder="e.g., They haven't replied to my message in 20 minutes..."
              className="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-black placeholder-black/40 outline-none font-semibold"
            />
            <button
              onClick={() => handleStartEngine()}
              disabled={!scenario.trim()}
              className="nb-btn w-full sm:w-auto bg-[#BF360C] text-white text-xs uppercase tracking-wider font-black disabled:opacity-40 shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Start Engine</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[10px] uppercase font-black text-black/50 tracking-wider">
              Common Triggers:
            </span>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleStartEngine(preset)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white border-2 border-black/25 hover:border-black hover:bg-[#F7FBF3] text-black/70 hover:text-black font-semibold transition-all text-left truncate max-w-[260px]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── KILL SWITCH / GROUNDING RESET MODAL BANNER ── */}
      {killSwitchTriggered && (
        <div className="relative z-30 max-w-2xl mx-auto px-4 my-8">
          <div className="p-8 rounded-2xl border-3 border-black bg-[#4DB6AC] nb-shadow-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white border-3 border-black nb-shadow-sm flex items-center justify-center mx-auto text-black">
              <Compass className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-black">
              Neural Loop Terminated • Reality Restored
            </h3>
            <p className="text-base text-black font-bold max-w-lg mx-auto leading-relaxed">
              {groundingQuote}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setKillSwitchTriggered(false);
                  setIsEngineRunning(true);
                }}
                className="nb-btn bg-white text-black text-xs uppercase tracking-wider font-black"
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
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Active Scenario Anchor Node */}
          <div className="text-center relative">
            <div className="inline-block relative">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black nb-shadow max-w-lg mx-auto">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#2E7D32] block mb-1">
                  Trigger Event (Origin Node)
                </span>
                <p className="text-sm sm:text-base font-black text-black">
                  “{currentScenario}”
                </p>
                <div className="mt-2.5 pt-2 border-t-2 border-black/10 flex items-center justify-between text-[10px] font-bold text-black/60">
                  <span>Intensity: Level {intensity}/5</span>
                  <span>4 Branches Generated</span>
                </div>
              </div>
              {/* Connector stem downwards */}
              <div className="w-[3px] h-8 bg-black mx-auto" />
            </div>
          </div>

          {/* Branch Filtering Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b-3 border-black pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#1B2E1F] text-white nb-shadow-sm'
                  : 'bg-white text-black/60 hover:text-black'
              }`}
            >
              All 4 Branches
            </button>
            <button
              onClick={() => setActiveTab('logical')}
              className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase transition-all cursor-pointer ${
                activeTab === 'logical'
                  ? 'bg-[#4DB6AC] text-black nb-shadow-sm'
                  : 'bg-white text-black/60 hover:text-black'
              }`}
            >
              Logical Reality (93%)
            </button>
            <button
              onClick={() => setActiveTab('whatif')}
              className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase transition-all cursor-pointer ${
                activeTab === 'whatif'
                  ? 'bg-[#80CBC4] text-black nb-shadow-sm'
                  : 'bg-white text-black/60 hover:text-black'
              }`}
            >
              What If? Loop
            </button>
            <button
              onClick={() => setActiveTab('catastrophe')}
              className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase transition-all cursor-pointer ${
                activeTab === 'catastrophe'
                  ? 'bg-[#BF360C] text-white nb-shadow-sm'
                  : 'bg-white text-black/60 hover:text-black'
              }`}
            >
              Catastrophe
            </button>
            <button
              onClick={() => setActiveTab('delusion')}
              className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase transition-all cursor-pointer ${
                activeTab === 'delusion'
                  ? 'bg-[#A5D6A7] text-black nb-shadow-sm'
                  : 'bg-white text-black/60 hover:text-black'
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
                    className={`rounded-2xl border-3 p-5 sm:p-6 transition-all duration-300 relative overflow-hidden nb-shadow ${
                      style.border
                    } ${style.bg} ${
                      isFaded
                        ? 'opacity-40 grayscale hover:opacity-90 transition-opacity'
                        : isHighlighted
                        ? 'ring-4 ring-[#4DB6AC] -translate-y-1'
                        : ''
                    }`}
                  >
                    {/* Colour classification strip */}
                    <span className={`absolute inset-x-0 top-0 h-2 ${style.strip}`} />

                    {/* Top Branch Header */}
                    <div className="flex items-start justify-between gap-3 mb-3 mt-1.5">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-black/50">
                          Branch Classification
                        </span>
                        <h3 className={`text-lg sm:text-xl font-black uppercase tracking-tight ${style.titleColor}`}>
                          {branch.title}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded-md border-2 border-black text-[10px] font-black uppercase tracking-wider ${style.badge}`}>
                        {branch.probability} Likely
                      </span>
                    </div>

                    {/* Core Thought Narrative */}
                    <p className="text-xs sm:text-sm text-black/85 leading-relaxed font-semibold mb-4">
                      {branch.text}
                    </p>

                    {/* Anxiety Meter */}
                    <div className="p-3 rounded-xl bg-[#F7FBF3] border-2 border-black mb-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1.5">
                        <span className="text-black/60">Anxiety Metric</span>
                        <span className="text-black">{branch.anxiety}% Index</span>
                      </div>
                      <div className="nb-progress" style={{ height: '12px' }}>
                        <span
                          style={{
                            width: `${branch.anxiety}%`,
                            backgroundColor: anxietyColor(branch.type),
                          }}
                        />
                      </div>
                    </div>

                    {/* Expand Sub-Thoughts Toggle */}
                    {branch.subNodes && branch.subNodes.length > 0 && (
                      <div className="space-y-3">
                        <button
                          onClick={() => toggleNodeExpansion(branch.id)}
                          className="w-full py-2 px-3 rounded-lg border-2 border-black bg-white hover:bg-[#F7FBF3] text-xs font-black uppercase text-black/80 hover:text-black transition-all flex items-center justify-between cursor-pointer"
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
                          <div className="space-y-2.5 pl-3 border-l-3 border-black/30 pt-1">
                            {branch.subNodes.map((sub) => (
                              <div
                                key={sub.id}
                                className="p-3 rounded-xl bg-[#F7FBF3] border-2 border-black transition-all text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-black uppercase text-[11px]">
                                    {sub.title}
                                  </span>
                                  <span className="text-[9px] font-bold text-black/50">
                                    Prob: {sub.probability}
                                  </span>
                                </div>
                                <p className="text-[11px] text-black/70 font-semibold leading-snug">
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
        <div className="p-4 sm:p-5 rounded-2xl bg-white border-3 border-black nb-shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Slider 1: Overthink Intensity */}
          <div className="w-full sm:w-56 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-black/60">
              <span className="flex items-center gap-1 text-black">
                <Sliders className="w-3 h-3 text-[#2E7D32]" />
                <span>Intensity</span>
              </span>
              <span className="text-[#2E7D32] font-black">
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
              className="w-full h-2 rounded-lg bg-[#F7FBF3] border-2 border-black accent-[#80CBC4] cursor-pointer"
            />
          </div>

          {/* Toggle: Apply Grounding Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start border-t-2 sm:border-t-0 sm:border-l-2 border-black/10 sm:pl-4 pt-2 sm:pt-0">
            <div className="text-left">
              <span className="text-xs font-black uppercase text-black block">
                Grounding Filter
              </span>
              <span className="text-[9px] font-bold text-black/50 block">
                Silence catastrophizing
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={groundingFilter}
              aria-label="Grounding filter"
              data-on={groundingFilter}
              onClick={() => setGroundingFilter(!groundingFilter)}
              className="nb-toggle"
            />
          </div>

          {/* Button: Kill Switch / Force Reset */}
          <button
            onClick={handleKillSwitch}
            className="nb-btn w-full sm:w-auto bg-[#BF360C] text-white text-xs uppercase tracking-wider font-black shrink-0"
          >
            <Power className="w-4 h-4 stroke-[2.5]" />
            <span>Kill Switch</span>
          </button>
        </div>
      </div>
    </div>
  );
}

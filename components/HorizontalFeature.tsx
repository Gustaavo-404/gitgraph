"use client";

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Activity, Database, Clock, Brain, TrendingUp, AlertTriangle, FileText, Filter, Share2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalFeature() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Estados para simular dados técnicos em tempo real
  const [syncRate, setSyncRate] = useState(98.2);
  const [risks, setRisks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncRate(parseFloat((98 + Math.random() * 1.8).toFixed(1)));
      setRisks(prev => Math.random() > 0.8 ? Math.floor(Math.random() * 3) : prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const wrap = wrapRef.current;
    const gear = gearRef.current;
    const progress = progressRef.current;

    if (!section || !wrap || !gear || !progress) return;

    const panels = gsap.utils.toArray<HTMLElement>(".panel");
    const totalPanels = panels.length;
    const totalWidth = window.innerWidth * totalPanels;

    const horizontalTween = gsap.to(wrap, {
      x: -(totalWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        id: "horizontal",
        trigger: section,
        pin: true,
        scrub: 1,
        start: "top top",
        end: () => `+=${totalWidth}`,
      },
    });

    // Rotação da Engrenagem
    gsap.to(gear, {
      rotation: 360 * totalPanels,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${totalWidth}`,
        scrub: true,
      },
    });

    // Animação de entrada dos conteúdos de cada painel
    panels.forEach((panel) => {
      const title = panel.querySelector("h2");
      const text = panel.querySelector("p");
      const miniCards = panel.querySelectorAll(".feature-card");

      if (!title || !text) return;

      gsap.fromTo(
        [title, text, ...miniCards],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: panel,
            start: "left center",
            end: "right center",
            scrub: true,
            containerAnimation: horizontalTween,
          },
        }
      );
    });

    // Barra de Progresso Lateral
    gsap.fromTo(
      progress,
      { scaleY: 0 },
      {
        scaleY: 1,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#030303] text-white"
    >
      {/* BACKGROUND UI - GRID */}
      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-[0.03]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-white h-full" />
        ))}
      </div>

      {/* TOP DECORATION */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center border-b border-white/5 bg-black backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-[#57e071]" />
            <div className="w-1 h-1 bg-[#57e071]/50" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase">System_Core_Active</span>
        </div>
        <div className="font-mono text-[10px] text-zinc-500">
          NODE_STABLE: <span className="text-[#57e071]">0x77AF</span>
        </div>
      </div>

      {/* Progress Bar Lateral */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 h-[40%] w-[1px] bg-white/10">
        <div
          ref={progressRef}
          className="h-full w-full bg-[#57e071] origin-top scale-y-0 shadow-[0_0_15px_#57e071]"
        />
      </div>

      {/* Wrapper Horizontal */}
      <div ref={wrapRef} className="flex h-full">

        {/* Painel 1 */}
        <div className="panel flex h-full w-screen shrink-0 items-center px-24">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-[#57e071]" />
              <span className="font-mono text-[10px] text-[#57e071] tracking-tighter uppercase">Protocol 01 / Analytics</span>
            </div>
            <h2 className="text-6xl font-light mb-6 tracking-tighter">
              Real-time GitHub <span className="italic">Analytics</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-lg border-l border-zinc-800 pl-6">
              Visualize commits, issues and pull requests with live data straight from GitHub 
              at a stable <span className="text-white font-mono">{syncRate}%</span> sync rate.
            </p>
            
            <div className="mt-12 flex items-center gap-10">
              <div className="feature-card flex flex-col gap-2">
                <Activity className="w-5 h-5 text-[#57e071]" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Live Data</span>
                <span className="text-xs text-zinc-300">Active Feed</span>
              </div>
              <div className="feature-card flex flex-col gap-2">
                <Database className="w-5 h-5 text-[#57e071]" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Database</span>
                <span className="text-xs text-zinc-300">Multi-Repo</span>
              </div>
              <div className="feature-card flex flex-col gap-2">
                <Clock className="w-5 h-5 text-[#57e071]" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Sync</span>
                <span className="text-xs text-[#57e071]">{syncRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel 2 */}
        <div className="panel flex h-full w-screen shrink-0 items-center px-24">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-[#57e071]" />
              <span className="font-mono text-[10px] text-[#57e071] tracking-tighter uppercase">Protocol 02 / Intelligence</span>
            </div>
            <h2 className="text-6xl font-light mb-6 tracking-tighter">
              Intelligent Code <span className="italic">Insights</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-lg border-l border-zinc-800 pl-6">
              Detect patterns and performance risks automatically. 
              Current threats detected: <span className="text-red-500 font-mono">{risks}</span>
            </p>
            <div className="mt-12 flex items-center gap-10">
              <div className="feature-card flex flex-col gap-2">
                <Brain className="w-5 h-5 text-[#57e071]" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">AI Engine</span>
                <span className="text-xs text-zinc-300">Smart Analysis</span>
              </div>
              <div className="feature-card flex flex-col gap-2">
                <TrendingUp className="w-5 h-5 text-[#57e071]" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Flow</span>
                <span className="text-xs text-zinc-300">Pattern Recog.</span>
              </div>
              <div className="feature-card flex flex-col gap-2">
                <AlertTriangle className={`w-5 h-5 transition-colors duration-300 ${risks > 0 ? 'text-red-500' : 'text-[#57e071]'}`} />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Risk</span>
                <span className="text-xs text-zinc-300">Auto-Detection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel 3 */}
        <div className="panel flex h-full w-screen shrink-0 items-center px-24">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-px w-8 bg-[#57e071]" />
              <span className="font-mono text-[10px] text-[#57e071] tracking-tighter uppercase">Protocol 03 / Reporting</span>
            </div>
            <h2 className="text-6xl font-light mb-6 tracking-tighter">
              Engineering <span className="italic">Reports</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-lg border-l border-zinc-800 pl-6">
              Export technical dashboards ready for stakeholders with 
              high-fidelity custom time ranges.
            </p>
            <div className="mt-12 flex items-center gap-10">
              <div className="feature-card flex flex-col gap-2">
                <FileText className="w-5 h-5 text-[#57e071]" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Output</span>
                <span className="text-xs text-zinc-300">PDF / JSON</span>
              </div>
              <div className="feature-card flex flex-col gap-2">
                <Filter className="w-5 h-5 text-[#57e071]" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Filter</span>
                <span className="text-xs text-zinc-300">Custom Range</span>
              </div>
              <div className="feature-card flex flex-col gap-2">
                <Share2 className="w-5 h-5 text-[#57e071]" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Share</span>
                <span className="text-xs text-zinc-300">Cloud Sync</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Engrenagem Técnica */}
      <div className="pointer-events-none absolute right-24 bottom-24 overflow-hidden">
        <div className="relative">
          <img
            ref={gearRef}
            src="/gear.png"
            alt="Gear"
            className="w-96 h-96 opacity-[0.07]"
          />
          {/* Círculo central da engrenagem com dado dinâmico */}
          <div className="absolute inset-0 flex items-center justify-center">

          </div>
        </div>
      </div>

    </section>
  );
}
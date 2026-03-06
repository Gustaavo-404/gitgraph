"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { 
    title: "Account Setup", 
    desc: "Start by connecting your GitHub profile. We'll use this to access your repositories and provide a personalized analysis of your development workflow.", 
    instruction: "Click the 'Connect GitHub' button to authorize secure access.",
    side: "left" 
  },
  { 
    title: "Select Repositories", 
    desc: "Choose the specific projects you want us to monitor. You can select individual repositories or entire organizations to get a bird's-eye view of your code.", 
    instruction: "Use the search bar to filter and pick your active project branches.",
    side: "right" 
  },
  { 
    title: "AI Analysis", 
    desc: "Our AI engines scan your codebase for technical debt, security vulnerabilities, and logic flaws, providing real-time feedback on every commit.", 
    instruction: "Sit back while our models process your code structure and history.",
    side: "left" 
  },
  { 
    title: "Review Insights", 
    desc: "Explore detailed reports that highlight areas for improvement. We categorize issues by severity so you know exactly what needs your attention first.", 
    instruction: "Check the 'Critical' tab to address urgent architectural bottlenecks.",
    side: "right" 
  },
  { 
    title: "Optimize & Sync", 
    desc: "Apply suggested fixes and sync your progress. Export comprehensive analytics to share with your team and track your technical debt reduction over time.", 
    instruction: "Download your first full PDF report or sync with Jira/Slack.",
    side: "left" 
  },
];

export const SaaSJourneySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {

    gsap.to(backdropRef.current, {
      opacity: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
      },
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top center", 
        end: "bottom center", 
        scrub: 2, 
        onEnter: () => gsap.to(ballRef.current, { opacity: 1, duration: 0.3 }),
        onLeave: () => gsap.to(ballRef.current, { opacity: 0, duration: 0.3 }),
        onEnterBack: () => gsap.to(ballRef.current, { opacity: 1, duration: 0.3 }),
        onLeaveBack: () => gsap.to(ballRef.current, { opacity: 0, duration: 0.3 }),
      },
    });

    tl.to(ballRef.current, {
      y: () => triggerRef.current!.offsetHeight,
      ease: "none",
    }, 0);

    tl.to(progressLineRef.current, {
      scaleY: 1,
      ease: "none",
    }, 0);

    const cards = gsap.utils.toArray<HTMLElement>(".step-card");
    cards.forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        y: 100,
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          end: "top 50%",
          scrub: true,
        },
      });
    });

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative bg-transparent text-white py-40 w-full overflow-hidden z-[999]"
    >
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black opacity-0 pointer-events-none z-0"
      />

      <div ref={triggerRef} className="relative z-10 max-w-5xl mx-auto px-4 min-h-[500vh]">
        
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 -translate-x-1/2" />
        
        <div 
          ref={progressLineRef}
          className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-emerald-500 -translate-x-1/2 origin-top scale-y-0"
        />

        <div 
          ref={ballRef}
          className="absolute left-1/2 top-0 w-4 h-4 bg-emerald-400 rounded-full -translate-x-1/2 z-50 shadow-[0_0_20px_#10b981] opacity-0 pointer-events-none"
        />

        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[100%] pb-20">
          <span className="text-emerald-500 font-mono text-sm tracking-[0.4em] uppercase opacity-70 bg-black px-4 py-2 border border-emerald-500/20 rounded-full">
            Finish
          </span>
        </div>

        <div className="flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <div 
              key={i} 
              className={`step-card flex w-full min-h-[100vh] ${step.side === "left" ? "justify-start" : "justify-end"}`}
            >
              <div className="relative w-full md:w-[45%]">
                <div className="p-8 border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-emerald-500/30">
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono border border-emerald-500/20">
                      0{i + 1}
                    </span>
                    <h3 className="text-2xl font-bold tracking-tight">{step.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base mb-6">
                    {step.desc}
                  </p>

                  <div className="py-3 px-4 rounded-lg bg-emerald-500/5 border-l-2 border-emerald-500/50 mb-6">
                    <p className="text-xs text-emerald-200/70 font-mono leading-snug">
                      <span className="text-emerald-500 mr-2">{">"}</span>
                      {step.instruction}
                    </p>
                  </div>
                  
                  {/* 🔥 Container corrigido */}
                  <div className="mt-6 relative aspect-video w-full rounded-xl border border-white/5 overflow-hidden bg-black/40">
                    <Image
                      src={`/steps/step${i + 1}.png`}
                      alt={`Step ${i + 1}: ${step.title}`}
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                      priority={i === 0}
                    />
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
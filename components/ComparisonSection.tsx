"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from "gsap/ScrollTrigger";
import * as d3 from 'd3';
import { Cpu, Zap, Layers, MousePointer } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface DataPoint {
    x: number;
    y: number;
}

export const ComparisonSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const beforeOverlayRef = useRef<HTMLDivElement>(null);
    const cursorLabelRef = useRef<HTMLDivElement>(null);
    const topLineRef = useRef<HTMLDivElement>(null);

    const [latency, setLatency] = useState(12);
    const [throughput, setThroughput] = useState(1.2);

    const { cleanData, messyData } = useMemo(() => {
        const points = 30;
        const clean = Array.from({ length: points }, (_, i) => ({
            x: (i / (points - 1)) * 800,
            y: 100 + Math.sin(i * 0.4) * 30 + Math.random() * 10,
        }));

        const messy = Array.from({ length: points * 2 }, (_, i) => ({
            x: (i / (points * 2 - 1)) * 800,
            y: 40 + Math.random() * 180,
        }));

        return { cleanData: clean, messyData: messy };
    }, []);

    const lineMessy = d3.line<DataPoint>().x(d => d.x).y(d => d.y).curve(d3.curveStep);
    const lineClean = d3.line<DataPoint>().x(d => d.x).y(d => d.y).curve(d3.curveBasis);

    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(Math.floor(Math.random() * (16 - 11 + 1) + 11));
            setThroughput(parseFloat((Math.random() * (1.4 - 1.1) + 1.1).toFixed(2)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useGSAP(() => {
        if (topLineRef.current && containerRef.current) {
            gsap.set(topLineRef.current, {
                scaleX: 0,
                transformOrigin: "left center",
            });

            gsap.to(topLineRef.current, {
                scaleX: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    end: "top 30%",
                    scrub: true,
                },
            });
        }

        const handleMove = (e: MouseEvent) => {
            if (!containerRef.current || !sliderRef.current || !beforeOverlayRef.current || !cursorLabelRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const xPos = e.clientX - rect.left;
            const percent = (xPos / rect.width) * 100;
            const clampedPercent = Math.max(0, Math.min(100, percent));

            gsap.to(sliderRef.current, { left: `${clampedPercent}%`, duration: 0.1, ease: "none" });
            gsap.to(beforeOverlayRef.current, { width: `${clampedPercent}%`, duration: 0.1, ease: "none" });

            const isOptimized = clampedPercent > 50;
            cursorLabelRef.current.innerText = isOptimized ? "RAW_METADATA" : "ANALYTICS_MODE";

            gsap.to(cursorLabelRef.current, {
                color: isOptimized ? "#f87171" : "#57e071",
                borderColor: isOptimized ? "#f8717144" : "#57e07144",
                duration: 0.2
            });
        };

        const container = containerRef.current;
        container?.addEventListener("mousemove", handleMove);
        return () => container?.removeEventListener("mousemove", handleMove);
    }, { scope: containerRef });

    return (
        <section className="relative w-full bg-black px-10 py-32">

            {/* TOP GREEN LINE */}
            <div
                ref={topLineRef}
                className="pointer-events-none absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#57e071] to-transparent"
            />

            {/* MAIN ROW */}
            <div className="flex flex-col md:flex-row items-center gap-16">

                {/* CHART CONTAINER */}
                <div
                    ref={containerRef}
                    className="relative w-full md:w-[650px] h-[400px] bg-[#050505] border border-zinc-800 rounded-lg overflow-hidden cursor-crosshair group shadow-2xl"
                >
                    {/* 1. GRID BACKGROUND */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-20">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="border-[0.5px] border-zinc-700" />
                        ))}
                    </div>

                    {/* 2. INTERNAL HEADER */}
                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-md z-30">
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                            </div>
                            <span className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase italic">GitGraph_Commits_v1.0</span>
                        </div>
                        <div className="flex gap-4 font-mono text-[9px]">
                            <span className="text-zinc-600">SCALE: <span className="text-zinc-300">LOG_A</span></span>
                            <span className="text-zinc-600">
                                LATENCY: <span className="text-zinc-300 inline-block w-[28px]">{latency}ms</span>
                            </span>
                        </div>
                    </div>

                    {/* 3. Y-AXIS LABELS */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-10 z-30 opacity-40">
                        {[100, 75, 50, 25, 0].map(v => <span key={v} className="font-mono text-[8px] text-zinc-500">{v}%</span>)}
                    </div>

                    {/* LAYER: CLEAN LINE (BACK) */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pt-10">
                        <svg viewBox="0 0 800 250" className="w-full h-full p-12 overflow-visible">
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#57e071" stopOpacity="1" />
                                </linearGradient>
                            </defs>
                            <path
                                d={lineClean(cleanData) || ""}
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="3"
                                className="drop-shadow-[0_0_15px_rgba(87,224,113,0.4)]"
                            />
                        </svg>
                    </div>

                    {/* LAYER: MESSY LINE (OVERLAY) */}
                    <div
                        ref={beforeOverlayRef}
                        className="absolute inset-0 z-20 bg-[#050505] border-r border-green-500/30 overflow-hidden pt-10"
                        style={{ width: '50%' }}
                    >
                        <svg viewBox="0 0 800 250" className="w-[650px] h-full p-12 overflow-visible opacity-60">
                            <path
                                d={lineMessy(messyData) || ""}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="1.5"
                                strokeDasharray="4 2"
                            />
                        </svg>
                    </div>

                    {/* 4. SLIDER & SCANLINE */}
                    <div
                        ref={sliderRef}
                        className="absolute top-0 bottom-0 w-[1px] bg-white/20 z-40 pointer-events-none"
                        style={{ left: '50%' }}
                    >
                        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black border border-white/40 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        </div>

                        <div
                            ref={cursorLabelRef}
                            className="absolute bottom-6 left-4 font-mono text-[9px] font-bold bg-black/80 backdrop-blur-sm px-2 py-1 rounded border border-zinc-800 tracking-tighter"
                        >
                            RAW_METADATA
                        </div>
                    </div>

                    {/* 5. FOOTER STATS */}
                    <div className="absolute bottom-0 left-0 w-full p-3 flex justify-between items-end z-30">
                        <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                            <p className="font-mono text-[8px] text-zinc-500 leading-none mb-1">THROUGHPUT</p>
                            <p className="font-mono text-xs text-green-400 font-bold tracking-tighter w-[55px]">
                                {throughput}GB/s
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Global Status</p>
                            <p className="font-mono text-[9px] text-zinc-400">0x42_BUFFER_OK</p>
                        </div>
                    </div>
                </div>

                {/* CONTENT SIDE */}
                <div className="flex-1 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#57e071]/20 bg-[#57e071]/5 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#57e071] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#57e071]"></span>
                        </span>
                        <span className="text-[#57e071] font-mono text-[10px] tracking-widest uppercase">Efficiency_Protocol</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight leading-[1.1]">
                        Turn chaotic repos into <span className="italic font-serif text-zinc-300 underline underline-offset-8 decoration-green-500/30">strategic</span> clarity.
                    </h2>
                    <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                        GitGraph processes raw repository metadata through our proprietary analysis engine.
                        Uncover hidden patterns and reduce delivery time by up to <span className="text-white font-medium">30%</span>.
                    </p>
                </div>

            </div>

            {/* BOTTOM EFFICIENCY STRIP */}
            <div className="w-full mt-20 pt-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    <div className="flex flex-col gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <Cpu className="w-7 h-7 text-[#57e071]" />
                        </div>
                        <div>
                            <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Engine</span>
                            <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">Smart Parsing</h4>
                            <p className="text-zinc-500 text-lg">Normalizes raw GitHub events into structured analytical models.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <Zap className="w-7 h-7 text-[#57e071]" />
                        </div>
                        <div>
                            <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Performance</span>
                            <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">Low Latency</h4>
                            <p className="text-zinc-500 text-lg">Incremental processing pipeline for near real-time analytics.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <Layers className="w-7 h-7 text-[#57e071]" />
                        </div>
                        <div>
                            <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">Architecture</span>
                            <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">Modular Stack</h4>
                            <p className="text-zinc-500 text-lg">Decoupled ingestion, processing and visualization layers.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 group">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <MousePointer className="w-7 h-7 text-[#57e071]" />
                        </div>
                        <div>
                            <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                                Usability
                            </span>
                            <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">
                                Zero Setup
                            </h4>
                            <p className="text-zinc-500 text-lg">
                                Connect your GitHub account and get actionable insights in seconds.
                            </p>
                        </div>
                    </div>


                </div>
            </div>

        </section>
    );
};
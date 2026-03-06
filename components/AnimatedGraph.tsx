"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export const AnimatedGraphGSAP = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<SVGPathElement>(null);
    const areaRef = useRef<SVGPathElement>(null);
    const gridRef = useRef<SVGGElement>(null);

    useEffect(() => {
        if (lineRef.current && areaRef.current && gridRef.current && containerRef.current) {
            const length = lineRef.current.getTotalLength();

            // 1. Setup inicial imediato
            gsap.set(lineRef.current, { strokeDasharray: length, strokeDashoffset: length });
            gsap.set(areaRef.current, { opacity: 0 });
            gsap.set(gridRef.current.children, { opacity: 0 });

            const tl = gsap.timeline({
                defaults: { ease: "power2.inOut" },
                // Usando chaves para garantir que a função retorne void
                onStart: () => {
                    gsap.set(containerRef.current, { visibility: "visible", opacity: 1 });
                }
            });

            tl.to(gridRef.current.children, {
                opacity: 0.1,
                stagger: 0.05,
                duration: 0.5,
            })
                .to(lineRef.current, {
                    strokeDashoffset: 0,
                    duration: 2.5,
                }, "-=0.2")
                .to(areaRef.current, {
                    opacity: 0.1,
                    duration: 1,
                }, "-=1.5");
        }
    }, []);

    return (
        // v- Começa invisível para evitar o flicker (bug de 1ms)
        <div ref={containerRef} className="w-full h-full flex items-center justify-center invisible opacity-0">
            <svg viewBox="0 0 400 200" className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#57e071" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#57e071" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Linhas Verticais (Grid) */}
                <g ref={gridRef}>
                    {[...Array(11)].map((_, i) => (
                        <line
                            key={i}
                            x1={i * 40}
                            y1="0"
                            x2={i * 40}
                            y2="200"
                            stroke="#57e071"
                            strokeWidth="0.5"
                            strokeDasharray="3 3"
                        />
                    ))}
                </g>

                {/* Área preenchida */}
                <path
                    ref={areaRef}
                    d="M0,160 C50,160 80,40 150,40 C220,40 250,120 320,120 C360,120 380,20 400,20 L400,200 L0,200 Z"
                    fill="url(#graphGradient)"
                />

                {/* Linha do Gráfico (Sem Glow) */}
                <path
                    ref={lineRef}
                    d="M0,160 C50,160 80,40 150,40 C220,40 250,120 320,120 C360,120 380,20 400,20"
                    fill="none"
                    stroke="#57e071"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
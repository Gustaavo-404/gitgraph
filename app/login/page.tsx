"use client";

import React, { useRef } from "react";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimatedGraphGSAP } from "@/components/AnimatedGraph";

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(contentRef.current, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out",
    }).from(
      infoRef.current?.children || [],
      {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.5"
    );
  }, { scope: containerRef });

  return (
    <main
      ref={containerRef}
      className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center font-sans"
    >
      <div className="max-w-7xl mx-auto px-10 relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">

          {/* LADO ESQUERDO: Gráfico Minimalista */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-[600px] aspect-[4/3] flex items-center justify-center">
              <AnimatedGraphGSAP />

              {/* Elementos de UI extras */}
              <div className="absolute top-0 left-0 border-l border-t border-[#57e071]/30 w-10 h-10" />
              <div className="absolute bottom-0 right-0 border-r border-b border-[#57e071]/30 w-10 h-10" />

            </div>
          </div>

          {/* LADO DIREITO: autorização */}
          <div
            ref={contentRef}
            className="flex-1 flex flex-col items-start space-y-12 pl-16 py-6"
          >
            <div ref={infoRef} className="space-y-10">

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-[1px] w-10 bg-[#57e071]" />
                  <p className="text-[#57e071] font-mono text-xs tracking-widest uppercase">
                    Authorization Required
                  </p>
                </div>

                <h1 className="text-white text-5xl lg:text-7xl font-light tracking-tight leading-[1.1]">
                  Identify <span className="text-zinc-600">Access.</span>
                </h1>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl max-w-md font-mono text-sm text-zinc-400 leading-relaxed shadow-inner">
                <p className="text-zinc-200 mb-2 underline">SYSTEM_SPECS:</p>
                <p>&gt; Connection: Secure_OAuth_2.0</p>
                <p>&gt; Data_Source: GitHub_API_v3</p>
                <p>&gt; Purpose: Real-time Repository Analysis</p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() =>
                    signIn("github", { callbackUrl: "/dashboard" })
                  }
                  className="group relative flex items-center gap-4 rounded-full border border-white/20 bg-zinc-900/60 px-10 py-5 text-base overflow-hidden transition-all duration-300 cursor-pointer shadow-xl"
                >
                  <span className="absolute bottom-0 left-0 w-0 h-0 rounded-full bg-white transition-all duration-700 ease-out group-hover:w-[600px] group-hover:h-[600px] group-hover:-bottom-40 group-hover:-left-40" />

                  <FaGithub className="text-2xl relative z-10 text-white group-hover:text-black transition-colors duration-300" />
                  <span className="relative z-10 font-medium tracking-wide text-white group-hover:text-black transition-colors duration-300">
                    Login with GitHub
                  </span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
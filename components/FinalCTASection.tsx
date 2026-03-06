"use client";

import React, { useRef } from "react";
import { FaGithub } from "react-icons/fa";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { signIn } from "next-auth/react";

gsap.registerPlugin(ScrollTrigger);

export const FinalCTASection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useGSAP(() => {
    // 1. Revelação do conteúdo (Texto + Botão)
    gsap.from(contentRef.current, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
      },
    });

    // 2. Controle do Vídeo (Play único com delay)
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 30%",
      onEnter: () => {
        if (videoRef.current) {
          // Pequeno delay de 500ms após o trigger para dar um respiro visual
          setTimeout(() => {
            videoRef.current?.play();
          }, 500);
        }
      },
      // Impede que o vídeo rode de novo se o usuário subir e descer a página
      once: true
    });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full py-32 bg-black overflow-hidden border-t border-zinc-900"
    >
      <div className="max-w-7xl mx-auto px-10 relative z-10">
        <div ref={contentRef} className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-32">

          {/* LADO ESQUERDO: Vídeo da Logo */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-[800px] aspect-square overflow-hidden bg-zinc-950 shadow-2xl">
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/logoanimation.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* LADO DIREITO: Título e CTA */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#57e071]/20 bg-[#57e071]/5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#57e071] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#57e071]"></span>
              </span>
              <span className="text-[#57e071] font-mono text-[10px] tracking-widest uppercase italic">
                Ready_to_deploy
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-light text-white mb-8 tracking-tight leading-[1.1]">
              Start your <br />
              Journey Now.
            </h2>

            <p className="text-zinc-500 text-lg leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
              Transform your repository data into actionable intelligence. Connect in seconds, scale for years.
            </p>

            <div className="flex justify-center lg:justify-start">
              <button
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="group relative flex items-center gap-3 rounded-full border border-white/20 bg-zinc-900/50 px-8 py-4 text-base overflow-hidden transition-all duration-300 cursor-pointer shadow-xl"
              >
                <span className="absolute bottom-0 left-0 w-0 h-0 rounded-full bg-white transition-all duration-600 ease-out group-hover:w-[600px] group-hover:h-[600px] group-hover:-bottom-40 group-hover:-left-40" />
                <FaGithub className="text-xl relative z-10 text-white group-hover:text-black transition-colors duration-300" />
                <span className="relative z-10 font-medium text-white group-hover:text-black transition-colors duration-300">
                  Analyze my GitHub
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
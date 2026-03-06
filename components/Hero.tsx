"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { FaGithub } from "react-icons/fa";
import gsap from "gsap";
import SplitType from "split-type";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const gate = gateRef.current;
    if (!gate) return;

    const split = new SplitType(titleRef.current!, {
      types: "words"
    });

    gsap.set(split.words, { opacity: 0, y: 60 });
    gsap.set([statusRef.current, buttonsRef.current], {
      opacity: 0,
      y: 40
    });

    // Vídeo começa com zoom
    gsap.set(videoRef.current, {
      scale: 1.15
    });

    const tl = gsap.timeline();

    // Remove tela preta
    tl.to(gate, {
      opacity: 0,
      scale: 1.05,
      duration: 0.8,
      ease: "power3.out",
      onComplete: () => {
        gate.remove();
      }
    })

      // Zoom suave do vídeo
      .to(videoRef.current, {
        scale: 1,
        duration: 2,
        ease: "power2.out"
      }, "-=0.3")

      // SplitText
      .to(split.words, {
        opacity: 1,
        y: 0,
        stagger: 0.06,
        duration: 0.8,
        ease: "power4.out"
      }, "-=1.4")

      .to(statusRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, "-=0.6")

      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4
      }, "-=0.5");

    gsap.set(lineRef.current, {
      scaleX: 0,
      transformOrigin: "left center"
    });

    gsap.to(lineRef.current, {
      scaleX: 1,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: contentRef.current,
        start: "bottom 80%",
        toggleActions: "play none none reverse"
      }
    });

    return () => split.revert();
  }, []);

  return (
    <section className="relative h-[calc(120vh-4rem)] w-full overflow-hidden bg-black text-white mt-16">

      <div
        ref={gateRef}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      >
        <img
          src="/logo-load.png"
          alt="Loading"
          className="w-[50px] h-[50px]"
        />
      </div>

      {/* Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover object-[center_10%]"
        >
          <source src="/herovid.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="hero-hidden absolute inset-0 z-10 bg-black/40"
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="hero-hidden relative z-20 flex h-full w-full items-center"
      >
        <div className="ml-20 w-[50vw] mb-[25vh] flex flex-col gap-6 text-left">

          {/* Status */}
          <div
            ref={statusRef}
            className="flex items-center gap-2 text-xs tracking-widest uppercase text-zinc-300"
          >
            <span className="h-2 w-2 rounded-full bg-[#57e071] shadow-[0_0_10px_#57e071]" />
            GitHub Sync: Activated
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl font-normal leading-tight tracking-tight mb-5"
          >
            Turn your GitHub files into actionable insights
          </h1>

          {/* Buttons */}
          <div ref={buttonsRef} className="flex gap-4">
            <Link
              href="/login"
              className="group relative flex items-center justify-center rounded-full bg-white px-8 py-3 text-black font-medium overflow-hidden cursor-pointer"
            >
              <span
                className="absolute bottom-0 left-0 w-0 h-0 rounded-full transition-all duration-600 ease-out group-hover:w-[500px] group-hover:h-[500px] group-hover:-bottom-40 group-hover:-left-40"
                style={{ backgroundColor: "#57e071" }}
              />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                Get started
              </span>
            </Link>

            <button className="group relative flex items-center justify-center rounded-full border border-white/40 px-8 py-3 text-white font-medium overflow-hidden hover:border-white cursor-pointer">
              <span className="absolute bottom-0 left-0 w-0 h-0 rounded-full bg-white transition-all duration-600 ease-out group-hover:w-[500px] group-hover:h-[500px] group-hover:-bottom-40 group-hover:-left-40" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
                Read the docs
              </span>
            </button>
          </div>

        </div>
      </div>

      <div className="absolute bottom-4 left-20 z-30 flex items-center gap-2 text-[12px] text-zinc-400 tracking-widest uppercase">
        <FaGithub className="w-3 h-3 opacity-70" />
        Powered by GitHub API
      </div>

      {/* Gradient line */}
      <div
        ref={lineRef}
        className="
          pointer-events-none
          absolute bottom-0 left-0 z-30
          h-[2px] w-full
          bg-gradient-to-l
          from-zinc-400
          via-zinc-600
          to-black
        "
      />
    </section>
  );
}
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Github, Plug, BarChart3, Download } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const VideoFeatureSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
      }, 5000);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  useGSAP(() => {
    if (!topLineRef.current || !sectionRef.current) return;

    gsap.set(topLineRef.current, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.to(topLineRef.current, {
      scaleX: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "top 30%",
        scrub: true,
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-black flex flex-col items-center justify-center py-32 px-10"
    >
      {/* TOP GREEN LINE */}
      <div
        ref={topLineRef}
        className="pointer-events-none absolute top-0 left-0 h-[2px] w-full 
                   bg-gradient-to-r from-transparent via-[#57e071] to-transparent"
      />

      {/* TÍTULO */}
      <div className="w-full mb-16 text-center">
        <h2 className="text-5xl md:text-6xl font-light text-white tracking-tight leading-[1.05]">
          Seamless Workflow{" "}
          <span className="italic font-serif text-zinc-300 underline underline-offset-8 decoration-emerald-500/30">
            From Code to Insight
          </span>
        </h2>
      </div>

      {/* CONTAINER DO VÍDEO */}
      <div className="relative w-full max-w-6xl rounded-[2rem] overflow-hidden">
        <video
          ref={videoRef}
          src="/steps.mp4"
          autoPlay
          muted
          playsInline
          className="w-full h-auto block"
        />

        {/* Vinheta */}
        <div
          className="absolute inset-0 pointer-events-none 
                     shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]"
        />
      </div>

      {/* BOTTOM STEPS STRIP */}
      <div className="w-full mt-20 pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div className="flex flex-col gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Github className="w-7 h-7 text-[#57e071]" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                Step 01
              </span>
              <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">
                Login with GitHub
              </h4>
              <p className="text-zinc-500 text-lg">
                Authenticate securely using your GitHub account.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Plug className="w-7 h-7 text-[#57e071]" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                Step 02
              </span>
              <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">
                Connect Repositories
              </h4>
              <p className="text-zinc-500 text-lg">
                Select the repositories you want to analyze.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-[#57e071]" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                Step 03
              </span>
              <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">
                View Analytics
              </h4>
              <p className="text-zinc-500 text-lg">
                Explore performance, activity and code metrics.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Download className="w-7 h-7 text-[#57e071]" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                Step 04
              </span>
              <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-2">
                Export Reports
              </h4>
              <p className="text-zinc-500 text-lg">
                Download reports in PDF, JSON or CSV formats.
              </p>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};

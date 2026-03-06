"use client";

import React, { useRef } from 'react';
import { ShieldCheck, EyeOff, Lock, CheckCircle2, Server, ShieldAlert } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const SecuritySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (topLineRef.current && containerRef.current) {
      gsap.set(topLineRef.current, {
        scaleX: 0,
        transformOrigin: "right center",
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
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative w-full py-32 bg-[#030303] overflow-hidden border-t border-zinc-900"
    >
      {/* TOP GREEN LINE ANIMADA */}
      <div
        ref={topLineRef}
        className="pointer-events-none absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#57e071] to-transparent"
      />

      {/* Background Decorative */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #494949 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          {/* LEFT SIDE: Content */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#57e071]/20 bg-[#57e071]/5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#57e071] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#57e071]"></span>
              </span>
              <span className="text-[#57e071] font-mono text-[10px] tracking-widest uppercase">Security_Protocol</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight leading-[1.1]">
              Privacy as <br />
              <span className="italic font-serif text-zinc-300 underline underline-offset-8 decoration-green-500/30">First-Class</span> Citizen.
            </h2>
            
            <p className="text-zinc-500 text-lg leading-relaxed mb-12 max-w-lg">
              GitGraph operates on a <span className="text-white italic">stateless architecture</span>. We analyze your team's velocity and patterns without ever cloning or storing your private source code.
            </p>

            <div className="flex flex-col sm:flex-row gap-10 py-12 border-y border-zinc-900 mb-12">
              <div className="flex items-center gap-5 flex-1 group">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-[#57e071]/50 transition-colors duration-500">
                  <ShieldCheck className="w-7 h-7 text-[#57e071]" />
                </div>
                <div>
                  <span className="font-mono text-[9px] text-zinc-600 block mb-1 uppercase tracking-widest">Compliance</span>
                  <h4 className="text-white text-sm font-bold leading-tight tracking-widest uppercase">SOC2 Type II<br/><span className="text-[#57e071]">Compliant</span></h4>
                </div>
              </div>

              <div className="w-px h-16 bg-zinc-800 hidden sm:block" />

              <div className="flex items-center gap-5 flex-1 group">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-[#57e071]/50 transition-colors duration-500">
                  <EyeOff className="w-7 h-7 text-[#57e071]" />
                </div>
                <div>
                  <span className="font-mono text-[9px] text-zinc-600 block mb-1 uppercase tracking-widest">Protocol</span>
                  <h4 className="text-white text-sm font-bold leading-tight tracking-widest uppercase">Zero Code<br/><span className="text-[#57e071]">Access</span></h4>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The "Audit" Vault */}
          <div className="flex-1 w-full max-w-xl">
            <div className="relative p-[1px] bg-gradient-to-br from-zinc-800 to-transparent rounded-[2rem]">
              <div className="bg-[#050505] rounded-[1.95rem] p-10 border border-zinc-900 shadow-2xl">
                
                <div className="flex justify-between items-center mb-12">
                  <div className="space-y-2">
                    <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest italic">Data_Access_Log</div>
                  </div>
                  <ShieldAlert className="w-5 h-5 text-zinc-800" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12">
                  <div className="space-y-10">
                    <div className="group">
                      <div className="font-mono text-[8px] text-zinc-600 mb-2 uppercase tracking-widest">Auth_Protocol</div>
                      <div className="text-zinc-300 text-xs flex items-center gap-2 font-mono">
                        GitHub OAuth 2.0
                        <CheckCircle2 className="w-3 h-3 text-[#57e071]" />
                      </div>
                    </div>
                    <div className="group">
                      <div className="font-mono text-[8px] text-zinc-600 mb-2 uppercase tracking-widest">Encryption_Std</div>
                      <div className="text-zinc-300 text-xs font-mono">AES-256-GCM</div>
                    </div>
                  </div>

                  <div className="space-y-10 border-l border-zinc-900 pl-8">
                    <div className="group">
                      <div className="font-mono text-[8px] text-zinc-600 mb-2 uppercase tracking-widest">Storage_Policy</div>
                      <div className="text-zinc-300 text-xs font-mono italic">Non-Persistent</div>
                    </div>
                    <div className="group">
                      <div className="font-mono text-[8px] text-zinc-600 mb-2 uppercase tracking-widest">Network_Layer</div>
                      <div className="text-zinc-300 text-xs font-mono tracking-tight uppercase">VPC_Isolated</div>
                    </div>
                  </div>
                </div>

                <div className="mt-14 p-5 rounded-xl bg-[#0a0a0a] border border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest leading-none">Global Status</span>
                      <span className="font-mono text-[9px] text-zinc-400">AWS-US-EAST-1_OK</span>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded bg-zinc-900/50 border border-zinc-800 text-[8px] font-mono text-[#57e071] font-bold">
                    HARDENED
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
               <div className="text-[9px] font-mono border border-zinc-800 px-4 py-2 text-zinc-500 tracking-tighter cursor-default">SOC2_TYPE_II</div>
               <div className="text-[9px] font-mono border border-zinc-800 px-4 py-2 text-zinc-500 tracking-tighter cursor-default">ISO_27001_READY</div>
               <div className="text-[9px] font-mono border border-zinc-800 px-4 py-2 text-zinc-500 tracking-tighter cursor-default">GDPR_COMPLIANT</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
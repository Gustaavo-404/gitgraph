"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export const ScrollTypographySection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const text = new SplitType(".wordscroll", { types: "chars" });
    const chars = text.chars;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=300%",
        scrub: 1.2,
        pin: true,
      },
    });

    // Estado inicial: Invisível, disperso e sem brilho
    gsap.set(chars, {
      opacity: 0,
      scale: 2,
      z: -800,
      rotateY: 45,
      backgroundPosition: "-200% 0",
      filter: "blur(15px) brightness(0.5)"
    });

    // Timeline principal
    tl.to(chars, {
      opacity: 1,
      scale: 1,
      z: 0,
      rotateY: 0,
      filter: "blur(0px) brightness(1)",
      stagger: {
        amount: 1.5,
        from: "random",
      },
      ease: "expo.out",
    })
      // Efeito de Luz passando (Light Sweep)
      .to(chars, {
        backgroundPosition: "200% 0",
        duration: 1,
        stagger: {
          amount: 1,
          from: "start"
        },
        ease: "power1.inOut"
      }, "-=1")

      // Despedida (Afastamento)
      .to(chars, {
        opacity: 0,
        z: 1000,
        scale: 0.8,
        filter: "blur(10px)",
        stagger: 0.03,
        ease: "power2.in"
      }, "+=0.2");

  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full bg-black z-[999] flex items-center justify-center overflow-hidden"
    >
      <div className="flex flex-col items-center gap-10 text-center">
        {["Sign in", "Connect", "Analyze"].map((phrase, i) => (
          <h2
            key={i}
            className={`wordscroll text-5xl z-[50] md:text-9xl font-normal tracking-tighter uppercase 
               ${i === 2 ? 'text-emerald-500 italic' : 'text-white'}`}
            style={{
              perspective: "1000px",
              backgroundImage: "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              backgroundRepeat: "no-repeat"
            }}
          >
            {phrase}
          </h2>
        ))}
      </div>
    </section>
    
  );
};
"use client";

import Image from "next/image";

const logos = [
  { src: "/tech/github.png", alt: "GitHub" },
  { src: "/tech/nextjs.png", alt: "Next.js" },
  { src: "/tech/react.png", alt: "React" },
  { src: "/tech/typescript.png", alt: "TypeScript" },
  { src: "/tech/postgre.png", alt: "PostgreSQL" },
  { src: "/tech/prisma.png", alt: "Prisma" },
];

export function TechCarousel() {
  return (
    <section className="relative w-full overflow-hidden bg-black py-16">
      
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-black to-transparent" />

      <div className="flex w-max animate-scroll gap-20 px-8">
        {[...logos, ...logos].map((logo, i) => (
          <div key={i} className="flex items-center opacity-80 hover:opacity-100 transition">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
              priority={i < logos.length}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

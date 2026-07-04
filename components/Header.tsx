"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaChevronDown, FaBars, FaTimes } from "react-icons/fa";
import ScrollTrigger from "gsap/ScrollTrigger";

const productItemsCol1 = [
  {
    title: "Analytics",
    desc: "Real-time tracking of commit history, PR cycles, and codebase velocity.",
    href: "/#analytics",
  },
  {
    title: "Insights",
    desc: "Detect team bottlenecks, delivery pacing, and project maintenance risks.",
    href: "/#insights",
  },
  {
    title: "Repository Metadata",
    desc: "Multi-repo telemetry tables designed to compare and rank projects instantly.",
    href: "/#comparison",
  },
];

const productItemsCol2 = [
  {
    title: "Auth Protocol",
    desc: "Stateless authentication with NextAuth.js to protect source code privacy.",
    href: "/#security",
  },
  {
    title: "Workflow",
    desc: "Automated scoring engines translating raw git metadata into health scores.",
    href: "/#workflow",
  },
  {
    title: "CI/CD Integrations",
    desc: "Automated code health checks and quality gates inside your CI/CD pipelines.",
    href: "/docs?cat=getting-started#cicd-integrations",
  },
];

const resourceItems = [
  {
    title: "Changelog",
    desc: "Track new feature releases, system upgrades, and performance patches.",
    href: "/docs?cat=changelog",
  },
  {
    title: "Contact",
    desc: "Contact the creator directly for architectural questions and support.",
    href: "/docs?cat=about#creator-profile",
  },
  {
    title: "Repository",
    desc: "Explore our open-source codebase on GitHub to audit schemas or contribute.",
    href: "https://github.com/Gustaavo-404/gitgraph",
    external: true,
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);

    if (href.startsWith("http") || href.startsWith("/docs")) {
      return;
    }

    if (window.location.pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "").replace("#", "");
      const element = document.getElementById(targetId);

      if (element) {
        let targetY = 0;
        const isHorizontalPanel = ["analytics", "insights"].includes(targetId);

        if (isHorizontalPanel) {
          let trigger = null;
          try {
            trigger = ScrollTrigger.getById("horizontal");
          } catch (err) {
            console.warn("GSAP ScrollTrigger não disponível no momento:", err);
          }

          if (trigger) {
            let progress = 0; // Analytics
            if (targetId === "insights") progress = 0.5; // Insights

            targetY = trigger.start + (trigger.end - trigger.start) * progress;
          } else {
            const parent = document.getElementById("horizontal-feature");
            if (parent) {
              const parentTop = parent.offsetTop;
              let progress = 0;
              if (targetId === "insights") progress = 0.5;
              
              const pinDuration = 3 * window.innerWidth;
              targetY = parentTop + pinDuration * progress;
            } else {
              targetY = element.getBoundingClientRect().top + window.pageYOffset;
            }
          }
        } else {
          targetY = element.getBoundingClientRect().top + window.pageYOffset;
        }

        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        });

        window.history.pushState(null, "", href);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-black/70 text-white border-b border-white/10 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">

        {/* Left - Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <Image
            src="/logo.png"
            alt="Logo"
            width={35}
            height={35}
            priority
          />
          <span className="text-lg font-normal tracking-tight">
            GitGraph
          </span>
        </Link>

        {/* Center - Nav (Desktop only) */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">

          {/* PRODUCT */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-white transition py-5">
              Product
              <FaChevronDown className="text-xs opacity-70 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Dropdown */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-[560px] rounded-xl border border-white/10 bg-zinc-950 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                    Core capabilities
                  </p>
                  <div className="space-y-1">
                    {productItemsCol1.map((item, idx) => (
                      <DropdownItem key={idx} {...item} onClick={(e) => handleScrollClick(e, item.href)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                    Security & Meta
                  </p>
                  <div className="space-y-1">
                    {productItemsCol2.map((item, idx) => (
                      <DropdownItem key={idx} {...item} onClick={(e) => handleScrollClick(e, item.href)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESOURCES */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-white transition py-5">
              Resources
              <FaChevronDown className="text-xs opacity-70 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Dropdown */}
            <div className="absolute left-0 top-full w-[280px] rounded-xl border border-white/10 bg-zinc-950 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl">
              <div className="space-y-1">
                {resourceItems.map((item, idx) => (
                  <DropdownItem key={idx} {...item} onClick={(e) => handleScrollClick(e, item.href)} />
                ))}
              </div>
            </div>
          </div>

          <Link href="/docs" className="hover:text-white transition">Docs</Link>
          <Link href="/docs?cat=about" className="hover:text-white transition">About</Link>
        </nav>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Botão de login do topo - Ajustado com 'hidden md:flex' para esconder no mobile */}
          <Link
            href="/login"
            className="hidden md:flex group relative items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm overflow-hidden transition-all duration-300 cursor-pointer"
          >
            <span className="absolute bottom-0 left-0 w-0 h-0 rounded-full bg-white transition-all duration-600 ease-out group-hover:w-[500px] group-hover:h-[500px] group-hover:-bottom-40 group-hover:-left-40" />
            <FaGithub className="text-lg relative z-10 text-white group-hover:text-black transition-colors duration-300" />
            <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300">
              Connect GitHub
            </span>
          </Link>

          {/* Botão de Toggle Menu (Mobile only) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-lg border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#030303]/95 border-b border-white/10 backdrop-blur-md z-50 px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] animate-in slide-in-from-top-4 duration-200">
          
          <div className="space-y-4">
            
            {/* Mobile Product Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setMobileProductOpen(!mobileProductOpen)}
                className="w-full flex items-center justify-between text-base font-normal text-zinc-300 hover:text-white py-2 transition focus:outline-none"
              >
                <span>Product</span>
                <FaChevronDown className={`text-xs transition-transform duration-300 ${mobileProductOpen ? "rotate-180" : ""}`} />
              </button>

              {mobileProductOpen && (
                <div className="pl-4 border-l border-white/10 mt-2 space-y-4 animate-in fade-in duration-200">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Core Capabilities</p>
                  {productItemsCol1.map((item, idx) => (
                    <MobileDropdownItem key={idx} {...item} onClick={(e) => handleScrollClick(e, item.href)} />
                  ))}
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono pt-2">Security & Meta</p>
                  {productItemsCol2.map((item, idx) => (
                    <MobileDropdownItem key={idx} {...item} onClick={(e) => handleScrollClick(e, item.href)} />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Resources Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                className="w-full flex items-center justify-between text-base font-normal text-zinc-300 hover:text-white py-2 transition focus:outline-none"
              >
                <span>Resources</span>
                <FaChevronDown className={`text-xs transition-transform duration-300 ${mobileResourcesOpen ? "rotate-180" : ""}`} />
              </button>

              {mobileResourcesOpen && (
                <div className="pl-4 border-l border-white/10 mt-2 space-y-4 animate-in fade-in duration-200">
                  {resourceItems.map((item, idx) => (
                    <MobileDropdownItem key={idx} {...item} onClick={(e) => handleScrollClick(e, item.href)} />
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-normal text-zinc-300 hover:text-white py-2 transition"
            >
              Docs
            </Link>

            <Link
              href="/docs?cat=about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-normal text-zinc-300 hover:text-white py-2 transition"
            >
              About
            </Link>

          </div>

          {/* Connect GitHub (Disponível apenas aqui em telas menores) */}
          <div className="pt-4 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold py-3 text-sm hover:bg-zinc-200 transition active:scale-95"
            >
              <FaGithub className="text-lg" />
              <span>Connect GitHub</span>
            </Link>
          </div>

        </div>
      )}
    </header>
  );
}

function DropdownItem({ 
  title, 
  desc, 
  href, 
  external,
  onClick
}: { 
  title: string; 
  desc: string; 
  href: string; 
  external?: boolean; 
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className="block cursor-pointer rounded-lg p-2 hover:bg-white/5 transition"
    >
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
    </Link>
  );
}

function MobileDropdownItem({
  title,
  desc,
  href,
  external,
  onClick,
}: {
  title: string;
  desc: string;
  href: string;
  external?: boolean;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="block py-1 group"
    >
      <p className="text-sm font-medium text-white group-hover:text-zinc-300 transition">{title}</p>
      <p className="text-xs text-zinc-500 mt-0.5 leading-normal">{desc}</p>
    </Link>
  );
}
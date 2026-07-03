"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaChevronDown, FaLinkedin } from "react-icons/fa";
import {
  BookOpen,
  Key,
  Database,
  LineChart,
  ShieldAlert,
  Download,
  Terminal,
  Layers,
  ChevronRight,
  Code,
  Lock,
  Cpu,
  CheckCircle2,
  Search,
  ExternalLink,
  Mail,
  User,
  Globe,
  Info,
  Command,
  Menu,
  X
} from "lucide-react";

// Definição da estrutura de capítulos por categoria
interface Chapter {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
}

type CategoryType = "getting-started" | "about" | "changelog";

const CHAPTERS_MAP: Record<CategoryType, Chapter[]> = {
  "getting-started": [
    { id: "introduction", title: "Introduction", desc: "Core telemetry and code health scoring dashboard overview.", icon: BookOpen },
    { id: "authentication", title: "GitHub OAuth Config", desc: "Secure authentication pipeline configured via NextAuth.js.", icon: Key },
    { id: "node-connection", title: "Node Ingestion", desc: "Sync repositories as individual nodes inside the workspace schema.", icon: Database },
    { id: "analytics-engine", title: "Classification Engine", desc: "Maturity metrics, risk profiling, and score calculation.", icon: LineChart },
    { id: "export-protocols", title: "Export Protocols", desc: "Extract parsed project data to CSV, PDF, or JSON schemas.", icon: Download },
    { id: "security-standards", title: "Security Standards", desc: "SOC2 compliance, VPC-isolation, and zero-cloning standards.", icon: ShieldAlert },
  ],
  "about": [
    { id: "project-mission", title: "Vision & Mission", desc: "The strategy behind decoupling telemetry for engineering velocity.", icon: Layers },
    { id: "problem-solved", title: "Problem Solved", desc: "How we eliminate high bus factors and invisible technical debt.", icon: Terminal },
    { id: "creator-profile", title: "The Creator", desc: "Created and maintained by Gustavo Medeiros de Barros.", icon: User },
  ],
  "changelog": [
    { id: "v1-0-0", title: "Release v1.0.0", desc: "Initial launch of authentication models and export pipelines.", icon: CheckCircle2 },
    { id: "future-releases", title: "Future Roadmap", desc: "Upcoming integration support for Slack, Discord and webhooks.", icon: Cpu },
  ]
};

export default function DocsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("getting-started");
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Escuta o atalho Cmd+K / Ctrl+K para abrir a busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Foca no input de busca ao abrir a paleta de comandos
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Monitora qual seção está visível para atualizar o menu lateral
  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-25% 0px -55% 0px",
    });

    const currentChapters = CHAPTERS_MAP[activeCategory];
    currentChapters.forEach((chapter) => {
      const el = document.getElementById(chapter.id);
      if (el && observer.current) observer.current.observe(el);
    });

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [activeCategory]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -230; // Offset ajustado para considerar o header e o sub-header sticky
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleDropdownSelect = (category: CategoryType, id: string) => {
    setActiveCategory(category);
    setTimeout(() => {
      scrollToSection(id);
    }, 100);
  };

  const handleMobileTabSelect = (category: CategoryType, id: string) => {
    setActiveCategory(category);
    setTimeout(() => {
      scrollToSection(id);
    }, 100);
  };

  // Filtra itens de todas as seções para o mecanismo de busca
  const allSearchableItems = useMemo(() => {
    const items: Array<{ id: string; title: string; category: CategoryType; categoryLabel: string }> = [];
    
    Object.entries(CHAPTERS_MAP).forEach(([catKey, chapters]) => {
      const categoryLabel = catKey === "getting-started" ? "Getting Started" : catKey === "about" ? "About Platform" : "Changelog";
      chapters.forEach((ch) => {
        items.push({
          id: ch.id,
          title: ch.title,
          category: catKey as CategoryType,
          categoryLabel: categoryLabel
        });
      });
    });

    return items;
  }, []);

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allSearchableItems.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allSearchableItems]);

  const handleSearchSelect = (category: CategoryType, id: string) => {
    setActiveCategory(category);
    setIsSearchOpen(false);
    setSearchQuery("");
    
    setTimeout(() => {
      scrollToSection(id);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 selection:bg-[#57e071]/30 selection:text-white pt-32 pb-24 md:pb-12 overflow-x-hidden">
      
      {/* Background Decorative Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ================= HEADER PRINCIPAL ================= */}
      <header className="fixed top-0 left-0 z-50 w-full bg-black/70 text-white border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
          
          {/* Left - Logo & Docs Title with vertical divider */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition shrink-0">
              <Image src="/logo.png" alt="Logo" width={35} height={35} priority />
              <span className="text-lg font-normal tracking-tight">GitGraph</span>
            </Link>
            <div className="h-4 w-px bg-white/20 shrink-0" />
            <span className="text-sm font-medium text-zinc-400 shrink-0">Docs</span>
          </div>

          {/* Center - Search Bar (Desktop only) */}
          <div className="relative w-full max-w-md mx-8 hidden sm:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-400 transition"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-zinc-500" />
                <span>Search documentation...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-500 font-mono">
                <Command className="w-2.5 h-2.5 inline mr-1" /> K
              </kbd>
            </button>
          </div>

          {/* Right - CTA (Desktop only) */}
          <div className="hidden md:block">
            <Link
              href="/login"
              className="group relative flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm overflow-hidden transition-all duration-300 cursor-pointer"
            >
              <span className="absolute bottom-0 left-0 w-0 h-0 rounded-full bg-white transition-all duration-600 ease-out group-hover:w-[500px] group-hover:h-[500px] group-hover:-bottom-40 group-hover:-left-40" />
              <FaGithub className="text-lg relative z-10 text-white group-hover:text-black transition-colors duration-300" />
              <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300">
                Connect GitHub
              </span>
            </Link>
          </div>

          {/* Mobile Hamburger Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-zinc-400 hover:text-white transition p-2 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Hamburger Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-[#030303]/95 border-b border-white/10 z-50 p-6 space-y-4 animate-in slide-in-from-top-4 duration-200 backdrop-blur-md">
          {/* Search Trigger */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-500" />
              <span>Search...</span>
            </div>
            <Command className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {/* Connect GitHub */}
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold py-3 text-sm transition active:scale-95"
          >
            <FaGithub className="text-lg" />
            <span>Connect GitHub</span>
          </Link>
        </div>
      )}

      {/* ================= SECONDARY STICKY SUB-HEADER (DESKTOP DROPDOWNS) ================= */}
      <div className="fixed top-16 left-0 z-40 w-full bg-[#030303]/80 border-b border-white/10 backdrop-blur h-14 hidden md:block">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-start px-8 gap-8 relative">
          
          {/* Item 1: Getting Started */}
          <div className="relative group h-full flex items-center">
            <button
              onClick={() => {
                setActiveCategory("getting-started");
                scrollToSection("introduction");
              }}
              className={`flex items-center gap-1.5 hover:text-white transition text-sm h-full ${
                activeCategory === "getting-started" ? "text-white font-semibold" : "text-zinc-400"
              }`}
            >
              Getting Started
              <FaChevronDown className="text-[10px] opacity-70 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Barra indicadora branca inferior */}
            {activeCategory === "getting-started" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white z-50 animate-in fade-in duration-300" />
            )}

            {/* Dropdown Getting Started */}
            <div className="absolute left-0 top-full mt-0 w-[520px] rounded-xl border border-white/10 bg-zinc-950 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl shadow-black/80">
              <div className="grid grid-cols-2 gap-4">
                {CHAPTERS_MAP["getting-started"].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleDropdownSelect("getting-started", ch.id)}
                      className="cursor-pointer rounded-lg p-2.5 hover:bg-white/5 transition flex items-start gap-3"
                    >
                      <Icon className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-white">{ch.title}</p>
                        <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{ch.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Item 2: About Platform */}
          <div className="relative group h-full flex items-center">
            <button
              onClick={() => {
                setActiveCategory("about");
                scrollToSection("project-mission");
              }}
              className={`flex items-center gap-1.5 hover:text-white transition text-sm h-full ${
                activeCategory === "about" ? "text-white font-semibold" : "text-zinc-400"
              }`}
            >
              About Platform
              <FaChevronDown className="text-[10px] opacity-70 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Barra indicadora branca inferior */}
            {activeCategory === "about" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white z-50 animate-in fade-in duration-300" />
            )}

            {/* Dropdown About Platform */}
            <div className="absolute left-0 top-full mt-0 w-[300px] rounded-xl border border-white/10 bg-zinc-950 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl shadow-black/80">
              <div className="space-y-1">
                {CHAPTERS_MAP["about"].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleDropdownSelect("about", ch.id)}
                      className="cursor-pointer rounded-lg p-2.5 hover:bg-white/5 transition flex items-start gap-3"
                    >
                      <Icon className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-white">{ch.title}</p>
                        <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{ch.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Item 3: Changelog */}
          <div className="relative group h-full flex items-center">
            <button
              onClick={() => {
                setActiveCategory("changelog");
                scrollToSection("v1-0-0");
              }}
              className={`flex items-center gap-1.5 hover:text-white transition text-sm h-full ${
                activeCategory === "changelog" ? "text-white font-semibold" : "text-zinc-400"
              }`}
            >
              Changelog
              <FaChevronDown className="text-[10px] opacity-70 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Barra indicadora branca inferior */}
            {activeCategory === "changelog" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white z-50 animate-in fade-in duration-300" />
            )}

            {/* Dropdown Changelog */}
            <div className="absolute left-0 top-full mt-0 w-[300px] rounded-xl border border-white/10 bg-zinc-950 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl shadow-black/80">
              <div className="space-y-1">
                {CHAPTERS_MAP["changelog"].map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleDropdownSelect("changelog", ch.id)}
                      className="cursor-pointer rounded-lg p-2.5 hover:bg-white/5 transition flex items-start gap-3"
                    >
                      <Icon className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-white">{ch.title}</p>
                        <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{ch.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= MOBILE BOTTOM STICKY NAVIGATION BAR ================= */}
      <div className="fixed bottom-0 left-0 z-40 w-full bg-black/90 border-t border-white/10 backdrop-blur-md h-16 flex items-center justify-around md:hidden">
        
        {/* Mobile Tab: Getting Started */}
        <button
          onClick={() => handleMobileTabSelect("getting-started", "introduction")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative focus:outline-none ${
            activeCategory === "getting-started" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {activeCategory === "getting-started" && (
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-white rounded-full animate-in fade-in duration-300" />
          )}
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium font-mono">Started</span>
        </button>

        {/* Mobile Tab: About */}
        <button
          onClick={() => handleMobileTabSelect("about", "project-mission")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative focus:outline-none ${
            activeCategory === "about" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {activeCategory === "about" && (
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-white rounded-full animate-in fade-in duration-300" />
          )}
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium font-mono">Platform</span>
        </button>

        {/* Mobile Tab: Changelog */}
        <button
          onClick={() => handleMobileTabSelect("changelog", "v1-0-0")}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative focus:outline-none ${
            activeCategory === "changelog" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {activeCategory === "changelog" && (
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-white rounded-full animate-in fade-in duration-300" />
          )}
          <Cpu className="w-5 h-5" />
          <span className="text-[10px] font-medium font-mono">Logs</span>
        </button>

      </div>

      {/* ================= DOCS WORKSPACE CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-4 md:pt-6 pb-12 relative z-10 w-full overflow-hidden">
        
        <div className="flex flex-col lg:flex-row gap-12 relative items-start w-full">
          
          {/* ================= SIDEBAR LATERAL (Escondida em Mobile/Tablet) ================= */}
          <aside className="hidden lg:block w-64 shrink-0 lg:sticky space-y-2 border-b lg:border-b-0 pb-6 lg:pb-0 border-zinc-900">
            <span className="font-mono text-[9px] text-zinc-600 block mb-4 uppercase tracking-widest">
              Sections ({CHAPTERS_MAP[activeCategory].length})
            </span>
            <nav className="space-y-1">
              {CHAPTERS_MAP[activeCategory].map((chapter) => {
                const Icon = chapter.icon;
                const isActive = activeSection === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => scrollToSection(chapter.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-300 ${
                      isActive
                        ? "bg-zinc-950/60 border-zinc-700 text-white font-medium shadow-[0_4px_20px_rgba(255,255,255,0.02)]"
                        : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-950/20"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors duration-300 ${
                        isActive ? "text-white" : "text-zinc-600"
                      }`}
                    />
                    <span className="truncate">{chapter.title}</span>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 text-white ml-auto animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ================= CONTEÚDO DINÂMICO CONFORME CATEGORIA ================= */}
          <main className="flex-1 min-w-0 space-y-24 pb-32 w-full max-w-full overflow-hidden">
            
            {/* CATEGORIA 1: GETTING STARTED */}
            {activeCategory === "getting-started" && (
              <>
                {/* Section: Introduction */}
                <section id="introduction" className="scroll-mt-32 space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[01]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">Introduction</h2>
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    GitGraph is a high-integrity analytical platform built to ingest raw GitHub repository telemetry and convert it into high-fidelity dashboards. Through stateless processing, the application generates a comprehensive <span className="text-white italic">Health Score</span>, identifies workflow vulnerabilities, and supports advanced tabular comparisons across your engineering portfolio.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-5 rounded-2xl bg-[#050505] border border-zinc-900">
                      <Cpu className="w-5 h-5 text-[#57e071] mb-3" />
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                        Predictive Health Engines
                      </h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        Processes issues, commits, and pull requests into complex maturity rankings and risk profiles.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#050505] border border-zinc-900">
                      <Layers className="w-5 h-5 text-[#57e071] mb-3" />
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                        Universal Data Export
                      </h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        Provides clean endpoints and interfaces to extract parsed metrics in structured CSV, PDF, and JSON schemas.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section: GitHub OAuth Config */}
                <section id="authentication" className="scroll-mt-32 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[02]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">GitHub OAuth Configuration</h2>
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    User authentication is delegated strictly to <strong>NextAuth.js</strong> via the official GitHub Provider. This pattern leverages short-lived stateless JSON Web Tokens (JWT) protecting core API routes.
                  </p>

                  {/* Code Snippet 1 com Destaque de Sintaxe Avançado (IDE Theme) */}
                  <div className="rounded-xl border border-zinc-900 bg-[#050505] overflow-hidden max-w-full">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-[#0a0a0a]">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-mono text-[10px] text-zinc-400">
                          app/api/auth/[...nextauth]/route.ts
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600">TypeScript</span>
                    </div>
                    <pre className="p-5 overflow-x-auto font-mono text-xs leading-relaxed text-[#abb2bf] bg-[#050505] max-w-full">
                      <code>
                        <div>
                          <span className="text-[#c678dd]">import</span> NextAuth <span className="text-[#c678dd]">from</span> <span className="text-[#98c379]">"next-auth"</span>;
                        </div>
                        <div>
                          <span className="text-[#c678dd]">import</span> GithubProvider <span className="text-[#c678dd]">from</span> <span className="text-[#98c379]">"next-auth/providers/github"</span>;
                        </div>
                        <div className="my-2" />
                        <div>
                          <span className="text-[#c678dd]">export const</span> <span className="text-[#e06c75]">authOptions</span> = {"{"}
                        </div>
                        <div className="pl-4">
                          <span className="text-[#e06c75]">providers</span>: [
                        </div>
                        <div className="pl-8">
                          <span className="text-[#61afef]">GithubProvider</span>({"{"}
                        </div>
                        <div className="pl-12">
                          <span className="text-[#e06c75]">clientId</span>: <span className="text-[#e5c07b]">process</span>.<span className="text-[#e5c07b]">env</span>.<span className="text-[#e06c75]">GITHUB_ID</span>!,
                        </div>
                        <div className="pl-12">
                          <span className="text-[#e06c75]">clientSecret</span>: <span className="text-[#e5c07b]">process</span>.<span className="text-[#e5c07b]">env</span>.<span className="text-[#e06c75]">GITHUB_SECRET</span>!,
                        </div>
                        <div className="pl-12">
                          <span className="text-[#e06c75]">authorization</span>: {"{"}
                        </div>
                        <div className="pl-16">
                          <span className="text-[#e06c75]">params</span>: {"{"} <span className="text-[#e06c75]">scope</span>: <span className="text-[#98c379]">"read:user repo"</span> {"}"},
                        </div>
                        <div className="pl-12">{"}"},
                        </div>
                        <div className="pl-8">{"}"}),
                        </div>
                        <div className="pl-4">],
                        </div>
                        <div className="pl-4">
                          <span className="text-[#e06c75]">callbacks</span>: {"{"}
                        </div>
                        <div className="pl-8">
                          <span className="text-[#c678dd]">async</span> <span className="text-[#61afef]">jwt</span>({"{"} <span className="text-[#e5c07b]">token</span>, <span className="text-[#e5c07b]">account</span> {"}"}) {"{"}
                        </div>
                        <div className="pl-12">
                          <span className="text-[#c678dd]">if</span> (<span className="text-[#e5c07b]">account</span>) {"{"}
                        </div>
                        <div className="pl-16">
                          <span className="text-[#e5c07b]">token</span>.<span className="text-[#e06c75]">accessToken</span> = <span className="text-[#e5c07b]">account</span>.<span className="text-[#e06c75]">access_token</span>;
                        </div>
                        <div className="pl-12">{"}"}
                        </div>
                        <div className="pl-12">
                          <span className="text-[#c678dd]">return</span> <span className="text-[#e5c07b]">token</span>;
                        </div>
                        <div className="pl-8">{"}"},
                        </div>
                        <div className="pl-8">
                          <span className="text-[#c678dd]">async</span> <span className="text-[#61afef]">session</span>({"{"} <span className="text-[#e5c07b]">session</span>, <span className="text-[#e5c07b]">token</span> {"}"}) {"{"}
                        </div>
                        <div className="pl-12">
                          <span className="text-[#e5c07b]">session</span>.<span className="text-[#e06c75]">accessToken</span> = <span className="text-[#e5c07b]">token</span>.<span className="text-[#e06c75]">accessToken</span>;
                        </div>
                        <div className="pl-12">
                          <span className="text-[#c678dd]">return</span> <span className="text-[#e5c07b]">session</span>;
                        </div>
                        <div className="pl-8">{"}"}
                        </div>
                        <div className="pl-4">{"}"}
                        </div>
                        <div>{"}"};
                        </div>
                        <div className="my-2" />
                        <div>
                          <span className="text-[#c678dd]">const</span> <span className="text-[#61afef]">handler</span> = <span className="text-[#61afef]">NextAuth</span>(<span className="text-[#e06c75]">authOptions</span>);
                        </div>
                        <div>
                          <span className="text-[#c678dd]">export</span> {"{"} <span className="text-[#e5c07b]">handler</span> <span className="text-[#c678dd]">as</span> GET, <span className="text-[#e5c07b]">handler</span> <span className="text-[#c678dd]">as</span> POST {"}"};
                        </div>
                      </code>
                    </pre>
                  </div>
                </section>

                {/* Section: Node Connection */}
                <section id="node-connection" className="scroll-mt-32 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[03]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">Node Ingestion & Sync Workflow</h2>
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    Your repository operates as an isolated node inside the GitGraph schema. Connecting a repository imports its index configurations via the POST payload structure below.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 border border-zinc-900 rounded-xl bg-zinc-950/40">
                      <span className="font-mono text-[#57e071] text-[10px] uppercase block mb-2">Step 1</span>
                      <h4 className="text-white text-sm font-semibold mb-1">Index Retrieval</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">Fetch available repositories using the authorized token through GitHub API.</p>
                    </div>
                    <div className="p-5 border border-zinc-900 rounded-xl bg-zinc-950/40">
                      <span className="font-mono text-[#57e071] text-[10px] uppercase block mb-2">Step 2</span>
                      <h4 className="text-white text-sm font-semibold mb-1">JSON Payload Construction</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">Assemble database constraints containing basic naming parameters.</p>
                    </div>
                    <div className="p-5 border border-zinc-900 rounded-xl bg-zinc-950/40">
                      <span className="font-mono text-[#57e071] text-[10px] uppercase block mb-2">Step 3</span>
                      <h4 className="text-white text-sm font-semibold mb-1">API Node Creation</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">Store unique parameters to target metadata collection during evaluation.</p>
                    </div>
                  </div>

                  <div className="bg-[#050505] border border-zinc-900 rounded-xl p-5 space-y-3 max-w-full overflow-hidden">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-[#57e071]/10 text-[#57e071] border border-[#57e071]/20 rounded text-[10px] font-mono uppercase">
                        POST
                      </span>
                      <span className="font-mono text-xs text-white">/api/projects</span>
                    </div>
                    <p className="text-zinc-500 text-xs">Creates or links an external git index to your user profile directory.</p>
                    <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-900/50 overflow-x-auto max-w-full">
                      <pre className="font-mono text-[10px] text-zinc-500 leading-relaxed">
                        {`{
  "provider": "github",
  "externalId": "23948512",
  "name": "nextjs-saas-template",
  "fullName": "brand/nextjs-saas-template"
}`}
                      </pre>
                    </div>
                  </div>
                </section>

                {/* Section: Classification Engine */}
                <section id="analytics-engine" className="scroll-mt-32 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[04]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">Maturity & Classification Engine</h2>
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    GitGraph converts metrics (stars, issue backlogs, contributor footprints, and commit velocity) into classifications to calculate maintenance health.
                  </p>

                  <div className="border border-zinc-900 rounded-2xl bg-[#050505] p-6 space-y-4 max-w-full overflow-hidden">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                      <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">Classification Criteria</span>
                      <span className="text-xs text-[#57e071] font-mono">active_engine_v1</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h5 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Governance Model</h5>
                        <ul className="space-y-1.5 text-xs">
                          <li className="flex justify-between"><span className="text-zinc-500">{"Contributors <= 1"}</span> <span className="text-white">Solo Maintained</span></li>
                          <li className="flex justify-between"><span className="text-zinc-500">{"Contributors < 6"}</span> <span className="text-white">Small Core Team</span></li>
                          <li className="flex justify-between"><span className="text-zinc-500">{"Contributors >= 6"}</span> <span className="text-white">Community Driven</span></li>
                        </ul>
                      </div>
                      <div className="space-y-2 border-t md:border-t-0 md:border-x border-zinc-900 pt-4 md:pt-0 md:px-6">
                        <h5 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Project Maturity</h5>
                        <ul className="space-y-1.5 text-xs">
                          <li className="flex justify-between"><span className="text-zinc-500">{"Stars < 200"}</span> <span className="text-white">Early Stage</span></li>
                          <li className="flex justify-between"><span className="text-zinc-500">{"Stars < 5000"}</span> <span className="text-white">Growing</span></li>
                          <li className="flex justify-between"><span className="text-zinc-500">{"Stars >= 5000"}</span> <span className="text-white">Mature</span></li>
                        </ul>
                      </div>
                      <div className="space-y-2 pt-4 md:pt-0">
                        <h5 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Risk Factors</h5>
                        <ul className="space-y-1.5 text-xs text-zinc-500">
                          <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-red-400" /> High bus factor</li>
                          <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-yellow-400" /> Issue backlog pressure</li>
                          <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400" /> Low recent activity</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section: Export Protocols */}
                <section id="export-protocols" className="scroll-mt-32 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[05]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">Export Protocols & Integrations</h2>
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    Export dashboards and raw metric arrays programmatically or through client-side triggers in standard schemas.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-[#050505] border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-white font-bold">JSON Schema</span>
                        <span className="text-[10px] font-mono text-[#57e071]">application/json</span>
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        Retrieve nested telemetry containing historical metrics, and individual scoring matrices.
                      </p>
                    </div>
                    <div className="p-5 bg-[#050505] border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-white font-bold">CSV Array</span>
                        <span className="text-[10px] font-mono text-yellow-500">text/csv</span>
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        Flattened tabular metrics ideal for spreadsheets, data science modules, or manual modeling.
                      </p>
                    </div>
                    <div className="p-5 bg-[#050505] border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-white font-bold">PDF Executive</span>
                        <span className="text-[10px] font-mono text-red-400 font-semibold">application/pdf</span>
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        Formatted reports showcasing scoring curves, key priority tags, and executive insights.
                      </p>
                    </div>
                  </div>

                  {/* Code Snippet 2 com Destaque de Sintaxe Avançado (IDE Theme) */}
                  <div className="rounded-xl border border-zinc-900 bg-[#050505] overflow-hidden max-w-full">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-[#0a0a0a]">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-mono text-[10px] text-zinc-400">
                          utils/exporter.ts
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-600">TypeScript</span>
                    </div>
                    <pre className="p-5 overflow-x-auto font-mono text-xs leading-relaxed text-[#abb2bf] bg-[#050505] max-w-full">
                      <code>
                        <div>
                          <span className="text-[#c678dd]">export function</span> <span className="text-[#61afef]">exportToJSON</span>(<span className="text-[#e5c07b]">projectName</span>: <span className="text-[#e5c07b]">string</span>, <span className="text-[#e5c07b]">data</span>: <span className="text-[#e5c07b]">any</span>) {"{"}
                        </div>
                        <div className="pl-4">
                          <span className="text-[#c678dd]">const</span> <span className="text-[#e06c75]">blob</span> = <span className="text-[#c678dd]">new</span> <span className="text-[#e5c07b]">Blob</span>([<span className="text-[#e5c07b]">JSON</span>.<span className="text-[#61afef]">stringify</span>(<span className="text-[#e5c07b]">data</span>, <span className="text-[#c678dd]">null</span>, <span className="text-[#d19a66]">2</span>)], {"{"} <span className="text-[#e06c75]">type</span>: <span className="text-[#98c379]">"application/json"</span> {"}"});
                        </div>
                        <div className="pl-4">
                          <span className="text-[#c678dd]">const</span> <span className="text-[#e06c75]">url</span> = <span className="text-[#e5c07b]">URL</span>.<span className="text-[#61afef]">createObjectURL</span>(<span className="text-[#e06c75]">blob</span>);
                        </div>
                        <div className="pl-4">
                          <span className="text-[#c678dd]">const</span> <span className="text-[#e06c75]">link</span> = <span className="text-[#e5c07b]">document</span>.<span className="text-[#61afef]">createElement</span>(<span className="text-[#98c379]">"a"</span>);
                        </div>
                        <div className="pl-4">
                          <span className="text-[#e06c75]">link</span>.<span className="text-[#e06c75]">href</span> = <span className="text-[#e5c07b]">url</span>;
                        </div>
                        <div className="pl-4">
                          <span className="text-[#e06c75]">link</span>.<span className="text-[#e06c75]">download</span> = <span className="text-[#98c379]">{"`${projectName}-gitgraph-export.json`"}</span>;
                        </div>
                        <div className="pl-4">
                          <span className="text-[#e5c07b]">document</span>.<span className="text-[#e5c07b]">body</span>.<span className="text-[#61afef]">appendChild</span>(<span className="text-[#e06c75]">link</span>);
                        </div>
                        <div className="pl-4">
                          <span className="text-[#e06c75]">link</span>.<span className="text-[#61afef]">click</span>();
                        </div>
                        <div className="pl-4">
                          <span className="text-[#e5c07b]">document</span>.<span className="text-[#e5c07b]">body</span>.<span className="text-[#61afef]">removeChild</span>(<span className="text-[#e06c75]">link</span>);
                        </div>
                        <div className="pl-4">
                          <span className="text-[#e5c07b]">URL</span>.<span className="text-[#61afef]">revokeObjectURL</span>(<span className="text-[#e06c75]">url</span>);
                        </div>
                        <div>{"}"}</div>
                      </code>
                    </pre>
                  </div>
                </section>

                {/* Section: Security Standards */}
                <section id="security-standards" className="scroll-mt-32 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[06]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">Security Standards</h2>
                  </div>
                  <div className="p-0.5 bg-gradient-to-br from-zinc-800 to-transparent rounded-2xl max-w-full overflow-hidden">
                    <div className="bg-[#050505] rounded-[0.95rem] p-6 lg:p-8 space-y-6 border border-zinc-900">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest italic">Data_Access_Log</span>
                        <div className="px-3 py-1 rounded bg-zinc-900/50 border border-zinc-800 text-[8px] font-mono text-[#57e071] font-bold">HARDENED</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Lock className="w-4 h-4 text-[#57e071] shrink-0 mt-1" />
                            <div>
                              <h4 className="text-white text-sm font-semibold mb-1">AES-256-GCM Encryption</h4>
                              <p className="text-zinc-500 text-xs leading-relaxed">All synced access tokens are encrypted at-rest. Decryption keys are stored in disconnected vaults inside our isolated infrastructure boundaries.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#57e071] shrink-0 mt-1" />
                            <div>
                              <h4 className="text-white text-sm font-semibold mb-1">Zero Code Cloning</h4>
                              <p className="text-zinc-500 text-xs leading-relaxed">GitGraph operates strictly on metadata indices. Your source code files are never downloaded, cloned, or parsed inside our storage buckets.</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#57e071] shrink-0 mt-1" />
                            <div>
                              <h4 className="text-white text-sm font-semibold mb-1">SOC2 Type II Standard</h4>
                              <p className="text-zinc-500 text-xs leading-relaxed">All pipelines and developer environments operate in compliance with SOC2 Type II parameters, maintaining continuous automated audits.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#57e071] shrink-0 mt-1" />
                            <div>
                              <h4 className="text-white text-sm font-semibold mb-1">VPC-Isolated Layer</h4>
                              <p className="text-zinc-500 text-xs leading-relaxed">Database queries and analysis engines run locked inside VPC frameworks, isolated from direct incoming internet routing tables.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* CATEGORIA 2: ABOUT THE PLATFORM */}
            {activeCategory === "about" && (
              <>
                {/* Section: Vision & Mission */}
                <section id="project-mission" className="scroll-mt-32 space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[01]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">Vision & Mission</h2>
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    GitGraph was created to demystify complex raw Git histories and elevate software governance into clear, actionable intelligence. Our vision is to provide engineering managers, software architects, and individual contributors with a unified pane of glass that correlates commit velocity with code stability.
                  </p>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    By extracting high-level metadata without ever looking inside code files, GitGraph empowers technical leaders to maintain high developer agency and balanced maintenance plans without compromising source-level privacy.
                  </p>
                </section>

                {/* Section: Problem Solved */}
                <section id="problem-solved" className="scroll-mt-32 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[02]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">The Problem Solved</h2>
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    Modern developer teams often struggle with invisible technical bottlenecks. Standard dashboard integrations on GitHub lack custom analytics capabilities or require excessive setup. GitGraph resolves these friction points natively:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="p-6 bg-zinc-950/40 rounded-xl border border-zinc-900 space-y-3">
                      <h4 className="text-white text-sm font-semibold uppercase tracking-wider font-mono text-[#57e071]">
                        What we eliminate
                      </h4>
                      <ul className="space-y-2 text-xs text-zinc-500">
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>Chaotic commit trends with zero actionable metrics.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>Invisible bus factor (high-risk individual dependency).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          <span>Overlooked pull request backlogs causing delivery delays.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="p-6 bg-[#050505] rounded-xl border border-zinc-900 space-y-3">
                      <h4 className="text-white text-sm font-semibold uppercase tracking-wider font-mono text-[#57e071]">
                        Our solution
                      </h4>
                      <ul className="space-y-2 text-xs text-zinc-500">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 font-bold">•</span>
                          <span>Real-time calculated Health Scores out of 100.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 font-bold">•</span>
                          <span>Predictive algorithms highlighting process vulnerability.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 font-bold">•</span>
                          <span>Unified Node Manager interface to compare and rank repos instantly.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section: The Creator */}
                <section id="creator-profile" className="scroll-mt-32 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[03]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">The Creator</h2>
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    GitGraph is designed, developed, and maintained with continuous attention to software performance and interface aesthetics.
                  </p>
                  
                  {/* Creator Card */}
                  <div className="p-[1px] bg-gradient-to-br from-zinc-800 to-transparent rounded-2xl max-w-xl">
                    <div className="bg-[#050505] rounded-[0.95rem] p-8 border border-zinc-900 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-[#57e071]" />
                        </div>
                        <div>
                          <h4 className="text-white text-lg font-normal">Gustavo Medeiros de Barros</h4>
                          <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest block mt-0.5">
                            Full-Stack Software Engineer
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-zinc-900 pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-zinc-500" />
                          <a href="mailto:gustmb2005@gmail.com" className="text-sm font-mono text-zinc-400 hover:text-[#57e071] transition">
                            gustmb2005@gmail.com
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-zinc-500" />
                          <a href="https://www.gustavodev.net.br" target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-zinc-400 hover:text-[#57e071] transition flex items-center gap-1.5">
                            gustavodev.net.br
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaGithub className="w-4 h-4 text-zinc-500" />
                          <a href="https://github.com/Gustaavo-404" target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-zinc-400 hover:text-[#57e071] transition flex items-center gap-1.5">
                            github.com/Gustaavo-404
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <FaLinkedin className="w-4 h-4 text-zinc-500" />
                          <a href="https://www.linkedin.com/in/gustavo-medeiros-de-barros-092230279/" target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-zinc-400 hover:text-[#57e071] transition flex items-center gap-1.5">
                            linkedin.com/in/gustavo-medeiros-de-barros
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* CATEGORIA 3: CHANGELOG */}
            {activeCategory === "changelog" && (
              <>
                {/* Section: Release v1.0.0 */}
                <section id="v1-0-0" className="scroll-mt-32 space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[01]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">Release v1.0.0</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-mono">
                    Launched successfully
                  </div>
                  <p className="text-zinc-500 leading-relaxed text-base">
                    We are pleased to introduce the initial release of GitGraph. Build 1.0.0 introduces the complete ingestion pipeline, authentication endpoints, and performance analysis frameworks.
                  </p>
                  
                  <div className="space-y-4 pt-2">
                    <h4 className="text-white text-sm font-semibold">Changelog Highlights:</h4>
                    <ul className="space-y-3 text-sm text-zinc-500">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#57e071] shrink-0 mt-0.5" />
                        <span><strong>GitHub OAuth 2.0 Ingestion:</strong> Sync repositories securely using stateless JWT session maps.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#57e071] shrink-0 mt-0.5" />
                        <span><strong>Unified Node Manager:</strong> Perform multi-project tabular analytics directly from the visual workspace.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#57e071] shrink-0 mt-0.5" />
                        <span><strong>Advanced Exporter Layer:</strong> Download telemetry reports as structured JSON arrays, PDF formats, or CSV tables.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Section: Future Roadmap */}
                <section id="future-releases" className="scroll-mt-32 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#57e071] text-xs">[02]</span>
                    <h2 className="text-2xl font-light text-white tracking-tight">Future Roadmap</h2>
                  </div>
                  <div className="p-5 bg-zinc-950/50 rounded-xl border border-zinc-900 flex items-start gap-3">
                    <Info className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      All future system upgrades, pipeline optimizations, security updates, and performance patches will be continuously logged under this section. Future releases will bring advanced notification layers (Slack/Discord Webhooks) and continuous repository sync schedules. Stay tuned.
                    </p>
                  </div>
                </section>
              </>
            )}

          </main>
        </div>
      </div>

      {/* ================= MODAL PALETA DE COMANDOS (CMD+K SEARCH) ================= */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-[#57e071]/5 animate-in slide-in-from-top-4 duration-300">
            
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-900 bg-zinc-950">
              <Search className="w-5 h-5 text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation (type to search...)"
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-zinc-600 hover:text-zinc-400 font-mono"
              >
                ESC
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[350px] overflow-y-auto p-2">
              {searchQuery.trim() === "" ? (
                <div className="py-12 text-center">
                  <Terminal className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-xs">Type to discover metrics, authentication models, or about data...</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">oauth</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">gustavo</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">changelog</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">health</span>
                  </div>
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-zinc-500 text-xs">No matching documentation found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredSearchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchSelect(result.category, result.id)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 text-left transition group"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-white font-medium group-hover:text-[#57e071] transition-colors">
                          {result.title}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          {result.categoryLabel}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Keyboard Help Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-900 bg-zinc-900/40 text-[10px] text-zinc-600 font-mono">
              <span>Use typing filters</span>
              <span>⏎ select</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
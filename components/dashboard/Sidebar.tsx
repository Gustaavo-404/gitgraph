"use client";

import Link from "next/link";
import { FaPlug, FaCog, FaDatabase, FaGithub, FaFileExport } from "react-icons/fa";
import { LuPanelLeftClose, LuPanelLeftOpen, LuLayoutDashboard } from "react-icons/lu";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Command, Search, HelpCircle, BookOpen, LifeBuoy, History, Keyboard, User, ChevronRight, ChevronLeft } from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";

const iconMap = {
  dashboard: LuLayoutDashboard,
  nodes: FaDatabase,
  connect: FaPlug,
  settings: FaCog,
  profile: User,
  documentation: BookOpen,
  support: LifeBuoy,
  changelog: History,
  shortcuts: Keyboard,
  export: FaFileExport,
  help: HelpCircle,
  github: FaGithub,
};

const staticSearchItems = [
  { title: "Dashboard", href: "/dashboard", icon: iconMap.dashboard, keywords: ["home", "main"] },
  { title: "Nodes Manager", href: "/dashboard/nodes", icon: iconMap.nodes, keywords: ["nodes", "database"] },
  { title: "Connect Repo", href: "/dashboard/connect", icon: iconMap.connect, keywords: ["github", "connect", "repo"] },
  { title: "Profile", href: "#", icon: iconMap.profile, keywords: ["user", "account"], action: "profile" },
  { title: "Documentation", href: "/docs", icon: iconMap.documentation, keywords: ["docs", "guide"] },
  { title: "Support", href: "/docs?cat=about", icon: iconMap.support, keywords: ["help", "contact"] },
  { title: "Changelog", href: "/docs?cat=changelog", icon: iconMap.changelog, keywords: ["updates", "release"] },
  { title: "Keyboard Shortcuts", href: "#", icon: iconMap.shortcuts, keywords: ["hotkeys", "keys"], action: "shortcuts" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: projects } = useProjects();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handler para os disparos de ações dos modais
  const handleAction = (action: string) => {
    if (action === "profile") {
      window.dispatchEvent(new Event("open-profile-modal"));
    } else if (action === "shortcuts") {
      window.dispatchEvent(new Event("open-shortcuts-modal"));
    }
  };

  // --- HOTKEYS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      const routes: Record<string, string> = {
        'd': '/dashboard',
        'n': '/dashboard/nodes',
        'g': '/dashboard/connect',
        'a': '/dashboard/connect-api',
      };

      if (routes[key]) {
        e.preventDefault();
        router.push(routes[key]);
      }

      // Atalho de configurações abre o modal unificado global
      if (key === 's') {
        e.preventDefault();
        window.dispatchEvent(new Event("open-settings-modal"));
      }

      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (key === '[') {
        setCollapsed(prev => !prev);
      }

      if (key === 'escape' && showDropdown) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, showDropdown]);

  // Filtrar resultados conforme digitação
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResults([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();

    const projectItems = (projects || []).map(proj => ({
      title: proj.fullName,
      href: `/dashboard/${proj.id}`,
      icon: iconMap.github,
      keywords: [proj.fullName.toLowerCase(), proj.id],
    }));

    const allItems = [...staticSearchItems, ...projectItems];

    const filtered = allItems.filter(item => {
      return item.title.toLowerCase().includes(query) || 
             (item.keywords && item.keywords.some(k => k.includes(query)));
    });

    setFilteredResults(filtered);
    setSelectedIndex(filtered.length > 0 ? 0 : -1);
    setShowDropdown(filtered.length > 0);
  }, [searchQuery, projects]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegação por teclado no dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = filteredResults[selectedIndex];
      if (selected.action) {
        handleAction(selected.action);
      } else {
        router.push(selected.href);
      }
      setShowDropdown(false);
      setSearchQuery("");
      inputRef.current?.blur();
    }
  };

  // Componente de Item Unificado com suporte a Link ou Botão customizado (onClick)
  const item = (href: string, label: string, icon: any, shortcut?: string, onClick?: () => void) => {
    const active = pathname === href;
    const Icon = icon;

    // Se houver manipulador de clique customizado, renderiza como elemento <button>
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={`
            w-full group relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all duration-200 text-left cursor-pointer
            ${active ? "bg-white/[0.06] text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"}
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? label : undefined}
        >
          <Icon className={`text-sm shrink-0 ${active ? "text-emerald-500" : "group-hover:text-zinc-300"}`} />

          {!collapsed && (
            <div className="flex items-center justify-between w-full">
              <span>{label}</span>
              {shortcut && (
                <span className="text-[10px] text-zinc-700 font-mono group-hover:text-zinc-500 transition-colors">
                  {shortcut}
                </span>
              )}
            </div>
          )}
        </button>
      );
    }

    return (
      <Link
        href={href}
        className={`
          group relative flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all duration-200
          ${active ? "bg-white/[0.06] text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"}
          ${collapsed ? "justify-center" : ""}
        `}
        title={collapsed ? label : undefined}
      >
        <Icon className={`text-sm shrink-0 ${active ? "text-emerald-500" : "group-hover:text-zinc-300"}`} />

        {!collapsed && (
          <div className="flex items-center justify-between w-full">
            <span>{label}</span>
            {shortcut && (
              <span className="text-[10px] text-zinc-700 font-mono group-hover:text-zinc-500 transition-colors">
                {shortcut}
              </span>
            )}
          </div>
        )}

        {active && (
          <div className="absolute left-0 w-[2px] h-4 bg-emerald-500 rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Botão lateral estilo "aba" colado à esquerda e centralizado verticalmente */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="
          fixed left-0 top-1/2 -translate-y-1/2 z-50 
          p-2.5 rounded-r-xl rounded-l-none 
          border-y border-r border-white/10 bg-zinc-950 text-white 
          md:hidden hover:bg-zinc-900 transition-all focus:outline-none shadow-lg
          flex items-center justify-center
        "
        aria-label="Toggle Menu"
      >
        {mobileOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Backdrop de fundo escurecido */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40 pt-20 h-screen border-r border-white/[0.06] 
          flex flex-col gap-8 p-4 bg-black
          transition-all duration-300 ease-in-out
          
          ${collapsed ? "md:w-[72px]" : "md:w-64"} 
          w-64 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* BARRA DE PESQUISA */}
        {!collapsed && (
          <div className="px-1 mb-4 relative" ref={searchRef}>
            <div
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg 
                bg-white/[0.03] border border-white/[0.05] 
                hover:border-white/10 transition-all cursor-text w-full
                ${searchFocused ? "border-emerald-500/50 bg-white/[0.05]" : ""}
              `}
              onClick={() => inputRef.current?.focus()}
            >
              <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <input
                ref={inputRef}
                id="sidebar-search"
                type="text"
                placeholder="Search network..."
                className="flex-1 bg-transparent text-[12px] text-white placeholder:text-zinc-500 focus:outline-none min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="text-[10px] font-mono text-zinc-600 px-1.5 py-0.5 rounded bg-black/40 border border-white/5 whitespace-nowrap">
                  <Command className="w-2.5 h-2.5 inline mr-1" />K
                </kbd>
              </div>
            </div>

            {/* DROPDOWN DE RESULTADOS */}
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="max-h-64 overflow-y-auto custom-scrollbar py-1">
                  {filteredResults.map((result, index) => {
                    const Icon = result.icon;
                    const isSelected = index === selectedIndex;
                    const isAction = !!result.action;

                    const handleClick = (e: React.MouseEvent) => {
                      if (isAction) {
                        e.preventDefault();
                        handleAction(result.action);
                      }
                      setShowDropdown(false);
                      setSearchQuery("");
                    };

                    if (isAction) {
                      return (
                        <button
                          key={result.title}
                          onClick={handleClick}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2 text-sm text-left cursor-pointer
                            ${isSelected ? "bg-white/[0.06] text-white" : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"}
                            transition-colors
                          `}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <Icon className="w-4 h-4 shrink-0 text-zinc-500" />
                          <span className="truncate flex-1">{result.title}</span>
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={result.href}
                        href={result.href}
                        className={`
                          flex items-center gap-3 px-3 py-2 text-sm
                          ${isSelected ? "bg-white/[0.06] text-white" : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"}
                          transition-colors
                        `}
                        onClick={handleClick}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-zinc-500" />
                        <span className="truncate flex-1">{result.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Versão colapsada da barra de pesquisa */}
        {collapsed && (
          <div className="hidden md:flex justify-center mb-4">
            <div
              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-all group"
              onClick={() => setCollapsed(false)}
              title="Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-400" />
            </div>
          </div>
        )}

        {/* 1. SECTION: EXPLORER */}
        <div className="flex flex-col gap-2">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-2">
              Explorer
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {item("/dashboard", "Dashboard", LuLayoutDashboard, "D")}
            {item("/dashboard/nodes", "Nodes Manager", FaDatabase, "N")}
            {item("/dashboard/connect", "Connect Repo", FaPlug, "G")}
          </nav>
        </div>

        {/* 3. SECTION: CONNECTED REPOSITORIES */}
        {!collapsed && projects && projects.length > 0 && (
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
            <p className="px-3 text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-2">
              Connected Repos
            </p>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <nav className="flex flex-col gap-1 pr-1">
                {projects.map((proj) => (
                  <Link
                    key={proj.id}
                    href={`/dashboard/${proj.id}`}
                    className={`
                      group flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] transition-all duration-200
                      ${pathname === `/dashboard/${proj.id}` ? "bg-white/[0.06] text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"}
                    `}
                    title={proj.fullName}
                  >
                    <FaGithub className="text-zinc-600 group-hover:text-zinc-400 shrink-0" size={12} />
                    <span className="truncate flex-1">{proj.fullName}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Versão colapsada da seção de repositórios */}
        {collapsed && projects && projects.length > 0 && (
          <div className="hidden md:flex flex-col gap-2 items-center">
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-zinc-500">
              <FaGithub size={14} />
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">{projects.length}</span>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex flex-col gap-4 mt-auto">
          <nav className="flex flex-col gap-1">
            {/* O item Settings dispara o modal global */}
            {item("#", "Settings", FaCog, "S", () => {
              window.dispatchEvent(new Event("open-settings-modal"));
            })}
          </nav>

          <button
            onClick={() => setCollapsed(v => !v)}
            className="
              hidden md:flex
              w-full h-10 rounded-md items-center justify-center
              border border-white/[0.05] hover:bg-white/[0.05]
              text-zinc-600 hover:text-white transition-all
            "
          >
            {collapsed ? (
              <LuPanelLeftOpen className="text-lg" />
            ) : (
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest">
                <LuPanelLeftClose />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
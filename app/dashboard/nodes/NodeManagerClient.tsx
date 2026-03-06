"use client";

import { useProjects } from "@/lib/hooks/useProjects";
import { useStats } from "@/lib/hooks/useStats";
import Link from "next/link";
import {
  FaStar,
  FaCodeBranch,
  FaBug,
  FaEye,
  FaGithub,
  FaSearch,
  FaExclamationTriangle,
  FaChartLine,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState, useMemo, useEffect } from "react";

// Hook de animação local
function useAnimatedNumber(target: number, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    let rafId: number;

    const step = () => {
      start += increment;
      if (start < target) {
        setValue(Math.floor(start));
        rafId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

// Interface estendida com dados do relatório (commits, health)
interface ExtendedProjectStats {
  id: string;
  fullName: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language?: string;
  commits30d: number;
  healthScore: number;
  healthGrade: string;
  insights?: string[];
}

type SortField = "stars" | "forks" | "issues" | "watchers" | "commits" | "health" | "name";
type SortDirection = "asc" | "desc";

export default function NodeManagerClient() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: stats, isLoading: statsLoading } = useStats();
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("health");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [projectDetails, setProjectDetails] = useState<Record<string, ExtendedProjectStats>>({});
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Buscar detalhes adicionais (commits, health) para cada projeto
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const fetchDetails = async () => {
      const detailsMap: Record<string, ExtendedProjectStats> = {};
      for (const p of projects) {
        try {
          const res = await fetch(`/api/github/repo/${p.id}/reports`, { cache: "no-store" });
          if (!res.ok) continue;
          const data = await res.json();
          detailsMap[p.id] = {
            id: p.id,
            fullName: p.fullName,
            stars: stats?.find(s => s.id === p.id)?.stars || 0,
            forks: stats?.find(s => s.id === p.id)?.forks || 0,
            openIssues: stats?.find(s => s.id === p.id)?.openIssues || 0,
            watchers: stats?.find(s => s.id === p.id)?.watchers || 0,
            language: data.languages ? Object.keys(data.languages)[0] : undefined,
            commits30d: data.commits?.commits30d || 0,
            healthScore: data.health?.score || 0,
            healthGrade: data.health?.grade || "N/A",
            insights: data.health?.insights || [],
          };
        } catch (err) {
          console.error("Error fetching details for", p.id, err);
        }
      }
      setProjectDetails(detailsMap);
      setLoadingDetails(false);
    };

    fetchDetails();
  }, [projects, stats]);

  const isLoading = projectsLoading || statsLoading || loadingDetails;

  // Extrair linguagens únicas para o filtro
  const languages = useMemo(() => {
    const langSet = new Set<string>();
    Object.values(projectDetails).forEach(p => {
      if (p.language) langSet.add(p.language);
    });
    return ["all", ...Array.from(langSet).sort()];
  }, [projectDetails]);

  // Filtrar e ordenar projetos
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    let list = Object.values(projectDetails).filter(p => {
      const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesLang = languageFilter === "all" || p.language === languageFilter;
      return matchesSearch && matchesLang;
    });

    // Ordenação
    list.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case "name":
          aVal = a.fullName.toLowerCase();
          bVal = b.fullName.toLowerCase();
          break;
        case "stars":
          aVal = a.stars;
          bVal = b.stars;
          break;
        case "forks":
          aVal = a.forks;
          bVal = b.forks;
          break;
        case "issues":
          aVal = a.openIssues;
          bVal = b.openIssues;
          break;
        case "watchers":
          aVal = a.watchers;
          bVal = b.watchers;
          break;
        case "commits":
          aVal = a.commits30d;
          bVal = b.commits30d;
          break;
        case "health":
        default:
          aVal = a.healthScore;
          bVal = b.healthScore;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [projects, projectDetails, search, languageFilter, sortField, sortDirection]);

  // Calcular prioridade baseada em regras simples
  const getPriority = (p: ExtendedProjectStats): { label: string; color: string } => {
    if (p.healthScore < 40) return { label: "Critical", color: "text-red-400 border-red-400/30 bg-red-400/10" };
    if (p.healthScore < 60) return { label: "Attention", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" };
    if (p.commits30d > 50 && p.healthScore > 70) return { label: "Thriving", color: "text-[#57e071] border-[#57e071]/30 bg-[#57e071]/10" };
    return { label: "Stable", color: "text-zinc-400 border-zinc-600/30 bg-zinc-700/20" };
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <FaSort className="w-3 h-3 text-zinc-600" />;
    return sortDirection === "asc" ? <FaSortUp className="w-3 h-3 text-[#57e071]" /> : <FaSortDown className="w-3 h-3 text-[#57e071]" />;
  };

  // Animar os valores dos cards de insight
  const attentionCount = useAnimatedNumber(filteredProjects.filter(p => p.healthScore < 50).length);
  const highActivityCount = useAnimatedNumber(filteredProjects.filter(p => p.commits30d > 30).length);
  const totalNodes = useAnimatedNumber(projects?.length || 0);

  if (isLoading) {
    return <NodeManagerSkeleton />;
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="pt-14 pb-20 flex flex-col items-center justify-center min-h-[70vh] text-center px-4 gap-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl border border-zinc-700/50 flex items-center justify-center backdrop-blur-sm">
            <FaGithub className="text-4xl text-zinc-500" />
          </div>
        </div>
        <h1 className="text-3xl font-light text-white">No nodes to compare</h1>
        <p className="text-zinc-500 max-w-md">Connect repositories first to start comparing.</p>
        <Link
          href="/dashboard/connect"
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#57e071] to-[#3fa855] px-8 py-4 text-black font-semibold hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#57e071]/20"
        >
          Connect Repository
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-14 pb-20 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Node Manager
            </h1>
            <InfoTooltip text="Compare repositories to decide where to focus your efforts." />
          </div>
          <p className="text-zinc-600 text-sm font-mono">
            {filteredProjects.length} of {projects.length} nodes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro por linguagem */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-[#57e071]/30 appearance-none cursor-pointer hover:border-zinc-700 transition-colors"
          >
            {languages.map(lang => (
              <option key={lang} value={lang} className="bg-zinc-900">
                {lang === "all" ? "All Languages" : lang}
              </option>
            ))}
          </select>

          {/* Busca */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
            <input
              type="text"
              placeholder="Filter nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-[#57e071]/30 focus:border-[#57e071]/30 focus:outline-none transition-all backdrop-blur-sm"
            />
          </div>
        </div>
      </header>

      {/* Tabela de comparação */}
      <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 text-zinc-300 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-white" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1">
                  Repository <SortIcon field="name" />
                </div>
              </th>
              <th className="px-6 py-4 font-medium">Language</th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-right" onClick={() => handleSort("stars")}>
                <div className="flex items-center justify-end gap-1">
                  Stars <SortIcon field="stars" />
                </div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-right" onClick={() => handleSort("forks")}>
                <div className="flex items-center justify-end gap-1">
                  Forks <SortIcon field="forks" />
                </div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-right" onClick={() => handleSort("issues")}>
                <div className="flex items-center justify-end gap-1">
                  Issues <SortIcon field="issues" />
                </div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-right" onClick={() => handleSort("commits")}>
                <div className="flex items-center justify-end gap-1">
                  Commits (30d) <SortIcon field="commits" />
                </div>
              </th>
              <th className="px-6 py-4 font-medium cursor-pointer hover:text-white text-right" onClick={() => handleSort("health")}>
                <div className="flex items-center justify-end gap-1">
                  Health <SortIcon field="health" />
                </div>
              </th>
              <th className="px-6 py-4 font-medium text-center">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredProjects.map((p) => {
              const priority = getPriority(p);
              return (
                <tr key={p.id} className="group hover:bg-zinc-800/20 transition-colors duration-200">
                  <td className="px-6 py-4 font-medium text-white">
                    <Link href={`/dashboard/${p.id}`} className="hover:text-[#57e071] transition-colors flex items-center gap-2">
                      <FaGithub className="text-zinc-500" />
                      {p.fullName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {p.language ? (
                      <span className="px-2 py-1 bg-zinc-800/50 rounded-full text-xs">{p.language}</span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-400">{p.stars.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-zinc-400">{p.forks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-zinc-400">{p.openIssues.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-zinc-400">{p.commits30d.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-white font-mono">{p.healthScore}</span>
                      <span className="text-xs text-zinc-600">({p.healthGrade})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${priority.color}`}>
                      {priority.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards de insight rápidos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickInsightCard
          title="Needs Attention"
          value={attentionCount}
          icon={<FaExclamationTriangle className="text-yellow-400" />}
          description="Projects with health score below 50"
        />
        <QuickInsightCard
          title="High Activity"
          value={highActivityCount}
          icon={<FaChartLine className="text-[#57e071]" />}
          description="More than 30 commits in last 30 days"
        />
        <QuickInsightCard
          title="Total Nodes"
          value={totalNodes}
          icon={<FaGithub className="text-blue-400" />}
          description="Connected repositories"
        />
      </section>

      {/* Footer com dica */}
      <div className="text-xs text-zinc-700 text-center pt-4 border-t border-zinc-800/50">
        <span>Click on column headers to sort • Hover over rows for more options</span>
      </div>
    </div>
  );
}

/* --- Componentes auxiliares --- */

function QuickInsightCard({ title, value, icon, description }: { title: string; value: number; icon: React.ReactNode; description: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 hover:border-[#57e071]/30 transition-all hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        <div className="text-xl">{icon}</div>
      </div>
      <p className="text-3xl font-semibold text-white mb-2">{value}</p>
      <p className="text-xs text-zinc-600">{description}</p>
    </div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="relative group cursor-pointer">
      <InformationCircleIcon className="w-5 h-5 text-zinc-600 hover:text-[#57e071] transition-colors" />
      <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl border border-zinc-800 z-50">
        {text}
      </div>
    </div>
  );
}

/* --- Skeleton --- */
function NodeManagerSkeleton() {
  return (
    <div className="pt-14 pb-20 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-64 bg-zinc-800/50 rounded-lg" />
            <div className="w-5 h-5 bg-zinc-800/50 rounded-full" />
          </div>
          <div className="h-4 w-40 bg-zinc-800/50 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-zinc-800/50 rounded-xl" />
          <div className="h-10 w-64 bg-zinc-800/50 rounded-xl" />
        </div>
      </header>

      {/* Table skeleton */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden">
        <div className="h-12 bg-zinc-800/50" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-t border-zinc-800/50" />
        ))}
      </div>

      {/* Insight cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-800/50 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
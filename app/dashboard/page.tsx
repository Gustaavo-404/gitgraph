"use client";

import { useProjects } from "@/lib/hooks/useProjects";
import { useStats } from "@/lib/hooks/useStats";
import Link from "next/link";
import {
  FaPlus,
  FaEllipsisV,
  FaStar,
  FaCodeBranch,
  FaBug,
  FaEye,
  FaTerminal,
  FaGithub,
  FaSearch,
  FaDownload,
  FaTable,
  FaThLarge,
  FaTrash,
  FaFileCsv,
  FaFileCode,
  FaFilePdf,
} from "react-icons/fa";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";
import { StatsData, CommitData, LanguageData } from "@/app/types";
import { LanguagesDonut } from "@/components/reports/LanguagesChart";
import { CommitsChart } from "@/components/reports/CommitsChart";

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();
  const { data: stats, isLoading: statsLoading } = useStats();
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openExportMenu, setOpenExportMenu] = useState(false);
  const [commitPeriod, setCommitPeriod] = useState<number>(0);
  const [commitData, setCommitData] = useState<CommitData[]>([]);
  const [languageData, setLanguageData] = useState<LanguageData>({});
  const [projectLanguages, setProjectLanguages] = useState<Record<string, string>>({});

  // Estados para filtros e visualização
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  interface LanguageDataType {
    [key: string]: number;
  }

  useEffect(() => {
    if (!projects || projects.length === 0) return;

    const fetchReports = async () => {
      const allCommits: Record<string, number> = {};
      const allLanguages: Record<string, number> = {};
      const primaryLangMap: Record<string, string> = {};

      for (const p of projects) {
        const res = await fetch(`/api/github/repo/${p.id}/reports`);
        if (!res.ok) continue;

        const data = await res.json() as {
          commits: {
            daily: Array<{ date: string; count: number }>;
          };
          languages: LanguageDataType;
          stars: number;
          forks: number;
          watchers: number;
          openIssues: number;
          openPRs: number;
        };

        const commitsArr = data.commits.daily || [];

        commitsArr.forEach((c) => {
          allCommits[c.date] = (allCommits[c.date] || 0) + c.count;
        });

        for (const lang in data.languages) {
          allLanguages[lang] = (allLanguages[lang] || 0) + data.languages[lang];
        }

        if (data.languages && Object.keys(data.languages).length > 0) {
          const entries = Object.entries(data.languages) as [string, number][];
          const primary = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
          primaryLangMap[p.id] = primary;
        }
      }

      const commitsTotal: CommitData[] = (() => {
        const entries = Object.entries(allCommits).map(([date, count]) => ({ date, count }));
        if (entries.length === 0) return [];
        entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const startDate = new Date(entries[0].date);
        const endDate = new Date(entries[entries.length - 1].date);
        const dayMap: Record<string, number> = {};
        entries.forEach((e) => (dayMap[e.date] = e.count));

        const fullArray: CommitData[] = [];
        const d = new Date(startDate);
        while (d <= endDate) {
          const key = d.toISOString().slice(0, 10);
          fullArray.push({ date: key, count: dayMap[key] || 0 });
          d.setDate(d.getDate() + 1);
        }
        return fullArray;
      })();

      setCommitData(commitsTotal);
      setLanguageData(allLanguages);
      setProjectLanguages(primaryLangMap);
    };

    fetchReports();
  }, [projects]);

  const filteredCommits = useMemo(() => {
    if (commitPeriod === 0) return commitData;
    const limit = new Date();
    limit.setDate(limit.getDate() - commitPeriod);
    return commitData.filter(d => new Date(d.date) >= limit);
  }, [commitData, commitPeriod]);

  const languages = useMemo(() => {
    const langSet = new Set(Object.values(projectLanguages));
    return ["all", ...Array.from(langSet).sort()];
  }, [projectLanguages]);

  const filteredProjects = useMemo(() => {
    return projects?.filter(p => {
      const matchesSearch = p.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesLang = languageFilter === "all" || projectLanguages[p.id] === languageFilter;
      return matchesSearch && matchesLang;
    }) || [];
  }, [projects, search, languageFilter, projectLanguages]);

  const exportData = (format: "csv" | "json" | "pdf") => {
    const dataToExport = filteredProjects.map(p => {
      const s = stats?.find(stat => stat.id === p.id);
      return {
        name: p.fullName,
        language: projectLanguages[p.id] || "Unknown",
        stars: s?.stars || 0,
        forks: s?.forks || 0,
        issues: s?.openIssues || 0,
        watchers: s?.watchers || 0,
      };
    });

    if (format === "csv") {
      const headers = ["Name", "Language", "Stars", "Forks", "Issues", "Watchers"];
      const rows = dataToExport.map(d => [
        d.name,
        d.language,
        d.stars,
        d.forks,
        d.issues,
        d.watchers,
      ]);
      const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dashboard_export.csv";
      a.click();
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dashboard_export.json";
      a.click();
    } else if (format === "pdf") {
      alert("PDF export will be available soon!");
    }
    setOpenExportMenu(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm system purge for this project?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) window.location.reload();
  };

  if (isLoading || statsLoading) {
    return (
      <div className="pt-14 pb-20 space-y-12">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="pt-14 pb-20 flex flex-col items-center justify-center min-h-[70vh] text-center px-4 gap-8 animate-in fade-in duration-700">
        <div className="relative">
          {/* Círculo com borda mais grossa e fundo sutil */}
          <div className="w-24 h-24 rounded-full border-2 border-zinc-700/80 flex items-center justify-center backdrop-blur-sm bg-zinc-900/20">
            {/* Losango apenas com borda, ocupando o círculo */}
            <div className="w-[68px] h-[68px] border-2 border-zinc-700/80 rotate-45" />
          </div>
        </div>
        <h1 className="text-3xl font-light text-white">No nodes detected in network</h1>
        <Link
          href="/dashboard/connect"
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#57e071] to-[#3fa855] px-8 py-4 text-black font-semibold hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#57e071]/20 hover:shadow-xl hover:shadow-[#57e071]/30"
        >
          <FaPlus className="transition-transform group-hover:rotate-90" /> Connect Repository
        </Link>
      </div>
    );
  }

  const totalStars = stats?.reduce((acc, p) => acc + (p.stars || 0), 0) || 0;
  const totalForks = stats?.reduce((acc, p) => acc + (p.forks || 0), 0) || 0;
  const totalIssues = stats?.reduce((acc, p) => acc + (p.openIssues || 0), 0) || 0;
  const totalWatchers = stats?.reduce((acc, p) => acc + (p.watchers || 0), 0) || 0;

  return (
    <div className="mt-14 pb-20 space-y-16">
      {/* SECTION: Global Stats */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Global Network Metrics
          </h2>
          <InfoTooltip text="Overview of all metrics across your connected repositories." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickStatHighEnd
            label="Stars"
            value={totalStars}
            icon={<FaStar className="text-[#57e071]" />}
            info="Total stars across all repositories."
          />
          <QuickStatHighEnd
            label="Forks"
            value={totalForks}
            icon={<FaCodeBranch className="text-[#57e071]" />}
            info="Total forks indicating repository clones."
          />
          <QuickStatHighEnd
            label="Issues"
            value={totalIssues}
            icon={<FaBug className="text-[#57e071]" />}
            info="Open issues currently active."
          />
          <QuickStatHighEnd
            label="Watchers"
            value={totalWatchers}
            icon={<FaEye className="text-[#57e071]" />}
            info="Users watching your repositories."
          />
        </div>
      </section>

      {/* SECTION: Projects */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold flex items-center gap-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Active Nodes
              <InfoTooltip text="Nodes are your connected repositories with live stats." />
            </h2>
            <p className="text-zinc-600 text-sm uppercase tracking-wider">
              Instances: <span className="text-zinc-300 font-mono">{projects.length}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por linguagem */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-[#57e071]/30 focus:border-[#57e071]/30 appearance-none cursor-pointer hover:border-zinc-700 transition-colors"
            >
              {languages.map(lang => (
                <option key={lang} value={lang} className="bg-zinc-900">
                  {lang === "all" ? "All Languages" : lang}
                </option>
              ))}
            </select>

            {/* Toggle cards/table */}
            <button
              onClick={() => setViewMode(v => v === "cards" ? "table" : "cards")}
              className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              {viewMode === "cards" ? <FaTable /> : <FaThLarge />}
            </button>

            {/* Botão de exportação estilizado */}
            <div className="relative">
              <button
                onClick={() => setOpenExportMenu(!openExportMenu)}
                className="group relative inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 hover:border-[#57e071]/30 rounded-xl px-4 py-2 text-zinc-400 hover:text-white transition-all duration-300"
              >
                <FaDownload className="text-sm group-hover:scale-110 transition-transform" />
                <span className="text-sm">Export</span>
              </button>

              {openExportMenu && (
                <>
                  {/* Overlay para fechar ao clicar fora */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenExportMenu(false)}
                  />

                  {/* Dropdown menu estilizado */}
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                      <button
                        onClick={() => exportData("csv")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#57e071]/10 flex items-center justify-center group-hover:bg-[#57e071]/20 transition-colors">
                          <FaFileCsv className="text-[#57e071] text-xs" />
                        </div>
                        <span className="flex-1 text-left">CSV Format</span>
                        <span className="text-xs text-zinc-600">.csv</span>
                      </button>

                      <div className="border-t border-zinc-800/50 my-1" />

                      <button
                        onClick={() => exportData("json")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#57e071]/10 flex items-center justify-center group-hover:bg-[#57e071]/20 transition-colors">
                          <FaFileCode className="text-[#57e071] text-xs" />
                        </div>
                        <span className="flex-1 text-left">JSON Format</span>
                        <span className="text-xs text-zinc-600">.json</span>
                      </button>

                      <div className="border-t border-zinc-800/50 my-1" />

                      <button
                        onClick={() => exportData("pdf")}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-white transition-colors group opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#57e071]/10 flex items-center justify-center">
                          <FaFilePdf className="text-[#57e071] text-xs" />
                        </div>
                        <span className="flex-1 text-left">PDF Format</span>
                        <span className="text-xs text-zinc-600">soon</span>
                      </button>
                    </div>

                    {/* Rodapé decorativo */}
                    <div className="px-4 py-2 bg-zinc-800/30 border-t border-zinc-800/50">
                      <p className="text-xs text-zinc-600">
                        Export {filteredProjects.length} node{filteredProjects.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

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

            <Link
              href="/dashboard/connect"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#57e071] to-[#3fa855] rounded-xl px-6 py-3 text-black font-semibold hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#57e071]/20 hover:shadow-xl hover:shadow-[#57e071]/30"
            >
              <FaPlus className="transition-transform group-hover:rotate-90" /> Add Node
            </Link>
          </div>
        </div>

        {/* Renderização condicional: Cards ou Tabela */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
              const projectStats = stats?.find(s => s.id === p.id);
              return (
                <div
                  key={p.id}
                  className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 transition-all duration-300 hover:border-[#57e071]/30 hover:shadow-xl hover:shadow-[#57e071]/5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#57e071]/0 via-[#57e071]/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === p.id ? null : p.id);
                    }}
                    className="absolute top-5 right-5 text-zinc-500 hover:text-white transition p-1 rounded-lg hover:bg-zinc-800"
                  >
                    <FaEllipsisV className="w-4 h-4" />
                  </button>

                  {openMenu === p.id && (
                    <div className="absolute top-12 right-5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-44 z-50 animate-in fade-in zoom-in duration-200 overflow-hidden">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        TERMINATE NODE
                      </button>
                    </div>
                  )}

                  <Link href={`/dashboard/${p.id}`} className="block space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center">
                        <FaGithub className="text-zinc-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">REPO</span>
                        <p className="text-lg font-semibold text-white truncate">{p.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#57e071] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#57e071]"></span>
                        </span>
                        <span className="text-zinc-400">Online</span>
                      </div>
                      <span className="text-zinc-600 font-mono text-xs">#{p.id.slice(-4)}</span>
                    </div>

                    {projectStats && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/50">
                        <div className="text-center">
                          <div className="text-xs text-zinc-500">Stars</div>
                          <div className="text-sm font-semibold text-white flex items-center justify-center gap-1">
                            <FaStar className="text-[#57e071]/70 text-xs" /> {projectStats.stars || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-zinc-500">Forks</div>
                          <div className="text-sm font-semibold text-white flex items-center justify-center gap-1">
                            <FaCodeBranch className="text-[#57e071]/70 text-xs" /> {projectStats.forks || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-zinc-500">Issues</div>
                          <div className="text-sm font-semibold text-white flex items-center justify-center gap-1">
                            <FaBug className="text-[#57e071]/70 text-xs" /> {projectStats.openIssues || 0}
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          /* Visualização em Tabela */
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 text-zinc-300 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Repository</th>
                  <th className="px-6 py-4 font-medium">Language</th>
                  <th className="px-6 py-4 font-medium">Stars</th>
                  <th className="px-6 py-4 font-medium">Forks</th>
                  <th className="px-6 py-4 font-medium">Issues</th>
                  <th className="px-6 py-4 font-medium">Watchers</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredProjects.map((p) => {
                  const projectStats = stats?.find(s => s.id === p.id);
                  return (
                    <tr
                      key={p.id}
                      className="group hover:bg-zinc-800/20 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        <Link href={`/dashboard/${p.id}`} className="hover:text-[#57e071] transition-colors">
                          {p.fullName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <span className="px-2 py-1 bg-zinc-800/50 rounded-full text-xs">
                          {projectLanguages[p.id] || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{projectStats?.stars || 0}</td>
                      <td className="px-6 py-4 text-zinc-400">{projectStats?.forks || 0}</td>
                      <td className="px-6 py-4 text-zinc-400">{projectStats?.openIssues || 0}</td>
                      <td className="px-6 py-4 text-zinc-400">{projectStats?.watchers || 0}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                          Delete <FaTrash className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 backdrop-blur-sm">
            <p className="text-zinc-500">No nodes found with this filter.</p>
          </div>
        )}
      </section>

      {/* SECTION: Analytics */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent flex items-center gap-2">
            Aggregated Intelligence
            <InfoTooltip text="Combined activity and technology usage from all nodes." />
          </h2>
          <div className="flex bg-zinc-900/70 p-1 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
            {[
              { label: "ALL", days: 0 },
              { label: "7D", days: 7 },
              { label: "30D", days: 30 },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setCommitPeriod(opt.days)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${commitPeriod === opt.days
                    ? "bg-gradient-to-r from-[#57e071] to-[#3fa855] text-black shadow-lg"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Commits Chart */}
          <div className="lg:col-span-8 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:border-[#57e071]/30 hover:shadow-2xl hover:shadow-[#57e071]/5">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
                Network Activity Stream
              </span>
              <span className="text-xs text-zinc-600">Last {commitPeriod || "all"} days</span>
            </div>
            <p className="text-sm text-zinc-500 mb-6">Commit trend across all connected repositories.</p>
            <div className="h-[300px] w-full">
              <CommitsChart data={filteredCommits} />
            </div>
          </div>

          {/* Languages Donut */}
          <div className="lg:col-span-4 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:border-[#57e071]/30 hover:shadow-2xl hover:shadow-[#57e071]/5 flex flex-col">
            <div className="mb-4">
              <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
                Source Composition
              </span>
            </div>
            <p className="text-sm text-zinc-500 mb-4">Language distribution across repositories.</p>
            <div className="relative flex-1 flex items-center justify-center min-h-[240px]">
              <LanguagesDonut
                data={Object.entries(languageData).map(([name, value]) => ({ name, value }))}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* --- QuickStatHighEnd Component --- */
function QuickStatHighEnd({
  label,
  value,
  icon,
  info,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  info?: string;
  trend?: number;
}) {
  const trendColor =
    trend && trend > 0
      ? "text-[#57e071]"
      : trend && trend < 0
        ? "text-red-400"
        : "text-zinc-500";
  const trendIcon = trend && trend > 0 ? "↑" : trend && trend < 0 ? "↓" : null;

  return (
    <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 transition-all duration-300 hover:border-[#57e071]/30 hover:shadow-xl hover:shadow-[#57e071]/5">
      <div className="absolute inset-0 bg-gradient-to-r from-[#57e071]/0 via-[#57e071]/5 to-transparent opacity-0 hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700/50">
          {icon}
        </div>
        {info && <InfoTooltip text={info} />}
      </div>

      <div>
        <p className="text-sm text-zinc-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      </div>

      {trend !== undefined && (
        <div className={`mt-3 flex items-center gap-1 text-xs ${trendColor}`}>
          <span>{trendIcon}</span>
          <span>{Math.abs(trend)}%</span>
          <span className="text-zinc-600 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}

/* --- InfoTooltip Component --- */
function InfoTooltip({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`relative group cursor-pointer ${className || ""}`}>
      <InformationCircleIcon className="w-4 h-4 text-zinc-600 hover:text-[#57e071] transition-colors" />
      <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl border border-zinc-800 z-50">
        {text}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-16 animate-pulse">
      {/* SECTION: Global Network Metrics */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-64 bg-zinc-800/50 rounded-lg" />
          <div className="w-5 h-5 bg-zinc-800/50 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between">
                <div className="w-10 h-10 bg-zinc-800/50 rounded-xl" />
                <div className="w-5 h-5 bg-zinc-800/50 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-zinc-800/50 rounded" />
                <div className="h-8 w-16 bg-zinc-800/50 rounded" />
              </div>
              <div className="h-3 w-24 bg-zinc-800/50 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: Active Nodes */}
      <section className="space-y-8">
        {/* Header with filters and actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-zinc-800/50 rounded-lg" />
            <div className="h-4 w-32 bg-zinc-800/50 rounded" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-32 bg-zinc-800/50 rounded-xl" /> {/* language filter */}
            <div className="h-10 w-10 bg-zinc-800/50 rounded-xl" /> {/* view toggle */}
            <div className="h-10 w-24 bg-zinc-800/50 rounded-xl" /> {/* export button */}
            <div className="h-10 w-64 bg-zinc-800/50 rounded-xl" /> {/* search */}
            <div className="h-10 w-28 bg-zinc-800/50 rounded-xl" /> {/* add button */}
          </div>
        </div>

        {/* Projects grid (cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800/50 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-zinc-800/50 rounded" />
                    <div className="h-5 w-32 bg-zinc-800/50 rounded" />
                  </div>
                </div>
                <div className="w-6 h-6 bg-zinc-800/50 rounded-lg" /> {/* menu */}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-zinc-800/50 rounded-full" />
                <div className="h-3 w-12 bg-zinc-800/50 rounded" />
              </div>
              <div className="pt-2 border-t border-zinc-800/50 grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="text-center space-y-1">
                    <div className="h-3 w-8 mx-auto bg-zinc-800/50 rounded" />
                    <div className="h-4 w-6 mx-auto bg-zinc-800/50 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: Aggregated Intelligence */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-56 bg-zinc-800/50 rounded-lg" />
            <div className="w-5 h-5 bg-zinc-800/50 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-zinc-800/50 rounded-lg" />
            <div className="h-8 w-16 bg-zinc-800/50 rounded-lg" />
            <div className="h-8 w-16 bg-zinc-800/50 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart area */}
          <div className="lg:col-span-8 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between">
              <div className="h-4 w-40 bg-zinc-800/50 rounded" />
              <div className="h-4 w-20 bg-zinc-800/50 rounded" />
            </div>
            <div className="h-4 w-64 bg-zinc-800/50 rounded" />
            <div className="h-[240px] w-full bg-zinc-800/30 rounded-lg" />
          </div>

          {/* Donut area */}
          <div className="lg:col-span-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-4">
            <div className="h-4 w-36 bg-zinc-800/50 rounded" />
            <div className="h-4 w-48 bg-zinc-800/50 rounded" />
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <div className="w-40 h-40 bg-zinc-800/50 rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
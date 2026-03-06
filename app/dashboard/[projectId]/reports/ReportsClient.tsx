"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { CommitsChart } from "@/components/reports/CommitsChart";
import { LanguagesDonut } from "@/components/reports/LanguagesChart";
import {
  FaDownload,
  FaChevronDown,
  FaFileCsv,
  FaFileCode,
  FaFilePdf,
  FaCodeBranch,
  FaStar,
  FaExclamationCircle,
  FaUsers,
  FaChartLine,
  FaCogs,
  FaBalanceScale,
  FaRocket,
  FaRegClock,
  FaUserCircle,
  FaSyncAlt,
} from "react-icons/fa";
import { InformationCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

type RepoReport = {
  commits: {
    commits7d: number;
    commits30d: number;
    commits90d: number;
    daily: { date: string; count: number }[];
  };
  languages: Record<string, number>;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  closedIssues: number;
  openPRs: number;
  closedPRs: number;
  contributors: number;
  health: {
    score: number;
    grade: string;
    factors: {
      activity: number;
      process: number;
      maintainability: number;
      prLoad: number;
      popularity: number;
    };
    insights: string[];
  };
};

// Hook para animar números (count‑up) – sempre chamado incondicionalmente
function useAnimatedNumber(target: number, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16); // ~60fps
    let rafId: number;

    const step = (timestamp: number) => {
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

export default function ReportsClient({ projectId }: { projectId: string }) {
  // Hooks de estado (sempre na mesma ordem)
  const [report, setReport] = useState<RepoReport | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effects (sempre na mesma ordem)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);

  async function fetchReport() {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/github/repo/${projectId}/reports`, {
        cache: "no-store",
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [projectId]);

  // Memos (sempre na mesma ordem, com fallback)
  const langData = useMemo(() => {
    if (!report?.languages) return [];
    return Object.entries(report.languages).map(([name, value]) => ({
      name,
      value,
    }));
  }, [report]);

  const commitsSeries = useMemo(() => {
    return report?.commits?.daily ?? [];
  }, [report]);

  // Animated numbers (sempre chamados, com fallback para 0)
  const animatedStars = useAnimatedNumber(report?.stars ?? 0);
  const animatedForks = useAnimatedNumber(report?.forks ?? 0);
  const animatedOpenIssues = useAnimatedNumber(report?.openIssues ?? 0);
  const animatedContributors = useAnimatedNumber(report?.contributors ?? 0);
  const animatedCommits7d = useAnimatedNumber(report?.commits?.commits7d ?? 0);
  const animatedCommits30d = useAnimatedNumber(report?.commits?.commits30d ?? 0);
  const animatedCommits90d = useAnimatedNumber(report?.commits?.commits90d ?? 0);
  const animatedHealthScore = useAnimatedNumber(report?.health?.score ?? 0);

  // --- Funções de exportação ---
  const exportData = (format: 'csv' | 'json') => {
    if (!report) return;

    const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `github-report-${projectId}-${dateStr}`;

    if (format === 'json') {
      const jsonStr = JSON.stringify(report, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      downloadBlob(blob, `${filename}.json`);
    } else if (format === 'csv') {
      const csvContent = generateCSV(report);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${filename}.csv`);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const handlePdfDownload = async () => {
    setIsPdfGenerating(true);
    try {
      const response = await fetch(`/api/github/repo/${projectId}/reports/pdf`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `github-report-${projectId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Você pode adicionar um toast ou notificação aqui
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const generateCSV = (data: RepoReport): string => {
    const flattened = flattenObject(data);
    const headers = Object.keys(flattened);
    const values = headers.map(header => {
      const val = flattened[header];
      // Escapar strings que contenham vírgulas ou aspas
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    return [headers.join(','), values.join(',')].join('\n');
  };

  const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? `${prefix}.` : '';
      const value = obj[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, flattenObject(value, `${pre}${key}`));
      } else {
        // Se for array ou objeto não plano, serializa como JSON
        acc[`${pre}${key}`] = Array.isArray(value) || (value && typeof value === 'object')
          ? JSON.stringify(value)
          : value;
      }
      return acc;
    }, {} as Record<string, any>);
  };
  // ---------------------------------

  // Renderização condicional após todos os hooks
  if (!report) {
    return <ReportsSkeleton />;
  }

  // Cálculos que dependem de report (não são hooks)
  function calculateTrend(current: number, previous: number): number | undefined {
    if (previous === 0) {
      if (current === 0) return 0;
      return 100;
    }
    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
  }

  const trend7d = calculateTrend(
    report.commits.commits7d,
    report.commits.commits30d / 4
  );
  const trend30d = calculateTrend(
    report.commits.commits30d,
    report.commits.commits90d / 3
  );
  const avgCommitsPerContributor =
    report.contributors > 0
      ? Math.round(report.commits.commits90d / report.contributors)
      : 0;

  return (
    <div className="space-y-8 pt-14 pb-14 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Project Metrics
          </h2>
          <span className="text-xs text-zinc-600 font-mono">
            ID: <span className="text-zinc-400">{projectId}</span>
          </span>
        </div>

        {/* Export dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="group inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 hover:border-[#57e071]/30 rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-white transition-all duration-300 backdrop-blur-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <FaDownload className="group-hover:scale-110 transition-transform" />
            <span>Export</span>
            <FaChevronDown
              className={`w-3 h-3 transition-transform duration-300 ${isExportOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                <button
                  onClick={() => exportData('csv')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors group hover:scale-[1.01]"
                >
                  <div className="w-6 h-6 rounded-md bg-[#57e071]/10 flex items-center justify-center group-hover:bg-[#57e071]/20">
                    <FaFileCsv className="text-[#57e071] text-xs" />
                  </div>
                  <span className="flex-1 text-left">CSV</span>
                  <span className="text-xs text-zinc-600">.csv</span>
                </button>

                <button
                  onClick={() => exportData('json')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors group hover:scale-[1.01]"
                >
                  <div className="w-6 h-6 rounded-md bg-[#57e071]/10 flex items-center justify-center group-hover:bg-[#57e071]/20">
                    <FaFileCode className="text-[#57e071] text-xs" />
                  </div>
                  <span className="flex-1 text-left">JSON</span>
                  <span className="text-xs text-zinc-600">.json</span>
                </button>

                <button
                  onClick={handlePdfDownload}
                  disabled={isPdfGenerating}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors group hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-6 h-6 rounded-md bg-[#57e071]/10 flex items-center justify-center">
                    <FaFilePdf className="text-[#57e071] text-xs" />
                  </div>
                  <span className="flex-1 text-left">{isPdfGenerating ? 'Generating PDF...' : 'PDF'}</span>
                  <span className="text-xs text-zinc-600">.pdf</span>
                </button>
              </div>
              <div className="px-4 py-2 bg-zinc-800/30 border-t border-zinc-800/50">
                <p className="text-xs text-zinc-600">Complete project report</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Seção: KEY METRICS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-zinc-600 tracking-wider">KEY METRICS</span>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            label="Stars"
            value={animatedStars}
            icon={<FaStar className="text-[#57e071]" />}
            className="hover:scale-[1.01] transition-transform"
          />
          <MetricCard
            label="Forks"
            value={animatedForks}
            icon={<FaCodeBranch className="text-[#57e071]" />}
            className="hover:scale-[1.01] transition-transform"
          />
          <MetricCard
            label="Open Issues"
            value={animatedOpenIssues}
            icon={<FaExclamationCircle className="text-[#57e071]" />}
            className="hover:scale-[1.01] transition-transform"
          />
          <MetricCard
            label="Contributors"
            value={animatedContributors}
            icon={<FaUsers className="text-[#57e071]" />}
            className="hover:scale-[1.01] transition-transform"
          />
        </div>
      </div>

      {/* Seção: HEALTH + LANGUAGES */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-zinc-600 tracking-wider">HEALTH OVERVIEW</span>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Health Score Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-[#57e071]/30 min-h-[340px] flex flex-col hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
                Health Score
              </span>
              <InfoTooltip text="Composite index based on activity, processes, maintainability, PR load and popularity." />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
              <div className="relative flex items-center justify-center">
                <ProgressRing progress={animatedHealthScore} size={100} strokeWidth={6} />
                <div className="absolute text-2xl font-semibold text-white">
                  {animatedHealthScore}
                </div>
              </div>
              <div className="flex-1 space-y-1 text-sm text-zinc-400">
                {report.health.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#57e071] mt-1">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-zinc-600">Grade:</span>
              <span className="text-[#57e071] font-semibold text-base">{report.health.grade}</span>
            </div>
          </div>

          {/* Languages Card */}
          <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-[#57e071]/30 min-h-[340px] flex flex-col hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
                LANGUAGE DISTRIBUTION
              </span>
              <InfoTooltip text="Proportion of code bytes per language." />
            </div>
            <div className="flex-1 w-full flex items-center justify-center">
              <LanguagesDonut data={langData} />
            </div>
          </div>
        </div>
      </div>

      {/* Seção: COMMIT ACTIVITY */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-zinc-600 tracking-wider">DEVELOPMENT ACTIVITY</span>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart area */}
          <div className="lg:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:border-[#57e071]/30 hover:scale-[1.01]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
                  Commit Activity
                </span>
                <InfoTooltip text="Number of commits per day over the last 90 days." />
              </div>
              <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
                <PeriodButton
                  active={selectedPeriod === "7d"}
                  onClick={() => setSelectedPeriod("7d")}
                >
                  7d
                </PeriodButton>
                <PeriodButton
                  active={selectedPeriod === "30d"}
                  onClick={() => setSelectedPeriod("30d")}
                >
                  30d
                </PeriodButton>
                <PeriodButton
                  active={selectedPeriod === "90d"}
                  onClick={() => setSelectedPeriod("90d")}
                >
                  90d
                </PeriodButton>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <CommitsChart data={commitsSeries} />
            </div>
          </div>

          {/* Stacked commit cards */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <MetricCard
              label="Commits (7d)"
              value={animatedCommits7d}
              icon={<FaCodeBranch className="text-[#57e071]" />}
              trend={trend7d}
              className="flex-1 hover:scale-[1.01] transition-transform"
            />
            <MetricCard
              label="Commits (30d)"
              value={animatedCommits30d}
              icon={<FaCodeBranch className="text-[#57e071]" />}
              trend={trend30d}
              className="flex-1 hover:scale-[1.01] transition-transform"
            />
            <MetricCard
              label="Commits (90d)"
              value={animatedCommits90d}
              icon={<FaCodeBranch className="text-[#57e071]" />}
              className="flex-1 hover:scale-[1.01] transition-transform"
            />
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 text-xs text-zinc-500 text-center hover:scale-[1.01] transition-transform">
              Total commits (90d): <span className="text-white font-mono">{report.commits.commits90d}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: HEALTH FACTORS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-zinc-600 tracking-wider">HEALTH FACTORS</span>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <FactorCard
            label="Activity"
            value={report.health.factors.activity}
            icon={<FaChartLine />}
            tooltip="Frequency and regularity of commits."
          />
          <FactorCard
            label="Process"
            value={report.health.factors.process}
            icon={<FaCogs />}
            tooltip="Use of issues, PRs and automation."
          />
          <FactorCard
            label="Maintainability"
            value={report.health.factors.maintainability}
            icon={<FaBalanceScale />}
            tooltip="Code quality and documentation."
          />
          <FactorCard
            label="PR Load"
            value={report.health.factors.prLoad}
            icon={<FaRocket />}
            tooltip="Average time to merge PRs."
          />
          <FactorCard
            label="Popularity"
            value={report.health.factors.popularity}
            icon={<FaStar />}
            tooltip="Stars, forks and watchers."
          />
        </div>
      </div>

      {/* Seção: DEVELOPER PROFILE INSIGHT */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-zinc-600 tracking-wider">DEVELOPER PROFILE INSIGHT</span>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-start gap-4 hover:scale-[1.01] transition-transform">
            <div className="p-3 rounded-full bg-[#57e071]/10 text-[#57e071]">
              <FaUserCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-600 font-mono mb-1">TOTAL CONTRIBUTORS</div>
              <div className="text-2xl font-semibold text-white">{report.contributors}</div>
              <div className="text-xs text-zinc-500 mt-2">
                <span className="text-[#57e071]">{report.contributors > 10 ? 'Active' : 'Growing'}</span> team
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-start gap-4 hover:scale-[1.01] transition-transform">
            <div className="p-3 rounded-full bg-[#57e071]/10 text-[#57e071]">
              <FaCodeBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-600 font-mono mb-1">AVG COMMITS / CONTRIBUTOR</div>
              <div className="text-2xl font-semibold text-white">{avgCommitsPerContributor}</div>
              <div className="text-xs text-zinc-500 mt-2">over the last 90 days</div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-start gap-4 hover:scale-[1.01] transition-transform">
            <div className="p-3 rounded-full bg-[#57e071]/10 text-[#57e071]">
              <FaRegClock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-600 font-mono mb-1">LEAD TIME (approx.)</div>
              <div className="text-2xl font-semibold text-white">
                {report.health.factors.prLoad > 0.7 ? 'Low' : 'High'}
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                based on PR load factor
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-zinc-700 text-center pt-4 border-t border-zinc-800/50">
        <span>Report generated automatically • </span>
        <button
          onClick={fetchReport}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 text-[#57e071] hover:underline disabled:opacity-50"
        >
          Refresh data
          <ArrowPathIcon
            className={`w-4 h-4 transition-transform ${isRefreshing ? "animate-spin" : ""
              }`}
          />
        </button>
      </div>
    </div>
  );
}

// Helper components

function MetricCard({ label, value, icon, trend, className = "" }: { label: string; value: number; icon: React.ReactNode; trend?: number; className?: string }) {
  return (
    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-[#57e071]/30 transition-all group ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-600 font-mono">{label}</span>
        <div className="text-zinc-500 group-hover:text-[#57e071] transition-colors">{icon}</div>
      </div>
      <div className="text-2xl font-semibold text-white">{value.toLocaleString()}</div>
      {trend !== undefined && (
        <div
          className={`text-xs mt-1 ${trend >= 0 ? "text-[#57e071]" : "text-red-400"
            }`}
        >
          {trend > 0 ? "+" : ""}
          {trend}% vs previous period
        </div>
      )}
    </div>
  );
}

function FactorCard({ label, value, icon, tooltip }: { label: string; value: number; icon: React.ReactNode; tooltip: string }) {
  const animatedPercent = useAnimatedNumber(Math.round(value * 100));
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 transition-all duration-300 hover:border-[#57e071]/30 relative group hover:scale-[1.01]">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[#57e071] text-sm">{icon}</div>
        <span className="text-xs uppercase text-zinc-600 font-mono tracking-wider">
          {label}
        </span>
        <InfoTooltip text={tooltip} />
      </div>
      <div className="text-2xl text-white font-semibold mb-2">{animatedPercent}%</div>
      <div className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#57e071] to-[#3fa855] rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}

function ProgressRing({ progress, size, strokeWidth }: { progress: number; size: number; strokeWidth: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-zinc-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-[#57e071] transition-all duration-700"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PeriodButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-md transition-colors hover:scale-[1.01] ${active
        ? "bg-[#57e071] text-black font-medium"
        : "text-zinc-400 hover:text-white hover:bg-zinc-700/50"
        }`}
    >
      {children}
    </button>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="relative group/tooltip cursor-pointer">
      <InformationCircleIcon className="w-4 h-4 text-zinc-600 hover:text-[#57e071] transition-colors" />

      <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity shadow-2xl border border-zinc-800 z-50">
        {text}
      </div>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-8 pt-14 pb-20 animate-pulse">
      {/* Header skeleton */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-zinc-800/50 rounded-lg" />
          <div className="h-4 w-40 bg-zinc-800/50 rounded-lg" />
        </div>
        <div className="h-10 w-24 bg-zinc-800/50 rounded-xl" />
      </header>

      {/* KEY METRICS section skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-24 bg-zinc-800/50 rounded" />
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>

      {/* HEALTH OVERVIEW section skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-32 bg-zinc-800/50 rounded" />
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Health Score Card skeleton */}
          <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 min-h-[340px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-24 bg-zinc-800/50 rounded" />
              <div className="w-4 h-4 bg-zinc-800/50 rounded" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
              <div className="flex items-center justify-center">
                <div className="w-[100px] h-[100px] rounded-full bg-zinc-800/50" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-zinc-800/50 rounded" />
                <div className="h-4 w-5/6 bg-zinc-800/50 rounded" />
                <div className="h-4 w-4/6 bg-zinc-800/50 rounded" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-12 bg-zinc-800/50 rounded" />
              <div className="h-6 w-16 bg-zinc-800/50 rounded" />
            </div>
          </div>

          {/* Languages Card skeleton */}
          <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 min-h-[340px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-40 bg-zinc-800/50 rounded" />
              <div className="w-4 h-4 bg-zinc-800/50 rounded" />
            </div>
            <div className="flex-1 w-full flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-zinc-800/50" />
            </div>
          </div>
        </div>
      </div>

      {/* DEVELOPMENT ACTIVITY section skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-36 bg-zinc-800/50 rounded" />
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart area skeleton */}
          <div className="lg:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 bg-zinc-800/50 rounded" />
                <div className="w-4 h-4 bg-zinc-800/50 rounded" />
              </div>
              <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
                <div className="h-6 w-10 bg-zinc-700/50 rounded" />
                <div className="h-6 w-10 bg-zinc-700/50 rounded" />
                <div className="h-6 w-10 bg-zinc-700/50 rounded" />
              </div>
            </div>
            <div className="h-[300px] w-full bg-zinc-800/30 rounded-lg" />
          </div>

          {/* Stacked commit cards skeleton */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />
            ))}
            <div className="h-16 bg-zinc-800/50 rounded-xl" />
          </div>
        </div>
      </div>

      {/* HEALTH FACTORS section skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-32 bg-zinc-800/50 rounded" />
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-800/50 rounded-xl" />
          ))}
        </div>
      </div>

      {/* DEVELOPER PROFILE INSIGHT section skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-44 bg-zinc-800/50 rounded" />
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-800/50 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="text-xs text-zinc-700 text-center pt-4 border-t border-zinc-800/50">
        <div className="h-4 w-48 bg-zinc-800/50 rounded mx-auto" />
      </div>
    </div>
  );
}
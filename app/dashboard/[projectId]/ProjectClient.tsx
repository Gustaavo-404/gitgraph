"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

type RepoReport = {
  commits: {
    commits7d: number;
    commits30d: number;
    commits90d: number;
  };
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

type ProjectDetails = {
  id: string;
  fullName: string;  // ex: "owner/repo"
};

/* Hook para animação de número  */
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

export default function ProjectClient({ projectId }: { projectId: string }) {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [report, setReport] = useState<RepoReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function fetchData(isManualRefresh = false) {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      // 1. Buscar detalhes do projeto para obter o fullName
      const projectRes = await fetch(`/api/projects/${projectId}`);
      const projectData = await projectRes.json();
      setProjectDetails(projectData);

      // 2. Buscar relatório do repositório
      const reportRes = await fetch(`/api/github/repo/${projectId}/reports`, {
        cache: "no-store",
      });
      const reportData = await reportRes.json();
      setReport(reportData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const animatedHealthScore = useAnimatedNumber(report?.health?.score ?? 0);

  /* Classification Engine         */
  const classification = useMemo(() => {
    if (!report) return null;

    const { contributors, stars, openIssues, commits } = report;
    const activity = commits.commits30d;
    const issuePressure = openIssues / Math.max(activity, 1);

    let status: "Healthy" | "Stable" | "Warning" | "At Risk";

    if (report.health.score > 75) status = "Healthy";
    else if (report.health.score > 60) status = "Stable";
    else if (report.health.score > 40) status = "Warning";
    else status = "At Risk";

    const model =
      contributors <= 1
        ? "Solo Maintained"
        : contributors < 6
        ? "Small Core Team"
        : "Community Driven";

    const maturity =
      stars < 200
        ? "Early Stage"
        : stars < 5000
        ? "Growing"
        : "Mature";

    const risks: string[] = [];
    if (contributors <= 1) risks.push("High bus factor");
    if (issuePressure > 4) risks.push("Issue backlog pressure");
    if (activity < 5) risks.push("Low recent activity");

    return { status, model, maturity, risks };
  }, [report]);

  if (isLoading || !report || !classification || !projectDetails) {
    return <ProjectSkeleton />;
  }

  const statusVariant = mapStatus(classification.status);

  return (
    <div className="space-y-8 pt-14 pb-14 animate-in fade-in duration-500">
      {/* ================= HEADER ================= */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {projectDetails.fullName.split('/')[1] || projectDetails.fullName}
          </h2>
          <span className="text-xs text-zinc-600 font-mono">
            ID: <span className="text-zinc-400">{projectId}</span>
          </span>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge label={classification.status} variant={statusVariant} />
            <Badge label={classification.model} variant="neutral" />
            <Badge label={classification.maturity} variant="neutral" />
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <a
            href={`https://github.com/${projectDetails.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#57e071]/30 transition-all duration-300"
          >
            <FaGithub className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm">View on GitHub</span>
            <FaExternalLinkAlt className="w-3 h-3 opacity-60" />
          </a>

          <Link
            href={`/dashboard/${projectId}/reports`}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-[#57e071] to-[#3fa855] text-black font-semibold text-sm hover:opacity-90 transition-all"
          >
            <FaChartLine className="w-4 h-4" />
            Advanced Analytics
          </Link>
        </div>
      </header>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-zinc-600 tracking-wider">
            EXECUTIVE SUMMARY
          </span>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={animatedHealthScore} size={80} strokeWidth={5} />
              <div className="absolute text-xl font-semibold text-white">
                {animatedHealthScore}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Health Score:{" "}
                <span className="text-white font-semibold">
                  {report.health.score}
                </span>{" "}
                ({report.health.grade}). The repository shows{" "}
                <span className="text-[#57e071] font-medium">
                  {classification.status.toLowerCase()}
                </span>{" "}
                structural signals.
              </p>

              {classification.risks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {classification.risks.map((risk, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
                    >
                      <FaExclamationTriangle className="w-3 h-3" />
                      {risk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono text-zinc-600 tracking-wider">
            STRATEGIC INSIGHTS
          </span>
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="space-y-2 text-sm text-zinc-400">
            {report.health.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#57e071] mt-1">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "warning" | "danger" | "neutral";
}) {
  const styles = {
    success: "bg-[#57e071]/10 text-[#57e071] border-[#57e071]/30",
    warning: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    danger: "bg-red-400/10 text-red-400 border-red-400/30",
    neutral: "bg-zinc-700/20 text-zinc-300 border-zinc-600/40",
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[variant]}`}>
      {label}
    </span>
  );
}

function mapStatus(status: string) {
  if (status === "Healthy") return "success";
  if (status === "Stable") return "neutral";
  if (status === "Warning") return "warning";
  return "danger";
}

function ProgressRing({
  progress,
  size,
  strokeWidth,
}: {
  progress: number;
  size: number;
  strokeWidth: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        className="text-zinc-800"
        stroke="currentColor"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-[#57e071] transition-all duration-700"
        strokeLinecap="round"
        stroke="currentColor"
      />
    </svg>
  );
}

function ProjectSkeleton() {
  return (
    <div className="space-y-8 pt-14 pb-14 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-zinc-800/50 rounded-lg" />
          <div className="h-4 w-40 bg-zinc-800/50 rounded-lg" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-20 bg-zinc-800/50 rounded-full" />
            <div className="h-6 w-28 bg-zinc-800/50 rounded-full" />
            <div className="h-6 w-20 bg-zinc-800/50 rounded-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-11 w-32 bg-zinc-800/50 rounded-xl" />
          <div className="h-11 w-40 bg-zinc-800/50 rounded-xl" />
        </div>
      </div>

      {/* Executive Summary Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-32 bg-zinc-800/50 rounded" />
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-4 w-full bg-zinc-800/50 rounded" />
              <div className="h-4 w-3/4 bg-zinc-800/50 rounded" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-24 bg-zinc-800/50 rounded-full" />
                <div className="h-6 w-32 bg-zinc-800/50 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Insights Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-36 bg-zinc-800/50 rounded" />
          <div className="h-px flex-1 bg-zinc-800/50" />
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-3">
          <div className="h-4 w-full bg-zinc-800/50 rounded" />
          <div className="h-4 w-5/6 bg-zinc-800/50 rounded" />
          <div className="h-4 w-4/6 bg-zinc-800/50 rounded" />
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";

export type HealthScore = {
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

export function useRepoReport(projectId: string) {
  const [data, setData] = useState<RepoReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function fetchReport() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/github/repo/${projectId}/reports`);
        if (!res.ok) throw new Error("Failed to fetch repo report");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [projectId]);

  return { data, isLoading, error };
}

import { useState, useEffect } from "react";

export type RepoStats = {
  id: string;
  fullName: string;
  name: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  syncActive: boolean;
  lastCommitDate: string;
};

export function useStats() {
  const [data, setData] = useState<RepoStats[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/github/stats");
        if (!res.ok) throw new Error("Failed to fetch stats");
        const stats = await res.json();
        setData(stats);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { data, isLoading, error };
}

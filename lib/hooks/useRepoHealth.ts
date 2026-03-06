import { useState, useEffect } from "react";
import { RepoHealthResponse } from "@/app/types";

export function useRepoHealth(projectId: string) {
  const [data, setData] = useState<RepoHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function fetchHealth() {
      try {
        const res = await fetch(`/api/github/stats/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch repo health");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHealth();
  }, [projectId]);

  return { data, isLoading, error };
}

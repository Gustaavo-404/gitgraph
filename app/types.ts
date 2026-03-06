// app/types.ts
export interface CommitData {
  date: string;
  count: number;
}

export interface LanguageData {
  [lang: string]: number;
}

export interface StatsData {
  id: string;
  fullName: string;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
}

export type HealthScore = {
  score: number;
  grade: "Excellent" | "Good" | "Fair" | "Poor";
  factors: {
    activity: number;
    process: number;
    maintainability: number;
    prLoad: number;
    popularity: number;
  };
  insights: string[];
};

export type RepoHealthResponse = {
  raw: {
    commits: {
      commits7d: number;
      commits30d: number;
      commits90d: number;
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
  };
  health: HealthScore;
};

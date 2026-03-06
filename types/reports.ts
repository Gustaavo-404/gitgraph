export type RepoReport = {
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
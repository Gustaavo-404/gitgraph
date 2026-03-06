import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/* ---------- helpers ---------- */

async function fetchAll(url: string, token: string) {
  let page = 1;
  let all: any[] = [];

  while (true) {
    const res = await fetch(`${url}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) break;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    all = all.concat(data);
    page++;
  }

  return all;
}

function normalize(value: number, min: number, max: number) {
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/* ---------- health score engine ---------- */

function computeHealthScore(params: {
  commits30d: number;
  commits7d: number;
  openIssues: number;
  closedIssues: number;
  openPRs: number;
  closedPRs: any[];
  contributors: number;
  stars: number;
}) {
  const {
    commits30d,
    commits7d,
    openIssues,
    closedIssues,
    openPRs,
    closedPRs,
    contributors,
    stars,
  } = params;

  const activityScore =
    normalize(commits30d, 0, 100) * 0.6 +
    normalize(commits7d, 0, 30) * 0.4;

  const issueClosureRatio =
    closedIssues / Math.max(1, openIssues + closedIssues);

  const mergedPRs = closedPRs.filter((pr) => pr.merged_at).length;
  const prMergeRatio = mergedPRs / Math.max(1, closedPRs.length);
  const prLoadScore = 1 - normalize(openPRs, 0, 20);

  const processScore =
    0.5 * issueClosureRatio + 0.5 * prMergeRatio;

  const busFactorRisk = contributors <= 1 ? 1 : contributors <= 2 ? 0.7 : 0.2;
  const maintainabilityScore = 1 - busFactorRisk;

  const popularityScore = normalize(stars, 0, 1000);

  const health =
    0.25 * activityScore +
    0.25 * processScore +
    0.20 * maintainabilityScore +
    0.15 * prLoadScore +
    0.15 * popularityScore;

  const score = Math.round(health * 100);

  const grade =
    score >= 85 ? "Excellent" :
      score >= 70 ? "Good" :
        score >= 50 ? "Fair" : "Poor";

  const insights: string[] = [];

  if (commits7d < 3) insights.push("Low recent activity detected.");
  if (issueClosureRatio < 0.5) insights.push("Issue backlog growing.");
  if (prMergeRatio < 0.5) insights.push("Low PR merge rate.");
  if (contributors <= 1) insights.push("High risk: single maintainer.");
  if (stars < 10) insights.push("Low community adoption.");

  return {
    score,
    grade,
    factors: {
      activity: Number(activityScore.toFixed(2)),
      process: Number(processScore.toFixed(2)),
      maintainability: Number(maintainabilityScore.toFixed(2)),
      prLoad: Number(prLoadScore.toFixed(2)),
      popularity: Number(popularityScore.toFixed(2)),
    },
    insights,
  };
}

/* ---------- endpoint ---------- */

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const params = await context.params;

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!project) {
    return new Response("Project not found", { status: 404 });
  }

  const token = (session.user as any).accessToken;
  const repoFullName = project.fullName;

  const [
    commits,
    languages,
    repoInfo,
    openIssues,
    closedIssues,
    openPRs,
    closedPRs,
    contributors,
  ] = await Promise.all([
    fetchAll(`https://api.github.com/repos/${repoFullName}/commits?per_page=100`, token),
    fetch(`https://api.github.com/repos/${repoFullName}/languages`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
    fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
    fetchAll(`https://api.github.com/repos/${repoFullName}/issues?state=open&per_page=100`, token),
    fetchAll(`https://api.github.com/repos/${repoFullName}/issues?state=closed&per_page=100`, token),
    fetchAll(`https://api.github.com/repos/${repoFullName}/pulls?state=open&per_page=100`, token),
    fetchAll(`https://api.github.com/repos/${repoFullName}/pulls?state=closed&per_page=100`, token),
    fetchAll(`https://api.github.com/repos/${repoFullName}/contributors?per_page=100`, token),
  ]);

  /* commits agregados */

  function countCommits(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return commits.filter(
      (c) => new Date(c.commit.author.date) >= since
    ).length;
  }

  const commits7d = countCommits(7);
  const commits30d = countCommits(30);
  const commits90d = countCommits(90);

  /* série diária real (30 dias) */

  const days = 30;
  const commitsDailyMap: Record<string, number> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    commitsDailyMap[key] = 0;
  }

  commits.forEach((c) => {
    const date = c.commit.author.date.slice(0, 10);
    if (commitsDailyMap[date] !== undefined) {
      commitsDailyMap[date]++;
    }
  });

  const commitsDaily = Object.entries(commitsDailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  /* languages % */

  const totalBytes = Object.values(languages).reduce(
    (acc: number, v: any) => acc + v,
    0
  );

  const languagesPercent: Record<string, number> = {};
  for (const lang in languages) {
    languagesPercent[lang] = Math.round(
      (languages[lang] / totalBytes) * 100
    );
  }

  /* health */

  const health = computeHealthScore({
    commits30d,
    commits7d,
    openIssues: openIssues.length,
    closedIssues: closedIssues.length,
    openPRs: openPRs.length,
    closedPRs,
    contributors: contributors.length,
    stars: repoInfo.stargazers_count,
  });

  return Response.json({
    commits: {
      commits7d,
      commits30d,
      commits90d,
      daily: commitsDaily
    },
    languages: languagesPercent,
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    watchers: repoInfo.watchers_count,
    openIssues: openIssues.length,
    closedIssues: closedIssues.length,
    openPRs: openPRs.length,
    closedPRs: closedPRs.length,
    contributors: contributors.length,
    health,
  });
}

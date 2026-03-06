import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = session.user.accessToken;
  const res = await fetch("https://api.github.com/user/repos?per_page=100", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return new Response("Error fetching repos", { status: 500 });

  const data = await res.json();

  const stats = data.map((repo: any) => ({
    id: repo.id,
    fullName: repo.full_name,
    name: repo.name,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    watchers: repo.watchers_count,
    syncActive: true,
    lastCommitDate: repo.pushed_at,
  }));

  return Response.json(stats);
}

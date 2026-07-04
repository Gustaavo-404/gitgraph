import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });

  if (!res.ok) {
    return new Response("Failed to fetch from GitHub", { status: res.status });
  }

  const data = await res.json();

  // Mapeia e padroniza a resposta mantendo compatibilidade dupla
  const mappedData = data.map((repo: any) => ({
    id: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,       // Padrão camelCase
    full_name: repo.full_name,      // Mantido para compatibilidade com o frontend
    private: repo.private,          // Adicionado para a badge de privado
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    watchers: repo.watchers_count,
    language: repo.language,
  }));

  return Response.json(mappedData);
}
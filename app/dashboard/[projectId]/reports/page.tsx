import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import ReportsClient from "./ReportsClient";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectId } = await params;

  try {
    // 1. Identifica o host e protocolo da requisição atual
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // 2. Recupera os cookies da sessão atual
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // 3. Faz a requisição encaminhando os cookies de autenticação
    const res = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      headers: {
        Cookie: cookieString,
      },
    });

    if (res.ok) {
      const projectDetails = await res.json();
      const fullName = projectDetails?.fullName || "";
      const projectName = fullName.split("/")[1] || fullName;

      if (projectName) {
        return {
          title: `GitGraph - ${projectName} `,
          // Se preferir diferenciar da página inicial do projeto, você também pode usar:
          // title: `${projectName} - Métricas | GitGraph`,
        };
      }
    }
  } catch (err) {
    console.error("Erro ao recuperar metadados para as métricas:", err);
  }

  return {
    title: "GitGraph Reports",
  };
}

export default async function Page({ params }: PageProps) {
  const { projectId } = await params;

  return <ReportsClient projectId={projectId} />;
}
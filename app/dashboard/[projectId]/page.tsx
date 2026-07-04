import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import ProjectClient from "./ProjectClient";

type Props = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

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
        };
      }
    }
  } catch (err) {
    console.error("Erro ao recuperar metadados:", err);
  }

  return {
    title: "GitGraph Project",
  };
}

export default async function Page({ params }: Props) {
  const { projectId } = await params;
  
  return <ProjectClient projectId={projectId} />;
}
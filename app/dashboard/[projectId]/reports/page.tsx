import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProjectById } from "@/lib/project-service";
import ReportsClient from "./ReportsClient";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { projectId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      title: "GitGraph Reports",
    };
  }

  try {
    const project = await getProjectById(
      projectId,
      session.user.id
    );

    if (project?.fullName) {
      const projectName =
        project.fullName.split("/")[1] ?? project.fullName;

      return {
        title: `GitGraph - ${projectName}`,
      };
    }
  } catch (err) {
    console.error(
      "Erro ao recuperar metadados para as métricas:",
      err
    );
  }

  return {
    title: "GitGraph Reports",
  };
}

export default async function Page({
  params,
}: PageProps) {
  const { projectId } = await params;

  return <ReportsClient projectId={projectId} />;
}
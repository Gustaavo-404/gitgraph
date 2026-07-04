import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProjectById } from "@/lib/project-service";
import ProjectClient from "./ProjectClient";

type Props = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { projectId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      title: "GitGraph Project",
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
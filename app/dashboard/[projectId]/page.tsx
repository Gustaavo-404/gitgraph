import ProjectClient from "./ProjectClient";

export default async function Page({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = await params;
  
  return <ProjectClient projectId={projectId} />;
}
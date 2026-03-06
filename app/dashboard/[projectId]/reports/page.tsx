import ReportsClient from "./ReportsClient";

interface PageProps {
  params: { projectId: string };
}

export default async function Page({ params }: PageProps) {
  const { projectId } = await params;

  return <ReportsClient projectId={projectId} />;
}
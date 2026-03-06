import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
  });

  return Response.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const project = await prisma.project.create({
    data: {
      userId: session.user.id,
      provider: body.provider,
      externalId: body.externalId,
      name: body.name,
      fullName: body.fullName,
    },
  });

  return Response.json(project);
}
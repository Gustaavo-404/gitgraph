import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  
  const session = await getServerSession(authOptions);
  const params = await context.params;

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const projectId = params.id;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new Response("Not found", { status: 404 });
    }

    const response = Response.json(project);
    response.headers.set("Cache-Control", "no-store");
    return response;

  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const session = await getServerSession(authOptions);
  const params = await context.params;

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const projectId = params.id;

  try {
    // segurança: garante que o projeto é do usuário
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new Response("Not found", { status: 404 });
    }

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });


    return NextResponse.json({ success: true });

  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

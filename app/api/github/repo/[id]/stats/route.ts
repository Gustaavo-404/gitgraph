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

  const data = await res.json();
  return Response.json(data);
}
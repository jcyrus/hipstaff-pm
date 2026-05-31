import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ message: "Search query is required" }, { status: 400 });
  }

  try {
    const [tasks, projects, users] = await prisma.$transaction([
      prisma.task.findMany({
        where: { title: { contains: query, mode: "insensitive" } },
      }),
      prisma.project.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
      }),
      prisma.user.findMany({
        where: { username: { contains: query, mode: "insensitive" } },
        select: { id: true, username: true, email: true, profilePictureUrl: true },
      }),
    ]);

    return NextResponse.json({
      tasks,
      projects,
      users: users.map((u) => ({ ...u, userId: u.id })),
    });
  } catch {
    return NextResponse.json({ message: "Error performing search" }, { status: 500 });
  }
}

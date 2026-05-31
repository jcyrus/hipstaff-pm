import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        profilePictureUrl: true,
        role: true,
        isActive: true,
        currentTeamId: true,
      },
    });
    // Map id → userId to match RTK Query User interface
    return NextResponse.json(users.map((u) => ({ ...u, userId: u.id })));
  } catch {
    return NextResponse.json({ message: "Error retrieving users" }, { status: 500 });
  }
}

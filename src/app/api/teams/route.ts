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
    const teams = await prisma.team.findMany({
      orderBy: { id: "asc" },
    });
    // Map id → teamId to match RTK Query Team interface
    return NextResponse.json(teams.map((t) => ({ ...t, teamId: t.id })));
  } catch {
    return NextResponse.json({ message: "Error retrieving teams" }, { status: 500 });
  }
}

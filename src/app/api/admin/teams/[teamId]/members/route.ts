import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logTeamMemberAdded, logTeamMemberRemoved } from "@/lib/audit";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/rbac/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;

  try {
    const members = await prisma.userTeam.findMany({
      where: { teamId: parseInt(teamId) },
      select: {
        id: true,
        userId: true,
        role: true,
        isActive: true,
        user: { select: { username: true, email: true } },
      },
    });

    // Transform to match admin page snake_case expectations
    const transformed = members.map((m) => ({
      id: m.id,
      user_id: m.userId,
      role: m.role,
      is_active: m.isActive,
      users: { username: m.user.username, email: m.user.email },
    }));

    return NextResponse.json(transformed);
  } catch {
    return NextResponse.json({ message: "Error fetching team members" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;
  const teamIdInt = parseInt(teamId);
  const body = await request.json();

  try {
    const existingMember = await prisma.userTeam.findUnique({
      where: { userId_teamId: { userId: body.userId, teamId: teamIdInt } },
    });

    if (existingMember) {
      const updated = await prisma.userTeam.update({
        where: { id: existingMember.id },
        data: { role: body.role || UserRole.Member },
      });
      return NextResponse.json(updated);
    }

    const newMember = await prisma.userTeam.create({
      data: {
        userId: body.userId,
        teamId: teamIdInt,
        role: body.role || UserRole.Member,
      },
    });

    await logTeamMemberAdded(admin.id, teamIdInt, body.userId, body.role || UserRole.Member);

    return NextResponse.json(newMember, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error managing team member" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ message: "memberId is required" }, { status: 400 });
  }

  try {
    const existingMember = await prisma.userTeam.findUnique({
      where: { id: parseInt(memberId) },
      select: { userId: true },
    });

    if (!existingMember) {
      return NextResponse.json({ message: "Team member not found" }, { status: 404 });
    }

    await prisma.userTeam.delete({ where: { id: parseInt(memberId) } });
    await logTeamMemberRemoved(admin.id, parseInt(teamId), existingMember.userId);

    return NextResponse.json({ message: "Team member removed successfully" });
  } catch {
    return NextResponse.json({ message: "Error removing team member" }, { status: 500 });
  }
}

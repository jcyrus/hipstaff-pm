import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logTeamCreated, logTeamUpdated, logTeamDeleted } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function GET() {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  void admin;

  try {
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        userTeams: {
          select: {
            userId: true,
            user: { select: { username: true, email: true } },
          },
        },
      },
    });

    // Transform to match admin page snake_case expectations
    const transformed = teams.map((t) => ({
      id: t.id,
      team_name: t.teamName,
      product_owner_user_id: t.productOwnerUserId,
      project_manager_user_id: t.projectManagerUserId,
      created_at: t.createdAt,
      user_teams: t.userTeams.map((ut) => ({
        user_id: ut.userId,
        users: { username: ut.user.username, email: ut.user.email },
      })),
    }));

    return NextResponse.json(transformed);
  } catch {
    return NextResponse.json({ message: "Error fetching teams" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const newTeam = await prisma.team.create({
      data: {
        teamName: body.name,
        productOwnerUserId: body.productOwnerId || null,
        projectManagerUserId: body.projectManagerUserId || null,
        createdBy: admin.id,
      },
    });

    await logTeamCreated(admin.id, newTeam.id, {
      name: body.name,
      productOwner: body.productOwnerId,
      projectManager: body.projectManagerUserId,
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Error creating team" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { teamId, ...updates } = body;

  try {
    const data = await prisma.team.update({
      where: { id: teamId },
      data: {
        teamName: updates.name,
        productOwnerUserId: updates.productOwnerId,
        projectManagerUserId: updates.projectManagerUserId,
      },
    });

    await logTeamUpdated(admin.id, teamId, updates);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Error updating team" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json({ message: "teamId is required" }, { status: 400 });
  }

  const teamIdInt = parseInt(teamId);

  try {
    const team = await prisma.team.findUnique({ where: { id: teamIdInt } });
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    await prisma.team.delete({ where: { id: teamIdInt } });
    await logTeamDeleted(admin.id, teamIdInt);

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch {
    return NextResponse.json({ message: "Error deleting team" }, { status: 500 });
  }
}

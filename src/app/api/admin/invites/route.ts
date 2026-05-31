import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logInviteCreated, logInviteRevoked } from "@/lib/audit";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/rbac/types";
import { addDays } from "date-fns";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const invites = await prisma.invite.findMany({
      orderBy: { createdAt: "desc" },
      include: { team: { select: { teamName: true } } },
    });

    // Transform to match admin page snake_case expectations
    const transformed = invites.map((i) => ({
      id: i.id,
      token: i.token,
      email: i.email,
      team_id: i.teamId,
      role: i.role,
      expires_at: i.expiresAt,
      accepted_at: i.acceptedAt,
      revoked_at: i.revokedAt,
      created_by: i.createdBy,
      teams: i.team ? { team_name: i.team.teamName } : null,
    }));

    return NextResponse.json(transformed);
  } catch {
    return NextResponse.json({ message: "Error fetching invites" }, { status: 500 });
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
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expiresAt = addDays(new Date(), 7);

    await prisma.invite.create({
      data: {
        token,
        email: body.email,
        teamId: body.teamId || null,
        role: body.role || UserRole.Member,
        createdBy: admin.id,
        expiresAt,
      },
    });

    await logInviteCreated(admin.id, body.email, body.teamId, body.role || UserRole.Member);

    return NextResponse.json(
      {
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite?token=${token}`,
        expiresAt,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Error creating invite" }, { status: 500 });
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
  const inviteId = searchParams.get("inviteId");

  if (!inviteId) {
    return NextResponse.json({ message: "inviteId is required" }, { status: 400 });
  }

  const inviteIdInt = parseInt(inviteId);

  try {
    const invite = await prisma.invite.findUnique({ where: { id: inviteIdInt } });
    if (!invite) {
      return NextResponse.json({ message: "Invite not found" }, { status: 404 });
    }

    await prisma.invite.update({
      where: { id: inviteIdInt },
      data: { revokedAt: new Date() },
    });

    await logInviteRevoked(admin.id, inviteIdInt);

    return NextResponse.json({ message: "Invite revoked successfully" });
  } catch {
    return NextResponse.json({ message: "Error revoking invite" }, { status: 500 });
  }
}

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logInviteAccepted } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ message: "Please sign in to accept the invitation" }, { status: 401 });
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  try {
    const invite = await prisma.invite.findUnique({ where: { token } });

    if (!invite) {
      return NextResponse.json({ message: "Invalid or expired invitation" }, { status: 404 });
    }

    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ message: "This invitation was sent to a different email address" }, { status: 403 });
    }

    if (invite.revokedAt) {
      return NextResponse.json({ message: "This invitation has been revoked" }, { status: 400 });
    }

    if (invite.acceptedAt) {
      return NextResponse.json({ message: "This invitation has already been accepted" }, { status: 400 });
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ message: "This invitation has expired" }, { status: 400 });
    }

    if (invite.teamId) {
      await prisma.userTeam.upsert({
        where: { userId_teamId: { userId: user.id, teamId: invite.teamId } },
        create: { userId: user.id, teamId: invite.teamId, role: invite.role },
        update: { role: invite.role },
      });
    }

    await prisma.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    await logInviteAccepted(user.id, invite.id);

    return NextResponse.json({ message: "Invitation accepted successfully" });
  } catch {
    return NextResponse.json({ message: "Failed to accept invitation" }, { status: 500 });
  }
}

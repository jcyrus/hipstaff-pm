import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { logUserCreated, logUserUpdated, logUserDeleted, logUserRoleChanged, logUserActivated, logUserDeactivated } from "@/lib/audit";
import { NextResponse } from "next/server";
import { UserRole } from "@/lib/rbac/types";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profilePictureUrl: true,
        userTeams: {
          select: {
            teamId: true,
            role: true,
            team: { select: { teamName: true } },
          },
        },
      },
    });

    // Transform to match admin page snake_case expectations
    const transformed = users.map((u) => ({
      user_id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      is_active: u.isActive,
      created_at: u.createdAt,
      profile_picture_url: u.profilePictureUrl,
      user_teams: u.userTeams.map((ut) => ({
        team_id: ut.teamId,
        role: ut.role,
        teams: { team_name: ut.team.teamName },
      })),
    }));

    return NextResponse.json(transformed);
  } catch {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let superAdmin;
  try {
    superAdmin = await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { email, username, password } = body;
  if (!email || !username || !password) {
    return NextResponse.json({ message: "email, username, and password are required" }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: body.role || UserRole.Member,
        isActive: body.isActive !== false,
      },
    });

    await logUserCreated(superAdmin.id, newUser.id, {
      username: body.username,
      email: body.email,
      role: body.role,
    });

    return NextResponse.json(
      { user_id: newUser.id, username: newUser.username, email: newUser.email },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Error creating user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let superAdmin;
  try {
    superAdmin = await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId, ...updates } = body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const prismaUpdates: Record<string, unknown> = {};
    if (updates.role !== undefined) prismaUpdates.role = updates.role;
    if (updates.is_active !== undefined) prismaUpdates.isActive = updates.is_active;
    if (updates.username !== undefined) prismaUpdates.username = updates.username;
    if (updates.email !== undefined) prismaUpdates.email = updates.email;

    const data = await prisma.user.update({
      where: { id: userId },
      data: prismaUpdates,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profilePictureUrl: true,
      },
    });

    if (updates.role && updates.role !== existingUser.role) {
      await logUserRoleChanged(superAdmin.id, userId, existingUser.role, updates.role);
    }

    const isActiveUpdate = updates.is_active;
    if (isActiveUpdate !== undefined && isActiveUpdate !== existingUser.isActive) {
      if (isActiveUpdate) {
        await logUserActivated(superAdmin.id, userId);
      } else {
        await logUserDeactivated(superAdmin.id, userId);
      }
    }

    await logUserUpdated(superAdmin.id, userId, updates);

    return NextResponse.json({ user_id: data.id, ...data });
  } catch {
    return NextResponse.json({ message: "Error updating user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let superAdmin;
  try {
    superAdmin = await requireSuperAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "userId is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Cascade deletes sessions via Prisma relations (onDelete: Cascade)
    await prisma.user.delete({ where: { id: userId } });

    await logUserDeleted(superAdmin.id, userId);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch {
    return NextResponse.json({ message: "Error deleting user" }, { status: 500 });
  }
}

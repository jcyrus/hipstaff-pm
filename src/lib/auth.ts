import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/rbac/types";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  currentTeamId?: number;
  teams: Array<{
    teamId: number;
    teamName: string;
    role: UserRole;
  }>;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userData = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      currentTeamId: true,
      userTeams: {
        select: {
          teamId: true,
          role: true,
          team: { select: { teamName: true } },
        },
      },
    },
  });

  if (!userData || !userData.isActive) return null;

  return {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    role: userData.role as UserRole,
    isActive: userData.isActive,
    currentTeamId: userData.currentTeamId ?? undefined,
    teams: userData.userTeams.map((ut) => ({
      teamId: ut.teamId,
      teamName: ut.team.teamName,
      role: ut.role as UserRole,
    })),
  };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return (user?.role as UserRole) ?? null;
}

export async function switchTeam(
  userId: string,
  teamId: number
): Promise<void> {
  const membership = await prisma.userTeam.findUnique({
    where: { userId_teamId: { userId, teamId } },
    select: { userId: true },
  });
  if (!membership) {
    throw new Error("Forbidden: user is not a member of the requested team");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { currentTeamId: teamId },
  });
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized: No valid user session");
  return user;
}

export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== requiredRole)
    throw new Error(`Forbidden: Requires ${requiredRole} role`);
  return user;
}

export async function requireAnyRole(roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role))
    throw new Error(`Forbidden: Requires one of ${roles.join(", ")} roles`);
  return user;
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  return requireRole(UserRole.SuperAdmin);
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireAnyRole([UserRole.SuperAdmin, UserRole.Admin]);
}

export async function requireManagerOrAbove(): Promise<AuthUser> {
  return requireAnyRole([UserRole.SuperAdmin, UserRole.Admin, UserRole.Manager]);
}

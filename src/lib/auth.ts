import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/rbac/types";

export interface AuthUser {
  id: number;
  supabaseUserId: string;
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
  const supabase = await createClient();
  
  const { data: { user: supabaseUser }, error: authError } =
    await supabase.auth.getUser();

  if (authError || !supabaseUser) {
    return null;
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select(`
      user_id,
      supabase_user_id,
      email,
      username,
      role,
      is_active,
      current_team_id,
      user_teams (
        team_id,
        teams (team_name),
        role
      )
    `)
    .eq("supabase_user_id", supabaseUser.id)
    .single();

  if (userError || !userData) {
    return null;
  }

  if (!userData.is_active) {
    return null;
  }

  return {
    id: userData.user_id,
    supabaseUserId: userData.supabase_user_id,
    email: userData.email,
    username: userData.username,
    role: userData.role as UserRole,
    isActive: userData.is_active,
    currentTeamId: userData.current_team_id || undefined,
    teams:
      userData.user_teams?.map((ut) => {
        // Supabase returns nested relation as object, but types it as array
        const team = ut.teams as unknown as { team_name: string } | null;
        return {
          teamId: ut.team_id,
          teamName: team?.team_name || "",
          role: ut.role as UserRole,
        };
      }) || [],
  };
}

export async function getUserRole(userId: number): Promise<UserRole | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", userId)
    .single();

  return data?.role as UserRole || null;
}

export async function switchTeam(
  userId: number,
  teamId: number
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("users")
    .update({ current_team_id: teamId })
    .eq("user_id", userId);
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized: No valid user session");
  }

  return user;
}

export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (user.role !== requiredRole) {
    throw new Error(`Forbidden: Requires ${requiredRole} role`);
  }

  return user;
}

export async function requireAnyRole(
  roles: UserRole[]
): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: Requires one of ${roles.join(", ")} roles`);
  }

  return user;
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  return await requireRole(UserRole.SuperAdmin);
}

export async function requireAdmin(): Promise<AuthUser> {
  return await requireAnyRole([UserRole.SuperAdmin, UserRole.Admin]);
}

export async function requireManagerOrAbove(): Promise<AuthUser> {
  return await requireAnyRole([
    UserRole.SuperAdmin,
    UserRole.Admin,
    UserRole.Manager,
  ]);
}

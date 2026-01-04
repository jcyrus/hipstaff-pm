export enum UserRole {
  SuperAdmin = "superadmin",
  Admin = "admin",
  Manager = "manager",
  Member = "member",
}

export enum Permission {
  // Users
  CreateUsers = "create:users",
  ReadUsers = "read:users",
  UpdateUsers = "update:users",
  DeleteUsers = "delete:users",
  ChangeRoles = "change:roles",
  ActivateUsers = "activate:users",
  DeactivateUsers = "deactivate:users",

  // Teams
  CreateTeams = "create:teams",
  ReadTeams = "read:teams",
  UpdateTeams = "update:teams",
  DeleteTeams = "delete:teams",
  ManageTeamMembers = "manage:team_members",
  InviteUsers = "invite:users",

  // Projects
  ReadAllProjects = "read:all_projects",
  CreateProjects = "create:projects",
  UpdateProjects = "update:projects",
  DeleteProjects = "delete:projects",

  // Tasks
  CreateTasks = "create:tasks",
  UpdateTasks = "update:tasks",
  DeleteTasks = "delete:tasks",
  AssignTasks = "assign:tasks",
}

export enum AuditAction {
  UserCreated = "user_created",
  UserUpdated = "user_updated",
  UserDeleted = "user_deleted",
  UserRoleChanged = "user_role_changed",
  UserActivated = "user_activated",
  UserDeactivated = "user_deactivated",
  TeamCreated = "team_created",
  TeamUpdated = "team_updated",
  TeamDeleted = "team_deleted",
  TeamMemberAdded = "team_member_added",
  TeamMemberRemoved = "team_member_removed",
  InviteCreated = "invite_created",
  InviteAccepted = "invite_accepted",
  InviteRevoked = "invite_revoked",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SuperAdmin]: [
    Permission.CreateUsers,
    Permission.ReadUsers,
    Permission.UpdateUsers,
    Permission.DeleteUsers,
    Permission.ChangeRoles,
    Permission.ActivateUsers,
    Permission.DeactivateUsers,
    Permission.CreateTeams,
    Permission.ReadTeams,
    Permission.UpdateTeams,
    Permission.DeleteTeams,
    Permission.ManageTeamMembers,
    Permission.InviteUsers,
    Permission.ReadAllProjects,
    Permission.CreateProjects,
    Permission.UpdateProjects,
    Permission.DeleteProjects,
    Permission.CreateTasks,
    Permission.UpdateTasks,
    Permission.DeleteTasks,
    Permission.AssignTasks,
  ],
  [UserRole.Admin]: [
    Permission.ReadUsers,
    Permission.CreateTeams,
    Permission.ReadTeams,
    Permission.UpdateTeams,
    Permission.ManageTeamMembers,
    Permission.InviteUsers,
    Permission.ReadAllProjects,
    Permission.CreateProjects,
    Permission.UpdateProjects,
    Permission.CreateTasks,
    Permission.UpdateTasks,
    Permission.AssignTasks,
  ],
  [UserRole.Manager]: [
    Permission.CreateTasks,
    Permission.UpdateTasks,
    Permission.AssignTasks,
  ],
  [UserRole.Member]: [],
};

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return permissions.some((p) => rolePermissions.includes(p));
}

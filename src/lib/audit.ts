import { createClient } from "@/lib/supabase/server";
import { AuditAction } from "@/lib/rbac/types";

export async function logAudit(params: {
  action: AuditAction;
  actorId: number;
  targetType: string;
  targetId?: number;
  details?: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();

  await supabase.from("audit_log").insert({
    action: params.action,
    actor_id: params.actorId,
    target_type: params.targetType,
    target_id: params.targetId || null,
    details: params.details || null,
  });
}

export async function logUserCreated(actorId: number, userId: number, details?: Record<string, unknown>) {
  await logAudit({
    action: AuditAction.UserCreated,
    actorId,
    targetType: "user",
    targetId: userId,
    details,
  });
}

export async function logUserUpdated(actorId: number, userId: number, details?: Record<string, unknown>) {
  await logAudit({
    action: AuditAction.UserUpdated,
    actorId,
    targetType: "user",
    targetId: userId,
    details,
  });
}

export async function logUserRoleChanged(
  actorId: number,
  userId: number,
  oldRole: string,
  newRole: string
) {
  await logAudit({
    action: AuditAction.UserRoleChanged,
    actorId,
    targetType: "user",
    targetId: userId,
    details: { oldRole, newRole },
  });
}

export async function logUserActivated(actorId: number, userId: number) {
  await logAudit({
    action: AuditAction.UserActivated,
    actorId,
    targetType: "user",
    targetId: userId,
  });
}

export async function logUserDeactivated(actorId: number, userId: number) {
  await logAudit({
    action: AuditAction.UserDeactivated,
    actorId,
    targetType: "user",
    targetId: userId,
  });
}

export async function logTeamCreated(actorId: number, teamId: number, details?: Record<string, unknown>) {
  await logAudit({
    action: AuditAction.TeamCreated,
    actorId,
    targetType: "team",
    targetId: teamId,
    details,
  });
}

export async function logTeamUpdated(actorId: number, teamId: number, details?: Record<string, unknown>) {
  await logAudit({
    action: AuditAction.TeamUpdated,
    actorId,
    targetType: "team",
    targetId: teamId,
    details,
  });
}

export async function logTeamDeleted(actorId: number, teamId: number) {
  await logAudit({
    action: AuditAction.TeamDeleted,
    actorId,
    targetType: "team",
    targetId: teamId,
  });
}

export async function logTeamMemberAdded(actorId: number, teamId: number, userId: number, role: string) {
  await logAudit({
    action: AuditAction.TeamMemberAdded,
    actorId,
    targetType: "user_team",
    targetId: userId,
    details: { teamId, role },
  });
}

export async function logTeamMemberRemoved(actorId: number, teamId: number, userId: number) {
  await logAudit({
    action: AuditAction.TeamMemberRemoved,
    actorId,
    targetType: "user_team",
    targetId: userId,
    details: { teamId },
  });
}

export async function logInviteCreated(actorId: number, email: string, teamId: number, role: string) {
  await logAudit({
    action: AuditAction.InviteCreated,
    actorId,
    targetType: "invite",
    details: { email, teamId, role },
  });
}

export async function logInviteAccepted(actorId: number, inviteId: number) {
  await logAudit({
    action: AuditAction.InviteAccepted,
    actorId,
    targetType: "invite",
    targetId: inviteId,
  });
}

export async function logInviteRevoked(actorId: number, inviteId: number) {
  await logAudit({
    action: AuditAction.InviteRevoked,
    actorId,
    targetType: "invite",
    targetId: inviteId,
  });
}

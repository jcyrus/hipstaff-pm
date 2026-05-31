import { prisma } from "@/lib/db";
import { AuditAction as PrismaAuditAction, Prisma } from "@/generated/prisma/client";
import { AuditAction } from "@/lib/rbac/types";

export async function logAudit(params: {
  action: AuditAction;
  actorId: string;
  targetType: string;
  targetId?: number;
  details?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: params.action as unknown as PrismaAuditAction,
      actorId: params.actorId,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      // Cast is safe: details values are always JSON-serializable at call sites
      details: (params.details ?? undefined) as Prisma.InputJsonObject | undefined,
    },
  });
}

export async function logUserCreated(actorId: string, userId: string, details?: Record<string, unknown>) {
  await logAudit({ action: AuditAction.UserCreated, actorId, targetType: "user", details: { userId, ...details } });
}

export async function logUserUpdated(actorId: string, userId: string, details?: Record<string, unknown>) {
  await logAudit({ action: AuditAction.UserUpdated, actorId, targetType: "user", details: { userId, ...details } });
}

export async function logUserRoleChanged(actorId: string, userId: string, oldRole: string, newRole: string) {
  await logAudit({ action: AuditAction.UserRoleChanged, actorId, targetType: "user", details: { userId, oldRole, newRole } });
}

export async function logUserActivated(actorId: string, userId: string) {
  await logAudit({ action: AuditAction.UserActivated, actorId, targetType: "user", details: { userId } });
}

export async function logUserDeactivated(actorId: string, userId: string) {
  await logAudit({ action: AuditAction.UserDeactivated, actorId, targetType: "user", details: { userId } });
}

export async function logTeamCreated(actorId: string, teamId: number, details?: Record<string, unknown>) {
  await logAudit({ action: AuditAction.TeamCreated, actorId, targetType: "team", targetId: teamId, details });
}

export async function logTeamUpdated(actorId: string, teamId: number, details?: Record<string, unknown>) {
  await logAudit({ action: AuditAction.TeamUpdated, actorId, targetType: "team", targetId: teamId, details });
}

export async function logTeamDeleted(actorId: string, teamId: number) {
  await logAudit({ action: AuditAction.TeamDeleted, actorId, targetType: "team", targetId: teamId });
}

export async function logTeamMemberAdded(actorId: string, teamId: number, userId: string, role: string) {
  await logAudit({ action: AuditAction.TeamMemberAdded, actorId, targetType: "user_team", targetId: teamId, details: { userId, role } });
}

export async function logTeamMemberRemoved(actorId: string, teamId: number, userId: string) {
  await logAudit({ action: AuditAction.TeamMemberRemoved, actorId, targetType: "user_team", targetId: teamId, details: { userId } });
}

export async function logInviteCreated(actorId: string, email: string, teamId: number, role: string) {
  await logAudit({ action: AuditAction.InviteCreated, actorId, targetType: "invite", details: { email, teamId, role } });
}

export async function logInviteAccepted(actorId: string, inviteId: number) {
  await logAudit({ action: AuditAction.InviteAccepted, actorId, targetType: "invite", targetId: inviteId });
}

export async function logInviteRevoked(actorId: string, inviteId: number) {
  await logAudit({ action: AuditAction.InviteRevoked, actorId, targetType: "invite", targetId: inviteId });
}

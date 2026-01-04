"use client";

import React, { useEffect, useState } from "react";
import { Send, Copy, XCircle, Check, Clock } from "lucide-react";
import { format } from "date-fns";

interface Invite {
  id: number;
  token: string;
  email: string;
  team_id: number;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  teams?: { team_name: string };
}

interface Team {
  id: number;
  team_name: string;
}

const roleColors: Record<string, string> = {
  superadmin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  admin: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  member: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: "", teamId: "", role: "member" });
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [invitesRes, teamsRes] = await Promise.all([
        fetch("/api/admin/invites"),
        fetch("/api/admin/teams"),
      ]);
      if (!invitesRes.ok || !teamsRes.ok) throw new Error("Failed to fetch data");
      const invitesData = await invitesRes.json();
      const teamsData = await teamsRes.json();
      setInvites(invitesData);
      setTeams(teamsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createInvite() {
    if (!newInvite.email || !newInvite.teamId) return;

    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newInvite.email,
          teamId: parseInt(newInvite.teamId),
          role: newInvite.role,
        }),
      });
      if (!res.ok) throw new Error("Failed to create invite");
      const data = await res.json();
      await navigator.clipboard.writeText(data.inviteUrl);
      setCopiedToken("new");
      setTimeout(() => setCopiedToken(null), 2000);
      setNewInvite({ email: "", teamId: "", role: "member" });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  async function revokeInvite(inviteId: number) {
    if (!confirm("Are you sure you want to revoke this invite?")) return;

    try {
      const res = await fetch(`/api/admin/invites?inviteId=${inviteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke invite");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  function getInviteStatus(invite: Invite) {
    if (invite.accepted_at) {
      return { label: "Accepted", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: Check };
    }
    if (invite.revoked_at) {
      return { label: "Revoked", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: XCircle };
    }
    if (new Date(invite.expires_at) < new Date()) {
      return { label: "Expired", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200", icon: Clock };
    }
    return { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock };
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Invitations
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Send className="h-4 w-4" />
          Send Invite
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-dark-secondary">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Send Invitation
            </h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={newInvite.email}
                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-dark-tertiary dark:text-white"
              />
              <select
                value={newInvite.teamId}
                onChange={(e) => setNewInvite({ ...newInvite, teamId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-dark-tertiary dark:text-white"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
              <select
                value={newInvite.role}
                onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-dark-tertiary dark:text-white"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={createInvite}
                className="flex-1 rounded-lg bg-blue-primary px-4 py-2 text-white hover:bg-blue-600"
              >
                Send & Copy Link
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-dark-secondary">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-tertiary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Expires
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {invites.map((invite) => {
              const status = getInviteStatus(invite);
              const StatusIcon = status.icon;
              const isPending = !invite.accepted_at && !invite.revoked_at && new Date(invite.expires_at) > new Date();
              return (
                <tr key={invite.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {invite.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {invite.teams?.team_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColors[invite.role] || roleColors.member}`}>
                      {invite.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(invite.expires_at), "MMM d, yyyy")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/invite?token=${invite.token}`
                            );
                            setCopiedToken(invite.token);
                            setTimeout(() => setCopiedToken(null), 2000);
                          }}
                          className="text-gray-400 hover:text-blue-500"
                          title="Copy invite link"
                        >
                          {copiedToken === invite.token ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => revokeInvite(invite.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Revoke invite"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

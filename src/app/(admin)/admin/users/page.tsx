"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, MoreVertical, Check, X } from "lucide-react";

interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  user_teams?: Array<{
    team_id: number;
    teams: { team_name: string };
    role: string;
  }>;
}

const roleColors: Record<string, string> = {
  superadmin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  admin: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  member: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserStatus(userId: number, currentStatus: boolean) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_active: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function updateUserRole(userId: number, newRole: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
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
          Users
        </h2>
        <button className="flex items-center gap-2 rounded-lg bg-blue-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-dark-secondary">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-tertiary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Teams
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.user_id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.user_id, e.target.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColors[user.role] || roleColors.member}`}
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.user_teams?.map((ut) => (
                      <span
                        key={ut.team_id}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {ut.teams?.team_name}
                      </span>
                    )) || (
                      <span className="text-sm text-gray-400">No teams</span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      user.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {user.is_active ? (
                      <>
                        <Check className="h-3 w-3" /> Active
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" /> Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

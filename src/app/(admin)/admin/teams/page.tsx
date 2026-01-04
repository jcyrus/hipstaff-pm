"use client";

import React, { useEffect, useState } from "react";
import { Plus, Users, Trash2 } from "lucide-react";

interface Team {
  id: number;
  team_name: string;
  product_owner_user_id: number | null;
  project_manager_user_id: number | null;
  created_at: string;
  user_teams?: Array<{
    user_id: number;
    users: { username: string; email: string };
  }>;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    try {
      const res = await fetch("/api/admin/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function createTeam() {
    if (!newTeamName.trim()) return;

    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });
      if (!res.ok) throw new Error("Failed to create team");
      setNewTeamName("");
      setShowNewTeamModal(false);
      fetchTeams();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteTeam(teamId: number) {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      const res = await fetch(`/api/admin/teams?teamId=${teamId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete team");
      fetchTeams();
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
          Teams
        </h2>
        <button
          onClick={() => setShowNewTeamModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          New Team
        </button>
      </div>

      {showNewTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-dark-secondary">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Create New Team
            </h3>
            <input
              type="text"
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-dark-tertiary dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={createTeam}
                className="flex-1 rounded-lg bg-blue-primary px-4 py-2 text-white hover:bg-blue-600"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewTeamModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-lg bg-white p-6 shadow dark:bg-dark-secondary"
          >
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {team.team_name}
              </h3>
              <button
                onClick={() => deleteTeam(team.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4" />
              {team.user_teams?.length || 0} members
            </div>
            {team.user_teams && team.user_teams.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {team.user_teams.slice(0, 3).map((ut) => (
                  <span
                    key={ut.user_id}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {ut.users?.username}
                  </span>
                ))}
                {team.user_teams.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{team.user_teams.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

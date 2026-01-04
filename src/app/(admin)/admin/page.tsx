"use client";

import React, { useEffect, useState } from "react";
import { Users, Building2, Mail, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalTeams: number;
  pendingInvites: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, teamsRes, invitesRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/teams"),
          fetch("/api/admin/invites"),
        ]);

        const users = usersRes.ok ? await usersRes.json() : [];
        const teams = teamsRes.ok ? await teamsRes.json() : [];
        const invites = invitesRes.ok ? await invitesRes.json() : [];

        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          activeUsers: Array.isArray(users)
            ? users.filter((u: { is_active: boolean }) => u.is_active).length
            : 0,
          totalTeams: Array.isArray(teams) ? teams.length : 0,
          pendingInvites: Array.isArray(invites)
            ? invites.filter(
                (i: { accepted_at: string | null; revoked_at: string | null }) =>
                  !i.accepted_at && !i.revoked_at
              ).length
            : 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Users",
      value: stats?.activeUsers ?? 0,
      icon: Activity,
      color: "bg-green-500",
    },
    {
      label: "Teams",
      value: stats?.totalTeams ?? 0,
      icon: Building2,
      color: "bg-purple-500",
    },
    {
      label: "Pending Invites",
      value: stats?.pendingInvites ?? 0,
      icon: Mail,
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Overview
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-lg bg-white p-6 shadow dark:bg-dark-secondary"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-lg ${card.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

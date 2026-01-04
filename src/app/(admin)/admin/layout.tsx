"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, Mail, LayoutDashboard, Shield } from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/teams", label: "Teams", icon: Building2 },
  { href: "/admin/invites", label: "Invites", icon: Mail },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-dark-secondary">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
      </div>

      <div className="flex flex-1">
        <nav className="w-56 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-dark-bg">
          <ul className="space-y-2">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-primary text-white"
                        : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="flex-1 bg-gray-100 p-6 dark:bg-dark-bg">
          {children}
        </main>
      </div>
    </div>
  );
}

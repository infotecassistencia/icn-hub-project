import {
  Shield,
  UserCheck,
  Users,
  UserRoundCog,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { UserRow } from "../types";

interface UserStatsProps {
  users: UserRow[];
}

export function UserStats({ users }: UserStatsProps) {
  const totalUsers = users.length;

  const totalAdmins = users.filter((user) =>
    user.roles.includes("admin"),
  ).length;

  const totalOrganizadores = users.filter((user) =>
    user.roles.includes("organizador"),
  ).length;

  const totalParticipantes = users.filter((user) =>
    user.roles.includes("participante"),
  ).length;

  const stats = [
    {
      label: "Usuários",
      value: totalUsers,
      icon: Users,
    },
    {
      label: "Administradores",
      value: totalAdmins,
      icon: Shield,
    },
    {
      label: "Organizadores",
      value: totalOrganizadores,
      icon: UserRoundCog,
    },
    {
      label: "Participantes",
      value: totalParticipantes,
      icon: UserCheck,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {stat.value}
                </p>
              </div>

              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
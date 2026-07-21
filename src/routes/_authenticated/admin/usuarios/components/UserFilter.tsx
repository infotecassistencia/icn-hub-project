import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { UserRoleFilter } from "../types";

interface UserFilterProps {
  search: string;
  roleFilter: UserRoleFilter;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: UserRoleFilter) => void;
}

export function UserFilter({
  search,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
}: UserFilterProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          className="pl-9"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <Select
        value={roleFilter}
        onValueChange={(value) =>
          onRoleFilterChange(value as UserRoleFilter)
        }
      >
        <SelectTrigger className="w-full md:w-[190px]">
          <SelectValue placeholder="Filtrar por papel" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="todos">Todos os papéis</SelectItem>
          <SelectItem value="admin">Administradores</SelectItem>
          <SelectItem value="organizador">Organizadores</SelectItem>
          <SelectItem value="participante">Participantes</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
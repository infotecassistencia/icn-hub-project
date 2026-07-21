import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { UserRow } from "../types";

interface UserModalProps {
  user: UserRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserModal({
  user,
  open,
  onOpenChange,
}: UserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user?.nome || "Detalhes do usuário"}
          </DialogTitle>

          <DialogDescription>
            Visualize e edite as informações do usuário.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {user.email || "Não informado"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Tipo</p>
              <p className="text-sm text-muted-foreground">
                {user.tipo || "Não informado"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Data de cadastro</p>
              <p className="text-sm text-muted-foreground">
                {user.created_at
                  ? new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "long",
                      timeStyle: "short",
                    }).format(new Date(user.created_at))
                  : "Não informada"}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
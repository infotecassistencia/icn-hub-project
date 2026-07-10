import { Link } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  colorForTipo,
  iconForTipo,
  useNotifications,
  type AppNotification,
} from "@/lib/notifications";

export function NotificationBell() {
  const { items, unreadCount, isLoading, markRead, markAllRead, remove } = useNotifications();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground animate-scale-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl">Notificações</SheetTitle>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="h-8 gap-1 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </Button>
            )}
          </div>
          <SheetDescription className="text-xs">
            {unreadCount > 0
              ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}.`
              : "Você está em dia. Nada de novo por aqui."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Nenhuma notificação ainda</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Você verá aqui atualizações sobre suas atividades.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <NotificationItem
                  key={n.id}
                  n={n}
                  onRead={() => markRead.mutate(n.id)}
                  onDelete={() => remove.mutate(n.id)}
                />
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function NotificationItem({
  n,
  onRead,
  onDelete,
}: {
  n: AppNotification;
  onRead: () => void;
  onDelete: () => void;
}) {
  const Icon = iconForTipo(n.tipo);
  const color = colorForTipo(n.tipo);
  const time = formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR });

  const inner = (
    <div className="flex gap-3">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-tight", !n.lida && "font-semibold")}>{n.titulo}</p>
          {!n.lida && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.mensagem}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );

  return (
    <li
      className={cn(
        "group relative px-4 py-3 transition-colors hover:bg-muted/40",
        !n.lida && "bg-primary/5",
      )}
    >
      {n.url_destino ? (
        <Link to={n.url_destino} onClick={() => !n.lida && onRead()} className="block">
          {inner}
        </Link>
      ) : (
        <div onClick={() => !n.lida && onRead()} className="cursor-pointer">
          {inner}
        </div>
      )}
      <div className="mt-2 flex items-center gap-1 pl-12 opacity-0 transition-opacity group-hover:opacity-100">
        {!n.lida && (
          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={onRead}>
            <Check className="h-3 w-3" /> Marcar como lida
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" /> Excluir
        </Button>
      </div>
    </li>
  );
}

// Placeholder for future badge usage on other surfaces.
export function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <Badge variant="destructive">{count}</Badge>;
}

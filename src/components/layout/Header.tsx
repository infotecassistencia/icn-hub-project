import {
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  Menu,
  Shield,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const NAV = [
  {
    to: "/eventos",
    label: "Eventos",
  },
  {
    to: "/mentorias",
    label: "Mentorias",
  },
  {
    to: "/sobre",
    label: "Sobre",
  },
  {
    to: "/contato",
    label: "Contato",
  },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  const {
    isAuthenticated,
    user,
    isAdmin,
    isLoading,
    logout,
  } = useAuth();

  console.log("USER:", user);

const podePublicar =
  !isLoading &&
  Boolean(user) &&
  user?.tipo !== "estudante";

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();

    await navigate({
      to: "/",
    });
  };

  const displayName =
    user?.nome || "Minha conta";

  const initial = (
    user?.nome ||
    user?.email ||
    "?"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          aria-label="Página inicial do ICN Hub"
          className="flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <img
            src="/brand/icn-hub-logo.png"
            alt="ICN Hub"
            className="h-11 w-auto max-w-[180px] object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary/70 hover:text-foreground"
              activeProps={{
                className:
                  "bg-secondary text-primary",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
<ThemeToggle />
          {isAuthenticated && user ? (
            <>
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-11 gap-2 rounded-full px-2 pr-4 hover:bg-secondary"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                        {initial}
                      </AvatarFallback>
                    </Avatar>

                    <span className="max-w-[130px] truncate text-sm font-medium">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-60 rounded-xl border-border bg-popover p-2 shadow-elevated"
                >
                  <DropdownMenuLabel className="px-2 py-2">
                    Minha conta
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    asChild
                    className="rounded-lg"
                  >
                    <Link to="/dashboard">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {podePublicar && (
                  <DropdownMenuItem
                    asChild
                    className="rounded-lg"
                  >
                    <Link to="/meus-eventos">
                      Meus envios
                    </Link>
                  </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    asChild
                    className="rounded-lg"
                  >
                    <Link to="/perfil">
                      Perfil
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        asChild
                        className="rounded-lg"
                      >
                        <Link
                          to="/admin"
                          className="flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" />

                          Painel administrativo
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-lg"
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="rounded-full px-5"
              >
                <Link to="/auth">
                  Entrar
                </Link>
              </Button>

              <Button
                asChild
                className="rounded-full px-6 shadow-soft"
              >
                <Link
                  to="/auth"
                  search={{
                    tab: "cadastro",
                  }}
                >
                  Criar conta
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setOpen((estadoAtual) => !estadoAtual)
          }
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary md:hidden"
          aria-label={
            open
              ? "Fechar menu"
              : "Abrir menu"
          }
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
<div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
  <div>
    <p className="text-sm font-medium text-foreground">
      Aparência
    </p>

    <p className="text-xs text-muted-foreground">
      Escolha o tema do site
    </p>
  </div>

  <ThemeToggle />
</div>
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() =>
                  setOpen(false)
                }
                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{
                  className:
                    "bg-secondary text-primary",
                }}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-border/70 pt-4">
              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      Dashboard
                    </Link>
                  </Button>

                  {podePublicar && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full"
                  >
                    <Link
                      to="/meus-eventos"
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      Meus envios
                    </Link>
                  </Button>
                  )}

                  {isAdmin && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-full"
                    >
                      <Link
                        to="/admin"
                        onClick={() =>
                          setOpen(false)
                        }
                      >
                        Painel administrativo
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="h-11 rounded-full"
                    onClick={handleLogout}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full"
                  >
                    <Link
                      to="/auth"
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      Entrar
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="h-11 rounded-full"
                  >
                    <Link
                      to="/auth"
                      search={{
                        tab: "cadastro",
                      }}
                      onClick={() =>
                        setOpen(false)
                      }
                    >
                      Criar conta
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
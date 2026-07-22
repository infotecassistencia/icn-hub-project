import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

import { reportLovableError } from "../lib/lovable-error-reporting";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold">
          Página não encontrada
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          O conteúdo que você procura não existe ou foi movido.
        </p>

        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Algo deu errado
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Tente novamente ou volte para o início.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1",
        },
        {
          title:
            "ICN Hub — Cursos, congressos e mentorias em nutrição",
        },
        {
          name: "description",
          content:
            "O ICN Hub reúne cursos, congressos e mentorias da nutrição em todo o Brasil. Encontre o próximo passo da sua carreira.",
        },
        {
          name: "author",
          content:
            "Isadora Liberato — Inovação em nutrição",
        },
        {
          property: "og:title",
          content:
            "ICN Hub — Ponto de encontro entre teoria, prática e carreira",
        },
        {
          property: "og:description",
          content:
            "Cursos, congressos e mentorias da nutrição em um só lugar.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "icon",
          href: "/favicon.ico",
          type: "image/x-icon",
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

const themeScript = `
  (() => {
    try {
      const storageKey = "icn-hub-theme";
      const storedTheme = localStorage.getItem(storageKey);
      const theme = storedTheme || "system";

      const resolvedTheme =
        theme === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : theme;

      const root = document.documentElement;

      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
      root.style.colorScheme = resolvedTheme;
    } catch {
      document.documentElement.classList.add("light");
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />

        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } =
    Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultTheme="system"
        storageKey="icn-hub-theme"
      >
        <AuthProvider>
          <Outlet />

          <Toaster
            richColors
            position="top-right"
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
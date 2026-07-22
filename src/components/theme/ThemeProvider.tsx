import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeContext =
  createContext<ThemeContextValue | undefined>(
    undefined,
  );

const DEFAULT_STORAGE_KEY = "icn-hub-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system"
    ? getSystemTheme()
    : theme;
}

function applyTheme(
  theme: ResolvedTheme,
  animate = true,
) {
  const root = document.documentElement;

  if (animate) {
    root.classList.add(
      "theme-transition",
    );
  }

  root.classList.remove(
    "light",
    "dark",
  );

  root.classList.add(theme);
  root.style.colorScheme = theme;

  if (animate) {
    window.setTimeout(() => {
      root.classList.remove(
        "theme-transition",
      );
    }, 250);
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] =
    useState<Theme>(() => {
      if (typeof window === "undefined") {
        return defaultTheme;
      }

      const storedTheme =
        window.localStorage.getItem(
          storageKey,
        ) as Theme | null;

      if (
        storedTheme === "light" ||
        storedTheme === "dark" ||
        storedTheme === "system"
      ) {
        return storedTheme;
      }

      return defaultTheme;
    });

  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>(() =>
      resolveTheme(theme),
    );

  useEffect(() => {
    const nextResolvedTheme =
      resolveTheme(theme);

    setResolvedTheme(nextResolvedTheme);
    applyTheme(nextResolvedTheme);

    window.localStorage.setItem(
      storageKey,
      theme,
    );
  }, [storageKey, theme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleSystemThemeChange = () => {
      const nextResolvedTheme =
        mediaQuery.matches
          ? "dark"
          : "light";

      setResolvedTheme(
        nextResolvedTheme,
      );

      applyTheme(nextResolvedTheme);
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme deve ser utilizado dentro de ThemeProvider.",
    );
  }

  return context;
}
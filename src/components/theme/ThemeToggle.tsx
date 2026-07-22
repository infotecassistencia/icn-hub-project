import {
  Check,
  Laptop,
  Moon,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type Theme,
  useTheme,
} from "@/components/theme/ThemeProvider";

const THEME_OPTIONS: Array<{
  value: Theme;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    label: "Claro",
    description: "Usar sempre o tema claro",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Escuro",
    description: "Usar sempre o tema escuro",
    icon: Moon,
  },
  {
    value: "system",
    label: "Sistema",
    description: "Acompanhar o dispositivo",
    icon: Laptop,
  },
];

export function ThemeToggle() {
  const {
    theme,
    resolvedTheme,
    setTheme,
  } = useTheme();

  const CurrentIcon =
    resolvedTheme === "dark"
      ? Moon
      : Sun;

  const currentLabel =
    THEME_OPTIONS.find(
      (option) => option.value === theme,
    )?.label ?? "Tema";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-secondary"
          aria-label={`Alterar tema. Tema atual: ${currentLabel}`}
          title={`Tema atual: ${currentLabel}`}
        >
          <CurrentIcon
            className="h-[18px] w-[18px] transition-all duration-300"
            aria-hidden="true"
          />

          <span className="sr-only">
            Alterar tema
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border-border bg-popover p-2 shadow-elevated"
      >
        <DropdownMenuLabel className="px-3 py-2">
          Aparência
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected =
            theme === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() =>
                setTheme(option.value)
              }
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {option.label}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>

              {isSelected && (
                <Check
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
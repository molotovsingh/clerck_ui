import { Link, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Role } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Scale,
  ClipboardList,
  LogOut,
  Settings,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatLabel } from "@/lib/format-label";
import { useThemeStore, type Theme } from "@/stores/theme-store";
import { CommandPalette } from "@/components/common/command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { actor, role, logout } = useAuthStore();
  const location = useLocation();
  const fullscreen = useWorkspaceStore((s) => s.fullscreen);

  if (fullscreen) {
    return <main className="h-screen overflow-hidden">{children}</main>;
  }

  const isMattersActive =
    location.pathname === "/" ||
    (location.pathname.startsWith("/") &&
      !location.pathname.startsWith("/dev"));
  const isDevActive = location.pathname.startsWith("/dev");

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Scale className="h-5 w-5" />
            Firmcase-OS
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <nav className="flex items-center gap-1">
            <Link to="/">
              <Button
                variant={isMattersActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  isMattersActive && "bg-secondary font-medium"
                )}
              >
                <ClipboardList className="h-4 w-4" />
                Matters
              </Button>
            </Link>
            {role === Role.ADMIN && (
              <Link to="/dev">
                <Button
                  variant={isDevActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 text-muted-foreground",
                    isDevActive &&
                      "bg-secondary font-medium text-foreground"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Dev Console
                </Button>
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">{actor}</span>
          {role && <Badge variant="secondary">{formatLabel(role)}</Badge>}
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
      <CommandPalette />
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const cycle = () => {
    const order: Theme[] = ["system", "light", "dark"];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length] as Theme;
    setTheme(next);
  };

  const Icon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label =
    theme === "system" ? "System" : theme === "light" ? "Light" : "Dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={cycle}
          aria-label={`Theme: ${label}`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Theme: {label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

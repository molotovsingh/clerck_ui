import { Link, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import { Role } from "@/types/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Scale,
  Terminal,
  ClipboardList,
  Briefcase,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { formatLabel } from "@/lib/format-label";

const primarySurfaces = [
  { path: "/clerk", label: "Matters", icon: ClipboardList },
  { path: "/lawyer", label: "Lawyer Workspace", icon: Briefcase },
] as const;

const advancedSurfaces = [
  { path: "/dev", label: "Dev Console", icon: Terminal },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { actor, role, logout } = useAuthStore();
  const location = useLocation();

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
            {primarySurfaces.map((s) => {
              const active = location.pathname.startsWith(s.path);
              return (
                <Link key={s.path} to={s.path}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2",
                      active && "bg-secondary font-medium"
                    )}
                  >
                    <s.icon className="h-4 w-4" />
                    {s.label}
                  </Button>
                </Link>
              );
            })}
            {role === Role.ADMIN &&
              advancedSurfaces.map((s) => {
                const active = location.pathname.startsWith(s.path);
                return (
                  <Link key={s.path} to={s.path}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-2 text-muted-foreground",
                        active && "bg-secondary font-medium text-foreground"
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      {s.label}
                    </Button>
                  </Link>
                );
              })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{actor}</span>
          {role && <Badge variant="secondary">{formatLabel(role)}</Badge>}
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

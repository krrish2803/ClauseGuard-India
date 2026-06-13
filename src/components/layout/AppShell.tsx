"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale, FileText, BookOpen, Settings, Bug, ChevronRight, LogOut, Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useState } from "react";

const navItems = [
  { href: "/app", label: "Dashboard", icon: Scale },
  { href: "/app/contracts", label: "Contracts", icon: FileText },
  { href: "/app/playbooks", label: "Playbooks", icon: BookOpen },
  { href: "/app/debug/agents", label: "Agent Traces", icon: Bug },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen">
      <aside className={cn(
        "border-r border-border/50 bg-background flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}>
        <div className="flex items-center gap-2 p-4 border-b border-border/50">
          <Scale className="h-5 w-5 text-amber-600 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="font-semibold text-sm">ClauseGuard</span>
              <span className="text-[10px] text-amber-600 font-medium">India</span>
            </>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border/50">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">DU</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">Demo User</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && <span className="text-xs">Sign Out</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground mt-1"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {!collapsed && <span className="text-xs">{theme === "dark" ? "Light" : "Dark"} Mode</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground mt-1"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-muted/10">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

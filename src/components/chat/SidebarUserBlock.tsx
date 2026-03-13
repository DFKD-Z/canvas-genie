"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { Settings, LogIn, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { ModelConfigModal } from "@/components/settings/ModelConfigModal";

export function SidebarUserBlock() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelConfigOpen, setModelConfigOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push("/login");
  };

  const handleOpenSettings = () => {
    setOpen(false);
    setSettingsOpen(true);
  };

  return (
    <div className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-2">
      {user ? (
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
              "hover:bg-[hsl(var(--muted))]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            )}
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="用户菜单"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/20 text-sm font-medium text-[hsl(var(--primary))]"
              aria-hidden
            >
              {user.username.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-[hsl(var(--foreground))]" title={user.username}>
              {user.username}
            </span>
          </button>

          {open && (
            <div
              className="absolute bottom-full left-0 right-0 z-50 mb-1 flex flex-col gap-0.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-md"
              role="menu"
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start gap-1.5 px-2 text-xs"
                onClick={handleOpenSettings}
                aria-label="用户设置"
              >
                <Settings className="h-3.5 w-3.5 shrink-0" />
                用户设置
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start gap-1.5 px-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                onClick={handleLogout}
                aria-label="登出"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                登出
              </Button>
            </div>
          )}

          <SettingsModal
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            onOpenModelConfig={() => setModelConfigOpen(true)}
          />
          <ModelConfigModal open={modelConfigOpen} onOpenChange={setModelConfigOpen} />
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full justify-center gap-2" asChild>
          <Link href="/login">
            <LogIn className="h-4 w-4 shrink-0" />
            登录
          </Link>
        </Button>
      )}
    </div>
  );
}

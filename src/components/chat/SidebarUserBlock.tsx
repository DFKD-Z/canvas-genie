"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, LogIn, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SidebarUserBlock() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-2">
      {user ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/20 text-sm font-medium text-[hsl(var(--primary))]"
              aria-hidden
            >
              {user.username.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-[hsl(var(--foreground))]" title={user.username}>
              {user.username}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 flex-1 justify-start gap-1.5 px-2 text-xs")}
              asChild
            >
              <Link href="#" aria-label="用户设置">
                <Settings className="h-3.5 w-3.5 shrink-0" />
                用户设置
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              onClick={handleLogout}
              aria-label="登出"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              登出
            </Button>
          </div>
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

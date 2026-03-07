"use client";

import { cn } from "@/lib/utils";

interface MainLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export function MainLayout({ left, right, className }: MainLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden",
        "flex-col md:flex-row",
        className
      )}
    >
      <aside className="flex h-[45vh] w-full flex-col border-b border-[hsl(var(--border))] md:h-full md:w-[420px] md:min-w-[360px] md:border-b-0 md:border-r">
        {left}
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden bg-[hsl(var(--muted))]/30">
        {right}
      </main>
    </div>
  );
}

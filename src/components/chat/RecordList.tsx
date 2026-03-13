"use client";

import { useCallback } from "react";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatRecord } from "@/types";
import { SidebarUserBlock } from "./SidebarUserBlock";

function formatRecordTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

interface RecordListProps {
  records: ChatRecord[];
  currentId: string | null;
  onNewChat: () => void;
  onSelect: (record: ChatRecord) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  className?: string;
}

export function RecordList({
  records,
  currentId,
  onNewChat,
  onSelect,
  onDelete,
  className,
}: RecordListProps) {
  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(id, e);
    },
    [onDelete]
  );

  return (
    <div
      className={cn(
        "flex h-full w-[192px] shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20",
        className
      )}
    >
      <div className="shrink-0 border-b border-[hsl(var(--border))] p-2">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
        >
          <MessageSquarePlus className="h-4 w-4 shrink-0" />
          新聊天
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {records.length === 0 ? (
          <p className="px-2 py-4 text-xs text-[hsl(var(--muted-foreground))]">
            暂无记录，开始新聊天后会自动保存
          </p>
        ) : (
          <ul className="space-y-0.5">
            {records.map((rec) => (
              <li key={rec.id}>
                <button
                  type="button"
                  onClick={() => onSelect(rec)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    currentId === rec.id
                      ? "bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate" title={rec.title}>
                    {rec.title}
                  </span>
                  <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                    {formatRecordTime(rec.updatedAt)}
                  </span>
                  {onDelete && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleDelete(rec.id, e)}
                      onKeyDown={(e) => e.key === "Enter" && handleDelete(rec.id, e as unknown as React.MouseEvent)}
                      className="shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[hsl(var(--destructive))]/20 hover:text-[hsl(var(--destructive))]"
                      aria-label="删除该记录"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <SidebarUserBlock />
    </div>
  );
}

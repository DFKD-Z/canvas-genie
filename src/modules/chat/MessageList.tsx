"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage as ChatMessageType } from "./types";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";

interface MessageListProps {
  messages: ChatMessageType[];
  loading?: boolean;
  className?: string;
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-md bg-[hsl(var(--muted))] px-4 py-3 text-sm shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />
        <span className="text-[hsl(var(--muted-foreground))]">正在生成代码...</span>
      </div>
    </div>
  );
}

export function MessageList({ messages, loading = false, className }: MessageListProps) {
  if (messages.length === 0 && !loading) {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center",
          className
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
          <Sparkles className="h-7 w-7 text-[hsl(var(--primary))]" />
        </div>
        <div className="space-y-1 text-[hsl(var(--muted-foreground))]">
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            描述你想要的 Canvas 效果
          </p>
          <p className="text-xs">例如：画一个红色圆，点击后变蓝</p>
        </div>
      </div>
    );
  }
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="flex flex-col gap-4 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex mb-4",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                msg.role === "user"
                  ? "rounded-br-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "rounded-bl-md bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && <LoadingBubble />}
      </div>
    </ScrollArea>
  );
}

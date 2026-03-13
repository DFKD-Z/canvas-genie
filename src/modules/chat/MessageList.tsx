"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage as ChatMessageType } from "./types";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, ChevronDown, ChevronRight } from "lucide-react";

interface MessageListProps {
  messages: ChatMessageType[];
  loading?: boolean;
  className?: string;
  onConfirmRequirement?: (messageId: string) => void;
  onRejectRequirement?: (messageId: string) => void;
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-md bg-[hsl(var(--muted))] px-4 py-3 text-sm shadow-sm animate-pulse">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[hsl(var(--muted-foreground))]" />
        <span className="text-[hsl(var(--muted-foreground))]">
          正在生成预览
          <span className="inline-flex">
            <span className="animate-[typing_1.4s_ease-in-out_infinite]">.</span>
            <span className="animate-[typing_1.4s_ease-in-out_0.2s_infinite]">.</span>
            <span className="animate-[typing_1.4s_ease-in-out_0.4s_infinite]">.</span>
          </span>
        </span>
      </div>
    </div>
  );
}

function ReasoningBlock({ reasoning }: { reasoning: string }) {
  const [open, setOpen] = useState(true);
  const trimmed = reasoning.trim();
  if (!trimmed) return null;
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/70"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        思考过程
      </button>
      {open && (
        <div className="max-h-48 overflow-y-auto border-t border-[hsl(var(--border))] px-3 py-2">
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
            {trimmed}
          </p>
        </div>
      )}
    </div>
  );
}

export function MessageList({
  messages,
  loading = false,
  className,
  onConfirmRequirement,
  onRejectRequirement,
}: MessageListProps) {
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
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm space-y-2",
                msg.role === "user"
                  ? "rounded-br-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "rounded-bl-md bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
              )}
            >
              {msg.imageDataUrl && (
                <img
                  src={msg.imageDataUrl}
                  alt="参考图"
                  className="max-h-32 rounded-lg object-contain"
                />
              )}
              {msg.role === "assistant" && (msg.reasoning?.trim() ?? "") && (
                <ReasoningBlock reasoning={msg.reasoning ?? ""} />
              )}
              {msg.role === "user" && (msg.content?.trim() ?? "") && (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
              {msg.role === "assistant" &&
                msg.requirementAnalysis?.summary != null &&
                (msg.pendingConfirmation ?? false) && (
                  <>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.requirementAnalysis.summary}</p>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => onConfirmRequirement?.(msg.id)}
                        className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
                      >
                        是
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectRequirement?.(msg.id)}
                        className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                      >
                        否
                      </button>
                    </div>
                  </>
                )}
              {msg.role === "assistant" &&
                !msg.generatedCode &&
                (msg.content?.trim() ?? "") &&
                !(msg.requirementAnalysis != null && (msg.pendingConfirmation ?? false)) && (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              {msg.role === "assistant" && msg.generatedCode && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">已经完成</p>
              )}
              {msg.role === "assistant" && !(msg.content?.trim() ?? "") && !msg.generatedCode && loading && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] animate-pulse">正在生成预览…</p>
              )}
              {msg.role === "user" && msg.imageDataUrl && !msg.content?.trim() && (
                <p className="text-xs opacity-80">根据图片生成</p>
              )}
            </div>
          </div>
        ))}
        {loading && <LoadingBubble />}
      </div>
    </ScrollArea>
  );
}

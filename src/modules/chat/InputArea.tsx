"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function InputArea({ onSend, disabled, className }: InputAreaProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className={cn(
        "shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4",
        className
      )}
    >
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 shadow-sm focus-within:ring-2 focus-within:ring-[hsl(var(--ring))] focus-within:ring-offset-2">
        <Textarea
          placeholder="描述你想要的图形或动效，按 Enter 发送"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={4}
          className="min-h-[120px] resize-none border-0 bg-transparent px-2 py-2.5 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </div>
  );
}

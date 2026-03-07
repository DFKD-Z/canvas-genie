"use client";

import { useState, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";

const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface InputAreaProps {
  onSend: (content: string, imageDataUrl?: string) => void;
  disabled?: boolean;
  className?: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function InputArea({ onSend, disabled, className }: InputAreaProps) {
  const [value, setValue] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = value.trim() || imageDataUrl;

  const handleSubmit = useCallback(() => {
    if (!canSend || disabled) return;
    const trimmed = value.trim();
    onSend(trimmed, imageDataUrl ?? undefined);
    setValue("");
    setImageDataUrl(null);
    setImageError(null);
  }, [value, imageDataUrl, canSend, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
        setImageError("请选择 jpeg、png、webp 或 gif 图片");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setImageError("图片请小于 5MB");
        return;
      }
      setImageError(null);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setImageDataUrl(dataUrl);
      } catch {
        setImageError("图片读取失败");
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/)) {
        setImageError("请选择 jpeg、png、webp 或 gif 图片");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setImageError("图片请小于 5MB");
        return;
      }
      setImageError(null);
      readFileAsDataUrl(file).then(setImageDataUrl).catch(() => setImageError("图片读取失败"));
    },
    [disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const clearImage = useCallback(() => {
    setImageDataUrl(null);
    setImageError(null);
  }, []);

  return (
    <div
      className={cn(
        "shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4",
        className
      )}
    >
      <div
        className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 shadow-sm focus-within:ring-2 focus-within:ring-[hsl(var(--ring))] focus-within:ring-offset-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {imageDataUrl && (
          <div className="relative mb-2 inline-block">
            <img
              src={imageDataUrl}
              alt="上传的参考图"
              className="max-h-32 rounded-lg border border-[hsl(var(--border))] object-contain"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90"
              aria-label="清除图片"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {imageError && (
          <p className="mb-2 text-xs text-[hsl(var(--destructive))]">{imageError}</p>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_IMAGE}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" />
            上传图片
          </button>
        </div>
        <Textarea
          placeholder="描述你想要的图形或动效，可只发图片，按 Enter 发送"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={4}
          className="min-h-[120px] resize-none border-0 bg-transparent px-2 py-2.5 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSend || disabled}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

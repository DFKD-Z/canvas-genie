"use client";

import { useState, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";

const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 3;

interface InputAreaProps {
  onSend: (content: string, imageDataUrls?: string[]) => void;
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
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = value.trim() || imageDataUrls.length > 0;

  const handleSubmit = useCallback(() => {
    if (!canSend || disabled) return;
    const trimmed = value.trim();
    onSend(trimmed, imageDataUrls.length > 0 ? imageDataUrls : undefined);
    setValue("");
    setImageDataUrls([]);
    setImageError(null);
  }, [value, imageDataUrls, canSend, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const appendImage = useCallback(async (file: File) => {
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
      setImageDataUrls((prev) => {
        if (prev.length >= MAX_IMAGES) {
          setImageError(`最多上传 ${MAX_IMAGES} 张图片`);
          return prev;
        }
        return [...prev, dataUrl];
      });
    } catch {
      setImageError("图片读取失败");
    }
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      e.target.value = "";
      if (!files?.length) return;
      for (let i = 0; i < files.length; i++) {
        await appendImage(files[i]);
      }
    },
    [appendImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files ?? []).filter((f) =>
        f.type.match(/^image\/(jpeg|png|webp|gif)$/)
      );
      if (!files.length) return;
      files.slice(0, MAX_IMAGES - imageDataUrls.length).forEach((file) => appendImage(file));
      if (files.length > MAX_IMAGES - imageDataUrls.length) setImageError(`最多上传 ${MAX_IMAGES} 张图片`);
    },
    [disabled, imageDataUrls.length, appendImage]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;
      const file = e.clipboardData.files?.[0];
      if (!file || !file.type.match(/^image\/(jpeg|png|webp|gif)$/)) return;
      if (imageDataUrls.length >= MAX_IMAGES) {
        setImageError(`最多上传 ${MAX_IMAGES} 张图片`);
        return;
      }
      e.preventDefault();
      appendImage(file);
    },
    [disabled, imageDataUrls.length, appendImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const clearImage = useCallback((index: number) => {
    setImageDataUrls((prev) => prev.filter((_, i) => i !== index));
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
        onPaste={handlePaste}
      >
        {imageDataUrls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {imageDataUrls.map((url, index) => (
              <div key={index} className="relative inline-block shrink-0">
                <img
                  src={url}
                  alt={`参考图 ${index + 1}`}
                  className="h-16 w-16 rounded-md border border-[hsl(var(--border))] object-cover"
                />
                <button
                  type="button"
                  onClick={() => clearImage(index)}
                  className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:opacity-90"
                  aria-label="移除该图片"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            ))}
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
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || imageDataUrls.length >= MAX_IMAGES}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" />
            上传图片{imageDataUrls.length > 0 ? ` (${imageDataUrls.length}/${MAX_IMAGES})` : ""}
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

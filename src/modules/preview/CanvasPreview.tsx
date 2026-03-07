"use client";

import { useRef, useCallback } from "react";
import { Canvas2DRunner, type Canvas2DRunnerHandle } from "./runners/Canvas2DRunner";
import type { GeneratedCode } from "./types";
import { Button } from "@/components/ui/button";
import { Code2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const VIEW_CODE_STORAGE_KEY = "canvas-genie-view-code";

interface CanvasPreviewProps {
  generated: GeneratedCode | null;
  className?: string;
}

export function CanvasPreview({ generated, className }: CanvasPreviewProps) {
  const is2d = generated?.type === "2d";
  const runnerRef = useRef<Canvas2DRunnerHandle>(null);

  const handleOpenCode = useCallback(() => {
    if (!generated?.code) return;
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_CODE_STORAGE_KEY, generated.code);
      window.open("/code", "_blank", "noopener,noreferrer");
    }
  }, [generated?.code]);

  const handleDownloadImage = useCallback(async () => {
    if (!runnerRef.current || !is2d) return;
    try {
      const dataUrl = await runnerRef.current.getImageDataUrl();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `canvas-genie-${Date.now()}.png`;
      a.click();
    } catch {
      // ignore
    }
  }, [is2d]);

  const hasGenerated = Boolean(generated?.code);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0">
          {is2d && generated ? (
            <Canvas2DRunner
              key={generated.code}
              ref={runnerRef}
              code={generated.code}
              className="h-full w-full"
            />
          ) : generated ? (
            <div className="flex h-full items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
              3D 预览即将支持
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
              在左侧描述效果并生成代码
            </div>
          )}
        </div>
      </div>
      <footer className="flex shrink-0 items-center gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 px-4 py-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={!hasGenerated}
          onClick={handleOpenCode}
        >
          <Code2 className="h-4 w-4" />
          代码
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={!hasGenerated || !is2d}
          onClick={handleDownloadImage}
        >
          <Download className="h-4 w-4" />
          下载图片
        </Button>
      </footer>
    </div>
  );
}

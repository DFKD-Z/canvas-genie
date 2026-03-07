"use client";

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Canvas2DRunnerProps {
  code: string;
  className?: string;
}

export interface Canvas2DRunnerHandle {
  getImageDataUrl: () => Promise<string>;
}

const RUNNER_TARGET_ORIGIN = "*";
const RUNNER_SRC = "/runners/canvas-runner.html?v=20260307-4";

function sendCodeToRunner(iframe: HTMLIFrameElement | null, code: string) {
  if (!iframe?.contentWindow || !code) return;
  iframe.contentWindow.postMessage({ type: "RUN_CODE", code }, RUNNER_TARGET_ORIGIN);
}

export const Canvas2DRunner = forwardRef<Canvas2DRunnerHandle, Canvas2DRunnerProps>(
  function Canvas2DRunner({ code, className }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const iframeLoadedRef = useRef(false);
    const imageResolveRef = useRef<((url: string) => void) | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        getImageDataUrl: () =>
          new Promise<string>((resolve) => {
            const win = iframeRef.current?.contentWindow;
            if (!win) {
              resolve("");
              return;
            }
            imageResolveRef.current = resolve;
            win.postMessage({ type: "GET_IMAGE" }, RUNNER_TARGET_ORIGIN);
          }),
      }),
      []
    );

    useEffect(() => {
      const handler = (e: MessageEvent) => {
        if (e.data?.type === "IMAGE_DATA" && imageResolveRef.current) {
          imageResolveRef.current(e.data.dataUrl ?? "");
          imageResolveRef.current = null;
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, []);

    const runCode = useCallback(() => {
      sendCodeToRunner(iframeRef.current, code);
    }, [code]);

    useEffect(() => {
      if (!code) return;
      if (iframeLoadedRef.current) {
        runCode();
      }
    }, [code, runCode]);

    const handleIframeLoad = useCallback(() => {
      iframeLoadedRef.current = true;
      sendCodeToRunner(iframeRef.current, code);
    }, [code]);

    if (!code) {
      return (
        <div
          className={cn(
            "flex flex-1 items-center justify-center text-[hsl(var(--muted-foreground))] text-sm",
            className
          )}
        >
          在左侧描述效果并生成代码
        </div>
      );
    }

    return (
      <iframe
        ref={iframeRef}
        src={RUNNER_SRC}
        title="Canvas 2D Preview"
        className={cn("h-full w-full border-0", className)}
        sandbox="allow-scripts"
        onLoad={handleIframeLoad}
      />
    );
  }
);

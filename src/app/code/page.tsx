"use client";

import { useEffect, useState } from "react";
import { CodeBlock } from "@/modules/code-copy/CodeBlock";

const VIEW_CODE_STORAGE_KEY = "canvas-genie-view-code";

export default function CodePage() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(VIEW_CODE_STORAGE_KEY);
    if (stored) {
      setCode(stored);
      localStorage.removeItem(VIEW_CODE_STORAGE_KEY);
    }
  }, []);

  if (code === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          请在主页面生成代码后点击「代码」按钮打开
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">
          生成代码
        </h1>
        <CodeBlock
          code={code}
          className="rounded-lg border border-[hsl(var(--border))]"
          scrollHeight="70vh"
        />
      </div>
    </div>
  );
}

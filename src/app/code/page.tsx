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
      <div className="flex min-h-screen w-full items-center justify-center bg-black p-6">
        <p className="text-sm text-neutral-400">
          请在主页面生成代码后点击「代码」按钮打开
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-black">
      <CodeBlock
        code={code}
        fill
        className="rounded-none border-0"
      />
    </div>
  );
}

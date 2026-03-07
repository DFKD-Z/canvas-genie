"use client";

import { useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatPanel } from "@/modules/chat/ChatPanel";
import { CanvasPreview } from "@/modules/preview/CanvasPreview";
import type { GeneratedCode } from "@/types";

export default function Home() {
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);

  const handleCodeGenerated = useCallback((code: GeneratedCode) => {
    setGenerated(code);
  }, []);

  return (
    <MainLayout
      left={<ChatPanel onCodeGenerated={handleCodeGenerated} />}
      right={<CanvasPreview generated={generated} />}
    />
  );
}

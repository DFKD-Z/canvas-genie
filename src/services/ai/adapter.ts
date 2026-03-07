import type { GeneratedCode } from "@/types";

export interface AIAdapter {
  generateCanvasCode(
    userMessage: string,
    conversationHistory?: { role: string; content: string }[],
    currentCode?: string
  ): Promise<GeneratedCode>;
}

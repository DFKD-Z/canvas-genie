import type { ChatApiResponse } from "@/types";

export interface AIAdapter {
  generateCanvasCode(
    userMessage: string,
    conversationHistory?: { role: string; content: string }[],
    currentCode?: string,
    imageDataUrl?: string
  ): Promise<ChatApiResponse>;
}

import type { ChatApiResponse } from "@/types";

export type StreamChunkType = "content" | "reasoning";

export interface AIAdapter {
  generateCanvasCode(
    userMessage: string,
    conversationHistory?: { role: string; content: string }[],
    currentCode?: string,
    imageDataUrl?: string
  ): Promise<ChatApiResponse>;

  /**
   * 流式生成：每收到一块就调用 onChunk，结束后返回与 generateCanvasCode 相同结构的结果。
   * 若适配器未实现，调用方应退化为非流式请求。
   */
  streamCanvasCode?(
    userMessage: string,
    conversationHistory?: { role: string; content: string }[],
    currentCode?: string,
    imageDataUrl?: string,
    onChunk?: (type: StreamChunkType, text: string) => void
  ): Promise<ChatApiResponse>;
}

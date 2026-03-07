export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** data URL，便于 IndexedDB 序列化与展示 */
  imageDataUrl?: string;
  generatedCode?: { code: string; type: "2d" | "3d" };
}

export type CanvasCodeType = "2d" | "3d";

export interface GeneratedCode {
  code: string;
  type: CanvasCodeType;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  generatedCode?: GeneratedCode;
}

/** 单条聊天记录（用于 IndexedDB 持久化） */
export interface ChatRecord {
  id: string;
  title: string;
  messages: ChatMessage[];
  generatedCode: GeneratedCode | null;
  createdAt: number;
  updatedAt: number;
}

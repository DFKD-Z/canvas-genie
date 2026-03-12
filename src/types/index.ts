export type CanvasCodeType = "2d" | "3d";

export interface GeneratedCode {
  code: string;
  type: CanvasCodeType;
}

/** API 返回：纯文本互动（如分段询问）或生成的代码 */
export type ChatApiResponse = { message: string } | GeneratedCode;

export function isCodeResponse(data: ChatApiResponse | null): data is GeneratedCode {
  return data != null && "code" in data && typeof (data as GeneratedCode).code === "string";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** 思考/推理过程，仅 assistant 可能有 */
  reasoning?: string;
  /** data URL，便于 IndexedDB 序列化与展示 */
  imageDataUrl?: string;
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

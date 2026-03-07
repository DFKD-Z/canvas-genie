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

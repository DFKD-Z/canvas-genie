export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  generatedCode?: { code: string; type: "2d" | "3d" };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** 思考/推理过程（流式或完整），仅 assistant 可能有 */
  reasoning?: string;
  /** data URL，便于 IndexedDB 序列化与展示 */
  imageDataUrl?: string;
  generatedCode?: { code: string; type: "2d" | "3d" };
  /** 需求分析结论，仅 assistant 在「先分析后确认」流程中有 */
  requirementAnalysis?: { summary: string };
  /** 该条助理消息是否等待用户点「是/否」确认 */
  pendingConfirmation?: boolean;
}

/** 流式 SSE 事件类型 */
export type StreamEventType = "content" | "reasoning" | "done";

export interface StreamEventContent {
  t: "content";
  v: string;
}

export interface StreamEventReasoning {
  t: "reasoning";
  v: string;
}

export interface StreamEventDone {
  t: "done";
  /** 若为代码回复则存在 */
  code?: string;
  type?: "2d" | "3d";
  /** 若为纯文本回复则存在 */
  message?: string;
}

export type StreamEvent = StreamEventContent | StreamEventReasoning | StreamEventDone;

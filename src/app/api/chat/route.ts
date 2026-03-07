import { NextRequest, NextResponse } from "next/server";
import { createOpenAIAdapter } from "@/services/ai/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [], currentCode, apiKey, model } = body as {
      message?: string;
      history?: { role: string; content: string }[];
      currentCode?: string;
      apiKey?: string;
      model?: string;
    };
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { code: 400, msg: "Missing or invalid message" },
        { status: 400 }
      );
    }
    const adapter = createOpenAIAdapter(
      apiKey || model ? { ...(apiKey && { apiKey }), ...(model && { model }) } : undefined
    );
    const result = await adapter.generateCanvasCode(message, history, currentCode);
    return NextResponse.json({ code: 0, data: result, msg: "ok" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { code: 500, data: null, msg: message },
      { status: 500 }
    );
  }
}

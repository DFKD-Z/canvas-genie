import { NextRequest, NextResponse } from "next/server";
import { createOpenAIAdapter } from "@/services/ai/openai";
import { isCodeResponse } from "@/types";

const encoder = new TextEncoder();

function sseLine(obj: object): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

const CONFIRMED_PREFIX = "用户已确认以下需求，请直接生成对应的 2D Canvas 代码：\n\n";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      history = [],
      currentCode,
      apiKey,
      model,
      imageDataUrl,
      stream: useStream,
      step,
      confirmedAnalysis,
    } = body as {
      message?: string;
      history?: { role: string; content: string }[];
      currentCode?: string;
      apiKey?: string;
      model?: string;
      imageDataUrl?: string;
      stream?: boolean;
      step?: "analyze" | "generate";
      confirmedAnalysis?: string;
    };
    const msg = typeof message === "string" ? message : "";
    const hasImage = typeof imageDataUrl === "string" && imageDataUrl.startsWith("data:image/");
    const isGenerate = step === "generate";
    const isAnalyze = step !== "generate";

    if (isGenerate) {
      const confirmed = typeof confirmedAnalysis === "string" ? confirmedAnalysis.trim() : "";
      if (!confirmed) {
        return NextResponse.json(
          { code: 400, msg: "step is 'generate' requires confirmedAnalysis" },
          { status: 400 }
        );
      }
    } else if (!msg.trim() && !hasImage) {
      return NextResponse.json(
        { code: 400, msg: "Message or image required" },
        { status: 400 }
      );
    }

    const adapter = createOpenAIAdapter(
      apiKey || model ? { ...(apiKey && { apiKey }), ...(model && { model }) } : undefined
    );

    if (isAnalyze && adapter.analyzeRequirement) {
      const result = await adapter.analyzeRequirement(msg, history, hasImage ? imageDataUrl : undefined);
      return NextResponse.json({ code: 0, data: { analysis: result.analysis }, msg: "ok" });
    }

    const effectiveMessage = isGenerate && typeof confirmedAnalysis === "string"
      ? CONFIRMED_PREFIX + confirmedAnalysis.trim()
      : msg;
    const effectiveImage = isGenerate ? undefined : (hasImage ? imageDataUrl : undefined);

    if (useStream && adapter.streamCanvasCode) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const result = await adapter.streamCanvasCode!(
              effectiveMessage,
              history,
              currentCode,
              effectiveImage,
              (type, text) => {
                controller.enqueue(encoder.encode(sseLine({ t: type, v: text })));
              }
            );
            const done =
              isCodeResponse(result) ?
                { t: "done" as const, code: result.code, type: result.type }
              : { t: "done" as const, message: result.message };
            controller.enqueue(encoder.encode(sseLine(done)));
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            controller.enqueue(encoder.encode(sseLine({ t: "done" as const, message: `[错误] ${errorMessage}` })));
          } finally {
            controller.close();
          }
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const result = await adapter.generateCanvasCode(
      effectiveMessage,
      history,
      currentCode,
      effectiveImage
    );
    return NextResponse.json({ code: 0, data: result, msg: "ok" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { code: 500, data: null, msg: message },
      { status: 500 }
    );
  }
}

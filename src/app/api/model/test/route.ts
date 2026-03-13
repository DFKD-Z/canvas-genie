import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : undefined;
    const model =
      typeof body.model === "string" && body.model.trim()
        ? body.model.trim()
        : process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const effectiveKey = apiKey || process.env.OPENAI_API_KEY;
    if (!effectiveKey) {
      return NextResponse.json(
        { code: 400, data: null, msg: "请提供 API Key 或配置服务端 OPENAI_API_KEY" },
        { status: 400 }
      );
    }

    const baseURL = process.env.OPENAI_BASE_URL;
    const isQwen = model.includes("qwen");
    if (isQwen && !baseURL) {
      return NextResponse.json(
        {
          code: 400,
          data: null,
          msg:
            "使用 Qwen 模型时请在 .env.local 中设置 OPENAI_BASE_URL，例如：OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1",
        },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: effectiveKey,
      ...(baseURL && { baseURL }),
    });

    await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 1,
    });

    return NextResponse.json({ code: 0, data: { ok: true }, msg: "ok" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { code: 500, data: null, msg: message },
      { status: 500 }
    );
  }
}

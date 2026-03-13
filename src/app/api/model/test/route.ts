import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : undefined;
    const baseURLFromBody = typeof body.baseURL === "string" ? body.baseURL.trim() : undefined;
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

    const effectiveBaseURL = baseURLFromBody || process.env.OPENAI_BASE_URL;
    const isQwen = model.includes("qwen");
    if (isQwen && !effectiveBaseURL) {
      return NextResponse.json(
        {
          code: 400,
          data: null,
          msg:
            "使用 Qwen 模型时请填写 Base URL（如 https://dashscope.aliyuncs.com/compatible-mode/v1）或配置服务端 OPENAI_BASE_URL",
        },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: effectiveKey,
      ...(effectiveBaseURL && { baseURL: effectiveBaseURL }),
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

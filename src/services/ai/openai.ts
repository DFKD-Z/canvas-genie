import OpenAI from "openai";
import type { AIAdapter } from "./adapter";
import type { ChatApiResponse } from "@/types";
import { SYSTEM_PROMPT_2D, buildUserPrompt } from "./prompts";

function extractCodeFromResponse(content: string): string {
  const trimmed = content.trim();
  const codeBlockMatch = trimmed.match(/```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)```/i);
  const extracted = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;

  // 兼容 AI 返回 HTML 模板，提取 <script> 内 JS
  const scriptMatch = extracted.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch?.[1]) return scriptMatch[1].trim();

  // 兼容 ```html 代码块被误提取为 "html\n<script>..."
  if (/^html\s*$/i.test(extracted.split("\n")[0]?.trim() ?? "")) {
    const withoutLang = extracted.split("\n").slice(1).join("\n").trim();
    const nestedScript = withoutLang.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (nestedScript?.[1]) return nestedScript[1].trim();
    return withoutLang;
  }

  return extracted;
}

/** 判断内容是否像可执行的 Canvas JS（避免把纯文本回复当代码执行） */
function looksLikeJavaScript(text: string): boolean {
  const t = text.trim();
  if (!t || t.length < 20) return false;
  const firstLines = t.split(/\r?\n/).slice(0, 5).join(" ");
  const hasJsToken =
    /\b(const|let|var|function)\b/.test(firstLines) ||
    /\b(canvas|getContext|getElementById)\b/.test(firstLines) ||
    /\brequestAnimationFrame\b/.test(firstLines) ||
    /^\s*[\w.]+\s*=\s*document\./.test(t);
  const mostlyCjk = (t.match(/[\u4e00-\u9fff\u3000-\u303f]/g)?.length ?? 0) > t.length * 0.3;
  return hasJsToken && !mostlyCjk;
}

export interface OpenAIAdapterOptions {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export function createOpenAIAdapter(options?: OpenAIAdapterOptions): AIAdapter {
  const apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  const baseURL = options?.baseURL ?? process.env.OPENAI_BASE_URL;
  const openai = new OpenAI({
    apiKey,
    ...(baseURL && { baseURL }),
  });

  const model = options?.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const isQwen = model.includes("qwen");

  return {
    async generateCanvasCode(
      userMessage: string,
      conversationHistory?: { role: string; content: string }[],
      currentCode?: string,
      imageDataUrl?: string
    ) {
      if (isQwen && !baseURL) {
        throw new Error(
          "使用 Qwen 模型时请在 .env.local 中设置 OPENAI_BASE_URL，例如：OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1"
        );
      }

      const hasImage = typeof imageDataUrl === "string" && imageDataUrl.startsWith("data:image/");
      const textContent = buildUserPrompt(userMessage, currentCode, hasImage);
      const userContent: string | OpenAI.Chat.ChatCompletionContentPart[] = hasImage
        ? [
            { type: "text", text: textContent },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "auto" } },
          ]
        : textContent;

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT_2D },
        ...(conversationHistory ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: userContent },
      ];

      try {
        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature: 0.3,
        });
        const raw = completion.choices[0]?.message?.content ?? "";
        const extracted = extractCodeFromResponse(raw);
        if (!extracted) {
          return { message: raw.trim() || "未返回内容。" };
        }
        if (!looksLikeJavaScript(extracted)) {
          return { message: raw.trim() };
        }
        return { code: extracted, type: "2d" as const };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Connection error") || msg.includes("ECONNREFUSED") || msg.includes("fetch failed")) {
          throw new Error(
            `连接失败：请检查 OPENAI_BASE_URL 是否设为 DashScope 地址（如 https://dashscope.aliyuncs.com/compatible-mode/v1）、网络与防火墙，以及 OPENAI_API_KEY 是否为百炼 API Key。原始错误：${msg}`
          );
        }
        throw err;
      }
    },
  };
}

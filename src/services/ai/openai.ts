import OpenAI from "openai";
import type { AIAdapter } from "./adapter";
import type { GeneratedCode } from "@/types";
import { SYSTEM_PROMPT_2D, buildUserPrompt } from "./prompts";

function extractCodeFromResponse(content: string): string {
  const trimmed = content.trim();
  const codeBlockMatch = trimmed.match(/```(?:javascript|js)\s*([\s\S]*?)```/i);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const genericBlock = trimmed.match(/```\s*([\s\S]*?)```/);
  if (genericBlock) return genericBlock[1].trim();
  return trimmed;
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
    async generateCanvasCode(userMessage: string, conversationHistory?: { role: string; content: string }[]) {
      if (isQwen && !baseURL) {
        throw new Error(
          "使用 Qwen 模型时请在 .env.local 中设置 OPENAI_BASE_URL，例如：OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1"
        );
      }

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT_2D },
        ...(conversationHistory ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: buildUserPrompt(userMessage) },
      ];

      try {
        const completion = await openai.chat.completions.create({
          model,
          messages,
          temperature: 0.3,
        });
        const raw = completion.choices[0]?.message?.content ?? "";
        const code = extractCodeFromResponse(raw);
        if (!code) {
          throw new Error("AI did not return valid code");
        }
        return { code, type: "2d" as const };
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

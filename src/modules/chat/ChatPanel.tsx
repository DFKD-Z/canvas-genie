"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "./types";
import type { GeneratedCode } from "@/types";

const STORAGE_KEY_API = "canvas-genie-apiKey";
const STORAGE_KEY_MODEL = "canvas-genie-model";

const MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "qwen3.5-flash", label: "Qwen 3.5 Flash" },
  { value: "qwen-turbo", label: "Qwen Turbo" },
];

interface ChatPanelProps {
  messages: ChatMessageType[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
  onCodeGenerated?: (code: GeneratedCode) => void;
  /** 新聊天回调（移动端无侧栏时可在头部提供入口） */
  onNewChat?: () => void;
  className?: string;
}

export function ChatPanel({ messages, setMessages, onCodeGenerated, onNewChat, className }: ChatPanelProps) {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedKey = localStorage.getItem(STORAGE_KEY_API);
    const savedModel = localStorage.getItem(STORAGE_KEY_MODEL);
    if (savedKey != null) setApiKey(savedKey);
    if (savedModel != null && MODEL_OPTIONS.some((o) => o.value === savedModel)) setModel(savedModel);
  }, []);

  const persistApiKey = useCallback((v: string) => {
    setApiKey(v);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY_API, v);
  }, []);
  const persistModel = useCallback((v: string) => {
    setModel(v);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY_MODEL, v);
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      const userMsg: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      try {
        const history = messages.map((m) => {
          if (m.role === "assistant" && m.generatedCode?.code) {
            return {
              role: m.role,
              content: `已生成 Canvas 代码：\n\n\`\`\`javascript\n${m.generatedCode.code}\n\`\`\``,
            };
          }
          return { role: m.role, content: m.content };
        });
        const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && m.generatedCode?.code);
        const currentCode = lastAssistant?.generatedCode?.code;
        const body: Record<string, unknown> = { message: content, history };
        if (currentCode) body.currentCode = currentCode;
        if (apiKey.trim()) body.apiKey = apiKey.trim();
        if (model) body.model = model;
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (json.code !== 0 || !json.data) {
          throw new Error(json.msg || "Request failed");
        }
        const data = json.data as GeneratedCode;
        const code = data?.code ?? "";
        const type = data?.type ?? "2d";
        const assistantMsg: ChatMessageType = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "已生成 Canvas 代码，请在右侧查看预览并复制。",
          generatedCode: { code, type },
        };
        setMessages((prev) => [...prev, assistantMsg]);
        onCodeGenerated?.({ code, type });
      } catch (err) {
        const errMsg: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: err instanceof Error ? err.message : "生成失败，请重试。",
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [messages, onCodeGenerated, apiKey, model]
  );

  return (
    <div className={cn("flex h-full flex-col bg-[hsl(var(--card))]", className)}>
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">
              Canvas Genie
            </h2>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              描述效果，AI 生成代码
            </p>
          </div>
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="md:hidden rounded-lg px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            >
              新聊天
            </button>
          )}
        </div>
        <MessageList messages={messages} loading={loading} />
        <InputArea onSend={handleSend} disabled={loading} />
        <div className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="chat-model" className="text-xs font-medium text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                模型
              </label>
              <select
                id="chat-model"
                value={model}
                onChange={(e) => persistModel(e.target.value)}
                className="h-8 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <label htmlFor="chat-apikey" className="text-xs font-medium text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                API Key
              </label>
              <input
                id="chat-apikey"
                type="password"
                placeholder="可选，不填则使用服务端环境变量"
                value={apiKey}
                onChange={(e) => persistApiKey(e.target.value)}
                className="h-8 flex-1 min-w-0 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

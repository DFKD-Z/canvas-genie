"use client";

import { useCallback, useRef, useState } from "react";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";
import { cn } from "@/lib/utils";
import { useModelStore, MODEL_OPTIONS } from "@/store/model";
import type { ChatMessage as ChatMessageType } from "./types";
import type { StreamEvent } from "./types";
import type { ChatApiResponse, GeneratedCode } from "@/types";
import { isCodeResponse } from "@/types";

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
  const sendingRef = useRef(false);
  const apiKey = useModelStore((s) => s.apiKey);
  const model = useModelStore((s) => s.model);

  const buildHistory = useCallback((list: ChatMessageType[], appendUser?: { content: string; imageDataUrl?: string }) => {
    const items = appendUser
      ? [...list, { role: "user" as const, content: appendUser.content, imageDataUrl: appendUser.imageDataUrl }]
      : list;
    return items.map((m) => {
      if (m.role === "assistant" && m.generatedCode?.code) {
        return { role: m.role, content: `已生成 Canvas 代码：\n\n\`\`\`javascript\n${m.generatedCode.code}\n\`\`\`` };
      }
      if (m.role === "assistant" && m.requirementAnalysis?.summary != null) {
        return { role: m.role, content: m.requirementAnalysis.summary };
      }
      const text = m.content?.trim() || (m.imageDataUrl ? "[附一张参考图]" : "");
      return { role: m.role, content: text };
    });
  }, []);

  const runAnalyzeRequest = useCallback(
    async (
      content: string,
      imageDataUrl: string | undefined,
      historyList: ChatMessageType[],
      fullMessages: ChatMessageType[]
    ): Promise<ChatMessageType> => {
      const history = buildHistory(historyList, { content, imageDataUrl });
      const lastAssistantWithCode = [...fullMessages]
        .reverse()
        .find((m) => m.role === "assistant" && m.generatedCode?.code);
      const currentCode = lastAssistantWithCode?.generatedCode?.code;
      const body: Record<string, unknown> = {
        message: content,
        history,
        step: "analyze",
      };
      if (imageDataUrl) body.imageDataUrl = imageDataUrl;
      if (currentCode) body.currentCode = currentCode;
      if (apiKey.trim()) body.apiKey = apiKey.trim();
      if (model) body.model = model;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.code !== 0 || json.data == null) {
        throw new Error(json.msg || "Request failed");
      }
      const analysis =
        typeof (json.data as { analysis?: string }).analysis === "string"
          ? (json.data as { analysis: string }).analysis
          : "";
      return {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: analysis || "未返回分析内容。",
        requirementAnalysis: { summary: analysis || "未返回分析内容。" },
        pendingConfirmation: true,
      };
    },
    [buildHistory, apiKey, model]
  );

  const handleSend = useCallback(
    async (content: string, imageDataUrls?: string[]) => {
      if (sendingRef.current) return;
      sendingRef.current = true;
      const imageDataUrl = imageDataUrls?.[0];
      const userMsg: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        ...(imageDataUrl && { imageDataUrl }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      try {
        const assistantMsg = await runAnalyzeRequest(content, imageDataUrl, messages, messages);
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errMsg: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: err instanceof Error ? err.message : "生成失败，请重试。",
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        sendingRef.current = false;
        setLoading(false);
      }
    },
    [messages, runAnalyzeRequest]
  );

  const handleRetry = useCallback(
    async (errorMessageId: string) => {
      if (sendingRef.current) return;
      const errIdx = messages.findIndex((m) => m.id === errorMessageId);
      if (errIdx === -1) return;
      let userMsg: ChatMessageType | null = null;
      for (let i = errIdx - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          userMsg = messages[i];
          break;
        }
      }
      if (!userMsg) return;
      sendingRef.current = true;
      setLoading(true);
      try {
        const historyList = messages.slice(0, messages.findIndex((m) => m.id === userMsg!.id));
        const assistantMsg = await runAnalyzeRequest(
          userMsg.content,
          userMsg.imageDataUrl,
          historyList,
          messages
        );
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errMsg: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: err instanceof Error ? err.message : "生成失败，请重试。",
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        sendingRef.current = false;
        setLoading(false);
      }
    },
    [messages, runAnalyzeRequest]
  );

  const handleConfirmRequirement = useCallback(
    async (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      const summary = msg?.requirementAnalysis?.summary;
      if (!summary || msg?.role !== "assistant") return;
      setMessages((prev) =>
        prev.map((m) => (m.id !== messageId ? m : { ...m, pendingConfirmation: false }))
      );
      setLoading(true);
      const history = buildHistory(messages);
      const lastAssistantWithCode = [...messages].reverse().find((m) => m.role === "assistant" && m.generatedCode?.code);
      const currentCode = lastAssistantWithCode?.generatedCode?.code;
      const body: Record<string, unknown> = {
        step: "generate",
        confirmedAnalysis: summary,
        history,
        stream: true,
      };
      if (currentCode) body.currentCode = currentCode;
      if (apiKey.trim()) body.apiKey = apiKey.trim();
      if (model) body.model = model;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const contentType = res.headers.get("Content-Type") ?? "";
        if (contentType.includes("text/event-stream") && res.body) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          const processLine = (line: string) => {
            if (!line.startsWith("data: ")) return;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") return;
            try {
              const event = JSON.parse(raw) as StreamEvent;
              if (event.t === "done") {
                setMessages((prev) =>
                  prev.map((m) => {
                    if (m.id !== messageId) return m;
                    const next = { ...m };
                    next.pendingConfirmation = false;
                    if ("code" in event && event.code) {
                      next.generatedCode = { code: event.code, type: event.type ?? "2d" };
                      next.content = "已经完成";
                      onCodeGenerated?.({ code: event.code, type: event.type ?? "2d" });
                    } else if ("message" in event && event.message) {
                      next.content = next.content?.trim() || event.message;
                    }
                    return next;
                  })
                );
              }
            } catch {
              // ignore
            }
          };
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split("\n\n");
            buffer = parts.pop() ?? "";
            for (const part of parts) {
              const line = part.split("\n").find((l) => l.startsWith("data:"));
              if (line) processLine(line);
            }
          }
          if (buffer) {
            const line = buffer.split("\n").find((l) => l.startsWith("data:"));
            if (line) processLine(line);
          }
        } else {
          const json = await res.json();
          if (json.code !== 0 || !json.data) throw new Error(json.msg || "Request failed");
          const data = json.data as ChatApiResponse;
          if (isCodeResponse(data)) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id !== messageId
                  ? m
                  : {
                      ...m,
                      pendingConfirmation: false,
                      generatedCode: { code: data.code, type: data.type ?? "2d" },
                      content: "已经完成",
                    }
              )
            );
            onCodeGenerated?.({ code: data.code, type: data.type ?? "2d" });
          } else {
            const text = typeof data.message === "string" ? data.message.trim() : "";
            setMessages((prev) =>
              prev.map((m) =>
                m.id !== messageId ? m : { ...m, pendingConfirmation: false, content: text || "未返回内容。" }
              )
            );
          }
        }
      } catch (err) {
        const errMsg: ChatMessageType = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: err instanceof Error ? err.message : "生成失败，请重试。",
          isError: true,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [messages, buildHistory, apiKey, model, onCodeGenerated]
  );

  const handleRejectRequirement = useCallback((messageId: string) => {
    const tipMsg: ChatMessageType = {
      id: `tip-${Date.now()}`,
      role: "assistant",
      content: "请补充说明您的需求。",
    };
    setMessages((prev) => [
      ...prev.map((m) => (m.id !== messageId ? m : { ...m, pendingConfirmation: false })),
      tipMsg,
    ]);
  }, []);

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
        <MessageList
          messages={messages}
          loading={loading}
          onConfirmRequirement={handleConfirmRequirement}
          onRejectRequirement={handleRejectRequirement}
          onRetry={handleRetry}
        />
        <InputArea onSend={handleSend} disabled={loading} />
        <div className="shrink-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[hsl(var(--muted-foreground))]">
            <span>
              模型：<span className="font-medium text-[hsl(var(--foreground))]">{MODEL_OPTIONS.find((o) => o.value === model)?.label ?? model}</span>
            </span>
            <span>用量：—</span>
          </div>
        </div>
      </div>
    </div>
  );
}

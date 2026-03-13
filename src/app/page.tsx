"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { RecordList } from "@/components/chat/RecordList";
import { ChatPanel } from "@/modules/chat/ChatPanel";
import { CanvasPreview } from "@/modules/preview/CanvasPreview";
import { useAuthStore } from "@/store/auth";
import type { GeneratedCode, ChatRecord } from "@/types";
import type { ChatMessage } from "@/modules/chat/types";
import {
  listChatRecords,
  saveChatRecord,
  getChatRecord,
  deleteChatRecord,
  createRecordId,
  recordTitleFromMessages,
} from "@/services/storage/chatRecordsDb";

export default function Home() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [records, setRecords] = useState<ChatRecord[]>([]);

  useEffect(() => {
    if (hasHydrated && user == null) {
      router.replace("/login");
    }
  }, [hasHydrated, user, router]);

  const loadRecords = useCallback(async () => {
    try {
      const list = await listChatRecords();
      setRecords(list);
    } catch (e) {
      console.error("Failed to load chat records:", e);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  /** 有聊天内容时自动持久化：首次发送后即创建记录，之后每次 messages/generated 变化都更新同一条 */
  useEffect(() => {
    const hasContent = messages.length > 0 || generated != null;
    if (!hasContent) return;

    const id = currentRecordId ?? createRecordId();
    if (!currentRecordId) setCurrentRecordId(id);

    let createdAt = Date.now();
    getChatRecord(id)
      .then((existing) => {
        if (existing) createdAt = existing.createdAt;
      })
      .catch(() => {})
      .finally(() => {
        const title = recordTitleFromMessages(messages);
        saveChatRecord({
          id,
          title,
          messages,
          generatedCode: generated,
          createdAt,
        })
          .then(() => loadRecords())
          .catch((e) => console.error("Failed to persist chat record:", e));
      });
  }, [messages, generated, currentRecordId, loadRecords]);

  const handleCodeGenerated = useCallback((code: GeneratedCode) => {
    setGenerated(code);
  }, []);

  /** 新聊天：若有内容则先保存到 IndexedDB（已有记录则更新同一条，不重复创建），再清空当前会话 */
  const handleNewChat = useCallback(async () => {
    const hasContent = messages.length > 0 || generated != null;
    if (hasContent) {
      try {
        const title = recordTitleFromMessages(messages);
        const id = currentRecordId ?? createRecordId();
        let createdAt = Date.now();
        if (currentRecordId) {
          const existing = await getChatRecord(currentRecordId);
          if (existing) createdAt = existing.createdAt;
        }
        await saveChatRecord({
          id,
          title,
          messages,
          generatedCode: generated,
          createdAt,
        });
      } catch (e) {
        console.error("Failed to save current chat:", e);
      }
      await loadRecords();
    }
    setMessages([]);
    setGenerated(null);
    setCurrentRecordId(null);
  }, [messages, generated, currentRecordId, loadRecords]);

  /** 点击记录：从 IndexedDB 加载并恢复聊天与画布 */
  const handleSelectRecord = useCallback(async (record: ChatRecord) => {
    setMessages(record.messages);
    setGenerated(record.generatedCode);
    setCurrentRecordId(record.id);
  }, []);

  /** 删除记录 */
  const handleDeleteRecord = useCallback(
    async (id: string, _e?: React.MouseEvent) => {
      try {
        await deleteChatRecord(id);
        if (currentRecordId === id) {
          setMessages([]);
          setGenerated(null);
          setCurrentRecordId(null);
        }
        await loadRecords();
      } catch (e) {
        console.error("Failed to delete record:", e);
      }
    },
    [currentRecordId, loadRecords]
  );

  if (!hasHydrated || user == null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[hsl(var(--background))]">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">加载中…</p>
      </div>
    );
  }

  const sidebar = (
    <RecordList
      records={records}
      currentId={currentRecordId}
      onNewChat={handleNewChat}
      onSelect={handleSelectRecord}
      onDelete={handleDeleteRecord}
    />
  );

  return (
    <MainLayout
      sidebar={sidebar}
      left={
        <ChatPanel
          messages={messages}
          setMessages={setMessages}
          onCodeGenerated={handleCodeGenerated}
          onNewChat={handleNewChat}
        />
      }
      right={<CanvasPreview generated={generated} />}
    />
  );
}

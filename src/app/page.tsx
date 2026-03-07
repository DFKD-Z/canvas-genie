"use client";

import { useState, useCallback, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { RecordList } from "@/components/chat/RecordList";
import { ChatPanel } from "@/modules/chat/ChatPanel";
import { CanvasPreview } from "@/modules/preview/CanvasPreview";
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generated, setGenerated] = useState<GeneratedCode | null>(null);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [records, setRecords] = useState<ChatRecord[]>([]);

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

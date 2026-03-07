/**
 * IndexedDB 封装：聊天记录持久化
 * path: src/services/storage/chatRecordsDb.ts
 */

import type { ChatRecord } from "@/types";

const DB_NAME = "canvas-genie-db";
const STORE_NAME = "chat-records";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB only in browser"));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

function getStore(db: IDBDatabase, mode: IDBTransactionMode = "readonly") {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

/** 获取所有记录（按 updatedAt 倒序） */
export async function listChatRecords(): Promise<ChatRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = getStore(db).getAll();
    req.onsuccess = () => {
      const list = (req.result as ChatRecord[]) ?? [];
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

/** 根据 id 获取单条记录 */
export async function getChatRecord(id: string): Promise<ChatRecord | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = getStore(db).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

/** 保存一条记录（新增或覆盖） */
export async function saveChatRecord(record: Omit<ChatRecord, "updatedAt"> & { updatedAt?: number }): Promise<void> {
  const db = await openDb();
  const now = Date.now();
  const toSave: ChatRecord = {
    ...record,
    createdAt: record.createdAt ?? now,
    updatedAt: now,
  };
  return new Promise((resolve, reject) => {
    const store = getStore(db, "readwrite");
    const req = store.put(toSave);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** 删除一条记录 */
export async function deleteChatRecord(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = getStore(db, "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** 生成新记录 id */
export function createRecordId(): string {
  return `record-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 从首条用户消息生成标题，无则返回默认标题 */
export function recordTitleFromMessages(messages: { role: string; content: string }[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser?.content?.trim()) return "新对话";
  const raw = firstUser.content.trim();
  return raw.length > 24 ? `${raw.slice(0, 24)}…` : raw;
}

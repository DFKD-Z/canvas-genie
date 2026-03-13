"use client";

import { create } from "zustand";

export const STORAGE_KEY_API = "canvas-genie-apiKey";
export const STORAGE_KEY_MODEL = "canvas-genie-model";
export const STORAGE_KEY_BASE_URL = "canvas-genie-baseURL";

/** Qwen 等模型使用的 DashScope 兼容地址 */
export const DEFAULT_BASE_URL_QWEN = "https://dashscope.aliyuncs.com/compatible-mode/v1";

export const MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "qwen3.5-flash", label: "Qwen 3.5 Flash" },
  { value: "qwen-turbo", label: "Qwen Turbo" },
] as const;

export type ModelOption = (typeof MODEL_OPTIONS)[number];

/** 判断模型是否需要自定义 baseURL（如 Qwen 走 DashScope） */
export function modelNeedsCustomBaseUrl(model: string): boolean {
  return model.includes("qwen");
}

function loadApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY_API) ?? "";
}

function loadModel(): string {
  if (typeof window === "undefined") return "gpt-4o-mini";
  const saved = localStorage.getItem(STORAGE_KEY_MODEL);
  if (saved != null && MODEL_OPTIONS.some((o) => o.value === saved)) return saved;
  return "gpt-4o-mini";
}

function loadBaseURL(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY_BASE_URL) ?? "";
}

function saveApiKey(apiKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_API, apiKey);
}

function saveModel(model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

function saveBaseURL(baseURL: string): void {
  if (typeof window === "undefined") return;
  if (baseURL.trim()) {
    localStorage.setItem(STORAGE_KEY_BASE_URL, baseURL.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_BASE_URL);
  }
}

interface ModelState {
  apiKey: string;
  model: string;
  baseURL: string;
  setApiKey: (v: string) => void;
  setModel: (v: string) => void;
  setBaseURL: (v: string) => void;
  hydrate: () => void;
}

export const useModelStore = create<ModelState>((set) => ({
  apiKey: "",
  model: "gpt-4o-mini",
  baseURL: "",

  setApiKey(v: string) {
    set({ apiKey: v });
    saveApiKey(v);
  },

  setModel(v: string) {
    set({ model: v });
    saveModel(v);
  },

  setBaseURL(v: string) {
    const trimmed = v.trim();
    set({ baseURL: trimmed });
    saveBaseURL(trimmed);
  },

  hydrate() {
    set({
      apiKey: loadApiKey(),
      model: loadModel(),
      baseURL: loadBaseURL(),
    });
  },
}));

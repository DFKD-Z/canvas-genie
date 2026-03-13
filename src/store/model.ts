"use client";

import { create } from "zustand";

export const STORAGE_KEY_API = "canvas-genie-apiKey";
export const STORAGE_KEY_MODEL = "canvas-genie-model";

export const MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "qwen3.5-flash", label: "Qwen 3.5 Flash" },
  { value: "qwen-turbo", label: "Qwen Turbo" },
] as const;

export type ModelOption = (typeof MODEL_OPTIONS)[number];

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

function saveApiKey(apiKey: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_API, apiKey);
}

function saveModel(model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

interface ModelState {
  apiKey: string;
  model: string;
  setApiKey: (v: string) => void;
  setModel: (v: string) => void;
  hydrate: () => void;
}

export const useModelStore = create<ModelState>((set) => ({
  apiKey: "",
  model: "gpt-4o-mini",

  setApiKey(v: string) {
    set({ apiKey: v });
    saveApiKey(v);
  },

  setModel(v: string) {
    set({ model: v });
    saveModel(v);
  },

  hydrate() {
    set({ apiKey: loadApiKey(), model: loadModel() });
  },
}));

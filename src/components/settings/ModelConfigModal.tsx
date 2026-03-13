"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModelStore, MODEL_OPTIONS } from "@/store/model";

interface ModelConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelConfigModal({ open, onOpenChange }: ModelConfigModalProps) {
  const { model, apiKey, setModel, setApiKey } = useModelStore();
  const [localModel, setLocalModel] = useState(model);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [modelChanged, setModelChanged] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalModel(model);
      setLocalApiKey(apiKey);
      setTestStatus("idle");
      setTestMessage("");
      setModelChanged(false);
    }
  }, [open, model, apiKey]);

  const handleModelChange = useCallback((v: string) => {
    setLocalModel(v);
    setModelChanged(true);
    setTestStatus("idle");
    setTestMessage("");
  }, []);

  const handleTestConnection = useCallback(async () => {
    const keyToUse = localApiKey.trim();
    if (!keyToUse) {
      setTestMessage("请先填写 API Key");
      setTestStatus("error");
      return;
    }
    setTestStatus("loading");
    setTestMessage("");
    try {
      const res = await fetch("/api/model/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToUse, model: localModel }),
      });
      const json = await res.json();
      if (json.code === 0) {
        setTestStatus("success");
        setTestMessage("连接成功");
      } else {
        setTestStatus("error");
        setTestMessage(json.msg ?? "连接失败");
      }
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "请求失败");
    }
  }, [localApiKey, localModel]);

  const handleSave = useCallback(() => {
    setModel(localModel);
    setApiKey(localApiKey.trim());
    onOpenChange(false);
  }, [localModel, localApiKey, setModel, setApiKey, onOpenChange]);

  const needApiKeyPrompt = modelChanged && !localApiKey.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>模型配置</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="model-config-model"
              className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
            >
              模型
            </label>
            <select
              id="model-config-model"
              value={localModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="h-9 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="model-config-apikey"
              className="text-xs font-medium text-[hsl(var(--muted-foreground))]"
            >
              API Key
            </label>
            <input
              id="model-config-apikey"
              type="password"
              placeholder="不填则使用服务端环境变量"
              value={localApiKey}
              onChange={(e) => {
                setLocalApiKey(e.target.value);
                setTestStatus("idle");
                setTestMessage("");
              }}
              className="h-9 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
          {needApiKeyPrompt && (
            <p className="text-xs text-[hsl(var(--destructive))]">
              请填写该模型的 API Key 并点击「测试连接」
            </p>
          )}
          {testMessage && (
            <p
              className={cn(
                "text-xs",
                testStatus === "success"
                  ? "text-green-600 dark:text-green-400"
                  : "text-[hsl(var(--destructive))]"
              )}
            >
              {testMessage}
            </p>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testStatus === "loading"}
          >
            {testStatus === "loading" ? "测试中…" : "测试连接"}
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

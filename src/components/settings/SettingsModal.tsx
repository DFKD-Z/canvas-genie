"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModelStore, MODEL_OPTIONS } from "@/store/model";
import { ChevronRight } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenModelConfig: () => void;
}

export function SettingsModal({
  open,
  onOpenChange,
  onOpenModelConfig,
}: SettingsModalProps) {
  const model = useModelStore((s) => s.model);
  const modelLabel = MODEL_OPTIONS.find((o) => o.value === model)?.label ?? model;

  const handleModelClick = () => {
    onOpenChange(false);
    onOpenModelConfig();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>用户设置</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-0 py-2">
          <button
            type="button"
            onClick={handleModelClick}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            aria-label="模型配置"
          >
            <span>模型</span>
            <span className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
              {modelLabel}
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useModelStore } from "@/store/model";

/** 在客户端挂载时从 localStorage 恢复登录与模型配置，仅执行一次 */
export function AuthHydrate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().hydrate();
    useModelStore.getState().hydrate();
  }, []);
  return <>{children}</>;
}

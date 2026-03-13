"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

/** 在客户端挂载时从 localStorage 恢复登录状态，仅执行一次 */
export function AuthHydrate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);
  return <>{children}</>;
}

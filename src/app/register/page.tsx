"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>注册</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            当前为演示环境，仅支持使用已预设账号登录。
          </p>
          <Button asChild size="sm" className="w-full">
            <Link href="/login">去登录</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

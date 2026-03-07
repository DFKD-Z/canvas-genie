"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCopyCode } from "./useCopyCode";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  className?: string;
  /** 代码区域最大高度，默认 200px；当 fill 为 true 时忽略 */
  scrollHeight?: string;
  /** 是否铺满父容器（标题栏 + 代码区占满高度） */
  fill?: boolean;
}

export function CodeBlock({
  code,
  className,
  scrollHeight = "200px",
  fill = false,
}: CodeBlockProps) {
  const { copy, copied } = useCopyCode();

  const handleCopy = () => {
    copy(code);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col min-h-0",
        fill && "h-full w-full",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-3 py-2">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          生成代码（可直接复制到项目）
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              已复制
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              复制代码
            </>
          )}
        </Button>
      </div>
      <ScrollArea
        className={cn("w-full", fill && "min-h-0 flex-1")}
        style={fill ? undefined : { height: scrollHeight }}
      >
        <SyntaxHighlighter
          language="javascript"
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.75rem",
            lineHeight: 1.5,
            borderRadius: 0,
          }}
          codeTagProps={{ style: { fontFamily: "var(--font-mono), monospace" } }}
          showLineNumbers={false}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </ScrollArea>
    </div>
  );
}

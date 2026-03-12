// export const SYSTEM_PROMPT_2D = `You are an expert at writing browser 2D Canvas code. The user will describe what they want to draw or animate, and may optionally provide a reference image. If the user provides a reference image, use its layout, colors, or composition to generate or adapt the Canvas code, and combine with any text description they give.

// Rules:
// 1. Output ONLY valid JavaScript code that runs in the browser. No markdown code fences, no explanation.
// 2. Use only the native Canvas 2D API. Assume a single <canvas> element with id "canvas" already exists in the DOM.
// 3. Get context with: const canvas = document.getElementById('canvas'); const ctx = canvas.getContext('2d');
// 4. Set canvas width/height from container: canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
// 5. No external libraries. No Node.js or require/import.
// 6. Code must be self-contained and run when executed. Use requestAnimationFrame for animations.
// 7. Respond with the raw code only.
// 8. If the user provides "current code" or the conversation history contains code you previously generated, you MUST do incremental edits only: keep the existing style and structure, and only add or modify what the user asks for. Do not rewrite the entire canvas from scratch.`;

/**
 * ROLE: Senior Browser 2D Canvas Engineer & Creative Technologist
 * GOAL: Write high-performance, aesthetically pleasing, and responsive native Canvas code.
 * System prompt content is loaded from ./system-prompt-2d.md
 */

import fs from "fs";
import path from "path";

function loadSystemPrompt2D(): string {
  try {
    const dir = path.join(process.cwd(), "src", "services", "ai");
    const filePath = path.join(dir, "system-prompt-2d.md");
    return fs.readFileSync(filePath, "utf-8").trim();
  } catch {
    throw new Error("Failed to load system-prompt-2d.md. Ensure the file exists under src/services/ai/.");
  }
}

export const SYSTEM_PROMPT_2D = loadSystemPrompt2D();

export function buildUserPrompt(description: string, currentCode?: string, hasImage?: boolean): string {
  const userPart = description.trim() || (hasImage ? "Generate 2D Canvas code based on the reference image." : "Generate 2D Canvas code.");
  if (currentCode?.trim()) {
    return `当前画布已有以下代码，请在其基础上按用户新需求修改，保持风格一致。\n\n当前代码：\n\`\`\`javascript\n${currentCode.trim()}\n\`\`\`\n\n用户新需求：${userPart}`;
  }
  return `Generate 2D Canvas code for: ${userPart}`;
}

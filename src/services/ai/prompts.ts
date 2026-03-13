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

function loadRequirementAnalysisPromptTemplate(): string {
  try {
    const dir = path.join(process.cwd(), "src", "services", "ai");
    const filePath = path.join(dir, "requirement-analysis-prompt.md");
    return fs.readFileSync(filePath, "utf-8").trim();
  } catch {
    throw new Error("Failed to load requirement-analysis-prompt.md. Ensure the file exists under src/services/ai/.");
  }
}

/** 构建需求分析用 system prompt，替换模板中的 {{USER_DESCRIPTION}} 与 {{REFERENCE_IMAGE}} */
export function buildRequirementAnalysisPrompt(userDescription: string, hasReferenceImage: boolean): string {
  const template = loadRequirementAnalysisPromptTemplate();
  const description = userDescription.trim() || (hasReferenceImage ? "（用户未填写文字，请主要根据参考图理解需求。）" : "（用户未填写文字描述。）");
  const referenceImageNote = hasReferenceImage
    ? "用户已上传参考图，将在下方用户消息中以图片形式提供，请结合图片与文字描述进行分析。"
    : "本次未提供参考图，请仅根据用户描述进行分析。";
  return template
    .replace(/\{\{USER_DESCRIPTION\}\}/g, description)
    .replace(/\{\{REFERENCE_IMAGE\}\}/g, referenceImageNote);
}

export const SYSTEM_PROMPT_2D = loadSystemPrompt2D();

export function buildUserPrompt(description: string, currentCode?: string, hasImage?: boolean): string {
  const userPart = description.trim() || (hasImage ? "Generate 2D Canvas code based on the reference image." : "Generate 2D Canvas code.");
  if (currentCode?.trim()) {
    return `当前画布已有以下代码，请在其基础上按用户新需求修改，保持风格一致。\n\n当前代码：\n\`\`\`javascript\n${currentCode.trim()}\n\`\`\`\n\n用户新需求：${userPart}`;
  }
  return `Generate 2D Canvas code for: ${userPart}`;
}

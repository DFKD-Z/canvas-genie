# Canvas Genie

AI 描述生成 Canvas 代码工具：左侧输入自然语言描述，右侧实时预览并一键复制代码到项目使用。

## 技术栈

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui 风格组件
- OpenAI API（可扩展为其他模型）
- Supabase（预留，Phase 2 接入）

## 快速开始

1. 安装依赖：`npm install`
2. 复制环境变量：`cp .env.local.example .env.local`，填入 `OPENAI_API_KEY`
3. 启动开发：`npm run dev`，访问 http://localhost:3000

## 目录结构

- `src/app` - 页面与 API 路由
- `src/modules/chat` - 聊天模块
- `src/modules/preview` - Canvas 预览与 2D/3D Runner
- `src/modules/code-copy` - 代码展示与复制
- `src/services/ai` - AI 适配器与 Prompt
- `public/runners` - iframe 内执行生成代码的 runner 页面

## 迭代计划

- Phase 1（当前）：2D Canvas 生成、预览、复制
- Phase 2：Supabase Auth、历史/收藏
- Phase 3：3D（Three.js）支持
- Phase 4：分享链接等

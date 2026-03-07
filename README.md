# Canvas Genie

**AI 描述生成 Canvas 代码工具** · 用自然语言描述画面，实时生成并预览 2D Canvas 代码，一键复制到项目中使用。

**AI-powered Canvas code generator** — Describe your canvas in natural language, get live 2D Canvas code with instant preview and one-click copy for your project.

---

## 功能特点 / Features

| 中文 | English |
|------|--------|
| 左侧输入自然语言描述（如「画一个会弹跳的球」） | Enter natural language on the left (e.g. “draw a bouncing ball”) |
| 右侧 iframe 内实时预览生成的 Canvas 2D 效果 | Live preview of generated Canvas 2D in an iframe on the right |
| 支持多轮对话，可基于上下文迭代修改 | Multi-turn chat to refine results with context |
| 一键复制代码，或跳转代码页查看完整代码 | One-click copy or open code page for full snippet |
| 可选 API Key / 模型（含 GPT-4o、Qwen 等） | Optional API Key & model (GPT-4o, Qwen, etc.) |
| 纯原生 Canvas 2D API，无第三方图形库 | Pure native Canvas 2D API, no external graphics libs |

---

## 技术栈 / Tech Stack

| 中文 | English |
|------|--------|
| **Next.js 14**（App Router）+ **TypeScript** | Next.js 14 (App Router) + TypeScript |
| **Tailwind CSS** + **Radix/shadcn 风格** UI 组件 | Tailwind CSS + Radix/shadcn-style UI |
| **OpenAI API**（可扩展为其他模型） | OpenAI API (extensible to other models) |
| **Supabase**（预留，Phase 2 接入） | Supabase (reserved for Phase 2) |

---

## 环境要求 / Prerequisites

- **Node.js** 18+  
- **npm** 或 **pnpm** / **yarn**

---

## 快速开始 / Quick Start

### 1. 安装依赖 / Install dependencies

```bash
npm install
```

### 2. 配置环境变量 / Configure environment

在项目根目录创建 `.env.local`，并填入以下变量（至少需要 `OPENAI_API_KEY`）：

Create `.env.local` in the project root and set at least `OPENAI_API_KEY`:

```env
# 必填。OpenAI 或兼容 OpenAI 的 API Key（如阿里云百炼）
# Required. OpenAI or compatible API Key (e.g. Alibaba DashScope)
OPENAI_API_KEY=sk-xxx

# 可选。模型名，默认 gpt-4o-mini
# Optional. Model name, default: gpt-4o-mini
OPENAI_MODEL=gpt-4o-mini

# 使用 Qwen 等第三方模型时必填，例如阿里云百炼：
# Required when using Qwen etc. e.g. Alibaba DashScope:
# OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_BASE_URL=
```

### 3. 启动开发服务器 / Start dev server

```bash
npm run dev
```

浏览器访问 **http://localhost:3000**。

Open **http://localhost:3000** in your browser.

---

## 可用脚本 / Scripts

| 命令 Command | 说明 Description |
|-------------|------------------|
| `npm run dev` | 启动开发服务器 Start dev server |
| `npm run build` | 生产构建 Production build |
| `npm run start` | 启动生产服务 Start production server |
| `npm run lint` | 运行 ESLint Run ESLint |

---

## 目录结构 / Project Structure

```
src/
├── app/                    # 页面与 API 路由 / Pages & API routes
│   ├── page.tsx            # 首页（聊天 + 预览）/ Home (chat + preview)
│   ├── code/page.tsx       # 代码展示页 / Code view page
│   ├── api/chat/route.ts   # 聊天生成接口 / Chat generation API
│   ├── layout.tsx
│   └── globals.css
├── modules/
│   ├── chat/               # 聊天模块（输入、消息列表、API 调用）/ Chat (input, messages, API)
│   ├── preview/            # Canvas 预览与 2D/3D Runner / Canvas preview & runners
│   └── code-copy/          # 代码展示与复制 / Code display & copy
├── services/ai/            # AI 适配器与 Prompt / AI adapter & prompts
│   ├── openai.ts           # OpenAI / 兼容 API 实现
│   ├── adapter.ts          # 统一接口定义
│   └── prompts.ts          # 系统与用户 Prompt
├── components/             # 布局与 UI 组件 / Layout & UI components
├── lib/                    # 工具与 Supabase 客户端 / Utils & Supabase client
└── types/                  # 全局类型 / Global types
public/
└── runners/               # iframe 内执行生成代码的 runner 页面 / Runner pages for generated code
```

---

## 迭代计划 / Roadmap

| 阶段 Phase | 中文 | English |
|------------|------|--------|
| **Phase 1**（当前） | 2D Canvas 生成、实时预览、一键复制 | 2D Canvas generation, live preview, one-click copy |
| **Phase 2** | Supabase 鉴权、历史记录与收藏 | Supabase auth, history & favorites |
| **Phase 3** | 3D（Three.js）支持 | 3D (Three.js) support |
| **Phase 4** | 分享链接等 | Share links, etc. |

---

## 许可证 / License

Private / 私有项目。

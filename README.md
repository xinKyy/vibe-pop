# VibePop

**VibeCoding for Fun** — 用 AI 创造互动式社交内容

VibePop 是一个让用户通过自然语言与 AI 对话，快速生成互动社交内容（小游戏、互动相册、微生成器）的平台，以短视频上下滑动的形式进行内容分发。

## 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS v4
- React Router v7
- Zustand (状态管理)
- Vite (构建工具)

### 后端
- Hono.js (API 框架)
- Cloudflare Workers (运行时)
- Cloudflare KV (数据存储)
- Cloudflare R2 (文件存储)

## 快速开始

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

### 后端开发

```bash
cd worker
npm install
npm run dev
```

API 运行在 http://localhost:8787

## 项目结构

```
VibePop/
├── frontend/           # React 前端应用
│   └── src/
│       ├── components/ # 可复用组件
│       ├── pages/      # 页面组件
│       ├── stores/     # Zustand 状态管理
│       ├── hooks/      # 自定义 Hooks
│       ├── api/        # API 调用 & Mock 数据
│       └── types/      # TypeScript 类型定义
├── worker/             # Cloudflare Worker API
│   └── src/
│       ├── routes/     # API 路由
│       ├── services/   # 业务逻辑
│       └── middleware/  # 中间件
├── docs/               # 产品文档
└── desgin/             # 设计稿
```

## 功能特性

- **内容浏览**: List 瀑布流 + Feed 竖屏滑动双模式
- **AI 创作**: 自然语言对话生成互动内容，支持多轮迭代
- **Remix**: 一键基于他人作品改编
- **社交互动**: 点赞、收藏、评论、关注
- **个人主页**: 作品管理、社交关系
- **开放 API**: 支持 Agent 接入创作

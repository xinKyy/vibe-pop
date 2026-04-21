# 部署指南

VibePop 采用 Cloudflare 全家桶：
- **后端 API**：Cloudflare Workers（`vibepop-api`，走 KV 做存储）
- **前端**：Cloudflare Pages（`vibepop` 项目）

生产访问地址：
- 前端：`https://vibepop.pages.dev`
- API：`https://vibepop-api.zyhh1611054604.workers.dev/api`

前端在 `import.meta.env.PROD` 下会自动把请求指向上述 API 地址（见 `frontend/src/api/client.ts`），本地开发走 `/api` 相对路径 + Vite 代理。

---

## 1. 前置条件（一次性）

### 1.1 登录 Cloudflare

```bash
cd worker
npx wrangler login
# 或
npx wrangler whoami   # 确认当前登录账号
```

账号需要对目标 KV、Workers、Pages 都有权限。当前生产使用：
- Account：`Zyhh1611054604@gmail.com's Account`（ID `9a9edf163a32d9824c85d65863ef8513`）
- KV Namespace：`a1938fdf04194d9d82eb732cd6e05427`（见 `worker/wrangler.toml`）
- Pages 项目：`vibepop`（`vibepop.pages.dev`）

### 1.2 配置 Worker Secrets（只在首次或需要轮换时执行）

`wrangler.toml` 里不写密钥；通过 `wrangler secret` 注入：

```bash
cd worker
npx wrangler secret put JWT_SECRET
npx wrangler secret put AI_API_KEY
npx wrangler secret put AI_BASE_URL   # 如 https://api.openai.com/v1
```

查看当前 secrets：`npx wrangler secret list`。

### 1.3 安装依赖

```bash
cd frontend && npm install
cd ../worker && npm install
```

---

## 2. 一键部署（日常流程）

> 日常改完代码后，直接按顺序跑下面四步即可。

```bash
# ① 后端类型检查
cd worker && npm run typecheck

# ② 前端打包（内部会先跑 tsc -b，再跑 vite build）
cd ../frontend && npm run build

# ③ 部署 Worker
cd ../worker && npm run deploy

# ④ 部署 Pages
cd .. && npx wrangler pages deploy frontend/dist \
  --project-name=vibepop --branch=main --commit-dirty=true
```

成功输出示例：

```
# Worker
Uploaded vibepop-api (9.4s)
Deployed vibepop-api triggers
  https://vibepop-api.zyhh1611054604.workers.dev
Current Version ID: <uuid>

# Pages
✨ Deployment complete! Take a peek over at https://<hash>.vibepop.pages.dev
```

生产环境地址始终是 `https://vibepop.pages.dev`；每次部署同时会产出一个 `https://<hash>.vibepop.pages.dev` 快照地址，用于灰度验证或回滚定位。

> `--commit-dirty=true` 只是抑制"工作目录有未提交改动"的提示，不影响部署结果。

---

## 3. 前端 / 后端单独部署

### 只发后端

```bash
cd worker
npm run typecheck && npm run deploy
```

Worker 部署后通常**秒级生效**（Cloudflare 边缘推送）。

### 只发前端

```bash
cd frontend
npm run build
cd ..
npx wrangler pages deploy frontend/dist --project-name=vibepop --branch=main --commit-dirty=true
```

Pages 边缘缓存有时会有 1~2 分钟的 TTL，用户看到的还可能是旧版本。强制刷新用 `Cmd/Ctrl+Shift+R` 或访问快照 URL 验证。

---

## 4. KV 数据 / 种子数据

首次部署后，后端在第一次 API 调用时会自动跑 `seedDatabase`（见 `worker/src/seed.ts`）写入演示内容与 `templates:featured`。该函数是幂等的：

- `templates:featured`：每次冷启动都会覆盖写入最新的 `PROMPT_TEMPLATES`
- `contents:list`：只有在 KV 里不存在时才会首次播种

如果想重置某部分数据，直接用 `wrangler kv` 操作：

```bash
cd worker

# 列出 keys（分页）
npx wrangler kv key list --binding=KV

# 读某个 key
npx wrangler kv key get --binding=KV "templates:featured"

# 写 / 删
npx wrangler kv key put --binding=KV "templates:featured" '[]'
npx wrangler kv key delete --binding=KV "templates:featured"
```

---

## 5. 回滚

### Worker 回滚

```bash
cd worker
npx wrangler deployments list                # 查看历史版本
npx wrangler rollback <VERSION_ID>           # 回滚到指定版本
```

### Pages 回滚

在 Cloudflare Dashboard → Workers & Pages → `vibepop` → Deployments 里点击历史部署 → **Rollback**。或者直接把本地代码 `git checkout` 到老 commit 再跑一次 `pages deploy`。

---

## 6. 常见问题排查

| 症状 | 可能原因 | 处理 |
| --- | --- | --- |
| 前端打 API 都 401 | `JWT_SECRET` 没配 / 不一致 | `wrangler secret put JWT_SECRET` 后重新部署 Worker |
| 新部署没生效 | Pages 边缘缓存 | 强制刷新；或访问 `https://<hash>.vibepop.pages.dev` 快照验证 |
| AI 生成报错 | `AI_API_KEY` / `AI_BASE_URL` 缺失 | `wrangler secret list` 核对，缺的补上 |
| `Invalid target origin 'null'` | 浏览器扩展（钱包类）给沙箱 iframe postMessage | 与业务无关，可忽略；无痕窗口可验证 |
| Profile 页老账号字段缺失 | zustand 持久化的是旧 schema 的 user | 前端进入 Profile 会自动拉 `/users/me` 同步；或让用户重新登录 |

---

## 7. 本地开发

```bash
# Terminal 1 - 后端
cd worker
npm run dev              # 监听 http://localhost:8787

# Terminal 2 - 前端
cd frontend
npm run dev              # 监听 http://localhost:5173
```

`frontend/vite.config.ts` 已经把 `/api` 代理到 `http://localhost:8787`，直接访问 `http://localhost:5173` 即可。

本地想用真实 AI 时，需要在 `worker` 根目录新建 `.dev.vars`（已被 `.gitignore` 忽略）：

```ini
JWT_SECRET=dev-secret
AI_API_KEY=sk-xxxx
AI_BASE_URL=https://api.openai.com/v1
```

`wrangler dev` 会自动读取它作为本地环境变量。

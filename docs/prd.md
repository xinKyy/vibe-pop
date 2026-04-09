VibePop MVP 产品文档
产品名称：VibePop定位：VibeCoding for Fun —— 用 AI 创造互动式社交内容版本：MVP v1.0更新日期：2026-04-08

1. 产品概述
   1.1 一句话描述
   VibePop 是一个让用户通过自然语言与 AI 对话，快速生成互动社交内容（小游戏、互动相册、微生成器）的平台，并以短视频上下滑动的形式进行内容分发。
   1.2 核心价值主张
   零门槛创作：不会代码也能造出可玩的互动内容
   即时娱乐：VibeCoding过程本身就是乐趣，不只是为了生产力
   社交分发：像刷抖音一样刷互动内容，看到好玩的自己也能造
   1.3 目标用户
   想快速创造有趣内容的普通用户
   寻找新形式社交内容表达方式的人群
   对 AI 创作工具有好奇心但不想学习的"懒人"

2. 技术架构
   2.1 前端架构
   平台
   技术栈
   说明
   PC Web
   React + Tailwind CSS + TypeScript
   竖屏布局，居中显示手机尺寸视图
   H5
   React + 移动端适配 + TypeScript
   与 PC Web 共用组件，体验一致

2.2 后端架构（Cloudflare 全栈）
NodeJs + TypeScript
组件
用途
免费额度
Cloudflare Pages
前端托管
无限
Cloudflare KV
内容代码、用户数据、配置
1GB 存储
Cloudflare R2
图片资源、封面图
10GB 存储
Cloudflare Workers
API 路由、业务逻辑
10万次/天

2.3 AI 层
功能
服务
说明
代码生成
Moonshot/OpenAI
根据自然语言生成 HTML/CSS/JS
图片生成
可选接入
生成封面、素材


3. 功能模块详解
   3.1 通用规范
   3.1.1 竖屏交互（PC & H5 统一）
   PC Web 版本采用居中手机视图，宽度 375px，高度 100vh
   所有交互保持竖屏手势：下滑刷新、上滑加载
   导航栏固定在底部
   3.1.2 登录状态
   未登录：可浏览内容、点赞、评论（匿名）
   已登录：可创作、收藏、查看个人主页
   登录方式：邮箱 + 验证码

3.2 底部导航栏
┌─────────────────────────────────┐
│                                 │
│          内容区域               │
│                                 │
├─────────────────────────────────┤
│  📱 浏览   ➕ 创作   👤 我的    │
└─────────────────────────────────┘

Tab
图标
功能
浏览
🏠
内容发现（List + Feed 双模式）
创作
➕
AI 对话创作 + Remix
我的
👤
个人主页、作品管理


3.3 内容浏览（首页）
3.3.1 顶部 Tab 切换
┌─────────────────────────────────┐
│  List          │      Feed      │
└─────────────────────────────────┘

3.3.2 List 模式
瀑布流/网格布局展示内容封面
按类别筛选：全部 / 游戏 / 回忆 / 生成器
每张卡片显示：封面、标题、播放量、点赞数
┌────────────┬────────────┐
│ [封面图]   │ [封面图]   │
│ 弹球挑战   │ 大理之旅   │
│ ▶ 1.2k  ❤  │ ▶ 856  ❤  │
├────────────┼────────────┤
│ [封面图]   │ [封面图]   │
│ 毒舌点评   │ 时光相册   │
│ ▶ 2.1k  ❤  │ ▶ 432  ❤  │
└────────────┴────────────┘

3.3.3 Feed 模式（核心交互）
全屏短视频式滑动：下滑下一个、上滑上一个
自动播放：内容进入视口自动运行
底部信息栏：
┌─────────────────────────────────┐
│                                 │
│      [互动内容运行区域]          │
│                                 │
├─────────────────────────────────┤
│  @创作者名称              [+关注]│
│  内容标题                        │
│  ▶ 12.5k  ❤ 1.2k  ⭐ 345  💬  │
└─────────────────────────────────┘

点击创作者名称：进入该创作者的个人主页
3.3.4 内容交互
功能
交互方式
说明
播放/暂停
点击屏幕中央
内容运行/暂停
点赞
点击 ❤️ 或双击屏幕
红心动画
收藏
点击 ⭐
加入个人收藏
评论
点击 💬
底部弹出评论列表
分享
点击 ↗️
生成分享卡片/链接
关注
点击底部「+ 关注」按钮
关注创作者
Remix
点击 🔄
基于此内容创作
查看主页
点击创作者名称
进入创作者个人主页

List 点击行为：点击卡片 → 进入 Feed 浏览模式（从该内容开始上下滑动浏览）
关注功能说明：
Feed 模式：点击创作者名称旁的「+ 关注」按钮关注
点击创作者名称：进入创作者主页
关注后按钮变为「已关注」，再次点击取消关注
功能
交互方式
说明
播放/暂停
点击屏幕中央
内容运行/暂停
点赞
点击 ❤️ 或双击屏幕
红心动画
收藏
点击 ⭐
加入个人收藏
评论
点击 💬
底部弹出评论列表
分享
点击 ↗️
生成分享卡片/链接
Remix
点击 🔄
基于此内容创作


3.4 创作模块
3.4.1 创作入口
点击底部 ➕ 创作 Tab
↓
┌─────────────────────────────────┐
│                                 │
│   "描述你想创造什么..."         │
│                                 │
│         [发送 ➤]               │
│                                 │
├─────────────────────────────────┤
│  📋 推荐模板（一键 Remix）       │
│                                 │
│   ┌─────────┬─────────┐         │
│   │ [封面]  │ [封面]  │         │
│   │ 弹球    │ 相册    │         │
│   │ 🔄 Remix│ 🔄 Remix│         │
│   ├─────────┼─────────┤         │
│   │ [封面]  │ [封面]  │         │
│   │ 贺卡    │ 测试    │         │
│   │ 🔄 Remix│ 🔄 Remix│         │
│   └─────────┴─────────┘         │
│                                 │
│   [查看更多模板 →]              │
│                                 │
└─────────────────────────────────┘

推荐模板说明：
展示 4 个运营配置的推荐模板（2x2 网格）
用户点击直接基于此模板 Remix 创作
模板内容存储在 KV 中，可随时替换配置
支持运营场景：节日活动、热点跟进、新手引导
模板数据结构：
interface FeaturedTemplate {
id: string;           // 关联的内容 ID
title: string;        // 显示名称
cover: string;        // 封面图 URL
sortOrder: number;    // 排序权重
isActive: boolean;    // 是否上线
}

3.4.2 AI 对话创作流程
Step 1: 输入提示词
┌─────────────────────────────────┐
│                                 │
│  用户输入：                     │
│  "做一个弹球游戏，球用我的脸"    │
│                                 │
│         [发送 ➤]               │
│                                 │
└─────────────────────────────────┘

Step 2: AI 生成中
┌─────────────────────────────────┐
│                                 │
│    🤖 AI 正在创造...            │
│                                 │
│    生成游戏逻辑... ✓            │
│    设计视觉效果... ✓            │
│    添加交互反馈... ~            │
│                                 │
└─────────────────────────────────┘

Step 3: 竖屏预览 + 对话
┌─────────────────────────────────┐
│                                 │
│   [内容预览区域 - 可交互]        │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 🤖 还需要调整什么？     │   │
│   │ 可以告诉我：            │   │
│   │ - 改颜色                │   │
│   │ - 加音效                │   │
│   │ - 调难度                │   │
│   └─────────────────────────┘   │
│                                 │
│   [输入调整需求...        ] [发送]│
│                                 │
└─────────────────────────────────┘

对话交互逻辑：
用户在悬浮输入框输入修改需求
AI 理解后更新代码，预览区实时刷新
可连续多轮对话迭代
3.4.3 Remix 功能
入口：
在 Feed 浏览时点击 🔄 Remix 按钮
在 List 点击卡片上的 Remix 图标
流程：
点击 Remix
↓
加载原内容代码
↓
进入创作页面，提示框预填充：
"基于【原内容标题】进行改编，你想怎么改？"
↓
用户输入修改需求，AI 在原代码基础上修改

Remix 标识：
Remix 发布的内容自动关联原内容
显示 "Remix from @原作者"
原内容页面显示 "被 Remix X 次"
3.4.4 发布设置
发布前必填：
┌─────────────────────────────────┐
│  发布你的作品                   │
│                                 │
│  封面图 [自动生成/上传]         │
│                                 │
│  标题 *                         │
│  [输入标题...        ]          │
│                                 │
│  描述                           │
│  [输入描述...        ]          │
│                                 │
│  分类 *                         │
│  [游戏 ▼] [回忆 ▼] [生成器 ▼]   │
│                                 │
│  标签 (可选)                    │
│  [#弹球] [#AI生成] [+添加]      │
│                                 │
│      [    发 布    ]            │
│                                 │
└─────────────────────────────────┘


3.5 个人主页
3.5.1 页面类型
个人主页分为两种情况：
我的：当前登录用户自己的主页（显示「编辑资料」按钮）
TA 的主页：查看其他用户的主页（显示「关注/已关注」按钮）
3.5.2 页面结构
┌─────────────────────────────────┐
│  [返回]         个人主页  [设置] │
├─────────────────────────────────┤
│                                 │
│        [头像]                   │
│      用户名称                   │
│    @username                    │
│                                 │
│  简介：用AI创造好玩的东西        │
│                                 │
│   123 关注  │  456 粉丝         │
│                                 │
│  [编辑资料] / [+ 关注]          │
└─────────────────────────────────┘

3.5.3 关注/粉丝统计
关注：该用户关注的其他用户数量
粉丝：关注该用户的其他用户数量
点击「关注」数字 → 进入关注列表
点击「粉丝」数字 → 进入粉丝列表
3.5.4 Tab 切换
┌─────────────────────────────────┐
│  作品  │  点赞  │  收藏         │
├─────────────────────────────────┤
│                                 │
│   [内容列表/网格展示]           │
│                                 │
└─────────────────────────────────┘

Tab
内容
说明
作品
用户发布的所有内容
按时间倒序
点赞
用户点赞过的内容
可取消点赞
收藏
用户收藏的内容
私密，仅自己可见

注意：查看他人主页时，「收藏」Tab 不显示（仅自己可见）
┌─────────────────────────────────┐
│  [返回]         个人主页  [设置] │
├─────────────────────────────────┤
│                                 │
│        [头像]                   │
│      用户名称                   │
│    @username                    │
│                                 │
│  简介：用AI创造好玩的东西        │
│                                 │
│  [编辑资料]                     │
│                                 │
├─────────────────────────────────┤
│  作品  │  点赞  │  收藏         │
├─────────────────────────────────┤
│                                 │
│   [内容列表/网格展示]           │
│                                 │
└─────────────────────────────────┘

3.5.2 Tab 切换
Tab
内容
说明
作品
用户发布的所有内容
按时间倒序
点赞
用户点赞过的内容
可取消点赞
收藏
用户收藏的内容
私密，仅自己可见

3.5.3 内容卡片（我的页面）
┌────────────┬────────────┐
│ [封面]     │ [封面]     │
│ 标题       │ 标题       │
│ ▶ 1.2k ❤   │ ▶ 856 ❤    │
│ [编辑] [删除]│ [编辑] [删除]│
└────────────┴────────────┘


4. 内容安全与审核
   4.1 自动审核
   AI 内容安全检测（涉黄、涉暴、涉政）
   代码沙箱运行安全（限制 API 访问、禁止外部请求）
   4.2 人工审核
   新用户首次发布需人工审核
   被举报内容进入审核队列
   4.3 用户举报
   每个内容可举报（垃圾/侵权/违规）
   累计举报次数达到阈值下架处理

5. MVP 范围界定
   5.1 包含功能
   PC Web + H5 竖屏统一体验
   邮箱登录/注册
   内容浏览（List + Feed 双模式）
   内容播放、点赞、收藏、评论
   AI 对话创作（基础模板）
   Remix 功能
   个人主页（作品/点赞/收藏）
   社交关系（关注/粉丝）
   5.2 延后功能（Phase 2）
   积分系统
   搜索功能
   消息通知
   链上 NFT 化
   高级创作模板
   多人协作创作

6. 成功指标
   指标
   MVP 目标
   说明
   日活用户
   100+
   验证需求存在
   内容发布
   50+/周
   验证创作闭环
   人均浏览时长
   3min+
   验证内容吸引力
   ** Remix 率**
   10%+
   验证传播机制
   留存率
   次日 20%+
   验证产品粘性


7. 风险与应对
   风险
   影响
   应对
   AI 生成质量不稳定
   用户失望
   预设优质模板兜底
   内容冷启动困难
   没内容用户不来看
   团队自产 20+ 种子内容
   创作门槛仍高
   转化率低
   简化到「一句话生成」
   性能问题
   内容加载慢
   代码压缩 + CDN 加速


8. 下一步行动
   技术选型确认：React vs Vue，LLM 提供商
   UI 设计：首版设计稿（首页、Feed、创作页）
   种子内容：团队内部产出 10-20 个示例内容
   开发排期：MVP 预计 4-6 周开发周期


9. Agent 创作接口（OpenClaw Skill）
   9.1 概述
   VibePop 支持用户通过自有的 OpenClaw Agent（或其他 AI Agent）直接创作内容并发布到平台，无需打开网页界面。
   典型场景：
   用户在 Telegram/Discord 与 Agent 对话
   Agent 调用 VibePop API 生成并发布内容
   用户收到发布成功的链接
   9.2 认证机制
   API Key 认证：
   Authorization: Bearer {api_key}

获取方式：
用户在「我的」→「开发者设置」中生成 API Key
支持多个 Key，可单独吊销
免费用户：1 个 Key；Pro 用户：5 个 Key
9.3 接口设计
9.3.1 创建内容
POST /api/v1/contents
Authorization: Bearer {api_key}
Content-Type: application/json

请求体：
{
"prompt": "做一个弹球游戏，球用我的脸",
"template_id": "tmpl_001",  // 可选，使用模板
"title": "我的弹球",          // 可选，AI 可自动生成
"description": "",            // 可选
"type": "game",               // game | memory | generator | other
"assets": [                   // 可选，图片资源 URL 列表
"https://example.com/photo.jpg"
],
"auto_publish": false         // 是否直接发布，false 则保存为草稿
}

响应：
{
"success": true,
"data": {
"content_id": "cnt_abc123",
"status": "draft",           // draft | published
"title": "我的弹球",
"code": "<!-- HTML/CSS/JS -->",
"preview_url": "https://vibepop.app/preview/cnt_abc123",
"publish_url": "https://vibepop.app/c/cnt_abc123"
}
}

9.3.2 修改内容（Remix）
POST /api/v1/contents/{content_id}/remix
Authorization: Bearer {api_key}
Content-Type: application/json

请求体：
{
"prompt": "把背景改成粉色，加音效",
"auto_publish": false
}

9.3.3 发布内容
POST /api/v1/contents/{content_id}/publish
Authorization: Bearer {api_key}

请求体：
{
"title": "弹球挑战升级版",
"description": "增加了音效和粉色主题",
"type": "game"
}

9.3.4 获取用户内容列表
GET /api/v1/contents?status=published&page=1&limit=20
Authorization: Bearer {api_key}

9.4 OpenClaw Skill 示例
Skill 配置（skill.json）
{
"name": "vibepop",
"version": "1.0.0",
"description": "通过 VibePop 创建互动内容",
"commands": [
{
"name": "create",
"description": "创建新的互动内容",
"prompt": "我将帮你创建一个 VibePop 互动内容。请描述你想要什么："
},
{
"name": "remix",
"description": "基于现有内容改编",
"prompt": "请提供你想要 Remix 的内容链接："
},
{
"name": "myworks",
"description": "查看我的作品列表"
}
],
"config": {
"api_key": {
"required": true,
"description": "VibePop API Key"
}
}
}

Skill 代码示例
// 创建内容
async function createContent(prompt, userConfig) {
const response = await fetch('https://api.vibepop.app/v1/contents', {
method: 'POST',
headers: {
'Authorization': `Bearer ${userConfig.api_key}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({
prompt: prompt,
auto_publish: false
})
});

const result = await response.json();

if (result.success) {
return {
message: `✅ 内容创建成功！

📱 预览链接：${result.data.preview_url}
📝 编辑链接：${result.data.edit_url}

输入 "发布 ${result.data.content_id}" 正式发布到平台`,
data: result.data
};
}
}

// 发布内容
async function publishContent(contentId, title, userConfig) {
const response = await fetch(`https://api.vibepop.app/v1/contents/${contentId}/publish`, {
method: 'POST',
headers: {
'Authorization': `Bearer ${userConfig.api_key}`,
'Content-Type': 'application/json'
},
body: JSON.stringify({ title })
});

const result = await response.json();

if (result.success) {
return {
message: `🎉 发布成功！

🔗 分享链接：${result.data.publish_url}
📲 现在可以在 VibePop App 中查看和分享你的作品了！`
};
}
}

// 对话处理
export default async function(input, context) {
const { command, args, config } = context;

if (command === 'create') {
return await createContent(args, config);
}

if (command === 'publish') {
const [contentId, ...titleParts] = args.split(' ');
return await publishContent(contentId, titleParts.join(' '), config);
}

// 默认：根据用户输入智能判断
if (args.includes('发布') || args.includes('publish')) {
const contentId = args.match(/cnt_[a-z0-9]+/i)?.[0];
if (contentId) {
return await publishContent(contentId, '我的作品', config);
}
}

// 默认走创建流程
return await createContent(args, config);
}

9.5 用户使用流程
Step 1：配置 API Key
用户：设置 vibepop api_key
Agent：请输入你的 VibePop API Key（在「我的」→「开发者设置」中获取）：
用户：vp_live_abc123xyz
Agent：✅ API Key 配置成功！

Step 2：创作内容
用户：vibepop 做一个弹球游戏，球用猫的脸
Agent：🤖 正在为你创建弹球游戏...

✅ 内容创建成功！

📱 预览链接：https://vibepop.app/preview/cnt_abc123
📝 编辑链接：https://vibepop.app/edit/cnt_abc123

输入 "发布 cnt_abc123" 正式发布到平台

Step 3：发布
用户：发布 cnt_abc123，标题叫「猫咪弹球大作战」
Agent：🎉 发布成功！

🔗 分享链接：https://vibepop.app/c/cnt_abc123
📲 现在可以在 VibePop App 中查看和分享你的作品了！

9.6 数据格式
生成内容的代码结构：
{
"content": {
"type": "html",
"code": "<!DOCTYPE html>\n<html>...",
"assets": [
"https://r2.vibepop.app/images/user123/photo1.webp"
],
"config": {
"interactive": true,
"duration": 0,
"auto_play": true
}
}
}

代码安全限制：
不能使用 eval()、new Function()
不能访问 localStorage、document.cookie
不能发起外部 HTTP 请求（只能加载白名单内资源）
代码长度限制：50KB
9.7 速率限制
用户类型
创建请求/小时
发布请求/小时
免费用户
10
5
Pro 用户
50
30

9.8 错误码
错误码
说明
处理建议
401
API Key 无效
检查 Key 是否正确或已吊销
429
请求过于频繁
稍后再试或升级账户
400
生成失败
修改 prompt 重试
413
代码超出大小限制
简化需求
500
服务器错误
联系支持





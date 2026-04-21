# VibePop 编辑器 Prompt 模板

> 每个模板包含：VibePop 设计系统 + 通用占位符变量 + 结构/交互/视觉说明
> 用户点击模板后，提示词自动填入编辑器，只需替换 `{{变量}}` 内容

---

## 🗺️ 模板 1：旅行地点卡

```markdown
【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口）

【变量 - 请替换为你的内容】
- {{place_name: "地点名称"}} — 如：伏见稻荷大社
- {{date: "日期"}} — 如：3月26日
- {{cover_image: "封面照片URL"}} — 主视觉图片
- {{story: "故事内容"}} — 1-2段经历描述
- {{tips: "实用Tips"}} — 可选：交通/门票/时间建议
- {{coordinates: "经纬度"}} — 如：34.9671,135.7727（用于地图）
- {{photos: ["照片1URL","照片2URL"]}} — 浏览态照片网格

【页面结构】
1. 全屏封面照片（cover_image），底部渐变遮罩
2. 左下角：地点名称（place_name）+ 日期（date）
3. 右下角："查看详情"按钮
4. 点击展开浏览态：
   - 顶部：照片网格（photos）
   - 中部：故事文字（story）
   - 底部：迷你地图（coordinates）+ Tips

【交互】
- 封面照片视差滚动效果
- 点击"查看详情"：opacity 0→1 + translateY 20px→0 动画
- 浏览态内左右滑动切换照片
- 地图使用 Leaflet 或静态图片标记
```

---

## 🚀 模板 2：产品闪卡

```markdown
【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口）

【变量 - 请替换为你的内容】
- {{product_name: "产品名称"}} — 如：VibePop
- {{tagline: "一句话介绍"}} — 如：让代码变成好玩的社交内容
- {{logo_url: "Logo图片URL"}} — 产品图标
- {{features: [
    {name: "核心特性1", desc: "描述这个功能解决的问题"},
    {name: "核心特性2", desc: "描述这个功能带来的价值"},
    {name: "核心特性3", desc: "描述这个特性的使用场景"}
  ]}} — 特性标签数组
- {{demo_url: "演示链接"}} — 展示链接文本，提供 📋 复制按钮
- {{cta_text: "按钮文字"}} — 如：立即体验 / 了解更多

【页面结构】
1. 顶部：Logo（logo_url）+ 产品名（product_name）+ Tagline
2. 中部：特性标签云（features数组）
3. 底部：渐变 CTA 按钮（cta_text）

【交互】
- 特性标签 Hover：背景变粉色，放大 1.05x
- 点击标签：从下方滑入详情卡片（特性描述展开）
- CTA 按钮：脉冲呼吸动画（box-shadow 扩散）
- CTA 按钮：脉冲呼吸动画（box-shadow 扩散），点击后展开链接卡片展示 demo_url 文本 + 📋 复制按钮，不跳转

【视觉】
- 背景微妙动态渐变（CSS animation，15s循环）
- 每个特性标签使用不同彩色边框（紫/粉/青轮换）
```

---

## 👤 模板 3：个人主页

```markdown
【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口）

【变量 - 请替换为你的内容】
- {{avatar_url: "头像URL"}} — 个人头像
- {{name: "显示名称"}}
- {{handle: "用户名"}}
- {{bio: "个人简介"}}
- {{links: [
    {platform: "Twitter", url: "https://twitter.com/xxx"},
    {platform: "GitHub", url: "https://github.com/xxx"},
    {platform: "Blog", url: "https://xxx.com"}
  ]}} — 社交链接数组
- {{works: [
    {title: "作品标题1", cover: "封面URL1", url: "链接1"},
    {title: "作品标题2", cover: "封面URL2", url: "链接2"}
  ]}} — 作品展示数组

【页面结构】
1. 顶部居中：头像 + 名字 + handle + bio
2. 社交链接行：圆形图标按钮（links）
3. 作品网格：2列瀑布流（works）

【交互】
- 头像 Hover：旋转 360° + 粉色发光
- 社交链接：Hover 图标放大 1.2x，点击显示平台名 + 链接文本 + 📋 复制按钮，不跳转外部
- 作品卡片：Hover 显示"查看"遮罩层
- 点击作品：展开详情弹窗（大图+描述+作品链接文本+📋复制按钮）

【视觉】
- 头像使用渐变边框动画（旋转 conic-gradient）
- 作品卡片悬停上浮（translateY -4px + 阴影）
```

---

## 🎉 模板 4：活动邀请

```markdown
【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口）

【变量 - 请替换为你的内容】
- {{event_name: "活动名称"}} — 如：VibePop 产品发布会
- {{datetime: "2026-05-01T19:00:00"}} — ISO格式，用于倒计时
- {{location: "地点名称"}} — 如：上海市静安区
- {{address: "详细地址"}} — 如：南京西路1266号恒隆广场
- {{description: "活动描述"}} — 2-3句话介绍活动内容
- {{rsvp_url: "报名链接"}} — 活动报名地址，展示链接文本 + 📋 复制按钮，不跳转
- {{max_guests: 50}} — 人数上限（可选）

【页面结构】
1. 顶部：活动名称（大标题）+ 实时倒计时器
2. 中部：📅 日期时间 + 📍 地点（location + address）
3. 底部：描述文字 + 报名链接展示（rsvp_url 文本 + 📋 复制按钮）

【交互】
- 倒计时器：实时更新（JS setInterval），等宽字体显示
- 倒计时结束：显示"🔴 进行中"或"✓ 已结束"
- RSVP 区域：展示 rsvp_url 链接文本，附带 📋 复制按钮，点击复制链接到剪贴板，不跳转外部
- 人数显示：current_guests / max_guests（如 12/50）
- 地点：点击打开地图应用（geo: 协议导航）

【视觉】
- 倒计时数字粉色强调，使用等宽字体（Monaco / Courier）
- 报名链接区域：链接文本使用粉色等宽字体显示，右侧 📋 复制按钮，点击后显示"✓ 已复制"提示
- RSVP 区域脉冲动画吸引点击
- 日期左侧日历图标装饰
```

---

## 📋 模板 5：步骤教程

```markdown
【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口）

【变量 - 请替换为你的内容】
- {{title: "教程标题"}} — 如：3分钟上手 VibePop
- {{difficulty: "简单"}} — 简单 / 中等 / 困难
- {{duration: "15分钟"}} — 预计完成时长
- {{steps: [
    {
      title: "准备工作",
      desc: "说明需要提前准备的环境、材料或工具清单",
      image: "步骤配图URL（可选）"
    },
    {
      title: "第一步：基础操作",
      desc: "描述具体的操作步骤，可以包含需要注意的细节和常见问题",
      image: "步骤配图URL（可选）"
    },
    {
      title: "第二步：核心流程",
      desc: "继续描述接下来的关键步骤，保持每步一个核心动作",
      image: "步骤配图URL（可选）"
    },
    {
      title: "完成与验证",
      desc: "说明如何检查结果是否正确，以及遇到问题时的排查方向",
      image: "步骤配图URL（可选）"
    }
  ]}} — 步骤数组（可复制添加更多步骤）

【页面结构】
1. 顶部：标题 + 难度标签（彩色）+ 时长
2. 中部：步骤列表（垂直排列，默认折叠）
3. 底部：进度条 + "标记全部完成"按钮

【交互】
- 每个步骤：默认折叠，只显示序号 + 标题
- 点击步骤：展开详情（desc + 图片），其他步骤自动收起
- 步骤完成：点击左侧圆形复选框，打勾 + 变粉色 + 文字变淡
- 进度条：根据完成步骤实时更新宽度（百分比）
- 全部完成后：顶部显示"🎉 恭喜完成" + 撒花动画

【视觉】
- 未完成：灰色边框 + 空心圆
- 已完成：粉色边框 + 打勾实心圆 + 文字透明度 0.6
- 当前展开：背景高亮（#1a1a2e → #252540）
- 进度条：渐变填充，平滑过渡
```

---

## 📸 模板 6：照片故事

```markdown
【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口）

【变量 - 请替换为你的内容】
- {{title: "故事标题"}} — 如：京都春日
- {{photos: [
    {url: "照片1URL", desc: "第一张照片的文字描述", date: "3月26日"},
    {url: "照片2URL", desc: "第二张照片的文字描述", date: "3月27日"},
    {url: "照片3URL", desc: "第三张照片的文字描述", date: "3月28日"}
  ]}} — 照片数组（可复制添加更多）
- {{music_url: "背景音乐URL（可选）"}} — 自动循环播放

【页面结构】
1. 全屏照片（当前页，object-fit: cover）
2. 底部：照片描述文字（渐变遮罩确保可读性）
3. 顶部：细进度条（当前张数/总数）
4. 左右边缘：隐形点击热区（上一张/下一张）

【交互】
- 点击右侧 30%：下一张照片（CSS translateX slide 动画）
- 点击左侧 30%：上一张照片
- 点击中间 40%：切换描述显示/隐藏
- 照片切换：当前图 scale 1.02→1.0 微动效
- 最后一张：显示"↻ 重播"和"↗ 分享"按钮
- 背景音乐：自动播放，点击喇叭图标静音

【视觉】
- 照片填满屏幕，黑色背景过渡
- 描述文字底部渐变遮罩（透明→黑色 80%）
- 进度条顶部细线（粉色渐变）
- 切换时照片有轻微模糊过渡（filter blur）
```

---

## 🎨 模板 7：创意绘画

```markdown
【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口），**兼容 Web 和移动端双端**

【变量 - 请替换为你的内容】
- {{art_title: "作品标题"}} — 如：霓虹粒子
- {{canvas_size: "400,400"}} — 画布尺寸（宽,高），移动端建议不超过屏幕宽度
- {{mode: "interactive"}} — 模式：interactive（交互）/ auto（自动）/ static（静态）
- {{color_scheme: "neon"}} — 配色：neon（霓虹）/ pastel（ pastel）/ mono（单色）/ warm（暖色）
- {{subject: "粒子系统"}} — 绘画主题：粒子系统 / 几何图案 / 流动场 / 波浪 / 分形 / 自定义
- {{interaction: "触屏跟随"}} — 交互方式：触屏跟随 / 点击生成 / 滑动绘制 / 无交互
- {{description: "作品描述"}} — 1-2句话介绍这个作品想表达什么

【p5.js 绘画指引】
必须引入 p5.js CDN：
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>


【交互】
- 根据 interaction 变量设置交互方式（双端兼容）：
  - 触屏跟随：元素跟随 mouseX/mouseY（移动端自动映射为触摸位置）
  - 点击生成：mousePressed() + touchStarted() 双事件生成新元素
  - 滑动绘制：mouseDragged() + touchMoved() 双事件绘制轨迹
  - 无交互：纯自动动画


【视觉】
- 画布外围使用渐变发光边框（box-shadow 粉色脉冲动画）
- 画布 CSS 添加 `touch-action: none; user-select: none;` 防止移动端滚动和文字选中
- 画布背景色跟随 color_scheme：
  - neon → #0a0a0f（深色底+亮色元素）
  - pastel → #f5f0eb（浅色底+柔和色）
  - mono → #111111（黑白灰）
  - warm → #1a1410（暖棕底+橙红色）
- 粒子/线条使用半透明叠加（alpha 50-80），营造拖尾效果
- 使用 blendMode(ADD) 实现发光叠加（适合 neon 模式，Web端可用，移动端大部分浏览器支持）
```

---

## 🎮 模板 8：小游戏

```markdown
【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口），**兼容 Web 和移动端双端**

【变量 - 请替换为你的内容】
- {{game_title: "游戏标题"}} — 如：霓虹贪吃蛇
- {{dimension: "2D"}} — 维度：2D（p5.js）/ 3D（three.js）
- {{genre: "休闲"}} — 类型：休闲 / 益智 / 动作 / 竞速 / 射击 / 自定义
- {{gameplay: "玩法说明"}} — 如：点击屏幕控制小球跳跃，躲避障碍物
- {{score_type: "分数"}} — 计分方式：分数 / 时间 / 收集物数量 / 关卡进度
- {{difficulty: "简单"}} — 难度：简单 / 中等 / 困难
- {{description: "游戏描述"}} — 1-2句话介绍游戏核心体验

【技术栈选择】
- 2D 游戏 → 引入 p5.js：
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
- 3D 游戏 → 引入 three.js：
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>


【页面结构】
1. 顶部：游戏标题（game_title）+ 得分/关卡显示
2. 中部：游戏画布区域（铺满卡片内容区），CSS 设置 `touch-action: none` 防止页面滚动
3. 底部：控制按钮行（开始/暂停/重置）+ 玩法提示文字

【交互】
- 双端兼容控制方式：
  - 触屏：点击/滑动/长按（mousePressed + touchStarted 双事件）
  - 键盘：方向键/WASD/空格（桌面端）
  - 陀螺仪：deviceOrientation（可选，体感游戏）
- 游戏状态管理：
  - 开始前：显示 "▶ 开始游戏" 遮罩层
  - 游戏中：实时更新得分（score_type）
  - 结束：显示最终得分 + "↻ 再来一局" + "📋 分享成绩"（复制分数文本）
- 控制按钮（可见于双端）：
  - ▶ 开始 / ⏸ 暂停
  - ↻ 重置
  - 🔊 音效开关（可选）

【视觉】
- 游戏画布 CSS 添加 `touch-action: none; user-select: none;` 防止移动端滚动
- 游戏界面保持暗色沉浸风格，UI 元素使用粉色强调色
- 得分数字使用等宽字体（Monaco / Courier），实时跳动动画
- 游戏结束弹窗：半透明遮罩 + 居中卡片，显示成绩 + 再来一局按钮
- 3D 游戏推荐添加 subtle 雾效（fog）增加场景深度感


```

---

## 使用说明

1. **点击模板** → 提示词自动填入编辑器
2. **替换变量** → 把 `{{变量名: "示例值"}}` 改成你的内容，保留 `""`
3. **删除不需要的字段** → 如不需要地图，删除 coordinates 整行
4. **添加更多项** → 数组格式（如 steps/photos）可复制括号内块追加
5. **点击生成** → AI 输出单文件 HTML

---

# English Version

> Each template includes: VibePop design system + generic placeholder variables + structure/interaction/visual specs
> Click a template to auto-fill the editor, then replace `{{variables}}` with your content

---

## 🗺️ Template 1: Travel Location Card

```markdown
【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport)

【Variables - Replace with your content】
- {{place_name: "Place Name"}} — e.g. Fushimi Inari Shrine
- {{date: "Date"}} — e.g. March 26
- {{cover_image: "Cover Photo URL"}} — Hero image
- {{story: "Your Story"}} — 1-2 paragraphs of experience
- {{tips: "Practical Tips"}} — Optional: transport/tickets/timing
- {{coordinates: "Lat,Lng"}} — e.g. 34.9671,135.7727 (for map)
- {{photos: ["photo1URL","photo2URL"]}} — Photo grid for detail view

【Page Structure】
1. Full-screen cover photo (cover_image) with bottom gradient overlay
2. Bottom-left: place_name + date
3. Bottom-right: "View Details" button
4. Tap to expand detail view:
   - Top: photo grid (photos)
   - Middle: story text
   - Bottom: mini map (coordinates) + Tips

【Interactions】
- Parallax scrolling on cover photo
- Tap "View Details": opacity 0→1 + translateY 20px→0 animation
- Swipe left/right in detail view to browse photos
- Map: Leaflet or static image with marker
```

---

## 🚀 Template 2: Product Flash Card

```markdown
【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport)

【Variables - Replace with your content】
- {{product_name: "Product Name"}} — e.g. VibePop
- {{tagline: "One-liner"}} — e.g. Turn code into playable social content
- {{logo_url: "Logo URL"}} — Product icon
- {{features: [
    {name: "Key Feature 1", desc: "What problem this solves"},
    {name: "Key Feature 2", desc: "Value this brings"},
    {name: "Key Feature 3", desc: "When to use this"}
  ]}} — Feature tags array
- {{demo_url: "Demo Link"}} — Display link text with 📋 copy button
- {{cta_text: "Button Text"}} — e.g. Try Now / Learn More

【Page Structure】
1. Top: Logo (logo_url) + product_name + tagline
2. Middle: Feature tag cloud (features array)
3. Bottom: Gradient CTA button (cta_text)

【Interactions】
- Feature tag hover: background turns pink, scale 1.05x
- Tap tag: detail card slides up from bottom (expands description)
- CTA button: pulse breathing animation (box-shadow spread)
- Tap CTA: expands link card showing demo_url text + 📋 copy button, no redirect

【Visual】
- Subtle animated gradient background (CSS animation, 15s loop)
- Each feature tag uses different colored border (purple/pink/cyan rotation)
```

---

## 👤 Template 3: Personal Profile

```markdown
【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport)

【Variables - Replace with your content】
- {{avatar_url: "Avatar URL"}} — Profile photo
- {{name: "Display Name"}}
- {{handle: "Username"}}
- {{bio: "Bio"}}
- {{links: [
    {platform: "Twitter", url: "https://twitter.com/xxx"},
    {platform: "GitHub", url: "https://github.com/xxx"},
    {platform: "Blog", url: "https://xxx.com"}
  ]}} — Social links array
- {{works: [
    {title: "Work Title 1", cover: "coverURL1", url: "link1"},
    {title: "Work Title 2", cover: "coverURL2", url: "link2"}
  ]}} — Works/portfolio array

【Page Structure】
1. Top-center: Avatar + name + handle + bio
2. Social links row: circular icon buttons (links)
3. Works grid: 2-column masonry (works)

【Interactions】
- Avatar hover: rotate 360° + pink glow
- Social links: hover icon scales 1.2x, tap shows platform name + link text + 📋 copy button, no external redirect
- Work cards: hover shows "View" overlay
- Tap work: expands detail modal (large image + description + work link text + 📋 copy button)

【Visual】
- Avatar uses animated gradient border (rotating conic-gradient)
- Work cards lift on hover (translateY -4px + shadow)
```

---

## 🎉 Template 4: Event Invitation

```markdown
【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport)

【Variables - Replace with your content】
- {{event_name: "Event Name"}} — e.g. VibePop Launch Party
- {{datetime: "2026-05-01T19:00:00"}} — ISO format for countdown
- {{location: "Location Name"}} — e.g. Jing'an District, Shanghai
- {{address: "Full Address"}} — e.g. 1266 Nanjing West Rd
- {{description: "Description"}} — 2-3 sentences about the event
- {{rsvp_url: "Sign-up Link"}} — Event sign-up URL, display link text + 📋 copy button, no redirect
- {{max_guests: 50}} — Capacity limit (optional)
- {{current_guests: 12}} — Current sign-ups (optional)

【Page Structure】
1. Top: Event name (large title) + live countdown timer
2. Middle: 📅 Date/Time + 📍 Location (location + address)
3. Bottom: Description + sign-up link display (rsvp_url text + 📋 copy button)

【Interactions】
- Countdown: real-time updates (JS setInterval), monospace font
- Countdown ends: shows "🔴 Live" or "✓ Ended"
- Sign-up area: display rsvp_url link text with 📋 copy button, tap copies link to clipboard, no external redirect
- Guest count: current_guests / max_guests (e.g. 12/50)
- Location: display full address as selectable text (address), no geo redirect

【Visual】
- Countdown digits in pink accent, monospace (Monaco / Courier)
- Sign-up link area: link text in pink monospace font, 📋 copy button on the right, tap shows "✓ Copied" toast
- RSVP area pulse animation to draw attention
- Calendar icon decoration next to date
```

---

## 📋 Template 5: Step-by-Step Tutorial

```markdown
【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport)

【Variables - Replace with your content】
- {{title: "Tutorial Title"}} — e.g. VibePop Quick Start
- {{difficulty: "Easy"}} — Easy / Medium / Hard
- {{duration: "15 min"}} — Estimated completion time
- {{steps: [
    {
      title: "Preparation",
      desc: "List environment, materials, or tools needed before starting",
      image: "Step image URL (optional)"
    },
    {
      title: "Step 1: Basic Setup",
      desc: "Describe the specific action, including details to watch out for and common issues",
      image: "Step image URL (optional)"
    },
    {
      title: "Step 2: Core Flow",
      desc: "Continue with the next key step. Keep each step to one core action",
      image: "Step image URL (optional)"
    },
    {
      title: "Verify & Finish",
      desc: "Explain how to check if the result is correct, and troubleshooting tips",
      image: "Step image URL (optional)"
    }
  ]}} — Steps array (copy-paste to add more)

【Page Structure】
1. Top: Title + difficulty tag (colored) + duration
2. Middle: Step list (vertical, collapsed by default)
3. Bottom: Progress bar + "Mark All Done" button

【Interactions】
- Each step: collapsed by default, shows index + title only
- Tap step: expands details (desc + image), others auto-collapse
- Step complete: tap circle checkbox → checkmark + pink + text fades
- Progress bar: updates width in real-time based on completed steps
- All done: top shows "🎉 Congratulations" + confetti animation

【Visual】
- Incomplete: gray border + hollow circle
- Complete: pink border + checked solid circle + text opacity 0.6
- Currently expanded: highlighted background (#1a1a2e → #252540)
- Progress bar: gradient fill, smooth transition
```

---

## 📸 Template 6: Photo Story

```markdown
【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport)

【Variables - Replace with your content】
- {{title: "Story Title"}} — e.g. Spring in Kyoto
- {{photos: [
    {url: "photo1URL", desc: "Description for first photo", date: "Mar 26"},
    {url: "photo2URL", desc: "Description for second photo", date: "Mar 27"},
    {url: "photo3URL", desc: "Description for third photo", date: "Mar 28"}
  ]}} — Photo array (copy-paste to add more)
- {{music_url: "Background Music URL (optional)"}} — Auto-loop playback

【Page Structure】
1. Full-screen photo (current, object-fit: cover)
2. Bottom: photo description (gradient overlay for readability)
3. Top: thin progress bar (current / total)
4. Left/right edges: invisible tap zones (prev / next)

【Interactions】
- Tap right 30%: next photo (CSS translateX slide animation)
- Tap left 30%: previous photo
- Tap middle 40%: toggle description show/hide
- Photo transition: current image scale 1.02→1.0 micro-motion
- Last photo: shows "↻ Replay" and "↗ Share" buttons
- Background music: auto-plays, tap speaker icon to mute

【Visual】
- Photo fills screen, black background transition
- Description gradient overlay at bottom (transparent → black 80%)
- Progress bar: thin pink gradient line at top
- Transition: slight blur filter during photo change
```

---

## 🎨 Template 7: Creative Canvas

```markdown
【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport), **compatible with Web and mobile dual-end**

【Variables - Replace with your content】
- {{art_title: "Artwork Title"}} — e.g. Neon Particles
- {{canvas_size: "400,400"}} — Canvas dimensions (width,height), mobile should not exceed screen width
- {{mode: "interactive"}} — Mode: interactive / auto / static
- {{color_scheme: "neon"}} — Color scheme: neon / pastel / mono / warm
- {{subject: "Particle System"}} — Art subject: particles / geometric / flow / waves / fractal / custom
- {{interaction: "Touch Follow"}} — Interaction: touch follow / tap spawn / slide draw / none
- {{description: "Description"}} — 1-2 sentences about what this piece expresses

【p5.js Drawing Guide】
Must include p5.js CDN:
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>

【Interactions】
- Set interaction based on interaction variable (dual-end compatible):
  - Touch follow: elements track mouseX/mouseY (auto-mapped to touch on mobile)
  - Tap spawn: mousePressed() + touchStarted() dual events spawn new elements
  - Slide draw: mouseDragged() + touchMoved() dual events draw trail
  - No interaction: pure auto animation

【Visual】
- Canvas has glowing gradient border (box-shadow pink pulse animation)
- Canvas CSS adds `touch-action: none; user-select: none;` to prevent mobile scroll and text selection
- Canvas background follows color_scheme:
  - neon → #0a0a0f (dark + bright elements)
  - pastel → #f5f0eb (light + soft colors)
  - mono → #111111 (black/white/gray)
  - warm → #1a1410 (warm brown + orange-red)
- Particles/lines use semi-transparent overlay (alpha 50-80) for trail effect
- Use blendMode(ADD) for glow overlay (good for neon mode, works on Web, supported by most mobile browsers)
```

---

## 🎮 Template 8: Mini Game

```markdown
【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport), **compatible with Web and mobile dual-end**

【Variables - Replace with your content】
- {{game_title: "Game Title"}} — e.g. Neon Snake
- {{dimension: "2D"}} — Dimension: 2D (p5.js) / 3D (three.js)
- {{genre: "Casual"}} — Genre: casual / puzzle / action / racing / shooter / custom
- {{gameplay: "How to Play"}} — e.g. Tap screen to make the ball jump, avoid obstacles
- {{score_type: "Score"}} — Scoring: points / time / collectibles / level progress
- {{difficulty: "Easy"}} — Difficulty: easy / medium / hard
- {{description: "Game Description"}} — 1-2 sentences about core experience

【Tech Stack Selection】
- 2D game → include p5.js:
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
- 3D game → include three.js:
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

【Page Structure】
1. Top: Game title (game_title) + score/level display
2. Middle: Game canvas (fills card content area), CSS `touch-action: none` prevents page scroll
3. Bottom: Control buttons (Start / Pause / Reset) + gameplay hint text

【Interactions】
- Dual-end compatible controls:
  - Touch: tap / swipe / long-press (mousePressed + touchStarted dual events)
  - Keyboard: arrow keys / WASD / spacebar (desktop only)
  - Gyroscope: deviceOrientation (optional, motion-based games)
- Game state management:
  - Before start: show "▶ Start Game" overlay
  - Playing: real-time score update (score_type)
  - Game Over: show final score + "↻ Play Again" + "📋 Share Score" (copy score text)
- Control buttons (visible on both ends):
  - ▶ Start / ⏸ Pause
  - ↻ Reset
  - 🔊 Sound toggle (optional)

【Visual】
- Game canvas CSS adds `touch-action: none; user-select: none;` to prevent mobile scroll
- Keep dark immersive style, UI elements use pink accent color
- Score numbers use monospace font (Monaco / Courier), real-time bounce animation
- Game over modal: semi-transparent overlay + centered card, shows score + play again button
- 3D games: add subtle fog effect for scene depth
```

---

## How to Use

1. **Click a template** → Prompt auto-fills the editor
2. **Replace variables** → Change `{{variable: "example"}}` to your content, keep `""`
3. **Remove unused fields** → e.g. delete the coordinates line if no map needed
4. **Add more items** → For arrays (steps/photos), copy the block inside brackets to append
5. **Click Generate** → AI outputs a single-file HTML

---

*Document Version: v1.0*  
*Updated: 2026-04-21*

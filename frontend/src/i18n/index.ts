import { useSettingsStore } from '../stores/settingsStore';

export const translations = {
  zh: {
    // App 通用
    'app.tagline': 'AI 驱动的互动内容社区',
    'common.back': '返回',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.saving': '保存中...',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.loading': '加载中',
    'common.send': '发送',
    'common.copied': '已复制',
    'common.copyFailed': '复制失败',
    'common.anonymous': '匿名',
    'common.empty': '暂无数据',
    'common.follow': '+ 关注',
    'common.following': '已关注',

    // BottomNav
    'nav.browse': '发现',
    'nav.create': '创作',
    'nav.profile': '我的',

    // BrowsePage
    'browse.modeDiscover': '发现',
    'browse.modeImmersive': '沉浸',
    'browse.categories.all': '全部',
    'browse.sort.hot': 'Hot',
    'browse.sort.latest': 'Latest',
    'browse.categories.game': '游戏',
    'browse.categories.album': '图集',
    'browse.categories.tool': '工具',
    'browse.categories.art': '艺术',
    'browse.categories.guide': '攻略',
    'browse.categories.other': '其他',
    // 旧 key，保留向后兼容（老数据迁移前可能仍在用）
    'browse.categories.memory': '图集',
    'browse.categories.generator': '工具',
    'browse.empty.title': '暂无内容',
    'browse.empty.subtitle': '去创作第一个作品吧',

    // Immersive
    'immersive.empty.title': '暂无内容',
    'immersive.swipeHint': '↑↓ 滑动切换内容',

    // ProfilePage
    'profile.tabs.works': '作品',
    'profile.tabs.likes': '点赞',
    'profile.tabs.favorites': '收藏',
    'profile.stats.following': '关注',
    'profile.stats.followers': '粉丝',
    'profile.stats.works': '作品',
    'profile.editProfile': '编辑资料',
    'profile.notLoggedIn.title': '还没有登录',
    'profile.notLoggedIn.subtitle': '登录后可以创作内容、管理作品、与创作者互动',
    'profile.notLoggedIn.cta': '去登录',
    'profile.empty.title': '还没有作品',
    'profile.empty.subtitle': '用 AI 创作你的第一个互动内容',
    'profile.empty.cta': '开始创作',
    'profile.empty.likes': '还没有点赞的内容',
    'profile.empty.favorites': '还没有收藏的内容',
    'profile.defaultDisplayName': '用户',
    'profile.toast.updated': '资料已更新',

    // UserPage
    'user.header': '个人主页',
    'user.defaultDisplayName': '创作者',
    'user.defaultBio': '创造有趣的内容',
    'user.empty': '还没有内容',

    // 设置
    'settings.section': '设置',
    'settings.language': '语言',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.logout': '退出登录',
    'settings.logout.confirmTitle': '确认退出登录？',
    'settings.logout.confirmDesc': '退出后需重新登录才能创作和互动。',
    'settings.logout.confirm': '退出',
    'settings.logout.cancel': '取消',
    'settings.logout.toast': '已退出登录',

    // LoginPage
    'login.back': '返回',
    'login.title': '登录',
    'login.subtitle': 'VibeCoding for Fun',
    'login.google': '使用 Google 账号继续',
    'login.submitting': '登录中...',
    'login.autoRegister': '首次登录将自动创建账号',
    'login.errors.login': '登录失败，请重试',
    'login.errors.google': 'Google 授权失败',

    // OnboardingPage（新用户首次登录引导）
    'onboarding.header': '欢迎加入 VibePop',
    'onboarding.subtitle': '花一分钟告诉大家你是谁，之后还能在设置里修改显示名。',
    'onboarding.username.label': '用户名',
    'onboarding.username.hint': '3~20 位，仅限小写字母、数字、下划线，一旦设置不可修改',
    'onboarding.username.placeholder': '例如 lucky_panda',
    'onboarding.displayName.label': '显示名',
    'onboarding.displayName.hint': '1~20 个字符，可随时在个人主页修改',
    'onboarding.displayName.placeholder': '给自己起一个好听的名字',
    'onboarding.submit': '完成设置',
    'onboarding.submitting': '提交中...',
    'onboarding.error.usernameInvalid': '用户名格式不正确',
    'onboarding.error.usernameTaken': '该用户名已被占用',
    'onboarding.error.displayNameLength': '显示名长度需在 1~20 之间',
    'onboarding.error.unknown': '设置失败，请稍后重试',
    'onboarding.toast.success': '资料已设置',

    // CreatePage
    'create.title.prefix': '创',
    'create.title.suffix': '作',
    'create.subtitle': '描述你的想法，AI 帮你实现',
    'create.mode.builtin.title': '🤖 VibePop AI',
    'create.mode.builtin.subtitle': '使用平台内置 AI 快速生成',
    'create.mode.external.title': '🔗 外部 AI',
    'create.mode.external.subtitle': '使用 ChatGPT / Claude 等',
    'create.inputPlaceholder': '描述你想创造什么...\n例如：做一个弹球游戏\n例如：做一个毒舌点评生成器\n例如：做一个生日贺卡',
    'create.send': '⚡ 发送给 AI',
    'create.templates.inspiration': '✦ 灵感模板',
    'create.templates.hint': '点击填入提示词',
    'create.status.generating': 'AI 正在创造...',
    'create.status.generatingWith': 'AI 正在生成... ({count} 字符)',
    'create.status.waiting': '等待 AI 响应...',
    'create.status.generateFailed': '生成失败: ',
    'create.unknownError': '未知错误',
    'create.workspace.title': '工作台',
    'create.workspace.remixTitle': 'Remix 工作台',
    'create.workspace.publish': '发布 →',
    'create.workspace.basedOn': '基于「{title}」· @{username}',
    'create.chat.placeholder': '告诉 AI 你想怎么改...',
    'create.chat.expand': '展开 AI 修改',
    'create.chat.collapse': '收起',
    'create.hint.remix': '✦ 已导入原代码，你可以直接在编辑器中修改，也可以让 AI 帮你调整。',
    'create.hint.normal': '✦ 内容已生成！还想调整什么？可以说"改颜色"、"加音效"、"调难度"...',
    'create.remix.label': '↻ Remix',
    'feed.remix.confirmTitle': '开始 Remix',
    'feed.remix.confirmBody': 'Remix 可对此内容进行代码改编，改编不会影响原作品。',
    'feed.remix.confirmAction': '开始 Remix',
    'create.publish.header': '发布作品',
    'create.publish.title': '标题 *',
    'create.publish.titlePlaceholder': '给作品起个名字',
    'create.publish.desc': '描述',
    'create.publish.descPlaceholder': '介绍一下你的作品...',
    'create.publish.category': '分类 *',
    'create.publish.submit': '发布',
    'create.publish.publishing': '正在发布...',
    'create.publish.success': '发布成功！',
    'create.publish.failed': '发布失败: ',
    'create.defaultTitle': '我的作品',
    'create.remix.titleSuffix': '· Remix',
    'create.remix.descTemplate': '基于 @{username} 的 {title} 改编',

    // ExternalAIPanel
    'external.step1.label': '① 描述你想创造什么',
    'external.step1.placeholder': '例如：做一个猜数字小游戏，带音效',
    'external.step1.generate': '📋 生成提示词并复制',
    'external.step2.label': '② 复制以下提示词到外部 AI 工具',
    'external.step2.copy': '一键复制',
    'external.step2.support': '支持：ChatGPT · Claude · Gemini · DeepSeek 等',
    'external.step3.label': '③ 粘贴外部 AI 生成的代码',
    'external.step3.placeholder': '<!DOCTYPE html> ...\n<html> ... </html>',
    'external.step3.preview': '进入预览 →',
    'external.sizeWarn': ' · 超过 50KB，可能影响性能',
    'external.toast.emptyPrompt': '请先填写描述',
    'external.toast.promptCopied': '提示词已复制到剪贴板',
    'external.toast.copyManually': '已展开提示词，请手动复制',
    'external.toast.emptyCode': '请先粘贴 HTML 代码',

    // PreviewWorkspace
    'workspace.tabs.preview': '预览',
    'workspace.tabs.code': '代码',
    'workspace.tabs.assets': '资源',
    'workspace.apply': '应用修改',
    'workspace.reset': '重置',
    'workspace.status.oversize': '代码体积超出限制 · ',
    'workspace.status.tagErrors': '{count} 个标签错误 · ',
    'workspace.status.dirty': '有未保存修改',
    'workspace.status.synced': '已同步',

    // AssetManager
    'assets.dropzone': '拖拽文件到此处或点击上传',
    'assets.dropzone.limit': '图片 ≤5MB · 音频 ≤10MB · 视频 ≤50MB · 其他 ≤1MB',
    'assets.empty': '暂无资源 · 上传后在代码中使用 ./assets/文件名 引用',
    'assets.count': '共 {count} 项 · {size}',
    'assets.copyPath': '复制路径',
    'assets.copied': '已复制',
    'assets.delete': '删除',
    'assets.confirmDelete': '确认删除「{name}」？',
    'assets.overLimit': '「{name}」超过 {limit} 限制',

    // CodeEditor
    'editor.lineChar': '{lines} 行 · {chars} 字',
    'editor.oversize': ' · 体积超限',
    'editor.errors': ' · {count} 个错误',

    // ContentCard
    'card.edit': '编辑',
    'card.delete': '删除',

    // FeedItem (没有独立的字符串，但 '匿名' 用 common.anonymous)

    // CommentSheet
    'comment.title': '评论 ({count})',
    'comment.empty': '还没有评论，来说点什么吧',
    'comment.placeholder': '说点什么...',
    'comment.placeholder.notLoggedIn': '登录后即可评论',
    'comment.send': '发送',
    'comment.me': '我',

    // ShareSheet
    'share.title': '分享',
    'share.action.copyLink': '复制链接',
    'share.action.wechat': '微信',
    'share.action.weibo': '微博',
    'share.action.more': '更多',
    'share.nativeText': '来 VibePop 看看「{title}」',

    // FollowListModal
    'followList.empty': '暂无数据',
    'followList.follow': '+ 关注',

    // EditProfileModal
    'edit.title': '编辑资料',
    'edit.username.label': '用户名（唯一且不可修改）',
    'edit.avatar.label': '头像',
    'edit.displayName.label': '显示名（可修改、允许重复）',
    'edit.displayName.placeholder': '给自己起一个好听的名字',
    'edit.bio.label': '个人简介',
    'edit.bio.placeholder': '介绍一下你自己',
    'edit.error.nameLength': '显示名长度需在 1~20 之间',
    'edit.error.bioLength': '简介不能超过 140 字',
    'edit.error.saveFailed': '保存失败',
  },
  en: {
    // App generic
    'app.tagline': 'An AI-powered interactive content community',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.saving': 'Saving...',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading',
    'common.send': 'Send',
    'common.copied': 'Copied',
    'common.copyFailed': 'Copy failed',
    'common.anonymous': 'Anonymous',
    'common.empty': 'Nothing here',
    'common.follow': '+ Follow',
    'common.following': 'Following',

    // BottomNav
    'nav.browse': 'Browse',
    'nav.create': 'Create',
    'nav.profile': 'Profile',

    // BrowsePage
    'browse.modeDiscover': 'Discover',
    'browse.modeImmersive': 'Immersive',
    'browse.categories.all': 'All',
    'browse.sort.hot': 'Hot',
    'browse.sort.latest': 'Latest',
    'browse.categories.game': 'Games',
    'browse.categories.album': 'Albums',
    'browse.categories.tool': 'Tools',
    'browse.categories.art': 'Art',
    'browse.categories.guide': 'Guides',
    'browse.categories.other': 'Other',
    // Legacy keys, kept for backward compatibility with pre-migration data
    'browse.categories.memory': 'Albums',
    'browse.categories.generator': 'Tools',
    'browse.empty.title': 'No content yet',
    'browse.empty.subtitle': 'Be the first to create something',

    // Immersive
    'immersive.empty.title': 'No content yet',
    'immersive.swipeHint': '↑↓ Swipe to switch',

    // ProfilePage
    'profile.tabs.works': 'Works',
    'profile.tabs.likes': 'Likes',
    'profile.tabs.favorites': 'Saved',
    'profile.stats.following': 'Following',
    'profile.stats.followers': 'Followers',
    'profile.stats.works': 'Works',
    'profile.editProfile': 'Edit profile',
    'profile.notLoggedIn.title': 'Not signed in',
    'profile.notLoggedIn.subtitle': 'Sign in to create, manage your works and interact with creators',
    'profile.notLoggedIn.cta': 'Sign in',
    'profile.empty.title': 'No works yet',
    'profile.empty.subtitle': 'Create your first interactive content with AI',
    'profile.empty.cta': 'Start creating',
    'profile.empty.likes': 'No liked content yet',
    'profile.empty.favorites': 'No saved content yet',
    'profile.defaultDisplayName': 'User',
    'profile.toast.updated': 'Profile updated',

    // UserPage
    'user.header': 'Profile',
    'user.defaultDisplayName': 'Creator',
    'user.defaultBio': 'Making fun things',
    'user.empty': 'No content yet',

    // Settings
    'settings.section': 'Settings',
    'settings.language': 'Language',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.logout': 'Sign out',
    'settings.logout.confirmTitle': 'Sign out?',
    'settings.logout.confirmDesc': 'You will need to sign in again to create or interact.',
    'settings.logout.confirm': 'Sign out',
    'settings.logout.cancel': 'Cancel',
    'settings.logout.toast': 'Signed out',

    // LoginPage
    'login.back': 'Back',
    'login.title': 'Sign in to',
    'login.subtitle': 'VibeCoding for Fun',
    'login.google': 'Continue with Google',
    'login.submitting': 'Signing in...',
    'login.autoRegister': 'A new account is created automatically on first sign-in',
    'login.errors.login': 'Sign-in failed, please retry',
    'login.errors.google': 'Google authorization failed',

    // OnboardingPage (first-time user setup)
    'onboarding.header': 'Welcome to VibePop',
    'onboarding.subtitle': 'Tell us who you are — you can still update your display name later.',
    'onboarding.username.label': 'Username',
    'onboarding.username.hint': '3–20 chars, lowercase letters / digits / underscore. Cannot be changed later.',
    'onboarding.username.placeholder': 'e.g. lucky_panda',
    'onboarding.displayName.label': 'Display name',
    'onboarding.displayName.hint': '1–20 characters. You can change it anytime from your profile.',
    'onboarding.displayName.placeholder': 'Pick a nice name',
    'onboarding.submit': 'Finish setup',
    'onboarding.submitting': 'Submitting...',
    'onboarding.error.usernameInvalid': 'Invalid username format',
    'onboarding.error.usernameTaken': 'This username is taken',
    'onboarding.error.displayNameLength': 'Display name must be 1–20 characters',
    'onboarding.error.unknown': 'Failed to save. Please try again.',
    'onboarding.toast.success': 'Profile saved',

    // CreatePage
    'create.title.prefix': 'Cre',
    'create.title.suffix': 'ate',
    'create.subtitle': 'Describe your idea, let AI build it',
    'create.mode.builtin.title': '🤖 VibePop AI',
    'create.mode.builtin.subtitle': 'Generate quickly with built-in AI',
    'create.mode.external.title': '🔗 External AI',
    'create.mode.external.subtitle': 'Use ChatGPT / Claude / ...',
    'create.inputPlaceholder': 'Describe what you want to create...\ne.g. a pinball game\ne.g. a savage roast generator\ne.g. a birthday card',
    'create.send': '⚡ Send to AI',
    'create.templates.inspiration': '✦ Templates',
    'create.templates.hint': 'Tap to fill the prompt',
    'create.status.generating': 'AI is creating...',
    'create.status.generatingWith': 'AI is generating... ({count} chars)',
    'create.status.waiting': 'Waiting for AI...',
    'create.status.generateFailed': 'Generation failed: ',
    'create.unknownError': 'Unknown error',
    'create.workspace.title': 'Workspace',
    'create.workspace.remixTitle': 'Remix workspace',
    'create.workspace.publish': 'Publish →',
    'create.workspace.basedOn': 'Based on "{title}" · @{username}',
    'create.chat.placeholder': 'Tell AI what to change...',
    'create.chat.expand': 'Show AI chat',
    'create.chat.collapse': 'Hide',
    'create.hint.remix': '✦ Original code imported. Edit it directly, or ask AI to help.',
    'create.hint.normal': '✦ Done! Want to tweak it? Try "change colors", "add SFX", "adjust difficulty"...',
    'create.remix.label': '↻ Remix',
    'feed.remix.confirmTitle': 'Start Remix',
    'feed.remix.confirmBody': 'Remix lets you adapt this work\u2019s code. Your changes won\u2019t affect the original.',
    'feed.remix.confirmAction': 'Start Remix',
    'create.publish.header': 'Publish',
    'create.publish.title': 'Title *',
    'create.publish.titlePlaceholder': 'Give your work a name',
    'create.publish.desc': 'Description',
    'create.publish.descPlaceholder': 'Tell people about your work...',
    'create.publish.category': 'Category *',
    'create.publish.submit': 'Publish',
    'create.publish.publishing': 'Publishing...',
    'create.publish.success': 'Published!',
    'create.publish.failed': 'Publish failed: ',
    'create.defaultTitle': 'My work',
    'create.remix.titleSuffix': '· Remix',
    'create.remix.descTemplate': 'Remixed from {title} by @{username}',

    // ExternalAIPanel
    'external.step1.label': '① Describe what you want to create',
    'external.step1.placeholder': 'e.g. a guess-the-number game with sound effects',
    'external.step1.generate': '📋 Generate prompt & copy',
    'external.step2.label': '② Copy the prompt below into an external AI tool',
    'external.step2.copy': 'Copy all',
    'external.step2.support': 'Works with: ChatGPT · Claude · Gemini · DeepSeek …',
    'external.step3.label': '③ Paste the code returned by the external AI',
    'external.step3.placeholder': '<!DOCTYPE html> ...\n<html> ... </html>',
    'external.step3.preview': 'Preview →',
    'external.sizeWarn': ' · over 50KB, may affect performance',
    'external.toast.emptyPrompt': 'Please fill in a description first',
    'external.toast.promptCopied': 'Prompt copied to clipboard',
    'external.toast.copyManually': 'Prompt expanded — please copy manually',
    'external.toast.emptyCode': 'Please paste HTML code first',

    // PreviewWorkspace
    'workspace.tabs.preview': 'Preview',
    'workspace.tabs.code': 'Code',
    'workspace.tabs.assets': 'Assets',
    'workspace.apply': 'Apply',
    'workspace.reset': 'Reset',
    'workspace.status.oversize': 'Code too large · ',
    'workspace.status.tagErrors': '{count} tag error(s) · ',
    'workspace.status.dirty': 'Unsaved changes',
    'workspace.status.synced': 'Synced',

    // AssetManager
    'assets.dropzone': 'Drop files here or click to upload',
    'assets.dropzone.limit': 'Images ≤5MB · Audio ≤10MB · Video ≤50MB · Other ≤1MB',
    'assets.empty': 'No assets · after uploading, reference them in code as ./assets/filename',
    'assets.count': '{count} items · {size}',
    'assets.copyPath': 'Copy path',
    'assets.copied': 'Copied',
    'assets.delete': 'Delete',
    'assets.confirmDelete': 'Delete "{name}"?',
    'assets.overLimit': '"{name}" exceeds the {limit} limit',

    // CodeEditor
    'editor.lineChar': '{lines} lines · {chars} chars',
    'editor.oversize': ' · over limit',
    'editor.errors': ' · {count} error(s)',

    // ContentCard
    'card.edit': 'Edit',
    'card.delete': 'Delete',

    // CommentSheet
    'comment.title': 'Comments ({count})',
    'comment.empty': 'No comments yet, say something',
    'comment.placeholder': 'Say something...',
    'comment.placeholder.notLoggedIn': 'Sign in to comment',
    'comment.send': 'Send',
    'comment.me': 'Me',

    // ShareSheet
    'share.title': 'Share',
    'share.action.copyLink': 'Copy link',
    'share.action.wechat': 'WeChat',
    'share.action.weibo': 'Weibo',
    'share.action.more': 'More',
    'share.nativeText': 'Check out "{title}" on VibePop',

    // FollowListModal
    'followList.empty': 'Nothing here',
    'followList.follow': '+ Follow',

    // EditProfileModal
    'edit.title': 'Edit profile',
    'edit.username.label': 'Username (unique, cannot change)',
    'edit.avatar.label': 'Avatar',
    'edit.displayName.label': 'Display name (editable, can repeat)',
    'edit.displayName.placeholder': 'Pick a nice name for yourself',
    'edit.bio.label': 'Bio',
    'edit.bio.placeholder': 'Tell people about yourself',
    'edit.error.nameLength': 'Display name must be 1–20 chars',
    'edit.error.bioLength': 'Bio cannot exceed 140 chars',
    'edit.error.saveFailed': 'Save failed',
  },
} as const;

export type TranslationKey = keyof typeof translations.zh;

/**
 * 简易模板替换：`{key}` -> values[key]
 */
function format(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (values[k] !== undefined ? String(values[k]) : `{${k}}`));
}

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const toggleLanguage = useSettingsStore((s) => s.toggleLanguage);

  const t = (key: TranslationKey, values?: Record<string, string | number>): string => {
    const dict = translations[language] ?? translations.zh;
    const template = (dict[key] ?? translations.zh[key] ?? key) as string;
    return format(template, values);
  };

  return { t, language, setLanguage, toggleLanguage };
}

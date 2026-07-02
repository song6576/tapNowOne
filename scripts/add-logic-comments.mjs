/**
 * 为尚未包含文件头注释的 .ts/.tsx 批量追加模块说明（幂等：已有则跳过）。
 * 运行：node scripts/add-logic-comments.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '../src')

/** 路径 → 模块说明（中文） */
const HEADERS = {
  'store/authStore.ts': '/** 认证状态：登录/注册/Google 登录、token 校验、登出 */\n',
  'store/langStore.ts': '/** 全局语言：localStorage 持久化 + document.lang 同步 */\n',
  'store/toastStore.ts': '/** 全局 Toast 队列：showToast 自动定时 dismiss */\n',
  'store/workspaceStore.ts': '/** 工作空间：文件夹/项目 CRUD，localStorage 持久化（tapflow_workspace） */\n',
  'store/canvasStore.ts': '/** 画布核心状态：ReactFlow 节点/边、持久化、单节点生成、工作流、分镜、导出 */\n',
  'utils/auth.ts': '/** 认证 localStorage：token、user 读写与 Authorization 头 */\n',
  'utils/storage.ts': '/** 画布项目 localStorage：加载/保存/导入/导出 JSON */\n',
  'utils/lang.ts': '/** 语言选项与 localStorage 读取、html lang 属性映射 */\n',
  'utils/smsCooldown.ts': '/** 短信验证码发送冷却：60s 内同号码不可重复发送 */\n',
  'utils/compose.ts': '/** 视频合成：按工作流顺序收集 image/video 片段与音频轨 */\n',
  'hooks/useSmsCooldown.ts': '/** 短信冷却 React Hook：剩余秒数、canSend、triggerCooldown */\n',
  'pages/HomePage.tsx': '/** 首页：Hero 输入框 + 最近项目 + 精选轮播 + 探索 TapTV（mock 并行加载） */\n',
  'pages/ProjectsPage.tsx': '/** 工作空间页：文件夹导航、搜索/筛选/排序、列表与网格视图 */\n',
  'pages/CanvasPage.tsx': '/** 画布页：按路由/location.state 加载或新建项目，空画布快捷操作 */\n',
  'pages/LoginPage.tsx': '/** 登录页：Google / 邮箱 / 手机验证码多步流程，需勾选协议 */\n',
  'pages/TapTVPage.tsx': '/** TapTV 列表：排序 Tab、分类 Pills、搜索、发布弹窗 */\n',
  'pages/TapTVDetailPage.tsx': '/** TapTV 详情：展示作品信息，Fork 到画布 */\n',
  'components/home/FeaturedCarousel.tsx': '/** 首页精选轮播：横向 snap 滚动，中间卡片放大，红条指示当前项 */\n',
  'components/home/HeroPrompt.tsx': '/** 首页 Hero：输入 prompt + 选模型，创建项目并带 initialPrompt 跳转画布 */\n',
  'components/home/ProjectRow.tsx': '/** 首页最近项目：新建 + 最多 3 个项目卡片，链接到工作空间 */\n',
  'components/home/TapTVExploreSection.tsx': '/** 首页探索 TapTV 区块：4 列卡片网格 + 查看全部 */\n',
  'components/home/FeaturedCarouselSkeleton.tsx': '/** 精选轮播加载骨架屏 */\n',
  'components/home/ProjectRowSkeleton.tsx': '/** 最近项目行加载骨架屏 */\n',
  'components/home/HomeTopNav.tsx': '/** 主应用顶栏：Logo、导航、用户菜单 */\n',
  'components/home/UserMenuDropdown.tsx': '/** 用户头像下拉：设置、语言、登出 */\n',
  'components/home/UserMenuLanguageItem.tsx': '/** 用户菜单内语言切换子项 */\n',
  'components/ui/HoverDropdown.tsx': '/** 通用下拉：hover 或 click 模式，支持 ESC / 外部点击关闭 */\n',
  'components/ui/ModelDropdown.tsx': '/** AI 模型选择：Auto 开关、订阅/标准/即将上线分组 */\n',
  'components/ui/Modal.tsx': '/** 通用模态框：遮罩、标题、关闭 */\n',
  'components/ui/Toast.tsx': '/** Toast 容器：订阅 toastStore 渲染队列 */\n',
  'components/ui/SearchInput.tsx': '/** 带图标的搜索输入框 */\n',
  'components/ui/TabBar.tsx': '/** 水平 Tab 切换条 */\n',
  'components/ui/FilterPills.tsx': '/** 横向 Pill 筛选（TapTV 分类等） */\n',
  'components/ui/LanguageDropdown.tsx': '/** 登录页语言下拉 */\n',
  'components/ui/Skeleton.tsx': '/** 通用骨架块 */\n',
  'components/workspace/WorkspaceFilterDropdown.tsx': '/** 工作空间筛选：类型（全部/文件夹/项目）+ 排序 */\n',
  'components/workspace/WorkspaceListView.tsx': '/** 工作空间列表视图：文件夹/项目行 */\n',
  'components/taptv/TapTVCard.tsx': '/** TapTV 卡片：封面、标题、作者、点赞 */\n',
  'components/taptv/PublishModal.tsx': '/** 发布到 TapTV 表单弹窗（当前为 Mock 提交 + Toast） */\n',
  'components/shell/CanvasTopBar.tsx': '/** 画布顶栏：项目名、菜单、保存、新建 */\n',
  'components/shell/CanvasToolbar.tsx': '/** 画布左侧浮动工具栏：添加各类型节点 */\n',
  'components/shell/CanvasContextMenu.tsx': '/** 画布右键菜单：在点击位置添加节点 */\n',
  'components/shell/AppSidebar.tsx': '/** 旧版侧边栏（部分页面可能未使用） */\n',
  'components/shell/TaskBar.tsx': '/** 画布底部任务条：生成任务进度 */\n',
  'components/shell/SettingsDrawer.tsx': '/** 设置抽屉 */\n',
  'components/shell/TopBar.tsx': '/** 旧版顶栏 */\n',
  'components/canvas/CanvasBottomBar.tsx': '/** 空画布底部：缩放控制 */\n',
  'components/canvas/CanvasQuickActions.tsx': '/** 空画布中心快捷操作：文生视频、图生视频等 */\n',
  'components/auth/GoogleSignInButton.tsx': '/** Google 登录：透明 overlay 覆盖官方按钮样式 */\n',
  'components/auth/TapNowLogo.tsx': '/** TapNow Logo 组件 */\n',
  'components/FlowCanvas.tsx': '/** ReactFlow 画布：节点交互、viewport 同步、Delete 删节点 */\n',
  'components/AgentChat.tsx': '/** Agent 对话面板：普通聊天、分镜指令、Run Workflow */\n',
  'components/PropertyPanel.tsx': '/** 节点属性面板：prompt/模型编辑、单节点生成 */\n',
  'components/RightPanel.tsx': '/** 右侧面板：Inspector / Agent 双 Tab */\n',
  'components/Header.tsx': '/** 旧版画布 Header：导入导出、云端保存 */\n',
  'components/Toolbar.tsx': '/** 旧版工具栏 + demo 工作流 */\n',
  'components/nodes/BaseNode.tsx': '/** 节点通用外壳：Handle、生成状态遮罩 */\n',
  'components/nodes/TextNode.tsx': '/** 文本/脚本节点 */\n',
  'components/nodes/ImageNode.tsx': '/** 图片生成节点 */\n',
  'components/nodes/VideoNode.tsx': '/** 视频生成节点 */\n',
  'components/nodes/AudioNode.tsx': '/** 音频生成节点 */\n',
  'components/nodes/GroupNode.tsx': '/** 分组容器节点 */\n',
  'components/nodes/index.ts': '/** ReactFlow nodeTypes 注册表 */\n',
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, acc)
    else if (/\.(ts|tsx)$/.test(name)) acc.push(p)
  }
  return acc
}

let added = 0
let skipped = 0

for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).replace(/\\/g, '/')
  const header = HEADERS[rel]
  if (!header) continue

  let content = fs.readFileSync(file, 'utf8')
  if (content.startsWith('/**') || content.startsWith('/*')) {
    skipped++
    continue
  }

  fs.writeFileSync(file, header + content)
  added++
  console.log('+', rel)
}

console.log(`\nDone: ${added} added, ${skipped} already had header`)

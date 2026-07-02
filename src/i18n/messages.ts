import type { AppLang } from '../utils/lang'

export type Messages = {
  login: {
    title: string
    subtitle: string
    google: string
    phone: string
    emailBtn: string
    or: string
    email: string
    continue: string
    sendCode: string
    resendCode: string
    codePlaceholder: string
    codeSent: string
    password: string
    name: string
    back: string
    switchLogin: string
    switchRegister: string
    terms: string
    termsLink: string
    community: string
    privacy: string
    phonePlaceholder: string
    comingSoon: string
    googleFailed: string
    agreeTerms: string
    loginSuccess: string
    registerSuccess: string
    authFailed: string
  }
  nav: {
    home: string
    workspace: string
    taptv: string
    arena: string
    pricing: string
    arenaSoon: string
    downloadClient: string
    notifications: string
  }
  home: {
    heroTitle: string
    heroPlaceholder: string
    newProject: string
    allProjects: string
    featured: string
    editedAt: string
    exploreTapTV: string
    viewAll: string
  }
  workspace: {
    personal: string
    team: string
    search: string
    showAll: string
    newProject: string
    empty: string
  }
  taptv: {
    sortFeatured: string
    sortFollowing: string
    sortHot: string
    sortLatest: string
    publish: string
    categories: {
      all: string
      animation: string
      canvas: string
      ad: string
      anime: string
      short: string
      mv: string
      creative: string
      tutorial: string
      other: string
    }
  }
  publish: {
    title: string
    subtitle: string
    uploadWork: string
    uploadCover: string
    uploadHint: string
    workName: string
    workNamePlaceholder: string
    workDesc: string
    workDescPlaceholder: string
    publicCanvas: string
    selectCanvas: string
    uploadSubtitle: string
    subtitleHint: string
    cancel: string
    submit: string
    success: string
  }
  canvas: {
    untitled: string
    lastModified: string
    justNow: string
    community: string
    share: string
    aiHint: string
    aiSubHint: string
    textToVideo: string
    imageToVideo: string
    smartVideo: string
    audioToVideo: string
    digitalHuman: string
    promoBanner: string
  }
  userMenu: {
    createTeam: string
    profile: string
    earnTapies: string
    account: string
    partners: string
    help: string
    logout: string
  }
}

const zh: Messages = {
  login: {
    title: '登录或注册',
    subtitle: '让创意成真',
    google: '使用 Google 继续',
    phone: '使用手机号继续',
    emailBtn: '使用邮箱继续',
    or: '或',
    email: '电子邮件地址',
    continue: '继续',
    sendCode: '发送验证码',
    resendCode: '重新发送',
    codePlaceholder: '验证码',
    codeSent: '验证码已发送',
    password: '密码',
    name: '昵称',
    back: '返回',
    switchLogin: '已有账号？登录',
    switchRegister: '没有账号？注册',
    terms: '注册即表示您同意我们的',
    termsLink: '服务条款',
    community: '社区准则',
    privacy: '隐私政策',
    phonePlaceholder: '手机号码',
    comingSoon: 'Google 登录即将上线',
    googleFailed: 'Google 登录失败',
    agreeTerms: '请先同意服务条款',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    authFailed: '操作失败',
  },
  nav: {
    home: '主页',
    workspace: '工作空间',
    taptv: 'TapTV',
    arena: '竞技场',
    pricing: '价格方案',
    arenaSoon: '即将上线',
    downloadClient: '下载客户端',
    notifications: '通知',
  },
  home: {
    heroTitle: '今天要做点什么？',
    heroPlaceholder: '体验 Brains',
    newProject: '新建项目',
    allProjects: '所有项目',
    featured: '精选推荐',
    editedAt: '编辑于',
    exploreTapTV: '探索 TapTV',
    viewAll: '查看全部',
  },
  workspace: {
    personal: '个人',
    team: '团队项目',
    search: '搜索',
    showAll: '显示全部',
    newProject: '新增项目',
    empty: '暂无匹配项目',
  },
  taptv: {
    sortFeatured: '编辑精选',
    sortFollowing: '关注',
    sortHot: '热门推荐',
    sortLatest: '最新发布',
    publish: '发布作品',
    categories: {
      all: '全部',
      animation: '动画',
      canvas: '精选幕布',
      ad: '电视广告',
      anime: '动画',
      short: '叙事短片',
      mv: 'MV',
      creative: '创意',
      tutorial: '教程',
      other: '其他',
    },
  },
  publish: {
    title: '发布作品到 TapTV',
    subtitle: '发布到 TapTV 后，可参与平台活动与全球创作者竞技',
    uploadWork: '上传作品',
    uploadCover: '上传封面',
    uploadHint: '点击或拖拽上传',
    workName: '作品名称',
    workNamePlaceholder: '请输入作品名称',
    workDesc: '作品描述',
    workDescPlaceholder: '请输入作品描述',
    publicCanvas: '公开画布',
    selectCanvas: '选择画布',
    uploadSubtitle: '上传字幕',
    subtitleHint: '（仅支持 .srt，最大 2MB）',
    cancel: '取消',
    submit: '发布并投稿',
    success: '作品已提交审核',
  },
  canvas: {
    untitled: 'Untitled',
    lastModified: '上次修改于',
    justNow: '刚刚',
    community: '社区',
    share: '分享',
    aiHint: '直接自由生成，或查看模板',
    aiSubHint: '索尔',
    textToVideo: '文字生成视频',
    imageToVideo: '图片生成视频',
    smartVideo: '智能视频生成',
    audioToVideo: '音频生成视频',
    digitalHuman: '数字人',
    promoBanner: '体验 Seedance 2.0 Mini 继续这个项目',
  },
  userMenu: {
    createTeam: '创建团队',
    profile: '个人主页',
    earnTapies: '赚取 Tapies',
    account: '账户管理',
    partners: '合作中心',
    help: '帮助中心',
    logout: '登出账号',
  },
}

const en: Messages = {
  login: {
    title: 'Log in or sign up',
    subtitle: 'Make creativity come true',
    google: 'Continue with Google',
    phone: 'Continue with phone',
    emailBtn: 'Continue with email',
    or: 'or',
    email: 'Email address',
    continue: 'Continue',
    sendCode: 'Send verification code',
    resendCode: 'Resend',
    codePlaceholder: 'Verification code',
    codeSent: 'Verification code sent',
    password: 'Password',
    name: 'Display name',
    back: 'Back',
    switchLogin: 'Already have an account? Log in',
    switchRegister: "Don't have an account? Sign up",
    terms: 'By signing up, you agree to our',
    termsLink: 'Terms of Service',
    community: 'Community Guidelines',
    privacy: 'Privacy Policy',
    phonePlaceholder: 'Phone number',
    comingSoon: 'Google sign-in coming soon',
    googleFailed: 'Google sign-in failed',
    agreeTerms: 'Please agree to the terms first',
    loginSuccess: 'Signed in successfully',
    registerSuccess: 'Account created successfully',
    authFailed: 'Something went wrong',
  },
  nav: {
    home: 'Home',
    workspace: 'Workspace',
    taptv: 'TapTV',
    arena: 'Arena',
    pricing: 'Pricing',
    arenaSoon: 'Coming soon',
    downloadClient: 'Download app',
    notifications: 'Notifications',
  },
  home: {
    heroTitle: 'What do you want to do today?',
    heroPlaceholder: 'Experience Brains',
    newProject: 'New project',
    allProjects: 'All projects',
    featured: 'Featured',
    editedAt: 'Edited',
    exploreTapTV: 'Explore TapTV',
    viewAll: 'View all',
  },
  workspace: {
    personal: 'Personal',
    team: 'Team projects',
    search: 'Search',
    showAll: 'Show all',
    newProject: 'New project',
    empty: 'No matching projects',
  },
  taptv: {
    sortFeatured: 'Editor\'s pick',
    sortFollowing: 'Following',
    sortHot: 'Trending',
    sortLatest: 'Latest',
    publish: 'Publish',
    categories: {
      all: 'All',
      animation: 'Animation',
      canvas: 'Canvas',
      ad: 'TV Ads',
      anime: 'Anime',
      short: 'Short films',
      mv: 'MV',
      creative: 'Creative',
      tutorial: 'Tutorials',
      other: 'Other',
    },
  },
  publish: {
    title: 'Publish to TapTV',
    subtitle: 'Publish to TapTV to join activities and global creator competitions',
    uploadWork: 'Upload work',
    uploadCover: 'Upload cover',
    uploadHint: 'Click or drag to upload',
    workName: 'Work title',
    workNamePlaceholder: 'Enter work title',
    workDesc: 'Description',
    workDescPlaceholder: 'Enter description',
    publicCanvas: 'Public canvas',
    selectCanvas: 'Select canvas',
    uploadSubtitle: 'Upload subtitles',
    subtitleHint: '(.srt only, max 2MB)',
    cancel: 'Cancel',
    submit: 'Publish & submit',
    success: 'Work submitted for review',
  },
  canvas: {
    untitled: 'Untitled',
    lastModified: 'Last modified',
    justNow: 'just now',
    community: 'Community',
    share: 'Share',
    aiHint: 'Generate freely, or browse templates',
    aiSubHint: 'Thor',
    textToVideo: 'Text to video',
    imageToVideo: 'Image to video',
    smartVideo: 'Smart video',
    audioToVideo: 'Audio to video',
    digitalHuman: 'Digital human',
    promoBanner: 'Try Seedance 2.0 Mini to continue this project',
  },
  userMenu: {
    createTeam: 'Create team',
    profile: 'Profile',
    earnTapies: 'Earn Tapies',
    account: 'Account',
    partners: 'Partners',
    help: 'Help center',
    logout: 'Log out',
  },
}

/** ko / fr 暂用英文文案，后续可补全翻译 */
export const messages: Record<AppLang, Messages> = {
  zh,
  en,
  ko: en,
  fr: en,
}

export function getMessages(lang: AppLang): Messages {
  return messages[lang] ?? messages.zh
}

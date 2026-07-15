/**
 * 全站 i18n 文案包（en / zh / ko / fr）。
 * ko、fr 暂 fallback 到英文，见 getMessages 实现。
 */
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
    model: {
      auto: string
      subscribe: string
      comingSoon: string
      howToChoose: string
      categoryText: string
      categoryImage: string
      categoryVideo: string
      categoryAudio: string
      tierHigh: string
      tierMedium: string
      premiumHint: string
    }
  }
  workspace: {
    personal: string
    team: string
    search: string
    showAll: string
    newProject: string
    newFolder: string
    folderNamePlaceholder: string
    empty: string
    colPreview: string
    colName: string
    colType: string
    colContent: string
    colCreated: string
    colUpdated: string
    typeFolder: string
    typeProject: string
    projectCountUnit: string
    projectMenu: {
      open: string
      rename: string
      select: string
      moveTo: string
      shareLink: string
      moveToTeam: string
      delete: string
      comingSoon: string
      shareCopied: string
      renameSuccess: string
      deleteSuccess: string
      moveToTeamSuccess: string
      moveToFolderSuccess: string
      pickTeamTitle: string
      pickTeamEmpty: string
      deleteTitle: string
      deleteMessage: string
      renamePlaceholder: string
      confirm: string
      cancel: string
    }
    folderMenu: {
      open: string
      rename: string
      delete: string
      renameSuccess: string
      deleteSuccess: string
      deleteTitle: string
      deleteMessage: string
      renamePlaceholder: string
      confirm: string
      cancel: string
      error: string
    }
    filter: {
      filterSection: string
      sortSection: string
      orderSection: string
      showAll: string
      foldersOnly: string
      projectsOnly: string
      sortUpdated: string
      sortCreated: string
      newestFirst: string
      oldestFirst: string
    }
    selection: {
      selectedCount: string
      addToFolder: string
      collaborate: string
      deleteSelected: string
      deleteTitle: string
      deleteMessage: string
      moveSuccess: string
      deleteSuccess: string
      pickFolder: string
      rootFolder: string
      cancel: string
    }
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
    detail: {
      loading: string
      follow: string
      viewWorkflow: string
      browseAll: string
      back: string
    }
    workflow: {
      readonlyHint: string
      cloneProject: string
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
    changeCanvas: string
    uploadSubtitle: string
    subtitleHint: string
    subtitleUploaded: string
    cancel: string
    submit: string
    submitting: string
    success: string
    canvasPicker: {
      title: string
      updatedAt: string
    }
    errors: {
      titleRequired: string
      videoRequired: string
      canvasRequired: string
      submitFailed: string
    }
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
    mixVideo: string
    lyrics: string
    promoBanner: string
    backToWorkspace: string
    scenes: string
    projectSection: string
    rename: string
    newProject: string
    delete: string
    tooltips: {
      layers: string
      grid: string
      fitView: string
      zoom: string
      minimapShow: string
      minimapHide: string
      addNode: string
      search: string
      projects: string
      favorites: string
      messages: string
      collaborators: string
      history: string
      profile: string
      help: string
    }
    nodeMenu: {
      addNode: string
      auxiliary: string
      resources: string
      text: string
      textDesc: string
      image: string
      video: string
      audio: string
      world3d: string
      playlist: string
      upload: string
      beta: string
      comingSoon: string
    }
    nodeEditor: {
      placeholder: string
      textPlaceholder: string
      waitingImage: string
      thinking: string
      magic: string
      add: string
      swap: string
      generate: string
    }
    agentPanel: {
      title: string
      settings: string
      close: string
      welcome: string
      thinking: string
      inputPlaceholder: string
      autoGenerate: string
      send: string
      resize: string
      newFeature: string
      minimize: string
      history: string
      historyEmpty: string
      historyNew: string
      historyLoading: string
      openPanel: string
      suggestions: string[]
    }
  }
  userMenu: {
    createTeam: string
    profile: string
    earnTapies: string
    account: string
    partners: string
    help: string
    logout: string
    teamSuffix: string
    freeBadge: string
    unlimitedQuota: string
  }
  createTeamModal: {
    title: string
    subtitle: string
    noticeTitle: string
    noticeBody: string
    teamName: string
    teamNamePlaceholder: string
    cancel: string
    confirm: string
    success: string
  }
  profile: {
    changeBanner: string
    uploadBanner: string
    uploadAvatar: string
    cycleBannerGradient: string
    resetBannerGradient: string
    following: string
    followers: string
    favorites: string
    joinedAt: string
    share: string
    tabPortfolio: string
    tabSaved: string
    savedLocked: string
    savedEmpty: string
    featuredWorks: string
    featuredEmpty: string
    addFeatured: string
    tabWorks: string
    tabSeries: string
    filterAll: string
    worksEmpty: string
  }
  account: {
    personalProfile: string
    username: string
    bio: string
    social: string
    socialPlaceholder: string
    country: string
    city: string
    countryPlaceholder: string
    cityPlaceholder: string
    profession: string
    professionPlaceholder: string
    showJoinDate: string
    email: string
    comingSoon: string
    save: string
    saveSuccess: string
    sections: {
      subscription: string
      benefits: string
      general: string
      support: string
    }
    nav: {
      subscription: string
      modelMarket: string
      recharge: string
      teamBenefits: string
      rewards: string
      billing: string
      usage: string
      personal: string
      team: string
      tutorials: string
      agentTutorials: string
      logout: string
    }
    version: string
    logoutConfirm: {
      title: string
      message: string
      confirm: string
      cancel: string
    }
  }
  helpMenu: {
    contact: string
    tutorials: string
    shortcuts: string
    feedback: string
  }
  accountViews: {
    subscription: {
      title: string
      subtitle: string
      currency: string
      subscribe: string
      viewBenefits: string
      cycles: { monthly: string; yearly: string; enterprise: string }
      plans: { id: string; name: string; price: string; original: string; note: string; badge?: string; highlight?: boolean }[]
    }
    modelMarket: {
      title: string
      subtitle: string
      buyNow: string
      cards: { id: string; model: string; tier: string; price: string; tapies: string; bg: string }[]
    }
    recharge: {
      title: string
      freeBadge: string
      balanceLabel: string
      getTapies: string
      rate: string
      payAmount: string
      submit: string
    }
    teamBenefits: {
      balanceTitle: string
      balanceHint: string
      recharge: string
      freePlan: string
      upgradeHint: string
      upgrade: string
      yourTeam: string
      teamId: string
      copyTeamId: string
      quotaTitle: string
      quotaEmpty: string
    }
    rewards: {
      title: string
      inputLabel: string
      inputPlaceholder: string
      redeem: string
      historyTitle: string
      columns: string[]
    }
    billing: {
      tabBills: string
      tabTransactions: string
      feedback: string
      billsTitle: string
      issueInvoice: string
      billColumns: string[]
      billsEmpty: string
      billsEmptySub: string
      txColumns: string[]
      completed: string
    }
    usage: {
      title: string
      subtitle: string
      totalUsage: string
      agentUsage: string
      statTotal: string
      statPeak: string
      statWeekly: string
      statActive: string
      statStreak: string
      activityTitle: string
      periods: { daily: string; weekly: string; cumulative: string }
    }
    teamSettings: {
      title: string
      teamIdLabel: string
      copyTeamId: string
      copiedTeamId: string
      searchPlaceholder: string
      inviteMember: string
      colMember: string
      colUsage: string
      colRole: string
      unlimitedQuota: string
      you: string
      owner: string
      member: string
      noTeam: string
      loadFailed: string
      removeMember: string
      removeConfirmTitle: string
      removeConfirmMessage: string
      removeSuccess: string
      invite: {
        title: string
        desc: string
        expiresIn: string
        unlimitedNote: string
        editSettings: string
        copyLink: string
        copiedLink: string
        regenerate: string
        settingsTitle: string
        expiresDays: string
        unlimitedQuota: string
        saveSettings: string
        savedSettings: string
      }
      join: {
        title: string
        desc: string
        memberCount: string
        unlimitedNote: string
        accept: string
        accepting: string
        success: string
        invalid: string
        alreadyMember: string
        goProjects: string
      }
    }
    agentTutorials: {
      modelsTitle: string
      modelsDesc: string
      modelName: string
      modelTask: string
      models: { name: string; task: string }[]
      consumptionTitle: string
      consumptionDesc: string
      taskType: string
      taskSuitable: string
      estimatedTapies: string
      tasks: { type: string; suitable: string; tapies: string }[]
    }
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
    comingSoon: 'Google 登录暂未开放，正在开发中',
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
    model: {
      auto: 'Auto',
      subscribe: '订阅解锁',
      comingSoon: '即将上线',
      howToChoose: '如何选择模型？',
      categoryText: '文本模型',
      categoryImage: '图片模型',
      categoryVideo: '视频模型',
      categoryAudio: '语音模型',
      tierHigh: '高',
      tierMedium: '中',
      premiumHint: '使用该模型可能会产生较高消耗。',
    },
  },
  workspace: {
    personal: '个人',
    team: '团队项目',
    search: '搜索',
    showAll: '显示全部',
    newProject: '新建项目',
    newFolder: '新建文件夹',
    folderNamePlaceholder: '输入文件夹名称',
    empty: '暂无匹配项目',
    colPreview: '预览',
    colName: '名称',
    colType: '类型',
    colContent: '内容',
    colCreated: '创建时间',
    colUpdated: '最近更新',
    typeFolder: '文件夹',
    typeProject: '项目',
    projectCountUnit: '个项目',
    projectMenu: {
      open: '打开',
      rename: '重命名',
      select: '选择',
      moveTo: '移动至...',
      shareLink: '分享链接',
      moveToTeam: '移动至团队',
      delete: '删除',
      comingSoon: '功能开发中',
      shareCopied: '项目链接已复制',
      renameSuccess: '重命名成功',
      deleteSuccess: '项目已删除',
      moveToTeamSuccess: '已移动至团队',
      moveToFolderSuccess: '已移动到文件夹',
      pickTeamTitle: '选择目标团队',
      pickTeamEmpty: '请先创建团队',
      deleteTitle: '删除项目',
      deleteMessage: '确定删除「{name}」？此操作无法撤销。',
      renamePlaceholder: '输入项目名称',
      confirm: '确认',
      cancel: '取消',
    },
    folderMenu: {
      open: '打开',
      rename: '重命名',
      delete: '删除',
      renameSuccess: '文件夹已重命名',
      deleteSuccess: '文件夹已删除',
      deleteTitle: '删除文件夹',
      deleteMessage: '确定删除文件夹「{name}」？其中的项目将移至上级目录。',
      renamePlaceholder: '输入文件夹名称',
      confirm: '确认',
      cancel: '取消',
      error: '操作失败，请稍后重试',
    },
    filter: {
      filterSection: '筛选',
      sortSection: '排序方式',
      orderSection: '顺序',
      showAll: '显示全部',
      foldersOnly: '仅文件夹',
      projectsOnly: '仅项目',
      sortUpdated: '按最近修改',
      sortCreated: '按创建日期',
      newestFirst: '最新优先',
      oldestFirst: '最早优先',
    },
    selection: {
      selectedCount: '已选择 {count} 个画布',
      addToFolder: '添加到文件夹',
      collaborate: '协作',
      deleteSelected: '删除',
      deleteTitle: '删除所选项目',
      deleteMessage: '确定删除所选的 {count} 个项目？此操作无法撤销。',
      moveSuccess: '已移动到文件夹',
      deleteSuccess: '所选项目已删除',
      pickFolder: '选择目标文件夹',
      rootFolder: '根目录',
      cancel: '取消',
    },
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
    detail: {
      loading: '加载中...',
      follow: '关注',
      viewWorkflow: '查看创作过程',
      browseAll: '浏览全部',
      back: '返回',
    },
    workflow: {
      readonlyHint: '只读模式，如需创建请点击',
      cloneProject: '克隆项目',
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
    changeCanvas: '点击更换画布',
    uploadSubtitle: '上传字幕',
    subtitleHint: '（仅支持 .srt，最大 2MB）',
    subtitleUploaded: '字幕已上传',
    cancel: '取消',
    submit: '发布并投稿',
    submitting: '发布中...',
    success: '作品已提交审核',
    canvasPicker: {
      title: '选择画布',
      updatedAt: '更新于',
    },
    errors: {
      titleRequired: '请输入作品名称',
      videoRequired: '请上传作品视频',
      canvasRequired: '请选择公开画布',
      submitFailed: '发布失败，请稍后重试',
    },
  },
  canvas: {
    untitled: 'Untitled',
    lastModified: '上次修改于',
    justNow: '刚刚',
    community: '社区',
    share: '分享',
    aiHint: '画布自由生成，或查看模板',
    aiSubHint: '草稿',
    textToVideo: '文字生成视频',
    imageToVideo: '图片生成视频',
    smartVideo: '智能生成视频',
    mixVideo: '混合生成视频',
    lyrics: '歌词',
    promoBanner: '体验 Seedance 2.0 Mini 快速生成一条视频',
    backToWorkspace: '返回工作空间',
    scenes: '场景',
    projectSection: '项目',
    rename: '重命名',
    newProject: '新建项目',
    delete: '删除',
    tooltips: {
      layers: '图层',
      grid: '对齐网格',
      fitView: '适应画布',
      zoom: '缩放',
      minimapShow: '显示小地图',
      minimapHide: '隐藏小地图',
      addNode: '添加节点',
      search: '搜索',
      projects: '项目',
      favorites: '收藏',
      messages: '消息',
      collaborators: '协作者',
      history: '历史记录',
      profile: '个人主页',
      help: '帮助',
    },
    nodeMenu: {
      addNode: '添加节点',
      auxiliary: '辅助工具',
      resources: '添加资源',
      text: '文本',
      textDesc: '脚本、广告词、品牌文案',
      image: '图片',
      video: '视频',
      audio: '音频',
      world3d: '3D 世界',
      playlist: '播放列表',
      upload: '上传',
      beta: 'Beta',
      comingSoon: '即将推出',
    },
    nodeEditor: {
      placeholder: '描述任何你想要生成的内容',
      textPlaceholder: '双击开始编辑...',
      waitingImage: '等待生成图片...',
      thinking: '思考中...',
      magic: 'AI 增强',
      add: '添加',
      swap: '切换',
      generate: '生成',
    },
    agentPanel: {
      title: 'AI功能与服务介绍',
      settings: '设置',
      close: '关闭',
      welcome: '你好，我是 TapNow.AI。\n\n可以直接说「创建一个图片节点」或「添加两个视频节点」，我会在画布上帮你创建。也可以继续内容策划与分镜拆解。',
      thinking: '思考中...',
      inputPlaceholder: '描述创意需求/使用技能, @ 添加画布内容, / 引用参考',
      autoGenerate: '自动生成',
      send: '发送',
      resize: '调整面板宽度',
      newFeature: '新功能',
      minimize: '收起',
      history: '历史记录',
      historyEmpty: '暂无历史对话',
      historyNew: '新对话',
      historyLoading: '加载中...',
      openPanel: '打开 AI 助手',
      suggestions: ['创建一个图片节点', '添加一个文本节点', '创建两个视频节点'],
    },
  },
  userMenu: {
    createTeam: '创建团队',
    profile: '个人主页',
    earnTapies: '赚取 Tapies',
    account: '账户管理',
    partners: '合作中心',
    help: '帮助中心',
    logout: '登出账号',
    teamSuffix: '的团队',
    freeBadge: 'FREE',
    unlimitedQuota: '无额度限制',
  },
  createTeamModal: {
    title: '创建团队',
    subtitle: '新团队将拥有独立的工作空间',
    noticeTitle: '重要提示',
    noticeBody: '新团队拥有独立的计费账户，初始 Tapies 为 0。原有的权益与积分无法继承至新团队。',
    teamName: '团队名称',
    teamNamePlaceholder: '请输入团队名称',
    cancel: '取消',
    confirm: '确认',
    success: '团队创建成功',
  },
  profile: {
    changeBanner: '更换背景图片',
    uploadBanner: '上传背景图片',
    uploadAvatar: '上传头像',
    cycleBannerGradient: '切换渐变色',
    resetBannerGradient: '恢复渐变',
    following: '已关注',
    followers: '粉丝',
    favorites: '收藏',
    joinedAt: '入驻',
    share: '分享',
    tabPortfolio: '我的作品集',
    tabSaved: '我的收藏',
    savedLocked: '暂未开放',
    savedEmpty: '还没有收藏的作品，去 TapTV 探索吧',
    featuredWorks: '代表作',
    featuredEmpty: '向全世界展示你最得意的创作。',
    addFeatured: '添加代表作',
    tabWorks: '作品',
    tabSeries: '系列',
    filterAll: '全部',
    worksEmpty: '暂无作品，去画布创作吧',
  },
  account: {
    personalProfile: '个人简介',
    username: '用户名',
    bio: '个人简介',
    social: '社交媒体',
    socialPlaceholder: '在此粘贴社交主页链接',
    country: '国家 / 地区',
    city: '城市',
    countryPlaceholder: '国家',
    cityPlaceholder: '城市',
    profession: '身份 / 职业',
    professionPlaceholder: '写点什么，让大家更了解你',
    showJoinDate: '显示入驻时间',
    email: '邮箱',
    comingSoon: '功能即将上线',
    save: '保存',
    saveSuccess: '个人资料已保存',
    sections: {
      subscription: '订阅和充值',
      benefits: '权益和账单',
      general: '通用设置',
      support: '帮助与支持',
    },
    nav: {
      subscription: '订阅套餐',
      modelMarket: '模型超市',
      recharge: '充值积分',
      teamBenefits: '团队权益',
      rewards: '奖励中心',
      billing: '账单记录',
      usage: '用量看板',
      personal: '个人设置',
      team: '团队设置',
      tutorials: '使用教程',
      agentTutorials: 'Agent 教程',
      logout: '登出账号',
    },
    version: 'v2.10.19',
    logoutConfirm: {
      title: '确认登出',
      message: '确定要登出当前账号吗？登出后需要重新登录才能继续使用。',
      confirm: '登出',
      cancel: '取消',
    },
  },
  helpMenu: {
    contact: '联系我们',
    tutorials: '使用教程',
    shortcuts: '快捷键',
    feedback: '反馈问题',
  },
  accountViews: {
    subscription: {
      title: '选择你的套餐',
      subtitle: '不止额度，更是灵感落地的速度。积分永不过期。',
      currency: '展示币种: CNY',
      subscribe: '订阅',
      viewBenefits: '查看计划权益',
      cycles: { monthly: '连续包月 45% OFF', yearly: '连续包年 50% OFF', enterprise: '企业版' },
      plans: [
        { id: 'basic', name: 'BASIC', price: '≈¥53/月', original: '¥105', note: '按年支付，年付总价约¥630\n每月 1500 Tapies\n额外充值 ¥7=100 Tapies' },
        { id: 'pro', name: 'PRO', price: '≈¥210/月', original: '¥420', note: '按年支付\n每月 6000 Tapies\n额外充值 ¥7=110 Tapies', badge: '最受欢迎', highlight: true },
        { id: 'ultimate', name: 'ULTIMATE', price: '≈¥1,260/月', original: '¥2,520', note: '每月 36000 Tapies\n额外充值 ¥7=120 Tapies' },
        { id: 'max', name: 'MAX', price: '≈¥2,520/月', original: '¥5,040', note: '每月 72000 Tapies\n额外充值 ¥7=130 Tapies', badge: '最佳性价比' },
      ],
    },
    modelMarket: {
      title: 'Tapnow 模型超市',
      subtitle: '永远比官方便宜的模型超市，比官方价格便宜可达 25%。',
      buyNow: '立即购买 100/100',
      cards: [
        { id: 'seed-silver', model: 'Seedance 2.0', tier: '银卡', price: '$1000', tapies: '140000 Seedance 2.0 Tapies', bg: 'linear-gradient(135deg,#1a3a2a 0%,#2d5a4a 100%)' },
        { id: 'seed-gold', model: 'Seedance 2.0', tier: '金卡', price: '$3000', tapies: '420000 Seedance 2.0 Tapies', bg: 'linear-gradient(135deg,#3a1a4a 0%,#5a2d6a 100%)' },
        { id: 'seed-platinum', model: 'Seedance 2.0', tier: '铂金卡', price: '$6000', tapies: '840000 Seedance 2.0 Tapies', bg: 'linear-gradient(135deg,#1a2a4a 0%,#2d4a6a 100%)' },
      ],
    },
    recharge: {
      title: '充值积分（随用随充）',
      freeBadge: '免费版',
      balanceLabel: '当前余额',
      getTapies: '获得 Tapies',
      rate: '$1 = 100 Tapies',
      payAmount: '需支付金额',
      submit: '立即充值',
    },
    teamBenefits: {
      balanceTitle: 'Tapies 余额：{n}',
      balanceHint: '当前汇率 $1=100 Tapies。升级套餐解锁超值充值汇率。',
      recharge: '充值',
      freePlan: '免费版',
      upgradeHint: '升级订阅套餐，解锁完整功能，加速专业创作。',
      upgrade: '升级',
      yourTeam: '你的团队：{name}',
      teamId: '团队 ID：{id}',
      copyTeamId: '复制团队 ID',
      quotaTitle: '配额信息',
      quotaEmpty: '暂无配额信息',
    },
    rewards: {
      title: '奖励中心',
      inputLabel: '输入兑换码',
      inputPlaceholder: '请输入兑换码，例如 TAP-XXXX-XXXX-XXX',
      redeem: '兑换',
      historyTitle: '兑换记录',
      columns: ['兑换码', '活动名称', '兑换时间', '积分'],
    },
    billing: {
      tabBills: '账单',
      tabTransactions: '交易记录',
      feedback: '反馈问题',
      billsTitle: '账单详情',
      issueInvoice: '开商业发票',
      billColumns: ['账单 ID', '交易时间', '消费内容', '金额', '状态'],
      billsEmpty: '暂无账单数据',
      billsEmptySub: '您还没有任何交易记录',
      txColumns: ['交易 ID', '交易时间', '交易类型', '描述', '操作者', '金额', '状态'],
      completed: '已完成',
    },
    usage: {
      title: 'Tapies 用量',
      subtitle: '{team} · 最近 365 天',
      totalUsage: '总用量',
      agentUsage: 'Agent 用量',
      statTotal: '总消耗 Tapies',
      statPeak: '单日峰值',
      statWeekly: '周均消耗 Tapies',
      statActive: '活跃天数',
      statStreak: '最长连续活跃天数',
      activityTitle: 'Tapies 活动',
      periods: { daily: '每日', weekly: '每周', cumulative: '累计' },
    },
    teamSettings: {
      title: '团队设置',
      teamIdLabel: '团队 ID：{id}',
      copyTeamId: '复制',
      copiedTeamId: '已复制团队 ID',
      searchPlaceholder: '查找成员',
      inviteMember: '邀请成员',
      colMember: '成员信息',
      colUsage: '当前使用量 / 总额',
      colRole: '角色',
      unlimitedQuota: '无额度限制',
      you: '（你）',
      owner: '所有者',
      member: '成员',
      noTeam: '请先创建团队后再管理成员',
      loadFailed: '加载成员失败',
      removeMember: '移除',
      removeConfirmTitle: '移除成员',
      removeConfirmMessage: '确定将 {name} 移出团队？移除后将无法访问团队资源。',
      removeSuccess: '已移除成员',
      invite: {
        title: '邀请成员',
        desc: '分享此链接邀请朋友加入您的团队。他们加入后将立即获得团队资源访问权限。',
        expiresIn: '此链接设置为 {days} 天内有效',
        unlimitedNote: '通过此链接加入的成员拥有无限 Tapies 使用量。',
        editSettings: '编辑链接设置',
        copyLink: '复制链接',
        copiedLink: '已复制邀请链接',
        regenerate: '重新生成链接',
        settingsTitle: '链接设置',
        expiresDays: '有效天数',
        unlimitedQuota: '加入成员无限 Tapies',
        saveSettings: '保存设置',
        savedSettings: '链接设置已保存',
      },
      join: {
        title: '加入团队',
        desc: '你收到了加入以下团队的邀请',
        memberCount: '{count} 位成员',
        unlimitedNote: '加入后将拥有无限 Tapies 使用量',
        accept: '加入团队',
        accepting: '加入中…',
        success: '已成功加入团队',
        invalid: '邀请链接无效或已过期',
        alreadyMember: '你已是该团队成员',
        goProjects: '前往工作空间',
      },
    },
    agentTutorials: {
      modelsTitle: '不同模型适合的任务',
      modelsDesc: '优先按任务复杂度选择模型，把更复杂的创作规划交给更强模型。',
      modelName: '模型名字',
      modelTask: '当前适合的任务',
      models: [
        { name: 'Opus 4.8', task: '高复杂度视频创作规划（长脚本拆解、多镜头拆分、角色/风格一致性、复杂图像/视频 prompt 设计）' },
        { name: 'Opus 4.7', task: '深度创意推理（镜头优化、prompt 迭代、脚本润色、中高强度视频规划）' },
        { name: 'Opus 4.6', task: '稳定长链路创作规划（长脚本生成、创意方向、场景规划、成本可控的复杂任务）' },
        { name: 'Sonnet 4.6', task: '日常默认模型（头脑风暴、图像/视频创意对比、prompt 起草、短脚本润色、下一步规划）' },
        { name: 'Kimi 2.7', task: '快速创意发散（多版本 prompt 草稿、短视频脚本草稿、标题/文案方案、图像/视频生成描述整理）' },
        { name: 'Kimi 2.6', task: '低成本轻量选择（简单追问、基础头脑风暴、prompt 改写、格式整理、快速图像/视频草稿）' },
      ],
      consumptionTitle: '不同任务的 Tapies 消耗预估',
      consumptionDesc: '根据 TapNow 中常见创作任务预估消耗，实际用量会随模型、素材数量和输出规模变化。',
      taskType: '任务类型',
      taskSuitable: '适合做什么',
      estimatedTapies: '预计 Tapies 消耗',
      tasks: [
        { type: '创意讨论 / 规划', suitable: '一起梳理想法、对比方向、生成方案、快速确定下一步', tapies: '5–40 Tapies' },
        { type: '脚本 / 分镜生成', suitable: '生成短视频脚本、分镜描述、镜头列表与节奏规划', tapies: '20–120 Tapies' },
        { type: '图像生成', suitable: '单张或多张概念图、风格探索、素材迭代', tapies: '10–80 Tapies' },
        { type: '视频生成', suitable: '短视频片段生成、镜头拼接前的单段预览', tapies: '50–300 Tapies' },
        { type: 'Agent 复杂工作流', suitable: '多步骤创作、跨素材编排、长链路自动执行', tapies: '100–500+ Tapies' },
      ],
    },
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
    comingSoon: 'Google sign-in is not available yet — under development',
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
    model: {
      auto: 'Auto',
      subscribe: 'Subscribe to unlock',
      comingSoon: 'Coming soon',
      howToChoose: 'How to choose a model?',
      categoryText: 'Text models',
      categoryImage: 'Image models',
      categoryVideo: 'Video models',
      categoryAudio: 'Audio models',
      tierHigh: 'High',
      tierMedium: 'Med',
      premiumHint: 'This model may consume more Tapies.',
    },
  },
  workspace: {
    personal: 'Personal',
    team: 'Team projects',
    search: 'Search',
    showAll: 'Show all',
    newProject: 'New project',
    newFolder: 'New folder',
    folderNamePlaceholder: 'Folder name',
    empty: 'No matching items',
    colPreview: 'Preview',
    colName: 'Name',
    colType: 'Type',
    colContent: 'Content',
    colCreated: 'Created',
    colUpdated: 'Last updated',
    typeFolder: 'Folder',
    typeProject: 'Project',
    projectCountUnit: 'projects',
    projectMenu: {
      open: 'Open',
      rename: 'Rename',
      select: 'Select',
      moveTo: 'Move to...',
      shareLink: 'Share link',
      moveToTeam: 'Move to team',
      delete: 'Delete',
      comingSoon: 'Under development',
      shareCopied: 'Project link copied',
      renameSuccess: 'Renamed successfully',
      deleteSuccess: 'Project deleted',
      moveToTeamSuccess: 'Moved to team',
      moveToFolderSuccess: 'Moved to folder',
      pickTeamTitle: 'Choose a team',
      pickTeamEmpty: 'Create a team first',
      deleteTitle: 'Delete project',
      deleteMessage: 'Delete "{name}"? This cannot be undone.',
      renamePlaceholder: 'Project name',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    folderMenu: {
      open: 'Open',
      rename: 'Rename',
      delete: 'Delete',
      renameSuccess: 'Folder renamed',
      deleteSuccess: 'Folder deleted',
      deleteTitle: 'Delete folder',
      deleteMessage: 'Delete folder "{name}"? Projects inside will move to the parent folder.',
      renamePlaceholder: 'Folder name',
      confirm: 'Confirm',
      cancel: 'Cancel',
      error: 'Action failed. Please try again.',
    },
    filter: {
      filterSection: 'Filter',
      sortSection: 'Sort by',
      orderSection: 'Order',
      showAll: 'Show all',
      foldersOnly: 'Folders only',
      projectsOnly: 'Projects only',
      sortUpdated: 'Last modified',
      sortCreated: 'Creation date',
      newestFirst: 'Newest first',
      oldestFirst: 'Oldest first',
    },
    selection: {
      selectedCount: '{count} canvas selected',
      addToFolder: 'Add to folder',
      collaborate: 'Collaborate',
      deleteSelected: 'Delete',
      deleteTitle: 'Delete selected projects',
      deleteMessage: 'Delete {count} selected projects? This cannot be undone.',
      moveSuccess: 'Moved to folder',
      deleteSuccess: 'Selected projects deleted',
      pickFolder: 'Choose a folder',
      rootFolder: 'Root',
      cancel: 'Cancel',
    },
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
    detail: {
      loading: 'Loading...',
      follow: 'Follow',
      viewWorkflow: 'View creation process',
      browseAll: 'Browse all',
      back: 'Back',
    },
    workflow: {
      readonlyHint: 'Read-only. Click to create your own.',
      cloneProject: 'Clone project',
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
    changeCanvas: 'Tap to change canvas',
    uploadSubtitle: 'Upload subtitles',
    subtitleHint: '(.srt only, max 2MB)',
    subtitleUploaded: 'Subtitles uploaded',
    cancel: 'Cancel',
    submit: 'Publish & submit',
    submitting: 'Publishing...',
    success: 'Work submitted for review',
    canvasPicker: {
      title: 'Select canvas',
      updatedAt: 'Updated',
    },
    errors: {
      titleRequired: 'Please enter a work title',
      videoRequired: 'Please upload a video',
      canvasRequired: 'Please select a public canvas',
      submitFailed: 'Publish failed. Please try again.',
    },
  },
  canvas: {
    untitled: 'Untitled',
    lastModified: 'Last modified',
    justNow: 'just now',
    community: 'Community',
    share: 'Share',
    aiHint: 'Generate on canvas, or browse templates',
    aiSubHint: 'Draft',
    textToVideo: 'Text to video',
    imageToVideo: 'Image to video',
    smartVideo: 'Smart video',
    mixVideo: 'Mixed video',
    lyrics: 'Lyrics',
    promoBanner: 'Try Seedance 2.0 Mini to quickly generate a video',
    backToWorkspace: 'Back to workspace',
    scenes: 'Scenes',
    projectSection: 'Project',
    rename: 'Rename',
    newProject: 'New project',
    delete: 'Delete',
    tooltips: {
      layers: 'Layers',
      grid: 'Snap to grid',
      fitView: 'Fit to view',
      zoom: 'Zoom',
      minimapShow: 'Show minimap',
      minimapHide: 'Hide minimap',
      addNode: 'Add node',
      search: 'Search',
      projects: 'Projects',
      favorites: 'Favorites',
      messages: 'Messages',
      collaborators: 'Collaborators',
      history: 'History',
      profile: 'Profile',
      help: 'Help',
    },
    nodeMenu: {
      addNode: 'Add node',
      auxiliary: 'Tools',
      resources: 'Resources',
      text: 'Text',
      textDesc: 'Scripts, ads, brand copy',
      image: 'Image',
      video: 'Video',
      audio: 'Audio',
      world3d: '3D World',
      playlist: 'Playlist',
      upload: 'Upload',
      beta: 'Beta',
      comingSoon: 'Coming soon',
    },
    nodeEditor: {
      placeholder: 'Describe what you want to generate',
      textPlaceholder: 'Double-click to edit...',
      waitingImage: 'Waiting for image...',
      thinking: 'Thinking...',
      magic: 'Enhance',
      add: 'Add',
      swap: 'Swap',
      generate: 'Generate',
    },
    agentPanel: {
      title: 'AI features & services',
      settings: 'Settings',
      close: 'Close',
      welcome: 'Hi, I\'m TapNow.AI.\n\nSay “create an image node” or “add two video nodes” and I\'ll place them on the canvas. I can also help with planning and storyboards.',
      thinking: 'Thinking...',
      inputPlaceholder: 'Describe your idea, @ canvas content, / reference',
      autoGenerate: 'Auto-generate',
      send: 'Send',
      resize: 'Resize panel',
      newFeature: 'New',
      minimize: 'Collapse',
      history: 'History',
      historyEmpty: 'No conversations yet',
      historyNew: 'New chat',
      historyLoading: 'Loading...',
      openPanel: 'Open AI assistant',
      suggestions: ['Create an image node', 'Add a text node', 'Create two video nodes'],
    },
  },
  userMenu: {
    createTeam: 'Create team',
    profile: 'Profile',
    earnTapies: 'Earn Tapies',
    account: 'Account',
    partners: 'Partners',
    help: 'Help center',
    logout: 'Log out',
    teamSuffix: "'s team",
    freeBadge: 'FREE',
    unlimitedQuota: 'Unlimited quota',
  },
  createTeamModal: {
    title: 'Create team',
    subtitle: 'New teams get an independent workspace',
    noticeTitle: 'Important',
    noticeBody: 'New teams have separate billing. Initial Tapies is 0. Existing benefits cannot be transferred.',
    teamName: 'Team name',
    teamNamePlaceholder: 'Enter team name',
    cancel: 'Cancel',
    confirm: 'Confirm',
    success: 'Team created',
  },
  profile: {
    changeBanner: 'Change background',
    uploadBanner: 'Upload banner',
    uploadAvatar: 'Upload avatar',
    cycleBannerGradient: 'Cycle gradient',
    resetBannerGradient: 'Use gradient',
    following: 'Following',
    followers: 'Followers',
    favorites: 'Favorites',
    joinedAt: 'Joined',
    share: 'Share',
    tabPortfolio: 'My portfolio',
    tabSaved: 'My favorites',
    savedLocked: 'Coming soon',
    savedEmpty: 'No favorites yet — explore TapTV to find works you love',
    featuredWorks: 'Featured works',
    featuredEmpty: 'Show the world your best creations.',
    addFeatured: 'Add featured work',
    tabWorks: 'Works',
    tabSeries: 'Series',
    filterAll: 'All',
    worksEmpty: 'No works yet — start creating on canvas',
  },
  account: {
    personalProfile: 'Personal profile',
    username: 'Username',
    bio: 'Bio',
    social: 'Social media',
    socialPlaceholder: 'Paste your social profile link',
    country: 'Country / Region',
    city: 'City',
    countryPlaceholder: 'Country',
    cityPlaceholder: 'City',
    profession: 'Identity / Profession',
    professionPlaceholder: 'Tell others a bit about yourself',
    showJoinDate: 'Show join date',
    email: 'Email',
    comingSoon: 'Coming soon',
    save: 'Save',
    saveSuccess: 'Profile saved',
    sections: {
      subscription: 'Subscription & recharge',
      benefits: 'Benefits & billing',
      general: 'General settings',
      support: 'Help & support',
    },
    nav: {
      subscription: 'Subscription plan',
      modelMarket: 'Model marketplace',
      recharge: 'Recharge credits',
      teamBenefits: 'Team benefits',
      rewards: 'Reward center',
      billing: 'Billing history',
      usage: 'Usage dashboard',
      personal: 'Personal settings',
      team: 'Team settings',
      tutorials: 'Tutorials',
      agentTutorials: 'Agent tutorials',
      logout: 'Log out',
    },
    version: 'v2.10.19',
    logoutConfirm: {
      title: 'Confirm log out',
      message: 'Are you sure you want to log out? You will need to sign in again to continue.',
      confirm: 'Log out',
      cancel: 'Cancel',
    },
  },
  helpMenu: {
    contact: 'Contact us',
    tutorials: 'Tutorials',
    shortcuts: 'Shortcuts',
    feedback: 'Feedback',
  },
  accountViews: {
    subscription: {
      title: 'Choose your plan',
      subtitle: 'More than quota — speed to bring ideas to life. Credits never expire.',
      currency: 'Currency: CNY',
      subscribe: 'Subscribe',
      viewBenefits: 'View plan benefits',
      cycles: { monthly: 'Monthly 45% OFF', yearly: 'Yearly 50% OFF', enterprise: 'Enterprise' },
      plans: [
        { id: 'basic', name: 'BASIC', price: '≈¥53/mo', original: '¥105', note: 'Billed yearly ~¥630/yr\n1500 Tapies/mo\nTop-up ¥7=100 Tapies' },
        { id: 'pro', name: 'PRO', price: '≈¥210/mo', original: '¥420', note: '6000 Tapies/mo\nTop-up ¥7=110 Tapies', badge: 'Most popular', highlight: true },
        { id: 'ultimate', name: 'ULTIMATE', price: '≈¥1,260/mo', original: '¥2,520', note: '36000 Tapies/mo\nTop-up ¥7=120 Tapies' },
        { id: 'max', name: 'MAX', price: '≈¥2,520/mo', original: '¥5,040', note: '72000 Tapies/mo\nTop-up ¥7=130 Tapies', badge: 'Best value' },
      ],
    },
    modelMarket: {
      title: 'Tapnow Model Market',
      subtitle: 'Always cheaper than official — up to 25% off.',
      buyNow: 'Buy now 100/100',
      cards: [
        { id: 'seed-silver', model: 'Seedance 2.0', tier: 'Silver', price: '$1000', tapies: '140000 Seedance 2.0 Tapies', bg: 'linear-gradient(135deg,#1a3a2a 0%,#2d5a4a 100%)' },
        { id: 'seed-gold', model: 'Seedance 2.0', tier: 'Gold', price: '$3000', tapies: '420000 Seedance 2.0 Tapies', bg: 'linear-gradient(135deg,#3a1a4a 0%,#5a2d6a 100%)' },
        { id: 'seed-platinum', model: 'Seedance 2.0', tier: 'Platinum', price: '$6000', tapies: '840000 Seedance 2.0 Tapies', bg: 'linear-gradient(135deg,#1a2a4a 0%,#2d4a6a 100%)' },
      ],
    },
    recharge: {
      title: 'Recharge credits (pay as you go)',
      freeBadge: 'Free',
      balanceLabel: 'Balance',
      getTapies: 'You get',
      rate: '$1 = 100 Tapies',
      payAmount: 'Amount to pay',
      submit: 'Recharge now',
    },
    teamBenefits: {
      balanceTitle: 'Tapies balance: {n}',
      balanceHint: 'Rate $1=100 Tapies. Upgrade for better top-up rates.',
      recharge: 'Recharge',
      freePlan: 'Free plan',
      upgradeHint: 'Upgrade to unlock full features and faster creation.',
      upgrade: 'Upgrade',
      yourTeam: 'Your team: {name}',
      teamId: 'Team ID: {id}',
      copyTeamId: 'Copy team ID',
      quotaTitle: 'Quota',
      quotaEmpty: 'No quota information yet',
    },
    rewards: {
      title: 'Reward center',
      inputLabel: 'Enter redemption code',
      inputPlaceholder: 'e.g. TAP-XXXX-XXXX-XXX',
      redeem: 'Redeem',
      historyTitle: 'Redemption history',
      columns: ['Code', 'Activity', 'Time', 'Points'],
    },
    billing: {
      tabBills: 'Bills',
      tabTransactions: 'Transactions',
      feedback: 'Feedback',
      billsTitle: 'Bill details',
      issueInvoice: 'Issue invoice',
      billColumns: ['Bill ID', 'Time', 'Content', 'Amount', 'Status'],
      billsEmpty: 'No billing data',
      billsEmptySub: 'You have no transactions yet',
      txColumns: ['Transaction ID', 'Time', 'Type', 'Description', 'Operator', 'Amount', 'Status'],
      completed: 'Completed',
    },
    usage: {
      title: 'Tapies usage',
      subtitle: '{team} · Last 365 days',
      totalUsage: 'Total',
      agentUsage: 'Agent',
      statTotal: 'Total consumed',
      statPeak: 'Daily peak',
      statWeekly: 'Weekly avg',
      statActive: 'Active days',
      statStreak: 'Longest streak',
      activityTitle: 'Tapies activity',
      periods: { daily: 'Daily', weekly: 'Weekly', cumulative: 'Cumulative' },
    },
    teamSettings: {
      title: 'Team settings',
      teamIdLabel: 'Team ID: {id}',
      copyTeamId: 'Copy',
      copiedTeamId: 'Team ID copied',
      searchPlaceholder: 'Find members',
      inviteMember: 'Invite member',
      colMember: 'Member',
      colUsage: 'Usage / quota',
      colRole: 'Role',
      unlimitedQuota: 'Unlimited',
      you: '(you)',
      owner: 'Owner',
      member: 'Member',
      noTeam: 'Create a team first to manage members',
      loadFailed: 'Failed to load members',
      removeMember: 'Remove',
      removeConfirmTitle: 'Remove member',
      removeConfirmMessage: 'Remove {name} from the team? They will lose access to team resources.',
      removeSuccess: 'Member removed',
      invite: {
        title: 'Invite members',
        desc: 'Share this link to invite friends to your team. They will get access to team resources right after joining.',
        expiresIn: 'This link is valid for {days} days',
        unlimitedNote: 'Members who join through this link have unlimited Tapies usage.',
        editSettings: 'Edit link settings',
        copyLink: 'Copy link',
        copiedLink: 'Invite link copied',
        regenerate: 'Regenerate link',
        settingsTitle: 'Link settings',
        expiresDays: 'Valid for (days)',
        unlimitedQuota: 'Unlimited Tapies for invitees',
        saveSettings: 'Save settings',
        savedSettings: 'Link settings saved',
      },
      join: {
        title: 'Join team',
        desc: 'You have been invited to join',
        memberCount: '{count} members',
        unlimitedNote: 'Unlimited Tapies after joining',
        accept: 'Join team',
        accepting: 'Joining…',
        success: 'Successfully joined the team',
        invalid: 'Invite link is invalid or expired',
        alreadyMember: 'You are already a member of this team',
        goProjects: 'Go to workspace',
      },
    },
    agentTutorials: {
      modelsTitle: 'Tasks suited to each model',
      modelsDesc: 'Pick models by task complexity — use stronger models for heavier creative planning.',
      modelName: 'Model',
      modelTask: 'Best for',
      models: [
        { name: 'Opus 4.8', task: 'High-complexity video planning (long script breakdown, multi-shot splits, character/style consistency, complex image/video prompts)' },
        { name: 'Opus 4.7', task: 'Deep creative reasoning (shot optimization, prompt iteration, script polish, medium-high video planning)' },
        { name: 'Opus 4.6', task: 'Stable long-form planning (long scripts, creative direction, scene planning, cost-controlled complex tasks)' },
        { name: 'Sonnet 4.6', task: 'Daily default (brainstorming, image/video comparisons, prompt drafts, short script polish, next-step planning)' },
        { name: 'Kimi 2.7', task: 'Fast creative divergence (multi-version prompts, short video scripts, titles/copy, generation briefs)' },
        { name: 'Kimi 2.6', task: 'Low-cost lightweight (simple follow-ups, basic brainstorming, prompt rewrites, formatting, quick drafts)' },
      ],
      consumptionTitle: 'Estimated Tapies by task',
      consumptionDesc: 'Estimates for common TapNow workflows; actual usage varies by model, assets, and output scale.',
      taskType: 'Task type',
      taskSuitable: 'What it is for',
      estimatedTapies: 'Estimated Tapies',
      tasks: [
        { type: 'Creative discussion / planning', suitable: 'Sort ideas, compare directions, generate options, decide next steps', tapies: '5–40 Tapies' },
        { type: 'Script / storyboard', suitable: 'Short video scripts, shot descriptions, shot lists and pacing', tapies: '20–120 Tapies' },
        { type: 'Image generation', suitable: 'Concept frames, style exploration, asset iteration', tapies: '10–80 Tapies' },
        { type: 'Video generation', suitable: 'Short clip generation, single-segment previews before stitching', tapies: '50–300 Tapies' },
        { type: 'Agent workflows', suitable: 'Multi-step creation, cross-asset orchestration, long automated runs', tapies: '100–500+ Tapies' },
      ],
    },
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

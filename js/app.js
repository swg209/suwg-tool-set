// ===== AI工具集应用主文件 =====

class AIToolsApp {
  constructor() {
    this.tools = [];
    this.categories = [];
    this.currentCategory = 'all';
    this.currentView = 'grid';
    this.searchQuery = '';
    this.sortBy = 'default';
    
    this.init();
  }

  // 初始化应用
  async init() {
    this.setupEventListeners();
    this.initTheme();
    await this.loadTools();
    this.renderCategories();
    this.renderTools();
    this.hideLoading();
  }

  // 设置事件监听器
  setupEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    
    searchInput.addEventListener('input', this.handleSearch.bind(this));
    searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
    searchClear.addEventListener('click', this.clearSearch.bind(this));

    // 主题切换
    document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));

    // 侧边栏切换
    document.getElementById('sidebarToggle').addEventListener('click', this.toggleSidebar.bind(this));
    document.getElementById('mobileMenuToggle').addEventListener('click', this.toggleMobileSidebar.bind(this));

    // 视图切换
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', this.handleViewChange.bind(this));
    });

    // 排序
    document.getElementById('sortSelect').addEventListener('change', this.handleSortChange.bind(this));

    // 返回顶部
    document.getElementById('backToTop').addEventListener('click', this.scrollToTop.bind(this));
    window.addEventListener('scroll', this.handleScroll.bind(this));

    // 分类导航
    document.getElementById('categoryList').addEventListener('click', this.handleCategoryClick.bind(this));

    // 响应式处理
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  // 初始化主题
  initTheme() {
    const savedTheme = localStorage.getItem('ai-tools-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // 切换主题
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ai-tools-theme', newTheme);
  }

  // 加载工具数据
  async loadTools() {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.tools = [
      // 原创工具
      {
        id: 13,
        name: '文字计数器',
        description: '实时统计文本的字数、字符数、段落数、阅读时间等详细信息',
        category: 'utility',
        tags: ['文字统计', '字数统计', '实用工具'],
        icon: '文',
        url: './tools/text-counter/',
        isLocal: true,
        isOriginal: true
      },
      {
        id: 14,
        name: '颜色选择器',
        description: '专业的颜色选择和格式转换工具',
        category: 'utility',
        tags: ['颜色转换', '调色板', '实用工具'],
        icon: '色',
        url: './tools/color-picker/',
        isLocal: true,
        isOriginal: true
      },
      {
        id: 15,
        name: '二维码生成器',
        description: '生成各种类型的二维码，支持文本、网址、WiFi等，可自定义样式',
        category: 'utility',
        tags: ['二维码', '生成器', '实用工具'],
        icon: '码',
        url: './tools/qr-generator/',
        isLocal: true,
        isOriginal: true
      },
      {
        id: 16,
        name: 'JSON格式化',
        description: 'JSON美化、压缩、验证工具，支持语法高亮和错误检测',
        category: 'utility',
        tags: ['JSON', '格式化', '实用工具'],
        icon: 'J',
        url: './tools/json-formatter/',
        isLocal: true,
        isOriginal: true
      },

      // 迁移的工具

      // ===== 迁移的工具 =====
      {
        id: 202,
        name: '年龄和生肖计算器',
        description: '根据出生日期计算年龄并显示对应生肖',
        category: 'calculator',
        tags: ["迁移工具","计算器","数学"],
        icon: '年',
        url: './tools/age-calculate-shengxiao/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 1
      },
      {
        id: 203,
        name: '食物热量转换器 - 健康管理工具',
        description: '食物热量查询和营养成分分析工具',
        category: 'calculator',
        tags: ["迁移工具","计算器","数学","转换器"],
        icon: '食',
        url: './tools/food-heat-computer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 204,
        name: '会议成本计算器 - Meeting Cost Calculator',
        description: '会议成本计算器 - Meeting Cost Calculator',
        category: 'calculator',
        tags: ["迁移工具","计算器","数学"],
        icon: '会',
        url: './tools/meeting-cost/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 205,
        name: '阅读时间计算器 - Reading Time Calculator',
        description: '阅读时间计算器 - Reading Time Calculator',
        category: 'calculator',
        tags: ["迁移工具","计算器","数学"],
        icon: '阅',
        url: './tools/reading-time-calculator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 206,
        name: '058_timezone_converter',
        description: '058_timezone_converter',
        category: 'calculator',
        tags: ["迁移工具","计算器","数学"],
        icon: '0',
        url: './tools/timezone-converter/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 1
      },
      {
        id: 207,
        name: '工作性价比计算器',
        description: '工作性价比计算器',
        category: 'calculator',
        tags: ["迁移工具","计算器","数学"],
        icon: '工',
        url: './tools/work-worth-calculator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 208,
        name: '几何图形面积/体积计算器',
        description: '几何图形面积/体积计算器',
        category: 'calculator',
        tags: ["迁移工具","计算器","数学"],
        icon: '几',
        url: './tools/geometry-calculator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 209,
        name: '时间差计算器',
        description: '计算两个时间点之间的时间差',
        category: 'calculator',
        tags: ["迁移工具","计算器","数学"],
        icon: '时',
        url: './tools/time-difference/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 1
      },
      {
        id: 210,
        name: '图表生成器',
        description: '图表生成器',
        category: 'design',
        tags: ["迁移工具","设计","创意","生成器"],
        icon: '图',
        url: './tools/chart-pie-gen-tool/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 6
      },
      {
        id: 211,
        name: '极简 Logo 设计器 - Minimalist Logo Designer',
        description: '极简 Logo 设计器 - Minimalist Logo Designer',
        category: 'design',
        tags: ["迁移工具","设计","创意"],
        icon: '极',
        url: './tools/logo-designer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 212,
        name: '网页万花筒',
        description: '网页万花筒',
        category: 'design',
        tags: ["迁移工具","设计","创意"],
        icon: '网',
        url: './tools/web-kaleidoscope/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 213,
        name: '配色方案生成器 - Color Palette Generator',
        description: '配色方案生成器 - Color Palette Generator',
        category: 'design',
        tags: ["迁移工具","设计","创意","生成器"],
        icon: '配',
        url: './tools/color-palette-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 214,
        name: '数字蒲公英 - Digital Dandelion',
        description: '数字蒲公英 - Digital Dandelion',
        category: 'design',
        tags: ["迁移工具","设计","创意"],
        icon: '数',
        url: './tools/digital-dandelion/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 216,
        name: '粒子效果生成器',
        description: '创建炫酷的粒子动画效果',
        category: 'design',
        tags: ["迁移工具","设计","创意","生成器"],
        icon: '粒',
        url: './tools/particle-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 7
      },
      {
        id: 218,
        name: '文件加密工具',
        description: '本地文件加密和解密工具',
        category: 'development',
        tags: ["迁移工具","开发","编程"],
        icon: '文',
        url: './tools/file-encrypt-util/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 219,
        name: 'AnyRouter | Claude Code 共享平台',
        description: 'AnyRouter | Claude Code 共享平台',
        category: 'development',
        tags: ["迁移工具","开发","编程"],
        icon: 'A',
        url: './tools/claude-code-usage-web/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 220,
        name: 'CSS Flexbox 布局生成器',
        description: 'CSS Flexbox 布局生成器',
        category: 'development',
        tags: ["迁移工具","开发","编程","生成器"],
        icon: 'C',
        url: './tools/flexbox-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 2
      },
      {
        id: 221,
        name: 'CSS Grid 布局生成器',
        description: 'CSS Grid 布局生成器',
        category: 'development',
        tags: ["迁移工具","开发","编程","生成器"],
        icon: 'C',
        url: './tools/grid-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 2
      },
      {
        id: 222,
        name: '文件哈希值计算器',
        description: '文件哈希值计算器',
        category: 'development',
        tags: ["迁移工具","开发","编程","计算器"],
        icon: '文',
        url: './tools/file-hash/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 224,
        name: 'CSV/JSON 转换器',
        description: 'CSV/JSON 转换器',
        category: 'development',
        tags: ["迁移工具","开发","编程","转换器"],
        icon: 'C',
        url: './tools/csv-json-converter/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 6
      },
      {
        id: 225,
        name: '正则表达式测试器',
        description: '在线正则表达式测试和验证工具',
        category: 'development',
        tags: ["迁移工具","开发","编程"],
        icon: '正',
        url: './tools/regex-tester/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 226,
        name: 'Unix时间戳转换器 - 小苏趣研AI',
        description: 'Unix时间戳转换器 - 小苏趣研AI',
        category: 'development',
        tags: ["迁移工具","开发","编程","转换器"],
        icon: 'U',
        url: './tools/unix-timestamp/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 227,
        name: '剪贴板历史管理器 - 小苏趣研AI',
        description: '剪贴板历史管理器 - 小苏趣研AI',
        category: 'development',
        tags: ["迁移工具","开发","编程"],
        icon: '剪',
        url: './tools/clipboard-history/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 6
      },
      {
        id: 228,
        name: '1024游戏 - 小苏趣研AI',
        description: '1024游戏 - 小苏趣研AI',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '1',
        url: './tools/game-1024/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 229,
        name: '2048游戏 - 小苏趣研AI',
        description: '2048游戏 - 小苏趣研AI',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '2',
        url: './tools/game-2048/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 230,
        name: '反应时间测试 - 小苏趣研AI',
        description: '反应时间测试 - 小苏趣研AI',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '反',
        url: './tools/reaction-time-test/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 231,
        name: '真心话大冒险生成器',
        description: '真心话大冒险生成器',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐","生成器"],
        icon: '真',
        url: './tools/truth-or-dare/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 232,
        name: '数独解谜/生成器',
        description: '数独解谜/生成器',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐","生成器"],
        icon: '数',
        url: './tools/sudoku-game/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 233,
        name: '颜色记忆游戏 - 小苏趣研AI',
        description: '颜色记忆游戏 - 小苏趣研AI',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '颜',
        url: './tools/color-memory/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 235,
        name: '批量图片重命名工具',
        description: '批量图片重命名工具',
        category: 'image',
        tags: ["迁移工具","图像","图片"],
        icon: '批',
        url: './tools/rename-batch-pic/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 2
      },
      {
        id: 236,
        name: '图片线稿生成工具',
        description: '图片线稿生成工具',
        category: 'image',
        tags: ["迁移工具","图像","图片","生成器"],
        icon: '图',
        url: './tools/image-to-line-style/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 6
      },
      {
        id: 237,
        name: '网页截图工具',
        description: '网页截图工具',
        category: 'image',
        tags: ["迁移工具","图像","图片"],
        icon: '网',
        url: './tools/web-snapshot/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 238,
        name: '像素风头像生成器',
        description: '像素风头像生成器',
        category: 'image',
        tags: ["迁移工具","图像","图片","生成器"],
        icon: '像',
        url: './tools/pixel-avatar-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 7
      },
      {
        id: 239,
        name: '图片信息查看器 - 小苏趣研AI',
        description: '图片信息查看器 - 小苏趣研AI',
        category: 'image',
        tags: ["迁移工具","图像","图片"],
        icon: '图',
        url: './tools/image-info/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 240,
        name: '黑客帝国数字雨',
        description: '黑客帝国数字雨',
        category: 'learning',
        tags: ["迁移工具","学习","教育"],
        icon: '黑',
        url: './tools/the-matrix-rain/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 241,
        name: '记忆力训练游戏 - Memory Trainer',
        description: '记忆力训练游戏 - Memory Trainer',
        category: 'learning',
        tags: ["迁移工具","学习","教育"],
        icon: '记',
        url: './tools/memory-trainer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 242,
        name: '打字速度测试 - Typing Speed Test',
        description: '打字速度测试 - Typing Speed Test',
        category: 'learning',
        tags: ["迁移工具","学习","教育"],
        icon: '打',
        url: './tools/typing-speed-test/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 243,
        name: '化学元素周期表 - Interactive Periodic Table',
        description: '化学元素周期表 - Interactive Periodic Table',
        category: 'learning',
        tags: ["迁移工具","学习","教育"],
        icon: '化',
        url: './tools/periodic-table/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 244,
        name: '小学六年级必背诗词随机抽查系统',
        description: '小学六年级必背诗词随机抽查系统',
        category: 'learning',
        tags: ["迁移工具","学习","教育"],
        icon: '小',
        url: './tools/poem-check/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 245,
        name: '文本映射工具',
        description: '文本映射工具',
        category: 'learning',
        tags: ["迁移工具","学习","教育"],
        icon: '文',
        url: './tools/text-mapping-tool/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 2
      },
      {
        id: 246,
        name: '节假日倒计时工具',
        description: '节假日倒计时工具',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '节',
        url: './tools/holiday-countdown/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 2
      },
      {
        id: 247,
        name: '精美抽奖转盘',
        description: '精美抽奖转盘',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '精',
        url: './tools/random-lottery/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 248,
        name: '发电陀螺小工具',
        description: '发电陀螺小工具',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '发',
        url: './tools/spin-tool/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 249,
        name: '彩虹屁生成器 - Compliment Generator',
        description: '彩虹屁生成器 - Compliment Generator',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用","生成器"],
        icon: '彩',
        url: './tools/compliment-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 250,
        name: '人生进度条 - Life Progress Bar',
        description: '人生进度条 - Life Progress Bar',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '人',
        url: './tools/life-progress-bar/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 251,
        name: '我们的足迹地图 - Our Footprints Map',
        description: '我们的足迹地图 - Our Footprints Map',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '我',
        url: './tools/our-footprints-map/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 252,
        name: '未来信件邮局 - Future Letter Post Office',
        description: '未来信件邮局 - Future Letter Post Office',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '未',
        url: './tools/future-letter-post-office/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 2
      },
      {
        id: 253,
        name: '"断舍离"决策器 - Decluttering Decision Maker',
        description: '\"断舍离\"决策器 - Decluttering Decision Maker',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '"',
        url: './tools/decluttering-decision-maker/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 254,
        name: '多人随机分组器',
        description: '多人随机分组器',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '多',
        url: './tools/random-group/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 255,
        name: 'AI主题小红书海报',
        description: 'AI主题小红书海报',
        category: 'pdf',
        tags: ["迁移工具","PDF","文档"],
        icon: 'A',
        url: './tools/rednote-post/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 1
      },
      {
        id: 256,
        name: '简易习惯打卡器 - Simple Habit Tracker',
        description: '简易习惯打卡器 - Simple Habit Tracker',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '简',
        url: './tools/simple-habit-tracker/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 257,
        name: '会议发言计时器 - Meeting Speech Timer',
        description: '会议发言计时器 - Meeting Speech Timer',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '会',
        url: './tools/meeting-speech-timer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 7
      },
      {
        id: 258,
        name: '番茄时钟',
        description: '番茄时钟',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '番',
        url: './tools/tomato-clock/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 259,
        name: '每日习惯追踪器',
        description: '每日习惯追踪器',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '每',
        url: './tools/daily-habit-tracker/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 260,
        name: '在线便签贴/白板',
        description: '在线便签贴/白板',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '在',
        url: './tools/sticky-whiteboard/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 7
      },
      {
        id: 261,
        name: 'Excel组织架构图生成器',
        description: 'Excel组织架构图生成器',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力","生成器"],
        icon: 'E',
        url: './tools/org-chart-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 7
      },
      {
        id: 262,
        name: '副业规划管理器 - Side Business Planner',
        description: '副业规划管理器 - Side Business Planner',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '副',
        url: './tools/side-business-planner/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 263,
        name: '只管去做 - 年度目标制定系统',
        description: '只管去做 - 年度目标制定系统',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '只',
        url: './tools/annual-goal-planner/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 264,
        name: '小强升职记 - GTD时间管理系统',
        description: '小强升职记 - GTD时间管理系统',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '小',
        url: './tools/xiaoqiang-time-management/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 265,
        name: '在场证明生成器',
        description: '在场证明生成器',
        category: 'system',
        tags: ["迁移工具","系统","工具","生成器"],
        icon: '在',
        url: './tools/check-snapshot/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 7
      },
      {
        id: 266,
        name: '自定义键盘布局测试器',
        description: '自定义键盘布局测试器',
        category: 'system',
        tags: ["迁移工具","系统","工具"],
        icon: '自',
        url: './tools/keyboard-tester/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 267,
        name: '网页屏幕录制器',
        description: '网页屏幕录制器',
        category: 'system',
        tags: ["迁移工具","系统","工具"],
        icon: '网',
        url: './tools/screen-recorder/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 268,
        name: '简易画廊/图片查看器',
        description: '简易画廊/图片查看器',
        category: 'system',
        tags: ["迁移工具","系统","工具"],
        icon: '简',
        url: './tools/gallery-viewer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 6
      },
      {
        id: 269,
        name: '屏幕分辨率检测器 - 小苏趣研AI',
        description: '屏幕分辨率检测器 - 小苏趣研AI',
        category: 'system',
        tags: ["迁移工具","系统","工具"],
        icon: '屏',
        url: './tools/resolution-detector/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 4
      },
      {
        id: 270,
        name: '文本差异比较工具',
        description: '文本差异比较工具',
        category: 'text',
        tags: ["迁移工具","文本","文字"],
        icon: '文',
        url: './tools/text-compare-diff/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 2
      },
      {
        id: 272,
        name: '文本格式转换器',
        description: '文本格式转换器',
        category: 'text',
        tags: ["迁移工具","文本","文字","转换器"],
        icon: '文',
        url: './tools/text-transfer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 273,
        name: '文章目录生成器 - Table of Contents Generator',
        description: '文章目录生成器 - Table of Contents Generator',
        category: 'text',
        tags: ["迁移工具","文本","文字","生成器"],
        icon: '文',
        url: './tools/toc-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 274,
        name: '文字云生成器',
        description: '文字云生成器',
        category: 'text',
        tags: ["迁移工具","文本","文字","生成器"],
        icon: '文',
        url: './tools/word-cloud-create/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 275,
        name: '打字特效游乐场',
        description: '打字特效游乐场',
        category: 'text',
        tags: ["迁移工具","文本","文字"],
        icon: '打',
        url: './tools/word-type-effect/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 6
      },
      {
        id: 276,
        name: '倒放文字生成器',
        description: '倒放文字生成器',
        category: 'text',
        tags: ["迁移工具","文本","文字","生成器"],
        icon: '倒',
        url: './tools/reverse-text/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 3
      },
      {
        id: 277,
        name: '文本摘要工具 - 小苏趣研AI',
        description: '文本摘要工具 - 小苏趣研AI',
        category: 'text',
        tags: ["迁移工具","文本","文字"],
        icon: '文',
        url: './tools/text-summarizer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 5
      },
      {
        id: 278,
        name: '文字转ASCII艺术',
        description: '文字转ASCII艺术',
        category: 'text',
        tags: ["迁移工具","文本","文字"],
        icon: '文',
        url: './tools/ascii-art/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 6
      },
      {
        id: 279,
        name: '新零售中心组织结构图',
        description: '新零售中心组织结构图',
        category: 'others',
        tags: ["迁移工具","效率","生产力","生成器"],
        icon: '新',
        url: './tools/org-chart-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 10,
        complexity: 7
      },
      {
        id: 281,
        name: '数字禅意花园 - Digital Zen Garden',
        description: '数字禅意花园 - Digital Zen Garden',
        category: 'design',
        tags: ["迁移工具","设计","创意"],
        icon: '数',
        url: './tools/digital-zen-garden/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 9,
        complexity: 7
      },
      {
        id: 282,
        name: '九宫格图片切分工具',
        description: '九宫格图片切分工具',
        category: 'image',
        tags: ["迁移工具","图像","图片"],
        icon: '九',
        url: './tools/nine-square-split/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 9,
        complexity: 7
      },
      {
        id: 283,
        name: '小红书图片转PDF工具',
        description: '小红书图片转PDF工具',
        category: 'image',
        tags: ["迁移工具","图像","图片"],
        icon: '小',
        url: './tools/rednote-image2pdf/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 9,
        complexity: 7
      },
      {
        id: 284,
        name: 'Favicon 生成器',
        description: 'Favicon 生成器',
        category: 'image',
        tags: ["迁移工具","图像","图片","生成器"],
        icon: 'F',
        url: './tools/favicon-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 9,
        complexity: 8
      },
      {
        id: 285,
        name: '视觉计时沙漏 - 小苏趣研AI',
        description: '视觉计时沙漏 - 小苏趣研AI',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: '视',
        url: './tools/sand-timer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 9,
        complexity: 5
      },
      {
        id: 286,
        name: 'PDF 水印移除工具',
        description: 'PDF 水印移除工具',
        category: 'pdf',
        tags: ["迁移工具","PDF","文档"],
        icon: 'P',
        url: './tools/pdf-watermark-remover/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 9,
        complexity: 7
      },
      {
        id: 287,
        name: '打地鼠游戏',
        description: '打地鼠游戏',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '打',
        url: './tools/whack-a-mole/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 5
      },
      {
        id: 288,
        name: '迷宫生成器',
        description: '迷宫生成器',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐","生成器"],
        icon: '迷',
        url: './tools/maze-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 7
      },
      {
        id: 289,
        name: '亮灯解谜游戏',
        description: '亮灯解谜游戏',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '亮',
        url: './tools/light-up-puzzle/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 5
      },
      {
        id: 290,
        name: '图片压缩器',
        description: '图片压缩器',
        category: 'image',
        tags: ["迁移工具","图像","图片"],
        icon: '图',
        url: './tools/image-zip/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 8
      },
      {
        id: 291,
        name: '图片颜色提取器',
        description: '图片颜色提取器',
        category: 'image',
        tags: ["迁移工具","图像","图片"],
        icon: '图',
        url: './tools/image-palette/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 8
      },
      {
        id: 292,
        name: '滑稽证件生成器',
        description: '滑稽证件生成器',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用","生成器"],
        icon: '滑',
        url: './tools/funny-certificate-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 7
      },
      {
        id: 293,
        name: 'DIY表情包制作器 - Meme Generator',
        description: 'DIY表情包制作器 - Meme Generator',
        category: 'lifestyle',
        tags: ["迁移工具","生活","实用"],
        icon: 'D',
        url: './tools/meme-generator/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 6
      },
      {
        id: 294,
        name: '目标管理工具',
        description: '目标管理工具',
        category: 'productivity',
        tags: ["迁移工具","效率","生产力"],
        icon: '目',
        url: './tools/goal-management-tofix/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 9
      },
      {
        id: 295,
        name: '设备信息查看器 - My Device Info',
        description: '设备信息查看器 - My Device Info',
        category: 'system',
        tags: ["迁移工具","系统","工具"],
        icon: '设',
        url: './tools/my-device-info/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 8,
        complexity: 8
      },
      {
        id: 296,
        name: '数字泡泡膜解压神器',
        description: '数字泡泡膜解压神器',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '数',
        url: './tools/bubble-wrap/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 7,
        complexity: 7
      },
      {
        id: 297,
        name: '音频可视化器',
        description: '音频可视化器',
        category: 'system',
        tags: ["迁移工具","系统","工具"],
        icon: '音',
        url: './tools/audio-visualizer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 7,
        complexity: 9
      },
      {
        id: 298,
        name: '屏幕破裂效果 - 小苏趣研AI',
        description: '屏幕破裂效果 - 小苏趣研AI',
        category: 'system',
        tags: ["迁移工具","系统","工具"],
        icon: '屏',
        url: './tools/screen-crack/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 7,
        complexity: 9
      },
      {
        id: 299,
        name: '简易平台跳跃游戏',
        description: '简易平台跳跃游戏',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '简',
        url: './tools/simple-platformer/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 6,
        complexity: 7
      },
      {
        id: 300,
        name: '找不同小游戏 - 小苏趣研AI',
        description: '找不同小游戏 - 小苏趣研AI',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '找',
        url: './tools/spot-difference/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 6,
        complexity: 7
      },
      {
        id: 301,
        name: '简易拼图游戏',
        description: '简易拼图游戏',
        category: 'games',
        tags: ["迁移工具","游戏","娱乐"],
        icon: '简',
        url: './tools/jigsaw-puzzle/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: 5,
        complexity: 8
      }
    ];

    // 生成分类数据
    this.categories = [
      { id: 'all', name: '全部工具', icon: 'grid', count: this.tools.length },
      { id: 'utility', name: '实用工具', icon: 'tool', count: this.tools.filter(t => t.category === 'utility').length },
      { id: 'calculator', name: '计算器', icon: 'calculator', count: this.tools.filter(t => t.category === 'calculator').length },
      { id: 'design', name: '设计工具', icon: 'palette', count: this.tools.filter(t => t.category === 'design').length },
      { id: 'development', name: '开发工具', icon: 'code', count: this.tools.filter(t => t.category === 'development').length },
      { id: 'games', name: '游戏娱乐', icon: 'gamepad', count: this.tools.filter(t => t.category === 'games').length },
      { id: 'image', name: '图像工具', icon: 'image', count: this.tools.filter(t => t.category === 'image').length },
      { id: 'learning', name: '学习工具', icon: 'book', count: this.tools.filter(t => t.category === 'learning').length },
      { id: 'lifestyle', name: '生活工具', icon: 'heart', count: this.tools.filter(t => t.category === 'lifestyle').length },
      { id: 'pdf', name: 'PDF工具', icon: 'file-text', count: this.tools.filter(t => t.category === 'pdf').length },
      { id: 'productivity', name: '效率工具', icon: 'zap', count: this.tools.filter(t => t.category === 'productivity').length },
      { id: 'system', name: '系统工具', icon: 'settings', count: this.tools.filter(t => t.category === 'system').length },
      { id: 'text', name: '文本工具', icon: 'type', count: this.tools.filter(t => t.category === 'text').length }];
  }

  // 渲染分类导航
  renderCategories() {
    const categoryList = document.getElementById('categoryList');
    const categoryItems = this.categories.map(category => {
      const isActive = category.id === this.currentCategory ? 'active' : '';
      return `
        <li class="category-item ${isActive}" data-category="${category.id}">
          <a href="#" class="category-link">
            ${this.getCategoryIcon(category.icon)}
            <span class="category-name">${category.name}</span>
            <span class="category-count" id="count-${category.id}">${category.count}</span>
          </a>
        </li>
      `;
    }).join('');

    categoryList.innerHTML = categoryItems;
  }

  // 获取分类图标
  getCategoryIcon(iconName) {
    const icons = {
      'grid': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/><rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/><rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/></svg>',
      'tool': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2"/></svg>',
      'calculator': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" stroke-width="2"/><rect x="6" y="4" width="8" height="3" rx="1" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="10" r="1" fill="currentColor"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="13" cy="10" r="1" fill="currentColor"/><circle cx="7" cy="13" r="1" fill="currentColor"/><circle cx="10" cy="13" r="1" fill="currentColor"/><circle cx="13" cy="13" r="1" fill="currentColor"/></svg>',
      'palette': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.54 0 3-1.46 3-3 0-.79-.31-1.53-.86-2.07-.54-.53-.86-1.26-.86-2.07 0-1.66 1.34-3 3-3h1.02C18.84 12 20 10.84 20 9.02 20 5.51 16.49 2 12 2z" stroke="currentColor" stroke-width="2"/><circle cx="6.5" cy="11.5" r="1.5" fill="currentColor"/><circle cx="9.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="14.5" cy="7.5" r="1.5" fill="currentColor"/></svg>',
      'code': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 8l-4 4 4 4M14 8l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'gamepad': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 10h4M8 8v4M14 9h.01M16 11h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="2" y="6" width="16" height="8" rx="4" stroke="currentColor" stroke-width="2"/></svg>',
      'image': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/><path d="M17 13l-5-5L8 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'book': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 3h6a4 4 0 014 4v9a3 3 0 00-3-3H2V3zM18 3h-6a4 4 0 00-4 4v9a3 3 0 013-3h7V3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'heart': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17.84 3.16a4.5 4.5 0 00-6.36 0L10 4.64l-1.48-1.48a4.5 4.5 0 00-6.36 6.36L10 17.36l7.84-7.84a4.5 4.5 0 000-6.36z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'file-text': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2"/><path d="M9 9h6M9 13h6M9 17h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      'zap': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="13,2 3,14 12,14 7,22 17,10 8,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      'settings': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" stroke-width="2"/></svg>',
      'type': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="4,7 4,4 20,4 20,7" stroke="currentColor" stroke-width="2"/><line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" stroke-width="2"/><line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" stroke-width="2"/></svg>',
      'star': '<svg class="category-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1l3.09 6.26L20 8.27l-5 4.87 1.18 6.88L10 16.77l-6.18 3.25L5 13.14 0 8.27l6.91-1.01L10 1z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
    };
    return icons[iconName] || icons['grid'];
  }

  // 渲染工具卡片
  renderTools() {
    const filteredTools = this.getFilteredTools();
    const toolsGrid = document.getElementById('toolsGrid');
    const emptyState = document.getElementById('emptyState');

    if (filteredTools.length === 0) {
      toolsGrid.style.display = 'none';
      emptyState.style.display = 'flex';
      return;
    }

    toolsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    const toolCards = filteredTools.map(tool => this.createToolCard(tool)).join('');
    toolsGrid.innerHTML = toolCards;

    // 添加点击事件
    toolsGrid.querySelectorAll('.tool-card').forEach((card, index) => {
      card.addEventListener('click', () => this.openTool(filteredTools[index]));
    });

    // 更新分类计数
    this.updateCategoryCounts();
  }

  // 创建工具卡片HTML
  createToolCard(tool) {
    const tags = tool.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
    const originalBadge = "";

    return `
      <div class="tool-card fade-in" data-tool-id="${tool.id}">
        <div class="card-icon">${tool.icon}</div>
        <h3 class="card-title">${tool.name}</h3>
        <p class="card-description">${tool.description}</p>
        <div class="card-tags">${tags}</div>
        <button class="card-action">使用工具</button>
      </div>
    `;
  }

  // 获取过滤后的工具
  getFilteredTools() {
    let filtered = this.tools;

    // 按分类过滤
    if (this.currentCategory !== 'all') {
      {
        filtered = filtered.filter(tool => tool.category === this.currentCategory);
      }
    }

    // 按搜索关键词过滤
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 排序
    return this.sortTools(filtered);
  }

  // 排序工具
  sortTools(tools) {
    switch (this.sortBy) {
      case 'name':
        return tools.sort((a, b) => a.name.localeCompare(b.name));
      case 'category':
        return tools.sort((a, b) => a.category.localeCompare(b.category));
      case 'popular':
        return tools.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
      default:
        return tools;
    }
  }

  // 更新分类计数
  updateCategoryCounts() {
    this.categories.forEach(category => {
      const count = category.id === 'all'
        ? this.getFilteredTools().length
        : this.tools.filter(tool => tool.category === category.id &&
            (this.searchQuery === '' || this.toolMatchesSearch(tool))).length;

      const countElement = document.getElementById(`count-${category.id}`);
      if (countElement) {
        countElement.textContent = count;
      }
    });
  }

  // 检查工具是否匹配搜索
  toolMatchesSearch(tool) {
    if (!this.searchQuery) return true;
    const query = this.searchQuery.toLowerCase();
    return tool.name.toLowerCase().includes(query) ||
           tool.description.toLowerCase().includes(query) ||
           tool.tags.some(tag => tag.toLowerCase().includes(query));
  }

  // 处理搜索
  handleSearch(event) {
    this.searchQuery = event.target.value.trim();
    const searchBox = event.target.parentElement;

    if (this.searchQuery) {
      searchBox.classList.add('has-content');
    } else {
      searchBox.classList.remove('has-content');
    }

    this.renderTools();
    this.updateCurrentCategoryTitle();
  }

  // 处理搜索键盘事件
  handleSearchKeydown(event) {
    if (event.key === 'Escape') {
      this.clearSearch();
    }
  }

  // 清除搜索
  clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBox = searchInput.parentElement;

    searchInput.value = '';
    this.searchQuery = '';
    searchBox.classList.remove('has-content');

    this.renderTools();
    this.updateCurrentCategoryTitle();
    searchInput.focus();
  }

  // 切换侧边栏
  toggleSidebar() {
    const main = document.querySelector('.main');
    main.classList.toggle('sidebar-collapsed');

    const toggle = document.getElementById('sidebarToggle');
    const icon = toggle.querySelector('svg');

    if (main.classList.contains('sidebar-collapsed')) {
      icon.style.transform = 'rotate(180deg)';
    } else {
      icon.style.transform = 'rotate(0deg)';
    }
  }

  // 切换移动端侧边栏
  toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.getElementById('mobileMenuToggle');

    sidebar.classList.toggle('mobile-open');
    toggle.classList.toggle('active');
  }

  // 处理视图切换
  handleViewChange(event) {
    const viewBtn = event.currentTarget;
    const view = viewBtn.dataset.view;

    if (view === this.currentView) return;

    // 更新按钮状态
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    viewBtn.classList.add('active');

    // 更新视图
    this.currentView = view;
    const toolsGrid = document.getElementById('toolsGrid');

    if (view === 'list') {
      toolsGrid.classList.add('list-view');
    } else {
      toolsGrid.classList.remove('list-view');
    }
  }

  // 处理排序变化
  handleSortChange(event) {
    this.sortBy = event.target.value;
    this.renderTools();
  }

  // 处理分类点击
  handleCategoryClick(event) {
    event.preventDefault();

    const categoryItem = event.target.closest('.category-item');
    if (!categoryItem) return;

    const category = categoryItem.dataset.category;
    if (category === this.currentCategory) return;

    // 更新分类状态
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    categoryItem.classList.add('active');

    this.currentCategory = category;
    this.renderTools();
    this.updateCurrentCategoryTitle();

    // 移动端自动关闭侧边栏
    if (window.innerWidth <= 768) {
      this.toggleMobileSidebar();
    }
  }

  // 更新当前分类标题
  updateCurrentCategoryTitle() {
    const category = this.categories.find(cat => cat.id === this.currentCategory);
    const titleElement = document.getElementById('currentCategoryTitle');
    const subtitleElement = document.getElementById('currentCategorySubtitle');

    if (this.searchQuery) {
      titleElement.textContent = `搜索结果: "${this.searchQuery}"`;
      subtitleElement.textContent = `在 ${category.name} 中找到 ${this.getFilteredTools().length} 个工具`;
    } else {
      titleElement.textContent = category.name;
      subtitleElement.textContent = category.id === 'all' ? '发现最新最实用的AI工具' : `${category.count} 个工具`;
    }
  }

  // 处理滚动
  handleScroll() {
    const backToTop = document.getElementById('backToTop');

    if (window.pageYOffset > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  // 滚动到顶部
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // 处理窗口大小变化
  handleResize() {
    if (window.innerWidth > 768) {
      const sidebar = document.querySelector('.sidebar');
      const toggle = document.getElementById('mobileMenuToggle');

      sidebar.classList.remove('mobile-open');
      toggle.classList.remove('active');
    }
  }

  // 打开工具
  openTool(tool) {
    // 这里可以添加打开工具的逻辑
    // 例如：在新标签页中打开工具链接
    if (tool.url) {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }

    // 可以添加使用统计等功能
    console.log(`Opening tool: ${tool.name}`);
  }

  // 隐藏加载状态
  hideLoading() {
    const loadingState = document.getElementById('loadingState');
    loadingState.style.display = 'none';
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new AIToolsApp();
});

// 添加一些实用的全局函数
window.AIToolsUtils = {
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 节流函数
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 格式化数字
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
};

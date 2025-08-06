# AI工具集 - 智能工具一站式平台

一个现代化、响应式的AI工具集网站，采用卡片式布局，提供良好的用户体验。

## ✨ 特性

- 🎨 **现代化设计** - 采用渐变色彩和卡片式布局
- 📱 **响应式设计** - 完美适配桌面端、平板和移动端
- 🔍 **智能搜索** - 支持工具名称、描述和标签搜索
- 🏷️ **分类管理** - 左侧垂直导航，支持工具分类浏览
- 🌓 **主题切换** - 明暗模式切换功能
- ⚡ **性能优化** - 懒加载、防抖搜索等优化
- ♿ **无障碍支持** - 键盘导航和屏幕阅读器支持

## 🚀 快速开始

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd xiaosuqyai-tool-set
   ```

2. **启动本地服务器**
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve .
   
   # 或使用PHP
   php -S localhost:8000
   ```

3. **访问网站**
   打开浏览器访问 `http://localhost:8000`

## 📁 项目结构

```
xiaosuqyai-tool-set/
├── index.html          # 主页面
├── css/
│   └── styles.css      # 样式文件
├── js/
│   └── app.js          # 主要JavaScript逻辑
├── assets/
│   └── favicon.svg     # 网站图标
└── README.md           # 项目说明
```

## 🎨 设计规范

### 配色方案
- **主色调**: #5B6AFF (蓝紫色)
- **次要色**: #8C54FF (紫色)
- **背景色**: #FFFFFF / #F5F7FA
- **文字色**: #333333 / #666666 / #999999

### 布局特点
- **顶部导航**: 60px高度，包含Logo、搜索框、主题切换
- **左侧导航**: 240px宽度，可收缩至60px
- **主内容区**: CSS Grid响应式布局
- **卡片设计**: 12px圆角，渐变悬停效果

## 🔧 功能说明

### 搜索功能
- 实时搜索过滤
- 支持工具名称、描述、标签搜索
- 搜索建议和自动完成
- ESC键清除搜索

### 分类系统
- 动态分类导航
- 分类计数显示
- URL路由支持
- 移动端自适应

### 主题切换
- 明暗模式切换
- localStorage持久化
- 平滑过渡动画
- 系统主题检测

### 响应式设计
- 桌面端: 3-4列网格布局
- 平板端: 2列布局
- 移动端: 单列布局 + 抽屉式导航

## 🛠️ 技术栈

- **HTML5** - 语义化标记
- **CSS3** - 现代CSS特性，CSS Grid/Flexbox
- **JavaScript ES6+** - 模块化开发
- **SVG图标** - 矢量图标系统
- **Web标准** - 无第三方依赖

## 📱 浏览器支持

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 🎯 待实现功能

- [ ] 工具收藏功能
- [ ] 用户评分系统
- [ ] 工具使用统计
- [ ] 高级筛选选项
- [ ] 工具详情页面
- [ ] 社交分享功能
- [ ] PWA支持
- [ ] 多语言支持

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 设计灵感来源于现代化的工具导航网站
- 图标来源于 Feather Icons
- 感谢所有贡献者的支持

---

**Made with ❤️ by AI工具集团队**

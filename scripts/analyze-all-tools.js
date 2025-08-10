#!/usr/bin/env node

/**
 * 全面分析 html-util-set 中的所有工具
 * 生成完整的工具清单和迁移计划
 */

const fs = require('fs');
const path = require('path');

class ToolAnalyzer {
    constructor() {
        this.sourceDir = '../html-util-set';
        this.tools = [];
        this.categories = new Map();
        this.categoryMapping = {
            'calculator-tools': { name: '计算器工具', id: 'calculator', icon: 'calculator' },
            'design-tools': { name: '设计工具', id: 'design', icon: 'palette' },
            'dev-tools': { name: '开发工具', id: 'development', icon: 'code' },
            'games': { name: '游戏娱乐', id: 'games', icon: 'gamepad' },
            'image-tools': { name: '图像工具', id: 'image', icon: 'image' },
            'learning-tools': { name: '学习工具', id: 'learning', icon: 'book' },
            'life-tools': { name: '生活工具', id: 'lifestyle', icon: 'heart' },
            'pdf-tools': { name: 'PDF工具', id: 'pdf', icon: 'file-text' },
            'productivity-tools': { name: '效率工具', id: 'productivity', icon: 'zap' },
            'system-tools': { name: '系统工具', id: 'system', icon: 'settings' },
            'text-tools': { name: '文本工具', id: 'text', icon: 'type' }
        };
    }

    // 分析所有工具
    async analyzeAllTools() {
        console.log('🔍 开始分析 html-util-set 中的所有工具...\n');

        // 扫描所有分类目录
        const categories = fs.readdirSync(this.sourceDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const category of categories) {
            await this.analyzeCategory(category);
        }

        // 分析根目录的独立工具
        await this.analyzeRootTools();

        // 生成报告
        this.generateReport();
        this.generateMigrationPlan();
        this.generateToolsConfig();

        return {
            totalTools: this.tools.length,
            categories: Array.from(this.categories.entries()),
            tools: this.tools
        };
    }

    // 分析单个分类
    async analyzeCategory(categoryName) {
        const categoryPath = path.join(this.sourceDir, categoryName);
        
        if (!fs.existsSync(categoryPath)) {
            return;
        }

        console.log(`📁 分析分类: ${categoryName}`);

        const files = fs.readdirSync(categoryPath)
            .filter(file => file.endsWith('.html'));

        let categoryCount = 0;
        for (const file of files) {
            const toolInfo = await this.analyzeToolFile(categoryPath, file, categoryName);
            if (toolInfo) {
                this.tools.push(toolInfo);
                categoryCount++;
            }
        }

        this.categories.set(categoryName, {
            ...this.categoryMapping[categoryName],
            count: categoryCount,
            files: files
        });

        console.log(`   ✅ 发现 ${categoryCount} 个工具\n`);
    }

    // 分析根目录工具
    async analyzeRootTools() {
        console.log('📁 分析根目录工具');

        const files = fs.readdirSync(this.sourceDir)
            .filter(file => file.endsWith('.html'));

        let rootCount = 0;
        for (const file of files) {
            const toolInfo = await this.analyzeToolFile(this.sourceDir, file, 'root');
            if (toolInfo) {
                this.tools.push(toolInfo);
                rootCount++;
            }
        }

        if (rootCount > 0) {
            this.categories.set('root', {
                name: '其他工具',
                id: 'others',
                icon: 'more-horizontal',
                count: rootCount,
                files: files
            });
        }

        console.log(`   ✅ 发现 ${rootCount} 个根目录工具\n`);
    }

    // 分析单个工具文件
    async analyzeToolFile(dirPath, fileName, category) {
        const filePath = path.join(dirPath, fileName);
        
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // 提取基本信息
            const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim().replace(' - AI工具集', '') : fileName.replace('.html', '');
            
            const descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i);
            const description = descMatch ? descMatch[1].trim() : title;

            // 分析技术特征
            const hasCanvas = content.includes('<canvas') || content.includes('getContext');
            const hasWebGL = content.includes('webgl') || content.includes('WebGL');
            const hasAudio = content.includes('<audio') || content.includes('AudioContext');
            const hasVideo = content.includes('<video') || content.includes('MediaRecorder');
            const hasFileAPI = content.includes('FileReader') || content.includes('File API');
            const hasLocalStorage = content.includes('localStorage') || content.includes('sessionStorage');
            
            // 检查外部依赖
            const externalDeps = [];
            const linkMatches = content.match(/<link[^>]*href="https?:\/\/[^"]*"/gi) || [];
            const scriptMatches = content.match(/<script[^>]*src="https?:\/\/[^"]*"/gi) || [];
            externalDeps.push(...linkMatches, ...scriptMatches);

            // 计算复杂度
            const complexity = this.calculateComplexity(content, {
                hasCanvas, hasWebGL, hasAudio, hasVideo, hasFileAPI,
                externalDepsCount: externalDeps.length
            });

            return {
                fileName,
                filePath,
                title,
                description,
                category,
                categoryInfo: this.categoryMapping[category] || { name: '其他', id: 'others' },
                fileSize: fs.statSync(filePath).size,
                hasCanvas,
                hasWebGL,
                hasAudio,
                hasVideo,
                hasFileAPI,
                hasLocalStorage,
                externalDeps,
                complexity,
                priority: this.calculatePriority(category, complexity, title)
            };
        } catch (error) {
            console.error(`   ❌ 分析失败: ${fileName} - ${error.message}`);
            return null;
        }
    }

    // 计算工具复杂度
    calculateComplexity(content, features) {
        let score = 1; // 基础分数

        // 基于内容长度
        if (content.length > 50000) score += 3;
        else if (content.length > 20000) score += 2;
        else if (content.length > 10000) score += 1;

        // 基于技术特征
        if (features.hasCanvas) score += 2;
        if (features.hasWebGL) score += 3;
        if (features.hasAudio || features.hasVideo) score += 2;
        if (features.hasFileAPI) score += 1;
        if (features.externalDepsCount > 0) score += 1;

        // 基于脚本复杂度
        const scriptMatches = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
        const totalScriptLength = scriptMatches.reduce((sum, script) => sum + script.length, 0);
        if (totalScriptLength > 10000) score += 2;
        else if (totalScriptLength > 5000) score += 1;

        return Math.min(score, 10); // 最高10分
    }

    // 计算迁移优先级
    calculatePriority(category, complexity, title) {
        let priority = 5; // 基础优先级

        // 基于分类的优先级调整
        const categoryPriorities = {
            'dev-tools': 3,
            'text-tools': 2,
            'calculator-tools': 2,
            'image-tools': 1,
            'productivity-tools': 2,
            'design-tools': 1,
            'system-tools': 1,
            'games': -1,
            'learning-tools': 0,
            'life-tools': -1,
            'pdf-tools': 1
        };

        priority += categoryPriorities[category] || 0;

        // 基于复杂度调整（复杂度低的优先）
        priority += (10 - complexity);

        // 基于工具名称的特殊调整
        if (title.includes('生成') || title.includes('转换') || title.includes('计算')) priority += 1;
        if (title.includes('游戏') || title.includes('娱乐')) priority -= 1;

        return Math.max(1, Math.min(priority, 10));
    }

    // 生成分析报告
    generateReport() {
        const report = {
            summary: {
                totalTools: this.tools.length,
                totalCategories: this.categories.size,
                averageComplexity: this.tools.reduce((sum, tool) => sum + tool.complexity, 0) / this.tools.length
            },
            categories: Array.from(this.categories.entries()).map(([key, value]) => ({
                key,
                ...value
            })),
            topPriorityTools: this.tools
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 20)
                .map(tool => ({
                    title: tool.title,
                    category: tool.category,
                    priority: tool.priority,
                    complexity: tool.complexity
                })),
            complexityDistribution: this.getComplexityDistribution(),
            migrationBatches: this.generateMigrationBatches()
        };

        fs.writeFileSync('./tools-analysis-report.json', JSON.stringify(report, null, 2));
        console.log('📊 分析报告已生成: tools-analysis-report.json');
    }

    // 生成复杂度分布
    getComplexityDistribution() {
        const distribution = {};
        for (let i = 1; i <= 10; i++) {
            distribution[i] = this.tools.filter(tool => tool.complexity === i).length;
        }
        return distribution;
    }

    // 生成迁移批次
    generateMigrationBatches() {
        const sortedTools = this.tools.sort((a, b) => b.priority - a.priority);
        
        return [
            {
                name: 'batch1_high_priority',
                description: '第一批：高优先级工具（开发、文本、计算器）',
                tools: sortedTools.filter(t => t.priority >= 8).slice(0, 15)
            },
            {
                name: 'batch2_medium_priority',
                description: '第二批：中优先级工具（图像、效率、设计）',
                tools: sortedTools.filter(t => t.priority >= 6 && t.priority < 8).slice(0, 20)
            },
            {
                name: 'batch3_utility_tools',
                description: '第三批：实用工具（系统、PDF、学习）',
                tools: sortedTools.filter(t => t.priority >= 4 && t.priority < 6).slice(0, 25)
            },
            {
                name: 'batch4_entertainment',
                description: '第四批：娱乐工具（游戏、生活）',
                tools: sortedTools.filter(t => t.priority < 4)
            }
        ];
    }

    // 生成迁移计划
    generateMigrationPlan() {
        const plan = {
            totalTools: this.tools.length,
            estimatedTime: `${Math.ceil(this.tools.length / 10)} 小时`,
            phases: [
                {
                    phase: 1,
                    name: '核心工具迁移',
                    tools: this.tools.filter(t => t.priority >= 8).length,
                    description: '迁移最重要的开发和文本工具'
                },
                {
                    phase: 2,
                    name: '实用工具迁移',
                    tools: this.tools.filter(t => t.priority >= 6 && t.priority < 8).length,
                    description: '迁移图像、计算器等实用工具'
                },
                {
                    phase: 3,
                    name: '辅助工具迁移',
                    tools: this.tools.filter(t => t.priority >= 4 && t.priority < 6).length,
                    description: '迁移系统、学习等辅助工具'
                },
                {
                    phase: 4,
                    name: '娱乐工具迁移',
                    tools: this.tools.filter(t => t.priority < 4).length,
                    description: '迁移游戏和娱乐工具'
                }
            ],
            recommendations: [
                '建议分批次进行迁移，每批次10-15个工具',
                '优先迁移开发工具和文本工具，这些使用频率最高',
                '复杂度高的工具需要额外测试时间',
                '游戏类工具可以最后迁移，优先级较低'
            ]
        };

        fs.writeFileSync('./migration-plan.json', JSON.stringify(plan, null, 2));
        console.log('📋 迁移计划已生成: migration-plan.json');
    }

    // 生成工具配置
    generateToolsConfig() {
        const config = {
            categories: Array.from(this.categories.entries()).map(([key, value]) => ({
                id: value.id,
                name: value.name,
                icon: value.icon,
                count: value.count,
                originalKey: key
            })),
            tools: this.tools.map((tool, index) => ({
                id: 200 + index, // 从200开始避免冲突
                name: tool.title,
                description: tool.description,
                category: tool.categoryInfo.id,
                tags: this.generateTags(tool),
                icon: tool.title.charAt(0),
                url: `./tools/${this.generateToolSlug(tool.fileName)}/`,
                isLocal: true,
                isOriginal: false,
                isMigrated: true,
                priority: tool.priority,
                complexity: tool.complexity,
                sourceFile: tool.fileName,
                sourceCategory: tool.category
            }))
        };

        fs.writeFileSync('./tools-config.json', JSON.stringify(config, null, 2));
        console.log('⚙️  工具配置已生成: tools-config.json');
    }

    // 生成工具标签
    generateTags(tool) {
        const tags = ['迁移工具'];
        const title = tool.title.toLowerCase();
        const category = tool.category;

        // 基于分类的标签
        const categoryTags = {
            'calculator-tools': ['计算器', '数学'],
            'design-tools': ['设计', '创意'],
            'dev-tools': ['开发', '编程'],
            'games': ['游戏', '娱乐'],
            'image-tools': ['图像', '图片'],
            'learning-tools': ['学习', '教育'],
            'life-tools': ['生活', '实用'],
            'pdf-tools': ['PDF', '文档'],
            'productivity-tools': ['效率', '生产力'],
            'system-tools': ['系统', '工具'],
            'text-tools': ['文本', '文字']
        };

        if (categoryTags[category]) {
            tags.push(...categoryTags[category]);
        }

        // 基于标题的标签
        if (title.includes('生成')) tags.push('生成器');
        if (title.includes('转换')) tags.push('转换器');
        if (title.includes('计算')) tags.push('计算器');
        if (title.includes('检查') || title.includes('验证')) tags.push('检查器');
        if (title.includes('编辑') || title.includes('修改')) tags.push('编辑器');

        return [...new Set(tags)]; // 去重
    }

    // 生成工具目录名
    generateToolSlug(fileName) {
        return fileName
            .replace('.html', '')
            .replace(/^\d+_/, '') // 移除数字前缀
            .replace(/_/g, '-')   // 下划线转连字符
            .toLowerCase();
    }
}

// 导出类
module.exports = ToolAnalyzer;

// 如果直接运行此脚本
if (require.main === module) {
    const analyzer = new ToolAnalyzer();
    analyzer.analyzeAllTools().then(result => {
        console.log(`\n🎉 分析完成！`);
        console.log(`📊 总计发现 ${result.totalTools} 个工具`);
        console.log(`📁 分布在 ${result.categories.length} 个分类中`);
        console.log(`\n查看详细报告: tools-analysis-report.json`);
        console.log(`查看迁移计划: migration-plan.json`);
        console.log(`查看工具配置: tools-config.json`);
    }).catch(error => {
        console.error('❌ 分析失败:', error);
    });
}

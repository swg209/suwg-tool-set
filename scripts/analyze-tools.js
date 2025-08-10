#!/usr/bin/env node

/**
 * HTML工具集分析脚本
 * 分析 html-util-set 目录中的工具，提取元数据并生成迁移计划
 */

const fs = require('fs');
const path = require('path');

class ToolAnalyzer {
    constructor() {
        this.sourceDir = '../../html-util-set';
        this.tools = [];
        this.categories = new Map();
    }

    // 分析单个HTML文件
    analyzeHtmlFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileName = path.basename(filePath, '.html');
            
            // 提取标题
            const titleMatch = content.match(/<title>(.*?)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : fileName;
            
            // 提取描述（从注释或meta标签）
            const descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i) ||
                            content.match(/<!--\s*(.*?)\s*-->/);
            const description = descMatch ? descMatch[1].trim() : '';
            
            // 分析文件大小和复杂度
            const fileSize = content.length;
            const hasExternalDeps = content.includes('cdn.') || content.includes('https://');
            const hasCanvas = content.includes('<canvas') || content.includes('canvas');
            const hasWebGL = content.includes('webgl') || content.includes('WebGL');
            const hasAudio = content.includes('<audio') || content.includes('Audio');
            const hasVideo = content.includes('<video') || content.includes('Video');
            
            // 根据文件名和内容推断分类
            const category = this.inferCategory(fileName, title, content);
            
            // 评估迁移难度
            const migrationDifficulty = this.assessMigrationDifficulty(content, hasExternalDeps);
            
            return {
                fileName,
                filePath,
                title,
                description,
                category,
                fileSize,
                hasExternalDeps,
                hasCanvas,
                hasWebGL,
                hasAudio,
                hasVideo,
                migrationDifficulty,
                priority: this.calculatePriority(category, migrationDifficulty, fileSize)
            };
        } catch (error) {
            console.error(`Error analyzing ${filePath}:`, error.message);
            return null;
        }
    }

    // 推断工具分类
    inferCategory(fileName, title, content) {
        const lowerTitle = title.toLowerCase();
        const lowerContent = content.toLowerCase();
        
        // 文本处理工具
        if (lowerTitle.includes('文字') || lowerTitle.includes('字数') || 
            lowerTitle.includes('文本') || lowerTitle.includes('text')) {
            return 'text';
        }
        
        // 图像处理工具
        if (lowerTitle.includes('图片') || lowerTitle.includes('图像') || 
            lowerTitle.includes('image') || content.includes('canvas')) {
            return 'image';
        }
        
        // 颜色工具
        if (lowerTitle.includes('颜色') || lowerTitle.includes('color') || 
            lowerTitle.includes('调色') || lowerTitle.includes('配色')) {
            return 'color';
        }
        
        // 开发工具
        if (lowerTitle.includes('json') || lowerTitle.includes('代码') || 
            lowerTitle.includes('css') || lowerTitle.includes('html') ||
            lowerTitle.includes('正则') || lowerTitle.includes('regex')) {
            return 'development';
        }
        
        // 计算工具
        if (lowerTitle.includes('计算') || lowerTitle.includes('转换') || 
            lowerTitle.includes('calculator') || lowerTitle.includes('converter')) {
            return 'calculator';
        }
        
        // 生成器工具
        if (lowerTitle.includes('生成') || lowerTitle.includes('generator') || 
            lowerTitle.includes('二维码') || lowerTitle.includes('密码')) {
            return 'generator';
        }
        
        // 游戏娱乐
        if (lowerTitle.includes('游戏') || lowerTitle.includes('game') || 
            lowerTitle.includes('抽奖') || lowerTitle.includes('娱乐')) {
            return 'game';
        }
        
        // 时间工具
        if (lowerTitle.includes('时间') || lowerTitle.includes('日期') || 
            lowerTitle.includes('time') || lowerTitle.includes('倒计时')) {
            return 'time';
        }
        
        // 系统工具
        if (lowerTitle.includes('设备') || lowerTitle.includes('系统') || 
            lowerTitle.includes('device') || lowerTitle.includes('screen')) {
            return 'system';
        }
        
        return 'utility';
    }

    // 评估迁移难度
    assessMigrationDifficulty(content, hasExternalDeps) {
        let difficulty = 1; // 1=简单, 2=中等, 3=困难
        
        // 外部依赖增加难度
        if (hasExternalDeps) difficulty += 1;
        
        // 复杂的JavaScript增加难度
        if (content.includes('class ') && content.split('class ').length > 3) difficulty += 1;
        if (content.includes('async ') || content.includes('await ')) difficulty += 0.5;
        if (content.includes('WebGL') || content.includes('Three.js')) difficulty += 2;
        
        // 文件大小影响
        if (content.length > 50000) difficulty += 1;
        if (content.length > 100000) difficulty += 1;
        
        return Math.min(Math.ceil(difficulty), 3);
    }

    // 计算优先级
    calculatePriority(category, difficulty, fileSize) {
        let priority = 5; // 基础优先级
        
        // 实用工具优先级更高
        const highPriorityCategories = ['text', 'development', 'generator', 'calculator'];
        if (highPriorityCategories.includes(category)) priority += 2;
        
        // 简单的工具优先级更高
        priority += (4 - difficulty);
        
        // 文件大小适中的优先级更高
        if (fileSize > 5000 && fileSize < 50000) priority += 1;
        
        return Math.max(1, Math.min(10, priority));
    }

    // 分析所有工具
    analyzeAllTools() {
        const files = fs.readdirSync(this.sourceDir)
            .filter(file => file.endsWith('.html'))
            .sort();

        console.log(`Found ${files.length} HTML files to analyze...\n`);

        for (const file of files) {
            const filePath = path.join(this.sourceDir, file);
            const toolInfo = this.analyzeHtmlFile(filePath);
            
            if (toolInfo) {
                this.tools.push(toolInfo);
                
                // 统计分类
                const count = this.categories.get(toolInfo.category) || 0;
                this.categories.set(toolInfo.category, count + 1);
            }
        }

        // 按优先级排序
        this.tools.sort((a, b) => b.priority - a.priority);
    }

    // 生成分析报告
    generateReport() {
        console.log('='.repeat(60));
        console.log('HTML工具集分析报告');
        console.log('='.repeat(60));
        
        console.log(`\n📊 总体统计:`);
        console.log(`- 总工具数: ${this.tools.length}`);
        console.log(`- 平均文件大小: ${Math.round(this.tools.reduce((sum, t) => sum + t.fileSize, 0) / this.tools.length / 1024)}KB`);
        console.log(`- 有外部依赖: ${this.tools.filter(t => t.hasExternalDeps).length}`);
        console.log(`- 使用Canvas: ${this.tools.filter(t => t.hasCanvas).length}`);
        
        console.log(`\n📂 分类统计:`);
        for (const [category, count] of [...this.categories.entries()].sort((a, b) => b[1] - a[1])) {
            console.log(`- ${this.getCategoryName(category)}: ${count}个`);
        }
        
        console.log(`\n🎯 推荐迁移顺序 (前15个):`);
        this.tools.slice(0, 15).forEach((tool, index) => {
            const difficultyText = ['', '简单', '中等', '困难'][tool.migrationDifficulty];
            console.log(`${index + 1}. ${tool.title} (${this.getCategoryName(tool.category)}) - ${difficultyText} - 优先级:${tool.priority}`);
        });
        
        return this.tools;
    }

    // 获取分类中文名
    getCategoryName(category) {
        const names = {
            'text': '文本处理',
            'image': '图像处理', 
            'color': '颜色工具',
            'development': '开发工具',
            'calculator': '计算工具',
            'generator': '生成器',
            'game': '游戏娱乐',
            'time': '时间工具',
            'system': '系统工具',
            'utility': '实用工具'
        };
        return names[category] || category;
    }

    // 生成迁移配置文件
    generateMigrationConfig() {
        const config = {
            sourceDir: this.sourceDir,
            targetDir: './tools',
            categories: Object.fromEntries(this.categories),
            migrationBatches: [
                {
                    name: 'batch1_high_priority',
                    description: '第一批：高优先级工具',
                    tools: this.tools.filter(t => t.priority >= 7).slice(0, 10)
                },
                {
                    name: 'batch2_medium_priority', 
                    description: '第二批：中优先级工具',
                    tools: this.tools.filter(t => t.priority >= 5 && t.priority < 7).slice(0, 15)
                },
                {
                    name: 'batch3_remaining',
                    description: '第三批：其余工具',
                    tools: this.tools.filter(t => t.priority < 5)
                }
            ]
        };

        fs.writeFileSync('./migration-config.json', JSON.stringify(config, null, 2));
        console.log('\n✅ 迁移配置文件已生成: migration-config.json');
        
        return config;
    }
}

// 运行分析
if (require.main === module) {
    const analyzer = new ToolAnalyzer();
    analyzer.analyzeAllTools();
    analyzer.generateReport();
    analyzer.generateMigrationConfig();
}

module.exports = ToolAnalyzer;

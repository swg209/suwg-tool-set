#!/usr/bin/env node

/**
 * 生成分类统计报告
 */

const fs = require('fs');

class CategoryReporter {
    constructor() {
        this.appJsPath = './js/app.js';
    }

    // 分析当前分类结构
    analyzeCategories() {
        const appContent = fs.readFileSync(this.appJsPath, 'utf-8');

        // 提取分类定义 - 查找 loadTools 方法中的分类定义
        const categoriesMatch = appContent.match(/\/\/ 生成分类数据[\s\S]*?this\.categories = \[([\s\S]*?)\];/);
        if (!categoriesMatch) {
            throw new Error('无法找到分类定义');
        }

        const categoriesText = categoriesMatch[1];
        const categoryLines = categoriesText.split('\n').filter(line => line.trim().startsWith('{ id:'));

        const categories = [];
        for (const line of categoryLines) {
            const idMatch = line.match(/id: '([^']+)'/);
            const nameMatch = line.match(/name: '([^']+)'/);
            const iconMatch = line.match(/icon: '([^']+)'/);

            if (idMatch && nameMatch && iconMatch) {
                categories.push({
                    id: idMatch[1],
                    name: nameMatch[1],
                    icon: iconMatch[1]
                });
            }
        }

        return categories;
    }

    // 分析工具分布
    analyzeToolDistribution() {
        const appContent = fs.readFileSync(this.appJsPath, 'utf-8');
        
        // 提取所有工具
        const toolMatches = appContent.match(/{\s*id:\s*\d+,[\s\S]*?}/g) || [];
        
        const distribution = {};
        const tools = [];

        for (const toolMatch of toolMatches) {
            const idMatch = toolMatch.match(/id:\s*(\d+)/);
            const nameMatch = toolMatch.match(/name:\s*'([^']+)'/);
            const categoryMatch = toolMatch.match(/category:\s*'([^']+)'/);
            const isOriginalMatch = toolMatch.match(/isOriginal:\s*(true|false)/);
            const isMigratedMatch = toolMatch.match(/isMigrated:\s*(true|false)/);

            if (idMatch && nameMatch && categoryMatch) {
                const tool = {
                    id: parseInt(idMatch[1]),
                    name: nameMatch[1],
                    category: categoryMatch[1],
                    isOriginal: isOriginalMatch ? isOriginalMatch[1] === 'true' : false,
                    isMigrated: isMigratedMatch ? isMigratedMatch[1] === 'true' : false
                };

                tools.push(tool);

                // 统计分类分布
                if (!distribution[tool.category]) {
                    distribution[tool.category] = {
                        count: 0,
                        tools: [],
                        original: 0,
                        migrated: 0
                    };
                }

                distribution[tool.category].count++;
                distribution[tool.category].tools.push(tool.name);
                
                if (tool.isOriginal) distribution[tool.category].original++;
                if (tool.isMigrated) distribution[tool.category].migrated++;
            }
        }

        return { distribution, tools };
    }

    // 生成报告
    generateReport() {
        console.log('📊 生成分类统计报告...\n');

        try {
            const categories = this.analyzeCategories();
            const { distribution, tools } = this.analyzeToolDistribution();

            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalCategories: categories.length,
                    totalTools: tools.length,
                    originalTools: tools.filter(t => t.isOriginal).length,
                    migratedTools: tools.filter(t => t.isMigrated).length
                },
                categories: categories.map(cat => ({
                    ...cat,
                    count: distribution[cat.id]?.count || 0,
                    tools: distribution[cat.id]?.tools || [],
                    original: distribution[cat.id]?.original || 0,
                    migrated: distribution[cat.id]?.migrated || 0
                })),
                distribution,
                removedCategories: [
                    '对话助手 (chat)',
                    '图像生成 (image - 原版)',
                    '写作助手 (writing)',
                    '编程工具 (code)',
                    '视频处理 (video)',
                    '音频处理 (audio)'
                ],
                changes: [
                    '将迁移工具的分类提升为一级分类',
                    '移除了6个原有的AI相关分类',
                    '保留了原创工具分类',
                    '重新组织了分类结构，更加实用化'
                ]
            };

            // 保存报告
            fs.writeFileSync('./category-report.json', JSON.stringify(report, null, 2));

            // 显示报告
            this.displayReport(report);

            return report;

        } catch (error) {
            console.error('❌ 生成报告失败:', error.message);
            return null;
        }
    }

    // 显示报告
    displayReport(report) {
        console.log('🎯 分类结构调整完成！\n');
        
        console.log('📈 总体统计:');
        console.log(`   📁 总分类数: ${report.summary.totalCategories}`);
        console.log(`   🔧 总工具数: ${report.summary.totalTools}`);
        console.log(`   ⭐ 原创工具: ${report.summary.originalTools}`);
        console.log(`   🔄 迁移工具: ${report.summary.migratedTools}\n`);

        console.log('📂 当前分类结构:');
        report.categories
            .filter(cat => cat.id !== 'all' && cat.count > 0)
            .sort((a, b) => b.count - a.count)
            .forEach(cat => {
                const originalText = cat.original > 0 ? ` (${cat.original}个原创)` : '';
                const migratedText = cat.migrated > 0 ? ` (${cat.migrated}个迁移)` : '';
                console.log(`   ${this.getCategoryEmoji(cat.id)} ${cat.name}: ${cat.count}个工具${originalText}${migratedText}`);
            });

        console.log('\n❌ 已移除的分类:');
        report.removedCategories.forEach(cat => {
            console.log(`   🗑️  ${cat}`);
        });

        console.log('\n✨ 主要变化:');
        report.changes.forEach(change => {
            console.log(`   ✅ ${change}`);
        });

        console.log(`\n📄 详细报告已保存: category-report.json`);
    }

    // 获取分类表情符号
    getCategoryEmoji(categoryId) {
        const emojis = {
            'utility': '🔧',
            'calculator': '🧮',
            'design': '🎨',
            'development': '💻',
            'games': '🎮',
            'image': '🖼️',
            'learning': '📚',
            'lifestyle': '💝',
            'pdf': '📄',
            'productivity': '⚡',
            'system': '⚙️',
            'text': '📝',
            'original': '⭐',
            'others': '📦'
        };
        return emojis[categoryId] || '📁';
    }
}

// 导出类
module.exports = CategoryReporter;

// 如果直接运行此脚本
if (require.main === module) {
    const reporter = new CategoryReporter();
    
    const report = reporter.generateReport();
    
    if (report) {
        console.log('\n🎉 分类结构调整成功！');
        console.log('🌐 现在可以在浏览器中查看新的分类结构');
    } else {
        console.log('\n❌ 报告生成失败');
    }
}

#!/usr/bin/env node

/**
 * 更新主应用以集成所有迁移的工具
 */

const fs = require('fs');
const path = require('path');

class AppUpdater {
    constructor() {
        this.appJsPath = './js/app.js';
        this.migrationReport = null;
        this.toolsConfig = null;
    }

    // 加载数据
    loadData() {
        try {
            this.migrationReport = JSON.parse(fs.readFileSync('./batch-migration-report.json', 'utf-8'));
            this.toolsConfig = JSON.parse(fs.readFileSync('./tools-config.json', 'utf-8'));
            console.log(`📊 加载了 ${this.migrationReport.summary.successful} 个成功迁移的工具`);
            return true;
        } catch (error) {
            console.error('❌ 无法加载迁移数据:', error.message);
            return false;
        }
    }

    // 更新主应用
    async updateMainApp() {
        if (!this.loadData()) {
            return false;
        }

        console.log('🔧 开始更新主应用...\n');

        // 备份原文件
        this.backupOriginalFile();

        // 读取当前应用文件
        const appContent = fs.readFileSync(this.appJsPath, 'utf-8');

        // 更新工具列表
        const updatedContent = this.updateToolsList(appContent);

        // 更新分类列表
        const finalContent = this.updateCategoriesList(updatedContent);

        // 写入更新后的文件
        fs.writeFileSync(this.appJsPath, finalContent);

        console.log('✅ 主应用更新完成！');
        console.log(`📊 新增了 ${this.migrationReport.summary.successful} 个工具`);
        console.log(`📁 新增了 ${this.toolsConfig.categories.length} 个分类`);

        return true;
    }

    // 备份原文件
    backupOriginalFile() {
        const backupPath = this.appJsPath + '.backup.' + Date.now();
        fs.copyFileSync(this.appJsPath, backupPath);
        console.log(`💾 已备份原文件: ${backupPath}`);
    }

    // 更新工具列表
    updateToolsList(content) {
        console.log('🔧 更新工具列表...');

        // 找到工具数组的结束位置
        const toolsArrayEndPattern = /(\s+)\]\s*;\s*\n\s*\/\/ 生成分类数据/;
        const match = content.match(toolsArrayEndPattern);

        if (!match) {
            throw new Error('无法找到工具数组的结束位置');
        }

        // 生成新工具代码
        const newToolsCode = this.generateToolsCode();

        // 替换内容
        const beforeTools = content.substring(0, match.index);
        const afterTools = content.substring(match.index + match[0].length);

        // 移除最后一个工具的逗号并添加新工具
        const updatedBefore = beforeTools.replace(/,(\s*)$/, '$1');
        
        const updatedContent = updatedBefore + 
            ',\n\n      // ===== 迁移的工具 =====\n' +
            newToolsCode +
            '\n    ];\n\n    // 生成分类数据' +
            afterTools;

        console.log(`   ✅ 添加了 ${this.migrationReport.summary.successful} 个工具`);
        return updatedContent;
    }

    // 生成工具代码
    generateToolsCode() {
        const successful = this.migrationReport.successful;
        
        return successful.map((tool, index) => {
            const configTool = this.toolsConfig.tools.find(t => t.url.includes(tool.toolName));
            if (!configTool) return '';

            return `      {
        id: ${200 + index},
        name: '${tool.name}',
        description: '${this.escapeString(tool.name)}',
        category: '${tool.category}',
        tags: ${JSON.stringify(configTool.tags)},
        icon: '${tool.name.charAt(0)}',
        url: './tools/${tool.toolName}/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: ${configTool.priority},
        complexity: ${configTool.complexity}
      }`;
        }).filter(code => code).join(',\n');
    }

    // 更新分类列表
    updateCategoriesList(content) {
        console.log('🔧 更新分类列表...');

        // 找到分类数组
        const categoriesPattern = /(this\.categories = \[[\s\S]*?\];)/;
        const match = content.match(categoriesPattern);

        if (!match) {
            throw new Error('无法找到分类数组');
        }

        // 生成新的分类代码
        const newCategoriesCode = this.generateCategoriesCode();

        // 替换分类数组
        const updatedContent = content.replace(categoriesPattern, newCategoriesCode);

        console.log(`   ✅ 更新了分类系统`);
        return updatedContent;
    }

    // 生成分类代码
    generateCategoriesCode() {
        // 基础分类
        const baseCategories = [
            `{ id: 'all', name: '全部工具', icon: 'grid', count: this.tools.length }`,
            `{ id: 'chat', name: '对话助手', icon: 'message-circle', count: this.tools.filter(t => t.category === 'chat').length }`,
            `{ id: 'image', name: '图像生成', icon: 'image', count: this.tools.filter(t => t.category === 'image').length }`,
            `{ id: 'writing', name: '写作助手', icon: 'edit', count: this.tools.filter(t => t.category === 'writing').length }`,
            `{ id: 'code', name: '编程工具', icon: 'code', count: this.tools.filter(t => t.category === 'code').length }`,
            `{ id: 'video', name: '视频处理', icon: 'video', count: this.tools.filter(t => t.category === 'video').length }`,
            `{ id: 'audio', name: '音频处理', icon: 'headphones', count: this.tools.filter(t => t.category === 'audio').length }`
        ];

        // 新增分类
        const newCategories = this.toolsConfig.categories.map(cat => 
            `{ id: '${cat.id}', name: '${cat.name}', icon: '${cat.icon}', count: this.tools.filter(t => t.category === '${cat.id}').length }`
        );

        // 特殊分类
        const specialCategories = [
            `{ id: 'original', name: '原创工具', icon: 'star', count: this.tools.filter(t => t.isOriginal).length }`,
            `{ id: 'migrated', name: '迁移工具', icon: 'migrate', count: this.tools.filter(t => t.isMigrated).length }`
        ];

        const allCategories = [
            ...baseCategories,
            ...newCategories,
            ...specialCategories
        ];

        return `this.categories = [
      ${allCategories.join(',\n      ')}
    ];`;
    }

    // 转义字符串
    escapeString(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // 验证更新结果
    validateUpdate() {
        try {
            const updatedContent = fs.readFileSync(this.appJsPath, 'utf-8');
            
            // 检查语法
            eval(`(function() { ${updatedContent} })`);
            
            console.log('✅ 语法验证通过');
            return true;
        } catch (error) {
            console.error('❌ 语法验证失败:', error.message);
            return false;
        }
    }

    // 生成更新报告
    generateUpdateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                toolsAdded: this.migrationReport.summary.successful,
                categoriesAdded: this.toolsConfig.categories.length,
                totalTools: this.migrationReport.summary.successful + 16, // 原有工具数量
                updateSuccess: true
            },
            categoryDistribution: this.migrationReport.categoryDistribution,
            newCategories: this.toolsConfig.categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                count: cat.count
            })),
            backupFile: this.appJsPath + '.backup.' + Date.now()
        };

        fs.writeFileSync('./app-update-report.json', JSON.stringify(report, null, 2));
        console.log('📊 更新报告已生成: app-update-report.json');
    }
}

// 导出类
module.exports = AppUpdater;

// 如果直接运行此脚本
if (require.main === module) {
    const updater = new AppUpdater();
    
    updater.updateMainApp().then(success => {
        if (success) {
            // 验证更新
            if (updater.validateUpdate()) {
                updater.generateUpdateReport();
                console.log('\n🎉 主应用更新成功！');
                console.log('🌐 现在可以在浏览器中查看更新后的工具站');
            } else {
                console.log('\n❌ 更新验证失败，请检查语法错误');
            }
        } else {
            console.log('\n❌ 主应用更新失败');
        }
    }).catch(error => {
        console.error('❌ 更新过程中发生错误:', error);
    });
}

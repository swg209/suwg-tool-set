#!/usr/bin/env node

/**
 * HTML工具迁移脚本
 * 将 html-util-set 中的工具迁移到新的工具集架构中
 */

const fs = require('fs');
const path = require('path');

class ToolMigrator {
    constructor() {
        this.sourceDir = '../html-util-set';
        this.targetDir = './tools';
        this.sharedDir = './shared';
        this.templatePath = './tools/template/index.html';
    }

    // 读取模板文件
    loadTemplate() {
        if (!fs.existsSync(this.templatePath)) {
            throw new Error('Template file not found: ' + this.templatePath);
        }
        return fs.readFileSync(this.templatePath, 'utf-8');
    }

    // 提取HTML工具的核心内容
    extractToolContent(htmlContent) {
        const result = {
            title: '',
            description: '',
            styles: '',
            bodyContent: '',
            scripts: '',
            externalDeps: []
        };

        // 提取标题
        const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
        result.title = titleMatch ? titleMatch[1].trim() : '未命名工具';

        // 提取描述
        const descMatch = htmlContent.match(/<meta\s+name="description"\s+content="(.*?)"/i);
        result.description = descMatch ? descMatch[1].trim() : result.title;

        // 提取外部依赖
        const linkMatches = htmlContent.match(/<link[^>]*href="https?:\/\/[^"]*"/gi) || [];
        const externalScriptMatches = htmlContent.match(/<script[^>]*src="https?:\/\/[^"]*"/gi) || [];
        result.externalDeps = [...linkMatches, ...externalScriptMatches];

        // 提取样式
        const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        result.styles = styleMatch ? styleMatch[1].trim() : '';

        // 提取body内容
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            let bodyContent = bodyMatch[1].trim();
            
            // 移除内联脚本，稍后单独处理
            bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            result.bodyContent = bodyContent;
        }

        // 提取脚本
        const scriptMatches = htmlContent.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
        const inlineScripts = scriptMatches
            .filter(script => !script.includes('src='))
            .map(script => script.replace(/<\/?script[^>]*>/gi, ''))
            .join('\n\n');
        result.scripts = inlineScripts;

        return result;
    }

    // 适配样式到新的设计系统
    adaptStyles(originalStyles) {
        let adaptedStyles = originalStyles;

        // 替换常见的样式变量
        const styleReplacements = {
            // 颜色替换
            '#f5f5f5': 'var(--bg-secondary)',
            '#ffffff': 'var(--bg-card)',
            '#fff': 'var(--bg-card)',
            '#333': 'var(--text-primary)',
            '#666': 'var(--text-secondary)',
            '#999': 'var(--text-muted)',
            
            // 圆角替换
            'border-radius: 10px': 'border-radius: var(--radius-md)',
            'border-radius: 5px': 'border-radius: var(--radius-sm)',
            'border-radius: 15px': 'border-radius: var(--radius-lg)',
            
            // 阴影替换
            'box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)': 'box-shadow: var(--shadow-md)',
            'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)': 'box-shadow: var(--shadow-sm)',
            
            // 间距替换
            'padding: 20px': 'padding: var(--spacing-lg)',
            'padding: 10px': 'padding: var(--spacing-md)',
            'margin: 20px': 'margin: var(--spacing-lg)',
            'margin: 10px': 'margin: var(--spacing-md)',
        };

        for (const [old, newStyle] of Object.entries(styleReplacements)) {
            adaptedStyles = adaptedStyles.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStyle);
        }

        // 添加响应式支持
        if (!adaptedStyles.includes('@media')) {
            adaptedStyles += `
        
        @media (max-width: 768px) {
            .container {
                padding: var(--spacing-md);
                margin: var(--spacing-sm);
            }
        }`;
        }

        return adaptedStyles;
    }

    // 包装body内容到工具结构中
    wrapBodyContent(bodyContent, title) {
        // 查找主容器
        const hasContainer = bodyContent.includes('class="container"') || bodyContent.includes('class=\'container\'');
        
        if (hasContainer) {
            // 如果已有容器，直接使用
            return `
            <div class="tool-card">
                <div class="tool-section">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        ${title}
                    </h2>
                    ${bodyContent}
                </div>
            </div>`;
        } else {
            // 如果没有容器，添加包装
            return `
            <div class="tool-card">
                <div class="tool-section">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        ${title}
                    </h2>
                    <div class="container">
                        ${bodyContent}
                    </div>
                </div>
            </div>`;
        }
    }

    // 生成新的HTML文件
    generateNewHtml(toolContent, template) {
        let newHtml = template;

        // 替换标题和描述
        newHtml = newHtml.replace(/工具名称/g, toolContent.title);
        newHtml = newHtml.replace(/工具描述/g, toolContent.description);

        // 添加外部依赖
        if (toolContent.externalDeps.length > 0) {
            const depsHtml = toolContent.externalDeps.join('\n    ');
            newHtml = newHtml.replace('<!-- 样式文件 -->', `<!-- 外部依赖 -->\n    ${depsHtml}\n    <!-- 样式文件 -->`);
        }

        // 替换样式
        const adaptedStyles = this.adaptStyles(toolContent.styles);
        newHtml = newHtml.replace('/* 在这里添加工具特定的样式 */', adaptedStyles);

        // 替换主要内容
        const wrappedContent = this.wrapBodyContent(toolContent.bodyContent, toolContent.title);
        const contentStart = newHtml.indexOf('<!-- 工具主要功能区域 -->');
        const contentEnd = newHtml.indexOf('<!-- 结果显示区域 -->');
        
        if (contentStart !== -1 && contentEnd !== -1) {
            const before = newHtml.substring(0, contentStart);
            const after = newHtml.substring(contentEnd);
            newHtml = before + wrappedContent + '\n                    ' + after;
        }

        // 替换JavaScript
        if (toolContent.scripts) {
            const scriptPlaceholder = '// 在这里实现具体的处理逻辑';
            newHtml = newHtml.replace(scriptPlaceholder, toolContent.scripts);
        }

        return newHtml;
    }

    // 迁移单个工具
    migrateToolFile(sourceFile, targetName = null) {
        const sourcePath = path.join(this.sourceDir, sourceFile);
        const toolName = targetName || path.basename(sourceFile, '.html').replace(/^\d+_/, '');
        const targetPath = path.join(this.targetDir, toolName);

        console.log(`Migrating: ${sourceFile} -> ${toolName}`);

        try {
            // 读取源文件
            const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
            
            // 提取工具内容
            const toolContent = this.extractToolContent(sourceContent);
            
            // 加载模板
            const template = this.loadTemplate();
            
            // 生成新HTML
            const newHtml = this.generateNewHtml(toolContent, template);
            
            // 创建目标目录
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true });
            }
            
            // 写入新文件
            fs.writeFileSync(path.join(targetPath, 'index.html'), newHtml);
            
            console.log(`✅ Successfully migrated: ${toolName}`);
            
            return {
                success: true,
                toolName,
                title: toolContent.title,
                description: toolContent.description,
                hasExternalDeps: toolContent.externalDeps.length > 0
            };
            
        } catch (error) {
            console.error(`❌ Failed to migrate ${sourceFile}:`, error.message);
            return {
                success: false,
                toolName,
                error: error.message
            };
        }
    }

    // 批量迁移工具
    migrateBatch(fileList) {
        const results = [];
        
        console.log(`\n🚀 Starting batch migration of ${fileList.length} tools...\n`);
        
        for (const file of fileList) {
            const result = this.migrateToolFile(file);
            results.push(result);
        }
        
        // 统计结果
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`\n📊 Migration Summary:`);
        console.log(`✅ Successful: ${successful.length}`);
        console.log(`❌ Failed: ${failed.length}`);
        
        if (failed.length > 0) {
            console.log(`\n❌ Failed migrations:`);
            failed.forEach(f => console.log(`  - ${f.toolName}: ${f.error}`));
        }
        
        return results;
    }

    // 生成工具注册代码
    generateToolRegistration(migrationResults) {
        const successfulTools = migrationResults.filter(r => r.success);
        
        const toolsCode = successfulTools.map((tool, index) => {
            const id = 100 + index; // 从100开始编号避免冲突
            const category = this.inferCategory(tool.title);
            const icon = tool.title.charAt(0);
            
            return `      {
        id: ${id},
        name: '${tool.title}',
        description: '${tool.description}',
        category: '${category}',
        tags: ['${this.generateTags(tool.title).join("', '")}'],
        icon: '${icon}',
        url: './tools/${tool.toolName}/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true
      }`;
        }).join(',\n');

        const registrationCode = `
// 迁移的工具 (自动生成)
const migratedTools = [
${toolsCode}
];

// 添加到主工具列表
this.tools.push(...migratedTools);
`;

        fs.writeFileSync('./migrated-tools-registration.js', registrationCode);
        console.log('\n✅ Tool registration code generated: migrated-tools-registration.js');
        
        return registrationCode;
    }

    // 推断分类
    inferCategory(title) {
        const lower = title.toLowerCase();
        if (lower.includes('文字') || lower.includes('文本')) return 'text';
        if (lower.includes('图片') || lower.includes('图像')) return 'image';
        if (lower.includes('颜色') || lower.includes('color')) return 'color';
        if (lower.includes('json') || lower.includes('代码')) return 'development';
        if (lower.includes('计算') || lower.includes('转换')) return 'calculator';
        if (lower.includes('生成') || lower.includes('二维码')) return 'generator';
        if (lower.includes('游戏') || lower.includes('抽奖')) return 'game';
        if (lower.includes('时间') || lower.includes('日期')) return 'time';
        return 'utility';
    }

    // 生成标签
    generateTags(title) {
        const tags = ['迁移工具'];
        const lower = title.toLowerCase();
        
        if (lower.includes('生成')) tags.push('生成器');
        if (lower.includes('计算')) tags.push('计算器');
        if (lower.includes('转换')) tags.push('转换器');
        if (lower.includes('检查')) tags.push('检查器');
        if (lower.includes('工具')) tags.push('实用工具');
        
        return tags;
    }
}

// 导出类
module.exports = ToolMigrator;

// 如果直接运行此脚本
if (require.main === module) {
    const migrator = new ToolMigrator();
    
    // 示例：迁移前5个工具
    const testFiles = [
        '001_pwd_gen_check.html',
        '002_rate_transfer.html', 
        '004_unit_transfer.html',
        '011_word_count_statistic.html',
        '065_json_formatter.html'
    ];
    
    const results = migrator.migrateBatch(testFiles);
    migrator.generateToolRegistration(results);
}

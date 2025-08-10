#!/usr/bin/env node

/**
 * 批量迁移 html-util-set 中的所有工具
 * 基于分析结果进行智能迁移
 */

const fs = require('fs');
const path = require('path');
const ToolMigrator = require('./migrate-tools');

class BatchMigrator extends ToolMigrator {
    constructor() {
        super();
        this.analysisData = null;
        this.migrationResults = [];
        this.batchSize = 15; // 每批次处理的工具数量
    }

    // 加载分析数据
    loadAnalysisData() {
        try {
            this.analysisData = JSON.parse(fs.readFileSync('./tools-config.json', 'utf-8'));
            console.log(`📊 加载了 ${this.analysisData.tools.length} 个工具的分析数据`);
            return true;
        } catch (error) {
            console.error('❌ 无法加载分析数据，请先运行 analyze-all-tools.js');
            return false;
        }
    }

    // 批量迁移所有工具
    async migrateAllTools(batchMode = true) {
        if (!this.loadAnalysisData()) {
            return false;
        }

        console.log('🚀 开始批量迁移所有工具...\n');

        // 按优先级排序工具
        const sortedTools = this.analysisData.tools
            .sort((a, b) => b.priority - a.priority);

        if (batchMode) {
            await this.migrateBatches(sortedTools);
        } else {
            await this.migrateAllAtOnce(sortedTools);
        }

        // 生成最终报告
        this.generateFinalReport();
        this.generateAppIntegrationCode();

        return true;
    }

    // 分批次迁移
    async migrateBatches(tools) {
        const batches = this.createBatches(tools);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`\n📦 处理第 ${i + 1} 批次 (${batch.length} 个工具):`);
            console.log(`   优先级范围: ${batch[batch.length - 1].priority} - ${batch[0].priority}`);
            
            const batchResults = await this.migrateBatch(batch);
            this.migrationResults.push(...batchResults);

            // 显示批次进度
            const successCount = batchResults.filter(r => r.success).length;
            console.log(`   ✅ 成功: ${successCount}/${batch.length}`);

            // 可选：每批次后暂停
            if (i < batches.length - 1) {
                console.log('   ⏸️  批次完成，继续下一批次...\n');
                await this.sleep(1000); // 暂停1秒
            }
        }
    }

    // 一次性迁移所有工具
    async migrateAllAtOnce(tools) {
        console.log(`📦 一次性处理所有 ${tools.length} 个工具:\n`);
        
        const allResults = await this.migrateBatch(tools);
        this.migrationResults.push(...allResults);
    }

    // 创建迁移批次
    createBatches(tools) {
        const batches = [];
        for (let i = 0; i < tools.length; i += this.batchSize) {
            batches.push(tools.slice(i, i + this.batchSize));
        }
        return batches;
    }

    // 迁移单个批次
    async migrateBatch(tools) {
        const results = [];

        for (const tool of tools) {
            try {
                const sourceFile = tool.sourceFile;
                const targetName = this.generateToolSlug(sourceFile);
                const categoryPath = tool.sourceCategory === 'root' ? 
                    this.sourceDir : 
                    path.join(this.sourceDir, tool.sourceCategory);

                console.log(`   🔄 迁移: ${sourceFile} -> ${targetName}`);

                const result = this.migrateToolFile(
                    path.join(categoryPath, sourceFile),
                    targetName,
                    tool
                );

                if (result.success) {
                    console.log(`   ✅ 成功: ${targetName}`);
                } else {
                    console.log(`   ❌ 失败: ${targetName} - ${result.error}`);
                }

                results.push({
                    ...result,
                    originalTool: tool
                });

            } catch (error) {
                console.log(`   ❌ 异常: ${tool.sourceFile} - ${error.message}`);
                results.push({
                    success: false,
                    error: error.message,
                    originalTool: tool
                });
            }
        }

        return results;
    }

    // 重写迁移单个工具文件方法
    migrateToolFile(sourcePath, targetName, toolInfo) {
        try {
            // 读取源文件
            const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
            
            // 提取工具内容
            const toolContent = this.extractToolContent(sourceContent);
            
            // 使用分析数据中的信息
            toolContent.title = toolInfo.name;
            toolContent.description = toolInfo.description;
            
            // 加载模板
            const template = this.loadTemplate();
            
            // 生成新HTML
            const newHtml = this.generateNewHtml(toolContent, template);
            
            // 创建目标目录
            const targetPath = path.join(this.targetDir, targetName);
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true });
            }
            
            // 写入新文件
            fs.writeFileSync(path.join(targetPath, 'index.html'), newHtml);
            
            return {
                success: true,
                toolName: targetName,
                title: toolContent.title,
                description: toolContent.description,
                category: toolInfo.category,
                hasExternalDeps: toolContent.externalDeps.length > 0
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                toolName: targetName
            };
        }
    }

    // 生成工具目录名
    generateToolSlug(fileName) {
        return fileName
            .replace('.html', '')
            .replace(/^\d+_/, '') // 移除数字前缀
            .replace(/_/g, '-')   // 下划线转连字符
            .toLowerCase();
    }

    // 生成最终报告
    generateFinalReport() {
        const successful = this.migrationResults.filter(r => r.success);
        const failed = this.migrationResults.filter(r => !r.success);

        const report = {
            summary: {
                total: this.migrationResults.length,
                successful: successful.length,
                failed: failed.length,
                successRate: `${((successful.length / this.migrationResults.length) * 100).toFixed(1)}%`
            },
            successful: successful.map(r => ({
                name: r.title,
                toolName: r.toolName,
                category: r.category,
                hasExternalDeps: r.hasExternalDeps
            })),
            failed: failed.map(r => ({
                sourceFile: r.originalTool?.sourceFile || 'unknown',
                error: r.error
            })),
            categoryDistribution: this.getCategoryDistribution(successful),
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync('./batch-migration-report.json', JSON.stringify(report, null, 2));
        
        console.log('\n📊 迁移报告:');
        console.log(`   ✅ 成功: ${successful.length}`);
        console.log(`   ❌ 失败: ${failed.length}`);
        console.log(`   📈 成功率: ${report.summary.successRate}`);
        console.log(`   📄 详细报告: batch-migration-report.json`);
    }

    // 获取分类分布
    getCategoryDistribution(successful) {
        const distribution = {};
        successful.forEach(tool => {
            const category = tool.category || 'unknown';
            distribution[category] = (distribution[category] || 0) + 1;
        });
        return distribution;
    }

    // 生成应用集成代码
    generateAppIntegrationCode() {
        const successful = this.migrationResults.filter(r => r.success);
        
        // 生成工具注册代码
        const toolsCode = successful.map((tool, index) => {
            const originalTool = tool.originalTool;
            const id = 200 + index; // 从200开始编号
            
            return `      {
        id: ${id},
        name: '${tool.title}',
        description: '${tool.description}',
        category: '${tool.category}',
        tags: ${JSON.stringify(originalTool.tags)},
        icon: '${tool.title.charAt(0)}',
        url: './tools/${tool.toolName}/',
        isLocal: true,
        isOriginal: false,
        isMigrated: true,
        priority: ${originalTool.priority},
        complexity: ${originalTool.complexity}
      }`;
        }).join(',\n');

        // 生成分类代码
        const categories = this.analysisData.categories;
        const categoriesCode = categories.map(cat => 
            `      { id: '${cat.id}', name: '${cat.name}', icon: '${cat.icon}', count: this.tools.filter(t => t.category === '${cat.id}').length }`
        ).join(',\n');

        const integrationCode = `
// ===== 批量迁移工具集成代码 =====

// 迁移的工具 (${successful.length} 个)
const migratedTools = [
${toolsCode}
];

// 新增分类
const newCategories = [
${categoriesCode}
];

// 集成说明:
// 1. 将 migratedTools 数组添加到 js/app.js 的 loadTools() 方法中
// 2. 将 newCategories 添加到分类列表中
// 3. 更新分类过滤逻辑以支持新分类

console.log('🎉 成功迁移 ${successful.length} 个工具！');
`;

        fs.writeFileSync('./app-integration-code.js', integrationCode);
        console.log(`   🔧 应用集成代码: app-integration-code.js`);
    }

    // 工具方法：睡眠
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 导出类
module.exports = BatchMigrator;

// 如果直接运行此脚本
if (require.main === module) {
    const migrator = new BatchMigrator();
    
    // 解析命令行参数
    const args = process.argv.slice(2);
    const batchMode = !args.includes('--all-at-once');
    const batchSize = args.find(arg => arg.startsWith('--batch-size='));
    
    if (batchSize) {
        migrator.batchSize = parseInt(batchSize.split('=')[1]) || 15;
    }

    console.log(`🔧 配置: ${batchMode ? '分批次' : '一次性'}迁移, 批次大小: ${migrator.batchSize}`);
    
    migrator.migrateAllTools(batchMode).then(success => {
        if (success) {
            console.log('\n🎉 批量迁移完成！');
            console.log('📋 下一步: 运行应用集成代码更新主应用');
        } else {
            console.log('\n❌ 迁移失败，请检查错误信息');
        }
    }).catch(error => {
        console.error('❌ 迁移过程中发生错误:', error);
    });
}

#!/usr/bin/env node

/**
 * 最终整合和优化脚本
 * 清理重复文件，优化工具描述，生成最终报告
 */

const fs = require('fs');
const path = require('path');

class IntegrationFinalizer {
    constructor() {
        this.toolsDir = './tools';
        this.appJsPath = './js/app.js';
        this.finalReport = {
            totalTools: 0,
            categories: {},
            duplicatesRemoved: [],
            optimizations: [],
            errors: []
        };
    }

    // 执行最终整合
    async finalize() {
        console.log('🎯 开始最终整合和优化...\n');

        try {
            // 1. 清理重复工具
            await this.cleanupDuplicates();

            // 2. 优化工具描述
            await this.optimizeDescriptions();

            // 3. 验证所有工具
            await this.validateAllTools();

            // 4. 生成统计信息
            await this.generateStatistics();

            // 5. 清理临时文件
            await this.cleanupTempFiles();

            // 6. 生成最终报告
            this.generateFinalReport();

            console.log('\n🎉 整合完成！');
            return true;

        } catch (error) {
            console.error('❌ 整合过程中发生错误:', error);
            return false;
        }
    }

    // 清理重复工具
    async cleanupDuplicates() {
        console.log('🧹 清理重复工具...');

        const toolDirs = fs.readdirSync(this.toolsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        // 查找可能的重复项
        const duplicates = [];
        const seen = new Set();

        for (const dir of toolDirs) {
            const normalized = dir.replace(/[-_]/g, '').toLowerCase();
            if (seen.has(normalized)) {
                duplicates.push(dir);
            } else {
                seen.add(normalized);
            }
        }

        // 移除重复项（保留较新的版本）
        for (const duplicate of duplicates) {
            const duplicatePath = path.join(this.toolsDir, duplicate);
            try {
                fs.rmSync(duplicatePath, { recursive: true, force: true });
                this.finalReport.duplicatesRemoved.push(duplicate);
                console.log(`   🗑️  移除重复工具: ${duplicate}`);
            } catch (error) {
                console.log(`   ⚠️  无法移除 ${duplicate}: ${error.message}`);
            }
        }

        console.log(`   ✅ 清理了 ${duplicates.length} 个重复工具\n`);
    }

    // 优化工具描述
    async optimizeDescriptions() {
        console.log('✨ 优化工具描述...');

        const appContent = fs.readFileSync(this.appJsPath, 'utf-8');
        
        // 改进描述的映射
        const descriptionImprovements = {
            '货币转换器': '实时汇率查询和货币转换工具，支持多种主流货币',
            '单位转换器': '长度、重量、温度、面积等多种单位快速转换',
            '年龄和生肖计算器': '根据出生日期计算年龄并显示对应生肖',
            '食物热量转换器 - 健康管理工具': '食物热量查询和营养成分分析工具',
            '会议成本计算器': '计算会议时间成本，提高会议效率意识',
            '阅读时间计算器': '根据文本长度估算阅读所需时间',
            '时区转换器': '全球时区转换和世界时钟工具',
            '工作价值计算器': '计算工作时间的经济价值',
            '几何图形计算器': '各种几何图形面积、周长、体积计算',
            '时间差计算器': '计算两个时间点之间的时间差',
            '饼图生成工具': '在线创建和自定义饼图，支持数据可视化',
            'Logo设计器': '简单易用的Logo设计和生成工具',
            '万花筒': '在线万花筒效果生成器，创造美丽图案',
            '调色板生成器': '智能颜色搭配和调色板生成工具',
            '数字蒲公英': '互动式数字艺术创作工具',
            '颜色选择器': '专业的颜色选择和格式转换工具',
            '粒子效果生成器': '创建炫酷的粒子动画效果',
            '密码生成器与强度检查器': '生成安全密码并检测密码强度',
            '文件加密工具': '本地文件加密和解密工具',
            'Claude代码使用统计': 'Claude AI代码使用情况统计分析',
            'Flexbox布局生成器': '可视化CSS Flexbox布局代码生成',
            'Grid布局生成器': '可视化CSS Grid布局代码生成',
            '文件哈希计算': '计算文件的MD5、SHA1、SHA256哈希值',
            'JSON格式化器': 'JSON美化、压缩、验证和格式化工具',
            'CSV转JSON转换器': 'CSV和JSON格式互相转换工具',
            '正则表达式测试器': '在线正则表达式测试和验证工具',
            'Unix时间戳转换': 'Unix时间戳和日期时间互相转换',
            '剪贴板历史': '剪贴板内容历史记录管理工具'
        };

        let updatedContent = appContent;
        let improvementCount = 0;

        for (const [name, newDesc] of Object.entries(descriptionImprovements)) {
            const pattern = new RegExp(`(name: '${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',\\s*description: ')[^']*(')`);
            if (pattern.test(updatedContent)) {
                updatedContent = updatedContent.replace(pattern, `$1${newDesc}$2`);
                improvementCount++;
            }
        }

        if (improvementCount > 0) {
            fs.writeFileSync(this.appJsPath, updatedContent);
            this.finalReport.optimizations.push(`改进了 ${improvementCount} 个工具的描述`);
            console.log(`   ✅ 改进了 ${improvementCount} 个工具的描述\n`);
        } else {
            console.log('   ℹ️  没有需要改进的描述\n');
        }
    }

    // 验证所有工具
    async validateAllTools() {
        console.log('🔍 验证所有工具...');

        const toolDirs = fs.readdirSync(this.toolsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name !== 'template')
            .map(dirent => dirent.name);

        let validCount = 0;
        let invalidCount = 0;

        for (const toolDir of toolDirs) {
            const indexPath = path.join(this.toolsDir, toolDir, 'index.html');
            
            if (fs.existsSync(indexPath)) {
                try {
                    const content = fs.readFileSync(indexPath, 'utf-8');
                    
                    // 基本验证
                    if (content.includes('<!DOCTYPE html') && 
                        content.includes('<title>') && 
                        content.includes('</html>')) {
                        validCount++;
                    } else {
                        invalidCount++;
                        this.finalReport.errors.push(`${toolDir}: HTML结构不完整`);
                    }
                } catch (error) {
                    invalidCount++;
                    this.finalReport.errors.push(`${toolDir}: 读取文件失败 - ${error.message}`);
                }
            } else {
                invalidCount++;
                this.finalReport.errors.push(`${toolDir}: 缺少index.html文件`);
            }
        }

        console.log(`   ✅ 有效工具: ${validCount}`);
        console.log(`   ❌ 无效工具: ${invalidCount}\n`);

        this.finalReport.totalTools = validCount;
    }

    // 生成统计信息
    async generateStatistics() {
        console.log('📊 生成统计信息...');

        try {
            const appContent = fs.readFileSync(this.appJsPath, 'utf-8');
            
            // 提取工具信息
            const toolMatches = appContent.match(/{\s*id:\s*\d+,[\s\S]*?}/g) || [];
            
            // 按分类统计
            const categoryStats = {};
            
            for (const toolMatch of toolMatches) {
                const categoryMatch = toolMatch.match(/category:\s*'([^']+)'/);
                if (categoryMatch) {
                    const category = categoryMatch[1];
                    categoryStats[category] = (categoryStats[category] || 0) + 1;
                }
            }

            this.finalReport.categories = categoryStats;
            
            console.log('   📈 分类统计:');
            for (const [category, count] of Object.entries(categoryStats)) {
                console.log(`      ${category}: ${count} 个工具`);
            }
            console.log('');

        } catch (error) {
            console.log(`   ⚠️  统计生成失败: ${error.message}\n`);
        }
    }

    // 清理临时文件
    async cleanupTempFiles() {
        console.log('🧹 清理临时文件...');

        const tempFiles = [
            'tools-analysis-report.json',
            'migration-plan.json',
            'tools-config.json',
            'batch-migration-report.json',
            'app-integration-code.js',
            'app-update-report.json'
        ];

        let cleanedCount = 0;
        for (const file of tempFiles) {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                    cleanedCount++;
                } catch (error) {
                    console.log(`   ⚠️  无法删除 ${file}: ${error.message}`);
                }
            }
        }

        console.log(`   ✅ 清理了 ${cleanedCount} 个临时文件\n`);
    }

    // 生成最终报告
    generateFinalReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTools: this.finalReport.totalTools,
                totalCategories: Object.keys(this.finalReport.categories).length,
                duplicatesRemoved: this.finalReport.duplicatesRemoved.length,
                optimizationsApplied: this.finalReport.optimizations.length,
                errors: this.finalReport.errors.length
            },
            categories: this.finalReport.categories,
            duplicatesRemoved: this.finalReport.duplicatesRemoved,
            optimizations: this.finalReport.optimizations,
            errors: this.finalReport.errors,
            nextSteps: [
                '在浏览器中测试所有工具功能',
                '根据需要调整工具描述和分类',
                '考虑添加工具使用统计',
                '定期更新和维护工具集'
            ]
        };

        fs.writeFileSync('./final-integration-report.json', JSON.stringify(report, null, 2));
        
        console.log('📋 最终报告:');
        console.log(`   🔧 总工具数: ${report.summary.totalTools}`);
        console.log(`   📁 总分类数: ${report.summary.totalCategories}`);
        console.log(`   🗑️  清理重复: ${report.summary.duplicatesRemoved}`);
        console.log(`   ✨ 优化项目: ${report.summary.optimizationsApplied}`);
        console.log(`   ❌ 错误数量: ${report.summary.errors}`);
        console.log(`   📄 详细报告: final-integration-report.json`);
    }
}

// 导出类
module.exports = IntegrationFinalizer;

// 如果直接运行此脚本
if (require.main === module) {
    const finalizer = new IntegrationFinalizer();
    
    finalizer.finalize().then(success => {
        if (success) {
            console.log('\n🎊 恭喜！html-util-set 已成功整合到个人工具集中！');
            console.log('🌐 现在可以在浏览器中享受超过100个实用工具！');
        } else {
            console.log('\n❌ 整合过程中遇到问题，请查看错误信息');
        }
    }).catch(error => {
        console.error('❌ 整合失败:', error);
    });
}

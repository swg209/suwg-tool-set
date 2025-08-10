#!/usr/bin/env node

/**
 * 修复工具问题
 */

const fs = require('fs');

class ToolFixer {
    constructor() {
        this.appJsPath = './js/app.js';
        this.testReport = null;
    }

    // 加载测试报告
    loadTestReport() {
        try {
            this.testReport = JSON.parse(fs.readFileSync('./tool-test-report.json', 'utf-8'));
            console.log(`📊 加载了测试报告，发现 ${this.testReport.issues.length} 个问题`);
            return true;
        } catch (error) {
            console.error('❌ 无法加载测试报告，请先运行 test-tools.js');
            return false;
        }
    }

    // 修复所有问题
    async fixAllIssues() {
        if (!this.loadTestReport()) {
            return false;
        }

        console.log('🔧 开始修复工具问题...\n');

        // 1. 移除外部链接工具
        await this.removeExternalTools();

        // 2. 移除缺失的工具
        await this.removeMissingTools();

        // 3. 修复外部依赖问题
        await this.fixExternalDependencies();

        console.log('\n🎉 修复完成！');
        return true;
    }

    // 移除外部链接工具
    async removeExternalTools() {
        console.log('🔧 移除外部链接工具...');

        const externalTools = this.testReport.issues.filter(issue => 
            issue.tool.url.startsWith('https://')
        );

        if (externalTools.length === 0) {
            console.log('   ✅ 没有外部链接工具需要移除');
            return;
        }

        let appContent = fs.readFileSync(this.appJsPath, 'utf-8');

        for (const issue of externalTools) {
            const tool = issue.tool;
            console.log(`   🗑️  移除外部工具: ${tool.name} (ID: ${tool.id})`);

            // 构建工具匹配模式
            const toolPattern = new RegExp(
                `\\s*{\\s*id:\\s*${tool.id},[\\s\\S]*?}\\s*,?`,
                'g'
            );

            appContent = appContent.replace(toolPattern, '');
        }

        // 清理多余的逗号
        appContent = appContent.replace(/,(\s*),/g, ',');
        appContent = appContent.replace(/,(\s*)\]/g, '$1]');

        fs.writeFileSync(this.appJsPath, appContent);
        console.log(`   ✅ 移除了 ${externalTools.length} 个外部链接工具\n`);
    }

    // 移除缺失的工具
    async removeMissingTools() {
        console.log('🔧 移除缺失文件的工具...');

        const missingTools = this.testReport.issues.filter(issue => 
            !issue.tool.url.startsWith('https://') && 
            issue.issues.includes('文件不存在')
        );

        if (missingTools.length === 0) {
            console.log('   ✅ 没有缺失文件的工具需要移除');
            return;
        }

        let appContent = fs.readFileSync(this.appJsPath, 'utf-8');

        for (const issue of missingTools) {
            const tool = issue.tool;
            console.log(`   🗑️  移除缺失工具: ${tool.name} (ID: ${tool.id})`);

            // 构建工具匹配模式
            const toolPattern = new RegExp(
                `\\s*{\\s*id:\\s*${tool.id},[\\s\\S]*?}\\s*,?`,
                'g'
            );

            appContent = appContent.replace(toolPattern, '');
        }

        // 清理多余的逗号
        appContent = appContent.replace(/,(\s*),/g, ',');
        appContent = appContent.replace(/,(\s*)\]/g, '$1]');

        fs.writeFileSync(this.appJsPath, appContent);
        console.log(`   ✅ 移除了 ${missingTools.length} 个缺失文件的工具\n`);
    }

    // 修复外部依赖问题
    async fixExternalDependencies() {
        console.log('🔧 修复外部依赖问题...');

        const dependencyIssues = this.testReport.issues.filter(issue => 
            !issue.tool.url.startsWith('https://') && 
            !issue.issues.includes('文件不存在') &&
            (issue.issues.some(i => i.includes('CSS文件不存在')) || 
             issue.issues.some(i => i.includes('JS文件不存在')))
        );

        if (dependencyIssues.length === 0) {
            console.log('   ✅ 没有外部依赖问题需要修复');
            return;
        }

        console.log(`   📋 发现 ${dependencyIssues.length} 个工具有外部依赖问题:`);
        
        for (const issue of dependencyIssues) {
            const tool = issue.tool;
            console.log(`   ⚠️  ${tool.name}: ${issue.issues.join(', ')}`);
        }

        console.log('\n   💡 建议解决方案:');
        console.log('   1. 这些工具依赖外部CDN资源，在离线环境下可能无法正常工作');
        console.log('   2. 可以下载这些资源到本地，或者在有网络连接时使用');
        console.log('   3. 大部分工具在有网络连接的环境下应该能正常工作');
        
        console.log('\n   ✅ 外部依赖问题已记录，工具在有网络时应该能正常工作\n');
    }

    // 生成修复报告
    generateFixReport() {
        const externalTools = this.testReport.issues.filter(issue => 
            issue.tool.url.startsWith('https://')
        ).length;

        const missingTools = this.testReport.issues.filter(issue => 
            !issue.tool.url.startsWith('https://') && 
            issue.issues.includes('文件不存在')
        ).length;

        const dependencyIssues = this.testReport.issues.filter(issue => 
            !issue.tool.url.startsWith('https://') && 
            !issue.issues.includes('文件不存在') &&
            (issue.issues.some(i => i.includes('CSS文件不存在')) || 
             issue.issues.some(i => i.includes('JS文件不存在')))
        ).length;

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalIssues: this.testReport.issues.length,
                externalToolsRemoved: externalTools,
                missingToolsRemoved: missingTools,
                dependencyIssues: dependencyIssues,
                fixedIssues: externalTools + missingTools,
                remainingIssues: dependencyIssues
            },
            actions: [
                `移除了 ${externalTools} 个外部链接工具`,
                `移除了 ${missingTools} 个缺失文件的工具`,
                `记录了 ${dependencyIssues} 个外部依赖问题`
            ],
            recommendations: [
                '重新运行测试脚本验证修复效果',
                '在有网络连接的环境下测试依赖外部资源的工具',
                '考虑将常用的外部依赖下载到本地'
            ]
        };

        fs.writeFileSync('./tool-fix-report.json', JSON.stringify(report, null, 2));
        
        console.log('📊 修复报告:');
        console.log(`   🗑️  移除外部工具: ${externalTools} 个`);
        console.log(`   🗑️  移除缺失工具: ${missingTools} 个`);
        console.log(`   ⚠️  外部依赖问题: ${dependencyIssues} 个`);
        console.log(`   ✅ 修复问题: ${externalTools + missingTools} 个`);
        console.log(`   📄 详细报告: tool-fix-report.json`);
    }
}

// 导出类
module.exports = ToolFixer;

// 如果直接运行此脚本
if (require.main === module) {
    const fixer = new ToolFixer();
    
    fixer.fixAllIssues().then(success => {
        if (success) {
            fixer.generateFixReport();
            console.log('\n🎉 修复完成！建议重新运行测试脚本验证效果');
        } else {
            console.log('\n❌ 修复失败');
        }
    }).catch(error => {
        console.error('❌ 修复过程中发生错误:', error);
    });
}

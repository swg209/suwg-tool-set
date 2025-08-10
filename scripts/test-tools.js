#!/usr/bin/env node

/**
 * 测试所有工具页面是否能正常打开
 */

const fs = require('fs');
const path = require('path');

class ToolTester {
    constructor() {
        this.toolsDir = './tools';
        this.appJsPath = './js/app.js';
        this.results = {
            total: 0,
            valid: 0,
            invalid: 0,
            issues: []
        };
    }

    // 测试所有工具
    async testAllTools() {
        console.log('🔍 开始测试所有工具页面...\n');

        // 获取工具列表
        const tools = this.getToolsFromApp();
        console.log(`📊 从应用配置中找到 ${tools.length} 个工具\n`);

        // 测试每个工具
        for (const tool of tools) {
            await this.testTool(tool);
        }

        // 生成报告
        this.generateReport();
    }

    // 从应用配置中获取工具列表
    getToolsFromApp() {
        const appContent = fs.readFileSync(this.appJsPath, 'utf-8');
        const toolMatches = appContent.match(/{\s*id:\s*\d+,[\s\S]*?}/g) || [];
        
        const tools = [];
        for (const toolMatch of toolMatches) {
            const idMatch = toolMatch.match(/id:\s*(\d+)/);
            const nameMatch = toolMatch.match(/name:\s*'([^']+)'/);
            const urlMatch = toolMatch.match(/url:\s*'([^']+)'/);
            const categoryMatch = toolMatch.match(/category:\s*'([^']+)'/);

            if (idMatch && nameMatch && urlMatch) {
                tools.push({
                    id: parseInt(idMatch[1]),
                    name: nameMatch[1],
                    url: urlMatch[1],
                    category: categoryMatch ? categoryMatch[1] : 'unknown'
                });
            }
        }

        return tools.sort((a, b) => a.id - b.id);
    }

    // 测试单个工具
    async testTool(tool) {
        this.results.total++;
        
        const toolPath = tool.url.replace('./', '');
        const indexPath = path.join(toolPath, 'index.html');
        
        console.log(`🔧 测试: ${tool.name} (ID: ${tool.id})`);
        console.log(`   路径: ${indexPath}`);

        const issues = [];

        // 检查文件是否存在
        if (!fs.existsSync(indexPath)) {
            issues.push('文件不存在');
            console.log(`   ❌ 文件不存在`);
        } else {
            // 检查文件内容
            try {
                const content = fs.readFileSync(indexPath, 'utf-8');
                
                // 基本HTML结构检查
                if (!content.includes('<!DOCTYPE html')) {
                    issues.push('缺少DOCTYPE声明');
                }
                
                if (!content.includes('<html')) {
                    issues.push('缺少html标签');
                }
                
                if (!content.includes('<title>')) {
                    issues.push('缺少title标签');
                }
                
                if (!content.includes('</html>')) {
                    issues.push('HTML结构不完整');
                }

                // 检查CSS引用
                const cssLinks = content.match(/<link[^>]*href="[^"]*\.css"/gi) || [];
                for (const cssLink of cssLinks) {
                    const hrefMatch = cssLink.match(/href="([^"]+)"/);
                    if (hrefMatch) {
                        const cssPath = this.resolvePath(indexPath, hrefMatch[1]);
                        if (!fs.existsSync(cssPath)) {
                            issues.push(`CSS文件不存在: ${hrefMatch[1]}`);
                        }
                    }
                }

                // 检查JS引用
                const jsScripts = content.match(/<script[^>]*src="[^"]*\.js"/gi) || [];
                for (const jsScript of jsScripts) {
                    const srcMatch = jsScript.match(/src="([^"]+)"/);
                    if (srcMatch) {
                        const jsPath = this.resolvePath(indexPath, srcMatch[1]);
                        if (!fs.existsSync(jsPath)) {
                            issues.push(`JS文件不存在: ${srcMatch[1]}`);
                        }
                    }
                }

                // 检查文件大小
                const stats = fs.statSync(indexPath);
                if (stats.size < 1000) {
                    issues.push('文件过小，可能内容不完整');
                } else if (stats.size > 500000) {
                    issues.push('文件过大，可能影响加载速度');
                }

                // 检查是否有基本的工具功能
                if (!content.includes('<script') && !content.includes('function')) {
                    issues.push('可能缺少JavaScript功能');
                }

            } catch (error) {
                issues.push(`读取文件失败: ${error.message}`);
            }
        }

        if (issues.length === 0) {
            this.results.valid++;
            console.log(`   ✅ 通过测试`);
        } else {
            this.results.invalid++;
            console.log(`   ❌ 发现问题: ${issues.join(', ')}`);
            this.results.issues.push({
                tool,
                issues
            });
        }

        console.log('');
    }

    // 解析相对路径
    resolvePath(basePath, relativePath) {
        if (relativePath.startsWith('http')) {
            return relativePath; // 外部链接，跳过检查
        }
        
        const baseDir = path.dirname(basePath);
        return path.resolve(baseDir, relativePath);
    }

    // 生成测试报告
    generateReport() {
        console.log('📊 测试报告:');
        console.log(`   🔧 总工具数: ${this.results.total}`);
        console.log(`   ✅ 正常工具: ${this.results.valid}`);
        console.log(`   ❌ 问题工具: ${this.results.invalid}`);
        console.log(`   📈 成功率: ${((this.results.valid / this.results.total) * 100).toFixed(1)}%\n`);

        if (this.results.issues.length > 0) {
            console.log('🔍 问题详情:');
            this.results.issues.forEach((issue, index) => {
                console.log(`\n${index + 1}. ${issue.tool.name} (ID: ${issue.tool.id})`);
                console.log(`   分类: ${issue.tool.category}`);
                console.log(`   路径: ${issue.tool.url}`);
                console.log(`   问题: ${issue.issues.join(', ')}`);
            });

            // 按分类统计问题
            console.log('\n📊 问题分类统计:');
            const categoryIssues = {};
            this.results.issues.forEach(issue => {
                const category = issue.tool.category;
                if (!categoryIssues[category]) {
                    categoryIssues[category] = 0;
                }
                categoryIssues[category]++;
            });

            Object.entries(categoryIssues).forEach(([category, count]) => {
                console.log(`   ${category}: ${count} 个问题`);
            });
        }

        // 保存详细报告
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.total,
                valid: this.results.valid,
                invalid: this.results.invalid,
                successRate: ((this.results.valid / this.results.total) * 100).toFixed(1) + '%'
            },
            issues: this.results.issues,
            recommendations: this.generateRecommendations()
        };

        fs.writeFileSync('./tool-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 详细报告已保存: tool-test-report.json');
    }

    // 生成修复建议
    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.issues.length > 0) {
            recommendations.push('检查并修复有问题的工具文件');
            
            const missingFiles = this.results.issues.filter(issue => 
                issue.issues.some(i => i.includes('文件不存在'))
            );
            if (missingFiles.length > 0) {
                recommendations.push(`有 ${missingFiles.length} 个工具的文件缺失，需要重新生成`);
            }

            const cssIssues = this.results.issues.filter(issue => 
                issue.issues.some(i => i.includes('CSS文件不存在'))
            );
            if (cssIssues.length > 0) {
                recommendations.push(`有 ${cssIssues.length} 个工具的CSS文件缺失`);
            }

            const jsIssues = this.results.issues.filter(issue => 
                issue.issues.some(i => i.includes('JS文件不存在'))
            );
            if (jsIssues.length > 0) {
                recommendations.push(`有 ${jsIssues.length} 个工具的JS文件缺失`);
            }
        }

        if (recommendations.length === 0) {
            recommendations.push('所有工具都正常，无需修复');
        }

        return recommendations;
    }

    // 修复常见问题
    async fixCommonIssues() {
        console.log('\n🔧 开始修复常见问题...');

        for (const issue of this.results.issues) {
            const tool = issue.tool;
            const toolPath = tool.url.replace('./', '');
            const indexPath = path.join(toolPath, 'index.html');

            // 如果文件不存在，尝试从备份或模板创建
            if (issue.issues.includes('文件不存在')) {
                console.log(`🔧 尝试修复: ${tool.name}`);
                
                // 检查是否有备份文件
                const backupPath = indexPath + '.backup';
                if (fs.existsSync(backupPath)) {
                    fs.copyFileSync(backupPath, indexPath);
                    console.log(`   ✅ 从备份恢复: ${tool.name}`);
                } else {
                    console.log(`   ⚠️  无法修复: ${tool.name} - 需要手动处理`);
                }
            }
        }
    }
}

// 导出类
module.exports = ToolTester;

// 如果直接运行此脚本
if (require.main === module) {
    const tester = new ToolTester();
    
    tester.testAllTools().then(() => {
        console.log('\n🎉 测试完成！');
        
        if (tester.results.invalid > 0) {
            console.log('⚠️  发现问题，建议查看详细报告进行修复');
        } else {
            console.log('✅ 所有工具都正常！');
        }
    }).catch(error => {
        console.error('❌ 测试过程中发生错误:', error);
    });
}

#!/usr/bin/env node

/**
 * 检查重名工具并去重
 */

const fs = require('fs');

class DuplicateChecker {
    constructor() {
        this.appJsPath = './js/app.js';
        this.duplicates = [];
        this.tools = [];
    }

    // 分析工具重复情况
    analyzeDuplicates() {
        console.log('🔍 检查重名工具...\n');

        const appContent = fs.readFileSync(this.appJsPath, 'utf-8');
        
        // 提取所有工具
        const toolMatches = appContent.match(/{\s*id:\s*\d+,[\s\S]*?}/g) || [];
        
        const toolNames = new Map();
        const toolsById = new Map();

        for (const toolMatch of toolMatches) {
            const idMatch = toolMatch.match(/id:\s*(\d+)/);
            const nameMatch = toolMatch.match(/name:\s*'([^']+)'/);
            const categoryMatch = toolMatch.match(/category:\s*'([^']+)'/);
            const urlMatch = toolMatch.match(/url:\s*'([^']+)'/);
            const isOriginalMatch = toolMatch.match(/isOriginal:\s*(true|false)/);
            const isMigratedMatch = toolMatch.match(/isMigrated:\s*(true|false)/);

            if (idMatch && nameMatch && categoryMatch) {
                const tool = {
                    id: parseInt(idMatch[1]),
                    name: nameMatch[1],
                    category: categoryMatch[1],
                    url: urlMatch ? urlMatch[1] : '',
                    isOriginal: isOriginalMatch ? isOriginalMatch[1] === 'true' : false,
                    isMigrated: isMigratedMatch ? isMigratedMatch[1] === 'true' : false,
                    fullMatch: toolMatch
                };

                this.tools.push(tool);
                toolsById.set(tool.id, tool);

                // 检查重名
                const normalizedName = this.normalizeName(tool.name);
                if (toolNames.has(normalizedName)) {
                    const existing = toolNames.get(normalizedName);
                    this.duplicates.push({
                        name: normalizedName,
                        originalName: tool.name,
                        tools: [existing, tool]
                    });
                } else {
                    toolNames.set(normalizedName, tool);
                }
            }
        }

        return { tools: this.tools, duplicates: this.duplicates };
    }

    // 标准化工具名称用于比较
    normalizeName(name) {
        return name
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^\w\u4e00-\u9fff]/g, '') // 保留中文和字母数字
            .replace(/工具$/, '')
            .replace(/器$/, '');
    }

    // 生成去重报告
    generateDeduplicationReport() {
        const { tools, duplicates } = this.analyzeDuplicates();

        console.log('📊 重复检查结果:');
        console.log(`   🔧 总工具数: ${tools.length}`);
        console.log(`   🔄 重复组数: ${duplicates.length}\n`);

        if (duplicates.length > 0) {
            console.log('🔍 发现的重复工具:');
            duplicates.forEach((dup, index) => {
                console.log(`\n${index + 1}. 重复组: "${dup.originalName}"`);
                dup.tools.forEach(tool => {
                    const type = tool.isOriginal ? '原创' : tool.isMigrated ? '迁移' : '其他';
                    console.log(`   - ID ${tool.id}: ${tool.name} (${type}) - ${tool.url}`);
                });
            });
        } else {
            console.log('✅ 未发现重复工具');
        }

        // 检查相似工具
        this.checkSimilarTools(tools);

        return { tools, duplicates };
    }

    // 检查相似工具
    checkSimilarTools(tools) {
        console.log('\n🔍 检查相似工具名称:');
        
        const similarGroups = [];
        const processed = new Set();

        for (let i = 0; i < tools.length; i++) {
            if (processed.has(i)) continue;

            const tool1 = tools[i];
            const similar = [tool1];

            for (let j = i + 1; j < tools.length; j++) {
                if (processed.has(j)) continue;

                const tool2 = tools[j];
                if (this.isSimilar(tool1.name, tool2.name)) {
                    similar.push(tool2);
                    processed.add(j);
                }
            }

            if (similar.length > 1) {
                similarGroups.push(similar);
                processed.add(i);
            }
        }

        if (similarGroups.length > 0) {
            similarGroups.forEach((group, index) => {
                console.log(`\n相似组 ${index + 1}:`);
                group.forEach(tool => {
                    const type = tool.isOriginal ? '原创' : tool.isMigrated ? '迁移' : '其他';
                    console.log(`   - ${tool.name} (${type})`);
                });
            });
        } else {
            console.log('   ✅ 未发现相似工具');
        }
    }

    // 判断两个工具名称是否相似
    isSimilar(name1, name2) {
        const norm1 = this.normalizeName(name1);
        const norm2 = this.normalizeName(name2);
        
        // 如果标准化后相同，则相似
        if (norm1 === norm2) return true;
        
        // 如果一个包含另一个，则相似
        if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
        
        // 计算编辑距离
        const distance = this.levenshteinDistance(norm1, norm2);
        const maxLen = Math.max(norm1.length, norm2.length);
        const similarity = 1 - distance / maxLen;
        
        return similarity > 0.8; // 80%相似度
    }

    // 计算编辑距离
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // 执行去重
    performDeduplication() {
        const { tools, duplicates } = this.analyzeDuplicates();
        
        if (duplicates.length === 0) {
            console.log('\n✅ 无需去重');
            return false;
        }

        console.log('\n🔧 开始去重处理...');

        let appContent = fs.readFileSync(this.appJsPath, 'utf-8');
        const toolsToRemove = [];

        // 对于每个重复组，保留优先级最高的工具
        duplicates.forEach(dup => {
            const tools = dup.tools.sort((a, b) => {
                // 优先级：原创 > 迁移 > 其他，ID小的优先
                if (a.isOriginal && !b.isOriginal) return -1;
                if (!a.isOriginal && b.isOriginal) return 1;
                if (a.isMigrated && !b.isMigrated) return -1;
                if (!a.isMigrated && b.isMigrated) return 1;
                return a.id - b.id;
            });

            // 保留第一个，移除其他
            for (let i = 1; i < tools.length; i++) {
                toolsToRemove.push(tools[i]);
            }
        });

        // 从代码中移除重复工具
        toolsToRemove.forEach(tool => {
            console.log(`   🗑️  移除重复工具: ${tool.name} (ID: ${tool.id})`);
            
            // 移除工具定义（包括前后的逗号和换行）
            const toolPattern = new RegExp(
                tool.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ',?\\s*',
                'g'
            );
            appContent = appContent.replace(toolPattern, '');
        });

        // 清理多余的逗号
        appContent = appContent.replace(/,(\s*),/g, ',');
        appContent = appContent.replace(/,(\s*)\]/g, '$1]');

        // 写回文件
        fs.writeFileSync(this.appJsPath, appContent);

        console.log(`\n✅ 去重完成，移除了 ${toolsToRemove.length} 个重复工具`);
        return true;
    }

    // 移除原创工具分类
    removeOriginalCategory() {
        console.log('\n🔧 移除"原创工具"分类和相关代码...');

        let appContent = fs.readFileSync(this.appJsPath, 'utf-8');

        // 移除分类定义中的原创工具分类
        const originalCategoryPattern = /,\s*{\s*id:\s*'original',[\s\S]*?}\s*(?=\])/;
        appContent = appContent.replace(originalCategoryPattern, '');

        // 移除分类过滤逻辑中的原创工具处理
        const filterPattern = /if \(this\.currentCategory === 'original'\) \{[\s\S]*?\} else \{/;
        appContent = appContent.replace(filterPattern, '{');

        // 移除原创徽章显示逻辑
        const badgePattern = /const originalBadge = tool\.isOriginal \? '<span class="original-badge">原创<\/span>' : '';/;
        appContent = appContent.replace(badgePattern, 'const originalBadge = "";');

        // 移除工具卡片中的原创徽章
        const cardBadgePattern = /\$\{tool\.name\}\$\{originalBadge\}/g;
        appContent = appContent.replace(cardBadgePattern, '${tool.name}');

        // 移除工具标签中的"原创工具"
        appContent = appContent.replace(/'原创工具'/g, "'实用工具'");

        fs.writeFileSync(this.appJsPath, appContent);

        console.log('   ✅ 已移除"原创工具"分类和相关代码');
    }
}

// 导出类
module.exports = DuplicateChecker;

// 如果直接运行此脚本
if (require.main === module) {
    const checker = new DuplicateChecker();
    
    // 生成去重报告
    checker.generateDeduplicationReport();
    
    // 执行去重
    const needsDeduplication = checker.performDeduplication();
    
    // 移除原创工具分类
    checker.removeOriginalCategory();
    
    if (needsDeduplication) {
        console.log('\n🎉 去重和分类清理完成！');
        console.log('🌐 请在浏览器中查看更新后的工具站');
    } else {
        console.log('\n🎉 分类清理完成！');
        console.log('🌐 已移除"原创工具"分类');
    }
}

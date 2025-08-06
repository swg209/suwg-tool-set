// ===== 工具页面通用JavaScript工具函数 =====

class ToolUtils {
  // 初始化主题
  static initTheme() {
    const savedTheme = localStorage.getItem('ai-tools-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // 设置主题切换按钮
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme);
    }
  }

  // 切换主题
  static toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ai-tools-theme', newTheme);
  }

  // 复制文本到剪贴板
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('已复制到剪贴板', 'success');
      return true;
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        this.showToast('已复制到剪贴板', 'success');
        return true;
      } catch (fallbackErr) {
        this.showToast('复制失败，请手动复制', 'error');
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  // 显示提示消息
  static showToast(message, type = 'info', duration = 3000) {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 创建新的toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加样式
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      fontSize: '14px',
      zIndex: '9999',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '300px',
      wordWrap: 'break-word'
    });

    // 设置背景色
    const colors = {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    };
    toast.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    // 自动隐藏
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  // 下载文件
  static downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    this.showToast(`文件 ${filename} 已下载`, 'success');
  }

  // 格式化数字
  static formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // 防抖函数
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 节流函数
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // 验证JSON格式
  static isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 美化JSON
  static formatJSON(str, indent = 2) {
    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, indent);
    } catch (e) {
      throw new Error('无效的JSON格式');
    }
  }

  // 压缩JSON
  static minifyJSON(str) {
    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed);
    } catch (e) {
      throw new Error('无效的JSON格式');
    }
  }

  // 颜色转换工具
  static colorUtils = {
    // HEX转RGB
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    // RGB转HEX
    rgbToHex(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // RGB转HSL
    rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      };
    },

    // HSL转RGB
    hslToRgb(h, s, l) {
      h /= 360;
      s /= 100;
      l /= 100;

      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    }
  };

  // 文本统计工具
  static textUtils = {
    // 统计字符数（包含空格）
    countCharacters(text) {
      return text.length;
    },

    // 统计字符数（不含空格）
    countCharactersNoSpaces(text) {
      return text.replace(/\s/g, '').length;
    },

    // 统计单词数
    countWords(text) {
      return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    },

    // 统计中文字符数
    countChineseCharacters(text) {
      const chineseRegex = /[\u4e00-\u9fff]/g;
      const matches = text.match(chineseRegex);
      return matches ? matches.length : 0;
    },

    // 统计英文单词数
    countEnglishWords(text) {
      const englishRegex = /[a-zA-Z]+/g;
      const matches = text.match(englishRegex);
      return matches ? matches.length : 0;
    },

    // 统计行数
    countLines(text) {
      return text === '' ? 0 : text.split('\n').length;
    },

    // 统计段落数
    countParagraphs(text) {
      return text.trim() === '' ? 0 : text.trim().split(/\n\s*\n/).length;
    },

    // 统计句子数
    countSentences(text) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return sentences.length;
    }
  };
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  ToolUtils.initTheme();
});

// 导出到全局
window.ToolUtils = ToolUtils;

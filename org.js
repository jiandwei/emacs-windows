
/**
 * Org Mode HTML Export Enhancements
 * 包含：Mermaid 初始化、交互功能、莫兰迪主题适配
 */

document.addEventListener('DOMContentLoaded', function() {
    // 等待 Mermaid CDN 加载完成（轮询检查）
    const checkMermaid = setInterval(function() {
        if (typeof mermaid !== 'undefined') {
            clearInterval(checkMermaid);
            console.log('Mermaid loaded from CDN');
            initMermaid();
            initOtherFeatures();
        }
    }, 50);

    // 超时处理（5秒后放弃）
    setTimeout(function() {
        clearInterval(checkMermaid);
        if (typeof mermaid === 'undefined') {
            showCDNError();
        }
    }, 5000);
});

/**
 * Mermaid 初始化（莫兰迪主题）
 */
function initMermaid() {
    // 检测当前主题模式
    const isDarkMode = window.matchMedia &&
                       window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 莫兰迪色系配置
    const morandiTheme = {
        light: {
            primaryColor: '#e8e4de',
            primaryTextColor: '#4a4a4a',
            primaryBorderColor: '#7a8fa3',
            lineColor: '#8b8680',
            secondaryColor: '#f0ede8',
            tertiaryColor: '#f7f5f0',
            fontFamily: '"Noto Serif CJK SC", "Source Han Serif SC", "PingFang SC", serif',
            fontSize: '14px'
        },
        dark: {
            primaryColor: '#3a3a3c',
            primaryTextColor: '#d4ccc4',
            primaryBorderColor: '#8a9eb0',
            lineColor: '#9a948e',
            secondaryColor: '#323234',
            tertiaryColor: '#2c2c2e',
            fontFamily: '"Noto Serif CJK SC", "Source Han Serif SC", "PingFang SC", serif',
            fontSize: '14px'
        }
    };

    // 初始化配置
    mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        themeVariables: isDarkMode ? morandiTheme.dark : morandiTheme.light,
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 15
        },
        sequence: {
            useMaxWidth: true,
            diagramMarginX: 50,
            diagramMarginY: 20
        },
        gantt: {
            useMaxWidth: true,
            barHeight: 30,
            barGap: 4
        }
    });

    // 清理可能残留的 Org 标记（容错处理）
    document.querySelectorAll('.mermaid').forEach(function(el) {
        let content = el.textContent || el.innerText;
        if (content.includes('#+begin_src')) {
            el.textContent = cleanOrgMarkers(content);
        }
    });

    // 监听系统主题变化，自动切换
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        mermaid.initialize({
            theme: 'base',
            themeVariables: e.matches ? morandiTheme.dark : morandiTheme.light
        });
        // 重新渲染已有图表
        document.querySelectorAll('.mermaid').forEach(function(el) {
            if (el.getAttribute('data-processed') === 'true') {
                const graphDefinition = el.getAttribute('data-graph-definition') || el.textContent;
                el.removeAttribute('data-processed');
                el.textContent = graphDefinition;
            }
        });
        mermaid.init();
    });
}

/**
 * 清理 Org 标记（容错）
 */
function cleanOrgMarkers(text) {
    return text
        .replace(/#\+begin_src mermaid.*\n/g, '')
        .replace(/#\+end_src/g, '')
        .replace(/#\+begin_export html\n<div class="mermaid">\n/g, '')
        .replace(/<\/div>\n#\+end_export/g, '')
        .trim();
}

/**
 * CDN 加载失败提示
 */
function showCDNError() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: #b8a8a0;
        color: #f7f5f0;
        text-align: center;
        padding: 10px;
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    errorDiv.innerHTML = '⚠️ Mermaid CDN 加载失败，流程图无法显示。请检查网络连接。';
    document.body.insertBefore(errorDiv, document.body.firstChild);
}

/**
 * 其他功能初始化
 */
function initOtherFeatures() {
    initBackToTop();
    initCodeCopy();
    initExternalLinks();
    initImageZoom();
}

/**
 * 返回顶部按钮
 */
function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', '返回顶部');
    btn.style.cssText = `
        position: fixed;
        bottom: 2em;
        right: 2em;
        width: 40px;
        height: 40px;
        background: #7a8fa3;
        color: #f7f5f0;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        box-shadow: 0 2px 8px rgba(139, 134, 128, 0.3);
        z-index: 1000;
    `;

    document.body.appendChild(btn);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            btn.style.opacity = '0.8';
            btn.style.visibility = 'visible';
        } else {
            btn.style.opacity = '0';
            btn.style.visibility = 'hidden';
        }
    });

    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 夜间模式适配
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        btn.style.background = '#8a9eb0';
        btn.style.color = '#2c2c2e';
    }
}

/**
 * 代码块复制功能
 */
function initCodeCopy() {
    document.querySelectorAll('pre').forEach(function(pre) {
        if (pre.querySelector('.copy-button')) return;

        const btn = document.createElement('button');
        btn.className = 'copy-button';
        btn.innerHTML = '复制';
        btn.style.cssText = `
            position: absolute;
            top: 0.5em;
            right: 0.5em;
            padding: 0.2em 0.8em;
            background: #7a8fa3;
            color: #f7f5f0;
            border: none;
            border-radius: 4px;
            font-size: 0.75em;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 10;
        `;

        pre.style.position = 'relative';
        pre.appendChild(btn);

        pre.addEventListener('mouseenter', () => btn.style.opacity = '0.9');
        pre.addEventListener('mouseleave', () => btn.style.opacity = '0');

        btn.addEventListener('click', function() {
            const code = pre.querySelector('code') || pre;
            navigator.clipboard.writeText(code.innerText).then(function() {
                btn.innerHTML = '已复制';
                btn.style.background = '#8a9a7e';
                setTimeout(() => {
                    btn.innerHTML = '复制';
                    btn.style.background = '#7a8fa3';
                }, 2000);
            });
        });
    });
}

/**
 * 外部链接新窗口打开
 */
function initExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(function(link) {
        if (!link.hasAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

/**
 * 图片点击放大
 */
function initImageZoom() {
    document.querySelectorAll('.figure img').forEach(function(img) {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function() {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(44, 44, 46, 0.95);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: zoom-out;
                opacity: 0;
                transition: opacity 0.3s;
            `;

            const clone = img.cloneNode();
            clone.style.maxWidth = '90%';
            clone.style.maxHeight = '90%';
            clone.style.cursor = 'zoom-out';

            overlay.appendChild(clone);
            document.body.appendChild(overlay);

            setTimeout(() => overlay.style.opacity = '1', 10);
            overlay.addEventListener('click', () => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            });
        });
    });
}

/**
 * 可折叠目录功能
 */
function initCollapsibleTOC() {
    const toc = document.getElementById('table-of-contents');
    if (!toc) return;

    const tocTitle = toc.querySelector('h2');
    const tocContent = document.getElementById('text-table-of-contents');

    if (!tocTitle || !tocContent) return;

    // 添加可点击样式和箭头指示器
    tocTitle.style.cursor = 'pointer';
    tocTitle.style.position = 'relative';
    tocTitle.style.paddingLeft = '1.5em';
    tocTitle.style.userSelect = 'none';
    tocTitle.title = '点击折叠/展开目录';

    // 创建箭头图标（莫兰迪蓝色）
    const arrow = document.createElement('span');
    arrow.innerHTML = '▼';
    arrow.style.cssText = `
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        transition: transform 0.3s ease;
        font-size: 0.8em;
        color: var(--morandi-blue);
        display: inline-block;
    `;
    tocTitle.insertBefore(arrow, tocTitle.firstChild);

    // 添加悬停提示文字（临时显示）
    const hint = document.createElement('span');
    hint.textContent = ' [折叠]';
    hint.style.cssText = `
        font-size: 0.6em;
        color: var(--text-muted);
        margin-left: 0.5em;
        opacity: 0;
        transition: opacity 0.3s;
        font-weight: normal;
    `;
    tocTitle.appendChild(hint);

    tocTitle.addEventListener('mouseenter', () => hint.style.opacity = '1');
    tocTitle.addEventListener('mouseleave', () => hint.style.opacity = '0');

    // 点击切换折叠状态
    tocTitle.addEventListener('click', function(e) {
        e.preventDefault();
        const isCollapsed = tocContent.classList.toggle('toc-collapsed');

        // 旋转箭头
        arrow.style.transform = isCollapsed
            ? 'translateY(-50%) rotate(-90deg)'
            : 'translateY(-50%) rotate(0deg)';

        hint.textContent = isCollapsed ? ' [展开]' : ' [折叠]';

        // 保存用户偏好到本地存储
        try {
            localStorage.setItem('org-toc-collapsed', isCollapsed ? 'true' : 'false');
        } catch (e) {
            // 忽略隐私模式下的存储错误
        }
    });

    // 恢复上次的折叠状态（默认展开）
    try {
        if (localStorage.getItem('org-toc-collapsed') === 'true') {
            tocContent.classList.add('toc-collapsed');
            arrow.style.transform = 'translateY(-50%) rotate(-90deg)';
            hint.textContent = ' [展开]';
        }
    } catch (e) {
        // 忽略
    }

    // 键盘快捷键支持（Ctrl/Cmd + \ 切换目录）
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
            e.preventDefault();
            tocTitle.click();
        }
    });
}

// 在 initOtherFeatures() 中调用：
function initOtherFeatures() {
    initMermaid();
    initBackToTop();
    initCodeCopy();
    initExternalLinks();
    initImageZoom();
    initCollapsibleTOC();  // 添加这一行
}

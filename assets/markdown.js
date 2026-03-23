// ===== Markdown 交互增强脚本 =====

document.addEventListener('DOMContentLoaded', function() {
    // 1. 初始化 Mermaid 图表
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: true,
            theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
            themeVariables: {
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            }
        });
    }

    // 2. 添加暗色/亮色切换按钮
    addThemeToggle();

    // 3. 为标题添加锚点链接
    addAnchorLinks();

    // 4. 代码块添加复制按钮
    addCopyButtons();

    // 5. 表格响应式包装
    wrapTables();

    // 6. 图片点击放大
    enhanceImages();

    // 7. 平滑滚动
    document.documentElement.style.scrollBehavior = 'smooth';
});

// 主题切换
function addThemeToggle() {
    const toggle = document.createElement('button');
    toggle.id = 'theme-toggle';
    toggle.innerHTML = '🌙';
    toggle.title = '切换主题';
    toggle.onclick = toggleTheme;
    document.body.appendChild(toggle);

    // 检查本地存储的主题偏好
    const savedTheme = localStorage.getItem('markdown-theme');
    if (savedTheme === 'dark') {
        document.documentElement.style.colorScheme = 'dark';
        toggle.innerHTML = '☀️';
    } else if (savedTheme === 'light') {
        document.documentElement.style.colorScheme = 'light';
    }
}

function toggleTheme() {
    const isDark = document.documentElement.style.colorScheme === 'dark' ||
                   (window.matchMedia('(prefers-color-scheme: dark)').matches &&
                    !document.documentElement.style.colorScheme);

    if (!isDark) {
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem('markdown-theme', 'dark');
        document.getElementById('theme-toggle').innerHTML = '☀️';
        // 更新 Mermaid 主题
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ theme: 'dark' });
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        }
    } else {
        document.documentElement.style.colorScheme = 'light';
        localStorage.setItem('markdown-theme', 'light');
        document.getElementById('theme-toggle').innerHTML = '🌙';
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ theme: 'default' });
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        }
    }
}

// 锚点链接
function addAnchorLinks() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
        if (!heading.id) {
            // 生成 ID：将标题文本转为小写，空格替换为连字符
            heading.id = heading.textContent.toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                .replace(/^-|-$/g, '');
        }

        const anchor = document.createElement('a');
        anchor.href = '#' + heading.id;
        anchor.className = 'anchor';
        anchor.innerHTML = '¶';
        anchor.title = '链接到此处';
        heading.prepend(anchor);
    });
}

// 代码复制按钮
function addCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.innerHTML = '📋';
        button.title = '复制代码';
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: var(--code-bg);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.2s;
        `;

        pre.style.position = 'relative';
        pre.appendChild(button);

        pre.addEventListener('mouseenter', () => button.style.opacity = '1');
        pre.addEventListener('mouseleave', () => button.style.opacity = '0');

        button.addEventListener('click', async () => {
            const code = pre.querySelector('code')?.textContent || pre.textContent;
            await navigator.clipboard.writeText(code);
            button.innerHTML = '✓';
            button.style.color = 'var(--accent-color)';
            setTimeout(() => {
                button.innerHTML = '📋';
                button.style.color = '';
            }, 2000);
        });
    });
}

// 表格响应式包装
function wrapTables() {
    document.querySelectorAll('table').forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'overflow-x: auto; margin: 0 0 16px 0;';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

// 图片增强
function enhanceImages() {
    document.querySelectorAll('img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            if (img.style.transform === 'scale(1.5)') {
                img.style.transform = 'scale(1)';
                img.style.cursor = 'zoom-in';
                img.style.zIndex = '';
            } else {
                img.style.transform = 'scale(1.5)';
                img.style.cursor = 'zoom-out';
                img.style.zIndex = '1000';
                img.style.position = 'relative';
            }
        });
    });
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('markdown-theme')) {
        // 用户未手动设置，跟随系统
        if (e.matches) {
            document.documentElement.style.colorScheme = 'dark';
            document.getElementById('theme-toggle').innerHTML = '☀️';
        } else {
            document.documentElement.style.colorScheme = 'light';
            document.getElementById('theme-toggle').innerHTML = '🌙';
        }
    }
});

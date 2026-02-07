// ============================================
// 可折叠目录管理器 (Collapsible TOC) - 修复版
// ============================================
const TOCManager = {
  toc: null,
  tocList: null,
  savedState: null,

  init() {
    this.toc = document.getElementById('table-of-contents') || document.querySelector('.toc');
    if (!this.toc) return;

    this.tocList = this.toc.querySelector('ul');
    if (!this.tocList) return;

    this.loadSavedState();
    this.enhanceTOC();
    this.setupIntersectionObserver();
    this.restoreState();
  },

  loadSavedState() {
    try {
      const saved = sessionStorage.getItem(config.tocStorageKey);
      this.savedState = saved ? JSON.parse(saved) : { collapsed: false, items: {} };
    } catch (e) {
      this.savedState = { collapsed: false, items: {} };
    }
  },

  saveState() {
    try {
      const state = {
        collapsed: this.toc.classList.contains('collapsed'),
        items: {}
      };

      this.toc.querySelectorAll('.toc-fold-btn').forEach((btn, index) => {
        if (btn.classList.contains('collapsed')) {
          state.items[index] = true;
        }
      });

      sessionStorage.setItem(config.tocStorageKey, JSON.stringify(state));
    } catch (e) {
      console.warn('无法保存目录状态:', e);
    }
  },

  restoreState() {
    if (!this.savedState) return;

    if (this.savedState.collapsed) {
      this.toc.classList.add('collapsed');
    }

    const buttons = this.toc.querySelectorAll('.toc-fold-btn');
    Object.keys(this.savedState.items || {}).forEach(index => {
      const btn = buttons[parseInt(index)];
      if (btn && this.savedState.items[index]) {
        this.collapseItem(btn, false);
      }
    });
  },

  enhanceTOC() {
    // 包装内容
    const content = document.createElement('div');
    content.className = 'toc-content';
    while (this.toc.firstChild) {
      content.appendChild(this.toc.firstChild);
    }
    this.toc.appendChild(content);

    // 创建头部
    const header = document.createElement('div');
    header.className = 'toc-header';
    header.innerHTML = `
      <h2>
        <span>目录</span>
        <span class="toc-toggle-icon">▼</span>
      </h2>
      <div class="toc-controls">
        <button class="toc-btn" id="toc-expand-all" title="展开全部">⊕</button>
        <button class="toc-btn" id="toc-collapse-all" title="收起全部">⊖</button>
      </div>
    `;

    this.toc.insertBefore(header, content);

    // 添加折叠功能到每个有子项的目录项
    this.addFoldButtons(this.tocList);

    // 事件监听
    header.addEventListener('click', (e) => {
      if (e.target.closest('.toc-btn')) return;
      this.toggleTOC();
    });

    document.getElementById('toc-expand-all').addEventListener('click', (e) => {
      e.stopPropagation();
      this.expandAll();
    });

    document.getElementById('toc-collapse-all').addEventListener('click', (e) => {
      e.stopPropagation();
      this.collapseAll();
    });

    // 点击目录项跳转
    this.toc.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          this.scrollTo(target);
          history.pushState(null, null, '#' + targetId);
        }
      }
    });
  },

  addFoldButtons(ul, level = 0) {
    const items = ul.children;

    Array.from(items).forEach((li, index) => {
      const subList = li.querySelector(':scope > ul'); // 只选择直接子级ul
      const link = li.querySelector(':scope > a'); // 只选择直接子级a

      // 创建目录项容器
      const itemDiv = document.createElement('div');
      itemDiv.className = 'toc-item';

      // 创建折叠按钮
      const foldBtn = document.createElement('span');
      foldBtn.className = 'toc-fold-btn';

      if (subList) {
        foldBtn.innerHTML = '▼';
        foldBtn.tabIndex = 0;
        foldBtn.setAttribute('role', 'button');
        foldBtn.setAttribute('aria-label', '折叠子目录');

        foldBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleItem(foldBtn);
        });

        foldBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleItem(foldBtn);
          }
        });

        // 递归处理子目录
        this.addFoldButtons(subList, level + 1);
      } else {
        // 占位符，保持对齐
        foldBtn.style.visibility = 'hidden';
      }

      // 重组DOM
      if (link) {
        const existingItem = li.querySelector('.toc-item');
        if (existingItem) {
          // 如果已经处理过，跳过
          return;
        }

        // 将link移到itemDiv中
        li.insertBefore(itemDiv, link);
        itemDiv.appendChild(foldBtn);
        itemDiv.appendChild(link);

        // 如果有子列表，确保它在itemDiv之后
        if (subList && !li.contains(subList)) {
          li.appendChild(subList);
        }
      }
    });
  },

  // 切换单个目录项（展开/收起）
  toggleItem(btn, save = true) {
    if (btn.classList.contains('collapsed')) {
      this.expandItem(btn, save);
    } else {
      this.collapseItem(btn, save);
    }
  },

  // 展开指定项（明确展开，不依赖当前状态）
  expandItem(btn, save = true) {
    const li = btn.closest('li');
    const subList = li.querySelector(':scope > ul');

    if (!subList) return;

    btn.classList.remove('collapsed');
    subList.classList.remove('collapsed');
    btn.innerHTML = '▼';
    btn.setAttribute('aria-label', '折叠子目录');

    if (save) this.saveState();
  },

  // 收起指定项（明确收起，不依赖当前状态）
  collapseItem(btn, save = true) {
    const li = btn.closest('li');
    const subList = li.querySelector(':scope > ul');

    if (!subList) return;

    btn.classList.add('collapsed');
    subList.classList.add('collapsed');
    btn.innerHTML = '▶';
    btn.setAttribute('aria-label', '展开子目录');

    if (save) this.saveState();
  },

  // 切换整个目录框的显示/隐藏
  toggleTOC() {
    this.toc.classList.toggle('collapsed');
    this.saveState();
  },

  // 展开所有层级（修复版）
  expandAll() {
    // 先确保整体目录展开
    if (this.toc.classList.contains('collapsed')) {
      this.toc.classList.remove('collapsed');
    }

    // 获取所有被折叠的按钮，从深层到浅层处理（避免动画冲突）
    const collapsedButtons = Array.from(this.toc.querySelectorAll('.toc-fold-btn.collapsed'));

    // 按DOM深度排序（深的先处理）
    collapsedButtons.sort((a, b) => {
      const depthA = this.getDepth(a);
      const depthB = this.getDepth(b);
      return depthB - depthA; // 降序，深层优先
    });

    collapsedButtons.forEach(btn => {
      this.expandItem(btn, false);
    });

    this.saveState();
  },

  // 收起所有层级（修复版）
  collapseAll() {
    // 获取所有展开的按钮，从浅层到深层处理
    const expandedButtons = Array.from(this.toc.querySelectorAll('.toc-fold-btn:not(.collapsed)'));

    // 过滤掉没有子列表的（占位符）
    const validButtons = expandedButtons.filter(btn => {
      const li = btn.closest('li');
      return li && li.querySelector(':scope > ul');
    });

    // 按DOM深度排序（浅层先处理）
    validButtons.sort((a, b) => {
      const depthA = this.getDepth(a);
      const depthB = this.getDepth(b);
      return depthA - depthB; // 升序，浅层优先
    });

    validButtons.forEach(btn => {
      this.collapseItem(btn, false);
    });

    this.saveState();
  },

  // 获取元素在目录树中的深度
  getDepth(element) {
    let depth = 0;
    let parent = element.closest('ul');
    while (parent && !parent.classList.contains('toc-list') && !parent.closest('#table-of-contents') === this.toc) {
      depth++;
      parent = parent.parentElement?.closest('ul');
    }
    return depth;
  },

  // 平滑滚动到锚点
  scrollTo(element) {
    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  },

  // 设置交叉观察器，高亮当前章节
  setupIntersectionObserver() {
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          this.highlightTOCItem(id);
        }
      });
    }, {
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    });

    headings.forEach(heading => observer.observe(heading));
  },

  // 高亮当前目录项
  highlightTOCItem(id) {
    this.toc.querySelectorAll('a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + id) {
        link.classList.add('active');

        // 自动展开父级
        let parent = link.closest('ul');
        while (parent && parent !== this.tocList) {
          parent.classList.remove('collapsed');
          const parentLi = parent.closest('li');
          if (parentLi) {
            const btn = parentLi.querySelector('.toc-fold-btn');
            if (btn && btn.classList.contains('collapsed')) {
              this.expandItem(btn, false);
            }
          }
          parent = parent.parentElement.closest('ul');
        }
      }
    });
  }
};

// ============================================
// Org Mode 复选框交互增强
// ============================================

const OrgCheckbox = {
  init() {
    this.enhanceCheckboxes();
    this.bindEvents();
  },

  enhanceCheckboxes() {
    // 查找所有包含 [ ] 或 [X] 的列表项
    document.querySelectorAll('li').forEach(li => {
      const text = li.textContent;
      const checkboxMatch = text.match(/^(\[[ X\-]\])\s*(.+)$/);

      if (checkboxMatch) {
        li.classList.add('org-checkbox-item');

        const marker = checkboxMatch[1];
        const content = checkboxMatch[2];

        let stateClass = '';
        let checked = false;

        if (marker === '[X]' || marker === '[x]') {
          stateClass = 'org-checkbox-state-done';
          checked = true;
        } else if (marker === '[-]') {
          stateClass = 'org-checkbox-state-todo';
        } else {
          stateClass = 'org-checkbox-state-none';
        }

        // 重构 DOM
        const wrapper = document.createElement('label');
        wrapper.className = 'org-checkbox-wrapper';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.dataset.state = stateClass;

        const visualCheckbox = document.createElement('span');
        visualCheckbox.className = `org-checkbox ${stateClass}`;

        const label = document.createElement('span');
        label.className = 'org-checkbox-label';
        label.textContent = content;

        wrapper.appendChild(checkbox);
        wrapper.appendChild(visualCheckbox);
        wrapper.appendChild(label);

        // 保留原始子列表（如果有）
        const sublist = li.querySelector('ul, ol');
        li.innerHTML = '';
        li.appendChild(wrapper);
        if (sublist) li.appendChild(sublist);
      }
    });
  },

  bindEvents() {
    document.querySelectorAll('.org-checkbox-wrapper input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const visual = e.target.nextElementSibling;
        const isChecked = e.target.checked;

        // 切换视觉状态
        visual.classList.remove('org-checkbox-state-none', 'org-checkbox-state-done', 'org-checkbox-state-todo');

        if (isChecked) {
          visual.classList.add('org-checkbox-state-done');
          e.target.dataset.state = 'org-checkbox-state-done';
        } else {
          visual.classList.add('org-checkbox-state-none');
          e.target.dataset.state = 'org-checkbox-state-none';
        }

        // 触发自定义事件
        e.target.dispatchEvent(new CustomEvent('orgCheckboxChange', {
          detail: { checked: isChecked, element: e.target }
        }));
      });
    });
  },

  // 获取所有复选框状态
  getStates() {
    const states = {};
    document.querySelectorAll('.org-checkbox-wrapper input').forEach((cb, index) => {
      states[index] = {
        checked: cb.checked,
        state: cb.dataset.state
      };
    });
    return states;
  },

  // 批量设置状态
  setStates(states) {
    const checkboxes = document.querySelectorAll('.org-checkbox-wrapper input');
    Object.keys(states).forEach(index => {
      const cb = checkboxes[index];
      if (cb) {
        cb.checked = states[index].checked;
        cb.dataset.state = states[index].state;
        const visual = cb.nextElementSibling;
        visual.className = `org-checkbox ${states[index].state}`;
      }
    });
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => OrgCheckbox.init());

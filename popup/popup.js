class PopupManager {
  constructor() {
    this.thoughtInput = document.getElementById('thoughtInput');
    this.saveButton = document.getElementById('saveThought');
    this.thoughtsList = document.querySelector('.thoughts-list');
    this.emailReminder = document.getElementById('emailReminder');
    this.contextMenu = null;
    this.activeTooltip = null;
    this.langSelect = document.getElementById('langSelect');
    
    this.init();
    this.initLanguage();
  }

  async init() {
    const email = await Storage.getEmail();
    if (!email) {
      this.showEmailReminder();
      return;
    }

    this.setupEventListeners();
    await this.loadThoughts();
  }

  async initLanguage() {
    const currentLang = await I18n.init();
    this.langSelect.value = currentLang;
    this.updateTexts();
    
    this.langSelect.addEventListener('change', () => {
      I18n.setLanguage(this.langSelect.value);
      this.updateTexts();
      
      chrome.runtime.reload();
    });
  }

  updateTexts() {
    document.title = I18n.getMessage('appName');
    
    document.querySelector('h1').textContent = I18n.getMessage('appName');
    this.thoughtInput.placeholder = I18n.getMessage('inputPlaceholder');
    this.saveButton.textContent = I18n.getMessage('save');
    document.getElementById('settingsBtn').title = I18n.getMessage('settings');
    document.getElementById('closeBtn').title = I18n.getMessage('close');
    
    const reminder = document.querySelector('#emailReminder p');
    if (reminder) {
      reminder.textContent = I18n.getMessage('emailReminder');
    }
    const goToSettings = document.getElementById('goToSettings');
    if (goToSettings) {
      goToSettings.textContent = I18n.getMessage('goToSettings');
    }
    
    chrome.action.setTitle({
      title: I18n.getMessage('appName')
    });
  }

  setupEventListeners() {
    this.saveButton.addEventListener('click', () => this.saveThought());
    
    document.getElementById('settingsBtn').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.sendMessage({ action: "openOptionsPage" });
      window.close();
    });

    document.getElementById('closeBtn').addEventListener('click', (e) => {
      e.preventDefault();
      window.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  }

  async saveThought() {
    const content = this.thoughtInput.value.trim();
    if (!content) return;

    const email = await Storage.getEmail();
    try {
      const { data, error } = await window.supabaseClient.saveThought(email, content);
      if (error) {
        console.error('保存失败:', error);
        return;
      }
      
      await Storage.addThought(data);
      
      this.thoughtInput.value = '';
      this.renderThoughts(await Storage.getThoughts());
    } catch (error) {
      console.error('保存失败:', error);
    }
  }

  async loadThoughts() {
    const email = await Storage.getEmail();
    try {
      const localThoughts = await Storage.getThoughts();
      this.renderThoughts(localThoughts);

      const { data: remoteThoughts, error } = await window.supabaseClient.getThoughts(email);
      if (error) {
        console.error('加载远程数据失败:', error);
        return;
      }

      const mergedThoughts = await Storage.mergeThoughts(remoteThoughts);
      this.renderThoughts(mergedThoughts);
    } catch (error) {
      console.error('加载失败:', error);
    }
  }

  renderThoughts(thoughts) {
    this.thoughtsList.innerHTML = thoughts.map(thought => this.createThoughtHTML(thought)).join('');
    this.setupThoughtActions();
  }

  createThoughtHTML(thought) {
    return `
      <div class="thought-item" data-id="${thought.id}">
        <div class="thought-content" title="${I18n.getMessage('copy')}">${thought.content}</div>
        <div class="thought-tooltip">${thought.content}</div>
        <div class="thought-actions">
          <button class="edit-btn" title="${I18n.getMessage('edit')}">✎</button>
          <button class="delete-btn" title="${I18n.getMessage('delete')}">×</button>
        </div>
      </div>
    `;
  }

  setupThoughtActions() {
    this.thoughtsList.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.editThought(e));
    });

    this.thoughtsList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteThought(e));
    });

    this.thoughtsList.querySelectorAll('.thought-content').forEach(content => {
      content.addEventListener('mouseenter', (e) => this.showTooltip(e));
      content.addEventListener('mouseleave', (e) => this.hideTooltip(e));
      content.addEventListener('contextmenu', (e) => this.showContextMenu(e));
    });

    document.addEventListener('click', () => this.hideContextMenu());
  }

  async editThought(e) {
    const thoughtItem = e.target.closest('.thought-item');
    const thoughtId = thoughtItem.dataset.id;
    const contentDiv = thoughtItem.querySelector('.thought-content');
    const currentContent = contentDiv.textContent;

    const newContent = prompt('编辑想法:', currentContent);
    if (newContent && newContent !== currentContent) {
      const { error } = await window.supabaseClient.updateThought(thoughtId, newContent);
      if (error) {
        console.error('更新失败:', error);
        return;
      }

      await Storage.updateThought(thoughtId, newContent);
      this.renderThoughts(await Storage.getThoughts());
    }
  }

  async deleteThought(e) {
    if (!confirm('确定要删除这条想法吗？')) return;

    const thoughtId = e.target.closest('.thought-item').dataset.id;
    
    const { error } = await window.supabaseClient.deleteThought(thoughtId);
    if (error) {
      console.error('删除失败:', error);
      return;
    }

    await Storage.deleteThought(thoughtId);
    this.renderThoughts(await Storage.getThoughts());
  }

  showEmailReminder() {
    this.emailReminder.classList.remove('hidden');
    document.getElementById('goToSettings').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: "openOptionsPage" });
      window.close();
    });
  }

  showTooltip(e) {
    const content = e.target;
    const tooltip = content.nextElementSibling;
    
    if (content.scrollWidth <= content.clientWidth) {
      return;
    }

    if (this.activeTooltip && this.activeTooltip !== tooltip) {
      this.activeTooltip.style.display = 'none';
    }

    tooltip.style.display = 'block';
    this.activeTooltip = tooltip;

    const rect = tooltip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      tooltip.style.left = 'auto';
      tooltip.style.right = '0';
    }
  }

  hideTooltip(e) {
    const tooltip = e.target.nextElementSibling;
    tooltip.style.display = 'none';
    this.activeTooltip = null;
  }

  showContextMenu(e) {
    e.preventDefault();
    
    this.hideContextMenu();

    const content = e.target.textContent;
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
      <div class="context-menu-item">${I18n.getMessage('copy')}</div>
    `;

    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;

    contextMenu.querySelector('.context-menu-item').addEventListener('click', () => {
      navigator.clipboard.writeText(content).then(() => {
        this.hideContextMenu();
      });
    });

    document.body.appendChild(contextMenu);
    this.contextMenu = contextMenu;

    contextMenu.style.display = 'block';
  }

  hideContextMenu() {
    if (this.contextMenu) {
      this.contextMenu.remove();
      this.contextMenu = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
}); 
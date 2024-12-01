class OptionsManager {
  constructor() {
    this.emailInput = document.getElementById('email');
    this.saveButton = document.getElementById('save');
    this.statusDiv = document.getElementById('status');
    
    this.init();
  }

  async init() {
    const savedEmail = await Storage.getEmail();
    if (savedEmail) {
      this.emailInput.value = savedEmail;
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.saveButton.addEventListener('click', this.saveEmail.bind(this));
    this.emailInput.addEventListener('input', () => {
      this.showStatus('', '');
    });
  }

  async saveEmail() {
    const email = this.emailInput.value.trim();
    
    if (!this.validateEmail(email)) {
      this.showStatus('请输入有效的电子邮件地址', 'error');
      return;
    }

    try {
      await Storage.saveEmail(email);
      const { data, error } = await supabaseClient.getThoughts(email);
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error('数据库连接失败');
      }

      this.showStatus('邮箱保存成功！', 'success');
    } catch (error) {
      console.error('保存失败:', error);
      this.showStatus('保存失败，请稍后重试', 'error');
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showStatus(message, type) {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        if (this.statusDiv.classList.contains('success')) {
          this.statusDiv.textContent = '';
          this.statusDiv.className = 'status';
        }
      }, 3000);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
}); 
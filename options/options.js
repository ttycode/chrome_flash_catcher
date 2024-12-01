class OptionsManager {
  constructor() {
    this.emailInput = document.getElementById('email');
    this.saveButton = document.getElementById('save');
    this.statusDiv = document.getElementById('status');
    
    this.init();
    this.initLanguage();
  }

  async init() {
    const savedEmail = await Storage.getEmail();
    if (savedEmail) {
      this.emailInput.value = savedEmail;
    }

    this.setupEventListeners();
  }

  async initLanguage() {
    const currentLang = await I18n.init();
    this.updateTexts();
  }

  updateTexts() {
    document.title = I18n.getMessage('appName');
    
    document.querySelector('h1').textContent = I18n.getMessage('settings');
    document.querySelector('label').textContent = I18n.getMessage('emailLabel');
    document.querySelector('.hint').textContent = I18n.getMessage('emailHint');
    this.saveButton.textContent = I18n.getMessage('save');
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
      this.showStatus(I18n.getMessage('invalidEmail'), 'error');
      return;
    }

    try {
      await Storage.saveEmail(email);
      const { data, error } = await supabaseClient.getThoughts(email);
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(I18n.getMessage('dbError'));
      }

      this.showStatus(I18n.getMessage('saveSuccess'), 'success');
    } catch (error) {
      console.error('Save failed:', error);
      this.showStatus(I18n.getMessage('saveFailed'), 'error');
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
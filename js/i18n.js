const i18n = {
  en: {
    appName: 'Flash Thoughts',
    settings: 'Settings',
    close: 'Close',
    inputPlaceholder: 'Write your thoughts...',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    copy: 'Copy',
    emailLabel: 'Email',
    emailHint: 'Email will be used to identify you, no password needed',
    emailReminder: 'Please set up your email in settings first',
    goToSettings: 'Go to Settings',
    editPrompt: 'Edit thought:',
    deleteConfirm: 'Are you sure you want to delete this thought?',
    invalidEmail: 'Please enter a valid email address',
    saveSuccess: 'Email saved successfully!',
    saveFailed: 'Save failed, please try again later',
    dbError: 'Database connection failed',
    donate: 'Support Author',
    donateTitle: 'Thank you for your support!'
  },
  zh: {
    appName: '闪念笔记',
    settings: '设置',
    close: '关闭',
    inputPlaceholder: '记录你的想法...',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    copy: '复制内容',
    emailLabel: '电子邮件',
    emailHint: '邮箱将用于识别您的身份，无需密码',
    emailReminder: '请先在设置页面配置邮箱',
    goToSettings: '去设置',
    editPrompt: '编辑想法:',
    deleteConfirm: '确定要删除这条想法吗？',
    invalidEmail: '请输入有效的电子邮件地址',
    saveSuccess: '邮箱保存成功！',
    saveFailed: '保存失败，请稍后重试',
    dbError: '数据库连接失败',
    donate: '赞赏作者',
    donateTitle: '感谢您的赞赏！'
  }
};

// 获取浏览器语言
const getBrowserLanguage = () => {
  const lang = navigator.language.toLowerCase();
  return lang.startsWith('zh') ? 'zh' : 'en';
};

// 当前语言
let currentLang = getBrowserLanguage();

// 语言工具类
class I18n {
  static setLanguage(lang) {
    currentLang = lang;
    // 保存语言设置到本地存储
    chrome.storage.local.set({ language: lang });
  }

  static getMessage(key) {
    return i18n[currentLang][key] || i18n.en[key] || key;
  }

  static async init() {
    // 从本地存储加载语言设置
    const result = await chrome.storage.local.get(['language']);
    if (result.language) {
      currentLang = result.language;
    }
    return currentLang;
  }

  static getCurrentLang() {
    return currentLang;
  }
}

window.I18n = I18n; 
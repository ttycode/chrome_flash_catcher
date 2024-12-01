class Storage {
  static async saveEmail(email) {
    return chrome.storage.local.set({ email });
  }

  static async getEmail() {
    const result = await chrome.storage.local.get(['email']);
    return result.email;
  }

  // 新增：保存闪念到本地
  static async saveThoughts(thoughts) {
    return chrome.storage.local.set({ thoughts });
  }

  // 新增：获取本地闪念
  static async getThoughts() {
    const result = await chrome.storage.local.get(['thoughts']);
    return result.thoughts || [];
  }

  // 新增：添加单条闪念到本地
  static async addThought(thought) {
    const thoughts = await this.getThoughts();
    thoughts.unshift(thought); // 添加到开头
    return this.saveThoughts(thoughts);
  }

  // 新增：更新本地闪念
  static async updateThought(id, content) {
    const thoughts = await this.getThoughts();
    const index = thoughts.findIndex(t => t.id === id);
    if (index !== -1) {
      thoughts[index].content = content;
      thoughts[index].updated_at = new Date().toISOString();
      await this.saveThoughts(thoughts);
    }
  }

  // 新增：删除本地闪念
  static async deleteThought(id) {
    const thoughts = await this.getThoughts();
    const newThoughts = thoughts.filter(t => t.id !== id);
    await this.saveThoughts(newThoughts);
  }

  // 新增：合并远程和本地数据
  static async mergeThoughts(remoteThoughts) {
    const localThoughts = await this.getThoughts();
    
    // 创建一个 Map 来存储本地数据，以 id 为键
    const localMap = new Map(localThoughts.map(t => [t.id, t]));
    
    // 遍历远程数据，如果本地没有或远程数据更新时间更新，则更新本地数据
    remoteThoughts.forEach(remoteThought => {
      const localThought = localMap.get(remoteThought.id);
      if (!localThought || new Date(remoteThought.updated_at) > new Date(localThought.updated_at)) {
        localMap.set(remoteThought.id, remoteThought);
      }
    });

    // 转换回数组并按创建时间排序
    const mergedThoughts = Array.from(localMap.values())
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    await this.saveThoughts(mergedThoughts);
    return mergedThoughts;
  }
}

// 直接暴露给 window
window.Storage = Storage; 
// 全局状态管理 - 用于多用户界面和首页的毒株信息同步

import { VirusStrain } from '@/types/dealer';

interface GlobalVirusStrain extends VirusStrain {
  source: 'multi-user' | 'homepage';
  userId?: string;
  userName?: string;
}

class GlobalStateManager {
  private listeners: Set<() => void> = new Set();
  private virusStrains: GlobalVirusStrain[] = [];

  // 添加毒株
  addVirusStrain(strain: GlobalVirusStrain) {
    this.virusStrains.unshift(strain); // 最新的在前面
    this.notifyListeners();
  }

  // 获取所有毒株
  getVirusStrains(): GlobalVirusStrain[] {
    return [...this.virusStrains];
  }

  // 获取多用户毒株
  getMultiUserStrains(): GlobalVirusStrain[] {
    return this.virusStrains.filter(strain => strain.source === 'multi-user');
  }

  // 获取首页毒株
  getHomepageStrains(): GlobalVirusStrain[] {
    return this.virusStrains.filter(strain => strain.source === 'homepage');
  }

  // 订阅状态变化
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // 清空状态
  clear() {
    this.virusStrains = [];
    this.notifyListeners();
  }
}

// 创建全局实例
export const globalStateManager = new GlobalStateManager();

// 导出类型
export type { GlobalVirusStrain };

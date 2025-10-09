// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    location: null,
    personalStats: {
      createdStrains: 0,
      infectionCount: 0,
      spreadCount: 0,
      rank: 0
    },
    myStrains: [],
    collections: [],
    notificationEnabled: true
  },

  onLoad() {
    console.log('个人中心页面加载');
    this.initPage();
  },

  onShow() {
    console.log('个人中心页面显示');
    this.refreshData();
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 初始化页面
  async initPage() {
    try {
      // 获取用户信息
      this.setData({
        userInfo: app.globalData.userInfo,
        location: app.globalData.location
      });

      // 加载数据
      await this.loadPersonalStats();
      await this.loadMyStrains();
      await this.loadCollections();
      
      console.log('个人中心页面初始化完成');
    } catch (error) {
      console.error('个人中心页面初始化失败:', error);
      app.showToast('页面加载失败');
    }
  },

  // 刷新数据
  async refreshData() {
    try {
      await Promise.all([
        this.loadPersonalStats(),
        this.loadMyStrains(),
        this.loadCollections()
      ]);
      
      // 更新位置信息
      this.setData({
        location: app.globalData.location
      });
      
      console.log('个人中心数据刷新完成');
    } catch (error) {
      console.error('刷新数据失败:', error);
    }
  },

  // 加载个人统计
  async loadPersonalStats() {
    try {
      const response = await app.request({
        url: '/api/user/personal-stats',
        method: 'GET',
        data: {
          openid: app.globalData.openid
        }
      });

      if (response.success) {
        this.setData({
          personalStats: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          personalStats: this.getMockPersonalStats()
        });
      }
    } catch (error) {
      console.error('加载个人统计失败:', error);
      // 使用模拟数据
      this.setData({
        personalStats: this.getMockPersonalStats()
      });
    }
  },

  // 获取模拟个人统计数据
  getMockPersonalStats() {
    return {
      createdStrains: 8,
      infectionCount: 23,
      spreadCount: 156,
      rank: 12
    };
  },

  // 加载我的毒株
  async loadMyStrains() {
    try {
      const response = await app.request({
        url: '/api/user/my-strains',
        method: 'GET',
        data: {
          openid: app.globalData.openid,
          limit: 5
        }
      });

      if (response.success) {
        this.setData({
          myStrains: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          myStrains: this.getMockMyStrains()
        });
      }
    } catch (error) {
      console.error('加载我的毒株失败:', error);
      // 使用模拟数据
      this.setData({
        myStrains: this.getMockMyStrains()
      });
    }
  },

  // 获取模拟我的毒株数据
  getMockMyStrains() {
    return [
      {
        id: '1',
        title: '求推荐好吃的火锅店',
        content: '最近想吃火锅，求推荐附近好吃的火锅店',
        type: 'text',
        infections: 15,
        timeAgo: '2小时前'
      },
      {
        id: '2',
        title: '周末一起打羽毛球',
        content: '周末想找人一起打羽毛球，有附近的球友吗？',
        type: 'text',
        infections: 8,
        timeAgo: '3小时前'
      },
      {
        id: '3',
        title: '附近有什么好玩的',
        content: '刚搬到这里，想了解附近有什么好玩的地方',
        type: 'text',
        infections: 23,
        timeAgo: '5小时前'
      }
    ];
  },

  // 加载我的收藏
  async loadCollections() {
    try {
      const response = await app.request({
        url: '/api/user/collections',
        method: 'GET',
        data: {
          openid: app.globalData.openid,
          limit: 5
        }
      });

      if (response.success) {
        this.setData({
          collections: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          collections: this.getMockCollections()
        });
      }
    } catch (error) {
      console.error('加载我的收藏失败:', error);
      // 使用模拟数据
      this.setData({
        collections: this.getMockCollections()
      });
    }
  },

  // 获取模拟收藏数据
  getMockCollections() {
    return [
      {
        id: '4',
        title: '求租房子信息',
        content: '想租个一室一厅的房子，预算3000以内',
        type: 'form',
        collectedTime: '1天前'
      },
      {
        id: '5',
        title: '美食分享',
        content: '今天发现了一家超好吃的川菜馆',
        type: 'image',
        collectedTime: '2天前'
      }
    ];
  },

  // 登录
  async login() {
    try {
      app.showLoading('登录中...');
      
      // 获取用户信息
      const userInfo = await this.getUserInfo();
      
      // 调用后端API登录
      const response = await app.request({
        url: '/api/auth/login',
        method: 'POST',
        data: {
          userInfo: userInfo,
          openid: app.globalData.openid
        }
      });

      if (response.success) {
        app.globalData.userInfo = userInfo;
        this.setData({
          userInfo: userInfo
        });
        
        app.showToast('登录成功', 'success');
        
        // 重新加载数据
        this.refreshData();
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      app.showToast('登录失败，请重试');
    } finally {
      app.hideLoading();
    }
  },

  // 获取用户信息
  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: reject
      });
    });
  },

  // 退出登录
  async logout() {
    const confirmed = await app.showModal('确认退出', '确定要退出登录吗？');
    if (!confirmed) return;
    
    try {
      app.showLoading('退出中...');
      
      // 调用后端API退出
      await app.request({
        url: '/api/auth/logout',
        method: 'POST',
        data: {
          openid: app.globalData.openid
        }
      });
      
      // 清除本地数据
      app.globalData.userInfo = null;
      this.setData({
        userInfo: null,
        personalStats: {
          createdStrains: 0,
          infectionCount: 0,
          spreadCount: 0,
          rank: 0
        },
        myStrains: [],
        collections: []
      });
      
      app.showToast('退出成功', 'success');
    } catch (error) {
      console.error('退出登录失败:', error);
      app.showToast('退出失败，请重试');
    } finally {
      app.hideLoading();
    }
  },

  // 查看毒株详情
  viewStrainDetail(e) {
    const strainId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/strain/detail?id=${strainId}`
    });
  },

  // 查看全部毒株
  viewAllStrains() {
    wx.navigateTo({
      url: '/pages/user/my-strains'
    });
  },

  // 查看全部收藏
  viewAllCollections() {
    wx.navigateTo({
      url: '/pages/user/collections'
    });
  },

  // 更新位置
  async updateLocation() {
    try {
      app.showLoading('获取位置信息...');
      
      const location = await app.getCurrentLocation();
      app.globalData.location = location;
      this.setData({
        location: location
      });
      
      app.showToast('位置更新成功', 'success');
    } catch (error) {
      console.error('更新位置失败:', error);
      app.showToast('位置更新失败');
    } finally {
      app.hideLoading();
    }
  },

  // 通知设置
  notificationSettings() {
    wx.navigateTo({
      url: '/pages/settings/notification'
    });
  },

  // 切换通知
  toggleNotification(e) {
    const enabled = e.detail.value;
    this.setData({
      notificationEnabled: enabled
    });
    
    // 保存设置
    wx.setStorageSync('notificationEnabled', enabled);
    app.showToast(enabled ? '通知已开启' : '通知已关闭', 'success');
  },

  // 隐私设置
  privacySettings() {
    wx.navigateTo({
      url: '/pages/settings/privacy'
    });
  },

  // 关于应用
  aboutApp() {
    wx.navigateTo({
      url: '/pages/settings/about'
    });
  },

  // 跳转到发布页面
  goToPublish() {
    wx.switchTab({
      url: '/pages/strain/create'
    });
  },

  // WebSocket事件处理
  strainUpdate(data) {
    console.log('收到毒株更新:', data);
    this.loadMyStrains();
  },

  infectionUpdate(data) {
    console.log('收到感染更新:', data);
    this.loadPersonalStats();
  }
});

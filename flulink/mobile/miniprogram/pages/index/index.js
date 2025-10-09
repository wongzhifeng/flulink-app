// pages/index/index.js
const app = getApp();

Page({
  data: {
    stats: {
      totalStrains: 0,
      totalInfections: 0,
      activeUsers: 0,
      coverage: 0
    },
    nearbyStrains: [],
    lastUpdateTime: '',
    userInfo: null,
    location: null,
    websocketConnected: false
  },

  onLoad() {
    console.log('首页加载');
    this.initPage();
  },

  onShow() {
    console.log('首页显示');
    this.refreshData();
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.refreshData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    console.log('上拉加载更多');
    this.loadMoreStrains();
  },

  // 初始化页面
  async initPage() {
    try {
      // 获取用户信息
      this.setData({
        userInfo: app.globalData.userInfo,
        location: app.globalData.location,
        websocketConnected: app.globalData.websocketConnected
      });

      // 加载数据
      await this.loadStats();
      await this.loadNearbyStrains();
      
      // 设置更新时间
      this.setData({
        lastUpdateTime: this.formatTime(new Date())
      });

      console.log('首页初始化完成');
    } catch (error) {
      console.error('首页初始化失败:', error);
      app.showToast('页面加载失败');
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      app.showLoading('加载统计数据...');
      
      const response = await app.request({
        url: '/api/dashboard/stats',
        method: 'GET'
      });

      if (response.success) {
        this.setData({
          stats: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          stats: {
            totalStrains: 156,
            totalInfections: 1248,
            activeUsers: 89,
            coverage: 23
          }
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 使用模拟数据
      this.setData({
        stats: {
          totalStrains: 156,
          totalInfections: 1248,
          activeUsers: 89,
          coverage: 23
        }
      });
    } finally {
      app.hideLoading();
    }
  },

  // 加载附近毒株
  async loadNearbyStrains() {
    try {
      app.showLoading('加载附近毒株...');
      
      const location = app.globalData.location;
      if (!location) {
        throw new Error('位置信息不可用');
      }

      const response = await app.request({
        url: '/api/strains/nearby',
        method: 'GET',
        data: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 1000 // 1公里范围
        }
      });

      if (response.success) {
        this.setData({
          nearbyStrains: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          nearbyStrains: this.getMockNearbyStrains()
        });
      }
    } catch (error) {
      console.error('加载附近毒株失败:', error);
      // 使用模拟数据
      this.setData({
        nearbyStrains: this.getMockNearbyStrains()
      });
    } finally {
      app.hideLoading();
    }
  },

  // 获取模拟附近毒株数据
  getMockNearbyStrains() {
    return [
      {
        id: '1',
        title: '求推荐好吃的火锅店',
        content: '最近想吃火锅，求推荐附近好吃的火锅店，价格不要太贵',
        type: 'text',
        distance: 120,
        infections: 15,
        createdAt: '2024-10-06 14:30:00'
      },
      {
        id: '2',
        title: '周末一起打羽毛球',
        content: '周末想找人一起打羽毛球，有附近的球友吗？',
        type: 'text',
        distance: 350,
        infections: 8,
        createdAt: '2024-10-06 13:45:00'
      },
      {
        id: '3',
        title: '附近有什么好玩的',
        content: '刚搬到这里，想了解附近有什么好玩的地方',
        type: 'text',
        distance: 680,
        infections: 23,
        createdAt: '2024-10-06 12:20:00'
      }
    ];
  },

  // 刷新数据
  async refreshData() {
    try {
      await Promise.all([
        this.loadStats(),
        this.loadNearbyStrains()
      ]);
      
      this.setData({
        lastUpdateTime: this.formatTime(new Date())
      });
      
      app.showToast('数据刷新成功', 'success');
    } catch (error) {
      console.error('刷新数据失败:', error);
      app.showToast('刷新失败，请重试');
    }
  },

  // 加载更多毒株
  async loadMoreStrains() {
    try {
      // 这里可以实现分页加载逻辑
      console.log('加载更多毒株');
    } catch (error) {
      console.error('加载更多失败:', error);
    }
  },

  // 查看毒株详情
  viewStrainDetail(e) {
    const strainId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/strain/detail?id=${strainId}`
    });
  },

  // 跳转到发布页面
  goToPublish() {
    wx.switchTab({
      url: '/pages/strain/create'
    });
  },

  // 跳转到附近页面
  goToNearby() {
    wx.switchTab({
      url: '/pages/nearby/nearby'
    });
  },

  // 跳转到数据看板
  goToDashboard() {
    wx.switchTab({
      url: '/pages/dashboard/dashboard'
    });
  },

  // 跳转到个人中心
  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  // 格式化时间
  formatTime(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  },

  // WebSocket事件处理
  strainUpdate(data) {
    console.log('收到毒株更新:', data);
    this.refreshData();
  },

  infectionUpdate(data) {
    console.log('收到感染更新:', data);
    this.loadStats();
  },

  locationUpdate(data) {
    console.log('收到位置更新:', data);
    this.setData({
      location: data
    });
  }
});

// pages/dashboard/dashboard.js
const app = getApp();

Page({
  data: {
    globalStats: {
      totalStrains: 0,
      totalInfections: 0,
      activeUsers: 0,
      coverage: 0,
      strainsChange: 0,
      infectionsChange: 0,
      usersChange: 0,
      coverageChange: 0
    },
    personalStats: {
      createdStrains: 0,
      infectionCount: 0,
      spreadCount: 0,
      rank: 0
    },
    typeDistribution: [],
    timeRanges: [
      { value: 'today', name: '今日' },
      { value: 'week', name: '本周' },
      { value: 'month', name: '本月' },
      { value: 'all', name: '全部' }
    ],
    selectedTimeRange: 'today',
    hotStrains: [],
    lastUpdateTime: '',
    websocketConnected: false,
    autoRefresh: true,
    refreshTimer: null
  },

  onLoad() {
    console.log('数据看板页面加载');
    this.initPage();
  },

  onShow() {
    console.log('数据看板页面显示');
    this.refreshData();
    this.startAutoRefresh();
  },

  onHide() {
    console.log('数据看板页面隐藏');
    this.stopAutoRefresh();
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
      // 设置WebSocket连接状态
      this.setData({
        websocketConnected: app.globalData.websocketConnected
      });

      // 加载数据
      await this.loadGlobalStats();
      await this.loadPersonalStats();
      await this.loadTypeDistribution();
      await this.loadHotStrains();
      
      // 设置更新时间
      this.setData({
        lastUpdateTime: this.formatTime(new Date())
      });

      console.log('数据看板初始化完成');
    } catch (error) {
      console.error('数据看板初始化失败:', error);
      app.showToast('页面加载失败');
    }
  },

  // 加载全局统计
  async loadGlobalStats() {
    try {
      const response = await app.request({
        url: '/api/dashboard/global-stats',
        method: 'GET',
        data: {
          timeRange: this.data.selectedTimeRange
        }
      });

      if (response.success) {
        this.setData({
          globalStats: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          globalStats: this.getMockGlobalStats()
        });
      }
    } catch (error) {
      console.error('加载全局统计失败:', error);
      // 使用模拟数据
      this.setData({
        globalStats: this.getMockGlobalStats()
      });
    }
  },

  // 获取模拟全局统计数据
  getMockGlobalStats() {
    return {
      totalStrains: 156,
      totalInfections: 1248,
      activeUsers: 89,
      coverage: 23,
      strainsChange: 12,
      infectionsChange: 89,
      usersChange: 5,
      coverageChange: 2
    };
  },

  // 加载个人统计
  async loadPersonalStats() {
    try {
      const response = await app.request({
        url: '/api/dashboard/personal-stats',
        method: 'GET',
        data: {
          openid: app.globalData.openid,
          timeRange: this.data.selectedTimeRange
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

  // 加载类型分布
  async loadTypeDistribution() {
    try {
      const response = await app.request({
        url: '/api/dashboard/type-distribution',
        method: 'GET',
        data: {
          timeRange: this.data.selectedTimeRange
        }
      });

      if (response.success) {
        this.setData({
          typeDistribution: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          typeDistribution: this.getMockTypeDistribution()
        });
      }
    } catch (error) {
      console.error('加载类型分布失败:', error);
      // 使用模拟数据
      this.setData({
        typeDistribution: this.getMockTypeDistribution()
      });
    }
  },

  // 获取模拟类型分布数据
  getMockTypeDistribution() {
    return [
      {
        type: 'text',
        name: '文本毒株',
        count: 89,
        percentage: 57,
        color: '#4A90E2'
      },
      {
        type: 'image',
        name: '图片毒株',
        count: 45,
        percentage: 29,
        color: '#28a745'
      },
      {
        type: 'form',
        name: '表单毒株',
        count: 22,
        percentage: 14,
        color: '#ffc107'
      }
    ];
  },

  // 加载热门毒株
  async loadHotStrains() {
    try {
      const response = await app.request({
        url: '/api/dashboard/hot-strains',
        method: 'GET',
        data: {
          timeRange: this.data.selectedTimeRange,
          limit: 10
        }
      });

      if (response.success) {
        this.setData({
          hotStrains: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          hotStrains: this.getMockHotStrains()
        });
      }
    } catch (error) {
      console.error('加载热门毒株失败:', error);
      // 使用模拟数据
      this.setData({
        hotStrains: this.getMockHotStrains()
      });
    }
  },

  // 获取模拟热门毒株数据
  getMockHotStrains() {
    return [
      {
        id: '1',
        title: '求推荐好吃的火锅店',
        content: '最近想吃火锅，求推荐附近好吃的火锅店',
        type: 'text',
        infections: 45,
        timeAgo: '2小时前'
      },
      {
        id: '2',
        title: '周末一起打羽毛球',
        content: '周末想找人一起打羽毛球，有附近的球友吗？',
        type: 'text',
        infections: 32,
        timeAgo: '3小时前'
      },
      {
        id: '3',
        title: '附近有什么好玩的',
        content: '刚搬到这里，想了解附近有什么好玩的地方',
        type: 'text',
        infections: 28,
        timeAgo: '5小时前'
      },
      {
        id: '4',
        title: '求租房子信息',
        content: '想租个一室一厅的房子，预算3000以内',
        type: 'form',
        infections: 25,
        timeAgo: '6小时前'
      },
      {
        id: '5',
        title: '美食分享',
        content: '今天发现了一家超好吃的川菜馆',
        type: 'image',
        infections: 22,
        timeAgo: '8小时前'
      }
    ];
  },

  // 选择时间范围
  selectTimeRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      selectedTimeRange: range
    });
    
    // 重新加载数据
    this.refreshData();
  },

  // 刷新数据
  async refreshData() {
    try {
      await Promise.all([
        this.loadGlobalStats(),
        this.loadPersonalStats(),
        this.loadTypeDistribution(),
        this.loadHotStrains()
      ]);
      
      this.setData({
        lastUpdateTime: this.formatTime(new Date())
      });
      
      console.log('数据刷新完成');
    } catch (error) {
      console.error('刷新数据失败:', error);
    }
  },

  // 开始自动刷新
  startAutoRefresh() {
    if (this.data.autoRefresh && !this.data.refreshTimer) {
      this.data.refreshTimer = setInterval(() => {
        this.refreshData();
      }, 30000); // 30秒刷新一次
    }
  },

  // 停止自动刷新
  stopAutoRefresh() {
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
      this.data.refreshTimer = null;
    }
  },

  // 切换自动刷新
  toggleAutoRefresh(e) {
    const autoRefresh = e.detail.value;
    this.setData({
      autoRefresh: autoRefresh
    });
    
    if (autoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  },

  // 查看毒株详情
  viewStrainDetail(e) {
    const strainId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/strain/detail?id=${strainId}`
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
    this.loadGlobalStats();
    this.loadHotStrains();
  },

  infectionUpdate(data) {
    console.log('收到感染更新:', data);
    this.loadGlobalStats();
    this.loadPersonalStats();
  },

  locationUpdate(data) {
    console.log('收到位置更新:', data);
    this.setData({
      websocketConnected: app.globalData.websocketConnected
    });
  }
});

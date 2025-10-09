// pages/nearby/nearby.js
const app = getApp();

Page({
  data: {
    location: null,
    strainTypes: [
      { value: 'text', name: '文本' },
      { value: 'image', name: '图片' },
      { value: 'form', name: '表单' }
    ],
    selectedTypes: ['text', 'image', 'form'],
    distanceRange: 1000,
    sortOptions: [
      { value: 'distance', name: '距离最近' },
      { value: 'infections', name: '感染最多' },
      { value: 'time', name: '时间最新' }
    ],
    selectedSort: 'distance',
    nearbyStrains: [],
    loading: false
  },

  onLoad() {
    console.log('附近页面加载');
    this.initPage();
  },

  onShow() {
    console.log('附近页面显示');
    this.loadNearbyStrains();
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.loadNearbyStrains().then(() => {
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
      // 获取位置信息
      await this.updateLocation();
      
      // 加载附近毒株
      await this.loadNearbyStrains();
      
      console.log('附近页面初始化完成');
    } catch (error) {
      console.error('附近页面初始化失败:', error);
      app.showToast('页面加载失败');
    }
  },

  // 更新位置
  async updateLocation() {
    try {
      app.showLoading('获取位置信息...');
      
      const location = await app.getCurrentLocation();
      this.setData({
        location: location
      });
      
      app.hideLoading();
    } catch (error) {
      console.error('获取位置失败:', error);
      app.hideLoading();
      app.showToast('获取位置失败');
      
      // 使用默认位置
      this.setData({
        location: {
          latitude: 30.2741,
          longitude: 120.1551,
          address: '杭州市（默认位置）'
        }
      });
    }
  },

  // 切换类型筛选
  toggleTypeFilter(e) {
    const type = e.currentTarget.dataset.type;
    const selectedTypes = [...this.data.selectedTypes];
    const index = selectedTypes.indexOf(type);
    
    if (index > -1) {
      selectedTypes.splice(index, 1);
    } else {
      selectedTypes.push(type);
    }
    
    this.setData({
      selectedTypes: selectedTypes
    });
    
    // 重新加载数据
    this.loadNearbyStrains();
  },

  // 距离范围变化
  onDistanceChange(e) {
    const distance = e.detail.value;
    this.setData({
      distanceRange: distance
    });
    
    // 重新加载数据
    this.loadNearbyStrains();
  },

  // 选择排序方式
  selectSort(e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({
      selectedSort: sort
    });
    
    // 重新加载数据
    this.loadNearbyStrains();
  },

  // 加载附近毒株
  async loadNearbyStrains() {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      
      const location = this.data.location;
      if (!location) {
        throw new Error('位置信息不可用');
      }

      const response = await app.request({
        url: '/api/strains/nearby',
        method: 'GET',
        data: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: this.data.distanceRange,
          types: this.data.selectedTypes,
          sort: this.data.selectedSort,
          limit: 20
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
      this.setData({ loading: false });
    }
  },

  // 获取模拟附近毒株数据
  getMockNearbyStrains() {
    const mockData = [
      {
        id: '1',
        title: '求推荐好吃的火锅店',
        content: '最近想吃火锅，求推荐附近好吃的火锅店，价格不要太贵',
        type: 'text',
        typeName: '文本毒株',
        distance: 120,
        infections: 15,
        timeAgo: '2小时前',
        createdAt: '2024-10-06 14:30:00'
      },
      {
        id: '2',
        title: '周末一起打羽毛球',
        content: '周末想找人一起打羽毛球，有附近的球友吗？',
        type: 'text',
        typeName: '文本毒株',
        distance: 350,
        infections: 8,
        timeAgo: '3小时前',
        createdAt: '2024-10-06 13:45:00'
      },
      {
        id: '3',
        title: '美食分享',
        content: '今天发现了一家超好吃的川菜馆',
        type: 'image',
        typeName: '图片毒株',
        image: '/images/food-sample.jpg',
        distance: 680,
        infections: 23,
        timeAgo: '5小时前',
        createdAt: '2024-10-06 12:20:00'
      },
      {
        id: '4',
        title: '求租房子信息',
        content: '想租个一室一厅的房子，预算3000以内',
        type: 'form',
        typeName: '表单毒株',
        form: {
          title: '租房需求调查',
          options: ['一室一厅', '两室一厅', '合租', '整租']
        },
        distance: 920,
        infections: 12,
        timeAgo: '6小时前',
        createdAt: '2024-10-06 11:15:00'
      },
      {
        id: '5',
        title: '附近有什么好玩的',
        content: '刚搬到这里，想了解附近有什么好玩的地方',
        type: 'text',
        typeName: '文本毒株',
        distance: 1200,
        infections: 28,
        timeAgo: '8小时前',
        createdAt: '2024-10-06 09:30:00'
      }
    ];

    // 根据筛选条件过滤数据
    let filteredData = mockData;
    
    // 按类型筛选
    if (this.data.selectedTypes.length < 3) {
      filteredData = filteredData.filter(item => 
        this.data.selectedTypes.includes(item.type)
      );
    }
    
    // 按距离筛选
    filteredData = filteredData.filter(item => 
      item.distance <= this.data.distanceRange
    );
    
    // 按排序方式排序
    switch (this.data.selectedSort) {
      case 'distance':
        filteredData.sort((a, b) => a.distance - b.distance);
        break;
      case 'infections':
        filteredData.sort((a, b) => b.infections - a.infections);
        break;
      case 'time':
        filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    return filteredData;
  },

  // 加载更多毒株
  async loadMoreStrains() {
    // 这里可以实现分页加载逻辑
    console.log('加载更多毒株');
  },

  // 查看毒株详情
  viewStrainDetail(e) {
    const strainId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/strain/detail?id=${strainId}`
    });
  },

  // 感染毒株
  async infectStrain(e) {
    const strainId = e.currentTarget.dataset.id;
    
    try {
      app.showLoading('感染中...');
      
      const response = await app.request({
        url: '/api/strain/infect',
        method: 'POST',
        data: {
          strainId: strainId,
          location: this.data.location
        }
      });

      if (response.success) {
        app.showToast('感染成功！', 'success');
        
        // 更新本地数据
        const strains = [...this.data.nearbyStrains];
        const index = strains.findIndex(item => item.id === strainId);
        if (index > -1) {
          strains[index].infections += 1;
          this.setData({
            nearbyStrains: strains
          });
        }
        
        // 发送WebSocket消息
        app.sendWebSocketMessage({
          type: 'strain_infected',
          data: {
            strainId: strainId,
            location: this.data.location
          }
        });
      } else {
        throw new Error(response.message || '感染失败');
      }
    } catch (error) {
      console.error('感染毒株失败:', error);
      app.showToast('感染失败，请重试');
    } finally {
      app.hideLoading();
    }
  },

  // 分享毒株
  shareStrain(e) {
    const strainId = e.currentTarget.dataset.id;
    const strain = this.data.nearbyStrains.find(item => item.id === strainId);
    
    if (strain) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }
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
    this.loadNearbyStrains();
  },

  infectionUpdate(data) {
    console.log('收到感染更新:', data);
    // 更新本地感染数据
    const strains = [...this.data.nearbyStrains];
    const index = strains.findIndex(item => item.id === data.strainId);
    if (index > -1) {
      strains[index].infections = data.infections;
      this.setData({
        nearbyStrains: strains
      });
    }
  }
});

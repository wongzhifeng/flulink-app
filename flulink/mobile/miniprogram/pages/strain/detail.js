// pages/strain/detail.js
const app = getApp();

Page({
  data: {
    strainId: '',
    strain: null,
    spreadHistory: [],
    selectedOption: -1,
    infecting: false,
    collected: false,
    loading: true
  },

  onLoad(options) {
    console.log('毒株详情页面加载', options);
    this.setData({
      strainId: options.id
    });
    this.initPage();
  },

  onShow() {
    console.log('毒株详情页面显示');
  },

  onShareAppMessage() {
    const strain = this.data.strain;
    if (strain) {
      return {
        title: strain.title,
        path: `/pages/strain/detail?id=${strain.id}`,
        imageUrl: strain.image || ''
      };
    }
    return {
      title: 'FluLink毒株详情',
      path: '/pages/index/index'
    };
  },

  // 初始化页面
  async initPage() {
    try {
      await this.loadStrainDetail();
      await this.loadSpreadHistory();
      
      this.setData({
        loading: false
      });
      
      console.log('毒株详情页面初始化完成');
    } catch (error) {
      console.error('毒株详情页面初始化失败:', error);
      this.setData({
        loading: false
      });
      app.showToast('页面加载失败');
    }
  },

  // 加载毒株详情
  async loadStrainDetail() {
    try {
      const response = await app.request({
        url: `/api/strain/detail/${this.data.strainId}`,
        method: 'GET'
      });

      if (response.success) {
        this.setData({
          strain: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          strain: this.getMockStrainDetail()
        });
      }
    } catch (error) {
      console.error('加载毒株详情失败:', error);
      // 使用模拟数据
      this.setData({
        strain: this.getMockStrainDetail()
      });
    }
  },

  // 获取模拟毒株详情数据
  getMockStrainDetail() {
    return {
      id: this.data.strainId,
      title: '求推荐好吃的火锅店',
      content: '最近想吃火锅，求推荐附近好吃的火锅店，价格不要太贵，环境要好一些',
      type: 'text',
      typeName: '文本毒株',
      image: '',
      form: null,
      infections: 15,
      toxicity: 6.2,
      spreads: 8,
      distance: 120,
      timeAgo: '2小时前',
      createdAt: '2024-10-06 14:30:00',
      location: {
        latitude: 30.2741,
        longitude: 120.1551,
        address: '杭州市西湖区'
      }
    };
  },

  // 加载传播历史
  async loadSpreadHistory() {
    try {
      const response = await app.request({
        url: `/api/strain/spread-history/${this.data.strainId}`,
        method: 'GET'
      });

      if (response.success) {
        this.setData({
          spreadHistory: response.data
        });
      } else {
        // 使用模拟数据
        this.setData({
          spreadHistory: this.getMockSpreadHistory()
        });
      }
    } catch (error) {
      console.error('加载传播历史失败:', error);
      // 使用模拟数据
      this.setData({
        spreadHistory: this.getMockSpreadHistory()
      });
    }
  },

  // 获取模拟传播历史数据
  getMockSpreadHistory() {
    return [
      {
        time: '14:30',
        description: '毒株创建',
        location: '杭州市西湖区',
        status: 'success',
        statusText: '成功'
      },
      {
        time: '14:35',
        description: '首次感染',
        location: '杭州市西湖区文三路',
        status: 'success',
        statusText: '成功'
      },
      {
        time: '14:42',
        description: '传播到附近小区',
        location: '杭州市西湖区翠苑街道',
        status: 'success',
        statusText: '成功'
      },
      {
        time: '15:15',
        description: '跨区域传播',
        location: '杭州市西湖区中心',
        status: 'success',
        statusText: '成功'
      },
      {
        time: '15:30',
        description: '传播尝试',
        location: '杭州市拱墅区',
        status: 'pending',
        statusText: '进行中'
      }
    ];
  },

  // 预览图片
  previewImage() {
    const strain = this.data.strain;
    if (strain && strain.image) {
      wx.previewImage({
        urls: [strain.image],
        current: strain.image
      });
    }
  },

  // 选择表单选项
  selectOption(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      selectedOption: index
    });
  },

  // 感染毒株
  async infectStrain() {
    if (this.data.infecting) return;
    
    try {
      this.setData({ infecting: true });
      app.showLoading('感染中...');
      
      const response = await app.request({
        url: '/api/strain/infect',
        method: 'POST',
        data: {
          strainId: this.data.strainId,
          location: app.globalData.location,
          selectedOption: this.data.selectedOption >= 0 ? this.data.selectedOption : null
        }
      });

      if (response.success) {
        app.showToast('感染成功！', 'success');
        
        // 更新本地数据
        const strain = { ...this.data.strain };
        strain.infections += 1;
        this.setData({
          strain: strain
        });
        
        // 发送WebSocket消息
        app.sendWebSocketMessage({
          type: 'strain_infected',
          data: {
            strainId: this.data.strainId,
            location: app.globalData.location
          }
        });
      } else {
        throw new Error(response.message || '感染失败');
      }
    } catch (error) {
      console.error('感染毒株失败:', error);
      app.showToast('感染失败，请重试');
    } finally {
      this.setData({ infecting: false });
      app.hideLoading();
    }
  },

  // 分享毒株
  shareStrain() {
    const strain = this.data.strain;
    if (strain) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }
  },

  // 举报毒株
  async reportStrain() {
    const confirmed = await app.showModal('确认举报', '确定要举报这个毒株吗？');
    if (!confirmed) return;
    
    try {
      app.showLoading('举报中...');
      
      const response = await app.request({
        url: '/api/strain/report',
        method: 'POST',
        data: {
          strainId: this.data.strainId,
          reason: '内容不当'
        }
      });

      if (response.success) {
        app.showToast('举报成功', 'success');
      } else {
        throw new Error(response.message || '举报失败');
      }
    } catch (error) {
      console.error('举报毒株失败:', error);
      app.showToast('举报失败，请重试');
    } finally {
      app.hideLoading();
    }
  },

  // 收藏毒株
  async collectStrain() {
    try {
      const action = this.data.collected ? 'uncollect' : 'collect';
      app.showLoading(this.data.collected ? '取消收藏中...' : '收藏中...');
      
      const response = await app.request({
        url: `/api/strain/${action}`,
        method: 'POST',
        data: {
          strainId: this.data.strainId
        }
      });

      if (response.success) {
        this.setData({
          collected: !this.data.collected
        });
        app.showToast(this.data.collected ? '收藏成功' : '取消收藏成功', 'success');
      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      app.showToast('操作失败，请重试');
    } finally {
      app.hideLoading();
    }
  },

  // 获取毒性等级样式类
  getToxicityClass(toxicity) {
    if (toxicity <= 3) return 'toxicity-low';
    if (toxicity <= 7) return 'toxicity-medium';
    return 'toxicity-high';
  },

  // WebSocket事件处理
  strainUpdate(data) {
    console.log('收到毒株更新:', data);
    if (data.strainId === this.data.strainId) {
      this.loadStrainDetail();
    }
  },

  infectionUpdate(data) {
    console.log('收到感染更新:', data);
    if (data.strainId === this.data.strainId) {
      const strain = { ...this.data.strain };
      strain.infections = data.infections;
      this.setData({
        strain: strain
      });
    }
  }
});

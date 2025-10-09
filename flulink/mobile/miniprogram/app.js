// app.js
App({
  globalData: {
    userInfo: null,
    openid: '',
    location: null,
    apiBaseUrl: 'https://flulink-app.zeabur.app',
    zionConfig: {
      projectId: 'QP7kZReZywL',
      token: 'mg7edqye'
    },
    websocketUrl: 'wss://flulink-app.zeabur.app/ws',
    websocketConnected: false,
    websocketTask: null
  },

  onLaunch() {
    console.log('FluLink小程序启动');
    this.initApp();
  },

  onShow() {
    console.log('FluLink小程序显示');
  },

  onHide() {
    console.log('FluLink小程序隐藏');
  },

  onError(msg) {
    console.error('FluLink小程序错误:', msg);
  },

  // 初始化应用
  async initApp() {
    try {
      // 检查登录状态
      await this.checkLoginStatus();
      
      // 获取位置信息
      await this.getLocation();
      
      // 初始化WebSocket连接
      this.initWebSocket();
      
      console.log('应用初始化完成');
    } catch (error) {
      console.error('应用初始化失败:', error);
    }
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      const loginCode = await this.getLoginCode();
      if (loginCode) {
        // 调用后端API获取openid
        const response = await this.request({
          url: '/api/auth/login',
          method: 'POST',
          data: { code: loginCode }
        });
        
        if (response.success) {
          this.globalData.openid = response.data.openid;
          this.globalData.userInfo = response.data.userInfo;
          console.log('用户登录成功:', this.globalData.openid);
        }
      }
    } catch (error) {
      console.error('登录检查失败:', error);
    }
  },

  // 获取登录code
  getLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code);
          } else {
            reject(new Error('获取登录code失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 获取位置信息
  async getLocation() {
    try {
      const location = await this.getCurrentLocation();
      this.globalData.location = location;
      console.log('位置获取成功:', location);
    } catch (error) {
      console.error('位置获取失败:', error);
      // 使用默认位置（杭州）
      this.globalData.location = {
        latitude: 30.2741,
        longitude: 120.1551,
        address: '杭州市'
      };
    }
  },

  // 获取当前位置
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address || '未知位置'
          });
        },
        fail: reject
      });
    });
  },

  // 初始化WebSocket连接
  initWebSocket() {
    try {
      this.globalData.websocketTask = wx.connectSocket({
        url: this.globalData.websocketUrl,
        success: () => {
          console.log('WebSocket连接成功');
        },
        fail: (error) => {
          console.error('WebSocket连接失败:', error);
        }
      });

      // 监听WebSocket事件
      this.globalData.websocketTask.onOpen(() => {
        console.log('WebSocket连接已打开');
        this.globalData.websocketConnected = true;
      });

      this.globalData.websocketTask.onMessage((res) => {
        console.log('收到WebSocket消息:', res.data);
        this.handleWebSocketMessage(res.data);
      });

      this.globalData.websocketTask.onClose(() => {
        console.log('WebSocket连接已关闭');
        this.globalData.websocketConnected = false;
        // 尝试重连
        setTimeout(() => {
          this.initWebSocket();
        }, 5000);
      });

      this.globalData.websocketTask.onError((error) => {
        console.error('WebSocket错误:', error);
        this.globalData.websocketConnected = false;
      });
    } catch (error) {
      console.error('WebSocket初始化失败:', error);
    }
  },

  // 处理WebSocket消息
  handleWebSocketMessage(data) {
    try {
      const message = JSON.parse(data);
      switch (message.type) {
        case 'strain_update':
          // 毒株更新通知
          this.broadcastEvent('strainUpdate', message.data);
          break;
        case 'infection_update':
          // 感染更新通知
          this.broadcastEvent('infectionUpdate', message.data);
          break;
        case 'location_update':
          // 位置更新通知
          this.broadcastEvent('locationUpdate', message.data);
          break;
        default:
          console.log('未知WebSocket消息类型:', message.type);
      }
    } catch (error) {
      console.error('WebSocket消息解析失败:', error);
    }
  },

  // 广播事件
  broadcastEvent(eventName, data) {
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page[eventName]) {
        page[eventName](data);
      }
    });
  },

  // 发送WebSocket消息
  sendWebSocketMessage(message) {
    if (this.globalData.websocketConnected && this.globalData.websocketTask) {
      this.globalData.websocketTask.send({
        data: JSON.stringify(message)
      });
    }
  },

  // 统一请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.apiBaseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': this.globalData.openid ? `Bearer ${this.globalData.openid}` : ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: reject
      });
    });
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading();
  },

  // 显示消息提示
  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration
    });
  },

  // 显示确认对话框
  showModal(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  }
});

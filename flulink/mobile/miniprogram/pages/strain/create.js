// pages/strain/create.js
const app = getApp();

Page({
  data: {
    strainTypes: [
      {
        value: 'text',
        name: '文本毒株',
        desc: '纯文本内容，传播速度快',
        icon: '/images/text-icon.png'
      },
      {
        value: 'image',
        name: '图片毒株',
        desc: '图片内容，视觉冲击强',
        icon: '/images/image-icon.png'
      },
      {
        value: 'form',
        name: '表单毒株',
        desc: '结构化信息，互动性强',
        icon: '/images/form-icon.png'
      }
    ],
    selectedType: 'text',
    content: {
      text: '',
      image: '',
      form: {
        title: '',
        options: ['选项1', '选项2']
      }
    },
    location: null,
    prediction: {
      toxicity: 0,
      estimatedInfections: 0,
      delay: 0,
      successRate: 0
    },
    canPublish: false,
    publishing: false
  },

  onLoad() {
    console.log('发布页面加载');
    this.initPage();
  },

  onShow() {
    console.log('发布页面显示');
    this.updateLocation();
  },

  // 初始化页面
  async initPage() {
    try {
      // 获取位置信息
      await this.updateLocation();
      
      // 计算初始预测
      this.calculatePrediction();
      
      console.log('发布页面初始化完成');
    } catch (error) {
      console.error('发布页面初始化失败:', error);
      app.showToast('页面加载失败');
    }
  },

  // 选择毒株类型
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: type
    });
    
    // 重新计算预测
    this.calculatePrediction();
  },

  // 文本输入
  onTextInput(e) {
    this.setData({
      'content.text': e.detail.value
    });
    this.calculatePrediction();
  },

  // 图片选择
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          'content.image': tempFilePath
        });
        this.calculatePrediction();
      },
      fail: (error) => {
        console.error('选择图片失败:', error);
        app.showToast('选择图片失败');
      }
    });
  },

  // 删除图片
  removeImage() {
    this.setData({
      'content.image': ''
    });
    this.calculatePrediction();
  },

  // 表单标题输入
  onFormTitleInput(e) {
    this.setData({
      'content.form.title': e.detail.value
    });
    this.calculatePrediction();
  },

  // 表单选项输入
  onFormOptionInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const options = [...this.data.content.form.options];
    options[index] = value;
    
    this.setData({
      'content.form.options': options
    });
    this.calculatePrediction();
  },

  // 添加表单选项
  addFormOption() {
    const options = [...this.data.content.form.options];
    options.push(`选项${options.length + 1}`);
    
    this.setData({
      'content.form.options': options
    });
  },

  // 删除表单选项
  removeFormOption(e) {
    const index = e.currentTarget.dataset.index;
    const options = [...this.data.content.form.options];
    options.splice(index, 1);
    
    this.setData({
      'content.form.options': options
    });
    this.calculatePrediction();
  },

  // 更新位置
  async updateLocation() {
    try {
      app.showLoading('获取位置信息...');
      
      const location = await app.getCurrentLocation();
      this.setData({
        location: location
      });
      
      // 重新计算预测
      this.calculatePrediction();
      
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

  // 计算传播预测
  calculatePrediction() {
    const { selectedType, content, location } = this.data;
    
    if (!location) {
      this.setData({
        prediction: {
          toxicity: 0,
          estimatedInfections: 0,
          delay: 0,
          successRate: 0
        },
        canPublish: false
      });
      return;
    }

    let toxicity = 0;
    let estimatedInfections = 0;
    let delay = 0;
    let successRate = 0;

    // 根据类型和内容计算毒性评分
    switch (selectedType) {
      case 'text':
        if (content.text.length > 0) {
          toxicity = Math.min(10, Math.max(1, content.text.length / 50));
          estimatedInfections = Math.floor(toxicity * 3 + Math.random() * 10);
          delay = Math.floor(30 - toxicity * 2);
          successRate = Math.floor(60 + toxicity * 3);
        }
        break;
        
      case 'image':
        if (content.image) {
          toxicity = 7; // 图片通常毒性较高
          estimatedInfections = Math.floor(toxicity * 4 + Math.random() * 15);
          delay = Math.floor(20 - toxicity * 1.5);
          successRate = Math.floor(70 + toxicity * 2);
        }
        break;
        
      case 'form':
        if (content.form.title && content.form.options.length >= 2) {
          toxicity = Math.min(10, 5 + content.form.options.length);
          estimatedInfections = Math.floor(toxicity * 2 + Math.random() * 8);
          delay = Math.floor(45 - toxicity * 2);
          successRate = Math.floor(50 + toxicity * 4);
        }
        break;
    }

    // 确保数值在合理范围内
    toxicity = Math.max(1, Math.min(10, Math.round(toxicity * 10) / 10));
    estimatedInfections = Math.max(1, estimatedInfections);
    delay = Math.max(5, delay);
    successRate = Math.max(30, Math.min(95, successRate));

    // 检查是否可以发布
    const canPublish = this.checkCanPublish();

    this.setData({
      prediction: {
        toxicity,
        estimatedInfections,
        delay,
        successRate
      },
      canPublish
    });
  },

  // 检查是否可以发布
  checkCanPublish() {
    const { selectedType, content, location } = this.data;
    
    if (!location) return false;
    
    switch (selectedType) {
      case 'text':
        return content.text.trim().length > 0;
      case 'image':
        return content.image.length > 0;
      case 'form':
        return content.form.title.trim().length > 0 && 
               content.form.options.length >= 2 &&
               content.form.options.every(option => option.trim().length > 0);
      default:
        return false;
    }
  },

  // 获取毒性等级样式类
  getToxicityClass(toxicity) {
    if (toxicity <= 3) return 'toxicity-low';
    if (toxicity <= 7) return 'toxicity-medium';
    return 'toxicity-high';
  },

  // 发布毒株
  async publishStrain() {
    if (!this.data.canPublish || this.data.publishing) {
      return;
    }

    try {
      this.setData({ publishing: true });
      app.showLoading('发布中...');

      // 准备发布数据
      const publishData = {
        type: this.data.selectedType,
        content: this.data.content,
        location: this.data.location,
        prediction: this.data.prediction,
        timestamp: new Date().toISOString()
      };

      // 调用API发布
      const response = await app.request({
        url: '/api/strain/publish',
        method: 'POST',
        data: publishData
      });

      if (response.success) {
        app.showToast('发布成功！', 'success');
        
        // 发送WebSocket消息通知其他用户
        app.sendWebSocketMessage({
          type: 'strain_published',
          data: {
            strainId: response.data.id,
            location: this.data.location,
            prediction: this.data.prediction
          }
        });
        
        // 跳转到详情页面
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/strain/detail?id=${response.data.id}`
          });
        }, 1500);
      } else {
        throw new Error(response.message || '发布失败');
      }
    } catch (error) {
      console.error('发布毒株失败:', error);
      app.showToast('发布失败，请重试');
    } finally {
      this.setData({ publishing: false });
      app.hideLoading();
    }
  }
});

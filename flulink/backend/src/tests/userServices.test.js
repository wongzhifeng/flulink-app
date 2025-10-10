const supertest = require('supertest');
const { expect } = require('chai');
const app = require('../index');
const { User, UserService } = require('../models');

const request = supertest(app);

/**
 * 用户服务节点测试套件
 * 基于《德道经》"治大国若烹小鲜"原则 - 小步快跑测试
 */
describe('用户服务节点测试套件', () => {
  let authToken;
  let testUser;
  let testService;

  before(async () => {
    // 创建测试用户
    const response = await request
      .post('/api/auth/register')
      .send({
        phone: '13900000001',
        password: 'test123',
        nickname: '测试用户',
        location: {
          coordinates: [116.404, 39.915] // 北京天安门
        }
      });
    
    authToken = response.body.data.token;
    testUser = response.body.data.user;
  });

  describe('服务发布测试', () => {
    it('应该成功发布第一个服务', async () => {
      const response = await request
        .post('/api/services/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'housing',
          title: '合租房源',
          description: '两室一厅，环境优美，交通便利',
          location: {
            coordinates: [116.404, 39.915]
          },
          serviceRadius: 1.0
        });
      
      expect(response.status).to.equal(201);
      expect(response.body.success).to.be.true;
      expect(response.body.daoQuote).to.exist;
      expect(response.body.data.serviceType).to.equal('housing');
      
      testService = response.body.data;
    });

    it('新用户7天内不能发布第二个服务（"知止不殆"）', async () => {
      const response = await request
        .post('/api/services/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'repair',
          title: '维修服务',
          description: '家电维修，专业可靠',
          location: {
            coordinates: [116.404, 39.915]
          }
        });
      
      expect(response.status).to.equal(403);
      expect(response.body.daoQuote).to.include('知止不殆');
      expect(response.body.violations).to.be.an('array');
    });

    it('应该验证必填字段', async () => {
      const response = await request
        .post('/api/services/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'housing'
          // 缺少title, description, location
        });
      
      expect(response.status).to.equal(400);
    });

    it('应该验证服务类型枚举', async () => {
      const response = await request
        .post('/api/services/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'invalid_type',
          title: '测试服务',
          description: '测试描述',
          location: {
            coordinates: [116.404, 39.915]
          }
        });
      
      expect(response.status).to.equal(400);
    });
  });

  describe('服务匹配测试', () => {
    it('应该匹配到附近的服务', async () => {
      const response = await request
        .post('/api/services/match')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'housing',
          location: {
            coordinates: [116.405, 39.916] // 100米外
          },
          maxDistance: 1000
        });
      
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data.matches).to.be.an('array');
      expect(response.body.data.matches.length).to.be.greaterThan(0);
      
      // 验证匹配结果结构
      const match = response.body.data.matches[0];
      expect(match).to.have.property('service');
      expect(match).to.have.property('score');
      expect(match).to.have.property('distance');
      expect(match).to.have.property('breakdown');
    });

    it('超出范围不应该匹配到服务', async () => {
      const response = await request
        .post('/api/services/match')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'housing',
          location: {
            coordinates: [121.473, 31.230] // 上海，远离北京
          },
          maxDistance: 1000
        });
      
      expect(response.status).to.equal(200);
      expect(response.body.data.matches).to.be.an('array');
      expect(response.body.data.matches.length).to.equal(0);
    });

    it('应该支持不同服务类型匹配', async () => {
      const response = await request
        .post('/api/services/match')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'repair',
          location: {
            coordinates: [116.404, 39.915]
          },
          maxDistance: 1000
        });
      
      expect(response.status).to.equal(200);
      expect(response.body.data.matches).to.be.an('array');
    });
  });

  describe('服务管理测试', () => {
    it('应该获取我的服务列表', async () => {
      const response = await request
        .get('/api/services/my-services')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.be.greaterThan(0);
    });

    it('应该获取服务详情', async () => {
      const response = await request
        .get(`/api/services/${testService._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data).to.have.property('riskScore');
    });

    it('应该能够关闭服务', async () => {
      const response = await request
        .put(`/api/services/${testService._id}/deactivate`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.daoQuote).to.include('知足不辱');
    });
  });

  describe('道德风控测试', () => {
    it('差评率过高应该暂停服务（"利而不害"）', async () => {
      // 先重新激活服务
      await UserService.findByIdAndUpdate(testService._id, { isActive: true });
      
      // 模拟差评
      await UserService.findByIdAndUpdate(testService._id, {
        'ratings.negativeRate': 0.35,
        'ratings.totalCount': 10
      });

      const response = await request
        .post('/api/services/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'education',
          title: '教育培训',
          description: '一对一辅导',
          location: {
            coordinates: [116.404, 39.915]
          }
        });
      
      expect(response.status).to.equal(403);
      expect(response.body.daoQuote).to.include('利而不害');
    });

    it('应该支持服务评价', async () => {
      const response = await request
        .post(`/api/services/${testService._id}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          score: 5,
          comment: '服务很好',
          isPositive: true
        });
      
      expect(response.status).to.equal(200);
      expect(response.body.success).to.be.true;
      expect(response.body.daoQuote).to.include('天道无亲');
    });
  });

  describe('边界测试', () => {
    it('应该处理无效的服务ID', async () => {
      const response = await request
        .get('/api/services/invalid_id')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(500);
    });

    it('应该处理无效的认证token', async () => {
      const response = await request
        .get('/api/services/my-services')
        .set('Authorization', 'Bearer invalid_token');
      
      expect(response.status).to.equal(401);
    });

    it('应该处理缺少认证token', async () => {
      const response = await request
        .get('/api/services/my-services');
      
      expect(response.status).to.equal(401);
    });
  });

  describe('性能测试', () => {
    it('服务匹配应该在合理时间内完成', async () => {
      const startTime = Date.now();
      
      const response = await request
        .post('/api/services/match')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceType: 'housing',
          location: {
            coordinates: [116.404, 39.915]
          },
          maxDistance: 1000
        });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).to.equal(200);
      expect(duration).to.be.lessThan(2000); // 2秒内完成
    });
  });

  after(async () => {
    // 清理测试数据
    await User.deleteMany({ phone: /^13900000/ });
    await UserService.deleteMany({ userId: testUser._id });
  });
});

/**
 * 道德风控规则测试
 */
describe('道德风控规则测试', () => {
  let authToken;
  let testUser;

  before(async () => {
    const response = await request
      .post('/api/auth/register')
      .send({
        phone: '13900000002',
        password: 'test123',
        nickname: '风控测试用户'
      });
    
    authToken = response.body.data.token;
    testUser = response.body.data.user;
  });

  it('应该限制图片数量（最多3张）', async () => {
    const response = await request
      .post('/api/services/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        serviceType: 'housing',
        title: '测试服务',
        description: '测试描述',
        location: {
          coordinates: [116.404, 39.915]
        },
        images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'] // 4张图片
      });
    
    expect(response.status).to.equal(400);
  });

  it('应该限制标题长度（最多50字）', async () => {
    const longTitle = 'a'.repeat(51); // 51个字符
    
    const response = await request
      .post('/api/services/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        serviceType: 'housing',
        title: longTitle,
        description: '测试描述',
        location: {
          coordinates: [116.404, 39.915]
        }
      });
    
    expect(response.status).to.equal(400);
  });

  it('应该限制描述长度（最多200字）', async () => {
    const longDescription = 'a'.repeat(201); // 201个字符
    
    const response = await request
      .post('/api/services/publish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        serviceType: 'housing',
        title: '测试服务',
        description: longDescription,
        location: {
          coordinates: [116.404, 39.915]
        }
      });
    
    expect(response.status).to.equal(400);
  });

  after(async () => {
    await User.deleteMany({ phone: /^13900000/ });
  });
});

module.exports = {
  request,
  expect
};


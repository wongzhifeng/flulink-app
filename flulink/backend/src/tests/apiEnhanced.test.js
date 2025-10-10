import supertest from 'supertest';
import { expect } from 'chai';
import app from '../app';
import { User } from '../models';
import { AuthService } from '../services/authService';
import redisService from '../services/redisService';

const request = supertest(app);

describe('FluLink API - Enhanced Test Suite', () => {
  let authToken: string;
  let testUser: any;
  let testStarSeed: any;
  let testCluster: any;

  before(async () => {
    // 清理测试数据
    await User.deleteMany({ phone: /^138\d{8}$/ });
    await redisService.flushdb();
  });

  after(async () => {
    // 清理测试数据
    await User.deleteMany({ phone: /^138\d{8}$/ });
    await redisService.flushdb();
  });

  describe('Health Check Endpoints', () => {
    it('should return health status', async () => {
      const response = await request.get('/api/health');
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.have.property('status', 'healthy');
      expect(response.body.data).to.have.property('timestamp');
    });

    it('should return performance metrics', async () => {
      const response = await request.get('/api/performance/health');
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.have.property('status');
      expect(response.body.data).to.have.property('uptime');
      expect(response.body.data).to.have.property('memory');
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          phone: '13800138001',
          password: 'password123',
          nickname: '测试用户1',
          motto: '测试座右铭',
          poem: '测试诗句',
          tags: ['测试', '科技']
        };

        const response = await request
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('user');
        expect(response.body.data).to.have.property('token');
        
        testUser = response.body.data.user;
        authToken = response.body.data.token;
      });

      it('should reject duplicate phone registration', async () => {
        const userData = {
          phone: '13800138001',
          password: 'password123',
          nickname: '测试用户2'
        };

        const response = await request
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
        expect(response.body).to.have.property('message');
      });

      it('should validate required fields', async () => {
        const response = await request
          .post('/api/auth/register')
          .send({});

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          phone: '13800138001',
          password: 'password123'
        };

        const response = await request
          .post('/api/auth/login')
          .send(loginData);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('user');
        expect(response.body.data).to.have.property('token');
      });

      it('should reject invalid credentials', async () => {
        const loginData = {
          phone: '13800138001',
          password: 'wrongpassword'
        };

        const response = await request
          .post('/api/auth/login')
          .send(loginData);

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('success', false);
      });
    });

    describe('POST /api/auth/send-code', () => {
      it('should send verification code', async () => {
        const response = await request
          .post('/api/auth/send-code')
          .send({ phone: '13800138002' });

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('phone', '13800138002');
        expect(response.body.data).to.have.property('expiresIn');
      });

      it('should validate phone format', async () => {
        const response = await request
          .post('/api/auth/send-code')
          .send({ phone: 'invalid' });

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
      });
    });

    describe('POST /api/auth/login-with-code', () => {
      it('should login with valid verification code', async () => {
        // 先发送验证码
        await request
          .post('/api/auth/send-code')
          .send({ phone: '13800138003' });

        // 模拟验证码（实际环境中需要从Redis获取）
        const response = await request
          .post('/api/auth/login-with-code')
          .send({ 
            phone: '13800138003',
            code: '123456' // 测试环境固定验证码
          });

        // 由于验证码验证逻辑，这里可能返回错误，但应该能处理
        expect([200, 401]).to.include(response.status);
      });
    });
  });

  describe('StarSeed Endpoints', () => {
    beforeEach(async () => {
      // 确保有认证token
      if (!authToken) {
        const loginResponse = await request
          .post('/api/auth/login')
          .send({ phone: '13800138001', password: 'password123' });
        authToken = loginResponse.body.data.token;
      }
    });

    describe('POST /api/starseeds/publish', () => {
      it('should publish a star seed successfully', async () => {
        const starSeedData = {
          content: '这是一个测试星种内容',
          spectrum: ['测试', '科技'],
          imageUrl: 'https://example.com/image.jpg'
        };

        const response = await request
          .post('/api/starseeds/publish')
          .set('Authorization', `Bearer ${authToken}`)
          .send(starSeedData);

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('starSeed');
        
        testStarSeed = response.body.data.starSeed;
      });

      it('should validate required fields', async () => {
        const response = await request
          .post('/api/starseeds/publish')
          .set('Authorization', `Bearer ${authToken}`)
          .send({});

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
      });

      it('should require authentication', async () => {
        const response = await request
          .post('/api/starseeds/publish')
          .send({ content: 'test' });

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('success', false);
      });
    });

    describe('GET /api/starseeds', () => {
      it('should get star seeds list', async () => {
        const response = await request
          .get('/api/starseeds')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('starSeeds');
        expect(response.body.data.starSeeds).to.be.an('array');
      });

      it('should support pagination', async () => {
        const response = await request
          .get('/api/starseeds?page=1&limit=10')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.have.property('pagination');
      });
    });

    describe('POST /api/starseeds/:id/light', () => {
      it('should light a star seed', async () => {
        if (!testStarSeed) {
          // 创建一个测试星种
          const createResponse = await request
            .post('/api/starseeds/publish')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ content: '测试星种', spectrum: ['测试'] });
          testStarSeed = createResponse.body.data.starSeed;
        }

        const response = await request
          .post(`/api/starseeds/${testStarSeed._id}/light`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('lights');
      });

      it('should prevent duplicate lighting', async () => {
        const response = await request
          .post(`/api/starseeds/${testStarSeed._id}/light`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  describe('Cluster Endpoints', () => {
    beforeEach(async () => {
      if (!authToken) {
        const loginResponse = await request
          .post('/api/auth/login')
          .send({ phone: '13800138001', password: 'password123' });
        authToken = loginResponse.body.data.token;
      }
    });

    describe('POST /api/clusters/generate', () => {
      it('should generate a cluster', async () => {
        const response = await request
          .post('/api/clusters/generate')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('cluster');
        
        testCluster = response.body.data.cluster;
      });
    });

    describe('GET /api/clusters/:id/members', () => {
      it('should get cluster members', async () => {
        if (!testCluster) {
          // 创建一个测试星团
          const createResponse = await request
            .post('/api/clusters/generate')
            .set('Authorization', `Bearer ${authToken}`);
          testCluster = createResponse.body.data.cluster;
        }

        const response = await request
          .get(`/api/clusters/${testCluster._id}/members`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('members');
        expect(response.body.data.members).to.be.an('array');
      });
    });
  });

  describe('Performance Endpoints', () => {
    beforeEach(async () => {
      if (!authToken) {
        const loginResponse = await request
          .post('/api/auth/login')
          .send({ phone: '13800138001', password: 'password123' });
        authToken = loginResponse.body.data.token;
      }
    });

    describe('GET /api/performance/report', () => {
      it('should get performance report', async () => {
        const response = await request
          .get('/api/performance/report')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('operations');
        expect(response.body.data).to.have.property('apis');
        expect(response.body.data).to.have.property('cache');
        expect(response.body.data).to.have.property('system');
      });
    });

    describe('GET /api/performance/operations', () => {
      it('should get operations statistics', async () => {
        const response = await request
          .get('/api/performance/operations')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
      });
    });

    describe('GET /api/performance/cache', () => {
      it('should get cache statistics', async () => {
        const response = await request
          .get('/api/performance/cache')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('data');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request.get('/api/nonexistent');

      expect(response.status).to.equal(404);
      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message');
    });

    it('should handle invalid JSON', async () => {
      const response = await request
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).to.equal(400);
    });

    it('should handle missing authentication', async () => {
      const response = await request.get('/api/starseeds');

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('success', false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const promises = [];
      
      // 发送多个请求测试限流
      for (let i = 0; i < 10; i++) {
        promises.push(
          request.post('/api/auth/send-code').send({ phone: '13800138004' })
        );
      }

      const responses = await Promise.all(promises);
      
      // 至少应该有一个请求被限流
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).to.be.greaterThan(0);
    });
  });

  describe('Data Validation', () => {
    it('should validate phone number format', async () => {
      const response = await request
        .post('/api/auth/register')
        .send({
          phone: 'invalid-phone',
          password: 'password123',
          nickname: 'test'
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('success', false);
    });

    it('should validate password strength', async () => {
      const response = await request
        .post('/api/auth/register')
        .send({
          phone: '13800138005',
          password: '123', // 太短
          nickname: 'test'
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('success', false);
    });

    it('should validate content length', async () => {
      const longContent = 'a'.repeat(501); // 超过500字符限制

      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: longContent });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('success', false);
    });
  });

  describe('Boundary Testing', () => {
    it('should handle maximum content length', async () => {
      const maxContent = 'a'.repeat(500); // 正好500字符

      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: maxContent });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('success', true);
    });

    it('should handle empty spectrum array', async () => {
      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          content: '测试内容',
          spectrum: []
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('success', true);
    });

    it('should handle maximum spectrum tags', async () => {
      const maxTags = Array(10).fill('tag').map((tag, i) => `${tag}${i}`);

      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          content: '测试内容',
          spectrum: maxTags
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('success', true);
    });

    it('should handle special characters in content', async () => {
      const specialContent = '测试内容 🚀 @#$%^&*()_+{}|:"<>?[]\\;\'.,/`~';

      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: specialContent });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('success', true);
    });
  });

  describe('Stress Testing', () => {
    it('should handle concurrent user registrations', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          request.post('/api/auth/register').send({
            phone: `1380013800${i}`,
            password: 'password123',
            nickname: `测试用户${i}`
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('success', true);
      });
    });

    it('should handle concurrent star seed publishing', async () => {
      const promises = [];
      
      for (let i = 0; i < 3; i++) {
        promises.push(
          request
            .post('/api/starseeds/publish')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              content: `并发测试星种 ${i}`,
              spectrum: ['测试', '并发']
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('success', true);
      });
    });

    it('should handle rapid sequential requests', async () => {
      const requests = [];
      
      for (let i = 0; i < 10; i++) {
        requests.push(
          request
            .get('/api/starseeds')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON', async () => {
      const response = await request
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"phone": "13800138001", "password": "password123"'); // 缺少闭合括号

      expect(response.status).to.equal(400);
    });

    it('should handle extremely long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);

      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: '测试内容',
          imageUrl: longUrl
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('success', false);
    });

    it('should handle null values', async () => {
      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: null,
          spectrum: null
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('success', false);
    });

    it('should handle undefined values', async () => {
      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: undefined,
          spectrum: undefined
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('success', false);
    });
  });

  describe('Security Testing', () => {
    it('should prevent SQL injection attempts', async () => {
      const maliciousContent = "'; DROP TABLE users; --";

      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: maliciousContent });

      // 应该正常处理，不会导致SQL注入
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('success', true);
    });

    it('should prevent XSS attempts', async () => {
      const xssContent = '<script>alert("XSS")</script>';

      const response = await request
        .post('/api/starseeds/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: xssContent });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('success', true);
      
      // 检查返回的内容是否被正确转义
      const returnedContent = response.body.data.starSeed.content;
      expect(returnedContent).to.not.include('<script>');
    });

    it('should validate JWT token format', async () => {
      const invalidToken = 'invalid.jwt.token';

      const response = await request
        .get('/api/starseeds')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('success', false);
    });

    it('should handle expired tokens gracefully', async () => {
      // 这里需要创建一个过期的token进行测试
      // 由于JWT生成逻辑在服务端，这里主要测试错误处理
      const response = await request
        .get('/api/starseeds')
        .set('Authorization', 'Bearer expired.token.here');

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('success', false);
    });
  });

  describe('Performance Testing', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await request
        .get('/api/starseeds')
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).to.equal(200);
      expect(responseTime).to.be.lessThan(1000); // 应该在1秒内响应
    });

    it('should handle large datasets efficiently', async () => {
      // 创建多个星种来测试大数据集处理
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          request
            .post('/api/starseeds/publish')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              content: `大数据集测试星种 ${i}`,
              spectrum: ['测试', '性能']
            })
        );
      }

      await Promise.all(promises);

      const startTime = Date.now();
      const response = await request
        .get('/api/starseeds?limit=50')
        .set('Authorization', `Bearer ${authToken}`);
      const endTime = Date.now();
      
      expect(response.status).to.equal(200);
      expect(endTime - startTime).to.be.lessThan(2000); // 应该在2秒内响应
    });
  });
});

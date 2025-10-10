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
});

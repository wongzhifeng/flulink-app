import express from 'express';
import { authMiddleware } from '../middleware/auth';
import performanceMonitor from '../services/performanceMonitor';
import cacheOptimizer from '../services/cacheOptimizer';
import ErrorHandler from '../middleware/errorHandler';

const router = express.Router();

// 获取性能报告
router.get('/report', authMiddleware, async (req, res) => {
  try {
    const report = await performanceMonitor.generateReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get performance report error:', error);
    res.status(500).json({
      success: false,
      message: '获取性能报告失败'
    });
  }
});

// 获取操作性能统计
router.get('/operations', authMiddleware, async (req, res) => {
  try {
    const { operation, startTime, endTime } = req.query;
    
    let timeRange;
    if (startTime && endTime) {
      timeRange = {
        start: new Date(startTime as string),
        end: new Date(endTime as string)
      };
    }

    let stats;
    if (operation) {
      stats = performanceMonitor.getOperationStats(operation as string, timeRange);
    } else {
      stats = performanceMonitor.getAllOperationStats();
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get operations stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取操作统计失败'
    });
  }
});

// 获取API性能统计
router.get('/apis', authMiddleware, async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    let timeRange;
    if (startTime && endTime) {
      timeRange = {
        start: new Date(startTime as string),
        end: new Date(endTime as string)
      };
    }

    const stats = performanceMonitor.getApiStats(timeRange);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get API stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取API统计失败'
    });
  }
});

// 获取缓存统计
router.get('/cache', authMiddleware, async (req, res) => {
  try {
    const stats = cacheOptimizer.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get cache stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取缓存统计失败'
    });
  }
});

// 获取系统统计
router.get('/system', authMiddleware, async (req, res) => {
  try {
    const stats = performanceMonitor.getSystemStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取系统统计失败'
    });
  }
});

// 清理性能数据
router.post('/cleanup', authMiddleware, async (req, res) => {
  try {
    performanceMonitor.cleanup();

    res.json({
      success: true,
      message: '性能数据清理完成'
    });
  } catch (error) {
    console.error('Cleanup performance data error:', error);
    res.status(500).json({
      success: false,
      message: '清理性能数据失败'
    });
  }
});

// 清空缓存
router.post('/cache/clear', authMiddleware, async (req, res) => {
  try {
    const { category } = req.body;
    
    await cacheOptimizer.clear(category);

    res.json({
      success: true,
      message: `缓存清理完成${category ? ` (${category})` : ''}`
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: '清理缓存失败'
    });
  }
});

// 预热缓存
router.post('/cache/warmup', authMiddleware, async (req, res) => {
  try {
    const { category, data } = req.body;
    
    if (!data || !(data instanceof Object)) {
      return res.status(400).json({
        success: false,
        message: '无效的预热数据'
      });
    }

    const dataMap = new Map(Object.entries(data));
    await cacheOptimizer.warmup(dataMap, category);

    res.json({
      success: true,
      message: `缓存预热完成 (${dataMap.size} 条记录)`
    });
  } catch (error) {
    console.error('Warmup cache error:', error);
    res.status(500).json({
      success: false,
      message: '缓存预热失败'
    });
  }
});

// 获取缓存配置
router.get('/cache/config', authMiddleware, async (req, res) => {
  try {
    const stats = cacheOptimizer.getStats();
    
    res.json({
      success: true,
      data: {
        configs: stats.configs,
        memoryCache: {
          size: stats.memoryCache.size
        }
      }
    });
  } catch (error) {
    console.error('Get cache config error:', error);
    res.status(500).json({
      success: false,
      message: '获取缓存配置失败'
    });
  }
});

// 健康检查
router.get('/health', async (req, res) => {
  try {
    const systemStats = performanceMonitor.getSystemStats();
    const cacheStats = cacheOptimizer.getStats();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: systemStats?.memory || null,
      cache: {
        memorySize: cacheStats.memoryCache.size,
        hitRate: Object.values(cacheStats.performance).reduce((sum: number, stat: any) => {
          return sum + (stat.hitRate || 0);
        }, 0) / Object.keys(cacheStats.performance).length || 0
      },
      services: {
        performanceMonitor: performanceMonitor.getConnectionStatus ? performanceMonitor.getConnectionStatus() : true,
        cacheOptimizer: true
      }
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: '健康检查失败',
      error: error.message
    });
  }
});

// 获取实时指标
router.get('/metrics', authMiddleware, async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      operations: performanceMonitor.getAllOperationStats(),
      apis: performanceMonitor.getApiStats(),
      cache: cacheOptimizer.getStats(),
      system: performanceMonitor.getSystemStats()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: '获取实时指标失败'
    });
  }
});

export default router;

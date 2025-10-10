import fs from 'fs';
import path from 'path';

interface SecurityHardening {
  id: string;
  category: 'authentication' | 'authorization' | 'data-protection' | 'network' | 'logging' | 'headers';
  title: string;
  description: string;
  implementation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: string;
}

interface HardeningReport {
  timestamp: string;
  totalHardening: number;
  criticalHardening: number;
  highHardening: number;
  mediumHardening: number;
  lowHardening: number;
  hardening: SecurityHardening[];
  summary: {
    securityScore: number;
    mostImportantCategory: string;
    implementationEffort: string;
  };
  recommendations: string[];
}

class SecurityHardeningTool {
  private hardening: SecurityHardening[] = [];
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.initializeHardening();
  }

  private initializeHardening() {
    this.hardening = [
      // 认证加固
      {
        id: 'AUTH_001',
        category: 'authentication',
        title: '实施强密码策略',
        description: '实施强密码策略，包括最小长度、复杂度要求',
        implementation: `
// 密码验证中间件
const passwordValidator = (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: '密码不能为空' });
  }
  
  // 密码强度检查
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < minLength) {
    return res.status(400).json({ error: '密码长度至少8位' });
  }
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return res.status(400).json({ 
      error: '密码必须包含大小写字母、数字和特殊字符' 
    });
  }
  
  next();
};

app.use('/api/auth/register', passwordValidator);
        `,
        priority: 'high',
        effort: 'low',
        impact: '防止弱密码攻击，提高账户安全性'
      },
      {
        id: 'AUTH_002',
        category: 'authentication',
        title: '实施多因素认证',
        description: '为敏感操作实施多因素认证',
        implementation: `
// 多因素认证服务
const mfaService = {
  generateSecret: () => {
    return speakeasy.generateSecret({
      name: 'FluLink',
      issuer: 'FluLink App',
      length: 32
    });
  },
  
  verifyToken: (secret, token) => {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });
  },
  
  generateQRCode: (secret) => {
    return speakeasy.otpauthURL({
      secret: secret,
      label: 'FluLink',
      issuer: 'FluLink App'
    });
  }
};

// MFA验证中间件
const requireMFA = async (req, res, next) => {
  const { token } = req.body;
  const user = req.user;
  
  if (!user.mfaSecret) {
    return res.status(400).json({ error: '请先设置多因素认证' });
  }
  
  const isValid = mfaService.verifyToken(user.mfaSecret, token);
  if (!isValid) {
    return res.status(401).json({ error: '验证码错误' });
  }
  
  next();
};
        `,
        priority: 'critical',
        effort: 'medium',
        impact: '大幅提高账户安全性，防止账户被盗用'
      },
      {
        id: 'AUTH_003',
        category: 'authentication',
        title: '实施会话管理',
        description: '实施安全的会话管理和超时机制',
        implementation: `
// 会话配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 60 * 1000, // 30分钟
    sameSite: 'strict'
  },
  store: new RedisStore({
    client: redisClient,
    prefix: 'session:'
  })
}));

// 会话超时中间件
const sessionTimeout = (req, res, next) => {
  if (req.session && req.session.lastActivity) {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30分钟
    
    if (now - req.session.lastActivity > timeout) {
      req.session.destroy();
      return res.status(401).json({ error: '会话已过期' });
    }
  }
  
  req.session.lastActivity = Date.now();
  next();
};

app.use(sessionTimeout);
        `,
        priority: 'high',
        effort: 'low',
        impact: '防止会话劫持，提高会话安全性'
      },

      // 授权加固
      {
        id: 'AUTHZ_001',
        category: 'authorization',
        title: '实施基于角色的访问控制',
        description: '实施RBAC权限管理系统',
        implementation: `
// 角色和权限定义
const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest'
};

const PERMISSIONS = {
  CREATE_STARSEED: 'create:starseed',
  DELETE_STARSEED: 'delete:starseed',
  MANAGE_USERS: 'manage:users',
  VIEW_ANALYTICS: 'view:analytics'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MODERATOR]: [PERMISSIONS.CREATE_STARSEED, PERMISSIONS.VIEW_ANALYTICS],
  [ROLES.USER]: [PERMISSIONS.CREATE_STARSEED],
  [ROLES.GUEST]: []
};

// 权限检查中间件
const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user || !user.role) {
      return res.status(401).json({ error: '未授权' });
    }
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    next();
  };
};

// 使用示例
app.post('/api/starseeds', requirePermission(PERMISSIONS.CREATE_STARSEED), createStarSeed);
app.delete('/api/starseeds/:id', requirePermission(PERMISSIONS.DELETE_STARSEED), deleteStarSeed);
        `,
        priority: 'high',
        effort: 'medium',
        impact: '实施细粒度权限控制，防止越权访问'
      },

      // 数据保护
      {
        id: 'DATA_001',
        category: 'data-protection',
        title: '实施数据加密',
        description: '对敏感数据进行加密存储',
        implementation: `
// 数据加密服务
const cryptoService = {
  encrypt: (text) => {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('FluLink', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  },
  
  decrypt: (encryptedData) => {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('FluLink', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
};

// 敏感数据加密中间件
const encryptSensitiveData = (req, res, next) => {
  if (req.body.password) {
    req.body.password = cryptoService.encrypt(req.body.password);
  }
  if (req.body.email) {
    req.body.email = cryptoService.encrypt(req.body.email);
  }
  next();
};
        `,
        priority: 'critical',
        effort: 'high',
        impact: '保护敏感数据，防止数据泄露'
      },
      {
        id: 'DATA_002',
        category: 'data-protection',
        title: '实施数据脱敏',
        description: '对敏感数据进行脱敏处理',
        implementation: `
// 数据脱敏服务
const dataMaskingService = {
  maskEmail: (email) => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
    return \`\${maskedLocal}@\${domain}\`;
  },
  
  maskPhone: (phone) => {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },
  
  maskIdCard: (idCard) => {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  },
  
  maskBankCard: (bankCard) => {
    return bankCard.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2');
  }
};

// 数据脱敏中间件
const maskSensitiveData = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (data && typeof data === 'object') {
      data = maskObject(data);
    }
    return originalJson.call(this, data);
  };
  
  next();
};

const maskObject = (obj) => {
  const masked = { ...obj };
  
  if (masked.email) {
    masked.email = dataMaskingService.maskEmail(masked.email);
  }
  if (masked.phone) {
    masked.phone = dataMaskingService.maskPhone(masked.phone);
  }
  
  return masked;
};
        `,
        priority: 'medium',
        effort: 'low',
        impact: '保护用户隐私，防止敏感信息泄露'
      },

      // 网络安全
      {
        id: 'NETWORK_001',
        category: 'network',
        title: '实施安全HTTP头',
        description: '设置安全HTTP头防止常见攻击',
        implementation: `
// 安全头中间件
const securityHeaders = (req, res, next) => {
  // 防止XSS攻击
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 内容安全策略
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none';"
  );
  
  // 严格传输安全
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // 引用者策略
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 权限策略
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  next();
};

app.use(securityHeaders);
        `,
        priority: 'high',
        effort: 'low',
        impact: '防止XSS、点击劫持等攻击'
      },
      {
        id: 'NETWORK_002',
        category: 'network',
        title: '实施CORS安全配置',
        description: '配置安全的CORS策略',
        implementation: `
// CORS安全配置
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://flulink-app.zeabur.app',
      'https://flulink-backend-v2.zeabur.app'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的CORS源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24小时
};

app.use(cors(corsOptions));
        `,
        priority: 'high',
        effort: 'low',
        impact: '防止跨域攻击，控制资源访问'
      },

      // 日志安全
      {
        id: 'LOGGING_001',
        category: 'logging',
        title: '实施安全日志记录',
        description: '记录安全相关事件和异常',
        implementation: `
// 安全日志服务
const securityLogger = {
  logLoginAttempt: (req, success, reason) => {
    const log = {
      timestamp: new Date().toISOString(),
      event: 'login_attempt',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      success,
      reason,
      userId: req.user?.id
    };
    
    console.log('SECURITY_LOG:', JSON.stringify(log));
  },
  
  logSuspiciousActivity: (req, activity, details) => {
    const log = {
      timestamp: new Date().toISOString(),
      event: 'suspicious_activity',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      activity,
      details,
      userId: req.user?.id
    };
    
    console.log('SECURITY_LOG:', JSON.stringify(log));
  },
  
  logDataAccess: (req, resource, action) => {
    const log = {
      timestamp: new Date().toISOString(),
      event: 'data_access',
      ip: req.ip,
      userId: req.user?.id,
      resource,
      action
    };
    
    console.log('SECURITY_LOG:', JSON.stringify(log));
  }
};

// 安全事件监控中间件
const securityMonitoring = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // 记录敏感操作
    if (req.path.includes('/admin') || req.path.includes('/delete')) {
      securityLogger.logDataAccess(req, req.path, req.method);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

app.use(securityMonitoring);
        `,
        priority: 'medium',
        effort: 'medium',
        impact: '提高安全事件的可追溯性'
      }
    ];
  }

  analyzeProject(): HardeningReport {
    const relevantHardening = this.filterRelevantHardening();
    const summary = this.calculateSummary(relevantHardening);
    const recommendations = this.generateRecommendations(relevantHardening);

    return {
      timestamp: new Date().toISOString(),
      totalHardening: relevantHardening.length,
      criticalHardening: relevantHardening.filter(h => h.priority === 'critical').length,
      highHardening: relevantHardening.filter(h => h.priority === 'high').length,
      mediumHardening: relevantHardening.filter(h => h.priority === 'medium').length,
      lowHardening: relevantHardening.filter(h => h.priority === 'low').length,
      hardening: relevantHardening,
      summary,
      recommendations
    };
  }

  private filterRelevantHardening(): SecurityHardening[] {
    // 根据项目特点过滤相关加固措施
    return this.hardening.filter(hardening => {
      // 所有加固措施都相关
      return true;
    });
  }

  private calculateSummary(hardening: SecurityHardening[]): any {
    const totalHardening = hardening.length;
    
    if (totalHardening === 0) {
      return {
        securityScore: 0,
        mostImportantCategory: 'none',
        implementationEffort: 'low'
      };
    }
    
    // 计算安全评分
    const securityScore = hardening.reduce((score, h) => {
      const weights = { critical: 10, high: 7, medium: 4, low: 1 };
      return score + weights[h.priority];
    }, 0);
    
    // 找出最重要的类别
    const categoryCounts = hardening.reduce((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostImportantCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
    
    // 计算实施工作量
    const effortCounts = hardening.reduce((acc, h) => {
      acc[h.effort] = (acc[h.effort] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const implementationEffort = effortCounts.high > effortCounts.medium + effortCounts.low ? 'high' :
                                effortCounts.medium > effortCounts.low ? 'medium' : 'low';
    
    return {
      securityScore: Math.min(100, securityScore),
      mostImportantCategory,
      implementationEffort
    };
  }

  private generateRecommendations(hardening: SecurityHardening[]): string[] {
    const recommendations: string[] = [];
    
    const criticalCount = hardening.filter(h => h.priority === 'critical').length;
    const highCount = hardening.filter(h => h.priority === 'high').length;
    
    if (criticalCount > 0) {
      recommendations.push(`立即实施 ${criticalCount} 个关键安全加固措施`);
    }
    
    if (highCount > 0) {
      recommendations.push(`优先实施 ${highCount} 个高优先级安全加固措施`);
    }
    
    const authCount = hardening.filter(h => h.category === 'authentication').length;
    if (authCount > 0) {
      recommendations.push('加强认证和授权机制');
    }
    
    const dataCount = hardening.filter(h => h.category === 'data-protection').length;
    if (dataCount > 0) {
      recommendations.push('实施数据保护和加密措施');
    }
    
    const networkCount = hardening.filter(h => h.category === 'network').length;
    if (networkCount > 0) {
      recommendations.push('加强网络安全配置');
    }
    
    return recommendations;
  }

  generateReport(): string {
    const report = this.analyzeProject();
    
    let output = '\n=== 安全加固分析报告 ===\n\n';
    output += `分析时间: ${report.timestamp}\n`;
    output += `总加固措施: ${report.totalHardening}\n`;
    output += `关键加固: ${report.criticalHardening}\n`;
    output += `高优先级加固: ${report.highHardening}\n\n`;
    
    output += '安全评分:\n';
    output += `  安全评分: ${report.summary.securityScore}/100\n`;
    output += `  最重要类别: ${report.summary.mostImportantCategory}\n`;
    output += `  实施工作量: ${report.summary.implementationEffort}\n\n`;
    
    output += '加固建议:\n';
    report.recommendations.forEach((rec, index) => {
      output += `  ${index + 1}. ${rec}\n`;
    });
    
    return output;
  }
}

export { SecurityHardeningTool };

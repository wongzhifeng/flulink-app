const mongoose = require('mongoose');

// 用户模型
const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  nickname: {
    type: String,
    default: '星际旅人',
    maxlength: 20
  },
  motto: {
    type: String,
    default: '在星海中寻找共鸣',
    maxlength: 100
  },
  poem: {
    type: String,
    default: '宇宙即我心，我心即宇宙',
    maxlength: 200
  },
  avatar: {
    type: String,
    default: ''
  },
  starColor: {
    type: String,
    default: '#ffd700'
  },
  
  // 社交属性
  tags: [{
    type: String,
    maxlength: 20
  }],
  contentPreferences: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  // 互动历史
  interactions: [{
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    targetSeedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StarSeed'
    },
    actionType: {
      type: String,
      enum: ['like', 'comment', 'forward', 'view']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 星团状态
  currentCluster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    index: true
  },
  clusterHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster'
  }],
  
  // 用户状态
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  daysActive: {
    type: Number,
    default: 0
  },
  
  // 服务槽位管理（"知止不殆" - 最多3个服务）
  serviceSlots: {
    maxServices: {
      type: Number,
      default: 1,
      min: 1,
      max: 3
    },
    currentServices: {
      type: Number,
      default: 0
    }
  },
  
  // 地理位置信息（用于服务匹配）
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // 轨迹围栏数据
  locationHistory: [{
    coordinates: [Number],
    timestamp: Date,
    accuracy: Number
  }],
  
  // 信用评分系统（集成共鸣算法）
  creditScore: {
    type: Number,
    default: 80,
    min: 60,
    max: 100
  },
  
  // 新用户标识（影响服务发布限制）
  isNewUser: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 星种模型
const starSeedSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 内容
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  imageUrl: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    default: ''
  },
  
  // 星种属性
  luminosity: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
    index: true
  },
  initialLuminosity: {
    type: Number,
    default: 10
  },
  spectrum: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  // 传播状态
  clusterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster',
    index: true
  },
  propagationPath: [{
    clusterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cluster'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userCount: {
      type: Number,
      default: 0
    }
  }],
  
  // 互动数据
  interactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actionType: {
      type: String,
      enum: ['like', 'comment', 'forward', 'view']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 演化历史
  evolutionHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    luminosity: Number,
    spectrum: Map
  }],
  
  // 跃迁状态
  jumpEligible: {
    type: Boolean,
    default: false,
    index: true
  },
  jumpTargets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cluster'
  }]
}, {
  timestamps: true
});

// 星团模型
const clusterSchema = new mongoose.Schema({
  // 星团成员
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        return v.length === 49;
      },
      message: '星团必须有49个成员'
    }
  }],
  coreUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // 星团属性
  resonanceScore: {
    type: Number,
    required: true
  },
  averageResonance: {
    type: Number,
    default: 0
  },
  
  // 活跃度分布
  activityDistribution: {
    high: {
      type: Number,
      default: 0
    },
    medium: {
      type: Number,
      default: 0
    },
    low: {
      type: Number,
      default: 0
    }
  },
  
  // 标签多样性
  tagDiversity: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  // 生命周期
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // 星团统计
  totalSeeds: {
    type: Number,
    default: 0
  },
  totalInteractions: {
    type: Number,
    default: 0
  },
  averageLuminosity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 互动模型
const interactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['starseed', 'user'],
    required: true,
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: ['like', 'comment', 'forward', 'view'],
    required: true
  },
  
  // 互动内容
  content: {
    type: String,
    maxlength: 200
  },
  
  // 共鸣影响
  resonanceImpact: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 共鸣记录模型
const resonanceSchema = new mongoose.Schema({
  userA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 共鸣计算
  tagSimilarity: {
    type: Number,
    required: true
  },
  interactionScore: {
    type: Number,
    required: true
  },
  contentPreferenceMatch: {
    type: Number,
    required: true
  },
  randomFactor: {
    type: Number,
    required: true
  },
  
  // 最终共鸣值
  totalResonance: {
    type: Number,
    required: true,
    index: true
  },
  calculatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // 历史记录
  history: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    resonance: Number,
    factors: {
      tagSimilarity: Number,
      interactionScore: Number,
      contentPreferenceMatch: Number,
      randomFactor: Number
    }
  }]
});

// 用户服务模型（长期服务标签 - "毒株"）
const userServiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  serviceType: {
    type: String,
    enum: ['housing', 'repair', 'education', 'health', 'transport', 'other'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return this.images.length <= 3;
      },
      message: '知足不辱：图片最多3张'
    }
  }],
  
  // 地理位置（用于围栏匹配）
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  
  // 服务范围（公里）
  serviceRadius: {
    type: Number,
    default: 1.0,
    min: 0.1,
    max: 5.0
  },
  
  // 信用分数（继承自用户）
  creditScore: {
    type: Number,
    default: 80,
    min: 60,
    max: 100
  },
  
  // 道德状态
  moralStatus: {
    type: String,
    enum: ['active', 'warning', 'suspended'],
    default: 'active'
  },
  
  // 评价统计
  ratings: {
    totalCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    negativeRate: { type: Number, default: 0 }
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // 德道经引用
  daoQuote: {
    type: String,
    default: '天道无亲，常与善人'
  },
  
  // 元数据（用于风控）
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String
  }
}, {
  timestamps: true
});

// 地理空间索引
userServiceSchema.index({ location: '2dsphere' });

// 创建模型
const User = mongoose.model('User', userSchema);
const StarSeed = mongoose.model('StarSeed', starSeedSchema);
const Cluster = mongoose.model('Cluster', clusterSchema);
const Interaction = mongoose.model('Interaction', interactionSchema);
const Resonance = mongoose.model('Resonance', resonanceSchema);
const UserService = mongoose.model('UserService', userServiceSchema);

module.exports = {
  User,
  StarSeed,
  Cluster,
  Interaction,
  Resonance,
  UserService
};


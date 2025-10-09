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

// 创建模型
const User = mongoose.model('User', userSchema);
const StarSeed = mongoose.model('StarSeed', starSeedSchema);
const Cluster = mongoose.model('Cluster', clusterSchema);
const Interaction = mongoose.model('Interaction', interactionSchema);
const Resonance = mongoose.model('Resonance', resonanceSchema);

module.exports = {
  User,
  StarSeed,
  Cluster,
  Interaction,
  Resonance
};


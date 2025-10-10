const mongoose = require('mongoose');
const { User } = require('../models');

/**
 * 数据库迁移脚本
 * 为现有用户添加服务相关字段
 * 遵循《德道经》"治大国若烹小鲜"原则 - 小心谨慎地进行数据迁移
 */
async function migrate() {
  console.log('📋 开始数据库迁移：添加用户服务模型字段');
  console.log('⏰ 迁移时间:', new Date().toISOString());

  try {
    // 1. 检查数据库连接
    if (mongoose.connection.readyState !== 1) {
      throw new Error('数据库未连接');
    }

    // 2. 统计需要迁移的用户数量
    const totalUsers = await User.countDocuments({});
    const usersNeedingMigration = await User.countDocuments({
      serviceSlots: { $exists: false }
    });

    console.log(`📊 数据库统计:`);
    console.log(`   总用户数: ${totalUsers}`);
    console.log(`   需要迁移的用户数: ${usersNeedingMigration}`);

    if (usersNeedingMigration === 0) {
      console.log('✅ 所有用户已完成迁移，无需操作');
      return { success: true, migrated: 0 };
    }

    // 3. 执行迁移
    console.log('\n🔄 开始迁移...');
    
    const result = await User.updateMany(
      { serviceSlots: { $exists: false } },
      {
        $set: {
          'serviceSlots.maxServices': 1,
          'serviceSlots.currentServices': 0,
          creditScore: 80,
          isNewUser: true,
          'location.type': 'Point',
          'location.coordinates': [0, 0], // 默认坐标，需要用户更新
          'location.lastUpdated': new Date(),
          locationHistory: []
        }
      }
    );

    console.log(`\n✅ 迁移完成！`);
    console.log(`   更新的用户数: ${result.modifiedCount}`);
    console.log(`   匹配的用户数: ${result.matchedCount}`);

    // 4. 验证迁移结果
    const verifyCount = await User.countDocuments({
      serviceSlots: { $exists: true }
    });
    
    console.log(`\n🔍 迁移验证:`);
    console.log(`   已迁移的用户数: ${verifyCount}`);
    console.log(`   迁移成功率: ${((verifyCount / totalUsers) * 100).toFixed(2)}%`);

    console.log('\n🎯 数据库迁移完成！');
    console.log('💡 提示: 用户需要更新位置坐标才能使用服务匹配功能');
    
    return {
      success: true,
      migrated: result.modifiedCount,
      total: totalUsers,
      verified: verifyCount
    };
  } catch (error) {
    console.error('\n❌ 迁移失败:', error);
    throw error;
  }
}

/**
 * 回滚迁移（如果需要）
 */
async function rollback() {
  console.log('🔄 开始回滚迁移...');

  try {
    const result = await User.updateMany(
      { serviceSlots: { $exists: true } },
      {
        $unset: {
          serviceSlots: '',
          location: '',
          locationHistory: '',
          creditScore: '',
          isNewUser: ''
        }
      }
    );

    console.log(`✅ 回滚完成，已回滚 ${result.modifiedCount} 个用户`);
    return { success: true, rolledBack: result.modifiedCount };
  } catch (error) {
    console.error('❌ 回滚失败:', error);
    throw error;
  }
}

// 命令行执行
if (require.main === module) {
  const action = process.argv[2] || 'migrate';
  
  mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/flulink')
    .then(() => {
      console.log('📡 数据库连接成功');
      
      if (action === 'rollback') {
        return rollback();
      } else {
        return migrate();
      }
    })
    .then((result) => {
      console.log('\n✨ 操作完成！');
      console.log('结果:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 操作失败:', error);
      process.exit(1);
    });
}

module.exports = { migrate, rollback };


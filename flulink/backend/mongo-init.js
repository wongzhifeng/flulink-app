// MongoDB初始化脚本
db = db.getSiblingDB('flulink');

// 创建用户
db.createUser({
  user: 'flulink_user',
  pwd: 'flulink_password',
  roles: [
    {
      role: 'readWrite',
      db: 'flulink'
    }
  ]
});

// 创建集合和索引
db.createCollection('users');
db.createCollection('interactions');
db.createCollection('resonances');
db.createCollection('clusters');
db.createCollection('starseeds');

// 创建索引
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.interactions.createIndex({ "userId": 1 });
db.interactions.createIndex({ "targetId": 1 });
db.interactions.createIndex({ "type": 1 });
db.interactions.createIndex({ "createdAt": 1 });

db.resonances.createIndex({ "userId": 1 });
db.resonances.createIndex({ "targetId": 1 });
db.resonances.createIndex({ "strength": 1 });
db.resonances.createIndex({ "createdAt": 1 });

db.clusters.createIndex({ "name": 1 });
db.clusters.createIndex({ "tags": 1 });
db.clusters.createIndex({ "createdAt": 1 });

db.starseeds.createIndex({ "userId": 1 });
db.starseeds.createIndex({ "clusterId": 1 });
db.starseeds.createIndex({ "createdAt": 1 });

print('FluLink数据库初始化完成！');

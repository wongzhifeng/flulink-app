const path = require('path');

// 简单访问控制：限制静态uploads访问，仅允许images子目录读取
function uploadsAccessControl(req, res, next) {
  try {
    const requestedPath = req.path || '';
    // 仅允许访问 /images/* 或根索引
    if (requestedPath === '/' || requestedPath.startsWith('/images/')) {
      return next();
    }
    return res.status(403).json({ success: false, message: '禁止访问该资源' });
  } catch (e) {
    return res.status(500).json({ success: false, message: '访问控制错误' });
  }
}

module.exports = { uploadsAccessControl };







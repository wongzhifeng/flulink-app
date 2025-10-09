const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const storageService = require('../services/storageService');

const router = express.Router();

// Multer存储配置（先保存到临时目录，再手动移动）
const upload = multer({
  dest: path.join(process.cwd(), 'uploads', 'tmp'),
  limits: {
    fileSize: (parseInt(process.env.UPLOAD_MAX_SIZE_MB) || 10) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('不支持的文件类型'));
  }
});

// 图片上传
router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '未选择文件' });
    }

    // 生成文件名并移动到images目录
    const filename = storageService.generateFilename(req.file.originalname);
    const targetPath = storageService.getImagePath(filename);

    fs.renameSync(req.file.path, targetPath);

    return res.status(201).json({
      success: true,
      message: '图片上传成功',
      data: {
        filename,
        url: `/uploads/images/${filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    // 清理临时文件
    try { if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); } catch {}
    return res.status(500).json({ success: false, message: '图片上传失败', error: error.message });
  }
});

// 删除图片（作者/管理员可调用，简化：仅凭提供的文件名）
router.delete('/image/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = storageService.getImagePath(filename);
    const deleted = storageService.delete(filePath);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }
    return res.json({ success: true, message: '文件已删除' });
  } catch (error) {
    return res.status(500).json({ success: false, message: '删除失败', error: error.message });
  }
});

module.exports = router;





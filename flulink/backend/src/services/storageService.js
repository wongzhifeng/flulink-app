const fs = require('fs');
const path = require('path');

class StorageService {
  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'uploads');
    this.imageDir = path.join(this.baseDir, 'images');
    this.fileDir = path.join(this.baseDir, 'files');

    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.baseDir, this.imageDir, this.fileDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  generateFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const ext = path.extname(originalName) || '';
    return `${timestamp}_${random}${ext}`;
  }

  getImagePath(filename) {
    return path.join(this.imageDir, filename);
  }

  getFilePath(filename) {
    return path.join(this.fileDir, filename);
  }

  exists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (e) {
      return false;
    }
  }

  delete(filePath) {
    try {
      if (this.exists(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

module.exports = new StorageService();







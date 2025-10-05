/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境优化
  output: 'standalone',
  
  // 图片优化
  images: {
    unoptimized: true
  },
  
  // 服务器外部包
  serverExternalPackages: [],
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    PORT: process.env.PORT || '8080'
  },
  
  // 服务器配置
  serverRuntimeConfig: {
    port: process.env.PORT || 8080
  },
  
  // 重写规则（如果需要）
  async rewrites() {
    return []
  }
}

module.exports = nextConfig

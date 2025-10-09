# FluLink Backend Dockerfile for Zeabur
# 完全重新设计的Dockerfile，避免路径问题

FROM node:18-alpine

# 用于强制刷新构建缓存
ARG BUILD_TIMESTAMP=static
RUN echo "BUILD_TIMESTAMP=$BUILD_TIMESTAMP"

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 仅复制后端依赖清单并安装依赖（缓存友好，路径与日志保持一致）
RUN mkdir -p /app/flulink/backend
# 明确复制 package.json 与（若存在）package-lock.json
COPY flulink/backend/package.json /app/flulink/backend/package.json
COPY flulink/backend/package-lock.json /app/flulink/backend/package-lock.json
WORKDIR /app/flulink/backend
RUN echo "Listing backend dir before install:" && \
    ls -la /app/flulink/backend && \
    npm install --omit=dev --no-audit --no-fund && \
    npm cache clean --force

# 复制后端源码（到 /app/flulink/backend）
COPY flulink/backend /app/flulink/backend
RUN echo "Listing backend dir after source copy:" && ls -la /app/flulink/backend

# 创建必要的目录
RUN mkdir -p /app/uploads /app/logs && \
    chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8080
ENV NODE_OPTIONS="--max-old-space-size=512"

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用（当前目录 /app/flulink/backend）
CMD ["node", "src/index.js"]

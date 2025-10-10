FROM node:18-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"

WORKDIR /app

# 复制整个项目
COPY . .

# 安装依赖并构建
RUN cd flulink/frontend && \
    npm install && \
    npm run build

# 使用静态文件服务器
FROM zeabur/caddy-static

# 复制构建后的前端文件
COPY --from=build /app/flulink/frontend/dist /usr/share/caddy

EXPOSE 8080
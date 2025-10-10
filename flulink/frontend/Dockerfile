FROM node:18-alpine AS build
LABEL "language"="nodejs"
LABEL "framework"="vite"

WORKDIR /app

# 复制整个项目
COPY . .

# 检查文件结构并安装前端依赖
RUN ls -la && \
    ls -la flulink/ && \
    cd flulink/frontend && \
    echo "检查 Navigation.tsx 文件:" && \
    cat src/components/Navigation/Navigation.tsx | head -15 && \
    echo "检查 AppContext.tsx 是否存在:" && \
    ls -la src/context/ && \
    echo "开始安装依赖..." && \
    npm install && \
    echo "开始构建..." && \
    npm run build

# 使用静态文件服务器
FROM zeabur/caddy-static

# 复制构建后的前端文件
COPY --from=build /app/flulink/frontend/dist /usr/share/caddy

EXPOSE 8080
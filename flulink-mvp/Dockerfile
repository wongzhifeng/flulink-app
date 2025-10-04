# Zeabur Dockerfile - FluLink MVP
FROM node:18-alpine

# 添加标签
LABEL "language"="nodejs"
LABEL "framework"="next.js"

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括devDependencies，构建需要）
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口3000 (Zeabur要求)
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["npm", "start"]

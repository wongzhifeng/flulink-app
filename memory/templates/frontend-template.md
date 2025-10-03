# 前端开发

## 项目信息
- **项目名称**: [项目名称]
- **前端版本**: [版本号]
- **最后更新**: [更新日期]
- **记忆入口**: [memory/memory.md]

## 技术栈

### 核心框架
- **框架**: [React/Vue/Angular/Next.js等]
- **版本**: [版本号]
- **状态管理**: [Redux/Zustand/Vuex等]
- **路由**: [React Router/Vue Router等]

### 样式方案
- **CSS框架**: [Tailwind CSS/Bootstrap/Material-UI等]
- **预处理器**: [Sass/Less/Stylus等]
- **CSS-in-JS**: [styled-components/emotion等]

### 构建工具
- **打包工具**: [Webpack/Vite/Rollup等]
- **开发服务器**: [Vite/Webpack Dev Server等]
- **代码检查**: [ESLint/Prettier等]

## 项目结构

```
src/
├── components/          # 通用组件
│   ├── Button/         # 按钮组件
│   ├── Modal/          # 模态框组件
│   └── Form/           # 表单组件
├── pages/              # 页面组件
│   ├── Home/           # 首页
│   ├── About/          # 关于页
│   └── Contact/        # 联系页
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
├── services/           # API服务
├── store/              # 状态管理
├── styles/             # 样式文件
└── assets/             # 静态资源
```

## 组件开发

### 组件规范
- **命名规范**: PascalCase
- **文件结构**: 组件文件夹包含index.tsx和styles.module.css
- **Props类型**: 使用TypeScript定义接口
- **文档**: 每个组件都要有JSDoc注释

### 组件示例
```tsx
// Button/index.tsx
import React from 'react';
import styles from './styles.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

## 页面开发

### 页面结构
- **布局组件**: 统一的页面布局
- **路由配置**: 页面路由定义
- **数据获取**: 页面数据加载逻辑
- **状态管理**: 页面状态管理

### 页面示例
```tsx
// pages/Home/index.tsx
import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { ProductList } from '@/components/ProductList';
import { getProducts } from '@/services/product';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Layout>
      <h1>产品列表</h1>
      {loading ? (
        <div>加载中...</div>
      ) : (
        <ProductList products={products} />
      )}
    </Layout>
  );
};
```

## 状态管理

### 全局状态
- **用户状态**: 用户信息、登录状态
- **应用状态**: 主题、语言、配置
- **数据状态**: 缓存数据、API数据

### 状态管理示例
```tsx
// store/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const { setUser, clearUser, setLoading } = userSlice.actions;
export default userSlice.reducer;
```

## 样式开发

### 样式规范
- **命名规范**: BEM命名法
- **响应式设计**: 移动端优先
- **主题系统**: 支持明暗主题切换
- **动画效果**: 统一的动画时长和缓动函数

### 样式示例
```css
/* Button/styles.module.css */
.button {
  @apply px-4 py-2 rounded-md font-medium transition-all duration-200;
}

.primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.small {
  @apply px-2 py-1 text-sm;
}

.medium {
  @apply px-4 py-2 text-base;
}

.large {
  @apply px-6 py-3 text-lg;
}
```

## 性能优化

### 代码分割
- **路由级别分割**: 按页面分割代码
- **组件级别分割**: 懒加载大型组件
- **第三方库分割**: 分离第三方库代码

### 性能监控
- **Core Web Vitals**: 监控LCP、FID、CLS
- **Bundle分析**: 分析打包文件大小
- **运行时监控**: 监控页面性能指标

## 测试策略

### 单元测试
- **组件测试**: 测试组件渲染和交互
- **工具函数测试**: 测试工具函数逻辑
- **Hook测试**: 测试自定义Hook

### 集成测试
- **页面测试**: 测试页面完整流程
- **API测试**: 测试API调用逻辑
- **路由测试**: 测试页面路由

## 部署配置

### 构建配置
- **环境变量**: 区分开发、测试、生产环境
- **CDN配置**: 静态资源CDN加速
- **缓存策略**: 浏览器缓存配置

### 部署流程
- **代码检查**: ESLint、Prettier检查
- **单元测试**: 运行测试用例
- **构建打包**: 生成生产环境代码
- **部署发布**: 部署到服务器

## 联系方式
- **项目路径**: C:\Users\admin\1\test1
- **记忆文件**: memory/memory.md
- **最后更新**: [更新日期]

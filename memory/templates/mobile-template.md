# 移动开�?

## 项目信息
- **项目名称**: [项目名称]
- **移动版本**: [版本号]
- **最后更�?*: [更新日期]
- **记忆入口**: [memory/memory.md]

## 开发类�?

### 原生开�?
- **iOS**: Swift/Objective-C
- **Android**: Kotlin/Java
- **开发工�?*: Xcode/Android Studio

### 跨端开�?
- **React Native**: JavaScript/TypeScript
- **Flutter**: Dart
- **Ionic**: HTML/CSS/JavaScript
- **Xamarin**: C#

### 混合开�?
- **Cordova/PhoneGap**: HTML/CSS/JavaScript
- **Ionic**: 基于Cordova的框�?

## 技术栈

### 跨端框架 (React Native)
- **框架版本**: [React Native版本]
- **导航**: [React Navigation]
- **状态管�?*: [Redux/Context API]
- **UI组件**: [NativeBase/UI Kitten等]

### 原生开�?
#### iOS
- **语言**: Swift/Objective-C
- **UI框架**: UIKit/SwiftUI
- **网络**: URLSession/Alamofire
- **数据�?*: Core Data/SQLite

#### Android
- **语言**: Kotlin/Java
- **UI框架**: Jetpack Compose/View System
- **网络**: Retrofit/OkHttp
- **数据�?*: Room/SQLite

## 项目结构

### React Native项目结构
```
src/
├── components/          # 通用组件
�?  ├── Button/         # 按钮组件
�?  ├── Input/          # 输入框组�?
�?  └── Card/           # 卡片组件
├── screens/            # 页面组件
�?  ├── Home/           # 首页
�?  ├── Profile/        # 个人中心
�?  └── Settings/       # 设置�?
├── navigation/         # 导航配置
├── services/           # API服务
├── store/              # 状态管�?
├── utils/              # 工具函数
└── assets/             # 静态资�?
    ├── images/         # 图片资源
    ├── fonts/          # 字体文件
    └── icons/          # 图标文件
```

### 原生iOS项目结构
```
MyApp/
├── MyApp/              # 主应用代�?
�?  ├── Views/          # 视图控制�?
�?  ├── Models/         # 数据模型
�?  ├── Services/       # 服务�?
�?  ├── Utils/          # 工具�?
�?  └── Resources/      # 资源文件
├── MyAppTests/         # 单元测试
└── MyAppUITests/       # UI测试
```

## 组件开�?

### React Native组件
```tsx
// components/Button/index.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        style
      ]}
      {...props}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: '#007AFF'
  },
  secondary: {
    backgroundColor: '#F2F2F7'
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32
  },
  text: {
    fontSize: 16,
    fontWeight: '600'
  },
  primaryText: {
    color: '#FFFFFF'
  },
  secondaryText: {
    color: '#000000'
  }
});
```

### 原生iOS组件 (SwiftUI)
```swift
// ButtonView.swift
import SwiftUI

struct ButtonView: View {
    let title: String
    let variant: ButtonVariant
    let size: ButtonSize
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(size.font)
                .foregroundColor(variant.textColor)
                .padding(.horizontal, size.horizontalPadding)
                .padding(.vertical, size.verticalPadding)
                .background(variant.backgroundColor)
                .cornerRadius(8)
        }
    }
}

enum ButtonVariant {
    case primary
    case secondary
    
    var backgroundColor: Color {
        switch self {
        case .primary:
            return .blue
        case .secondary:
            return .gray
        }
    }
    
    var textColor: Color {
        switch self {
        case .primary:
            return .white
        case .secondary:
            return .black
        }
    }
}

enum ButtonSize {
    case small
    case medium
    case large
    
    var font: Font {
        switch self {
        case .small:
            return .caption
        case .medium:
            return .body
        case .large:
            return .title3
        }
    }
    
    var horizontalPadding: CGFloat {
        switch self {
        case .small:
            return 16
        case .medium:
            return 24
        case .large:
            return 32
        }
    }
    
    var verticalPadding: CGFloat {
        switch self {
        case .small:
            return 8
        case .medium:
            return 12
        case .large:
            return 16
        }
    }
}
```

## 导航配置

### React Native导航
```tsx
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/Home';
import { ProfileScreen } from '../screens/Profile';
import { SettingsScreen } from '../screens/Settings';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## 状态管�?

### React Native状态管�?
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

## 原生功能集成

### 相机功能
```tsx
// services/CameraService.ts
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export const CameraService = {
  takePhoto: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
        },
        (response) => {
          if (response.assets && response.assets[0]) {
            resolve(response.assets[0].uri);
          } else {
            reject(new Error('Failed to take photo'));
          }
        }
      );
    });
  },

  selectFromLibrary: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
        },
        (response) => {
          if (response.assets && response.assets[0]) {
            resolve(response.assets[0].uri);
          } else {
            reject(new Error('Failed to select image'));
          }
        }
      );
    });
  }
};
```

### 推送通知
```tsx
// services/PushNotificationService.ts
import PushNotification from 'react-native-push-notification';

export const PushNotificationService = {
  configure: () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  },

  sendLocalNotification: (title: string, message: string) => {
    PushNotification.localNotification({
      title,
      message,
    });
  }
};
```

## 性能优化

### 图片优化
- **图片压缩**: 使用适当的图片尺寸和格式
- **懒加�?*: 实现图片懒加�?
- **缓存策略**: 合理使用图片缓存

### 列表优化
- **虚拟�?*: 使用FlatList虚拟化长列表
- **分页加载**: 实现分页加载数据
- **内存管理**: 及时清理不需要的数据

## 测试策略

### 单元测试
- **组件测试**: 测试组件渲染和交�?
- **工具函数测试**: 测试工具函数逻辑
- **Hook测试**: 测试自定义Hook

### 集成测试
- **页面测试**: 测试页面完整流程
- **API测试**: 测试API调用逻辑
- **导航测试**: 测试页面导航

### E2E测试
- **用户流程测试**: 测试完整用户流程
- **跨平台测�?*: 测试iOS和Android平台

## 部署配置

### 构建配置
- **环境变量**: 区分开发、测试、生产环�?
- **代码签名**: 配置iOS和Android签名
- **版本管理**: 管理应用版本�?

### 发布流程
- **代码检�?*: ESLint、Prettier检�?
- **单元测试**: 运行测试用例
- **构建打包**: 生成应用�?
- **应用商店**: 发布到App Store和Google Play

## 联系方式
- **项目路径**: [��Ŀ��Ŀ¼]
- **记忆文件**: memory/memory.md
- **最后更�?*: [更新日期]

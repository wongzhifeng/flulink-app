import { io, Socket } from 'socket.io-client';
import { message } from 'antd';

interface StarSeedRadiation {
  starSeedId: string;
  luminosity: number;
  position: { x: number; y: number; z: number };
  userId: string;
  timestamp: Date;
}

interface ClusterUpdate {
  clusterId: string;
  members: any[];
  averageResonance: number;
  updatedBy: string;
  timestamp: Date;
}

interface UserActivity {
  userId: string;
  activity: 'online' | 'offline' | 'typing' | 'viewing';
  nickname: string;
  timestamp: Date;
}

interface StarSeedInteraction {
  starSeedId: string;
  actionType: 'light' | 'comment' | 'share';
  userId: string;
  timestamp: Date;
}

interface ClusterMemberChange {
  clusterId: string;
  changeType: 'join' | 'leave' | 'update';
  member: any;
  changedBy: string;
  timestamp: Date;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  // 连接到WebSocket服务器
  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, WebSocket connection skipped');
      return;
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
    
    this.socket = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventHandlers();
  }

  // 设置事件处理器
  private setupEventHandlers() {
    if (!this.socket) return;

    // 连接成功
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    // 连接断开
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // 服务器主动断开，尝试重连
        this.attemptReconnect();
      }
    });

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.emit('error', error);
      
      if (error.message.includes('Authentication error')) {
        // 认证错误，清除token
        localStorage.removeItem('token');
        message.error('登录已过期，请重新登录');
        window.location.href = '/login';
      } else {
        // 其他错误，尝试重连
        this.attemptReconnect();
      }
    });

    // 星种辐射事件
    this.socket.on('star_seed_radiation', (data: StarSeedRadiation) => {
      console.log('Received star seed radiation:', data);
      this.emit('star_seed_radiation', data);
    });

    // 星团更新事件
    this.socket.on('cluster_update', (data: ClusterUpdate) => {
      console.log('Received cluster update:', data);
      this.emit('cluster_update', data);
    });

    // 用户活动事件
    this.socket.on('user_activity', (data: UserActivity) => {
      console.log('Received user activity:', data);
      this.emit('user_activity', data);
    });

    // 用户上线事件
    this.socket.on('user_online', (data: UserActivity) => {
      console.log('User online:', data);
      this.emit('user_online', data);
    });

    // 用户下线事件
    this.socket.on('user_offline', (data: UserActivity) => {
      console.log('User offline:', data);
      this.emit('user_offline', data);
    });

    // 用户加入房间事件
    this.socket.on('user_joined_room', (data: any) => {
      console.log('User joined room:', data);
      this.emit('user_joined_room', data);
    });

    // 用户离开房间事件
    this.socket.on('user_left_room', (data: any) => {
      console.log('User left room:', data);
      this.emit('user_left_room', data);
    });

    // 星种互动事件
    this.socket.on('star_seed_interaction', (data: StarSeedInteraction) => {
      console.log('Received star seed interaction:', data);
      this.emit('star_seed_interaction', data);
    });

    // 星团成员变化事件
    this.socket.on('cluster_member_change', (data: ClusterMemberChange) => {
      console.log('Received cluster member change:', data);
      this.emit('cluster_member_change', data);
    });

    // 错误事件
    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  // 尝试重连
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // 发送星种辐射事件
  emitStarSeedRadiation(data: Omit<StarSeedRadiation, 'userId' | 'timestamp'>) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected, cannot emit star seed radiation');
      return;
    }

    this.socket.emit('star_seed_radiation', {
      ...data,
      timestamp: new Date()
    });
  }

  // 发送星团更新事件
  emitClusterUpdate(data: Omit<ClusterUpdate, 'updatedBy' | 'timestamp'>) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected, cannot emit cluster update');
      return;
    }

    this.socket.emit('cluster_update', {
      ...data,
      timestamp: new Date()
    });
  }

  // 发送用户活动事件
  emitUserActivity(activity: UserActivity['activity']) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected, cannot emit user activity');
      return;
    }

    this.socket.emit('user_activity', {
      activity,
      timestamp: new Date()
    });
  }

  // 加入房间
  joinRoom(roomId: string) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected, cannot join room');
      return;
    }

    this.socket.emit('join_room', roomId);
  }

  // 离开房间
  leaveRoom(roomId: string) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected, cannot leave room');
      return;
    }

    this.socket.emit('leave_room', roomId);
  }

  // 发送星种互动事件
  emitStarSeedInteraction(data: Omit<StarSeedInteraction, 'userId' | 'timestamp'>) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected, cannot emit star seed interaction');
      return;
    }

    this.socket.emit('star_seed_interaction', {
      ...data,
      timestamp: new Date()
    });
  }

  // 发送星团成员变化事件
  emitClusterMemberChange(data: Omit<ClusterMemberChange, 'changedBy' | 'timestamp'>) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected, cannot emit cluster member change');
      return;
    }

    this.socket.emit('cluster_member_change', {
      ...data,
      timestamp: new Date()
    });
  }

  // 添加事件监听器
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  // 移除事件监听器
  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 触发事件
  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // 获取连接状态
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 重新连接
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// 创建单例实例
const webSocketClient = new WebSocketClient();

export default webSocketClient;
export type {
  StarSeedRadiation,
  ClusterUpdate,
  UserActivity,
  StarSeedInteraction,
  ClusterMemberChange
};

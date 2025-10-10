import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import webSocketClient, { 
  StarSeedRadiation, 
  ClusterUpdate, 
  UserActivity,
  StarSeedInteraction,
  ClusterMemberChange 
} from '../services/webSocketClient';

interface UseWebSocketOptions {
  enableStarSeedRadiation?: boolean;
  enableClusterUpdates?: boolean;
  enableUserActivity?: boolean;
  enableStarSeedInteractions?: boolean;
  enableClusterMemberChanges?: boolean;
  onStarSeedRadiation?: (data: StarSeedRadiation) => void;
  onClusterUpdate?: (data: ClusterUpdate) => void;
  onUserActivity?: (data: UserActivity) => void;
  onStarSeedInteraction?: (data: StarSeedInteraction) => void;
  onClusterMemberChange?: (data: ClusterMemberChange) => void;
  onUserOnline?: (data: UserActivity) => void;
  onUserOffline?: (data: UserActivity) => void;
  onConnected?: () => void;
  onDisconnected?: (reason: string) => void;
  onError?: (error: any) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    enableStarSeedRadiation = true,
    enableClusterUpdates = true,
    enableUserActivity = true,
    enableStarSeedInteractions = true,
    enableClusterMemberChanges = true,
    onStarSeedRadiation,
    onClusterUpdate,
    onUserActivity,
    onStarSeedInteraction,
    onClusterMemberChange,
    onUserOnline,
    onUserOffline,
    onConnected,
    onDisconnected,
    onError
  } = options;

  const { user, currentCluster, dispatch } = useAppContext();
  const isInitialized = useRef(false);

  // 初始化WebSocket连接
  useEffect(() => {
    if (!user || isInitialized.current) return;

    isInitialized.current = true;

    // 连接事件
    webSocketClient.on('connected', () => {
      console.log('WebSocket connected');
      onConnected?.();
      
      // 发送用户上线活动
      if (enableUserActivity) {
        webSocketClient.emitUserActivity('online');
      }
    });

    // 断开连接事件
    webSocketClient.on('disconnected', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      onDisconnected?.(reason);
    });

    // 错误事件
    webSocketClient.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    });

    // 星种辐射事件
    if (enableStarSeedRadiation) {
      webSocketClient.on('star_seed_radiation', (data: StarSeedRadiation) => {
        console.log('Star seed radiation received:', data);
        onStarSeedRadiation?.(data);
      });
    }

    // 星团更新事件
    if (enableClusterUpdates) {
      webSocketClient.on('cluster_update', (data: ClusterUpdate) => {
        console.log('Cluster update received:', data);
        onClusterUpdate?.(data);
      });
    }

    // 用户活动事件
    if (enableUserActivity) {
      webSocketClient.on('user_activity', (data: UserActivity) => {
        console.log('User activity received:', data);
        onUserActivity?.(data);
      });

      webSocketClient.on('user_online', (data: UserActivity) => {
        console.log('User online:', data);
        onUserOnline?.(data);
      });

      webSocketClient.on('user_offline', (data: UserActivity) => {
        console.log('User offline:', data);
        onUserOffline?.(data);
      });
    }

    // 星种互动事件
    if (enableStarSeedInteractions) {
      webSocketClient.on('star_seed_interaction', (data: StarSeedInteraction) => {
        console.log('Star seed interaction received:', data);
        onStarSeedInteraction?.(data);
      });
    }

    // 星团成员变化事件
    if (enableClusterMemberChanges) {
      webSocketClient.on('cluster_member_change', (data: ClusterMemberChange) => {
        console.log('Cluster member change received:', data);
        onClusterMemberChange?.(data);
      });
    }

    return () => {
      // 清理事件监听器
      webSocketClient.off('connected', onConnected || (() => {}));
      webSocketClient.off('disconnected', onDisconnected || (() => {}));
      webSocketClient.off('error', onError || (() => {}));
      webSocketClient.off('star_seed_radiation', onStarSeedRadiation || (() => {}));
      webSocketClient.off('cluster_update', onClusterUpdate || (() => {}));
      webSocketClient.off('user_activity', onUserActivity || (() => {}));
      webSocketClient.off('user_online', onUserOnline || (() => {}));
      webSocketClient.off('user_offline', onUserOffline || (() => {}));
      webSocketClient.off('star_seed_interaction', onStarSeedInteraction || (() => {}));
      webSocketClient.off('cluster_member_change', onClusterMemberChange || (() => {}));
    };
  }, [user, enableStarSeedRadiation, enableClusterUpdates, enableUserActivity, enableStarSeedInteractions, enableClusterMemberChanges, onStarSeedRadiation, onClusterUpdate, onUserActivity, onStarSeedInteraction, onClusterMemberChange, onUserOnline, onUserOffline, onConnected, onDisconnected, onError]);

  // 加入星团房间
  useEffect(() => {
    if (currentCluster && webSocketClient.getConnectionStatus()) {
      webSocketClient.joinRoom(`cluster:${currentCluster._id}`);
      
      return () => {
        webSocketClient.leaveRoom(`cluster:${currentCluster._id}`);
      };
    }
  }, [currentCluster]);

  // 发送星种辐射
  const emitStarSeedRadiation = useCallback((data: Omit<StarSeedRadiation, 'userId' | 'timestamp'>) => {
    webSocketClient.emitStarSeedRadiation(data);
  }, []);

  // 发送星团更新
  const emitClusterUpdate = useCallback((data: Omit<ClusterUpdate, 'updatedBy' | 'timestamp'>) => {
    webSocketClient.emitClusterUpdate(data);
  }, []);

  // 发送用户活动
  const emitUserActivity = useCallback((activity: UserActivity['activity']) => {
    webSocketClient.emitUserActivity(activity);
  }, []);

  // 加入房间
  const joinRoom = useCallback((roomId: string) => {
    webSocketClient.joinRoom(roomId);
  }, []);

  // 离开房间
  const leaveRoom = useCallback((roomId: string) => {
    webSocketClient.leaveRoom(roomId);
  }, []);

  // 发送星种互动
  const emitStarSeedInteraction = useCallback((data: Omit<StarSeedInteraction, 'userId' | 'timestamp'>) => {
    webSocketClient.emitStarSeedInteraction(data);
  }, []);

  // 发送星团成员变化
  const emitClusterMemberChange = useCallback((data: Omit<ClusterMemberChange, 'changedBy' | 'timestamp'>) => {
    webSocketClient.emitClusterMemberChange(data);
  }, []);

  // 获取连接状态
  const getConnectionStatus = useCallback(() => {
    return webSocketClient.getConnectionStatus();
  }, []);

  // 重新连接
  const reconnect = useCallback(() => {
    webSocketClient.reconnect();
  }, []);

  return {
    emitStarSeedRadiation,
    emitClusterUpdate,
    emitUserActivity,
    joinRoom,
    leaveRoom,
    emitStarSeedInteraction,
    emitClusterMemberChange,
    getConnectionStatus,
    reconnect
  };
};

// 专门用于星种辐射的Hook
export const useStarSeedRadiation = (starSeedId: string) => {
  const { emitStarSeedRadiation } = useWebSocket({
    enableStarSeedRadiation: true,
    onStarSeedRadiation: (data: StarSeedRadiation) => {
      if (data.starSeedId === starSeedId) {
        // 处理特定星种的辐射事件
        console.log(`Radiation for star seed ${starSeedId}:`, data);
      }
    }
  });

  const triggerRadiation = useCallback((luminosity: number, position: { x: number; y: number; z: number }) => {
    emitStarSeedRadiation({
      starSeedId,
      luminosity,
      position
    });
  }, [starSeedId, emitStarSeedRadiation]);

  return { triggerRadiation };
};

// 专门用于星团更新的Hook
export const useClusterUpdates = (clusterId: string) => {
  const { emitClusterUpdate } = useWebSocket({
    enableClusterUpdates: true,
    onClusterUpdate: (data: ClusterUpdate) => {
      if (data.clusterId === clusterId) {
        // 处理特定星团的更新事件
        console.log(`Update for cluster ${clusterId}:`, data);
      }
    }
  });

  const updateCluster = useCallback((members: any[], averageResonance: number) => {
    emitClusterUpdate({
      clusterId,
      members,
      averageResonance
    });
  }, [clusterId, emitClusterUpdate]);

  return { updateCluster };
};

// 专门用于用户活动的Hook
export const useUserActivity = () => {
  const { emitUserActivity } = useWebSocket({
    enableUserActivity: true
  });

  const setActivity = useCallback((activity: UserActivity['activity']) => {
    emitUserActivity(activity);
  }, [emitUserActivity]);

  return { setActivity };
};

export default useWebSocket;

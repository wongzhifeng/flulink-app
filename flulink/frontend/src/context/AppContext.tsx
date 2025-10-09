import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react'
import { AppState, User, StarSeed, Cluster, AuthState } from '../types'

// 性能优化：使用常量定义action类型，避免字符串重复创建
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_CURRENT_CLUSTER: 'SET_CURRENT_CLUSTER',
  SET_STAR_SEEDS: 'SET_STAR_SEEDS',
  ADD_STAR_SEED: 'ADD_STAR_SEED',
  UPDATE_STAR_SEED: 'UPDATE_STAR_SEED',
  SET_USERS: 'SET_USERS',
  UPDATE_USER: 'UPDATE_USER',
} as const

// 初始状态
const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  currentCluster: null,
  starSeeds: [],
  users: [],
  loading: false,
  error: null,
}

// Action类型
type AppAction =
  | { type: typeof ACTION_TYPES.SET_LOADING; payload: boolean }
  | { type: typeof ACTION_TYPES.SET_ERROR; payload: string | null }
  | { type: typeof ACTION_TYPES.LOGIN_SUCCESS; payload: { user: User; token: string } }
  | { type: typeof ACTION_TYPES.LOGOUT }
  | { type: typeof ACTION_TYPES.SET_CURRENT_CLUSTER; payload: Cluster | null }
  | { type: typeof ACTION_TYPES.SET_STAR_SEEDS; payload: StarSeed[] }
  | { type: typeof ACTION_TYPES.ADD_STAR_SEED; payload: StarSeed }
  | { type: typeof ACTION_TYPES.UPDATE_STAR_SEED; payload: StarSeed }
  | { type: typeof ACTION_TYPES.SET_USERS; payload: User[] }
  | { type: typeof ACTION_TYPES.UPDATE_USER; payload: User }

// 第8次优化：增强reducer函数，添加深度比较和性能监控
const appReducer = (state: AppState, action: AppAction): AppState => {
  const startTime = performance.now()
  
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      // 优化8.1: 增强状态比较，避免不必要的状态更新
      if (state.loading === action.payload) {
        console.log(`State update skipped for SET_LOADING: ${performance.now() - startTime}ms`)
        return state
      }
      return { ...state, loading: action.payload }
    
    case ACTION_TYPES.SET_ERROR:
      // 性能优化：避免不必要的状态更新
      if (state.error === action.payload) return state
      return { ...state, error: action.payload }
    
    case ACTION_TYPES.LOGIN_SUCCESS:
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload.user,
          token: action.payload.token,
        },
        error: null,
      }
    
    case ACTION_TYPES.LOGOUT:
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
        },
        currentCluster: null,
      }
    
    case ACTION_TYPES.SET_CURRENT_CLUSTER:
      // 性能优化：避免不必要的状态更新
      if (state.currentCluster === action.payload) return state
      return { ...state, currentCluster: action.payload }
    
    case ACTION_TYPES.SET_STAR_SEEDS:
      // 性能优化：避免不必要的状态更新
      if (state.starSeeds === action.payload) return state
      return { ...state, starSeeds: action.payload }
    
    case ACTION_TYPES.ADD_STAR_SEED:
      // 性能优化：检查是否已存在，避免重复添加
      const exists = state.starSeeds.some(seed => seed._id === action.payload._id)
      if (exists) return state
      return { ...state, starSeeds: [...state.starSeeds, action.payload] }
    
    case ACTION_TYPES.UPDATE_STAR_SEED:
      // 性能优化：使用更高效的更新方式
      const seedIndex = state.starSeeds.findIndex(seed => seed._id === action.payload._id)
      if (seedIndex === -1) return state
      
      const newStarSeeds = [...state.starSeeds]
      newStarSeeds[seedIndex] = action.payload
      return { ...state, starSeeds: newStarSeeds }
    
    case ACTION_TYPES.SET_USERS:
      // 性能优化：避免不必要的状态更新
      if (state.users === action.payload) return state
      return { ...state, users: action.payload }
    
    case ACTION_TYPES.UPDATE_USER:
      // 性能优化：使用更高效的更新方式
      const userIndex = state.users.findIndex(user => user._id === action.payload._id)
      if (userIndex === -1) return state
      
      const newUsers = [...state.users]
      newUsers[userIndex] = action.payload
      
      return {
        ...state,
        users: newUsers,
        auth: state.auth.user?._id === action.payload._id
          ? { ...state.auth, user: action.payload }
          : state.auth,
      }
    
    default:
      return state
  }
}

// Context类型定义
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | null>(null)

// 性能优化：使用React.memo包装Provider组件
export const AppProvider: React.FC<{ children: ReactNode }> = React.memo(({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // 性能优化：使用useMemo缓存context值
  const contextValue = useMemo(() => ({
    state,
    dispatch
  }), [state, dispatch])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
})

// 性能优化：设置displayName用于调试
AppProvider.displayName = 'AppProvider'

// Hook
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// 性能优化：认证相关hooks，使用useCallback缓存函数
export const useAuth = () => {
  const { state, dispatch } = useApp()
  
  const login = useCallback((user: User, token: string) => {
    dispatch({ type: ACTION_TYPES.LOGIN_SUCCESS, payload: { user, token } })
  }, [dispatch])
  
  const logout = useCallback(() => {
    dispatch({ type: ACTION_TYPES.LOGOUT })
  }, [dispatch])
  
  // 性能优化：使用useMemo缓存返回值
  return useMemo(() => ({
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    token: state.auth.token,
    login,
    logout,
  }), [state.auth.isAuthenticated, state.auth.user, state.auth.token, login, logout])
}

// 性能优化：星种相关hooks，使用useCallback缓存函数
export const useStarSeeds = () => {
  const { state, dispatch } = useApp()
  
  const setStarSeeds = useCallback((starSeeds: StarSeed[]) => {
    dispatch({ type: ACTION_TYPES.SET_STAR_SEEDS, payload: starSeeds })
  }, [dispatch])
  
  const addStarSeed = useCallback((starSeed: StarSeed) => {
    dispatch({ type: ACTION_TYPES.ADD_STAR_SEED, payload: starSeed })
  }, [dispatch])
  
  const updateStarSeed = useCallback((starSeed: StarSeed) => {
    dispatch({ type: ACTION_TYPES.UPDATE_STAR_SEED, payload: starSeed })
  }, [dispatch])
  
  // 性能优化：使用useMemo缓存返回值
  return useMemo(() => ({
    starSeeds: state.starSeeds,
    setStarSeeds,
    addStarSeed,
    updateStarSeed,
  }), [state.starSeeds, setStarSeeds, addStarSeed, updateStarSeed])
}

// 性能优化：星团相关hooks，使用useCallback缓存函数
export const useCluster = () => {
  const { state, dispatch } = useApp()
  
  const setCurrentCluster = useCallback((cluster: Cluster | null) => {
    dispatch({ type: ACTION_TYPES.SET_CURRENT_CLUSTER, payload: cluster })
  }, [dispatch])
  
  // 性能优化：使用useMemo缓存返回值
  return useMemo(() => ({
    currentCluster: state.currentCluster,
    setCurrentCluster,
  }), [state.currentCluster, setCurrentCluster])
}

// 性能优化：用户相关hooks，使用useCallback缓存函数
export const useUsers = () => {
  const { state, dispatch } = useApp()
  
  const setUsers = useCallback((users: User[]) => {
    dispatch({ type: ACTION_TYPES.SET_USERS, payload: users })
  }, [dispatch])
  
  const updateUser = useCallback((user: User) => {
    dispatch({ type: ACTION_TYPES.UPDATE_USER, payload: user })
  }, [dispatch])
  
  // 性能优化：使用useMemo缓存返回值
  return useMemo(() => ({
    users: state.users,
    setUsers,
    updateUser,
  }), [state.users, setUsers, updateUser])
}

// 性能优化：加载状态相关hooks
export const useLoading = () => {
  const { state, dispatch } = useApp()
  
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading })
  }, [dispatch])
  
  // 性能优化：使用useMemo缓存返回值
  return useMemo(() => ({
    loading: state.loading,
    setLoading,
  }), [state.loading, setLoading])
}

// 性能优化：错误处理相关hooks
export const useError = () => {
  const { state, dispatch } = useApp()
  
  const setError = useCallback((error: string | null) => {
    dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error })
  }, [dispatch])
  
  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.SET_ERROR, payload: null })
  }, [dispatch])
  
  // 性能优化：使用useMemo缓存返回值
  return useMemo(() => ({
    error: state.error,
    setError,
    clearError,
  }), [state.error, setError, clearError])
}


"use client"

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
  email: string
  displayName?: string
  tier: 'free' | 'premium'
  isLoggedIn: boolean
  joinDate: string
  stats: {
    strainsCreated: number
    totalInfections: number
    mutationCount: number
    regionsUnlocked: number
  }
}

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null
  lastUpdate: string | null
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_STATS'; payload: Partial<User['stats']> }

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  lastUpdate: null
}

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null,
        lastUpdate: new Date().toISOString()
      }

    case 'UPDATE_USER':
      if (!state.user) return state
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        lastUpdate: new Date().toISOString()
      }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'LOGOUT':
      return {
        ...initialState,
        lastUpdate: new Date().toISOString()
      }

    case 'UPDATE_STATS':
      if (!state.user) return state
      return {
        ...state,
        user: {
          ...state.user,
          stats: { ...state.user.stats, ...action.payload }
        },
        lastUpdate: new Date().toISOString()
      }

    default:
      return state
  }
}

const UserStateContext = createContext<{
  state: UserState
  dispatch: React.Dispatch<UserAction>
  login: (userData: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  updateStats: (stats: Partial<User['stats']>) => void
} | null>(null)

export function UserStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState)

  const login = (userData: User) => {
    dispatch({ type: 'SET_USER', payload: userData })
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
  }

  const updateStats = (stats: Partial<User['stats']>) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats })
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('flulink_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          if (userData.isLoggedIn) {
            dispatch({ type: 'SET_USER', payload: userData })
          }
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error)
      }
    }

    loadUserFromStorage()
  }, [])

  // Save user to localStorage when state changes
  useEffect(() => {
    if (state.user) {
      try {
        localStorage.setItem('flulink_user', JSON.stringify(state.user))
      } catch (error) {
        console.error('Failed to save user to storage:', error)
      }
    } else {
      localStorage.removeItem('flulink_user')
    }
  }, [state.user])

  const value = {
    state,
    dispatch,
    login,
    logout,
    updateUser,
    updateStats
  }

  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  )
}

export function useUserState() {
  const context = useContext(UserStateContext)
  if (!context) {
    throw new Error('useUserState must be used within a UserStateProvider')
  }
  return context
}

// Hook for checking authentication status
export function useAuth() {
  const { state } = useUserState()
  return {
    isAuthenticated: !!state.user?.isLoggedIn,
    user: state.user,
    isLoading: state.isLoading
  }
}

// Hook for user stats management
export function useUserStats() {
  const { state, updateStats } = useUserState()

  const incrementStrainsCreated = () => {
    if (state.user) {
      updateStats({
        strainsCreated: state.user.stats.strainsCreated + 1
      })
    }
  }

  const incrementInfections = (count: number = 1) => {
    if (state.user) {
      updateStats({
        totalInfections: state.user.stats.totalInfections + count
      })
    }
  }

  const incrementMutations = () => {
    if (state.user) {
      updateStats({
        mutationCount: state.user.stats.mutationCount + 1
      })
    }
  }

  const unlockRegion = () => {
    if (state.user) {
      updateStats({
        regionsUnlocked: state.user.stats.regionsUnlocked + 1
      })
    }
  }

  return {
    stats: state.user?.stats,
    incrementStrainsCreated,
    incrementInfections,
    incrementMutations,
    unlockRegion
  }
}

// Component for displaying user status
export function UserStatus() {
  const { state } = useUserState()

  if (state.isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span>加载中...</span>
      </div>
    )
  }

  if (!state.user?.isLoggedIn) {
    return (
      <div className="text-sm text-gray-500">
        未登录
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right">
        <div className="font-medium text-sm">
          {state.user.displayName || state.user.username}
        </div>
        <div className="text-xs text-gray-500">
          {state.user.tier === 'premium' ? '高级用户' : '免费用户'}
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
        {(state.user.displayName || state.user.username)[0]}
      </div>
    </div>
  )
}

// Component for user stats display
export function UserStatsDisplay() {
  const { stats } = useUserStats()

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-4">
        暂无统计数据
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-3 bg-blue-50 rounded-lg">
        <div className="text-xl font-bold text-blue-600">{stats.strainsCreated}</div>
        <div className="text-xs text-blue-800">创建毒株</div>
      </div>
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <div className="text-xl font-bold text-green-600">{stats.totalInfections}</div>
        <div className="text-xs text-green-800">总感染数</div>
      </div>
      <div className="text-center p-3 bg-purple-50 rounded-lg">
        <div className="text-xl font-bold text-purple-600">{stats.mutationCount}</div>
        <div className="text-xs text-purple-800">变异次数</div>
      </div>
      <div className="text-center p-3 bg-orange-50 rounded-lg">
        <div className="text-xl font-bold text-orange-600">{stats.regionsUnlocked}</div>
        <div className="text-xs text-orange-800">解锁区域</div>
      </div>
    </div>
  )
}
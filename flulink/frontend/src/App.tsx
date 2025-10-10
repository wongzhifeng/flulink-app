import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AppProvider } from './context/AppContext'
import OfflineModeIndicator from './components/OfflineModeIndicator'
import './App.css'

// 优化1: 使用 React.lazy 实现代码分割，减少初始加载时间
const StarMap = lazy(() => import('./pages/StarMap'))
const PublishPage = lazy(() => import('./pages/PublishPage'))
const ClusterPage = lazy(() => import('./pages/ClusterPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const StarSeedDetail = lazy(() => import('./pages/StarSeedDetail'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))

// 优化2: 添加错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#fff',
          backgroundColor: '#0a0a0a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1>糟糕，出现了一些问题</h1>
          <p>请刷新页面重试</p>
          {this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
              <summary>错误详情</summary>
              <pre style={{ 
                backgroundColor: '#1a1a1a', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 优化3: 添加加载组件
const LoadingFallback: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div className="loading-spinner" style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(255, 255, 255, 0.1)',
        borderTop: '4px solid #1890ff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p>加载中...</p>
    </div>
  </div>
)

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            colorBgBase: '#0a0a0a',
            colorTextBase: '#ffffff',
          },
        }}
      >
        <AppProvider>
          <Router>
            <div className="app">
              <OfflineModeIndicator />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<StarMap />} />
                  <Route path="/publish" element={<PublishPage />} />
                  <Route path="/cluster/:id" element={<ClusterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/starseed/:id" element={<StarSeedDetail />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </AppProvider>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App



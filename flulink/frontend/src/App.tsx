import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AppProvider } from './context/AppContext'
import StarMap from './pages/StarMap'
import PublishPage from './pages/PublishPage'
import ClusterPage from './pages/ClusterPage'
import ProfilePage from './pages/ProfilePage'
import StarSeedDetail from './pages/StarSeedDetail'
import AuthPage from './pages/AuthPage'
import ServicesPage from './pages/ServicesPage'
import './App.css'

const App: React.FC = () => {
  return (
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
            <Routes>
              <Route path="/" element={<StarMap />} />
              <Route path="/publish" element={<PublishPage />} />
              <Route path="/cluster/:id" element={<ClusterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/starseed/:id" element={<StarSeedDetail />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/services" element={<ServicesPage />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </ConfigProvider>
  )
}

export default App



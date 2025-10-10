import React, { useState, useEffect } from 'react'
import { Alert, Button, Space, Tooltip } from 'antd'
import { WifiOutlined, DisconnectOutlined, ReloadOutlined } from '@ant-design/icons'
import offlineService from '../utils/offlineService'
import apiService from '../utils/apiService'
import './OfflineModeIndicator.css'

const OfflineModeIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // 检查初始状态
    setIsOffline(offlineService.isOfflineMode())
  }, [])

  const handleReconnect = async () => {
    setIsChecking(true)
    try {
      // 尝试连接后端
      const response = await apiService.healthCheck()
      if (response.success) {
        // 后端可用，退出离线模式
        offlineService.disableOfflineMode()
        setIsOffline(false)
        window.location.reload() // 重新加载页面以使用在线模式
      }
    } catch (error) {
      // 后端不可用，保持离线模式
      console.log('后端不可用，保持离线模式')
    } finally {
      setIsChecking(false)
    }
  }

  if (!isOffline) {
    return null
  }

  return (
    <Alert
      message={
        <Space>
          <DisconnectOutlined />
          <span>离线模式</span>
          <Tooltip title="后端服务不可用，正在使用本地存储模式">
            <span className="offline-tooltip">ℹ️</span>
          </Tooltip>
        </Space>
      }
      description={
        <div className="offline-description">
          <p>当前运行在离线模式，所有数据将保存在本地浏览器中。</p>
          <p className="dao-quote">"知足不辱，知止不殆" - 离线模式确保功能可用</p>
          <Button 
            type="primary" 
            size="small" 
            icon={<ReloadOutlined />}
            loading={isChecking}
            onClick={handleReconnect}
            className="reconnect-btn"
          >
            尝试重新连接
          </Button>
        </div>
      }
      type="warning"
      showIcon={false}
      className="offline-indicator"
      closable={false}
    />
  )
}

export default OfflineModeIndicator

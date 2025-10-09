import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p style={{ color: '#ffffff', marginTop: '16px' }}>加载中...</p>
    </div>
  )
}

export default LoadingSpinner



import React from 'react'
import { Spin, Typography } from 'antd'

const { Text } = Typography

const LoadingSpinner = ({
  size = 'default',
  text = 'Loading...',
  showText = true,
  fullscreen = false,
  className = ''
}) => {
  const containerClass = fullscreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : `flex flex-col items-center justify-center py-8 ${className}`

  return (
    <div className={containerClass}>
      <Spin size={size} />
      {showText && (
        <Text type="secondary" className="mt-2">
          {text}
        </Text>
      )}
    </div>
  )
}

export default LoadingSpinner
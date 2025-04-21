import React from 'react'
import { Tag } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined
} from '@ant-design/icons'

const statusConfig = {
  active: {
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
  inactive: {
    color: 'default',
    icon: <CloseCircleOutlined />,
  },
  pending: {
    color: 'processing',
    icon: <ClockCircleOutlined />,
  },
  warning: {
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
  },
  error: {
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
  loading: {
    color: 'processing',
    icon: <SyncOutlined spin />,
  },
}

const StatusTag = ({ status, text, customColor, customIcon }) => {
  const config = statusConfig[status] || statusConfig.inactive

  return (
    <Tag
      icon={customIcon || config.icon}
      color={customColor || config.color}
      className="px-2 py-1"
    >
      {text || status}
    </Tag>
  )
}

export default StatusTag
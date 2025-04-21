import { notification } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined
} from '@ant-design/icons'

// Configure global settings for notifications
notification.config({
  placement: 'topRight',
  duration: 4,
})

const ToastNotifier = {
  success: (message, description = '', duration = 4, icon = <CheckCircleOutlined style={{ color: '#52c41a' }} />) => {
    notification.success({
      message,
      description,
      duration,
      icon,
    })
  },

  error: (message, description = '', duration = 6, icon = <CloseCircleOutlined style={{ color: '#ff4d4f' }} />) => {
    notification.error({
      message,
      description,
      duration,
      icon,
    })
  },

  info: (message, description = '', duration = 4, icon = <InfoCircleOutlined style={{ color: '#1677ff' }} />) => {
    notification.info({
      message,
      description,
      duration,
      icon,
    })
  },

  warning: (message, description = '', duration = 4, icon = <WarningOutlined style={{ color: '#faad14' }} />) => {
    notification.warning({
      message,
      description,
      duration,
      icon,
    })
  },

  // Method to close all currently open notifications
  closeAll: () => {
    notification.destroy()
  },
}

export default ToastNotifier
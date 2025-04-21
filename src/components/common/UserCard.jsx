import React from 'react'
import { Avatar, Typography } from 'antd'
import StatusTag from './StatusTag'
import { UserOutlined } from '@ant-design/icons'

const { Text } = Typography

const UserCard = ({
  name,
  avatarUrl,
  status,
  email,
  role,
  showStatus = true,
  size = 'default',
  className = '',
}) => {
  const avatarSize = size === 'small' ? 'small' : size === 'large' ? 'large' : 'default'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar
        src={avatarUrl}
        icon={!avatarUrl && <UserOutlined />}
        size={avatarSize}
      />
      <div>
        <div className="flex items-center gap-2">
          <Text strong>{name}</Text>
          {showStatus && status && (
            <StatusTag status={status} />
          )}
        </div>
        {email && <Text type="secondary" className="text-xs">{email}</Text>}
        {role && <Text type="secondary" className="text-xs block">{role}</Text>}
      </div>
    </div>
  )
}

export default UserCard
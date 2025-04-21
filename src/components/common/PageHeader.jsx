import React from 'react'
import { Typography } from 'antd'

const { Title } = Typography

const PageHeader = ({
  title,
  subtitle,
  actions,
  className = '',
  level = 2
}) => {
  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <div>
        <Title level={level} className="mb-0">{title}</Title>
        {subtitle && (
          <Typography.Text type="secondary" className="mt-1 block">
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

export default PageHeader
import React from 'react'
import { Modal, Button } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const ConfirmModal = ({
  title = 'Confirm Action',
  content,
  open,
  onConfirm,
  onCancel,
  confirmLoading = false,
  isDanger = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = <ExclamationCircleOutlined />,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center">
          {isDanger && <span className="text-red-500 mr-2">{icon}</span>}
          {!isDanger && <span className="text-blue-500 mr-2">{icon}</span>}
          <span>{title}</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="submit"
          type={isDanger ? 'default' : 'primary'}
          danger={isDanger}
          loading={confirmLoading}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>,
      ]}
    >
      <div className="py-4">{content}</div>
    </Modal>
  )
}

export default ConfirmModal
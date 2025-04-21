import React from 'react'
import { Table, Empty } from 'antd'

const TableWrapper = ({
  dataSource,
  columns,
  loading = false,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  },
  rowKey = 'id',
  ...props
}) => {
  return (
    <div className="w-full my-4">
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={pagination}
        rowKey={rowKey}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No data available"
            />
          ),
        }}
        className="w-full"
        {...props}
      />
    </div>
  )
}

export default TableWrapper
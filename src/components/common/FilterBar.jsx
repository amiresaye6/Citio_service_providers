import React from 'react';
import { Select, DatePicker, Space, Button, Card } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const FilterBar = ({
  filters = [],
  dateRange = false,
  onFilterChange,
  onDateRangeChange,
  onReset,
  loading = false,
  className = '',
}) => {
  return (
    <Card className={`mb-4 ${className}`} bordered={false}>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center">
          <FilterOutlined className="mr-2 text-gray-500" />
          <span className="font-medium">Filters:</span>
        </div>

        <Space wrap>
          {filters.map((filter) => (
            <Select
              key={filter.key}
              placeholder={filter.placeholder}
              style={{ minWidth: 120 }}
              onChange={(value) => onFilterChange(filter.key, value)}
              allowClear
              options={filter.options}
              loading={loading}
              disabled={loading}
            />
          ))}

          {dateRange && (
            <RangePicker
              onChange={onDateRangeChange}
              disabled={loading}
            />
          )}
        </Space>

        <div className="flex-grow" />

        <Button
          icon={<ReloadOutlined />}
          onClick={onReset}
          disabled={loading}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default FilterBar;
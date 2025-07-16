import React from 'react'
import { Input } from 'antd'

const { Search } = Input

const SearchInput = ({
  placeholder = 'Search...',
  value,
  onChange,
  allowClear = true,
  className = '',
  ...props
}) => (
  <Search
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    allowClear={allowClear}
    className={`w-full ${className}`}
    {...props}
  />
)

export default SearchInput
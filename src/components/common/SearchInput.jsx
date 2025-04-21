import React, { useState, useEffect } from 'react'
import { Input } from 'antd'
import debounce from 'lodash.debounce'

const { Search } = Input

const SearchInput = ({
  placeholder = 'Search...',
  onSearch,
  debounceTime = 500,
  className = '',
  allowClear = true,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState('')

  // Create a debounced search function
  const debouncedSearch = React.useCallback(
    debounce((value) => {
      onSearch(value)
    }, debounceTime),
    [onSearch, debounceTime]
  )

  // Update search value and trigger debounced search
  const handleChange = (e) => {
    const value = e.target.value
    setSearchValue(value)
    debouncedSearch(value)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <Search
      placeholder={placeholder}
      value={searchValue}
      onChange={handleChange}
      onSearch={(value) => onSearch(value)}
      allowClear={allowClear}
      className={`w-full ${className}`}
      {...props}
    />
  )
}

export default SearchInput
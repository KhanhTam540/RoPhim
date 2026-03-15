// src/components/admin/DataTable.jsx
import { useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'

const DataTable = ({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  onSort,
  sortColumn,
  sortDirection,
  selectable = true,
  onRowClick,
  emptyMessage = 'Không có dữ liệu',
}) => {
  const [selectedRows, setSelectedRows] = useState([])

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(data.map(item => item.id))
    }
  }

  // Handle select row
  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  // Handle sort
  const handleSort = (column) => {
    if (!onSort || !column.sortable) return
    
    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column.key, newDirection)
  }

  // Render sort icon
  const renderSortIcon = (column) => {
    if (!column.sortable) return null
    
    if (sortColumn === column.key) {
      return sortDirection === 'asc' ? 
        <FaSortUp className="ml-1 text-blue-500" size={12} /> : 
        <FaSortDown className="ml-1 text-blue-500" size={12} />
    }
    
    return <FaSort className="ml-1 text-gray-500" size={12} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-rophim-border border-t-blue-500 animate-spin"></div>
          <p className="text-sm text-rophim-textSecondary mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-rophim-card rounded-lg overflow-hidden border border-rophim-border">
      {/* Table with horizontal scroll */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-rophim-card">
        <table className="w-full min-w-[800px] lg:min-w-full divide-y divide-rophim-border">
          <thead className="bg-rophim-hover">
            <tr>
              {selectable && (
                <th scope="col" className="px-4 py-3 text-left w-10">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-rophim-border bg-rophim-bg text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                  </div>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-left text-sm font-medium text-rophim-textSecondary ${
                    column.sortable ? 'cursor-pointer hover:text-white' : ''
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.title}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rophim-border">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={item.id || index}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-rophim-hover transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-rophim-border bg-rophim-bg text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm whitespace-nowrap">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={selectable ? columns.length + 1 : columns.length}
                  className="text-center py-12 text-rophim-textSecondary"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-rophim-border mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-rophim-border gap-4">
          <div className="text-sm text-rophim-textSecondary order-2 sm:order-1">
            <span className="hidden sm:inline">Hiển thị </span>
            <span className="font-medium text-white">
              {((pagination.page - 1) * pagination.limit) + 1}
            </span>
            <span> - </span>
            <span className="font-medium text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            <span className="hidden sm:inline"> trên </span>
            <span className="font-medium text-white"> {pagination.total}</span>
            <span className="hidden sm:inline"> kết quả</span>
          </div>
          
          <div className="flex items-center space-x-2 order-1 sm:order-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg hover:bg-rophim-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Trang trước"
            >
              <FaChevronLeft size={16} />
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                let pageNum
                if (pagination.pages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-rophim-hover text-rophim-textSecondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg hover:bg-rophim-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Trang sau"
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
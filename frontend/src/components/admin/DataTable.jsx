import { useState } from 'react'
import { FaEdit, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const DataTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  loading = false,
  pagination,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState([])

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(data.map(item => item.id))
    }
  }

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-rophim-card rounded-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-rophim-hover">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-rophim-border bg-rophim-bg"
                />
              </th>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-sm font-medium">
                  {column.title}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-sm font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="border-t border-rophim-border hover:bg-rophim-hover">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item.id)}
                    onChange={() => handleSelectRow(item.id)}
                    className="rounded border-rophim-border bg-rophim-bg"
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="p-1 text-blue-500 hover:text-blue-400"
                        title="Xem chi tiết"
                      >
                        <FaEye size={16} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-yellow-500 hover:text-yellow-400"
                        title="Chỉnh sửa"
                      >
                        <FaEdit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1 text-red-500 hover:text-red-400"
                        title="Xóa"
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                    {onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(item)}
                        className={`px-2 py-1 text-xs rounded ${
                          item.isActive
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-500 hover:bg-gray-600'
                        } text-white`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-8 text-rophim-textSecondary">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-rophim-border">
          <div className="text-sm text-rophim-textSecondary">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} trên{' '}
            {pagination.total} kết quả
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1 rounded hover:bg-rophim-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft size={16} />
            </button>
            <span className="text-sm">
              Trang {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-1 rounded hover:bg-rophim-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
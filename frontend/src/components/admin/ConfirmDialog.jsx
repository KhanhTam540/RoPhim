import { FaExclamationTriangle } from 'react-icons/fa'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading = false }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Dialog */}
      <div className="relative bg-rophim-card rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 text-yellow-500 mb-4">
          <FaExclamationTriangle size={24} />
          <h3 className="text-lg font-semibold">{title || 'Xác nhận'}</h3>
        </div>
        
        <p className="text-rophim-textSecondary mb-6">
          {message || 'Bạn có chắc chắn muốn thực hiện hành động này?'}
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
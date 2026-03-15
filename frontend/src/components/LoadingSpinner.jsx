// src/components/LoadingSpinner.jsx
import { FaSpinner } from 'react-icons/fa'

const LoadingSpinner = ({ fullScreen = false, size = 'md', text = 'Đang tải...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const spinnerSize = sizeClasses[size] || sizeClasses.md

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-rophim-card rounded-xl p-8 flex flex-col items-center gap-4">
          <FaSpinner className={`${spinnerSize} text-red-600 animate-spin`} />
          {text && <p className="text-rophim-textSecondary">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <FaSpinner className={`${spinnerSize} text-red-600 animate-spin`} />
      {text && <p className="text-rophim-textSecondary">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
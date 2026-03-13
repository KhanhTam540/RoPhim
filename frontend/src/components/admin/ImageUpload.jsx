import { useState, useRef } from 'react'
import { FaUpload, FaTimes } from 'react-icons/fa'

const ImageUpload = ({ value, onChange, onRemove, label, accept = 'image/*' }) => {
  const [preview, setPreview] = useState(value)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (file) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
      onChange(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onRemove) onRemove()
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium">{label}</label>}
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-rophim-border'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ) : (
          <div className="py-8">
            <FaUpload className="mx-auto text-3xl text-rophim-textSecondary mb-2" />
            <p className="text-sm text-rophim-textSecondary">
              Kéo thả hoặc click để chọn ảnh
            </p>
            <p className="text-xs text-rophim-textSecondary mt-1">
              Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files[0]
            if (file) handleFileChange(file)
          }}
          className="hidden"
        />
        
        {!preview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary mt-2"
          >
            Chọn ảnh
          </button>
        )}
      </div>
    </div>
  )
}

export default ImageUpload
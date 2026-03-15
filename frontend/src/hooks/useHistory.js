// src/hooks/useHistory.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { historyApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const useHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })
  const { isAuthenticated } = useAuth()
  
  // Debounce timer ref
  const timerRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory()
    } else {
      setHistory([])
    }
  }, [isAuthenticated, pagination.page])

  const loadHistory = async () => {
    try {
      setLoading(true)
      console.log('📦 Loading history, page:', pagination.page)
      
      const response = await historyApi.getHistory({
        page: pagination.page,
        limit: pagination.limit
      })
      
      console.log('📦 History response:', response.data)
      
      const { history: historyList, pagination: pageInfo } = response.data
      
      if (pagination.page === 1) {
        setHistory(historyList || [])
      } else {
        setHistory(prev => [...prev, ...(historyList || [])])
      }
      
      setPagination(pageInfo || pagination)
    } catch (error) {
      console.error('❌ Error loading history:', error.response?.data || error.message)
      toast.error('Không thể tải lịch sử xem')
    } finally {
      setLoading(false)
    }
  }

  // Thêm debounce để tránh gọi API quá nhiều
  const addToHistory = useCallback((data) => {
    if (!isAuthenticated) {
      console.warn('⚠️ Not authenticated')
      return
    }

    // Validation
    if (!data.movieId) {
      console.error('❌ movieId is required')
      return
    }

    console.log('📝 Adding to history (debounced):', data)
    
    // Clear timer cũ nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    
    // Set timer mới - chỉ gọi API sau 2 giây không có thay đổi
    timerRef.current = setTimeout(async () => {
      try {
        console.log('📤 Sending history to API:', data)
        const response = await historyApi.addToHistory(data)
        console.log('✅ History updated:', response.data)
        
        // Cập nhật local state nếu cần
        // Không reload để tránh gọi API nhiều
      } catch (error) {
        console.error('❌ Error adding to history:', error.response?.data || error.message)
        toast.error('Không thể lưu lịch sử xem')
      }
    }, 2000) // 2 giây debounce
  }, [isAuthenticated])

  const removeFromHistory = async (historyId) => {
    try {
      await historyApi.removeFromHistory(historyId)
      setHistory(prev => prev.filter(item => item.id !== historyId))
      toast.success('Đã xóa khỏi lịch sử')
    } catch (error) {
      console.error('❌ Error removing from history:', error.response?.data || error.message)
      toast.error('Không thể xóa khỏi lịch sử')
    }
  }

  const clearHistory = async () => {
    try {
      await historyApi.clearHistory()
      setHistory([])
      setPagination(prev => ({ ...prev, page: 1, total: 0 }))
      toast.success('Đã xóa toàn bộ lịch sử')
    } catch (error) {
      console.error('❌ Error clearing history:', error.response?.data || error.message)
      toast.error('Không thể xóa lịch sử')
    }
  }

  const setPage = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // Cleanup timer khi unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return {
    history,
    loading,
    pagination,
    addToHistory,
    removeFromHistory,
    clearHistory,
    setPage,
    reload: loadHistory
  }
}
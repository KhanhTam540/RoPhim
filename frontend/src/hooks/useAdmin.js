import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const useAdmin = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để tiếp tục')
        navigate('/dang-nhap')
      } else if (!isAdmin) {
        toast.error('Bạn không có quyền truy cập trang này')
        navigate('/')
      } else {
        setPageLoading(false)
      }
    }
  }, [loading, isAuthenticated, isAdmin, navigate])

  return {
    user,
    loading: pageLoading,
    isAdmin: isAdmin && isAuthenticated,
  }
}
// src/pages/admin/AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/admin/AdminSidebar'
import LoadingSpinner from '../../components/admin/LoadingSpinner'

const AdminLayout = () => {
  const { user, isAuthenticated, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Check if user is admin
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-rophim-bg">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out z-30`}>
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        {/* THÊM PADDING TOP LỚN HƠN để không bị header che */}
        <main className="p-4 md:p-6 pt-20 lg:pt-24">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout
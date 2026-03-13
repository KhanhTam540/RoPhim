// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  FaFilm, FaUsers, FaEye, FaComment, FaStar, 
  FaList, FaGlobe, FaUser, FaImage, FaCog,
  FaVideo, FaChartBar, FaHeart, FaCalendar,
  FaArrowUp, FaArrowDown
} from 'react-icons/fa'
import { motion } from 'framer-motion'
import { adminStatsApi } from '../../api/admin'
import LoadingSpinner from '../../components/admin/LoadingSpinner'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    overview: {
      total: { movies: 0, users: 0, comments: 0, ratings: 0, views: 0 },
      today: { movies: 0, users: 0, views: 0 },
      week: { movies: 0, users: 0, views: 0 },
      month: { movies: 0, users: 0, views: 0 }
    },
    topMovies: [],
    dailyViews: [],
    newUsers: [],
    genreStats: [],
    recentUsers: []
  })

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

  useEffect(() => {
    loadDashboardData()
  }, [])

  // src/pages/admin/Dashboard.jsx
// Sửa hàm loadDashboardData

const loadDashboardData = async () => {
  try {
    setLoading(true)
    const [overview, topMovies, dailyViews, newUsers, genreStats] = await Promise.all([
      adminStatsApi.getOverview().catch(() => ({ 
        data: { 
          total: { movies: 0, users: 0, comments: 0, ratings: 0, views: 0 },
          today: { movies: 0, users: 0, views: 0 },
          week: { movies: 0, users: 0, views: 0 },
          month: { movies: 0, users: 0, views: 0 }
        } 
      })),
      adminStatsApi.getTopMovies(5).catch(() => ({ data: { movies: [] } })),
      adminStatsApi.getDailyViews(7).catch(() => ({ data: { views: [] } })),
      adminStatsApi.getNewUsers(7).catch(() => ({ data: { users: [] } })),
      adminStatsApi.getGenreStats().catch(() => ({ data: { stats: [] } })),
    ])

    setStats({
      overview: overview.data || {
        total: { movies: 0, users: 0, comments: 0, ratings: 0, views: 0 },
        today: { movies: 0, users: 0, views: 0 },
        week: { movies: 0, users: 0, views: 0 },
        month: { movies: 0, users: 0, views: 0 }
      },
      topMovies: topMovies.data?.movies || [],
      dailyViews: dailyViews.data?.views || [],
      newUsers: newUsers.data?.users || [],
      genreStats: genreStats.data?.stats || [],
      recentUsers: [],
    })
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    setLoading(false)
  }
}

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500',
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-rophim-card rounded-lg p-6 hover:bg-rophim-hover transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-rophim-textSecondary text-sm mb-1">{title}</p>
            <h3 className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {trend !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${
                trend >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend >= 0 ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                <span className="ml-1">{Math.abs(trend)}% so với tháng trước</span>
              </div>
            )}
          </div>
          <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header - Chỉ có tiêu đề Dashboard, không có logo */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="text-sm text-rophim-textSecondary">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Welcome Card - Không có logo ở đây */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
        >
          <h2 className="text-xl font-semibold mb-2">Chào mừng trở lại!</h2>
          <p className="opacity-90">
            Đây là tổng quan về hoạt động của hệ thống RoPhim.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng phim"
            value={stats.overview.total.movies}
            icon={FaFilm}
            trend={12}
            color="blue"
          />
          <StatCard
            title="Tổng người dùng"
            value={stats.overview.total.users}
            icon={FaUsers}
            trend={8}
            color="green"
          />
          <StatCard
            title="Lượt xem"
            value={stats.overview.total.views}
            icon={FaEye}
            trend={15}
            color="purple"
          />
          <StatCard
            title="Bình luận"
            value={stats.overview.total.comments}
            icon={FaComment}
            trend={-3}
            color="yellow"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Views Chart */}
          <div className="bg-rophim-card rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaChartBar className="mr-2 text-blue-500" />
              Lượt xem theo ngày
            </h2>
            {stats.dailyViews.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#a0a0a0"
                    tickFormatter={(value) => {
                      if (!value) return ''
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-rophim-textSecondary">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* New Users Chart */}
          <div className="bg-rophim-card rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaUsers className="mr-2 text-green-500" />
              Người dùng mới theo ngày
            </h2>
            {stats.newUsers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.newUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#a0a0a0"
                    tickFormatter={(value) => {
                      if (!value) return ''
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-rophim-textSecondary">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Genre Stats Pie Chart */}
          <div className="bg-rophim-card rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaStar className="mr-2 text-yellow-500" />
              Phân bố thể loại
            </h2>
            {stats.genreStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.genreStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.movie_count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="movie_count"
                  >
                    {stats.genreStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-rophim-textSecondary">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Top Movies */}
          <div className="bg-rophim-card rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaFilm className="mr-2 text-purple-500" />
              Top phim xem nhiều
            </h2>
            {stats.topMovies.length > 0 ? (
              <div className="space-y-4">
                {stats.topMovies.map((movie, index) => (
                  <Link
                    key={movie.id}
                    to={`/admin/movies/${movie.id}`}
                    className="flex items-center space-x-3 p-3 hover:bg-rophim-hover rounded-lg transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' : 'bg-rophim-hover'
                    }`}>
                      {index + 1}
                    </div>
                    {movie.poster ? (
                      <img
                        src={`${import.meta.env.VITE_IMAGE_URL}/${movie.poster}`}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded"
                        onError={(e) => e.target.src = 'https://picsum.photos/50/70?random=1'}
                      />
                    ) : (
                      <div className="w-10 h-14 bg-rophim-hover rounded flex items-center justify-center">
                        <FaFilm className="text-rophim-textSecondary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{movie.title}</p>
                      <p className="text-xs text-rophim-textSecondary">
                        {movie.view_count?.toLocaleString() || 0} lượt xem
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <FaStar size={14} />
                      <span>{movie.rating_average ? Number(movie.rating_average).toFixed(1) : '0.0'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-rophim-textSecondary">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        {stats.recentUsers.length > 0 && (
          <div className="bg-rophim-card rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaUsers className="mr-2 text-green-500" />
              Người dùng mới nhất
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-3 bg-rophim-hover rounded-lg">
                  {user.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_IMAGE_URL}/${user.avatar}`}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => e.target.src = 'https://picsum.photos/150/150?random=3'}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-rophim-textSecondary">@{user.username}</p>
                  </div>
                  <div className="text-xs text-rophim-textSecondary">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-rophim-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Hôm nay</h3>
              <FaCalendar className="text-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Phim mới:</span>
                <span className="font-bold">{stats.overview.today.movies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Người dùng mới:</span>
                <span className="font-bold">{stats.overview.today.users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Lượt xem:</span>
                <span className="font-bold">{stats.overview.today.views}</span>
              </div>
            </div>
          </div>

          <div className="bg-rophim-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">7 ngày qua</h3>
              <FaCalendar className="text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Phim mới:</span>
                <span className="font-bold">{stats.overview.week.movies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Người dùng mới:</span>
                <span className="font-bold">{stats.overview.week.users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Lượt xem:</span>
                <span className="font-bold">{stats.overview.week.views}</span>
              </div>
            </div>
          </div>

          <div className="bg-rophim-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">30 ngày qua</h3>
              <FaCalendar className="text-yellow-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Phim mới:</span>
                <span className="font-bold">{stats.overview.month.movies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Người dùng mới:</span>
                <span className="font-bold">{stats.overview.month.users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rophim-textSecondary">Lượt xem:</span>
                <span className="font-bold">{stats.overview.month.views}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-rophim-card rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Truy cập nhanh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link
              to="/admin/movies"
              className="flex flex-col items-center p-4 bg-rophim-hover rounded-lg hover:bg-blue-500/20 transition-colors group"
            >
              <FaFilm className="text-2xl text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Phim</span>
            </Link>
            <Link
              to="/admin/genres"
              className="flex flex-col items-center p-4 bg-rophim-hover rounded-lg hover:bg-green-500/20 transition-colors group"
            >
              <FaList className="text-2xl text-green-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Thể loại</span>
            </Link>
            <Link
              to="/admin/actors"
              className="flex flex-col items-center p-4 bg-rophim-hover rounded-lg hover:bg-purple-500/20 transition-colors group"
            >
              <FaStar className="text-2xl text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Diễn viên</span>
            </Link>
            <Link
              to="/admin/directors"
              className="flex flex-col items-center p-4 bg-rophim-hover rounded-lg hover:bg-yellow-500/20 transition-colors group"
            >
              <FaVideo className="text-2xl text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Đạo diễn</span>
            </Link>
            <Link
              to="/admin/users"
              className="flex flex-col items-center p-4 bg-rophim-hover rounded-lg hover:bg-red-500/20 transition-colors group"
            >
              <FaUsers className="text-2xl text-red-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Người dùng</span>
            </Link>
            <Link
              to="/admin/sliders"
              className="flex flex-col items-center p-4 bg-rophim-hover rounded-lg hover:bg-pink-500/20 transition-colors group"
            >
              <FaImage className="text-2xl text-pink-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">Slider</span>
            </Link>
          </div>
        </div>

        {/* Note - Chỉ hiển thị khi cần */}
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
          <p className="text-sm text-yellow-500">
            <strong>Lưu ý:</strong> Dashboard đang trong quá trình phát triển. Một số số liệu thống kê có thể chưa chính xác.
          </p>
        </div>
      </div>
    </>
  )
}

export default Dashboard
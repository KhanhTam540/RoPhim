// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { adminStatsApi } from '../../api/admin'
import LoadingSpinner from '../../components/admin/LoadingSpinner'
import { 
  FaFilm, FaUsers, FaComment, FaStar, 
  FaEye, FaCalendar, FaGlobe, FaTag,
  FaPlay, FaUser, FaChartLine, FaChartPie,
  FaArrowUp, FaArrowDown, FaClock, FaFire,
  FaTheaterMasks, FaVideo, FaHeart, FaRegClock,
  FaCog
} from 'react-icons/fa'
import { 
  Line, Bar, Doughnut, Radar, PolarArea 
} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
)

// ==================== UTILITY FUNCTIONS ====================
const formatNumber = (num) => {
  if (num === null || num === undefined) return 0
  if (typeof num === 'number') return num
  if (typeof num === 'string') {
    const n = parseInt(num)
    return isNaN(n) ? 0 : n
  }
  return 0
}

const formatViews = (views) => {
  const num = formatNumber(views)
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit',
    year: 'numeric'
  })
}

const formatRating = (rating) => {
  if (rating === null || rating === undefined) return '0.0'
  if (typeof rating === 'number') return rating.toFixed(1)
  if (typeof rating === 'string') {
    const num = parseFloat(rating)
    return isNaN(num) ? '0.0' : num.toFixed(1)
  }
  return '0.0'
}

// ==================== MAIN COMPONENT ====================
const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [topMovies, setTopMovies] = useState([])
  const [topUsers, setTopUsers] = useState([])
  const [genreStats, setGenreStats] = useState([])
  const [countryStats, setCountryStats] = useState([])
  const [yearStats, setYearStats] = useState([])
  const [dailyViews, setDailyViews] = useState([])
  const [newUsers, setNewUsers] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const [
        overviewRes,
        topMoviesRes,
        topUsersRes,
        genreStatsRes,
        countryStatsRes,
        yearStatsRes,
        dailyViewsRes,
        newUsersRes
      ] = await Promise.allSettled([
        adminStatsApi.getOverview(),
        adminStatsApi.getTopMovies(10),
        adminStatsApi.getTopUsers(10),
        adminStatsApi.getGenreStats(),
        adminStatsApi.getCountryStats(),
        adminStatsApi.getYearStats(),
        adminStatsApi.getDailyViews(30),
        adminStatsApi.getNewUsers(30)
      ])

      if (overviewRes.status === 'fulfilled') {
        setOverview(overviewRes.value.data)
      }

      if (topMoviesRes.status === 'fulfilled') {
        setTopMovies(topMoviesRes.value.data?.movies || [])
      }

      if (topUsersRes.status === 'fulfilled') {
        setTopUsers(topUsersRes.value.data?.users || [])
      }

      if (genreStatsRes.status === 'fulfilled') {
        setGenreStats(genreStatsRes.value.data?.stats || [])
      }

      if (countryStatsRes.status === 'fulfilled') {
        setCountryStats(countryStatsRes.value.data?.stats || [])
      }

      if (yearStatsRes.status === 'fulfilled') {
        setYearStats(yearStatsRes.value.data?.stats || [])
      }

      if (dailyViewsRes.status === 'fulfilled') {
        setDailyViews(dailyViewsRes.value.data?.views || [])
      }

      if (newUsersRes.status === 'fulfilled') {
        setNewUsers(newUsersRes.value.data?.users || [])
      }

    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Không thể tải dữ liệu thống kê')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  // Prepare chart data
  const dailyViewsData = {
    labels: dailyViews.map(d => d.date),
    datasets: [
      {
        label: 'Lượt xem',
        data: dailyViews.map(d => d.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const newUsersData = {
    labels: newUsers.map(d => d.date),
    datasets: [
      {
        label: 'Người dùng mới',
        data: newUsers.map(d => d.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const genreChartData = {
    labels: genreStats.map(g => g.name),
    datasets: [
      {
        data: genreStats.map(g => g.movie_count || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  }

  const countryChartData = {
    labels: countryStats.slice(0, 5).map(c => c.name),
    datasets: [
      {
        label: 'Số phim',
        data: countryStats.slice(0, 5).map(c => c.movie_count || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }
    ]
  }

  const yearsData = {
    labels: yearStats.slice(0, 10).map(y => y.release_year),
    datasets: [
      {
        label: 'Số phim',
        data: yearStats.slice(0, 10).map(y => y.movie_count || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  }

  return (
    <>
      <Helmet>
        <title>Tổng quan hệ thống - RoPhim Admin</title>
      </Helmet>

      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              Tổng quan hệ thống
            </h1>
            <p className="text-rophim-textSecondary mt-1">
              Xem thống kê và phân tích dữ liệu toàn hệ thống
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="btn-secondary flex items-center gap-2"
            >
              <FaRegClock />
              Cập nhật
            </button>
            <div className="text-sm text-rophim-textSecondary bg-rophim-card px-4 py-2 rounded-lg border border-rophim-border">
              <FaCalendar className="inline mr-2 text-red-500" />
              {new Date().toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Tổng phim"
              value={overview.total?.movies || 0}
              icon={<FaFilm className="text-2xl" />}
              color="blue"
              trend={overview.today?.movies > 0 ? 'up' : 'stable'}
              trendValue={`+${overview.today?.movies || 0} hôm nay`}
            />
            <StatCard 
              title="Tổng người dùng"
              value={overview.total?.users || 0}
              icon={<FaUsers className="text-2xl" />}
              color="green"
              trend={overview.today?.users > 0 ? 'up' : 'stable'}
              trendValue={`+${overview.today?.users || 0} hôm nay`}
            />
            <StatCard 
              title="Bình luận"
              value={overview.total?.comments || 0}
              icon={<FaComment className="text-2xl" />}
              color="yellow"
            />
            <StatCard 
              title="Đánh giá"
              value={overview.total?.ratings || 0}
              icon={<FaStar className="text-2xl" />}
              color="purple"
            />
            <StatCard 
              title="Lượt xem"
              value={overview.total?.views || 0}
              icon={<FaEye className="text-2xl" />}
              color="red"
              trend={overview.today?.views > 0 ? 'up' : 'stable'}
              trendValue={`+${formatViews(overview.today?.views)} hôm nay`}
              format
            />
          </div>
        )}

        {/* Charts Row 1 - Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Views Chart */}
          {dailyViews.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-rophim-card to-rophim-card/80 rounded-xl p-6 border border-rophim-border shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FaEye className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Lượt xem 30 ngày qua</h2>
                    <p className="text-sm text-rophim-textSecondary">
                      Tổng: {formatViews(dailyViews.reduce((acc, d) => acc + d.count, 0))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-rophim-textSecondary">Xu hướng</span>
                  <FaChartLine className="text-blue-500" />
                </div>
              </div>
              <div className="h-80">
                <Line 
                  data={dailyViewsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#fff',
                        bodyColor: '#a0a0a0',
                        borderColor: '#333',
                        borderWidth: 1
                      }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { callback: (value) => formatViews(value) }
                      },
                      x: { 
                        grid: { display: false },
                        ticks: { maxRotation: 45, minRotation: 45 }
                      }
                    }
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* New Users Chart */}
          {newUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-rophim-card to-rophim-card/80 rounded-xl p-6 border border-rophim-border shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-green-500 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Người dùng mới 30 ngày qua</h2>
                    <p className="text-sm text-rophim-textSecondary">
                      Tổng: {newUsers.reduce((acc, d) => acc + d.count, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-rophim-textSecondary">Tăng trưởng</span>
                  <FaChartLine className="text-green-500" />
                </div>
              </div>
              <div className="h-80">
                <Line 
                  data={newUsersData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#fff',
                        bodyColor: '#a0a0a0',
                        borderColor: '#333',
                        borderWidth: 1
                      }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' }
                      },
                      x: { 
                        grid: { display: false },
                        ticks: { maxRotation: 45, minRotation: 45 }
                      }
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Charts Row 2 - Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Genres Chart */}
          {genreStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-rophim-card to-rophim-card/80 rounded-xl p-6 border border-rophim-border shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FaTag className="text-purple-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Phim theo thể loại</h2>
                  <p className="text-sm text-rophim-textSecondary">
                    {genreStats.length} thể loại
                  </p>
                </div>
              </div>
              <div className="h-80">
                <Doughnut 
                  data={genreChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'bottom',
                        labels: { color: '#a0a0a0' }
                      },
                      tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#fff',
                        bodyColor: '#a0a0a0'
                      }
                    },
                    cutout: '65%'
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Countries Chart */}
          {countryStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-rophim-card to-rophim-card/80 rounded-xl p-6 border border-rophim-border shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FaGlobe className="text-blue-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Phim theo quốc gia</h2>
                  <p className="text-sm text-rophim-textSecondary">
                    Top 5 quốc gia
                  </p>
                </div>
              </div>
              <div className="h-80">
                <Bar 
                  data={countryChartData}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#fff',
                        bodyColor: '#a0a0a0'
                      }
                    },
                    scales: {
                      x: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' }
                      },
                      y: { 
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Years Chart */}
          {yearStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-rophim-card to-rophim-card/80 rounded-xl p-6 border border-rophim-border shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <FaCalendar className="text-orange-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Phim theo năm</h2>
                  <p className="text-sm text-rophim-textSecondary">
                    10 năm gần nhất
                  </p>
                </div>
              </div>
              <div className="h-80">
                <Bar 
                  data={yearsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#fff',
                        bodyColor: '#a0a0a0'
                      }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' }
                      },
                      x: { 
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Top Movies & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movies */}
          {topMovies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-rophim-card to-rophim-card/80 rounded-xl p-6 border border-rophim-border shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <FaFire className="text-red-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Top phim xem nhiều</h2>
                  <p className="text-sm text-rophim-textSecondary">
                    {topMovies.length} phim hàng đầu
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {topMovies.map((movie, index) => (
                  <Link
                    key={movie.id}
                    to={`/admin/movies/${movie.id}`}
                    className="flex items-center gap-4 p-3 bg-rophim-hover/30 rounded-lg hover:bg-rophim-hover transition-colors group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-red-500 transition-colors">
                        {movie.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-rophim-textSecondary mt-1">
                        <span className="flex items-center gap-1">
                          <FaEye size={10} />
                          {formatViews(movie.view_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaStar size={10} className="text-yellow-500" />
                          {formatRating(movie.rating_average)}
                        </span>
                        <span>{movie.release_year || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-red-500">
                      {formatRating(movie.rating_average)}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Users */}
          {topUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-rophim-card to-rophim-card/80 rounded-xl p-6 border border-rophim-border shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FaUsers className="text-green-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Người dùng tích cực</h2>
                  <p className="text-sm text-rophim-textSecondary">
                    Top {topUsers.length} người dùng
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {topUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 bg-rophim-hover/30 rounded-lg"
                  >
                    <div className="w-8 h-8 flex items-center justify-center font-bold">
                      {index === 0 && '👑'}
                      {index > 0 && `#${index + 1}`}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.full_name?.charAt(0) || user.username?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.full_name || user.username}</p>
                      <p className="text-xs text-rophim-textSecondary truncate">
                        @{user.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1" title="Bình luận">
                        <FaComment size={12} className="text-blue-500" />
                        {user.commentCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Đánh giá">
                        <FaStar size={12} className="text-yellow-500" />
                        {user.ratingCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Lượt xem">
                        <FaEye size={12} className="text-green-500" />
                        {user.viewCount || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            to="/admin/movies/create"
            icon={<FaFilm />}
            title="Thêm phim mới"
            color="blue"
          />
          <QuickAction
            to="/admin/sliders/create"
            icon={<FaVideo />}
            title="Thêm slider"
            color="purple"
          />
          <QuickAction
            to="/admin/users"
            icon={<FaUsers />}
            title="Quản lý người dùng"
            color="green"
          />
          <QuickAction
            to="/admin/settings"
            icon={<FaCog />}
            title="Cài đặt"
            color="orange"
          />
        </div>
      </div>
    </>
  )
}

// ==================== SUB-COMPONENTS ====================

const StatCard = ({ title, value, icon, color, trend, trendValue, format = false }) => {
  const colors = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-500',
      iconBg: 'bg-blue-500/20',
      gradient: 'from-blue-500/20 to-transparent'
    },
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-500',
      iconBg: 'bg-green-500/20',
      gradient: 'from-green-500/20 to-transparent'
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-500',
      iconBg: 'bg-red-500/20',
      gradient: 'from-red-500/20 to-transparent'
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-500',
      iconBg: 'bg-yellow-500/20',
      gradient: 'from-yellow-500/20 to-transparent'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-500',
      iconBg: 'bg-purple-500/20',
      gradient: 'from-purple-500/20 to-transparent'
    },
  }

  const displayValue = format ? formatViews(value) : value.toLocaleString()

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden ${colors[color].bg} rounded-xl p-6 border ${colors[color].border} shadow-xl`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color].gradient} pointer-events-none`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${colors[color].iconBg} rounded-lg`}>
            <div className={colors[color].text}>{icon}</div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-500' : 'text-yellow-500'
            }`}>
              {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-rophim-textSecondary">{title}</h3>
          <p className="text-3xl font-bold">{displayValue}</p>
        </div>
      </div>
    </motion.div>
  )
}

const QuickAction = ({ to, icon, title, color }) => {
  const colors = {
    blue: 'from-blue-600 to-blue-400',
    purple: 'from-purple-600 to-purple-400',
    green: 'from-green-600 to-green-400',
    orange: 'from-orange-600 to-orange-400'
  }

  return (
    <Link
      to={to}
      className={`bg-gradient-to-br ${colors[color]} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}
    >
      <div className="flex flex-col items-center text-center text-white">
        <div className="text-3xl mb-2">{icon}</div>
        <span className="text-sm font-medium">{title}</span>
      </div>
    </Link>
  )
}

export default Dashboard
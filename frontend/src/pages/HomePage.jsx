// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { homeApi, historyApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import MovieSlider from '../components/MovieSlider'
import MovieRow from '../components/MovieRow'
import CommentSection from '../components/CommentSection'
import ContinueWatching from '../components/ContinueWatching'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import { FaHistory } from 'react-icons/fa'

const HomePage = () => {
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    loadHomeData()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory()
    } else {
      setHistory([])
    }
  }, [isAuthenticated])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      console.log('📦 Loading home data...')
      const response = await homeApi.getHomeData()
      console.log('📦 Home data:', response.data)
      setData(response.data)
      
      // Chọn phim đầu tiên từ trending movies để hiển thị comment
      if (response.data?.trendingMovies?.length > 0) {
        setSelectedMovie(response.data.trendingMovies[0])
      }
    } catch (error) {
      console.error('❌ Error loading home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await historyApi.getHistory({ limit: 10 })
      setHistory(response.data?.history || [])
    } catch (error) {
      console.error('❌ Error loading history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>RoPhim - Xem phim miễn phí</title>
      </Helmet>

      <div className="home-page">
        {/* Slider */}
        {data?.sliders && data.sliders.length > 0 && (
          <MovieSlider sliders={data.sliders} />
        )}

        <div className="container-custom py-8 space-y-10">
          {/* PHẦN 1: TIẾP TỤC XEM (CHO USER ĐÃ ĐĂNG NHẬP) */}
          {isAuthenticated && history.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="continue-watching-section"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <FaHistory className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold">Tiếp tục xem</h2>
                </div>
                <Link 
                  to="/lich-su" 
                  className="text-sm text-purple-500 hover:text-purple-400 flex items-center gap-1"
                >
                  Xem tất cả
                  <span className="text-lg">→</span>
                </Link>
              </div>

              <ContinueWatching history={history} loading={loadingHistory} />
            </motion.section>
          )}

          {/* PHẦN 2: PHIM HOT */}
          {data?.trendingMovies && data.trendingMovies.length > 0 && (
            <MovieRow 
              title="🔥 Phim Hot Trong Tuần" 
              movies={data.trendingMovies} 
              viewAllLink="/phim-hot"
            />
          )}
          
          {/* PHẦN 3: PHIM MỚI */}
          {data?.latestMovies && data.latestMovies.length > 0 && (
            <MovieRow 
              title="🆕 Phim Mới Cập Nhật" 
              movies={data.latestMovies} 
              viewAllLink="/phim-moi"
            />
          )}
          
          {/* PHẦN 4: ĐÁNH GIÁ CAO */}
          {data?.topRatedMovies && data.topRatedMovies.length > 0 && (
            <MovieRow 
              title="⭐ Đánh Giá Cao Nhất" 
              movies={data.topRatedMovies} 
              viewAllLink="/phim?sort=rating"
            />
          )}
          
          {/* PHẦN 5: PHIM BỘ MỚI */}
          {data?.seriesMovies && data.seriesMovies.length > 0 && (
            <MovieRow 
              title="📺 Phim Bộ Mới Nhất" 
              movies={data.seriesMovies} 
              viewAllLink="/phim-bo"
            />
          )}
          
          {/* PHẦN 6: PHIM LẺ MỚI */}
          {data?.singleMovies && data.singleMovies.length > 0 && (
            <MovieRow 
              title="🎬 Phim Lẻ Mới Nhất" 
              movies={data.singleMovies} 
              viewAllLink="/phim-le"
            />
          )}

          {/* PHẦN 7: BÌNH LUẬN */}
          {selectedMovie && (
            <section className="mt-12 pt-8 border-t border-rophim-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <span className="mr-2">💬</span>
                    Bình Luận Mới Nhất
                  </h2>
                  <p className="text-rophim-textSecondary text-sm mt-1">
                    Thảo luận về phim "{selectedMovie.title}" và nhiều phim khác
                  </p>
                </div>
                <Link 
                  to={`/phim/${selectedMovie.slug}`}
                  className="text-blue-500 hover:text-blue-400 text-sm flex items-center"
                >
                  Xem phim
                  <span className="ml-1">→</span>
                </Link>
              </div>
              
              {/* Sử dụng CommentSection component có sẵn */}
              <CommentSection movieId={selectedMovie.id} />
            </section>
          )}
        </div>
      </div>
    </>
  )
}

export default HomePage